/**
 * GameInviteNotification - Global notification for incoming game invites
 * 
 * Listens for 'game-invite' socket events and shows a popup.
 * User can accept (join room) or decline the invite.
 */
import { useState, useEffect, useCallback, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { getSocket, initializeSocket, isSocketConnected } from '../../services/socket';
import useOnlineGameStore from '../../store/useOnlineGameStore';

function GameInviteNotification() {
  const [invite, setInvite] = useState(null);
  const [joining, setJoining] = useState(false);
  const listenerAttached = useRef(false);
  const navigate = useNavigate();
  
  const { joinRoom, setupListeners, removeListeners, resetState } = useOnlineGameStore();

  // Handle incoming game invite
  const handleGameInvite = useCallback((data) => {
    console.log('[GameInvite] Received invite:', data);
    // Show the invite notification
    setInvite(data);
    
    // Auto-dismiss after 30 seconds if no action
    setTimeout(() => {
      setInvite((current) => {
        if (current && current.timestamp === data.timestamp) {
          return null;
        }
        return current;
      });
    }, 30000);
  }, []);

  // Setup socket listener - with retry mechanism
  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) return;

    let socket = null;
    let retryInterval = null;

    const setupListener = () => {
      // Try to get socket
      try {
        if (isSocketConnected()) {
          socket = getSocket();
        } else {
          socket = initializeSocket(token);
        }
      } catch (e) {
        socket = initializeSocket(token);
      }

      if (socket && !listenerAttached.current) {
        console.log('[GameInvite] Attaching game-invite listener');
        socket.on('game-invite', handleGameInvite);
        listenerAttached.current = true;
        
        // Clear retry interval once attached
        if (retryInterval) {
          clearInterval(retryInterval);
          retryInterval = null;
        }
      }
    };

    // Try immediately
    setupListener();

    // If not attached, retry every second for 10 seconds
    if (!listenerAttached.current) {
      retryInterval = setInterval(() => {
        if (!listenerAttached.current) {
          setupListener();
        } else {
          clearInterval(retryInterval);
        }
      }, 1000);

      // Stop retrying after 10 seconds
      setTimeout(() => {
        if (retryInterval) {
          clearInterval(retryInterval);
        }
      }, 10000);
    }

    return () => {
      if (retryInterval) clearInterval(retryInterval);
      if (socket && listenerAttached.current) {
        socket.off('game-invite', handleGameInvite);
        listenerAttached.current = false;
      }
    };
  }, [handleGameInvite]);

  const handleAccept = async () => {
    if (!invite) return;
    
    setJoining(true);
    
    // Reset state and setup listeners before joining
    resetState();
    setupListeners();

    // Join the room
    joinRoom(invite.roomCode, (response) => {
      setJoining(false);
      if (response.success) {
        setInvite(null);
        navigate(`/lobby/room/${invite.roomCode}`);
      } else {
        // Show error and clear invite
        alert(response.message || 'Failed to join room');
        setInvite(null);
        removeListeners();
      }
    });
  };

  const handleDecline = () => {
    if (!invite) return;
    
    // Notify the inviter
    const socket = getSocket();
    if (socket) {
      socket.emit('decline-game-invite', { inviterId: invite.from._id });
    }
    
    setInvite(null);
  };

  if (!invite) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 backdrop-blur-sm pointer-events-auto">
      <div className="relative w-full max-w-xs mx-4 animate-bounce-in">
        {/* Glowing background effect */}
        <div className="absolute inset-0 bg-gradient-to-r from-cyan-500 via-primary to-cyan-500 rounded-2xl blur-xl opacity-30 animate-pulse" />
        
        {/* Main Card */}
        <div className="relative bg-gradient-to-b from-slate-800 to-slate-900 border border-cyan-500/50 rounded-2xl overflow-hidden shadow-2xl">
          {/* Animated top border */}
          <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-transparent via-cyan-400 to-transparent" />
          
          {/* Header */}
          <div className="relative px-6 pt-6 pb-4 text-center">
            <div className="inline-flex items-center justify-center w-14 h-14 rounded-full bg-gradient-to-br from-cyan-500/20 to-primary/20 border border-cyan-500/30 mb-3">
              <span className="text-3xl">⚔️</span>
            </div>
            <h3 className="text-sm font-bold text-cyan-400 uppercase tracking-[0.2em]">
              Battle Request
            </h3>
          </div>

          {/* Challenger Info */}
          <div className="px-6 pb-4 text-center">
            <p className="text-2xl font-bold text-white mb-1">
              {invite.from.username}
            </p>
            <p className="text-slate-400 text-sm">challenges you!</p>
          </div>
          
          {/* Game Settings - Compact Pills */}
          <div className="px-6 pb-5">
            <div className="flex justify-center gap-2">
              <span className="px-3 py-1.5 bg-slate-700/50 rounded-full text-xs font-semibold text-slate-300 border border-slate-600">
                Bo{invite.format || 3}
              </span>
              <span className="px-3 py-1.5 bg-slate-700/50 rounded-full text-xs font-semibold text-slate-300 border border-slate-600">
                {invite.digits || 4} Digits
              </span>
              <span className="px-3 py-1.5 bg-slate-700/50 rounded-full text-xs font-semibold text-slate-300 border border-slate-600 capitalize">
                {invite.difficulty || 'easy'}
              </span>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex border-t border-slate-700/50">
            <button
              onClick={handleDecline}
              disabled={joining}
              className="flex-1 py-4 text-slate-400 font-semibold hover:bg-slate-700/50 hover:text-white transition-all disabled:opacity-50 border-r border-slate-700/50"
            >
              Decline
            </button>
            <button
              onClick={handleAccept}
              disabled={joining}
              className="flex-1 py-4 bg-gradient-to-r from-cyan-500 to-primary text-black font-bold hover:from-cyan-400 hover:to-yellow-400 transition-all disabled:opacity-50"
            >
              {joining ? (
                <span className="flex items-center justify-center gap-2">
                  <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                  </svg>
                  Joining
                </span>
              ) : (
                <span className="flex items-center justify-center gap-2">
                  ⚡ Accept
                </span>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default GameInviteNotification;
