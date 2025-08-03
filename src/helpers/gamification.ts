import { useAchievementStore } from '@store/achievementStore';
import { useCoinsStore } from '@store/coinsStore';
import { useStreakStore } from '@store/streakStore';
import { LevelProgress } from '@interfaces/apis/teacher';

export interface ProgressStats {
  totalLevels: number;
  completedLevels: number;
  totalClasses: number;
  completedClasses: number;
  averageScore: number;
  overallProgress: number;
}

export const useGamification = () => {
  const { unlockAchievement, isAchievementUnlocked } = useAchievementStore();
  const { addCoins } = useCoinsStore();
  const { incrementStreak } = useStreakStore();

  const calculateProgressStats = (progress: LevelProgress[]): ProgressStats => {
    const totalLevels = progress.length;
    const completedLevels = progress.filter(level => 
      level.FinalTest > 0 && level.OralTest > 0
    ).length;
    
    const totalClasses = progress.reduce((sum, level) => sum + level.classes.length, 0);
    const completedClasses = progress.reduce((sum, level) => 
      sum + level.classes.filter(cls => cls.Test > 0).length, 0
    );
    
    const averageScore = progress.reduce((sum, level) => 
      sum + (level.FinalTest + level.OralTest) / 2, 0
    ) / totalLevels || 0;
    
    const overallProgress = (completedLevels / totalLevels) * 100;
    
    return {
      totalLevels,
      completedLevels,
      totalClasses,
      completedClasses,
      averageScore: Math.round(averageScore),
      overallProgress: Math.round(overallProgress),
    };
  };

  const checkAndUnlockAchievements = (progressStats: ProgressStats) => {
    // Check level completion achievements
    if (progressStats.completedLevels >= 1 && !isAchievementUnlocked('first-level')) {
      unlockAchievement('first-level');
      addCoins(50);
      incrementStreak();
    }
    
    if (progressStats.completedLevels >= 3 && !isAchievementUnlocked('three-levels')) {
      unlockAchievement('three-levels');
      addCoins(100);
      incrementStreak();
    }
    
    if (progressStats.averageScore >= 80 && !isAchievementUnlocked('high-scorer')) {
      unlockAchievement('high-scorer');
      addCoins(150);
      incrementStreak();
    }
    
    if (progressStats.overallProgress >= 50 && !isAchievementUnlocked('halfway')) {
      unlockAchievement('halfway');
      addCoins(200);
      incrementStreak();
    }
    
    if (progressStats.overallProgress >= 75 && !isAchievementUnlocked('almost-there')) {
      unlockAchievement('almost-there');
      addCoins(300);
      incrementStreak();
    }
    
    if (progressStats.overallProgress >= 100 && !isAchievementUnlocked('champion')) {
      unlockAchievement('champion');
      addCoins(500);
      incrementStreak();
    }
  };

  const checkTestScoreAchievements = (score: number) => {
    if (score >= 100 && !isAchievementUnlocked('perfect-score')) {
      unlockAchievement('perfect-score');
      addCoins(100);
      incrementStreak();
    } else if (score >= 90 && !isAchievementUnlocked('excellent-score')) {
      unlockAchievement('excellent-score');
      addCoins(75);
      incrementStreak();
    } else if (score >= 80 && !isAchievementUnlocked('great-score')) {
      unlockAchievement('great-score');
      addCoins(50);
      incrementStreak();
    } else if (score >= 70 && !isAchievementUnlocked('good-score')) {
      unlockAchievement('good-score');
      addCoins(25);
      incrementStreak();
    }
  };

  const getMotivationalMessage = (progressStats: ProgressStats): string => {
    if (progressStats.overallProgress >= 100) {
      return "🎉 Congratulations! You've completed all levels. You're a true champion!";
    }
    
    if (progressStats.overallProgress >= 75) {
      return "🚀 You're almost there! Just a few more levels to complete your journey!";
    }
    
    if (progressStats.overallProgress >= 50) {
      return "🎯 Great progress! You're halfway through your learning journey!";
    }
    
    if (progressStats.completedLevels >= 3) {
      return "🌟 You're building momentum! Keep up the excellent work!";
    }
    
    if (progressStats.completedLevels >= 1) {
      return "⭐ Great start! Your learning journey has begun!";
    }
    
    return "🎓 Ready to begin your learning adventure? Let's get started!";
  };

  const getNextGoal = (progressStats: ProgressStats) => {
    if (progressStats.overallProgress >= 100) {
      return {
        title: 'Master Achieved!',
        description: 'You\'ve completed all levels. Keep practicing to maintain your skills!',
        progress: 100,
        target: 'Maintain Excellence',
      };
    }
    
    if (progressStats.overallProgress >= 75) {
      return {
        title: 'Complete the Journey',
        description: 'Just a few more levels to go!',
        progress: progressStats.overallProgress,
        target: '100% Completion',
      };
    }
    
    if (progressStats.overallProgress >= 50) {
      return {
        title: 'Reach 75%',
        description: 'You\'re doing great! Keep pushing forward.',
        progress: progressStats.overallProgress,
        target: '75% Completion',
      };
    }
    
    return {
      title: 'Reach 50%',
      description: 'Complete half of your levels to unlock new achievements!',
      progress: progressStats.overallProgress,
      target: '50% Completion',
    };
  };

  return {
    calculateProgressStats,
    checkAndUnlockAchievements,
    checkTestScoreAchievements,
    getMotivationalMessage,
    getNextGoal,
  };
}; 