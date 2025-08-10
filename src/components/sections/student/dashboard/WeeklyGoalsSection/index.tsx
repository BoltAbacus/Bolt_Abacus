import { FC } from 'react';

export interface WeeklyGoalsSectionProps {
  className?: string;
  sessionsCompleted?: number;
  sessionsTotal?: number;
  practiceMinutes?: number;
  practiceTargetMinutes?: number;
  problemsSolved?: number;
  problemsTarget?: number;
}

const WeeklyGoalsSection: FC<WeeklyGoalsSectionProps> = ({
  className = '',
  sessionsCompleted = 4,
  sessionsTotal = 5,
  practiceMinutes = 180,
  practiceTargetMinutes = 240,
  problemsSolved = 245,
  problemsTarget = 300,
}) => {
  const sessionsPct = Math.min(100, (sessionsCompleted / sessionsTotal) * 100);
  const practicePct = Math.min(100, (practiceMinutes / practiceTargetMinutes) * 100);
  const problemsPct = Math.min(100, (problemsSolved / problemsTarget) * 100);

  const cardBase =
    'bg-[#080808]/80 hover:bg-[#191919] transition-colors rounded-lg p-4 border border-gold/40 ring-1 ring-white/5 backdrop-blur-md shadow-[0_8px_20px_rgba(0,0,0,0.45)]';
  const trackBase =
    'w-full h-2 rounded-full bg-[#0e0e0e]/80 border border-gold/20 ring-1 ring-white/5 overflow-hidden';
  const barBase = 'h-2 bg-gold rounded-full shadow-[0_0_12px_rgba(255,186,8,0.25)]';
  const badgeBase =
    'px-2 py-0.5 text-[10px] font-semibold rounded-md bg-[#2a2a2a] text-white/80 border border-white/10';

  return (
    <div className={`text-white ${className}`}>
      <div className="flex items-center mb-3">
        <span className="mr-2">🎯</span>
        <h2 className="text-lg font-bold">This Week's Goals</h2>
      </div>

      <div className="grid grid-cols-3 gap-4">
        {/* Sessions */}
        <div className={cardBase}>
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm">Sessions</span>
            <span className={badgeBase}>
              {sessionsCompleted}/{sessionsTotal}
            </span>
          </div>
          <div className={trackBase}>
            <div className={barBase} style={{ width: `${sessionsPct}%` }} />
          </div>
        </div>

        {/* Practice Time */}
        <div className={cardBase}>
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm">Practice Time</span>
            <span className={badgeBase}>
              {practiceMinutes}/{practiceTargetMinutes}m
            </span>
          </div>
          <div className={trackBase}>
            <div className={barBase} style={{ width: `${practicePct}%` }} />
          </div>
        </div>

        {/* Problems Solved */}
        <div className={cardBase}>
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm">Problems Solved</span>
            <span className={badgeBase}>
              {problemsSolved}/{problemsTarget}
            </span>
          </div>
          <div className={trackBase}>
            <div className={barBase} style={{ width: `${problemsPct}%` }} />
          </div>
        </div>
      </div>
    </div>
  );
};

export default WeeklyGoalsSection;


