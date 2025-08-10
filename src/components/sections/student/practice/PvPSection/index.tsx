import { FC, useState } from 'react';
import { Link } from 'react-router-dom';
import { 
  AiOutlineTrophy, 
  AiOutlineClockCircle,
  AiOutlineFire,
  AiOutlineTeam,
  AiOutlinePlayCircle,
  AiOutlineCrown
} from 'react-icons/ai';

import { useAuthStore } from '@store/authStore';

import { STUDENT_SET } from '@constants/routes';

export interface PvPSectionProps {}

const PvPSection: FC<PvPSectionProps> = () => {
  useAuthStore((state) => state.user);
  const [activeTab, setActiveTab] = useState<'challenge' | 'leaderboard' | 'history'>('challenge');

  const pvpModes = [
    {
      title: "Quick Duel",
      image: "/images/pvp-duel.svg",
      description: "Challenge a friend to a quick 5-question math duel! Fast-paced action with instant results.",
      link: `${STUDENT_SET}/pvp-quick`,
      color: "purple" as const,
      icon: AiOutlinePlayCircle,
      difficulty: "Easy",
      timeLimit: "2 min"
    },
    {
      title: "Tournament Mode",
      image: "/images/pvp-tournament.svg", 
      description: "Join a tournament with multiple players! Compete in brackets and climb to the top.",
      link: `${STUDENT_SET}/pvp-tournament`,
      color: "gold" as const,
      icon: AiOutlineTrophy,
      difficulty: "Hard",
      timeLimit: "10 min"
    },
    {
      title: "Team Battle",
      image: "/images/pvp-team.svg",
      description: "Form teams and battle against other groups! Collaborative problem solving.",
      link: `${STUDENT_SET}/pvp-team`,
      color: "blue" as const,
      icon: AiOutlineTeam,
      difficulty: "Medium", 
      timeLimit: "5 min"
    },
    {
      title: "Speed Challenge",
      image: "/images/pvp-speed.svg",
      description: "Race against time and other players! Fastest correct answers win.",
      link: `${STUDENT_SET}/pvp-speed`,
      color: "red" as const,
      icon: AiOutlineFire,
      difficulty: "Hard",
      timeLimit: "1 min"
    }
  ];

  const leaderboardData = [
    { rank: 1, name: "Math Master", score: 2850, streak: 15, avatar: "👑" },
    { rank: 2, name: "Number Ninja", score: 2720, streak: 12, avatar: "🥈" },
    { rank: 3, name: "Calc Champion", score: 2580, streak: 10, avatar: "🥉" },
    { rank: 4, name: "Abacus Ace", score: 2450, streak: 8, avatar: "⭐" },
    { rank: 5, name: "Sum Superstar", score: 2320, streak: 7, avatar: "🌟" },
  ];

  const recentChallenges = [
    { opponent: "Math Master", result: "Won", score: "15-12", date: "2 hours ago" },
    { opponent: "Number Ninja", result: "Lost", score: "10-18", date: "1 day ago" },
    { opponent: "Calc Champion", result: "Won", score: "20-15", date: "2 days ago" },
  ];

  return (
    <div className="tablet:p-10 desktop:px-24 flex flex-col justify-between gap-8 px-6 py-4 min-h-full bg-gradient-to-br from-indigo-900 via-purple-900 via-pink-900 to-orange-900 relative overflow-hidden">
      {/* Animated Background Elements */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute top-20 left-10 w-32 h-32 bg-yellow-400/20 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute top-40 right-20 w-24 h-24 bg-pink-400/20 rounded-full blur-2xl animate-bounce"></div>
        <div className="absolute bottom-20 left-1/4 w-40 h-40 bg-blue-400/20 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute bottom-40 right-1/3 w-28 h-28 bg-green-400/20 rounded-full blur-2xl animate-bounce"></div>
      </div>

      {/* Header Section */}
      <div className="text-center mb-8 relative z-10">
        <div className="inline-block p-4 bg-gradient-to-r from-yellow-400 via-orange-400 to-red-400 rounded-full mb-6 animate-pulse">
          <h1 className="text-5xl font-black bg-gradient-to-r from-purple-600 via-pink-600 to-blue-600 bg-clip-text text-transparent mb-2">
            ⚔️ BATTLE ARENA ⚔️
          </h1>
        </div>
        <h2 className="text-3xl font-bold text-white mb-4 drop-shadow-lg">
          Player vs Player
        </h2>
        <p className="text-yellow-200 text-xl max-w-3xl mx-auto font-semibold drop-shadow-md">
          🏆 Challenge your friends, compete in tournaments, and climb the leaderboard! 
          🚀 Test your math skills against other students in EPIC real-time battles!
        </p>
      </div>

      {/* Tab Navigation */}
      <div className="flex justify-center mb-8 relative z-10">
        <div className="bg-gradient-to-r from-purple-600/30 via-pink-600/30 to-orange-600/30 backdrop-blur-xl rounded-3xl p-3 border-2 border-yellow-400/50 shadow-2xl">
          <div className="flex space-x-3">
            {[
              { id: 'challenge', label: '🎮 Challenge Modes', icon: AiOutlinePlayCircle },
              { id: 'leaderboard', label: '🏆 Leaderboard', icon: AiOutlineTrophy },
              { id: 'history', label: '⚔️ Recent Battles', icon: AiOutlineClockCircle }
            ].map((tab) => {
              const Icon = tab.icon;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id as any)}
                  className={`flex items-center space-x-3 px-8 py-4 rounded-2xl transition-all duration-500 font-bold text-lg ${
                    activeTab === tab.id
                      ? 'bg-gradient-to-r from-yellow-400 via-orange-400 to-red-400 text-white shadow-2xl transform scale-105'
                      : 'text-yellow-200 hover:text-white hover:bg-gradient-to-r hover:from-purple-500/50 hover:to-pink-500/50 hover:shadow-xl'
                  }`}
                >
                  <Icon size={20} />
                  <span className="font-bold">{tab.label}</span>
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* Content Sections */}
      {activeTab === 'challenge' && (
        <div className="space-y-8 relative z-10">
          <div className="text-center mb-8">
            <h2 className="text-4xl font-black text-white mb-4 drop-shadow-lg">
              🎯 CHOOSE YOUR BATTLE MODE
            </h2>
            <p className="text-yellow-200 text-xl font-semibold drop-shadow-md">
              Select your weapon and prepare for EPIC battles! 💪
            </p>
          </div>
          
          <div className="grid grid-cols-4 gap-4 w-full">
            {pvpModes.map((mode, index) => {
              return (
                                 <div key={index} className="group relative">
                   <div className="bg-gradient-to-br from-purple-600/40 via-pink-600/40 to-orange-600/40 backdrop-blur-xl rounded-3xl p-8 border-2 border-yellow-400/50 hover:border-yellow-300/80 transition-all duration-700 hover:transform hover:scale-110 hover:shadow-2xl hover:shadow-yellow-400/30 relative overflow-hidden">
                     {/* Animated background glow */}
                     <div className="absolute inset-0 bg-gradient-to-r from-yellow-400/10 via-orange-400/10 to-red-400/10 opacity-0 group-hover:opacity-100 transition-opacity duration-700"></div>
                     
                     {/* Difficulty Badge */}
                     <div className="absolute top-4 right-4 z-10">
                       <span className={`px-4 py-2 rounded-full text-sm font-black ${
                         mode.difficulty === 'Easy' ? 'bg-gradient-to-r from-green-400 to-emerald-400 text-white shadow-lg' :
                         mode.difficulty === 'Medium' ? 'bg-gradient-to-r from-yellow-400 to-orange-400 text-white shadow-lg' :
                         'bg-gradient-to-r from-red-400 to-pink-400 text-white shadow-lg'
                       }`}>
                         {mode.difficulty}
                       </span>
                     </div>

                     {/* Time Badge */}
                     <div className="absolute top-4 left-4 z-10">
                       <span className="px-4 py-2 rounded-full text-sm font-black bg-gradient-to-r from-blue-400 to-cyan-400 text-white shadow-lg flex items-center space-x-2">
                         <AiOutlineClockCircle size={14} />
                         <span>{mode.timeLimit}</span>
                       </span>
                     </div>

                     <div className="text-center space-y-6 mt-12 relative z-10">
                       <div className="relative">
                         <img 
                           src={mode.image}
                           alt={mode.title}
                           className="w-24 h-24 mx-auto rounded-3xl shadow-2xl group-hover:shadow-yellow-400/50 transition-all duration-700 group-hover:scale-125 group-hover:rotate-12"
                         />
                         {/* Glow effect */}
                         <div className="absolute inset-0 w-24 h-24 mx-auto rounded-3xl bg-yellow-400/30 blur-xl opacity-0 group-hover:opacity-100 transition-opacity duration-700"></div>
                       </div>
                       
                       <h3 className="font-black text-white text-2xl drop-shadow-lg">{mode.title}</h3>
                       <p className="text-yellow-200 text-base leading-relaxed font-medium">{mode.description}</p>
                       
                       <Link
                         to={mode.link}
                         className="inline-block w-full bg-gradient-to-r from-yellow-400 via-orange-400 to-red-400 hover:from-yellow-300 hover:via-orange-300 hover:to-red-300 text-white font-black py-4 px-8 rounded-2xl transition-all duration-500 transform hover:scale-110 shadow-2xl hover:shadow-yellow-400/50 text-lg"
                       >
                         🚀 START BATTLE
                       </Link>
                     </div>
                   </div>
                 </div>
              );
            })}
          </div>
        </div>
      )}

             {activeTab === 'leaderboard' && (
         <div className="max-w-4xl mx-auto relative z-10">
           <div className="text-center mb-8">
             <h2 className="text-4xl font-black text-white mb-4 drop-shadow-lg">🏆 GLOBAL LEADERBOARD</h2>
             <p className="text-yellow-200 text-xl font-semibold drop-shadow-md">Top warriors this week! ⚔️</p>
           </div>
           
           <div className="bg-gradient-to-r from-purple-600/40 via-pink-600/40 to-orange-600/40 backdrop-blur-xl rounded-3xl border-2 border-yellow-400/50 overflow-hidden shadow-2xl">
            <div className="p-6">
              <div className="space-y-4">
                                 {leaderboardData.map((player, index) => (
                   <div key={index} className="flex items-center justify-between p-6 bg-gradient-to-r from-purple-500/20 via-pink-500/20 to-orange-500/20 rounded-2xl hover:from-purple-500/30 hover:via-pink-500/30 hover:to-orange-500/30 transition-all duration-500 border border-yellow-400/30 hover:border-yellow-400/50">
                     <div className="flex items-center space-x-6">
                       <div className="text-4xl animate-bounce">{player.avatar}</div>
                       <div>
                         <h3 className="font-black text-white text-xl drop-shadow-lg">{player.name}</h3>
                         <div className="flex items-center space-x-3 text-base text-yellow-200 font-semibold">
                           <span className="bg-gradient-to-r from-yellow-400 to-orange-400 text-white px-3 py-1 rounded-full text-sm font-black">Rank #{player.rank}</span>
                           <div className="flex items-center space-x-2">
                             <AiOutlineFire className="text-orange-400 animate-pulse" size={16} />
                             <span>{player.streak} day streak 🔥</span>
                           </div>
                         </div>
                       </div>
                     </div>
                     <div className="text-right">
                       <div className="text-3xl font-black text-yellow-400 drop-shadow-lg">{player.score}</div>
                       <div className="text-yellow-200 font-semibold">POINTS</div>
                     </div>
                   </div>
                 ))}
              </div>
            </div>
          </div>
        </div>
      )}

             {activeTab === 'history' && (
         <div className="max-w-4xl mx-auto relative z-10">
           <div className="text-center mb-8">
             <h2 className="text-4xl font-black text-white mb-4 drop-shadow-lg">⚔️ RECENT BATTLES</h2>
             <p className="text-yellow-200 text-xl font-semibold drop-shadow-md">Your latest epic challenges! 🗡️</p>
           </div>
           
           <div className="bg-gradient-to-r from-purple-600/40 via-pink-600/40 to-orange-600/40 backdrop-blur-xl rounded-3xl border-2 border-yellow-400/50 overflow-hidden shadow-2xl">
            <div className="p-6">
              <div className="space-y-4">
                                 {recentChallenges.map((battle, index) => (
                   <div key={index} className="flex items-center justify-between p-6 bg-gradient-to-r from-purple-500/20 via-pink-500/20 to-orange-500/20 rounded-2xl hover:from-purple-500/30 hover:via-pink-500/30 hover:to-orange-500/30 transition-all duration-500 border border-yellow-400/30 hover:border-yellow-400/50">
                     <div className="flex items-center space-x-6">
                       <div className={`w-16 h-16 rounded-full flex items-center justify-center text-2xl ${
                         battle.result === 'Won' ? 'bg-gradient-to-r from-green-400 to-emerald-400 text-white shadow-lg animate-pulse' : 'bg-gradient-to-r from-red-400 to-pink-400 text-white shadow-lg'
                       }`}>
                         {battle.result === 'Won' ? '🏆' : '💔'}
                       </div>
                       <div>
                         <h3 className="font-black text-white text-xl drop-shadow-lg">⚔️ vs {battle.opponent}</h3>
                         <p className="text-yellow-200 font-semibold">{battle.date}</p>
                       </div>
                     </div>
                     <div className="text-right">
                       <div className={`text-2xl font-black ${
                         battle.result === 'Won' ? 'text-green-400' : 'text-red-400'
                       } drop-shadow-lg`}>
                         {battle.result}
                       </div>
                       <div className="text-yellow-200 font-semibold">{battle.score}</div>
                     </div>
                   </div>
                 ))}
              </div>
            </div>
          </div>
        </div>
      )}

             {/* Quick Stats */}
       <div className="mt-8 relative z-10">
         <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
           <div className="bg-gradient-to-r from-purple-600/40 via-pink-600/40 to-orange-600/40 backdrop-blur-xl rounded-3xl p-8 border-2 border-yellow-400/50 shadow-2xl hover:shadow-yellow-400/30 transition-all duration-500 hover:scale-105">
             <div className="flex items-center space-x-6">
               <div className="w-16 h-16 bg-gradient-to-r from-purple-400 to-pink-400 rounded-2xl flex items-center justify-center shadow-lg">
                 <AiOutlineTrophy className="text-white" size={32} />
               </div>
               <div>
                 <div className="text-4xl font-black text-white drop-shadow-lg">24</div>
                 <div className="text-yellow-200 font-bold text-lg">BATTLES WON</div>
               </div>
             </div>
           </div>
           
           <div className="bg-gradient-to-r from-blue-600/40 via-cyan-600/40 to-teal-600/40 backdrop-blur-xl rounded-3xl p-8 border-2 border-yellow-400/50 shadow-2xl hover:shadow-yellow-400/30 transition-all duration-500 hover:scale-105">
             <div className="flex items-center space-x-6">
               <div className="w-16 h-16 bg-gradient-to-r from-blue-400 to-cyan-400 rounded-2xl flex items-center justify-center shadow-lg">
                 <AiOutlineFire className="text-white animate-pulse" size={32} />
               </div>
               <div>
                 <div className="text-4xl font-black text-white drop-shadow-lg">7</div>
                 <div className="text-yellow-200 font-bold text-lg">DAY STREAK</div>
               </div>
             </div>
           </div>
           
           <div className="bg-gradient-to-r from-green-600/40 via-emerald-600/40 to-teal-600/40 backdrop-blur-xl rounded-3xl p-8 border-2 border-yellow-400/50 shadow-2xl hover:shadow-yellow-400/30 transition-all duration-500 hover:scale-105">
             <div className="flex items-center space-x-6">
               <div className="w-16 h-16 bg-gradient-to-r from-green-400 to-emerald-400 rounded-2xl flex items-center justify-center shadow-lg">
                 <AiOutlineCrown className="text-white" size={32} />
               </div>
               <div>
                 <div className="text-4xl font-black text-white drop-shadow-lg">1560</div>
                 <div className="text-yellow-200 font-bold text-lg">TOTAL POINTS</div>
               </div>
             </div>
           </div>
         </div>
       </div>
    </div>
  );
};

export default PvPSection; 