import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import api from '../services/api';
import { initializeSocket, destroySocket, connectSocket } from '../services/socket';

const useAuthStore = create(
  persist(
    (set) => ({
      user: null,
      token: null,
      isAuthenticated: false,
      loading: false,
      error: null,

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
          });

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
          });

          return response.data;
        } catch (error) {
          const errorMessage = error.response?.data?.message || 'Login failed';
          set({ error: errorMessage, loading: false });
          throw new Error(errorMessage);
        }
      },

      // Logout user
      logout: () => {
        localStorage.removeItem('token');
        destroySocket();
        set({
          user: null,
          token: null,
          isAuthenticated: false,
          error: null,
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

      // Clear error
      clearError: () => set({ error: null }),

      // Initialize auth state from localStorage
      initialize: () => {
        const token = localStorage.getItem('token');
        if (token) {
          set({
            token,
            isAuthenticated: true,
          });
          // Initialize socket if token exists
          try {
            initializeSocket(token);
            connectSocket();
          } catch (error) {
            console.error('Failed to initialize socket:', error);
          }
        }
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
