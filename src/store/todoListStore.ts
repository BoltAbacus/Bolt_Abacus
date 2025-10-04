import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import {
  getUserTodoList,
  addPersonalGoal as addPersonalGoalAPI,
  removePersonalGoal as removePersonalGoalAPI,
  togglePersonalGoal as togglePersonalGoalAPI,
  TodoListData,
  TodoItem,
} from '@services/todoList';
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
  addPersonalGoal: (title: string, description?: string, schedulingOptions?: any) => Promise<void>;
  removePersonalGoal: (goalId: string) => Promise<void>;
  toggleComplete: (goalId: string) => void;
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
        const { authToken } = useAuthStore.getState();
        if (!authToken) {
          set({ error: 'No authentication token' });
          return;
        }

        set({ isLoading: true, error: null });
        try {
          const response = await getUserTodoList(authToken);
          // console.log('🔄 [TodoStore] fetchTodoList response:', response);
          // console.log('🔄 [TodoStore] Response success:', response.success);
          // console.log('🔄 [TodoStore] Response data:', response.data);
          // console.log('🔄 [TodoStore] Todos array:', response.data?.todos);
          // console.log('🔄 [TodoStore] Todos count:', response.data?.todos?.length);
          
          if (response.success) {
            // console.log('🔄 [TodoStore] Todos received:', response.data.todos);
            set({
              todos: response.data.todos,
              total_todos: response.data.total_todos,
              completed_todos: response.data.completed_todos,
              pending_todos: response.data.pending_todos,
              isLoading: false,
              error: null,
            });
          } else {
            console.error('❌ [TodoStore] fetchTodoList failed:', response);
            set({
              isLoading: false,
              error: 'Failed to fetch todo list',
            });
          }
        } catch (error: any) {
          // stop infinite retry loops on server errors
          const { todos: existing } = get();
          const isServerError = error?.response?.status >= 500;
          
          set({
            isLoading: false,
            error: isServerError ? null : ( // silent fail on server errors
              existing && existing.length > 0
                ? null
                : error instanceof Error
                  ? error.message
                  : 'Failed to fetch todo list'
            ),
          });
          
          // log server errors but don't retry automatically
          if (isServerError) {
            console.warn('todo list api error, using cached data:', error.response?.status);
          }
        }
      },

      setTodoList: (todoData: TodoListData) => {
        set({
          todos: todoData.todos,
          total_todos: todoData.total_todos,
          completed_todos: todoData.completed_todos,
          pending_todos: todoData.pending_todos,
          error: null,
        });
      },

      addPersonalGoal: async (title: string, description?: string, schedulingOptions?: any) => {
        console.log('🎯 [TodoStore] Starting addPersonalGoal...');
        console.log('🎯 [TodoStore] Title:', title);
        console.log('🎯 [TodoStore] Description:', description);
        console.log('🎯 [TodoStore] Scheduling options:', schedulingOptions);
        
        const { authToken } = useAuthStore.getState();
        if (!authToken) {
          console.error('❌ [TodoStore] No authentication token');
          set({ error: 'No authentication token' });
          return;
        }

        console.log('🎯 [TodoStore] Auth token available, proceeding...');

        // No optimistic insert - wait for database response
        console.log('🎯 [TodoStore] Calling API to add goal to database...');
        set({ isLoading: true, error: null });
        
        try {
          const response = await addPersonalGoalAPI(authToken, title, description, schedulingOptions) as any;
          console.log('✅ [TodoStore] API response:', response);
          
          if (response?.success) {
            console.log('✅ [TodoStore] Goal added successfully to database');
            set({ isLoading: false, error: null });
            return response; // Return the response for component handling
          } else {
            console.error('❌ [TodoStore] API returned error:', response);
            set({
              isLoading: false,
              error: response?.message || 'Failed to add personal goal',
            });
            throw new Error(response?.message || 'Failed to add personal goal');
          }
        } catch (error) {
          console.error('❌ [TodoStore] API call failed:', error);
          set({
            isLoading: false,
            error:
              error instanceof Error
                ? error.message
                : 'Failed to add personal goal',
          });
          throw error; // Re-throw the error for component handling
        }
      },

      removePersonalGoal: async (goalId: string) => {
        const { authToken } = useAuthStore.getState();
        if (!authToken) {
          set({ error: 'No authentication token' });
          return;
        }
        
        // If this is a temp goal created via optimistic add, remove locally only
        if (goalId.startsWith('temp-')) {
          const filtered = get().todos.filter((t) => t.id !== goalId);
          const completed = filtered.filter((t) => t.completed).length;
          set({
            todos: filtered,
            total_todos: filtered.length,
            completed_todos: completed,
            pending_todos: Math.max(0, filtered.length - completed),
            isLoading: false,
            error: null,
          });
          return;
        }

        // Optimistic remove for persisted items
        const previousTodos = get().todos;
        const newTodos = previousTodos.filter((t) => t.id !== goalId);
        const newCompleted = newTodos.filter((t) => t.completed).length;
        set({
          todos: newTodos,
          total_todos: Math.max(0, get().total_todos - 1),
          completed_todos: newCompleted,
          pending_todos: Math.max(0, newTodos.length - newCompleted),
          isLoading: true,
          error: null,
        });
        
        try {
          // Backend expects numeric ID; coerce when possible
          const backendId = /^(\d+)$/.test(goalId)
            ? goalId
            : String(goalId).replace(/[^0-9]/g, '');
          const response = await removePersonalGoalAPI(
            authToken,
            backendId || goalId
          ) as any;
          
          if (response?.success) {
            console.log('✅ [TodoStore] Goal removed successfully, refreshing list...');
            // Try to refresh, but don't rollback if refresh fails
            try {
              await get().fetchTodoList();
            } catch (e) {
              console.warn('⚠️ [TodoStore] Refresh failed after remove, but keeping optimistic state');
              set({ isLoading: false, error: null });
            }
          } else {
            console.error('❌ [TodoStore] Remove API returned error:', response);
            set({
              todos: previousTodos,
              total_todos: previousTodos.length,
              completed_todos: previousTodos.filter((t) => t.completed).length,
              pending_todos: previousTodos.filter((t) => !t.completed).length,
              isLoading: false,
              error: response?.message || 'Failed to remove personal goal',
            });
          }
        } catch (error) {
          set({
            todos: previousTodos,
            total_todos: previousTodos.length,
            completed_todos: previousTodos.filter((t) => t.completed).length,
            pending_todos: previousTodos.filter((t) => !t.completed).length,
            isLoading: false,
            error:
              error instanceof Error
                ? error.message
                : 'Failed to remove personal goal',
          });
        }
      },

      toggleComplete: async (goalId: string) => {
        const { authToken } = useAuthStore.getState();
        if (!authToken) {
          set({ error: 'No authentication token' });
          return;
        }

        console.log('🎯 [TodoStore] Toggling completion for goal:', goalId);
        set({ isLoading: true, error: null });

        try {
          // Call API to toggle completion status
          const response = await togglePersonalGoalAPI(authToken, goalId);
          
          if ((response as any)?.success) {
            console.log('✅ [TodoStore] Goal completion toggled successfully');
            // Refresh the todo list to get updated data from database
            await get().fetchTodoList();
          } else {
            throw new Error((response as any)?.message || 'Failed to toggle completion');
          }
        } catch (error) {
          console.error('❌ [TodoStore] Failed to toggle completion:', error);
          set({
            isLoading: false,
            error: error instanceof Error ? error.message : 'Failed to toggle completion',
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