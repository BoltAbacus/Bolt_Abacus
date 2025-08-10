import { FC, useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { Link, useLocation } from 'react-router-dom';
import { 
  AiOutlineMenu, 
  AiOutlineClose, 
  AiOutlineDashboard,
  AiOutlineBarChart,
  AiOutlineBook,
  AiOutlineUser,
  AiOutlineLogout,
  AiOutlineFire,
  AiOutlineVideoCamera,
  AiOutlineHistory,
  AiOutlineCalculator,
  AiOutlineTrophy
} from 'react-icons/ai';
import AbacusWidget from '@components/organisms/AbacusWidget';

import BrandLogo from '@components/atoms/BrandLogo';
import ProfileIcon from '@components/atoms/ProfileIcon';

import { useAuthStore } from '@store/authStore';
import { useStreakStore } from '@store/streakStore';
import {
  STUDENT_DASHBOARD,
  STUDENT_PROGRESS,
  STUDENT_PRACTICE,
  STUDENT_ROADMAP,
  STUDENT_VIRTUAL_ABACUS,
  STUDENT_LEADERBOARD,
  STUDENT_ARCHIVE,
  PROFILE_PAGE,
} from '@constants/routes';

export interface LeftNavigationProps {
  onCollapseChange?: (collapsed: boolean) => void;
  classLink?: string;
}

const LeftNavigation: FC<LeftNavigationProps> = ({ onCollapseChange, classLink }) => {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [showAbacusWidget, setShowAbacusWidget] = useState(false);
  const location = useLocation();
  const user = useAuthStore((state) => state.user);
  const logout = useAuthStore((state) => state.logout);
  const { currentStreak, checkAndUpdateStreak } = useStreakStore();

  // Check and update streak when component mounts
  useEffect(() => {
    checkAndUpdateStreak();
  }, [checkAndUpdateStreak]);

  const navigationItems = [
    {
      name: 'Dashboard',
      href: STUDENT_DASHBOARD,
      icon: AiOutlineDashboard,
    },
    {
      name: 'Roadmap',
      href: STUDENT_ROADMAP,
      icon: AiOutlineBarChart,
    },
    {
      name: 'Progress',
      href: STUDENT_PROGRESS,
      icon: AiOutlineBarChart,
    },
    {
      name: 'Practice',
      href: STUDENT_PRACTICE,
      icon: AiOutlineBook,
    },
    {
      name: 'Virtual Abacus',
      href: STUDENT_VIRTUAL_ABACUS,
      icon: AiOutlineCalculator,
    },
    {
      name: 'Leaderboard',
      href: STUDENT_LEADERBOARD,
      icon: AiOutlineTrophy,
    },
  ];

  const isActive = (href: string) => {
    return location.pathname === href;
  };

  const handleCollapseToggle = () => {
    const newCollapsedState = !isCollapsed;
    setIsCollapsed(newCollapsedState);
    onCollapseChange?.(newCollapsedState);
  };

  return (
    <div className={`fixed left-0 top-0 h-full bg-[#1a1a1a] text-white transition-all duration-300 z-50 backdrop-blur-md bg-opacity-95 border-r border-gray-800 ${
      isCollapsed ? 'w-16' : 'w-64'
    }`}>
             {/* Header */}
       <div className="flex items-center justify-between p-4 border-b border-gray-800 bg-opacity-50 backdrop-blur-sm">
        {!isCollapsed ? (
          <div className="flex items-center space-x-2">
            <BrandLogo link="/" />
          </div>
        ) : (
          <div className="flex items-center justify-center w-full">
            <Link to="/">
              <img
                src="/logo.png"
                alt="BoltAbacus logo"
                width={40}
                height={40}
                className="cursor-pointer"
              />
            </Link>
          </div>
        )}
                 <button
           onClick={handleCollapseToggle}
           className="p-2 rounded-lg hover:bg-[#facb25] hover:text-[#1a1a1a] transition-all duration-200"
         >
          {isCollapsed ? <AiOutlineMenu size={20} /> : <AiOutlineClose size={20} />}
        </button>
      </div>

             {/* User Info & Streak */}
       <div className="p-4 border-b border-gray-800 bg-opacity-30 backdrop-blur-sm">
        {!isCollapsed && (
          <div className="flex items-center space-x-3 mb-4">
            <ProfileIcon
              text={(user?.name.first?.charAt(0) || '') + (user?.name.last?.charAt(0) || '')}
            />
            <div>
              <p className="font-medium text-sm">
                {user?.name.first || ''} {user?.name.last || ''}
              </p>
              <p className="text-xs text-gray-400">Student</p>
            </div>
          </div>
        )}
        
                 {/* Streak and Join Class Section */}
         <div className={`flex items-center ${isCollapsed ? 'justify-center' : 'space-x-3'}`}>
           <div className="flex items-center justify-center w-8 h-8 bg-[#facb25] rounded-full relative shadow-lg">
             <AiOutlineFire size={16} className="text-[#1a1a1a]" />
             {isCollapsed && currentStreak > 0 && (
               <div className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center font-bold">
                 {currentStreak}
               </div>
             )}
           </div>
           {!isCollapsed && (
             <div className="flex-1">
               <p className="text-sm font-medium">
                 {currentStreak === 1 ? '1 Day Streak' : `${currentStreak} Days Streak`}
               </p>
               <p className="text-xs text-gray-400">
                 {currentStreak === 0 ? 'Start your streak!' : 'Keep it up!'}
               </p>
             </div>
           )}
                        {!isCollapsed && classLink && (
               <a 
                 href={classLink} 
                 target="_blank" 
                 rel="noopener noreferrer"
                 className="bg-[#facb25] hover:bg-[#facb25]/80 text-[#1a1a1a] text-xs font-medium py-1 px-2 rounded transition-all duration-200 flex items-center space-x-1 shadow-md"
               >
               <AiOutlineVideoCamera size={12} />
               <span>Join</span>
             </a>
           )}
         </div>
      </div>

             {/* Navigation Items */}
       <nav className="flex-1 p-4 bg-opacity-20 backdrop-blur-sm">
        <ul className="space-y-2">
          {navigationItems.map((item) => {
            const Icon = item.icon;
            return (
              <li key={item.name} className="relative">
                <Link
                  to={item.href}
                  className={`flex items-center ${isCollapsed ? 'justify-center' : ''} p-3 rounded-lg transition-all duration-200 ${
                    isActive(item.href)
                      ? 'bg-[#facb25] text-[#1a1a1a] shadow-lg'
                      : 'text-gray-300 hover:bg-[#facb25] hover:text-[#1a1a1a] hover:shadow-md'
                  }`}
                >
                  <Icon size={20} />
                  {!isCollapsed && (
                    <span className="ml-3 text-sm font-medium">{item.name}</span>
                  )}
                </Link>
                {!isCollapsed && item.name === 'Virtual Abacus' && (
                  <button
                    onClick={(e) => {
                      e.preventDefault();
                      e.stopPropagation();
                      setShowAbacusWidget(true);
                    }}
                    className="absolute right-2 top-1/2 -translate-y-1/2 text-xs px-2 py-1 rounded-md border border-gray-700 text-gray-200 bg-[#0f0f0f] hover:bg-[#facb25] hover:text-[#1a1a1a]"
                    title="Open mini abacus"
                  >
                    Mini
                  </button>
                )}
              </li>
            );
          })}
        </ul>
      </nav>

             {/* Bottom Actions */}
       <div className="p-4 border-t border-gray-800 bg-opacity-30 backdrop-blur-sm">
        <ul className="space-y-2">
                    <li>
            <Link
              to={PROFILE_PAGE}
              className={`flex items-center ${isCollapsed ? 'justify-center' : ''} p-3 rounded-lg transition-all duration-200 text-gray-300 hover:bg-[#facb25] hover:text-[#1a1a1a] hover:shadow-md`}
            >
              <AiOutlineUser size={20} />
              {!isCollapsed && (
                <span className="ml-3 text-sm font-medium">Profile</span>
              )}
            </Link>
          </li>
          <li>
            <Link
              to={STUDENT_ARCHIVE}
              className={`flex items-center ${isCollapsed ? 'justify-center' : ''} p-3 rounded-lg transition-all duration-200 text-gray-300 hover:bg-[#facb25] hover:text-[#1a1a1a] hover:shadow-md`}
            >
              <AiOutlineHistory size={20} />
              {!isCollapsed && (
                <span className="ml-3 text-sm font-medium">Archive</span>
              )}
            </Link>
          </li>
          <li>
            <button
              onClick={logout}
              className={`flex items-center ${isCollapsed ? 'justify-center' : ''} w-full p-3 rounded-lg transition-all duration-200 text-gray-300 hover:bg-[#facb25] hover:text-[#1a1a1a] hover:shadow-md`}
            >
              <AiOutlineLogout size={20} />
              {!isCollapsed && (
                <span className="ml-3 text-sm font-medium">Logout</span>
              )}
            </button>
          </li>
        </ul>
      </div>
      {showAbacusWidget && createPortal(
        <AbacusWidget onClose={() => setShowAbacusWidget(false)} />,
        document.body
      )}
    </div>
  );
};

export default LeftNavigation; 