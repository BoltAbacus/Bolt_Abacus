import { FC, useEffect, useMemo, useState } from 'react';
import { isAxiosError } from 'axios';
import SeoComponent from '@components/atoms/SeoComponent';
import ErrorBox from '@components/organisms/ErrorBox';
import LoadingBox from '@components/organisms/LoadingBox';
import StudentDetailsModal from '@components/organisms/StudentDetailsModal';
import { dashboardRequestV2 } from '@services/student';
import { useAuthStore } from '@store/authStore';
import { ERRORS, MESSAGES } from '@constants/app';
import { LOGIN_PAGE, TEACHER_DASHBOARD } from '@constants/routes';

export interface TeacherLeaderboardPageProps {}

const TeacherLeaderboardPage: FC<TeacherLeaderboardPageProps> = () => {
  const authToken = useAuthStore((state) => state.authToken);
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);
  const [loading, setLoading] = useState(true);
  const [apiError, setApiError] = useState<string | null>(null);
  const [fallBackLink, setFallBackLink] = useState<string>(TEACHER_DASHBOARD);
  const [fallBackAction, setFallBackAction] = useState<string>(MESSAGES.TRY_AGAIN);

  const [leaderboard, setLeaderboard] = useState<any[]>([]);

  // Fallback data for when API is not available
  const fallbackLeaderboard = [
    { rank: 1, name: 'Emma Johnson', xp: 8920, level: 5, streak: 18, userId: 1, avatar: 'EJ', batch: 'Advanced Math' },
    { rank: 2, name: 'Alex Chen', xp: 8745, level: 5, streak: 22, userId: 2, avatar: 'AC', batch: 'Advanced Math' },
    { rank: 3, name: 'Sarah Davis', xp: 8567, level: 4, streak: 15, userId: 3, avatar: 'SD', batch: 'Intermediate Math' },
    { rank: 4, name: 'Mike Wilson', xp: 8432, level: 4, streak: 11, userId: 4, avatar: 'MW', batch: 'Intermediate Math' },
    { rank: 5, name: 'Lisa Brown', xp: 8298, level: 4, streak: 9, userId: 5, avatar: 'LB', batch: 'Intermediate Math' },
    { rank: 6, name: 'John Taylor', xp: 8156, level: 3, streak: 13, userId: 6, avatar: 'JT', batch: 'Beginner Math' },
    { rank: 7, name: 'Maria Anderson', xp: 8023, level: 3, streak: 7, userId: 7, avatar: 'MA', batch: 'Beginner Math' },
    { rank: 8, name: 'David Martinez', xp: 7891, level: 3, streak: 16, userId: 8, avatar: 'DM', batch: 'Beginner Math' },
    { rank: 9, name: 'Anna Garcia', xp: 7754, level: 2, streak: 12, userId: 9, avatar: 'AG', batch: 'Foundation Math' },
    { rank: 10, name: 'Robert Miller', xp: 7623, level: 2, streak: 8, userId: 10, avatar: 'RM', batch: 'Foundation Math' },
    { rank: 11, name: 'Sophie Wilson', xp: 7489, level: 2, streak: 14, userId: 11, avatar: 'SW', batch: 'Foundation Math' },
    { rank: 12, name: 'Michael Brown', xp: 7356, level: 2, streak: 6, userId: 12, avatar: 'MB', batch: 'Foundation Math' },
    { rank: 13, name: 'Olivia Davis', xp: 7223, level: 1, streak: 19, userId: 13, avatar: 'OD', batch: 'Basic Math' },
    { rank: 14, name: 'William Johnson', xp: 7090, level: 1, streak: 5, userId: 14, avatar: 'WJ', batch: 'Basic Math' },
    { rank: 15, name: 'Ava Rodriguez', xp: 6956, level: 1, streak: 8, userId: 15, avatar: 'AR', batch: 'Basic Math' },
    { rank: 16, name: 'James Thompson', xp: 6823, level: 1, streak: 12, userId: 16, avatar: 'JT', batch: 'Basic Math' },
    { rank: 17, name: 'Isabella Lee', xp: 6690, level: 1, streak: 4, userId: 17, avatar: 'IL', batch: 'Basic Math' },
    { rank: 18, name: 'Benjamin Clark', xp: 6557, level: 1, streak: 15, userId: 18, avatar: 'BC', batch: 'Basic Math' },
    { rank: 19, name: 'Mia Lewis', xp: 6424, level: 1, streak: 7, userId: 19, avatar: 'ML', batch: 'Basic Math' },
    { rank: 20, name: 'Ethan Walker', xp: 6291, level: 1, streak: 11, userId: 20, avatar: 'EW', batch: 'Basic Math' },
    { rank: 21, name: 'Charlotte Hall', xp: 6158, level: 1, streak: 9, userId: 21, avatar: 'CH', batch: 'Basic Math' },
    { rank: 22, name: 'Alexander Young', xp: 6025, level: 1, streak: 13, userId: 22, avatar: 'AY', batch: 'Basic Math' },
    { rank: 23, name: 'Amelia King', xp: 5892, level: 1, streak: 6, userId: 23, avatar: 'AK', batch: 'Basic Math' },
    { rank: 24, name: 'Henry Wright', xp: 5759, level: 1, streak: 10, userId: 24, avatar: 'HW', batch: 'Basic Math' },
    { rank: 25, name: 'Harper Lopez', xp: 5626, level: 1, streak: 16, userId: 25, avatar: 'HL', batch: 'Basic Math' },
    { rank: 26, name: 'Sebastian Hill', xp: 5493, level: 1, streak: 3, userId: 26, avatar: 'SH', batch: 'Basic Math' },
    { rank: 27, name: 'Evelyn Scott', xp: 5360, level: 1, streak: 14, userId: 27, avatar: 'ES', batch: 'Basic Math' },
    { rank: 28, name: 'Jack Green', xp: 5227, level: 1, streak: 8, userId: 28, avatar: 'JG', batch: 'Basic Math' },
    { rank: 29, name: 'Abigail Adams', xp: 5094, level: 1, streak: 5, userId: 29, avatar: 'AA', batch: 'Basic Math' },
    { rank: 30, name: 'Owen Baker', xp: 4961, level: 1, streak: 12, userId: 30, avatar: 'OB', batch: 'Basic Math' },
    { rank: 31, name: 'Emily Nelson', xp: 4828, level: 1, streak: 7, userId: 31, avatar: 'EN', batch: 'Basic Math' },
    { rank: 32, name: 'Daniel Carter', xp: 4695, level: 1, streak: 9, userId: 32, avatar: 'DC', batch: 'Basic Math' },
    { rank: 33, name: 'Elizabeth Mitchell', xp: 4562, level: 1, streak: 11, userId: 33, avatar: 'EM', batch: 'Basic Math' },
    { rank: 34, name: 'Jackson Perez', xp: 4429, level: 1, streak: 4, userId: 34, avatar: 'JP', batch: 'Basic Math' },
    { rank: 35, name: 'Sofia Roberts', xp: 4296, level: 1, streak: 13, userId: 35, avatar: 'SR', batch: 'Basic Math' },
    { rank: 36, name: 'Samuel Turner', xp: 4163, level: 1, streak: 6, userId: 36, avatar: 'ST', batch: 'Basic Math' },
    { rank: 37, name: 'Avery Phillips', xp: 4030, level: 1, streak: 15, userId: 37, avatar: 'AP', batch: 'Basic Math' },
    { rank: 38, name: 'Aiden Campbell', xp: 3897, level: 1, streak: 8, userId: 38, avatar: 'AC', batch: 'Basic Math' },
    { rank: 39, name: 'Ella Parker', xp: 3764, level: 1, streak: 10, userId: 39, avatar: 'EP', batch: 'Basic Math' },
    { rank: 40, name: 'Grayson Evans', xp: 3631, level: 1, streak: 12, userId: 40, avatar: 'GE', batch: 'Basic Math' },
    { rank: 41, name: 'Madison Edwards', xp: 3498, level: 1, streak: 5, userId: 41, avatar: 'ME', batch: 'Basic Math' },
    { rank: 42, name: 'Leo Collins', xp: 3365, level: 1, streak: 14, userId: 42, avatar: 'LC', batch: 'Basic Math' },
    { rank: 43, name: 'Scarlett Stewart', xp: 3232, level: 1, streak: 7, userId: 43, avatar: 'SS', batch: 'Basic Math' },
    { rank: 44, name: 'Muhammad Sanchez', xp: 3099, level: 1, streak: 9, userId: 44, avatar: 'MS', batch: 'Basic Math' },
    { rank: 45, name: 'Victoria Morris', xp: 2966, level: 1, streak: 11, userId: 45, avatar: 'VM', batch: 'Basic Math' },
    { rank: 46, name: 'Lucas Rogers', xp: 2833, level: 1, streak: 6, userId: 46, avatar: 'LR', batch: 'Basic Math' },
    { rank: 47, name: 'Luna Reed', xp: 2700, level: 1, streak: 13, userId: 47, avatar: 'LR', batch: 'Basic Math' },
    { rank: 48, name: 'Mason Cook', xp: 2567, level: 1, streak: 8, userId: 48, avatar: 'MC', batch: 'Basic Math' },
    { rank: 49, name: 'Chloe Morgan', xp: 2434, level: 1, streak: 10, userId: 49, avatar: 'CM', batch: 'Basic Math' },
    { rank: 50, name: 'Oliver Bell', xp: 2301, level: 1, streak: 4, userId: 50, avatar: 'OB', batch: 'Basic Math' },
    { rank: 51, name: 'Penelope Murphy', xp: 2168, level: 1, streak: 12, userId: 51, avatar: 'PM', batch: 'Basic Math' },
    { rank: 52, name: 'Elijah Bailey', xp: 2035, level: 1, streak: 7, userId: 52, avatar: 'EB', batch: 'Basic Math' },
    { rank: 53, name: 'Layla Rivera', xp: 1902, level: 1, streak: 9, userId: 53, avatar: 'LR', batch: 'Basic Math' },
    { rank: 54, name: 'Gianni Cooper', xp: 1769, level: 1, streak: 5, userId: 54, avatar: 'GC', batch: 'Basic Math' },
    { rank: 55, name: 'Riley Richardson', xp: 1636, level: 1, streak: 11, userId: 55, avatar: 'RR', batch: 'Basic Math' },
    { rank: 56, name: 'Nora Cox', xp: 1503, level: 1, streak: 8, userId: 56, avatar: 'NC', batch: 'Basic Math' },
    { rank: 57, name: 'Adrian Ward', xp: 1370, level: 1, streak: 6, userId: 57, avatar: 'AW', batch: 'Basic Math' },
    { rank: 58, name: 'Lily Torres', xp: 1237, level: 1, streak: 10, userId: 58, avatar: 'LT', batch: 'Basic Math' },
    { rank: 59, name: 'Connor Peterson', xp: 1104, level: 1, streak: 4, userId: 59, avatar: 'CP', batch: 'Basic Math' },
    { rank: 60, name: 'Hannah Gray', xp: 971, level: 1, streak: 7, userId: 60, avatar: 'HG', batch: 'Basic Math' },
    { rank: 61, name: 'Jayden Ramirez', xp: 838, level: 1, streak: 9, userId: 61, avatar: 'JR', batch: 'Basic Math' },
    { rank: 62, name: 'Lillian James', xp: 705, level: 1, streak: 5, userId: 62, avatar: 'LJ', batch: 'Basic Math' },
    { rank: 63, name: 'Isaac Watson', xp: 572, level: 1, streak: 8, userId: 63, avatar: 'IW', batch: 'Basic Math' },
    { rank: 64, name: 'Aria Brooks', xp: 439, level: 1, streak: 6, userId: 64, avatar: 'AB', batch: 'Basic Math' },
    { rank: 65, name: 'Carter Kelly', xp: 306, level: 1, streak: 10, userId: 65, avatar: 'CK', batch: 'Basic Math' },
    { rank: 66, name: 'Ellie Sanders', xp: 173, level: 1, streak: 4, userId: 66, avatar: 'ES', batch: 'Basic Math' },
    { rank: 67, name: 'Julian Price', xp: 140, level: 1, streak: 7, userId: 67, avatar: 'JP', batch: 'Basic Math' },
    { rank: 68, name: 'Stella Bennett', xp: 107, level: 1, streak: 9, userId: 68, avatar: 'SB', batch: 'Basic Math' },
    { rank: 69, name: 'Aaron Wood', xp: 74, level: 1, streak: 5, userId: 69, avatar: 'AW', batch: 'Basic Math' },
    { rank: 70, name: 'Natalie Barnes', xp: 41, level: 1, streak: 8, userId: 70, avatar: 'NB', batch: 'Basic Math' },
    { rank: 71, name: 'Evan Ross', xp: 38, level: 1, streak: 6, userId: 71, avatar: 'ER', batch: 'Basic Math' },
    { rank: 72, name: 'Addison Henderson', xp: 35, level: 1, streak: 10, userId: 72, avatar: 'AH', batch: 'Basic Math' },
    { rank: 73, name: 'Dylan Coleman', xp: 32, level: 1, streak: 4, userId: 73, avatar: 'DC', batch: 'Basic Math' },
    { rank: 74, name: 'Brooklyn Jenkins', xp: 29, level: 1, streak: 7, userId: 74, avatar: 'BJ', batch: 'Basic Math' },
    { rank: 75, name: 'Nathan Perry', xp: 26, level: 1, streak: 9, userId: 75, avatar: 'NP', batch: 'Basic Math' },
    { rank: 76, name: 'Paisley Powell', xp: 23, level: 1, streak: 5, userId: 76, avatar: 'PP', batch: 'Basic Math' },
    { rank: 77, name: 'Hunter Long', xp: 20, level: 1, streak: 8, userId: 77, avatar: 'HL', batch: 'Basic Math' },
    { rank: 78, name: 'Autumn Patterson', xp: 17, level: 1, streak: 6, userId: 78, avatar: 'AP', batch: 'Basic Math' },
    { rank: 79, name: 'Levi Hughes', xp: 14, level: 1, streak: 10, userId: 79, avatar: 'LH', batch: 'Basic Math' },
    { rank: 80, name: 'Savannah Flores', xp: 11, level: 1, streak: 4, userId: 80, avatar: 'SF', batch: 'Basic Math' },
    { rank: 81, name: 'Christian Butler', xp: 8, level: 1, streak: 7, userId: 81, avatar: 'CB', batch: 'Basic Math' },
    { rank: 82, name: 'Claire Simmons', xp: 5, level: 1, streak: 9, userId: 82, avatar: 'CS', batch: 'Basic Math' },
    { rank: 83, name: 'Isaiah Foster', xp: 3, level: 1, streak: 5, userId: 83, avatar: 'IF', batch: 'Basic Math' },
    { rank: 84, name: 'Skylar Gonzales', xp: 2, level: 1, streak: 8, userId: 84, avatar: 'SG', batch: 'Basic Math' },
    { rank: 85, name: 'Andrew Bryant', xp: 1, level: 1, streak: 6, userId: 85, avatar: 'AB', batch: 'Basic Math' },
    { rank: 86, name: 'Lucy Alexander', xp: 1, level: 1, streak: 4, userId: 86, avatar: 'LA', batch: 'Basic Math' },
    { rank: 87, name: 'Joshua Russell', xp: 1, level: 1, streak: 7, userId: 87, avatar: 'JR', batch: 'Basic Math' },
    { rank: 88, name: 'Audrey Griffin', xp: 1, level: 1, streak: 9, userId: 88, avatar: 'AG', batch: 'Basic Math' },
    { rank: 89, name: 'Christopher Diaz', xp: 1, level: 1, streak: 5, userId: 89, avatar: 'CD', batch: 'Basic Math' },
    { rank: 90, name: 'Bella Hayes', xp: 1, level: 1, streak: 8, userId: 90, avatar: 'BH', batch: 'Basic Math' },
    { rank: 91, name: 'Isaac Myers', xp: 1, level: 1, streak: 6, userId: 91, avatar: 'IM', batch: 'Basic Math' },
    { rank: 92, name: 'Aurora Ford', xp: 1, level: 1, streak: 10, userId: 92, avatar: 'AF', batch: 'Basic Math' },
    { rank: 93, name: 'Caden Ortiz', xp: 1, level: 1, streak: 4, userId: 93, avatar: 'CO', batch: 'Basic Math' },
    { rank: 94, name: 'Nova McCarthy', xp: 1, level: 1, streak: 7, userId: 94, avatar: 'NM', batch: 'Basic Math' },
    { rank: 95, name: 'Roman Thornton', xp: 1, level: 1, streak: 9, userId: 95, avatar: 'RT', batch: 'Basic Math' },
    { rank: 96, name: 'Emilia Quinn', xp: 1, level: 1, streak: 5, userId: 96, avatar: 'EQ', batch: 'Basic Math' },
    { rank: 97, name: 'Kayden Spencer', xp: 1, level: 1, streak: 8, userId: 97, avatar: 'KS', batch: 'Basic Math' },
    { rank: 98, name: 'Everly Ball', xp: 1, level: 1, streak: 6, userId: 98, avatar: 'EB', batch: 'Basic Math' },
    { rank: 99, name: 'Ryder Trujillo', xp: 1, level: 1, streak: 10, userId: 99, avatar: 'RT', batch: 'Basic Math' },
    { rank: 100, name: 'You', xp: 1850, level: 1, streak: 3, userId: 999, avatar: 'YO', batch: 'Basic Math' },
  ];

  const [selectedStudent, setSelectedStudent] = useState<typeof leaderboard[number] | null>(null);
  const [isStudentModalOpen, setIsStudentModalOpen] = useState(false);
  const [isListExpanded, setIsListExpanded] = useState(false);
  const [pageSize, setPageSize] = useState<number>(10);
  const [page, setPage] = useState<number>(1);
  const [period, setPeriod] = useState<'Daily'|'Weekly'|'Monthly'|'All Time'>('All Time');
  const [scope, setScope] = useState<'Global'|'Country'|'School'>('Global');
  const [selectedBatch, setSelectedBatch] = useState<string>('All Batches');

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
    let interval: NodeJS.Timeout;
    const fetchLeaderboard = async () => {
      if (isAuthenticated) {
        try {
          const res = await fetch('/leaderboard/', {
            headers: { 'AUTH-TOKEN': authToken! },
          });
          if (res.ok) {
            const data = await res.json();
            if (data.leaderboard) {
              setLeaderboard(
                data.leaderboard.map((student: any) => ({
                  ...student,
                  avatar: student.name
                    .split(' ')
                    .map((n: string) => n[0])
                    .join('')
                    .toUpperCase(),
                  batch: student.batch || 'N/A',
                }))
              );
              setApiError(null);
            } else {
              // Use fallback data if API returns no data
              setLeaderboard(fallbackLeaderboard);
              setApiError(null);
            }
          } else {
            // Use fallback data if API fails
            setLeaderboard(fallbackLeaderboard);
            setApiError(null);
          }
        } catch (error) {
          // Use fallback data if API throws error
          setLeaderboard(fallbackLeaderboard);
          setApiError(null);
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
    fetchLeaderboard();
    interval = setInterval(fetchLeaderboard, 5000);
    return () => clearInterval(interval);
  }, [authToken, isAuthenticated]);

  const getRankBadgeColor = (rank: number) => {
    if (rank === 1) return 'bg-gradient-to-r from-yellow-400 to-yellow-600 text-black font-bold';
    if (rank === 2) return 'bg-gradient-to-r from-gray-300 to-gray-500 text-black font-bold';
    if (rank === 3) return 'bg-gradient-to-r from-amber-600 to-amber-800 text-white font-bold';
    return 'bg-[#080808]/80 text-white font-bold border border-gold/30 ring-1 ring-white/5 shadow-lg';
  };

  const handleStudentClick = (student: typeof leaderboard[number]) => {
    setSelectedStudent(student);
    setIsStudentModalOpen(true);
  };

  const uniqueBatches = useMemo(() => {
    const batches = new Set(leaderboard.map(student => student.batch));
    return ['All Batches', ...Array.from(batches).sort()];
  }, [leaderboard]);

  const filteredLeaderboard = useMemo(() => {
    if (selectedBatch === 'All Batches') return leaderboard;
    return leaderboard.filter(student => student.batch === selectedBatch);
  }, [leaderboard, selectedBatch]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#0a0a0a] via-[#1a1a1a] to-[#0a0a0a]">
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
              <div className="container mx-auto px-4 py-8">
                <div className="text-center mb-8">
                  <h1 className="text-4xl font-bold text-white mb-4">
                    Students Leaderboard
                  </h1>
                  <p className="text-gray-300 text-lg">
                    Track your students' progress and achievements
                  </p>
                </div>

                {/* Filters */}
                <div className="flex flex-wrap gap-4 mb-8 justify-center">
                  <div className="flex flex-col">
                    <label className="text-white text-sm mb-2">Time Period</label>
                    <select
                      value={period}
                      onChange={(e) => setPeriod(e.target.value as any)}
                      className="bg-[#1a1a1a] text-white border border-gold/30 rounded-lg px-4 py-2 focus:outline-none focus:border-gold"
                    >
                      <option value="Daily">Daily</option>
                      <option value="Weekly">Weekly</option>
                      <option value="Monthly">Monthly</option>
                      <option value="All Time">All Time</option>
                    </select>
                  </div>
                  <div className="flex flex-col">
                    <label className="text-white text-sm mb-2">Scope</label>
                    <select
                      value={scope}
                      onChange={(e) => setScope(e.target.value as any)}
                      className="bg-[#1a1a1a] text-white border border-gold/30 rounded-lg px-4 py-2 focus:outline-none focus:border-gold"
                    >
                      <option value="Global">Global</option>
                      <option value="Country">Country</option>
                      <option value="School">School</option>
                    </select>
                  </div>
                  <div className="flex flex-col">
                    <label className="text-white text-sm mb-2">Batch</label>
                    <select
                      value={selectedBatch}
                      onChange={(e) => setSelectedBatch(e.target.value)}
                      className="bg-[#1a1a1a] text-white border border-gold/30 rounded-lg px-4 py-2 focus:outline-none focus:border-gold"
                    >
                      {uniqueBatches.map(batch => (
                        <option key={batch} value={batch}>{batch}</option>
                      ))}
                    </select>
                  </div>
                </div>

                {/* Leaderboard */}
                <div className="bg-[#080808] rounded-2xl border border-gold/30 shadow-2xl overflow-hidden">
                  <div className="p-6">
                    <h2 className="text-2xl font-bold text-white mb-6 flex items-center">
                      <span className="mr-2">🏆</span>
                      Top Students
                    </h2>
                    
                                         <div className="space-y-3">
                       {pageSlice.map((student, index) => (
                        <div 
                          key={student.rank} 
                          className="flex items-center space-x-4 p-4 bg-[#1a1a1a] hover:bg-[#2a2a2a] rounded-xl border border-gold/20 transition-all duration-300 cursor-pointer"
                          onClick={() => handleStudentClick(student)}
                        >
                          <div className={`w-12 h-12 rounded-full flex items-center justify-center text-lg font-bold ${getRankBadgeColor(student.rank)}`}>
                            {student.rank}
                          </div>
                          <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white font-bold text-sm shadow-lg border border-white/10">
                            {student.avatar}
                          </div>
                          <div className="flex-1">
                            <p className="text-lg font-semibold text-white">{student.name}</p>
                            <p className="text-sm text-gray-300">Level {student.level} • {student.streak} day streak</p>
                            <p className="text-xs text-gold">{student.batch}</p>
                          </div>
                          <div className="text-right">
                            <p className="text-xl font-bold text-gold">{student.xp.toLocaleString()} XP</p>
                            <p className="text-sm text-gray-400">{getOrdinal(student.rank)}</p>
                          </div>
                        </div>
                      ))}
                    </div>

                                         {/* Pagination */}
                     <div className="flex justify-center mt-8">
                       <div className="flex items-center gap-3 w-full justify-between">
                         <div className="flex items-center gap-2">
                           <span className="text-sm text-gray-300">Items per page:</span>
                           <select
                             className="bg-[#0f0f0f] border border-gray-700 rounded-md px-2 py-1 text-sm text-white"
                             value={pageSize}
                             onChange={(e) => {
                               const newSize = parseInt(e.target.value, 10);
                               setPageSize(newSize);
                               setPage(1);
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
                         </div>
                       </div>
                     </div>
                  </div>
                </div>
              </div>

              {/* Student Details Modal */}
              {selectedStudent && (
                <StudentDetailsModal
                  isOpen={isStudentModalOpen}
                  onClose={() => setIsStudentModalOpen(false)}
                  student={selectedStudent}
                />
              )}
            </>
          )}
        </div>
      )}
    </div>
  );
};

export default TeacherLeaderboardPage;
