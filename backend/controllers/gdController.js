const GDSession = require('../models/GDSession');
const Analytics = require('../models/Analytics');
const User = require('../models/User');
const aiService = require('../services/aiService');

// Predefined AI participants with varying debate styles
const AI_PARTICIPANTS = [
  { name: 'Sarah Miller', persona: 'Extremely fact-driven, logical, and slightly analytical. Prefers concrete data.' },
  { name: 'Rahul Sharma', persona: 'Assertive, expressive, and highly strategic. A natural leader who raises structural counter-arguments.' },
  { name: 'Emily Chen', persona: 'Collaborative, diplomatic, and highly constructive. Excels at summarizing points and finding alignment.' }
];

/**
 * @desc    Start a new Group Discussion Session
 * @route   POST /api/gd/setup
 * @access  Private
 */
const startGDSession = async (req, res, next) => {
  const { topic } = req.body;

  try {
    const activeTopic = topic || "Is Artificial Intelligence replacing human creativity, or augmenting it?";

    // 1. Create GD Session record
    const gdSession = new GDSession({
      user: req.user._id,
      topic: activeTopic,
      participants: AI_PARTICIPANTS,
      transcript: []
    });

    // 2. AI Participant A starts the debate to break the ice
    const openingStatement = await aiService.generateGDResponse(
      activeTopic,
      [],
      AI_PARTICIPANTS[0].name,
      AI_PARTICIPANTS[0].persona
    );

    gdSession.transcript.push({
      speaker: AI_PARTICIPANTS[0].name,
      text: openingStatement,
      timestamp: new Date()
    });

    await gdSession.save();

    res.status(201).json({
      success: true,
      gdSession,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Submit user's speech transcript/turn and get subsequent replies from AI participants
 * @route   POST /api/gd/:id/turn
 * @access  Private
 */
const submitGDTurn = async (req, res, next) => {
  const { id } = req.params;
  const { userStatement } = req.body;

  try {
    const session = await GDSession.findById(id);

    if (!session) {
      res.status(404);
      throw new Error('Group Discussion session not found');
    }

    // 1. Append User Statement
    session.transcript.push({
      speaker: 'User',
      text: userStatement || 'I completely understand your point, but we must also consider the socioeconomic implications.',
      timestamp: new Date()
    });

    // 2. Select two other AI participants to respond in turn to generate a rich back-and-forth debate
    // Sarah spoke first, so let's trigger Rahul and Emily
    const reply1 = await aiService.generateGDResponse(
      session.topic,
      session.transcript,
      AI_PARTICIPANTS[1].name,
      AI_PARTICIPANTS[1].persona
    );

    session.transcript.push({
      speaker: AI_PARTICIPANTS[1].name,
      text: reply1,
      timestamp: new Date()
    });

    const reply2 = await aiService.generateGDResponse(
      session.topic,
      session.transcript,
      AI_PARTICIPANTS[2].name,
      AI_PARTICIPANTS[2].persona
    );

    session.transcript.push({
      speaker: AI_PARTICIPANTS[2].name,
      text: reply2,
      timestamp: new Date()
    });

    await session.save();

    res.json({
      success: true,
      transcript: session.transcript,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Submit Group Discussion for final assessment
 * @route   POST /api/gd/:id/complete
 * @access  Private
 */
const completeGDSession = async (req, res, next) => {
  const { id } = req.params;

  try {
    const session = await GDSession.findById(id);

    if (!session) {
      res.status(404);
      throw new Error('GD session not found');
    }

    // Evaluate full session transcript using Gemini
    const evaluation = await aiService.evaluateGDSession(session.topic, session.transcript);

    session.evaluation = {
      leadership: evaluation.leadership || 70,
      criticalThinking: evaluation.criticalThinking || 70,
      relevance: evaluation.relevance || 75,
      communication: evaluation.communication || 75,
      confidence: evaluation.confidence || 70,
      overallScore: evaluation.overallScore || 70,
      overallFeedback: evaluation.overallFeedback || 'Great work contributing to the topic.',
    };

    await session.save();

    // XP Rewards
    const user = await User.findById(req.user._id);
    if (user) {
      user.stats.xp += 120;
      if (session.evaluation.overallScore >= 85 && !user.stats.badges.some(b => b.name === 'Eloquent Speaker')) {
        user.stats.badges.push({
          name: 'Eloquent Speaker',
          icon: '🗣️',
          description: 'Achieved an 85% or above rating in a simulated Group Discussion!'
        });
        user.stats.xp += 100;
      }
      await user.save();
    }

    // Analytics updating
    let analytics = await Analytics.findOne({ user: req.user._id });
    if (!analytics) {
      analytics = new Analytics({ user: req.user._id });
    }

    const pastGDs = await GDSession.find({ user: req.user._id, 'evaluation.overallScore': { $gt: 0 } });
    const sumGDScores = pastGDs.reduce((sum, item) => sum + item.evaluation.overallScore, 0);
    analytics.gdAverage = Math.round(sumGDScores / pastGDs.length);

    // Shift metrics
    analytics.categoryScores.leadership = Math.round((analytics.categoryScores.leadership + session.evaluation.leadership) / 2);
    analytics.categoryScores.communication = Math.round((analytics.categoryScores.communication + session.evaluation.communication) / 2);
    analytics.categoryScores.criticalThinking = Math.round((analytics.categoryScores.criticalThinking + session.evaluation.criticalThinking) / 2);

    analytics.timeline.push({
      date: new Date(),
      activityType: 'GD',
      score: session.evaluation.overallScore,
      description: `Participated in Group Discussion on: "${session.topic.substring(0, 30)}..."`
    });
    analytics.lastUpdated = Date.now();
    await analytics.save();

    res.json({
      success: true,
      gdSession: session,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Get user GD sessions history
 * @route   GET /api/gd
 * @access  Private
 */
const getGDSessions = async (req, res, next) => {
  try {
    const gdSessions = await GDSession.find({ user: req.user._id }).sort({ createdAt: -1 });
    res.json({
      success: true,
      gdSessions,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Get GD session details by ID
 * @route   GET /api/gd/:id
 * @access  Private
 */
const getGDSessionDetail = async (req, res, next) => {
  try {
    const session = await GDSession.findOne({ _id: req.params.id, user: req.user._id });

    if (!session) {
      res.status(404);
      throw new Error('GD record not found');
    }

    res.json({
      success: true,
      gdSession: session,
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  startGDSession,
  submitGDTurn,
  completeGDSession,
  getGDSessions,
  getGDSessionDetail,
};
