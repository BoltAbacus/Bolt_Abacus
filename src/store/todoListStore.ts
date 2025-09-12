import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import {
  getUserTodoList,
  addPersonalGoal,
  removePersonalGoal,
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
  addPersonalGoal: (title: string, description?: string) => Promise<void>;
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
          // If we already have some todos in memory, don't disrupt UX with an error banner
          const { todos: existing } = get();
          set({
            isLoading: false,
            error:
              existing && existing.length > 0
                ? null
                : error instanceof Error
                  ? error.message
                  : 'Failed to fetch todo list',
          });
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

      addPersonalGoal: async (title: string, description?: string) => {
        const { authToken } = useAuthStore.getState();
        if (!authToken) {
          set({ error: 'No authentication token' });
          return;
        }

        // Optimistic insert
        const tempId = `temp-${Date.now()}`;
        const previousTodos = get().todos;
        set({
          todos: [
            {
              id: tempId,
              title,
              description: description || '',
              completed: false,
              priority: 'medium',
              type: 'personal' as const,
            },
            ...previousTodos,
          ],
          total_todos: get().total_todos + 1,
          pending_todos: get().pending_todos + 1,
          isLoading: true,
          error: null,
        });
        try {
          const response = await addPersonalGoal(authToken, title, description);
          if (response.success) {
            // Refresh the todo list after adding
            await get().fetchTodoList();
          } else {
            // Revert optimistic insert
            set({
              todos: previousTodos,
              total_todos: get().total_todos - 1,
              pending_todos: Math.max(0, get().pending_todos - 1),
              isLoading: false,
              error: 'Failed to add personal goal',
            });
          }
        } catch (error) {
          // Revert optimistic insert
          set({
            todos: previousTodos,
            total_todos: get().total_todos - 1,
            pending_todos: Math.max(0, get().pending_todos - 1),
            isLoading: false,
            error:
              error instanceof Error
                ? error.message
                : 'Failed to add personal goal',
          });
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
          const response = await removePersonalGoal(
            authToken,
            backendId || goalId
          );
          if (response.success) {
            // Try to refresh, but don't rollback if refresh fails
            try {
              await get().fetchTodoList();
            } catch (e) {
              set({ isLoading: false, error: null });
            }
          } else {
            set({
              todos: previousTodos,
              total_todos: previousTodos.length,
              completed_todos: previousTodos.filter((t) => t.completed).length,
              pending_todos: previousTodos.filter((t) => !t.completed).length,
              isLoading: false,
              error: 'Failed to remove personal goal',
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

      toggleComplete: (goalId: string) => {
        const updated = get().todos.map((t) =>
          t.id === goalId ? { ...t, completed: !t.completed } : t
        );
        const completed = updated.filter((t) => t.completed).length;
        set({
          todos: updated,
          completed_todos: completed,
          pending_todos: Math.max(0, updated.length - completed),
        });
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
