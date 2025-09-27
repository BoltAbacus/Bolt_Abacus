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
import { calculatePracticeStats, calculateLevelStats, calculateProgressStats as computeProgressStats, calculateWeeklyGoals } from '@helpers/progressCalculations';
import WeeklyGoalsSection from '@components/sections/student/dashboard/WeeklyGoalsSection';
import AchievementsModal from '@components/organisms/AchievementsModal';
import { ACHIEVEMENTS } from '@constants/achievements';
import { STUDENT_ROADMAP } from '@constants/routes';
import { useAuthStore } from '@store/authStore';
import { getPracticeAccuracyTrendRequest, getPracticeSpeedTrendRequest, getPvpAccuracyTrendRequest, getPvpSpeedTrendRequest } from '@services/student';
import { getLevelName } from '@helpers/levelNames';
import FavoriteModeCard from '@components/sections/student/dashboard/FavoriteModeCard';
import ClassRankCard from '@components/sections/student/dashboard/ClassRankCard';
import LeaderboardsCard from '@components/sections/student/dashboard/LeaderboardsCard';
import ModeDistributionCard from '@components/sections/student/dashboard/ModeDistributionCard';
import { useWeeklyStatsStore } from '@store/weeklyStatsStore';

import styles from './index.module.css';

export interface StudentProgressSectionProps {
  batchName: string;
  progress: LevelProgress[] | undefined;
  practiceStats?: PracticeStats;
  pvpStats?: any;
}

