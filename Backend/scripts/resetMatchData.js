/**
 * Reset match history and stats for all users (or specific users)
 * Usage: node scripts/resetMatchData.js [username1] [username2]
 * 
 * No args = reset ALL users
 * With args = reset only named users
 */
require('dotenv').config();
const mongoose = require('mongoose');
const User = require('../models/User');

const run = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log('Connected to MongoDB');

    const usernames = process.argv.slice(2);
    
    let filter = {};
    if (usernames.length > 0) {
      // Case-insensitive match for specified usernames
      filter = { username: { $in: usernames.map(u => new RegExp(`^${u}$`, 'i')) } };
      console.log(`Resetting match data for: ${usernames.join(', ')}`);
    } else {
      console.log('Resetting match data for ALL users');
    }

    // Show current state before reset
    const users = await User.find(filter).select('username stats matchHistory');
    for (const u of users) {
      console.log(`  ${u.username}: W${u.stats?.wins || 0} L${u.stats?.losses || 0} T${u.stats?.totalGames || 0}, ${u.matchHistory?.length || 0} history entries`);
    }

    // Reset
    const result = await User.updateMany(filter, {
      $set: {
        'stats.totalGames': 0,
        'stats.wins': 0,
        'stats.losses': 0,
        matchHistory: []
      }
    });

    console.log(`\nReset ${result.modifiedCount} user(s)`);
    
    // Verify
    const after = await User.find(filter).select('username stats matchHistory');
    for (const u of after) {
      console.log(`  ${u.username}: W${u.stats?.wins || 0} L${u.stats?.losses || 0} T${u.stats?.totalGames || 0}, ${u.matchHistory?.length || 0} history entries`);
    }

    console.log('\nDone!');
    process.exit(0);
  } catch (err) {
    console.error('Error:', err.message);
    process.exit(1);
  }
};

run();
