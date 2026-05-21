const express = require('express');
const {
  startInterview,
  submitAnswer,
  completeInterview,
  getInterviews,
  getInterviewDetail,
} = require('../controllers/interviewController');
const { protect } = require('../middleware/authMiddleware');

const router = express.Router();

router.route('/setup').post(protect, startInterview);
router.route('/').get(protect, getInterviews);
router.route('/:id').get(protect, getInterviewDetail);
router.route('/:id/answer').post(protect, submitAnswer);
router.route('/:id/complete').post(protect, completeInterview);

module.exports = router;
