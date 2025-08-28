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
  const user = useAuthStore((state) => state.user);
  const [activeTab, setActiveTab] = useState<'challenge' | 'leaderboard' | 'history' | 'realtime'>('realtime');
  const [realtimeTab, setRealtimeTab] = useState<'create' | 'join'>('create');
  const [gameCode, setGameCode] = useState('');
  const [generatedCode, setGeneratedCode] = useState('');
  const [showSettings, setShowSettings] = useState(false);
  
  // Game Settings State
  const [gameSettings, setGameSettings] = useState({
    difficulty: 'medium',
    timeLimit: 120,
    questionCount: 10,
    gameMode: 'classic',
    operation: 'mixed',
    powerUps: true,
    audioMode: false,
    audioPace: 'normal'
  });

  const generateCode = () => {
    const code = Math.random().toString(36).substring(2, 8).toUpperCase();
    setGeneratedCode(code);
  };

  const copyToClipboard = () => {
    navigator.clipboard.writeText(generatedCode);
  };

  const updateGameSetting = (key: string, value: any) => {
    setGameSettings(prev => ({ ...prev, [key]: value }));
  };

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
    { rank: 1, name: "Emma Johnson", score: 8920, streak: 18, avatar: "👑" },
    { rank: 2, name: "Alex Chen", score: 8745, streak: 22, avatar: "🥈" },
    { rank: 3, name: "Sarah Davis", score: 8567, streak: 15, avatar: "🥉" },
    { rank: 4, name: "Mike Wilson", score: 8432, streak: 11, avatar: "⭐" },
    { rank: 5, name: "Lisa Brown", score: 8298, streak: 9, avatar: "🌟" },
    { rank: 6, name: "John Taylor", score: 8156, streak: 13, avatar: "🔥" },
    { rank: 7, name: "Maria Anderson", score: 8023, streak: 7, avatar: "⚡" },
    { rank: 8, name: "David Martinez", score: 7891, streak: 16, avatar: "💎" },
    { rank: 9, name: "Anna Garcia", score: 7754, streak: 12, avatar: "🎯" },
    { rank: 10, name: "Robert Miller", score: 7623, streak: 8, avatar: "🚀" },
  ];

  const recentChallenges = [
    { opponent: "Emma Johnson", result: "Won", score: "15-12", date: "2 hours ago" },
    { opponent: "Alex Chen", result: "Lost", score: "10-18", date: "1 day ago" },
    { opponent: "Sarah Davis", result: "Won", score: "20-15", date: "2 days ago" },
    { opponent: "Mike Wilson", result: "Won", score: "18-14", date: "3 days ago" },
    { opponent: "Lisa Brown", result: "Lost", score: "8-22", date: "4 days ago" },
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
              { id: 'realtime', label: '⚔️ Real-time Battles', icon: AiOutlinePlayCircle },
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
      {activeTab === 'realtime' && (
        <div className="space-y-8 relative z-10">
          <div className="text-center mb-8">
            <h2 className="text-4xl font-black text-white mb-4 drop-shadow-lg">
              ⚔️ EPIC FRIEND BATTLES ⚔️
            </h2>
            <div className="flex justify-center items-center gap-4 mb-4">
              <div className="bg-gradient-to-r from-red-500 to-pink-500 text-white px-3 py-1 rounded-full text-sm font-bold shadow-[0_0_15px_rgba(255,81,91,0.3)]">
                🔥 REAL-TIME BATTLES
              </div>
              <div className="bg-gradient-to-r from-green to-lightGreen text-black px-3 py-1 rounded-full text-sm font-bold shadow-[0_0_15px_rgba(80,217,110,0.3)]">
                🎮 INSTANT MATCHES
              </div>
              <div className="bg-gradient-to-r from-blue to-lightBlue text-white px-3 py-1 rounded-full text-sm font-bold shadow-[0_0_15px_rgba(43,101,237,0.3)]">
                🏅 LEADERBOARDS
              </div>
            </div>
            <p className="text-white/80 text-xl font-semibold">Challenge your friends in EPIC real-time math battles! 🚀</p>
          </div>
          
          {/* Tab Navigation for Create/Join */}
          <div className="flex justify-center mb-8">
            <div className="bg-[#1a1a1a]/80 backdrop-blur-sm rounded-2xl p-1 border border-gold/30 shadow-lg">
              <button
                onClick={() => setRealtimeTab('create')}
                className={`px-6 py-3 rounded-xl font-bold transition-all duration-300 transform hover:scale-105 ${
                  realtimeTab === 'create'
                    ? 'bg-gradient-to-r from-gold to-lightGold text-black shadow-lg shadow-[0_0_20px_rgba(255,186,8,0.3)]'
                    : 'text-white/80 hover:text-gold'
                }`}
              >
                🎮 CREATE BATTLE
              </button>
              <button
                onClick={() => setRealtimeTab('join')}
                className={`px-6 py-3 rounded-xl font-bold transition-all duration-300 transform hover:scale-105 ${
                  realtimeTab === 'join'
                    ? 'bg-gradient-to-r from-gold to-lightGold text-black shadow-lg shadow-[0_0_20px_rgba(255,186,8,0.3)]'
                    : 'text-white/80 hover:text-gold'
                }`}
              >
                🔗 JOIN BATTLE
              </button>
            </div>
          </div>

          {/* Tab Content */}
          <div className="max-w-2xl mx-auto">
            {realtimeTab === 'create' ? (
              <div className="space-y-6">
                {/* Game Settings */}
                <div className="bg-[#080808]/80 hover:bg-[#191919] backdrop-blur-xl p-6 rounded-2xl border border-gold/40 ring-1 ring-white/5 shadow-xl transition-all duration-500 hover:border-gold hover:shadow-[0_0_40px_rgba(255,186,8,0.25)] group relative overflow-hidden">
                  {/* Glassmorphism overlay on hover */}
                  <div className="absolute inset-0 bg-gradient-to-br from-black/20 via-transparent to-gold/10 opacity-0 group-hover:opacity-100 transition-opacity duration-500 rounded-2xl"></div>
                  <div className="absolute inset-0 bg-gradient-to-r from-transparent via-gold/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-700 rounded-2xl"></div>
                  
                  <div className="relative z-10">
                    <div className="flex justify-between items-center mb-6">
                      <h3 className="text-xl font-bold text-gold">⚙️ BATTLE SETTINGS</h3>
                      <button
                        onClick={() => setShowSettings(!showSettings)}
                        className="bg-gradient-to-r from-blue to-lightBlue hover:from-blue/80 hover:to-lightBlue/80 text-white font-bold py-2 px-4 rounded-xl transition-all duration-300 transform hover:scale-105 shadow-[0_0_15px_rgba(43,101,237,0.3)]"
                      >
                        {showSettings ? '🔽 HIDE' : '🔼 CUSTOMIZE'}
                      </button>
                    </div>
                    
                    {showSettings && (
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                        {/* Difficulty */}
                        <div>
                          <label className="block text-sm font-bold text-gold mb-2">🎯 DIFFICULTY</label>
                          <select
                            value={gameSettings.difficulty}
                            onChange={(e) => updateGameSetting('difficulty', e.target.value)}
                            className="w-full bg-[#1a1a1a]/80 backdrop-blur-sm rounded-xl p-3 border-2 border-gold/30 focus:border-gold focus:outline-none font-semibold text-white shadow-[0_0_15px_rgba(255,186,8,0.1)]"
                          >
                            <option value="easy">🟢 EASY - Beginner Friendly</option>
                            <option value="medium">🟡 MEDIUM - Balanced Challenge</option>
                            <option value="hard">🔴 HARD - Expert Level</option>
                            <option value="extreme">⚫ EXTREME - Ultimate Test</option>
                          </select>
                        </div>

                        {/* Time Limit */}
                        <div>
                          <label className="block text-sm font-bold text-gold mb-2">⏱️ TIME LIMIT</label>
                          <select
                            value={gameSettings.timeLimit}
                            onChange={(e) => updateGameSetting('timeLimit', parseInt(e.target.value))}
                            className="w-full bg-[#1a1a1a]/80 backdrop-blur-sm rounded-xl p-3 border-2 border-gold/30 focus:border-gold focus:outline-none font-semibold text-white shadow-[0_0_15px_rgba(255,186,8,0.1)]"
                          >
                            <option value={60}>1 MINUTE - Lightning Fast</option>
                            <option value={120}>2 MINUTES - Quick Battle</option>
                            <option value={180}>3 MINUTES - Standard</option>
                            <option value={300}>5 MINUTES - Extended</option>
                            <option value={600}>10 MINUTES - Marathon</option>
                          </select>
                        </div>

                        {/* Question Count */}
                        <div>
                          <label className="block text-sm font-bold text-gold mb-2">❓ QUESTIONS</label>
                          <select
                            value={gameSettings.questionCount}
                            onChange={(e) => updateGameSetting('questionCount', parseInt(e.target.value))}
                            className="w-full bg-[#1a1a1a]/80 backdrop-blur-sm rounded-xl p-3 border-2 border-gold/30 focus:border-gold focus:outline-none font-semibold text-white shadow-[0_0_15px_rgba(255,186,8,0.1)]"
                          >
                            <option value={5}>5 QUESTIONS - Quick Duel</option>
                            <option value={10}>10 QUESTIONS - Standard Battle</option>
                            <option value={15}>15 QUESTIONS - Extended War</option>
                            <option value={20}>20 QUESTIONS - Epic Showdown</option>
                            <option value={30}>30 QUESTIONS - Ultimate Challenge</option>
                          </select>
                        </div>

                        {/* Game Mode */}
                        <div>
                          <label className="block text-sm font-bold text-gold mb-2">🎮 GAME MODE</label>
                          <select
                            value={gameSettings.gameMode}
                            onChange={(e) => updateGameSetting('gameMode', e.target.value)}
                            className="w-full bg-[#1a1a1a]/80 backdrop-blur-sm rounded-xl p-3 border-2 border-gold/30 focus:border-gold focus:outline-none font-semibold text-white shadow-[0_0_15px_rgba(255,186,8,0.1)]"
                          >
                            <option value="classic">⚔️ CLASSIC - Standard Battle</option>
                            <option value="speed">⚡ SPEED - Fastest Wins</option>
                            <option value="accuracy">🎯 ACCURACY - Perfect Answers</option>
                            <option value="survival">💀 SURVIVAL - No Mistakes Allowed</option>
                            <option value="combo">🔥 COMBO - Chain Correct Answers</option>
                          </select>
                        </div>

                        {/* Operation Type */}
                        <div>
                          <label className="block text-sm font-bold text-gold mb-2">🧮 OPERATIONS</label>
                          <select
                            value={gameSettings.operation}
                            onChange={(e) => updateGameSetting('operation', e.target.value)}
                            className="w-full bg-[#1a1a1a]/80 backdrop-blur-sm rounded-xl p-3 border-2 border-gold/30 focus:border-gold focus:outline-none font-semibold text-white shadow-[0_0_15px_rgba(255,186,8,0.1)]"
                          >
                            <option value="mixed">🎲 MIXED - All Operations</option>
                            <option value="addition">➕ ADDITION ONLY</option>
                            <option value="subtraction">➖ SUBTRACTION ONLY</option>
                            <option value="multiplication">✖️ MULTIPLICATION ONLY</option>
                            <option value="division">➗ DIVISION ONLY</option>
                          </select>
                        </div>

                        {/* Power Ups */}
                        <div>
                          <label className="block text-sm font-bold text-gold mb-2">⚡ POWER-UPS</label>
                          <div className="flex items-center space-x-4">
                            <label className="flex items-center">
                              <input
                                type="checkbox"
                                checked={gameSettings.powerUps}
                                onChange={(e) => updateGameSetting('powerUps', e.target.checked)}
                                className="w-5 h-5 text-gold bg-[#1a1a1a]/80 rounded focus:ring-gold border-gold/30"
                              />
                              <span className="ml-2 text-sm font-semibold text-white">Enable Power-ups</span>
                            </label>
                          </div>
                          {gameSettings.powerUps && (
                            <p className="text-xs text-white/60 mt-1">💡 Double points, time freeze, skip question</p>
                          )}
                        </div>

                        {/* Audio Mode */}
                        <div>
                          <label className="block text-sm font-bold text-gold mb-2">🔊 AUDIO MODE</label>
                          <div className="flex items-center space-x-4 mb-3">
                            <label className="flex items-center">
                              <input
                                type="checkbox"
                                checked={gameSettings.audioMode}
                                onChange={(e) => updateGameSetting('audioMode', e.target.checked)}
                                className="w-5 h-5 text-gold bg-[#1a1a1a]/80 rounded focus:ring-gold border-gold/30"
                              />
                              <span className="ml-2 text-sm font-semibold text-white">Enable Audio Questions</span>
                            </label>
                          </div>
                          {gameSettings.audioMode && (
                            <div className="space-y-2">
                              <label className="block text-xs font-bold text-gold">🎵 SPEECH PACE</label>
                              <select
                                value={gameSettings.audioPace}
                                onChange={(e) => updateGameSetting('audioPace', e.target.value)}
                                className="w-full bg-[#1a1a1a]/80 backdrop-blur-sm rounded-lg p-2 border border-gold/30 focus:border-gold focus:outline-none text-xs font-semibold text-white"
                              >
                                <option value="slow">🐌 SLOW - Easy to Follow</option>
                                <option value="normal">👤 NORMAL - Natural Speed</option>
                                <option value="fast">⚡ FAST - Quick Challenge</option>
                                <option value="ultra">🚀 ULTRA - Lightning Speed</option>
                              </select>
                              <p className="text-xs text-white/60">🎧 Questions read aloud, you type answers</p>
                            </div>
                          )}
                        </div>
                      </div>
                    )}

                    {/* Settings Summary */}
                    <div className="bg-[#1a1a1a] rounded-xl p-4 border border-gold/30">
                      <h4 className="font-bold text-gold mb-2">📋 BATTLE SUMMARY</h4>
                      <div className="grid grid-cols-2 md:grid-cols-3 gap-2 text-sm">
                        <button 
                          onClick={() => setShowSettings(!showSettings)}
                          className="bg-[#080808] hover:bg-[#191919] rounded-lg p-2 text-center border border-gold/20 transition-colors cursor-pointer"
                        >
                          <div className="font-bold text-gold">🎯</div>
                          <div className="text-xs text-white">{gameSettings.difficulty.toUpperCase()}</div>
                        </button>
                        <button 
                          onClick={() => setShowSettings(!showSettings)}
                          className="bg-[#080808] hover:bg-[#191919] rounded-lg p-2 text-center border border-gold/20 transition-colors cursor-pointer"
                        >
                          <div className="font-bold text-blue">⏱️</div>
                          <div className="text-xs text-white">{gameSettings.timeLimit}s</div>
                        </button>
                        <button 
                          onClick={() => setShowSettings(!showSettings)}
                          className="bg-[#080808] hover:bg-[#191919] rounded-lg p-2 text-center border border-gold/20 transition-colors cursor-pointer"
                        >
                          <div className="font-bold text-green">❓</div>
                          <div className="text-xs text-white">{gameSettings.questionCount} Q</div>
                        </button>
                        <button 
                          onClick={() => setShowSettings(!showSettings)}
                          className="bg-[#080808] hover:bg-[#191919] rounded-lg p-2 text-center border border-gold/20 transition-colors cursor-pointer"
                        >
                          <div className="font-bold text-orange">🎮</div>
                          <div className="text-xs text-white">{gameSettings.gameMode.toUpperCase()}</div>
                        </button>
                        <button 
                          onClick={() => setShowSettings(!showSettings)}
                          className="bg-[#080808] hover:bg-[#191919] rounded-lg p-2 text-center border border-gold/20 transition-colors cursor-pointer"
                        >
                          <div className="font-bold text-purple">🔊</div>
                          <div className="text-xs text-white">{gameSettings.audioMode ? 'ON' : 'OFF'}</div>
                        </button>
                        {gameSettings.audioMode && (
                          <button 
                            onClick={() => setShowSettings(!showSettings)}
                            className="bg-[#080808] hover:bg-[#191919] rounded-lg p-2 text-center border border-gold/20 transition-colors cursor-pointer"
                          >
                            <div className="font-bold text-pink">🎵</div>
                            <div className="text-xs text-white">{gameSettings.audioPace.toUpperCase()}</div>
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
                
                {/* Code Generation */}
                <div className="text-center space-y-6">
                  {!generatedCode ? (
                    <button
                      onClick={generateCode}
                      className="w-full bg-gold hover:bg-lightGold text-black font-black py-6 px-8 rounded-2xl transition-all duration-300 transform hover:scale-105"
                    >
                      🚀 GENERATE BATTLE CODE
                    </button>
                  ) : (
                    <div className="space-y-4">
                      <div className="bg-[#1a1a1a] rounded-2xl p-6 border border-gold/30">
                        <p className="text-gold font-bold mb-2">🎮 YOUR BATTLE CODE:</p>
                        <div className="text-5xl font-black text-gold mb-4 tracking-wider">
                          {generatedCode}
                        </div>
                        <div className="flex gap-2 justify-center">
                          <button
                            onClick={copyToClipboard}
                            className="bg-blue hover:bg-lightBlue text-white font-bold py-3 px-6 rounded-xl transition-colors"
                          >
                            📋 Copy Code
                          </button>
                          <button
                            onClick={generateCode}
                            className="bg-grey hover:bg-darkGrey text-white font-bold py-3 px-6 rounded-xl transition-colors"
                          >
                            🔄 New Code
                          </button>
                        </div>
                      </div>
                      <button
                        onClick={() => {/* Start game logic */}}
                        className="w-full bg-green hover:bg-lightGreen text-black font-black py-6 px-8 rounded-2xl transition-colors"
                      >
                        ⚔️ LAUNCH BATTLE ⚔️
                      </button>
                    </div>
                  )}
                </div>
              </div>
            ) : (
              <div className="text-center space-y-6">
                <h3 className="text-2xl font-bold text-gold mb-2">🔗 JOIN EPIC BATTLE</h3>
                <p className="text-white/80 mb-6">
                  Enter the battle code your friend shared and prepare for an epic math showdown! ⚔️
                </p>
                
                <div className="space-y-4">
                  <div className="relative">
                    <input
                      type="text"
                      value={gameCode}
                      onChange={(e) => setGameCode(e.target.value.toUpperCase())}
                      placeholder="ENTER 6-DIGIT BATTLE CODE"
                      maxLength={6}
                      className="w-full text-center text-3xl font-black tracking-wider bg-[#1a1a1a]/80 backdrop-blur-sm rounded-2xl p-6 border-2 border-gold/30 focus:border-gold focus:outline-none placeholder-white/40 shadow-[0_0_20px_rgba(255,186,8,0.1)]"
                    />
                    <div className="absolute right-4 top-1/2 transform -translate-y-1/2 text-2xl">
                      {gameCode.length === 6 ? '✅' : '🎮'}
                    </div>
                  </div>
                  <button
                    onClick={() => {/* Join game logic */}}
                    disabled={gameCode.length !== 6}
                    className={`w-full font-black py-6 px-8 rounded-2xl transition-all duration-500 transform hover:scale-105 shadow-xl ${
                      gameCode.length === 6
                        ? 'bg-gradient-to-r from-green to-lightGreen hover:from-green/90 hover:to-lightGreen/90 text-black shadow-[0_0_40px_rgba(80,217,110,0.4)] hover:shadow-[0_0_60px_rgba(80,217,110,0.6)]'
                        : 'bg-[#1a1a1a] text-white/40 cursor-not-allowed border border-grey/30'
                    }`}
                  >
                    {gameCode.length === 6 ? '⚔️ JOIN BATTLE ⚔️' : 'ENTER 6-DIGIT CODE'}
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

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