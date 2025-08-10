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
          className="flex-1 bg-[#080808]/80 hover:bg-[#191919] text-white px-3 py-2 rounded-lg border border-gold/40 ring-1 ring-white/5 focus:outline-none focus:border-gold/70 backdrop-blur-sm transition-colors"
        />
        <button
          onClick={handleAddTodo}
          className="bg-[#080808]/80 hover:bg-[#191919] text-white px-3 py-2 rounded-lg border border-gold/50 ring-1 ring-white/5 backdrop-blur-sm transition-colors"
        >
          <AiOutlinePlus size={16} />
        </button>
      </div>
      
      {/* Todo list */}
      <div className="space-y-2 max-h-48 overflow-y-auto">
        {todos.map((todo) => (
          <div key={todo.id} className="flex items-center space-x-3 p-2 bg-[#080808]/50 hover:bg-[#191919] rounded-lg border border-gold/20 ring-1 ring-white/5 backdrop-blur-sm transition-colors">
            <input
              type="checkbox"
              checked={todo.completed}
              onChange={() => toggleTodo(todo.id)}
              className="w-4 h-4 text-gold bg-[#080808] border-gold/40 rounded focus:ring-gold/50"
            />
            <span className={`flex-1 text-sm ${todo.completed ? 'line-through text-gray-400' : 'text-gray-200'}`}>
              {todo.text}
            </span>
            <button
              onClick={() => deleteTodo(todo.id)}
              className="text-red hover:text-red/80 transition-colors"
            >
              <AiOutlineDelete size={14} />
            </button>
          </div>
        ))}
      </div>
      
      {/* Summary */}
      <div className="mt-4 pt-4 border-t border-gold/20">
        <p className="text-sm text-gray-400">
          {getCompletedCount()} of {getTotalCount()} tasks completed
        </p>
      </div>
    </div>
  );
};

export default TodoListSection; 