const express = require('express');
const router = express.Router();
const { router: authRouter, authenticate } = require('./auth');
const { GoogleGenerativeAI } = require('@google/generative-ai');
const axios = require('axios');

require('dotenv').config();
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

router.use('/auth', authRouter);

// Apply authentication to all routes
router.use(authenticate);

const asyncHandler = (fn) => (req, res, next) => Promise.resolve(fn(req, res, next)).catch(next);

// Code execution route
router.post('/execute', asyncHandler(async (req, res) => {
  const { code, input = '', language = 'cpp' } = req.body;
  
  try {
    const compilerUrl = process.env.COMPILER_SERVICE_URL || 'http://localhost:3001';
    const response = await axios.post(`${compilerUrl}/execute`, {
      code,
      input,
      language
    });
    
    res.json(response.data);
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

// Submission evaluation route
router.post('/submit', asyncHandler(async (req, res) => {
  const { problemID, code, language = 'cpp' } = req.body;
  
  try {
    const Problem = require('../model-defs/Problem');
    const Submission = require('../model-defs/Submission');
    
    const problem = await Problem.findById(problemID);
    if (!problem) {
      return res.status(404).json({ success: false, error: 'Problem not found' });
    }
    
    if (!problem.testCases || problem.testCases.length === 0) {
      return res.json({ success: false, error: 'No test cases available for this problem' });
    }
    
    // Send to compiler service for evaluation
    const compilerUrl = process.env.COMPILER_SERVICE_URL || 'http://localhost:3001';
    const response = await axios.post(`${compilerUrl}/evaluate`, {
      code,
      testCases: problem.testCases,
      language
    });
    
    const result = response.data;
    
    if (!result.success) {
      return res.json(result);
    }
    
    // Save submission
    await Submission.create({
      userID: req.userId,
      problemID,
      sourceCode: code,
      status: result.status,
      score: result.score
    });
    
    res.json(result);
    
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
    if (resource === 'submissions') {
      return res.status(400).json({ error: 'Use /api/submit endpoint for submissions' });
    }
    const data = await Model.create(req.body);
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