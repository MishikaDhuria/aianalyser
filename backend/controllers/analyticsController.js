const Analytics = require('../models/Analytics');
const User = require('../models/User');
const aiService = require('../services/aiService');

/**
 * @desc    Get aggregated dashboard stats and AI personalized learning tips
 * @route   GET /api/analytics/dashboard
 * @access  Private
 */
const getDashboardStats = async (req, res, next) => {
  try {
    // 1. Fetch user to verify stats
    const user = await User.findById(req.user._id);
    if (!user) {
      res.status(404);
      throw new Error('User not found');
    }

    // 2. Fetch or create Analytics document
    let analytics = await Analytics.findOne({ user: req.user._id });
    if (!analytics) {
      analytics = await Analytics.create({
        user: req.user._id,
        interviewAverage: 0,
        gdAverage: 0,
        codingSuccessRate: 0,
        categoryScores: {
          communication: 60,
          technical: 60,
          leadership: 60,
          behavioral: 60,
          confidence: 60,
          criticalThinking: 60
        },
        timeline: [
          {
            activityType: 'Interview',
            score: 0,
            description: 'Analytics system active! Prepare for your first mock interview.'
          }
        ]
      });
    }

    // 3. Generate Personalized AI Advice dynamically based on scores
    let dynamicRecommendations = "Complete your first AI mock interview, algorithmic challenge, or resume audit to unlock tailored training recommendations from your AI Career Coach!";
    
    if (analytics.interviewAverage > 0 || analytics.gdAverage > 0 || analytics.codingSuccessRate > 0) {
      const summaryContext = `
        User Stats:
        - Mock Interview Average Score: ${analytics.interviewAverage}/100
        - Group Discussion Average Score: ${analytics.gdAverage}/100
        - Coding Challenge Success Rate: ${analytics.codingSuccessRate}%
        - Competency Radar: Communication: ${analytics.categoryScores.communication}, Technical: ${analytics.categoryScores.technical}, Leadership: ${analytics.categoryScores.leadership}, Critical Thinking: ${analytics.categoryScores.criticalThinking}.
      `;
      
      const advicePrompt = `
        Analyze the candidate's performance data below:
        ${summaryContext}

        Provide exactly 2 highly actionable, custom recommendations to help them boost their weak categories. Keep your response short, encouraging, and under 3-4 sentences in total.
      `;

      try {
        dynamicRecommendations = await aiService.chatAssistantResponse(advicePrompt, 'Personalized AI Coach');
      } catch (aiErr) {
        console.error('AI Dashboard Advice generation failed, falling back:', aiErr);
        dynamicRecommendations = "Focus on practicing your speech pacing in Mock Interviews and work on improving time complexity structures in the Coding Arena.";
      }
    }

    res.json({
      success: true,
      stats: {
        xp: user.stats.xp,
        streak: user.stats.streak,
        badges: user.stats.badges,
        interviewAverage: analytics.interviewAverage,
        gdAverage: analytics.gdAverage,
        codingSuccessRate: analytics.codingSuccessRate,
        categoryScores: analytics.categoryScores,
        timeline: analytics.timeline.sort((a,b) => b.date - a.date).slice(0, 10), // Return last 10 activities
        aiRecommendations: dynamicRecommendations
      }
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getDashboardStats,
};
