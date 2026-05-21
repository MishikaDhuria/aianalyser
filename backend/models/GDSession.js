const mongoose = require('mongoose');

const GDSessionSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  topic: {
    type: String,
    required: true,
  },
  participants: [
    {
      name: { type: String, required: true },
      persona: { type: String, required: true }, // e.g., 'Aggressive and Fact-driven', 'Conciliatory and Cooperative'
    }
  ],
  transcript: [
    {
      speaker: { type: String, required: true }, // 'User' or AI Participant's Name
      text: { type: String, required: true },
      timestamp: { type: Date, default: Date.now }
    }
  ],
  evaluation: {
    leadership: { type: Number, default: 0 },
    criticalThinking: { type: Number, default: 0 },
    relevance: { type: Number, default: 0 },
    communication: { type: Number, default: 0 },
    confidence: { type: Number, default: 0 },
    overallScore: { type: Number, default: 0 },
    overallFeedback: { type: String, default: '' },
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

module.exports = mongoose.model('GDSession', GDSessionSchema);
