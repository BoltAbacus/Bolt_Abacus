import { FC } from 'react';

export interface WeeklyStatsSectionProps {
  className?: string;
  sessions?: number;
  accuracy?: number;
  timeSpent?: string;
}

const WeeklyStatsSection: FC<WeeklyStatsSectionProps> = ({
  className = '',
  sessions = 0,
  accuracy = 0,
  timeSpent = '0h 0m',
}) => {
  const stats = [
    { label: 'Sessions', value: sessions.toString(), icon: '📊' },
    { label: 'Accuracy', value: `${accuracy}%`, icon: '🎯' },
    { label: 'Time Spent', value: timeSpent, icon: '⏱️' },
  ];

  return (
    <div className={`text-white w-full ${className}`}>
      <h2 className="text-xl font-bold mb-6 flex items-center text-white hover:text-gold transition-colors duration-300">
        <span className="mr-2 hover:scale-125 hover:rotate-12 transition-transform duration-300">📊</span>
        This Week's Power
      </h2>
      
      <div className="grid grid-cols-1 tablet:grid-cols-3 gap-4 tablet:gap-6">
        {stats.map((stat, index) => (
          <div key={index} className="bg-[#212124] hover:bg-[#2a2a2d] p-4 rounded-lg transition-all duration-300 hover:scale-105 group min-h-[100px]">
            <div className="flex flex-col space-y-3 h-full">
              <div className="flex items-center space-x-3">
                <span className="text-2xl hover:scale-125 hover:rotate-12 transition-transform duration-300 flex-shrink-0">{stat.icon}</span>
                <span className="text-sm text-white font-medium truncate">{stat.label}</span>
              </div>
              <div className="text-2xl font-bold text-white text-center flex-1 flex items-center justify-center">
                {stat.value}
              </div>
            </div>
          </div>
        ))}
      </div>
      
      <div className="mt-6 p-4 bg-[#212124] hover:bg-[#2a2a2d] rounded-lg transition-all duration-300 hover:scale-105">
        <p className="text-sm text-white text-center font-semibold">
          
        </p>
      </div>
    </div>
  );
};

export default WeeklyStatsSection; 