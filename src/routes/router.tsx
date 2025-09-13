import { createBrowserRouter } from 'react-router-dom';
import { withLazyLoad } from '@helpers/lazyLoad';

// Lazy load layouts
const DefaultLayout = withLazyLoad(() => import('@layouts/DefaultLayout'));
const RootLayout = withLazyLoad(() => import('@layouts/RootLayout'));
const StudentLayout = withLazyLoad(() => import('@layouts/StudentLayout'));
const StudentLayoutWithSidebar = withLazyLoad(
  () => import('@layouts/StudentLayoutWithSidebar')
);
const AdminLayout = withLazyLoad(() => import('@layouts/AdminLayout'));
const SubAdminLayout = withLazyLoad(() => import('@layouts/SubAdminLayout'));
const TeacherLayout = withLazyLoad(() => import('@layouts/TeacherLayout'));

// Lazy load pages
const HomePage = withLazyLoad(() => import('@pages/home'));
const Custom404Page = withLazyLoad(() => import('@pages/not-found'));
const ProfilePage = withLazyLoad(() => import('@pages/profile'));
const LoginPage = withLazyLoad(() => import('@pages/login'));
const ResetPasswordPage = withLazyLoad(() => import('@pages/reset-password'));
const ResetPasswordPageV2 = withLazyLoad(
  () => import('@pages/reset-password-v2')
);
const ForgotPasswordPage = withLazyLoad(() => import('@pages/forgot-password'));

// Lazy load student pages
const StudentDashboardPage = withLazyLoad(
  () => import('@pages/student/dashboard')
);
const StudentRoadmapPage = withLazyLoad(() => import('@pages/student/roadmap'));
const StudentArchivePage = withLazyLoad(() => import('@pages/student/archive'));
const StudentVirtualAbacusPage = withLazyLoad(
  () => import('@pages/student/virtual-abacus')
);
const StudentLeaderboardPage = withLazyLoad(
  () => import('@pages/student/leaderboard')
);
const StudentLevelPage = withLazyLoad(() => import('@pages/student/level'));
const StudentQuizPage = withLazyLoad(() => import('@pages/student/quiz'));
const StudentOralTestPage = withLazyLoad(
  () => import('@pages/student/oral-test')
);
const StudentFinalTestPage = withLazyLoad(
  () => import('@pages/student/final-test')
);
const StudentTestPage = withLazyLoad(() => import('@pages/student/test'));
const StudentReportPage = withLazyLoad(() => import('@pages/student/report'));
const StudentProgressPage = withLazyLoad(
  () => import('@pages/student/student-progress')
);
const StudentPracticePage = withLazyLoad(
  () => import('@pages/student/practice-mode')
);
const StudentPvPPage = withLazyLoad(
  () => import('@pages/student/practice-mode/pvp')
);
const StudentPvPRoomPage = withLazyLoad(
  () => import('@pages/student/practice-mode/pvp/room')
);
const StudentPvPGamePage = withLazyLoad(
  () => import('@pages/student/practice-mode/pvp/game')
);
const StudentTimedPracticePage = withLazyLoad(
  () => import('@pages/student/practice-test/timed')
);
const StudentUntimedPracticePage = withLazyLoad(
  () => import('@pages/student/practice-test/untimed')
);
const StudentFlashCardPracticePage = withLazyLoad(
  () => import('@pages/student/practice-test/flashcards')
);
const StudentSetPracticePage = withLazyLoad(
  () => import('@pages/student/practice-test/set')
);

