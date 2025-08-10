import { FC, useMemo, useEffect, useState } from 'react';
import { FaTrophy, FaStar, FaMedal, FaCrown, FaFire, FaRocket } from 'react-icons/fa';
import { BiTargetLock } from 'react-icons/bi';
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
import AchievementsSection from '@components/sections/student/dashboard/AchievementsSection';
import AchievementsModal from '@components/organisms/AchievementsModal';
import { ACHIEVEMENTS } from '@constants/achievements';
import { STUDENT_ROADMAP } from '@constants/routes';

import styles from './index.module.css';

export interface StudentProgressSectionProps {
  batchName: string;
  progress: LevelProgress[];
  practiceStats?: PracticeStats;
}

const StudentProgressSection: FC<StudentProgressSectionProps> = ({
  batchName,
  progress,
  practiceStats,
}) => {
  const navigate = useNavigate();
  const { calculateProgressStats, checkAndUnlockAchievements, getMotivationalMessage } = useGamification();
  const [showAchievements, setShowAchievements] = useState(false);

  // Calculate overall progress statistics
  const progressStats = useMemo(() => {
    return calculateProgressStats(progress);
  }, [progress, calculateProgressStats]);

  // Check and unlock achievements when progress changes
  useEffect(() => {
    checkAndUnlockAchievements(progressStats);
  }, [progressStats, checkAndUnlockAchievements]);

  // Calculate achievements
  const achievements = useMemo(() => {
    const achievements = [];
    
    if (progressStats.completedLevels >= 1) {
      achievements.push({
        id: 'first-level',
        title: 'First Steps',
        description: 'Completed your first level!',
        icon: FaStar,
        color: 'text-yellow-400',
        bgColor: 'bg-yellow-400/10',
      });
    }
    
    if (progressStats.completedLevels >= 3) {
      achievements.push({
        id: 'three-levels',
        title: 'Getting Stronger',
        description: 'Completed 3 levels!',
        icon: FaMedal,
        color: 'text-blue-400',
        bgColor: 'bg-blue-400/10',
      });
    }
    
    if (progressStats.averageScore >= 80) {
      achievements.push({
        id: 'high-scorer',
        title: 'High Achiever',
        description: 'Maintaining excellent scores!',
        icon: FaTrophy,
        color: 'text-purple-400',
        bgColor: 'bg-purple-400/10',
      });
    }
    
    if (progressStats.overallProgress >= 50) {
      achievements.push({
        id: 'halfway',
        title: 'Halfway There!',
        description: 'Completed 50% of your journey!',
        icon: BiTargetLock,
        color: 'text-green-400',
        bgColor: 'bg-green-400/10',
      });
    }
    
    if (progressStats.overallProgress >= 75) {
      achievements.push({
        id: 'almost-there',
        title: 'Almost There!',
        description: '75% complete - you\'re almost done!',
        icon: FaRocket,
        color: 'text-orange-400',
        bgColor: 'bg-orange-400/10',
      });
    }
    
    if (progressStats.overallProgress >= 100) {
      achievements.push({
        id: 'champion',
        title: 'Champion!',
        description: 'Completed all levels!',
        icon: FaCrown,
        color: 'text-yellow-500',
        bgColor: 'bg-yellow-500/10',
      });
    }
    
    return achievements;
  }, [progressStats]);

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
            <h1 className="text-3xl font-bold text-gold mb-2">Your Learning Journey</h1>
            <p className="text-lg text-gray-300">
              <span className="font-medium text-grey">Batch: </span>
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
        <div className="bg-[#1b1b1b] p-6 rounded-lg border border-lightGold">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full flex items-center justify-center">
              <FaFire className="text-white" />
            </div>
            <div>
              <p className="text-2xl font-bold text-white">{progressStats.overallProgress}%</p>
              <p className="text-sm text-gray-300">Overall Progress</p>
            </div>
          </div>
          <ProgressBar percentage={progressStats.overallProgress} type="blue" />
        </div>

        <div className="bg-[#1b1b1b] p-6 rounded-lg border border-lightGold">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-10 h-10 bg-gradient-to-r from-green-500 to-blue-500 rounded-full flex items-center justify-center">
              <FaTrophy className="text-white" />
            </div>
            <div>
              <p className="text-2xl font-bold text-white">{progressStats.completedLevels}/{progressStats.totalLevels}</p>
              <p className="text-sm text-gray-300">Levels Completed</p>
            </div>
          </div>
          <ProgressBar percentage={(progressStats.completedLevels / progressStats.totalLevels) * 100} type="green" />
        </div>

        <div className="bg-[#1b1b1b] p-6 rounded-lg border border-lightGold">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-10 h-10 bg-gradient-to-r from-yellow-500 to-orange-500 rounded-full flex items-center justify-center">
              <FaStar className="text-white" />
            </div>
            <div>
              <p className="text-2xl font-bold text-white">{progressStats.averageScore}%</p>
              <p className="text-sm text-gray-300">Average Score</p>
            </div>
          </div>
          <ProgressBar percentage={progressStats.averageScore} type="yellow" />
        </div>

        <div className="bg-[#1b1b1b] p-6 rounded-lg border border-lightGold">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-10 h-10 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full flex items-center justify-center">
              <FaMedal className="text-white" />
            </div>
            <div>
              <p className="text-2xl font-bold text-white">{progressStats.completedClasses}/{progressStats.totalClasses}</p>
              <p className="text-sm text-gray-300">Classes Completed</p>
            </div>
          </div>
          <ProgressBar percentage={(progressStats.completedClasses / progressStats.totalClasses) * 100} type="purple" />
        </div>
      </div>

      {/* Weekly Goals */}
      <div className="bg-[#1b1b1b] p-6 rounded-lg border border-lightGold">
        <WeeklyGoalsSection 
          sessionsCompleted={practiceStats?.recentSessions || 0}
          sessionsTotal={5}
          practiceMinutes={Math.floor((practiceStats?.totalPracticeTime || 0) / 60)}
          practiceTargetMinutes={240}
          problemsSolved={practiceStats?.totalProblemsSolved || 0}
          problemsTarget={300}
        />
      </div>

      {/* Pinned Achievements (compact) + modal trigger */}
      <div className="bg-[#1b1b1b] p-6 rounded-lg border border-lightGold">
        <AchievementsSection
          compact
          items={ACHIEVEMENTS.slice(0, 6)}
          onViewAll={() => setShowAchievements(true)}
        />
      </div>

      {/* Motivational Message */}
      <div 
        className="bg-gradient-to-r from-blue-500/10 to-purple-500/10 p-6 rounded-lg border border-blue-500/30 cursor-pointer hover:from-blue-500/20 hover:to-purple-500/20 transition-all duration-300"
        onClick={() => navigate(STUDENT_ROADMAP)}
      >
        <div className="text-center">
          <p className="text-lg text-white font-medium">{motivationalMessage}</p>
        </div>
      </div>

      

      {/* Achievements Section */}
      {achievements.length > 0 && (
        <div className="bg-[#1b1b1b] p-6 rounded-lg border border-lightGold">
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
      )}

      {/* Trend Cards (line charts) */}
      <div className="grid grid-cols-1 tablet:grid-cols-2 gap-6">
        {/* Accuracy Trend */}
        <div className="bg-[#1b1b1b] p-6 rounded-lg border border-lightGold">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-xl font-bold text-gold">Accuracy Trend</h3>
            <div className="text-right">
              <div className="text-2xl font-extrabold text-green-400">92%</div>
              <div className="text-xs text-gray-400">Current Accuracy</div>
            </div>
          </div>
          <LineChart
            data={[70, 78, 86, 94, 100]}
            labels={["7d ago", "", "", "", "Today"]}
            stroke="#f59e0b"
            fill="rgba(245,158,11,0.12)"
            yTicks={[70, 78, 86, 94, 100]}
            valueFormatter={(v) => `${v}% Accuracy`}
          />
          <div className="flex justify-between text-[10px] text-gray-400 mt-1">
            <span>7d ago</span>
            <span>Today</span>
          </div>
          <div className="mt-3 text-sm text-green-300 font-semibold">Weekly Progress <span className="text-white">+14%</span> this week</div>
        </div>

        {/* Speed Trend */}
        <div className="bg-[#1b1b1b] p-6 rounded-lg border border-lightGold">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-xl font-bold text-gold">Speed Trend</h3>
            <div className="text-right">
              <div className="text-2xl font-extrabold text-blue-400">65</div>
              <div className="text-xs text-gray-400">Problems/Minute</div>
            </div>
          </div>
          <LineChart
            data={[40, 48, 56, 64, 70]}
            labels={["7d ago", "", "", "", "Today"]}
            stroke="#f59e0b"
            fill="rgba(245,158,11,0.12)"
            yTicks={[40, 48, 56, 64, 70]}
            valueFormatter={(v) => `${v}`}
          />
          <div className="flex justify-between text-[10px] text-gray-400 mt-1">
            <span>7d ago</span>
            <span>Today</span>
          </div>
          <div className="mt-3 text-sm text-blue-300 font-semibold">Weekly Progress <span className="text-white">+20</span> this week</div>
        </div>
      </div>

      

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
