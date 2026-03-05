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
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/70 backdrop-blur-sm p-4">
      <div className="relative bg-[#0d1520] border border-slate-700/60 rounded-2xl w-full max-w-md shadow-2xl max-h-[80vh] flex flex-col overflow-hidden font-space">

        {/* Top accent line */}
        <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-cyan-500/50 to-transparent" />

        {/* Ambient glow */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-64 h-24 bg-cyan-500/5 rounded-full blur-2xl pointer-events-none" />

        {/* Header */}
        <div className="relative flex items-center justify-between px-5 py-4 border-b border-slate-700/50 flex-shrink-0">
          <div>
            <p className="text-[9px] font-mono text-cyan-500/50 uppercase tracking-[0.35em] mb-0.5">{'// Multiplayer'}</p>
            <h2 className="text-base font-black text-white uppercase tracking-[0.15em]">Invite Operative</h2>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 flex items-center justify-center rounded-full bg-slate-700/50 border border-slate-600/50 text-slate-400 hover:text-white hover:bg-slate-600/60 hover:border-slate-500/60 transition-all"
          >
            <CloseIcon />
          </button>
        </div>

        {/* Content */}
        <div className="p-4 overflow-y-auto flex-1">

          {/* Error Message */}
          {error && (
            <div className="bg-red-500/10 border border-red-500/30 text-red-400 px-3 py-2 rounded-lg text-xs font-mono mb-3">
              {'> ERROR: '}{error}
            </div>
          )}

          {/* Loading State */}
          {loading && (
            <div className="flex flex-col items-center justify-center py-10 gap-3">
              <div className="animate-spin rounded-full h-7 w-7 border-2 border-slate-700 border-t-cyan-400" />
              <p className="text-[10px] font-mono text-slate-500 uppercase tracking-widest">Scanning network...</p>
            </div>
          )}

          {/* No Friends */}
          {!loading && friends.length === 0 && (
            <div className="text-center py-8">
              <p className="text-[10px] font-mono text-cyan-500/40 uppercase tracking-[0.3em] mb-2">{'> No operatives found'}</p>
              <p className="text-slate-500 text-xs font-mono">Add friends from your profile page</p>
            </div>
          )}

          {/* Friends List */}
          {!loading && friends.length > 0 && (
            <div className="space-y-4">

              {/* Online Friends */}
              {onlineFriends.length > 0 && (
                <div>
                  <p className="text-[9px] font-mono text-emerald-400/70 uppercase tracking-[0.3em] mb-2 flex items-center gap-1.5">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 shadow-[0_0_6px_#34d399]" />
                    Online ({onlineFriends.length})
                  </p>
                  <div className="space-y-1.5">
                    {onlineFriends.map((friend) => (
                      <div
                        key={friend._id}
                        className="flex items-center gap-3 bg-slate-800/40 border border-slate-700/40 rounded-xl px-3 py-2.5 hover:border-cyan-500/20 hover:bg-slate-800/60 transition-all"
                      >
                        <div className="relative shrink-0">
                          <div className="w-9 h-9 rounded-lg bg-cyan-500/10 border border-cyan-500/20 flex items-center justify-center text-slate-400">
                            <UserIcon />
                          </div>
                          <div className="absolute -bottom-0.5 -right-0.5 w-2 h-2 rounded-full bg-emerald-400 border border-[#0d1520] shadow-[0_0_5px_#34d399]" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-white font-black text-sm truncate">{friend.username}</p>
                          <p className="text-[10px] font-mono text-emerald-400/70 uppercase tracking-wider">Online</p>
                        </div>
                        <button
                          onClick={() => handleInvite(friend)}
                          disabled={invitingId === friend._id || invitedIds.has(friend._id)}
                          className={`px-3 py-1.5 rounded-lg text-xs font-black font-mono uppercase tracking-wider transition-all ${
                            invitedIds.has(friend._id)
                              ? 'bg-emerald-500/15 border border-emerald-500/30 text-emerald-400 cursor-default'
                              : invitingId === friend._id
                                ? 'bg-slate-700/50 border border-slate-600/40 text-slate-400 cursor-wait'
                                : 'bg-cyan-500/10 border border-cyan-500/30 text-cyan-400 hover:bg-cyan-500/20 hover:shadow-[0_0_10px_rgba(6,182,212,0.2)]'
                          }`}
                        >
                          {invitedIds.has(friend._id)
                            ? '✓ Sent'
                            : invitingId === friend._id
                              ? '...'
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
                  <p className="text-[9px] font-mono text-slate-600 uppercase tracking-[0.3em] mb-2 flex items-center gap-1.5">
                    <span className="w-1.5 h-1.5 rounded-full bg-slate-600" />
                    Offline ({offlineFriends.length})
                  </p>
                  <div className="space-y-1.5">
                    {offlineFriends.map((friend) => (
                      <div
                        key={friend._id}
                        className="flex items-center gap-3 bg-slate-800/20 border border-slate-700/25 rounded-xl px-3 py-2.5 opacity-50"
                      >
                        <div className="w-9 h-9 rounded-lg bg-slate-700/30 border border-slate-700/30 flex items-center justify-center text-slate-600">
                          <UserIcon />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-slate-500 font-black text-sm truncate">{friend.username}</p>
                          <p className="text-[10px] font-mono text-slate-600 uppercase tracking-wider">Offline</p>
                        </div>
                        <span className="text-[10px] font-mono text-slate-600 uppercase tracking-wider">N/A</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-5 py-3 border-t border-slate-700/40 flex-shrink-0">
          <p className="text-[9px] font-mono text-slate-600 uppercase tracking-[0.25em] text-center">
            {'> Invites dispatched instantly to online operatives'}
          </p>
        </div>

        {/* Bottom accent line */}
        <div className="absolute bottom-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-slate-600/40 to-transparent" />
      </div>
    </div>
  );
}

export default InviteFriendModal;
