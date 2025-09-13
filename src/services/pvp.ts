import axios from '@helpers/axios';

import {
  CREATE_PVP_ROOM_ENDPOINT,
  JOIN_PVP_ROOM_ENDPOINT,
  GET_PVP_ROOM_DETAILS_ENDPOINT,
  SET_PLAYER_READY_ENDPOINT,
  START_PVP_GAME_ENDPOINT,
  SUBMIT_PVP_GAME_RESULT_ENDPOINT,
  GET_PVP_GAME_RESULT_ENDPOINT,
  UPDATE_PLAYER_PROGRESS_ENDPOINT,
  GET_PVP_LEADERBOARD_ENDPOINT,
} from '@constants/routes';

// PVP Room Types
export interface PVPRoomSettings {
  max_players: number;
  number_of_questions: number;
  time_per_question: number;
  level_id?: number;
  class_id?: number;
  topic_id?: number;
  difficulty?: string;
  operation?: string;
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
}

export interface PVPRoom {
  room_id: string;
  creator: {
    userId: number;
    firstName: string;
    lastName: string;
  };
  max_players: number;
  current_players: number;
  number_of_questions: number;
  time_per_question: number;
  level_id?: number;
  class_id?: number;
  topic_id?: number;
  difficulty?: string;
  operation?: string;
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
  status: 'waiting' | 'ready' | 'playing' | 'finished';
  created_at: string;
  players: PVPRoomPlayer[];
}

export interface PVPRoomPlayer {
  player: {
    userId: number;
    firstName: string;
    lastName: string;
  };
  is_ready: boolean;
  score: number;
  correct_answers: number;
  total_time: number;
  status: 'waiting' | 'ready' | 'playing' | 'finished';
  joined_at: string;
}

export interface PVPGameSession {
  session_id: string;
  room: PVPRoom;
  current_question: number;
  total_questions: number;
  time_remaining: number;
  status: 'waiting' | 'countdown' | 'playing' | 'finished';
  questions: PVPQuestion[];
}

export interface PVPQuestion {
  questionId: number;
  question: string;
  correctAnswer: number;
  options?: number[];
  timeLimit: number;
}

export interface PVPAnswer {
  questionId: number;
  answer: number;
  timeTaken: number;
  isCorrect: boolean;
}

export interface PVPGameResult {
  room_id: string;
  winner: {
    userId: number;
    firstName: string;
    lastName: string;
    score: number;
    correct_answers: number;
    total_time: number;
  };
  players: PVPRoomPlayer[];
  game_summary: {
    total_questions: number;
    average_score: number;
    fastest_answer: number;
    most_correct: number;
  };
  experience_gained: number;
}

// API Functions
export const createPVPRoom = async (
  settings: PVPRoomSettings,
  token: string
) => {
  return axios.post(CREATE_PVP_ROOM_ENDPOINT, settings, {
    headers: { 'AUTH-TOKEN': token },
  });
};

export const joinPVPRoom = async (roomId: string, token: string) => {
  return axios.post(
    JOIN_PVP_ROOM_ENDPOINT,
    { room_code: roomId },
    {
      headers: { 'AUTH-TOKEN': token },
    }
  );
};

export const getPVPRoomDetails = async (roomId: string, token: string) => {
  return axios.post(
    GET_PVP_ROOM_DETAILS_ENDPOINT,
    { room_id: roomId },
    {
      headers: { 'AUTH-TOKEN': token },
    }
  );
};

export const setPlayerReady = async (
  roomId: string,
  isReady: boolean,
  token: string
) => {
  return axios.post(
    SET_PLAYER_READY_ENDPOINT,
    {
      room_id: roomId,
      is_ready: isReady,
    },
    {
      headers: { 'AUTH-TOKEN': token },
    }
  );
};

export const startPVPGame = async (roomId: string, token: string) => {
  return axios.post(
    START_PVP_GAME_ENDPOINT,
    { room_id: roomId },
    {
      headers: { 'AUTH-TOKEN': token },
    }
  );
};

export const submitPVPGameResult = async (
  roomId: string,
  score: number,
  correctAnswers: number,
  totalTime: number,
  token: string
) => {
  return axios.post(
    SUBMIT_PVP_GAME_RESULT_ENDPOINT,
    {
      room_id: roomId,
      score,
      correct_answers: correctAnswers,
      total_time: totalTime,
    },
    {
      headers: { 'AUTH-TOKEN': token },
    }
  );
};

export const getPVPGameQuestions = async (roomId: string, token: string) => {
  return axios.post(
    '/getPVPGameQuestions/',
    {
      room_id: roomId,
    },
    {
      headers: { 'AUTH-TOKEN': token },
    }
  );
};

export const getPVPGameResult = async (roomId: string, token: string) => {
  return axios.post(
    GET_PVP_GAME_RESULT_ENDPOINT,
    { room_id: roomId },
    {
      headers: { 'AUTH-TOKEN': token },
    }
  );
};

export const updatePlayerProgress = async (
  roomId: string,
  questionId: number,
  answer: number,
  timeTaken: number,
  token: string
) => {
  return axios.post(
    UPDATE_PLAYER_PROGRESS_ENDPOINT,
    {
      room_id: roomId,
      question_id: questionId,
      answer,
      time_taken: timeTaken,
    },
    {
      headers: { 'AUTH-TOKEN': token },
    }
  );
};

export const getPVPLeaderboard = async (token: string) => {
  return axios.post(
    GET_PVP_LEADERBOARD_ENDPOINT,
    {},
    {
      headers: { 'AUTH-TOKEN': token },
    }
  );
};
