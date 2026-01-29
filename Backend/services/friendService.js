/**
 * Friend Service - Business Logic for Friend System
 * 
 * Handles all friend-related operations:
 * - Search users by username or UID
 * - Send/Accept/Reject friend requests
 * - Get friends list with online status
 */

const User = require('../models/User');

/**
 * Search for users by username or UID
 * @param {string} query - Search term (username or UID like #1234)
 * @param {string} currentUserId - ID of the searching user (to exclude from results)
 * @returns {Array} - Matching users
 */
const searchUsers = async (query, currentUserId) => {
  if (!query || query.trim().length < 2) {
    throw new Error('Search query must be at least 2 characters');
  }

  const searchTerm = query.trim();
  
  // Build search conditions
  const searchConditions = {
    _id: { $ne: currentUserId }, // Exclude current user
    $or: []
  };

  // If query starts with #, search by UID
  if (searchTerm.startsWith('#')) {
    searchConditions.$or.push({ uid: { $regex: searchTerm, $options: 'i' } });
  }
  
  // Also search by username (partial match)
  searchConditions.$or.push({ username: { $regex: searchTerm, $options: 'i' } });

  // If no conditions were added, return empty
  if (searchConditions.$or.length === 0) {
    return [];
  }

  const users = await User.find(searchConditions)
    .select('uid username isOnline stats.totalGames stats.wins')
    .limit(10);

  return users;
};

/**
 * Send a friend request
 * @param {string} senderId - ID of the user sending the request
 * @param {string} targetUid - UID of the target user (e.g., #1234)
 */
const sendFriendRequest = async (senderId, targetUid) => {
  // Find target user by UID
  const targetUser = await User.findOne({ uid: targetUid });
  if (!targetUser) {
    throw new Error('User not found');
  }

  if (targetUser._id.toString() === senderId) {
    throw new Error('Cannot send friend request to yourself');
  }

  const sender = await User.findById(senderId);
  if (!sender) {
    throw new Error('Sender not found');
  }

  // Check if already friends
  if (sender.friends.includes(targetUser._id)) {
    throw new Error('Already friends with this user');
  }

  // Check for existing outgoing request
  const existingOutgoing = sender.friendRequests.outgoing.find(
    req => req.to.toString() === targetUser._id.toString()
  );
  if (existingOutgoing) {
    throw new Error('Friend request already sent');
  }

  // Check for existing incoming request (auto-accept scenario)
  const existingIncoming = sender.friendRequests.incoming.find(
    req => req.from.toString() === targetUser._id.toString()
  );
  if (existingIncoming) {
    // Auto-accept: they already sent us a request
    return await acceptFriendRequest(senderId, targetUser._id.toString());
  }

  // Add to sender's outgoing requests
  sender.friendRequests.outgoing.push({
    to: targetUser._id,
    status: 'pending'
  });

  // Add to target's incoming requests
  targetUser.friendRequests.incoming.push({
    from: sender._id,
    status: 'pending'
  });

  await sender.save();
  await targetUser.save();

  return {
    success: true,
    message: 'Friend request sent',
    targetUser: {
      uid: targetUser.uid,
      username: targetUser.username
    }
  };
};

/**
 * Accept a friend request
 * @param {string} userId - ID of the user accepting the request
 * @param {string} requesterId - ID of the user who sent the request
 */
const acceptFriendRequest = async (userId, requesterId) => {
  const user = await User.findById(userId);
  const requester = await User.findById(requesterId);

  if (!user || !requester) {
    throw new Error('User not found');
  }

  // Find and remove the incoming request
  const incomingIndex = user.friendRequests.incoming.findIndex(
    req => req.from.toString() === requesterId
  );

  if (incomingIndex === -1) {
    throw new Error('Friend request not found');
  }

  user.friendRequests.incoming.splice(incomingIndex, 1);

  // Find and remove the outgoing request from requester
  const outgoingIndex = requester.friendRequests.outgoing.findIndex(
    req => req.to.toString() === userId
  );

  if (outgoingIndex !== -1) {
    requester.friendRequests.outgoing.splice(outgoingIndex, 1);
  }

  // Add each other as friends (if not already)
  if (!user.friends.includes(requesterId)) {
    user.friends.push(requesterId);
  }
  if (!requester.friends.includes(userId)) {
    requester.friends.push(userId);
  }

  await user.save();
  await requester.save();

  return {
    success: true,
    message: 'Friend request accepted',
    friend: {
      _id: requester._id,
      uid: requester.uid,
      username: requester.username,
      isOnline: requester.isOnline
    }
  };
};