// Lazy load admin pages
const AdminDashboardPage = withLazyLoad(() => import('@pages/admin/dashboard'));
const AdminViewAllTeachersPage = withLazyLoad(
  () => import('@pages/admin/all-teachers')
);
const AdminAddTeacherPage = withLazyLoad(
  () => import('@pages/admin/add-teacher')
);
const AdminAddSubAdminPage = withLazyLoad(
  () => import('@pages/admin/add-sub-admin')
);
const AdminAddStudentPage = withLazyLoad(
  () => import('@pages/admin/add-student')
);
const AdminBatchViewStudentsPage = withLazyLoad(
  () => import('@pages/admin/batch-all-students')
);
const AdminBulkAddStudentPage = withLazyLoad(
  () => import('@pages/admin/bulk-add-student')
);
const AdminSearchStudentsPage = withLazyLoad(
  () => import('@pages/admin/search-students')
);
const AdminStudentProgressPage = withLazyLoad(
  () => import('@pages/admin/student-progress')
);
const AdminViewAllBatchesPage = withLazyLoad(
  () => import('@pages/admin/all-batches')
);
const AdminEditBatchPage = withLazyLoad(
  () => import('@pages/admin/edit-batch')
);
const AdminAddBatchPage = withLazyLoad(() => import('@pages/admin/add-batch'));
const AdminAddQuestionPage = withLazyLoad(
  () => import('@pages/admin/add-question')
);
const AdminBulkAddQuestionsPage = withLazyLoad(
  () => import('@pages/admin/bulk-add-questions')
);
const AdminEditQuestionPage = withLazyLoad(
  () => import('@pages/admin/edit-question')
);
const AdminViewQuizPage = withLazyLoad(() => import('@pages/admin/view-quiz'));
const AdminAddOrganizationPage = withLazyLoad(
  () => import('@pages/admin/add-organization')
);
const AdminViewOrganizationPage = withLazyLoad(
  () => import('@pages/admin/view-organization')
);
const AdminEditOrganizationPage = withLazyLoad(
  () => import('@pages/admin/edit-organization')
);
const AdminLeaderboardPage = withLazyLoad(
  () => import('@pages/admin/leaderboard')
);

// Lazy load sub-admin pages
const SubAdminDashboardPage = withLazyLoad(
  () => import('@pages/sub-admin/dashboard')
);
const SubAdminAddBatchPage = withLazyLoad(
  () => import('@pages/sub-admin/add-batch')
);
const SubAdminAddStudentPage = withLazyLoad(
  () => import('@pages/sub-admin/add-student')
);
const SubAdminBulkAddStudentPage = withLazyLoad(
  () => import('@pages/sub-admin/bulk-add-student')
);
const SubAdminSearchStudentsPage = withLazyLoad(
  () => import('@pages/sub-admin/search-students')
);
const SubAdminStudentProgressPage = withLazyLoad(
  () => import('@pages/sub-admin/student-progress')
);
const SubAdminViewAllTeachersPage = withLazyLoad(
  () => import('@pages/sub-admin/all-teachers')
);
const SubAdminAddTeacherPage = withLazyLoad(
  () => import('@pages/sub-admin/add-teacher')
);
const SubAdminViewAllBatchesPage = withLazyLoad(
  () => import('@pages/sub-admin/all-batches')
);
const SubAdminBatchViewStudentsPage = withLazyLoad(
  () => import('@pages/sub-admin/batch-all-students')
);
const SubAdminEditBatchPage = withLazyLoad(
  () => import('@pages/sub-admin/edit-batch')
);
const SubAdminUpdateStudentBatchPage = withLazyLoad(
  () => import('@pages/sub-admin/update-student-batch')
);
const SubAdminUpdateBatchTeacherPage = withLazyLoad(
  () => import('@pages/sub-admin/update-batch-teacher')
);
const SubAdminLeaderboardPage = withLazyLoad(
  () => import('@pages/sub-admin/leaderboard')
);

// Lazy load teacher pages
const TeacherDashboardPage = withLazyLoad(
  () => import('@pages/teacher/dashboard')
);
const TeacherUpdateLinkPage = withLazyLoad(
  () => import('@pages/teacher/update-link')
);
const TeacherBatchReportPage = withLazyLoad(
  () => import('@pages/teacher/report')
);
const TeacherSearchStudentsPage = withLazyLoad(
  () => import('@pages/teacher/search-students')
);
const TeacherStudentProgressPage = withLazyLoad(
  () => import('@pages/teacher/student-progress')
);
const TeacherViewStudentsPage = withLazyLoad(
  () => import('@pages/teacher/students')
);
const TeacherOralTestPage = withLazyLoad(
  () => import('@pages/teacher/oral-test')
);
const TeacherLeaderboardPage = withLazyLoad(
  () => import('@pages/teacher/leaderboard')
);

