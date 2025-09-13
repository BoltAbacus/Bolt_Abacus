import { FC } from 'react';
import { getLevelName } from '@helpers/levelNames';

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
    <div 
      className={`text-white p-6 rounded-2xl transition-all duration-300 relative overflow-hidden backdrop-blur-xl border border-white/10 ${className}`} 
      style={{ 
        background: 'linear-gradient(135deg, rgba(22, 22, 24, 0.9) 0%, rgba(33, 33, 36, 0.7) 50%, rgba(22, 22, 24, 0.9) 100%)',
        boxShadow: '0 8px 32px rgba(0, 0, 0, 0.4), inset 0 1px 0 rgba(255, 255, 255, 0.1), 0 0 0 1px rgba(255, 186, 8, 0.2)'
      }}
    >
      <div className="absolute inset-0 bg-gradient-to-br from-purple-500/10 via-blue-500/5 to-cyan-500/10 pointer-events-none"></div>
      <div className="absolute inset-0 bg-gradient-to-tr from-transparent via-gold/5 to-transparent pointer-events-none"></div>
      <div className="relative z-10">
        <h2 className="text-2xl font-bold mb-6 flex items-center">
          <span className="mr-2">⚡</span>
          Lightning Leaderboard
        </h2>
      
      <div className="space-y-3 mb-6">
        {leaderboard.map((student, index) => (
          <div 
            key={student.rank} 
            className="flex items-center space-x-3 p-3 rounded-xl hover:scale-[1.02] transition-all duration-300 relative overflow-hidden cursor-pointer group backdrop-blur-sm border border-white/10" 
            style={{ 
              background: 'linear-gradient(135deg, rgba(33, 33, 36, 0.7) 0%, rgba(22, 22, 24, 0.5) 50%, rgba(33, 33, 36, 0.7) 100%)',
              boxShadow: '0 4px 16px rgba(0, 0, 0, 0.3), inset 0 1px 0 rgba(255, 255, 255, 0.1), 0 0 0 1px rgba(255, 186, 8, 0.1)',
              transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)'
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.background = 'linear-gradient(135deg, rgba(33, 33, 36, 0.8) 0%, rgba(22, 22, 24, 0.6) 50%, rgba(33, 33, 36, 0.8) 100%)';
              e.currentTarget.style.boxShadow = '0 8px 32px rgba(0, 0, 0, 0.4), 0 0 25px rgba(255,186,8,0.3), inset 0 1px 0 rgba(255, 255, 255, 0.2), 0 0 0 1px rgba(255, 186, 8, 0.3)';
              e.currentTarget.style.borderColor = 'rgba(255, 186, 8, 0.4)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = 'linear-gradient(135deg, rgba(33, 33, 36, 0.7) 0%, rgba(22, 22, 24, 0.5) 50%, rgba(33, 33, 36, 0.7) 100%)';
              e.currentTarget.style.boxShadow = '0 4px 16px rgba(0, 0, 0, 0.3), inset 0 1px 0 rgba(255, 255, 255, 0.1), 0 0 0 1px rgba(255, 186, 8, 0.1)';
              e.currentTarget.style.borderColor = 'rgba(255, 255, 255, 0.1)';
            }}
          >
            <div 
              className={`w-10 h-10 rounded-full flex items-center justify-center text-sm font-bold backdrop-blur-sm border relative overflow-hidden ${
                student.rank === 1 ? 'border-yellow-400/50' : 
                student.rank === 2 ? 'border-gray-300/50' : 
                student.rank === 3 ? 'border-amber-600/50' : 'border-white/10'
              }`}
              style={{ 
                backgroundColor: student.rank === 1 ? 'rgba(255, 215, 0, 0.2)' : 
                               student.rank === 2 ? 'rgba(192, 192, 192, 0.2)' : 
                               student.rank === 3 ? 'rgba(205, 127, 50, 0.2)' : 'rgba(0, 0, 0, 0.8)',
                boxShadow: student.rank <= 3 ? 
                  `0 4px 16px ${student.rank === 1 ? 'rgba(255, 215, 0, 0.3)' : 
                                 student.rank === 2 ? 'rgba(192, 192, 192, 0.3)' : 
                                 'rgba(205, 127, 50, 0.3)'}, inset 0 1px 0 rgba(255, 255, 255, 0.2)` :
                  '0 2px 8px rgba(0, 0, 0, 0.3), inset 0 1px 0 rgba(255, 255, 255, 0.1)'
              }}
            >
              {student.rank <= 3 && (
                <div className="absolute inset-0 bg-gradient-to-br from-white/20 to-transparent"></div>
              )}
              <span className="relative z-10 text-white">
                {student.rank === 1 ? '👑' : student.rank === 2 ? '🥈' : student.rank === 3 ? '🥉' : student.rank}
              </span>
            </div>
            <div 
              className="w-10 h-10 rounded-full flex items-center justify-center text-white font-bold text-sm backdrop-blur-sm border border-white/10"
              style={{ 
                backgroundColor: 'rgba(22, 22, 24, 0.8)',
                boxShadow: '0 2px 8px rgba(0, 0, 0, 0.3), inset 0 1px 0 rgba(255, 255, 255, 0.1)'
              }}
            >
              {student.avatar}
            </div>
            <div className="flex-1">
              <div className="flex justify-between items-start">
                <div className="flex-1">
                  <p className="text-sm font-semibold text-white">{student.name}</p>
                  <div className="flex items-center gap-2 mt-1">
                    <span className="text-xs px-3 py-1 rounded-full backdrop-blur-sm border border-blue-400/40" 
                          style={{ 
                            background: 'linear-gradient(135deg, rgba(59, 130, 246, 0.2) 0%, rgba(37, 99, 235, 0.1) 100%)', 
                            color: '#60a5fa',
                            boxShadow: '0 2px 8px rgba(59, 130, 246, 0.2)'
                          }}>
                      ⭐ Realm {Math.floor(student.xp / 1000) + 1}
                    </span>
                    <span className="text-xs px-3 py-1 rounded-full backdrop-blur-sm border border-orange-400/50" 
                          style={{ 
                            background: 'linear-gradient(135deg, rgba(255, 165, 0, 0.2) 0%, rgba(255, 140, 0, 0.1) 100%)', 
                            color: '#ffb347',
                            boxShadow: '0 2px 8px rgba(255, 165, 0, 0.3)'
                          }}>
                      🔥 {Math.floor(Math.random() * 10) + 1} day streak
                    </span>
                  </div>
                </div>
                <div className="text-right ml-4">
                  <div className="text-sm font-bold" style={{ color: '#ffffff' }}>
                    {student.xp.toLocaleString()}
                  </div>
                  <div className="text-xs" style={{ color: '#818181' }}>
                    XP
                  </div>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
      
      {/* Current User */}
      <div 
        className="p-3 rounded-lg hover:scale-[1.02] transition-all duration-300 cursor-pointer backdrop-blur-sm border border-white/5" 
        style={{ 
          backgroundColor: 'rgba(33, 33, 36, 0.8)',
          boxShadow: '0 4px 16px rgba(0, 0, 0, 0.2), inset 0 1px 0 rgba(255, 255, 255, 0.1)',
          transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)'
        }}
        onMouseEnter={(e) => {
          e.currentTarget.style.backgroundColor = 'rgba(33, 33, 36, 0.9)';
          e.currentTarget.style.boxShadow = '0 8px 32px rgba(0, 0, 0, 0.3), 0 0 20px rgba(255,186,8,0.2), inset 0 1px 0 rgba(255, 255, 255, 0.15)';
          e.currentTarget.style.borderColor = 'rgba(255, 186, 8, 0.3)';
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.backgroundColor = 'rgba(33, 33, 36, 0.8)';
          e.currentTarget.style.boxShadow = '0 4px 16px rgba(0, 0, 0, 0.2), inset 0 1px 0 rgba(255, 255, 255, 0.1)';
          e.currentTarget.style.borderColor = 'rgba(255, 255, 255, 0.05)';
        }}
      >
        <div className="flex items-center space-x-3">
          <div 
            className="w-10 h-10 rounded-full flex items-center justify-center text-sm font-bold backdrop-blur-sm border border-white/10"
            style={{ 
              backgroundColor: 'rgba(0, 0, 0, 0.8)',
              boxShadow: '0 2px 8px rgba(0, 0, 0, 0.3), inset 0 1px 0 rgba(255, 255, 255, 0.1)'
            }}
          >
            {currentUser.rank}
          </div>
          <div 
            className="w-10 h-10 rounded-full flex items-center justify-center text-white font-bold text-sm backdrop-blur-sm border border-white/10"
            style={{ 
              backgroundColor: 'rgba(22, 22, 24, 0.8)',
              boxShadow: '0 2px 8px rgba(0, 0, 0, 0.3), inset 0 1px 0 rgba(255, 255, 255, 0.1)'
            }}
          >
            {currentUser.avatar}
          </div>
          <div className="flex-1">
            <div className="flex justify-between items-start">
              <div className="flex-1">
                <p className="text-sm font-semibold text-white">{currentUser.name}</p>
                <div className="flex items-center gap-2 mt-1">
                  <span className="text-xs px-3 py-1 rounded-full backdrop-blur-sm border border-blue-400/40" 
                        style={{ 
                          background: 'linear-gradient(135deg, rgba(59, 130, 246, 0.2) 0%, rgba(37, 99, 235, 0.1) 100%)', 
                          color: '#60a5fa',
                          boxShadow: '0 2px 8px rgba(59, 130, 246, 0.2)'
                        }}>
                    ⭐ {getLevelName(Math.floor(currentUser.xp / 1000) + 1)}
                  </span>
                  <span className="text-xs px-3 py-1 rounded-full backdrop-blur-sm border border-orange-400/50" 
                        style={{ 
                          background: 'linear-gradient(135deg, rgba(255, 165, 0, 0.2) 0%, rgba(255, 140, 0, 0.1) 100%)', 
                          color: '#ffb347',
                          boxShadow: '0 2px 8px rgba(255, 165, 0, 0.3)'
                        }}>
                    🔥 3 day streak
                  </span>
                </div>
              </div>
              <div className="text-right ml-4">
                <div className="text-sm font-bold" style={{ color: '#ffffff' }}>
                  {currentUser.xp.toLocaleString()}
                </div>
                <div className="text-xs" style={{ color: '#818181' }}>
                  XP
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      
      <div className="mt-6 text-center">
        <button 
          className="bg-gradient-to-r from-gold to-lightGold hover:from-lightGold hover:to-gold text-black px-6 py-2 rounded-xl font-bold transition-all duration-300 transform hover:scale-105 backdrop-blur-sm border border-gold/30"
          style={{
            boxShadow: '0 4px 16px rgba(255,186,8,0.3), inset 0 1px 0 rgba(255, 255, 255, 0.2)',
            transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)'
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.boxShadow = '0 8px 32px rgba(255,186,8,0.5), 0 0 20px rgba(255,186,8,0.3), inset 0 1px 0 rgba(255, 255, 255, 0.3)';
            e.currentTarget.style.transform = 'scale(1.05)';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.boxShadow = '0 4px 16px rgba(255,186,8,0.3), inset 0 1px 0 rgba(255, 255, 255, 0.2)';
            e.currentTarget.style.transform = 'scale(1)';
          }}
        >
          View Full Leaderboard
        </button>
      </div>
      </div>
    </div>
  );
};

export default LeaderboardSection; 