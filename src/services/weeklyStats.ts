import axios from '@helpers/axios';
import { GET_WEEKLY_STATS_ENDPOINT } from '@constants/routes';

export interface WeeklyStatsData {
  sessions: number;
  accuracy: number;
  time_spent_hours: number;
  time_spent_minutes: number;
  time_spent_formatted: string;
  problems_solved: number;
}

export interface WeeklyStatsResponse {
  success: boolean;
  data: WeeklyStatsData;
}

export const getWeeklyStats = async (
  token: string
): Promise<WeeklyStatsResponse> => {
  const response = await axios.post(
    GET_WEEKLY_STATS_ENDPOINT,
    {},
    {
      headers: { 'AUTH-TOKEN': token },
    }
  );
  return response.data;
};
