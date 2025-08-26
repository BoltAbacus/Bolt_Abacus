import { useAchievementStore } from '@store/achievementStore';
import { useCoinsStore } from '@store/coinsStore';
import { useStreakStore } from '@store/streakStore';
import { useAuthStore } from '@store/authStore';
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
    
    // Previously returned a mid-milestone. We now skip the 50% CTA and move to the next objective.
    if (progressStats.overallProgress < 75) {
      return {
        title: 'Reach 75%',
        description: 'Push to 75% completion for a major milestone!',
        progress: progressStats.overallProgress,
        target: '75% Completion',
      };
    }

    return {
      title: 'Complete the Journey',
      description: 'You are close! Finish the remaining progress to complete your journey.',
      progress: progressStats.overallProgress,
      target: '100% Completion',
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

export const awardCoinsForQuizCompletion = (score: number) => {
  const { addCoins } = useCoinsStore.getState();
  const { updateStreak } = useStreakStore.getState();
  
  // Base coins for completion
  let coins = 10;
  
  // Bonus coins for high score
  if (score >= 90) {
    coins += 20;
  } else if (score >= 80) {
    coins += 15;
  } else if (score >= 70) {
    coins += 10;
  } else if (score >= 60) {
    coins += 5;
  }
  
  addCoins(coins);
  updateStreak();
  
  return coins;
};

export const awardCoinsForPracticeCompletion = (problemsSolved: number, timeSpent: number) => {
  const { addCoins } = useCoinsStore.getState();
  const { updateStreak } = useStreakStore.getState();
  
  // Base coins for practice
  let coins = 5;
  
  // Bonus for problems solved
  coins += Math.floor(problemsSolved / 5) * 2;
  
  // Bonus for time spent (efficiency bonus)
  if (timeSpent > 0) {
    const efficiency = problemsSolved / (timeSpent / 60); // problems per minute
    if (efficiency > 2) {
      coins += 5;
    } else if (efficiency > 1) {
      coins += 3;
    }
  }
  
  addCoins(coins);
  updateStreak();
  
  return coins;
};

export const awardCoinsForLevelCompletion = (levelId: number) => {
  const { addCoins } = useCoinsStore.getState();
  const { updateStreak } = useStreakStore.getState();
  
  // More coins for higher levels
  const coins = 15 + (levelId * 5);
  
  addCoins(coins);
  updateStreak();
  
  return coins;
};

export const awardCoinsForDailyLogin = () => {
  const { addCoins } = useCoinsStore.getState();
  const { updateStreak } = useStreakStore.getState();
  
  const coins = 10;
  
  addCoins(coins);
  updateStreak();
  
  return coins;
};

export const awardCoinsForAchievement = (achievementId: number) => {
  const { addCoins } = useCoinsStore.getState();
  const { updateStreak } = useStreakStore.getState();
  
  // Different coins for different achievements
  const achievementCoins = {
    1: 50,  // First Quiz
    2: 100, // Perfect Score
    3: 75,  // Speed Demon
    4: 200, // Streak Master
    5: 150, // Practice Makes Perfect
  };
  
  const coins = achievementCoins[achievementId as keyof typeof achievementCoins] || 25;
  
  addCoins(coins);
  updateStreak();
  
  return coins;
};

export const awardCoinsForLeaderboardRank = (rank: number) => {
  const { addCoins } = useCoinsStore.getState();
  const { updateStreak } = useStreakStore.getState();
  
  // More coins for higher ranks
  const rankCoins = {
    1: 100,
    2: 75,
    3: 50,
    4: 25,
    5: 15,
  };
  
  const coins = rankCoins[rank as keyof typeof rankCoins] || 5;
  
  addCoins(coins);
  updateStreak();
  
  return coins;
};

export const awardCoinsForGameWin = (gameType: string, difficulty: string) => {
  const { addCoins } = useCoinsStore.getState();
  const { updateStreak } = useStreakStore.getState();
  
  let coins = 20; // Base coins for winning
  
  // Bonus for difficulty
  if (difficulty === 'hard') {
    coins += 15;
  } else if (difficulty === 'medium') {
    coins += 10;
  }
  
  // Bonus for game type
  if (gameType === 'tournament') {
    coins += 25;
  } else if (gameType === 'team') {
    coins += 15;
  }
  
  addCoins(coins);
  updateStreak();
  
  return coins;
};

export const awardCoinsForPerfectGame = () => {
  const { addCoins } = useCoinsStore.getState();
  const { updateStreak } = useStreakStore.getState();
  
  const coins = 50; // Bonus for perfect game
  
  addCoins(coins);
  updateStreak();
  
  return coins;
}; 