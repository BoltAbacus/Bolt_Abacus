import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { getUserStreak, updateUserStreak, resetUserStreak, StreakData } from '@services/streak';
import { useAuthStore } from './authStore';

interface StreakState {
  currentStreak: number;
  maxStreak: number;
  lastActivityDate: string | null;
  isLoading: boolean;
  error: string | null;
  
  // Actions
  fetchStreak: () => Promise<void>;
  updateStreak: () => Promise<void>;
  resetStreak: () => Promise<void>;
  setStreak: (streakData: StreakData) => void;
  clearError: () => void;
}

export const useStreakStore = create<StreakState>()(
  persist(
    (set, get) => ({
      currentStreak: 0,
      maxStreak: 0,
      lastActivityDate: null,
      isLoading: false,
      error: null,

      fetchStreak: async () => {
        const authToken = useAuthStore.getState().authToken;
        if (!authToken) {
          set({ error: 'No authentication token' });
          return;
        }

        set({ isLoading: true, error: null });
        try {
          const streakData = await getUserStreak(authToken);
          set({
            currentStreak: streakData.currentStreak,
            maxStreak: streakData.maxStreak,
            lastActivityDate: streakData.lastActivityDate,
            isLoading: false,
            error: null,
          });
        } catch (error) {
          console.error('Error fetching streak:', error);
          set({
            isLoading: false,
            error: error instanceof Error ? error.message : 'Failed to fetch streak',
          });
        }
      },

      updateStreak: async () => {
        const authToken = useAuthStore.getState().authToken;
        if (!authToken) {
          set({ error: 'No authentication token' });
          return;
        }

        set({ isLoading: true, error: null });
        try {
          const streakData = await updateUserStreak(authToken);
          set({
            currentStreak: streakData.currentStreak,
            maxStreak: streakData.maxStreak,
            lastActivityDate: streakData.lastActivityDate,
            isLoading: false,
            error: null,
          });
        } catch (error) {
          console.error('Error updating streak:', error);
          set({
            isLoading: false,
            error: error instanceof Error ? error.message : 'Failed to update streak',
          });
        }
      },

      resetStreak: async () => {
        const authToken = useAuthStore.getState().authToken;
        if (!authToken) {
          set({ error: 'No authentication token' });
          return;
        }

        set({ isLoading: true, error: null });
        try {
          const streakData = await resetUserStreak(authToken);
          set({
            currentStreak: streakData.currentStreak,
            maxStreak: streakData.maxStreak,
            lastActivityDate: streakData.lastActivityDate,
            isLoading: false,
            error: null,
          });
        } catch (error) {
          console.error('Error resetting streak:', error);
          set({
            isLoading: false,
            error: error instanceof Error ? error.message : 'Failed to reset streak',
          });
        }
      },

      setStreak: (streakData: StreakData) => {
        set({
          currentStreak: streakData.currentStreak,
          maxStreak: streakData.maxStreak,
          lastActivityDate: streakData.lastActivityDate,
        });
      },

      clearError: () => {
        set({ error: null });
      },
    }),
    {
      name: 'streak-storage',
      partialize: (state) => ({
        currentStreak: state.currentStreak,
        maxStreak: state.maxStreak,
        lastActivityDate: state.lastActivityDate,
      }),
    }
  )
); 