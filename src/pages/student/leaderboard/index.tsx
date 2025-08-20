import { FC, useEffect, useMemo, useState } from 'react';
import { isAxiosError } from 'axios';
import SeoComponent from '@components/atoms/SeoComponent';
import ErrorBox from '@components/organisms/ErrorBox';
import LoadingBox from '@components/organisms/LoadingBox';
import AchievementsSection from '@components/sections/student/dashboard/AchievementsSection';
import AchievementsModal from '@components/organisms/AchievementsModal';
import { ACHIEVEMENTS } from '@constants/achievements';
import StudentDetailsModal from '@components/organisms/StudentDetailsModal';
import { dashboardRequestV2 } from '@services/student';
import { useAuthStore } from '@store/authStore';
import { useStreakStore } from '@store/streakStore';
import { ERRORS, MESSAGES } from '@constants/app';
import { LOGIN_PAGE, STUDENT_DASHBOARD } from '@constants/routes';
import axios from 'axios';

export interface StudentLeaderboardPageProps {}

const StudentLeaderboardPage: FC<StudentLeaderboardPageProps> = () => {
  const authToken = useAuthStore((state) => state.authToken);
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);
  const [loading, setLoading] = useState(true);
  const [apiError, setApiError] = useState<string | null>(null);
  const [fallBackLink, setFallBackLink] = useState<string>(STUDENT_DASHBOARD);
  const [fallBackAction, setFallBackAction] = useState<string>(MESSAGES.TRY_AGAIN);
  const { incrementStreak } = useStreakStore();

  const [leaderboard, setLeaderboard] = useState<any[]>([]);

  useEffect(() => {
    const fetchLeaderboard = async () => {
      setLoading(true);
      try {
        const res = await axios.get('/leaderboard/', {
          headers: { 'AUTH-TOKEN': authToken },
        });
        if (res.status === 200 && res.data.leaderboard) {
          setLeaderboard(res.data.leaderboard);
          setApiError(null);
        } else {
          setApiError('No leaderboard data found.');
        }
      } catch (error) {
        setApiError('Failed to fetch leaderboard.');
      } finally {
        setLoading(false);
      }
    };
    if (isAuthenticated) fetchLeaderboard();
    else setLoading(false);
  }, [authToken, isAuthenticated]);

  // Achievements data for modal (expanded placeholder set)
  const achievementsList = ACHIEVEMENTS;
  const [isAchievementsOpen, setIsAchievementsOpen] = useState(false);
  const [pinnedAchievementIds, setPinnedAchievementIds] = useState<number[]>([]);
  const [selectedStudent, setSelectedStudent] = useState<typeof leaderboard[number] | null>(null);
  const [isStudentModalOpen, setIsStudentModalOpen] = useState(false);
  const [isListExpanded, setIsListExpanded] = useState(false);
  const [pageSize, setPageSize] = useState<number>(10);
  const [page, setPage] = useState<number>(1);
  const [period, setPeriod] = useState<'Daily'|'Weekly'|'Monthly'|'All Time'>('All Time');
  const [scope, setScope] = useState<'Global'|'Country'|'School'>('Global');

  // Persist pinned achievements across refresh using localStorage
  useEffect(() => {
    try {
      const saved = localStorage.getItem('pinnedAchievementIds');
      if (saved) {
        const parsed = JSON.parse(saved) as number[];
        if (Array.isArray(parsed)) {
          setPinnedAchievementIds(parsed.slice(0, 6));
        }
      }
    } catch {
      // ignore corrupt storage
    }
  }, []);

  useEffect(() => {
    try {
      localStorage.setItem('pinnedAchievementIds', JSON.stringify(pinnedAchievementIds.slice(0, 6)));
    } catch {
      // storage might be full or blocked; ignore
    }
  }, [pinnedAchievementIds]);

  const yourIndex = useMemo(() => leaderboard.findIndex((s) => s.name === 'You'), [leaderboard]);
  const totalStudents = leaderboard.length;
  const totalPages = useMemo(() => Math.max(1, Math.ceil(totalStudents / pageSize)), [totalStudents, pageSize]);
  const currentPage = Math.min(page, totalPages);
  const pageSlice = useMemo(() => {
    const start = (currentPage - 1) * pageSize;
    const end = start + pageSize;
    return leaderboard.slice(start, end);
  }, [leaderboard, currentPage, pageSize]);

  const showCollapsedList = !isListExpanded;

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
            incrementStreak();
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
  }, [authToken, isAuthenticated, incrementStreak]);

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
              <div className="px-6 pt-2 tablet:p-10 desktop:px-24">
                <div className="grid grid-cols-1 desktop:grid-cols-3 gap-6">
                  {/* Main Content */}
                  <div className="desktop:col-span-2 space-y-6">
                    {/* Header */}
                    <div className="bg-black hover:bg-[#191919] transition-colors text-white p-6 rounded-2xl border border-gold/50 ring-1 ring-white/5 backdrop-blur-xl">
                      <h1 className="text-3xl font-bold mb-4 flex items-center">
                        <span className="mr-2">🏆</span>
                        Lightning Leaderboard
                      </h1>
                      <p className="text-gray-300">
                        Compete with other students and climb the rankings!
                      </p>

                      {/* Secondary title and filters */}
                      <div className="mt-4">
                        <div className="flex items-center justify-between flex-wrap gap-3">
                          <h2 className="text-xl font-bold">Global Leaderboard</h2>
                          <div className="flex items-center gap-4">
                            {/* Period filter */}
                            <div className="flex items-center gap-2">
                              <span className="text-sm text-gray-300">Period:</span>
                              <div className="flex bg-[#0f0f0f] border border-gray-700 rounded-lg overflow-hidden">
                                {(['Daily','Weekly','Monthly','All Time'] as const).map((p) => (
                                  <button
                                    key={p}
                                    className={`px-3 py-1.5 text-sm ${period===p ? 'bg-gold text-black font-semibold' : 'text-gray-300 hover:bg-[#151515]'}`}
                                    onClick={() => setPeriod(p)}
                                  >{p}</button>
                                ))}
                              </div>
                            </div>

                            {/* Scope filter */}
                            <div className="flex items-center gap-2">
                              <span className="text-sm text-gray-300">Scope:</span>
                              <div className="flex bg-[#0f0f0f] border border-gray-700 rounded-lg overflow-hidden">
                                {(['Global','Country','School'] as const).map((s) => (
                                  <button
                                    key={s}
                                    className={`px-3 py-1.5 text-sm ${scope===s ? 'bg-gold text-black font-semibold' : 'text-gray-300 hover:bg-[#151515]'}`}
                                    onClick={() => setScope(s)}
                                  >{s}</button>
                                ))}
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Leaderboard */}
                    <div className="bg-[#080808] hover:bg-[#1b1b1b] transition-colors backdrop-blur-xl text-white p-8 rounded-2xl border border-gold/50 shadow-2xl shadow-black/50 relative overflow-hidden">
                      {/* Animated background elements */}
                      <div className="absolute inset-0 bg-gradient-to-r from-gold/5 via-transparent to-lightGold/5 animate-pulse"></div>
                      <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-gold via-lightGold to-gold"></div>
                      <h2 className="text-2xl font-bold mb-6 flex items-center">
                        <span className="mr-2">⚡</span>
                        Top Students
                      </h2>
                      
                       <div className="space-y-3">
                        {(showCollapsedList ? leaderboard.slice(0, 10) : pageSlice).map((student) => (
                          <div 
                            key={student.rank} 
                            className={`flex items-center space-x-4 p-4 rounded-xl transition-all duration-300 relative overflow-hidden ${
                              student.name === 'You' 
                                ? 'bg-gradient-to-r from-blue-600/20 to-purple-600/20 border border-blue-500/30 shadow-[0_0_20px_rgba(59,130,246,0.25)]' 
                                : 'bg-[#080808]/80 hover:bg-[#191919] border border-gold/30 ring-1 ring-white/5 shadow-lg hover:shadow-[0_0_20px_rgba(255,186,8,0.15)] hover:scale-[1.02]'
                            }`}
                          >
                            <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold ${getRankBadgeColor(student.rank)}`}>
                              {student.rank}
                            </div>
                            <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white font-bold text-sm shadow-lg border border-white/10">
                              {student.avatar}
                            </div>
                            <div className="flex-1">
                          <div className="flex justify-between items-center">
                            <div>
                              <button
                                className={`text-sm font-medium underline-offset-2 hover:underline ${student.name === 'You' ? 'text-blue-300' : 'text-white'}`}
                                onClick={() => { setSelectedStudent(student); setIsStudentModalOpen(true); }}
                              >
                                {student.name}
                              </button>
                                  <p className="text-xs text-gray-400">
                                    Level {student.level} • {student.streak} Day Streak
                                  </p>
                                </div>
                                <div className="text-right">
                                  <p className="text-sm font-semibold text-gold">
                                    {student.xp.toLocaleString()} XP
                                  </p>
                                </div>
                              </div>
                            </div>
                          </div>
                        ))}

                        {/* Collapsed: always show your row as 11th position */}
                        {showCollapsedList && yourIndex !== -1 && (
                          <div 
                            className={`flex items-center space-x-4 p-4 rounded-lg transition-colors bg-gradient-to-r from-blue-600/20 to-purple-600/20 border border-blue-500/30`}
                          >
                            <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold ${getRankBadgeColor(leaderboard[yourIndex].rank)}`}>
                              {leaderboard[yourIndex].rank}
                            </div>
                            <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white font-bold text-sm shadow-lg border border-white/10">
                              {leaderboard[yourIndex].avatar}
                            </div>
                            <div className="flex-1">
                              <div className="flex justify-between items-center">
                                <div>
                                  <button
                                    className={`text-sm font-medium underline-offset-2 hover:underline text-blue-300`}
                                    onClick={() => { setSelectedStudent(leaderboard[yourIndex]); setIsStudentModalOpen(true); }}
                                  >
                                    {leaderboard[yourIndex].name} (Your Position)
                                  </button>
                                  <p className="text-xs text-gray-400">
                                    Level {leaderboard[yourIndex].level} • {leaderboard[yourIndex].streak} Day Streak
                                  </p>
                                </div>
                                <div className="text-right">
                                  <p className="text-sm font-semibold text-gold">
                                    {leaderboard[yourIndex].xp.toLocaleString()} XP
                                  </p>
                                </div>
                              </div>
                            </div>
                          </div>
                        )}
                      </div>

                      {/* Footer controls */}
                      <div className="mt-4 flex items-center justify-between">
                        {showCollapsedList ? (
                          <button
                            className="px-4 py-2 rounded-xl border border-gold/50 hover:bg-[#191919] text-white font-bold transition-all duration-200 backdrop-blur-md shadow-lg hover:shadow-[0_0_20px_rgba(255,186,8,0.15)]"
                            onClick={() => {
                              setIsListExpanded(true);
                              // jump to page containing your rank
                              const targetPage = yourIndex !== -1 ? Math.floor(yourIndex / pageSize) + 1 : 1;
                              setPage(targetPage);
                            }}
                          >
                            View more
                          </button>
                        ) : (
                          <div className="flex items-center gap-3 w-full justify-between">
                            <div className="flex items-center gap-2">
                              <span className="text-sm text-gray-300">Items per page:</span>
                              <select
                                className="bg-[#0f0f0f] border border-gray-700 rounded-md px-2 py-1 text-sm text-white"
                                value={pageSize}
                                onChange={(e) => {
                                  const newSize = parseInt(e.target.value, 10);
                                  setPageSize(newSize);
                                  const targetPage = yourIndex !== -1 ? Math.floor(yourIndex / newSize) + 1 : 1;
                                  setPage(targetPage);
                                }}
                              >
                                <option value={10}>10</option>
                                <option value={25}>25</option>
                                <option value={50}>50</option>
                              </select>
                              <span className="text-sm text-gray-300">
                                {`${(currentPage - 1) * pageSize + 1} – ${Math.min(currentPage * pageSize, totalStudents)} of ${totalStudents}`}
                              </span>
                            </div>

                            <div className="flex items-center gap-2">
                              <button
                                className="px-2 py-1 rounded border border-gray-700 text-white disabled:opacity-40"
                                onClick={() => setPage(1)}
                                disabled={currentPage === 1}
                                title="First page"
                              >⏮</button>
                              <button
                                className="px-2 py-1 rounded border border-gray-700 text-white disabled:opacity-40"
                                onClick={() => setPage((p) => Math.max(1, p - 1))}
                                disabled={currentPage === 1}
                                title="Previous"
                              >◀</button>
                              <button
                                className="px-2 py-1 rounded border border-gray-700 text-white disabled:opacity-40"
                                onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                                disabled={currentPage === totalPages}
                                title="Next"
                              >▶</button>
                              <button
                                className="px-2 py-1 rounded border border-gray-700 text-white disabled:opacity-40"
                                onClick={() => setPage(totalPages)}
                                disabled={currentPage === totalPages}
                                title="Last page"
                              >⏭</button>
                              <button
                                className="ml-2 px-3 py-1 rounded-lg border border-gold/40 hover:bg-[#1b1b1b]"
                                onClick={() => setIsListExpanded(false)}
                              >Collapse</button>
                            </div>
                          </div>
                        )}
                      </div>
                    </div>

                    
                  </div>

                  {/* Right Sidebar */}
                  <aside className="space-y-6">
                    <div className="bg-black hover:bg-[#191919] transition-colors text-white p-4 rounded-2xl border border-gold/50 ring-1 ring-white/5 backdrop-blur-xl">
                      <AchievementsSection compact onViewAll={() => setIsAchievementsOpen(true)} items={achievementsList.filter(a => pinnedAchievementIds.includes(a.id))} />
                    </div>

                    {/* Statistics (moved to sidebar) */}
                    <div className="space-y-6">
                    <div className="bg-black text-white p-6 rounded-2xl border border-gold/50 ring-1 ring-white/5">
                        <h3 className="text-lg font-semibold mb-1">Your Ranking</h3>
                        <div className="flex items-center justify-between">
                          <div>
                            <p className="text-3xl font-extrabold text-blue-400">{yourIndex !== -1 ? `#${yourIndex + 1}` : '—'}</p>
                            <p className="text-sm text-gray-300">{yourIndex !== -1 ? `${getOrdinal(yourIndex + 1)} Place` : 'Not ranked'}</p>
                            <p className="text-xs text-gray-400">Out of {totalStudents.toLocaleString()} players</p>
                          </div>
                          <div className="text-right">
                            <p className="text-sm font-semibold text-gray-300">Next Rank</p>
                            <p className="text-lg font-bold text-green-400">360 pts needed</p>
                          </div>
                        </div>
                      </div>
                      <div className="bg-black text-white p-6 rounded-2xl border border-gold/50 ring-1 ring-white/5">
                        <h3 className="text-lg font-semibold mb-3">Community Stats</h3>
                        <div className="grid grid-cols-2 gap-4">
                          <div>
                            <p className="text-xs text-gray-400">Active Players</p>
                            <p className="text-xl font-bold text-purple-300">1,247</p>
                          </div>
                          <div>
                            <p className="text-xs text-gray-400">Countries</p>
                            <p className="text-xl font-bold text-blue-300">38</p>
                          </div>
                          <div>
                            <p className="text-xs text-gray-400">Problems Solved Today</p>
                            <p className="text-xl font-bold text-green-300">12,450</p>
                          </div>
                          <div>
                            <p className="text-xs text-gray-400">Average Accuracy</p>
                            <p className="text-xl font-bold text-yellow-300">89.3%</p>
                          </div>
                        </div>

                      </div>
                    </div>

                    {/* Quick Actions (moved to sidebar) */}
                    <div className="bg-[#080808] hover:bg-[#1b1b1b] transition-colors backdrop-blur-xl text-white p-6 rounded-2xl border border-gold/50 shadow-2xl shadow-black/50 relative overflow-hidden">
                      {/* Animated background elements */}
                      <div className="absolute inset-0 bg-gradient-to-r from-gold/5 via-transparent to-lightGold/5 animate-pulse"></div>
                      
                      <div className="relative z-10">
                        <h2 className="text-xl font-bold mb-6 text-center">Quick Actions</h2>
                        <div className="flex flex-col gap-4">
                          <a href="/student/practice" className="w-full bg-transparent hover:bg-[#191919] text-white px-6 py-3 rounded-xl font-bold transition-all duration-300 transform hover:scale-105 border border-gold/40 hover:border-gold text-center">
                            Practice to Earn XP
                          </a>
                          <button onClick={() => setIsAchievementsOpen(true)} className="w-full bg-transparent hover:bg-[#191919] text-white px-6 py-3 rounded-xl font-bold transition-all duration-300 transform hover:scale-105 border border-gold/40 hover:border-gold text-center">
                            View Achievements
                          </button>
                          <button onClick={() => window.print()} className="w-full bg-transparent hover:bg-[#191919] text-white px-6 py-3 rounded-xl font-bold transition-all duration-300 transform hover:scale-105 border border-gold/40 hover:border-gold text-center">
                            Share Progress (PDF)
                          </button>
                        </div>
                      </div>
                    </div>
                  </aside>
                </div>
              </div>
              <AchievementsModal 
                isOpen={isAchievementsOpen} 
                onClose={() => setIsAchievementsOpen(false)} 
                achievements={achievementsList}
                pinnedIds={pinnedAchievementIds}
                onTogglePin={(id) => setPinnedAchievementIds((prev) => {
                  const isPinned = prev.includes(id);
                  if (isPinned) return prev.filter(x => x !== id);
                  if (prev.length >= 6) return prev; // cap at 6
                  return [...prev, id];
                })}
              />
              <StudentDetailsModal isOpen={isStudentModalOpen} onClose={() => setIsStudentModalOpen(false)} student={selectedStudent} />
            </>
          )}
        </div>
      )}
    </div>
  );
};

export default StudentLeaderboardPage; 