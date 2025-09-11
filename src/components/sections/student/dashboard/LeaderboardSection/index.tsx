import { FC } from 'react';

export interface LeaderboardSectionProps {
  className?: string;
}

const LeaderboardSection: FC<LeaderboardSectionProps> = ({ className = '' }) => {
  const leaderboard = [
    { rank: 1, name: 'Emma Johnson', xp: 8920, avatar: 'EJ' },
    { rank: 2, name: 'Alex Chen', xp: 8745, avatar: 'AC' },
    { rank: 3, name: 'Sarah Davis', xp: 8567, avatar: 'SD' },
    { rank: 4, name: 'Mike Wilson', xp: 8432, avatar: 'MW' },
    { rank: 5, name: 'Lisa Brown', xp: 8298, avatar: 'LB' },
    { rank: 6, name: 'John Taylor', xp: 8156, avatar: 'JT' },
    { rank: 7, name: 'Maria Anderson', xp: 8023, avatar: 'MA' },
    { rank: 8, name: 'David Martinez', xp: 7891, avatar: 'DM' },
    { rank: 9, name: 'Anna Garcia', xp: 7754, avatar: 'AG' },
    { rank: 10, name: 'Robert Miller', xp: 7623, avatar: 'RM' },
  ];

  const currentUser = { rank: 15, name: 'You', xp: 1850, avatar: 'YO' };

  return (
    <div className={`text-white p-6 rounded-2xl transition-colors relative overflow-hidden ${className}`} style={{ backgroundColor: '#161618' }}>
      <h2 className="text-2xl font-bold mb-6 flex items-center">
        <span className="mr-2">⚡</span>
        Lightning Leaderboard
      </h2>
      
      <div className="space-y-3 mb-6">
        {leaderboard.map((student, index) => (
          <div 
            key={student.rank} 
            className="flex items-center space-x-3 p-3 rounded-xl hover:scale-105 transition-all duration-300 relative overflow-hidden cursor-pointer group" 
            style={{ 
              backgroundColor: '#212124',
              boxShadow: '0 0 0 rgba(255,186,8,0)',
              transition: 'all 0.3s ease'
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.boxShadow = '0 0 20px rgba(255,186,8,0.4), 0 0 40px rgba(255,186,8,0.2), 0 0 60px rgba(255,186,8,0.1)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.boxShadow = '0 0 0 rgba(255,186,8,0)';
            }}
          >
            <div className="w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold text-white" style={{ backgroundColor: '#000000' }}>
              {student.rank}
            </div>
            <div className="w-10 h-10 rounded-full flex items-center justify-center text-white font-bold text-sm" style={{ backgroundColor: '#161618' }}>
              {student.avatar}
            </div>
            <div className="flex-1">
              <p className="text-sm font-medium text-white">{student.name}</p>
              <p className="text-xs" style={{ color: '#818181' }}>{student.xp.toLocaleString()} XP</p>
            </div>
          </div>
        ))}
      </div>
      
      {/* Current User */}
      <div 
        className="p-3 rounded-lg hover:scale-105 transition-all duration-300 cursor-pointer" 
        style={{ 
          backgroundColor: '#212124',
          boxShadow: '0 0 0 rgba(255,186,8,0)',
          transition: 'all 0.3s ease'
        }}
        onMouseEnter={(e) => {
          e.currentTarget.style.boxShadow = '0 0 20px rgba(255,186,8,0.4), 0 0 40px rgba(255,186,8,0.2), 0 0 60px rgba(255,186,8,0.1)';
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.boxShadow = '0 0 0 rgba(255,186,8,0)';
        }}
      >
        <div className="flex items-center space-x-3">
          <div className="w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold text-white" style={{ backgroundColor: '#000000' }}>
            {currentUser.rank}
          </div>
          <div className="w-10 h-10 rounded-full flex items-center justify-center text-white font-bold text-sm" style={{ backgroundColor: '#161618' }}>
            {currentUser.avatar}
          </div>
          <div className="flex-1">
            <p className="text-sm font-medium text-white">{currentUser.name}</p>
            <p className="text-xs" style={{ color: '#818181' }}>{currentUser.xp.toLocaleString()} XP</p>
          </div>
        </div>
      </div>
      
      <div className="mt-6 text-center">
        <button 
          className="bg-gradient-to-r from-gold to-lightGold hover:from-lightGold hover:to-gold text-black px-6 py-2 rounded-xl font-bold transition-all duration-300 transform hover:scale-110"
          style={{
            boxShadow: '0 0 0 rgba(255,186,8,0)',
            transition: 'all 0.3s ease'
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.boxShadow = '0 0 25px rgba(255,186,8,0.6), 0 0 50px rgba(255,186,8,0.4), 0 0 75px rgba(255,186,8,0.2)';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.boxShadow = '0 0 0 rgba(255,186,8,0)';
          }}
        >
          View Full Leaderboard
        </button>
      </div>
    </div>
  );
};

export default LeaderboardSection; 