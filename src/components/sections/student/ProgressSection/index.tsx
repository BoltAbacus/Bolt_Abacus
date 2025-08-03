import { FC, useMemo, useEffect } from 'react';
import { FaTrophy, FaStar, FaMedal, FaCrown, FaFire, FaRocket } from 'react-icons/fa';
import { BiTargetLock } from 'react-icons/bi';

import { LevelProgress } from '@interfaces/apis/teacher';
import LevelProgressAccordion from '@components/organisms/LevelProgressAccordion';
import StreakCard from '@components/atoms/StreakCard';
import CoinsDisplay from '@components/atoms/CoinsDisplay';
import ProgressBar from '@components/atoms/ProgressBar';
import ProgressChart from '@components/atoms/ProgressChart';
import AchievementNotification from '@components/atoms/AchievementNotification';
import { useGamification } from '@helpers/gamification';

import styles from './index.module.css';

export interface StudentProgressSectionProps {
  batchName: string;
  progress: LevelProgress[];
}

const StudentProgressSection: FC<StudentProgressSectionProps> = ({
  batchName,
  progress,
}) => {
  const { calculateProgressStats, checkAndUnlockAchievements, getMotivationalMessage, getNextGoal } = useGamification();

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

  // Get next goal and motivational message
  const nextGoal = useMemo(() => {
    const goal = getNextGoal(progressStats);
    const iconMap = {
      'Master Achieved!': FaCrown,
      'Complete the Journey': FaRocket,
      'Reach 75%': BiTargetLock,
      'Reach 50%': FaStar,
    };
    
    return {
      ...goal,
      icon: iconMap[goal.title as keyof typeof iconMap] || FaStar,
    };
  }, [progressStats, getNextGoal]);

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

      {/* Progress Overview Dashboard */}
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

      {/* Motivational Message */}
      <div className="bg-gradient-to-r from-blue-500/10 to-purple-500/10 p-6 rounded-lg border border-blue-500/30">
        <div className="text-center">
          <p className="text-lg text-white font-medium">{motivationalMessage}</p>
        </div>
      </div>

      {/* Next Goal Card */}
      <div className="bg-gradient-to-r from-[#1b1b1b] to-[#2a2a2a] p-6 rounded-lg border border-lightGold">
        <div className="flex items-center gap-4 mb-4">
          <div className="w-12 h-12 bg-gradient-to-r from-gold to-yellow-500 rounded-full flex items-center justify-center">
            <nextGoal.icon className="text-white text-xl" />
          </div>
          <div>
            <h3 className="text-xl font-bold text-white">{nextGoal.title}</h3>
            <p className="text-gray-300">{nextGoal.description}</p>
          </div>
        </div>
        <ProgressBar percentage={nextGoal.progress} type="yellow" />
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

      {/* Progress Chart */}
      <ProgressChart progress={progress} />

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
    </div>
  );
};

export default StudentProgressSection;
