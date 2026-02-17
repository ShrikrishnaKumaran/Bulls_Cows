const User = require('../models/User');

/**
 * Friend Service
 * Handles all friend-related operations including searching users,
 * sending/accepting/rejecting friend requests, and managing friend lists.
 */

/**
 * Search for users by username or UID
 * @param {string} query - Search term (minimum 2 characters)
 * @param {string} currentUserId - ID of the user performing the search (excluded from results)
 * @returns {Promise<Array>} Array of matching users with selected fields
 * @throws {Error} If query is too short
 */
const searchUsers = async (query, currentUserId) => {
  if (!query || query.trim().length < 2) {
    throw new Error('Search query must be at least 2 characters');
  }

  const searchTerm = query.trim();

  // Build search conditions - exclude current user and search by username
  const searchConditions = {
    _id: { $ne: currentUserId },
    $or: [{ username: { $regex: searchTerm, $options: 'i' } }]
  };

  // If query starts with '#', also search by UID (unique identifier)
  if (searchTerm.startsWith('#')) {
    searchConditions.$or.push({ uid: { $regex: searchTerm, $options: 'i' } });
  }

  // Return limited results with only necessary fields for display
  return User.find(searchConditions)
    .select('uid username isOnline stats.totalGames stats.wins')
    .limit(10);
};


/**
 * Send a friend request to another user
 * If the target user has already sent a request to the sender, auto-accept instead
 * @param {string} senderId - MongoDB ID of the user sending the request
 * @param {string} targetUid - UID of the user to send request to
 * @returns {Promise<Object>} Success response with target user info
 * @throws {Error} If user not found, self-request, already friends, or request exists
 */
const sendFriendRequest = async (senderId, targetUid) => {
  // Find target user by their public UID
  const targetUser = await User.findOne({ uid: targetUid });
  if (!targetUser) 
    throw new Error('User not found');
  
  if (targetUser._id.toString() === senderId) 
    throw new Error('Cannot send friend request to yourself');

  const sender = await User.findById(senderId);
  if (!sender) 
    throw new Error('Sender not found');

  // Check if already friends
  if (sender.friends.includes(targetUser._id)) 
    throw new Error('Already friends with this user');

  // Check for duplicate outgoing request
  const existingOutgoing = sender.friendRequests.outgoing.find(
    req => req.to.toString() === targetUser._id.toString()
  );
  if (existingOutgoing) throw new Error('Friend request already sent');

  // If target already sent us a request, auto-accept instead of creating duplicate
  const existingIncoming = sender.friendRequests.incoming.find(
    req => req.from.toString() === targetUser._id.toString()
  );
  if (existingIncoming) {
    return await acceptFriendRequest(senderId, targetUser._id.toString());
  }

  // Create bidirectional friend request entries
  sender.friendRequests.outgoing.push({ to: targetUser._id, status: 'pending' });
  targetUser.friendRequests.incoming.push({ from: sender._id, status: 'pending' });

  await sender.save();
  await targetUser.save();

  return {
    success: true,
    message: 'Friend request sent',
    targetUser: { uid: targetUser.uid, username: targetUser.username }
  };
};


/**
 * Accept an incoming friend request
 * Removes the request from both users' request lists and adds each to the other's friends list
 * @param {string} userId - MongoDB ID of the user accepting the request
 * @param {string} requesterId - MongoDB ID of the user who sent the request
 * @returns {Promise<Object>} Success response with new friend's info
 * @throws {Error} If users not found or request doesn't exist
 */
const acceptFriendRequest = async (userId, requesterId) => {
  const user = await User.findById(userId);
  const requester = await User.findById(requesterId);
  if (!user || !requester) throw new Error('User not found');

  // Find and remove the incoming request from the accepting user
  const incomingIndex = user.friendRequests.incoming.findIndex(
    req => req.from.toString() === requesterId
  );
  if (incomingIndex === -1) throw new Error('Friend request not found');
  user.friendRequests.incoming.splice(incomingIndex, 1);

  // Remove the corresponding outgoing request from the requester
  const outgoingIndex = requester.friendRequests.outgoing.findIndex(
    req => req.to.toString() === userId
  );
  if (outgoingIndex !== -1) requester.friendRequests.outgoing.splice(outgoingIndex, 1);

  // Add each user to the other's friends list (prevent duplicates)
  if (!user.friends.includes(requesterId)) user.friends.push(requesterId);
  if (!requester.friends.includes(userId)) requester.friends.push(userId);

  await user.save();
  await requester.save();

  return {
    success: true,
    message: 'Friend request accepted',
    friend: { _id: requester._id, uid: requester.uid, username: requester.username, isOnline: requester.isOnline }
  };
};


/**
 * Reject an incoming friend request
 * Removes the request from both users' request lists without adding as friends
 * @param {string} userId - MongoDB ID of the user rejecting the request
 * @param {string} requesterId - MongoDB ID of the user who sent the request
 * @returns {Promise<Object>} Success response
 * @throws {Error} If user not found or request doesn't exist
 */
