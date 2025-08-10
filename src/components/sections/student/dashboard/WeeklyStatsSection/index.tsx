import { FC } from 'react';

export interface WeeklyStatsSectionProps {
  className?: string;
  sessions?: number;
  accuracy?: number;
  timeSpent?: number;
}

const WeeklyStatsSection: FC<WeeklyStatsSectionProps> = ({ 
  className = '', 
  sessions = 0, 
  accuracy = 0, 
  timeSpent = 0 
}) => {
  const stats = [
    { label: 'Sessions', value: sessions.toString(), icon: '📊' },
    { label: 'Accuracy', value: `${accuracy}%`, icon: '🎯' },
    { label: 'Time Spent', value: `${timeSpent}h 0m`, icon: '⏱️' },
  ];

  return (
    <div className={`text-white ${className}`}>
      <h2 className="text-2xl font-bold mb-6 flex items-center text-white">
        <span className="mr-2">📊</span>
        This Week's Power
      </h2>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {stats.map((stat, index) => (
          <div key={index} className="bg-[#080808]/80 hover:bg-[#191919] p-4 rounded-lg border border-gold/40 ring-1 ring-white/5 hover:border-gold transition-all duration-300 shadow-[0_8px_24px_rgba(0,0,0,0.5)] hover:shadow-[0_0_28px_rgba(255,186,8,0.25)] group backdrop-blur-md">
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
      
      <div className="mt-6 p-4 bg-[#080808]/80 hover:bg-[#191919] rounded-lg border border-gold/30 ring-1 ring-white/5 backdrop-blur-md">
        <p className="text-sm text-white text-center font-semibold">
          Keep up the great work!
        </p>
      </div>
    </div>
  );
};

export default WeeklyStatsSection; 