import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import api from '../services/api';
import { initializeSocket, destroySocket, connectSocket } from '../services/socket';

const useAuthStore = create(
  persist(
    (set, get) => ({
      user: null,
      token: null,
      isAuthenticated: false,
      loading: false,
      error: null,
      lastRefresh: null,

      // Register user
      register: async (userData) => {
        set({ loading: true, error: null });
        try {
          const response = await api.post('/auth/register', userData);
          const { accessToken, ...user } = response.data;

          localStorage.setItem('token', accessToken);
          
          // Initialize socket with token
          initializeSocket(accessToken);
          connectSocket();

          set({
            user,
            token: accessToken,
            isAuthenticated: true,
            loading: false,
            lastRefresh: Date.now()
          });

          // Start periodic token refresh
          get().startPeriodicRefresh();

          return response.data;
        } catch (error) {
          const errorMessage = error.response?.data?.message || 'Registration failed';
          set({ error: errorMessage, loading: false });
          throw new Error(errorMessage);
        }
      },

      // Login user
      login: async (credentials) => {
        set({ loading: true, error: null });
        try {
          const response = await api.post('/auth/login', credentials);
          const { accessToken, ...user } = response.data;

          // Validate token before storing
          if (!accessToken || typeof accessToken !== 'string' || !accessToken.startsWith('eyJ')) {
            throw new Error('Invalid token received from server');
          }
          
          localStorage.setItem('token', accessToken);
          
          // Initialize socket with token
          initializeSocket(accessToken);
          connectSocket();

          set({
            user,
            token: accessToken,
            isAuthenticated: true,
            loading: false,
            lastRefresh: Date.now()
          });

          // Start periodic token refresh
          get().startPeriodicRefresh();

          return response.data;
        } catch (error) {
          const errorMessage = error.response?.data?.message || 'Login failed';
          set({ error: errorMessage, loading: false });
          throw new Error(errorMessage);
        }
      },

      // Google login
      googleLogin: async (idToken) => {
        set({ loading: true, error: null });
        try {
          const response = await api.post('/auth/google', { idToken });
          const { accessToken, ...user } = response.data;

          if (!accessToken || typeof accessToken !== 'string' || !accessToken.startsWith('eyJ')) {
            throw new Error('Invalid token received from server');
          }

          localStorage.setItem('token', accessToken);

          initializeSocket(accessToken);
          connectSocket();

          set({
            user,
            token: accessToken,
            isAuthenticated: true,
            loading: false,
            lastRefresh: Date.now()
          });

          // Start periodic token refresh
          get().startPeriodicRefresh();

          return response.data;
        } catch (error) {
          const errorMessage = error.response?.data?.message || 'Google login failed';
          set({ error: errorMessage, loading: false });
          throw new Error(errorMessage);
        }
      },

      // Logout user
      logout: () => {
        // Stop periodic refresh
        get().stopPeriodicRefresh();
        
        localStorage.removeItem('token');
        destroySocket();
        set({
          user: null,
          token: null,
          isAuthenticated: false,
          error: null,
          lastRefresh: null
        });
      },

      // Get user profile
      getProfile: async () => {
        set({ loading: true, error: null });
        try {
          const response = await api.get('/auth/profile');
          set({ user: response.data, loading: false });
          return response.data;
        } catch (error) {
          const errorMessage = error.response?.data?.message || 'Failed to fetch profile';
          set({ error: errorMessage, loading: false });
          throw new Error(errorMessage);
        }
      },

      // Refresh access token proactively
      refreshToken: async () => {
        try {
          const response = await api.post('/auth/refresh');
          const { accessToken } = response.data;
          
          if (accessToken) {
            localStorage.setItem('token', accessToken);
            set({ 
              token: accessToken,
              lastRefresh: Date.now()
            });
            
            // Reinitialize socket with new token
            try {
              destroySocket();
              initializeSocket(accessToken);
              connectSocket();
            } catch (err) {
              console.error('Failed to reinitialize socket:', err);
            }
            
            return accessToken;
          }
          throw new Error('No access token returned');
        } catch (error) {
          console.error('Token refresh failed:', error);
          // Don't logout automatically - let the user continue if they have a valid session
          throw error;
        }
      },

      // Periodic token refresh to keep sessions alive on mobile
      startPeriodicRefresh: () => {
        // Refresh token every 10 minutes (access token expires in 15 minutes)
        const refreshInterval = setInterval(async () => {
          const state = get();
          if (state.isAuthenticated) {
            try {
              await get().refreshToken();
            } catch (error) {
              // If refresh fails, user will need to login again
              console.error('Periodic refresh failed:', error);
            }
          }
        }, 10 * 60 * 1000); // 10 minutes

        // Store the interval ID for cleanup
        set({ refreshInterval });
      },

      // Stop periodic refresh
      stopPeriodicRefresh: () => {
        const state = get();
        if (state.refreshInterval) {
          clearInterval(state.refreshInterval);
          set({ refreshInterval: null });
        }
      },

      // Clear error
      clearError: () => set({ error: null }),

      // Initialize auth state from localStorage and validate tokens
      initialize: async () => {
        const token = localStorage.getItem('token');
        
        if (token && token.startsWith('eyJ')) {
          try {
            // Try to validate the token by making a test request
            const response = await api.get('/auth/profile');
            
            if (response.data) {
              set({
                user: response.data,
                token,
                isAuthenticated: true,
                lastRefresh: Date.now()
              });
              
              // Initialize socket if token is valid
              try {
                initializeSocket(token);
                connectSocket();
              } catch (error) {
                console.error('Failed to initialize socket:', error);
              }

              // Start periodic refresh for mobile persistence
              get().startPeriodicRefresh();
              
              return;
            }
          } catch (error) {
            // Token is invalid, try to refresh it
            try {
              await get().refreshToken();
              // Start periodic refresh after successful refresh
              get().startPeriodicRefresh();
              return;
            } catch (refreshError) {
              // Refresh failed, clear everything
              localStorage.removeItem('token');
            }
          }
        }
        
        // No valid token found
        set({
          user: null,
          token: null,
          isAuthenticated: false,
          lastRefresh: null
        });
      },

      // ═══════════════════════════════════════════════════════════
      // FRIEND SYSTEM ACTIONS
      // ═══════════════════════════════════════════════════════════

      // Search users by username or UID
      searchUsers: async (query) => {
        try {
          const response = await api.get(`/friends/search?q=${encodeURIComponent(query)}`);
          return response.data;
        } catch (error) {
          throw new Error(error.response?.data?.message || 'Search failed');
        }
      },

      // Get friends list
      getFriends: async () => {
        try {
          const response = await api.get('/friends');
          return response.data;
        } catch (error) {
          throw new Error(error.response?.data?.message || 'Failed to fetch friends');
        }
      },

      // Get pending friend requests
      getPendingRequests: async () => {
        try {
          const response = await api.get('/friends/requests');
          return response.data;
        } catch (error) {
          throw new Error(error.response?.data?.message || 'Failed to fetch requests');
        }
      },

      // Send friend request
      sendFriendRequest: async (targetUid) => {
        try {
          const response = await api.post('/friends/request', { targetUid });
          return response.data;
        } catch (error) {
          throw new Error(error.response?.data?.message || 'Failed to send request');
        }
      },

      // Accept friend request
      acceptFriendRequest: async (requesterId) => {
        try {
          const response = await api.post('/friends/accept', { requesterId });
          return response.data;
        } catch (error) {
          throw new Error(error.response?.data?.message || 'Failed to accept request');
        }
      },

      // Reject friend request
      rejectFriendRequest: async (requesterId) => {
        try {
          const response = await api.post('/friends/reject', { requesterId });
          return response.data;
        } catch (error) {
          throw new Error(error.response?.data?.message || 'Failed to reject request');
        }
      },

      // Remove friend
      removeFriend: async (friendId) => {
        try {
          const response = await api.delete(`/friends/${friendId}`);
          return response.data;
        } catch (error) {
          throw new Error(error.response?.data?.message || 'Failed to remove friend');
        }
      },

      // Get user by UID
      getUserByUid: async (uid) => {
        try {
          const response = await api.get(`/friends/user/${encodeURIComponent(uid)}`);
          return response.data;
        } catch (error) {
          throw new Error(error.response?.data?.message || 'User not found');
        }
      },

      // Get user profile by MongoDB ID (for opponent profile modal)
      getUserById: async (userId) => {
        try {
          const response = await api.get(`/friends/profile/${encodeURIComponent(userId)}`);
          return response.data;
        } catch (error) {
          throw new Error(error.response?.data?.message || 'User not found');
        }
      },
    }),
    {
      name: 'auth-storage',
      // Only persist user data, NOT the token (token is stored directly in localStorage)
      partialize: (state) => ({
        user: state.user,
        isAuthenticated: state.isAuthenticated,
      }),
    }
  )
);

export default useAuthStore;
