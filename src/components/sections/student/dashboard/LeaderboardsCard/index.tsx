import { FC, useEffect, useState } from 'react';
import { getLeaderboardsRequest } from '@services/student';
import { useAuthStore } from '@store/authStore';

interface LeaderboardEntry {
  userId: number;
  firstName: string;
  lastName: string;
  totalSessions: number;
  accuracy: number;
  speed: number;
  isCurrentUser: boolean;
}

interface LeaderboardsData {
  speedLeaderboard: LeaderboardEntry[];
  accuracyLeaderboard: LeaderboardEntry[];
}

interface LeaderboardsCardProps {
  className?: string;
}

const LeaderboardsCard: FC<LeaderboardsCardProps> = ({ className = '' }) => {
  const authToken = useAuthStore((state) => state.authToken);
  const [leaderboardsData, setLeaderboardsData] = useState<LeaderboardsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'speed' | 'accuracy'>('speed');

  useEffect(() => {
    const fetchLeaderboards = async () => {
      if (!authToken) return;

      try {
        setLoading(true);
        const response = await getLeaderboardsRequest(authToken);
        
        if (response.data.success) {
          setLeaderboardsData(response.data);
        } else {
          setError('Failed to fetch leaderboards data');
        }
      } catch (err) {
        console.error('Error fetching leaderboards:', err);
        setError('Failed to fetch leaderboards data');
      } finally {
        setLoading(false);
      }
    };

    fetchLeaderboards();
  }, [authToken]);

  const getRankIcon = (index: number) => {
    if (index === 0) return '🥇';
    if (index === 1) return '🥈';
    if (index === 2) return '🥉';
    return `#${index + 1}`;
  };

  const getRankColor = (index: number) => {
    if (index === 0) return 'text-yellow-400';
    if (index === 1) return 'text-gray-300';
    if (index === 2) return 'text-orange-400';
    if (index < 5) return 'text-green-400';
    return 'text-gray-400';
  };

  if (loading) {
    return (
      <div className={`bg-[#212124] p-6 rounded-lg border border-[#facb25]/20 ${className}`}>
        <div className="animate-pulse">
          <div className="h-6 bg-gray-700 rounded w-3/4 mb-4"></div>
          <div className="flex space-x-4 mb-4">
            <div className="h-8 bg-gray-700 rounded w-20"></div>
            <div className="h-8 bg-gray-700 rounded w-24"></div>
          </div>
          <div className="space-y-3">
            {[1, 2, 3, 4, 5].map((i) => (
              <div key={i} className="h-8 bg-gray-700 rounded"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (error || !leaderboardsData) {
    return (
      <div className={`bg-[#212124] p-6 rounded-lg border border-[#facb25]/20 ${className}`}>
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="text-xl font-bold text-[#facb25]">Leaderboards</h3>
            <p className="text-xs text-yellow-400 mt-1">🏆 Top performers in your class</p>
          </div>
          <div className="text-2xl">🏆</div>
        </div>
        <div className="text-center text-gray-400">
          <p>Unable to load leaderboards</p>
        </div>
      </div>
    );
  }

  const currentLeaderboard = activeTab === 'speed' 
    ? leaderboardsData.speedLeaderboard 
    : leaderboardsData.accuracyLeaderboard;

  return (
    <div className={`bg-[#212124] p-6 rounded-lg border border-[#facb25]/20 ${className}`}>
      <div className="flex items-center justify-between mb-4">
        <div>
          <h3 className="text-xl font-bold text-[#facb25]">Leaderboards</h3>
          <p className="text-xs text-yellow-400 mt-1">🏆 Top performers in your class</p>
        </div>
        <div className="text-2xl">🏆</div>
      </div>
      
      {/* Tab buttons */}
      <div className="flex space-x-2 mb-4">
        <button
          onClick={() => setActiveTab('speed')}
          className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
            activeTab === 'speed'
              ? 'bg-[#facb25] text-black'
              : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
          }`}
        >
          ⚡ Speed
        </button>
        <button
          onClick={() => setActiveTab('accuracy')}
          className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
            activeTab === 'accuracy'
              ? 'bg-[#facb25] text-black'
              : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
          }`}
        >
          🎯 Accuracy
        </button>
      </div>
      
      {/* Leaderboard entries */}
      <div className="space-y-2">
        {currentLeaderboard.map((entry, index) => (
          <div 
            key={entry.userId} 
            className={`flex items-center justify-between p-3 rounded-lg ${
              entry.isCurrentUser 
                ? 'bg-[#facb25]/20 border border-[#facb25]/40' 
                : index < 3 
                  ? 'bg-gray-800/50' 
                  : 'bg-gray-800/30'
            }`}
          >
            <div className="flex items-center space-x-3">
              <span className={`text-lg ${getRankColor(index)}`}>
                {getRankIcon(index)}
              </span>
              <div>
                <p className={`text-sm font-medium ${
                  entry.isCurrentUser ? 'text-[#facb25]' : 'text-gray-200'
                }`}>
                  {entry.firstName} {entry.lastName}
                  {entry.isCurrentUser && ' (You)'}
                </p>
                <p className="text-xs text-gray-400">
                  {entry.totalSessions} sessions
                </p>
              </div>
            </div>
            <div className="text-right">
              <p className="text-sm font-semibold text-[#facb25]">
                {activeTab === 'speed' 
                  ? `${entry.speed} problems/min`
                  : `${entry.accuracy}%`
                }
              </p>
              <p className="text-xs text-gray-400">
                {activeTab === 'speed' 
                  ? `${entry.accuracy}% accuracy`
                  : `${entry.speed} problems/min`
                }
              </p>
            </div>
          </div>
        ))}
      </div>
      
      {/* Legend */}
      <div className="mt-4 pt-3 border-t border-gray-700">
        <div className="flex items-center justify-center space-x-4 text-xs text-gray-400">
          <div className="flex items-center space-x-1">
            <span>🥇</span>
            <span>1st</span>
          </div>
          <div className="flex items-center space-x-1">
            <span>🥈</span>
            <span>2nd</span>
          </div>
          <div className="flex items-center space-x-1">
            <span>🥉</span>
            <span>3rd</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LeaderboardsCard;
