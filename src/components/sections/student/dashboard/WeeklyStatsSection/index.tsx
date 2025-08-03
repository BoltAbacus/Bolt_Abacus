import { FC } from 'react';

export interface WeeklyStatsSectionProps {
  className?: string;
}

const WeeklyStatsSection: FC<WeeklyStatsSectionProps> = ({ className = '' }) => {
  const stats = [
    { label: 'Sessions', value: '12', icon: '📊' },
    { label: 'Accuracy', value: '87%', icon: '🎯' },
    { label: 'Time Spent', value: '4h 0m', icon: '⏱️' },
  ];

  return (
    <div className={`text-white ${className}`}>
      <h2 className="text-2xl font-bold mb-6 flex items-center bg-gradient-to-r from-purple-300 to-pink-300 bg-clip-text text-transparent">
        <span className="mr-2">📊</span>
        This Week's Power
      </h2>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {stats.map((stat, index) => (
                     <div key={index} className="bg-[#1b1b1b] p-4 rounded-lg border border-gray-700 hover:border-[#FFD700] transition-all duration-300 hover:shadow-lg hover:shadow-[#FFD700]/30 group">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <span className="text-2xl">{stat.icon}</span>
                <span className="text-sm text-gray-400 font-medium">{stat.label}</span>
              </div>
              <div className="text-2xl font-bold text-white">
                {stat.value}
              </div>
            </div>
          </div>
        ))}
      </div>
      
      <div className="mt-6 p-4 bg-gradient-to-r from-blue-600/20 to-purple-600/20 rounded-lg border border-blue-500/30">
        <p className="text-sm text-gray-300 text-center font-semibold">
          Keep up the great work!
        </p>
      </div>
    </div>
  );
};

export default WeeklyStatsSection; 