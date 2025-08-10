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
    <div className={`bg-[#080808] hover:bg-[#1b1b1b] transition-colors backdrop-blur-xl text-white p-6 rounded-2xl border border-gold/50 shadow-2xl shadow-black/50 relative overflow-hidden ${className}`}>
      {/* Animated background elements */}
      <div className="absolute inset-0 bg-gradient-to-r from-gold/5 via-transparent to-lightGold/5 animate-pulse"></div>
      <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-gold via-lightGold to-gold"></div>
      <h2 className="text-2xl font-bold mb-6 flex items-center">
        <span className="mr-2">⚡</span>
        Lightning Leaderboard
      </h2>
      
      <div className="space-y-3 mb-6">
        {leaderboard.map((student, index) => (
          <div key={student.rank} className="flex items-center space-x-3 p-3 bg-[#080808]/80 hover:bg-[#191919] rounded-xl border border-gold/30 ring-1 ring-white/5 shadow-lg hover:shadow-[0_0_20px_rgba(255,186,8,0.15)] hover:scale-[1.02] transition-all duration-300 relative overflow-hidden">
            <div className="w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold bg-[#080808]/80 text-white border border-gold/30 ring-1 ring-white/5 shadow-lg">
              {student.rank}
            </div>
            <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white font-bold text-sm shadow-lg border border-white/10">
              {student.avatar}
            </div>
            <div className="flex-1">
              <p className="text-sm font-medium text-white">{student.name}</p>
              <p className="text-xs text-gold">{student.xp.toLocaleString()} XP</p>
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
        <button className="bg-gradient-to-r from-gold to-lightGold hover:from-lightGold hover:to-gold text-black px-6 py-2 rounded-xl font-bold transition-all duration-300 transform hover:scale-105 shadow-lg hover:shadow-[0_0_20px_rgba(255,186,8,0.40)]">
          View Full Leaderboard
        </button>
      </div>
    </div>
  );
};

export default LeaderboardSection; 