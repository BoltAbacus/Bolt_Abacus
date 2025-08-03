import { FC } from 'react';
import { Link } from 'react-router-dom';

import { STUDENT_LEVEL } from '@constants/routes';

export interface InfoSectionProps {
  currentLevel: number;
  description: string;
  progress: number;
}

const InfoSection: FC<InfoSectionProps> = ({
  currentLevel,
  progress,
}) => {
  return (
    <div className="text-white">
      <h2 className="text-xl font-bold mb-4 flex items-center">
        <span className="mr-2">📚</span>
        Continue Learning
      </h2>
      <div className="space-y-4">
        <div>
          <div className="flex justify-between items-center mb-2">
            <span className="text-sm text-gray-300">Level {currentLevel} Progress</span>
            <span className="text-xs text-gray-400">{Math.round(Math.max((progress || 0) * 100, 40))}%</span>
          </div>
          {/* Enhanced Progress Bar */}
          <div className="w-full bg-gray-700 rounded-full h-3 shadow-inner mb-2">
            <div 
              className="bg-gradient-to-r from-green-400 via-emerald-500 to-teal-600 h-3 rounded-full transition-all duration-500 shadow-lg relative overflow-hidden"
              style={{ width: `${Math.max((progress || 0) * 100, 40)}%` }}
            >
              <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent animate-pulse"></div>
            </div>
          </div>
        </div>
        
        <Link
          to={`${STUDENT_LEVEL}/${currentLevel}`}
          className="inline-block bg-[#facb25] hover:bg-[#facb25]/80 text-[#1b1b1b] font-semibold py-2 px-4 rounded-lg transition-all duration-200"
        >
          Resume Learning
        </Link>
      </div>
    </div>
  );
};

export default InfoSection;
