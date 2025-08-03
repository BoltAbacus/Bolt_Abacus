import { FC } from 'react';

export interface LeaderboardSectionProps {
  className?: string;
}

const LeaderboardSection: FC<LeaderboardSectionProps> = ({ className = '' }) => {
  const leaderboard = [
    { rank: 1, name: 'Alex Johnson', xp: 2840, avatar: 'AJ' },
    { rank: 2, name: 'Sarah Chen', xp: 2650, avatar: 'SC' },
    { rank: 3, name: 'Mike Davis', xp: 2480, avatar: 'MD' },
  ];

  const currentUser = { rank: 7, name: 'You', xp: 1850, avatar: 'YO' };

  return (
    <div className={`bg-[#1b1b1b] text-white p-6 rounded-lg border border-gray-800 ${className}`}>
      <h2 className="text-2xl font-bold mb-6 flex items-center">
        <span className="mr-2">⚡</span>
        Lightning Leaderboard
      </h2>
      
      <div className="space-y-3 mb-6">
        {leaderboard.map((student, index) => (
          <div key={student.rank} className="flex items-center space-x-3 p-3 bg-gray-800 rounded-lg">
            <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold ${
              index === 0 ? 'bg-yellow-500 text-black' :
              index === 1 ? 'bg-gray-400 text-black' :
              index === 2 ? 'bg-orange-600 text-white' :
              'bg-gray-600 text-white'
            }`}>
              {student.rank}
            </div>
            <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white font-bold text-sm">
              {student.avatar}
            </div>
            <div className="flex-1">
              <p className="text-sm font-medium text-white">{student.name}</p>
              <p className="text-xs text-gray-400">{student.xp.toLocaleString()} XP</p>
            </div>
          </div>
        ))}
      </div>
      
      {/* Current User */}
      <div className="p-3 bg-gradient-to-r from-blue-600/20 to-purple-600/20 rounded-lg border border-blue-500/30">
        <div className="flex items-center space-x-3">
          <div className="w-8 h-8 rounded-full bg-blue-600 flex items-center justify-center text-sm font-bold">
            {currentUser.rank}
          </div>
          <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white font-bold text-sm">
            {currentUser.avatar}
          </div>
          <div className="flex-1">
            <p className="text-sm font-medium text-white">{currentUser.name}</p>
            <p className="text-xs text-gray-300">{currentUser.xp.toLocaleString()} XP</p>
          </div>
        </div>
      </div>
      
      <div className="mt-6 text-center">
        <button className="bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white px-6 py-2 rounded-lg font-semibold transition-all duration-300 transform hover:scale-105 shadow-lg hover:shadow-blue-500/25">
          View Full Leaderboard
        </button>
      </div>
    </div>
  );
};

export default LeaderboardSection; 