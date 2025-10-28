const express = require('express');
const cors = require('cors');
const { executeCode, evaluateSubmission } = require('./executor');

const app = express();
const PORT = process.env.COMPILER_PORT || 3001;

app.use(cors());
app.use(express.json());

app.post('/execute', async (req, res) => {
  try {
    const { code, input = '', language = 'cpp' } = req.body;
    const result = await executeCode(code, input, language);
    res.json(result);
  } catch (error) {
    res.json({ success: false, error: error.message });
  }
});

app.post('/evaluate', async (req, res) => {
  try {
    const { code, testCases, language = 'cpp' } = req.body;
    const result = await evaluateSubmission(code, testCases, language);
    res.json(result);
  } catch (error) {
    res.json({ success: false, error: error.message });
  }
});

if (process.env.NODE_ENV !== 'production') {
  app.listen(PORT, () => {
    console.log(`Compiler service running on port ${PORT}`);
  });
}

module.exports = app;