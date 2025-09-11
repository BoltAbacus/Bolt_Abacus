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
      link: STUDENT_PRACTICE,
      color: 'from-red-500 to-red-600',
    },
  ];

  return (
    <div className={`text-white ${className}`}>
      <h2 className="text-xl font-bold mb-8 flex items-center text-white">
        <span className="mr-3 text-xl">📂</span>
        Quick Actions
      </h2>
      <div className="grid grid-cols-2 tablet:grid-cols-4 gap-6">
        {shortcuts.map((shortcut) => (
          <Link
            key={shortcut.id}
            to={shortcut.link}
            className="block group"
          >
            <div className="bg-[#080808]/50 hover:bg-[#191919]/50 backdrop-blur-xl p-6 rounded-2xl transition-all duration-500 group-hover:transform group-hover:scale-110 h-full border border-gold/40 ring-1 ring-gold/20 group-hover:border-gold group-hover:shadow-[0_0_40px_rgba(255,186,8,0.25)] relative overflow-hidden">
              {/* Glow overlays */}
              <div className="absolute inset-0 bg-gradient-to-br from-black/20 via-transparent to-[rgba(255,186,8,0.12)] opacity-0 group-hover:opacity-100 transition-opacity duration-500 rounded-2xl"></div>
              <div className="absolute inset-0 bg-gradient-to-r from-transparent via-[rgba(255,186,8,0.08)] to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-700 rounded-2xl"></div>
              
              <div className="flex flex-col items-center text-center space-y-4 relative z-10">
                <div className="w-20 h-20 rounded-2xl bg-[#080808]/50 border border-gold/40 ring-1 ring-gold/20 flex items-center justify-center text-3xl shadow-xl group-hover:shadow-[0_0_30px_rgba(255,186,8,0.25)] transition-all duration-500 transform group-hover:rotate-12">
                  {shortcut.icon}
                </div>
                <div>
                  <h3 className="font-bold text-white group-hover:text-white text-lg font-bold mb-2">
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