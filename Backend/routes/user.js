const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/authMiddleware');
const User = require('../models/User');

// @desc    Get current user profile with stats and friends
// @route   GET /api/users/profile
// @access  Private
const getProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user._id)
      .select('-password')
      .populate('friends', 'username stats isOnline');

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    res.status(200).json({
      success: true,
      user: {
        _id: user._id,
        username: user.username,
        email: user.email,
        stats: user.stats,
        friends: user.friends,
        isOnline: user.isOnline
      }
    });
  } catch (error) {
    console.error('Get profile error:', error);
    res.status(500).json({ 
      success: false,
      message: 'Failed to fetch profile',
      error: error.message 
    });
  }
};

// @desc    Get another user's public profile
// @route   GET /api/users/:id
// @access  Private
const getUserById = async (req, res) => {
  try {
    const user = await User.findById(req.params.id)
      .select('username stats isOnline');

    if (!user) {
      return res.status(404).json({ 
        success: false,
        message: 'User not found' 
      });
    }

    res.status(200).json({
      success: true,
      user: {
        _id: user._id,
        username: user.username,
        stats: user.stats,
        isOnline: user.isOnline
      }
    });
  } catch (error) {
    console.error('Get user error:', error);
    res.status(500).json({ 
      success: false,
      message: 'Failed to fetch user',
      error: error.message 
    });
  }
};

// @desc    Add a friend
// @route   POST /api/users/add-friend
// @access  Private
const addFriend = async (req, res) => {
  try {
    const { friendId } = req.body;
    const userId = req.user._id;

    // Check if trying to add self
    if (friendId === userId.toString()) {
      return res.status(400).json({ 
        success: false,
        message: 'Cannot add yourself as friend' 
      });
    }

    // Check if friend exists
    const friend = await User.findById(friendId);
    if (!friend) {
      return res.status(404).json({ 
        success: false,
        message: 'User not found' 
      });
    }

    // Check if already friends
    const user = await User.findById(userId);
    if (user.friends.includes(friendId)) {
      return res.status(400).json({ 
        success: false,
        message: 'Already friends' 
      });
    }

    // Add friend
    user.friends.push(friendId);
    await user.save();

    // Populate the new friend data
    await user.populate('friends', 'username stats isOnline');

    res.status(200).json({
      success: true,
      message: 'Friend added successfully',
      friends: user.friends
    });
  } catch (error) {
    console.error('Add friend error:', error);
    res.status(500).json({ 
      success: false,
      message: 'Failed to add friend',
      error: error.message 
    });
  }
};

// @desc    Remove a friend
// @route   DELETE /api/users/remove-friend/:friendId
// @access  Private
const removeFriend = async (req, res) => {
  try {
    const { friendId } = req.params;
    const userId = req.user._id;

    const user = await User.findById(userId);
    
    // Check if friend exists in list
    if (!user.friends.includes(friendId)) {
      return res.status(400).json({ 
        success: false,
        message: 'User is not in your friends list' 
      });
    }

    // Remove friend
    user.friends = user.friends.filter(id => id.toString() !== friendId);
    await user.save();

    res.status(200).json({
      success: true,
      message: 'Friend removed successfully'
    });
  } catch (error) {
    console.error('Remove friend error:', error);
    res.status(500).json({ 
      success: false,
      message: 'Failed to remove friend',
      error: error.message 
    });
  }
};

// Routes
router.get('/profile', protect, getProfile);
router.get('/:id', protect, getUserById);
router.post('/add-friend', protect, addFriend);
router.delete('/remove-friend/:friendId', protect, removeFriend);

module.exports = router;
