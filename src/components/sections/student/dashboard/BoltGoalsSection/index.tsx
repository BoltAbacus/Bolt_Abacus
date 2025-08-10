import { FC } from 'react';
import { useGoalsStore } from '@store/goalsStore';

export interface BoltGoalsSectionProps {
  className?: string;
  compact?: boolean;
  sessionsCompleted?: number;
  totalSessions?: number;
}

const BoltGoalsSection: FC<BoltGoalsSectionProps> = ({ 
  className = '', 
  compact = false, 
  sessionsCompleted: propSessionsCompleted,
  totalSessions: propTotalSessions 
}) => {
  const { goals, toggleGoal, deleteGoal, getCompletedCount, getTotalCount, sessionsCompleted: storeSessionsCompleted, totalSessions: storeTotalSessions } = useGoalsStore();
  
  // Use props if provided, otherwise use store values
  const sessionsCompleted = propSessionsCompleted ?? storeSessionsCompleted;
  const totalSessions = propTotalSessions ?? storeTotalSessions;
  
  const safeTotal = Math.max(totalSessions || 0, 1);
  const percentage = (sessionsCompleted / safeTotal) * 100;

  if (compact) {
    return (
      <div className={`text-white ${className}`}>
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <span className="text-lg">⚡</span>
            <span className="text-sm font-semibold">Today's Bolt Goals</span>
            <span className="text-xs text-white/60">{sessionsCompleted}/{totalSessions}</span>
          </div>
          <div className="flex items-center space-x-3 min-w-[200px]">
            <div className="flex-1 h-2 rounded-full bg-grey overflow-hidden">
              <div className="h-2 bg-gold rounded-full" style={{ width: `${percentage}%` }} />
            </div>
            <span className="text-xs text-white/80 w-10 text-right">{Math.round(percentage)}%</span>
          </div>
        </div>
      </div>
    );
  }

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
             <span className="text-sm font-semibold">{sessionsCompleted}/{safeTotal}</span>
          </div>
          {/* Enhanced Progress Bar - unified theme */}
          <div className="w-full bg-[#0e0e0e]/80 rounded-full h-4 shadow-inner mb-2 relative overflow-hidden border border-gold/30 ring-1 ring-white/5">
            <div 
              className="bg-gold h-4 rounded-full transition-all duration-700 shadow-[0_0_14px_rgba(255,186,8,0.28)] relative overflow-hidden"
              style={{ width: `${percentage}%` }}
            />
          </div>
          <span className="text-xs text-gray-400">
            {Math.round(percentage)}% completed
          </span>
        </div>
        
         {/* Goals List */}
         <div className="space-y-2">
           {goals.map((goal) => (
             <div key={goal.id} className="flex items-center space-x-3 p-2 bg-[#080808]/50 hover:bg-[#191919] rounded-lg border border-gold/20 ring-1 ring-white/5 backdrop-blur-sm transition-colors">
               <input
                 type="checkbox"
                 checked={goal.completed}
                 onChange={() => toggleGoal(goal.id)}
                 className="w-4 h-4 text-gold bg-[#080808] border-gold/40 rounded focus:ring-gold/50"
               />
               <span className={`flex-1 text-sm ${goal.completed ? 'line-through text-gray-400' : 'text-gray-200'}`}>
                 {goal.text}
               </span>
               <button
                 onClick={() => deleteGoal(goal.id)}
                 className="text-red hover:text-red/80 transition-colors text-xs"
               >
                 Remove
               </button>
             </div>
           ))}
         </div>
      </div>
    </div>
  );
};

export default BoltGoalsSection; 