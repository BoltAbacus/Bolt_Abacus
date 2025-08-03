import { FC } from 'react';

export interface AchievementsSectionProps {
  className?: string;
}

const AchievementsSection: FC<AchievementsSectionProps> = ({ className = '' }) => {
  const achievements = [
    { id: 1, name: 'First Steps', icon: '👣', unlocked: true, description: 'Complete your first lesson' },
    { id: 2, name: 'Speed Demon', icon: '⚡', unlocked: true, description: 'Complete 5 sessions in a day' },
    { id: 3, name: 'Champion', icon: '🏆', unlocked: false, description: 'Reach level 10' },
    { id: 4, name: 'Streak Master', icon: '🔥', unlocked: true, description: 'Maintain 7-day streak' },
    { id: 5, name: 'Math Wizard', icon: '🧙‍♂️', unlocked: false, description: 'Achieve 95% accuracy' },
    { id: 6, name: 'Time Traveler', icon: '⏰', unlocked: false, description: 'Spend 10 hours learning' },
  ];

  return (
    <div className={`text-white ${className}`}>
      <h2 className="text-2xl font-bold mb-6 flex items-center bg-gradient-to-r from-yellow-300 to-orange-300 bg-clip-text text-transparent">
        <span className="mr-2">🏆</span>
        Lightning Achievements
      </h2>
      
      <div className="grid grid-cols-3 gap-3 mb-6">
        {achievements.map((achievement) => (
          <div 
            key={achievement.id} 
            className={`p-3 rounded-xl border transition-all duration-300 ${
              achievement.unlocked 
                ? 'bg-gradient-to-br from-yellow-500/20 to-orange-500/20 border-yellow-500/30 hover:border-[#FFD700] hover:scale-105 hover:shadow-lg hover:shadow-[#FFD700]/30' 
                : 'bg-[#1b1b1b] border-gray-700 opacity-50 hover:border-[#FFD700]/50'
            }`}
          >
            <div className="text-center">
              <div className={`text-2xl mb-1 ${achievement.unlocked ? '' : 'grayscale'}`}>
                {achievement.icon}
              </div>
              <h3 className={`text-xs font-bold mb-1 ${
                achievement.unlocked ? 'text-white' : 'text-gray-400'
              }`}>
                {achievement.name}
              </h3>
              <p className={`text-xs ${
                achievement.unlocked ? 'text-gray-300' : 'text-gray-500'
              }`}>
                {achievement.description}
              </p>
            </div>
          </div>
        ))}
      </div>
      
      <div className="text-center">
        <button className="bg-gradient-to-r from-yellow-500 to-orange-500 hover:from-yellow-600 hover:to-orange-600 text-white px-6 py-3 rounded-lg font-semibold transition-all duration-300 transform hover:scale-105 shadow-lg hover:shadow-yellow-500/25">
          View All Achievements ⚡
        </button>
      </div>
    </div>
  );
};

export default AchievementsSection; 