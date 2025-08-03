import { FC, useState } from 'react';
import { AiOutlinePlus, AiOutlineDelete } from 'react-icons/ai';
import { useTodoStore } from '@store/todoStore';

export interface TodoListSectionProps {
  className?: string;
}

const TodoListSection: FC<TodoListSectionProps> = ({ className = '' }) => {
  const { todos, addTodo, toggleTodo, deleteTodo, getCompletedCount, getTotalCount } = useTodoStore();
  const [newTodo, setNewTodo] = useState('');

  const handleAddTodo = () => {
    if (newTodo.trim()) {
      addTodo(newTodo.trim());
      setNewTodo('');
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleAddTodo();
    }
  };

  return (
    <div className={`text-white ${className}`}>
      <h2 className="text-xl font-bold mb-4">Todo List</h2>
      
      {/* Add new todo */}
      <div className="flex space-x-2 mb-4">
        <input
          type="text"
          value={newTodo}
          onChange={(e) => setNewTodo(e.target.value)}
          onKeyPress={handleKeyPress}
          placeholder="Add a new task..."
          className="flex-1 bg-gray-800 text-white px-3 py-2 rounded-lg border border-gray-600 focus:outline-none focus:border-blue-500"
        />
        <button
          onClick={handleAddTodo}
          className="bg-blue-600 hover:bg-blue-700 text-white px-3 py-2 rounded-lg transition-colors"
        >
          <AiOutlinePlus size={16} />
        </button>
      </div>
      
      {/* Todo list */}
      <div className="space-y-2 max-h-48 overflow-y-auto">
        {todos.map((todo) => (
          <div key={todo.id} className="flex items-center space-x-3 p-2 hover:bg-gray-800 rounded-lg">
            <input
              type="checkbox"
              checked={todo.completed}
              onChange={() => toggleTodo(todo.id)}
              className="w-4 h-4 text-blue-600 bg-gray-800 border-gray-600 rounded focus:ring-blue-500"
            />
            <span className={`flex-1 text-sm ${todo.completed ? 'line-through text-gray-400' : 'text-gray-200'}`}>
              {todo.text}
            </span>
            <button
              onClick={() => deleteTodo(todo.id)}
              className="text-red-400 hover:text-red-300 transition-colors"
            >
              <AiOutlineDelete size={14} />
            </button>
          </div>
        ))}
      </div>
      
      {/* Summary */}
      <div className="mt-4 pt-4 border-t border-gray-700">
        <p className="text-sm text-gray-400">
          {getCompletedCount()} of {getTotalCount()} tasks completed
        </p>
      </div>
    </div>
  );
};

export default TodoListSection; 