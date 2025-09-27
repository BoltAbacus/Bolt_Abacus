import { FC, useEffect, useState } from 'react';
import { getModeDistributionRequest } from '@services/student';
import { useAuthStore } from '@store/authStore';

interface ModeDistribution {
  mode: string;
  count: number;
  percentage: number;
}

interface FavoriteModeCardProps {
  className?: string;
}

const FavoriteModeCard: FC<FavoriteModeCardProps> = ({ className = '' }) => {
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

  const getModeColor = (mode: string) => {
    switch (mode.toLowerCase()) {
      case 'flashcards':
        return 'text-purple-400';
      case 'untimed':
        return 'text-blue-400';
      case 'timed':
        return 'text-red-400';
      case 'set':
        return 'text-green-400';
      default:
        return 'text-yellow-400';
    }
  };

  if (loading) {
    return (
      <div className={`bg-[#212124] p-6 rounded-lg border border-[#facb25]/20 ${className}`}>
        <div className="animate-pulse">
          <div className="h-6 bg-gray-700 rounded w-3/4 mb-4"></div>
          <div className="h-4 bg-gray-700 rounded w-1/2"></div>
        </div>
      </div>
    );
  }

  if (error || modeDistribution.length === 0) {
    return (
      <div className={`bg-[#212124] p-6 rounded-lg border border-[#facb25]/20 ${className}`}>
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="text-xl font-bold text-[#facb25]">Favorite Mode</h3>
            <p className="text-xs text-yellow-400 mt-1">📊 Your most played practice type</p>
          </div>
          <div className="text-2xl">🎯</div>
        </div>
        <div className="text-center text-gray-400">
          <p>No practice data available</p>
          <p className="text-xs mt-1">Complete some practice to see your favorite mode!</p>
        </div>
      </div>
    );
  }

  const favoriteMode = modeDistribution[0]; // First item is the most played

  return (
    <div className={`bg-[#212124] p-6 rounded-lg border border-[#facb25]/20 ${className}`}>
      <div className="flex items-center justify-between mb-4">
        <div>
          <h3 className="text-xl font-bold text-[#facb25]">Favorite Mode</h3>
          <p className="text-xs text-yellow-400 mt-1">📊 Your most played practice type</p>
        </div>
        <div className="text-2xl">{getModeIcon(favoriteMode.mode)}</div>
      </div>
      
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <span className="text-2xl">{getModeIcon(favoriteMode.mode)}</span>
            <div>
              <p className={`font-semibold ${getModeColor(favoriteMode.mode)}`}>
                {favoriteMode.mode}
              </p>
              <p className="text-xs text-gray-400">
                {favoriteMode.count} sessions ({favoriteMode.percentage}%)
              </p>
            </div>
          </div>
        </div>
        
        {/* Progress bar */}
        <div className="w-full bg-gray-700 rounded-full h-2">
          <div 
            className="bg-gradient-to-r from-[#facb25] to-[#d4a017] h-2 rounded-full transition-all duration-300"
            style={{ width: `${favoriteMode.percentage}%` }}
          ></div>
        </div>
        
        {/* Other modes */}
        {modeDistribution.length > 1 && (
          <div className="pt-2 border-t border-gray-700">
            <p className="text-xs text-gray-400 mb-2">Other modes:</p>
            <div className="flex flex-wrap gap-2">
              {modeDistribution.slice(1, 4).map((mode, index) => (
                <div key={index} className="flex items-center space-x-1 text-xs">
                  <span>{getModeIcon(mode.mode)}</span>
                  <span className="text-gray-400">{mode.mode}</span>
                  <span className="text-gray-500">({mode.percentage}%)</span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default FavoriteModeCard;
