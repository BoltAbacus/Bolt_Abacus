import { FC, useCallback, useEffect, useState } from 'react';
import { isAxiosError } from 'axios';

import SeoComponent from '@components/atoms/SeoComponent';
import ErrorBox from '@components/organisms/ErrorBox';
import LoadingBox from '@components/organisms/LoadingBox';
import StudentProgressSection from '@components/sections/student/ProgressSection';
// import DebugConsole from '@components/atoms/DebugConsole';

import { useAuthStore } from '@store/authStore';
import { getProgressRequest } from '@services/student';
import {
  GetStudentProgressResponse,
  LevelProgress,
  PracticeStats,
} from '@interfaces/apis/teacher';

import { ERRORS, MESSAGES } from '@constants/app';
import { LOGIN_PAGE, STUDENT_DASHBOARD, STUDENT_PROGRESS_ENDPOINT } from '@constants/routes';

export interface StudentProgressPageProps {}

const StudentProgressPage: FC<StudentProgressPageProps> = () => {
  const authToken = useAuthStore((state) => state.authToken);
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);

  const [loading, setLoading] = useState(true);
  const [apiError, setApiError] = useState<string | null>(null);
  const [fallBackLink, setFallBackLink] = useState<string>(STUDENT_DASHBOARD);
  const [fallBackAction, setFallBackAction] = useState<string>(
    MESSAGES.TRY_AGAIN
  );

  const [studentProgress, setStudentProgress] = useState<LevelProgress[]>();
  const [batchName, setBatchName] = useState<string>();
  const [practiceStats, setPracticeStats] = useState<PracticeStats>();

  // Function to fetch student progress data
  const getStudentProgressData = useCallback(async () => {
    console.log('🔄 [Progress Page] Starting data fetch...', {
      isAuthenticated,
      hasAuthToken: !!authToken,
      timestamp: new Date().toISOString()
    });

    if (isAuthenticated) {
      try {
        console.log('📡 [Progress Page] Making API request to:', STUDENT_PROGRESS_ENDPOINT);
        const res = await getProgressRequest(authToken!);
        console.log('✅ [Progress Page] API response received:', {
          status: res.status,
          dataKeys: Object.keys(res.data || {}),
          timestamp: new Date().toISOString()
        });

        if (res.status === 200) {
          const getStudentProgressResponse: GetStudentProgressResponse = res.data;
          console.log('📊 [Progress Page] Processing response data:', {
            levelsCount: getStudentProgressResponse.levels?.length || 0,
            batchName: getStudentProgressResponse.batchName,
            hasPracticeStats: !!getStudentProgressResponse.practiceStats
          });

          setStudentProgress(getStudentProgressResponse.levels);
          setBatchName(getStudentProgressResponse.batchName);
          setPracticeStats(getStudentProgressResponse.practiceStats);
          console.log('✅ [Progress Page] State updated successfully');
        }
      } catch (error) {
        console.error('❌ [Progress Page] API Error:', {
          error,
          isAxiosError: isAxiosError(error),
          status: isAxiosError(error) ? error.response?.status : 'unknown',
          message: isAxiosError(error) ? error.message : 'Unknown error',
          responseData: isAxiosError(error) ? error.response?.data : null,
          timestamp: new Date().toISOString()
        });

        if (isAxiosError(error)) {
          const status = error.response?.status;
          if (status === 401 || status === 403 || status === 404) {
            const errorMessage = error.response?.data?.error ||
              error.response?.data?.message ||
              ERRORS.SERVER_ERROR;
            console.error('🚫 [Progress Page] Auth/Not Found Error:', {
              status,
              errorMessage,
              responseData: error.response?.data
            });
            setApiError(errorMessage);
          } else {
            console.error('🔥 [Progress Page] Server Error:', {
              status,
              message: error.message
            });
            setApiError(ERRORS.SERVER_ERROR);
          }
        } else {
          console.error('💥 [Progress Page] Unknown Error:', error);
          setApiError(ERRORS.SERVER_ERROR);
        }
      }
    } else {
      console.warn('⚠️ [Progress Page] User not authenticated, redirecting to login');
      setApiError(ERRORS.AUTHENTICATION_ERROR);
      setFallBackLink(LOGIN_PAGE);
      setFallBackAction(MESSAGES.GO_LOGIN);
    }
    setLoading(false);
    console.log('🏁 [Progress Page] Data fetch completed');
  }, [authToken, isAuthenticated]);

  // Initial data fetch
  useEffect(() => {
    getStudentProgressData();
  }, [getStudentProgressData]);

  // Set up periodic refresh every 30 seconds to keep data updated
  useEffect(() => {
    const intervalId = setInterval(() => {
      getStudentProgressData();
    }, 30000); // Refresh every 30 seconds

    return () => clearInterval(intervalId);
  }, [getStudentProgressData]);

  // Listen for practice session completion events
  useEffect(() => {
    const handlePracticeSessionComplete = () => {
      console.log('🔄 [Progress Page] Practice session completed, refreshing data...');
      getStudentProgressData();
    };

    // Listen for custom events from practice components
    window.addEventListener('practiceSessionCompleted', handlePracticeSessionComplete);
    
    return () => {
      window.removeEventListener('practiceSessionCompleted', handlePracticeSessionComplete);
    };
  }, [getStudentProgressData]);

  return (
    <div>
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
              <SeoComponent title="Student Report" />
              <StudentProgressSection
                batchName={batchName!}
                progress={studentProgress!}
                practiceStats={practiceStats}
                pvpStats={null} // PvP stats will be fetched via trend APIs
              />
            </>
          )}
        </div>
      )}
      {/* <DebugConsole /> */}
    </div>
  );
};

export default StudentProgressPage;
