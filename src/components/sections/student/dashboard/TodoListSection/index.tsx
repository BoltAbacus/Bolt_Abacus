import { FC, useState, useEffect } from 'react';
import { useTodoListStore } from '@store/todoListStore';
import { SkeletonLoader } from '@components/common/SkeletonLoader';
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
  const [dataLoaded, setDataLoaded] = useState(false);
  const [addingGoal, setAddingGoal] = useState(false);
  const [validationError, setValidationError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const [togglingGoal, setTogglingGoal] = useState<string | null>(null);
  const [deletingGoal, setDeletingGoal] = useState<string | null>(null);

  useEffect(() => {
    // Phase 1 optimization: only fetch once on mount, not on every render
    if (!dataLoaded) {
        // console.log('🔄 [TodoList] Initial data fetch...');
      fetchTodoList().finally(() => setDataLoaded(true));
    }
  }, [dataLoaded, fetchTodoList]);

  // No periodic refresh - only fetch on mount and after operations

  const handleAddGoal = async () => {
    // console.log('🎯 [TodoList] Starting to add goal...');
    // console.log('🎯 [TodoList] Goal text:', newGoal.trim());
    // console.log('🎯 [TodoList] Goal date:', goalDate);
    // console.log('🎯 [TodoList] Goal time:', goalTime);
    
    // Reset validation error and success message
    setValidationError('');
    setSuccessMessage('');
    
    // Validate goal text
    if (!newGoal.trim()) {
      setValidationError('Please enter a goal');
      console.log('❌ [TodoList] Validation failed: No goal text');
      return;
    }
    
    // Date and time are completely optional - no validation needed
      console.log('ℹ️ [TodoList] Date/time validation: Both are optional, proceeding...');
    
    try {
      setAddingGoal(true);
      // console.log('🎯 [TodoList] Setting adding state to true');
      
      // Prepare scheduling options
      const schedulingOptions: any = {};
      
      if (goalDate) {
        schedulingOptions.scheduled_date = goalDate; // Use snake_case for backend
        // console.log('📅 [TodoList] Added scheduled_date:', goalDate);
      }
      if (goalTime) {
        schedulingOptions.scheduled_time = goalTime; // Use snake_case for backend
        // console.log('⏰ [TodoList] Added scheduled_time:', goalTime);
      }
      
      // console.log('🎯 [TodoList] Final scheduling options:', schedulingOptions);
      
      // Add the goal with scheduling options
      // console.log('🎯 [TodoList] Calling addPersonalGoal...');
      const result = await addPersonalGoal(newGoal.trim(), '', schedulingOptions);
      // console.log('✅ [TodoList] addPersonalGoal result:', result);
      
      // Clear form on success
      setNewGoal('');
      setGoalDate('');
      setGoalTime('');
      setValidationError('');
      
      // console.log('✅ [TodoList] Goal added successfully, form cleared');
      setSuccessMessage('Goal added successfully!');
      
      // Refresh the todo list from database after successful add
      // console.log('🔄 [TodoList] Refreshing todo list from database...');
      await fetchTodoList();
      
      // Close form after refresh
      setTimeout(() => {
        // console.log('✅ [TodoList] Goal added successfully, closing form...');
        setShowAddForm(false);
        // Clear success message after 3 seconds
        setTimeout(() => setSuccessMessage(''), 3000);
      }, 500);
      
    } catch (error) {
      console.error('❌ [TodoList] Error adding goal:', error);
      setValidationError('Failed to add goal. Please try again.');
    } finally {
      setAddingGoal(false);
      // console.log('🎯 [TodoList] Setting adding state to false');
    }
  };

  const handleRemoveGoal = async (goalId: string) => {
    console.log('🗑️ [TodoList] Removing goal:', goalId);
    setDeletingGoal(goalId);
    try {
      await removePersonalGoal(goalId);
      // console.log('✅ [TodoList] Goal removed successfully');
      // Refresh the list after deletion
      await fetchTodoList();
    } catch (error) {
      console.error('❌ [TodoList] Error removing goal:', error);
    } finally {
      setDeletingGoal(null);
    }
  };

  const handleToggleComplete = async (goalId: string) => {
    console.log('✅ [TodoList] Toggling goal:', goalId);
    setTogglingGoal(goalId);
    try {
      await toggleComplete(goalId);
      console.log('✅ [TodoList] Goal toggled successfully');
    } catch (error) {
      console.error('❌ [TodoList] Error toggling goal:', error);
    } finally {
      setTogglingGoal(null);
    }
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
           {/* Validation Error Tooltip */}
           {validationError && (
             <div className="mb-3 p-2 bg-yellow-500/20 border border-yellow-400/50 rounded text-yellow-200 text-sm">
               ⚠️ {validationError}
             </div>
           )}
           
           {/* Success Message */}
           {successMessage && (
             <div className="mb-3 p-2 bg-green-500/20 border border-green-400/50 rounded text-green-200 text-sm">
               ✅ {successMessage}
             </div>
           )}
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
               <div className="flex-1 relative">
                 <input
                   type="date"
                   value={goalDate}
                   onChange={(e) => setGoalDate(e.target.value)}
                   className="w-full bg-[#080808]/50 hover:bg-[#191919]/50 text-white px-3 py-2 rounded border border-gold/40 ring-1 ring-gold/20 focus:outline-none focus:border-gold/d40 backdrop-blur-sm transition-colors text-sm [&::-webkit-calendar-picker-indicator]:invert [&::-webkit-calendar-picker-indicator]:brightness-0 [&::-webkit-calendar-picker-indicator]:contrast-100"
                   placeholder="Select date (optional)"
                 />
                 {!goalDate && (
                   <div className="absolute inset-y-0 right-3 flex items-center pointer-events-none">
                     <span className="text-gray-400 text-xs">📅 Optional</span>
                   </div>
                 )}
               </div>
               <div className="flex-1 relative">
                 <input
                   type="time"
                   value={goalTime}
                   onChange={(e) => setGoalTime(e.target.value)}
                   className="w-full bg-[#080808]/50 hover:bg-[#191919]/50 text-white px-3 py-2 rounded border border-gold/40 ring-1 ring-gold/20 focus:outline-none focus:border-gold/d40 backdrop-blur-sm transition-colors text-sm [&::-webkit-calendar-picker-indicator]:invert [&::-webkit-calendar-picker-indicator]:brightness-0 [&::-webkit-calendar-picker-indicator]:contrast-100"
                   placeholder="Select time (optional)"
                 />
                 {!goalTime && (
                   <div className="absolute inset-y-0 right-3 flex items-center pointer-events-none">
                     <span className="text-gray-400 text-xs">⏰ Optional</span>
                   </div>
                 )}
               </div>
             </div>
             
             {/* Action buttons - responsive layout */}
             <div className="flex gap-2">
               <button
                 onClick={handleAddGoal}
                 disabled={addingGoal || !newGoal.trim()}
                 className={`flex-1 px-4 py-2 rounded-lg transition-colors text-sm font-semibold flex items-center justify-center min-h-[40px] ${
                   addingGoal || !newGoal.trim() 
                     ? 'bg-gray-500 cursor-not-allowed text-gray-300'
                     : 'bg-gold hover:bg-lightGold text-black'
                 }`}
                 title={!newGoal.trim() ? 'Enter a goal first' : addingGoal ? 'Adding goal...' : 'Add goal (date/time optional)'}
               >
                 {addingGoal ? (
                   <>
                     <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-black mr-2"></div>
                     Adding...
                   </>
                 ) : (
                   <>
                     <span className="mr-1">➕</span>
                     Add Goal
                   </>
                 )}
               </button>
               <button
                 onClick={() => {
                   console.log('🎯 [TodoList] Canceling form...');
                   setShowAddForm(false);
                   setNewGoal('');
                   setGoalDate('');
                   setGoalTime('');
                   setValidationError('');
                   setSuccessMessage('');
                 }}
                 className="bg-[#080808]/50 hover:bg-[#191919]/50 text-white px-4 py-2 rounded-lg border border-gold/50 ring-1 ring-gold/20 backdrop-blur-sm transition-colors text-sm flex items-center justify-center min-h-[40px]"
                 title="Cancel and clear form"
               >
                 Cancel
               </button>
             </div>
           </div>
         </div>
       )}
      
      {/* Phase 1 optimization: skeleton loading only on first load */}
      {isLoading && !dataLoaded ? (
        <div className={`text-white h-full flex flex-col ${className}`}>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-bold flex items-center">
              <span className="mr-2">📋</span>
              Personal Goals
            </h2>
            <div className="w-12 h-10 bg-gray-300 rounded animate-pulse"></div>
          </div>
          <SkeletonLoader lines={4} />
        </div>
      ) : isLoading ? (
        <div className="text-center py-4">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gold mx-auto"></div>
          <p className="text-sm text-gray-400 mt-2">Loading goals...</p>
        </div>
      ) : todos.length === 0 ? (
        <div className="text-center py-8">
          <div className="text-4xl mb-2">📝</div>
          <p className="text-sm text-gray-400">No goals yet. Add one to get started!</p>
        </div>
      ) : (
        <>
          {/* Silently hide backend error banner for cleaner UX */}
          {/* Todo list */}
          <div className="space-y-3 max-h-48 overflow-y-auto flex-1">
            {todos.map((todo: TodoItem) => (
              <div key={todo.id} className={`group p-3 rounded-lg border backdrop-blur-sm transition-all duration-200 ${
                todo.completed 
                  ? 'bg-green-500/10 border-green-400/30' 
                  : 'bg-[#080808]/30 hover:bg-[#191919]/30 border-gold/30'
              }`}>
                <div className="flex items-start space-x-3">
                  <div className="relative">
                    <input
                      type="checkbox"
                      checked={!!todo.completed}
                      onChange={() => handleToggleComplete(todo.id)}
                      disabled={togglingGoal === todo.id}
                      className="mt-1 h-4 w-4 accent-gold cursor-pointer flex-shrink-0 disabled:opacity-50"
                      title={togglingGoal === todo.id ? "Updating..." : "Mark complete"}
                    />
                    {togglingGoal === todo.id && (
                      <div className="absolute -top-1 -left-1 h-6 w-6 flex items-center justify-center">
                        <div className="animate-spin rounded-full h-3 w-3 border-b-2 border-gold"></div>
                      </div>
                    )}
                  </div>
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
                      disabled={deletingGoal === todo.id}
                      className="opacity-0 group-hover:opacity-100 flex-shrink-0 text-red-400 hover:text-red-300 transition-all duration-200 p-1 min-h-[32px] min-w-[32px] flex items-center justify-center disabled:opacity-50"
                      title={deletingGoal === todo.id ? "Deleting..." : "Remove goal"}
                    >
                      {deletingGoal === todo.id ? (
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-red-400"></div>
                      ) : (
                        "🗑️"
                      )}
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