import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { getUserStreak, updateUserStreak, resetUserStreak, StreakData } from '@services/streak';
import { useAuthStore } from './authStore';
import { GET_USER_STREAK_ENDPOINT, UPDATE_USER_STREAK_ENDPOINT } from '@constants/routes';

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
        console.log('🔄 [Streak Store] Starting streak fetch...', {
          hasAuthToken: !!authToken,
          timestamp: new Date().toISOString()
        });

        if (!authToken) {
          console.warn('⚠️ [Streak Store] No authentication token');
          set({ error: 'No authentication token' });
          return;
        }

        set({ isLoading: true, error: null });
        try {
          console.log('📡 [Streak Store] Making API request to:', GET_USER_STREAK_ENDPOINT);
          const streakData = await getUserStreak(authToken);
          console.log('✅ [Streak Store] Streak data received:', {
            currentStreak: streakData.currentStreak,
            maxStreak: streakData.maxStreak,
            lastActivityDate: streakData.lastActivityDate,
            timestamp: new Date().toISOString()
          });

          set({
            currentStreak: streakData.currentStreak,
            maxStreak: streakData.maxStreak,
            lastActivityDate: streakData.lastActivityDate,
            isLoading: false,
            error: null,
          });
          console.log('✅ [Streak Store] State updated successfully');
        } catch (error) {
          console.error('❌ [Streak Store] Error fetching streak:', {
            error,
            isAxiosError: error instanceof Error,
            status: error instanceof Error && 'response' in error ? error.response?.status : 'unknown',
            message: error instanceof Error ? error.message : 'Unknown error',
            responseData: error instanceof Error && 'response' in error ? error.response?.data : null,
            timestamp: new Date().toISOString()
          });

          set({
            isLoading: false,
            error: error instanceof Error ? error.message : 'Failed to fetch streak',
          });
        }
      },

      updateStreak: async () => {
        const authToken = useAuthStore.getState().authToken;
        console.log('🔄 [Streak Store] Starting streak update...', {
          hasAuthToken: !!authToken,
          timestamp: new Date().toISOString()
        });

        if (!authToken) {
          console.warn('⚠️ [Streak Store] No authentication token for update');
          set({ error: 'No authentication token' });
          return;
        }

        set({ isLoading: true, error: null });
        try {
          console.log('📡 [Streak Store] Making API request to:', UPDATE_USER_STREAK_ENDPOINT);
          const streakData = await updateUserStreak(authToken);
          console.log('✅ [Streak Store] Streak update successful:', {
            currentStreak: streakData.currentStreak,
            maxStreak: streakData.maxStreak,
            lastActivityDate: streakData.lastActivityDate,
            streakUpdated: streakData.streakUpdated,
            newStreak: streakData.newStreak,
            timestamp: new Date().toISOString()
          });

          set({
            currentStreak: streakData.currentStreak,
            maxStreak: streakData.maxStreak,
            lastActivityDate: streakData.lastActivityDate,
            isLoading: false,
            error: null,
          });
          console.log('✅ [Streak Store] State updated successfully');
        } catch (error) {
          console.error('❌ [Streak Store] Error updating streak:', {
            error,
            isAxiosError: error instanceof Error,
            status: error instanceof Error && 'response' in error ? error.response?.status : 'unknown',
            message: error instanceof Error ? error.message : 'Unknown error',
            responseData: error instanceof Error && 'response' in error ? error.response?.data : null,
            timestamp: new Date().toISOString()
          });

          set({
            isLoading: false,
            error: error instanceof Error ? error.message : 'Failed to update streak',
          });
        }
      },

      resetStreak: async () => {
        const authToken = useAuthStore.getState().authToken;
        if (!authToken) {
          console.warn('⚠️ [Streak Store] No authentication token for reset');
          set({ error: 'No authentication token' });
          return;
        }

        console.log('🔄 [Streak Store] Starting streak reset...');
        set({ isLoading: true, error: null });
        try {
          const streakData = await resetUserStreak(authToken);
          console.log('✅ [Streak Store] Streak reset successful:', streakData);
          set({
            currentStreak: streakData.currentStreak,
            maxStreak: streakData.maxStreak,
            lastActivityDate: streakData.lastActivityDate,
            isLoading: false,
            error: null,
          });
        } catch (error) {
          console.error('❌ [Streak Store] Error resetting streak:', error);
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