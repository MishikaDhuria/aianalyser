const mongoose = require('mongoose');

const InterviewSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  role: {
    type: String,
    required: true,
  },
  level: {
    type: String,
    required: true,
  },
  type: {
    type: String,
    enum: ['Technical', 'HR', 'Behavioral', 'Mixed'],
    default: 'Mixed',
  },
  difficulty: {
    type: String,
    enum: ['Easy', 'Medium', 'Hard'],
    default: 'Medium',
  },
  questions: [
    {
      questionText: { type: String, required: true },
      category: { type: String, default: 'Technical' },
      userAnswer: { type: String, default: '' },
      score: { type: Number, default: 0 },
      grammarFeedback: { type: String, default: '' },
      correctnessFeedback: { type: String, default: '' },
      communicationFeedback: { type: String, default: '' },
      fillerWordsCount: { type: Number, default: 0 },
      overallFeedback: { type: String, default: '' }
    }
  ],
  overallScore: {
    type: Number,
    default: 0,
  },
  overallFeedback: {
    type: String,
    default: '',
  },
  emotionMetrics: {
    confidence: { type: Number, default: 0 },
    focus: { type: Number, default: 0 },
    calmness: { type: Number, default: 0 },
    stress: { type: Number, default: 0 }
  },
  status: {
    type: String,
    enum: ['Pending', 'Active', 'Completed'],
    default: 'Pending',
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

module.exports = mongoose.model('Interview', InterviewSchema);
