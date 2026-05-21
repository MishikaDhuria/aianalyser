const Interview = require('../models/Interview');
const Analytics = require('../models/Analytics');
const User = require('../models/User');
const aiService = require('../services/aiService');

/**
 * @desc    Start / Setup a new AI Interview Session
 * @route   POST /api/interviews/setup
 * @access  Private
 */
const startInterview = async (req, res, next) => {
  const { role, skills, experience, difficulty, type, numQuestions } = req.body;

  try {
    // 1. Generate interview questions via Gemini AI
    const result = await aiService.generateInterviewQuestions(
      role,
      skills,
      difficulty,
      experience,
      numQuestions || 5
    );

    // 2. Map questions for model formatting
    const formattedQuestions = result.questions.map((q) => ({
      questionText: q.questionText,
      category: q.category || 'Technical',
      userAnswer: '',
      score: 0,
      grammarFeedback: '',
      correctnessFeedback: '',
      communicationFeedback: '',
      fillerWordsCount: 0,
      overallFeedback: '',
    }));

    // 3. Create a pending interview record
    const interview = await Interview.create({
      user: req.user._id,
      role,
      level: `${experience} Years (Experience)`,
      type: type || 'Mixed',
      difficulty: difficulty || 'Medium',
      questions: formattedQuestions,
      status: 'Pending',
    });

    res.status(201).json({
      success: true,
      interview,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Submit candidate's voice transcript answer for a specific question
 * @route   POST /api/interviews/:id/answer
 * @access  Private
 */
const submitAnswer = async (req, res, next) => {
  const { id } = req.params;
  const { questionId, userAnswer } = req.body;

  try {
    const interview = await Interview.findById(id);

    if (!interview) {
      res.status(404);
      throw new Error('Interview session not found');
    }

    // Find the specific question item
    const questionItem = interview.questions.id(questionId);
    if (!questionItem) {
      res.status(404);
      throw new Error('Question not found inside this session');
    }

    // Evaluate answer with Gemini AI
    const evaluation = await aiService.evaluateAnswer(
      questionItem.questionText,
      userAnswer || 'No vocal response captured.'
    );

    // Update question details
    questionItem.userAnswer = userAnswer || 'No vocal response captured.';
    questionItem.score = evaluation.score || 0;
    questionItem.grammarFeedback = evaluation.grammarFeedback || '';
    questionItem.correctnessFeedback = evaluation.correctnessFeedback || '';
    questionItem.communicationFeedback = evaluation.communicationFeedback || '';
    questionItem.fillerWordsCount = evaluation.fillerWordsCount || 0;
    questionItem.overallFeedback = evaluation.overallFeedback || '';

    await interview.save();

    res.json({
      success: true,
      question: questionItem,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Submit final interview review & compile scores
 * @route   POST /api/interviews/:id/complete
 * @access  Private
 */
const completeInterview = async (req, res, next) => {
  const { id } = req.params;
  const { confidence, focus, calmness, stress } = req.body; // aggregate averages of camera emotion tracker

  try {
    const interview = await Interview.findById(id);

    if (!interview) {
      res.status(404);
      throw new Error('Interview not found');
    }

    // Calculate overall average score
    const totalScore = interview.questions.reduce((sum, q) => sum + q.score, 0);
    const averageScore = Math.round(totalScore / interview.questions.length);

    // Assign overall webcam tracking feedback
    interview.emotionMetrics = {
      confidence: confidence || 75,
      focus: focus || 80,
      calmness: calmness || 85,
      stress: stress || 15
    };

    interview.overallScore = averageScore;
    interview.status = 'Completed';

    // Generate comprehensive evaluation summary using Gemini
    const contextPrompt = `An interview was conducted for the role of ${interview.role}.
The difficulty was ${interview.difficulty}.
The user scored ${averageScore}/100 based on ${interview.questions.length} questions.
Here is the question & score list:
${interview.questions.map((q, idx) => `Q${idx+1}: "${q.questionText}" -> Score: ${q.score}/100`).join('\n')}

Webcam analytics: Confidence: ${interview.emotionMetrics.confidence}%, Focus: ${interview.emotionMetrics.focus}%, Calmness: ${interview.emotionMetrics.calmness}%, Stress: ${interview.emotionMetrics.stress}%.
Provide a structured, helpful overall summary of the candidate's core strengths and areas of growth. Do not exceed 3-4 sentences.`;

    const summaryReport = await aiService.chatAssistantResponse(contextPrompt, 'Interview Feedback Generator');
    interview.overallFeedback = summaryReport;

    await interview.save();

    // Reward user with XP
    const user = await User.findById(req.user._id);
    if (user) {
      user.stats.xp += 150; // Completion points!
      if (averageScore >= 80 && !user.stats.badges.some(b => b.name === 'High Achiever')) {
        user.stats.badges.push({
          name: 'High Achiever',
          icon: '💫',
          description: 'Scored 80% or above in a practice interview!'
        });
        user.stats.xp += 100;
      }
      await user.save();
    }

    // Compile analytics updates
    let analytics = await Analytics.findOne({ user: req.user._id });
    if (!analytics) {
      analytics = new Analytics({ user: req.user._id });
    }

    // Fetch past completed interviews for rolling average
    const pastCompleted = await Interview.find({ user: req.user._id, status: 'Completed' });
    const sumAverageScores = pastCompleted.reduce((sum, item) => sum + item.overallScore, 0);
    analytics.interviewAverage = Math.round(sumAverageScores / pastCompleted.length);

    // Slowly shift radar category scores based on interview performance
    analytics.categoryScores.communication = Math.round((analytics.categoryScores.communication + averageScore) / 2);
    analytics.categoryScores.technical = Math.round((analytics.categoryScores.technical + (interview.type === 'Technical' ? averageScore : (averageScore * 0.8))) / 2);
    analytics.categoryScores.confidence = Math.round((analytics.categoryScores.confidence + (interview.emotionMetrics.confidence)) / 2);
    analytics.categoryScores.behavioral = Math.round((analytics.categoryScores.behavioral + (interview.type === 'Behavioral' ? averageScore : (averageScore * 0.9))) / 2);

    // Push action to history timeline
    analytics.timeline.push({
      date: new Date(),
      activityType: 'Interview',
      score: averageScore,
      description: `Practiced ${interview.type} Interview for ${interview.role}`
    });
    analytics.lastUpdated = Date.now();
    await analytics.save();

    res.json({
      success: true,
      interview,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Get user interview history
 * @route   GET /api/interviews
 * @access  Private
 */
const getInterviews = async (req, res, next) => {
  try {
    const interviews = await Interview.find({ user: req.user._id }).sort({ createdAt: -1 });
    res.json({
      success: true,
      interviews,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Get interview session details by ID
 * @route   GET /api/interviews/:id
 * @access  Private
 */
const getInterviewDetail = async (req, res, next) => {
  try {
    const interview = await Interview.findOne({ _id: req.params.id, user: req.user._id });

    if (!interview) {
      res.status(404);
      throw new Error('Interview record not found');
    }

    res.json({
      success: true,
      interview,
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  startInterview,
  submitAnswer,
  completeInterview,
  getInterviews,
  getInterviewDetail,
};
