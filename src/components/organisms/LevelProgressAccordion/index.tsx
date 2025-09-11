import { FC, useState, useMemo } from 'react';
import { FaAngleDown, FaAngleUp, FaTrophy, FaStar, FaMedal, FaCrown, FaCheckCircle, FaLock } from 'react-icons/fa';

import ClassProgressAccordion from '@components/organisms/ClassProgressAccordion';
import ProgressBar from '@components/atoms/ProgressBar';

import { LevelProgress } from '@interfaces/apis/teacher';
import { getLevelName } from '@helpers/levelNames';

import styles from './index.module.css';

export interface LevelProgressAccordionProps {
  levelProgress: LevelProgress;
}

const LevelProgressAccordion: FC<LevelProgressAccordionProps> = ({
  levelProgress,
}) => {
  const [isOpen, setIsOpen] = useState(false);

  // Calculate level completion status
  const levelStats = useMemo(() => {
    const totalClasses = levelProgress.classes.length;
    const completedClasses = levelProgress.classes.filter(cls => {
      // A class is completed if it has a test score OR if it has any topic progress
      if (cls.Test > 0) return true;
      
      // Check if any topics have classwork or homework completed
      return cls.topics.some(topic => topic.Classwork > 0 || topic.Homework > 0);
    }).length;
    const classProgress = (completedClasses / totalClasses) * 100;
    
    const isLevelCompleted = levelProgress.FinalTest > 0 && levelProgress.OralTest > 0;
    const averageScore = isLevelCompleted ? 
      Math.round((levelProgress.FinalTest + levelProgress.OralTest) / 2) : 0;
    
    return {
      totalClasses,
      completedClasses,
      classProgress,
      isLevelCompleted,
      averageScore,
    };
  }, [levelProgress]);

  // Get level achievement
  const getLevelAchievement = () => {
    if (!levelStats.isLevelCompleted) return null;
    
    if (levelStats.averageScore >= 95) {
      return {
        icon: FaCrown,
        title: 'Perfect Score!',
        color: 'text-yellow-500',
        bgColor: 'bg-yellow-500/10',
      };
    }
    
    if (levelStats.averageScore >= 90) {
      return {
        icon: FaTrophy,
        title: 'Excellent!',
        color: 'text-purple-400',
        bgColor: 'bg-purple-400/10',
      };
    }
    
    if (levelStats.averageScore >= 80) {
      return {
        icon: FaMedal,
        title: 'Great Job!',
        color: 'text-blue-400',
        bgColor: 'bg-blue-400/10',
      };
    }
    
    if (levelStats.averageScore >= 70) {
      return {
        icon: FaStar,
        title: 'Good Work!',
        color: 'text-green-400',
        bgColor: 'bg-green-400/10',
      };
    }
    
    return {
      icon: FaCheckCircle,
      title: 'Completed!',
      color: 'text-gray-400',
      bgColor: 'bg-gray-400/10',
    };
  };

  const achievement = getLevelAchievement();

  return (
    <div
      className={`${styles.levelAccordion} relative p-6 border border-lightGold w-full rounded-lg ${
        levelStats.isLevelCompleted ? 'bg-gradient-to-r from-[#1b1b1b] to-[#2a2a2a]' : 'bg-[#1b1b1b]'
      }`}
    >
      <div className="tablet:gap-10 flex tablet:flex-row flex-col gap-5">
        <div
          role="button"
          tabIndex={0}
          className="flex-1"
          onClick={() => setIsOpen(!isOpen)}
          onKeyDown={() => setIsOpen(!isOpen)}
        >
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-3">
              {levelStats.isLevelCompleted ? (
                <div className="w-10 h-10 bg-gradient-to-r from-green-500 to-blue-500 rounded-full flex items-center justify-center">
                  <FaCheckCircle className="text-white text-lg" />
                </div>
              ) : (
                <div className="w-10 h-10 bg-gradient-to-r from-gray-500 to-gray-600 rounded-full flex items-center justify-center">
                  <FaLock className="text-white text-lg" />
                </div>
              )}
              <div>
                <p className="font-medium text-lg text-white">{getLevelName(levelProgress.levelId)}</p>
                <p className="text-sm text-gray-300">
                  {levelStats.completedClasses}/{levelStats.totalClasses} classes completed
                </p>
              </div>
            </div>
            
            {achievement && (
              <div className={`px-3 py-1 rounded-full border ${achievement.bgColor} ${achievement.color} border-current`}>
                <div className="flex items-center gap-2">
                  <achievement.icon className="text-sm" />
                  <span className="text-xs font-medium">{achievement.title}</span>
                </div>
              </div>
            )}
          </div>
        </div>
        
        <div className="tablet:right-0 tablet:top-0 top-7 right-6 absolute tablet:relative flex justify-center items-center cursor-pointer">
          {isOpen ? (
            <FaAngleUp className="text-lg text-gray-300" onClick={() => setIsOpen(!isOpen)} />
          ) : (
            <FaAngleDown
              className="text-lg text-gray-300"
              onClick={() => setIsOpen(!isOpen)}
            />
          )}
        </div>
      </div>

      {/* Level Progress Overview */}
      <div className="mt-4 mb-4">
        <div className="flex items-center justify-between mb-2">
          <span className="text-sm text-gray-300">Class Progress</span>
          <span className="text-sm font-medium text-white">{Math.round(levelStats.classProgress)}%</span>
        </div>
        <ProgressBar percentage={levelStats.classProgress} type="blue" />
      </div>

      {levelStats.isLevelCompleted && (
        <div className="mb-4">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm text-gray-300">Level Score</span>
            <span className="text-sm font-medium text-white">{levelStats.averageScore}%</span>
          </div>
          <ProgressBar percentage={levelStats.averageScore} type="yellow" />
        </div>
      )}

      <div className={`${isOpen ? 'block' : 'hidden'}`}>
        <div className="pt-6">
          <hr className="border border-[#b3b3b3] outline-none" />
          <div className="tablet:px-1 flex tablet:flex-row flex-col gap-4 pt-4 pb-0">
            <div className="flex flex-col flex-1 gap-4">
              <div className="tablet:mt-0 flex flex-col gap-5 py-4">
                {levelProgress.classes.map((classProgress, index) => {
                  return (
                    <div key={index} className="">
                      <ClassProgressAccordion classProgress={classProgress} />
                      <hr className="mt-2 border border-[#3D3D3D] outline-none" />
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
          
          {/* Level Tests Section */}
          <div className="mt-6 p-4 bg-[#2a2a2a] rounded-lg">
            <h4 className="text-lg font-semibold text-white mb-4">Level Tests</h4>
            <div className="grid grid-cols-1 tablet:grid-cols-2 gap-4">
              <div className="flex items-center justify-between p-3 bg-[#1b1b1b] rounded-lg">
                <div className="flex items-center gap-3">
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                    levelProgress.OralTest > 0 ? 'bg-green-500' : 'bg-gray-600'
                  }`}>
                    {levelProgress.OralTest > 0 ? (
                      <FaCheckCircle className="text-white text-sm" />
                    ) : (
                      <FaLock className="text-white text-sm" />
                    )}
                  </div>
                  <div>
                    <p className="font-medium text-white">Oral Test</p>
                    <p className="text-sm text-gray-300">
                      {levelProgress.OralTest > 0 ? `${levelProgress.OralTest}%` : 'Not completed'}
                    </p>
                  </div>
                </div>
                {levelProgress.OralTest > 0 && (
                  <ProgressBar percentage={levelProgress.OralTest} type="green" />
                )}
              </div>
              
              <div className="flex items-center justify-between p-3 bg-[#1b1b1b] rounded-lg">
                <div className="flex items-center gap-3">
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                    levelProgress.FinalTest > 0 ? 'bg-green-500' : 'bg-gray-600'
                  }`}>
                    {levelProgress.FinalTest > 0 ? (
                      <FaCheckCircle className="text-white text-sm" />
                    ) : (
                      <FaLock className="text-white text-sm" />
                    )}
                  </div>
                  <div>
                    <p className="font-medium text-white">Final Test</p>
                    <p className="text-sm text-gray-300">
                      {levelProgress.FinalTest > 0 ? `${levelProgress.FinalTest}%` : 'Not completed'}
                    </p>
                  </div>
                </div>
                {levelProgress.FinalTest > 0 && (
                  <ProgressBar percentage={levelProgress.FinalTest} type="purple" />
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LevelProgressAccordion;
