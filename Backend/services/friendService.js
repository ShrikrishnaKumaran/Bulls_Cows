const User = require('../models/User');

// Search for users by username or UID
const searchUsers = async (query, currentUserId) => {
  if (!query || query.trim().length < 2) {
    throw new Error('Search query must be at least 2 characters');
  }

  const searchTerm = query.trim();
  const searchConditions = {
    _id: { $ne: currentUserId },
    $or: [{ username: { $regex: searchTerm, $options: 'i' } }]
  };

  if (searchTerm.startsWith('#')) {
    searchConditions.$or.push({ uid: { $regex: searchTerm, $options: 'i' } });
  }

  return User.find(searchConditions)
    .select('uid username isOnline stats.totalGames stats.wins')
    .limit(10);
};


// Send a friend request
const sendFriendRequest = async (senderId, targetUid) => {
  const targetUser = await User.findOne({ uid: targetUid });
  if (!targetUser) throw new Error('User not found');
  if (targetUser._id.toString() === senderId) throw new Error('Cannot send friend request to yourself');

  const sender = await User.findById(senderId);
  if (!sender) throw new Error('Sender not found');
  if (sender.friends.includes(targetUser._id)) throw new Error('Already friends with this user');

  const existingOutgoing = sender.friendRequests.outgoing.find(
    req => req.to.toString() === targetUser._id.toString()
  );
  if (existingOutgoing) throw new Error('Friend request already sent');

  const existingIncoming = sender.friendRequests.incoming.find(
    req => req.from.toString() === targetUser._id.toString()
  );
  if (existingIncoming) {
    return await acceptFriendRequest(senderId, targetUser._id.toString());
  }

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


// Accept a friend request
const acceptFriendRequest = async (userId, requesterId) => {
  const user = await User.findById(userId);
  const requester = await User.findById(requesterId);
  if (!user || !requester) throw new Error('User not found');

  const incomingIndex = user.friendRequests.incoming.findIndex(
    req => req.from.toString() === requesterId
  );
  if (incomingIndex === -1) throw new Error('Friend request not found');

  user.friendRequests.incoming.splice(incomingIndex, 1);

  const outgoingIndex = requester.friendRequests.outgoing.findIndex(
    req => req.to.toString() === userId
  );
  if (outgoingIndex !== -1) requester.friendRequests.outgoing.splice(outgoingIndex, 1);

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


// Reject a friend request
const rejectFriendRequest = async (userId, requesterId) => {
  const user = await User.findById(userId);
  if (!user) throw new Error('User not found');

  const incomingIndex = user.friendRequests.incoming.findIndex(
    req => req.from.toString() === requesterId
  );
  if (incomingIndex === -1) throw new Error('Friend request not found');

  user.friendRequests.incoming.splice(incomingIndex, 1);

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


// Cancel an outgoing friend request
const cancelFriendRequest = async (userId, targetId) => {
  const user = await User.findById(userId);
  if (!user) throw new Error('User not found');

  const outgoingIndex = user.friendRequests.outgoing.findIndex(
    req => req.to.toString() === targetId
  );
  if (outgoingIndex === -1) throw new Error('Friend request not found');

  user.friendRequests.outgoing.splice(outgoingIndex, 1);

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


// Remove a friend
const removeFriend = async (userId, friendId) => {
  const user = await User.findById(userId);
  if (!user) throw new Error('User not found');

  user.friends = user.friends.filter(id => id.toString() !== friendId);

  const friend = await User.findById(friendId);
  if (friend) {
    friend.friends = friend.friends.filter(id => id.toString() !== userId);
    await friend.save();
  }

  await user.save();
  return { success: true, message: 'Friend removed' };
};

// Get user's friends list
const getFriendsList = async (userId) => {
  const user = await User.findById(userId)
    .populate('friends', 'uid username isOnline stats.totalGames stats.wins');
  if (!user) throw new Error('User not found');
  return user.friends;
};

// Get user's pending friend requests
const getPendingRequests = async (userId) => {
  const user = await User.findById(userId)
    .populate('friendRequests.incoming.from', 'uid username isOnline')
    .populate('friendRequests.outgoing.to', 'uid username isOnline');
  if (!user) throw new Error('User not found');
  return { incoming: user.friendRequests.incoming, outgoing: user.friendRequests.outgoing };
};

// Get user profile by UID
const getUserByUid = async (uid) => {
  const user = await User.findOne({ uid }).select('uid username stats isOnline createdAt');
  if (!user) throw new Error('User not found');
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
