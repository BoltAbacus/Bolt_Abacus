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
      if (session.problemTimes && Array.isArray(session.problemTimes)) {
        // Use detailed problem times
        for (const problemTime of session.problemTimes) {
          totalQuestions += 1;
          if (problemTime.isCorrect) {
            totalCorrect += 1;
          }
          totalTimeSeconds += problemTime.timeSpent || 0;
        }
      } else {
        // Fallback to session-level data
        totalQuestions += session.numberOfQuestions || 0;
        totalCorrect += session.score || 0;
        totalTimeSeconds += session.totalTime || 0;
      }
    }
  } else {
    // Fallback to aggregated data
    totalQuestions = practiceStats.totalQuestions || 0;
    totalCorrect = practiceStats.totalCorrectAnswers || 0;
    totalTimeSeconds = practiceStats.totalTimeSpent || 0;
    sessions = practiceStats.totalSessions || 0;
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
 * Unified level stats calculation function
 */
export const calculateLevelStats = (progress: LevelProgress[]): LevelStats => {
  if (!progress || progress.length === 0) {
    return {
      currentLevel: 0,
      levelProgress: 0,
      levelAverageScore: 0,
      levelClassesCompleted: 0,
      levelTotalClasses: 12,
      levelProblemsSolved: 0,
      levelPracticeTime: 0,
      levelClassesThisWeek: 0,
    };
  }

  // Find the highest level with any progress
  let currentLevel = 0;
  let levelProgress = 0;
  let levelAverageScore = 0;
  let levelClassesCompleted = 0;
  let levelProblemsSolved = 0;
  let levelPracticeTime = 0;
  let levelClassesThisWeek = 0;

  // Get current week's start date (Monday)
  const today = new Date();
  const dayOfWeek = today.getDay();
  const monday = new Date(today);
  monday.setDate(today.getDate() - dayOfWeek + 1);
  monday.setHours(0, 0, 0, 0);

  progress.forEach(level => {
    // Check if this level has any progress
    const hasProgress = level.FinalTest > 0 || level.OralTest > 0 || 
      level.classes.some(cls => cls.Test > 0 || cls.topics.some(topic => topic.Classwork > 0 || topic.Homework > 0));
    
    if (hasProgress && level.levelId > currentLevel) {
      currentLevel = level.levelId;
      
      // Calculate level-specific metrics
      const levelScores: number[] = [];
      const levelTimes: number[] = [];
      let classesCompleted = 0;
      let problemsSolved = 0;
      let practiceTime = 0;
      let classesThisWeek = 0;

      // Process level tests
      if (level.FinalTest > 0) {
        levelScores.push(level.FinalTest);
        levelTimes.push(level.FinalTestTime);
        problemsSolved += 15; // Assuming 15 problems per test
        practiceTime += level.FinalTestTime;
      }
      if (level.OralTest > 0) {
        levelScores.push(level.OralTest);
        levelTimes.push(level.OralTestTime);
        problemsSolved += 15;
        practiceTime += level.OralTestTime;
      }
      
      // Process classes
      level.classes.forEach(classItem => {
        let classCompleted = false;
        
        // Process class test
        if (classItem.Test > 0) {
          levelScores.push(classItem.Test);
          levelTimes.push(classItem.Time);
          problemsSolved += 15;
          practiceTime += classItem.Time;
          classCompleted = true;
        }
        
        // Process topics (classwork and homework)
        classItem.topics.forEach(topic => {
          if (topic.Classwork > 0) {
            levelScores.push(topic.Classwork);
            levelTimes.push(topic.ClassworkTime);
            problemsSolved += 15;
            practiceTime += topic.ClassworkTime;
            classCompleted = true;
          }
          if (topic.Homework > 0) {
            levelScores.push(topic.Homework);
            levelTimes.push(topic.HomeworkTime);
            problemsSolved += 15;
            practiceTime += topic.HomeworkTime;
            classCompleted = true;
          }
        });
        
        if (classCompleted) {
          classesCompleted++;
          // For now, assume all completed classes were this week
          // In a real implementation, you'd check timestamps
          classesThisWeek++;
        }
      });

      // Calculate level progress (percentage of classes completed)
      levelProgress = Math.round((classesCompleted / 12) * 100);
      
      // Calculate level average score
      levelAverageScore = levelScores.length > 0 
        ? Math.round(levelScores.reduce((sum, score) => sum + score, 0) / levelScores.length)
        : 0;

      levelClassesCompleted = classesCompleted;
      levelProblemsSolved = problemsSolved;
      levelPracticeTime = Math.round(practiceTime / 60); // Convert to minutes
      levelClassesThisWeek = classesThisWeek;
    }
  });

  return {
    currentLevel,
    levelProgress,
    levelAverageScore,
    levelClassesCompleted,
    levelTotalClasses: 12,
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
export const calculateWeeklyGoals = (practiceStats: any, progress: LevelProgress[]): {
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

  // Calculate conquests (classes) completed this week from progress data
  let conquestsCompleted = 0;
  if (progress && progress.length > 0) {
    progress.forEach(level => {
      level.classes.forEach(classItem => {
        let classCompleted = false;
        
        // Check if class test is completed
        if (classItem.Test > 0) {
          classCompleted = true;
        }
        
        // Check if any topics are completed
        classItem.topics.forEach(topic => {
          if (topic.Classwork > 0 || topic.Homework > 0) {
            classCompleted = true;
          }
        });
        
        if (classCompleted) {
          conquestsCompleted++;
        }
      });
    });
  }

  // Calculate practice time and problems solved from practice stats
  let practiceMinutes = 0;
  let problemsSolved = 0;

  if (practiceStats?.practiceSessions && Array.isArray(practiceStats.practiceSessions)) {
    practiceMinutes = Math.round(practiceStats.totalPracticeTime / 60) || 0;
    problemsSolved = practiceStats.totalProblemsSolved || 0;
  } else if (practiceStats) {
    practiceMinutes = Math.round(practiceStats.totalPracticeTime / 60) || 0;
    problemsSolved = practiceStats.totalProblemsSolved || 0;
  }

  // Set realistic targets based on user level
  const sessionsTotal = 5; // 5 sessions per week
  const practiceTargetMinutes = 240; // 4 hours per week
  const problemsTarget = 300; // 300 problems per week

  return {
    sessionsCompleted: Math.min(conquestsCompleted, sessionsTotal),
    sessionsTotal,
    practiceMinutes: Math.min(practiceMinutes, practiceTargetMinutes),
    practiceTargetMinutes,
    problemsSolved: Math.min(problemsSolved, problemsTarget),
    problemsTarget,
  };
};
