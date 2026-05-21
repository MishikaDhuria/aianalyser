const express = require('express');
const {
  startGDSession,
  submitGDTurn,
  completeGDSession,
  getGDSessions,
  getGDSessionDetail,
} = require('../controllers/gdController');
const { protect } = require('../middleware/authMiddleware');

const router = express.Router();

router.route('/setup').post(protect, startGDSession);
router.route('/').get(protect, getGDSessions);
router.route('/:id').get(protect, getGDSessionDetail);
router.route('/:id/turn').post(protect, submitGDTurn);
router.route('/:id/complete').post(protect, completeGDSession);

module.exports = router;
