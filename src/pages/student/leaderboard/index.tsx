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
  const [communityStats, setCommunityStats] = useState({
    activePlayers: 0,
    countries: 0,
    problemsSolvedToday: 0,
    averageAccuracy: 0
  });
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

    const fetchCommunityStats = async () => {
      try {
        const res = await axios.get('/community-stats/', {
          headers: { 'AUTH-TOKEN': authToken },
        });
        if (res.status === 200 && res.data.success) {
          setCommunityStats(res.data.data);
        }
      } catch (error) {
        // Use default values if API fails
        setCommunityStats({
          activePlayers: 0,
          countries: 0,
          problemsSolvedToday: 0,
          averageAccuracy: 0
        });
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
      fetchCommunityStats();
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

  const getOrdinal = (n: number) => {
    const j = n % 10, k = n % 100;
    if (j === 1 && k !== 11) return `${n}st`;
    if (j === 2 && k !== 12) return `${n}nd`;
    if (j === 3 && k !== 13) return `${n}rd`;
    return `${n}th`;
  };

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

  const getRankBadgeColor = (rank: number) => {
    return 'bg-[#080808]/80 text-white font-bold border border-gold/30 ring-1 ring-white/5 shadow-lg';
  };

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
                    <div className="text-white p-4 tablet:p-6 rounded-2xl transition-colors" style={{ backgroundColor: '#161618' }}>
                      <h1 className="text-2xl tablet:text-3xl font-bold mb-4 flex items-center">
                        <span className="mr-2">🏆</span>
                        Lightning Leaderboard
                      </h1>
                      <p style={{ color: '#818181' }} className="text-sm tablet:text-base">
                        Compete with other students and climb the rankings!
                      </p>
                    </div>

                    {/* Leaderboard */}
                    <div className="text-white p-4 tablet:p-8 rounded-2xl transition-colors relative overflow-hidden" style={{ backgroundColor: '#161618' }}>
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
                              className="bg-gradient-to-r from-gold to-lightGold text-black px-6 py-3 rounded-xl font-bold hover:scale-110 transition-all duration-300"
                              style={{
                                boxShadow: '0 0 0 rgba(255,186,8,0)',
                                transition: 'all 0.3s ease'
                              }}
                              onMouseEnter={(e) => {
                                e.currentTarget.style.boxShadow = '0 0 25px rgba(255,186,8,0.6), 0 0 50px rgba(255,186,8,0.4), 0 0 75px rgba(255,186,8,0.2)';
                              }}
                              onMouseLeave={(e) => {
                                e.currentTarget.style.boxShadow = '0 0 0 rgba(255,186,8,0)';
                              }}
                            >
                              Start Playing PvP
                            </button>
                          </div>
                        ) : (
                          pageSlice.map((student) => (
                            <div 
                              key={student.rank} 
                              className="flex items-center space-x-4 p-4 rounded-xl transition-all duration-300 relative overflow-hidden hover:scale-105 cursor-pointer"
                              style={{ 
                                backgroundColor: student.name === 'You' ? '#212124' : '#212124',
                                boxShadow: '0 0 0 rgba(255,186,8,0)',
                                transition: 'all 0.3s ease'
                              }}
                              onMouseEnter={(e) => {
                                e.currentTarget.style.boxShadow = '0 0 20px rgba(255,186,8,0.4), 0 0 40px rgba(255,186,8,0.2), 0 0 60px rgba(255,186,8,0.1)';
                              }}
                              onMouseLeave={(e) => {
                                e.currentTarget.style.boxShadow = '0 0 0 rgba(255,186,8,0)';
                              }}
                            >
                              <div className="w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold text-white" style={{ backgroundColor: '#000000' }}>
                                {student.rank}
                              </div>
                              <div className="w-12 h-12 rounded-full flex items-center justify-center text-white font-bold text-sm" style={{ backgroundColor: '#161618' }}>
                                {student.avatar || student.name?.charAt(0) || 'U'}
                              </div>
                              <div className="flex-1">
                                <div className="flex justify-between items-center">
                                  <div>
                                    <button
                                      className="text-sm font-medium underline-offset-2 hover:underline"
                                      style={{ color: '#ffffff' }}
                                      onClick={() => { setSelectedStudent(student); setIsStudentModalOpen(true); }}
                                    >
                                      {student.name}
                                    </button>
                                    <p className="text-xs" style={{ color: '#818181' }}>
                                      Level {student.level} • {student.streak || 0} Day Streak
                                    </p>
                                  </div>
                                  <div className="text-right">
                                    <p className="text-sm font-semibold" style={{ color: '#818181' }}>
                                      {student.xp.toLocaleString()} XP
                                    </p>
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
                              className="px-3 py-2 rounded-lg border border-gold/50 text-white disabled:opacity-40 hover:bg-[#191919] transition-colors"
                              onClick={() => setPage(1)}
                              disabled={currentPage === 1}
                              title="First page"
                            >
                              ⏮
                            </button>
                            <button
                              className="px-3 py-2 rounded-lg border border-gold/50 text-white disabled:opacity-40 hover:bg-[#191919] transition-colors"
                              onClick={() => setPage((p) => Math.max(1, p - 1))}
                              disabled={currentPage === 1}
                              title="Previous"
                            >
                              ◀
                            </button>
                            <span className="px-4 py-2 text-white font-semibold">
                              {currentPage}
                            </span>
                            <button
                              className="px-3 py-2 rounded-lg border border-gold/50 text-white disabled:opacity-40 hover:bg-[#191919] transition-colors"
                              onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                              disabled={currentPage === totalPages}
                              title="Next"
                            >
                              ▶
                            </button>
                            <button
                              className="px-3 py-2 rounded-lg border border-gold/50 text-white disabled:opacity-40 hover:bg-[#191919] transition-colors"
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

                  {/* Right Sidebar */}
                  <aside className="space-y-4 tablet:space-y-6">
                    {/* User Stats */}
                    <div className="text-white p-4 tablet:p-6 rounded-2xl" style={{ backgroundColor: '#161618' }}>
                      <h3 className="text-base tablet:text-lg font-semibold mb-4 flex items-center">
                        <span className="mr-2">👤</span>
                        Your Stats
                      </h3>
                      <div className="space-y-4">
                        <div className="flex justify-between items-center">
                          <span className="text-sm" style={{ color: '#818181' }}>Total XP</span>
                          <span className="text-xl font-bold" style={{ color: '#ffffff' }}>{userStats.totalXP.toLocaleString()}</span>
                        </div>
                        <div className="flex justify-between items-center">
                          <span className="text-sm" style={{ color: '#818181' }}>Level</span>
                          <span className="text-xl font-bold" style={{ color: '#ffffff' }}>{userStats.level}</span>
                        </div>
                        <div className="flex justify-between items-center">
                          <span className="text-sm" style={{ color: '#818181' }}>Rank</span>
                          <span className="text-xl font-bold" style={{ color: '#ffffff' }}>
                            {leaderboard.length > 0 && userStats.rank > 0 ? `#${userStats.rank}` : 'Unranked'}
                          </span>
                        </div>
                        <div className="flex justify-between items-center">
                          <span className="text-sm" style={{ color: '#818181' }}>Next Level</span>
                          <span className="text-lg font-bold" style={{ color: '#ffffff' }}>
                            {userStats.nextLevelXP} XP needed
                          </span>
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