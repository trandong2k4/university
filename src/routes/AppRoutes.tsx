import { createBrowserRouter } from 'react-router';
import { ProtectedRoute } from './ProtectedRoute';

import Login from '@/pages/auth/Login';
import ResetPasswordPage from '@/pages/auth/ResetPasswordPage';

import StudentDashboard from '@/pages//student/StudentDashboard';
import ProfilePage from '@/pages/student/ProfilePage';
import SchedulePage from '@/pages/student/SchedulePage';
import DocumentsPage from '@/pages/student/DocumentsPage';
import AssignmentsOnlyPage from '@/pages/student/AssignmentsOnlyPage';
import QuizPage from '@/pages/student/QuizPage';
import CourseRegistrationPage from '@/pages/student/CourseRegistrationPage';
import AcademicProgressPage from '@/pages/student/AcademicProgressPage';
import TuitionPage from '@/pages/student/TuitionPage';
import InstructorRatingPage from '@/pages/student/InstructorRatingPage';
import { ChatbotPage } from '@/pages/student/ChatbotPage';
import { NotificationsPage as StudentNotificationsPage } from '@/pages/student/StudentNotificationsPage';
import StudyProgramPage from '@/pages/student/StudyProgramPage';

import LectureDashboard from '@/pages/lecturer/InstructorDashboard';
import ClassManagement from '@/pages/lecturer/ClassManagement';
import ClassDetail from '@/pages/lecturer/ClassDetail';
import DocumentManagement from '@/pages/lecturer/DocumentManagement';
import AssignmentManagement from '@/pages/lecturer/AssignmentManagement';
import AssignmentResults from '@/pages/lecturer/AssignmentResults';
import SubmissionsView from '@/pages/lecturer/SubmissionsView';
import GradeManagement from '@/pages/lecturer/GradeManagement';
import AttendanceManagement from '@/pages/lecturer/AttendanceManagement';
import NotificationManagement from '@/pages/lecturer/NotificationManagement';
import InstructorProfile from '@/pages/lecturer/InstructorProfile';
import QuizManagement from '@/pages/lecturer/QuizManagement';
import QuizResults from '@/pages/lecturer/QuizResults';

import AdminDashboard from '@/pages/admin/AdminDashboard';
import AdminDepartmentsPage from '@/pages/admin/AdminDepartmentsPage';
import AdminSchoolsPage from '@/pages/admin/AdminSchoolsPage';
import AdminRoomsPage from '@/pages/admin/AdminRoomsPage';
import AdminSemestersPage from '@/pages/admin/AdminSemestersPage';
import AdminPeriodsPage from '@/pages/admin/AdminPeriodsPage';
import AdminClassesPage from '@/pages/admin/AdminClassesPage';
import AdminSchedulesPage from '@/pages/admin/AdminSchedulesPage';
import AdminContentPage from '@/pages/admin/AdminContentPage';
import AdminTuitionCoordinationPage from '@/pages/admin/AdminTuitionCoordinationPage';
import AdminReportsPage from '@/pages/admin/AdminReportsPage';
import AdminUsersPage from '@/pages/admin/AdminUsersPage';
import AdminAuthorizationPage from '@/pages/admin/AdminAuthorizationPage';
import AdminRolesPage from '@/pages/admin/AdminRolesPage';
import AdminPermissionsPage from '@/pages/admin/AdminPermissionsPage';
import AdminPermissionsAssignPage from '@/pages/admin/AdminPermissionsAssignPage';
import AdminRolePermissionsPage from '@/pages/admin/AdminRolePermissionsPage';
import AdminCreditRegistrationsPage from '@/pages/admin/AdminCreditRegistrationsPage';
import AdminContactsPage from '@/pages/admin/AdminContactsPage';
import AdminNotificationsPage from '@/pages/admin/AdminNotificationsPage';
import AdminTeachingManagementPage from '@/pages/admin/AdminTeachingManagementPage';
import AdminStaffPage from '@/pages/admin/AdminStaffPage';
import AdminStudentsPage from '@/pages/admin/AdminStudentsPage';
import AdminChuongTrinhDaoTaoPage from '@/pages/admin/AdminChuongTrinhDaoTaoPage';
import AdminSubmissionsPage from '@/pages/admin/AdminSubmissionsPage';

import AccountantDashboard from '@/pages/accounting/AccountantDashboard';
import NotificationsPage from '@/pages/accounting/NotificationsPage';
import AccountantProfilePage from '@/pages/accounting/AccountantProfilePage';
import FinancialReportsPage from '@/pages/accounting/FinancialReportsPage';
import TuitionManagementPage from '@/pages/accounting/TuitionManagementPage';

// Pre-created wrapper components to prevent re-creation on every render
const withRole = (Component: React.ComponentType, role: string) => {
    const Wrapped = () => (
        <ProtectedRoute requiredRole={role}>
            <Component />
        </ProtectedRoute>
    );
    Wrapped.displayName = `withRole(${Component.displayName || Component.name || 'Component'}, '${role}')`;
    return Wrapped;
};

