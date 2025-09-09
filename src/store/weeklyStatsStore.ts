import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { getWeeklyStats, WeeklyStatsData } from '@services/weeklyStats';
import { useAuthStore } from './authStore';

interface WeeklyStatsState {
  sessions: number;
  accuracy: number;
  time_spent_hours: number;
  time_spent_minutes: number;
  time_spent_formatted: string;
  isLoading: boolean;
  error: string | null;
  
  // Actions
  fetchWeeklyStats: () => Promise<void>;
  setWeeklyStats: (statsData: WeeklyStatsData) => void;
  clearError: () => void;
}

export const useWeeklyStatsStore = create<WeeklyStatsState>()(
  persist(
    (set, get) => ({
      sessions: 0,
      accuracy: 0,
      time_spent_hours: 0,
      time_spent_minutes: 0,
      time_spent_formatted: '0h 0m',
      isLoading: false,
      error: null,

      fetchWeeklyStats: async () => {
        const authToken = useAuthStore.getState().authToken;
        if (!authToken) {
          set({ error: 'No authentication token' });
          return;
        }

        set({ isLoading: true, error: null });
        try {
          const response = await getWeeklyStats(authToken);
          if (response.success) {
            set({
              sessions: response.data.sessions,
              accuracy: response.data.accuracy,
              time_spent_hours: response.data.time_spent_hours,
              time_spent_minutes: response.data.time_spent_minutes,
              time_spent_formatted: response.data.time_spent_formatted,
              isLoading: false,
              error: null,
            });
          } else {
            set({
              isLoading: false,
              error: 'Failed to fetch weekly stats',
            });
          }
        } catch (error) {
          console.error('Error fetching weekly stats:', error);
          set({
            isLoading: false,
            error: error instanceof Error ? error.message : 'Failed to fetch weekly stats',
          });
        }
      },

      setWeeklyStats: (statsData: WeeklyStatsData) => {
        set({
          sessions: statsData.sessions,
          accuracy: statsData.accuracy,
          time_spent_hours: statsData.time_spent_hours,
          time_spent_minutes: statsData.time_spent_minutes,
          time_spent_formatted: statsData.time_spent_formatted,
        });
      },

      clearError: () => {
        set({ error: null });
      },
    }),
    {
      name: 'weekly-stats-storage',
      partialize: (state) => ({
        sessions: state.sessions,
        accuracy: state.accuracy,
        time_spent_hours: state.time_spent_hours,
        time_spent_minutes: state.time_spent_minutes,
        time_spent_formatted: state.time_spent_formatted,
      }),
    }
  )
);
