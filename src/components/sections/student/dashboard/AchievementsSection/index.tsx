import { FC } from 'react';
import { Link } from 'react-router-dom';
import { STUDENT_PROGRESS } from '@constants/routes';

export interface AchievementsSectionProps {
  className?: string;
  onViewAll?: () => void;
  compact?: boolean;
  items?: Array<{ id: number; name: string; icon: string; unlocked: boolean; description: string }>;
}

const AchievementsSection: FC<AchievementsSectionProps> = ({ className = '', onViewAll, compact = false, items }) => {
  const achievements = [
    { id: 1, name: 'First Steps', icon: '👣', unlocked: true, description: 'Complete your first lesson' },
    { id: 2, name: 'Speed Demon', icon: '⚡', unlocked: true, description: 'Complete 5 sessions in a day' },
    { id: 3, name: 'Champion', icon: '🏆', unlocked: false, description: 'Reach Eternal Realm' },
    { id: 4, name: 'Streak Master', icon: '🔥', unlocked: true, description: 'Maintain 7-day streak' },
    { id: 5, name: 'Math Wizard', icon: '🧙‍♂️', unlocked: false, description: 'Achieve 95% accuracy' },
    { id: 6, name: 'Time Traveler', icon: '⏰', unlocked: false, description: 'Spend 10 hours learning' },
  ];

  const containerPad = compact ? 'p-0' : '';
  const headingClass = compact ? 'text-lg mb-3' : 'text-2xl mb-6';
  const gridClass = compact ? 'grid grid-cols-3 gap-2' : 'grid grid-cols-3 gap-3';
  const cardPad = compact ? 'p-2' : 'p-3';
  const sourceItems = items ?? achievements;
  const shown = compact ? sourceItems.slice(0, 6) : sourceItems;

  return (
    <div className={`text-white ${className} ${containerPad}`}>
      <div className={`flex items-center justify-between ${compact ? 'mb-3' : 'mb-6'}`}>
        <h2 className={`${headingClass} font-bold flex items-center text-white m-0`}>
          <span className="mr-2">🏆</span>
          Lightning Achievements
        </h2>
      </div>
      <div className={`${gridClass} ${compact ? '' : 'mb-6'}`}>
        {shown.map((achievement) => (
          <div 
            key={achievement.id}
            className={`${cardPad} rounded-xl border transition-all duration-300 shadow-[0_8px_22px_rgba(0,0,0,0.45)] backdrop-blur-md ring-1 ring-white/5 ${
              achievement.unlocked 
                ? 'bg-[#080808]/80 hover:bg-[#191919] border-gold/60 hover:border-gold hover:scale-105 hover:shadow-[0_0_30px_rgba(255,186,8,0.25)]' 
                : 'bg-[#080808] hover:bg-[#191919] border-gold/40 opacity-50 hover:border-gold/60'
            }`}
          >
            <div className="text-center">
              <div className={`text-2xl ${compact ? '' : 'mb-1'} ${achievement.unlocked ? '' : 'grayscale'}`}>
                {achievement.icon}
              </div>
              <h3 className={`text-xs font-bold mb-1 ${
                achievement.unlocked ? 'text-white' : 'text-gray-400'
              }`}>
                {achievement.name}
              </h3>
              {!compact && (
              <p className={`text-xs ${
                achievement.unlocked ? 'text-gray-300' : 'text-gray-500'
              }`}>
                {achievement.description}
              </p>
              )}
            </div>
          </div>
        ))}
      </div>
      <div className="flex justify-center">
        {onViewAll ? (
          <button onClick={onViewAll} className={`inline-block bg-[#080808]/80 hover:bg-[#191919] text-white ${compact ? 'text-xs px-3 py-2' : 'px-6 py-3'} rounded-xl font-semibold border border-gold/50 transition-colors shadow-[0_10px_28px_rgba(0,0,0,0.55)] ring-1 ring-white/5 backdrop-blur-md`}>
            {compact ? 'View more' : 'View All Achievements ⚡'}
          </button>
        ) : (
          <Link to={STUDENT_PROGRESS} className="inline-block">
            <div className={`bg-[#080808]/80 hover:bg-[#191919] text-white ${compact ? 'text-xs px-3 py-2' : 'px-6 py-3'} rounded-xl font-semibold border border-gold/50 transition-colors shadow-[0_10px_28px_rgba(0,0,0,0.55)] ring-1 ring-white/5 backdrop-blur-md`}>
              {compact ? 'View more' : 'View All Achievements ⚡'}
            </div>
          </Link>
        )}
      </div>
    </div>
  );
};

export default AchievementsSection; 