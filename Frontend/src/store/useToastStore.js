import { create } from 'zustand';

/**
 * Toast Store - Cyber Toast notification system
 * Manages toast notifications with auto-dismiss functionality
 */
const useToastStore = create((set, get) => ({
  toasts: [],

  /**
   * Add a new toast notification
   * @param {string} message - Toast message
   * @param {'success'|'error'|'info'|'warning'} type - Toast type
   */
  addToast: (message, type = 'info') => {
    const id = Date.now();
    
    set((state) => ({
      toasts: [...state.toasts, { id, message, type }],
    }));

    // Auto-remove after 3 seconds
    setTimeout(() => {
      get().removeToast(id);
    }, 3000);
  },

  /**
   * Remove a specific toast by ID
   * @param {number} id - Toast ID to remove
   */
  removeToast: (id) => {
    set((state) => ({
      toasts: state.toasts.filter((toast) => toast.id !== id),
    }));
  },

  /**
   * Clear all toasts
   */
  clearAllToasts: () => {
    set({ toasts: [] });
  },
}));

export default useToastStore;
