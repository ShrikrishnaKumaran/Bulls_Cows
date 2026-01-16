const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/auth');
const tournamentController = require('../controllers/tournamentController');

// All routes require authentication
router.post('/create', protect, tournamentController.createTournament);
router.post('/join', protect, tournamentController.joinTournament);
router.get('/:code', protect, tournamentController.getTournament);

module.exports = router;
