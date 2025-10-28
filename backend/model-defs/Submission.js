const mongoose = require('mongoose');

const submissionSchema = new mongoose.Schema({
  userID: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  problemID: { type: mongoose.Schema.Types.ObjectId, ref: 'Problem', required: true },
  sourceCode: { type: String, required: true },
  status: { type: String, enum: ['Pending', 'Accepted', 'Wrong Answer', 'Runtime Error', 'Compilation Error'], required: true },
  score: { type: Number, required: true },
  timestamp: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Submission', submissionSchema);
