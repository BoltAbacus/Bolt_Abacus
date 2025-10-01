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
          className="bg-[#080808]/50 hover:bg-[#191919]/50 text-white px-3 py-2 rounded-lg border border-gold/50 ring-1 ring-gold/20 backdrop-blur-sm transition-colors text-sm min-h-[40px] min-w-[40px] flex items-center justify-center tablet:px-4"
        >
          <span className="tablet:mr-1">➕</span>
          <span className="hidden tablet:inline">Add</span>
        </button>
      </div>
      
      
       {/* Add Goal Form */}
       {showAddForm && (
         <div className="mb-4 p-3 bg-[#080808]/30 rounded-lg border border-gold/30">
           <div className="flex flex-col space-y-2">
             {/* Goal input - full width on mobile */}
             <input
               type="text"
               value={newGoal}
               onChange={(e) => setNewGoal(e.target.value)}
               onKeyPress={handleKeyPress}
               placeholder="Add a new goal..."
               className="w-full bg-[#080808]/50 hover:bg-[#191919]/50 text-white px-3 py-2 rounded border border-gold/40 ring-1 ring-gold/20 focus:outline-none focus:border-gold/d40 backdrop-blur-sm transition-colors text-sm"
             />
             
             {/* Date and time inputs - responsive layout */}
             <div className="flex flex-col tablet:flex-row gap-2">
               <input
                 type="date"
                 value={goalDate}
                 onChange={(e) => setGoalDate(e.target.value)}
                 className="flex-1 bg-[#080808]/50 hover:bg-[#191919]/50 text-white px-3 py-2 rounded border border-gold/40 ring-1 ring-gold/20 focus:outline-none focus:border-gold/d40 backdrop-blur-sm transition-colors text-sm [&::-webkit-calendar-picker-indicator]:invert [&::-webkit-calendar-picker-indicator]:brightness-0 [&::-webkit-calendar-picker-indicator]:contrast-100"
               />
               <input
                 type="time"
                 value={goalTime}
                 onChange={(e) => setGoalTime(e.target.value)}
                 className="flex-1 bg-[#080808]/50 hover:bg-[#191919]/50 text-white px-3 py-2 rounded border border-gold/40 ring-1 ring-gold/20 focus:outline-none focus:border-gold/d40 backdrop-blur-sm transition-colors text-sm [&::-webkit-calendar-picker-indicator]:invert [&::-webkit-calendar-picker-indicator]:brightness-0 [&::-webkit-calendar-picker-indicator]:contrast-100"
               />
             </div>
             
             {/* Action buttons - responsive layout */}
             <div className="flex gap-2">
               <button
                 onClick={handleAddGoal}
                 className="flex-1 bg-gold hover:bg-lightGold text-black px-4 py-2 rounded-lg transition-colors text-sm font-semibold flex items-center justify-center min-h-[40px]"
                 title="Add goal"
               >
                 <span className="mr-1">➕</span>
                 Add Goal
               </button>
               <button
                 onClick={() => {
                   setShowAddForm(false);
                   setNewGoal('');
                   setGoalDate('');
                   setGoalTime('');
                 }}
                 className="bg-[#080808]/50 hover:bg-[#191919]/50 text-white px-4 py-2 rounded-lg border border-gold/50 ring-1 ring-gold/20 backdrop-blur-sm transition-colors text-sm flex items-center justify-center min-h-[40px]"
                 title="Cancel"
               >
                 Cancel
               </button>
             </div>
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
                    className="mt-1 h-4 w-4 accent-gold cursor-pointer flex-shrink-0"
                    title="Mark complete"
                  />
                  <div className="flex-1 min-w-0">
                     <div className="flex items-center flex-wrap gap-1 mb-1">
                       <span className="text-lg flex-shrink-0">{getTypeIcon(todo.type)}</span>
                       <span className={`text-xs flex-shrink-0 ${getPriorityColor(todo.priority)}`}>
                         {getPriorityIcon(todo.priority)}
                       </span>
                       <h3 className={`text-sm font-semibold break-words ${
                         todo.completed ? 'line-through text-gray-400' : 'text-white'
                       }`}>
                         {todo.title}
                       </h3>
                     </div>
                     {formatDateTime(todo) && (
                       <div className="text-xs text-gray-400 mb-1 break-words">
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
                    <p className={`text-xs break-words ${
                      todo.completed ? 'text-gray-500' : 'text-gray-300'
                    }`}>
                      {todo.description}
                    </p>
                  </div>
                  {todo.type === 'personal' && (
                    <button
                      onClick={() => handleRemoveGoal(todo.id)}
                      className="flex-shrink-0 text-red-400 hover:text-red-300 transition-colors p-1 min-h-[32px] min-w-[32px] flex items-center justify-center"
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