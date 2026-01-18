const Tournament = require('../models/tournament');

// Helper function to generate random tournament code
const generateTournamentCode = () => {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  let code = '';
  for (let i = 0; i < 7; i++) {
    code += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return 'LEAGUE' + code.substring(0, 1);
};

// Create a new tournament
exports.createTournament = async (req, res) => {
  try {
    const { name = 'My League', maxParticipants = 8 } = req.body;
    const userId = req.user._id;

    // Generate unique tournament code
    let code;
    let exists = true;
    while (exists) {
      code = generateTournamentCode();
      exists = await Tournament.findOne({ code });
    }

    const tournament = new Tournament({
      code,
      name,
      host: userId,
      participants: [userId],
      maxParticipants,
      status: 'lobby'
    });

    await tournament.save();

    res.status(201).json({
      success: true,
      tournamentCode: tournament.code,
      id: tournament._id,
      name: tournament.name
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to create tournament',
      error: error.message
    });
  }
};

// Join an existing tournament
exports.joinTournament = async (req, res) => {
  try {
    const { tournamentCode } = req.body;
    const userId = req.user._id;

    const tournament = await Tournament.findOne({ code: tournamentCode.toUpperCase() });

    if (!tournament) {
      return res.status(404).json({
        success: false,
        message: 'Tournament not found'
      });
    }

    if (tournament.status !== 'lobby') {
      return res.status(400).json({
        success: false,
        message: 'Tournament has already started or finished'
      });
    }

    if (tournament.participants.includes(userId)) {
      return res.status(400).json({
        success: false,
        message: 'You are already in this tournament'
      });
    }

    if (tournament.participants.length >= tournament.maxParticipants) {
      return res.status(400).json({
        success: false,
        message: 'Tournament is full'
      });
    }

    tournament.participants.push(userId);
    await tournament.save();

    await tournament.populate('host', 'username');
    await tournament.populate('participants', 'username');

    res.status(200).json({
      success: true,
      tournamentData: {
        code: tournament.code,
        name: tournament.name,
        host: tournament.host,
        participants: tournament.participants,
        status: tournament.status,
        maxParticipants: tournament.maxParticipants
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to join tournament',
      error: error.message
    });
  }
};

// Get tournament details
exports.getTournament = async (req, res) => {
  try {
    const { code } = req.params;

    const tournament = await Tournament.findOne({ code: code.toUpperCase() })
      .populate('host', 'username')
      .populate('participants', 'username');

    if (!tournament) {
      return res.status(404).json({
        success: false,
        message: 'Tournament not found'
      });
    }

    res.status(200).json({
      success: true,
      tournamentData: tournament
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to get tournament',
      error: error.message
    });
  }
};
