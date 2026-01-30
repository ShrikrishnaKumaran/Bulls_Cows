const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/authMiddleware');
const matchController = require('../controllers/matchController');

// All routes require authentication
router.post('/create', protect, matchController.createMatch);
router.post('/join', protect, matchController.joinMatch);
router.post('/invite', protect, matchController.inviteToMatch);
router.get('/:roomId', protect, matchController.getMatch);

module.exports = router;
