const express = require('express');
const {
  getProblems,
  runAndEvaluateCode,
  getHistory,
} = require('../controllers/codingController');
const { protect } = require('../middleware/authMiddleware');

const router = express.Router();

router.route('/problems').get(getProblems);
router.route('/run').post(protect, runAndEvaluateCode);
router.route('/history').get(protect, getHistory);

module.exports = router;
