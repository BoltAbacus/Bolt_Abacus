import { FC, useState } from 'react';
import { Link } from 'react-router-dom';

import PracticeCard from '@components/molecules/PracticeCard';

import {
  STUDENT_FLASHCARDS,
  STUDENT_SET,
  STUDENT_TIMED,
  STUDENT_UNTIMED,
  STUDENT_PVP,
} from '@constants/routes';

export interface PracticeSectionProps {}

const PracticeSection: FC<PracticeSectionProps> = () => {
  const [activeTab, setActiveTab] = useState<'create' | 'join'>('create');
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

  return (
    <div className="min-h-screen bg-black">
      <div className="px-6 pt-2 tablet:p-10 desktop:px-24 space-y-6 bg-black min-h-screen">
        {/* 🔝 HEADER AREA */}
        <div className="bg-black hover:bg-[#191919] transition-colors text-white p-8 rounded-2xl border border-gold/50 ring-1 ring-white/5 backdrop-blur-xl shadow-[0_12px_36px_rgba(0,0,0,0.65)] relative overflow-hidden">
          {/* Subtle gold glow overlays */}
          <div className="pointer-events-none absolute -inset-14 bg-[radial-gradient(circle_at_top_left,rgba(255,186,8,0.08),transparent_40%),radial-gradient(circle_at_bottom_right,rgba(250,163,7,0.06),transparent_45%)]"></div>
          {/* Glass highlight lines */}
          <div className="pointer-events-none absolute inset-x-0 top-0 h-px bg-white/10"></div>
          <div className="pointer-events-none absolute inset-x-0 bottom-0 h-px bg-black/40"></div>
          <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-gold via-lightGold to-gold"></div>
          
          <div className="relative z-10 text-center">
            <h1 className="text-5xl font-black text-gold mb-4">
              ⚔️ BATTLE ARENA ⚔️
        </h1>
            <div className="flex justify-center items-center gap-4 mb-6">
              <div className="bg-gold text-black px-4 py-2 rounded-full font-bold">
                ⚡ LEVEL UP YOUR SKILLS
              </div>
              <div className="bg-purple text-white px-4 py-2 rounded-full font-bold">
                🏆 EARN ACHIEVEMENTS
              </div>
            </div>
            <p className="text-white text-lg max-w-3xl mx-auto">
              Enter the ultimate math battlefield! Challenge friends, unlock achievements, and become the ultimate math warrior! 
              <span className="font-bold text-gold"> Ready to dominate? 🚀</span>
        </p>
      </div>
        </div>

        {/* PvP Mode Section */}
        <div className="bg-[#080808] hover:bg-[#1b1b1b] transition-colors backdrop-blur-xl text-white p-8 rounded-2xl border border-gold/50 shadow-2xl shadow-black/50 relative overflow-hidden">
          {/* Background elements */}
          <div className="absolute inset-0 bg-gradient-to-r from-purple-500/5 via-transparent to-pink-500/5"></div>
          <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-purple-400 via-pink-500 to-red-500"></div>
          
          <div className="relative z-10">
        <div className="text-center mb-8">
              <div className="inline-block transform hover:scale-110 transition-transform duration-300">
                <h2 className="text-4xl font-black bg-gradient-to-r from-gold via-lightGold to-orange-500 bg-clip-text text-transparent mb-4 drop-shadow-lg">
                  ⚔️ EPIC FRIEND BATTLES ⚔️
          </h2>
              </div>
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
            
            {/* Tab Navigation */}
            <div className="flex justify-center mb-8">
              <div className="bg-[#1a1a1a]/80 backdrop-blur-sm rounded-2xl p-1 border border-gold/30 shadow-lg">
                <button
                  onClick={() => setActiveTab('create')}
                  className={`px-6 py-3 rounded-xl font-bold transition-all duration-300 transform hover:scale-105 ${
                    activeTab === 'create'
                      ? 'bg-gradient-to-r from-gold to-lightGold text-black shadow-lg shadow-[0_0_20px_rgba(255,186,8,0.3)]'
                      : 'text-white/80 hover:text-gold'
                  }`}
                >
                  🎮 CREATE BATTLE
                </button>
                <button
                  onClick={() => setActiveTab('join')}
                  className={`px-6 py-3 rounded-xl font-bold transition-all duration-300 transform hover:scale-105 ${
                    activeTab === 'join'
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
              {activeTab === 'create' ? (
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
        </div>

        {/* Solo Practice Sections */}
        <div className="space-y-6">
          <div className="bg-[#080808] hover:bg-[#1b1b1b] transition-colors backdrop-blur-xl text-white p-8 rounded-2xl border border-gold/50 shadow-2xl shadow-black/50 relative overflow-hidden">
            {/* Background elements */}
            <div className="absolute inset-0 bg-gradient-to-r from-green-500/5 via-transparent to-blue-500/5"></div>
            <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-green-400 via-blue-500 to-purple-500"></div>
            
            <div className="relative z-10 text-center mb-8">
              <h2 className="text-4xl font-black bg-gradient-to-r from-gold via-lightGold to-orange-500 bg-clip-text text-transparent mb-4">
                🏰 SOLO TRAINING GROUNDS 🏰
              </h2>
              <p className="text-white text-xl font-semibold">Master your skills before entering the battlefield! ⚔️</p>
      </div>

        <div className="flex flex-col gap-6">
          <div className="text-center">
                <h2 className="text-3xl font-bold bg-gradient-to-r from-green to-lightGreen bg-clip-text text-transparent mb-2">
              ➕ Addition and Subtraction
            </h2>
                <p className="text-white">Master the fundamentals of addition and subtraction</p>
          </div>
          <div className="gap-6 grid grid-cols-1 desktop:grid-cols-4 tablet:grid-cols-2 py-4">
          <PracticeCard
            title="Flash Cards"
            image="/images/flashcards.png"
            description="Use flashcards to test your knowledge! Quickly go through each card and try to get the right answer."
            link={`${STUDENT_FLASHCARDS}`}
            color="red"
          />
          <PracticeCard
            title="No Rush Mastery"
            image="/images/unlimited-time.png"
            description="Take all the time you need to answer each question. There's no rush, just do your best!"
            link={`${STUDENT_UNTIMED}/addition`}
            color="blue"
          />
          <PracticeCard
            title="Question Countdown"
            image="/images/timed.png"
            description="The clock is ticking! Lets see how many questions you can answer before time runs out"
            link={`${STUDENT_TIMED}/addition`}
            color="green"
          />
          <PracticeCard
            title="Set Practice"
            image="/images/set.png"
            description="You can set the number of questions and the time limit. The clock is ticking! Answer them all before time runs out"
            link={`${STUDENT_SET}/addition`}
            color="pink"
          />
        </div>
      </div>
        
        <div className="flex flex-col gap-6">
          <div className="text-center">
                <h2 className="text-3xl font-bold bg-gradient-to-r from-orange to-red bg-clip-text text-transparent mb-2">
              ✖️ Multiplication
            </h2>
                <p className="text-white">Practice multiplication tables and techniques</p>
          </div>
          <div className="gap-6 grid grid-cols-1 desktop:grid-cols-3 tablet:grid-cols-3 py-4">
          <PracticeCard
            title="No Rush Mastery"
            image="/images/unlimited-time.png"
            description="Take all the time you need to answer each question. There's no rush, just do your best!"
            link={`${STUDENT_UNTIMED}/multiplication`}
            color="blue"
          />
          <PracticeCard
            title="Question Countdown"
            image="/images/timed.png"
            description="The clock is ticking! Lets see how many questions you can answer before time runs out"
            link={`${STUDENT_TIMED}/multiplication`}
            color="green"
          />
          <PracticeCard
            title="Set Practice"
            image="/images/set.png"
            description="You can set the number of questions and the time limit. The clock is ticking! Answer them all before time runs out"
            link={`${STUDENT_SET}/multiplication`}
            color="pink"
          />
        </div>
      </div>
        
        <div className="flex flex-col gap-6">
          <div className="text-center">
                <h2 className="text-3xl font-bold bg-gradient-to-r from-purple to-pink-500 bg-clip-text text-transparent mb-2">
              ➗ Division
            </h2>
                <p className="text-white">Master division techniques and problem solving</p>
          </div>
          <div className="gap-6 grid grid-cols-1 desktop:grid-cols-3 tablet:grid-cols-3 py-4">
          <PracticeCard
            title="No Rush Mastery"
            image="/images/unlimited-time.png"
            description="Take all the time you need to answer each question. There's no rush, just do your best!"
            link={`${STUDENT_UNTIMED}/division`}
            color="blue"
          />
          <PracticeCard
            title="Question Countdown"
            image="/images/timed.png"
            description="The clock is ticking! Lets see how many questions you can answer before time runs out"
            link={`${STUDENT_TIMED}/division`}
            color="green"
          />
          <PracticeCard
            title="Set Practice"
            image="/images/set.png"
            description="You can set the number of questions and the time limit. The clock is ticking! Answer them all before time runs out"
            link={`${STUDENT_SET}/division`}
            color="pink"
          />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PracticeSection;
