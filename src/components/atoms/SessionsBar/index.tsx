import { FC } from 'react';

export interface SessionsBarProps {
  sessionsCompleted: number;
  totalSessions: number;
  className?: string;
}

const SessionsBar: FC<SessionsBarProps> = ({ 
  sessionsCompleted, 
  totalSessions, 
  className = '' 
}) => {
  const percentage = (sessionsCompleted / totalSessions) * 100;

  return (
    <div className={`text-white ${className}`}>
      <h3 className="text-xl font-bold mb-4 flex items-center bg-gradient-to-r from-blue-300 to-purple-300 bg-clip-text text-transparent">
        <span className="mr-3 text-2xl">📚</span>
        Sessions Today
      </h3>
      <p className="text-sm text-gray-300 mb-4 font-medium">
        You've completed <span className="text-blue-300 font-bold text-lg">{sessionsCompleted}</span> of <span className="text-purple-300 font-bold text-lg">{totalSessions}</span> sessions today.
      </p>
      {/* Enhanced Sessions Progress Bar */}
      <div className="w-full bg-gray-900 rounded-full h-5 shadow-inner mb-3 relative overflow-hidden border border-gray-600">
        <div 
          className="bg-gradient-to-r from-[#FFD700] via-[#FFA500] to-[#FF8C00] h-5 rounded-full transition-all duration-700 shadow-lg relative overflow-hidden"
          style={{ width: `${percentage}%` }}
        >
          <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/50 to-transparent animate-pulse"></div>
          <div className="absolute inset-0 bg-gradient-to-r from-[#FFD700]/80 to-transparent animate-ping"></div>
          <div className="absolute inset-0 bg-gradient-to-r from-white/30 to-transparent"></div>
        </div>
      </div>
      <span className="text-sm text-gray-400 font-medium">
        {Math.round(percentage)}% completed
      </span>
    </div>
  );
};

export default SessionsBar; 