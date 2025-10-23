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
import JoinClassButton from '@components/atoms/JoinClassButton';

import { getProgressRequest, dashboardRequestV2 } from '@services/student';
import { useAuthStore } from '@store/authStore';
import { getLevelName } from '@helpers/levelNames';
import { useStreakStore } from '@store/streakStore';
import { useWeeklyStatsStore } from '@store/weeklyStatsStore';
import { useTodoListStore } from '@store/todoListStore';
import { getActivities, ActivityItem } from '@helpers/activity';
import { calculatePracticeStats } from '@helpers/progressCalculations';
import axios from '@helpers/axios';
import { STUDENT_LEADERBOARD, LOGIN_PAGE } from '@constants/routes';
import { MESSAGES, ERRORS } from '@constants/app';
import { STUDENT_DASHBOARD } from '@constants/routes';
import { DashboardResponseV2 } from '@interfaces/apis/student';

export interface StudentDashboardPageProps {}

const StudentDashboardPage: FC<StudentDashboardPageProps> = () => {
  const authToken = useAuthStore((state) => state.authToken);
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);
  const user = useAuthStore((state) => state.user);

  const [loading, setLoading] = useState(true);
  const [dashboardData, setDashboardData] = useState<any>(null);
  const [currentLevelProgressPct, setCurrentLevelProgressPct] = useState<number>(0);
  const [currentLevel, setCurrentLevel] = useState<number>(1);
  const [classLink, setClassLink] = useState<string>('');
  const [apiError, setApiError] = useState<string | null>(null);
  const [fallBackLink, setFallBackLink] = useState<string>(STUDENT_DASHBOARD);
  const [fallBackAction, setFallBackAction] = useState<string>(MESSAGES.TRY_AGAIN);
  const { currentStreak, fetchStreak, updateStreak } = useStreakStore();
  const [experiencePoints, setExperiencePoints] = useState<number>(0);
  const { accuracy, time_spent_formatted, setWeeklyStats } = useWeeklyStatsStore() as any;
  const [computedTimeFormatted, setComputedTimeFormatted] = useState<string>('0h 0m');
  const [calculatedAccuracy, setCalculatedAccuracy] = useState<number>(0);
  const [calculatedTimeSpent, setCalculatedTimeSpent] = useState<string>('0h 0m');
  const [realmAccuracy, setRealmAccuracy] = useState<number>(0);
  const [realmTimeSpent, setRealmTimeSpent] = useState<string>('0h 0m');
  const { fetchTodoList } = useTodoListStore();
  const [recentActivities, setRecentActivities] = useState<ActivityItem[]>([]);
  const [topLeaderboard, setTopLeaderboard] = useState<any[]>([]);

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

  // Helper function to calculate accuracy and time from practice stats using unified calculation
  const calculateStatsFromPracticeData = (practiceStats: any) => {
    const stats = calculatePracticeStats(practiceStats);
    return { accuracy: stats.accuracy, timeSpent: stats.timeSpent };
  };

  // Helper function to calculate realm-specific accuracy and time from progress data
  const calculateRealmSpecificStats = (levels: any[], currentLevelId: number) => {
    const levelData = levels.find((lvl: any) => lvl.levelId === currentLevelId);
    if (!levelData || !Array.isArray(levelData.classes)) {
      return { accuracy: 0, timeSpent: '0h 0m', totalMinutes: 0 };
    }

    let totalCorrect = 0;
    let totalQuestions = 0;
    let totalMinutes = 0;
    let totalActivities = 0;

    for (const classItem of levelData.classes) {
      const topics = Array.isArray(classItem.topics) ? classItem.topics : [];
      
      // Check class test
      if (classItem.Test && classItem.Test > 0) {
        totalActivities += 1;
        totalMinutes += Math.round((classItem.Time || 0) / 60);
        // For tests, we assume the score is the percentage of correct answers
        const testScore = classItem.Test;
        const testQuestions = 10; // Assuming 10 questions per test
        totalCorrect += Math.round((testScore / 100) * testQuestions);
        totalQuestions += testQuestions;
      }

      // Check topics (classwork and homework)
      for (const topic of topics) {
        if (topic.Classwork && topic.Classwork > 0) {
          totalActivities += 1;
          totalMinutes += Math.round((topic.ClassworkTime || 0) / 60);
          // For classwork, we assume the score is the percentage of correct answers
          const classworkScore = topic.Classwork;
          const classworkQuestions = 5; // Assuming 5 questions per classwork
          totalCorrect += Math.round((classworkScore / 100) * classworkQuestions);
          totalQuestions += classworkQuestions;
        }
        
        if (topic.Homework && topic.Homework > 0) {
          totalActivities += 1;
          totalMinutes += Math.round((topic.HomeworkTime || 0) / 60);
          // For homework, we assume the score is the percentage of correct answers
          const homeworkScore = topic.Homework;
          const homeworkQuestions = 5; // Assuming 5 questions per homework
          totalCorrect += Math.round((homeworkScore / 100) * homeworkQuestions);
          totalQuestions += homeworkQuestions;
        }
      }
    }

    const accuracy = totalQuestions > 0 ? Math.round((totalCorrect / totalQuestions) * 100) : 0;
    const hours = Math.floor(totalMinutes / 60);
    const minutes = totalMinutes % 60;
    const timeSpent = hours > 0 ? `${hours}h ${minutes}m` : `${minutes}m`;

    return { accuracy, timeSpent, totalMinutes, totalActivities };
  };

  // Unified accuracy calculation function
  const getUnifiedAccuracy = () => {
    // Priority: realm-specific accuracy > calculated accuracy from practice data > weekly stats > fallback to 0
    if (realmAccuracy > 0) {
      return realmAccuracy;
    }
    if (calculatedAccuracy > 0) {
      return calculatedAccuracy;
    }
    if (accuracy > 0) {
      return accuracy;
    }
    return 0;
  };

  // Unified time calculation function
  const getUnifiedTimeSpent = () => {
    // Priority: realm-specific time > calculated time > weekly stats > computed time > fallback
    if (realmTimeSpent && realmTimeSpent !== '0h 0m') {
      return realmTimeSpent;
    }
    if (calculatedTimeSpent && calculatedTimeSpent !== '0h 0m') {
      return calculatedTimeSpent;
    }
    if (time_spent_formatted && time_spent_formatted !== '0h 0m') {
      return time_spent_formatted;
    }
    if (computedTimeFormatted && computedTimeFormatted !== '0h 0m') {
      return computedTimeFormatted;
    }
    return '0h 0m';
  };

  // SINGLE useEffect - NO MORE MULTIPLE CALLS
  useEffect(() => {
    let isMounted = true;
    
    const loadDashboard = async () => {
      if (!isAuthenticated || !authToken) {
        setLoading(false);
        setApiError(ERRORS.AUTHENTICATION_ERROR);
        setFallBackLink(LOGIN_PAGE);
        setFallBackAction(MESSAGES.GO_LOGIN);
        return;
      }

      try {
        console.log('Loading dashboard...');
        
        // simplexp api***
        try {
          const xpRes = await axios.post('/getUserXPSimple/', {}, {
            headers: { 'AUTH-TOKEN': authToken },
          });
          
          if (xpRes.status === 200 && xpRes.data.success && xpRes.data.data) {
            const xp = xpRes.data.data.experience_points;
            console.log('XP from getUserXPSimple:', xp);
            setExperiencePoints(xp);
          }
        } catch (error) {
          console.log('Simple XP API failed, trying leaderboard...', error);
        }
        
        // 2. Also fetch leaderboard for the leaderboard display
        console.log('Fetching leaderboard data...');
        const leaderboardRes = await axios.post('/getPVPLeaderboard/', {}, {
          headers: { 'AUTH-TOKEN': authToken },
        });
        
        let leaderboardData: any[] = [];
        if (leaderboardRes.status === 200 && leaderboardRes.data.success && leaderboardRes.data.data.leaderboard) {
          leaderboardData = leaderboardRes.data.data.leaderboard;
        }

        // 3. Fetch dashboard data
        const res = await dashboardRequestV2(authToken);
        if (!isMounted) return;

        if (res.status === 200) {
          const dashboardResponse: DashboardResponseV2 = res.data;
          setCurrentLevel(dashboardResponse.levelId);
          setClassLink(dashboardResponse.latestLink);
          setApiError(null);

          // 3. Fetch practice data ONCE
          const practiceRes = await getProgressRequest(authToken);
          if (!isMounted) return;

          if (practiceRes.status === 200) {
            const practiceStats = practiceRes.data.practiceStats;
            const { accuracy: calculatedAcc, timeSpent: calculatedTime } = calculateStatsFromPracticeData(practiceStats);
            setCalculatedAccuracy(calculatedAcc);
            setCalculatedTimeSpent(calculatedTime);
            
            setDashboardData({
              ...dashboardResponse,
              practiceStats
            });
          } else {
            setDashboardData(dashboardResponse);
          }

          // 4. Load other data in parallel (non-blocking) - NO OVERRIDES
          Promise.allSettled([
            fetchStreak().catch(() => {}),
            updateStreak().catch(() => {}),
            fetchTodoList().catch(() => {}),
            (async () => {
              const activities = getActivities();
              setRecentActivities(activities.slice(0, 4));
            })(),
            (async () => {
              // Leaderboard already fetched above, just process the top 5
              if (leaderboardData.length > 0) {
                const top5 = leaderboardData.slice(0, 5).map((player: any) => ({
                  rank: player.rank,
                  name: player.name,
                  xp: player.experience_points,
                  level: player.level,
                  userId: player.user_id
                }));
                setTopLeaderboard(top5);
              }
            })()
          ]);

        }
      } catch (error) {
        console.error('❌ Dashboard Error:', error);
        if (isAxiosError(error) && error.response?.status === 401) {
          setApiError(ERRORS.AUTHENTICATION_ERROR);
          setFallBackLink(LOGIN_PAGE);
          setFallBackAction(MESSAGES.GO_LOGIN);
        } else {
          setApiError(ERRORS.SERVER_ERROR);
        }
      } finally {
        setLoading(false);
      }
    };
    
    loadDashboard();
    return () => {
      isMounted = false;
    };
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
                          <span className="font-bold">
                            {experiencePoints}
                          </span> XP
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
                              {getUnifiedAccuracy()}%
                            </div>
                          </div>
                          
                          <div className="bg-[#2a2a2d] hover:bg-[#3a3a3d] p-3 rounded-lg text-center transition-all duration-300 border border-gold/20">
                            <div className="flex items-center justify-center space-x-1 mb-1">
                              <span className="text-base">⏱️</span>
                              <span className="text-xs text-white/80 font-medium">Time Spent</span>
                            </div>
                            <div className="text-lg font-bold text-gold">
                              {getUnifiedTimeSpent()}
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

                  {/* Weekly Goals moved to Progress page to avoid duplication */}
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
                              topLeaderboard.map((player) => (
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
