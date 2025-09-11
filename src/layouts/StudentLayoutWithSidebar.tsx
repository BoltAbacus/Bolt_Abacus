import { FC, useState, useEffect } from 'react';
import { Navigate, Outlet } from 'react-router-dom';

import LeftNavigation from '@components/molecules/student/LeftNavigation';

import { validAuthToken } from '@helpers/auth';
import { useAuthStore } from '@store/authStore';
import { dashboardRequestV2 } from '@services/student';
import { LOGIN_PAGE } from '@constants/routes';

export interface StudentLayoutWithSidebarProps {}

const StudentLayoutWithSidebar: FC<StudentLayoutWithSidebarProps> = () => {
  const authToken = useAuthStore((state) => state.authToken);
  const user = useAuthStore((state) => state.user);
  const logout = useAuthStore((state) => state.logout);
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const [classLink, setClassLink] = useState<string>();

  // Create margin classes based on sidebar state
  const marginClasses = isSidebarCollapsed 
    ? 'tablet:ml-16 desktop:ml-16' 
    : 'tablet:ml-64 desktop:ml-64';

  useEffect(() => {
    const getDashboardData = async () => {
      if (authToken) {
        try {
          const res = await dashboardRequestV2(authToken);
          if (res.status === 200) {
            setClassLink(res.data.latestLink);
          }
        } catch (error) {
          console.error('Failed to fetch class link:', error);
        }
      }
    };
    getDashboardData();
  }, [authToken]);

  return (
    <>
      {(!authToken ||
        !user ||
        (user && user.role !== 'Student') ||
        !validAuthToken(authToken!)) && (
        <>
          {logout()}
          <Navigate to={LOGIN_PAGE} />
        </>
      )}
      <div className="flex min-h-screen bg-black text-white">
        <LeftNavigation onCollapseChange={setIsSidebarCollapsed} classLink={classLink} />
        <div className={`flex-1 transition-all duration-300 ${marginClasses}`}>
          <main className="p-4 tablet:p-6">
            <Outlet />
          </main>
        </div>
      </div>
    </>
  );
};

export default StudentLayoutWithSidebar; 