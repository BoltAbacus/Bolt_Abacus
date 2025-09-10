import axios from '@helpers/axios';
import {
  GET_USER_STREAK_ENDPOINT,
  UPDATE_USER_STREAK_ENDPOINT,
  RESET_USER_STREAK_ENDPOINT,
  GET_STREAK_BY_USER_ID_ENDPOINT,
} from '@constants/routes';

export interface StreakData {
  currentStreak: number;
  maxStreak: number;
  lastActivityDate: string | null;
  createdAt: string;
  updatedAt: string;
  streakCreated?: boolean;
}

export interface StreakUpdateResponse extends StreakData {
  streakUpdated: boolean;
  newStreak: number;
}

export interface StreakResetResponse extends StreakData {
  streakReset: boolean;
}

export const getUserStreak = async (token: string): Promise<StreakData> => {
  console.log('📡 [Streak Service] Making GET request to:', GET_USER_STREAK_ENDPOINT);
  const response = await axios.get(GET_USER_STREAK_ENDPOINT, {
    headers: {
      'AUTH-TOKEN': token,
    },
  });
  console.log('✅ [Streak Service] GET response received:', {
    status: response.status,
    data: response.data,
    timestamp: new Date().toISOString()
  });
  return response.data;
};

export const updateUserStreak = async (token: string): Promise<StreakUpdateResponse> => {
  console.log('📡 [Streak Service] Making POST request to:', UPDATE_USER_STREAK_ENDPOINT);
  const response = await axios.post(UPDATE_USER_STREAK_ENDPOINT, {}, {
    headers: {
      'AUTH-TOKEN': token,
    },
  });
  console.log('✅ [Streak Service] POST response received:', {
    status: response.status,
    data: response.data,
    timestamp: new Date().toISOString()
  });
  return response.data;
};

export const resetUserStreak = async (token: string): Promise<StreakResetResponse> => {
  console.log('📡 [Streak Service] Making POST request to:', RESET_USER_STREAK_ENDPOINT);
  const response = await axios.post(RESET_USER_STREAK_ENDPOINT, {}, {
    headers: {
      'AUTH-TOKEN': token,
    },
  });
  console.log('✅ [Streak Service] RESET response received:', {
    status: response.status,
    data: response.data,
    timestamp: new Date().toISOString()
  });
  return response.data;
};

export const getStreakByUserId = async (userId: number): Promise<StreakData> => {
  const response = await axios.post(
    GET_STREAK_BY_USER_ID_ENDPOINT,
    { userId },
  );
  return response.data;
};
