import { FC } from 'react';
import { AiOutlineFire } from 'react-icons/ai';
import { useStreakStore } from '@store/streakStore';

export interface StreakCardProps {
  className?: string;
}

const StreakCard: FC<StreakCardProps> = ({ className = '' }) => {
  const { currentStreak } = useStreakStore();
  return (
    <div className={`bg-[#1b1b1b] text-white p-4 rounded-lg ${className}`}>
      <div className="flex items-center space-x-3">
        <div className="flex items-center justify-center w-12 h-12 bg-gradient-to-r from-orange-500 to-red-500 rounded-full">
          <AiOutlineFire size={24} className="text-white" />
        </div>
        <div>
          <p className="text-2xl font-bold">{currentStreak}</p>
          <p className="text-sm text-gray-300">
            {currentStreak === 1 ? 'Day Streak' : 'Days Streak'}
          </p>
        </div>
      </div>
      <p className="text-xs mt-2 text-gray-400">
        {currentStreak === 0 ? 'Start your learning journey!' : 'Keep up the great work!'}
      </p>
    </div>
  );
};

export default StreakCard; 