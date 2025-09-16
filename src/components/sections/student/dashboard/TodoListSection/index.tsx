import { FC, useState, useEffect } from 'react';
import { AiOutlineCheckCircle, AiOutlineClockCircle, AiOutlinePlus, AiOutlineDelete, AiOutlineClose } from 'react-icons/ai';
import { useTodoListStore } from '@store/todoListStore';
import { useWeeklyStatsStore } from '@store/weeklyStatsStore';
import type { TodoItem } from '@services/todoList';

export interface TodoListSectionProps {
  className?: string;
  accuracy?: number;
  timeSpent?: string;
}

const TodoListSection: FC<TodoListSectionProps> = ({ className = '', accuracy = 0, timeSpent = '0h 0m' }) => {
  const { todos, completed_todos, pending_todos, total_todos, fetchTodoList, addPersonalGoal, removePersonalGoal, toggleComplete, isLoading, error, clearError } = useTodoListStore() as any;
  const { accuracy: storeAccuracy, time_spent_formatted: storeTimeSpent } = useWeeklyStatsStore();
  const [newGoal, setNewGoal] = useState('');
  const [goalDate, setGoalDate] = useState('');
  const [goalTime, setGoalTime] = useState('');
  const [showAddForm, setShowAddForm] = useState(false);

  useEffect(() => {
    fetchTodoList();
  }, [fetchTodoList]);

  const handleAddGoal = async () => {
    if (newGoal.trim()) {
      // Add the goal even if date and time are empty
      await addPersonalGoal(newGoal.trim());
      setNewGoal('');
      setGoalDate('');
      setGoalTime('');
      setShowAddForm(false);
    }
  };

  const handleRemoveGoal = async (goalId: string) => {
    await removePersonalGoal(goalId);
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleAddGoal();
    }
  };

  const formatDateTime = (todo: TodoItem) => {
    // For now, we'll return empty string since TodoItem doesn't have date/time fields
    // In a real implementation, you'd want to add date and time fields to the TodoItem interface
    // and return the actual date/time or empty string if not set
    return ''; // Empty - no date/time shown if not provided
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'practice': return '📚';
      case 'streak': return '🔥';
      case 'level': return '⚡';
      case 'pvp': return '⚔️';
      default: return '📝';
    }
  };

  // Use props if provided, otherwise fall back to store values
  const displayAccuracy = accuracy || storeAccuracy || 0;
  const displayTimeSpent = timeSpent || storeTimeSpent || '0h 0m';

  return (
    <div className={`text-white h-full flex flex-col ${className}`}>
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-xl font-bold flex items-center">
          <span className="mr-2">📋</span>
          Personal Goals
        </h2>
        <button
          onClick={() => setShowAddForm(!showAddForm)}
          className="bg-[#080808]/50 hover:bg-[#191919]/50 text-white px-3 py-1 rounded-lg border border-gold/50 ring-1 ring-gold/20 backdrop-blur-sm transition-colors text-sm"
        >
          <AiOutlinePlus size={14} />
        </button>
      </div>
      
      
       {/* Add Goal Form */}
       {showAddForm && (
         <div className="mb-4 p-3 bg-[#080808]/30 rounded-lg border border-gold/30">
           <div className="flex space-x-2">
             <input
               type="text"
               value={newGoal}
               onChange={(e) => setNewGoal(e.target.value)}
               onKeyPress={handleKeyPress}
               placeholder="Add a new goal..."
               className="flex-1 bg-[#080808]/50 hover:bg-[#191919]/50 text-white px-3 py-2 rounded-lg border border-gold/40 ring-1 ring-gold/20 focus:outline-none focus:border-gold/d40 backdrop-blur-sm transition-colors text-sm"
             />
             <input
               type="date"
               value={goalDate}
               onChange={(e) => setGoalDate(e.target.value)}
               className="bg-[#080808]/50 hover:bg-[#191919]/50 text-white px-3 py-2 rounded-lg border border-gold/40 ring-1 ring-gold/20 focus:outline-none focus:border-gold/d40 backdrop-blur-sm transition-colors text-sm"
             />
             <input
               type="time"
               value={goalTime}
               onChange={(e) => setGoalTime(e.target.value)}
               className="bg-[#080808]/50 hover:bg-[#191919]/50 text-white px-3 py-2 rounded-lg border border-gold/40 ring-1 ring-gold/20 focus:outline-none focus:border-gold/d40 backdrop-blur-sm transition-colors text-sm"
             />
             <button
               onClick={() => {
                 setShowAddForm(false);
                 setNewGoal('');
                 setGoalDate('');
                 setGoalTime('');
               }}
               className="bg-[#080808]/50 hover:bg-[#191919]/50 text-white px-2 py-2 rounded-lg border border-gold/50 ring-1 ring-gold/20 backdrop-blur-sm transition-colors text-sm flex items-center justify-center"
               title="Cancel"
             >
               <AiOutlineClose size={16} />
             </button>
           </div>
         </div>
       )}
      
      {isLoading ? (
        <div className="text-center py-4">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gold mx-auto"></div>
          <p className="text-sm text-gray-400 mt-2">Loading goals...</p>
        </div>
      ) : (
        <>
          {/* Silently hide backend error banner for cleaner UX */}
          {/* Todo list */}
          <div className="space-y-3 max-h-48 overflow-y-auto flex-1">
            {todos.slice(0, 4).map((todo: TodoItem) => (
              <div key={todo.id} className={`p-3 rounded-lg border backdrop-blur-sm transition-all duration-200 ${
                todo.completed 
                  ? 'bg-green-500/10 border-green-400/30' 
                  : 'bg-[#080808]/30 hover:bg-[#191919]/30 border-gold/30'
              }`}>
                <div className="flex items-start space-x-3">
                  <input
                    type="checkbox"
                    checked={!!todo.completed}
                    onChange={() => toggleComplete(todo.id)}
                    className="mt-1 h-4 w-4 accent-gold cursor-pointer"
                    title="Mark complete"
                  />
                  <div className="flex-1 min-w-0">
                     <div className="flex items-center space-x-2 mb-1">
                       <span className="text-lg">{getTypeIcon(todo.type)}</span>
                       <h3 className={`text-sm font-semibold ${
                         todo.completed ? 'line-through text-gray-400' : 'text-white'
                       }`}>
                         {todo.title}
                       </h3>
                       {formatDateTime(todo) && (
                         <span className="text-xs text-gray-400">
                           {formatDateTime(todo)}
                         </span>
                       )}
                     </div>
                    <p className={`text-xs ${
                      todo.completed ? 'text-gray-500' : 'text-gray-300'
                    }`}>
                      {todo.description}
                    </p>
                  </div>
                  {todo.type === 'personal' && (
                    <button
                      onClick={() => handleRemoveGoal(todo.id)}
                      className="flex-shrink-0 text-red-400 hover:text-red-300 transition-colors p-1"
                      title="Remove goal"
                    >
                      <AiOutlineDelete size={14} />
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
          
          {/* Summary */}
          <div className="mt-4 pt-4 border-t border-gold/30">
            <div className="flex justify-between items-center text-sm">
              <span className="text-gray-400">
                {completed_todos} of {total_todos} goals completed
              </span>
              <span className="text-gold font-semibold">
                {total_todos > 0 ? Math.round((completed_todos / total_todos) * 100) : 0}%
              </span>
            </div>
            <div className="w-full bg-gray-700 rounded-full h-2 mt-2">
              <div 
                className="bg-gradient-to-r from-gold to-lightGold h-2 rounded-full transition-all duration-500"
                style={{ width: `${total_todos > 0 ? (completed_todos / total_todos) * 100 : 0}%` }}
              ></div>
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default TodoListSection; 