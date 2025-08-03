import { FC } from 'react';

export interface BoltGoalsSectionProps {
  className?: string;
}

const BoltGoalsSection: FC<BoltGoalsSectionProps> = ({ className = '' }) => {
  const sessionsCompleted = 2;
  const totalSessions = 5;
  const percentage = (sessionsCompleted / totalSessions) * 100;

  return (
    <div className={`text-white ${className}`}>
      <h2 className="text-xl font-bold mb-4 flex items-center">
        <span className="mr-2">⚡</span>
        Today's Bolt Goals
      </h2>
      
      <div className="space-y-4">
        {/* Sessions Progress */}
        <div>
          <div className="flex justify-between items-center mb-2">
            <span className="text-sm text-gray-300">Sessions Completed</span>
            <span className="text-sm font-semibold">{sessionsCompleted}/{totalSessions}</span>
          </div>
          {/* Enhanced Progress Bar */}
          <div className="w-full bg-gray-900 rounded-full h-4 shadow-inner mb-2 relative overflow-hidden border border-gray-600">
            <div 
              className="bg-gradient-to-r from-[#FFD700] via-[#FFA500] to-[#FF8C00] h-4 rounded-full transition-all duration-700 shadow-lg relative overflow-hidden"
              style={{ width: `${percentage}%` }}
            >
              <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/50 to-transparent animate-pulse"></div>
              <div className="absolute inset-0 bg-gradient-to-r from-[#FFD700]/80 to-transparent animate-ping"></div>
              <div className="absolute inset-0 bg-gradient-to-r from-white/30 to-transparent"></div>
            </div>
          </div>
          <span className="text-xs text-gray-400">
            {Math.round(percentage)}% completed
          </span>
        </div>
        
                 {/* Goals List */}
         <div className="space-y-2">
           <div className="flex items-center space-x-3">
             <span className={`text-lg ${sessionsCompleted >= 1 ? 'text-green-500' : 'text-gray-400'}`}>
               {sessionsCompleted >= 1 ? '✅' : '⭕'}
             </span>
             <span className={`text-sm ${sessionsCompleted >= 1 ? 'line-through text-gray-400' : 'text-gray-200'}`}>
               Complete 1 session
             </span>
           </div>
           
           <div className="flex items-center space-x-3">
             <span className={`text-lg ${sessionsCompleted >= 2 ? 'text-green-500' : 'text-gray-400'}`}>
               {sessionsCompleted >= 2 ? '✅' : '⭕'}
             </span>
             <span className={`text-sm ${sessionsCompleted >= 2 ? 'line-through text-gray-400' : 'text-gray-200'}`}>
               Take 1 quiz
             </span>
           </div>
           
           <div className="flex items-center space-x-3">
             <span className={`text-lg ${sessionsCompleted >= 3 ? 'text-green-500' : 'text-gray-400'}`}>
               {sessionsCompleted >= 3 ? '✅' : '⭕'}
             </span>
             <span className={`text-sm ${sessionsCompleted >= 3 ? 'line-through text-gray-400' : 'text-gray-200'}`}>
               Review flashcards
             </span>
           </div>
           
           <div className="flex items-center space-x-3">
             <span className={`text-lg ${sessionsCompleted >= 4 ? 'text-green-500' : 'text-gray-400'}`}>
               {sessionsCompleted >= 4 ? '✅' : '⭕'}
             </span>
             <span className={`text-sm ${sessionsCompleted >= 4 ? 'line-through text-gray-400' : 'text-gray-200'}`}>
               Maintain daily streak
             </span>
           </div>
         </div>
      </div>
    </div>
  );
};

export default BoltGoalsSection; 