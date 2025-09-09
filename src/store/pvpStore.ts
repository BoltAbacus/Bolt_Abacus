import { create } from 'zustand';
import { 
  createPVPRoom, 
  joinPVPRoom, 
  getPVPRoomDetails, 
  setPlayerReady, 
  startPVPGame,
  submitPVPGameResult,
  getPVPGameResult,
  updatePlayerProgress,
  getPVPLeaderboard,
  PVPRoom,
  PVPRoomSettings,
  PVPGameSession,
  PVPGameResult,
  PVPAnswer
} from '@services/pvp';

interface PVPStore {
  // Room State
  currentRoom: PVPRoom | null;
  roomLoading: boolean;
  roomError: string | null;
  
  // Game State
  gameSession: PVPGameSession | null;
  gameLoading: boolean;
  gameError: string | null;
  
  // Player State
  isReady: boolean;
  playerAnswers: PVPAnswer[];
  currentQuestion: number;
  timeRemaining: number;
  
  // Results State
  gameResult: PVPGameResult | null;
  resultLoading: boolean;
  resultError: string | null;
  
  // Leaderboard State
  leaderboard: any[];
  leaderboardLoading: boolean;
  leaderboardError: string | null;
  
  // Actions
  createRoom: (settings: PVPRoomSettings, token: string) => Promise<void>;
  joinRoom: (roomId: string, token: string) => Promise<void>;
  getRoomDetails: (roomId: string, token: string) => Promise<void>;
  toggleReady: (roomId: string, token: string) => Promise<void>;
  startGame: (roomId: string, token: string) => Promise<void>;
  submitAnswer: (roomId: string, questionId: number, answer: number, timeTaken: number, token: string) => Promise<void>;
  finishGame: (roomId: string, totalTime: number, token: string) => Promise<void>;
  getGameResult: (roomId: string, token: string) => Promise<void>;
  getLeaderboard: (token: string) => Promise<void>;
  
  // Utility Actions
  setCurrentQuestion: (question: number) => void;
  setTimeRemaining: (time: number) => void;
  addAnswer: (answer: PVPAnswer) => void;
  clearRoom: () => void;
  clearGame: () => void;
  clearResult: () => void;
}

