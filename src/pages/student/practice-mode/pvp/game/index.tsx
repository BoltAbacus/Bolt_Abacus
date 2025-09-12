import { FC, useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { AiOutlineClockCircle } from 'react-icons/ai';

import { useAuthStore } from '@store/authStore';
import { useExperienceStore } from '@store/experienceStore';
import { submitPVPGameResult, startPVPGame, getPVPRoomDetails, getPVPGameQuestions, getPVPGameResult } from '@services/pvp';
import { logActivity } from '@helpers/activity';

interface Question {
  question_id: number;
  operands: number[];
  operator: string;
  correct_answer: number;
  question_type: string;
}

interface GameData {
  questions: Question[];
  total_questions: number;
  time_per_question: number;
  game_mode?: string;
  operation?: string;
  room_settings?: {
    flashcard_speed?: number;
  };
}

interface FlashCardState {
  currentStep: 'operand1' | 'operator' | 'operand2' | 'input';
  flashCardSpeed: number;
}

const StudentPvPGamePage: FC = () => {
  const { roomId } = useParams<{ roomId: string }>();
  const navigate = useNavigate();
  const { authToken, user } = useAuthStore();
  const { updateExperience } = useExperienceStore();
  
  const [gameData, setGameData] = useState<GameData | null>(null);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [userAnswer, setUserAnswer] = useState<string>('');
  const [timeLeft, setTimeLeft] = useState(30);
  const [score, setScore] = useState(0);
  const [correctAnswers, setCorrectAnswers] = useState(0);
  const [totalTime, setTotalTime] = useState(0);
  const [gameEnded, setGameEnded] = useState(false);
  const [countdown, setCountdown] = useState<number | null>(null);
  const [loading, setLoading] = useState(false);
  const [waitingForOthers, setWaitingForOthers] = useState(false);
  const [gameResult, setGameResult] = useState<any>(null);
  
  // Flashcard state
  const [flashCardState, setFlashCardState] = useState<FlashCardState>({
    currentStep: 'operand1',
    flashCardSpeed: 5000 // Default 5 seconds
  });

  const currentQuestion = gameData?.questions[currentQuestionIndex];
  
  // Debug logging (only when there are issues)
  // Prefer rendering once questions exist; avoid white boxes
  if (!gameData || !gameData.questions || gameData.questions.length === 0 || !currentQuestion) {
    console.log('Render state:', {
      gameData: !!gameData,
      questionsCount: gameData?.questions?.length,
      currentQuestionIndex,
      currentQuestion: !!currentQuestion,
      countdown,
      gameEnded,
      waitingForOthers
    });
  }

  // Load game data when component mounts
  useEffect(() => {
    if (roomId && authToken) {
      fetchGameData();
    }
  }, [roomId, authToken]);

  // Prevent back navigation and refresh during active game
  useEffect(() => {
    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      if (gameData && !gameEnded) {
        e.preventDefault();
        e.returnValue = 'You will exit the game. Continue?';
        return 'You will exit the game. Continue?';
      }
    };

    const handlePopState = (e: PopStateEvent) => {
      if (gameData && !gameEnded) {
        e.preventDefault();
        window.history.pushState(null, '', window.location.href);
      }
    };

    if (gameData && !gameEnded) {
      window.addEventListener('beforeunload', handleBeforeUnload);
      window.addEventListener('popstate', handlePopState);
      window.history.pushState(null, '', window.location.href);
    }

    return () => {
      window.removeEventListener('beforeunload', handleBeforeUnload);
      window.removeEventListener('popstate', handlePopState);
    };
  }, [gameData, gameEnded]);

  const fetchGameData = async () => {
    if (!roomId || !authToken || !user) {
      console.log('Missing required data:', { roomId, authToken: !!authToken, user: !!user });
      return;
    }
    
    console.log('Fetching game data for room:', roomId);
    
    try {
      // First, get room details to check if user is creator
      console.log('Getting room details...');
      const roomResponse = await getPVPRoomDetails(roomId, authToken);
      console.log('Room response:', roomResponse.data);
      
      if (roomResponse.data.success) {
        const roomData = roomResponse.data.data;
        const isCreator = roomData.creator.userId === user?.id;
        
        console.log('Room data:', roomData);
        console.log('Is creator:', isCreator);
        console.log('Room status:', roomData.status);
        
        if (isCreator) {
          if (roomData.status === 'active') {
            // Game already active → fetch existing questions instead of starting again
            console.log('Creator detected active game, fetching existing questions...');
            await fetchGameDataForParticipant();
          } else {
            // Only creator calls startPVPGame when NOT active
            console.log('Creator - calling startPVPGame...');
            try {
              const response = await startPVPGame(roomId, authToken);
              console.log('Start game response:', response.data);
              
              if (response.data.success) {
                const gameData: GameData = {
                  questions: response.data.data.questions,
                  total_questions: response.data.data.total_questions,
                  time_per_question: response.data.data.time_per_question,
                  game_mode: response.data.data.game_mode || 'flashcards',
                  operation: response.data.data.operation || 'addition'
                };
                
                console.log('Setting game data:', gameData);
                console.log('First question (creator):', gameData.questions?.[0]);
                setGameData(gameData);
                setCurrentQuestionIndex(0);
                setCountdown(3);
              }
            } catch (startError: any) {
              console.error('Error starting game:', startError);
              console.error('Start error details:', startError.response?.data);
              
              // If game is already active, fetch existing questions
              if (startError.response?.data?.message === 'Game is already active') {
                console.log('Game already active, fetching existing questions...');
                await fetchGameDataForParticipant();
              } else {
                throw startError; // Re-throw other errors
              }
            }
          }
        } else {
          // For participants, wait for the game to start and then fetch questions
          console.log('Participant - waiting for game to start...');
          if (roomData.status === 'active') {
            console.log('Game is active, fetching questions...');
            fetchGameDataForParticipant();
          } else {
            console.log('Game not active yet, polling for status...');
            // Poll for room status until game becomes active
            const pollInterval = setInterval(async () => {
              try {
                const pollResponse = await getPVPRoomDetails(roomId, authToken);
                if (pollResponse.data.success && pollResponse.data.data.status === 'active') {
                  clearInterval(pollInterval);
                  console.log('Game became active, fetching questions...');
                  fetchGameDataForParticipant();
                }
              } catch (err) {
                console.error('Error polling room status:', err);
              }
            }, 1000);
            
            // Clear interval after 30 seconds to avoid infinite polling
            setTimeout(() => {
              clearInterval(pollInterval);
            }, 30000);
          }
        }
      }
    } catch (err: any) {
      console.error('Error fetching game data:', err);
      console.error('Error details:', err.response?.data);
      
      // Fallback to mock data if API fails
      console.log('Using fallback mock data');
      const mockGameData: GameData = {
        questions: [
          {
            question_id: 1,
            operands: [5, 3, 2, 1, 4],
            operator: '+',
            correct_answer: 15,
            question_type: 'basic'
          },
          {
            question_id: 2,
            operands: [10, 2, 1, 5, 3],
            operator: '-',
            correct_answer: 9,
            question_type: 'basic'
          }
        ],
        total_questions: 2,
        time_per_question: 30
      };
      
      setGameData(mockGameData);
      setCountdown(3);
    }
  };

  const fetchGameDataForParticipant = async () => {
    if (!roomId || !authToken) {
      console.log('Missing data for participant:', { roomId, authToken: !!authToken });
      return;
    }
    
    console.log('Fetching game questions for participant...');
    
    try {
      const response = await getPVPGameQuestions(roomId, authToken);
      console.log('Game questions response:', response.data);
      
      if (response.data.success) {
        const gameData: GameData = {
          questions: response.data.data.questions,
          total_questions: response.data.data.total_questions,
          time_per_question: response.data.data.time_per_question,
          game_mode: response.data.data.game_mode || 'flashcards',
          operation: response.data.data.operation || 'addition'
        };
        
        console.log('Setting participant game data:', gameData);
        console.log('First question (participant):', gameData.questions?.[0]);
        setGameData(gameData);
        setCurrentQuestionIndex(0);
        setCountdown(3);
      } else {
        console.log('Failed to get game questions:', response.data);
        // Use fallback mock data
        console.log('Using fallback mock data for participant');
        const mockGameData: GameData = {
          questions: [
            {
              question_id: 1,
              operands: [5, 3, 2, 1, 4],
              operator: '+',
              correct_answer: 15,
              question_type: 'basic'
            },
            {
              question_id: 2,
              operands: [10, 2, 1, 5, 3],
              operator: '-',
              correct_answer: 9,
              question_type: 'basic'
            }
          ],
          total_questions: 2,
          time_per_question: 30
        };
        
        setGameData(mockGameData);
        setCurrentQuestionIndex(0);
        setCountdown(3);
      }
    } catch (err: any) {
      console.error('Error fetching game data for participant:', err);
      console.error('Error details:', err.response?.data);
      
      // Use fallback mock data
      console.log('Using fallback mock data for participant due to error');
      const mockGameData: GameData = {
        questions: [
          {
            question_id: 1,
            operands: [5, 3, 2, 1, 4],
            operator: '+',
            correct_answer: 15,
            question_type: 'basic'
          },
          {
            question_id: 2,
            operands: [10, 2, 1, 5, 3],
            operator: '-',
            correct_answer: 9,
            question_type: 'basic'
          }
        ],
        total_questions: 2,
        time_per_question: 30
      };
      
      setGameData(mockGameData);
      setCurrentQuestionIndex(0);
      setCountdown(3);
    }
  };

  // Handle 3-2-1-Fight countdown
  useEffect(() => {
    if (countdown === null) return;
    if (countdown === 0) {
      console.log('Countdown finished, starting game');
      setCountdown(null);
      setTimeLeft(gameData?.time_per_question || 30);
      return;
    }
    const t = setTimeout(() => setCountdown((c) => (c ?? 0) - 1), 1000);
    return () => clearTimeout(t);
  }, [countdown, gameData?.time_per_question]);

  useEffect(() => {
    if (countdown !== null) return; // pause during countdown
    if (timeLeft > 0 && !gameEnded && currentQuestion) {
      const timer = setTimeout(() => setTimeLeft(timeLeft - 1), 1000);
      return () => clearTimeout(timer);
    } else if (timeLeft === 0 && !gameEnded && currentQuestion) {
      console.log('Time up, auto-submitting');
      handleAnswerSubmit(); // Auto-submit when time runs out
    }
  }, [timeLeft, gameEnded, currentQuestion, countdown]);

  // If we have game data but no current question, try to show the first question
  useEffect(() => {
    if (gameData && !currentQuestion && gameData.questions.length > 0) {
      console.log('Game data exists but no current question, setting to first question');
      setCurrentQuestionIndex(0);
    }
  }, [gameData, currentQuestion]);

  // Flashcard logic - handle step progression
  useEffect(() => {
    if (gameData?.game_mode === 'flashcards' && currentQuestion && !gameEnded) {
      // Reset flashcard state for new question
      // Use flashcard_speed from room settings, not time_per_question
      const flashcardSpeed = gameData.room_settings?.flashcard_speed || 5; // Default 5 seconds
      setFlashCardState({
        currentStep: 'operand1',
        flashCardSpeed: flashcardSpeed * 1000 // Convert to milliseconds
      });
    }
  }, [currentQuestion, gameData?.game_mode, gameEnded]);

  // Flashcard timing effect - progress through steps
  useEffect(() => {
    if (gameData?.game_mode === 'flashcards' && currentQuestion && !gameEnded && flashCardState.currentStep !== 'input') {
      const timer = setTimeout(() => {
        setFlashCardState(prev => {
          switch (prev.currentStep) {
            case 'operand1':
              return { ...prev, currentStep: 'operand2' };
            case 'operand2':
              return { ...prev, currentStep: 'input' };
            default:
              return prev;
          }
        });
      }, flashCardState.flashCardSpeed);

      return () => clearTimeout(timer);
    }
  }, [flashCardState.currentStep, currentQuestion, gameData?.game_mode, gameEnded, flashCardState.flashCardSpeed]);

  // Auto-advance for flashcards when time runs out
  useEffect(() => {
    if (gameData?.game_mode === 'flashcards' && flashCardState.currentStep === 'input' && timeLeft === 0 && !gameEnded && currentQuestion) {
      console.log('Flashcard time up, auto-submitting');
      handleAnswerSubmit();
    }
  }, [gameData?.game_mode, flashCardState.currentStep, timeLeft, gameEnded, currentQuestion]);

  const handleAnswerSubmit = async () => {
    if (!roomId || !authToken || !currentQuestion) return;
    
    // For flashcards, allow empty answers (score 0)
    if (gameData?.game_mode === 'flashcards' && !userAnswer.trim()) {
      console.log('Flashcard empty answer - scoring 0');
    } else if (!userAnswer.trim()) {
      return; // For other modes, require an answer
    }
    
    setLoading(true);
    try {
      let isCorrect = false;
      const timeTaken = gameData?.time_per_question - timeLeft || 0;
      
      if (userAnswer.trim()) {
        const answer = parseFloat(userAnswer.trim());
        isCorrect = Math.abs(answer - currentQuestion.correct_answer) < 0.01; // Allow small floating point differences
      } else {
        // Empty answer for flashcards - score 0
        isCorrect = false;
      }
      
      if (isCorrect) {
        setScore(score + 10); // 10 points per correct answer
        setCorrectAnswers(correctAnswers + 1);
      }
      
      setTotalTime(totalTime + timeTaken);

      // Move to next question or end game
      if (currentQuestionIndex < (gameData?.total_questions || 1) - 1) {
        setCurrentQuestionIndex(currentQuestionIndex + 1);
        setTimeLeft(gameData?.time_per_question || 30);
        setUserAnswer('');
      } else {
        // Game finished, submit results
        await submitGameResults();
      }
    } catch (err) {
      console.error('Error submitting answer:', err);
    } finally {
      setLoading(false);
    }
  };

  const submitGameResults = async () => {
    if (!roomId || !authToken) return;
    
    try {
      const response = await submitPVPGameResult(roomId, score, correctAnswers, totalTime, authToken);
      
      if (response.data.success) {
        const result = response.data.data;
        
        if (result.is_winner === null && result.finished_players < result.total_players) {
          // Not all players finished yet, show waiting screen
          setWaitingForOthers(true);
          // Poll for results
          const pollInterval = setInterval(async () => {
            try {
              const pollResponse = await getPVPGameResult(roomId, authToken);
              if (pollResponse.data.success && pollResponse.data.data && pollResponse.data.data.is_winner !== null) {
                clearInterval(pollInterval);
                setGameResult(pollResponse.data.data);
                setGameEnded(true);
                setWaitingForOthers(false);
                // Update experience and sync with backend
                const correctExperience = (() => {
                  const result = pollResponse.data.data;
                  if (result.is_draw) return 20;
                  else if (result.is_winner) return 50;
                  else return 10;
                })();
                updateExperience(correctExperience);
                try {
                  const r = pollResponse.data.data;
                  logActivity({
                    type: 'pvp',
                    title: r.is_draw ? 'PvP Match ended in a Draw' : r.is_winner ? 'PvP Victory' : 'PvP Defeat',
                    xp: correctExperience,
                    meta: { roomId, score, correctAnswers, totalTime }
                  });
                } catch {}
                // Force sync with backend to ensure persistence
                setTimeout(() => {
                  const { syncWithBackend } = useExperienceStore.getState();
                  syncWithBackend();
                }, 100);
              }
            } catch (err) {
              console.error('Error polling results:', err);
            }
          }, 300);
        } else {
          // All players finished, show results
          setGameResult(result);
          setGameEnded(true);
          setWaitingForOthers(false);
          // Update experience and sync with backend
          const correctExperience = (() => {
            if (result.is_draw) return 20;
            else if (result.is_winner) return 50;
            else return 10;
          })();
          updateExperience(correctExperience);
          try {
            logActivity({
              type: 'pvp',
              title: result.is_draw ? 'PvP Match ended in a Draw' : result.is_winner ? 'PvP Victory' : 'PvP Defeat',
              xp: correctExperience,
              meta: { roomId, score, correctAnswers, totalTime }
            });
          } catch {}
          // Force sync with backend to ensure persistence
          setTimeout(() => {
            const { syncWithBackend } = useExperienceStore.getState();
            syncWithBackend();
          }, 100);
        }
      }
    } catch (err) {
      console.error('Error submitting game results:', err);
    }
  };


  if (waitingForOthers) {
    return (
      <div className="min-h-screen bg-black text-white">
        <div className="px-4 pt-4 tablet:p-6 desktop:px-12 space-y-6 min-h-screen">
          <div className="rounded-3xl p-12 border-2 border-white">
            <div className="text-center">
              <div className="text-8xl mb-6">⏳</div>
              <h1 className="text-5xl font-extrabold text-white mb-4">Waiting for Opponents</h1>
              <p className="text-2xl text-white mb-6">You've completed all questions!</p>
              <p className="text-lg text-white mb-10">
                Waiting for other players to finish...
              </p>
              <div className="flex justify-center">
                <div className="animate-spin w-16 h-16 border-4 border-white/30 border-t-white rounded-full"></div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Countdown overlay
  if (countdown !== null) {
    return (
      <div className="min-h-screen bg-black text-white flex items-center justify-center">
        <div className="text-center">
          <div className="text-9xl font-black text-white mb-4 animate-pulse">
            {countdown === 0 ? 'Fight!' : countdown}
          </div>
          {countdown > 0 && <div className="text-2xl text-white font-semibold">Get ready...</div>}
        </div>
      </div>
    );
  }

  if (gameEnded && gameResult) {
    return (
      <div className="min-h-screen bg-black text-white">
        <div className="px-4 pt-4 tablet:p-6 desktop:px-12 space-y-6 min-h-screen">
          <div className="rounded-3xl p-8 border-2 border-white">
            <div className="text-center">
              <div className="text-8xl mb-4">
                {gameResult.is_winner ? '🏆' : gameResult.is_draw ? '🤝' : '😔'}
              </div>
              <h1 className="text-5xl font-bold text-white mb-2">
                {gameResult.is_winner ? 'Victory!' : gameResult.is_draw ? 'Draw!' : 'Defeat'}
              </h1>
              <p className="text-xl text-white mb-8">
                {gameResult.is_winner ? 'Congratulations! You won!' : gameResult.is_draw ? 'It\'s a tie!' : 'Better luck next time!'}
              </p>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                <div className="p-6 rounded-2xl border-2 border-white">
                  <div className="text-white font-bold text-lg mb-2">Your Score</div>
                  <div className="text-4xl font-black text-white">{score}</div>
                </div>
                <div className="p-6 rounded-2xl border-2 border-white">
                  <div className="text-white font-bold text-lg mb-2">Correct Answers</div>
                  <div className="text-4xl font-black text-white">{correctAnswers}/{gameData?.total_questions}</div>
                </div>
                <div className="p-6 rounded-2xl border-2 border-white">
                  <div className="text-white font-bold text-lg mb-2">Experience Gained</div>
                  <div className="text-4xl font-black text-white">
                    +{(() => {
                      // Fix experience calculation: winner gets 50, loser gets 10, draw gets 20
                      if (gameResult.is_draw) {
                        return 20;
                      } else if (gameResult.is_winner) {
                        return 50;
                      } else {
                        return 10;
                      }
                    })()} XP
                  </div>
                </div>
              </div>

              {gameResult.winner_name && (
                <div className="p-4 rounded-2xl border-2 border-white mb-8">
                  <div className="text-xl text-white">
                    Winner: <span className="font-bold text-2xl">{gameResult.winner_name}</span>
                  </div>
                </div>
              )}

              <div className="flex flex-col tablet:flex-row gap-4 justify-center">
                <button
                  onClick={() => navigate('/student/pvp')}
                  className="bg-white/10 text-white px-8 py-4 rounded-2xl font-bold text-xl hover:scale-105 transition-all duration-300 shadow-lg border border-white"
                >
                  Back to PvP
                </button>
              <button
                  onClick={() => navigate('/student/pvp')}
                  className="bg-white/10 text-white px-8 py-4 rounded-2xl font-bold text-xl hover:scale-105 transition-all duration-300 shadow-lg border border-white"
              >
                  Play Again
              </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }


  if (!gameData || !gameData.questions || gameData.questions.length === 0 || !currentQuestion) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center">
        <div className="bg-white rounded-3xl shadow-xl p-8 border-2 border-gray-100 text-center">
          <div className="text-6xl mb-4">🎮</div>
          <div className="text-2xl font-bold text-gray-800 mb-4">Loading game...</div>
          <div className="text-gray-600 mb-4">
            {!gameData ? 'Fetching game data...' : 'Preparing questions...'}
          </div>
          <div className="text-sm text-gray-500">
            Room ID: {roomId}<br/>
            User ID: {user?.id}<br/>
            Auth Token: {authToken ? 'Present' : 'Missing'}<br/>
            Game Data: {gameData ? 'Loaded' : 'Not Loaded'}<br/>
            Questions: {gameData?.questions?.length || 0}<br/>
            Current Question: {currentQuestion ? 'Available' : 'Not Available'}<br/>
            Countdown: {countdown}<br/>
            Game Ended: {gameEnded ? 'Yes' : 'No'}<br/>
            Waiting: {waitingForOthers ? 'Yes' : 'No'}
          </div>
          <div className="mt-4">
            <div className="animate-spin w-8 h-8 border-4 border-blue-200 border-t-blue-500 rounded-full mx-auto"></div>
          </div>
          <div className="flex gap-2 justify-center">
            <button
              onClick={() => {
                console.log('Manual fetch triggered');
                fetchGameData();
              }}
              className="mt-4 bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600"
            >
              Debug: Fetch Game Data
            </button>
            {gameData && gameData.questions && gameData.questions.length > 0 && (
              <>
                <button
                  onClick={() => {
                    console.log('Force start game');
                    setCountdown(0);
                  }}
                  className="mt-4 bg-green-500 text-white px-4 py-2 rounded-lg hover:bg-green-600"
                >
                  Force Start Game
                </button>
                <button
                  onClick={() => {
                    console.log('Show game directly');
                    setCountdown(null);
                    setTimeLeft(gameData?.time_per_question || 30);
                    setCurrentQuestionIndex(0);
                  }}
                  className="mt-4 bg-purple-500 text-white px-4 py-2 rounded-lg hover:bg-purple-600"
                >
                  Show Game Directly
                </button>
              </>
            )}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black text-white">
      <div className="px-4 pt-4 tablet:p-6 desktop:px-12 space-y-6 min-h-screen">
        {/* Game Header */}
        <div className="rounded-3xl p-6 border-2 border-white">
          <div className="flex justify-between items-center">
            <div className="flex items-center gap-4">
              <div className="bg-white/10 text-white px-4 py-2 rounded-full font-bold text-lg border border-white">
                {score}
              </div>
              <div className="text-white font-semibold">
                Question {currentQuestionIndex + 1} of {gameData?.total_questions}
              </div>
            </div>
            <div className="flex items-center gap-2 bg-white/10 text-white px-4 py-2 rounded-full border border-white">
                <AiOutlineClockCircle className="text-xl" />
                <span className="text-2xl font-bold">{timeLeft}s</span>
              </div>
            </div>
          
          {/* Progress Bar */}
          <div className="mt-4 w-full bg-white/20 rounded-full h-3">
            <div 
              className="bg-white h-3 rounded-full transition-all duration-300"
              style={{ width: `${((currentQuestionIndex + 1) / (gameData?.total_questions || 1)) * 100}%` }}
            ></div>
          </div>
        </div>

        {/* Question Card */}
        <div className="rounded-3xl p-8 border-2 border-white">
          <div className="text-center">
            {/* Math Problem Display */}
            <div className="flex items-center justify-center gap-8 mb-10">
              {gameData?.game_mode === 'flashcards' ? (
                /* Flashcard Mode - Clean horizontal layout like practice mode */
                <div className="flex items-center justify-center gap-8">
                  {/* Left side - Flashcard */}
                  <div className="border-2 border-gold rounded-lg font-bold text-gold p-4 min-w-[120px] min-h-[80px] flex items-center justify-center">
                    <div className="text-6xl md:text-7xl font-extrabold text-gold">
                      {flashCardState.currentStep === 'operand1' && currentQuestion?.operands[0]}
                      {flashCardState.currentStep === 'operand2' && currentQuestion?.operands[1]}
                      {flashCardState.currentStep === 'input' && '?'}
                    </div>
                  </div>
                  
                  {/* Middle - Operation (always visible) */}
                  <div className="text-6xl md:text-7xl font-extrabold text-white">
                    {currentQuestion?.operator}
                  </div>
                  
                  {/* Right side - Equals and Input */}
                  <div className="flex items-center gap-4">
                    <div className="text-6xl md:text-7xl font-extrabold text-white">
                      =
                    </div>
                    <input
                      type="number"
                      value={userAnswer}
                      onChange={(e) => setUserAnswer(e.target.value)}
                      onKeyPress={(e) => {
                        if (e.key === 'Enter') {
                          handleAnswerSubmit();
                        }
                      }}
                      className="w-32 h-20 text-4xl font-extrabold text-center bg-transparent border-2 border-white rounded-lg text-white focus:outline-none focus:border-gold"
                      placeholder="?"
                      autoFocus
                    />
                  </div>
                </div>
              ) : (
                /* Regular Mode - Show all operands at once */
                <>
                  {/* Left side - Operands stacked vertically */}
                  <div className="flex flex-col items-end">
                    {currentQuestion?.operands.map((operand, index) => (
                      <div key={index} className="text-6xl md:text-7xl font-extrabold text-white mb-2 text-right">
                        {operand}
                      </div>
                    ))}
                  </div>
                  
                  {/* Operator */}
                  <div className="text-6xl md:text-7xl font-extrabold text-white">
                    {currentQuestion?.operator}
                  </div>
                  
                  {/* Equals sign */}
                  <div className="text-6xl md:text-7xl font-extrabold text-white">
                    =
                  </div>
                  
                  {/* Answer input */}
                  <div>
                    <input
                      type="number"
                      value={userAnswer}
                      onChange={(e) => setUserAnswer(e.target.value)}
                      onKeyPress={(e) => {
                        if (e.key === 'Enter') {
                          handleAnswerSubmit();
                        }
                      }}
                      className="w-32 h-20 text-4xl font-extrabold text-center bg-transparent border-2 border-white rounded-lg text-white focus:outline-none focus:border-gold"
                      placeholder="?"
                      autoFocus
                    />
                  </div>
                </>
              )}
            </div>
            
            {/* Action Buttons */}
            <div className="flex justify-center gap-4">
              {gameData?.game_mode === 'flashcards' ? (
                /* Flashcard Mode Buttons - Always show */
                <>
                  <button
                    onClick={() => {
                      setUserAnswer('');
                      // Move to next question without submitting (skip with 0 score)
                      if (currentQuestionIndex < (gameData?.total_questions || 1) - 1) {
                        setCurrentQuestionIndex(currentQuestionIndex + 1);
                        setTimeLeft(gameData?.time_per_question || 30);
                      } else {
                        handleAnswerSubmit();
                      }
                    }}
                    disabled={loading}
                    className="bg-gray-600 text-white px-8 py-3 rounded-xl font-bold text-lg hover:bg-gray-700 transition-all duration-300 disabled:opacity-50"
                  >
                    Skip
                  </button>
                  
                  <button
                    onClick={handleAnswerSubmit}
                    disabled={loading || !userAnswer.trim()}
                    className="bg-gold text-black px-8 py-3 rounded-xl font-bold text-lg hover:bg-lightGold transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {loading ? 'Submitting...' : 'Next'}
                  </button>
                </>
              ) : (
                /* Regular Mode Buttons */
                <>
                  <button
                    onClick={() => {
                      setUserAnswer('');
                      // Move to next question without submitting
                      if (currentQuestionIndex < (gameData?.total_questions || 1) - 1) {
                        setCurrentQuestionIndex(currentQuestionIndex + 1);
                        setTimeLeft(gameData?.time_per_question || 30);
                      } else {
                        handleAnswerSubmit();
                      }
                    }}
                    disabled={loading}
                    className="bg-gray-600 text-white px-8 py-3 rounded-xl font-bold text-lg hover:bg-gray-700 transition-all duration-300 disabled:opacity-50"
                  >
                    Skip
                  </button>
                  
                  <button
                    onClick={handleAnswerSubmit}
                    disabled={loading || !userAnswer.trim()}
                    className="bg-gold text-black px-8 py-3 rounded-xl font-bold text-lg hover:bg-lightGold transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {loading ? 'Submitting...' : 'Next'}
                  </button>
                </>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default StudentPvPGamePage;  