import { FC, useEffect, useMemo, useState } from 'react';
import { isAxiosError } from 'axios';
import SeoComponent from '@components/atoms/SeoComponent';
import ErrorBox from '@components/organisms/ErrorBox';
import LoadingBox from '@components/organisms/LoadingBox';
import LoadingOverlay from '@components/atoms/LoadingOverlay';
import SkeletonLoader, { SkeletonList } from '@components/atoms/SkeletonLoader';
import AccessibleButton from '@components/atoms/AccessibleButton';
import StudentDetailsModal from '@components/organisms/StudentDetailsModal';
import { dashboardRequestV2 } from '@services/student';
import { useAuthStore } from '@store/authStore';
import { useStreakStore } from '@store/streakStore';
import { useLoadingState } from '@hooks/useLoadingState';
import { useErrorHandler } from '@hooks/useErrorHandler';
import { useComponentLifecycle } from '@hooks/useComponentLifecycle';
import { ERRORS, MESSAGES } from '@constants/app';
import { LOGIN_PAGE, TEACHER_DASHBOARD } from '@constants/routes';
import axios from '@helpers/axios';
import { getStreakByUserId } from '@services/streak';

export interface TeacherLeaderboardPageProps {}

const TeacherLeaderboardPage: FC<TeacherLeaderboardPageProps> = () => {
  // Teacher leaderboard - no user stats needed
  const authToken = useAuthStore((state) => state.authToken);
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);
  const { updateStreak } = useStreakStore();
  const { handleError } = useErrorHandler();
  const { isMounted } = useComponentLifecycle({
    onMount: () => {
      console.log('Teacher Leaderboard mounted');
    },
    onUnmount: () => {
      console.log('Teacher Leaderboard unmounted');
    },
  });
  
  // Loading states
  const leaderboardLoading = useLoadingState({
    onError: (error) => handleError(error, 'Leaderboard fetch'),
  });
  
  const dashboardLoading = useLoadingState({
    onError: (error) => handleError(error, 'Dashboard fetch'),
  });
  
  const [apiError, setApiError] = useState<string | null>(null);
  const [fallBackLink, setFallBackLink] = useState<string>(TEACHER_DASHBOARD);
  const [fallBackAction, setFallBackAction] = useState<string>(MESSAGES.TRY_AGAIN);

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
      if (!isAuthenticated) {
        setLeaderboard([]);
        return;
      }

      await leaderboardLoading.executeAsync(async () => {
        if (!isMounted()) return;
        
        leaderboardLoading.setProgress(10);
        
        // Use the PVP backend leaderboard API
        const res = await axios.post('/getPVPLeaderboard/', {}, {
          headers: { 'AUTH-TOKEN': authToken },
        });
        
        if (!isMounted()) return;
        
        leaderboardLoading.setProgress(50);
        
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
          
          if (!isMounted()) return;
          
          leaderboardLoading.setProgress(70);
          
          // Fetch streaks for all students in parallel
          try {
            const streaks = await Promise.allSettled(
              leaderboardData.map((p: any) => getStreakByUserId(p.userId))
            );
            
            if (!isMounted()) return;
            
            const withStreaks = leaderboardData.map((p: any, idx: number) => {
              const r = streaks[idx];
              const s = r.status === 'fulfilled' ? (r.value as any) : null;
              const val = s?.currentStreak ?? s?.data?.currentStreak ?? 0;
              return { ...p, streak: val };
            });
            setLeaderboard(withStreaks);
          } catch {
            if (isMounted()) {
              setLeaderboard(leaderboardData);
            }
          }
          setApiError(null);
        } else {
          // No data available - show empty leaderboard
          if (isMounted()) {
            setLeaderboard([]);
            setApiError(null);
          }
        }
        
        if (isMounted()) {
          leaderboardLoading.setProgress(100);
        }
      }, {
        message: 'Loading leaderboard...',
        timeout: 15000,
      });
    };

    fetchLeaderboard();
  }, [authToken, isAuthenticated, leaderboardLoading]);

  useEffect(() => {
    const getDashboardData = async () => {
      if (!isAuthenticated) {
        setApiError(ERRORS.AUTHENTICATION_ERROR);
        setFallBackLink(LOGIN_PAGE);
        setFallBackAction(MESSAGES.GO_LOGIN);
        return;
      }

      await dashboardLoading.executeAsync(async () => {
        if (!isMounted()) return;
        
        const res = await dashboardRequestV2(authToken!);
        
        if (!isMounted()) return;
        
        if (res.status === 200) {
          setApiError(null);
          updateStreak();
        }
      }, {
        message: 'Loading dashboard data...',
        timeout: 10000,
      });
    };
    
    getDashboardData();
  }, [authToken, isAuthenticated, updateStreak, dashboardLoading]);



  const isLoading = leaderboardLoading.isLoading || dashboardLoading.isLoading;
  const hasError = apiError || leaderboardLoading.error || dashboardLoading.error;

  return (
    <div className="min-h-screen">
      <LoadingOverlay 
        isLoading={isLoading} 
        message={leaderboardLoading.message || dashboardLoading.message}
        progress={leaderboardLoading.progress || dashboardLoading.progress}
      >
        <div>
          {hasError ? (
            <>
              <SeoComponent title="Error" />
              <ErrorBox 
                errorMessage={apiError || leaderboardLoading.error?.message || dashboardLoading.error?.message || 'An error occurred'} 
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
                        Track your students' progress and achievements
                      </p>
                    </div>

                    {/* Leaderboard */}
                    <div className="text-white p-4 tablet:p-6 rounded-2xl transition-colors relative overflow-hidden" style={{ backgroundColor: '#161618' }}>
                      <h2 className="text-lg tablet:text-xl font-bold mb-4 flex items-center">
                        <span className="mr-2">⚡</span>
                        Top Students
                      </h2>
                      
                      <div className="space-y-2">
                        {leaderboardLoading.isLoading ? (
                          <SkeletonList items={5} />
                        ) : leaderboard.length === 0 ? (
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
                                    <AccessibleButton
                                      variant="ghost"
                                      size="sm"
                                      className="text-sm font-medium underline-offset-2 hover:underline p-0 h-auto"
                                      style={{ color: '#ffffff' }}
                                      onClick={() => { setSelectedStudent(student); setIsStudentModalOpen(true); }}
                                      ariaLabel={`View details for ${student.name}`}
                                    >
                                      {student.name}
                                    </AccessibleButton>
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
                            <AccessibleButton
                              variant="secondary"
                              size="sm"
                              className="px-3 py-2 rounded-lg border border-gold/50 text-white disabled:opacity-40 hover:bg-[#191919] transition-colors"
                              onClick={() => setPage(1)}
                              disabled={currentPage === 1}
                              ariaLabel="Go to first page"
                            >
                              ⏮
                            </AccessibleButton>
                            <AccessibleButton
                              variant="secondary"
                              size="sm"
                              className="px-3 py-2 rounded-lg border border-gold/50 text-white disabled:opacity-40 hover:bg-[#191919] transition-colors"
                              onClick={() => setPage((p) => Math.max(1, p - 1))}
                              disabled={currentPage === 1}
                              ariaLabel="Go to previous page"
                            >
                              ◀
                            </AccessibleButton>
                            <span className="px-4 py-2 text-white font-semibold" aria-label={`Current page ${currentPage} of ${totalPages}`}>
                              {currentPage}
                            </span>
                            <AccessibleButton
                              variant="secondary"
                              size="sm"
                              className="px-3 py-2 rounded-lg border border-gold/50 text-white disabled:opacity-40 hover:bg-[#191919] transition-colors"
                              onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                              disabled={currentPage === totalPages}
                              ariaLabel="Go to next page"
                            >
                              ▶
                            </AccessibleButton>
                            <AccessibleButton
                              variant="secondary"
                              size="sm"
                              className="px-3 py-2 rounded-lg border border-gold/50 text-white disabled:opacity-40 hover:bg-[#191919] transition-colors"
                              onClick={() => setPage(totalPages)}
                              disabled={currentPage === totalPages}
                              ariaLabel="Go to last page"
                            >
                              ⏭
                            </AccessibleButton>
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
      </LoadingOverlay>
    </div>
  );
};

export default TeacherLeaderboardPage;
