import { FC, useEffect, useState } from 'react';
import { isAxiosError } from 'axios';

import SeoComponent from '@components/atoms/SeoComponent';
import ErrorBox from '@components/organisms/ErrorBox';
import LoadingBox from '@components/organisms/LoadingBox';
import RoadmapSection from '@components/sections/student/dashboard/RoadMapSection';
import QuickActionsSection from '@components/sections/student/roadmap/QuickActionsSection';

import { dashboardRequestV2 } from '@services/student';
import { useAuthStore } from '@store/authStore';
import { useStreakStore } from '@store/streakStore';
import { ERRORS, MESSAGES } from '@constants/app';
import { LOGIN_PAGE, STUDENT_DASHBOARD } from '@constants/routes';
import {
  DashboardResponseV2,
  LevelsPercentage,
} from '@interfaces/apis/student';

export interface StudentRoadmapPageProps {}

const StudentRoadmapPage: FC<StudentRoadmapPageProps> = () => {
  const authToken = useAuthStore((state) => state.authToken);
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);

  const [loading, setLoading] = useState(true);
  const [apiError, setApiError] = useState<string | null>(null);
  const [fallBackLink, setFallBackLink] = useState<string>(STUDENT_DASHBOARD);
  const [fallBackAction, setFallBackAction] = useState<string>(
    MESSAGES.TRY_AGAIN
  );

  const [currentLevel, setCurrentLevel] = useState<number>(1);
  const [currentClass, setCurrentClass] = useState<number>(1);
  const [progress, setProgress] = useState<LevelsPercentage>({});
  const { updateStreak } = useStreakStore();

  useEffect(() => {
    const getDashboardData = async () => {
      if (isAuthenticated) {
        try {
          const res = await dashboardRequestV2(authToken!);
          if (res.status === 200) {
            const dashboardResponse: DashboardResponseV2 = res.data;
            setCurrentLevel(dashboardResponse.levelId);
            setCurrentClass(dashboardResponse.latestClass);
            setApiError(null);
            setProgress(dashboardResponse.levelsPercentage);
            
            // Only increment streak if this is the first visit today
            updateStreak();
          }
        } catch (error) {
          if (isAxiosError(error)) {
            const status = error.response?.status;
            if (status === 401) {
              setApiError(
                error.response?.data?.error ||
                  error.response?.data?.message ||
                  ERRORS.SERVER_ERROR
              );
              setFallBackLink(LOGIN_PAGE);
              setFallBackAction(MESSAGES.GO_LOGIN);
            } else {
              setApiError(ERRORS.SERVER_ERROR);
            }
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
              <SeoComponent title="Path of Conquest" />
              <div>
                <QuickActionsSection
                  currentLevel={currentLevel!}
                  currentClass={currentClass!}
                />
                <RoadmapSection
                  currentLevel={currentLevel!}
                  currentClass={currentClass!}
                  progress={progress!}
                />
              </div>
            </>
          )}
        </div>
      )}
    </div>
  );
};

export default StudentRoadmapPage; 