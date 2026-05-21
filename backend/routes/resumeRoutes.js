const express = require('express');
const {
  uploadAndAnalyzeResume,
  getResumeReports,
} = require('../controllers/resumeController');
const { protect } = require('../middleware/authMiddleware');
const upload = require('../middleware/uploadMiddleware');

const router = express.Router();

router.post('/analyze', protect, upload.single('resume'), uploadAndAnalyzeResume);
router.get('/reports', protect, getResumeReports);

module.exports = router;
