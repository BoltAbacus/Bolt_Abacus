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
  const { updateStreak } = useStreakStore();

  const [leaderboard, setLeaderboard] = useState<any[]>([]);

  // Fallback data for when API is not available
  const fallbackLeaderboard = [
    { rank: 1, name: 'Emma Johnson', xp: 8920, level: 5, streak: 18, userId: 1 },
    { rank: 2, name: 'Alex Chen', xp: 8745, level: 5, streak: 22, userId: 2 },
    { rank: 3, name: 'Sarah Davis', xp: 8567, level: 4, streak: 15, userId: 3 },
    { rank: 4, name: 'Mike Wilson', xp: 8432, level: 4, streak: 11, userId: 4 },
    { rank: 5, name: 'Lisa Brown', xp: 8298, level: 4, streak: 9, userId: 5 },
    { rank: 6, name: 'John Taylor', xp: 8156, level: 3, streak: 13, userId: 6 },
    { rank: 7, name: 'Maria Anderson', xp: 8023, level: 3, streak: 7, userId: 7 },
    { rank: 8, name: 'David Martinez', xp: 7891, level: 3, streak: 16, userId: 8 },
    { rank: 9, name: 'Anna Garcia', xp: 7754, level: 2, streak: 12, userId: 9 },
    { rank: 10, name: 'Robert Miller', xp: 7623, level: 2, streak: 8, userId: 10 },
    { rank: 11, name: 'Sophie Wilson', xp: 7489, level: 2, streak: 14, userId: 11 },
    { rank: 12, name: 'Michael Brown', xp: 7356, level: 2, streak: 6, userId: 12 },
    { rank: 13, name: 'Olivia Davis', xp: 7223, level: 1, streak: 19, userId: 13 },
    { rank: 14, name: 'William Johnson', xp: 7090, level: 1, streak: 5, userId: 14 },
    { rank: 15, name: 'Ava Rodriguez', xp: 6956, level: 1, streak: 8, userId: 15 },
    { rank: 16, name: 'James Thompson', xp: 6823, level: 1, streak: 12, userId: 16 },
    { rank: 17, name: 'Isabella Lee', xp: 6690, level: 1, streak: 4, userId: 17 },
    { rank: 18, name: 'Benjamin Clark', xp: 6557, level: 1, streak: 15, userId: 18 },
    { rank: 19, name: 'Mia Lewis', xp: 6424, level: 1, streak: 7, userId: 19 },
    { rank: 20, name: 'Ethan Walker', xp: 6291, level: 1, streak: 11, userId: 20 },
    { rank: 21, name: 'Charlotte Hall', xp: 6158, level: 1, streak: 9, userId: 21 },
    { rank: 22, name: 'Alexander Young', xp: 6025, level: 1, streak: 13, userId: 22 },
    { rank: 23, name: 'Amelia King', xp: 5892, level: 1, streak: 6, userId: 23 },
    { rank: 24, name: 'Henry Wright', xp: 5759, level: 1, streak: 10, userId: 24 },
    { rank: 25, name: 'Harper Lopez', xp: 5626, level: 1, streak: 16, userId: 25 },
    { rank: 26, name: 'Sebastian Hill', xp: 5493, level: 1, streak: 3, userId: 26 },
    { rank: 27, name: 'Evelyn Scott', xp: 5360, level: 1, streak: 14, userId: 27 },
    { rank: 28, name: 'Jack Green', xp: 5227, level: 1, streak: 8, userId: 28 },
    { rank: 29, name: 'Abigail Adams', xp: 5094, level: 1, streak: 5, userId: 29 },
    { rank: 30, name: 'Owen Baker', xp: 4961, level: 1, streak: 12, userId: 30 },
    { rank: 31, name: 'Emily Nelson', xp: 4828, level: 1, streak: 7, userId: 31 },
    { rank: 32, name: 'Daniel Carter', xp: 4695, level: 1, streak: 9, userId: 32 },
    { rank: 33, name: 'Elizabeth Mitchell', xp: 4562, level: 1, streak: 11, userId: 33 },
    { rank: 34, name: 'Jackson Perez', xp: 4429, level: 1, streak: 4, userId: 34 },
    { rank: 35, name: 'Sofia Roberts', xp: 4296, level: 1, streak: 13, userId: 35 },
    { rank: 36, name: 'Samuel Turner', xp: 4163, level: 1, streak: 6, userId: 36 },
    { rank: 37, name: 'Avery Phillips', xp: 4030, level: 1, streak: 15, userId: 37 },
    { rank: 38, name: 'Aiden Campbell', xp: 3897, level: 1, streak: 8, userId: 38 },
    { rank: 39, name: 'Ella Parker', xp: 3764, level: 1, streak: 10, userId: 39 },
    { rank: 40, name: 'Grayson Evans', xp: 3631, level: 1, streak: 12, userId: 40 },
    { rank: 41, name: 'Madison Edwards', xp: 3498, level: 1, streak: 5, userId: 41 },
    { rank: 42, name: 'Leo Collins', xp: 3365, level: 1, streak: 14, userId: 42 },
    { rank: 43, name: 'Scarlett Stewart', xp: 3232, level: 1, streak: 7, userId: 43 },
    { rank: 44, name: 'Muhammad Sanchez', xp: 3099, level: 1, streak: 9, userId: 44 },
    { rank: 45, name: 'Victoria Morris', xp: 2966, level: 1, streak: 11, userId: 45 },
    { rank: 46, name: 'Lucas Rogers', xp: 2833, level: 1, streak: 6, userId: 46 },
    { rank: 47, name: 'Luna Reed', xp: 2700, level: 1, streak: 13, userId: 47 },
    { rank: 48, name: 'Mason Cook', xp: 2567, level: 1, streak: 8, userId: 48 },
    { rank: 49, name: 'Chloe Morgan', xp: 2434, level: 1, streak: 10, userId: 49 },
    { rank: 50, name: 'Oliver Bell', xp: 2301, level: 1, streak: 4, userId: 50 },
    { rank: 51, name: 'Penelope Murphy', xp: 2168, level: 1, streak: 12, userId: 51 },
    { rank: 52, name: 'Elijah Bailey', xp: 2035, level: 1, streak: 7, userId: 52 },
    { rank: 53, name: 'Layla Rivera', xp: 1902, level: 1, streak: 9, userId: 53 },
    { rank: 54, name: 'Gianni Cooper', xp: 1769, level: 1, streak: 5, userId: 54 },
    { rank: 55, name: 'Riley Richardson', xp: 1636, level: 1, streak: 11, userId: 55 },
    { rank: 56, name: 'Nora Cox', xp: 1503, level: 1, streak: 8, userId: 56 },
    { rank: 57, name: 'Adrian Ward', xp: 1370, level: 1, streak: 6, userId: 57 },
    { rank: 58, name: 'Lily Torres', xp: 1237, level: 1, streak: 10, userId: 58 },
    { rank: 59, name: 'Connor Peterson', xp: 1104, level: 1, streak: 4, userId: 59 },
    { rank: 60, name: 'Hannah Gray', xp: 971, level: 1, streak: 7, userId: 60 },
    { rank: 61, name: 'Jayden Ramirez', xp: 838, level: 1, streak: 9, userId: 61 },
    { rank: 62, name: 'Lillian James', xp: 705, level: 1, streak: 5, userId: 62 },
    { rank: 63, name: 'Isaac Watson', xp: 572, level: 1, streak: 8, userId: 63 },
    { rank: 64, name: 'Aria Brooks', xp: 439, level: 1, streak: 6, userId: 64 },
    { rank: 65, name: 'Carter Kelly', xp: 306, level: 1, streak: 10, userId: 65 },
    { rank: 66, name: 'Ellie Sanders', xp: 173, level: 1, streak: 4, userId: 66 },
    { rank: 67, name: 'Julian Price', xp: 140, level: 1, streak: 7, userId: 67 },
    { rank: 68, name: 'Stella Bennett', xp: 107, level: 1, streak: 9, userId: 68 },
    { rank: 69, name: 'Aaron Wood', xp: 74, level: 1, streak: 5, userId: 69 },
    { rank: 70, name: 'Natalie Barnes', xp: 41, level: 1, streak: 8, userId: 70 },
    { rank: 71, name: 'Evan Ross', xp: 38, level: 1, streak: 6, userId: 71 },
    { rank: 72, name: 'Addison Henderson', xp: 35, level: 1, streak: 10, userId: 72 },
    { rank: 73, name: 'Dylan Coleman', xp: 32, level: 1, streak: 4, userId: 73 },
    { rank: 74, name: 'Brooklyn Jenkins', xp: 29, level: 1, streak: 7, userId: 74 },
    { rank: 75, name: 'Nathan Perry', xp: 26, level: 1, streak: 9, userId: 75 },
    { rank: 76, name: 'Paisley Powell', xp: 23, level: 1, streak: 5, userId: 76 },
    { rank: 77, name: 'Hunter Long', xp: 20, level: 1, streak: 8, userId: 77 },
    { rank: 78, name: 'Autumn Patterson', xp: 17, level: 1, streak: 6, userId: 78 },
    { rank: 79, name: 'Levi Hughes', xp: 14, level: 1, streak: 10, userId: 79 },
    { rank: 80, name: 'Savannah Flores', xp: 11, level: 1, streak: 4, userId: 80 },
    { rank: 81, name: 'Christian Butler', xp: 8, level: 1, streak: 7, userId: 81 },
    { rank: 82, name: 'Claire Simmons', xp: 5, level: 1, streak: 9, userId: 82 },
    { rank: 83, name: 'Isaiah Foster', xp: 3, level: 1, streak: 5, userId: 83 },
    { rank: 84, name: 'Skylar Gonzales', xp: 2, level: 1, streak: 8, userId: 84 },
    { rank: 85, name: 'Andrew Bryant', xp: 1, level: 1, streak: 6, userId: 85 },
    { rank: 86, name: 'Lucy Alexander', xp: 1, level: 1, streak: 4, userId: 86 },
    { rank: 87, name: 'Joshua Russell', xp: 1, level: 1, streak: 7, userId: 87 },
    { rank: 88, name: 'Audrey Griffin', xp: 1, level: 1, streak: 9, userId: 88 },
    { rank: 89, name: 'Christopher Diaz', xp: 1, level: 1, streak: 5, userId: 89 },
    { rank: 90, name: 'Bella Hayes', xp: 1, level: 1, streak: 8, userId: 90 },
    { rank: 91, name: 'Isaac Myers', xp: 1, level: 1, streak: 6, userId: 91 },
    { rank: 92, name: 'Aurora Ford', xp: 1, level: 1, streak: 10, userId: 92 },
    { rank: 93, name: 'Caden Ortiz', xp: 1, level: 1, streak: 4, userId: 93 },
    { rank: 94, name: 'Nova McCarthy', xp: 1, level: 1, streak: 7, userId: 94 },
    { rank: 95, name: 'Roman Thornton', xp: 1, level: 1, streak: 9, userId: 95 },
    { rank: 96, name: 'Emilia Quinn', xp: 1, level: 1, streak: 5, userId: 96 },
    { rank: 97, name: 'Kayden Spencer', xp: 1, level: 1, streak: 8, userId: 97 },
    { rank: 98, name: 'Everly Ball', xp: 1, level: 1, streak: 6, userId: 98 },
    { rank: 99, name: 'Ryder Trujillo', xp: 1, level: 1, streak: 10, userId: 99 },
    { rank: 100, name: 'You', xp: 1850, level: 1, streak: 3, userId: 999 },
  ];

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
          // Use fallback data if API returns no data
          setLeaderboard(fallbackLeaderboard);
          setApiError(null);
        }
      } catch (error) {
        // Use fallback data if API fails
        setLeaderboard(fallbackLeaderboard);
        setApiError(null);
      } finally {
        setLoading(false);
      }
    };
    if (isAuthenticated) fetchLeaderboard();
    else {
      // Use fallback data if not authenticated
      setLeaderboard(fallbackLeaderboard);
      setLoading(false);
    }
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
                                <option value={100}>100</option>
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