/**
 * Friend Routes - API endpoints for Friend System
 * 
 * Base path: /api/friends
 */

const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/authMiddleware');
const friendController = require('../controllers/friendController');

// All routes are protected
router.use(protect);

// Search users by username or UID
router.get('/search', friendController.searchUsers);

// Get friends list
router.get('/', friendController.getFriendsList);

// Get pending friend requests
router.get('/requests', friendController.getPendingRequests);

// Get user by UID
router.get('/user/:uid', friendController.getUserByUid);

// Send a friend request
router.post('/request', friendController.sendRequest);

// Accept a friend request
router.post('/accept', friendController.acceptRequest);

// Reject a friend request
router.post('/reject', friendController.rejectRequest);

// Cancel an outgoing friend request
router.post('/cancel', friendController.cancelRequest);

// Remove a friend
router.delete('/:friendId', friendController.removeFriend);

module.exports = router;
