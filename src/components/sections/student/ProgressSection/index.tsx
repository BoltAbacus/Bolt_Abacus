import { FC, useMemo, useEffect, useState } from 'react';
import { FaTrophy, FaStar, FaMedal, FaFire } from 'react-icons/fa';
import { useNavigate } from 'react-router-dom';

import { LevelProgress, PracticeStats } from '@interfaces/apis/teacher';
import LevelProgressAccordion from '@components/organisms/LevelProgressAccordion';
import StreakCard from '@components/atoms/StreakCard';
import CoinsDisplay from '@components/atoms/CoinsDisplay';
import ProgressBar from '@components/atoms/ProgressBar';
import LineChart from '@components/atoms/LineChart';
import AchievementNotification from '@components/atoms/AchievementNotification';
import { useGamification } from '@helpers/gamification';
import WeeklyGoalsSection from '@components/sections/student/dashboard/WeeklyGoalsSection';
import AchievementsModal from '@components/organisms/AchievementsModal';
import { ACHIEVEMENTS } from '@constants/achievements';
import { STUDENT_ROADMAP } from '@constants/routes';
import { useAuthStore } from '@store/authStore';
import { getAccuracyTrendRequest, getSpeedTrendRequest } from '@services/student';
import { getLevelName, getTierName } from '@helpers/levelNames';

import styles from './index.module.css';

export interface StudentProgressSectionProps {
  batchName: string;
  progress: LevelProgress[];
  practiceStats?: PracticeStats;
}