export const usePVPStore = create<PVPStore>((set, get) => ({
  // Initial State
  currentRoom: null,
  roomLoading: false,
  roomError: null,
  
  gameSession: null,
  gameLoading: false,
  gameError: null,
  
  isReady: false,
  playerAnswers: [],
  currentQuestion: 0,
  timeRemaining: 0,
  
  gameResult: null,
  resultLoading: false,
  resultError: null,
  
  leaderboard: [],
  leaderboardLoading: false,
  leaderboardError: null,
  
  // Actions
  createRoom: async (settings: PVPRoomSettings, token: string) => {
    set({ roomLoading: true, roomError: null });
    try {
      const response = await createPVPRoom(settings, token);
      if (response.status === 200) {
        set({ 
          currentRoom: response.data.room,
          roomLoading: false 
        });
      }
    } catch (error: any) {
      set({ 
        roomError: error.response?.data?.message || 'Failed to create room',
        roomLoading: false 
      });
    }
  },
  
  joinRoom: async (roomId: string, token: string) => {
    set({ roomLoading: true, roomError: null });
    try {
      const response = await joinPVPRoom(roomId, token);
      if (response.status === 200) {
        set({ 
          currentRoom: response.data.room,
          roomLoading: false 
        });
      }
    } catch (error: any) {
      set({ 
        roomError: error.response?.data?.message || 'Failed to join room',
        roomLoading: false 
      });
    }
  },
  
  getRoomDetails: async (roomId: string, token: string) => {
    set({ roomLoading: true, roomError: null });
    try {
      const response = await getPVPRoomDetails(roomId, token);
      if (response.status === 200) {
        set({ 
          currentRoom: response.data.room,
          roomLoading: false 
        });
      }
    } catch (error: any) {
      set({ 
        roomError: error.response?.data?.message || 'Failed to get room details',
        roomLoading: false 
      });
    }
  },
  
  toggleReady: async (roomId: string, token: string) => {
    const { isReady } = get();
    try {
      const response = await setPlayerReady(roomId, !isReady, token);
      if (response.status === 200) {
        set({ isReady: !isReady });
      }
    } catch (error: any) {
      console.error('Failed to toggle ready status:', error);
    }
  },
  
  startGame: async (roomId: string, token: string) => {
    set({ gameLoading: true, gameError: null });
    try {
      const response = await startPVPGame(roomId, token);
      if (response.status === 200) {
        set({ 
          gameSession: response.data.session,
          gameLoading: false 
        });
      }
    } catch (error: any) {
      set({ 
        gameError: error.response?.data?.message || 'Failed to start game',
        gameLoading: false 
      });
    }
  },
  
  submitAnswer: async (roomId: string, questionId: number, answer: number, timeTaken: number, token: string) => {
    try {
      await updatePlayerProgress(roomId, questionId, answer, timeTaken, token);
      
      // Add answer to local state
      const { playerAnswers } = get();
      const newAnswer: PVPAnswer = {
        questionId,
        answer,
        timeTaken,
        isCorrect: false // This will be determined by the backend
      };
      
      set({ 
        playerAnswers: [...playerAnswers, newAnswer],
        currentQuestion: get().currentQuestion + 1
      });
    } catch (error: any) {
      console.error('Failed to submit answer:', error);
    }
  },
  
  finishGame: async (roomId: string, totalTime: number, token: string) => {
    set({ resultLoading: true, resultError: null });
    try {
      const { playerAnswers } = get();
      const response = await submitPVPGameResult(roomId, playerAnswers, totalTime, token);
      if (response.status === 200) {
        set({ 
          gameResult: response.data.result,
          resultLoading: false 
        });
      }
    } catch (error: any) {
      set({ 
        resultError: error.response?.data?.message || 'Failed to finish game',
        resultLoading: false 
      });
    }
  },
  
  getGameResult: async (roomId: string, token: string) => {
    set({ resultLoading: true, resultError: null });
    try {
      const response = await getPVPGameResult(roomId, token);
      if (response.status === 200) {
        set({ 
          gameResult: response.data.result,
          resultLoading: false 
        });
      }
    } catch (error: any) {
      set({ 
        resultError: error.response?.data?.message || 'Failed to get game result',
        resultLoading: false 
      });
    }
  },
  
  getLeaderboard: async (token: string) => {
    set({ leaderboardLoading: true, leaderboardError: null });
    try {
      const response = await getPVPLeaderboard(token);
      if (response.status === 200) {
        set({ 
          leaderboard: response.data.leaderboard,
          leaderboardLoading: false 
        });
      }
    } catch (error: any) {
      set({ 
        leaderboardError: error.response?.data?.message || 'Failed to get leaderboard',
        leaderboardLoading: false 
      });
    }
  },
  
  // Utility Actions
  setCurrentQuestion: (question: number) => {
    set({ currentQuestion: question });
  },
  
  setTimeRemaining: (time: number) => {
    set({ timeRemaining: time });
  },
  
  addAnswer: (answer: PVPAnswer) => {
    const { playerAnswers } = get();
    set({ playerAnswers: [...playerAnswers, answer] });
  },
  
  clearRoom: () => {
    set({ 
      currentRoom: null, 
      roomError: null,
      isReady: false 
    });
  },
  
  clearGame: () => {
    set({ 
      gameSession: null, 
      gameError: null,
      playerAnswers: [],
      currentQuestion: 0,
      timeRemaining: 0 
    });
  },
  
  clearResult: () => {
    set({ 
      gameResult: null, 
      resultError: null 
    });
  }
}));
