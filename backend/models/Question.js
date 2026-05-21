const mongoose = require('mongoose');

const QuestionSchema = new mongoose.Schema({
  role: {
    type: String,
    required: true,
    index: true,
  },
  category: {
    type: String,
    enum: ['Technical', 'Behavioral', 'HR', 'Scenario'],
    default: 'Technical',
  },
  difficulty: {
    type: String,
    enum: ['Easy', 'Medium', 'Hard'],
    default: 'Medium',
  },
  questionText: {
    type: String,
    required: true,
  },
  sampleAnswer: {
    type: String,
    default: '',
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

module.exports = mongoose.model('Question', QuestionSchema);
