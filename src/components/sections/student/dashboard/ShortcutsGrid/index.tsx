import { FC } from 'react';
import { Link } from 'react-router-dom';
import { STUDENT_ROADMAP, STUDENT_PRACTICE, STUDENT_PVP } from '@constants/routes';

export interface ShortcutsGridProps {
  className?: string;
}

const ShortcutsGrid: FC<ShortcutsGridProps> = ({ className = '' }) => {
  const shortcuts = [
    {
      id: 1,
      icon: '📘',
      title: 'Roadmap',
      description: 'View your learning journey',
      link: STUDENT_ROADMAP,
      color: 'from-blue-500 to-blue-600',
    },
    {
      id: 2,
      icon: '🎯',
      title: 'Practice',
      description: 'Improve your math skills',
      link: STUDENT_PRACTICE,
      color: 'from-green-500 to-green-600',
    },
    {
      id: 3,
      icon: '🧮',
      title: 'Virtual Abacus',
      description: 'Interactive abacus tool',
      link: '/virtual-abacus',
      color: 'from-purple-500 to-purple-600',
    },
    {
      id: 4,
      icon: '⚔️',
      title: 'Player vs Player',
      description: 'Challenge other students',
      link: STUDENT_PVP,
      color: 'from-red-500 to-red-600',
    },
  ];

  return (
    <div className={`text-white ${className}`}>
      <h2 className="text-3xl font-bold mb-8 flex items-center bg-gradient-to-r from-green-300 to-blue-300 bg-clip-text text-transparent">
        <span className="mr-3 text-3xl">📂</span>
        Quick Actions
      </h2>
      <div className="grid grid-cols-4 gap-6">
        {shortcuts.map((shortcut) => (
          <Link
            key={shortcut.id}
            to={shortcut.link}
            className="block group"
          >
            <div className="bg-[#1b1b1b] backdrop-blur-xl p-6 rounded-2xl transition-all duration-500 group-hover:transform group-hover:scale-110 h-full border border-gray-700/30 group-hover:border-[#FFD700] group-hover:shadow-2xl group-hover:shadow-[#FFD700]/40 relative overflow-hidden">
              {/* Glassmorphism overlay on hover */}
              <div className="absolute inset-0 bg-gradient-to-br from-black/20 via-transparent to-[#FFD700]/10 opacity-0 group-hover:opacity-100 transition-opacity duration-500 rounded-2xl"></div>
              <div className="absolute inset-0 bg-gradient-to-r from-transparent via-[#FFD700]/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-700 animate-pulse rounded-2xl"></div>
              
              <div className="flex flex-col items-center text-center space-y-4 relative z-10">
                <div className={`w-20 h-20 rounded-2xl bg-gradient-to-br ${shortcut.color} flex items-center justify-center text-3xl shadow-xl group-hover:shadow-2xl group-hover:shadow-blue-500/40 transition-all duration-500 transform group-hover:rotate-12`}>
                  {shortcut.icon}
                </div>
                <div>
                  <h3 className="font-bold text-white group-hover:text-gray-200 text-lg font-bold mb-2">
                    {shortcut.title}
                  </h3>
                  <p className="text-sm text-gray-400 font-medium">
                    {shortcut.description}
                  </p>
                </div>
              </div>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
};

export default ShortcutsGrid; 