// Pre-create all route components at module level to ensure stable references
const AdminUsersPageWrapper = withRole(AdminUsersPage, 'admin');
const AdminDashboardWrapper = withRole(AdminDashboard, 'admin');
const AdminDepartmentsPageWrapper = withRole(AdminDepartmentsPage, 'admin');
const AdminSchoolsPageWrapper = withRole(AdminSchoolsPage, 'admin');
const AdminRoomsPageWrapper = withRole(AdminRoomsPage, 'admin');
const AdminSemestersPageWrapper = withRole(AdminSemestersPage, 'admin');
const AdminPeriodsPageWrapper = withRole(AdminPeriodsPage, 'admin');
const AdminClassesPageWrapper = withRole(AdminClassesPage, 'admin');
const AdminSchedulesPageWrapper = withRole(AdminSchedulesPage, 'admin');
const AdminContentPageWrapper = withRole(AdminContentPage, 'admin');
const AdminTuitionCoordinationPageWrapper = withRole(AdminTuitionCoordinationPage, 'admin');
const AdminReportsPageWrapper = withRole(AdminReportsPage, 'admin');
const AdminAuthorizationPageWrapper = withRole(AdminAuthorizationPage, 'admin');
const AdminRolesPageWrapper = withRole(AdminRolesPage, 'admin');
const AdminPermissionsPageWrapper = withRole(AdminPermissionsPage, 'admin');
const AdminPermissionsAssignPageWrapper = withRole(AdminPermissionsAssignPage, 'admin');
const AdminRolePermissionsPageWrapper = withRole(AdminRolePermissionsPage, 'admin');
const AdminCreditRegistrationsPageWrapper = withRole(AdminCreditRegistrationsPage, 'admin');
const AdminContactsPageWrapper = withRole(AdminContactsPage, 'admin');
const AdminNotificationsPageWrapper = withRole(AdminNotificationsPage, 'admin');

const AdminTeachingManagementPageWrapper = withRole(AdminTeachingManagementPage, 'admin');
const AdminStaffPageWrapper = withRole(AdminStaffPage, 'admin');
const AdminStudentsPageWrapper = withRole(AdminStudentsPage, 'admin');
const AdminChuongTrinhDaoTaoPageWrapper = withRole(AdminChuongTrinhDaoTaoPage, 'admin');
const AdminSubmissionsPageWrapper = withRole(AdminSubmissionsPage, 'admin');

const StudentDashboardWrapper = withRole(StudentDashboard, 'student');
const ProfilePageWrapper = withRole(ProfilePage, 'student');
const SchedulePageWrapper = withRole(SchedulePage, 'student');
const DocumentsPageWrapper = withRole(DocumentsPage, 'student');
const AssignmentsOnlyPageWrapper = withRole(AssignmentsOnlyPage, 'student');
const QuizPageWrapper = withRole(QuizPage, 'student');
const CourseRegistrationPageWrapper = withRole(CourseRegistrationPage, 'student');
const AcademicProgressPageWrapper = withRole(AcademicProgressPage, 'student');
const TuitionPageWrapper = withRole(TuitionPage, 'student');
const InstructorRatingPageWrapper = withRole(InstructorRatingPage, 'student');
const ChatbotPageWrapper = withRole(ChatbotPage, 'student');
const StudentNotificationsPageWrapper = withRole(StudentNotificationsPage, 'student');
const StudyProgramPageWrapper = withRole(StudyProgramPage, 'student');

const LecturerDashboardWrapper = withRole(LectureDashboard, 'lecturer');
const ClassManagementWrapper = withRole(ClassManagement, 'lecturer');
const ClassDetailWrapper = withRole(ClassDetail, 'lecturer');
const DocumentManagementWrapper = withRole(DocumentManagement, 'lecturer');
const AssignmentManagementWrapper = withRole(AssignmentManagement, 'lecturer');
const AssignmentResultsWrapper = withRole(AssignmentResults, 'lecturer');
const SubmissionsViewWrapper = withRole(SubmissionsView, 'lecturer');
const GradeManagementWrapper = withRole(GradeManagement, 'lecturer');
const AttendanceManagementWrapper = withRole(AttendanceManagement, 'lecturer');
const NotificationManagementWrapper = withRole(NotificationManagement, 'lecturer');
const InstructorProfileWrapper = withRole(InstructorProfile, 'lecturer');
const QuizManagementWrapper = withRole(QuizManagement, 'lecturer');
const QuizResultsWrapper = withRole(QuizResults, 'lecturer');
const AccountantDashboardWrapper = withRole(AccountantDashboard, 'accountant');
const NotificationsPageWrapper = withRole(NotificationsPage, 'accountant');
const AccountantProfilePageWrapper = withRole(AccountantProfilePage, 'accountant');
const FinancialReportsPageWrapper = withRole(FinancialReportsPage, 'accountant');
const TuitionManagementPageWrapper = withRole(TuitionManagementPage, 'accountant');

