import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { getUserTodoList, addPersonalGoal, removePersonalGoal, TodoListData, TodoItem } from '@services/todoList';
import { useAuthStore } from './authStore';

interface TodoListState {
  todos: TodoItem[];
  total_todos: number;
  completed_todos: number;
  pending_todos: number;
  isLoading: boolean;
  error: string | null;
  
  // Actions
  fetchTodoList: () => Promise<void>;
  setTodoList: (todoData: TodoListData) => void;
  addPersonalGoal: (title: string, description?: string) => Promise<void>;
  removePersonalGoal: (goalId: string) => Promise<void>;
  clearError: () => void;
}

export const useTodoListStore = create<TodoListState>()(
  persist(
    (set, get) => ({
      todos: [],
      total_todos: 0,
      completed_todos: 0,
      pending_todos: 0,
      isLoading: false,
      error: null,

      fetchTodoList: async () => {
        const authToken = useAuthStore.getState().authToken;
        if (!authToken) {
          set({ error: 'No authentication token' });
          return;
        }

        set({ isLoading: true, error: null });
        try {
          const response = await getUserTodoList(authToken);
          if (response.success) {
            set({
              todos: response.data.todos,
              total_todos: response.data.total_todos,
              completed_todos: response.data.completed_todos,
              pending_todos: response.data.pending_todos,
              isLoading: false,
              error: null,
            });
          } else {
            set({
              isLoading: false,
              error: 'Failed to fetch todo list',
            });
          }
        } catch (error) {
          console.error('Error fetching todo list:', error);
          set({
            isLoading: false,
            error: error instanceof Error ? error.message : 'Failed to fetch todo list',
          });
        }
      },

      setTodoList: (todoData: TodoListData) => {
        set({
          todos: todoData.todos,
          total_todos: todoData.total_todos,
          completed_todos: todoData.completed_todos,
          pending_todos: todoData.pending_todos,
        });
      },

      addPersonalGoal: async (title: string, description?: string) => {
        const authToken = useAuthStore.getState().authToken;
        if (!authToken) {
          set({ error: 'No authentication token' });
          return;
        }

        set({ isLoading: true, error: null });
        try {
          const response = await addPersonalGoal(authToken, title, description);
          if (response.success) {
            // Refresh the todo list after adding
            await get().fetchTodoList();
          } else {
            set({
              isLoading: false,
              error: 'Failed to add personal goal',
            });
          }
        } catch (error) {
          console.error('Error adding personal goal:', error);
          set({
            isLoading: false,
            error: error instanceof Error ? error.message : 'Failed to add personal goal',
          });
        }
      },

      removePersonalGoal: async (goalId: string) => {
        const authToken = useAuthStore.getState().authToken;
        if (!authToken) {
          set({ error: 'No authentication token' });
          return;
        }

        set({ isLoading: true, error: null });
        try {
          const response = await removePersonalGoal(authToken, goalId);
          if (response.success) {
            // Refresh the todo list after removing
            await get().fetchTodoList();
          } else {
            set({
              isLoading: false,
              error: 'Failed to remove personal goal',
            });
          }
        } catch (error) {
          console.error('Error removing personal goal:', error);
          set({
            isLoading: false,
            error: error instanceof Error ? error.message : 'Failed to remove personal goal',
          });
        }
      },

      clearError: () => {
        set({ error: null });
      },
    }),
    {
      name: 'todo-list-storage',
      partialize: (state) => ({
        todos: state.todos,
        total_todos: state.total_todos,
        completed_todos: state.completed_todos,
        pending_todos: state.pending_todos,
      }),
    }
  )
);
