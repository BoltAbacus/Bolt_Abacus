import { FC, useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { AiOutlineCrown, AiOutlinePlayCircle, AiOutlineCopy } from 'react-icons/ai';

import { useAuthStore } from '@store/authStore';
import { getPVPRoomDetails, startPVPGame } from '@services/pvp';

interface RoomDetails {
  room_id: string;
  creator: {
    userId: number;
    firstName: string;
    lastName: string;
  };
  max_players: number;
  number_of_questions: number;
  time_per_question: number;
  difficulty_level: string;
  game_mode: string;
  operation: string;
  players: Array<{
    player: {
      userId: number;
      firstName: string;
      lastName: string;
    };
    is_ready: boolean;
    score: number;
    correct_answers: number;
    total_time: number;
  }>;
  status: string;
  created_at: string;
}

const StudentPvPRoomPage: FC = () => {
  const { roomId } = useParams<{ roomId: string }>();
  const navigate = useNavigate();
  const { user, authToken } = useAuthStore();
  
  const [roomDetails, setRoomDetails] = useState<RoomDetails | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [copySuccess, setCopySuccess] = useState(false);

  const minPlayersToStart = 2;

  useEffect(() => {
    if (roomId) {
      fetchRoomDetails();
      // Poll for room updates every 2 seconds
      const interval = setInterval(fetchRoomDetails, 2000);
      return () => clearInterval(interval);
    }
  }, [roomId]);

  const fetchRoomDetails = async () => {
    if (!roomId || !authToken) return;
    
    try {
      setLoading(true);
      setError(null);
      console.log('Fetching room details for room:', roomId);
      
      const response = await getPVPRoomDetails(roomId, authToken);
      console.log('Room details response:', response);
      
      if (response.data?.success && response.data?.data) {
        setRoomDetails(response.data.data);
      } else {
        setError(response.data?.message || 'Failed to fetch room details');
      }
    } catch (err) {
      console.error('Error fetching room details:', err);
      setError('Failed to fetch room details');
    } finally {
      setLoading(false);
    }
  };

  const handleStartGame = async () => {
    if (!roomId || !authToken || !roomDetails) return;
    
    try {
      setLoading(true);
      setError(null);
      console.log('Starting PVP game for room:', roomId);
      
      const response = await startPVPGame(roomId, authToken);
      console.log('Start game response:', response);
      
      if (response.data?.success) {
        console.log('Game started successfully, navigating to game page');
        navigate(`/student/practice-mode/pvp/game/${roomId}`);
      } else {
        setError(response.data?.message || 'Failed to start game');
      }
    } catch (err) {
      console.error('Error starting game:', err);
      setError('Failed to start game');
    } finally {
      setLoading(false);
    }
  };

  const copyRoomCode = () => {
    if (roomDetails?.room_id) {
      navigator.clipboard.writeText(roomDetails.room_id);
      setCopySuccess(true);
      setTimeout(() => setCopySuccess(false), 2000);
    }
  };

  const isCreator = true;
  console.log("hiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiii")
  console.log(isCreator,user,roomDetails?.creator?.userId);
  console.log(roomDetails);
  
  const canStartGame = isCreator && 
    roomDetails && 
    roomDetails.players.length >= minPlayersToStart && 
    roomDetails.status === 'waiting';

  if (!roomDetails) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="text-center">
          <div className="text-white text-xl mb-4">Loading room...</div>
          <div className="animate-spin w-8 h-8 border-4 border-gold border-t-transparent rounded-full mx-auto"></div>
          {error && (
            <div className="mt-4 bg-red-500/10 border border-red-400/50 rounded-xl p-4 text-red-200">
              ❌ {error}
            </div>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black">
      <div className="px-6 pt-2 tablet:p-10 desktop:px-24 space-y-6 bg-black min-h-screen">
        {/* Header */}
        <div className="bg-black hover:bg-[#191919] transition-colors text-white p-8 rounded-2xl border border-gold/50 ring-1 ring-white/5 backdrop-blur-xl shadow-[0_12px_36px_rgba(0,0,0,0.65)] relative overflow-hidden">
          <div className="pointer-events-none absolute -inset-14 bg-[radial-gradient(circle_at_top_left,rgba(255,186,8,0.08),transparent_40%),radial-gradient(circle_at_bottom_right,rgba(250,163,7,0.06),transparent_45%)]"></div>
          <div className="pointer-events-none absolute inset-x-0 top-0 h-px bg-white/10"></div>
          <div className="pointer-events-none absolute inset-x-0 bottom-0 h-px bg-black/40"></div>
          <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-gold via-lightGold to-gold"></div>
          
          <div className="relative z-10 text-center">
            <h1 className="text-4xl font-black text-gold mb-4">
              🏰 EPIC BATTLE ROOM 🏰
            </h1>
            <p className="text-white/80 text-lg">
              Room Code: <span className="font-bold text-gold">{roomDetails.room_id}</span>
            </p>
            <button
              onClick={copyRoomCode}
              className="mt-2 px-4 py-2 bg-gold/20 hover:bg-gold/30 text-gold rounded-lg transition-colors flex items-center gap-2 mx-auto"
            >
              <AiOutlineCopy />
              {copySuccess ? 'Copied!' : 'Copy Code'}
            </button>
          </div>
        </div>

        {/* Room Settings */}
        <div className="bg-black hover:bg-[#191919] transition-colors text-white p-6 rounded-2xl border border-gold/50 ring-1 ring-white/5 backdrop-blur-xl shadow-[0_12px_36px_rgba(0,0,0,0.65)]">
          <h2 className="text-2xl font-bold text-gold mb-4">⚙️ Room Settings</h2>
          <div className="grid grid-cols-1 tablet:grid-cols-2 gap-4">
            <div>
              <p className="text-white/60">Operation</p>
              <p className="text-white font-semibold capitalize">{roomDetails.operation}</p>
            </div>
            <div>
              <p className="text-white/60">Game Mode</p>
              <p className="text-white font-semibold capitalize">{roomDetails.game_mode}</p>
            </div>
            <div>
              <p className="text-white/60">Questions</p>
              <p className="text-white font-semibold">{roomDetails.number_of_questions}</p>
            </div>
            <div>
              <p className="text-white/60">Time Per Question</p>
              <p className="text-white font-semibold">
                {roomDetails.time_per_question === 0 ? 'No Limit' : `${roomDetails.time_per_question}s`}
              </p>
            </div>
            <div>
              <p className="text-white/60">Difficulty</p>
              <p className="text-white font-semibold capitalize">{roomDetails.difficulty_level}</p>
            </div>
            <div>
              <p className="text-white/60">Max Players</p>
              <p className="text-white font-semibold">{roomDetails.max_players}</p>
            </div>
          </div>
        </div>

        {/* Players List */}
        <div className="bg-black hover:bg-[#191919] transition-colors text-white p-6 rounded-2xl border border-gold/50 ring-1 ring-white/5 backdrop-blur-xl shadow-[0_12px_36px_rgba(0,0,0,0.65)]">
          <h2 className="text-2xl font-bold text-gold mb-4">👥 Players ({roomDetails.players.length}/{roomDetails.max_players})</h2>
          <div className="space-y-3">
            {roomDetails.players.map((playerData, index) => (
              <div
                key={playerData.player.userId}
                className="flex items-center justify-between p-4 bg-white/5 rounded-lg border border-white/10"
              >
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-gold/20 rounded-full flex items-center justify-center">
                    <span className="text-gold font-bold">
                      {index === 0 ? <AiOutlineCrown className="text-xl" /> : index + 1}
                    </span>
                  </div>
                  <div>
                    <p className="text-white font-semibold">
                      {playerData.player.firstName} {playerData.player.lastName}
                    </p>
                    <p className="text-white/60 text-sm">
                      {playerData.is_ready ? '✅ Ready' : '⏳ Waiting...'}
                    </p>
                  </div>
                </div>
                {playerData.player.userId === roomDetails.creator.userId && (
                  <span className="text-gold text-sm font-semibold">👑 Creator</span>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Start Game Button */}
        <div className="text-center">
          {error && (
            <div className="mb-4 bg-red-500/10 border border-red-400/50 rounded-xl p-4 text-red-200">
              ❌ {error}
            </div>
          )}
          
          {isCreator && (
            <button
              onClick={handleStartGame}
              disabled={!canStartGame || loading}
              className={`px-8 py-4 rounded-xl font-bold text-lg transition-all duration-300 flex items-center gap-3 mx-auto ${
                canStartGame && !loading
                  ? 'bg-gradient-to-r from-gold to-lightGold hover:from-gold/80 hover:to-lightGold/80 text-black shadow-lg hover:shadow-xl transform hover:scale-105'
                  : 'bg-gray-600 text-gray-400 cursor-not-allowed'
              }`}
            >
              <AiOutlinePlayCircle className="text-xl" />
              {loading ? 'Starting Game...' : 'Start Game'}
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default StudentPvPRoomPage;