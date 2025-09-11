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
  AiOutlineTrophy,
  AiOutlineTeam
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
  STUDENT_PVP,
  STUDENT_PROFILE_PAGE,
} from '@constants/routes';

export interface LeftNavigationProps {
  onCollapseChange?: (collapsed: boolean) => void;
  classLink?: string;
}

const LeftNavigation: FC<LeftNavigationProps> = ({ onCollapseChange, classLink }) => {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [showAbacusWidget, setShowAbacusWidget] = useState(false);
  const location = useLocation();
  const user = useAuthStore((state) => state.user);
  const logout = useAuthStore((state) => state.logout);
  const { currentStreak, fetchStreak } = useStreakStore();

  // Fetch streak when component mounts
  useEffect(() => {
    fetchStreak();
  }, [fetchStreak]);

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
      name: 'PvP Battles',
      href: STUDENT_PVP,
      icon: AiOutlineTeam,
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

  const handleMobileMenuToggle = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen);
  };

  const closeMobileMenu = () => {
    setIsMobileMenuOpen(false);
  };

  return (
    <>
      {/* Mobile Hamburger Button */}
      <button
        onClick={handleMobileMenuToggle}
        className="fixed top-4 left-4 z-[60] tablet:hidden p-2 rounded-lg bg-[#161618] text-white hover:bg-[#facb25] hover:text-[#000000] transition-all duration-200 border border-[#212124]"
      >
        <AiOutlineMenu size={20} />
      </button>

      {/* Mobile Overlay */}
      {isMobileMenuOpen && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-50 z-[55] tablet:hidden"
          onClick={closeMobileMenu}
        />
      )}

      {/* Desktop Sidebar */}
      <div className={`hidden tablet:block fixed left-0 top-0 h-full bg-[#161618] text-white transition-all duration-300 z-50 border-r border-[#212124] ${
        isCollapsed ? 'w-16' : 'w-64'
      }`}>
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-[#212124]">
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
            className="p-2 rounded-lg hover:bg-[#facb25] hover:text-[#000000] transition-all duration-200"
          >
            {isCollapsed ? <AiOutlineMenu size={20} /> : <AiOutlineClose size={20} />}
          </button>
        </div>

        {/* User Info & Streak */}
        <div className="p-4 border-b border-[#212124]">
          {!isCollapsed && (
            <Link
              to={STUDENT_PROFILE_PAGE}
              className="flex items-center space-x-3 mb-4 -ml-2 p-2 rounded-lg hover:bg-[#facb25] hover:text-[#000000] transition-all duration-200 group cursor-pointer"
            >
              <ProfileIcon
                text={(user?.name.first?.charAt(0) || '') + (user?.name.last?.charAt(0) || '')}
              />
              <div>
                <p className="font-medium text-sm group-hover:text-[#000000]">
                  {user?.name.first || ''} {user?.name.last || ''}
                </p>
                <p className="text-xs text-white group-hover:text-[#000000]">Student</p>
              </div>
            </Link>
          )}
          {isCollapsed && (
            <Link
              to={STUDENT_PROFILE_PAGE}
              className="flex items-center justify-center mb-4 p-2 rounded-lg hover:bg-[#facb25] hover:text-[#000000] transition-all duration-200 group cursor-pointer"
            >
              <ProfileIcon
                text={(user?.name.first?.charAt(0) || '') + (user?.name.last?.charAt(0) || '')}
              />
            </Link>
          )}
          
          {/* Streak and Join Class Section */}
          <div className={`flex items-center ${isCollapsed ? 'justify-center' : 'space-x-3'}`}>
            <div className="flex items-center justify-center w-8 h-8 bg-[#facb25] rounded-full relative shadow-lg">
              <AiOutlineFire size={16} className="text-[#000000]" />
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
                <p className="text-xs text-white">
                  {currentStreak === 0 ? 'Start your streak!' : 'Keep it up!'}
                </p>
              </div>
            )}
            {!isCollapsed && classLink && (
              <a 
                href={classLink} 
                target="_blank" 
                rel="noopener noreferrer"
                className="bg-[#facb25] hover:bg-[#facb25]/80 text-[#000000] text-xs font-medium py-1 px-2 rounded transition-all duration-200 flex items-center space-x-1 shadow-md"
              >
                <AiOutlineVideoCamera size={12} />
                <span>Join</span>
              </a>
            )}
          </div>
        </div>

        {/* Navigation Items */}
        <nav className="flex-1 p-4">
          <ul className="space-y-2">
            {navigationItems.map((item) => {
              const Icon = item.icon;
              return (
                <li key={item.name} className="relative">
                  <Link
                    to={item.href}
                    className={`flex items-center ${isCollapsed ? 'justify-center' : ''} p-3 rounded-lg transition-all duration-200 group ${
                      isActive(item.href)
                        ? 'bg-[#facb25] text-[#000000] shadow-lg'
                        : 'text-white hover:bg-[#facb25] hover:text-[#000000] hover:shadow-md'
                    }`}
                  >
                    <Icon size={20} className={isActive(item.href) ? 'text-[#000000]' : 'text-white group-hover:text-[#000000]'} />
                    {!isCollapsed && (
                      <span className={`ml-3 text-sm font-medium ${isActive(item.href) ? 'text-[#000000]' : 'text-white group-hover:text-[#000000]'}`}>{item.name}</span>
                    )}
                  </Link>
                  {!isCollapsed && item.name === 'Virtual Abacus' && (
                    <button
                      onClick={(e) => {
                        e.preventDefault();
                        e.stopPropagation();
                        setShowAbacusWidget(true);
                      }}
                      className="absolute right-2 top-1/2 -translate-y-1/2 text-xs px-2 py-1 rounded-md border border-[#212124] text-white bg-[#212124] hover:bg-[#facb25] hover:text-[#000000]"
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
        <div className="p-4 border-t border-[#212124]">
          <ul className="space-y-2">
            <li>
              <Link
                to={STUDENT_ARCHIVE}
                className={`flex items-center ${isCollapsed ? 'justify-center' : ''} p-3 rounded-lg transition-all duration-200 text-white hover:bg-[#facb25] hover:text-[#000000] hover:shadow-md group`}
              >
                <AiOutlineHistory size={20} className="text-white group-hover:text-[#000000]" />
                {!isCollapsed && (
                  <span className="ml-3 text-sm font-medium text-white group-hover:text-[#000000]">Archive</span>
                )}
              </Link>
            </li>
          </ul>
        </div>
      </div>

      {/* Mobile Menu */}
      <div className={`fixed left-0 top-0 h-full w-80 bg-[#161618] text-white transition-all duration-300 z-[60] tablet:hidden ${
        isMobileMenuOpen ? 'translate-x-0' : '-translate-x-full'
      }`}>
        {/* Mobile Header */}
        <div className="flex items-center justify-between p-4 border-b border-[#212124]">
          <BrandLogo link="/" />
          <button
            onClick={closeMobileMenu}
            className="p-2 rounded-lg hover:bg-[#facb25] hover:text-[#000000] transition-all duration-200"
          >
            <AiOutlineClose size={20} />
          </button>
        </div>

        {/* Mobile User Info */}
        <div className="p-4 border-b border-[#212124]">
          <Link
            to={STUDENT_PROFILE_PAGE}
            onClick={closeMobileMenu}
            className="flex items-center space-x-3 mb-4 p-2 rounded-lg hover:bg-[#facb25] hover:text-[#000000] transition-all duration-200 group cursor-pointer"
          >
            <ProfileIcon
              text={(user?.name.first?.charAt(0) || '') + (user?.name.last?.charAt(0) || '')}
            />
            <div>
              <p className="font-medium text-sm group-hover:text-[#000000]">
                {user?.name.first || ''} {user?.name.last || ''}
              </p>
              <p className="text-xs text-white group-hover:text-[#000000]">Student</p>
            </div>
          </Link>
          
          {/* Mobile Streak */}
          <div className="flex items-center space-x-3">
            <div className="flex items-center justify-center w-8 h-8 bg-[#facb25] rounded-full relative shadow-lg">
              <AiOutlineFire size={16} className="text-[#000000]" />
            </div>
            <div className="flex-1">
              <p className="text-sm font-medium">
                {currentStreak === 1 ? '1 Day Streak' : `${currentStreak} Days Streak`}
              </p>
              <p className="text-xs text-white">
                {currentStreak === 0 ? 'Start your streak!' : 'Keep it up!'}
              </p>
            </div>
            {classLink && (
              <a 
                href={classLink} 
                target="_blank" 
                rel="noopener noreferrer"
                className="bg-[#facb25] hover:bg-[#facb25]/80 text-[#000000] text-xs font-medium py-1 px-2 rounded transition-all duration-200 flex items-center space-x-1 shadow-md"
              >
                <AiOutlineVideoCamera size={12} />
                <span>Join</span>
              </a>
            )}
          </div>
        </div>

        {/* Mobile Navigation */}
        <nav className="flex-1 p-4">
          <ul className="space-y-2">
            {navigationItems.map((item) => {
              const Icon = item.icon;
              return (
                <li key={item.name}>
                  <Link
                    to={item.href}
                    onClick={closeMobileMenu}
                    className={`flex items-center p-3 rounded-lg transition-all duration-200 group ${
                      isActive(item.href)
                        ? 'bg-[#facb25] text-[#000000] shadow-lg'
                        : 'text-white hover:bg-[#facb25] hover:text-[#000000] hover:shadow-md'
                    }`}
                  >
                    <Icon size={20} className={isActive(item.href) ? 'text-[#000000]' : 'text-white group-hover:text-[#000000]'} />
                    <span className={`ml-3 text-sm font-medium ${isActive(item.href) ? 'text-[#000000]' : 'text-white group-hover:text-[#000000]'}`}>{item.name}</span>
                  </Link>
                </li>
              );
            })}
          </ul>
        </nav>

        {/* Mobile Bottom Actions */}
        <div className="p-4 border-t border-[#212124]">
          <ul className="space-y-2">
            <li>
              <Link
                to={STUDENT_ARCHIVE}
                onClick={closeMobileMenu}
                className="flex items-center p-3 rounded-lg transition-all duration-200 text-white hover:bg-[#facb25] hover:text-[#000000] hover:shadow-md group"
              >
                <AiOutlineHistory size={20} className="text-white group-hover:text-[#000000]" />
                <span className="ml-3 text-sm font-medium text-white group-hover:text-[#000000]">Archive</span>
              </Link>
            </li>
          </ul>
        </div>
      </div>

      {showAbacusWidget && createPortal(
        <AbacusWidget onClose={() => setShowAbacusWidget(false)} />,
        document.body
      )}
    </>
  );
};

export default LeftNavigation; 