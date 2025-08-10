import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export interface GoalItem {
  id: number;
  text: string;
  completed: boolean;
  createdAt: Date;
}

interface GoalsState {
  goals: GoalItem[];
  sessionsCompleted: number;
  totalSessions: number;
  addGoal: (text: string) => void;
  toggleGoal: (id: number) => void;
  deleteGoal: (id: number) => void;
  clearCompleted: () => void;
  getCompletedCount: () => number;
  getTotalCount: () => number;
  markSessionCompleted: () => void;
  setTotalSessions: (total: number) => void;
  resetSessions: () => void;
}

export const useGoalsStore = create<GoalsState>()(
  persist(
    (set, get) => ({
      goals: [
        // Pre-populate with a few sensible defaults; users can add more
        { id: 1, text: "Complete 1 practice session", completed: false, createdAt: new Date() },
        { id: 2, text: "Take 1 quiz", completed: false, createdAt: new Date() },
        { id: 3, text: "Review flashcards", completed: false, createdAt: new Date() },
      ],
      sessionsCompleted: 0,
      totalSessions: 1,

      addGoal: (text: string) => {
        const { goals } = get();
        const newGoal: GoalItem = {
          id: Date.now(),
          text: text.trim(),
          completed: false,
          createdAt: new Date(),
        };
        set({ goals: [...goals, newGoal] });
      },

      toggleGoal: (id: number) => {
        const { goals } = get();
        set({
          goals: goals.map((g) => (g.id === id ? { ...g, completed: !g.completed } : g)),
        });
      },

      deleteGoal: (id: number) => {
        const { goals } = get();
        set({ goals: goals.filter((g) => g.id !== id) });
      },

      clearCompleted: () => {
        const { goals } = get();
        set({ goals: goals.filter((g) => !g.completed) });
      },

      getCompletedCount: () => {
        const { goals } = get();
        return goals.filter((g) => g.completed).length;
      },

      getTotalCount: () => {
        const { goals } = get();
        return goals.length;
      },

      markSessionCompleted: () => {
        const { sessionsCompleted, totalSessions } = get();
        const next = Math.min(sessionsCompleted + 1, Math.max(totalSessions, 0));
        set({ sessionsCompleted: next });
      },

      setTotalSessions: (total: number) => {
        const safe = Math.max(0, Math.floor(total));
        set({ totalSessions: safe });
      },

      resetSessions: () => {
        set({ sessionsCompleted: 0 });
      },
    }),
    {
      name: 'goals-storage',
      partialize: (state) => ({ goals: state.goals, sessionsCompleted: state.sessionsCompleted, totalSessions: state.totalSessions }),
    }
  )
);