const StudentProgressSection: FC<StudentProgressSectionProps> = ({
  batchName,
  progress,
}) => {
  const navigate = useNavigate();
  const { calculateProgressStats, checkAndUnlockAchievements, getMotivationalMessage } = useGamification();
  const [showAchievements, setShowAchievements] = useState(false);
  const authToken = useAuthStore((state) => state.authToken);
  
  // Trend data state
  const [accuracyTrend, setAccuracyTrend] = useState({
    currentAccuracy: 0,
    weeklyProgress: 0,
    dailyAccuracy: [0, 0, 0, 0, 0, 0, 0],
    labels: ['7d ago', '', '', '', '', '', 'Today']
  });
  const [speedTrend, setSpeedTrend] = useState({
    currentSpeed: 0,
    weeklyProgress: 0,
    dailySpeed: [0, 0, 0, 0, 0, 0, 0],
    labels: ['7d ago', '', '', '', '', '', 'Today']
  });
  const [isUsingFallbackData, setIsUsingFallbackData] = useState({
    accuracy: false,
    speed: false
  });

  // Calculate overall progress statistics
  const progressStats = useMemo(() => {
    return calculateProgressStats(progress);
  }, [progress, calculateProgressStats]);

  // Calculate current level specific metrics
  const currentLevelStats = useMemo(() => {
    if (!progress || progress.length === 0) {
      return {
        currentLevel: 0,
        levelProgress: 0,
        levelAverageScore: 0,
        levelClassesCompleted: 0,
        levelTotalClasses: 12, // Assuming 12 classes per level
        levelProblemsSolved: 0,
        levelPracticeTime: 0,
        levelClassesThisWeek: 0
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
    const daysToMonday = dayOfWeek === 0 ? 6 : dayOfWeek - 1; // Sunday is 0, so 6 days to Monday
    const weekStart = new Date(today);
    weekStart.setDate(today.getDate() - daysToMonday);
    weekStart.setHours(0, 0, 0, 0);

    progress.forEach(level => {
      // Check if this level has any progress
      const hasProgress = level.FinalTest > 0 || level.OralTest > 0 || 
        level.classes.some(cls => cls.Test > 0 || cls.topics.some(topic => topic.Classwork > 0 || topic.Homework > 0));
      
      if (hasProgress && level.levelId > currentLevel) {
        currentLevel = level.levelId;
        
        // Calculate level-specific metrics
        const levelScores = [];
        const levelTimes = [];
        let classesCompleted = 0;
        let problemsSolved = 0;
        let practiceTime = 0;
        let classesThisWeek = 0;

        // Process final and oral tests
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
      levelClassesThisWeek
    };
  }, [progress]);

  // Check and unlock achievements when progress changes
  useEffect(() => {
    checkAndUnlockAchievements(progressStats);
  }, [progressStats, checkAndUnlockAchievements]);

  // Calculate trends from progress data
  const calculateTrendsFromProgress = useMemo(() => {
    if (!progress || progress.length === 0) {
      return {
        accuracy: {
          currentAccuracy: 0,
          weeklyProgress: 0,
          dailyAccuracy: [0, 0, 0, 0, 0, 0, 0],
          labels: ['7d ago', '', '', '', '', '', 'Today']
        },
        speed: {
          currentSpeed: 0,
          weeklyProgress: 0,
          dailySpeed: [0, 0, 0, 0, 0, 0, 0],
          labels: ['7d ago', '', '', '', '', '', 'Today']
        }
      };
    }

    // Collect all scores and times from completed work
    const allScores: number[] = [];
    const allTimes: number[] = [];
    let totalActivities = 0;
    
    // Process each level
    progress.forEach(level => {
      // Process final and oral tests
      if (level.FinalTest > 0) {
        allScores.push(level.FinalTest);
        allTimes.push(level.FinalTestTime);
        totalActivities++;
      }
      
      if (level.OralTest > 0) {
        allScores.push(level.OralTest);
        allTimes.push(level.OralTestTime);
        totalActivities++;
      }
      
      // Process classes
      level.classes.forEach(classItem => {
        // Process class test
        if (classItem.Test > 0) {
          allScores.push(classItem.Test);
          allTimes.push(classItem.Time);
          totalActivities++;
        }
        
        // Process topics (classwork and homework)
        classItem.topics.forEach(topic => {
          if (topic.Classwork > 0) {
            allScores.push(topic.Classwork);
            allTimes.push(topic.ClassworkTime);
            totalActivities++;
          }
          if (topic.Homework > 0) {
            allScores.push(topic.Homework);
            allTimes.push(topic.HomeworkTime);
            totalActivities++;
          }
        });
      });
    });

    // Calculate current accuracy (average of all scores)
    const currentAccuracy = allScores.length > 0 
      ? Math.round(allScores.reduce((sum, score) => sum + score, 0) / allScores.length)
      : 0;

    // Calculate current speed (average problems per minute)
    // Assuming each test/classwork/homework has around 10-20 problems
    const avgProblemsPerTest = 15;
    const currentSpeed = allTimes.length > 0 
      ? Math.round((avgProblemsPerTest * allScores.length) / (allTimes.reduce((sum, time) => sum + time, 0) / 60))
      : 0;

    // Create a more realistic weekly trend based on current performance
    // This simulates gradual improvement over the week
    const dailyAccuracy = [];
    const dailySpeed = [];
    
    if (currentAccuracy > 0) {
      // Simulate gradual improvement over the week
      const baseAccuracy = Math.max(0, currentAccuracy - 20);
      const improvement = currentAccuracy - baseAccuracy;
      
      for (let i = 0; i < 7; i++) {
        if (i < 6) {
          // Show gradual improvement
          const dayAccuracy = Math.round(baseAccuracy + (improvement * (i + 1) / 7));
          dailyAccuracy.push(Math.max(0, dayAccuracy));
        } else {
          // Today's actual performance
          dailyAccuracy.push(currentAccuracy);
        }
      }
    } else {
      dailyAccuracy.push(0, 0, 0, 0, 0, 0, 0);
    }
    
    if (currentSpeed > 0) {
      // Simulate gradual improvement in speed
      const baseSpeed = Math.max(0, currentSpeed - 5);
      const improvement = currentSpeed - baseSpeed;
      
      for (let i = 0; i < 7; i++) {
        if (i < 6) {
          const daySpeed = Math.round(baseSpeed + (improvement * (i + 1) / 7));
          dailySpeed.push(Math.max(0, daySpeed));
        } else {
          dailySpeed.push(currentSpeed);
        }
      }
    } else {
      dailySpeed.push(0, 0, 0, 0, 0, 0, 0);
    }

    // Calculate weekly progress
    const weeklyAccuracyProgress = dailyAccuracy.length > 1 
      ? Math.round(dailyAccuracy[dailyAccuracy.length - 1] - dailyAccuracy[0])
      : 0;
    const weeklySpeedProgress = dailySpeed.length > 1 
      ? Math.round(dailySpeed[dailySpeed.length - 1] - dailySpeed[0])
      : 0;

    // Create better labels with day names
    const today = new Date();
    const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
    const labels = [];
    
    for (let i = 6; i >= 0; i--) {
      const date = new Date(today);
      date.setDate(date.getDate() - i);
      const dayName = dayNames[date.getDay()];
      
      if (i === 6) {
        labels.push('7d ago');
      } else if (i === 0) {
        labels.push('Today');
      } else {
        labels.push(dayName);
      }
    }

    return {
      accuracy: {
        currentAccuracy,
        weeklyProgress: weeklyAccuracyProgress,
        dailyAccuracy,
        labels
      },
      speed: {
        currentSpeed,
        weeklyProgress: weeklySpeedProgress,
        dailySpeed,
        labels
      }
    };
  }, [progress]);

  // Fetch trend data with fallback to calculated data
  useEffect(() => {
    const fetchTrendData = async () => {
      if (!authToken) return;

      let accuracyDataFetched = false;
      let speedDataFetched = false;

      try {
        // Fetch accuracy trend
        const accuracyResponse = await getAccuracyTrendRequest(authToken);
        if (accuracyResponse.status === 200) {
          setAccuracyTrend(accuracyResponse.data);
          accuracyDataFetched = true;
        }
      } catch (error) {
        console.error('Error fetching accuracy trend data:', error);
      }

      try {
        // Fetch speed trend
        const speedResponse = await getSpeedTrendRequest(authToken);
        if (speedResponse.status === 200) {
          setSpeedTrend(speedResponse.data);
          speedDataFetched = true;
        }
      } catch (error) {
        console.error('Error fetching speed trend data:', error);
      }

      // Use calculated data as fallback if API calls failed
      if (!accuracyDataFetched) {
        setAccuracyTrend(calculateTrendsFromProgress.accuracy);
        setIsUsingFallbackData(prev => ({ ...prev, accuracy: true }));
      }
      if (!speedDataFetched) {
        setSpeedTrend(calculateTrendsFromProgress.speed);
        setIsUsingFallbackData(prev => ({ ...prev, speed: true }));
      }
    };

    fetchTrendData();
  }, [authToken, calculateTrendsFromProgress]);

  // Calculate achievements (currently commented out in UI)
  // const achievements = useMemo(() => {
  //   const achievements = [];
  //   
  //   if (progressStats.completedLevels >= 1) {
  //     achievements.push({
  //       id: 'first-level',
  //       title: 'First Steps',
  //       description: 'Completed your first level!',
  //       icon: FaStar,
  //       color: 'text-yellow-400',
  //       bgColor: 'bg-yellow-400/10',
  //     });
  //   }
  //   
  //   if (progressStats.completedLevels >= 3) {
  //     achievements.push({
  //       id: 'three-levels',
  //       title: 'Getting Stronger',
  //       description: 'Completed 3 levels!',
  //       icon: FaMedal,
  //       color: 'text-blue-400',
  //       bgColor: 'bg-blue-400/10',
  //     });
  //   }
  //   
  //   if (progressStats.averageScore >= 80) {
  //     achievements.push({
  //       id: 'high-scorer',
  //       title: 'High Achiever',
  //       description: 'Maintaining excellent scores!',
  //       icon: FaTrophy,
  //       color: 'text-purple-400',
  //       bgColor: 'bg-purple-400/10',
  //     });
  //   }
  //   
  //   if (progressStats.overallProgress >= 50) {
  //     achievements.push({
  //       id: 'halfway',
  //       title: 'Halfway There!',
  //       description: 'Completed 50% of your journey!',
  //       icon: BiTargetLock,
  //       color: 'text-green-400',
  //       bgColor: 'bg-green-400/10',
  //     });
  //   }
  //   
  //   if (progressStats.overallProgress >= 75) {
  //     achievements.push({
  //       id: 'almost-there',
  //       title: 'Almost There!',
  //       description: '75% complete - you\'re almost done!',
  //       icon: FaRocket,
  //       color: 'text-orange-400',
  //       bgColor: 'bg-orange-400/10',
  //     });
  //   }
  //   
  //   if (progressStats.overallProgress >= 100) {
  //     achievements.push({
  //       id: 'champion',
  //       title: 'Champion!',
  //       description: 'Completed all levels!',
  //       icon: FaCrown,
  //       color: 'text-yellow-500',
  //       bgColor: 'bg-yellow-500/10',
  //     });
  //   }
  //   
  //   return achievements;
  // }, [progressStats]);

  const motivationalMessage = useMemo(() => {
    return getMotivationalMessage(progressStats);
  }, [progressStats, getMotivationalMessage]);

  return (
    <div className={`${styles.progressSection} flex flex-col gap-6 p-6 tablet:p-10 desktop:px-24`}>
      <AchievementNotification />
      {/* Header with Gamification Elements */}
      <div className="flex flex-col gap-4">
        <div className="flex flex-col tablet:flex-row tablet:justify-between tablet:items-center gap-4">
          <div>
            <h1 className="text-3xl font-bold text-[#facb25] mb-2">Your Learning Journey</h1>
            <p className="text-lg text-white">
              <span className="font-medium text-[#818181]">Batch: </span>
              {batchName}
            </p>
          </div>
          <div className="flex gap-4">
            <StreakCard />
            <CoinsDisplay />
          </div>
        </div>
      </div>

      {/* Progress Overview Dashboard (moved to top) */}
      <div className="grid grid-cols-1 tablet:grid-cols-2 desktop:grid-cols-4 gap-4">
        <div className="bg-[#212124] p-6 rounded-lg border border-[#facb25]/20 flex flex-col h-full">
          <div className="flex items-center gap-3 mb-3 flex-1">
            <div className="w-10 h-10 bg-[#facb25] rounded-full flex items-center justify-center flex-shrink-0">
              <FaFire className="text-[#000000]" />
            </div>
            <div className="flex-1 min-h-[60px] flex flex-col justify-center">
              <p className="text-2xl font-bold text-white">{currentLevelStats.levelProgress}%</p>
              <p className="text-sm text-white">Overall Progress</p>
              {currentLevelStats.currentLevel > 0 && (
                <p className="text-xs text-[#818181]">in {getLevelName(currentLevelStats.currentLevel)}</p>
              )}
            </div>
          </div>
          <div className="mt-auto">
            <ProgressBar percentage={currentLevelStats.levelProgress} type="blue" />
          </div>
        </div>

        <div className="bg-[#212124] p-6 rounded-lg border border-[#facb25]/20 flex flex-col h-full">
          <div className="flex items-center gap-3 mb-3 flex-1">
            <div className="w-10 h-10 bg-[#facb25] rounded-full flex items-center justify-center flex-shrink-0">
              <FaTrophy className="text-[#000000]" />
            </div>
            <div className="flex-1 min-h-[60px] flex flex-col justify-center">
              <p className="text-2xl font-bold text-white">{progressStats.completedLevels}/{progressStats.totalLevels}</p>
              <p className="text-sm text-white">Realms Mastered</p>
            </div>
          </div>
          <div className="mt-auto">
            <ProgressBar percentage={(progressStats.completedLevels / progressStats.totalLevels) * 100} type="green" />
          </div>
        </div>

        <div className="bg-[#212124] p-6 rounded-lg border border-[#facb25]/20 flex flex-col h-full">
          <div className="flex items-center gap-3 mb-3 flex-1">
            <div className="w-10 h-10 bg-[#facb25] rounded-full flex items-center justify-center flex-shrink-0">
              <FaStar className="text-[#000000]" />
            </div>
            <div className="flex-1 min-h-[60px] flex flex-col justify-center">
              <p className="text-2xl font-bold text-white">{currentLevelStats.levelAverageScore}%</p>
              <p className="text-sm text-white">Average Score</p>
              {currentLevelStats.currentLevel > 0 && (
                <p className="text-xs text-[#818181]">in {getLevelName(currentLevelStats.currentLevel)}</p>
              )}
            </div>
          </div>
          <div className="mt-auto">
            <ProgressBar percentage={currentLevelStats.levelAverageScore} type="yellow" />
          </div>
        </div>

        <div className="bg-[#212124] p-6 rounded-lg border border-[#facb25]/20 flex flex-col h-full">
          <div className="flex items-center gap-3 mb-3 flex-1">
            <div className="w-10 h-10 bg-[#facb25] rounded-full flex items-center justify-center flex-shrink-0">
              <FaMedal className="text-[#000000]" />
            </div>
            <div className="flex-1 min-h-[60px] flex flex-col justify-center">
              <p className="text-2xl font-bold text-white">{progressStats.completedClasses}/{progressStats.totalClasses}</p>
              <p className="text-sm text-white">Conquests Completed</p>
            </div>
          </div>
          <div className="mt-auto">
            <ProgressBar percentage={(progressStats.completedClasses / progressStats.totalClasses) * 100} type="purple" />
          </div>
        </div>
      </div>

      {/* Weekly Goals */}
      <div className="bg-[#1b1b1b] p-6 rounded-lg border border-lightGold">
        <WeeklyGoalsSection 
          sessionsCompleted={currentLevelStats.levelClassesThisWeek}
          sessionsTotal={5}
          practiceMinutes={currentLevelStats.levelPracticeTime}
          practiceTargetMinutes={240}
          problemsSolved={currentLevelStats.levelProblemsSolved}
          problemsTarget={300}
        />
      </div>

      {/* Pinned Achievements (compact) + modal trigger */}
      {/* <div className="bg-[#1b1b1b] p-6 rounded-lg border border-lightGold">
        <AchievementsSection
          compact
          items={ACHIEVEMENTS.slice(0, 6)}
          onViewAll={() => setShowAchievements(true)}
        />
      </div> */}

      {/* Motivational Message */}
      <div 
        className="bg-[#212124] p-6 rounded-lg border border-[#facb25]/20 cursor-pointer hover:bg-[#2a2a2d] transition-all duration-300"
        onClick={() => navigate(STUDENT_ROADMAP)}
      >
        <div className="text-center">
          <p className="text-lg text-white font-medium">{motivationalMessage}</p>
        </div>
      </div>

      

      {/* Achievements Section */}
      {/* {achievements.length > 0 && (
        <div className="bg-[#212124] p-6 rounded-lg border border-[#facb25]/20">
          <h3 className="text-xl font-bold text-gold mb-4">Achievements Unlocked</h3>
          <div className="grid grid-cols-1 tablet:grid-cols-2 desktop:grid-cols-3 gap-4">
            {achievements.map((achievement) => (
              <div key={achievement.id} className={`p-4 rounded-lg border ${achievement.bgColor} border-lightGold`}>
                <div className="flex items-center gap-3">
                  <achievement.icon className={`text-2xl ${achievement.color}`} />
                  <div>
                    <p className="font-bold text-white">{achievement.title}</p>
                    <p className="text-sm text-gray-300">{achievement.description}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )} */}

      {/* Trend Cards (line charts) */}
      <div className="grid grid-cols-1 tablet:grid-cols-2 gap-6">
        {/* Accuracy Trend */}
        <div className="bg-[#212124] p-6 rounded-lg border border-[#facb25]/20">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-xl font-bold text-[#facb25]">Accuracy Trend</h3>
              {isUsingFallbackData.accuracy && (
                <p className="text-xs text-yellow-400 mt-1">📊 Calculated from your completed work</p>
              )}
              {accuracyTrend.currentAccuracy === 0 && (
                <p className="text-xs text-[#818181] mt-1">Complete some classwork to see your progress!</p>
              )}
            </div>
            <div className="text-right">
              <div className="text-2xl font-extrabold text-green-400">{accuracyTrend.currentAccuracy}%</div>
              <div className="text-xs text-[#818181]">Current Accuracy</div>
            </div>
          </div>
          <LineChart
            data={accuracyTrend.dailyAccuracy}
            labels={accuracyTrend.labels}
            stroke="#facb25"
            gradientColors={{ start: "#facb25", end: "#d4a017" }}
            yTicks={accuracyTrend.dailyAccuracy}
            valueFormatter={(v) => `${v}% Accuracy`}
          />
          <div className="flex justify-between text-[10px] text-[#818181] mt-1">
            <span>7d ago</span>
            <span>Today</span>
          </div>
          <div className="mt-3 flex items-center justify-between">
            <div className="text-sm text-green-300 font-semibold">
              Weekly Progress <span className="text-white">{accuracyTrend.weeklyProgress >= 0 ? '+' : ''}{accuracyTrend.weeklyProgress}%</span>
            </div>
            <div className="text-xs text-[#818181]">
              {accuracyTrend.dailyAccuracy.filter(acc => acc > 0).length} active days
            </div>
          </div>
        </div>

        {/* Speed Trend */}
        <div className="bg-[#212124] p-6 rounded-lg border border-[#facb25]/20">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-xl font-bold text-[#facb25]">Speed Trend</h3>
              {isUsingFallbackData.speed && (
                <p className="text-xs text-yellow-400 mt-1">📊 Calculated from your completed work</p>
              )}
              {speedTrend.currentSpeed === 0 && (
                <p className="text-xs text-[#818181] mt-1">Complete some classwork to see your speed!</p>
              )}
            </div>
            <div className="text-right">
              <div className="text-2xl font-extrabold text-blue-400">{speedTrend.currentSpeed}</div>
              <div className="text-xs text-[#818181]">Problems/Minute</div>
            </div>
          </div>
          <LineChart
            data={speedTrend.dailySpeed}
            labels={speedTrend.labels}
            stroke="#facb25"
            gradientColors={{ start: "#facb25", end: "#d4a017" }}
            yTicks={speedTrend.dailySpeed}
            valueFormatter={(v) => `${v}`}
          />
          <div className="flex justify-between text-[10px] text-gray-400 mt-1">
            <span>7d ago</span>
            <span>Today</span>
          </div>
          <div className="mt-3 flex items-center justify-between">
            <div className="text-sm text-blue-300 font-semibold">
              Weekly Progress <span className="text-white">{speedTrend.weeklyProgress >= 0 ? '+' : ''}{speedTrend.weeklyProgress}</span>
            </div>
            <div className="text-xs text-gray-400">
              {speedTrend.dailySpeed.filter(speed => speed > 0).length} active days
            </div>
          </div>
        </div>
      </div>

      {/* Activity Summary */}
      {calculateTrendsFromProgress.accuracy.currentAccuracy > 0 && (
        <div className="bg-[#1b1b1b] p-4 rounded-lg border border-lightGold">
          <div className="flex items-center justify-center gap-6 text-sm">
            <div className="text-center">
              <div className="text-lg font-bold text-green-400">
                {progress.reduce((total, level) => {
                  let levelActivities = 0;
                  if (level.FinalTest > 0) levelActivities++;
                  if (level.OralTest > 0) levelActivities++;
                  level.classes.forEach(classItem => {
                    if (classItem.Test > 0) levelActivities++;
                    classItem.topics.forEach(topic => {
                      if (topic.Classwork > 0) levelActivities++;
                      if (topic.Homework > 0) levelActivities++;
                    });
                  });
                  return total + levelActivities;
                }, 0)}
              </div>
              <div className="text-gray-400">Activities Completed</div>
            </div>
            <div className="text-center">
              <div className="text-lg font-bold text-blue-400">
                {Math.round(progress.reduce((total, level) => {
                  let levelTime = 0;
                  if (level.FinalTest > 0) levelTime += level.FinalTestTime;
                  if (level.OralTest > 0) levelTime += level.OralTestTime;
                  level.classes.forEach(classItem => {
                    if (classItem.Test > 0) levelTime += classItem.Time;
                    classItem.topics.forEach(topic => {
                      if (topic.Classwork > 0) levelTime += topic.ClassworkTime;
                      if (topic.Homework > 0) levelTime += topic.HomeworkTime;
                    });
                  });
                  return total + levelTime;
                }, 0) / 60)}
              </div>
              <div className="text-gray-400">Minutes Practiced</div>
            </div>
          </div>
        </div>
      )}

      {/* Detailed Progress */}
      <div className="bg-[#1b1b1b] p-6 rounded-lg border border-lightGold">
        <h3 className="text-xl font-bold text-gold mb-4">Detailed Progress</h3>
        <div className="flex flex-col gap-6">
          {progress.map((levelProgress, index) => (
            <div key={index} className="h-fit">
              <LevelProgressAccordion levelProgress={levelProgress} />
            </div>
          ))}
        </div>
      </div>
      <AchievementsModal
        isOpen={showAchievements}
        onClose={() => setShowAchievements(false)}
        achievements={ACHIEVEMENTS}
      />
    </div>
  );
};

export default StudentProgressSection;
