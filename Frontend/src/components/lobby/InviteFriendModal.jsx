/**
 * InviteFriendModal - Invite friends to join game room
 * 
 * Shows user's friends list with online status.
 * Host can click invite to send game invite to online friends.
 */
import { useState, useEffect, useCallback } from 'react';
import api from '../../services/api';
import { getSocket } from '../../services/socket';
import useToastStore from '../../store/useToastStore';

// Close Icon
const CloseIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5">
    <path fillRule="evenodd" d="M5.47 5.47a.75.75 0 011.06 0L12 10.94l5.47-5.47a.75.75 0 111.06 1.06L13.06 12l5.47 5.47a.75.75 0 11-1.06 1.06L12 13.06l-5.47 5.47a.75.75 0 01-1.06-1.06L10.94 12 5.47 6.53a.75.75 0 010-1.06z" clipRule="evenodd" />
  </svg>
);

// User Icon
const UserIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-6 h-6">
    <path fillRule="evenodd" d="M7.5 6a4.5 4.5 0 119 0 4.5 4.5 0 01-9 0zM3.751 20.105a8.25 8.25 0 0116.498 0 .75.75 0 01-.437.695A18.683 18.683 0 0112 22.5c-2.786 0-5.433-.608-7.812-1.7a.75.75 0 01-.437-.695z" clipRule="evenodd" />
  </svg>
);

function InviteFriendModal({ onClose, roomCode }) {
  const [friends, setFriends] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [invitingId, setInvitingId] = useState(null);
  const [invitedIds, setInvitedIds] = useState(new Set());
  const { addToast } = useToastStore();

  // Handle invite declined notification
  const handleInviteDeclined = useCallback((data) => {
    addToast(`${data.by.username} declined your invite`, 'info');
    // Remove from invited set so they can be invited again
    setInvitedIds(prev => {
      const newSet = new Set(prev);
      newSet.delete(data.by._id);
      return newSet;
    });
  }, [addToast]);

  // Setup socket listener for invite declined
  useEffect(() => {
    const socket = getSocket();
    if (!socket) return;

    socket.on('invite-declined', handleInviteDeclined);

    return () => {
      socket.off('invite-declined', handleInviteDeclined);
    };
  }, [handleInviteDeclined]);

  // Fetch friends list on mount
  useEffect(() => {
    const fetchFriends = async () => {
      try {
        setLoading(true);
        const response = await api.get('/friends');
        setFriends(response.data);
      } catch (err) {
        setError('Failed to load friends list');
        console.error('[InviteFriend] Error:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchFriends();
  }, []);

  const handleInvite = async (friend) => {
    const socket = getSocket();
    if (!socket) {
      setError('Not connected to server');
      return;
    }

    setInvitingId(friend._id);
    
    socket.emit('send-game-invite', {
      friendId: friend._id,
      roomCode: roomCode,
    }, (response) => {
      setInvitingId(null);
      
      if (response.success) {
        // Mark as invited
        setInvitedIds(prev => new Set([...prev, friend._id]));
      } else {
        setError(response.message || 'Failed to send invite');
        // Clear error after 3 seconds
        setTimeout(() => setError(''), 3000);
      }
    });
  };

  const onlineFriends = friends.filter(f => f.isOnline);
  const offlineFriends = friends.filter(f => !f.isOnline);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
      <div className="bg-[#1f2937] border border-slate-700 rounded-2xl w-full max-w-md shadow-2xl max-h-[80vh] flex flex-col">
        
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-700 flex-shrink-0">
          <h2 className="text-lg font-bold text-white tracking-wide">
            INVITE FRIEND
          </h2>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-white transition-colors p-1 rounded-lg hover:bg-white/10"
          >
            <CloseIcon />
          </button>
        </div>

        {/* Content */}
        <div className="p-4 overflow-y-auto flex-1">
          {/* Error Message */}
          {error && (
            <div className="bg-red-500/20 border border-red-500/50 text-red-400 px-4 py-3 rounded-xl text-sm mb-4">
              {error}
            </div>
          )}

          {/* Loading State */}
          {loading && (
            <div className="flex items-center justify-center py-12">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
            </div>
          )}

          {/* No Friends */}
          {!loading && friends.length === 0 && (
            <div className="text-center py-8">
              <p className="text-slate-400">No friends yet</p>
              <p className="text-slate-500 text-sm mt-2">
                Add friends from your profile page
              </p>
            </div>
          )}

          {/* Friends List */}
          {!loading && friends.length > 0 && (
            <div className="space-y-4">
              {/* Online Friends */}
              {onlineFriends.length > 0 && (
                <div>
                  <h3 className="text-xs font-semibold text-green-400 uppercase tracking-wider mb-2 px-1">
                    Online ({onlineFriends.length})
                  </h3>
                  <div className="space-y-2">
                    {onlineFriends.map((friend) => (
                      <div
                        key={friend._id}
                        className="flex items-center gap-3 bg-slate-800/50 rounded-xl p-3"
                      >
                        <div className="w-10 h-10 rounded-full bg-slate-700 flex items-center justify-center text-slate-400">
                          <UserIcon />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-white font-medium truncate">{friend.username}</p>
                          <p className="text-green-400 text-xs flex items-center gap-1">
                            <span className="w-2 h-2 bg-green-400 rounded-full"></span>
                            Online
                          </p>
                        </div>
                        <button
                          onClick={() => handleInvite(friend)}
                          disabled={invitingId === friend._id || invitedIds.has(friend._id)}
                          className={`px-4 py-2 rounded-lg text-sm font-semibold transition-all
                            ${invitedIds.has(friend._id)
                              ? 'bg-green-500/20 text-green-400 cursor-default'
                              : invitingId === friend._id
                                ? 'bg-slate-700 text-slate-400 cursor-wait'
                                : 'bg-primary text-black hover:bg-yellow-400'
                            }`}
                        >
                          {invitedIds.has(friend._id) 
                            ? '✓ Invited' 
                            : invitingId === friend._id 
                              ? 'Sending...' 
                              : 'Invite'}
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Offline Friends */}
              {offlineFriends.length > 0 && (
                <div>
                  <h3 className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2 px-1">
                    Offline ({offlineFriends.length})
                  </h3>
                  <div className="space-y-2">
                    {offlineFriends.map((friend) => (
                      <div
                        key={friend._id}
                        className="flex items-center gap-3 bg-slate-800/30 rounded-xl p-3 opacity-60"
                      >
                        <div className="w-10 h-10 rounded-full bg-slate-700 flex items-center justify-center text-slate-500">
                          <UserIcon />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-slate-400 font-medium truncate">{friend.username}</p>
                          <p className="text-slate-500 text-xs flex items-center gap-1">
                            <span className="w-2 h-2 bg-slate-500 rounded-full"></span>
                            Offline
                          </p>
                        </div>
                        <span className="text-slate-500 text-xs">Unavailable</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Footer Hint */}
        <div className="px-6 py-3 border-t border-slate-700 flex-shrink-0">
          <p className="text-slate-500 text-xs text-center">
            Invites are sent instantly to online friends
          </p>
        </div>
      </div>
    </div>
  );
}

export default InviteFriendModal;
