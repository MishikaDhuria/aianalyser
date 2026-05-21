const mongoose = require('mongoose');

const CodingSubmissionSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  problemTitle: {
    type: String,
    required: true,
  },
  language: {
    type: String,
    required: true,
    default: 'javascript',
  },
  code: {
    type: String,
    required: true,
  },
  status: {
    type: String,
    enum: ['Accepted', 'Wrong Answer', 'Runtime Error', 'Compilation Error'],
    default: 'Accepted',
  },
  testCasesPassed: {
    type: Number,
    default: 0,
  },
  testCasesTotal: {
    type: Number,
    default: 0,
  },
  runtime: {
    type: String,
    default: '0ms',
  },
  memory: {
    type: String,
    default: '0KB',
  },
  aiFeedback: {
    timeComplexity: { type: String, default: '' },
    spaceComplexity: { type: String, default: '' },
    bugs: { type: String, default: '' },
    suggestions: { type: String, default: '' },
    overallScore: { type: Number, default: 0 }
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

module.exports = mongoose.model('CodingSubmission', CodingSubmissionSchema);
