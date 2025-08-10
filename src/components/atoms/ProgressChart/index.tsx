import { FC } from 'react';
import { LevelProgress } from '@interfaces/apis/teacher';

export interface ProgressChartProps {
  progress: LevelProgress[];
  className?: string;
}

const ProgressChart: FC<ProgressChartProps> = ({ progress, className = '' }) => {
  // Calculate progress data for chart
  const chartData = progress.map((level) => {
    const isCompleted = level.FinalTest > 0 && level.OralTest > 0;
    const averageScore = isCompleted ? (level.FinalTest + level.OralTest) / 2 : 0;
    
    return {
      level: level.levelId,
      progress: isCompleted ? 100 : 0,
      score: averageScore,
      completed: isCompleted,
    };
  });

  const completedLevels = chartData.filter(d => d.completed).length;

  return (
    <div className={`bg-[#1b1b1b] p-6 rounded-lg border border-lightGold ${className}`}>
      <h3 className="text-xl font-bold text-gold mb-4">Progress Timeline</h3>
      
      <div className="space-y-4">
        {chartData.map((data, index) => (
          <div key={index} className="flex items-center gap-4">
            <div className="w-12 h-8 flex items-center justify-center">
              <span className="text-sm font-medium text-gray-300">L{data.level}</span>
            </div>
            
            <div className="flex-1 relative">
              <div className="w-full h-3 bg-gray-700 rounded-full overflow-hidden">
                <div 
                  className={`h-full transition-all duration-500 ease-out ${
                    data.completed 
                      ? data.score >= 90 
                        ? 'bg-gradient-to-r from-yellow-500 to-orange-500' 
                        : data.score >= 80 
                        ? 'bg-gradient-to-r from-blue-500 to-purple-500'
                        : data.score >= 70 
                        ? 'bg-gradient-to-r from-green-500 to-blue-500'
                        : 'bg-gradient-to-r from-gray-500 to-gray-600'
                      : 'bg-gray-600'
                  }`}
                  style={{ width: `${data.progress}%` }}
                />
              </div>
              
              {data.completed && (
                <div className="absolute -top-1 -right-1 w-5 h-5 bg-green-500 rounded-full flex items-center justify-center">
                  <span className="text-white text-xs">✓</span>
                </div>
              )}
            </div>
            
            <div className="w-16 text-right">
              <span className={`text-sm font-medium ${
                data.completed 
                  ? data.score >= 90 
                    ? 'text-yellow-400' 
                    : data.score >= 80 
                    ? 'text-blue-400'
                    : data.score >= 70 
                    ? 'text-green-400'
                    : 'text-gray-400'
                  : 'text-gray-500'
              }`}>
                {data.completed ? `${Math.round(data.score)}%` : '--'}
              </span>
            </div>
          </div>
        ))}
      </div>
      
      <div className="mt-6 pt-4 border-t border-gray-700">
        <div className="flex justify-between items-center">
          <div>
            <p className="text-sm text-gray-300">Overall Progress</p>
            <p className="text-2xl font-bold text-white">
              {Math.round((completedLevels / chartData.length) * 100)}%
            </p>
          </div>
          <div className="text-right">
            <p className="text-sm text-gray-300">Levels Completed</p>
            <p className="text-2xl font-bold text-green-400">
              {completedLevels}/{chartData.length}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProgressChart; 