/**
 * Reject a friend request
 * @param {string} userId - ID of the user rejecting the request
 * @param {string} requesterId - ID of the user who sent the request
 */
const rejectFriendRequest = async (userId, requesterId) => {
  const user = await User.findById(userId);
  const requester = await User.findById(requesterId);

  if (!user) {
    throw new Error('User not found');
  }

  // Find and remove the incoming request
  const incomingIndex = user.friendRequests.incoming.findIndex(
    req => req.from.toString() === requesterId
  );

  if (incomingIndex === -1) {
    throw new Error('Friend request not found');
  }

  user.friendRequests.incoming.splice(incomingIndex, 1);

  // Also remove the outgoing request from requester
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

  return {
    success: true,
    message: 'Friend request rejected'
  };
};

/**
 * Cancel an outgoing friend request
 * @param {string} userId - ID of the user canceling the request
 * @param {string} targetId - ID of the target user
 */
const cancelFriendRequest = async (userId, targetId) => {
  const user = await User.findById(userId);
  const target = await User.findById(targetId);

  if (!user) {
    throw new Error('User not found');
  }

  // Find and remove the outgoing request
  const outgoingIndex = user.friendRequests.outgoing.findIndex(
    req => req.to.toString() === targetId
  );

  if (outgoingIndex === -1) {
    throw new Error('Friend request not found');
  }

  user.friendRequests.outgoing.splice(outgoingIndex, 1);

  // Also remove the incoming request from target
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

  return {
    success: true,
    message: 'Friend request cancelled'
  };
};

/**
 * Remove a friend
 * @param {string} userId - ID of the user removing the friend
 * @param {string} friendId - ID of the friend to remove
 */
const removeFriend = async (userId, friendId) => {
  const user = await User.findById(userId);
  const friend = await User.findById(friendId);

  if (!user) {
    throw new Error('User not found');
  }

  // Remove from user's friends list
  user.friends = user.friends.filter(id => id.toString() !== friendId);

  // Remove from friend's friends list
  if (friend) {
    friend.friends = friend.friends.filter(id => id.toString() !== userId);
    await friend.save();
  }

  await user.save();

  return {
    success: true,
    message: 'Friend removed'
  };
};

/**
 * Get user's friends list with online status
 * @param {string} userId - ID of the user
 */
const getFriendsList = async (userId) => {
  const user = await User.findById(userId)
    .populate('friends', 'uid username isOnline stats.totalGames stats.wins');

  if (!user) {
    throw new Error('User not found');
  }

  return user.friends;
};

/**
 * Get user's pending friend requests
 * @param {string} userId - ID of the user
 */
const getPendingRequests = async (userId) => {
  const user = await User.findById(userId)
    .populate('friendRequests.incoming.from', 'uid username isOnline')
    .populate('friendRequests.outgoing.to', 'uid username isOnline');

  if (!user) {
    throw new Error('User not found');
  }

  return {
    incoming: user.friendRequests.incoming,
    outgoing: user.friendRequests.outgoing
  };
};

/**
 * Get user profile by UID (public info only)
 * @param {string} uid - User's UID (e.g., #1234)
 */
const getUserByUid = async (uid) => {
  const user = await User.findOne({ uid })
    .select('uid username stats isOnline createdAt');

  if (!user) {
    throw new Error('User not found');
  }

  return user;
};

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
