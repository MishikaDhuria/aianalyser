const mongoose = require('mongoose');

const AnalyticsSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    unique: true,
  },
  interviewAverage: {
    type: Number,
    default: 0,
  },
  gdAverage: {
    type: Number,
    default: 0,
  },
  codingSuccessRate: {
    type: Number,
    default: 0, // In percentage
  },
  categoryScores: {
    communication: { type: Number, default: 0 },
    technical: { type: Number, default: 0 },
    leadership: { type: Number, default: 0 },
    behavioral: { type: Number, default: 0 },
    confidence: { type: Number, default: 0 },
    criticalThinking: { type: Number, default: 0 }
  },
  timeline: [
    {
      date: { type: Date, default: Date.now },
      activityType: { type: String, enum: ['Interview', 'GD', 'Coding', 'Resume'] },
      score: { type: Number, default: 0 },
      description: { type: String, default: '' }
    }
  ],
  lastUpdated: {
    type: Date,
    default: Date.now,
  },
});

module.exports = mongoose.model('Analytics', AnalyticsSchema);