export const router = createBrowserRouter([
    { path: '/', element: <Login /> },
    { path: '/reset-password', element: <ResetPasswordPage /> },


    { path: '/student/dashboard', element: <StudentDashboardWrapper /> },
    { path: '/student/profile', element: <ProfilePageWrapper /> },
    { path: '/student/schedule', element: <SchedulePageWrapper /> },
    { path: '/student/documents', element: <DocumentsPageWrapper /> },
    { path: '/student/assignments', element: <AssignmentsOnlyPageWrapper /> },
    { path: '/student/quiz', element: <QuizPageWrapper /> },
    { path: '/student/register', element: <CourseRegistrationPageWrapper /> },
    { path: '/student/progress', element: <AcademicProgressPageWrapper /> },
    { path: '/student/tuition', element: <TuitionPageWrapper /> },
    { path: '/student/rating', element: <InstructorRatingPageWrapper /> },
    { path: '/student/chatbot', element: <ChatbotPageWrapper /> },
    { path: '/student/notifications', element: <StudentNotificationsPageWrapper /> },
    { path: '/student/study-program', element: <StudyProgramPageWrapper /> },

    { path: '/lecturer/dashboard', element: <LecturerDashboardWrapper /> },
    { path: '/lecturer/classes', element: <ClassManagementWrapper /> },
    { path: '/lecturer/classes/:classId', element: <ClassDetailWrapper /> },
    { path: '/lecturer/documents', element: <DocumentManagementWrapper /> },
    { path: '/lecturer/assignments', element: <AssignmentManagementWrapper /> },
    { path: '/lecturer/assignments/:assignmentId/results', element: <AssignmentResultsWrapper /> },
    { path: '/lecturer/assignments/:assignmentId/submissions', element: <SubmissionsViewWrapper /> },
    { path: '/lecturer/quiz', element: <QuizManagementWrapper /> },
    { path: '/lecturer/quiz/:quizId/results', element: <QuizResultsWrapper /> },
    { path: '/lecturer/grades', element: <GradeManagementWrapper /> },
    { path: '/lecturer/attendance', element: <AttendanceManagementWrapper /> },
    { path: '/lecturer/notifications', element: <NotificationManagementWrapper /> },
    { path: '/lecturer/profile', element: <InstructorProfileWrapper /> },

    { path: '/admin/dashboard', element: <AdminDashboardWrapper /> },
    { path: '/admin/schools', element: <AdminSchoolsPageWrapper /> },
    { path: '/admin/rooms', element: <AdminRoomsPageWrapper /> },
    { path: '/admin/hoc-ki', element: <AdminSemestersPageWrapper /> },
    { path: '/admin/gio-hoc', element: <AdminPeriodsPageWrapper /> },
    { path: '/admin/departments', element: <AdminDepartmentsPageWrapper /> },
    { path: '/admin/classes', element: <AdminClassesPageWrapper /> },
    { path: '/admin/schedules', element: <AdminSchedulesPageWrapper /> },
    { path: '/admin/content', element: <AdminContentPageWrapper /> },
    { path: '/admin/tuition', element: <AdminTuitionCoordinationPageWrapper /> },
    { path: '/admin/reports', element: <AdminReportsPageWrapper /> },
    { path: '/admin/users', element: <AdminUsersPageWrapper /> },
    { path: '/admin/authorization', element: <AdminAuthorizationPageWrapper /> },
    { path: '/admin/roles', element: <AdminRolesPageWrapper /> },
    { path: '/admin/permissions', element: <AdminPermissionsPageWrapper /> },
    { path: '/admin/permissions-assign', element: <AdminPermissionsAssignPageWrapper /> },
    { path: '/admin/role-permissions', element: <AdminRolePermissionsPageWrapper /> },
    { path: '/admin/credit-registrations', element: <AdminCreditRegistrationsPageWrapper /> },
    { path: '/admin/contacts', element: <AdminContactsPageWrapper /> },
    { path: '/admin/notifications', element: <AdminNotificationsPageWrapper /> },
    { path: '/admin/teaching', element: <AdminTeachingManagementPageWrapper /> },
    { path: '/admin/staff', element: <AdminStaffPageWrapper /> },
    { path: '/admin/students', element: <AdminStudentsPageWrapper /> },
    { path: '/admin/chuong-trinh-dao-tao', element: <AdminChuongTrinhDaoTaoPageWrapper /> },
    { path: '/admin/submissions', element: <AdminSubmissionsPageWrapper /> },

    { path: '/accountant/dashboard', element: <AccountantDashboardWrapper /> },
    { path: '/accountant/reports', element: <FinancialReportsPageWrapper /> },
    { path: '/accountant/tuition', element: <TuitionManagementPageWrapper /> },
    { path: '/accountant/notifications', element: <NotificationsPageWrapper /> },
    { path: '/accountant/profile', element: <AccountantProfilePageWrapper /> },
]);
