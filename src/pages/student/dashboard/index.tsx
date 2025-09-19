import { FC, useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { isAxiosError } from 'axios';

import SeoComponent from '@components/atoms/SeoComponent';
import ErrorBox from '@components/organisms/ErrorBox';
import LoadingBox from '@components/organisms/LoadingBox';
import DebugConsole from '@components/atoms/DebugConsole';
import SpotlightCard from '@components/atoms/SpotlightCard';
import TodoListSection from '@components/sections/student/dashboard/TodoListSection';
import ShortcutsGrid from '@components/sections/student/dashboard/ShortcutsGrid';
import SplitText from '@components/atoms/SplitText';
import CountUp from '@components/atoms/CountUp';
import JoinClassButton from '@components/atoms/JoinClassButton';
// import WeeklyGoalsSection from '@components/sections/student/dashboard/WeeklyGoalsSection';
// import AchievementsSection from '@components/sections/student/dashboard/AchievementsSection';

import { getPracticeProgressRequest, getProgressRequest, dashboardRequestV2 } from '@services/student';
import { useAuthStore } from '@store/authStore';
import { getLevelName } from '@helpers/levelNames';
import { useStreakStore } from '@store/streakStore';
import { useExperienceStore } from '@store/experienceStore';
import { useWeeklyStatsStore } from '@store/weeklyStatsStore';
import { useTodoListStore } from '@store/todoListStore';
import { getActivities, ActivityItem } from '@helpers/activity';
import axios from '@helpers/axios';
import { STUDENT_LEADERBOARD, LOGIN_PAGE } from '@constants/routes';
// import StreakTest from '@components/atoms/StreakTest';
import { MESSAGES, ERRORS } from '@constants/app';
import { STUDENT_DASHBOARD } from '@constants/routes';
import {
  LevelsPercentage,
  DashboardResponseV2,
} from '@interfaces/apis/student';

export interface StudentDashboardPageProps {}

const StudentDashboardPage: FC<StudentDashboardPageProps> = () => {
  const authToken = useAuthStore((state) => state.authToken);
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);
  const user = useAuthStore((state) => state.user);

  const [loading, setLoading] = useState(true);
  const [progress, setProgress] = useState<LevelsPercentage>({});
  const [dashboardData, setDashboardData] = useState<any>(null);
  const [currentLevelProgressPct, setCurrentLevelProgressPct] = useState<number>(0);
  const [currentLevel, setCurrentLevel] = useState<number>(1);
  const [classLink, setClassLink] = useState<string>('');
  const [apiError, setApiError] = useState<string | null>(null);
  const [fallBackLink, setFallBackLink] = useState<string>(STUDENT_DASHBOARD);
  const [fallBackAction, setFallBackAction] = useState<string>(MESSAGES.TRY_AGAIN);
  const { currentStreak, fetchStreak, updateStreak } = useStreakStore();
  const { experience_points, level, syncWithBackend } = useExperienceStore();
  const { accuracy, time_spent_formatted, /* fetchWeeklyStats,*/ setWeeklyStats } = useWeeklyStatsStore() as any;
  const [computedTimeFormatted, setComputedTimeFormatted] = useState<string>('0h 0m');
  const [calculatedAccuracy, setCalculatedAccuracy] = useState<number>(0);
  const [calculatedTimeSpent, setCalculatedTimeSpent] = useState<string>('0h 0m');
  const { todos, completed_todos, pending_todos, fetchTodoList } = useTodoListStore();
  const [recentActivities, setRecentActivities] = useState<ActivityItem[]>([]);
  const [topLeaderboard, setTopLeaderboard] = useState<any[]>([]);

  // Helper function to get activity icon
  const getActivityIcon = (type: string) => {
    switch (type) {
      case 'practice': return '📚';
      case 'pvp': return '⚔️';
      case 'streak': return '🔥';
      case 'level': return '🎯';
      case 'test': return '✅';
      case 'classwork': return '🏫';
      case 'homework': return '📝';
      case 'achievement': return '🏆';
      default: return '📌';
    }
  };

  // Helper function to format time ago
  const getTimeAgo = (timestamp: number) => {
    const now = Date.now();
    const diff = now - timestamp;
    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(diff / 3600000);
    const days = Math.floor(diff / 86400000);
    
    if (minutes < 60) return `${minutes}m ago`;
    if (hours < 24) return `${hours}h ago`;
    return `${days}d ago`;
  };

  // Helper function to calculate accuracy and time from practice stats
  const calculateStatsFromPracticeData = (practiceStats: any) => {
    if (!practiceStats) return { accuracy: 0, timeSpent: '0h 0m' };

    let totalQuestions = 0;
    let totalCorrect = 0;
    let totalTimeSeconds = 0;

    // Calculate from detailed problem times if available
    if (practiceStats.practiceSessions && Array.isArray(practiceStats.practiceSessions)) {
      for (const session of practiceStats.practiceSessions) {
        if (session.problemTimes && Array.isArray(session.problemTimes)) {
          // Use detailed problem times
          for (const problemTime of session.problemTimes) {
            totalQuestions += 1;
            if (problemTime.isCorrect) {
              totalCorrect += 1;
            }
            totalTimeSeconds += problemTime.timeSpent || 0;
          }
        } else {
          // Fallback to session-level data
          totalQuestions += session.numberOfQuestions || 0;
          totalCorrect += session.score || 0;
          totalTimeSeconds += session.totalTime || 0;
        }
      }
    } else {
      // Fallback to aggregated data
      totalQuestions = practiceStats.totalQuestions || 0;
      totalCorrect = practiceStats.totalCorrectAnswers || 0;
      totalTimeSeconds = practiceStats.totalTimeSpent || 0;
    }

    const accuracy = totalQuestions > 0 ? Math.round((totalCorrect / totalQuestions) * 100) : 0;
    
    // Format time spent
    const hours = Math.floor(totalTimeSeconds / 3600);
    const minutes = Math.floor((totalTimeSeconds % 3600) / 60);
    const timeSpent = hours > 0 ? `${hours}h ${minutes}m` : `${minutes}m`;

    return { accuracy, timeSpent };
  };

  useEffect(() => {
    let intervalId: NodeJS.Timeout | null = null;
    let isMounted = true;
    
    const getDashboardData = async () => {
      console.log('🔄 [Dashboard] Starting data fetch...', {
        isAuthenticated,
        hasAuthToken: !!authToken,
        timestamp: new Date().toISOString()
      });

      if (isAuthenticated) {
        try {
          console.log('📡 [Dashboard] Making API request to dashboard...');
          const res = await dashboardRequestV2(authToken!);
          console.log('✅ [Dashboard] Dashboard API response received:', {
            status: res.status,
            dataKeys: Object.keys(res.data || {}),
            timestamp: new Date().toISOString()
          });

          if (res.status === 200) {
            const dashboardResponse: DashboardResponseV2 = res.data;
            if (!isMounted) return;
            
            console.log('📊 [Dashboard] Processing dashboard data:', {
              levelId: dashboardResponse.levelId,
              hasLatestLink: !!dashboardResponse.latestLink,
              levelsPercentageKeys: Object.keys(dashboardResponse.levelsPercentage || {}),
              timestamp: new Date().toISOString()
            });

            setCurrentLevel(dashboardResponse.levelId);
            setClassLink(dashboardResponse.latestLink);
            setApiError(null);
            setProgress(dashboardResponse.levelsPercentage);
            
            // Fetch practice data
            try {
              console.log('📡 [Dashboard] Fetching practice progress...');
              const practiceRes = await getPracticeProgressRequest('flashcards', 'addition', authToken!);
              console.log('✅ [Dashboard] Practice progress response:', {
                status: practiceRes.status,
                hasData: !!practiceRes.data?.practiceProgress,
                timestamp: new Date().toISOString()
              });

              if (practiceRes.status === 200) {
                const practiceData = practiceRes.data.practiceProgress;
                if (!isMounted) return;
                
                const practiceStats = practiceData ? {
                  totalSessions: practiceData.totalSessions || 0,
                  totalPracticeTime: practiceData.totalTime || 0,
                  totalProblemsSolved: practiceData.totalProblemsSolved || 0,
                  totalQuestionsAttempted: practiceData.totalQuestionsAttempted || 0,
                  averageTimePerSession: practiceData.averageTimePerSession || 0,
                  averageProblemsPerSession: practiceData.averageProblemsPerSession || 0,
                  recentSessions: practiceData.recentSessions || 0,
                  practiceSessions: practiceData.practiceSessions || []
                } : null;
                
                // Calculate accuracy and time spent from practice data
                const { accuracy: calculatedAcc, timeSpent: calculatedTime } = calculateStatsFromPracticeData(practiceStats);
                setCalculatedAccuracy(calculatedAcc);
                setCalculatedTimeSpent(calculatedTime);
                
                setDashboardData({
                  ...dashboardResponse,
                  practiceStats
                });
                console.log('✅ [Dashboard] Practice stats processed successfully', {
                  calculatedAccuracy: calculatedAcc,
                  calculatedTimeSpent: calculatedTime
                });
              } else {
                setDashboardData(dashboardResponse);
                console.log('⚠️ [Dashboard] Practice stats failed, using dashboard data only');
              }
            } catch (practiceError) {
              console.warn('⚠️ [Dashboard] Practice data fetch failed:', practiceError);
              setDashboardData(dashboardResponse);
            }
            
            // Compute current level progress from detailed progress data
            try {
              const progressRes = await getProgressRequest(authToken!);
              if (!isMounted) return;
              if (progressRes.status === 200 && progressRes.data?.levels) {
                const levels = progressRes.data.levels as any[];
                const currentLevelId = dashboardResponse.levelId;
                const levelData = levels.find((lvl: any) => lvl.levelId === currentLevelId);
                if (levelData && Array.isArray(levelData.classes)) {
                  let completed = 0;
                  let total = 0;
                  let totalMinutes = 0;
                  let totalActivities = 0;
                  let classesCompleted = 0;
                  const TOTAL_CLASSES_PER_LEVEL = 12;
                  for (const classItem of levelData.classes) {
                    const topics = Array.isArray(classItem.topics) ? classItem.topics : [];
                    let classCompleted = false;
                    if (classItem.Test && classItem.Test > 0) {
                      classCompleted = true;
                      totalActivities += 1;
                      totalMinutes += Math.round((classItem.Time || 0) / 60);
                    }
                    for (const topic of topics) {
                      if (topic.Classwork && topic.Classwork > 0) {
                        classCompleted = true;
                        totalActivities += 1;
                        totalMinutes += Math.round((topic.ClassworkTime || 0) / 60);
                      }
                      if (topic.Homework && topic.Homework > 0) {
                        classCompleted = true;
                        totalActivities += 1;
                        totalMinutes += Math.round((topic.HomeworkTime || 0) / 60);
                      }
                    }
                    if (classCompleted) classesCompleted += 1;
                  }
                  const pct = Math.min(100, Math.round((classesCompleted / TOTAL_CLASSES_PER_LEVEL) * 100));
                  setCurrentLevelProgressPct(pct);
                  // Provide fallback weekly stats when API fails later
                  const hours = Math.floor(totalMinutes / 60);
                  const minutes = totalMinutes % 60;
                  setWeeklyStats({
                    sessions: totalActivities,
                    accuracy: accuracy || 0,
                    time_spent_hours: hours,
                    time_spent_minutes: minutes,
                    time_spent_formatted: `${hours}h ${minutes}m`,
                  });
                  setComputedTimeFormatted(`${hours}h ${minutes}m`);
                } else {
                  setCurrentLevelProgressPct(0);
                }
              }
            } catch (e) {
              // Fallback to provided percentage if detailed call fails
              const fallbackPct = Math.min(100, Math.round((dashboardResponse.levelsPercentage?.[dashboardResponse.levelId] || 0) * 100));
              setCurrentLevelProgressPct(fallbackPct);
            }
            
            // Fetch streak data
            console.log('🔄 [Dashboard] Fetching streak data...');
            try {
              await fetchStreak();
              console.log('✅ [Dashboard] Streak data fetched successfully');
            } catch (streakError) {
              console.error('❌ [Dashboard] Streak fetch failed:', streakError);
            }
            
            // Update streak for daily activity
            console.log('🔄 [Dashboard] Updating streak for daily activity...');
            try {
              await updateStreak();
              console.log('✅ [Dashboard] Streak updated successfully');
            } catch (streakUpdateError) {
              console.error('❌ [Dashboard] Streak update failed:', streakUpdateError);
            }
            
            // Sync experience data from backend
            console.log('🔄 [Dashboard] Syncing experience data...');
            try {
              await syncWithBackend();
              console.log('✅ [Dashboard] Experience data synced successfully');
            } catch (expError) {
              console.error('❌ [Dashboard] Experience sync failed:', expError);
            }
            
            // Skip weeklyStats API (unstable). Using computed fallback above.
            
            // Fetch todo list
            console.log('🔄 [Dashboard] Fetching todo list...');
            try {
              await fetchTodoList();
              console.log('✅ [Dashboard] Todo list fetched successfully');
            } catch (todoError) {
              console.error('❌ [Dashboard] Todo list fetch failed:', todoError);
            }
            
            // Load recent activities from archives
            console.log('🔄 [Dashboard] Loading recent activities...');
            try {
              const activities = getActivities();
              setRecentActivities(activities.slice(0, 4)); // Get latest 4 activities
              console.log('✅ [Dashboard] Recent activities loaded successfully');
            } catch (activityError) {
              console.error('❌ [Dashboard] Activities load failed:', activityError);
            }
            
            // Load top 5 leaderboard
            console.log('🔄 [Dashboard] Loading top leaderboard...');
            try {
              const res = await axios.post('/getPVPLeaderboard/', {}, {
                headers: { 'AUTH-TOKEN': authToken },
              });
              if (res.status === 200 && res.data.success && res.data.data.leaderboard) {
                const top5 = res.data.data.leaderboard.slice(0, 5).map((player: any) => ({
                  rank: player.rank,
                  name: player.name,
                  xp: player.experience_points,
                  level: player.level,
                  userId: player.user_id
                }));
                setTopLeaderboard(top5);
                console.log('✅ [Dashboard] Top leaderboard loaded successfully');
              } else {
                setTopLeaderboard([]);
              }
            } catch (leaderboardError) {
              console.error('❌ [Dashboard] Leaderboard load failed:', leaderboardError);
              setTopLeaderboard([]);
            }
            
            console.log('✅ [Dashboard] All data processing completed successfully');
          }
        } catch (error) {
          console.error('❌ [Dashboard] API Error:', {
            error,
            isAxiosError: isAxiosError(error),
            status: isAxiosError(error) ? error.response?.status : 'unknown',
            message: isAxiosError(error) ? error.message : 'Unknown error',
            responseData: isAxiosError(error) ? error.response?.data : null,
            timestamp: new Date().toISOString()
          });

          if (isAxiosError(error)) {
            const status = error.response?.status;
            if (status === 401) {
              console.error('🚫 [Dashboard] Authentication Error:', {
                status,
                message: error.response?.data?.error || error.response?.data?.message || ERRORS.SERVER_ERROR
              });
              setApiError(
                error.response?.data?.error ||
                  error.response?.data?.message ||
                  ERRORS.SERVER_ERROR
              );
              setFallBackLink(LOGIN_PAGE);
              setFallBackAction(MESSAGES.GO_LOGIN);
            } else {
              console.error('🔥 [Dashboard] Server Error:', {
                status,
                message: error.message
              });
              setApiError(ERRORS.SERVER_ERROR);
            }
          } else {
            console.error('💥 [Dashboard] Unknown Error:', error);
            setApiError(ERRORS.SERVER_ERROR);
          }
        } finally {
          setLoading(false);
          console.log('🏁 [Dashboard] Data fetch completed');
        }
      } else {
        console.warn('⚠️ [Dashboard] User not authenticated, redirecting to login');
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
  }, [authToken, isAuthenticated, updateStreak, syncWithBackend, fetchStreak, fetchTodoList]);

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
              <div className="space-y-4 tablet:space-y-6 bg-black min-h-screen">
                {/* 🔝 HEADER AREA */}
                 <SpotlightCard className="text-white group" spotlightColor="rgba(255, 186, 8, 0.12)">
                  {/* Top Row - Greeting with Join Class and Stats */}
                  <div className="flex flex-col tablet:flex-row tablet:items-start tablet:justify-between mb-4 space-y-4 tablet:space-y-0">
                    <div className="flex-1">
                       <SplitText
                         text={`Welcome back, ${user?.name.first || 'Student'}`}
                         className="text-2xl tablet:text-3xl font-bold mb-2 text-white transition-all duration-300 hover:scale-105"
                         tag="h1"
                         delay={50}
                         duration={0.8}
                         ease="power3.out"
                         splitType="chars"
                         from={{ opacity: 0, y: 30 }}
                         to={{ opacity: 1, y: 0 }}
                         threshold={0.1}
                         rootMargin="-50px"
                         textAlign="left"
                       />
                       <p className="text-sm text-[#818181] mb-3">
                         Ready to <span className="text-gold">bolt</span> ahead with your math skills today?
                       </p>
                    </div>
                    <div className="flex flex-col tablet:flex-row tablet:items-center space-y-3 tablet:space-y-0 tablet:space-x-3">
                      {/* Stats beside Join Class */}
                      <div className="flex flex-col tablet:flex-row tablet:items-center space-y-2 tablet:space-y-0 tablet:space-x-3">
                         <span className="bg-[#212124] hover:bg-[#3a3a3d] group-hover:bg-[#2a2a2d] text-white font-bold px-3 py-2 rounded-xl transition-all duration-300 hover:scale-105">
                          <span className="text-lg mr-1">⚡</span>
                          <CountUp 
                            to={experience_points} 
                            duration={2}
                            separator=","
                            className="font-bold"
                          /> XP
                        </span>
                         <span className="bg-[#212124] hover:bg-[#3a3a3d] group-hover:bg-[#2a2a2d] text-white font-bold px-3 py-2 rounded-xl transition-all duration-300 hover:scale-105">
                          <span className="text-lg mr-1">🔥</span>
                          <span>{currentStreak} Day Streak</span>
                        </span>
                      </div>
                      <div className="flex-shrink-0">
                        <JoinClassButton classLink={classLink!} />
                      </div>
                    </div>
                  </div>
                  
                  {/* Level/XP and Personal Goals - Side by Side Layout */}
                  <div className="grid grid-cols-1 tablet:grid-cols-2 gap-4 tablet:gap-6 mb-6">
                    {/* Class Level Progress */}
                    <div className="flex flex-col tablet:flex-row tablet:items-center space-y-1 tablet:space-y-0 tablet:space-x-2 bg-[#212124] hover:bg-[#2a2a2d] transition-all duration-300 px-2 py-1 rounded-lg relative overflow-hidden hover:scale-[1.01]">
                      <div className="pointer-events-none absolute -inset-10 bg-[radial-gradient(circle_at_left,rgba(107,114,128,0.10),transparent_42%)]"></div>
                      
                      <div className="relative z-10 flex items-center justify-center w-10 h-10 tablet:w-12 tablet:h-12 bg-[#2a2a2d] rounded-xl hover:scale-110 hover:rotate-12 hover:bg-gold transition-all duration-300">
                        <span className="text-xl tablet:text-2xl hover:scale-125 transition-transform duration-300">📚</span>
                      </div>
                      <div className="flex flex-col min-w-0 flex-1 relative z-10">
                        <span className="text-lg tablet:text-xl font-bold text-gold mb-1">
                          {getLevelName(currentLevel)}, Conquest {dashboardData?.latestClass || 1}
                        </span>
                        <div className="flex justify-between items-center mb-1">
                          <span className="text-sm text-white/80 font-semibold">Progress</span>
                          <span className="text-sm font-bold text-gold">{currentLevelProgressPct}%</span>
                        </div>
                        {/* Enhanced Progress Bar */}
                        <div className="w-full bg-[#0e0e0e]/50 rounded-full h-3 tablet:h-4 shadow-inner mb-1 relative overflow-hidden border border-gold/40 ring-1 ring-gold/20">
                          <div 
                            className="bg-gold h-3 tablet:h-4 rounded-full transition-all duration-700 shadow-[0_0_16px_rgba(255,186,8,0.30)] relative overflow-hidden"
                            style={{ width: `${currentLevelProgressPct}%` }}
                          />
                        </div>
                        <div className="flex flex-col tablet:flex-row tablet:justify-between tablet:items-center space-y-2 tablet:space-y-0">
                          <span className="text-sm text-white/70 font-medium">
                            {currentLevelProgressPct}% completed
                          </span>
                          <Link
                            to={`/student/level/${currentLevel}`}
                             className="inline-block bg-[#2a2a2d] hover:bg-gold text-white font-bold py-2 px-4 rounded-xl transition-all duration-300 hover:scale-105 text-center"
                          >
                            ⚡ Resume Learning
                          </Link>
                        </div>
                        
                        {/* Weekly Stats */}
                        <div className="mt-2 grid grid-cols-2 gap-2">
                          <div className="bg-[#2a2a2d] hover:bg-[#3a3a3d] p-3 rounded-lg text-center transition-all duration-300 border border-gold/20">
                            <div className="flex items-center justify-center space-x-1 mb-1">
                              <span className="text-base">🎯</span>
                              <span className="text-xs text-white/80 font-medium">Accuracy</span>
                            </div>
                            <div className="text-lg font-bold text-gold">
                              {calculatedAccuracy || accuracy || 0}%
                            </div>
                          </div>
                          
                          <div className="bg-[#2a2a2d] hover:bg-[#3a3a3d] p-3 rounded-lg text-center transition-all duration-300 border border-gold/20">
                            <div className="flex items-center justify-center space-x-1 mb-1">
                              <span className="text-base">⏱️</span>
                              <span className="text-xs text-white/80 font-medium">Time Spent</span>
                            </div>
                            <div className="text-lg font-bold text-gold">
                              {calculatedTimeSpent || time_spent_formatted || computedTimeFormatted}
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Personal Goals */}
                    <div className="bg-[#212124] hover:bg-[#2a2a2d] transition-all duration-300 px-4 tablet:px-6 py-4 rounded-2xl relative overflow-hidden hover:scale-[1.01]">
                      <div className="pointer-events-none absolute -inset-10 bg-[radial-gradient(circle_at_right,rgba(107,114,128,0.10),transparent_42%)]"></div>
                      <div className="relative z-10">
                        <TodoListSection 
                          accuracy={accuracy || 0}
                          timeSpent={time_spent_formatted || computedTimeFormatted}
                        />
                      </div>
                    </div>
                  </div>
                </SpotlightCard>
                
                {/* 🎯 WEEKLY GOALS moved to Progress tab */}
                
                 {/* 📂 SHORTCUTS GRID */}
                 <ShortcutsGrid />
                
                 {/* ⚡ RECENT ACTIVITY & LEADERBOARD (2x1 Layout) */}
                 <div className="grid grid-cols-1 tablet:grid-cols-2 gap-4 tablet:gap-6">
                   {/* Recent Activity Section */}
                   <SpotlightCard className="text-white" spotlightColor="rgba(255, 186, 8, 0.08)">
                     <div className="relative z-10">
                       <h2 className="text-xl font-bold mb-6 flex items-center text-white hover:text-gold transition-colors duration-300">
                         <span className="mr-2 hover:scale-125 hover:rotate-12 transition-transform duration-300">⚡</span>
                         Recent Activity
                       </h2>
                       
                       <div className="space-y-4">
                         {recentActivities.length === 0 ? (
                           <div className="text-center py-8">
                             <div className="text-4xl mb-2">📚</div>
                             <p className="text-sm text-[#818181]">No recent activities</p>
                             <p className="text-xs text-[#818181]">Start practicing to see your activity here!</p>
                           </div>
                         ) : (
                           recentActivities.map((activity) => (
                             <div key={activity.id} className="flex items-center justify-between p-3 bg-[#212124] rounded-lg hover:bg-[#2a2a2d] hover:scale-[1.02] transition-all duration-300">
                               <div className="flex items-center space-x-3">
                                 <span className="text-lg hover:scale-125 hover:rotate-12 transition-transform duration-300">{getActivityIcon(activity.type)}</span>
                                 <div>
                                   <span className="text-sm text-white">{activity.title}</span>
                                   <p className="text-xs text-[#818181]">{getTimeAgo(activity.timestamp)}</p>
                                 </div>
                               </div>
                               {activity.xp && (
                                 <span className="text-sm font-bold text-gold">+{activity.xp} XP</span>
                               )}
                             </div>
                           ))
                         )}
                       </div>
                     </div>
                   </SpotlightCard>
                   
                   {/* Lightning Leaderboard Section */}
                   <SpotlightCard className="text-white" spotlightColor="rgba(255, 186, 8, 0.08)">
                     <div className="relative z-10">
                       <div className="flex items-center justify-between mb-6">
                         <h2 className="text-xl font-bold flex items-center text-white hover:text-gold transition-colors duration-300">
                           <span className="mr-2 hover:scale-125 hover:rotate-12 transition-transform duration-300">⚡</span>
                           Lightning Leaderboard
                         </h2>
                         <Link
                           to={STUDENT_LEADERBOARD}
                           className="bg-[#212124] hover:bg-gold text-white px-4 py-2 rounded-lg transition-all duration-300 text-sm font-semibold hover:scale-105"
                         >
                           View Full ⚡
                         </Link>
                       </div>
                       
                       <div className="space-y-3">
                         {topLeaderboard.length === 0 ? (
                           <div className="text-center py-8">
                             <div className="text-4xl mb-2">🏆</div>
                             <p className="text-sm text-[#818181]">No leaderboard data available</p>
                             <p className="text-xs text-[#818181]">Start playing to see rankings!</p>
                           </div>
                         ) : (
                           topLeaderboard.map((player, index) => (
                             <div key={player.userId} className="flex items-center justify-between p-3 bg-[#212124] rounded-lg hover:bg-[#2a2a2d] hover:scale-[1.02] transition-all duration-300">
                               <div className="flex items-center space-x-3">
                                 <div className="flex items-center justify-center w-8 h-8 rounded-full bg-[#2a2a2d] hover:scale-110 hover:bg-gold transition-all duration-300">
                                   <span className="text-sm font-bold text-gold hover:scale-125 transition-transform duration-300">#{player.rank}</span>
                                 </div>
                                 <div>
                                   <span className="text-sm text-white font-medium">{player.name}</span>
                                   <p className="text-xs text-[#818181]">{getLevelName(player.level)}</p>
                                 </div>
                               </div>
                               <span className="text-sm font-bold text-gold">{player.xp.toLocaleString()} XP</span>
                             </div>
                           ))
                         )}
                       </div>
                     </div>
                   </SpotlightCard>
                 </div>
                 
                  {/* ACHIEVEMENTS SECTION COMMENTED OUT - CLIENT DOES NOT WANT THIS FEATURE */}
                  {/* <div className="bg-[#080808] hover:bg-[#1b1b1b] transition-colors backdrop-blur-xl text-white p-8 rounded-2xl border border-gold/50 shadow-2xl shadow-black/50 relative overflow-hidden">
                    <div className="absolute inset-0 bg-gradient-to-r from-gold/8 via-transparent to-gold/5 animate-pulse"></div>
                    <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-gray-500 via-gray-400 to-gray-300"></div>
                    
                    <div className="relative z-10">
                      <AchievementsSection />
                    </div>
                  </div> */}
                
                {/* 🧪 STREAK TEST COMPONENT COMMENTED OUT - NOT NEEDED */}
                {/* <div className="bg-[#080808] hover:bg-[#1b1b1b] transition-colors backdrop-blur-xl text-white p-8 rounded-2xl border border-gold/50 shadow-2xl shadow-black/50 relative overflow-hidden">
                  <div className="relative z-10">
                    <StreakTest />
                  </div>
                </div> */}
              </div>
            </>
          )}
        </div>
      )}
      {/* DebugConsole is dev-only; keep it disabled for production */}
      {import.meta.env.DEV ? <DebugConsole /> : null}
    </div>
  );
};

export default StudentDashboardPage;
