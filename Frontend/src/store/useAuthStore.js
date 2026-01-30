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
          const { token, ...user } = response.data;

          localStorage.setItem('token', token);
          
          // Initialize socket with token
          initializeSocket(token);
          connectSocket();

          set({
            user,
            token,
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
          const { token, ...user } = response.data;

          localStorage.setItem('token', token);
          
          // Initialize socket with token
          initializeSocket(token);
          connectSocket();

          set({
            user,
            token,
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
    }),
    {
      name: 'auth-storage',
      partialize: (state) => ({
        user: state.user,
        token: state.token,
        isAuthenticated: state.isAuthenticated,
      }),
    }
  )
);

export default useAuthStore;
