import { FC, useEffect, useState } from 'react';
import { getModeDistributionRequest } from '@services/student';
import { useAuthStore } from '@store/authStore';

interface ModeDistribution {
  mode: string;
  count: number;
  percentage: number;
}

interface ModeDistributionCardProps {
  className?: string;
}

const ModeDistributionCard: FC<ModeDistributionCardProps> = ({ className = '' }) => {
  const authToken = useAuthStore((state) => state.authToken);
  const [modeDistribution, setModeDistribution] = useState<ModeDistribution[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchModeDistribution = async () => {
      if (!authToken) return;

      try {
        setLoading(true);
        const response = await getModeDistributionRequest(authToken);
        
        if (response.data.success) {
          setModeDistribution(response.data.modeDistribution);
        } else {
          setError('Failed to fetch mode distribution');
        }
      } catch (err) {
        console.error('Error fetching mode distribution:', err);
        setError('Failed to fetch mode distribution');
      } finally {
        setLoading(false);
      }
    };

    fetchModeDistribution();
  }, [authToken]);

  const getModeIcon = (mode: string) => {
    switch (mode.toLowerCase()) {
      case 'flashcards':
        return '🃏';
      case 'untimed':
        return '⏰';
      case 'timed':
        return '⚡';
      case 'set':
        return '📚';
      default:
        return '🎯';
    }
  };

  const getModeColor = (mode: string, index: number) => {
    const colors = [
      '#facb25', // Yellow
      '#3b82f6', // Blue
      '#ef4444', // Red
      '#10b981', // Green
      '#8b5cf6', // Purple
      '#f59e0b', // Orange
    ];
    return colors[index % colors.length];
  };

  const renderPieChart = () => {
    if (modeDistribution.length === 0) return null;

    let cumulativePercentage = 0;
    const radius = 60;
    const centerX = 80;
    const centerY = 80;

    return (
      <svg width="160" height="160" className="mx-auto">
        {modeDistribution.map((mode, index) => {
          const startAngle = (cumulativePercentage / 100) * 360;
          const endAngle = ((cumulativePercentage + mode.percentage) / 100) * 360;
          
          const startAngleRad = (startAngle - 90) * (Math.PI / 180);
          const endAngleRad = (endAngle - 90) * (Math.PI / 180);
          
          const x1 = centerX + radius * Math.cos(startAngleRad);
          const y1 = centerY + radius * Math.sin(startAngleRad);
          const x2 = centerX + radius * Math.cos(endAngleRad);
          const y2 = centerY + radius * Math.sin(endAngleRad);
          
          const largeArcFlag = mode.percentage > 50 ? 1 : 0;
          
          const pathData = [
            `M ${centerX} ${centerY}`,
            `L ${x1} ${y1}`,
            `A ${radius} ${radius} 0 ${largeArcFlag} 1 ${x2} ${y2}`,
            'Z'
          ].join(' ');
          
          cumulativePercentage += mode.percentage;
          
          return (
            <path
              key={mode.mode}
              d={pathData}
              fill={getModeColor(mode.mode, index)}
              stroke="#1f2937"
              strokeWidth="2"
              className="hover:opacity-80 transition-opacity"
            />
          );
        })}
        
        {/* Center circle */}
        <circle
          cx={centerX}
          cy={centerY}
          r="30"
          fill="#212124"
          stroke="#374151"
          strokeWidth="2"
        />
        
        {/* Center text */}
        <text
          x={centerX}
          y={centerY - 5}
          textAnchor="middle"
          className="text-xs font-bold fill-[#facb25]"
        >
          {modeDistribution.reduce((sum, mode) => sum + mode.count, 0)}
        </text>
        <text
          x={centerX}
          y={centerY + 10}
          textAnchor="middle"
          className="text-xs fill-gray-400"
        >
          Sessions
        </text>
      </svg>
    );
  };

  if (loading) {
    return (
      <div className={`bg-[#212124] p-6 rounded-lg border border-[#facb25]/20 ${className}`}>
        <div className="animate-pulse">
          <div className="h-6 bg-gray-700 rounded w-3/4 mb-4"></div>
          <div className="h-4 bg-gray-700 rounded w-1/2 mb-6"></div>
          <div className="h-32 bg-gray-700 rounded mb-4"></div>
          <div className="space-y-2">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-4 bg-gray-700 rounded"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (error || modeDistribution.length === 0) {
    return (
      <div className={`bg-[#212124] p-6 rounded-lg border border-[#facb25]/20 ${className}`}>
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="text-xl font-bold text-[#facb25]">Mode Distribution</h3>
            <p className="text-xs text-yellow-400 mt-1">📊 Your practice mode breakdown</p>
          </div>
          <div className="text-2xl">📊</div>
        </div>
        <div className="text-center text-gray-400">
          <p>No practice data available</p>
          <p className="text-xs mt-1">Complete some practice to see your mode distribution!</p>
        </div>
      </div>
    );
  }

  return (
    <div className={`bg-[#212124] p-6 rounded-lg border border-[#facb25]/20 ${className}`}>
      <div className="flex items-center justify-between mb-4">
        <div>
          <h3 className="text-xl font-bold text-[#facb25]">Mode Distribution</h3>
          <p className="text-xs text-yellow-400 mt-1">📊 Your practice mode breakdown</p>
        </div>
        <div className="text-2xl">📊</div>
      </div>
      
      {/* Pie Chart */}
      <div className="flex justify-center mb-6">
        {renderPieChart()}
      </div>
      
      {/* Legend */}
      <div className="space-y-2">
        {modeDistribution.map((mode, index) => (
          <div key={mode.mode} className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div 
                className="w-3 h-3 rounded-full"
                style={{ backgroundColor: getModeColor(mode.mode, index) }}
              ></div>
              <div className="flex items-center space-x-2">
                <span className="text-lg">{getModeIcon(mode.mode)}</span>
                <span className="text-sm font-medium text-gray-200">
                  {mode.mode}
                </span>
              </div>
            </div>
            <div className="text-right">
              <p className="text-sm font-semibold text-[#facb25]">
                {mode.percentage}%
              </p>
              <p className="text-xs text-gray-400">
                {mode.count} sessions
              </p>
            </div>
          </div>
        ))}
      </div>
      
      {/* Summary */}
      <div className="mt-4 pt-3 border-t border-gray-700">
        <div className="flex items-center justify-between text-xs text-gray-400">
          <span>Total Sessions</span>
          <span className="font-semibold text-[#facb25]">
            {modeDistribution.reduce((sum, mode) => sum + mode.count, 0)}
          </span>
        </div>
      </div>
    </div>
  );
};

export default ModeDistributionCard;
