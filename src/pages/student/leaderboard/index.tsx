import { FC, useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { isAxiosError } from 'axios';
import SeoComponent from '@components/atoms/SeoComponent';
import ErrorBox from '@components/organisms/ErrorBox';
import LoadingBox from '@components/organisms/LoadingBox';
import StudentDetailsModal from '@components/organisms/StudentDetailsModal';
import { dashboardRequestV2 } from '@services/student';
import { useAuthStore } from '@store/authStore';
import { useStreakStore } from '@store/streakStore';
import { ERRORS, MESSAGES } from '@constants/app';
import { LOGIN_PAGE, STUDENT_DASHBOARD } from '@constants/routes';
import axios from '@helpers/axios';
import { getStreakByUserId } from '@services/streak';
import { getLevelName } from '@helpers/levelNames';

export interface StudentLeaderboardPageProps {}

const StudentLeaderboardPage: FC<StudentLeaderboardPageProps> = () => {
  const navigate = useNavigate();
  const authToken = useAuthStore((state) => state.authToken);
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);
  const [loading, setLoading] = useState(true);
  const [apiError, setApiError] = useState<string | null>(null);
  const [fallBackLink, setFallBackLink] = useState<string>(STUDENT_DASHBOARD);
  const [fallBackAction, setFallBackAction] = useState<string>(MESSAGES.TRY_AGAIN);
  const { updateStreak } = useStreakStore();

  const [leaderboard, setLeaderboard] = useState<any[]>([]);
  const [userStats, setUserStats] = useState({
    totalXP: 0,
    level: 1,
    rank: 0,
    totalPlayers: 0,
    nextLevelXP: 100
  });


  useEffect(() => {
    const fetchLeaderboard = async () => {
      setLoading(true);
      try {
        // Use the PVP backend leaderboard API
        const res = await axios.post('/getPVPLeaderboard/', {}, {
          headers: { 'AUTH-TOKEN': authToken },
        });
        if (res.status === 200 && res.data.success && res.data.data.leaderboard) {
          // Transform PVP leaderboard data to match expected format
          const leaderboardData = res.data.data.leaderboard.map((player: any) => ({
            rank: player.rank,
            name: player.name,
            xp: player.experience_points,
            level: player.level,
            // Streak is resolved later if the player is the logged-in user; others default 0
            streak: 0,
            userId: player.user_id
          }));
          // Fetch streaks for all students in parallel
          try {
            const streaks = await Promise.allSettled(
              leaderboardData.map((p: any) => getStreakByUserId(p.userId))
            );
            const withStreaks = leaderboardData.map((p: any, idx: number) => {
              const r = streaks[idx];
              const s = r.status === 'fulfilled' ? (r.value as any) : null;
              const val = s?.currentStreak ?? s?.data?.currentStreak ?? 0;
              return { ...p, streak: val };
            });
            setLeaderboard(withStreaks);
          } catch {
            setLeaderboard(leaderboardData);
          }
          setApiError(null);
        } else {
          // No data available - show empty leaderboard
          setLeaderboard([]);
          setApiError(null);
        }
      } catch (error) {
        console.error('Error fetching leaderboard:', error);
        // Show empty leaderboard on error
        setLeaderboard([]);
        setApiError(null);
      } finally {
        setLoading(false);
      }
    };


    const fetchUserStats = async () => {
      try {
        // Get user experience data
        const expRes = await axios.post('/getUserExperience/', {}, {
          headers: { 'AUTH-TOKEN': authToken },
        });
        if (expRes.status === 200 && expRes.data.success) {
          const expData = expRes.data.data;
          
          // Get leaderboard to calculate rank
          try {
            const leaderboardRes = await axios.post('/getPVPLeaderboard/', {}, {
          headers: { 'AUTH-TOKEN': authToken },
        });
            if (leaderboardRes.status === 200 && leaderboardRes.data.success && leaderboardRes.data.data.leaderboard) {
              const currentUserId = useAuthStore.getState().user?.id;
              const userRank = leaderboardRes.data.data.leaderboard.findIndex(
                (player: any) => player.user_id === currentUserId
              ) + 1;
              
              setUserStats({
                totalXP: expData.experience_points,
                level: expData.level,
                rank: userRank || 0,
                totalPlayers: leaderboardRes.data.data.total_players,
                nextLevelXP: expData.xp_to_next_level
              });
            } else {
              setUserStats({
                totalXP: expData.experience_points,
                level: expData.level,
                rank: 0,
                totalPlayers: 0,
                nextLevelXP: expData.xp_to_next_level
              });
            }
          } catch (leaderboardError) {
            console.error('Error fetching leaderboard for rank:', leaderboardError);
          setUserStats({
            totalXP: expData.experience_points,
            level: expData.level,
              rank: 0,
              totalPlayers: 0,
            nextLevelXP: expData.xp_to_next_level
            });
          }
          // Try to fetch streak for the current user and merge into leaderboard entry
          try {
            const streakRes = await axios.get('/streak/', { headers: { 'AUTH-TOKEN': authToken } });
            const currentUserId = useAuthStore.getState().user?.id;
            if (currentUserId && streakRes?.data) {
              const currentStreak = (streakRes.data?.currentStreak) ?? (streakRes.data?.data?.currentStreak) ?? 0;
              setLeaderboard((prev) => prev.map((p) => p.userId === currentUserId ? { ...p, streak: currentStreak } : p));
            }
          } catch (e) {
            // ignore streak failure
          }
        } else {
          setUserStats({
            totalXP: 0,
            level: 1,
            rank: 0,
            totalPlayers: 0,
            nextLevelXP: 100
          });
        }
      } catch (error) {
        console.error('Error fetching user stats:', error);
        // Use default values if API fails
        setUserStats({
          totalXP: 0,
          level: 1,
          rank: 0,
          totalPlayers: 0,
          nextLevelXP: 100
        });
      }
    };

    if (isAuthenticated) {
      fetchLeaderboard();
      fetchUserStats();
    } else {
      // Use fallback data if not authenticated
      setLeaderboard(leaderboard);
      setLoading(false);
    }
  }, [authToken, isAuthenticated]);

  const [selectedStudent, setSelectedStudent] = useState<typeof leaderboard[number] | null>(null);
  const [isStudentModalOpen, setIsStudentModalOpen] = useState(false);
  const [page, setPage] = useState<number>(1);
  const pageSize = 10; // Fixed page size of 10


  const totalStudents = leaderboard.length;
  const totalPages = useMemo(() => Math.max(1, Math.ceil(totalStudents / pageSize)), [totalStudents, pageSize]);
  const currentPage = Math.min(page, totalPages);
  const pageSlice = useMemo(() => {
    const start = (currentPage - 1) * pageSize;
    const end = start + pageSize;
    return leaderboard.slice(start, end);
  }, [leaderboard, currentPage, pageSize]);


  useEffect(() => {
    const getDashboardData = async () => {
      if (isAuthenticated) {
        try {
          const res = await dashboardRequestV2(authToken!);
          if (res.status === 200) {
            setApiError(null);
            updateStreak();
          }
        } catch (error) {
          if (isAxiosError(error)) {
            setApiError(error.response?.data?.message || ERRORS.SERVER_ERROR);
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
  }, [authToken, isAuthenticated, updateStreak]);


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
              <SeoComponent title="Leaderboard" />
              <div>
                <div className="grid grid-cols-1 desktop:grid-cols-3 gap-4 tablet:gap-6">
                  {/* Main Content */}
                  <div className="desktop:col-span-2 space-y-4 tablet:space-y-6">
                    {/* Header */}
                    <div 
                      className="text-white p-4 tablet:p-6 rounded-2xl transition-all duration-300 relative overflow-hidden backdrop-blur-xl border border-white/10"
                      style={{ 
                        background: 'linear-gradient(135deg, rgba(22, 22, 24, 0.9) 0%, rgba(33, 33, 36, 0.7) 50%, rgba(22, 22, 24, 0.9) 100%)',
                        boxShadow: '0 8px 32px rgba(0, 0, 0, 0.4), inset 0 1px 0 rgba(255, 255, 255, 0.1), 0 0 0 1px rgba(255, 186, 8, 0.2)'
                      }}
                    >
                      <div className="absolute inset-0 bg-gradient-to-br from-gold/15 via-purple-500/10 to-cyan-500/15 pointer-events-none"></div>
                      <div className="absolute inset-0 bg-gradient-to-tr from-transparent via-blue-500/5 to-transparent pointer-events-none"></div>
                      <div className="relative z-10">
                        <div className="flex items-center justify-between mb-4">
                          <div>
                            <h1 className="text-2xl tablet:text-3xl font-bold flex items-center">
                              <span className="mr-3 text-3xl">🏆</span>
                              Hall of Fame
                            </h1>
                            <p style={{ color: '#818181' }} className="text-sm tablet:text-base mt-2">
                              Compete with other students and climb the rankings!
                            </p>
                          </div>
                          <div className="hidden tablet:block">
                            <div className="text-right">
                              <div className="text-2xl font-bold" style={{ color: '#ffffff' }}>
                                {leaderboard.length}
                              </div>
                              <div className="text-xs" style={{ color: '#818181' }}>
                                Total Players
                              </div>
                            </div>
                          </div>
                        </div>
                        {/* Stats Row */}
                        <div className="grid grid-cols-3 gap-4 mt-4">
                          <div className="text-center p-3 rounded-lg backdrop-blur-sm border border-yellow-400/30" 
                               style={{ 
                                 background: 'linear-gradient(135deg, rgba(255, 215, 0, 0.2) 0%, rgba(255, 193, 7, 0.1) 100%)',
                                 boxShadow: '0 4px 16px rgba(255, 215, 0, 0.2), inset 0 1px 0 rgba(255, 255, 255, 0.1)'
                               }}>
                            <div className="text-lg font-bold" style={{ color: '#ffffff' }}>
                              {leaderboard.length > 0 ? leaderboard[0]?.xp.toLocaleString() : '0'}
                            </div>
                            <div className="text-xs" style={{ color: '#fbbf24' }}>Top Score</div>
                          </div>
                          <div className="text-center p-3 rounded-lg backdrop-blur-sm border border-purple-400/30" 
                               style={{ 
                                 background: 'linear-gradient(135deg, rgba(168, 85, 247, 0.2) 0%, rgba(147, 51, 234, 0.1) 100%)',
                                 boxShadow: '0 4px 16px rgba(168, 85, 247, 0.2), inset 0 1px 0 rgba(255, 255, 255, 0.1)'
                               }}>
                            <div className="text-lg font-bold" style={{ color: '#ffffff' }}>
                              {leaderboard.length > 0 ? Math.round(leaderboard.reduce((acc, student) => acc + student.xp, 0) / leaderboard.length).toLocaleString() : '0'}
                            </div>
                            <div className="text-xs" style={{ color: '#c084fc' }}>Avg XP</div>
                          </div>
                          <div className="text-center p-3 rounded-lg backdrop-blur-sm border border-pink-400/30" 
                               style={{ 
                                 background: 'linear-gradient(135deg, rgba(236, 72, 153, 0.2) 0%, rgba(219, 39, 119, 0.1) 100%)',
                                 boxShadow: '0 4px 16px rgba(236, 72, 153, 0.2), inset 0 1px 0 rgba(255, 255, 255, 0.1)'
                               }}>
                            <div className="text-lg font-bold" style={{ color: '#ffffff' }}>
                              {leaderboard.length > 0 ? Math.max(...leaderboard.map(s => s.level)) : '0'}
                            </div>
                            <div className="text-xs" style={{ color: '#f472b6' }}>Max Realm</div>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Leaderboard */}
                    <div 
                      className="text-white p-4 tablet:p-8 rounded-2xl transition-all duration-300 relative overflow-hidden backdrop-blur-xl border border-white/10"
                      style={{ 
                        background: 'linear-gradient(135deg, rgba(22, 22, 24, 0.8) 0%, rgba(33, 33, 36, 0.6) 50%, rgba(22, 22, 24, 0.8) 100%)',
                        boxShadow: '0 8px 32px rgba(0, 0, 0, 0.4), inset 0 1px 0 rgba(255, 255, 255, 0.1), 0 0 0 1px rgba(255, 186, 8, 0.1)'
                      }}
                    >
                      <div className="absolute inset-0 bg-gradient-to-br from-purple-500/10 via-blue-500/5 to-cyan-500/10 pointer-events-none"></div>
                      <div className="absolute inset-0 bg-gradient-to-tr from-transparent via-gold/5 to-transparent pointer-events-none"></div>
                      <div className="relative z-10">
                        <h2 className="text-xl tablet:text-2xl font-bold mb-6 flex items-center">
                          <span className="mr-2">⚡</span>
                          Top Students
                        </h2>
                      
                       <div className="space-y-3">
                        {leaderboard.length === 0 ? (
                          <div className="text-center py-12">
                            <div className="text-6xl mb-4">🏆</div>
                            <h3 className="text-2xl font-bold text-white mb-2">No Rankings Yet</h3>
                            <p className="mb-6" style={{ color: '#818181' }}>
                              Start playing PvP battles to earn experience points and climb the leaderboard!
                            </p>
                            <button
                              onClick={() => navigate('/student/practice/pvp')}
                              className="bg-gradient-to-r from-gold to-lightGold text-black px-6 py-3 rounded-xl font-bold hover:scale-105 transition-all duration-300 backdrop-blur-sm border border-gold/30"
                              style={{
                                boxShadow: '0 4px 16px rgba(255,186,8,0.3), inset 0 1px 0 rgba(255, 255, 255, 0.2)',
                                transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)'
                              }}
                              onMouseEnter={(e) => {
                                e.currentTarget.style.boxShadow = '0 8px 32px rgba(255,186,8,0.5), 0 0 20px rgba(255,186,8,0.3), inset 0 1px 0 rgba(255, 255, 255, 0.3)';
                                e.currentTarget.style.transform = 'scale(1.05)';
                              }}
                              onMouseLeave={(e) => {
                                e.currentTarget.style.boxShadow = '0 4px 16px rgba(255,186,8,0.3), inset 0 1px 0 rgba(255, 255, 255, 0.2)';
                                e.currentTarget.style.transform = 'scale(1)';
                              }}
                            >
                              Start Epic Battle
                            </button>
                          </div>
                        ) : (
                          pageSlice.map((student) => (
                            <div 
                              key={student.rank} 
                              className="flex items-center space-x-4 p-4 rounded-xl transition-all duration-300 relative overflow-hidden hover:scale-[1.02] cursor-pointer backdrop-blur-sm border border-white/10"
                              style={{ 
                                background: student.name === 'You' ? 
                                  'linear-gradient(135deg, rgba(33, 33, 36, 0.9) 0%, rgba(255, 186, 8, 0.1) 50%, rgba(33, 33, 36, 0.9) 100%)' :
                                  'linear-gradient(135deg, rgba(33, 33, 36, 0.7) 0%, rgba(22, 22, 24, 0.5) 50%, rgba(33, 33, 36, 0.7) 100%)',
                                boxShadow: '0 4px 16px rgba(0, 0, 0, 0.3), inset 0 1px 0 rgba(255, 255, 255, 0.1), 0 0 0 1px rgba(255, 186, 8, 0.1)',
                                transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)'
                              }}
                              onMouseEnter={(e) => {
                                e.currentTarget.style.background = student.name === 'You' ? 
                                  'linear-gradient(135deg, rgba(33, 33, 36, 0.95) 0%, rgba(255, 186, 8, 0.2) 50%, rgba(33, 33, 36, 0.95) 100%)' :
                                  'linear-gradient(135deg, rgba(33, 33, 36, 0.8) 0%, rgba(22, 22, 24, 0.6) 50%, rgba(33, 33, 36, 0.8) 100%)';
                                e.currentTarget.style.boxShadow = '0 8px 32px rgba(0, 0, 0, 0.4), 0 0 25px rgba(255,186,8,0.3), inset 0 1px 0 rgba(255, 255, 255, 0.2), 0 0 0 1px rgba(255, 186, 8, 0.3)';
                                e.currentTarget.style.borderColor = 'rgba(255, 186, 8, 0.4)';
                              }}
                              onMouseLeave={(e) => {
                                e.currentTarget.style.background = student.name === 'You' ? 
                                  'linear-gradient(135deg, rgba(33, 33, 36, 0.9) 0%, rgba(255, 186, 8, 0.1) 50%, rgba(33, 33, 36, 0.9) 100%)' :
                                  'linear-gradient(135deg, rgba(33, 33, 36, 0.7) 0%, rgba(22, 22, 24, 0.5) 50%, rgba(33, 33, 36, 0.7) 100%)';
                                e.currentTarget.style.boxShadow = '0 4px 16px rgba(0, 0, 0, 0.3), inset 0 1px 0 rgba(255, 255, 255, 0.1), 0 0 0 1px rgba(255, 186, 8, 0.1)';
                                e.currentTarget.style.borderColor = 'rgba(255, 255, 255, 0.1)';
                              }}
                            >
                              <div 
                                className={`w-12 h-12 rounded-full flex items-center justify-center text-sm font-bold backdrop-blur-sm border relative overflow-hidden ${
                                  student.rank === 1 ? 'border-yellow-400/60' : 
                                  student.rank === 2 ? 'border-gray-300/60' : 
                                  student.rank === 3 ? 'border-amber-600/60' : 'border-white/20'
                                }`}
                                style={{ 
                                  background: student.rank === 1 ? 'linear-gradient(135deg, rgba(255, 215, 0, 0.3) 0%, rgba(255, 193, 7, 0.2) 50%, rgba(255, 215, 0, 0.3) 100%)' : 
                                             student.rank === 2 ? 'linear-gradient(135deg, rgba(192, 192, 192, 0.3) 0%, rgba(169, 169, 169, 0.2) 50%, rgba(192, 192, 192, 0.3) 100%)' : 
                                             student.rank === 3 ? 'linear-gradient(135deg, rgba(205, 127, 50, 0.3) 0%, rgba(184, 115, 51, 0.2) 50%, rgba(205, 127, 50, 0.3) 100%)' : 
                                             'linear-gradient(135deg, rgba(0, 0, 0, 0.8) 0%, rgba(33, 33, 36, 0.6) 50%, rgba(0, 0, 0, 0.8) 100%)',
                                  boxShadow: student.rank <= 3 ? 
                                    `0 6px 20px ${student.rank === 1 ? 'rgba(255, 215, 0, 0.4)' : 
                                                   student.rank === 2 ? 'rgba(192, 192, 192, 0.4)' : 
                                                   'rgba(205, 127, 50, 0.4)'}, 0 0 0 1px ${student.rank === 1 ? 'rgba(255, 215, 0, 0.3)' : 
                                                                                    student.rank === 2 ? 'rgba(192, 192, 192, 0.3)' : 
                                                                                    'rgba(205, 127, 50, 0.3)'}, inset 0 1px 0 rgba(255, 255, 255, 0.3)` :
                                    '0 4px 12px rgba(0, 0, 0, 0.4), inset 0 1px 0 rgba(255, 255, 255, 0.1)'
                                }}
                              >
                                {student.rank <= 3 && (
                                  <div className="absolute inset-0 bg-gradient-to-br from-white/20 to-transparent"></div>
                                )}
                                <span className="relative z-10 text-white">
                                  {student.rank === 1 ? '👑' : student.rank === 2 ? '🥈' : student.rank === 3 ? '🥉' : student.rank}
                                </span>
                              </div>
                              <div 
                                className="w-12 h-12 rounded-full flex items-center justify-center text-white font-bold text-sm backdrop-blur-sm border border-white/10"
                                style={{ 
                                  backgroundColor: 'rgba(22, 22, 24, 0.8)',
                                  boxShadow: '0 2px 8px rgba(0, 0, 0, 0.3), inset 0 1px 0 rgba(255, 255, 255, 0.1)'
                                }}
                              >
                                {student.avatar || student.name?.charAt(0) || 'U'}
                              </div>
                              <div className="flex-1">
                                <div className="flex justify-between items-start">
                                  <div className="flex-1">
                                    <button
                                      className="text-base font-semibold underline-offset-2 hover:underline transition-all duration-200"
                                      style={{ color: '#ffffff' }}
                                      onClick={() => { setSelectedStudent(student); setIsStudentModalOpen(true); }}
                                    >
                                      {student.name}
                                    </button>
                                    <div className="flex items-center gap-3 mt-1">
                                      <div className="flex items-center gap-1">
                                        <span className="text-xs font-medium px-3 py-1 rounded-full backdrop-blur-sm border border-blue-400/40" 
                                              style={{ 
                                                background: 'linear-gradient(135deg, rgba(59, 130, 246, 0.2) 0%, rgba(37, 99, 235, 0.1) 100%)', 
                                                color: '#60a5fa',
                                                boxShadow: '0 2px 8px rgba(59, 130, 246, 0.2)'
                                              }}>
                                          ⭐ {getLevelName(student.level)}
                                        </span>
                                        <span className="text-xs px-3 py-1 rounded-full backdrop-blur-sm border border-orange-400/50" 
                                              style={{ 
                                                background: 'linear-gradient(135deg, rgba(255, 165, 0, 0.2) 0%, rgba(255, 140, 0, 0.1) 100%)', 
                                                color: '#ffb347',
                                                boxShadow: '0 2px 8px rgba(255, 165, 0, 0.3)'
                                              }}>
                                          🔥 {student.streak || 0} day streak
                                        </span>
                                      </div>
                                    </div>
                                    {/* XP Progress Bar */}
                                    <div className="mt-2">
                                      <div className="flex justify-between items-center mb-1">
                                        <span className="text-xs" style={{ color: '#818181' }}>Experience</span>
                                        <span className="text-xs font-semibold" style={{ color: '#ffffff' }}>
                                          {student.xp.toLocaleString()} XP
                                        </span>
                                      </div>
                                      <div className="w-full h-3 rounded-full backdrop-blur-sm border border-white/10 overflow-hidden"
                                           style={{ backgroundColor: 'rgba(33, 33, 36, 0.8)' }}>
                                        <div 
                                          className="h-full rounded-full transition-all duration-1000 ease-out relative"
                                          style={{ 
                                            width: `${Math.min(100, (student.xp / 10000) * 100)}%`,
                                            background: 'linear-gradient(90deg, #ff6b6b 0%, #ffd700 25%, #4ecdc4 50%, #45b7d1 75%, #96ceb4 100%)',
                                            boxShadow: '0 0 15px rgba(255, 215, 0, 0.4), inset 0 1px 0 rgba(255, 255, 255, 0.2)'
                                          }}
                                        >
                                          <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent animate-pulse"></div>
                                        </div>
                                      </div>
                                    </div>
                                  </div>
                                  <div className="text-right ml-4">
                                    <div className="text-lg font-bold" style={{ color: '#ffffff' }}>
                                      {student.xp.toLocaleString()}
                                    </div>
                                    <div className="text-xs" style={{ color: '#818181' }}>
                                      XP
                                    </div>
                                  </div>
                                </div>
                              </div>
                            </div>
                          ))
                        )}
                      </div>

                      {/* Pagination controls */}
                      {leaderboard.length > 0 && totalPages > 1 && (
                        <div className="mt-6 flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <span className="text-sm" style={{ color: '#818181' }}>
                              Page {currentPage} of {totalPages} • {totalStudents} players
                            </span>
                          </div>

                          <div className="flex items-center gap-2">
                            <button
                              className="px-3 py-2 rounded-lg backdrop-blur-sm border border-white/10 text-white disabled:opacity-40 hover:bg-white/5 transition-all duration-300"
                              style={{
                                backgroundColor: 'rgba(33, 33, 36, 0.6)',
                                boxShadow: '0 2px 8px rgba(0, 0, 0, 0.2), inset 0 1px 0 rgba(255, 255, 255, 0.1)'
                              }}
                              onClick={() => setPage(1)}
                              disabled={currentPage === 1}
                              title="First page"
                            >
                              ⏮
                            </button>
                            <button
                              className="px-3 py-2 rounded-lg backdrop-blur-sm border border-white/10 text-white disabled:opacity-40 hover:bg-white/5 transition-all duration-300"
                              style={{
                                backgroundColor: 'rgba(33, 33, 36, 0.6)',
                                boxShadow: '0 2px 8px rgba(0, 0, 0, 0.2), inset 0 1px 0 rgba(255, 255, 255, 0.1)'
                              }}
                              onClick={() => setPage((p) => Math.max(1, p - 1))}
                              disabled={currentPage === 1}
                              title="Previous"
                            >
                              ◀
                            </button>
                            <span 
                              className="px-4 py-2 text-white font-semibold backdrop-blur-sm border border-white/10 rounded-lg"
                              style={{
                                backgroundColor: 'rgba(33, 33, 36, 0.8)',
                                boxShadow: '0 2px 8px rgba(0, 0, 0, 0.2), inset 0 1px 0 rgba(255, 255, 255, 0.1)'
                              }}
                            >
                              {currentPage}
                            </span>
                            <button
                              className="px-3 py-2 rounded-lg backdrop-blur-sm border border-white/10 text-white disabled:opacity-40 hover:bg-white/5 transition-all duration-300"
                              style={{
                                backgroundColor: 'rgba(33, 33, 36, 0.6)',
                                boxShadow: '0 2px 8px rgba(0, 0, 0, 0.2), inset 0 1px 0 rgba(255, 255, 255, 0.1)'
                              }}
                              onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                              disabled={currentPage === totalPages}
                              title="Next"
                            >
                              ▶
                            </button>
                            <button
                              className="px-3 py-2 rounded-lg backdrop-blur-sm border border-white/10 text-white disabled:opacity-40 hover:bg-white/5 transition-all duration-300"
                              style={{
                                backgroundColor: 'rgba(33, 33, 36, 0.6)',
                                boxShadow: '0 2px 8px rgba(0, 0, 0, 0.2), inset 0 1px 0 rgba(255, 255, 255, 0.1)'
                              }}
                              onClick={() => setPage(totalPages)}
                              disabled={currentPage === totalPages}
                              title="Last page"
                            >
                              ⏭
                            </button>
                          </div>
                        </div>
                      )}
                      </div>
                    </div>

                    
                  </div>

                  {/* Right Sidebar */}
                  <aside className="space-y-4 tablet:space-y-6">
                    {/* User Stats */}
                    <div 
                      className="text-white p-4 tablet:p-6 rounded-2xl transition-all duration-300 relative overflow-hidden backdrop-blur-xl border border-white/10"
                      style={{ 
                        background: 'linear-gradient(135deg, rgba(22, 22, 24, 0.9) 0%, rgba(33, 33, 36, 0.7) 50%, rgba(22, 22, 24, 0.9) 100%)',
                        boxShadow: '0 8px 32px rgba(0, 0, 0, 0.4), inset 0 1px 0 rgba(255, 255, 255, 0.1), 0 0 0 1px rgba(255, 186, 8, 0.2)'
                      }}
                    >
                      <div className="absolute inset-0 bg-gradient-to-br from-purple-500/10 via-blue-500/5 to-cyan-500/10 pointer-events-none"></div>
                      <div className="absolute inset-0 bg-gradient-to-tr from-transparent via-gold/5 to-transparent pointer-events-none"></div>
                      <div className="relative z-10">
                        <h3 className="text-base tablet:text-lg font-semibold mb-4 flex items-center">
                          <span className="mr-2">👤</span>
                          Your Stats
                        </h3>
                      <div className="space-y-6">
                        {/* Total XP Card */}
                        <div className="p-4 rounded-xl backdrop-blur-sm border border-white/10" 
                             style={{ 
                               background: 'linear-gradient(135deg, rgba(33, 33, 36, 0.8) 0%, rgba(22, 22, 24, 0.6) 100%)',
                               boxShadow: '0 4px 16px rgba(0, 0, 0, 0.3), inset 0 1px 0 rgba(255, 255, 255, 0.1)'
                             }}>
                          <div className="flex items-center justify-between mb-2">
                            <span className="text-sm font-medium" style={{ color: '#818181' }}>Total XP</span>
                            <span className="text-2xl font-bold" style={{ color: '#ffffff' }}>{userStats.totalXP.toLocaleString()}</span>
                          </div>
                          <div className="w-full h-2 rounded-full" style={{ backgroundColor: 'rgba(33, 33, 36, 0.8)' }}>
                            <div className="h-full rounded-full bg-gradient-to-r from-purple-500 via-pink-500 to-red-500" 
                                 style={{ width: `${Math.min(100, (userStats.totalXP / 50000) * 100)}%` }}></div>
                          </div>
                        </div>

                        {/* Level & Rank Row */}
                        <div className="grid grid-cols-2 gap-4">
                          <div className="p-4 rounded-xl backdrop-blur-sm border border-blue-400/30 text-center" 
                               style={{ 
                                 background: 'linear-gradient(135deg, rgba(59, 130, 246, 0.2) 0%, rgba(37, 99, 235, 0.1) 100%)',
                                 boxShadow: '0 4px 16px rgba(59, 130, 246, 0.2), inset 0 1px 0 rgba(255, 255, 255, 0.1)'
                               }}>
                            <div className="text-xs font-medium mb-1" style={{ color: '#60a5fa' }}>Level</div>
                            <div className="text-2xl font-bold" style={{ color: '#ffffff' }}>{userStats.level}</div>
                          </div>
                          <div className="p-4 rounded-xl backdrop-blur-sm border border-green-400/30 text-center" 
                               style={{ 
                                 background: 'linear-gradient(135deg, rgba(34, 197, 94, 0.2) 0%, rgba(22, 163, 74, 0.1) 100%)',
                                 boxShadow: '0 4px 16px rgba(34, 197, 94, 0.2), inset 0 1px 0 rgba(255, 255, 255, 0.1)'
                               }}>
                            <div className="text-xs font-medium mb-1" style={{ color: '#4ade80' }}>Rank</div>
                            <div className="text-2xl font-bold" style={{ color: '#ffffff' }}>
                              {leaderboard.length > 0 && userStats.rank > 0 ? `#${userStats.rank}` : '—'}
                            </div>
                          </div>
                        </div>

                        {/* Next Level Progress */}
                        <div className="p-4 rounded-xl backdrop-blur-sm border border-cyan-400/30" 
                             style={{ 
                               background: 'linear-gradient(135deg, rgba(6, 182, 212, 0.2) 0%, rgba(8, 145, 178, 0.1) 100%)',
                               boxShadow: '0 4px 16px rgba(6, 182, 212, 0.2), inset 0 1px 0 rgba(255, 255, 255, 0.1)'
                             }}>
                          <div className="flex items-center justify-between mb-2">
                            <span className="text-sm font-medium" style={{ color: '#22d3ee' }}>Next Level</span>
                            <span className="text-sm font-semibold" style={{ color: '#ffffff' }}>
                              {userStats.nextLevelXP} XP needed
                            </span>
                          </div>
                          <div className="w-full h-2 rounded-full" style={{ backgroundColor: 'rgba(33, 33, 36, 0.8)' }}>
                            <div className="h-full rounded-full bg-gradient-to-r from-cyan-400 via-blue-500 to-purple-600" 
                                 style={{ width: `${Math.min(100, ((userStats.totalXP % 1000) / 1000) * 100)}%` }}></div>
                          </div>
                        </div>
                      </div>
                      </div>
                    </div>

                    {/* Community Stats - Commented out for now */}
                    {/* <div className="bg-black text-white p-6 rounded-2xl border border-gold/50 ring-1 ring-white/5">
                      <h3 className="text-lg font-semibold mb-4 flex items-center">
                        <span className="mr-2">🌍</span>
                        Community Stats
                      </h3>
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <p className="text-xs text-gray-400">Active Players</p>
                          <p className="text-xl font-bold text-purple-300">
                            {communityStats.activePlayers.toLocaleString()}
                          </p>
                        </div>
                        <div>
                          <p className="text-xs text-gray-400">Countries</p>
                          <p className="text-xl font-bold text-blue-300">
                            {communityStats.countries}
                          </p>
                        </div>
                        <div>
                          <p className="text-xs text-gray-400">Problems Solved Today</p>
                          <p className="text-xl font-bold text-green-300">
                            {communityStats.problemsSolvedToday.toLocaleString()}
                          </p>
                        </div>
                        <div>
                          <p className="text-xs text-gray-400">Average Accuracy</p>
                          <p className="text-xl font-bold text-yellow-300">
                            {communityStats.averageAccuracy.toFixed(1)}%
                          </p>
                        </div>
                      </div>
                    </div> */}
                  </aside>
                </div>
              </div>
              <StudentDetailsModal isOpen={isStudentModalOpen} onClose={() => setIsStudentModalOpen(false)} student={selectedStudent} />
            </>
          )}
        </div>
      )}
    </div>
  );
};

export default StudentLeaderboardPage; 