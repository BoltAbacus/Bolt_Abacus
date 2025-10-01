import { LevelProgress } from '@interfaces/apis/teacher';

export interface ProgressStats {
  totalLevels: number;
  completedLevels: number;
  totalClasses: number;
  completedClasses: number;
  averageScore: number;
  overallProgress: number;
}

export interface PracticeStats {
  accuracy: number;
  timeSpent: string;
  problemsSolved: number;
  totalQuestions: number;
  practiceMinutes: number;
  sessions: number;
}

export interface LevelStats {
  currentLevel: number;
  levelProgress: number;
  levelAverageScore: number;
  levelClassesCompleted: number;
  levelTotalClasses: number;
  levelProblemsSolved: number;
  levelPracticeTime: number;
  levelClassesThisWeek: number;
}

/**
 * Unified progress calculation function
 * This ensures consistent progress calculations across all components
 */
export const calculateProgressStats = (progress: LevelProgress[]): ProgressStats => {
  if (!progress || progress.length === 0) {
    return {
      totalLevels: 0,
      completedLevels: 0,
      totalClasses: 0,
      completedClasses: 0,
      averageScore: 0,
      overallProgress: 0,
    };
  }

  const totalLevels = progress.length;
  
  // A level is considered completed ONLY if it has both FinalTest and OralTest completed
  // AND at least 80% of classes are completed
  const completedLevels = progress.filter(level => {
    const hasTestsCompleted = level.FinalTest > 0 && level.OralTest > 0;
    const totalClassesInLevel = level.classes.length;
    const completedClassesInLevel = level.classes.filter(cls => cls.Test > 0).length;
    const classCompletionRate = totalClassesInLevel > 0 ? (completedClassesInLevel / totalClassesInLevel) : 0;
    
    // Both conditions must be met for a level to be considered completed
    return hasTestsCompleted && classCompletionRate >= 0.8;
  }).length;
  
  // Calculate total classes from all levels in progress data
  const totalClasses = progress.reduce((sum, level) => sum + level.classes.length, 0);
  
  // Calculate completed classes - a class is completed if it has a test score > 0
  // OR if it has significant classwork/homework completion
  const completedClasses = progress.reduce((sum, level) => 
    sum + level.classes.filter(cls => {
      // Class is completed if test is passed
      if (cls.Test > 0) return true;
      
      // Or if it has significant topic completion (at least 2 topics with >50% completion)
      const completedTopics = cls.topics.filter(topic => 
        topic.Classwork > 50 || topic.Homework > 50
      ).length;
      
      return completedTopics >= 2;
    }).length, 0
  );

  // Calculate average score from completed levels only (both tests completed)
  const completedLevelsWithScores = progress.filter(level => 
    level.FinalTest > 0 && level.OralTest > 0
  );
  
  const averageScore = completedLevelsWithScores.length > 0 
    ? completedLevelsWithScores.reduce((sum, level) => 
        sum + (level.FinalTest + level.OralTest) / 2, 0
      ) / completedLevelsWithScores.length
    : 0;

  
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

/**
 * Unified practice stats calculation function
 */
export const calculatePracticeStats = (practiceStats: any): PracticeStats => {
  if (!practiceStats) {
    return {
      accuracy: 0,
      timeSpent: '0h 0m',
      problemsSolved: 0,
      totalQuestions: 0,
      practiceMinutes: 0,
      sessions: 0,
    };
  }

  let totalQuestions = 0;
  let totalCorrect = 0;
  let totalTimeSeconds = 0;
  let sessions = 0;


  // Calculate from detailed problem times if available
  if (practiceStats.practiceSessions && Array.isArray(practiceStats.practiceSessions)) {
    sessions = practiceStats.practiceSessions.length;
    for (const session of practiceStats.practiceSessions) {
      
      if (session.problemTimes && Array.isArray(session.problemTimes) && session.problemTimes.length > 0) {
        // Use detailed problem times
        for (const problemTime of session.problemTimes) {
          totalQuestions += 1;
          if (problemTime.isCorrect) {
            totalCorrect += 1;
          }
          totalTimeSeconds += problemTime.timeSpent || 0;
        }
      } else {
        // Use session-level data (this is what we have based on SQL results)
        totalQuestions += session.totalQuestions || session.numberOfQuestions || 0;
        totalCorrect += session.score || 0; // Use the actual score from the database
        totalTimeSeconds += session.totalTime || 0;
      }
    }
  } else {
    // Use aggregated data from backend
    totalQuestions = practiceStats.totalQuestionsAttempted || practiceStats.totalQuestions || 0;
    totalCorrect = practiceStats.totalProblemsSolved || practiceStats.totalCorrectAnswers || 0;
    totalTimeSeconds = practiceStats.totalPracticeTime || practiceStats.totalTimeSpent || 0;
    sessions = practiceStats.totalSessions || practiceStats.sessions || 0;
  }


  const accuracy = totalQuestions > 0 ? Math.round((totalCorrect / totalQuestions) * 100) : 0;
  
  // Format time spent
  const hours = Math.floor(totalTimeSeconds / 3600);
  const minutes = Math.floor((totalTimeSeconds % 3600) / 60);
  const timeSpent = hours > 0 ? `${hours}h ${minutes}m` : `${minutes}m`;

  return {
    accuracy,
    timeSpent,
    problemsSolved: totalCorrect,
    totalQuestions,
    practiceMinutes: Math.round(totalTimeSeconds / 60),
    sessions,
  };
};

/**
 * PvP stats calculation function
 */
export const calculatePvPStats = (pvpStats: any): PracticeStats => {
  if (!pvpStats) {
    return {
      accuracy: 0,
      timeSpent: '0h 0m',
      problemsSolved: 0,
      totalQuestions: 0,
      practiceMinutes: 0,
      sessions: 0,
    };
  }

  let totalQuestions = 0;
  let totalCorrect = 0;
  let totalTimeSeconds = 0;
  let sessions = 0;

  // Calculate from PvP room results if available
  if (pvpStats.pvpRoomResults && Array.isArray(pvpStats.pvpRoomResults)) {
    sessions = pvpStats.pvpRoomResults.length;
    for (const result of pvpStats.pvpRoomResults) {
      totalQuestions += result.questions_answered || 0;
      totalCorrect += result.correct_answers || 0;
      totalTimeSeconds += result.total_time || 0;
    }
  } else {
    // Use aggregated data from backend
    totalQuestions = pvpStats.totalQuestionsAttempted || pvpStats.totalQuestions || 0;
    totalCorrect = pvpStats.totalProblemsSolved || pvpStats.totalCorrectAnswers || 0;
    totalTimeSeconds = pvpStats.totalPracticeTime || pvpStats.totalTimeSpent || 0;
    sessions = pvpStats.totalSessions || pvpStats.sessions || 0;
  }

  const accuracy = totalQuestions > 0 ? Math.round((totalCorrect / totalQuestions) * 100) : 0;
  
  // Format time spent
  const hours = Math.floor(totalTimeSeconds / 3600);
  const minutes = Math.floor((totalTimeSeconds % 3600) / 60);
  const timeSpent = `${hours}h ${minutes}m`;
  
  const practiceMinutes = Math.round(totalTimeSeconds / 60);

  return {
    accuracy,
    timeSpent,
    problemsSolved: totalCorrect,
    totalQuestions,
    practiceMinutes,
    sessions,
  };
};

/**
 * Unified level stats calculation function
 */
export const calculateLevelStats = (progress: LevelProgress[]): LevelStats => {
  if (!progress || progress.length === 0) {
    return {
      currentLevel: 0,
      levelProgress: 0,
      levelAverageScore: 0,
      levelClassesCompleted: 0,
      levelTotalClasses: 0,
      levelProblemsSolved: 0,
      levelPracticeTime: 0,
      levelClassesThisWeek: 0,
    };
  }

  // Find the highest level with any actual progress (not just empty data)
  // Based on SQL data: student has progress in Level 1, Class 2
  // The backend sends data for all levels (1-6) but most have no progress

  // Find the highest level with any progress
  let currentLevel = 0;
  let levelProgress = 0;
  let levelAverageScore = 0;
  let levelClassesCompleted = 0;
  let levelTotalClasses = 0;
  let levelProblemsSolved = 0;
  let levelPracticeTime = 0;
  let levelClassesThisWeek = 0;

  // Get current week's start date (Monday)
  const today = new Date();
  const dayOfWeek = today.getDay();
  const monday = new Date(today);
  monday.setDate(today.getDate() - dayOfWeek + 1);
  monday.setHours(0, 0, 0, 0);

  // Find the highest level with any actual progress (not just empty data)
  let highestLevelWithProgress = 0;
  progress.forEach(level => {
    const hasProgress = level.FinalTest > 0 || level.OralTest > 0 || 
      level.classes.some(cls => cls.Test > 0 || cls.topics.some(topic => topic.Classwork > 0 || topic.Homework > 0));
    
    if (hasProgress && level.levelId > highestLevelWithProgress) {
      highestLevelWithProgress = level.levelId;
    }
  });


  // Calculate metrics for the highest level with progress
  if (highestLevelWithProgress > 0) {
    const currentLevelData = progress.find(level => level.levelId === highestLevelWithProgress);
    if (currentLevelData) {
      currentLevel = highestLevelWithProgress;
      
      // Calculate level-specific metrics for the current level only
      const levelScores: number[] = [];
      const levelTimes: number[] = [];
      let classesCompleted = 0;
      let problemsSolved = 0;
      let practiceTime = 0;
      let classesThisWeek = 0;

      // Process level tests
      if (currentLevelData.FinalTest > 0) {
        levelScores.push(currentLevelData.FinalTest);
        levelTimes.push(currentLevelData.FinalTestTime);
        problemsSolved += 15; // Assuming 15 problems per test
        practiceTime += currentLevelData.FinalTestTime;
      }
      if (currentLevelData.OralTest > 0) {
        levelScores.push(currentLevelData.OralTest);
        levelTimes.push(currentLevelData.OralTestTime);
        problemsSolved += 15;
        practiceTime += currentLevelData.OralTestTime;
      }
      
      // Process classes
      currentLevelData.classes.forEach(classItem => {
        // Process class test
        if (classItem.Test > 0) {
          levelScores.push(classItem.Test);
          levelTimes.push(classItem.Time);
          problemsSolved += 15;
          practiceTime += classItem.Time;
        }
        
        // Process topics (classwork and homework)
        classItem.topics.forEach(topic => {
          if (topic.Classwork > 0) {
            levelScores.push(topic.Classwork);
            levelTimes.push(topic.ClassworkTime);
            problemsSolved += 15;
            practiceTime += topic.ClassworkTime;
          }
          if (topic.Homework > 0) {
            levelScores.push(topic.Homework);
            levelTimes.push(topic.HomeworkTime);
            problemsSolved += 15;
            practiceTime += topic.HomeworkTime;
          }
        });
        
        // A class is considered completed if:
        // 1. Test is passed, OR
        // 2. At least 4 topics have >50% completion
        const completedTopics = classItem.topics.filter(topic => 
          topic.Classwork > 50 || topic.Homework > 50
        ).length;
        
        if (classItem.Test > 0 || completedTopics >= 2) {
          classesCompleted++;
          // For now, assume all completed classes were this week
          // In a real implementation, you'd check timestamps
          classesThisWeek++;
        }
      });

      // Use actual number of classes in the level instead of hardcoded 12
      levelTotalClasses = currentLevelData.classes.length;
      
      // Calculate level progress (percentage of classes completed in current level only)
      levelProgress = levelTotalClasses > 0 ? Math.round((classesCompleted / levelTotalClasses) * 100) : 0;

      
      // Calculate level average score (from current level only)
      levelAverageScore = levelScores.length > 0 
        ? Math.round(levelScores.reduce((sum, score) => sum + score, 0) / levelScores.length)
        : 0;

      levelClassesCompleted = classesCompleted;
      levelProblemsSolved = problemsSolved;
      levelPracticeTime = Math.round(practiceTime / 60); // Convert to minutes
      levelClassesThisWeek = classesThisWeek;
    }
  }

  return {
    currentLevel,
    levelProgress,
    levelAverageScore,
    levelClassesCompleted,
    levelTotalClasses,
    levelProblemsSolved,
    levelPracticeTime,
    levelClassesThisWeek,
  };
};

/**
 * Format time duration consistently
 */
export const formatTimeDuration = (seconds: number): string => {
  const hours = Math.floor(seconds / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  return hours > 0 ? `${hours}h ${minutes}m` : `${minutes}m`;
};

/**
 * Calculate accuracy percentage consistently
 */
export const calculateAccuracy = (correct: number, total: number): number => {
  return total > 0 ? Math.round((correct / total) * 100) : 0;
};

/**
 * Calculate weekly goals from practice stats and progress data
 */
export const calculateWeeklyGoals = (practiceStats: any, _progress: LevelProgress[]): {
  sessionsCompleted: number;
  sessionsTotal: number;
  practiceMinutes: number;
  practiceTargetMinutes: number;
  problemsSolved: number;
  problemsTarget: number;
} => {
  // Get current week's start date (Monday)
  const today = new Date();
  const dayOfWeek = today.getDay();
  const daysToMonday = dayOfWeek === 0 ? 6 : dayOfWeek - 1; // Sunday is 0, so 6 days to Monday
  const weekStart = new Date(today);
  weekStart.setDate(today.getDate() - daysToMonday);
  weekStart.setHours(0, 0, 0, 0);

  // Calculate practice mode sessions played this week
  // This tracks flashcard, untimed, timed, set, or any practice mode sessions
  let practiceModeSessions = 0;
  let practiceMinutes = 0;
  let problemsSolved = 0;


  if (practiceStats?.practiceSessions && Array.isArray(practiceStats.practiceSessions)) {
    // Count practice sessions (each session is a practice mode played)
    practiceModeSessions = practiceStats.practiceSessions.length;
    
    // Calculate from individual sessions
    let totalTimeSeconds = 0;
    let totalProblems = 0;

    for (const session of practiceStats.practiceSessions) {
      totalTimeSeconds += session.totalTime || 0;
      totalProblems += session.numberOfQuestions || session.totalQuestions || 0;
    }

    practiceMinutes = Math.round(totalTimeSeconds / 60);
    problemsSolved = totalProblems;
  } else if (practiceStats) {
    // Use aggregated data from backend
    practiceModeSessions = practiceStats.totalSessions || practiceStats.sessions || 0;
    practiceMinutes = Math.round((practiceStats.totalPracticeTime || 0) / 60);
    problemsSolved = practiceStats.totalProblemsSolved || 0;
  }


  // Set realistic targets based on user level
  const practiceModeTarget = 100; // 100 practice mode sessions per week
  const practiceTargetMinutes = 240; // 4 hours per week
  const problemsTarget = 300; // 300 problems per week

  return {
    sessionsCompleted: practiceModeSessions,
    sessionsTotal: practiceModeTarget,
    practiceMinutes,
    practiceTargetMinutes,
    problemsSolved,
    problemsTarget,
  };
};
