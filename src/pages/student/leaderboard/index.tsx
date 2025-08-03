import { FC, useEffect, useState } from 'react';
import { isAxiosError } from 'axios';
import SeoComponent from '@components/atoms/SeoComponent';
import ErrorBox from '@components/organisms/ErrorBox';
import LoadingBox from '@components/organisms/LoadingBox';
import { dashboardRequestV2 } from '@services/student';
import { useAuthStore } from '@store/authStore';
import { useStreakStore } from '@store/streakStore';
import { ERRORS, MESSAGES } from '@constants/app';
import { LOGIN_PAGE, STUDENT_DASHBOARD } from '@constants/routes';

export interface StudentLeaderboardPageProps {}

const StudentLeaderboardPage: FC<StudentLeaderboardPageProps> = () => {
  const authToken = useAuthStore((state) => state.authToken);
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);
  const [loading, setLoading] = useState(true);
  const [apiError, setApiError] = useState<string | null>(null);
  const [fallBackLink, setFallBackLink] = useState<string>(STUDENT_DASHBOARD);
  const [fallBackAction, setFallBackAction] = useState<string>(MESSAGES.TRY_AGAIN);
  const { incrementStreak } = useStreakStore();

  // Mock leaderboard data - in real app, this would come from API
  const leaderboard = [
    { rank: 1, name: 'Alex Johnson', xp: 2840, avatar: 'AJ', level: 8, streak: 15 },
    { rank: 2, name: 'Sarah Chen', xp: 2650, avatar: 'SC', level: 7, streak: 12 },
    { rank: 3, name: 'Mike Davis', xp: 2480, avatar: 'MD', level: 7, streak: 8 },
    { rank: 4, name: 'Emma Wilson', xp: 2320, avatar: 'EW', level: 6, streak: 10 },
    { rank: 5, name: 'David Brown', xp: 2180, avatar: 'DB', level: 6, streak: 6 },
    { rank: 6, name: 'Lisa Garcia', xp: 2050, avatar: 'LG', level: 5, streak: 9 },
    { rank: 7, name: 'You', xp: 1850, avatar: 'YO', level: 5, streak: 29 },
    { rank: 8, name: 'Tom Anderson', xp: 1720, avatar: 'TA', level: 4, streak: 5 },
    { rank: 9, name: 'Anna Lee', xp: 1580, avatar: 'AL', level: 4, streak: 7 },
    { rank: 10, name: 'Chris Taylor', xp: 1450, avatar: 'CT', level: 3, streak: 4 },
  ];

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
    switch (rank) {
      case 1: return 'bg-yellow-500 text-black';
      case 2: return 'bg-gray-400 text-black';
      case 3: return 'bg-orange-600 text-white';
      default: return 'bg-gray-600 text-white';
    }
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
              <div className="px-6 pt-2 tablet:p-10 desktop:px-24 space-y-6">
                {/* Header */}
                <div className="bg-[#1b1b1b] text-white p-6 rounded-lg border border-gray-800">
                  <h1 className="text-3xl font-bold mb-4 flex items-center">
                    <span className="mr-2">🏆</span>
                    Lightning Leaderboard
                  </h1>
                  <p className="text-gray-300">
                    Compete with other students and climb the rankings!
                  </p>
                </div>

                {/* Leaderboard */}
                <div className="bg-[#1b1b1b] text-white p-6 rounded-lg border border-gray-800">
                  <h2 className="text-2xl font-bold mb-6 flex items-center">
                    <span className="mr-2">⚡</span>
                    Top Students
                  </h2>
                  
                  <div className="space-y-3">
                    {leaderboard.map((student) => (
                      <div 
                        key={student.rank} 
                        className={`flex items-center space-x-4 p-4 rounded-lg transition-colors ${
                          student.name === 'You' 
                            ? 'bg-gradient-to-r from-blue-600/20 to-purple-600/20 border border-blue-500/30' 
                            : 'bg-gray-800 hover:bg-gray-700'
                        }`}
                      >
                        <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold ${getRankBadgeColor(student.rank)}`}>
                          {student.rank}
                        </div>
                        <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white font-bold text-sm">
                          {student.avatar}
                        </div>
                        <div className="flex-1">
                          <div className="flex justify-between items-center">
                            <div>
                              <p className={`text-sm font-medium ${student.name === 'You' ? 'text-blue-300' : 'text-white'}`}>
                                {student.name}
                              </p>
                              <p className="text-xs text-gray-400">
                                Level {student.level} • {student.streak} Day Streak
                              </p>
                            </div>
                            <div className="text-right">
                              <p className="text-sm font-semibold text-green-400">
                                {student.xp.toLocaleString()} XP
                              </p>
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Statistics */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div className="bg-[#1b1b1b] text-white p-6 rounded-lg border border-gray-800">
                    <h3 className="text-lg font-semibold mb-2">Your Rank</h3>
                    <p className="text-3xl font-bold text-blue-400">#7</p>
                  </div>
                  <div className="bg-[#1b1b1b] text-white p-6 rounded-lg border border-gray-800">
                    <h3 className="text-lg font-semibold mb-2">XP to Next Rank</h3>
                    <p className="text-3xl font-bold text-green-400">200 XP</p>
                  </div>
                  <div className="bg-[#1b1b1b] text-white p-6 rounded-lg border border-gray-800">
                    <h3 className="text-lg font-semibold mb-2">Total Students</h3>
                    <p className="text-3xl font-bold text-purple-400">1,247</p>
                  </div>
                </div>

                {/* Quick Actions */}
                <div className="bg-[#1b1b1b] text-white p-6 rounded-lg border border-gray-800">
                  <h2 className="text-xl font-bold mb-4">Quick Actions</h2>
                  <div className="flex flex-wrap gap-4">
                    <button className="bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white px-6 py-3 rounded-lg font-semibold transition-all duration-300 transform hover:scale-105 shadow-lg hover:shadow-blue-500/25">
                      Practice to Earn XP
                    </button>
                    <button className="bg-gradient-to-r from-green-500 to-blue-600 hover:from-green-600 hover:to-blue-700 text-white px-6 py-3 rounded-lg font-semibold transition-all duration-300 transform hover:scale-105 shadow-lg hover:shadow-green-500/25">
                      View Achievements
                    </button>
                    <button className="bg-gradient-to-r from-yellow-500 to-orange-600 hover:from-yellow-600 hover:to-orange-700 text-white px-6 py-3 rounded-lg font-semibold transition-all duration-300 transform hover:scale-105 shadow-lg hover:shadow-yellow-500/25">
                      Share Progress
                    </button>
                  </div>
                </div>
              </div>
            </>
          )}
        </div>
      )}
    </div>
  );
};

export default StudentLeaderboardPage; 