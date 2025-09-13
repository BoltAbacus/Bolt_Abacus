import { FC } from 'react';
import { 
  AiOutlinePlus,
  AiOutlineEnter
} from 'react-icons/ai';

interface CreateJoinStepProps {
  action: 'create' | 'join' | null;
  setAction: (action: 'create' | 'join' | null) => void;
  joinRoomCode: string;
  setJoinRoomCode: (code: string) => void;
  error: string | null;
  success: string | null;
  loading: boolean;
  onJoinRoom: () => void;
  onNext: () => void;
}

const CreateJoinStep: FC<CreateJoinStepProps> = ({
  action,
  setAction,
  joinRoomCode,
  setJoinRoomCode,
  error,
  success,
  loading,
  onJoinRoom,
  onNext
}) => {
  return (
    <div className="space-y-6">
      {/* Action Selection */}
      <div className="flex flex-col tablet:flex-row justify-center gap-4">
        <button
          onClick={() => {
            setAction('create');
            onNext(); // Automatically proceed to next step
          }}
          className={`group flex items-center justify-center gap-3 px-8 py-6 rounded-xl font-bold transition-all duration-300 ${
            action === 'create'
              ? 'bg-gradient-to-r from-gold to-lightGold text-black shadow-lg transform scale-105'
              : 'bg-gray-800 text-white hover:bg-gold/20 hover:text-gold'
          }`}
        >
          <AiOutlinePlus className="text-2xl" />
          <span className="text-lg">Create Room</span>
        </button>

        <button
          onClick={() => setAction('join')}
          className={`group flex items-center justify-center gap-3 px-8 py-6 rounded-xl font-bold transition-all duration-300 ${
            action === 'join'
              ? 'bg-gradient-to-r from-gold to-lightGold text-black shadow-lg transform scale-105'
              : 'bg-gray-800 text-white hover:bg-gold/20 hover:text-gold'
          }`}
        >
          <AiOutlineEnter className="text-2xl" />
          <span className="text-lg">Join Room</span>
        </button>
      </div>

      {/* Join Room Form - Only show when join is selected */}
      {action === 'join' && (
        <div className="space-y-4">
          <div>
            <label className="block text-gold font-bold text-base tablet:text-lg mb-2">
              🎮 Room Code
            </label>
            <input
              type="text"
              value={joinRoomCode}
              onChange={(e) => {
                const value = e.target.value.toUpperCase();
                setJoinRoomCode(value);
              }}
              placeholder="Enter 6-digit room code"
              maxLength={6}
              className="w-full text-center text-lg tablet:text-2xl font-black tracking-wider rounded-xl p-3 tablet:p-4 focus:outline-none placeholder-white/40 text-white"
              style={{ backgroundColor: '#212124' }}
            />
            <div className="text-center mt-2">
              <span className="text-sm" style={{ color: '#818181' }}>
                Code: "{joinRoomCode}" ({joinRoomCode.length}/6)
              </span>
            </div>
          </div>

          <button
            onClick={onJoinRoom}
            disabled={loading || joinRoomCode.trim().length === 0}
            className={`w-full py-3 tablet:py-4 px-6 tablet:px-8 rounded-xl font-bold text-base tablet:text-lg transition-all duration-300 transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed ${
              loading || joinRoomCode.trim().length === 0
                ? 'bg-gray-500 text-gray-300'
                : 'bg-gradient-to-r from-gold to-lightGold text-black shadow-lg hover:shadow-gold/50'
            }`}
          >
            {loading ? '🔄 Joining...' : '⚔️ Join Room'}
          </button>
        </div>
      )}

      {/* Create Room Info - Only show when create is selected */}
      {action === 'create' && (
        <div className="text-center space-y-4">
          <div className="bg-gradient-to-r from-gold/20 to-lightGold/20 rounded-xl p-6">
            <div className="text-gold font-bold text-lg mb-2">🚀 Ready to Create!</div>
            <p className="text-white/80">
              You'll configure your battle settings in the next steps. 
              Choose your operation, game mode, and customize the experience!
            </p>
          </div>
        </div>
      )}

      {/* Error/Success Messages */}
      {error && (
        <div className="rounded-2xl p-4 text-red-200 text-center" style={{ backgroundColor: '#212124' }}>
          ❌ {error}
        </div>
      )}

      {success && (
        <div className="rounded-2xl p-4 text-green-200 text-center" style={{ backgroundColor: '#212124' }}>
          ✅ {success}
        </div>
      )}
    </div>
  );
};

export default CreateJoinStep;
