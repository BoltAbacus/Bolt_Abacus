import { FC, useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { AiOutlineClockCircle } from 'react-icons/ai';

import { useAuthStore } from '@store/authStore';
import { useExperienceStore } from '@store/experienceStore';
import { submitPVPGameResult, startPVPGame, getPVPRoomDetails, getPVPGameQuestions, getPVPGameResult } from '@services/pvp';
import { logActivity } from '@helpers/activity';
import { generatePvPQuestions } from '@helpers/questionBuilder';
import { QuizQuestion } from '@interfaces/apis/student';
import { useProblemTimer } from '@hooks/useProblemTimer';

// Import practice mode components
import QuizBox from '@components/organisms/QuizBox';
import FlashCardBox from '@components/organisms/FlashCardBox';

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
    // Practice mode settings
    numberOfDigitsLeft?: number;
    numberOfDigitsRight?: number;
    isZigzag?: boolean;
    numberOfRows?: number;
    includeSubtraction?: boolean;
    persistNumberOfDigits?: boolean;
    includeDecimals?: boolean;
    audioMode?: boolean;
    audioPace?: string;
    showQuestion?: boolean;
  };
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
  const [gameTimeLeft, setGameTimeLeft] = useState(300); // 5 minutes for 10 questions
  const [gameEnded, setGameEnded] = useState(false);
  const [countdown, setCountdown] = useState<number | null>(null);
  const [loading, setLoading] = useState(false);
  const [waitingForOthers, setWaitingForOthers] = useState(false);
  const [gameResult, setGameResult] = useState<any>(null);
  const [submissionError, setSubmissionError] = useState<string | null>(null);
  const [lastQuestionStartTime, setLastQuestionStartTime] = useState<number | null>(null);
  
  const { startProblem, endProblem, getProblemTimes } = useProblemTimer();

  // Start timing when a new question is shown
  useEffect(() => {
    if (gameData && gameData.questions && currentQuestionIndex < gameData.questions.length) {
      const question = gameData.questions[currentQuestionIndex];
      if (question) {
        startProblem(question.question_id.toString());
        
        // Track when we reach the last question for timeout fallback
        if (currentQuestionIndex === gameData.questions.length - 1) {
          setLastQuestionStartTime(Date.now());
        } else {
          setLastQuestionStartTime(null);
        }
      }
    }
  }, [gameData, currentQuestionIndex, startProblem]);

  const currentQuestion = gameData?.questions[currentQuestionIndex];
  const [quizQuestions, setQuizQuestions] = useState<Array<QuizQuestion>>([]);
  const [currentFlashcardIndex, setCurrentFlashcardIndex] = useState(0);
  const [currentFlashcardAnswer, setCurrentFlashcardAnswer] = useState('');
  const [isFlashcardNextDisabled, setIsFlashcardNextDisabled] = useState(true);
  
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
      console.log("7844878777")
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
        const isCreator = true;
        
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
                // Use local generation to ensure all room settings are respected
                console.log('Creator - using local question generation to respect all room settings');
                const op = response.data.data.operation || 'addition';
                const includeSub = (roomData.includeSubtraction !== undefined
                  ? roomData.includeSubtraction
                  : (op === 'addition'));
                const generatedQuestions = generatePvPQuestions(
                  op,
                  roomData.numberOfDigitsLeft || 1,
                  roomData.numberOfDigitsRight || 1,
                  response.data.data.total_questions,
                  roomData.numberOfRows || 2,
                  roomData.isZigzag || false,
                  includeSub,
                  roomData.persistNumberOfDigits || false,
                  roomData.includeDecimals || false
                );
                
                const gameData: GameData = {
                  questions: generatedQuestions,
                  total_questions: response.data.data.total_questions,
                  time_per_question: response.data.data.time_per_question,
                  game_mode: response.data.data.game_mode || 'flashcards',
                  operation: op,
                  room_settings: {
                    // Include practice mode settings from room data
                    numberOfDigitsLeft: roomData.numberOfDigitsLeft,
                    numberOfDigitsRight: roomData.numberOfDigitsRight,
                    isZigzag: roomData.isZigzag,
                    numberOfRows: roomData.numberOfRows,
                    includeSubtraction: includeSub,
                    persistNumberOfDigits: roomData.persistNumberOfDigits,
                    includeDecimals: roomData.includeDecimals,
                    audioMode: roomData.audioMode,
                    audioPace: roomData.audioPace,
                    showQuestion: roomData.showQuestion,
                    flashcard_speed: roomData.flashcard_speed
                  }
                };
                
                console.log('Setting game data:', gameData);
                console.log('First question (creator):', gameData.questions?.[0]);
                setGameData(gameData);
                setCurrentQuestionIndex(0);
                setCountdown(3);
                // Initialize game timer based on game mode
                let totalGameTime = 300; // Default 5 minutes
                if (gameData.game_mode === 'flashcards' || gameData.game_mode === 'norushmastery' || gameData.game_mode === 'custom') {
                  // For flashcards, no rush mastery, and custom challenge: NO TIME LIMIT
                  totalGameTime = 0; // No time limit - game runs indefinitely
                  console.log(`🎮 NO LIMIT MODE: ${gameData.game_mode} - No time limit`);
                } else if (gameData.time_per_question === 0) {
                  // If time per question is 0, treat as no time limit
                  totalGameTime = 0; // No time limit
                  console.log(`🎮 NO TIME LIMIT: TimePerQuestion=0 - No time limit`);
                } else {
                  // For time attack and other timed modes: time per question × total questions
                  totalGameTime = (gameData.total_questions * gameData.time_per_question) || 300;
                  console.log(`🎮 TIMED MODE: TimePerQuestion=${gameData.time_per_question}s, Questions=${gameData.total_questions}, TotalTime=${totalGameTime}s`);
                }
                setGameTimeLeft(totalGameTime);
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
      // Initialize game timer based on game mode
      let totalGameTime = 300; // Default 5 minutes
      if (mockGameData.game_mode === 'flashcards' || mockGameData.game_mode === 'norushmastery' || mockGameData.game_mode === 'custom') {
        // For flashcards, no rush mastery, and custom challenge: NO TIME LIMIT
        totalGameTime = 0; // No time limit - game runs indefinitely
        console.log(`🎮 MOCK NO LIMIT MODE: ${mockGameData.game_mode} - No time limit`);
      } else if (mockGameData.time_per_question === 0) {
        // If time per question is 0, treat as no time limit
        totalGameTime = 0; // No time limit
        console.log(`🎮 MOCK NO TIME LIMIT: TimePerQuestion=0 - No time limit`);
      } else {
        // For time attack and other timed modes: time per question × total questions
        totalGameTime = (mockGameData.total_questions * mockGameData.time_per_question) || 300;
        console.log(`🎮 MOCK TIMED MODE: TimePerQuestion=${mockGameData.time_per_question}s, Questions=${mockGameData.total_questions}, TotalTime=${totalGameTime}s`);
      }
      setGameTimeLeft(totalGameTime);
    }
  };

  const fetchGameDataForParticipant = async () => {
    if (!roomId || !authToken) {
      console.log('Missing data for participant:', { roomId, authToken: !!authToken });
      return;
    }
    
    console.log('Fetching game questions for participant...');
    
    try {
      // First get room details to access practice mode settings
      const roomResponse = await getPVPRoomDetails(roomId, authToken);
      const roomData = roomResponse.data.success ? roomResponse.data.data : {};
      
      const response = await getPVPGameQuestions(roomId, authToken);
      console.log('Game questions response:', response.data);
      console.log('Room settings for subtraction:', {
        includeSubtraction: roomData.includeSubtraction,
        operation: response.data.data?.operation,
        firstQuestion: response.data.data?.questions?.[0]
      });
      
      if (response.data.success) {
        // Always use local generation to ensure all room settings are respected
        console.log('Using local question generation to respect all room settings');
        const op = response.data.data.operation || 'addition';
        const includeSub = (roomData.includeSubtraction !== undefined
          ? roomData.includeSubtraction
          : (op === 'addition'));
        const generatedQuestions = generatePvPQuestions(
          op,
          roomData.numberOfDigitsLeft || 1,
          roomData.numberOfDigitsRight || 1,
          response.data.data.total_questions,
          roomData.numberOfRows || 2,
          roomData.isZigzag || false,
          includeSub,
          roomData.persistNumberOfDigits || false,
          roomData.includeDecimals || false
        );
          
          const gameData: GameData = {
            questions: generatedQuestions,
            total_questions: response.data.data.total_questions,
            time_per_question: response.data.data.time_per_question,
            game_mode: response.data.data.game_mode || 'flashcards',
            operation: op,
            room_settings: {
              numberOfDigitsLeft: roomData.numberOfDigitsLeft,
              numberOfDigitsRight: roomData.numberOfDigitsRight,
              isZigzag: roomData.isZigzag,
              numberOfRows: roomData.numberOfRows,
              includeSubtraction: includeSub,
              persistNumberOfDigits: roomData.persistNumberOfDigits,
              includeDecimals: roomData.includeDecimals,
              audioMode: roomData.audioMode,
              audioPace: roomData.audioPace,
              showQuestion: roomData.showQuestion,
              flashcard_speed: roomData.flashcard_speed
            }
          };
          
        setGameData(gameData);
        setCurrentQuestionIndex(0);
        setCountdown(3);
        // Initialize game timer based on total questions and time per question
        const totalGameTime = (gameData.total_questions * gameData.time_per_question) || 300;
        setGameTimeLeft(totalGameTime);
        return;
      } else {
        console.log('Failed to get game questions:', response.data);
        // Use fallback question generation with practice mode settings
        console.log('Using fallback question generation for participant');
        
        // Get room settings from room data (if available) or use defaults
        const roomSettings = gameData?.room_settings || {};
        const operation = gameData?.operation || 'addition';
        const numberOfQuestions = gameData?.total_questions || 10;
        const timePerQuestion = gameData?.time_per_question || 30;
        
        // Generate questions using practice mode settings
        const generatedQuestions = generatePvPQuestions(
          operation,
          roomSettings.numberOfDigitsLeft || 1,
          roomSettings.numberOfDigitsRight || 1,
          numberOfQuestions,
          roomSettings.numberOfRows || 2,
          roomSettings.isZigzag || false,
          roomSettings.includeSubtraction || false,
          roomSettings.persistNumberOfDigits || false,
          roomSettings.includeDecimals || false
        );
        
        const fallbackGameData: GameData = {
          questions: generatedQuestions,
          total_questions: numberOfQuestions,
          time_per_question: timePerQuestion,
          game_mode: gameData?.game_mode || 'flashcards',
          operation: operation,
          room_settings: roomSettings
        };
        
        setGameData(fallbackGameData);
        setCurrentQuestionIndex(0);
        setCountdown(3);
        // Initialize game timer based on game mode
        let totalGameTime = 300; // Default 5 minutes
        if (fallbackGameData.game_mode === 'flashcards' || fallbackGameData.game_mode === 'norushmastery' || fallbackGameData.game_mode === 'custom') {
          // For flashcards, no rush mastery, and custom challenge: NO TIME LIMIT
          totalGameTime = 0; // No time limit - game runs indefinitely
          console.log(`🎮 FALLBACK NO LIMIT MODE: ${fallbackGameData.game_mode} - No time limit`);
        } else if (fallbackGameData.time_per_question === 0) {
          // If time per question is 0, treat as no time limit
          totalGameTime = 0; // No time limit
          console.log(`🎮 FALLBACK NO TIME LIMIT: TimePerQuestion=0 - No time limit`);
        } else {
          // For time attack and other timed modes: time per question × total questions
          totalGameTime = (fallbackGameData.total_questions * fallbackGameData.time_per_question) || 300;
          console.log(`🎮 FALLBACK TIMED MODE: TimePerQuestion=${fallbackGameData.time_per_question}s, Questions=${fallbackGameData.total_questions}, TotalTime=${totalGameTime}s`);
        }
        setGameTimeLeft(totalGameTime);
      }
    } catch (err: any) {
      console.error('Error fetching game data for participant:', err);
      console.error('Error details:', err.response?.data);
      
      // Use fallback question generation with practice mode settings
      console.log('Using fallback question generation for participant due to error');
      
      // Get room settings from room data (if available) or use defaults
      const roomSettings = gameData?.room_settings || {};
      const operation = gameData?.operation || 'addition';
      const numberOfQuestions = gameData?.total_questions || 10;
      const timePerQuestion = gameData?.time_per_question || 30;
      
      // Generate questions using practice mode settings
      const generatedQuestions = generatePvPQuestions(
        operation,
        roomSettings.numberOfDigitsLeft || 1,
        roomSettings.numberOfDigitsRight || 1,
        numberOfQuestions,
        roomSettings.numberOfRows || 2,
        roomSettings.isZigzag || false,
        roomSettings.includeSubtraction || false,
        roomSettings.persistNumberOfDigits || false,
        roomSettings.includeDecimals || false
      );
      
      const fallbackGameData: GameData = {
        questions: generatedQuestions,
        total_questions: numberOfQuestions,
        time_per_question: timePerQuestion,
        game_mode: gameData?.game_mode || 'flashcards',
        operation: operation,
        room_settings: roomSettings
      };
      
      setGameData(fallbackGameData);
      setCurrentQuestionIndex(0);
      setCountdown(3);
      // Initialize game timer based on total questions and time per question
      const totalGameTime = (fallbackGameData.total_questions * fallbackGameData.time_per_question) || 300;
      setGameTimeLeft(totalGameTime);
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

  // Per-question timer effect - only for time attack mode with time limit
  useEffect(() => {
    if (countdown !== null) return; // pause during countdown
    if (gameData?.game_mode !== 'timeattack') return; // Only for time attack mode
    if (gameData?.time_per_question === 0) return; // Skip if no time limit
    if (timeLeft > 0 && !gameEnded && currentQuestion) {
      const timer = setTimeout(() => setTimeLeft(timeLeft - 1), 1000);
      return () => clearTimeout(timer);
    } else if (timeLeft === 0 && !gameEnded && currentQuestion) {
      console.log('⏰ PER-QUESTION TIME UP: Auto-skipping to next question');
      console.log(`⏰ Current question: ${currentQuestionIndex + 1}, Total questions: ${gameData?.total_questions}`);
      // Auto-skip to next question when per-question time runs out
      if (currentQuestionIndex < (gameData?.total_questions || 1) - 1) {
        console.log('⏰ Moving to next question');
        setCurrentQuestionIndex(currentQuestionIndex + 1);
        setTimeLeft(gameData?.time_per_question || 30);
        setUserAnswer(''); // Clear answer
      } else {
        // Last question - auto-submit
        console.log('⏰ Last question - auto-submitting');
        // Force submit with empty answer if no answer provided
        if (!userAnswer.trim()) {
          console.log('⏰ Last question - submitting with empty answer (score 0)');
        }
        handleAnswerSubmit(true); // Force submit for auto-submit
      }
    }
  }, [timeLeft, gameEnded, currentQuestion, countdown, gameData?.game_mode, gameData?.time_per_question, currentQuestionIndex, gameData?.total_questions]);

  // Game timer effect - overall timer for timed modes only
  useEffect(() => {
    if (countdown !== null) return; // pause during countdown
    if (gameData?.game_mode === 'timeattack') return; // Skip for time attack (uses different timer)
    if (gameData?.game_mode === 'flashcards' || gameData?.game_mode === 'norushmastery' || gameData?.game_mode === 'custom') return; // Skip for no-limit modes
    if (gameData?.time_per_question === 0) return; // Skip if no time limit
    
    if (gameTimeLeft > 0 && !gameEnded) {
      const timer = setTimeout(() => setGameTimeLeft(gameTimeLeft - 1), 1000);
      return () => clearTimeout(timer);
    } else if (gameTimeLeft === 0 && !gameEnded) {
      console.log('🎮 ROOM TIME UP: Auto-submitting final score for all players');
      console.log(`🎮 Current question: ${currentQuestionIndex + 1}, Total questions: ${gameData?.total_questions}`);
      // Auto-submit when total game time runs out
      // This will submit whatever the current state is (including blank answers)
      handleAnswerSubmit(true); // Force submit for room time auto-submit
    }
  }, [gameTimeLeft, gameEnded, countdown, gameData?.game_mode, gameData?.time_per_question, currentQuestionIndex, gameData?.total_questions]);

  // If we have game data but no current question, try to show the first question
  useEffect(() => {
    if (gameData && !currentQuestion && gameData.questions.length > 0) {
      console.log('Game data exists but no current question, setting to first question');
      setCurrentQuestionIndex(0);
    }
  }, [gameData, currentQuestion]);

  // Timeout fallback for last question - if player has been on last question for too long, try to get results
  useEffect(() => {
    if (lastQuestionStartTime && !gameEnded && !loading && !waitingForOthers) {
      // Check immediately and then set up timeout
      const checkResults = async () => {
        console.log('🎮 LAST QUESTION: Checking for results...');
        try {
          const resultResponse = await getPVPGameResult(roomId!, authToken!);
          if (resultResponse.data.success && resultResponse.data.data) {
            const result = resultResponse.data.data;
            console.log('🎮 LAST QUESTION RESULTS:', result);
            
            if (result.is_winner !== null || result.finished_players >= result.total_players) {
              console.log('🎮 LAST QUESTION: Game finished, showing results');
              setGameResult(result);
              setGameEnded(true);
              setWaitingForOthers(false);
              setLoading(false);
              setSubmissionError(null);
              
              // Update experience
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
              
              // Force sync with backend
              setTimeout(() => {
                const { syncWithBackend } = useExperienceStore.getState();
                syncWithBackend();
              }, 100);
              
              // Notify other pages
              try {
                window.dispatchEvent(new Event('practiceSessionCompleted'));
              } catch {}
              
              return true; // Results found
            }
          }
        } catch (err) {
          console.error('Failed to get results:', err);
        }
        return false; // No results yet
      };
      
      // Check immediately
      checkResults();
      
      // Set up timeout for additional checks
      const timeout = setTimeout(async () => {
        console.log('🎮 LAST QUESTION TIMEOUT: Attempting to get results...');
        await checkResults();
      }, 3000); // 3 second timeout for last question
      
      return () => clearTimeout(timeout);
    }
  }, [lastQuestionStartTime, gameEnded, loading, waitingForOthers, roomId, authToken, score, correctAnswers, totalTime, updateExperience]);

  // Additional polling for waiting players - more aggressive checking
  useEffect(() => {
    if (waitingForOthers && !gameEnded && roomId && authToken) {
      console.log('🎮 WAITING POLLING: Starting aggressive polling for waiting players');
      
      const aggressivePolling = setInterval(async () => {
        try {
          console.log('🎮 AGGRESSIVE POLLING: Checking for results...');
          const pollResponse = await getPVPGameResult(roomId, authToken);
          
          if (pollResponse.data.success && pollResponse.data.data) {
            const result = pollResponse.data.data;
            console.log('🎮 AGGRESSIVE POLLING RESULT:', result);
            
            // Check if game is finished
            if (result.is_winner !== null || result.finished_players >= result.total_players) {
              console.log('🎮 AGGRESSIVE POLLING SUCCESS: Game finished!');
              clearInterval(aggressivePolling);
              setGameResult(result);
              setGameEnded(true);
              setWaitingForOthers(false);
              setLoading(false);
              setSubmissionError(null);
              
              // Update experience
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
              
              // Force sync with backend
              setTimeout(() => {
                const { syncWithBackend } = useExperienceStore.getState();
                syncWithBackend();
              }, 100);
              
              // Notify other pages
              try {
                window.dispatchEvent(new Event('practiceSessionCompleted'));
              } catch {}
            }
          }
        } catch (err) {
          console.error('🎮 AGGRESSIVE POLLING ERROR:', err);
        }
      }, 1000); // Check every 1 second
      
      // Cleanup after 30 seconds
      const timeout = setTimeout(() => {
        console.log('🎮 AGGRESSIVE POLLING: Timeout reached, stopping polling');
        clearInterval(aggressivePolling);
      }, 30000);
      
      return () => {
        clearInterval(aggressivePolling);
        clearTimeout(timeout);
      };
    }
  }, [waitingForOthers, gameEnded, roomId, authToken, score, correctAnswers, totalTime, updateExperience]);

  // (moved declarations to top to avoid redeclare)

  // Convert PvP questions to practice mode format when game data changes
  useEffect(() => {
    if (gameData?.questions && gameData.game_mode === 'flashcards') {
      
      const convertedQuestions: QuizQuestion[] = gameData.questions.map((question) => ({
        questionId: question.question_id,
        question: {
          operator: question.operator,
          numbers: question.operands
        }
      }));
      setQuizQuestions(convertedQuestions);
      setCurrentFlashcardIndex(0);
      setCurrentFlashcardAnswer('');
      setIsFlashcardNextDisabled(true);
      // keep outer index in sync with flashcard index for top tracker
      setCurrentQuestionIndex(0);
    }
  }, [gameData?.questions, gameData?.game_mode]);

  // Flashcard question progression
  const moveFlashcardQuestion = () => {
    if (currentFlashcardIndex + 1 >= quizQuestions.length) {
      // All questions answered, submit
      setLoading(true);
      submitGameResults();
    } else {
      const nextIndex = currentFlashcardIndex + 1;
      setCurrentFlashcardIndex(nextIndex);
      setCurrentQuestionIndex(nextIndex); // sync top tracker
      setCurrentFlashcardAnswer('');
      setIsFlashcardNextDisabled(true);
    }
  };

  const answerFlashcardQuestion = () => {
    if (loading) return; // Prevent multiple submissions
    
    // score the current flashcard
    const question = gameData?.questions[currentFlashcardIndex];
    const correct = question?.correct_answer;
    let isCorrect = false;
    
    if (currentFlashcardAnswer.trim()) {
      const ans = parseFloat(currentFlashcardAnswer.trim());
      isCorrect = Math.abs(ans - (correct ?? NaN)) < 0.01;
      if (isCorrect) {
        setScore((s) => s + 10);
        setCorrectAnswers((c) => c + 1);
      }
    }
    
    // End timing for this problem
    if (question) {
      endProblem(question.question_id.toString(), isCorrect, false);
    }
    
    moveFlashcardQuestion();
  };

  const skipFlashcardQuestion = () => {
    // skip gives 0 score
    const question = gameData?.questions[currentFlashcardIndex];
    
    // End timing for this problem (skipped)
    if (question) {
      endProblem(question.question_id.toString(), false, true);
    }
    
    setUserAnswer('');
    moveFlashcardQuestion();
  };

  const handleAnswerSubmit = async (forceSubmit = false) => {
    if (!roomId || !authToken || !currentQuestion || loading) return;
    
    // Allow empty answers for auto-submit scenarios or flashcards
    if (!userAnswer.trim() && !forceSubmit && gameData?.game_mode !== 'flashcards') {
      console.log('🎮 Empty answer - not submitting (manual submission)');
      return; // For manual submission, require an answer (except flashcards)
    }
    
    if (!userAnswer.trim()) {
      console.log('🎮 Empty answer - submitting with score 0');
    }
    
    setLoading(true);
    try {
      let isCorrect = false;
      // Use actual time spent from problemTimes instead of countdown calculation
      const currentProblemTimes = getProblemTimes();
      const problemTime = currentProblemTimes.find((p: any) => p.questionId === currentQuestion.question_id.toString());
      const timeTaken = problemTime ? problemTime.timeSpent : 0;
      console.log('🎮 PVP TIMING DEBUG: time_per_question=', gameData?.time_per_question, 'timeLeft=', timeLeft, 'timeTaken=', timeTaken, 'problemTime=', problemTime);
      
      if (userAnswer.trim()) {
        const answer = parseFloat(userAnswer.trim());
        isCorrect = Math.abs(answer - currentQuestion.correct_answer) < 0.01; // Allow small floating point differences
      } else {
        // Empty answer - score 0 (for all modes)
        isCorrect = false;
        console.log('🎮 Empty answer - scoring 0');
      }
      
      // End timing for this problem
      endProblem(currentQuestion.question_id.toString(), isCorrect, false);
      
      if (isCorrect) {
        setScore(prev => prev + 10); // 10 points per correct answer
        setCorrectAnswers(prev => prev + 1);
      }
      
      setTotalTime(prev => {
        const newTotal = prev + timeTaken;
        console.log('🎮 PVP TOTAL TIME UPDATE: prev=', prev, 'timeTaken=', timeTaken, 'newTotal=', newTotal);
        return newTotal;
      });

      // Move to next question or end game
      console.log(`🎮 HANDLE ANSWER SUBMIT: Current question: ${currentQuestionIndex + 1}, Total questions: ${gameData?.total_questions}`);
      if (currentQuestionIndex < (gameData?.total_questions || 1) - 1) {
        console.log('🎮 Moving to next question');
        setCurrentQuestionIndex(currentQuestionIndex + 1);
        setTimeLeft(gameData?.time_per_question || 30);
        setUserAnswer('');
        setLoading(false); // Reset loading for next question
      } else {
        // Game finished, submit results
        console.log('🎮 Last question - submitting game results');
        await submitGameResults();
      }
    } catch (err) {
      console.error('Error submitting answer:', err);
      setLoading(false);
    }
  };

  const submitGameResults = async (retryCount = 0) => {
    if (!roomId || !authToken || gameEnded) return;
    
    const maxRetries = 3;
    
    // Clear any previous submission errors
    setSubmissionError(null);
    
    try {
      const problemTimes = getProblemTimes();
      console.log('🎮 PVP SUBMIT DEBUG: score=', score, 'correctAnswers=', correctAnswers, 'totalTime=', totalTime, 'problemTimes=', problemTimes);
      const response = await submitPVPGameResult(roomId, score, correctAnswers, totalTime, authToken, problemTimes);
      
      if (response.data.success) {
        const result = response.data.data;
        console.log('🎮 SUBMISSION RESPONSE:', result);
        
        // Add a small delay and retry to handle race conditions
        if (result.is_winner === null && result.finished_players < result.total_players) {
          console.log('🎮 INITIAL CHECK: Not all players finished, waiting 1 second and checking again...');
          
          // Wait 1 second and check again to handle race conditions
          setTimeout(async () => {
            try {
              const retryResponse = await getPVPGameResult(roomId, authToken);
              if (retryResponse.data.success && retryResponse.data.data) {
                const retryResult = retryResponse.data.data;
                console.log('🎮 RETRY CHECK:', retryResult);
                
                if (retryResult.is_winner !== null || retryResult.finished_players >= retryResult.total_players) {
                  // All players finished, show results immediately
                  console.log('🎮 RETRY SUCCESS: All players finished, showing results');
                  setGameResult(retryResult);
                  setGameEnded(true);
                  setWaitingForOthers(false);
                  setLoading(false);
                  setSubmissionError(null);
                  
                  // Update experience
                  const correctExperience = (() => {
                    if (retryResult.is_draw) return 20;
                    else if (retryResult.is_winner) return 50;
                    else return 10;
                  })();
                  
                  updateExperience(correctExperience);
                  
                  try {
                    logActivity({
                      type: 'pvp',
                      title: retryResult.is_draw ? 'PvP Match ended in a Draw' : retryResult.is_winner ? 'PvP Victory' : 'PvP Defeat',
                      xp: correctExperience,
                      meta: { roomId, score, correctAnswers, totalTime }
                    });
                  } catch {}
                  
                  // Force sync with backend
                  setTimeout(() => {
                    const { syncWithBackend } = useExperienceStore.getState();
                    syncWithBackend();
                  }, 100);
                  
                  // Notify other pages
                  try {
                    window.dispatchEvent(new Event('practiceSessionCompleted'));
                  } catch {}
                  
                  return; // Exit early, don't proceed to waiting screen
                }
              }
            } catch (retryErr) {
              console.error('Retry check failed:', retryErr);
            }
            
            // If retry didn't work, proceed with waiting screen
            console.log('🎮 RETRY FAILED: Proceeding with waiting screen');
            setWaitingForOthers(true);
            setLoading(false);
            setSubmissionError(null);
          }, 1000);
          
          return; // Exit early, don't proceed to the original waiting logic
        }
        
        if (result.is_winner === null && result.finished_players < result.total_players) {
          // Not all players finished yet, show waiting screen
          console.log(`🎮 WAITING FOR OTHERS: Finished players: ${result.finished_players}, Total players: ${result.total_players}`);
          setWaitingForOthers(true);
          setLoading(false); // Reset loading state
          setSubmissionError(null); // Clear any submission errors
          
          // Poll for results with timeout
          const pollInterval = setInterval(async () => {
            try {
              const pollResponse = await getPVPGameResult(roomId, authToken);
              console.log('🎮 POLLING CHECK:', pollResponse.data.data);
              
              if (pollResponse.data.success && pollResponse.data.data) {
                const result = pollResponse.data.data;
                
                // Check if game is finished (either winner determined or all players finished)
                if (result.is_winner !== null || result.finished_players >= result.total_players) {
                  console.log('🎮 POLLING SUCCESS: Game finished, showing results');
                  clearInterval(pollInterval);
                  setGameResult(result);
                  setGameEnded(true);
                  setWaitingForOthers(false);
                
                // Update experience only once
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
                
                // Notify other pages (like Progress) to refresh PvP stats immediately
                try {
                  window.dispatchEvent(new Event('practiceSessionCompleted'));
                } catch {}
              }
            }
          } catch (err) {
            console.error('Error polling results:', err);
          }
          }, 500); // Faster polling for better responsiveness
          
          // Set timeout to prevent infinite polling
          setTimeout(() => {
            clearInterval(pollInterval);
            if (!gameEnded) {
              console.error('Polling timeout - game may have ended');
              setWaitingForOthers(false);
              setLoading(false);
            }
          }, 30000); // 30 second timeout
          
        } else {
          // All players finished, show results
          console.log('🎮 ALL PLAYERS FINISHED: Showing results immediately');
          setGameResult(result);
          setGameEnded(true);
          setWaitingForOthers(false);
          setLoading(false);
          setSubmissionError(null); // Clear any submission errors
          
          // Update experience only once
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
          
          // Notify other pages (like Progress) to refresh PvP stats immediately
          try {
            window.dispatchEvent(new Event('practiceSessionCompleted'));
          } catch {}
        }
      } else {
        // API returned success: false
        console.error('API returned success: false:', response.data);
        if (retryCount < maxRetries) {
          console.log(`Retrying submission (${retryCount + 1}/${maxRetries})...`);
          setTimeout(() => submitGameResults(retryCount + 1), 2000 * (retryCount + 1));
        } else {
          // Max retries reached, show error and allow manual retry
          setSubmissionError('Failed to submit results. Please try again.');
          setLoading(false);
        }
      }
    } catch (err: any) {
      console.error('Error submitting game results:', err);
      
      // Check if it's a 500 error or network error that we should retry
      const shouldRetry = (
        err?.response?.status === 500 || 
        err?.code === 'ERR_NETWORK' || 
        err?.code === 'ECONNABORTED' ||
        !err?.response?.status
      ) && retryCount < maxRetries;
      
      if (shouldRetry) {
        console.log(`Retrying submission due to error (${retryCount + 1}/${maxRetries})...`, err.message);
        setLoading(false); // Reset loading to allow retry
        setTimeout(() => submitGameResults(retryCount + 1), 2000 * (retryCount + 1));
      } else {
        // Max retries reached or non-retryable error
        console.error('Max retries reached or non-retryable error:', err);
        setSubmissionError(`Failed to submit results: ${err?.response?.data?.message || err?.message || 'Unknown error'}. Please try again.`);
        setLoading(false);
        
        // If it's a 500 error and we've exhausted retries, try to get results anyway
        if (err?.response?.status === 500) {
          console.log('Attempting to get game results despite submission error...');
          try {
            const resultResponse = await getPVPGameResult(roomId, authToken);
            if (resultResponse.data.success && resultResponse.data.data) {
              const result = resultResponse.data.data;
              setGameResult(result);
              setGameEnded(true);
              setWaitingForOthers(false);
              setLoading(false);
              
              // Update experience
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
          } catch (resultErr) {
            console.error('Failed to get results after submission error:', resultErr);
          }
        }
      }
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
    // Motivational quotes
    const winnerQuotes = [
      "Success is not the key to happiness. Happiness is the key to success.",
      "Victory is sweetest when you've known defeat.",
      "Great job! Every win is a step forward.",
      "Champions keep playing until they get it right.",
      "You did it! Keep pushing your limits."
    ];
    const loserQuotes = [
      "Failure is simply the opportunity to begin again, this time more intelligently.",
      "Don't let a loss define you. Let it motivate you.",
      "Every defeat is a lesson. Learn and come back stronger.",
      "Losing is not the opposite of winning, it's part of winning.",
      "Mistakes are proof that you are trying."
    ];
    const drawQuotes = [
      "A draw is a sign of equal strength. Well played!",
      "Sometimes, the journey is the reward.",
      "Both sides showed great skill!",
      "A tie means both gave their best."
    ];
    function getRandomQuote(type: 'winner' | 'loser' | 'draw') {
      if (type === 'winner') return winnerQuotes[Math.floor(Math.random() * winnerQuotes.length)];
      if (type === 'loser') return loserQuotes[Math.floor(Math.random() * loserQuotes.length)];
      return drawQuotes[Math.floor(Math.random() * drawQuotes.length)];
    }

    const isWinner = !!gameResult.is_winner;
    const isDraw = !!gameResult.is_draw;
    const isLoser = !isWinner && !isDraw;
    const quote = getRandomQuote(isWinner ? 'winner' : isDraw ? 'draw' : 'loser');

    return (
      <div className={`min-h-screen flex items-center justify-center ${isWinner ? 'bg-gradient-to-br from-green-100 via-green-300 to-green-100' : isLoser ? 'bg-gradient-to-br from-red-900 via-red-800 to-red-900' : 'bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900'}`}>
        <div className="w-full max-w-2xl px-4 py-8 space-y-8">
          <div className="flex flex-col items-center justify-center">
            <div className={`text-8xl mb-4 ${isWinner ? 'text-green-600' : isLoser ? 'text-red-400' : 'text-yellow-400'}`}>{gameResult.is_winner ? '🏆' : gameResult.is_draw ? '🤝' : '😔'}</div>
            <h1 className={`text-5xl font-bold mb-2 ${isWinner ? 'text-green-700' : isLoser ? 'text-red-500' : 'text-yellow-500'}`}>{gameResult.is_winner ? 'Victory!' : gameResult.is_draw ? 'Draw!' : 'Defeat'}</h1>
            <p className="text-xl mb-4 font-semibold text-gray-900 dark:text-white">
              {gameResult.is_winner ? 'Congratulations! You won!' : gameResult.is_draw ? 'It\'s a tie!' : 'Better luck next time!'}
            </p>
            <p className={`text-lg italic font-medium mb-6 ${isWinner ? 'text-green-700' : isLoser ? 'text-red-300' : 'text-yellow-700'}`}>{quote}</p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-center">
            <div className={`p-6 rounded-2xl border-2 ${isWinner ? 'border-green-400' : isLoser ? 'border-red-400' : 'border-yellow-400'} bg-black/80 shadow-md`}>
              <div className="text-gray-700 font-bold text-lg mb-2">Your Score</div>
              <div className={`text-4xl font-black ${isWinner ? 'text-green-700' : isLoser ? 'text-red-700' : 'text-yellow-700'}`}>{score}</div>
            </div>
            <div className={`p-6 rounded-2xl border-2 ${isWinner ? 'border-green-400' : isLoser ? 'border-red-400' : 'border-yellow-400'} bg-black/80 shadow-md`}>
              <div className="text-gray-700 font-bold text-lg mb-2">Correct Answers</div>
              <div className={`text-4xl font-black ${isWinner ? 'text-green-700' : isLoser ? 'text-red-700' : 'text-yellow-700'}`}>{correctAnswers}/{gameData?.total_questions}</div>
            </div>
            <div className={`p-6 rounded-2xl border-2 ${isWinner ? 'border-green-400' : isLoser ? 'border-red-400' : 'border-yellow-400'} bg-black/20 shadow-md`}>
              <div className="text-gray-700 font-bold text-lg mb-2">Experience Gained</div>
              <div className={`text-4xl font-black ${isWinner ? 'text-green-700' : isLoser ? 'text-red-700' : 'text-yellow-700'}`}>+{(() => {
                if (gameResult.is_draw) {
                  return 20;
                } else if (gameResult.is_winner) {
                  return 50;
                } else {
                  return 10;
                }
              })()} XP</div>
            </div>
          </div>

          {gameResult.winner_name && (
            <div className={`p-4 rounded-2xl border-2 mb-8 ${isWinner ? 'border-green-400 bg-green-50' : isLoser ? 'border-red-400 bg-red-50' : 'border-yellow-400 bg-yellow-50'} text-center`}>
              <div className="text-xl font-bold">
                Winner: <span className="font-bold text-2xl">{gameResult.winner_name}</span>
              </div>
            </div>
          )}

          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <button
              onClick={() => navigate('/student/pvp')}
              className={`px-8 py-4 rounded-2xl font-bold text-xl transition-all duration-300 shadow-lg border ${isWinner ? 'bg-green-500 text-white border-green-600 hover:bg-green-600' : isLoser ? 'bg-red-500 text-white border-red-600 hover:bg-red-600' : 'bg-yellow-400 text-black border-yellow-500 hover:bg-yellow-500'}`}
            >
              Back to PvP
            </button>
            <button
              onClick={() => navigate('/student/pvp')}
              className={`px-8 py-4 rounded-2xl font-bold text-xl transition-all duration-300 shadow-lg border ${isWinner ? 'bg-green-100 text-green-700 border-green-400 hover:bg-green-200' : isLoser ? 'bg-red-100 text-red-700 border-red-400 hover:bg-red-200' : 'bg-yellow-100 text-yellow-700 border-yellow-400 hover:bg-yellow-200'}`}
            >
              Play Again
            </button>
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
    <div className="min-h-screen flex items-center justify-center" style={{ backgroundColor: '#000000' }}>
      <div className="px-4 tablet:p-6 desktop:px-12 space-y-6 w-full max-w-4xl" style={{ backgroundColor: '#000000' }}>
        {/* Game Header */}
        <div className="transition-colors text-white p-4 tablet:p-6 rounded-2xl shadow-2xl shadow-black/50 relative overflow-hidden" style={{ backgroundColor: '#161618' }}>
          <div className="relative z-10">
            <div className="flex justify-between items-center mb-4">
              <div className="flex items-center gap-4">
                <div className="bg-gold text-black px-4 py-2 rounded-full font-bold text-lg">
                  {score}
                </div>
                <div className="text-white font-semibold">
                  {(() => {
                    const topIndex = gameData?.game_mode === 'flashcards' ? currentFlashcardIndex : currentQuestionIndex;
                    const topTotal = gameData?.game_mode === 'flashcards' ? quizQuestions.length : (gameData?.total_questions || 0);
                    return `Question ${topIndex + 1} of ${topTotal}`;
                  })()}
                </div>
              </div>
              {/* Only show timer for timed modes */}
              {gameData?.game_mode === 'timeattack' && gameData?.time_per_question > 0 ? (
                <div className="flex items-center gap-2 bg-gold text-black px-4 py-2 rounded-full">
                  <AiOutlineClockCircle className="text-xl" />
                  <span className="text-2xl font-bold">{timeLeft}s</span>
                </div>
              ) : (gameData?.game_mode !== 'flashcards' && gameData?.game_mode !== 'norushmastery' && gameData?.game_mode !== 'custom' && gameData?.time_per_question > 0) ? (
                <div className="flex items-center gap-2 bg-gold text-black px-4 py-2 rounded-full">
                  <AiOutlineClockCircle className="text-xl" />
                  <span className="text-2xl font-bold">{Math.floor(gameTimeLeft / 60)}:{(gameTimeLeft % 60).toString().padStart(2, '0')}</span>
                </div>
              ) : null}
            </div>
            
            {/* Progress Bar */}
            <div className="w-full bg-gray-700 rounded-full h-3">
              <div 
                className="bg-gold h-3 rounded-full transition-all duration-300"
                style={{ width: `${((currentQuestionIndex + 1) / (gameData?.total_questions || 1)) * 100}%` }}
              ></div>
            </div>
          </div>
        </div>

        {/* Question Card - Use Practice Mode Components */}
        <div className="flex justify-center">
          <div className="w-full max-w-4xl">
            {gameData?.game_mode === 'flashcards' ? (
              <>
                {/* FlashCardBox with Practice Mode Structure */}
                <div className="tablet:px-4">
                  <FlashCardBox
                    speed={gameData?.room_settings?.flashcard_speed || 2500}
                    quizQuestion={quizQuestions[currentFlashcardIndex]}
                    answer={currentFlashcardAnswer}
                    setAnswer={setCurrentFlashcardAnswer}
                    setDisabled={setIsFlashcardNextDisabled}
                    submitAnswer={answerFlashcardQuestion}
                    audioMode={gameData?.room_settings?.audioMode || false}
                    showQuestion={gameData?.room_settings?.showQuestion !== false}
                    audioPace={gameData?.room_settings?.audioPace || 'normal'}
                  />
                </div>

              </>
            ) : (
              <QuizBox
                quizQuestion={{
                  questionId: currentQuestion?.question_id || 0,
                  question: {
                    numbers: currentQuestion?.operands || [],
                    operator: currentQuestion?.operator || '+'
                  }
                }}
                answer={userAnswer}
                setAnswer={setUserAnswer}
                setDisabled={() => {}}
                submitAnswer={handleAnswerSubmit}
                operation={(gameData?.operation as 'addition' | 'multiplication' | 'division') || 'addition'}
                includeDecimals={gameData?.room_settings?.includeDecimals || false}
                audioMode={gameData?.room_settings?.audioMode || false}
                showQuestion={gameData?.room_settings?.showQuestion !== false}
                audioPace={gameData?.room_settings?.audioPace || 'normal'}
              />
            )}
          </div>
        </div>

        {/* Action Buttons */}
        <div className="transition-colors text-white p-4 tablet:p-6 rounded-2xl shadow-2xl shadow-black/50 relative overflow-hidden" style={{ backgroundColor: '#161618' }}>
          <div className="relative z-10">
            {/* Submission Error Display */}
            {submissionError && (
              <div className="mb-4 p-4 bg-red-500/10 border border-red-400/50 rounded-xl text-red-200 text-center">
                <div className="mb-2">❌ {submissionError}</div>
                <button
                  onClick={() => submitGameResults()}
                  disabled={loading}
                  className="px-6 py-2 bg-red-500/20 hover:bg-red-500/30 text-red-200 rounded-lg transition-colors disabled:opacity-50"
                >
                  {loading ? 'Retrying...' : 'Retry Submission'}
                </button>
              </div>
            )}
            
            <div className="flex justify-center gap-4">
              {gameData?.game_mode === 'flashcards' ? (
                /* Flashcard Mode Buttons - Practice Mode Style */
                <>
                  <button
                    onClick={skipFlashcardQuestion}
                    disabled={loading || currentFlashcardIndex + 1 === quizQuestions.length}
                    className="px-8 py-3 rounded-xl font-bold text-lg transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
                    style={{ backgroundColor: '#212124', color: '#ffffff' }}
                  >
                    Skip
                  </button>
                  
                  {currentFlashcardIndex + 1 === quizQuestions.length ? (
                    <button
                      onClick={answerFlashcardQuestion}
                      disabled={loading}
                      className="px-8 py-3 rounded-xl font-bold text-lg transition-all duration-300 disabled:opacity-50"
                      style={{ backgroundColor: '#ffba08', color: '#000000' }}
                    >
                      {loading ? 'Submitting...' : 'Submit'}
                    </button>
                  ) : (
                    <button
                      onClick={answerFlashcardQuestion}
                      disabled={loading || isFlashcardNextDisabled}
                      className="px-8 py-3 rounded-xl font-bold text-lg transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
                      style={{ backgroundColor: '#ffba08', color: '#000000' }}
                    >
                      Next
                    </button>
                  )}
                </>
              ) : (
                /* Regular Mode Buttons */
                <>
                  <button
                    onClick={() => {
                      if (loading) return; // Prevent multiple clicks
                      setUserAnswer('');
                      console.log(`🎮 SKIP BUTTON: Current question: ${currentQuestionIndex + 1}, Total questions: ${gameData?.total_questions}`);
                      // Move to next question without submitting
                      if (currentQuestionIndex < (gameData?.total_questions || 1) - 1) {
                        console.log('🎮 Skip - Moving to next question');
                        setCurrentQuestionIndex(currentQuestionIndex + 1);
                        setTimeLeft(gameData?.time_per_question || 30);
                      } else {
                        // Last question - submit with empty answer
                        console.log('🎮 Skip - Last question, submitting');
                        handleAnswerSubmit();
                      }
                    }}
                    disabled={loading}
                    className="px-8 py-3 rounded-xl font-bold text-lg transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
                    style={{ backgroundColor: '#212124', color: '#ffffff' }}
                  >
                    Skip
                  </button>
                  
                  <button
                    onClick={async () => {
                      await handleAnswerSubmit(false);
                    }}
                    disabled={loading}
                    className="px-8 py-3 rounded-xl font-bold text-lg transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
                    style={{ backgroundColor: '#ffba08', color: '#000000' }}
                  >
                    {loading ? 'Submitting...' : (currentQuestionIndex >= (gameData?.total_questions || 1) - 1) ? 'Submit' : 'Next'}
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