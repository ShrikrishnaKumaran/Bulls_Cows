const friendService = require('../services/friendService');

/**
 * @desc    Search users by username or UID
 * @route   GET /api/friends/search?q=...
 * @access  Private
 */
const searchUsers = async (req, res) => {
  try {
    const users = await friendService.searchUsers(req.query.q, req.user._id);
    res.status(200).json(users);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

/**
 * @desc    Send a friend request
 * @route   POST /api/friends/request
 * @access  Private
 * @body    { targetUid: "#1234" }
 */
const sendRequest = async (req, res) => {
  try {
    const result = await friendService.sendFriendRequest(req.user._id, req.body.targetUid);
    res.status(200).json(result);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

/**
 * @desc    Accept a friend request
 * @route   POST /api/friends/accept
 * @access  Private
 * @body    { requesterId: "userId" }
 */
const acceptRequest = async (req, res) => {
  try {
    const result = await friendService.acceptFriendRequest(req.user._id, req.body.requesterId);
    res.status(200).json(result);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

/**
 * @desc    Reject a friend request
 * @route   POST /api/friends/reject
 * @access  Private
 * @body    { requesterId: "userId" }
 */
const rejectRequest = async (req, res) => {
  try {
    const result = await friendService.rejectFriendRequest(req.user._id, req.body.requesterId);
    res.status(200).json(result);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

/**
 * @desc    Cancel an outgoing friend request
 * @route   POST /api/friends/cancel
 * @access  Private
 * @body    { targetId: "userId" }
 */
const cancelRequest = async (req, res) => {
  try {
    const result = await friendService.cancelFriendRequest(req.user._id, req.body.targetId);
    res.status(200).json(result);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

/**
 * @desc    Remove a friend
 * @route   DELETE /api/friends/:friendId
 * @access  Private
 */
const removeFriend = async (req, res) => {
  try {
    const result = await friendService.removeFriend(req.user._id, req.params.friendId);
    res.status(200).json(result);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

/**
 * @desc    Get friends list
 * @route   GET /api/friends
 * @access  Private
 */
const getFriendsList = async (req, res) => {
  try {
    const friends = await friendService.getFriendsList(req.user._id);
    res.status(200).json(friends);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

/**
 * @desc    Get pending friend requests
 * @route   GET /api/friends/pending
 * @access  Private
 */
const getPendingRequests = async (req, res) => {
  try {
    const requests = await friendService.getPendingRequests(req.user._id);
    res.status(200).json(requests);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

/**
 * @desc    Get user profile by UID
 * @route   GET /api/friends/user/:uid
 * @access  Private
 */
const getUserByUid = async (req, res) => {
  try {
    const { uid } = req.params;
    const user = await friendService.getUserByUid(uid);
    res.status(200).json(user);
  } catch (error) {
    res.status(404).json({ message: error.message });
  }
};

module.exports = {
  searchUsers,
  sendRequest,
  acceptRequest,
  rejectRequest,
  cancelRequest,
  removeFriend,
  getFriendsList,
  getPendingRequests,
  getUserByUid
};
