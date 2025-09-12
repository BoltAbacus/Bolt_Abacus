import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface Todo {
  id: number;
  text: string;
  completed: boolean;
  createdAt: Date;
}

interface TodoState {
  todos: Todo[];
  addTodo: (text: string) => void;
  toggleTodo: (id: number) => void;
  deleteTodo: (id: number) => void;
  clearCompleted: () => void;
  getCompletedCount: () => number;
  getTotalCount: () => number;
}

export const useTodoStore = create<TodoState>()(
  persist(
    (set, get) => ({
      todos: [
        {
          id: 1,
          text: 'Complete Lightning Realm quiz',
          completed: false,
          createdAt: new Date(),
        },
        {
          id: 2,
          text: 'Practice addition for 30 minutes',
          completed: false,
          createdAt: new Date(),
        },
        {
          id: 3,
          text: "Review yesterday's lessons",
          completed: true,
          createdAt: new Date(),
        },
      ],

      addTodo: (text: string) => {
        const { todos } = get();
        const newTodo: Todo = {
          id: Date.now(),
          text: text.trim(),
          completed: false,
          createdAt: new Date(),
        };
        set({ todos: [...todos, newTodo] });
      },

      toggleTodo: (id: number) => {
        const { todos } = get();
        set({
          todos: todos.map((todo) =>
            todo.id === id ? { ...todo, completed: !todo.completed } : todo
          ),
        });
      },

      deleteTodo: (id: number) => {
        const { todos } = get();
        set({ todos: todos.filter((todo) => todo.id !== id) });
      },

      clearCompleted: () => {
        const { todos } = get();
        set({ todos: todos.filter((todo) => !todo.completed) });
      },

      getCompletedCount: () => {
        const { todos } = get();
        return todos.filter((todo) => todo.completed).length;
      },

      getTotalCount: () => {
        const { todos } = get();
        return todos.length;
      },
    }),
    {
      name: 'todo-storage',
      partialize: (state) => ({ todos: state.todos }),
    }
  )
);