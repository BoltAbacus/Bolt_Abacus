import axios from '@helpers/axios';
import { GET_USER_EXPERIENCE_ENDPOINT } from '@constants/routes';

export interface ExperienceData {
  user_id: string;
  experience_points: number;
  level: number;
  xp_to_next_level: number;
}

export interface ExperienceResponse {
  success: boolean;
  data: ExperienceData;
}

export const getUserExperience = async (
  token: string
): Promise<ExperienceResponse> => {
  const response = await axios.post(
    GET_USER_EXPERIENCE_ENDPOINT,
    {},
    {
      headers: { 'AUTH-TOKEN': token },
    }
  );
  return response.data;
};
