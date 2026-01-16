import { create } from 'zustand';
import api from '../services/api';

const useGameStore = create((set, get) => ({
  match: null,
  guessHistory: [],
  loading: false,
  error: null,
  winner: null,

  // Create a new match
  createMatch: async (matchData) => {
    set({ loading: true, error: null });
    try {
      const response = await api.post('/matches', matchData);
      set({
        match: response.data,
        guessHistory: [],
        loading: false,
        winner: null,
      });
      return response.data;
    } catch (error) {
      const errorMessage = error.response?.data?.message || 'Failed to create match';
      set({ error: errorMessage, loading: false });
      throw new Error(errorMessage);
    }
  },

  // Make a guess
  makeGuess: async (guess) => {
    const { match } = get();
    if (!match) {
      throw new Error('No active match');
    }

    set({ loading: true, error: null });
    try {
      const response = await api.post(`/matches/${match._id}/guess`, { guess });
      const { match: updatedMatch, result, isWin } = response.data;

      set({
        match: updatedMatch,
        guessHistory: [...get().guessHistory, { guess, ...result }],
        loading: false,
        winner: isWin ? 'You' : null,
      });

      return response.data;
    } catch (error) {
      const errorMessage = error.response?.data?.message || 'Failed to make guess';
      set({ error: errorMessage, loading: false });
      throw new Error(errorMessage);
    }
  },

  // Get match by ID
  getMatch: async (matchId) => {
    set({ loading: true, error: null });
    try {
      const response = await api.get(`/matches/${matchId}`);
      set({
        match: response.data,
        guessHistory: response.data.guessHistory || [],
        loading: false,
      });
      return response.data;
    } catch (error) {
      const errorMessage = error.response?.data?.message || 'Failed to fetch match';
      set({ error: errorMessage, loading: false });
      throw new Error(errorMessage);
    }
  },

  // Reset game state
  resetGame: () => {
    set({
      match: null,
      guessHistory: [],
      loading: false,
      error: null,
      winner: null,
    });
  },

  // Clear error
  clearError: () => set({ error: null }),
}));

export default useGameStore;
