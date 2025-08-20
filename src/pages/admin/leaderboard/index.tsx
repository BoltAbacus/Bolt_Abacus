import { FC, useEffect, useMemo, useState } from 'react';
import { isAxiosError } from 'axios';
import SeoComponent from '@components/atoms/SeoComponent';
import ErrorBox from '@components/organisms/ErrorBox';
import LoadingBox from '@components/organisms/LoadingBox';
import StudentDetailsModal from '@components/organisms/StudentDetailsModal';
import { dashboardRequestV2 } from '@services/student';
import { useAuthStore } from '@store/authStore';
import { ERRORS, MESSAGES } from '@constants/app';
import { LOGIN_PAGE, ADMIN_DASHBOARD } from '@constants/routes';

export interface AdminLeaderboardPageProps {}

const AdminLeaderboardPage: FC<AdminLeaderboardPageProps> = () => {
  const authToken = useAuthStore((state) => state.authToken);
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);
  const [loading, setLoading] = useState(true);
  const [apiError, setApiError] = useState<string | null>(null);
  const [fallBackLink, setFallBackLink] = useState<string>(ADMIN_DASHBOARD);
  const [fallBackAction, setFallBackAction] = useState<string>(MESSAGES.TRY_AGAIN);

  const [leaderboard, setLeaderboard] = useState<any[]>([]);

  const [selectedStudent, setSelectedStudent] = useState<typeof leaderboard[number] | null>(null);
  const [isStudentModalOpen, setIsStudentModalOpen] = useState(false);
  const [isListExpanded, setIsListExpanded] = useState(false);
  const [pageSize, setPageSize] = useState<number>(10);
  const [page, setPage] = useState<number>(1);
  const [period, setPeriod] = useState<'Daily'|'Weekly'|'Monthly'|'All Time'>('All Time');
  const [scope, setScope] = useState<'Global'|'Country'|'School'>('Global');
  const [selectedBatch, setSelectedBatch] = useState<string>('All Batches');
  const [selectedTeacher, setSelectedTeacher] = useState<string>('All Teachers');
  const [selectedOrganization, setSelectedOrganization] = useState<string>('All Organizations');

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
                  teacher: student.teacher || 'N/A',
                  organization: student.organization || 'N/A',
                }))
              );
              setApiError(null);
            } else {
              setApiError('No leaderboard data found.');
            }
          } else {
            setApiError('Failed to fetch leaderboard.');
          }
        } catch (error) {
          setApiError('Failed to fetch leaderboard.');
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

  const uniqueTeachers = useMemo(() => {
    const teachers = new Set(leaderboard.map(student => student.teacher));
    return ['All Teachers', ...Array.from(teachers).sort()];
  }, [leaderboard]);

  const uniqueOrganizations = useMemo(() => {
    const organizations = new Set(leaderboard.map(student => student.organization));
    return ['All Organizations', ...Array.from(organizations).sort()];
  }, [leaderboard]);

  const filteredLeaderboard = useMemo(() => {
    let filtered = leaderboard;
    if (selectedBatch !== 'All Batches') {
      filtered = filtered.filter(student => student.batch === selectedBatch);
    }
    if (selectedTeacher !== 'All Teachers') {
      filtered = filtered.filter(student => student.teacher === selectedTeacher);
    }
    if (selectedOrganization !== 'All Organizations') {
      filtered = filtered.filter(student => student.organization === selectedOrganization);
    }
    return filtered;
  }, [leaderboard, selectedBatch, selectedTeacher, selectedOrganization]);

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
                error={apiError}
                fallBackLink={fallBackLink}
                fallBackAction={fallBackAction}
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
                    Monitor all students' progress and achievements across the platform
                  </p>
                </div>

                {/* Filters */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4 mb-8">
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
                  <div className="flex flex-col">
                    <label className="text-white text-sm mb-2">Teacher</label>
                    <select
                      value={selectedTeacher}
                      onChange={(e) => setSelectedTeacher(e.target.value)}
                      className="bg-[#1a1a1a] text-white border border-gold/30 rounded-lg px-4 py-2 focus:outline-none focus:border-gold"
                    >
                      {uniqueTeachers.map(teacher => (
                        <option key={teacher} value={teacher}>{teacher}</option>
                      ))}
                    </select>
                  </div>
                  <div className="flex flex-col">
                    <label className="text-white text-sm mb-2">Organization</label>
                    <select
                      value={selectedOrganization}
                      onChange={(e) => setSelectedOrganization(e.target.value)}
                      className="bg-[#1a1a1a] text-white border border-gold/30 rounded-lg px-4 py-2 focus:outline-none focus:border-gold"
                    >
                      {uniqueOrganizations.map(org => (
                        <option key={org} value={org}>{org}</option>
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
                      {filteredLeaderboard.slice(0, pageSize).map((student, index) => (
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
                            <p className="text-xs text-gold">{student.batch} • {student.teacher}</p>
                            <p className="text-xs text-gray-400">{student.organization}</p>
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
                      <div className="flex space-x-2">
                        <button
                          onClick={() => setPage(Math.max(1, page - 1))}
                          disabled={page === 1}
                          className="px-4 py-2 bg-[#1a1a1a] text-white border border-gold/30 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-[#2a2a2a] transition-colors"
                        >
                          Previous
                        </button>
                        <span className="px-4 py-2 text-white">
                          Page {currentPage} of {totalPages}
                        </span>
                        <button
                          onClick={() => setPage(Math.min(totalPages, page + 1))}
                          disabled={page === totalPages}
                          className="px-4 py-2 bg-[#1a1a1a] text-white border border-gold/30 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-[#2a2a2a] transition-colors"
                        >
                          Next
                        </button>
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

export default AdminLeaderboardPage;