export const router = createBrowserRouter([
  {
    path: '/',
    element: <DefaultLayout />,
    children: [
      // Route: 'boltabacus.com/' -> With Navbar & Footer
      {
        path: '',
        element: <RootLayout withNavBar withFooter />,
        children: [
          {
            path: '',
            element: <HomePage />,
          },
          {
            path: '/profile',
            element: <ProfilePage />,
          },
        ],
      },
      // Route: 'boltabacus.com/login' -> With Navbar only
      {
        path: 'login',
        element: <RootLayout withNavBar withFooter={false} />,
        children: [
          {
            path: '',
            element: <LoginPage />,
          },
        ],
      },
      // Route: 'boltabacus.com/reset-password' -> With Navbar only
      {
        path: 'reset-password',
        element: <RootLayout withNavBar withFooter={false} />,
        children: [
          {
            path: '',
            element: <ResetPasswordPage />,
          },
        ],
      },
      // Route: 'boltabacus.com/reset-password/v2' -> With Navbar only
      {
        path: 'resetPassword/v2/:authToken',
        element: <RootLayout withNavBar withFooter={false} />,
        children: [
          {
            path: '',
            element: <ResetPasswordPageV2 />,
          },
        ],
      },
      // Route: 'boltabacus.com/forgot-password' -> With Navbar only
      {
        path: 'forgot-password',
        element: <RootLayout withNavBar withFooter={false} />,
        children: [
          {
            path: '',
            element: <ForgotPasswordPage />,
          },
        ],
      },
      // Route: 'boltabacus.com/student' -> With Sidebar Navigation
      {
        path: 'student',
        element: <StudentLayoutWithSidebar />,
        children: [
          {
            path: '',
            element: <StudentDashboardPage />,
          },
          {
            path: 'dashboard',
            element: <StudentDashboardPage />,
          },
          {
            path: 'roadmap',
            element: <StudentRoadmapPage />,
          },
          {
            path: 'archive',
            element: <StudentArchivePage />,
          },
          {
            path: 'virtual-abacus',
            element: <StudentVirtualAbacusPage />,
          },
          {
            path: 'leaderboard',
            element: <StudentLeaderboardPage />,
          },
          {
            path: 'practice',
            element: <StudentPracticePage />,
          },
          {
            path: 'pvp',
            element: <StudentPvPPage />,
          },
          {
            path: 'pvp/room/:roomId',
            element: <StudentPvPRoomPage />,
          },
          {
            path: 'pvp/game/:roomId',
            element: <StudentPvPGamePage />,
          },
          {
            path: 'level/:levelId',
            element: <StudentLevelPage />,
          },
          {
            path: 'report/:levelId/:classId',
            element: <StudentReportPage />,
          },
          {
            path: 'progress',
            element: <StudentProgressPage />,
          },
          {
            path: 'practice/timed/:operation',
            element: <StudentTimedPracticePage />,
          },
          {
            path: 'practice/untimed/:operation',
            element: <StudentUntimedPracticePage />,
          },
          {
            path: 'practice/set/:operation',
            element: <StudentSetPracticePage />,
          },
          {
            path: 'practice/flashcards',
            element: <StudentFlashCardPracticePage />,
          },
          {
            path: 'profile',
            element: <ProfilePage />,
          },
          {
            path: 'quiz/:levelId/:classId/:topicId/:quizType',
            element: <StudentQuizPage />,
          },
          {
            path: 'test/:levelId/:classId',
            element: <StudentTestPage />,
          },
          {
            path: 'oral-test/:levelId',
            element: <StudentOralTestPage />,
          },
          {
            path: 'final-test/:levelId',
            element: <StudentFinalTestPage />,
          },
        ],
      },
      // Route: 'boltabacus.com/student' -> No Navbar & Footer (Practice pages only)
      {
        path: 'student',
        element: <StudentLayout withNavBar withFooter={false} />,
        children: [
          {
            path: '*',
            element: (
              <Custom404Page
                link="/student/dashboard"
                buttonText="Go to Dashboard"
              />
            ),
          },
        ],
      },
      // Route: 'boltabacus.com/admin'
      {
        path: 'admin',
        element: <AdminLayout withLinkBar />,
        children: [
          {
            path: '',
            element: <AdminDashboardPage />,
          },
          {
            path: 'dashboard',
            element: <AdminDashboardPage />,
          },
          {
            path: 'add/student',
            element: <AdminAddStudentPage />,
          },
          {
            path: 'add/student/bulk',
            element: <AdminBulkAddStudentPage />,
          },
          {
            path: 'search/student/',
            element: <AdminSearchStudentsPage />,
          },
          {
            path: 'all/teacher',
            element: <AdminViewAllTeachersPage />,
          },
          {
            path: 'add/teacher',
            element: <AdminAddTeacherPage />,
          },
          {
            path: 'add/sub-admin',
            element: <AdminAddSubAdminPage />,
          },
          {
            path: 'add/batch',
            element: <AdminAddBatchPage />,
          },
          {
            path: 'edit/batch/:batchId',
            element: <AdminEditBatchPage />,
          },
          {
            path: 'all/batch',
            element: <AdminViewAllBatchesPage />,
          },
          {
            path: 'batch/students/:batchId',
            element: <AdminBatchViewStudentsPage />,
          },
          {
            path: 'view/quiz',
            element: <AdminViewQuizPage />,
          },
          {
            path: 'add/question',
            element: <AdminAddQuestionPage />,
          },
          {
            path: 'add/question/bulk',
            element: <AdminBulkAddQuestionsPage />,
          },
          {
            path: 'add/organization',
            element: <AdminAddOrganizationPage />,
          },
          {
            path: 'view/organization',
            element: <AdminViewOrganizationPage />,
          },
          {
            path: 'edit/organization/:tagName',
            element: <AdminEditOrganizationPage />,
          },
          {
            path: 'edit/question/:questionId',
            element: <AdminEditQuestionPage />,
          },
          {
            path: 'leaderboard',
            element: <AdminLeaderboardPage />,
          },
          {
            path: '*',
            element: (
              <Custom404Page
                link="/admin/dashboard"
                buttonText="Go to Dashboard"
              />
            ),
          },
        ],
      },
      // Route: 'boltabacus.com/admin' without link bar
      {
        path: 'admin',
        element: <AdminLayout withLinkBar={false} />,
        children: [
          {
            path: 'student-progress/:studentId',
            element: <AdminStudentProgressPage />,
          },
        ],
      },
      // Route: 'boltabacus.com/sub-admin'
      {
        path: 'sub-admin',
        element: <SubAdminLayout withLinkBar />,
        children: [
          {
            path: '',
            element: <SubAdminDashboardPage />,
          },
          {
            path: 'dashboard',
            element: <SubAdminDashboardPage />,
          },
          {
            path: 'add/batch',
            element: <SubAdminAddBatchPage />,
          },
          {
            path: 'batch/students/:batchId',
            element: <SubAdminBatchViewStudentsPage />,
          },
          {
            path: 'add/student',
            element: <SubAdminAddStudentPage />,
          },
          {
            path: 'add/student/bulk',
            element: <SubAdminBulkAddStudentPage />,
          },
          {
            path: 'search/student/',
            element: <SubAdminSearchStudentsPage />,
          },
          {
            path: 'all/teacher',
            element: <SubAdminViewAllTeachersPage />,
          },
          {
            path: 'add/teacher',
            element: <SubAdminAddTeacherPage />,
          },
          {
            path: 'all/batch',
            element: <SubAdminViewAllBatchesPage />,
          },
          {
            path: 'edit/batch/:batchId',
            element: <SubAdminEditBatchPage />,
          },
          {
            path: 'student/update-batch/:studentId',
            element: <SubAdminUpdateStudentBatchPage />,
          },
          {
            path: 'batch/update-teacher/:batchId',
            element: <SubAdminUpdateBatchTeacherPage />,
          },
          {
            path: 'leaderboard',
            element: <SubAdminLeaderboardPage />,
          },
          {
            path: '*',
            element: (
              <Custom404Page
                link="/sub-admin/dashboard"
                buttonText="Go to Dashboard"
              />
            ),
          },
        ],
      },
      // Route: 'boltabacus.com/sub-admin' without link bar
      {
        path: 'sub-admin',
        element: <SubAdminLayout withLinkBar={false} />,
        children: [
          {
            path: 'student-progress/:studentId',
            element: <SubAdminStudentProgressPage />,
          },
        ],
      },
      // Route: 'boltabacus.com/teacher'
      {
        path: 'teacher',
        element: <TeacherLayout />,
        children: [
          {
            path: '',
            element: <TeacherDashboardPage />,
          },
          {
            path: 'dashboard',
            element: <TeacherDashboardPage />,
          },
          {
            path: 'update-link/:batchId',
            element: <TeacherUpdateLinkPage />,
          },
          {
            path: 'report/:batchId',
            element: <TeacherBatchReportPage />,
          },
          {
            path: 'search/student/',
            element: <TeacherSearchStudentsPage />,
          },
          {
            path: 'oral-test/',
            element: <TeacherOralTestPage />,
          },
          {
            path: 'student-progress/:studentId',
            element: <TeacherStudentProgressPage />,
          },
          {
            path: 'students/:batchId',
            element: <TeacherViewStudentsPage />,
          },
          {
            path: 'leaderboard',
            element: <TeacherLeaderboardPage />,
          },
        ],
      },
      // Route: 'boltabacus.com' -> 404 Page
      {
        path: '*',
        element: <Custom404Page link="/" buttonText="Go Back" />,
      },
    ],
  },
]);
