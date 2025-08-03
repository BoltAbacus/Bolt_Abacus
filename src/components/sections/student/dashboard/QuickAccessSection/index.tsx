import { FC } from 'react';
import { Link } from 'react-router-dom';
import { 
  AiOutlineBarChart, 
  AiOutlineBook, 
  AiOutlineCalculator,
  AiOutlineTeam 
} from 'react-icons/ai';
import { STUDENT_ROADMAP, STUDENT_PRACTICE, STUDENT_PVP } from '@constants/routes';

export interface QuickAccessSectionProps {
  className?: string;
}

const QuickAccessSection: FC<QuickAccessSectionProps> = ({ className = '' }) => {
  const quickAccessItems = [
    {
      id: 1,
      title: 'Roadmap',
      description: 'View your learning progress',
      icon: AiOutlineBarChart,
      link: STUDENT_ROADMAP,
      color: 'from-blue-500 to-blue-600',
    },
    {
      id: 2,
      title: 'Practice',
      description: 'Practice your skills',
      icon: AiOutlineBook,
      link: STUDENT_PRACTICE,
      color: 'from-green-500 to-green-600',
    },
    {
      id: 3,
      title: 'Virtual Abacus',
      description: 'Interactive abacus tool',
      icon: AiOutlineCalculator,
      link: '/virtual-abacus', // Placeholder link
      color: 'from-purple-500 to-purple-600',
    },
    {
      id: 4,
      title: 'Player vs Player',
      description: 'Challenge other students',
      icon: AiOutlineTeam,
      link: STUDENT_PVP,
      color: 'from-red-500 to-red-600',
    },
  ];

  return (
    <div className={`bg-[#1b1b1b] text-white p-6 rounded-lg ${className}`}>
      <h2 className="text-xl font-bold mb-6">Quick Access</h2>
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {quickAccessItems.map((item) => {
          const Icon = item.icon;
          return (
            <Link
              key={item.id}
              to={item.link}
              className="block group"
            >
                             <div className="bg-gray-800 hover:bg-gray-700 p-4 rounded-lg transition-all duration-200 group-hover:transform group-hover:scale-105 h-full">
                 <div className="flex flex-col items-center text-center space-y-3">
                   <div className={`w-12 h-12 rounded-lg bg-gradient-to-r ${item.color} flex items-center justify-center`}>
                     <Icon size={24} className="text-white" />
                   </div>
                   <div>
                     <h3 className="font-semibold text-white group-hover:text-gray-200 text-sm">
                       {item.title}
                     </h3>
                     <p className="text-xs text-gray-400 mt-1">
                       {item.description}
                     </p>
                   </div>
                 </div>
               </div>
            </Link>
          );
        })}
      </div>
    </div>
  );
};

export default QuickAccessSection; 