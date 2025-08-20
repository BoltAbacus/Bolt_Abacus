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
// import WeeklyGoalsSection from '@components/sections/student/dashboard/WeeklyGoalsSection';
import AchievementsSection from '@components/sections/student/dashboard/AchievementsSection';

import { dashboardRequestV2, getPracticeProgressRequest } from '@services/student';
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
  const [classLink, setClassLink] = useState<string>();
  const [progress, setProgress] = useState<LevelsPercentage>({});
  const [dashboardData, setDashboardData] = useState<any>(null);
  const { incrementStreak, currentStreak } = useStreakStore();
  const { addCoins, coins } = useCoinsStore();
  const user = useAuthStore((state) => state.user);

  useEffect(() => {
    let intervalId: NodeJS.Timeout | null = null;
    let isMounted = true;
    const getDashboardData = async () => {
      if (isAuthenticated) {
        try {
          const res = await dashboardRequestV2(authToken!);
          if (res.status === 200) {
            const dashboardResponse: DashboardResponseV2 = res.data;
            if (!isMounted) return;
            setCurrentLevel(dashboardResponse.levelId);
            setClassLink(dashboardResponse.latestLink);
            setApiError(null);
            setProgress(dashboardResponse.levelsPercentage);
            // Fetch practice data
            try {
              const practiceRes = await getPracticeProgressRequest('flashcards', 'addition', authToken!);
              if (practiceRes.status === 200) {
                const practiceData = practiceRes.data.practiceProgress;
                if (!isMounted) return;
                setDashboardData({
                  ...dashboardResponse,
                  practiceStats: practiceData ? {
                    totalSessions: practiceData.totalSessions || 0,
                    totalPracticeTime: practiceData.totalTime || 0,
                    totalProblemsSolved: practiceData.totalProblemsSolved || 0,
                    totalQuestionsAttempted: practiceData.totalQuestionsAttempted || 0,
                    averageTimePerSession: practiceData.averageTimePerSession || 0,
                    averageProblemsPerSession: practiceData.averageProblemsPerSession || 0,
                    recentSessions: practiceData.recentSessions || 0,
                    practiceSessions: practiceData.practiceSessions || []
                  } : null
                });
              } else {
                setDashboardData(dashboardResponse);
              }
            } catch (practiceError) {
              setDashboardData(dashboardResponse);
            }
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
    intervalId = setInterval(getDashboardData, 10000); // Poll every 10 seconds
    return () => {
      isMounted = false;
      if (intervalId) clearInterval(intervalId);
    };
  }, [authToken, isAuthenticated, incrementStreak, addCoins]);

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
              <div className="px-6 pt-2 tablet:p-10 desktop:px-24 space-y-6 bg-black min-h-screen">
                {/* 🔝 HEADER AREA */}
                <div className="bg-black hover:bg-[#191919] transition-colors text-white p-8 rounded-2xl border border-gold/50 ring-1 ring-white/5 backdrop-blur-xl shadow-[0_12px_36px_rgba(0,0,0,0.65)] relative overflow-hidden">
                  {/* Subtle gold glow overlays */}
                  <div className="pointer-events-none absolute -inset-14 bg-[radial-gradient(circle_at_top_left,rgba(255,186,8,0.08),transparent_40%),radial-gradient(circle_at_bottom_right,rgba(250,163,7,0.06),transparent_45%)]"></div>
                  {/* Glass highlight lines */}
                  <div className="pointer-events-none absolute inset-x-0 top-0 h-px bg-white/10"></div>
                  <div className="pointer-events-none absolute inset-x-0 bottom-0 h-px bg-black/40"></div>
                  <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-gold via-lightGold to-gold"></div>
                  {/* Top Row - Greeting with Join Class */}
                  <div className="flex items-start justify-between mb-4">
                    <div>
                      <h1 className="text-4xl font-bold mb-3 text-white">
                        Welcome back, {user?.name.first || 'Student'}! 👋
                      </h1>
                      {/* Stats under name */}
                      <div className="flex items-center space-x-4">
                        <span className="bg-[#080808]/80 hover:bg-[#191919] text-white font-bold px-3 py-2 rounded-xl border border-gold/50 ring-1 ring-white/5 shadow-lg backdrop-blur-md transition-colors duration-200">
                          <span className="text-lg mr-1">⚡</span>
                          <span>{coins.toLocaleString()} XP</span>
                        </span>
                        <span className="bg-[#080808]/80 hover:bg-[#191919] text-white font-bold px-3 py-2 rounded-xl border border-gold/50 ring-1 ring-white/5 shadow-lg backdrop-blur-md transition-colors duration-200">
                          <span className="text-lg mr-1">🔥</span>
                          <span>{currentStreak} Day Streak</span>
                        </span>
                      </div>
                    </div>
                    <JoinClassButton classLink={classLink!} />
                  </div>
                  
                  {/* Level/XP and Continue Learning - Full Width */}
                  <div className="flex items-center space-x-3 bg-[#080808]/80 hover:bg-[#191919] transition-colors backdrop-blur-xl px-6 py-4 rounded-2xl border border-gold/30 ring-1 ring-white/5 shadow-[0_8px_24px_rgba(0,0,0,0.5)] mb-6 relative overflow-hidden">
                    <div className="pointer-events-none absolute -inset-10 bg-[radial-gradient(circle_at_left,rgba(255,186,8,0.10),transparent_42%)]"></div>
                    
                    <div className="relative z-10 flex items-center justify-center w-16 h-16 bg-[#080808]/80 rounded-2xl border border-gold/50 ring-1 ring-white/5 shadow-[0_6px_18px_rgba(0,0,0,0.5)]">
                      <span className="text-2xl">📚</span>
                    </div>
                    <div className="flex flex-col min-w-0 flex-1 relative z-10">
                      <span className="text-xl font-bold text-gold mb-2">
                        Level {currentLevel} • {Math.floor((progress[currentLevel] || 0) * 15)} / 1500 XP
                      </span>
                      <div className="flex justify-between items-center mb-3">
                        <span className="text-sm text-white/80 font-semibold">Progress</span>
                        <span className="text-sm font-bold text-gold">{Math.round(Math.max((progress[currentLevel] || 0) * 100, 40))}%</span>
                      </div>
                                              {/* Enhanced Progress Bar */}
                        <div className="w-full bg-[#0e0e0e]/80 rounded-full h-5 shadow-inner mb-3 relative overflow-hidden border border-gold/30 ring-1 ring-white/5">
                          <div 
                            className="bg-gold h-5 rounded-full transition-all duration-700 shadow-[0_0_16px_rgba(255,186,8,0.30)] relative overflow-hidden"
                            style={{ width: `${Math.max((progress[currentLevel] || 0) * 100, 40)}%` }}
                          />
                        </div>
                                              <div className="flex justify-between items-center">
                          <span className="text-sm text-white/70 font-medium">
                            {Math.round(Math.max((progress[currentLevel] || 0) * 100, 40))}% to next level
                          </span>
                          <Link
                            to={`/student/level/${currentLevel}`}
                            className="inline-block bg-[#080808]/80 hover:bg-[#191919] text-white font-bold py-2 px-4 rounded-xl border border-gold/50 ring-1 ring-white/5 shadow-[0_8px_20px_rgba(0,0,0,0.45)] transition-colors duration-200 backdrop-blur-md"
                          >
                            ⚡ Resume Learning
                          </Link>
                        </div>
                    </div>
                  </div>
                </div>
                
                {/* 🎯 WEEKLY GOALS moved to Progress tab */}

                {/* 🧠 DASHBOARD OVERVIEW */}
                <div className="bg-[#080808] hover:bg-[#1b1b1b] transition-colors backdrop-blur-xl text-white p-8 rounded-2xl border border-gold/50 shadow-2xl shadow-black/50 relative overflow-hidden">
                  {/* Animated background elements */}
                  <div className="absolute inset-0 bg-gradient-to-r from-blue-500/5 via-transparent to-purple-500/5 animate-pulse"></div>
                  <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-blue-400 via-purple-500 to-indigo-500"></div>
                  
                  <div className="relative z-10">
                    <h2 className="text-3xl font-bold mb-8 flex items-center text-white">
                      <span className="mr-3 text-3xl">🧠</span>
                      Dashboard Overview
                    </h2>
                    
                                         {/* 3x1 Grid Layout */}
                     <div className="grid grid-cols-3 gap-6">
                       <div className="bg-[#080808]/80 hover:bg-[#191919] backdrop-blur-xl p-6 rounded-2xl border border-gold/40 ring-1 ring-white/5 shadow-xl transition-all duration-500 hover:border-gold hover:shadow-[0_0_40px_rgba(255,186,8,0.25)] hover:scale-105 group relative overflow-hidden">
                         {/* Glassmorphism overlay on hover */}
                         <div className="absolute inset-0 bg-gradient-to-br from-black/20 via-transparent to-[#FFD700]/10 opacity-0 group-hover:opacity-100 transition-opacity duration-500 rounded-2xl"></div>
                         <div className="absolute inset-0 bg-gradient-to-r from-transparent via-[#FFD700]/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-700 animate-pulse rounded-2xl"></div>
                         <div className="relative z-10">
                           <SessionsBar sessionsCompleted={dashboardData?.practiceStats?.recentSessions || 0} totalSessions={5} />
                         </div>
                       </div>
                       <div className="bg-[#080808]/80 hover:bg-[#191919] backdrop-blur-xl p-6 rounded-2xl border border-gold/40 ring-1 ring-white/5 shadow-xl transition-all duration-500 hover:border-gold hover:shadow-[0_0_40px_rgba(255,186,8,0.25)] hover:scale-105 group relative overflow-hidden">
                         {/* Glassmorphism overlay on hover */}
                         <div className="absolute inset-0 bg-gradient-to-br from-black/20 via-transparent to-[#FFD700]/10 opacity-0 group-hover:opacity-100 transition-opacity duration-500 rounded-2xl"></div>
                         <div className="absolute inset-0 bg-gradient-to-r from-transparent via-[#FFD700]/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-700 animate-pulse rounded-2xl"></div>
                         <div className="relative z-10">
                           <BoltGoalsSection 
                             sessionsCompleted={dashboardData?.practiceStats?.recentSessions || 0}
                             totalSessions={5}
                           />
                         </div>
                       </div>
                       <div className="bg-[#080808]/80 hover:bg-[#191919] backdrop-blur-xl p-6 rounded-2xl border border-gold/40 ring-1 ring-white/5 shadow-xl transition-all duration-500 hover:border-gold hover:shadow-[0_0_40px_rgba(255,186,8,0.25)] hover:scale-105 group relative overflow-hidden">
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
                <div className="bg-[#080808] hover:bg-[#1b1b1b] transition-colors backdrop-blur-xl text-white p-8 rounded-2xl border border-gold/50 shadow-2xl shadow-black/50 relative overflow-hidden">
                  {/* Animated background elements */}
                  <div className="absolute inset-0 bg-gradient-to-r from-green-500/5 via-transparent to-blue-500/5 animate-pulse"></div>
                  <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-green-400 via-blue-500 to-purple-500"></div>
                  
                  <div className="relative z-10">
                    <ShortcutsGrid />
                  </div>
                </div>
                
                {/* 🏆 THIS WEEK'S POWER & LIGHTNING ACHIEVEMENTS (2x1 Layout) */}
                <div className="grid grid-cols-2 gap-6">
                  <div className="bg-[#080808] hover:bg-[#1b1b1b] transition-colors backdrop-blur-xl text-white p-8 rounded-2xl border border-gold/50 shadow-2xl shadow-black/50 relative overflow-hidden">
                    {/* Animated background elements */}
                    <div className="absolute inset-0 bg-gradient-to-r from-purple-500/5 via-transparent to-pink-500/5 animate-pulse"></div>
                    <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-purple-400 via-pink-500 to-red-500"></div>
                    
                                           <div className="relative z-10">
                         <WeeklyStatsSection
                           sessions={dashboardData?.practiceStats?.totalSessions || 0}
                           accuracy={
                             dashboardData?.practiceStats?.totalQuestionsAttempted > 0
                               ? Math.round((dashboardData.practiceStats.totalProblemsSolved / dashboardData.practiceStats.totalQuestionsAttempted) * 100)
                               : 0
                           }
                           timeSpent={(() => {
                             const totalSeconds = dashboardData?.practiceStats?.totalPracticeTime || 0;
                             const hours = Math.floor(totalSeconds / 3600);
                             const minutes = Math.floor((totalSeconds % 3600) / 60);
                             return `${hours}h ${minutes}m`;
                           })()}
                         />
                       </div>
                  </div>
                  <div className="bg-[#080808] hover:bg-[#1b1b1b] transition-colors backdrop-blur-xl text-white p-8 rounded-2xl border border-gold/50 shadow-2xl shadow-black/50 relative overflow-hidden">
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