const StudentProgressSection: FC<StudentProgressSectionProps> = ({
  batchName,
  progress,
  practiceStats,
}) => {
  const navigate = useNavigate();
  const { checkAndUnlockAchievements, getMotivationalMessage } = useGamification();
  const [showAchievements, setShowAchievements] = useState(false);
  const authToken = useAuthStore((state) => state.authToken);
  
  // Weekly stats for Weekly Goals
  const { fetchWeeklyStats } = useWeeklyStatsStore() as any;

  useEffect(() => {
    fetchWeeklyStats?.();
  }, [fetchWeeklyStats]);
  
  // Trend data state for 4 graphs
  const [practiceAccuracyTrend, setPracticeAccuracyTrend] = useState({
    currentAccuracy: 0,
    weeklyProgress: 0,
    dailyAccuracy: [0, 0, 0, 0, 0, 0, 0],
    labels: ['6d ago', '', '', '', '', '', 'Today']
  });
  const [practiceSpeedTrend, setPracticeSpeedTrend] = useState({
    currentSpeed: 0,
    weeklyProgress: 0,
    dailySpeed: [0, 0, 0, 0, 0, 0, 0],
    labels: ['6d ago', '', '', '', '', '', 'Today']
  });
  const [pvpAccuracyTrend, setPvpAccuracyTrend] = useState({
    currentAccuracy: 0,
    weeklyProgress: 0,
    dailyAccuracy: [0, 0, 0, 0, 0, 0, 0],
    labels: ['6d ago', '', '', '', '', '', 'Today']
  });
  const [pvpSpeedTrend, setPvpSpeedTrend] = useState({
    currentSpeed: 0,
    weeklyProgress: 0,
    dailySpeed: [0, 0, 0, 0, 0, 0, 0],
    labels: ['6d ago', '', '', '', '', '', 'Today']
  });

  // Calculate overall progress statistics
  const progressStats = useMemo(() => {
    return computeProgressStats(progress || []);
  }, [progress]);

  // Calculate stats from practice data using unified calculation
  const practiceStatsCalculated = useMemo(() => {
    return calculatePracticeStats(practiceStats);
  }, [practiceStats]);

  // Update practice accuracy trend with calculated stats
  useEffect(() => {
    if (practiceStatsCalculated && practiceStatsCalculated.accuracy > 0) {
      setPracticeAccuracyTrend(prev => ({
        ...prev,
        currentAccuracy: practiceStatsCalculated.accuracy,
        weeklyProgress: practiceStatsCalculated.accuracy, // Use current accuracy as weekly progress for now
        dailyAccuracy: [0, 0, 0, 0, 0, 0, practiceStatsCalculated.accuracy] // Set today's accuracy
      }));
    }
  }, [practiceStatsCalculated]);

  // Update practice speed trend with calculated stats
  useEffect(() => {
    if (practiceStatsCalculated && practiceStatsCalculated.practiceMinutes > 0) {
      const speed = practiceStatsCalculated.totalQuestions > 0 && practiceStatsCalculated.practiceMinutes > 0 
        ? Math.round((practiceStatsCalculated.totalQuestions / practiceStatsCalculated.practiceMinutes) * 60) 
        : 0;
      
      setPracticeSpeedTrend(prev => ({
        ...prev,
        currentSpeed: speed,
        weeklyProgress: speed, // Use current speed as weekly progress for now
        dailySpeed: [0, 0, 0, 0, 0, 0, speed] // Set today's speed
      }));
    }
  }, [practiceStatsCalculated]);

  // Calculate current level specific metrics using unified calculation
  const currentLevelStats = useMemo(() => {
    return calculateLevelStats(progress || []);
  }, [progress]);

  // Calculate weekly goals using unified calculation
  const weeklyGoals = useMemo(() => {
    return calculateWeeklyGoals(practiceStats, progress || []);
  }, [practiceStats, progress]);

  // Fetch real trend data from backend
  const fetchTrendData = async () => {
    if (!authToken) return;

    try {
      // Fetch practice accuracy trend
      const practiceAccuracyResponse = await getPracticeAccuracyTrendRequest(authToken);
      if (practiceAccuracyResponse.data) {
        setPracticeAccuracyTrend({
          currentAccuracy: practiceAccuracyResponse.data.currentAccuracy || 0,
          weeklyProgress: practiceAccuracyResponse.data.weeklyProgress || 0,
          dailyAccuracy: practiceAccuracyResponse.data.dailyAccuracy || [0, 0, 0, 0, 0, 0, 0],
          labels: practiceAccuracyResponse.data.labels || ['6d ago', '', '', '', '', '', 'Today']
        });
      }

      // Fetch practice speed trend
      const practiceSpeedResponse = await getPracticeSpeedTrendRequest(authToken);
      if (practiceSpeedResponse.data) {
        setPracticeSpeedTrend({
          currentSpeed: practiceSpeedResponse.data.currentSpeed || 0,
          weeklyProgress: practiceSpeedResponse.data.weeklyProgress || 0,
          dailySpeed: practiceSpeedResponse.data.dailySpeed || [0, 0, 0, 0, 0, 0, 0],
          labels: practiceSpeedResponse.data.labels || ['6d ago', '', '', '', '', '', 'Today']
        });
      }

      // Fetch PvP accuracy trend
      const pvpAccuracyResponse = await getPvpAccuracyTrendRequest(authToken);
      if (pvpAccuracyResponse.data) {
        setPvpAccuracyTrend({
          currentAccuracy: pvpAccuracyResponse.data.currentAccuracy || 0,
          weeklyProgress: pvpAccuracyResponse.data.weeklyProgress || 0,
          dailyAccuracy: pvpAccuracyResponse.data.dailyAccuracy || [0, 0, 0, 0, 0, 0, 0],
          labels: pvpAccuracyResponse.data.labels || ['6d ago', '', '', '', '', '', 'Today']
        });
      }

      // Fetch PvP speed trend
      const pvpSpeedResponse = await getPvpSpeedTrendRequest(authToken);
      if (pvpSpeedResponse.data) {
        setPvpSpeedTrend({
          currentSpeed: pvpSpeedResponse.data.currentSpeed || 0,
          weeklyProgress: pvpSpeedResponse.data.weeklyProgress || 0,
          dailySpeed: pvpSpeedResponse.data.dailySpeed || [0, 0, 0, 0, 0, 0, 0],
          labels: pvpSpeedResponse.data.labels || ['6d ago', '', '', '', '', '', 'Today']
        });
      }
    } catch (error) {
      console.error('Error fetching trend data:', error);
    }
  };

  // Check and unlock achievements when progress changes
  useEffect(() => {
    checkAndUnlockAchievements(progressStats);
  }, [progressStats, checkAndUnlockAchievements]);

  // Fetch trend data when component mounts
  useEffect(() => {
    fetchTrendData();
  }, [authToken]);

  // Refetch trend data when practice stats change
  useEffect(() => {
    if (practiceStats) {
      fetchTrendData();
    }
  }, [practiceStats]);

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

      {/* Weekly Goals (moved from Dashboard) */}
      <div className="bg-[#1b1b1b] p-6 rounded-lg border border-lightGold">
        <WeeklyGoalsSection 
          sessionsCompleted={weeklyGoals.sessionsCompleted}
          sessionsTotal={weeklyGoals.sessionsTotal}
          practiceMinutes={weeklyGoals.practiceMinutes}
          practiceTargetMinutes={weeklyGoals.practiceTargetMinutes}
          problemsSolved={weeklyGoals.problemsSolved}
          problemsTarget={weeklyGoals.problemsTarget}
        />
      </div>

      {/* Motivational Message */}
      <div 
        className="bg-[#212124] p-6 rounded-lg border border-[#facb25]/20 cursor-pointer hover:bg-[#2a2a2d] transition-all duration-300"
        onClick={() => navigate(STUDENT_ROADMAP)}
      >
        <div className="text-center">
          <p className="text-lg text-white font-medium">{motivationalMessage}</p>
        </div>
      </div>

      {/* Trend Cards (4 graphs) */}
      <div className="grid grid-cols-1 tablet:grid-cols-2 gap-6">
        {/* Practice Accuracy Trend */}
        <div className="bg-[#212124] p-6 rounded-lg border border-[#facb25]/20">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-xl font-bold text-[#facb25]">Practice Accuracy</h3>
              <p className="text-xs text-yellow-400 mt-1">📊 Calculated from your practice work</p>
              {practiceAccuracyTrend.currentAccuracy === 0 && (
                <p className="text-xs text-[#818181] mt-1">Complete some practice to see your progress!</p>
              )}
            </div>
            <div className="text-right">
              <div className="text-2xl font-extrabold text-green-400">{practiceAccuracyTrend.currentAccuracy}%</div>
              <div className="text-xs text-[#818181]">Current Accuracy</div>
            </div>
          </div>
          <LineChart
            data={practiceAccuracyTrend.dailyAccuracy}
            labels={practiceAccuracyTrend.labels}
            stroke="#facb25"
            gradientColors={{ start: "#facb25", end: "#d4a017" }}
            yTicks={practiceAccuracyTrend.dailyAccuracy}
            valueFormatter={(v) => `${v}% Accuracy`}
          />
          <div className="flex justify-between text-[10px] text-[#818181] mt-1">
            <span>6d ago</span>
            <span>Today</span>
          </div>
          <div className="mt-3 flex items-center justify-between">
            <div className="text-sm text-green-300 font-semibold">
              Weekly Progress <span className="text-white">{practiceAccuracyTrend.weeklyProgress >= 0 ? '+' : ''}{practiceAccuracyTrend.weeklyProgress}%</span>
            </div>
            <div className="text-xs text-[#818181]">
              {practiceAccuracyTrend.dailyAccuracy.filter(acc => acc > 0).length} active days
            </div>
          </div>
        </div>

        {/* Practice Speed Trend */}
        <div className="bg-[#212124] p-6 rounded-lg border border-[#facb25]/20">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-xl font-bold text-[#facb25]">Practice Speed</h3>
              <p className="text-xs text-yellow-400 mt-1">📊 Calculated from your practice work</p>
              {practiceSpeedTrend.currentSpeed === 0 && (
                <p className="text-xs text-[#818181] mt-1">Complete some practice to see your speed!</p>
              )}
            </div>
            <div className="text-right">
              <div className="text-2xl font-extrabold text-blue-400">{practiceSpeedTrend.currentSpeed}</div>
              <div className="text-xs text-[#818181]">Problems/Minute</div>
            </div>
          </div>
          <LineChart
            data={practiceSpeedTrend.dailySpeed}
            labels={practiceSpeedTrend.labels}
            stroke="#facb25"
            gradientColors={{ start: "#facb25", end: "#d4a017" }}
            yTicks={practiceSpeedTrend.dailySpeed}
            valueFormatter={(v) => `${v}`}
          />
          <div className="flex justify-between text-[10px] text-gray-400 mt-1">
            <span>6d ago</span>
            <span>Today</span>
          </div>
          <div className="mt-3 flex items-center justify-between">
            <div className="text-sm text-blue-300 font-semibold">
              Weekly Progress <span className="text-white">{practiceSpeedTrend.weeklyProgress >= 0 ? '+' : ''}{practiceSpeedTrend.weeklyProgress}</span>
            </div>
            <div className="text-xs text-gray-400">
              {practiceSpeedTrend.dailySpeed.filter(speed => speed > 0).length} active days
            </div>
          </div>
        </div>

        {/* PvP Accuracy Trend */}
        <div className="bg-[#212124] p-6 rounded-lg border border-[#facb25]/20">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-xl font-bold text-[#facb25]">PvP Accuracy</h3>
              <p className="text-xs text-yellow-400 mt-1">📊 Calculated from your PvP battles</p>
              {pvpAccuracyTrend.currentAccuracy === 0 && (
                <p className="text-xs text-[#818181] mt-1">Complete some PvP battles to see your progress!</p>
              )}
            </div>
            <div className="text-right">
              <div className="text-2xl font-extrabold text-green-400">{pvpAccuracyTrend.currentAccuracy}%</div>
              <div className="text-xs text-[#818181]">Current Accuracy</div>
            </div>
          </div>
          <LineChart
            data={pvpAccuracyTrend.dailyAccuracy}
            labels={pvpAccuracyTrend.labels}
            stroke="#facb25"
            gradientColors={{ start: "#facb25", end: "#d4a017" }}
            yTicks={pvpAccuracyTrend.dailyAccuracy}
            valueFormatter={(v) => `${v}% Accuracy`}
          />
          <div className="flex justify-between text-[10px] text-[#818181] mt-1">
            <span>6d ago</span>
            <span>Today</span>
          </div>
          <div className="mt-3 flex items-center justify-between">
            <div className="text-sm text-green-300 font-semibold">
              Weekly Progress <span className="text-white">{pvpAccuracyTrend.weeklyProgress >= 0 ? '+' : ''}{pvpAccuracyTrend.weeklyProgress}%</span>
            </div>
            <div className="text-xs text-[#818181]">
              {pvpAccuracyTrend.dailyAccuracy.filter(acc => acc > 0).length} active days
            </div>
          </div>
        </div>

        {/* PvP Speed Trend */}
        <div className="bg-[#212124] p-6 rounded-lg border border-[#facb25]/20">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-xl font-bold text-[#facb25]">PvP Speed</h3>
              <p className="text-xs text-yellow-400 mt-1">📊 Calculated from your PvP battles</p>
              {pvpSpeedTrend.currentSpeed === 0 && (
                <p className="text-xs text-[#818181] mt-1">Complete some PvP battles to see your speed!</p>
              )}
            </div>
            <div className="text-right">
              <div className="text-2xl font-extrabold text-blue-400">{pvpSpeedTrend.currentSpeed}</div>
              <div className="text-xs text-[#818181]">Problems/Minute</div>
            </div>
          </div>
          <LineChart
            data={pvpSpeedTrend.dailySpeed}
            labels={pvpSpeedTrend.labels}
            stroke="#facb25"
            gradientColors={{ start: "#facb25", end: "#d4a017" }}
            yTicks={pvpSpeedTrend.dailySpeed}
            valueFormatter={(v) => `${v}`}
          />
          <div className="flex justify-between text-[10px] text-gray-400 mt-1">
            <span>6d ago</span>
            <span>Today</span>
          </div>
          <div className="mt-3 flex items-center justify-between">
            <div className="text-sm text-blue-300 font-semibold">
              Weekly Progress <span className="text-white">{pvpSpeedTrend.weeklyProgress >= 0 ? '+' : ''}{pvpSpeedTrend.weeklyProgress}</span>
            </div>
            <div className="text-xs text-gray-400">
              {pvpSpeedTrend.dailySpeed.filter(speed => speed > 0).length} active days
            </div>
          </div>
        </div>
      </div>

      {/* New Progress Components */}
      <div className="grid grid-cols-1 tablet:grid-cols-2 desktop:grid-cols-4 gap-6">
        <FavoriteModeCard />
        <ClassRankCard />
        <LeaderboardsCard />
        <ModeDistributionCard />
      </div>

      {/* Activity Summary
      {(practiceAccuracyTrend.currentAccuracy > 0 || pvpAccuracyTrend.currentAccuracy > 0) && (
        <div className="bg-[#1b1b1b] p-4 rounded-lg border border-lightGold">
          <div className="flex items-center justify-center gap-6 text-sm">
            <div className="text-center">
              <div className="text-lg font-bold text-green-400">
                {practiceStatsCalculated.problemsSolved || 0}
              </div>
              <div className="text-gray-400">Practice Problems Solved</div>
            </div>
            <div className="text-center">
              <div className="text-lg font-bold text-blue-400">
                {practiceStatsCalculated.practiceMinutes || 0}
              </div>
              <div className="text-gray-400">Practice Minutes</div>
            </div>
            <div className="text-center">
              <div className="text-lg font-bold text-purple-400">
                0
              </div>
              <div className="text-gray-400">PvP Battles Won</div>
            </div>
          </div>
        </div>
      )} */}

      {/* Detailed Progress */}
      <div className="bg-[#1b1b1b] p-6 rounded-lg border border-lightGold">
        <h3 className="text-xl font-bold text-gold mb-4">Detailed Progress</h3>
        <div className="flex flex-col gap-6">
          {(progress || []).map((levelProgress, index) => (
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