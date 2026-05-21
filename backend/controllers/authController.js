const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const Analytics = require('../models/Analytics');

// Generate JWT token helper
const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET || 'secret-jwt-key-xyz-123', {
    expiresIn: '30d',
  });
};

/**
 * @desc    Register a new user
 * @route   POST /api/auth/register
 * @access  Public
 */
const registerUser = async (req, res, next) => {
  const { username, email, password } = req.body;

  try {
    const userExists = await User.findOne({ email });

    if (userExists) {
      res.status(400);
      throw new Error('User already exists');
    }

    // Encrypt password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    const user = await User.create({
      username,
      email,
      password: hashedPassword,
    });

    if (user) {
      // Pre-initialize analytics document for this user
      await Analytics.create({
        user: user._id,
        interviewAverage: 0,
        gdAverage: 0,
        codingSuccessRate: 0,
        categoryScores: {
          communication: 50,
          technical: 50,
          leadership: 50,
          behavioral: 50,
          confidence: 50,
          criticalThinking: 50
        },
        timeline: [
          {
            activityType: 'Interview',
            score: 0,
            description: 'Account created! Welcome to AI Interview Prep.'
          }
        ]
      });

      res.status(201).json({
        success: true,
        _id: user._id,
        username: user.username,
        email: user.email,
        profile: user.profile,
        stats: user.stats,
        token: generateToken(user._id),
      });
    } else {
      res.status(400);
      throw new Error('Invalid user data');
    }
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Auth user & get token
 * @route   POST /api/auth/login
 * @access  Public
 */
const authUser = async (req, res, next) => {
  const { email, password } = req.body;

  try {
    const user = await User.findOne({ email }).select('+password');

    if (user && (await bcrypt.compare(password, user.password))) {
      // Update streak upon login activity
      await updateStreakHelper(user);

      res.json({
        success: true,
        _id: user._id,
        username: user.username,
        email: user.email,
        profile: user.profile,
        stats: user.stats,
        token: generateToken(user._id),
      });
    } else {
      res.status(401);
      throw new Error('Invalid email or password');
    }
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Get user profile
 * @route   GET /api/auth/profile
 * @access  Private
 */
const getUserProfile = async (req, res, next) => {
  try {
    const user = await User.findById(req.user._id);

    if (user) {
      res.json({
        success: true,
        _id: user._id,
        username: user.username,
        email: user.email,
        profile: user.profile,
        stats: user.stats,
      });
    } else {
      res.status(404);
      throw new Error('User not found');
    }
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Update user profile
 * @route   PUT /api/auth/profile
 * @access  Private
 */
const updateUserProfile = async (req, res, next) => {
  try {
    const user = await User.findById(req.user._id);

    if (user) {
      user.username = req.body.username || user.username;
      
      if (req.body.profile) {
        user.profile.role = req.body.profile.role || user.profile.role;
        user.profile.skills = req.body.profile.skills || user.profile.skills;
        user.profile.experience = typeof req.body.profile.experience === 'number' ? req.body.profile.experience : user.profile.experience;
        user.profile.targetDifficulty = req.body.profile.targetDifficulty || user.profile.targetDifficulty;
      }

      const updatedUser = await user.save();

      res.json({
        success: true,
        _id: updatedUser._id,
        username: updatedUser.username,
        email: updatedUser.email,
        profile: updatedUser.profile,
        stats: updatedUser.stats,
      });
    } else {
      res.status(404);
      throw new Error('User not found');
    }
  } catch (error) {
    next(error);
  }
};

// Internal streak computation algorithm
const updateStreakHelper = async (user) => {
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const lastActiveDate = new Date(user.stats.lastActive);
  lastActiveDate.setHours(0, 0, 0, 0);

  const diffTime = Math.abs(today - lastActiveDate);
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

  if (diffDays === 1) {
    // Consecutive activity - increase streak!
    user.stats.streak += 1;
  } else if (diffDays > 1) {
    // Reset streak due to inactivity gap
    user.stats.streak = 1;
  } else if (user.stats.streak === 0) {
    user.stats.streak = 1;
  }
  
  // Award initial badge if streak reaches landmarks
  if (user.stats.streak >= 3 && !user.stats.badges.some(b => b.name === 'Consistent Practicer')) {
    user.stats.badges.push({
      name: 'Consistent Practicer',
      icon: '🔥',
      description: 'Maintained a 3-day practice streak!'
    });
    user.stats.xp += 100;
  }

  user.stats.lastActive = Date.now();
  await user.save();
};

/**
 * @desc    Increment XP points
 * @route   POST /api/auth/xp
 * @access  Private
 */
const addXP = async (req, res, next) => {
  const { amount } = req.body;
  try {
    const user = await User.findById(req.user._id);
    if (!user) {
      res.status(404);
      throw new Error('User not found');
    }

    user.stats.xp += amount || 10;
    
    // Gamification badges trigger
    if (user.stats.xp >= 500 && !user.stats.badges.some(b => b.name === 'Pro Interviewee')) {
      user.stats.badges.push({
        name: 'Pro Interviewee',
        icon: '🏆',
        description: 'Reached 500 XP Points!'
      });
      user.stats.xp += 200; // bonus
    }

    await user.save();

    res.json({
      success: true,
      xp: user.stats.xp,
      badges: user.stats.badges
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  registerUser,
  authUser,
  getUserProfile,
  updateUserProfile,
  addXP
};
