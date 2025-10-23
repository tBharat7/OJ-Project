const express = require('express');
const router = express.Router();
const { router: authRouter, authenticate } = require('./auth');
const fs = require('fs').promises;
const { exec } = require('child_process');
const path = require('path');
const { GoogleGenerativeAI } = require('@google/generative-ai');

require('dotenv').config();
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

router.use('/auth', authRouter);

// Apply authentication to all routes
router.use(authenticate);

const asyncHandler = (fn) => (req, res, next) => Promise.resolve(fn(req, res, next)).catch(next);

// Code execution route
router.post('/execute', asyncHandler(async (req, res) => {
  const { code, input = '', language = 'cpp' } = req.body;
  
  const tempDir = path.join(__dirname, '../../temp');
  await fs.mkdir(tempDir, { recursive: true });
  
  const filename = `code_${Date.now()}`;
  let sourceFile, execFile, compileCmd;
  
  if (language === 'java') {
    sourceFile = path.join(tempDir, 'Main.java');
    execFile = path.join(tempDir, 'Main');
    compileCmd = `javac "${sourceFile}" && cd "${tempDir}" && java Main`;
  } else {
    sourceFile = path.join(tempDir, `${filename}.cpp`);
    execFile = path.join(tempDir, filename);
    compileCmd = `clang++ -std=c++17 "${sourceFile}" -o "${execFile}" && "${execFile}"`;
  }
  
  try {
    await fs.writeFile(sourceFile, code);
    
    const child = exec(compileCmd, { timeout: 5000 }, (error, stdout, stderr) => {
      fs.unlink(sourceFile).catch(() => {});
      if (language === 'java') {
        fs.unlink(path.join(tempDir, 'Main.class')).catch(() => {});
      } else {
        fs.unlink(execFile).catch(() => {});
      }
      
      if (error) {
        return res.json({ success: false, error: stderr || error.message });
      }
      
      res.json({ success: true, output: stdout, error: stderr });
    });
    
    if (input) {
      child.stdin.write(input);
      child.stdin.end();
    }
  } catch (error) {
    res.json({ success: false, error: error.message });
  }
}));

// AI Code Review route
router.post('/review', asyncHandler(async (req, res) => {
  const { code, problemDescription, language = 'cpp' } = req.body;
  
  if (!process.env.GEMINI_API_KEY) {
    return res.json({ success: false, error: 'Gemini API key not configured' });
  }
  
  try {
    const model = genAI.getGenerativeModel({ model: 'gemini-2.5-flash' });
    
    const prompt = `You are a code reviewer for competitive programming.
Code to review:
\`\`\`${language}
${code}
\`\`\`

Provide a concise review with specific suggestions for improvement. Avoid any harmful or exploitative content in your response.`;
    
    const result = await model.generateContent(prompt);
    const response = await result.response;
    const review = response.text();
    
    res.json({ success: true, review });
  } catch (error) {
    res.json({ success: false, error: error.message });
  }
}));

const models = {
  users: require('../model-defs/User'),
  problems: require('../model-defs/Problem'),
  submissions: require('../model-defs/Submission'),
  competitions: require('../model-defs/Competition'),
  leaderboards: require('../model-defs/Leaderboard')
};

function crudRoutes(resource, Model) {
  router.get(`/${resource}`, asyncHandler(async (req, res) => {
    const data = await Model.find().lean();
    res.json(data);
  }));
  
  router.get(`/${resource}/:id`, asyncHandler(async (req, res) => {
    const data = await Model.findById(req.params.id).lean();
    if (!data) return res.status(404).json({ error: 'Not found' });
    res.json(data);
  }));
  
  router.post(`/${resource}`, asyncHandler(async (req, res) => {
    const body = resource === 'submissions' ? { ...req.body, userID: req.userId } : req.body;
    const data = await Model.create(body);
    res.status(201).json(data);
  }));
  
  router.put(`/${resource}/:id`, asyncHandler(async (req, res) => {
    const data = await Model.findByIdAndUpdate(req.params.id, req.body, { new: true, lean: true });
    if (!data) return res.status(404).json({ error: 'Not found' });
    res.json(data);
  }));
  
  router.delete(`/${resource}/:id`, asyncHandler(async (req, res) => {
    const data = await Model.findByIdAndDelete(req.params.id);
    if (!data) return res.status(404).json({ error: 'Not found' });
    res.status(204).send();
  }));
}

Object.entries(models).forEach(([resource, Model]) => crudRoutes(resource, Model));

module.exports = router;