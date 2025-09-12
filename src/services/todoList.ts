import axios from '@helpers/axios';
import {
  GET_USER_TODO_LIST_ENDPOINT,
  ADD_PERSONAL_GOAL_ENDPOINT,
  REMOVE_PERSONAL_GOAL_ENDPOINT,
} from '@constants/routes';

export interface TodoItem {
  id: string;
  title: string;
  description: string;
  completed: boolean;
  priority: 'high' | 'medium' | 'low';
  type: 'practice' | 'streak' | 'level' | 'pvp' | 'personal';
}

export interface TodoListData {
  todos: TodoItem[];
  total_todos: number;
  completed_todos: number;
  pending_todos: number;
}

export interface TodoListResponse {
  success: boolean;
  data: TodoListData;
}

export const getUserTodoList = async (
  token: string
): Promise<TodoListResponse> => {
  const response = await axios.post(
    GET_USER_TODO_LIST_ENDPOINT,
    {},
    {
      headers: { 'AUTH-TOKEN': token },
    }
  );
  return response.data;
};

export const addPersonalGoal = async (
  token: string,
  title: string,
  description?: string
): Promise<unknown> => {
  const response = await axios.post(
    ADD_PERSONAL_GOAL_ENDPOINT,
    {
      title,
      description: description || '',
    },
    {
      headers: { 'AUTH-TOKEN': token },
    }
  );
  return response.data;
};

export const removePersonalGoal = async (
  token: string,
  goalId: string
): Promise<unknown> => {
  const response = await axios.post(
    REMOVE_PERSONAL_GOAL_ENDPOINT,
    {
      goal_id: goalId,
    },
    {
      headers: { 'AUTH-TOKEN': token },
    }
  );
  return response.data;
};
