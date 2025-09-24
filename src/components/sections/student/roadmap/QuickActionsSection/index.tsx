import { FC, useState } from 'react';
import type { KeyboardEvent } from 'react';
import { Link } from 'react-router-dom';

import { STUDENT_DASHBOARD, STUDENT_LEVEL } from '@constants/routes';
import { useTodoListStore } from '@store/todoListStore';

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
  const { addPersonalGoal } = useTodoListStore();

  const handleAddGoal = async () => {
    const trimmed = goalText.trim();
    if (!trimmed) return;
    await addPersonalGoal(trimmed);
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
      <p className="font-medium text-md desktop:text-lg" style={{ color: '#ffffff' }}>Quick Actions</p>

      <div className="grid grid-cols-1 tablet:grid-cols-3 gap-4">
        {/* Continue Learning */}
        <div className="text-white p-6 rounded-2xl transition-all duration-300 hover:scale-[1.02] hover:shadow-[0_0_20px_rgba(255,186,8,0.4),0_0_40px_rgba(255,186,8,0.2),0_0_60px_rgba(255,186,8,0.1)] hover:shadow-gold/30 text-center" style={{ backgroundColor: '#161618' }}>
          <h3 className="font-semibold mb-2" style={{ color: '#ffffff' }}>Continue Learning</h3>
          <p className="text-sm mb-4" style={{ color: '#818181' }}>Realm {currentLevel}, Class {currentClass}</p>
          <Link
            to={`${STUDENT_LEVEL}/${currentLevel}`}
            className="inline-block text-white font-semibold py-2 px-4 rounded-lg transition-all duration-300 hover:scale-105 hover:shadow-[0_0_15px_rgba(255,186,8,0.3)]"
            style={{ backgroundColor: '#212124' }}
          >
            Continue
          </Link>
        </div>

        {/* Set Goals */}
        <div className="text-white p-6 rounded-2xl transition-all duration-300 hover:scale-[1.02] hover:shadow-[0_0_20px_rgba(255,186,8,0.4),0_0_40px_rgba(255,186,8,0.2),0_0_60px_rgba(255,186,8,0.1)] hover:shadow-gold/30 text-center" style={{ backgroundColor: '#161618' }}>
          <h3 className="font-semibold mb-2" style={{ color: '#ffffff' }}>Set Goals</h3>
          <p className="text-sm mb-2" style={{ color: '#818181' }}>Add goals to show on your dashboard</p>
          <div className="flex items-center space-x-2 justify-center">
            <input
              type="text"
              value={goalText}
              onChange={(e) => setGoalText(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="e.g., Finish 1 practice session"
              className="flex-1 rounded-lg px-3 py-2 text-sm text-white focus:outline-none"
              style={{ backgroundColor: '#212124' }}
            />
            <button
              type="button"
              onClick={handleAddGoal}
              className="text-white px-3 py-2 rounded-lg transition-all duration-300 hover:scale-105 hover:shadow-[0_0_15px_rgba(255,186,8,0.3)]"
              style={{ backgroundColor: '#212124' }}
            >
              Add
            </button>
          </div>
          <Link to={STUDENT_DASHBOARD} className="inline-block mt-3 text-xs hover:underline" style={{ color: '#818181' }}>
            View on Dashboard
          </Link>
        </div>

        {/* Download Background */}
        <div className="text-white p-6 rounded-2xl transition-all duration-300 hover:scale-[1.02] hover:shadow-[0_0_20px_rgba(255,186,8,0.4),0_0_40px_rgba(255,186,8,0.2),0_0_60px_rgba(255,186,8,0.1)] hover:shadow-gold/30 text-center" style={{ backgroundColor: '#161618' }}>
          <h3 className="font-semibold mb-2" style={{ color: '#ffffff' }}>Download Background</h3>
          <p className="text-sm mb-4" style={{ color: '#818181' }}>Bolt logo background</p>
          <button
            type="button"
            onClick={handleDownloadBackground}
            className="inline-block text-white font-semibold py-2 px-4 rounded-lg transition-all duration-300 hover:scale-105 hover:shadow-[0_0_15px_rgba(255,186,8,0.3)]"
            style={{ backgroundColor: '#212124' }}
          >
            Download
          </button>
        </div>
      </div>
    </div>
  );
};

export default QuickActionsSection;


