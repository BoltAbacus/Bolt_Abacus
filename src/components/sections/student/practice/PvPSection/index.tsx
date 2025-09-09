import { FC, useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  AiOutlinePlus,
  AiOutlineEnter
} from 'react-icons/ai';

import { useAuthStore } from '@store/authStore';
import { useExperienceStore } from '@store/experienceStore';
import customAxios from '@helpers/axios';
import { 
  CREATE_PVP_ROOM_ENDPOINT, 
  JOIN_PVP_ROOM_ENDPOINT
} from '@constants/routes';

export interface PvPSectionProps {}




const PvPSection: FC<PvPSectionProps> = () => {
  const navigate = useNavigate();
  const { authToken } = useAuthStore();
  const [activeTab, setActiveTab] = useState<'create' | 'join'>('create');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const { syncWithBackend } = useExperienceStore();
  const [roomForm, setRoomForm] = useState({
    max_players: 2,
    number_of_questions: 10,
    time_per_question: 30,
    difficulty_level: 'medium',
    level_id: 1,
    class_id: 1,
    topic_id: 1
  });
  const [joinRoomCode, setJoinRoomCode] = useState('');

  // Sync experience data when component loads
  useEffect(() => {
    syncWithBackend();
  }, [syncWithBackend]);

  // Sync experience when returning from a game
  useEffect(() => {
    const handleFocus = () => {
      syncWithBackend();
    };
    
    window.addEventListener('focus', handleFocus);
    return () => window.removeEventListener('focus', handleFocus);
  }, [syncWithBackend]);

  // Debug activeTab changes
  useEffect(() => {
    console.log('Active tab changed to:', activeTab);
  }, [activeTab]);

  // Force re-render when activeTab changes
  useEffect(() => {
    console.log('Component re-rendering with activeTab:', activeTab);
  }, [activeTab]);

  // Clear errors when switching tabs
  useEffect(() => {
    setError(null);
    setSuccess(null);
  }, [activeTab]);



  const handleCreateRoom = async () => {
    if (!authToken) {
      setError('Please log in to create a room');
      return;
    }

    setLoading(true);
    setError(null);
    setSuccess(null);

    try {
      const response = await customAxios.post(CREATE_PVP_ROOM_ENDPOINT, roomForm, {
        headers: {
          'AUTH-TOKEN': authToken
        }
      });

      if (response.data.success) {
        setSuccess(`Room created successfully! Room Code: ${response.data.data.room_id}`);
        // Navigate to the room page
        navigate(`/student/pvp/room/${response.data.data.room_id}`);
      } else {
        setError(response.data.message || 'Failed to create room');
      }
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to create room');
    } finally {
      setLoading(false);
    }
  };

  const handleJoinRoom = async () => {
    console.log('handleJoinRoom called');
    console.log('authToken:', !!authToken);
    console.log('joinRoomCode:', joinRoomCode);
    console.log('joinRoomCode length:', joinRoomCode.length);
    
    if (!authToken) {
      setError('Please log in to join a room');
      return;
    }

    const trimmedCode = joinRoomCode.trim();
    console.log('trimmedCode:', trimmedCode);
    console.log('trimmedCode length:', trimmedCode.length);
    
    if (!trimmedCode) {
      console.log('Error: No room code entered');
      setError('Please enter a room code');
      return;
    }

    if (trimmedCode.length < 6) {
      console.log('Error: Room code too short');
      setError('Room code must be 6 characters long');
      return;
    }

    console.log('All validations passed, proceeding with API call');
    setLoading(true);
    setError(null);
    setSuccess(null);

    try {
      console.log('Attempting to join room:', trimmedCode);
      const response = await customAxios.post(JOIN_PVP_ROOM_ENDPOINT, {
        room_code: trimmedCode
      }, {
        headers: {
          'AUTH-TOKEN': authToken
        }
      });

      console.log('Join room response:', response.data);

      if (response.data.success) {
        setSuccess('Successfully joined the room!');
        // Navigate to the room page
        navigate(`/student/pvp/room/${trimmedCode}`);
      } else {
        setError(response.data.message || 'Failed to join room');
      }
    } catch (err: any) {
      console.error('Join room error:', err);
      const errorMessage = err.response?.data?.message || err.message || 'Failed to join room';
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const updateRoomForm = (field: string, value: any) => {
    setRoomForm(prev => ({
      ...prev,
      [field]: value
    }));
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
              ⚔️ PVP ARENA ⚔️
          </h1>
            <div className="flex justify-center items-center gap-4 mb-6">
              <div className="bg-gold text-black px-4 py-2 rounded-full font-bold">
                🏆 CHALLENGE FRIENDS
              </div>
              <div className="bg-purple text-white px-4 py-2 rounded-full font-bold">
                ⚡ REAL-TIME BATTLES
              </div>
        </div>
            <p className="text-white text-lg max-w-3xl mx-auto">
              Challenge your friends in epic math battles! Create rooms, join battles, and climb the leaderboard.
              <span className="font-bold text-gold"> Ready to battle? 🚀</span>
            </p>
          </div>
        </div>


      {/* Tab Navigation */}
        <div className="bg-[#080808] hover:bg-[#1b1b1b] transition-colors backdrop-blur-xl text-white p-6 rounded-2xl border border-gold/50 shadow-2xl shadow-black/50 relative overflow-hidden">
          {/* Background elements */}
          <div className="absolute inset-0 bg-gradient-to-r from-gold/5 via-transparent to-purple/5"></div>
          <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-gold via-lightGold to-purple"></div>
          
          <div className="relative z-10 text-center mb-6">
            <h2 className="text-3xl font-black bg-gradient-to-r from-gold via-lightGold to-orange-500 bg-clip-text text-transparent mb-4">
              🎮 PVP ACTIONS 🎮
            </h2>
            <div className="text-sm text-gray-400 mb-2">
              Current Tab: <span className="text-gold font-bold">{activeTab}</span>
            </div>
          </div>
          
          <div className="flex flex-col tablet:flex-row justify-center gap-4 relative z-20">
            {[
              { id: 'create', label: 'Create Room', icon: AiOutlinePlus },
              { id: 'join', label: 'Join Room', icon: AiOutlineEnter }
            ].map((tab) => {
              const Icon = tab.icon;
              return (
                <button
                  key={tab.id}
                  type="button"
                  onClick={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    console.log('Tab clicked:', tab.id, 'Current activeTab:', activeTab);
                    setActiveTab(tab.id as any);
                    console.log('Tab state should be updated to:', tab.id);
                  }}
                  onMouseDown={(e) => {
                    e.preventDefault();
                    console.log('Mouse down on tab:', tab.id);
                  }}
                  className={`group flex items-center justify-center gap-3 px-8 py-4 rounded-xl font-bold transition-all duration-300 cursor-pointer select-none ${
                    activeTab === tab.id
                      ? 'bg-gradient-to-r from-gold to-lightGold text-black shadow-lg transform scale-105'
                      : 'bg-black/60 text-white hover:bg-gold/20 hover:text-gold border border-gold/30'
                  }`}
                  style={{ 
                    pointerEvents: 'auto',
                    zIndex: 30,
                    position: 'relative'
                  }}
                >
                  <Icon className="text-xl" />
                  <span>{tab.label}</span>
                </button>
              );
            })}
        </div>
      </div>

        {/* Error/Success Messages */}
        {error && (
          <div className="bg-red-500/10 border border-red-400/50 rounded-2xl p-4 text-red-200 text-center backdrop-blur-xl">
            ❌ {error}
              </div>
        )}

        {success && (
          <div className="bg-green-500/10 border border-green-400/50 rounded-2xl p-4 text-green-200 text-center backdrop-blur-xl">
            ✅ {success}
            </div>
        )}

        {/* Create Room Tab */}
        {activeTab === 'create' && (
          <div className="bg-[#080808] hover:bg-[#1b1b1b] transition-colors backdrop-blur-xl text-white p-8 rounded-2xl border border-gold/50 shadow-2xl shadow-black/50 relative overflow-hidden">
            {/* Background elements */}
            <div className="absolute inset-0 bg-gradient-to-r from-gold/5 via-transparent to-purple/5"></div>
            <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-gold via-lightGold to-purple"></div>
                  
                  <div className="relative z-10">
              <h2 className="text-3xl font-black bg-gradient-to-r from-gold via-lightGold to-orange-500 bg-clip-text text-transparent mb-6 text-center">
                🎮 CREATE BATTLE ROOM 🎮
              </h2>
            
              <div className="space-y-6">
              {/* Max Players */}
                        <div>
                <label className="block text-yellow-200 font-bold text-lg mb-2">👥 Max Players</label>
                          <select
                  value={roomForm.max_players}
                  onChange={(e) => updateRoomForm('max_players', parseInt(e.target.value))}
                  className="w-full bg-[#1a1a1a]/80 backdrop-blur-sm rounded-xl p-4 border-2 border-gold/30 focus:border-gold focus:outline-none font-semibold text-white"
                >
                  <option value={2}>2 Players - Duel</option>
                  <option value={3}>3 Players - Trio</option>
                  <option value={4}>4 Players - Squad</option>
                          </select>
                        </div>

              {/* Number of Questions */}
                        <div>
                <label className="block text-yellow-200 font-bold text-lg mb-2">❓ Number of Questions</label>
                          <select
                  value={roomForm.number_of_questions}
                  onChange={(e) => updateRoomForm('number_of_questions', parseInt(e.target.value))}
                  className="w-full bg-[#1a1a1a]/80 backdrop-blur-sm rounded-xl p-4 border-2 border-gold/30 focus:border-gold focus:outline-none font-semibold text-white"
                >
                  <option value={5}>5 Questions - Quick Battle</option>
                  <option value={10}>10 Questions - Standard</option>
                  <option value={15}>15 Questions - Extended</option>
                  <option value={20}>20 Questions - Epic</option>
                          </select>
                        </div>

              {/* Time per Question */}
                        <div>
                <label className="block text-yellow-200 font-bold text-lg mb-2">⏱️ Time per Question</label>
                          <select
                  value={roomForm.time_per_question}
                  onChange={(e) => updateRoomForm('time_per_question', parseInt(e.target.value))}
                  className="w-full bg-[#1a1a1a]/80 backdrop-blur-sm rounded-xl p-4 border-2 border-gold/30 focus:border-gold focus:outline-none font-semibold text-white"
                >
                  <option value={15}>15 seconds - Lightning Fast</option>
                  <option value={30}>30 seconds - Quick</option>
                  <option value={45}>45 seconds - Balanced</option>
                  <option value={60}>60 seconds - Thoughtful</option>
                          </select>
                        </div>

              {/* Difficulty Level */}
                        <div>
                <label className="block text-yellow-200 font-bold text-lg mb-2">🎯 Difficulty Level</label>
                          <select
                  value={roomForm.difficulty_level}
                  onChange={(e) => updateRoomForm('difficulty_level', e.target.value)}
                  className="w-full bg-[#1a1a1a]/80 backdrop-blur-sm rounded-xl p-4 border-2 border-gold/30 focus:border-gold focus:outline-none font-semibold text-white"
                >
                  <option value="easy">🟢 Easy - Beginner Friendly</option>
                  <option value="medium">🟡 Medium - Balanced Challenge</option>
                  <option value="hard">🟠 Hard - Expert Level</option>
                  <option value="expert">🔴 Expert - Ultimate Test</option>
                          </select>
                        </div>

              <button
                onClick={handleCreateRoom}
                disabled={loading}
                className={`w-full py-4 px-8 rounded-2xl font-black text-lg transition-all duration-500 transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed ${
                  loading
                    ? 'bg-gray-500 text-gray-300'
                    : 'bg-gradient-to-r from-green-500 via-emerald-500 to-teal-500 text-white shadow-2xl hover:shadow-green-400/50'
                }`}
              >
                {loading ? '🔄 Creating Room...' : '🚀 Create Room'}
              </button>
                            </div>
                        </div>
                      </div>
                    )}

        {/* Join Room Tab */}
        {activeTab === 'join' && (
          <div className="bg-[#080808] hover:bg-[#1b1b1b] transition-colors backdrop-blur-xl text-white p-8 rounded-2xl border border-gold/50 shadow-2xl shadow-black/50 relative overflow-hidden">
            {/* Background elements */}
            <div className="absolute inset-0 bg-gradient-to-r from-gold/5 via-transparent to-purple/5"></div>
            <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-gold via-lightGold to-purple"></div>
            
            <div className="relative z-10">
              <h2 className="text-3xl font-black bg-gradient-to-r from-gold via-lightGold to-orange-500 bg-clip-text text-transparent mb-6 text-center">
                🔗 JOIN BATTLE ROOM 🔗
              </h2>
              
              <div className="space-y-6">
                <div>
                  <label className="block text-gold font-bold text-lg mb-2">🎮 Room Code</label>
                    <input
                      type="text"
                    value={joinRoomCode}
                    onChange={(e) => {
                      const value = e.target.value.toUpperCase();
                      setJoinRoomCode(value);
                      // Clear error when user starts typing
                      if (error && value.length > 0) {
                        setError(null);
                      }
                    }}
                    placeholder="Enter 6-digit room code"
                      maxLength={6}
                    className="w-full text-center text-2xl font-black tracking-wider bg-black/60 backdrop-blur-sm rounded-xl p-4 border-2 border-gold/30 focus:border-gold focus:outline-none placeholder-white/40 text-white"
                    />
                    <div className="text-center mt-2">
                      <span className="text-sm text-gray-400">
                        Code: "{joinRoomCode}" ({joinRoomCode.length}/6)
                      </span>
                    </div>
                    </div>

                  <button
                  onClick={handleJoinRoom}
                  disabled={loading || joinRoomCode.trim().length === 0}
                  className={`w-full py-4 px-8 rounded-xl font-bold text-lg transition-all duration-300 transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed ${
                    loading || joinRoomCode.trim().length === 0
                      ? 'bg-gray-500 text-gray-300'
                      : 'bg-gradient-to-r from-gold to-lightGold text-black shadow-lg hover:shadow-gold/50'
                  }`}
                >
                  {loading ? '🔄 Joining...' : '⚔️ Join Room'}
                  </button>
                </div>
          </div>
        </div>
      )}

       </div>
    </div>
  );
};

export default PvPSection; 