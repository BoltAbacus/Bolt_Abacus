import { FC, useEffect, useState } from 'react';
import { getClassRankRequest } from '@services/student';
import { useAuthStore } from '@store/authStore';

interface StudentRanking {
  userId: number;
  firstName: string;
  lastName: string;
  totalSessions: number;
  totalCorrect: number;
  totalQuestions: number;
  accuracy: number;
  speed: number;
  totalTime: number;
}

interface ClassRankData {
  currentUserRank: number;
  totalStudents: number;
  rankings: StudentRanking[];
}

interface ClassRankCardProps {
  className?: string;
}

const ClassRankCard: FC<ClassRankCardProps> = ({ className = '' }) => {
  const authToken = useAuthStore((state) => state.authToken);
  const [rankData, setRankData] = useState<ClassRankData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchClassRank = async () => {
      if (!authToken) return;

      try {
        setLoading(true);
        const response = await getClassRankRequest(authToken);
        
        if (response.data.success) {
          setRankData(response.data);
        } else {
          setError('Failed to fetch class rank data');
        }
      } catch (err) {
        console.error('Error fetching class rank:', err);
        setError('Failed to fetch class rank data');
      } finally {
        setLoading(false);
      }
    };

    fetchClassRank();
  }, [authToken]);

  const getRankIcon = (rank: number) => {
    if (rank === 1) return '🥇';
    if (rank === 2) return '🥈';
    if (rank === 3) return '🥉';
    return `#${rank}`;
  };

  const getRankColor = (rank: number) => {
    if (rank === 1) return 'text-yellow-400';
    if (rank === 2) return 'text-gray-300';
    if (rank === 3) return 'text-orange-400';
    if (rank <= 5) return 'text-green-400';
    if (rank <= 10) return 'text-blue-400';
    return 'text-gray-400';
  };

  if (loading) {
    return (
      <div className={`bg-[#212124] p-6 rounded-lg border border-[#facb25]/20 ${className}`}>
        <div className="animate-pulse">
          <div className="h-6 bg-gray-700 rounded w-3/4 mb-4"></div>
          <div className="h-4 bg-gray-700 rounded w-1/2 mb-6"></div>
          <div className="space-y-3">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-8 bg-gray-700 rounded"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (error || !rankData) {
    return (
      <div className={`bg-[#212124] p-6 rounded-lg border border-[#facb25]/20 ${className}`}>
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="text-xl font-bold text-[#facb25]">Class Rank</h3>
            <p className="text-xs text-yellow-400 mt-1">🏆 Your position in the class</p>
          </div>
          <div className="text-2xl">🏆</div>
        </div>
        <div className="text-center text-gray-400">
          <p>Unable to load rank data</p>
        </div>
      </div>
    );
  }

  return (
    <div className={`bg-[#212124] p-6 rounded-lg border border-[#facb25]/20 ${className}`}>
      <div className="flex items-center justify-between mb-4">
        <div>
          <h3 className="text-xl font-bold text-[#facb25]">Class Rank</h3>
          <p className="text-xs text-yellow-400 mt-1">🏆 Your position in the class</p>
        </div>
        <div className="text-2xl">🏆</div>
      </div>
      
      {/* Current user rank */}
      <div className="bg-[#facb25]/10 p-4 rounded-lg mb-4 border border-[#facb25]/30">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <span className="text-2xl">{getRankIcon(rankData.currentUserRank)}</span>
            <div>
              <p className="font-semibold text-[#facb25]">Your Rank</p>
              <p className="text-xs text-gray-400">
                {rankData.currentUserRank} of {rankData.totalStudents} students
              </p>
            </div>
          </div>
          <div className="text-right">
            <p className="text-sm font-semibold text-[#facb25]">
              {rankData.currentUserRank <= 3 ? 'Top Performer!' : 'Keep Going!'}
            </p>
          </div>
        </div>
      </div>
      
      {/* Top performers */}
      <div className="space-y-2">
        <p className="text-sm font-semibold text-gray-300 mb-3">Top Performers</p>
        {rankData.rankings.slice(0, 5).map((student, index) => (
          <div 
            key={student.userId} 
            className={`flex items-center justify-between p-2 rounded ${
              index < 3 ? 'bg-gray-800/50' : 'bg-gray-800/30'
            }`}
          >
            <div className="flex items-center space-x-3">
              <span className={`text-lg ${getRankColor(index + 1)}`}>
                {getRankIcon(index + 1)}
              </span>
              <div>
                <p className="text-sm font-medium text-gray-200">
                  {student.firstName} {student.lastName}
                </p>
                <p className="text-xs text-gray-400">
                  {student.accuracy}% accuracy • {student.speed} problems/min
                </p>
              </div>
            </div>
            <div className="text-right">
              <p className="text-xs text-gray-400">{student.totalSessions} sessions</p>
            </div>
          </div>
        ))}
      </div>
      
      {/* Progress indicator */}
      <div className="mt-4 pt-3 border-t border-gray-700">
        <div className="flex items-center justify-between text-xs text-gray-400">
          <span>Class Progress</span>
          <span>{rankData.currentUserRank}/{rankData.totalStudents}</span>
        </div>
        <div className="w-full bg-gray-700 rounded-full h-1.5 mt-1">
          <div 
            className="bg-gradient-to-r from-[#facb25] to-[#d4a017] h-1.5 rounded-full transition-all duration-300"
            style={{ width: `${((rankData.totalStudents - rankData.currentUserRank + 1) / rankData.totalStudents) * 100}%` }}
          ></div>
        </div>
      </div>
    </div>
  );
};

export default ClassRankCard;
