import { FC, useEffect, useMemo, useState } from 'react';
import { isAxiosError } from 'axios';
import SeoComponent from '@components/atoms/SeoComponent';
import ErrorBox from '@components/organisms/ErrorBox';
import LoadingBox from '@components/organisms/LoadingBox';
import StudentDetailsModal from '@components/organisms/StudentDetailsModal';
import { dashboardRequestV2 } from '@services/student';
import { useAuthStore } from '@store/authStore';
import { useStreakStore } from '@store/streakStore';
import { ERRORS, MESSAGES } from '@constants/app';
import { LOGIN_PAGE, ADMIN_DASHBOARD } from '@constants/routes';
import axios from '@helpers/axios';
import { getStreakByUserId } from '@services/streak';

export interface AdminLeaderboardPageProps {}

const AdminLeaderboardPage: FC<AdminLeaderboardPageProps> = () => {
  // Admin leaderboard - no user stats needed
  const authToken = useAuthStore((state) => state.authToken);
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);
  const [loading, setLoading] = useState(true);
  const [apiError, setApiError] = useState<string | null>(null);
  const [fallBackLink, setFallBackLink] = useState<string>(ADMIN_DASHBOARD);
  const [fallBackAction, setFallBackAction] = useState<string>(MESSAGES.TRY_AGAIN);
  const { updateStreak } = useStreakStore();

  const [leaderboard, setLeaderboard] = useState<any[]>([]);


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

    if (isAuthenticated) {
      fetchLeaderboard();
    } else {
      // Use fallback data if not authenticated
      setLeaderboard([]);
      setLoading(false);
    }
  }, [authToken, isAuthenticated]);

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
              <SeoComponent title="Students Leaderboard" />
              <div className="container mx-auto px-4 py-6 max-w-6xl">
                <div className="grid grid-cols-1 gap-4 tablet:gap-6">
                  {/* Main Content */}
                  <div className="space-y-4 tablet:space-y-6">
                    {/* Header */}
                    <div className="text-white p-4 tablet:p-6 rounded-2xl transition-colors" style={{ backgroundColor: '#161618' }}>
                      <h1 className="text-xl tablet:text-2xl font-bold mb-2 flex items-center">
                        <span className="mr-2">🏆</span>
                        Students Leaderboard
                      </h1>
                      <p style={{ color: '#818181' }} className="text-sm">
                        Monitor all students' progress and achievements across the platform
                      </p>
                    </div>

                    {/* Leaderboard */}
                    <div className="text-white p-4 tablet:p-6 rounded-2xl transition-colors relative overflow-hidden" style={{ backgroundColor: '#161618' }}>
                      <h2 className="text-lg tablet:text-xl font-bold mb-4 flex items-center">
                        <span className="mr-2">⚡</span>
                        Top Students
                      </h2>
                      
                       <div className="space-y-2">
                        {leaderboard.length === 0 ? (
                          <div className="text-center py-8">
                            <div className="text-4xl mb-3">🏆</div>
                            <h3 className="text-lg font-bold text-white mb-2">No Rankings Yet</h3>
                            <p className="text-sm" style={{ color: '#818181' }}>
                              Students need to play PvP battles to earn experience points and climb the leaderboard!
                            </p>
                          </div>
                        ) : (
                          pageSlice.map((student) => (
                            <div 
                              key={student.rank} 
                              className="flex items-center space-x-3 p-3 rounded-lg transition-all duration-300 relative overflow-hidden hover:scale-105 cursor-pointer"
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
                              <div className="w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold text-white" style={{ backgroundColor: '#000000' }}>
                                {student.rank}
                              </div>
                              <div className="w-10 h-10 rounded-full flex items-center justify-center text-white font-bold text-sm" style={{ backgroundColor: '#161618' }}>
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
                        <div className="mt-4 flex items-center justify-between">
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

export default AdminLeaderboardPage;
