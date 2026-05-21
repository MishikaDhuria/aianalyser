require('dotenv').config();
const express = require('express');
const cors = require('cors');
const connectDB = require('./config/db');
const { protect } = require('./middleware/authMiddleware');
const { errorHandler, notFound } = require('./middleware/errorMiddleware');
const aiService = require('./services/aiService');

// Initialize database
connectDB();

const app = express();

app.use(cors({
  origin: '*',
  credentials: true
}));

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Welcome Route
app.get('/', (req, res) => {
  res.json({ message: 'Welcome to the AI Interview Practice & GD Analyzer API!' });
});

// Import Core Routes
const authRoutes = require('./routes/authRoutes');
const interviewRoutes = require('./routes/interviewRoutes');
const gdRoutes = require('./routes/gdRoutes');
const codingRoutes = require('./routes/codingRoutes');
const resumeRoutes = require('./routes/resumeRoutes');
const analyticsRoutes = require('./routes/analyticsRoutes');

// Bind Routes
app.use('/api/auth', authRoutes);
app.use('/api/interviews', interviewRoutes);
app.use('/api/gd', gdRoutes);
app.use('/api/coding', codingRoutes);
app.use('/api/resume', resumeRoutes);
app.use('/api/analytics', analyticsRoutes);

/**
 * @desc    Core Floating AI Chatbot Assistant
 * @route   POST /api/assistant/chat
 * @access  Private
 */
app.post('/api/assistant/chat', protect, async (req, res, next) => {
  const { message, context } = req.body;
  try {
    const aiResponse = await aiService.chatAssistantResponse(
      message,
      `User Profile Target: ${req.user.profile.role}. Skills: ${req.user.profile.skills.join(', ')}. Context: ${context || ''}`
    );
    res.json({
      success: true,
      reply: aiResponse
    });
  } catch (error) {
    next(error);
  }
});

// Fallback Routes & Error Handlers
app.use(notFound);
app.use(errorHandler);

const PORT = process.env.PORT || 5000;
app.listen(PORT, '0.0.0.0', () => {
  console.log(`Server running in production-ready mode on port ${PORT} (0.0.0.0)`);
});

// Export for Vercel Serverless deployments
module.exports = app;
