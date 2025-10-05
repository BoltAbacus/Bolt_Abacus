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
  // Scheduling fields
  due_date?: string;
  scheduled_date?: string;
  scheduled_time?: string;
  frequency?: 'once' | 'daily' | 'weekly' | 'monthly';
  reminder_enabled?: boolean;
  reminder_time?: string;
  is_overdue?: boolean;
  is_due_today?: boolean;
  days_until_due?: number;
  created_at?: string;
  updated_at?: string;
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
  description?: string,
  schedulingOptions?: any
): Promise<unknown> => {
  // console.log('[API] Starting addPersonalGoal request...');
  // console.log(' [API] Title:', title);
  // console.log('[API] Description:', description);
  // console.log(' [API] Scheduling options:', schedulingOptions);
  
  const requestData: any = {
    title,
    description: description || '',
  };

  // Add scheduling options if provided
  if (schedulingOptions) {
    if (schedulingOptions.priority) requestData.priority = schedulingOptions.priority;
    if (schedulingOptions.goalType) requestData.goal_type = schedulingOptions.goalType;
    if (schedulingOptions.dueDate) requestData.due_date = schedulingOptions.dueDate;
    // Handle both snake_case and camelCase for flexibility
    if (schedulingOptions.scheduled_date || schedulingOptions.scheduledDate) {
      requestData.scheduled_date = schedulingOptions.scheduled_date || schedulingOptions.scheduledDate;
    }
    if (schedulingOptions.scheduled_time || schedulingOptions.scheduledTime) {
      requestData.scheduled_time = schedulingOptions.scheduled_time || schedulingOptions.scheduledTime;
    }
    if (schedulingOptions.frequency) requestData.frequency = schedulingOptions.frequency;
    if (schedulingOptions.reminderEnabled !== undefined) requestData.reminder_enabled = schedulingOptions.reminderEnabled;
    if (schedulingOptions.reminderTime) requestData.reminder_time = schedulingOptions.reminderTime;
  }

  console.log('🌐 [API] Final request data:', requestData);

  const response = await axios.post(
    ADD_PERSONAL_GOAL_ENDPOINT,
    requestData,
    {
      headers: { 'AUTH-TOKEN': token },
    }
  );
  
  console.log('🌐 [API] Response received:', response.data);
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

export const togglePersonalGoal = async (
  token: string,
  goalId: string
): Promise<unknown> => {
  console.log('🌐 [API] Starting togglePersonalGoal request...');
  console.log('🌐 [API] Goal ID:', goalId);
  
  const response = await axios.post(
    '/togglePersonalGoal/',
    {
      goal_id: goalId,
    },
    {
      headers: { 'AUTH-TOKEN': token },
    }
  );
  
  console.log('🌐 [API] Toggle response received:', response.data);
  return response.data;
};