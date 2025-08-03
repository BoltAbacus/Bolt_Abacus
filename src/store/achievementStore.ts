import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export interface Achievement {
  id: string;
  title: string;
  description: string;
  icon: string;
  color: string;
  bgColor: string;
  unlockedAt: Date | null;
  coinsReward: number;
  streakReward: number;
}

interface AchievementState {
  achievements: Achievement[];
  unlockedAchievements: string[];
  addAchievement: (achievement: Achievement) => void;
  unlockAchievement: (achievementId: string) => void;
  isAchievementUnlocked: (achievementId: string) => boolean;
  getUnlockedAchievements: () => Achievement[];
  resetAchievements: () => void;
}

const defaultAchievements: Achievement[] = [
  {
    id: 'first-level',
    title: 'First Steps',
    description: 'Completed your first level!',
    icon: 'FaStar',
    color: 'text-yellow-400',
    bgColor: 'bg-yellow-400/10',
    unlockedAt: null,
    coinsReward: 50,
    streakReward: 1,
  },
  {
    id: 'three-levels',
    title: 'Getting Stronger',
    description: 'Completed 3 levels!',
    icon: 'FaMedal',
    color: 'text-blue-400',
    bgColor: 'bg-blue-400/10',
    unlockedAt: null,
    coinsReward: 100,
    streakReward: 2,
  },
  {
    id: 'high-scorer',
    title: 'High Achiever',
    description: 'Maintaining excellent scores!',
    icon: 'FaTrophy',
    color: 'text-purple-400',
    bgColor: 'bg-purple-400/10',
    unlockedAt: null,
    coinsReward: 150,
    streakReward: 3,
  },
  {
    id: 'halfway',
    title: 'Halfway There!',
    description: 'Completed 50% of your journey!',
    icon: 'BiTargetLock',
    color: 'text-green-400',
    bgColor: 'bg-green-400/10',
    unlockedAt: null,
    coinsReward: 200,
    streakReward: 5,
  },
  {
    id: 'almost-there',
    title: 'Almost There!',
    description: '75% complete - you\'re almost done!',
    icon: 'FaRocket',
    color: 'text-orange-400',
    bgColor: 'bg-orange-400/10',
    unlockedAt: null,
    coinsReward: 300,
    streakReward: 7,
  },
  {
    id: 'champion',
    title: 'Champion!',
    description: 'Completed all levels!',
    icon: 'FaCrown',
    color: 'text-yellow-500',
    bgColor: 'bg-yellow-500/10',
    unlockedAt: null,
    coinsReward: 500,
    streakReward: 10,
  },
  {
    id: 'perfect-score',
    title: 'Perfect Score!',
    description: 'Achieved 100% on a test!',
    icon: 'FaCrown',
    color: 'text-yellow-500',
    bgColor: 'bg-yellow-500/10',
    unlockedAt: null,
    coinsReward: 100,
    streakReward: 2,
  },
  {
    id: 'excellent-score',
    title: 'Excellent!',
    description: 'Achieved 90%+ on a test!',
    icon: 'FaTrophy',
    color: 'text-purple-400',
    bgColor: 'bg-purple-400/10',
    unlockedAt: null,
    coinsReward: 75,
    streakReward: 1,
  },
  {
    id: 'great-score',
    title: 'Great Job!',
    description: 'Achieved 80%+ on a test!',
    icon: 'FaMedal',
    color: 'text-blue-400',
    bgColor: 'bg-blue-400/10',
    unlockedAt: null,
    coinsReward: 50,
    streakReward: 1,
  },
  {
    id: 'good-score',
    title: 'Good Work!',
    description: 'Achieved 70%+ on a test!',
    icon: 'FaStar',
    color: 'text-green-400',
    bgColor: 'bg-green-400/10',
    unlockedAt: null,
    coinsReward: 25,
    streakReward: 1,
  },
];

export const useAchievementStore = create<AchievementState>()(
  persist(
    (set, get) => ({
      achievements: defaultAchievements,
      unlockedAchievements: [],

      addAchievement: (achievement: Achievement) => {
        const { achievements } = get();
        if (!achievements.find(a => a.id === achievement.id)) {
          set({ achievements: [...achievements, achievement] });
        }
      },

      unlockAchievement: (achievementId: string) => {
        const { unlockedAchievements, achievements } = get();
        if (!unlockedAchievements.includes(achievementId)) {
          const achievement = achievements.find(a => a.id === achievementId);
          if (achievement) {
            achievement.unlockedAt = new Date();
            set({ 
              unlockedAchievements: [...unlockedAchievements, achievementId],
              achievements: achievements.map(a => 
                a.id === achievementId ? { ...a, unlockedAt: new Date() } : a
              )
            });
          }
        }
      },

      isAchievementUnlocked: (achievementId: string) => {
        const { unlockedAchievements } = get();
        return unlockedAchievements.includes(achievementId);
      },

      getUnlockedAchievements: () => {
        const { achievements, unlockedAchievements } = get();
        return achievements.filter(a => unlockedAchievements.includes(a.id));
      },

      resetAchievements: () => {
        set({ 
          unlockedAchievements: [],
          achievements: defaultAchievements.map(a => ({ ...a, unlockedAt: null }))
        });
      },
    }),
    {
      name: 'achievement-storage',
    }
  )
); 