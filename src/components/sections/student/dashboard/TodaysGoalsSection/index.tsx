import { FC } from 'react';

export interface TodaysGoalsSectionProps {
  className?: string;
}

const TodaysGoalsSection: FC<TodaysGoalsSectionProps> = ({ className = '' }) => {
  const goals = [
    { id: 1, text: 'Complete 1 practice session', completed: false },
    { id: 2, text: 'Take 1 quiz', completed: false },
    { id: 3, text: 'Review flashcards', completed: false },
    { id: 4, text: 'Maintain daily streak', completed: true },
  ];

  return (
    <div className={`bg-gray-800 text-white p-4 rounded-lg ${className}`}>
      <h2 className="text-xl font-bold mb-4">Today's Goals</h2>
      <div className="space-y-3">
        {goals.map((goal) => (
          <div key={goal.id} className="flex items-center space-x-3">
            <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${
              goal.completed 
                ? 'bg-green-500 border-green-500' 
                : 'border-gray-400'
            }`}>
              {goal.completed && (
                <span className="text-white text-xs">✓</span>
              )}
            </div>
            <span className={`text-sm ${goal.completed ? 'line-through text-gray-400' : 'text-gray-200'}`}>
              {goal.text}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
};

export default TodaysGoalsSection; 