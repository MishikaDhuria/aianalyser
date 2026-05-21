const mongoose = require('mongoose');

const ResumeReportSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  fileName: {
    type: String,
    required: true,
  },
  atsScore: {
    type: Number,
    required: true,
    default: 0,
  },
  skillGap: {
    type: [String],
    default: [],
  },
  formattingTips: {
    type: [String],
    default: [],
  },
  improvements: {
    type: [String],
    default: [],
  },
  fullReport: {
    type: String,
    default: '',
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

module.exports = mongoose.model('ResumeReport', ResumeReportSchema);
