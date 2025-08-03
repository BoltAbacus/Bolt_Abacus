import { FC, useEffect, useState } from 'react';
import { isAxiosError } from 'axios';
import { Link } from 'react-router-dom';

import SeoComponent from '@components/atoms/SeoComponent';
import ErrorBox from '@components/organisms/ErrorBox';
import LoadingBox from '@components/organisms/LoadingBox';
import JoinClassButton from '@components/atoms/JoinClassButton';
import TodoListSection from '@components/sections/student/dashboard/TodoListSection';
import SessionsBar from '@components/atoms/SessionsBar';
import BoltGoalsSection from '@components/sections/student/dashboard/BoltGoalsSection';
import ShortcutsGrid from '@components/sections/student/dashboard/ShortcutsGrid';
import WeeklyStatsSection from '@components/sections/student/dashboard/WeeklyStatsSection';
import AchievementsSection from '@components/sections/student/dashboard/AchievementsSection';

import { dashboardRequestV2 } from '@services/student';
import { useAuthStore } from '@store/authStore';
import { useStreakStore } from '@store/streakStore';
import { useCoinsStore } from '@store/coinsStore';
import { ERRORS, MESSAGES } from '@constants/app';
import { LOGIN_PAGE, STUDENT_DASHBOARD } from '@constants/routes';
import {
  DashboardResponseV2,
  LevelsPercentage,
} from '@interfaces/apis/student';

export interface StudentDashboardPageProps {}

