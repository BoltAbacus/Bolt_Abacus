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


export interface StudentArchivePageProps {}

const StudentArchivePage: FC<StudentArchivePageProps> = () => {
  const authToken = useAuthStore((state) => state.authToken);
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);
  const [loading, setLoading] = useState(true);
  const [apiError, setApiError] = useState<string | null>(null);
  const [fallBackLink, setFallBackLink] = useState<string>(STUDENT_DASHBOARD);
  const [fallBackAction, setFallBackAction] = useState<string>(MESSAGES.TRY_AGAIN);
  const { incrementStreak } = useStreakStore();

  // Mock activity data - in real app, this would come from API
  const activities = [
    { id: 1, action: 'Completed Speed Math', xp: '+150 XP', time: '2 hours ago', icon: '✅', type: 'quiz' },
    { id: 2, action: 'Practiced Virtual Abacus', xp: '+75 XP', time: '4 hours ago', icon: '✅', type: 'practice' },
    { id: 3, action: 'Took Level 5 Quiz', xp: '+200 XP', time: '6 hours ago', icon: '✅', type: 'quiz' },
    { id: 4, action: 'Maintained Daily Streak', xp: '+50 XP', time: '1 day ago', icon: '🔥', type: 'streak' },
    { id: 5, action: 'Unlocked Achievement', xp: '+100 XP', time: '1 day ago', icon: '🏆', type: 'achievement' },
    { id: 6, action: 'Completed Level 4', xp: '+300 XP', time: '2 days ago', icon: '🎯', type: 'level' },
    { id: 7, action: 'Practiced Addition', xp: '+45 XP', time: '3 days ago', icon: '✅', type: 'practice' },
    { id: 8, action: 'Joined Live Class', xp: '+25 XP', time: '4 days ago', icon: '📹', type: 'class' },
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

  const getActivityTypeColor = (type: string) => {
    switch (type) {
      case 'quiz': return 'text-blue-400';
      case 'practice': return 'text-green-400';
      case 'streak': return 'text-orange-400';
      case 'achievement': return 'text-yellow-400';
      case 'level': return 'text-purple-400';
      case 'class': return 'text-red-400';
      default: return 'text-gray-400';
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
              <SeoComponent title="Archive" />
              <div className="px-6 pt-2 tablet:p-10 desktop:px-24 space-y-6">
                {/* Header */}
                <div className="bg-[#1b1b1b] text-white p-6 rounded-lg border border-gray-800">
                  <h1 className="text-3xl font-bold mb-4 flex items-center">
                    <span className="mr-2">📚</span>
                    Activity Archive
                  </h1>
                  <p className="text-gray-300">
                    View your learning history and track your progress over time.
                  </p>
                </div>

                {/* Activity List */}
                <div className="bg-[#1b1b1b] text-white p-6 rounded-lg border border-gray-800">
                  <h2 className="text-2xl font-bold mb-6 flex items-center">
                    <span className="mr-2">🕒</span>
                    Recent Activity
                  </h2>
                  
                  <div className="space-y-4">
                    {activities.map((activity) => (
                      <div key={activity.id} className="flex items-center space-x-4 p-4 bg-gray-800 rounded-lg hover:bg-gray-700 transition-colors">
                        <div className="text-2xl">{activity.icon}</div>
                        <div className="flex-1">
                          <div className="flex justify-between items-start">
                            <div>
                              <p className="text-sm font-medium text-white">{activity.action}</p>
                              <p className="text-xs text-gray-400">{activity.time}</p>
                            </div>
                            <span className={`text-sm font-semibold ${getActivityTypeColor(activity.type)}`}>
                              {activity.xp}
                            </span>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* Load More Button */}
                  <div className="mt-6 text-center">
                    <button className="bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white px-6 py-2 rounded-lg font-semibold transition-all duration-300 transform hover:scale-105 shadow-lg hover:shadow-blue-500/25">
                      Load More Activity
                    </button>
                  </div>
                </div>

                {/* Statistics */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div className="bg-[#1b1b1b] text-white p-6 rounded-lg border border-gray-800">
                    <h3 className="text-lg font-semibold mb-2">Total XP Earned</h3>
                    <p className="text-3xl font-bold text-green-400">945 XP</p>
                  </div>
                  <div className="bg-[#1b1b1b] text-white p-6 rounded-lg border border-gray-800">
                    <h3 className="text-lg font-semibold mb-2">Activities Completed</h3>
                    <p className="text-3xl font-bold text-blue-400">8</p>
                  </div>
                  <div className="bg-[#1b1b1b] text-white p-6 rounded-lg border border-gray-800">
                    <h3 className="text-lg font-semibold mb-2">Days Active</h3>
                    <p className="text-3xl font-bold text-purple-400">4</p>
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

export default StudentArchivePage; 