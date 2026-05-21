const mongoose = require('mongoose');

const UserSchema = new mongoose.Schema({
  username: {
    type: String,
    required: [true, 'Please provide a username'],
    trim: true,
  },
  email: {
    type: String,
    required: [true, 'Please provide an email'],
    unique: true,
    match: [
      /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/,
      'Please add a valid email address',
    ],
  },
  password: {
    type: String,
    required: [true, 'Please add a password'],
    minlength: 6,
    select: false, // Don't return password by default
  },
  profile: {
    role: {
      type: String,
      default: 'Full Stack Developer',
    },
    skills: {
      type: [String],
      default: ['React', 'Node.js', 'JavaScript'],
    },
    experience: {
      type: Number,
      default: 0, // In years
    },
    targetDifficulty: {
      type: String,
      enum: ['Easy', 'Medium', 'Hard'],
      default: 'Medium',
    }
  },
  stats: {
    xp: {
      type: Number,
      default: 0,
    },
    streak: {
      type: Number,
      default: 0,
    },
    lastActive: {
      type: Date,
      default: Date.now,
    },
    badges: [
      {
        name: { type: String, required: true },
        icon: { type: String, required: true },
        description: { type: String, required: true },
        earnedAt: { type: Date, default: Date.now }
      }
    ]
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

module.exports = mongoose.model('User', UserSchema);
