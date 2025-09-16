import { FC, useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  AiOutlineArrowLeft
} from 'react-icons/ai';

import { useAuthStore } from '@store/authStore';
import { useExperienceStore } from '@store/experienceStore';
import customAxios from '@helpers/axios';
import { 
  CREATE_PVP_ROOM_ENDPOINT, 
  JOIN_PVP_ROOM_ENDPOINT
} from '@constants/routes';

// Step Components
import CreateJoinStep from './steps/CreateJoinStep';
import OperationStep from './steps/OperationStep';
import GameModeStep from './steps/GameModeStep';
import SettingsStep from './steps/SettingsStep';

export interface PvPFlowProps {}

export interface PvPSettings {
  // Room settings
  max_players: number;
  number_of_questions: number;
  time_per_question: number;
  difficulty_level: string;
  number_of_digits: number;
  level_id: number;
  class_id: number;
  topic_id: number;
  game_mode: string;
  operation: string;
  
  // Practice mode settings
  numberOfDigitsLeft: number;
  numberOfDigitsRight: number;
  isZigzag: boolean;
  numberOfRows: number;
  includeSubtraction: boolean;
  persistNumberOfDigits: boolean;
  includeDecimals: boolean;
  audioMode: boolean;
  audioPace: string;
  showQuestion: boolean;
}

type PvPStep = 'create-join' | 'operation' | 'game-mode' | 'settings';

