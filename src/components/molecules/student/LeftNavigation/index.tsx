import { FC, useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { Link, useLocation } from 'react-router-dom';
import { 
  AiOutlineMenu, 
  AiOutlineDashboard,
  AiOutlineBarChart,
  AiOutlineFire,
  AiOutlineHistory,
  AiOutlineCalculator,
  AiOutlineTrophy,
  AiOutlineTeam,
  AiOutlineBook,
  AiOutlineVideoCamera,
  AiOutlineLogout,
  AiOutlineClose,
} from 'react-icons/ai';
import { MdOutlineMap } from 'react-icons/md';
import AbacusWidget from '@components/organisms/AbacusWidget';

import BrandLogo from '@components/atoms/BrandLogo';
import ProfileIcon from '@components/atoms/ProfileIcon';

import { useAuthStore } from '@store/authStore';
import { useStreakStore } from '@store/streakStore';
import { useAbacusStore } from '@store/abacusStore';
import {
  STUDENT_DASHBOARD,
  STUDENT_PROGRESS,
  STUDENT_ROADMAP,
  STUDENT_PRACTICE,
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
  const [userManuallyToggled, setUserManuallyToggled] = useState(false);
  const [isToggling, setIsToggling] = useState(false);
  const location = useLocation();
  const user = useAuthStore((state) => state.user);
  const logout = useAuthStore((state) => state.logout);
  const { currentStreak, fetchStreak } = useStreakStore();
  const { isOpen: showAbacusWidget, openAbacus, closeAbacus } = useAbacusStore();

  // Fetch streak when component mounts
  useEffect(() => {
    fetchStreak();
  }, [fetchStreak]);

  // Auto-collapse sidebar on quiz/test/practice pages (only if user hasn't manually toggled)
  useEffect(() => {
    const isQuizTestOrPracticePage = location.pathname.includes('/quiz/') || 
                                    location.pathname.includes('/test/') || 
                                    location.pathname.includes('/oral-test/') || 
                                    location.pathname.includes('/final-test/') ||
                                    location.pathname.includes('/practice/timed/') ||
                                    location.pathname.includes('/practice/untimed/') ||
                                    location.pathname.includes('/practice/set/') ||
                                    location.pathname.includes('/practice/flashcards') ||
                                    location.pathname.includes('/pvp/room/') ||
                                    location.pathname.includes('/pvp/game/');
    
    // Only auto-collapse/expand when navigating to different page types, not on every re-render
    if (isQuizTestOrPracticePage && !isCollapsed && !userManuallyToggled) {
      // Auto-collapse when entering quiz/test/practice pages
      setIsCollapsed(true);
      onCollapseChange?.(true);
    } else if (!isQuizTestOrPracticePage && isCollapsed && !userManuallyToggled) {
      // Auto-expand when leaving quiz/test/practice pages
      setIsCollapsed(false);
      onCollapseChange?.(false);
    }
    
    // Reset manual toggle flag when navigating away from quiz/test/practice pages
    if (!isQuizTestOrPracticePage) {
      setUserManuallyToggled(false);
    }
  }, [location.pathname]); // Remove isCollapsed and onCollapseChange from dependencies to prevent infinite loops

  // Listen for PvP sidebar collapse events
  useEffect(() => {
    const handlePvPSidebarCollapse = () => {
      if (!isCollapsed) {
        setIsCollapsed(true);
        onCollapseChange?.(true);
        setUserManuallyToggled(false); // Allow auto-expansion when leaving PvP
      }
    };

    window.addEventListener('pvpSidebarCollapse', handlePvPSidebarCollapse);
    
    return () => {
      window.removeEventListener('pvpSidebarCollapse', handlePvPSidebarCollapse);
    };
  }, [isCollapsed, onCollapseChange]);

  const navigationItems = [
    {
      name: 'Dashboard',
      href: STUDENT_DASHBOARD,
      icon: '🏠',
    },
    {
      name: 'Path of Conquest',
      href: STUDENT_ROADMAP,
      icon: '🗺️',
    },
    {
      name: 'Progress',
      href: STUDENT_PROGRESS,
      icon: '📊',
    },
    {
      name: 'Solo Training Ground',
      href: STUDENT_PRACTICE,
      icon: '🎯',
    },
    {
      name: 'Epic Battle Ground',
      href: STUDENT_PVP,
      icon: '⚔️',
    },
    {
      name: 'Virtual Abacus',
      href: STUDENT_VIRTUAL_ABACUS,
      icon: '🧮',
    },
    {
      name: 'Hall of Fame',
      href: STUDENT_LEADERBOARD,
      icon: '🏆',
    },
  ];

  const isActive = (href: string) => {
    return location.pathname === href;
  };

  const handleCollapseToggle = () => {
    // Prevent multiple rapid clicks
    if (isToggling) return;
    
    setIsToggling(true);
    const newCollapsedState = !isCollapsed;
    
    // Update states immediately for better UX
    setIsCollapsed(newCollapsedState);
    setUserManuallyToggled(true);
    onCollapseChange?.(newCollapsedState);
    
    // Reset toggling state after animation
    setTimeout(() => {
      setIsToggling(false);
    }, 300);
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
        <span className="text-lg">☰</span>
      </button>

      {/* Mobile Overlay */}
      {isMobileMenuOpen && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-50 z-[55] tablet:hidden"
          onClick={closeMobileMenu}
        />
      )}

      {/* Desktop Sidebar */}
      {isCollapsed && (location.pathname.includes('/quiz/') || 
                      location.pathname.includes('/test/') || 
                      location.pathname.includes('/oral-test/') || 
                      location.pathname.includes('/final-test/') ||
                      location.pathname.includes('/practice/timed/') ||
                      location.pathname.includes('/practice/untimed/') ||
                      location.pathname.includes('/practice/set/') ||
                      location.pathname.includes('/practice/flashcards') ||
                      location.pathname.includes('/pvp/room/') ||
                      location.pathname.includes('/pvp/game/')) ? (
        // Show only floating hamburger icon on quiz/test pages
        <div className="hidden tablet:block fixed top-4 left-4 z-50">
          <button
            onClick={handleCollapseToggle}
            disabled={isToggling}
            className={`p-3 rounded-lg bg-[#161618] text-white border border-[#212124] shadow-lg transition-all duration-200 ${
              isToggling 
                ? 'opacity-50 cursor-not-allowed' 
                : 'hover:bg-[#facb25] hover:text-[#000000]'
            }`}
          >
            {isToggling ? (
              <span className="text-lg animate-spin">⟳</span>
            ) : (
              <span className="text-lg">☰</span>
            )}
          </button>
        </div>
      ) : (
        // Show normal sidebar
        <div className={`hidden tablet:flex fixed left-0 top-0 h-screen bg-[#161618] text-white transition-all duration-300 z-50 border-r border-[#212124] flex-col ${
          isCollapsed ? 'w-16' : 'w-64'
        }`}>
          {/* Header */}
          <div className="flex items-center justify-between p-2 border-b border-[#212124] flex-shrink-0">
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
              disabled={isToggling}
              className={`p-2 rounded-lg transition-all duration-200 ${
                isToggling 
                  ? 'opacity-50 cursor-not-allowed' 
                  : 'hover:bg-[#facb25] hover:text-[#000000]'
              }`}
            >
              {isToggling ? (
                <span className="text-lg animate-spin">⟳</span>
              ) : isCollapsed ? (
                <span className="text-lg">☰</span>
              ) : (
                <span className="text-lg">✕</span>
              )}
            </button>
          </div>

          {/* User Info & Streak */}
          <div className="p-2 border-b border-[#212124] flex-shrink-0">
            {!isCollapsed && (
              <div className="flex items-center justify-between mb-1 -ml-2 p-1 rounded-lg hover:bg-[#facb25] hover:text-[#000000] transition-all duration-200 group">
                <Link
                  to={STUDENT_PROFILE_PAGE}
                  className="flex items-center space-x-3 cursor-pointer flex-1"
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
                <button
                  onClick={logout}
                  className="p-1.5 rounded-md hover:bg-[#e6b422] transition-all duration-200"
                  title="Logout"
                >
                  <span className="text-sm">🚪</span>
                </button>
              </div>
            )}
            
            {/* Streak Display with Join Button */}
            {!isCollapsed ? (
              <div className="flex items-center justify-between p-1">
                <div className="flex items-center space-x-2">
                  <div className="w-8 h-8 bg-[#facb25] rounded-full flex items-center justify-center">
                    <span className="text-sm">🔥</span>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-white">
                      {currentStreak || 0} Day Streak
                    </p>
                    <p className="text-xs text-[#818181]"></p>
                  </div>
                </div>
                <button className="bg-[#facb25] text-[#000000] px-3 py-1.5 rounded-lg font-medium hover:bg-[#e6b422] transition-all duration-200 flex items-center space-x-1">
                  <span className="text-sm">📹</span>
                  <span className="text-sm">Join</span>
                </button>
              </div>
            ) : (
              <div className="flex justify-center p-1">
                <div className="w-8 h-8 bg-[#facb25] rounded-full flex items-center justify-center">
                  <span className="text-sm">🔥</span>
                </div>
              </div>
            )}
          </div>

          {/* Navigation */}
          <nav className="flex-1 p-2 overflow-y-auto min-h-0 scrollbar-thin scrollbar-thumb-gray-600 scrollbar-track-transparent" style={{ maxHeight: 'calc(100vh - 200px)' }}>
            <ul className="space-y-1">
              {navigationItems.map((item) => {
                return (
                  <li key={item.name} className="relative">
                    <Link
                      to={item.href}
                      className={`flex items-center ${isCollapsed ? 'justify-center' : ''} p-2 rounded-lg transition-all duration-200 group ${
                        isActive(item.href)
                          ? 'bg-[#facb25] text-[#000000] shadow-lg'
                          : 'text-white hover:bg-[#facb25] hover:text-[#000000] hover:shadow-md'
                      }`}
                    >
                      <span className="text-xl">{item.icon}</span>
                      {!isCollapsed && (
                        <span className={`ml-3 text-sm font-medium ${isActive(item.href) ? 'text-[#000000]' : 'text-white group-hover:text-[#000000]'}`}>{item.name}</span>
                      )}
                    </Link>
                    {!isCollapsed && item.name === 'Virtual Abacus' && (
                      <button
                        onClick={(e) => {
                          e.preventDefault();
                          e.stopPropagation();
                          openAbacus();
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
          <div className="p-2 border-t border-[#212124] flex-shrink-0">
            <ul className="space-y-1">
              <li>
                <Link
                  to={STUDENT_ARCHIVE}
                  className={`flex items-center ${isCollapsed ? 'justify-center' : ''} p-2 rounded-lg transition-all duration-200 text-white hover:bg-[#facb25] hover:text-[#000000] hover:shadow-md group`}
                >
                  <span className="text-xl">📚</span>
                  {!isCollapsed && (
                    <span className="ml-3 text-sm font-medium text-white group-hover:text-[#000000]">Archive</span>
                  )}
                </Link>
              </li>
              <li>
                <button
                  onClick={logout}
                  className={`w-full flex items-center ${isCollapsed ? 'justify-center' : ''} p-2 rounded-lg transition-all duration-200 text-white hover:bg-[#facb25] hover:text-[#000000] hover:shadow-md group`}
                >
                  <span className="text-xl">🚪</span>
                  {!isCollapsed && (
                    <span className="ml-3 text-sm font-medium text-white group-hover:text-[#000000]">Logout</span>
                  )}
                </button>
              </li>
            </ul>
          </div>
        </div>
      )}

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
            <span className="text-lg">✕</span>
          </button>
        </div>

        {/* Mobile User Info */}
        <div className="p-4 border-b border-[#212124]">
          <Link
            to={STUDENT_PROFILE_PAGE}
            onClick={closeMobileMenu}
            className="flex items-center space-x-3 mb-4 p-2 rounded-lg hover:bg-[#facb25] hover:text-[#000000] transition-all duration-200 group"
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
          <div className="flex items-center space-x-2 p-2 rounded-lg bg-[#212124]">
            <span className="text-xl">🔥</span>
            <div>
              <p className="text-sm font-medium text-white">
                {currentStreak || 0} Day Streak
              </p>
              <p className="text-xs text-[#818181]"></p>
            </div>
          </div>
        </div>

        {/* Mobile Navigation */}
        <nav className="flex-1 p-4">
          <ul className="space-y-2">
            {navigationItems.map((item) => {
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
                    <span className="text-xl">{item.icon}</span>
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
                <span className="text-xl">📚</span>
                <span className="ml-3 text-sm font-medium text-white group-hover:text-[#000000]">Archive</span>
              </Link>
            </li>
          </ul>
        </div>
      </div>

      {showAbacusWidget && createPortal(
        <AbacusWidget onClose={closeAbacus} />,
        document.body
      )}
    </>
  );
};

export default LeftNavigation;