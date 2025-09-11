import { FC, useEffect, useState } from 'react';
import { isAxiosError } from 'axios';
import SeoComponent from '@components/atoms/SeoComponent';
import ErrorBox from '@components/organisms/ErrorBox';
import LoadingBox from '@components/organisms/LoadingBox';
import { dashboardRequestV2 } from '@services/student';
import { getActivities, removeActivity, clearActivities, ActivityItem } from '@helpers/activity';
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
  const { updateStreak } = useStreakStore();

  const [activities, setActivities] = useState<ActivityItem[]>([]);
  const [showClearConfirm, setShowClearConfirm] = useState(false);
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);

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
    // load local activity log
    setActivities(getActivities());
  }, [authToken, isAuthenticated, updateStreak]);

  const getActivityTypeColor = (type: string) => {
    switch (type) {
      case 'test': return 'text-blue-400';
      case 'practice': return 'text-green-400';
      case 'streak': return 'text-orange-400';
      case 'achievement': return 'text-yellow-400';
      case 'level': return 'text-purple-400';
      case 'classwork': return 'text-red-400';
      case 'homework': return 'text-pink-400';
      case 'pvp': return 'text-cyan-400';
      default: return 'text-gray-400';
    }
  };

  const formatTimeAgo = (ts: number) => {
    const diff = Date.now() - ts;
    const m = Math.floor(diff / 60000);
    if (m < 60) return `${m} min ago`;
    const h = Math.floor(m / 60);
    if (h < 24) return `${h} hour${h>1?'s':''} ago`;
    const d = Math.floor(h / 24);
    return `${d} day${d>1?'s':''} ago`;
  };

  const handleDeleteActivity = (activityId: string) => {
    removeActivity(activityId);
    setActivities(getActivities());
    setDeleteConfirmId(null);
  };

  const handleClearAll = () => {
    clearActivities();
    setActivities([]);
    setShowClearConfirm(false);
  };

  const refreshActivities = () => {
    setActivities(getActivities());
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
                <div className="bg-darkBlack text-white p-6 rounded-xl shadow-boxWhite border border-gold/20">
                  <h1 className="text-3xl font-bold mb-4 flex items-center text-gold">
                    <span className="mr-2">📚</span>
                    Activity Archive
                  </h1>
                  <p className="text-white/80">
                    View your learning history and track your progress over time.
                  </p>
                </div>

                {/* Activity List */}
                <div className="bg-darkBlack text-white p-6 rounded-xl shadow-boxWhite border border-gold/20">
                  <div className="flex justify-between items-center mb-6">
                    <h2 className="text-2xl font-bold flex items-center text-gold">
                      <span className="mr-2">🕒</span>
                      Recent Activity
                    </h2>
                    <div className="flex space-x-2">
                      <button
                        onClick={refreshActivities}
                        className="bg-gold hover:shadow-golden text-black px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200"
                      >
                        🔄 Refresh
                      </button>
                      {activities.length > 0 && (
                        <button
                          onClick={() => setShowClearConfirm(true)}
                          className="bg-gold hover:shadow-golden text-black px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200"
                        >
                          🗑️ Clear All
                        </button>
                      )}
                    </div>
                  </div>
                  
                  <div className="space-y-4">
                    {activities.length === 0 ? (
                      <div className="text-center py-12">
                        <div className="text-6xl mb-4">📚</div>
                        <h3 className="text-xl font-semibold text-gold mb-2">No Activities Yet</h3>
                        <p className="text-white/70">Start practicing, taking tests, or playing PvP to see your activity history here!</p>
                      </div>
                    ) : (
                      activities.map((activity) => (
                        <div key={activity.id} className="flex items-center space-x-4 p-4 bg-[#212124] rounded-lg hover:bg-gold/10 transition-all duration-200 group border border-gold/10">
                          <div className="text-2xl">
                            {activity.type === 'practice' ? '📚' : activity.type === 'pvp' ? '⚔️' : activity.type === 'streak' ? '🔥' : activity.type === 'level' ? '🎯' : activity.type === 'test' ? '✅' : activity.type === 'classwork' ? '🏫' : activity.type === 'homework' ? '📝' : '📌'}
                          </div>
                          <div className="flex-1">
                            <div className="flex justify-between items-start">
                              <div>
                                <p className="text-sm font-medium text-white">{activity.title}</p>
                                <p className="text-xs text-gray-400">{formatTimeAgo(activity.timestamp)}</p>
                              </div>
                              <div className="flex items-center space-x-2">
                                <span className={`text-sm font-semibold ${getActivityTypeColor(activity.type)}`}>
                                  {activity.xp ? `+${activity.xp} XP` : ''}
                                </span>
                                <button
                                  onClick={() => setDeleteConfirmId(activity.id)}
                                  className="opacity-0 group-hover:opacity-100 text-gold hover:text-gold/80 transition-all duration-200 p-1"
                                  title="Delete activity"
                                >
                                  🗑️
                                </button>
                              </div>
                            </div>
                          </div>
                        </div>
                      ))
                    )}
                  </div>

                </div>

                {/* Confirmation Modals */}
                {showClearConfirm && (
                  <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                    <div className="bg-darkBlack border border-gold/20 rounded-xl p-6 max-w-md mx-4 shadow-boxWhite">
                      <h3 className="text-xl font-bold text-gold mb-4">Clear All Activities?</h3>
                      <p className="text-white/80 mb-6">This will permanently delete all your activity history. This action cannot be undone.</p>
                      <div className="flex space-x-3">
                        <button
                          onClick={handleClearAll}
                          className="bg-gold hover:shadow-golden text-black px-4 py-2 rounded-lg font-medium transition-all duration-200"
                        >
                          Yes, Clear All
                        </button>
                        <button
                          onClick={() => setShowClearConfirm(false)}
                          className="bg-[#212124] hover:bg-[#2a2a2a] text-white px-4 py-2 rounded-lg font-medium transition-all duration-200 border border-gold/20"
                        >
                          Cancel
                        </button>
                      </div>
                    </div>
                  </div>
                )}

                {deleteConfirmId && (
                  <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                    <div className="bg-darkBlack border border-gold/20 rounded-xl p-6 max-w-md mx-4 shadow-boxWhite">
                      <h3 className="text-xl font-bold text-gold mb-4">Delete Activity?</h3>
                      <p className="text-white/80 mb-6">This will permanently delete this activity from your history.</p>
                      <div className="flex space-x-3">
                        <button
                          onClick={() => handleDeleteActivity(deleteConfirmId)}
                          className="bg-gold hover:shadow-golden text-black px-4 py-2 rounded-lg font-medium transition-all duration-200"
                        >
                          Yes, Delete
                        </button>
                        <button
                          onClick={() => setDeleteConfirmId(null)}
                          className="bg-[#212124] hover:bg-[#2a2a2a] text-white px-4 py-2 rounded-lg font-medium transition-all duration-200 border border-gold/20"
                        >
                          Cancel
                        </button>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </>
          )}
        </div>
      )}
    </div>
  );
};

export default StudentArchivePage; 