const PvPFlow: FC<PvPFlowProps> = () => {
  const navigate = useNavigate();
  const { authToken } = useAuthStore();
  const { syncWithBackend } = useExperienceStore();
  
  const [currentStep, setCurrentStep] = useState<PvPStep>('create-join');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  
  // Flow state
  const [action, setAction] = useState<'create' | 'join' | null>(null);
  const [selectedOperation, setSelectedOperation] = useState<string>('');
  const [selectedGameMode, setSelectedGameMode] = useState<string>('');
  const [joinRoomCode, setJoinRoomCode] = useState('');
  
  // Settings
  const [settings, setSettings] = useState<PvPSettings>({
    max_players: 2,
    number_of_questions: 10,
    time_per_question: 30,
    difficulty_level: 'medium',
    number_of_digits: 3,
    level_id: 1,
    class_id: 1,
    topic_id: 1,
    game_mode: 'flashcards',
    operation: 'addition',
    numberOfDigitsLeft: 1,
    numberOfDigitsRight: 1,
    isZigzag: false,
    numberOfRows: 2,
    includeSubtraction: true,
    persistNumberOfDigits: false,
    includeDecimals: false,
    audioMode: false,
    audioPace: 'normal',
    showQuestion: true
  });

  // Sync experience data when component loads
  useEffect(() => {
    syncWithBackend();
  }, [syncWithBackend]);

  // Load practice mode settings and sync with PvP settings
  useEffect(() => {
    const loadPracticeModeSettings = () => {
      try {
        const practiceSettings = localStorage.getItem('practiceModeSettings');
        if (practiceSettings) {
          const parsedSettings = JSON.parse(practiceSettings);
          
          setSettings(prev => ({
            ...prev,
            max_players: prev.max_players, // Keep PvP-specific setting
            numberOfDigitsLeft: parsedSettings.numberOfDigitsLeft || prev.numberOfDigitsLeft,
            numberOfDigitsRight: parsedSettings.numberOfDigitsRight || prev.numberOfDigitsRight,
            isZigzag: parsedSettings.isZigzag !== undefined ? parsedSettings.isZigzag : prev.isZigzag,
            numberOfRows: parsedSettings.numberOfRows || prev.numberOfRows,
            includeSubtraction: parsedSettings.operation === 'addition' ? true : (parsedSettings.includeSubtraction !== undefined ? parsedSettings.includeSubtraction : prev.includeSubtraction),
            persistNumberOfDigits: parsedSettings.persistNumberOfDigits !== undefined ? parsedSettings.persistNumberOfDigits : prev.persistNumberOfDigits,
            includeDecimals: parsedSettings.includeDecimals !== undefined ? parsedSettings.includeDecimals : prev.includeDecimals,
            audioMode: parsedSettings.audioMode !== undefined ? parsedSettings.audioMode : prev.audioMode,
            audioPace: parsedSettings.audioPace || prev.audioPace,
            showQuestion: parsedSettings.showQuestion !== undefined ? parsedSettings.showQuestion : prev.showQuestion,
            operation: parsedSettings.operation || prev.operation,
            game_mode: parsedSettings.game_mode || prev.game_mode,
            number_of_digits: parsedSettings.numberOfDigitsLeft || prev.number_of_digits,
            time_per_question: parsedSettings.flashcard_speed ? parsedSettings.flashcard_speed / 1000 : parsedSettings.time_per_question || prev.time_per_question,
            number_of_questions: parsedSettings.number_of_questions || prev.number_of_questions,
            difficulty_level: parsedSettings.difficulty_level || prev.difficulty_level
          }));

          if (parsedSettings.operation) {
            setSelectedOperation(parsedSettings.operation);
          }
          if (parsedSettings.game_mode) {
            setSelectedGameMode(parsedSettings.game_mode);
          }
        }
      } catch (error) {
        console.log('No practice mode settings found or error loading settings:', error);
      }
    };

    loadPracticeModeSettings();
  }, []);

  // Clear errors when switching steps
  useEffect(() => {
    setError(null);
    setSuccess(null);
  }, [currentStep]);

  const updateSettings = (field: string, value: any) => {
    setSettings(prev => {
      const updated = {
        ...prev,
        [field]: value
      };
      
      // Save practice mode settings to localStorage (except max_players)
      const practiceSettings = {
        numberOfDigitsLeft: updated.numberOfDigitsLeft,
        numberOfDigitsRight: updated.numberOfDigitsRight,
        isZigzag: updated.isZigzag,
        numberOfRows: updated.numberOfRows,
        includeSubtraction: updated.includeSubtraction,
        persistNumberOfDigits: updated.persistNumberOfDigits,
        includeDecimals: updated.includeDecimals,
        audioMode: updated.audioMode,
        audioPace: updated.audioPace,
        showQuestion: updated.showQuestion,
        operation: updated.operation,
        game_mode: updated.game_mode,
        number_of_digits: updated.number_of_digits,
        time_per_question: updated.time_per_question,
        number_of_questions: updated.number_of_questions,
        difficulty_level: updated.difficulty_level,
        flashcard_speed: updated.game_mode === 'flashcards' ? updated.time_per_question * 1000 : undefined
      };
      
      try {
        localStorage.setItem('practiceModeSettings', JSON.stringify(practiceSettings));
      } catch (error) {
        console.log('Error saving practice mode settings:', error);
      }
      
      return updated;
    });
  };

  const handleCreateRoom = async () => {
    if (!authToken) {
      setError('Please log in to create a room');
      return;
    }

    // Trigger sidebar collapse
    localStorage.setItem('pvpSidebarCollapsed', 'true');
    window.dispatchEvent(new CustomEvent('pvpSidebarCollapse'));

    setLoading(true);
    setError(null);
    setSuccess(null);

    try {
      const response = await customAxios.post(CREATE_PVP_ROOM_ENDPOINT, settings, {
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
    if (!authToken) {
      setError('Please log in to join a room');
      return;
    }

    const trimmedCode = joinRoomCode.trim();
    
    if (!trimmedCode) {
      setError('Please enter a room code');
      return;
    }

    if (trimmedCode.length < 6) {
      setError('Room code must be 6 characters long');
      return;
    }

    // Trigger sidebar collapse
    localStorage.setItem('pvpSidebarCollapsed', 'true');
    window.dispatchEvent(new CustomEvent('pvpSidebarCollapse'));

    setLoading(true);
    setError(null);
    setSuccess(null);

    try {
      const response = await customAxios.post(JOIN_PVP_ROOM_ENDPOINT, {
        room_code: trimmedCode
      }, {
        headers: {
          'AUTH-TOKEN': authToken
        }
      });

      if (response.data.success) {
        setSuccess('Successfully joined the room!');
        // Navigate to the room page
        navigate(`/student/pvp/room/${trimmedCode}`);
      } else {
        setError(response.data.message || 'Failed to join room');
      }
    } catch (err: any) {
      const errorMessage = err.response?.data?.message || err.message || 'Failed to join room';
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const nextStep = () => {
    const steps: PvPStep[] = ['create-join', 'operation', 'game-mode', 'settings'];
    const currentIndex = steps.indexOf(currentStep);
    if (currentIndex < steps.length - 1) {
      setCurrentStep(steps[currentIndex + 1]);
    }
  };

  const prevStep = () => {
    const steps: PvPStep[] = ['create-join', 'operation', 'game-mode', 'settings'];
    const currentIndex = steps.indexOf(currentStep);
    if (currentIndex > 0) {
      setCurrentStep(steps[currentIndex - 1]);
    }
  };


  const getStepTitle = () => {
    switch (currentStep) {
      case 'create-join':
        return '🎮 PVP ACTIONS';
      case 'operation':
        return '📚 CHOOSE YOUR OPERATION';
      case 'game-mode':
        return '🎯 CHOOSE YOUR GAME MODE';
      case 'settings':
        return '⚙️ BATTLE SETTINGS';
      default:
        return '';
    }
  };

  const getStepDescription = () => {
    switch (currentStep) {
      case 'create-join':
        return 'Create a new battle room or join an existing one';
      case 'operation':
        return 'Select the mathematical operation for your PvP battle';
      case 'game-mode':
        return 'Choose how you want to practice';
      case 'settings':
        return 'Configure your battle parameters';
      default:
        return '';
    }
  };

  const renderStep = () => {
    switch (currentStep) {
      case 'create-join':
        return (
          <CreateJoinStep
            action={action}
            setAction={setAction}
            joinRoomCode={joinRoomCode}
            setJoinRoomCode={setJoinRoomCode}
            error={error}
            success={success}
            loading={loading}
            onJoinRoom={handleJoinRoom}
            onNext={nextStep}
          />
        );
      case 'operation':
        return (
          <OperationStep
            selectedOperation={selectedOperation}
            setSelectedOperation={(op: string) => {
              setSelectedOperation(op);
              updateSettings('operation', op);
            }}
            onNext={nextStep}
          />
        );
      case 'game-mode':
        return (
          <GameModeStep
            selectedGameMode={selectedGameMode}
            setSelectedGameMode={(mode: string) => {
              setSelectedGameMode(mode);
              updateSettings('game_mode', mode);
              
              // Set default time based on game mode
              if (mode === 'norush') {
                updateSettings('time_per_question', 120);
              } else if (mode === 'timeattack') {
                updateSettings('time_per_question', 15);
              } else if (mode === 'flashcards') {
                updateSettings('time_per_question', 5);
              } else if (mode === 'custom') {
                updateSettings('time_per_question', 30);
              }
            }}
            selectedOperation={selectedOperation}
            onNext={nextStep}
          />
        );
      case 'settings':
        return (
          <SettingsStep
            settings={settings}
            updateSettings={updateSettings}
            selectedGameMode={selectedGameMode}
            selectedOperation={selectedOperation}
            onCreateRoom={handleCreateRoom}
            loading={loading}
            error={error}
            success={success}
            setError={setError}
            setSuccess={setSuccess}
          />
        );
      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen relative overflow-hidden" style={{ backgroundColor: '#000000' }}>
      {/* Animated background gradient */}
      <div className="absolute inset-0 bg-gradient-to-br from-purple-900/20 via-blue-900/10 to-gold/20"></div>
      <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-tr from-transparent via-gold/5 to-transparent"></div>
      
      {/* Floating background elements */}
      <div className="absolute top-20 left-10 w-32 h-32 bg-gold/10 rounded-full blur-3xl"></div>
      <div className="absolute top-40 right-20 w-24 h-24 bg-purple/10 rounded-full blur-2xl"></div>
      <div className="absolute bottom-20 left-1/4 w-40 h-40 bg-blue/10 rounded-full blur-3xl"></div>
      <div className="absolute bottom-40 right-1/3 w-28 h-28 bg-gold/10 rounded-full blur-2xl"></div>
      
      <div className="relative z-10 space-y-3 tablet:space-y-6 min-h-screen p-2 tablet:p-4">
        {/* Header */}
        <div className="transition-colors text-white p-3 tablet:p-8 rounded-2xl shadow-[0_12px_36px_rgba(0,0,0,0.65)] relative overflow-hidden" style={{ backgroundColor: '#161618' }}>
          <div className="relative z-10 text-center">
            <h1 className="text-xl tablet:text-5xl font-black bg-gradient-to-r from-gold via-yellow-300 to-gold bg-clip-text text-transparent mb-2 tablet:mb-4">
              ⚔️ EPIC BATTLE GROUND ⚔️
            </h1>
            <div className="flex flex-col tablet:flex-row justify-center items-center gap-1 tablet:gap-4 mb-3 tablet:mb-6">
              <div className="backdrop-blur-sm bg-gold/80 text-black px-2 tablet:px-4 py-1 tablet:py-2 rounded-full font-bold text-xs tablet:text-base border border-gold/50 shadow-lg hover:shadow-gold/50 transition-all duration-300 hover:scale-105">
                🏆 CHALLENGE FRIENDS
              </div>
              <div className="backdrop-blur-sm bg-purple/80 text-white px-2 tablet:px-4 py-1 tablet:py-2 rounded-full font-bold text-xs tablet:text-base border border-purple/50 shadow-lg hover:shadow-purple/50 transition-all duration-300 hover:scale-105">
                ⚡ REAL-TIME BATTLES
              </div>
            </div>
            <p className="text-white/90 text-xs tablet:text-lg max-w-3xl mx-auto backdrop-blur-sm">
              Challenge your friends in epic math battles! Create rooms, join battles, and climb the leaderboard.
              <span className="font-bold text-gold"> Ready to battle? 🚀</span>
            </p>
          </div>
        </div>

        {/* Progress Indicator */}
        <div className="relative p-3 tablet:p-6 rounded-3xl overflow-hidden shadow-2xl">
          {/* Glassmorphism background */}
          <div className="absolute inset-0 bg-gradient-to-br from-white/10 via-white/5 to-transparent"></div>
          <div className="absolute inset-0 bg-gradient-to-tr from-blue-500/10 via-transparent to-purple-500/10"></div>
          
          {/* Animated background elements */}
          <div className="absolute top-0 right-0 w-24 h-24 bg-blue-500/20 rounded-full blur-2xl"></div>
          <div className="absolute bottom-0 left-0 w-20 h-20 bg-purple-500/20 rounded-full blur-2xl"></div>
          
          <div className="relative z-10">
            <div className="flex items-center justify-between mb-4">
              {/* Back Button at complete left */}
              <button
                onClick={prevStep}
                disabled={currentStep === 'create-join'}
                className={`flex items-center gap-2 px-3 py-1 rounded-lg font-bold transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed text-sm backdrop-blur-sm border ${
                  currentStep === 'create-join'
                    ? 'bg-gray-600/50 text-gray-400 border-gray-500/50'
                    : 'bg-white/10 text-white border-white/30 hover:bg-white/20 hover:border-white/50 hover:scale-105'
                }`}
              >
                <AiOutlineArrowLeft className="text-sm" />
                Back
              </button>
              
              {/* Progress numbers centered */}
              <div className="flex items-center">
                {['create-join', 'operation', 'game-mode', 'settings'].map((step, index) => (
                  <div key={step} className="flex items-center">
                    <div className="relative">
                       {/* Glass circle behind */}
                       <div className="absolute inset-0 w-8 h-8 rounded-full backdrop-blur-sm bg-white/20"></div>
                       {/* Active circle on top */}
                       <div className={`relative w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold z-10 backdrop-blur-sm transition-all duration-500 ${
                         currentStep === step 
                           ? 'bg-gold/80 text-black shadow-lg shadow-gold/50' 
                           : ['create-join', 'operation', 'game-mode', 'settings'].indexOf(currentStep) > index
                             ? 'bg-green-500/80 text-white shadow-lg shadow-green-500/50'
                             : 'bg-transparent text-white/60'
                       }`}>
                        {index + 1}
                      </div>
                    </div>
                    {index < 3 && (
                      <div className={`w-12 h-0.5 mx-1 backdrop-blur-sm rounded-full transition-all duration-500 ${
                        ['create-join', 'operation', 'game-mode', 'settings'].indexOf(currentStep) > index
                          ? 'bg-gradient-to-r from-green-400 to-green-500 shadow-lg shadow-green-500/50'
                          : 'bg-white/20'
                      }`} />
                    )}
                  </div>
                ))}
              </div>
              
              {/* Empty space on the right for balance */}
              <div className="w-16"></div>
            </div>
            
            <div className="text-center">
              <h2 className="text-2xl tablet:text-3xl font-black bg-gradient-to-r from-gold via-lightGold to-orange-500 bg-clip-text text-transparent mb-2">
                {getStepTitle()}
              </h2>
              <p className="text-white/80 backdrop-blur-sm">
                {getStepDescription()}
              </p>
            </div>
          </div>
        </div>

        {/* Step Content */}
        <div className="relative p-3 tablet:p-6 rounded-3xl overflow-hidden backdrop-blur-xl shadow-2xl">
          {/* Glassmorphism background */}
          <div className="absolute inset-0 bg-gradient-to-br from-white/10 via-white/5 to-transparent"></div>
          <div className="absolute inset-0 bg-gradient-to-tr from-gold/10 via-transparent to-blue-500/10"></div>
          
          {/* Animated background elements */}
          <div className="absolute top-0 left-0 w-28 h-28 bg-gold/20 rounded-full blur-2xl"></div>
          <div className="absolute bottom-0 right-0 w-32 h-32 bg-blue-500/20 rounded-full blur-3xl"></div>
          
          <div className="relative z-10">
            {renderStep()}
          </div>
        </div>

      </div>
    </div>
  );
};

export default PvPFlow;
