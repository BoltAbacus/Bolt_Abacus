import { FC } from 'react';
import { AiOutlineFire } from 'react-icons/ai';
import { useStreakStore } from '@store/streakStore';

export interface StreakCardProps {
  className?: string;
}

const StreakCard: FC<StreakCardProps> = ({ className = '' }) => {
  const { currentStreak } = useStreakStore();
  return (
    <div className={`bg-[#080808]/80 hover:bg-[#191919] text-white p-4 rounded-lg border border-gold/50 ring-1 ring-white/5 backdrop-blur-md shadow-[0_8px_20px_rgba(0,0,0,0.45)] transition-colors ${className}`}>
      <div className="flex items-center space-x-3">
        <div className="flex items-center justify-center w-12 h-12 bg-gold rounded-full shadow">
          <AiOutlineFire size={20} className="text-black" />
        </div>
        <div>
          <p className="text-2xl font-bold">{currentStreak}</p>
          <p className="text-sm text-white/80">
            {currentStreak === 1 ? 'Day Streak' : 'Days Streak'}
          </p>
        </div>
      </div>
      <p className="text-xs mt-2 text-white/70">
        {currentStreak === 0 ? 'Start your learning journey!' : 'Keep up the great work!'}
      </p>
    </div>
  );
};

export default StreakCard; 