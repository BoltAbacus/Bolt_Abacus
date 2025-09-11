import { FC, useState, useMemo } from 'react';
import { FaAngleDown, FaAngleUp, FaTrophy, FaStar, FaMedal, FaCheckCircle, FaLock, FaClock } from 'react-icons/fa';

import ResultBox from '@components/atoms/ResultBox';
import ProgressBar from '@components/atoms/ProgressBar';

import { ClassProgress } from '@interfaces/apis/teacher';

export interface ClassProgressAccordionProps {
  classProgress: ClassProgress;
}

const ClassProgressAccordion: FC<ClassProgressAccordionProps> = ({
  classProgress,
}) => {
  const [isOpen, setIsOpen] = useState(true);

  // Calculate class completion status
  const classStats = useMemo(() => {
    const totalTopics = classProgress.topics.length;
    const completedTopics = classProgress.topics.filter(topic => 
      topic.Classwork > 0 || topic.Homework > 0
    ).length;
    const topicProgress = (completedTopics / totalTopics) * 100;
    
    const isClassCompleted = classProgress.Test > 0 || completedTopics > 0;
    const averageTopicScore = classProgress.topics.reduce((sum, topic) => {
      const topicScore = topic.Classwork > 0 ? topic.Classwork : topic.Homework;
      return sum + topicScore;
    }, 0) / totalTopics || 0;
    
    return {
      totalTopics,
      completedTopics,
      topicProgress,
      isClassCompleted,
      averageTopicScore: Math.round(averageTopicScore),
      testScore: classProgress.Test,
    };
  }, [classProgress]);

  // Get class achievement
  const getClassAchievement = () => {
    if (!classStats.isClassCompleted) return null;
    
    if (classStats.testScore >= 95) {
      return {
        icon: FaTrophy,
        title: 'Perfect!',
        color: 'text-yellow-500',
        bgColor: 'bg-yellow-500/10',
      };
    }
    
    if (classStats.testScore >= 90) {
      return {
        icon: FaStar,
        title: 'Excellent!',
        color: 'text-purple-400',
        bgColor: 'bg-purple-400/10',
      };
    }
    
    if (classStats.testScore >= 80) {
      return {
        icon: FaMedal,
        title: 'Great!',
        color: 'text-blue-400',
        bgColor: 'bg-blue-400/10',
      };
    }
    
    if (classStats.testScore >= 70) {
      return {
        icon: FaCheckCircle,
        title: 'Good!',
        color: 'text-green-400',
        bgColor: 'bg-green-400/10',
      };
    }
    
    return {
      icon: FaCheckCircle,
      title: 'Completed',
      color: 'text-gray-400',
      bgColor: 'bg-gray-400/10',
    };
  };

  const achievement = getClassAchievement();

  return (
    <div className={`relative py-3 px-4 rounded-lg w-full border ${
      classStats.isClassCompleted ? 'border-green-500/30 bg-green-500/5' : 'border-gray-600/30'
    }`}>
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
              {classStats.isClassCompleted ? (
                <div className="w-8 h-8 bg-gradient-to-r from-green-500 to-blue-500 rounded-full flex items-center justify-center">
                  <FaCheckCircle className="text-white text-sm" />
                </div>
              ) : (
                <div className="w-8 h-8 bg-gradient-to-r from-gray-500 to-gray-600 rounded-full flex items-center justify-center">
                  <FaLock className="text-white text-sm" />
                </div>
              )}
              <div>
                <p className="font-medium text-lg text-white">Class {classProgress.classId}</p>
                <p className="text-sm text-gray-300">
                  {classStats.completedTopics}/{classStats.totalTopics} topics completed
                </p>
              </div>
            </div>
            
            {achievement && (
              <div className={`px-2 py-1 rounded-full border ${achievement.bgColor} ${achievement.color} border-current`}>
                <div className="flex items-center gap-1">
                  <achievement.icon className="text-xs" />
                  <span className="text-xs font-medium">{achievement.title}</span>
                </div>
              </div>
            )}
          </div>
        </div>
        
        <div className="tablet:right-0 tablet:top-0 top-3 right-1 absolute tablet:relative flex justify-center items-center cursor-pointer">
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

      {/* Class Progress Overview */}
      <div className="mt-3 mb-3">
        <div className="flex items-center justify-between mb-2">
          <span className="text-sm text-gray-300">Topic Progress</span>
          <span className="text-sm font-medium text-white">{Math.round(classStats.topicProgress)}%</span>
        </div>
        <ProgressBar percentage={classStats.topicProgress} type="blue" />
      </div>

      {classStats.isClassCompleted && (
        <div className="mb-3">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm text-gray-300">Test Score</span>
            <span className="text-sm font-medium text-white">{classStats.testScore}%</span>
          </div>
          <ProgressBar percentage={classStats.testScore} type="yellow" />
        </div>
      )}

      <div className={`${isOpen ? 'block' : 'hidden'}`}>
        <div className="">
          <div className="tablet:p-2 flex tablet:flex-row flex-col gap-4 pt-4 pb-0">
            <div className="flex flex-col flex-1 gap-4">
              <div className="tablet:mt-0 flex flex-col gap-3 py-4 tablet:text-lg">
                <div className="grid grid-cols-3 pb-2 text-[#6D6D6D]">
                  <div />
                  <div className="flex justify-center items-center font-semibold">
                    Classwork
                  </div>
                  <div className="flex justify-center items-center font-semibold">
                    Homework
                  </div>
                </div>
                {classProgress.topics.map((topicProgress, index) => {
                  const isTopicCompleted = topicProgress.Classwork > 0 || topicProgress.Homework > 0;
                  return (
                    <div key={index} className={`grid grid-cols-3 p-2 rounded-lg ${
                      isTopicCompleted ? 'bg-green-500/10 border border-green-500/20' : 'bg-gray-500/10'
                    }`}>
                      <div className="flex items-center text-[#6D6D6D] gap-2">
                        {isTopicCompleted ? (
                          <FaCheckCircle className="text-green-500 text-sm" />
                        ) : (
                          <FaLock className="text-gray-500 text-sm" />
                        )}
                        Topic {topicProgress.topicId}
                      </div>
                      <div className="flex justify-center items-center font-semibold">
                        <ResultBox
                          score={topicProgress.Classwork}
                          time={topicProgress.ClassworkTime}
                        />
                      </div>
                      <div className="flex justify-center items-center font-semibold">
                        <ResultBox
                          score={topicProgress.Homework}
                          time={topicProgress.HomeworkTime}
                        />
                      </div>
                    </div>
                  );
                })}
              </div>
              <div className="flex gap-10 px-1">
                <div className="flex items-center font-semibold text-[#6D6D6D] tablet:text-lg gap-2">
                  <FaClock className="text-sm" />
                  Test
                </div>
                <div className="flex justify-center items-center font-semibold">
                  <ResultBox
                    time={classProgress.Time}
                    score={classProgress.Test}
                  />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ClassProgressAccordion;
