import { FC, useState } from 'react';
import type { KeyboardEvent } from 'react';
import { Link } from 'react-router-dom';

import { STUDENT_DASHBOARD, STUDENT_LEVEL } from '@constants/routes';
import { useGoalsStore } from '@store/goalsStore';

export interface QuickActionsSectionProps {
  currentLevel: number;
  currentClass: number;
  className?: string;
}

const QuickActionsSection: FC<QuickActionsSectionProps> = ({
  currentLevel,
  currentClass,
  className = '',
}) => {
  const [goalText, setGoalText] = useState<string>('');
  const { addGoal } = useGoalsStore();

  const handleAddGoal = () => {
    const trimmed = goalText.trim();
    if (!trimmed) return;
    addGoal(trimmed);
    setGoalText('');
  };

  const handleKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') handleAddGoal();
  };

  const handleDownloadBackground = () => {
    const link = document.createElement('a');
    link.href = '/logo.png';
    link.download = 'bolt-background.png';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className={`px-6 tablet:p-10 desktop:px-24 ${className}`}>
      <p className="font-medium text-md desktop:text-lg">Quick Actions</p>

      <div className="grid grid-cols-1 tablet:grid-cols-3 gap-4">
        {/* Continue Learning */}
        <div className="bg-[#080808] hover:bg-[#1b1b1b] transition-colors text-white p-6 rounded-2xl border border-gold/50 ring-1 ring-white/5 text-center">
          <h3 className="font-semibold mb-2">Continue Learning</h3>
          <p className="text-sm text-white/70 mb-4">Level {currentLevel} • Class {currentClass}</p>
          <Link
            to={`${STUDENT_LEVEL}/${currentLevel}`}
            className="inline-block bg-transparent hover:bg-[#191919] text-white font-semibold py-2 px-4 rounded-lg border border-gold/40 hover:border-gold transition"
          >
            Continue
          </Link>
        </div>

        {/* Set Goals */}
        <div className="bg-[#080808] hover:bg-[#1b1b1b] transition-colors text-white p-6 rounded-2xl border border-gold/50 ring-1 ring-white/5 text-center">
          <h3 className="font-semibold mb-2">Set Goals</h3>
          <p className="text-sm text-white/70 mb-2">Add goals to show on your dashboard</p>
          <div className="flex items-center space-x-2 justify-center">
            <input
              type="text"
              value={goalText}
              onChange={(e) => setGoalText(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="e.g., Finish 1 practice session"
              className="flex-1 bg-[#0e0e0e] border border-gold/40 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-gold/70"
            />
            <button
              type="button"
              onClick={handleAddGoal}
              className="bg-[#080808]/80 hover:bg-[#191919] text-white px-3 py-2 rounded-lg border border-gold/50 ring-1 ring-white/5"
            >
              Add
            </button>
          </div>
          <Link to={STUDENT_DASHBOARD} className="inline-block mt-3 text-xs text-gold hover:underline">
            View on Dashboard
          </Link>
        </div>

        {/* Download Background */}
        <div className="bg-[#080808] hover:bg-[#1b1b1b] transition-colors text-white p-6 rounded-2xl border border-gold/50 ring-1 ring-white/5 text-center">
          <h3 className="font-semibold mb-2">Download Background</h3>
          <p className="text-sm text-white/70 mb-4">Bolt logo background</p>
          <button
            type="button"
            onClick={handleDownloadBackground}
            className="inline-block bg-transparent hover:bg-[#191919] text-white font-semibold py-2 px-4 rounded-lg border border-gold/40 hover:border-gold transition"
          >
            Download
          </button>
        </div>
      </div>
    </div>
  );
};

export default QuickActionsSection;


