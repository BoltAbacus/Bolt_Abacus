import { FC } from 'react';

export interface RecentActivitySectionProps {
  className?: string;
}

const RecentActivitySection: FC<RecentActivitySectionProps> = ({ className = '' }) => {
  const activities = [
    { id: 1, action: 'Completed Speed Math', xp: '+150 XP', time: '2 hours ago', icon: '✅' },
    { id: 2, action: 'Practiced Virtual Abacus', xp: '+75 XP', time: '4 hours ago', icon: '✅' },
    { id: 3, action: 'Took Lightning Realm Quiz', xp: '+200 XP', time: '6 hours ago', icon: '✅' },
    { id: 4, action: 'Maintained Daily Streak', xp: '+50 XP', time: '1 day ago', icon: '🔥' },
    { id: 5, action: 'Unlocked Achievement', xp: '+100 XP', time: '1 day ago', icon: '🏆' },
  ];

  return (
    <div className={`bg-[#1b1b1b] text-white p-6 rounded-lg border border-gray-800 ${className}`}>
      <h2 className="text-2xl font-bold mb-6 flex items-center">
        <span className="mr-2">🕒</span>
        Recent Activity
      </h2>
      
      <div className="space-y-4">
        {activities.map((activity) => (
          <div key={activity.id} className="flex items-center space-x-3 p-3 bg-gray-800 rounded-lg hover:bg-gray-700 transition-colors">
            <div className="text-xl">{activity.icon}</div>
            <div className="flex-1">
              <div className="flex justify-between items-start">
                <div>
                  <p className="text-sm font-medium text-white">{activity.action}</p>
                  <p className="text-xs text-gray-400">{activity.time}</p>
                </div>
                <span className="text-sm font-semibold text-green-400">{activity.xp}</span>
              </div>
            </div>
          </div>
        ))}
      </div>
      
      <div className="mt-6 pt-4 border-t border-gray-700">
        <button className="w-full bg-gray-800 hover:bg-gray-700 text-white py-2 px-4 rounded-lg transition-colors text-sm">
          View All Activity
        </button>
      </div>
    </div>
  );
};

export default RecentActivitySection; 