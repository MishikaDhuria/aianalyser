const pdfParse = require('pdf-parse');
const ResumeReport = require('../models/ResumeReport');
const Analytics = require('../models/Analytics');
const User = require('../models/User');
const aiService = require('../services/aiService');

/**
 * @desc    Upload, parse, and analyze PDF Resumes
 * @route   POST /api/resume/analyze
 * @access  Private
 */
const uploadAndAnalyzeResume = async (req, res, next) => {
  try {
    if (!req.file) {
      res.status(400);
      throw new Error('Please upload a PDF resume file.');
    }

    const { targetRole, targetSkills } = req.body;

    // 1. Retrieve profile fallbacks if target options are omitted
    const user = await User.findById(req.user._id);
    const activeRole = targetRole || user?.profile?.role || "Full Stack Developer";
    const activeSkills = targetSkills ? targetSkills.split(',').map(s => s.trim()) : (user?.profile?.skills || ["React", "Node.js"]);

    // 2. Parse PDF buffer into text strings using pdf-parse
    let parsedText = '';
    try {
      const pdfData = await pdfParse(req.file.buffer);
      parsedText = pdfData.text;
    } catch (parseErr) {
      console.error('pdf-parse extraction failed:', parseErr);
      res.status(400);
      throw new Error('Failed to extract text from PDF. Please ensure it is a valid, readable PDF document.');
    }

    if (!parsedText.trim()) {
      res.status(400);
      throw new Error('Parsed text is empty. Please upload an OCR-readable PDF.');
    }

    // 3. Send text to Gemini AI for ATS scoring
    const analysis = await aiService.analyzeResume(parsedText, activeRole, activeSkills);

    // 4. Create and save Resume Report
    const report = await ResumeReport.create({
      user: req.user._id,
      fileName: req.file.originalname,
      atsScore: analysis.atsScore || 0,
      skillGap: analysis.skillGap || [],
      formattingTips: analysis.formattingTips || [],
      improvements: analysis.improvements || [],
      fullReport: analysis.fullReport || '',
    });

    // 5. Update user analytics records
    let analytics = await Analytics.findOne({ user: req.user._id });
    if (!analytics) {
      analytics = new Analytics({ user: req.user._id });
    }

    // Shift technical & communication scores slightly based on resume rating
    analytics.categoryScores.technical = Math.round((analytics.categoryScores.technical + report.atsScore) / 2);
    analytics.categoryScores.communication = Math.round((analytics.categoryScores.communication + report.atsScore) / 2);

    analytics.timeline.push({
      date: new Date(),
      activityType: 'Resume',
      score: report.atsScore,
      description: `Scanned Resume: "${report.fileName}" (ATS: ${report.atsScore}%)`
    });
    analytics.lastUpdated = Date.now();
    await analytics.save();

    // Reward XP points
    if (user) {
      user.stats.xp += 100;
      // Gamification badge trigger
      if (!user.stats.badges.some(b => b.name === 'Resume Ready')) {
        user.stats.badges.push({
          name: 'Resume Ready',
          icon: '📄',
          description: 'Uploaded and analyzed your resume for ATS optimization!'
        });
        user.stats.xp += 100;
      }
      await user.save();
    }

    res.status(201).json({
      success: true,
      report,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Get user's past resume scanning reports
 * @route   GET /api/resume/reports
 * @access  Private
 */
const getResumeReports = async (req, res, next) => {
  try {
    const reports = await ResumeReport.find({ user: req.user._id }).sort({ createdAt: -1 });
    res.json({
      success: true,
      reports,
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  uploadAndAnalyzeResume,
  getResumeReports,
};
