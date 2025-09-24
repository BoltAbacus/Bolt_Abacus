import { FC, useState, useEffect } from 'react';
import { useTodoListStore } from '@store/todoListStore';
import type { TodoItem } from '@services/todoList';

export interface TodoListSectionProps {
  className?: string;
  accuracy?: number;
  timeSpent?: string;
}

const TodoListSection: FC<TodoListSectionProps> = ({ className = '' }) => {
  const { todos, completed_todos, total_todos, fetchTodoList, addPersonalGoal, removePersonalGoal, toggleComplete, isLoading } = useTodoListStore() as any;
  const [newGoal, setNewGoal] = useState('');
  const [goalDate, setGoalDate] = useState('');
  const [goalTime, setGoalTime] = useState('');
  const [showAddForm, setShowAddForm] = useState(false);

  useEffect(() => {
    fetchTodoList();
  }, [fetchTodoList]);

  const handleAddGoal = async () => {
    if (newGoal.trim()) {
      // Prepare scheduling options
      const schedulingOptions: any = {};
      
      if (goalDate) {
        schedulingOptions.scheduledDate = goalDate;
      }
      if (goalTime) {
        schedulingOptions.scheduledTime = goalTime;
      }
      
      // Add the goal with scheduling options
      await addPersonalGoal(newGoal.trim(), '', schedulingOptions);
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

  const formatDateTime = (todo: any) => {
    if (todo.scheduled_date && todo.scheduled_time) {
      return `${todo.scheduled_date} at ${todo.scheduled_time}`;
    } else if (todo.scheduled_date) {
      return todo.scheduled_date;
    } else if (todo.due_date) {
      const dueDate = new Date(todo.due_date);
      return `Due: ${dueDate.toLocaleDateString()}`;
    }
    return '';
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high': return 'text-red-400';
      case 'medium': return 'text-yellow-400';
      case 'low': return 'text-green-400';
      default: return 'text-gray-400';
    }
  };

  const getPriorityIcon = (priority: string) => {
    switch (priority) {
      case 'high': return '🔴';
      case 'medium': return '🟡';
      case 'low': return '🟢';
      default: return '⚪';
    }
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
  // const displayAccuracy = accuracy || storeAccuracy || 0;
  // const displayTimeSpent = timeSpent || storeTimeSpent || '0h 0m';

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
          ➕
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
               className="flex-1 bg-[#080808]/50 hover:bg-[#191919]/50 text-white px-2 py-1 rounded border border-gold/40 ring-1 ring-gold/20 focus:outline-none focus:border-gold/d40 backdrop-blur-sm transition-colors text-xs"
             />
             <input
               type="date"
               value={goalDate}
               onChange={(e) => setGoalDate(e.target.value)}
               className="bg-[#080808]/50 hover:bg-[#191919]/50 text-white px-2 py-1 rounded border border-gold/40 ring-1 ring-gold/20 focus:outline-none focus:border-gold/d40 backdrop-blur-sm transition-colors text-xs [&::-webkit-calendar-picker-indicator]:invert [&::-webkit-calendar-picker-indicator]:brightness-0 [&::-webkit-calendar-picker-indicator]:contrast-100"
             />
             <input
               type="time"
               value={goalTime}
               onChange={(e) => setGoalTime(e.target.value)}
               className="bg-[#080808]/50 hover:bg-[#191919]/50 text-white px-2 py-1 rounded border border-gold/40 ring-1 ring-gold/20 focus:outline-none focus:border-gold/d40 backdrop-blur-sm transition-colors text-xs [&::-webkit-calendar-picker-indicator]:invert [&::-webkit-calendar-picker-indicator]:brightness-0 [&::-webkit-calendar-picker-indicator]:contrast-100"
             />
             <button
               onClick={handleAddGoal}
               className="bg-[#080808]/50 hover:bg-[#191919]/50 text-white px-2 py-2 rounded-lg border border-gold/50 ring-1 ring-gold/20 backdrop-blur-sm transition-colors text-sm flex items-center justify-center"
               title="Add goal"
             >
               ➕
             </button>
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
               ❌
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
                       <span className={`text-xs ${getPriorityColor(todo.priority)}`}>
                         {getPriorityIcon(todo.priority)}
                       </span>
                       <h3 className={`text-sm font-semibold ${
                         todo.completed ? 'line-through text-gray-400' : 'text-white'
                       }`}>
                         {todo.title}
                       </h3>
                     </div>
                     {formatDateTime(todo) && (
                       <div className="text-xs text-gray-400 mb-1">
                         📅 {formatDateTime(todo)}
                       </div>
                     )}
                     {todo.is_overdue && (
                       <div className="text-xs text-red-400 mb-1">
                         ⚠️ Overdue
                       </div>
                     )}
                     {todo.is_due_today && !todo.completed && (
                       <div className="text-xs text-yellow-400 mb-1">
                         🔔 Due Today
                       </div>
                     )}
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
                      🗑️
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