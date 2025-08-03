import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface StreakState {
  currentStreak: number;
  lastActivityDate: string | null;
  maxStreak: number;
  incrementStreak: () => void;
  resetStreak: () => void;
  checkAndUpdateStreak: () => void;
}

export const useStreakStore = create<StreakState>()(
  persist(
    (set, get) => ({
      currentStreak: 0,
      lastActivityDate: null,
      maxStreak: 0,

      incrementStreak: () => {
        const today = new Date().toDateString();
        const { currentStreak, maxStreak, lastActivityDate } = get();
        
        // Only increment if we haven't already incremented today
        if (lastActivityDate !== today) {
          const newStreak = currentStreak + 1;
          set({
            currentStreak: newStreak,
            lastActivityDate: today,
            maxStreak: Math.max(maxStreak, newStreak),
          });
        }
      },

      resetStreak: () => {
        set({
          currentStreak: 0,
          lastActivityDate: null,
        });
      },

      checkAndUpdateStreak: () => {
        const today = new Date().toDateString();
        const { lastActivityDate, currentStreak } = get();

        if (!lastActivityDate) {
          // First time user
          set({
            currentStreak: 1,
            lastActivityDate: today,
            maxStreak: 1,
          });
          return;
        }

        const lastDate = new Date(lastActivityDate);
        const currentDate = new Date(today);
        const diffTime = currentDate.getTime() - lastDate.getTime();
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

        if (diffDays === 1) {
          // Consecutive day
          const newStreak = currentStreak + 1;
          set({
            currentStreak: newStreak,
            lastActivityDate: today,
            maxStreak: Math.max(get().maxStreak, newStreak),
          });
        } else if (diffDays > 1) {
          // Streak broken
          set({
            currentStreak: 1,
            lastActivityDate: today,
          });
        }
        // If diffDays === 0, same day, do nothing
      },
    }),
    {
      name: 'streak-storage',
    }
  )
); 