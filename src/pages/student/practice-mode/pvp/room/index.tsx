import { FC, useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { AiOutlineCrown, AiOutlinePlayCircle } from 'react-icons/ai';

import { useAuthStore } from '@store/authStore';
import { getPVPRoomDetails, startPVPGame } from '@services/pvp';
import { getUserDetails } from '@services/auth';

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
  const { user, authToken, setUser } = useAuthStore();
  
  const [roomDetails, setRoomDetails] = useState<RoomDetails | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (roomId) {
      fetchRoomDetails();
      // Poll for room updates every 2 seconds
      const interval = setInterval(fetchRoomDetails, 2000);
      return () => clearInterval(interval);
    }
  }, [roomId]);

  // Fetch user details when component mounts
  useEffect(() => {
    console.log('Component mount useEffect:', { authToken: !!authToken, user: !!user, userId: user?.id });
    if (authToken && !user) {
      console.log('Calling fetchUserDetails from mount...');
      fetchUserDetails();
    }
  }, []);

  useEffect(() => {
    if (authToken && !user) {
      fetchUserDetails();
    }
  }, [authToken, user]);

  const fetchUserDetails = async () => {
    console.log('fetchUserDetails called:', { authToken: !!authToken, user: !!user, userId: user?.id });
    if (!authToken) {
      console.log('No auth token, returning');
      return;
    }
    
    try {
      console.log('Making getUserDetails API call...');
      const response = await getUserDetails(authToken);
      console.log('getUserDetails response:', response.data);
      if (response.data.success) {
        const userData = response.data.data;
        console.log('Setting user data:', userData);
        setUser({
          id: (userData as any).id ?? (userData as any).userId,
          name: {
            first: userData.firstName,
            last: userData.lastName,
          },
          email: userData.email,
          phone: userData.phone,
          organizationName: userData.organizationName,
          role: userData.role,
        });
        console.log('User data set successfully, new ID:', userData.id);
      } else {
        console.error('getUserDetails failed:', response.data);
      }
    } catch (err: any) {
      console.error('Error fetching user details:', err);
      console.error('Error response:', err.response?.data);
    }
  };

  const fetchRoomDetails = async () => {
    if (!roomId || !authToken) return;
    
    try {
      const response = await getPVPRoomDetails(roomId, authToken);
      if (response.data.success) {
        setRoomDetails(response.data.data);
        
        // If game has started, navigate to game page
        if (response.data.data.status === 'active') {
          navigate(`/student/pvp/game/${roomId}`);
        }
      }
    } catch (err) {
      console.error('Error fetching room details:', err);
    }
  };

  // Ready flow removed – all participants are considered ready by default

  const handleStartGame = async () => {
    if (!roomId || !authToken) return;
    
    setLoading(true);
    try {
      const response = await startPVPGame(roomId, authToken);
      if (response.data.success) {
        navigate(`/student/pvp/game/${roomId}`);
      } else {
        setError(response.data.message || 'Failed to start game');
      }
    } catch (err) {
      setError('Failed to start game');
    } finally {
      setLoading(false);
    }
  };

  if (!roomDetails) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="text-white text-xl">Loading room...</div>
      </div>
    );
  }

  const isCreator = roomDetails.creator.userId === user?.id;
  // const currentPlayer = roomDetails.players.find((p: any) => p.player.userId === user?.id);
  const hasEnoughPlayers = roomDetails.players.length === roomDetails.max_players;
  const isRoomWaiting = roomDetails.status === 'waiting';
  const canStartGame = isCreator && hasEnoughPlayers && isRoomWaiting;

  // Debug logging (can be removed in production)
  console.log('Room Debug:', {
    isCreator,
    hasEnoughPlayers,
    isRoomWaiting,
    canStartGame,
    creatorId: roomDetails.creator.userId,
    userId: user?.id,
    playersCount: roomDetails.players.length,
    maxPlayers: roomDetails.max_players,
    roomStatus: roomDetails.status
  });


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
              🏰 BATTLE ROOM 🏰
            </h1>
            <p className="text-white text-lg">Room Code: <span className="font-bold text-gold">{roomId}</span></p>
          </div>
        </div>

        {/* Error Message */}
        {error && (
          <div className="bg-red-500/10 border border-red-400/50 rounded-2xl p-4 text-red-200 text-center backdrop-blur-xl">
            ❌ {error}
          </div>
        )}

        {/* Room Details */}
        <div className="bg-[#080808] hover:bg-[#1b1b1b] transition-colors backdrop-blur-xl text-white p-8 rounded-2xl border border-gold/50 shadow-2xl shadow-black/50 relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-r from-gold/5 via-transparent to-purple/5"></div>
          <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-gold via-lightGold to-purple"></div>
          
          <div className="relative z-10">
            <h2 className="text-2xl font-black text-gold mb-6 text-center">Room Settings</h2>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
              <div className="bg-black/60 backdrop-blur-xl p-4 rounded-xl border border-gold/30 text-center">
                <div className="text-gold font-bold text-lg">Questions</div>
                <div className="text-white text-2xl font-black">{roomDetails.number_of_questions}</div>
              </div>
              <div className="bg-black/60 backdrop-blur-xl p-4 rounded-xl border border-gold/30 text-center">
                <div className="text-gold font-bold text-lg">Time per Question</div>
                <div className="text-white text-2xl font-black">{roomDetails.time_per_question}s</div>
              </div>
              <div className="bg-black/60 backdrop-blur-xl p-4 rounded-xl border border-gold/30 text-center">
                <div className="text-gold font-bold text-lg">Difficulty</div>
                <div className="text-white text-2xl font-black capitalize">{roomDetails.difficulty_level}</div>
              </div>
            </div>
          </div>
        </div>

        {/* Players List */}
        <div className="bg-[#080808] hover:bg-[#1b1b1b] transition-colors backdrop-blur-xl text-white p-8 rounded-2xl border border-gold/50 shadow-2xl shadow-black/50 relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-r from-gold/5 via-transparent to-purple/5"></div>
          <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-gold via-lightGold to-purple"></div>
          
          <div className="relative z-10">
            <h2 className="text-2xl font-black text-gold mb-6 text-center">Players ({roomDetails.players.length}/{roomDetails.max_players})</h2>
            
            <div className="space-y-4">
              {roomDetails.players.map((player: any, index: number) => (
                <div key={player.player.userId} className="bg-black/60 backdrop-blur-xl p-4 rounded-xl border border-gold/30 flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div className="bg-gold text-black w-8 h-8 rounded-full flex items-center justify-center font-bold">
                      {index + 1}
                    </div>
                    <div>
                      <div className="text-white font-bold text-lg">
                        {player.player.firstName} {player.player.lastName}
                      </div>
                      {player.player.userId === roomDetails.creator.userId && (
                        <div className="text-gold text-sm flex items-center gap-1">
                          <AiOutlineCrown className="text-sm" />
                          Room Creator
                        </div>
                      )}
                    </div>
                  </div>
                  <div className={`px-4 py-2 rounded-full text-sm font-bold ${
                    player.is_ready 
                      ? 'bg-green-500/20 text-green-400 border border-green-400/50' 
                      : 'bg-yellow-500/20 text-yellow-400 border border-yellow-400/50'
                  }`}>
                    {player.is_ready ? 'Ready' : 'Not Ready'}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Game Status */}
        {isCreator && !canStartGame && (
          <div className="bg-yellow-500/10 border border-yellow-400/50 rounded-2xl p-4 text-yellow-200 text-center backdrop-blur-xl">
            {!hasEnoughPlayers ? (
              <div>
                ⚠️ Need {roomDetails.max_players} players to start. Currently have {roomDetails.players.length} players.
                {roomDetails.max_players === 2 && " (Duel requires 2 players)"}
                {roomDetails.max_players === 3 && " (Trio requires 3 players)"}
                {roomDetails.max_players === 4 && " (Squad requires 4 players)"}
              </div>
            ) : !isRoomWaiting ? (
              <div>⚠️ Room is not in waiting status. Current status: {roomDetails.status}</div>
            ) : null}
          </div>
        )}


        {/* Action Buttons */}
        <div className="flex flex-col tablet:flex-row gap-4 justify-center">
          {/* No Ready button – participants are ready by default */}
          
          {isCreator && canStartGame && (
            <button
              onClick={handleStartGame}
              disabled={loading}
              className="bg-gradient-to-r from-green-500 to-emerald-500 text-white px-8 py-4 rounded-xl font-bold text-lg hover:scale-105 transition-all duration-300 disabled:opacity-50 flex items-center gap-2"
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
