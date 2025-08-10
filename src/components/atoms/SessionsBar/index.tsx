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
        You've completed <span className="text-gold font-bold text-lg">{sessionsCompleted}</span> of <span className="text-gold font-bold text-lg">{totalSessions}</span> sessions today.
      </p>
      {/* Enhanced Sessions Progress Bar */}
      <div className="w-full bg-[#0e0e0e]/80 rounded-full h-5 shadow-inner mb-3 relative overflow-hidden border border-gold/30 ring-1 ring-white/5">
        <div 
          className="bg-gold h-5 rounded-full transition-all duration-700 shadow-[0_0_16px_rgba(255,186,8,0.30)] relative overflow-hidden"
          style={{ width: `${percentage}%` }}
        />
      </div>
      <span className="text-sm text-gray-400 font-medium">
        {Math.round(percentage)}% completed
      </span>
    </div>
  );
};

export default SessionsBar; 