const StudentDashboardPage: FC<StudentDashboardPageProps> = () => {
  const authToken = useAuthStore((state) => state.authToken);
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);

  const [loading, setLoading] = useState(true);
  const [apiError, setApiError] = useState<string | null>(null);
  const [fallBackLink, setFallBackLink] = useState<string>(STUDENT_DASHBOARD);
  const [fallBackAction, setFallBackAction] = useState<string>(
    MESSAGES.TRY_AGAIN
  );

  const [currentLevel, setCurrentLevel] = useState<number>(1);
  const [currentClass, setCurrentClass] = useState<number>(1);
  const [classLink, setClassLink] = useState<string>();
  const [progress, setProgress] = useState<LevelsPercentage>({});
  const { incrementStreak, currentStreak } = useStreakStore();
  const { addCoins, coins } = useCoinsStore();
  const user = useAuthStore((state) => state.user);

  useEffect(() => {
    const getDashboardData = async () => {
      if (isAuthenticated) {
        try {
          const res = await dashboardRequestV2(authToken!);
          if (res.status === 200) {
            const dashboardResponse: DashboardResponseV2 = res.data;
            setCurrentLevel(dashboardResponse.levelId);
            setCurrentClass(dashboardResponse.latestClass);
            setClassLink(dashboardResponse.latestLink);
            setApiError(null);
            setProgress(dashboardResponse.levelsPercentage);
            
            // Only increment streak if this is the first visit today
            incrementStreak();
            
            // Add some coins for daily login (you can adjust this logic)
            addCoins(10);
          }
        } catch (error) {
          if (isAxiosError(error)) {
            const status = error.response?.status;
            if (status === 401) {
              setApiError(
                error.response?.data?.error ||
                  error.response?.data?.message ||
                  ERRORS.SERVER_ERROR
              );
              setFallBackLink(LOGIN_PAGE);
              setFallBackAction(MESSAGES.GO_LOGIN);
            } else {
              setApiError(ERRORS.SERVER_ERROR);
            }
          } else {
            setApiError(ERRORS.SERVER_ERROR);
          }
        } finally {
          setLoading(false);
        }
      } else {
        setLoading(false);
        setApiError(ERRORS.AUTHENTICATION_ERROR);
        setFallBackLink(LOGIN_PAGE);
        setFallBackAction(MESSAGES.GO_LOGIN);
      }
    };
    getDashboardData();
  }, [authToken, isAuthenticated]);

  return (
    <div className="min-h-screen">
      {loading ? (
        <>
          <SeoComponent title="Loading" />
          <LoadingBox />
        </>
      ) : (
        <div>
          {apiError ? (
            <>
              <SeoComponent title="Error" />
              <ErrorBox
                errorMessage={apiError}
                link={fallBackLink}
                buttonText={fallBackAction}
              />
            </>
          ) : (
            <>
              <SeoComponent title="Dashboard" />
              <div className="px-6 pt-2 tablet:p-10 desktop:px-24 space-y-6 bg-gradient-to-br from-gray-900 via-black to-gray-900 min-h-screen">
                {/* 🔝 HEADER AREA */}
                <div className="bg-gradient-to-r from-gray-900/90 to-gray-800/90 backdrop-blur-xl text-white p-8 rounded-2xl border border-gray-700/50 shadow-2xl shadow-black/50 relative overflow-hidden">
                  {/* Animated background elements */}
                  <div className="absolute inset-0 bg-gradient-to-r from-yellow-500/5 via-transparent to-orange-500/5 animate-pulse"></div>
                  <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-yellow-400 via-orange-500 to-red-500"></div>
                  {/* Top Row - Greeting with Join Class */}
                  <div className="flex items-start justify-between mb-4">
                    <div>
                      <h1 className="text-4xl font-bold mb-3 bg-gradient-to-r from-white via-yellow-200 to-orange-200 bg-clip-text text-transparent drop-shadow-lg">
                        Welcome back, {user?.name.first || 'Student'}! 👋
                      </h1>
                      {/* Stats under name */}
                      <div className="flex items-center space-x-4">
                        <span className="bg-gradient-to-r from-yellow-500/30 to-yellow-600/30 text-yellow-200 font-bold px-3 py-2 rounded-xl border border-yellow-400/50 shadow-lg shadow-yellow-500/20 backdrop-blur-sm hover:scale-105 transition-all duration-300">
                          <span className="text-lg mr-1">🪙</span>
                          <span className="text-shadow-lg">{coins.toLocaleString()} Coins</span>
                        </span>
                        <span className="bg-gradient-to-r from-orange-500/30 to-red-600/30 text-orange-200 font-bold px-3 py-2 rounded-xl border border-orange-400/50 shadow-lg shadow-orange-500/20 backdrop-blur-sm hover:scale-105 transition-all duration-300">
                          <span className="text-lg mr-1">🔥</span>
                          <span className="text-shadow-lg">{currentStreak} Day Streak</span>
                        </span>
                      </div>
                    </div>
                    <JoinClassButton classLink={classLink!} />
                  </div>
                  
                  {/* Level/XP and Continue Learning - Full Width */}
                  <div className="flex items-center space-x-3 bg-gradient-to-r from-gray-800/80 to-gray-700/80 backdrop-blur-xl px-6 py-4 rounded-2xl border border-green-500/30 shadow-xl shadow-green-500/10 mb-6 relative overflow-hidden">
                    {/* Animated background */}
                    <div className="absolute inset-0 bg-gradient-to-r from-green-500/5 via-transparent to-blue-500/5 animate-pulse"></div>
                    <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-green-400 via-emerald-500 to-teal-500"></div>
                    
                    <div className="relative z-10 flex items-center justify-center w-16 h-16 bg-gradient-to-br from-green-500 to-emerald-600 rounded-2xl shadow-lg shadow-green-500/30 border border-green-400/50">
                      <span className="text-2xl">📚</span>
                    </div>
                    <div className="flex flex-col min-w-0 flex-1 relative z-10">
                      <span className="text-xl font-bold bg-gradient-to-r from-green-300 to-emerald-300 bg-clip-text text-transparent mb-2">
                        Level {currentLevel} • {Math.floor((progress[currentLevel] || 0) * 15)} / 1500 XP
                      </span>
                      <div className="flex justify-between items-center mb-3">
                        <span className="text-sm text-gray-300 font-semibold">Progress</span>
                        <span className="text-sm font-bold text-green-300">{Math.round(Math.max((progress[currentLevel] || 0) * 100, 40))}%</span>
                      </div>
                                              {/* Enhanced Progress Bar */}
                        <div className="w-full bg-gray-900 rounded-full h-5 shadow-inner mb-3 relative overflow-hidden border border-gray-600">
                          <div 
                            className="bg-gradient-to-r from-[#FFD700] via-[#FFA500] to-[#FF8C00] h-5 rounded-full transition-all duration-700 shadow-lg relative overflow-hidden"
                            style={{ width: `${Math.max((progress[currentLevel] || 0) * 100, 40)}%` }}
                          >
                            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/50 to-transparent animate-pulse"></div>
                            <div className="absolute inset-0 bg-gradient-to-r from-[#FFD700]/80 to-transparent animate-ping"></div>
                            <div className="absolute inset-0 bg-gradient-to-r from-white/30 to-transparent"></div>
                          </div>
                        </div>
                                              <div className="flex justify-between items-center">
                          <span className="text-sm text-gray-400 font-medium">
                            {Math.round(Math.max((progress[currentLevel] || 0) * 100, 40))}% to next level
                          </span>
                          <Link
                            to={`/student/level/${currentLevel}`}
                            className="inline-block bg-gradient-to-r from-yellow-400 to-orange-500 hover:from-yellow-500 hover:to-orange-600 text-white font-bold py-2 px-4 rounded-xl shadow-lg shadow-yellow-500/30 transition-all duration-300 transform hover:scale-105 hover:shadow-xl border border-yellow-300/50"
                          >
                            ⚡ Resume Learning
                          </Link>
                        </div>
                    </div>
                  </div>
                </div>
                
                {/* 🧠 DASHBOARD OVERVIEW */}
                <div className="bg-[#1b1b1b] backdrop-blur-xl text-white p-8 rounded-2xl border border-gray-700/50 shadow-2xl shadow-black/50 relative overflow-hidden">
                  {/* Animated background elements */}
                  <div className="absolute inset-0 bg-gradient-to-r from-blue-500/5 via-transparent to-purple-500/5 animate-pulse"></div>
                  <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-blue-400 via-purple-500 to-indigo-500"></div>
                  
                  <div className="relative z-10">
                    <h2 className="text-3xl font-bold mb-8 flex items-center bg-gradient-to-r from-blue-300 to-purple-300 bg-clip-text text-transparent">
                      <span className="mr-3 text-3xl">🧠</span>
                      Dashboard Overview
                    </h2>
                    
                                         {/* 3x1 Grid Layout */}
                     <div className="grid grid-cols-3 gap-6">
                       <div className="bg-[#1b1b1b] backdrop-blur-xl p-6 rounded-2xl border border-gray-700/30 shadow-xl transition-all duration-500 hover:border-[#FFD700] hover:shadow-2xl hover:shadow-[#FFD700]/40 hover:scale-105 group relative overflow-hidden">
                         {/* Glassmorphism overlay on hover */}
                         <div className="absolute inset-0 bg-gradient-to-br from-black/20 via-transparent to-[#FFD700]/10 opacity-0 group-hover:opacity-100 transition-opacity duration-500 rounded-2xl"></div>
                         <div className="absolute inset-0 bg-gradient-to-r from-transparent via-[#FFD700]/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-700 animate-pulse rounded-2xl"></div>
                         <div className="relative z-10">
                           <SessionsBar sessionsCompleted={3} totalSessions={5} />
                         </div>
                       </div>
                       <div className="bg-[#1b1b1b] backdrop-blur-xl p-6 rounded-2xl border border-gray-700/30 shadow-xl transition-all duration-500 hover:border-[#FFD700] hover:shadow-2xl hover:shadow-[#FFD700]/40 hover:scale-105 group relative overflow-hidden">
                         {/* Glassmorphism overlay on hover */}
                         <div className="absolute inset-0 bg-gradient-to-br from-black/20 via-transparent to-[#FFD700]/10 opacity-0 group-hover:opacity-100 transition-opacity duration-500 rounded-2xl"></div>
                         <div className="absolute inset-0 bg-gradient-to-r from-transparent via-[#FFD700]/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-700 animate-pulse rounded-2xl"></div>
                         <div className="relative z-10">
                           <BoltGoalsSection />
                         </div>
                       </div>
                       <div className="bg-[#1b1b1b] backdrop-blur-xl p-6 rounded-2xl border border-gray-700/30 shadow-xl transition-all duration-500 hover:border-[#FFD700] hover:shadow-2xl hover:shadow-[#FFD700]/40 hover:scale-105 group relative overflow-hidden">
                         {/* Glassmorphism overlay on hover */}
                         <div className="absolute inset-0 bg-gradient-to-br from-black/20 via-transparent to-[#FFD700]/10 opacity-0 group-hover:opacity-100 transition-opacity duration-500 rounded-2xl"></div>
                         <div className="absolute inset-0 bg-gradient-to-r from-transparent via-[#FFD700]/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-700 animate-pulse rounded-2xl"></div>
                         <div className="relative z-10">
                           <TodoListSection />
                         </div>
                       </div>
                     </div>
                  </div>
                </div>
                
                {/* 📂 SHORTCUTS GRID */}
                <div className="bg-[#1b1b1b] backdrop-blur-xl text-white p-8 rounded-2xl border border-gray-700/50 shadow-2xl shadow-black/50 relative overflow-hidden">
                  {/* Animated background elements */}
                  <div className="absolute inset-0 bg-gradient-to-r from-green-500/5 via-transparent to-blue-500/5 animate-pulse"></div>
                  <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-green-400 via-blue-500 to-purple-500"></div>
                  
                  <div className="relative z-10">
                    <ShortcutsGrid />
                  </div>
                </div>
                
                {/* 🏆 THIS WEEK'S POWER & LIGHTNING ACHIEVEMENTS (2x1 Layout) */}
                <div className="grid grid-cols-2 gap-6">
                  <div className="bg-[#1b1b1b] backdrop-blur-xl text-white p-8 rounded-2xl border border-gray-700/50 shadow-2xl shadow-black/50 relative overflow-hidden">
                    {/* Animated background elements */}
                    <div className="absolute inset-0 bg-gradient-to-r from-purple-500/5 via-transparent to-pink-500/5 animate-pulse"></div>
                    <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-purple-400 via-pink-500 to-red-500"></div>
                    
                    <div className="relative z-10">
                      <WeeklyStatsSection />
                    </div>
                  </div>
                  <div className="bg-[#1b1b1b] backdrop-blur-xl text-white p-8 rounded-2xl border border-gray-700/50 shadow-2xl shadow-black/50 relative overflow-hidden">
                    {/* Animated background elements */}
                    <div className="absolute inset-0 bg-gradient-to-r from-yellow-500/5 via-transparent to-orange-500/5 animate-pulse"></div>
                    <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-yellow-400 via-orange-500 to-red-500"></div>
                    
                    <div className="relative z-10">
                      <AchievementsSection />
                    </div>
                  </div>
                </div>
              </div>
            </>
          )}
        </div>
      )}
    </div>
  );
};

export default StudentDashboardPage;
