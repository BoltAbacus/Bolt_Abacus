import { FC, useState } from 'react';
import { GoalItem } from '@store/goalsStore';

interface GoalSchedulerProps {
  onSchedule: (schedulingOptions: Partial<GoalItem>) => void;
  onCancel: () => void;
  initialGoal?: string;
}

const GoalScheduler: FC<GoalSchedulerProps> = ({ onSchedule, onCancel, initialGoal = '' }) => {
  const [goalText, setGoalText] = useState(initialGoal);
  const [priority, setPriority] = useState<'high' | 'medium' | 'low'>('medium');
  const [goalType, setGoalType] = useState<'personal' | 'practice' | 'streak' | 'level' | 'pvp'>('personal');
  
  // Scheduling fields
  const [dueDate, setDueDate] = useState('');
  const [scheduledDate, setScheduledDate] = useState('');
  const [scheduledTime, setScheduledTime] = useState('');
  const [frequency, setFrequency] = useState<'once' | 'daily' | 'weekly' | 'monthly'>('once');
  const [reminderEnabled, setReminderEnabled] = useState(false);
  const [reminderTime, setReminderTime] = useState('');

  const handleSubmit = () => {
    if (!goalText.trim()) return;

    const schedulingOptions: Partial<GoalItem> = {
      priority,
      goalType,
      dueDate: dueDate || undefined,
      scheduledDate: scheduledDate || undefined,
      scheduledTime: scheduledTime || undefined,
      frequency,
      reminderEnabled,
      reminderTime: reminderTime || undefined,
    };

    onSchedule(schedulingOptions);
  };

  const formatDateForInput = (date: Date) => {
    return date.toISOString().split('T')[0];
  };

  const formatTimeForInput = (date: Date) => {
    return date.toTimeString().slice(0, 5);
  };

  const getMinDate = () => {
    return formatDateForInput(new Date());
  };

  const getDefaultScheduledDate = () => {
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    return formatDateForInput(tomorrow);
  };

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-[#212124] rounded-2xl p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto border border-gold/20">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold text-gold">📅 Schedule Your Goal</h2>
          <button
            onClick={onCancel}
            className="text-gray-400 hover:text-white transition-colors"
          >
            ✕
          </button>
        </div>

        <div className="space-y-6">
          {/* Goal Text */}
          <div>
            <label className="block text-gold font-semibold mb-2">Goal Title</label>
            <input
              type="text"
              value={goalText}
              onChange={(e) => setGoalText(e.target.value)}
              placeholder="What do you want to achieve?"
              className="w-full px-4 py-3 bg-black/50 border border-gold/30 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-gold"
            />
          </div>

          {/* Priority and Type */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-gold font-semibold mb-2">Priority</label>
              <select
                value={priority}
                onChange={(e) => setPriority(e.target.value as any)}
                className="w-full px-4 py-3 bg-black/50 border border-gold/30 rounded-lg text-white focus:outline-none focus:border-gold"
              >
                <option value="low">🟢 Low</option>
                <option value="medium">🟡 Medium</option>
                <option value="high">🔴 High</option>
              </select>
            </div>
            <div>
              <label className="block text-gold font-semibold mb-2">Goal Type</label>
              <select
                value={goalType}
                onChange={(e) => setGoalType(e.target.value as any)}
                className="w-full px-4 py-3 bg-black/50 border border-gold/30 rounded-lg text-white focus:outline-none focus:border-gold"
              >
                <option value="personal">👤 Personal</option>
                <option value="practice">📚 Practice</option>
                <option value="streak">🔥 Streak</option>
                <option value="level">📈 Level</option>
                <option value="pvp">⚔️ PvP</option>
              </select>
            </div>
          </div>

          {/* Due Date */}
          <div>
            <label className="block text-gold font-semibold mb-2">Due Date (Optional)</label>
            <input
              type="date"
              value={dueDate}
              onChange={(e) => setDueDate(e.target.value)}
              min={getMinDate()}
              className="w-full px-4 py-3 bg-black/50 border border-gold/30 rounded-lg text-white focus:outline-none focus:border-gold"
            />
          </div>

          {/* Scheduled Date and Time */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-gold font-semibold mb-2">Scheduled Date</label>
              <input
                type="date"
                value={scheduledDate}
                onChange={(e) => setScheduledDate(e.target.value)}
                min={getMinDate()}
                className="w-full px-4 py-3 bg-black/50 border border-gold/30 rounded-lg text-white focus:outline-none focus:border-gold"
              />
            </div>
            <div>
              <label className="block text-gold font-semibold mb-2">Scheduled Time</label>
              <input
                type="time"
                value={scheduledTime}
                onChange={(e) => setScheduledTime(e.target.value)}
                className="w-full px-4 py-3 bg-black/50 border border-gold/30 rounded-lg text-white focus:outline-none focus:border-gold"
              />
            </div>
          </div>

          {/* Frequency */}
          <div>
            <label className="block text-gold font-semibold mb-2">Frequency</label>
            <select
              value={frequency}
              onChange={(e) => setFrequency(e.target.value as any)}
              className="w-full px-4 py-3 bg-black/50 border border-gold/30 rounded-lg text-white focus:outline-none focus:border-gold"
            >
              <option value="once">🔄 Once</option>
              <option value="daily">📅 Daily</option>
              <option value="weekly">📆 Weekly</option>
              <option value="monthly">🗓️ Monthly</option>
            </select>
          </div>

          {/* Reminder Settings */}
          <div className="space-y-4">
            <div className="flex items-center space-x-3">
              <input
                type="checkbox"
                id="reminderEnabled"
                checked={reminderEnabled}
                onChange={(e) => setReminderEnabled(e.target.checked)}
                className="w-5 h-5 text-gold bg-black/50 border-gold/30 rounded focus:ring-gold focus:ring-2"
              />
              <label htmlFor="reminderEnabled" className="text-gold font-semibold">
                Enable Reminder
              </label>
            </div>
            
            {reminderEnabled && (
              <div>
                <label className="block text-gold font-semibold mb-2">Reminder Time</label>
                <input
                  type="time"
                  value={reminderTime}
                  onChange={(e) => setReminderTime(e.target.value)}
                  className="w-full px-4 py-3 bg-black/50 border border-gold/30 rounded-lg text-white focus:outline-none focus:border-gold"
                />
              </div>
            )}
          </div>

          {/* Action Buttons */}
          <div className="flex space-x-4 pt-4">
            <button
              onClick={handleSubmit}
              disabled={!goalText.trim()}
              className="flex-1 py-3 px-6 bg-gradient-to-r from-gold to-lightGold text-black font-bold rounded-lg hover:from-lightGold hover:to-gold transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              📅 Schedule Goal
            </button>
            <button
              onClick={onCancel}
              className="px-6 py-3 bg-gray-600 text-white font-semibold rounded-lg hover:bg-gray-700 transition-colors"
            >
              Cancel
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default GoalScheduler;