const rejectFriendRequest = async (userId, requesterId) => {
  const user = await User.findById(userId);
  if (!user) throw new Error('User not found');

  // Find and remove the incoming request
  const incomingIndex = user.friendRequests.incoming.findIndex(
    req => req.from.toString() === requesterId
  );
  if (incomingIndex === -1) throw new Error('Friend request not found');
  user.friendRequests.incoming.splice(incomingIndex, 1);

  // Also remove the outgoing request from the requester (if they still exist)
  const requester = await User.findById(requesterId);
  if (requester) {
    const outgoingIndex = requester.friendRequests.outgoing.findIndex(
      req => req.to.toString() === userId
    );
    if (outgoingIndex !== -1) {
      requester.friendRequests.outgoing.splice(outgoingIndex, 1);
      await requester.save();
    }
  }

  await user.save();
  return { success: true, message: 'Friend request rejected' };
};


/**
 * Cancel an outgoing friend request that hasn't been accepted yet
 * @param {string} userId - MongoDB ID of the user cancelling their request
 * @param {string} targetId - MongoDB ID of the user the request was sent to
 * @returns {Promise<Object>} Success response
 * @throws {Error} If user not found or request doesn't exist
 */
const cancelFriendRequest = async (userId, targetId) => {
  const user = await User.findById(userId);
  if (!user) throw new Error('User not found');

  // Find and remove the outgoing request from the cancelling user
  const outgoingIndex = user.friendRequests.outgoing.findIndex(
    req => req.to.toString() === targetId
  );
  if (outgoingIndex === -1) throw new Error('Friend request not found');
  user.friendRequests.outgoing.splice(outgoingIndex, 1);

  // Also remove the incoming request from the target user (if they still exist)
  const target = await User.findById(targetId);
  if (target) {
    const incomingIndex = target.friendRequests.incoming.findIndex(
      req => req.from.toString() === userId
    );
    if (incomingIndex !== -1) {
      target.friendRequests.incoming.splice(incomingIndex, 1);
      await target.save();
    }
  }

  await user.save();
  return { success: true, message: 'Friend request cancelled' };
};


/**
 * Remove an existing friend from the user's friends list
 * This is a bidirectional operation - removes from both users' lists
 * @param {string} userId - MongoDB ID of the user removing the friend
 * @param {string} friendId - MongoDB ID of the friend to remove
 * @returns {Promise<Object>} Success response
 * @throws {Error} If user not found
 */
const removeFriend = async (userId, friendId) => {
  const user = await User.findById(userId);
  if (!user) throw new Error('User not found');

  // Remove friend from user's list
  user.friends = user.friends.filter(id => id.toString() !== friendId);

  // Remove user from friend's list (bidirectional unfriending)
  const friend = await User.findById(friendId);
  if (friend) {
    friend.friends = friend.friends.filter(id => id.toString() !== userId);
    await friend.save();
  }

  await user.save();
  return { success: true, message: 'Friend removed' };
};

/**
 * Get the user's complete friends list with populated user data
 * @param {string} userId - MongoDB ID of the user
 * @returns {Promise<Array>} Array of friend objects with uid, username, online status, and stats
 * @throws {Error} If user not found
 */
const getFriendsList = async (userId) => {
  const user = await User.findById(userId)
    .populate('friends', 'uid username isOnline stats.totalGames stats.wins');
  if (!user) throw new Error('User not found');
  return user.friends;
};

/**
 * Get all pending friend requests for a user (both incoming and outgoing)
 * @param {string} userId - MongoDB ID of the user
 * @returns {Promise<Object>} Object containing incoming and outgoing request arrays
 * @throws {Error} If user not found
 */
const getPendingRequests = async (userId) => {
  const user = await User.findById(userId)
    .populate('friendRequests.incoming.from', 'uid username isOnline')
    .populate('friendRequests.outgoing.to', 'uid username isOnline');
  if (!user) throw new Error('User not found');
  return { incoming: user.friendRequests.incoming, outgoing: user.friendRequests.outgoing };
};

/**
 * Get a user's public profile information by their UID
 * @param {string} uid - The public UID of the user (e.g., "#ABC123")
 * @returns {Promise<Object>} User profile with uid, username, stats, online status, and join date
 * @throws {Error} If user not found
 */
const getUserByUid = async (uid) => {
  const user = await User.findOne({ uid }).select('uid username stats isOnline createdAt');
  if (!user) throw new Error('User not found');
  return user;
};

// Export all friend service functions
module.exports = {
  searchUsers,
  sendFriendRequest,
  acceptFriendRequest,
  rejectFriendRequest,
  cancelFriendRequest,
  removeFriend,
  getFriendsList,
  getPendingRequests,
  getUserByUid
};
