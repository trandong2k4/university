// AppRouter.jsx - placeholder

import { Routes, Route } from "react-router-dom";

// Layouts
import AuthLayout from "../layouts/AuthLayout";
import PublicLayout from "../layouts/PublicLayout";
import PrivateLayout from "../layouts/PrivateLayout";

// Guards
import ProtectedRoute from "../components/ProtectedRoute";

// Public pages
import Notification from "../pages/public/Notification";
import BlogGuide from "../pages/public/BlogGuide";
import About from "../pages/public/About";
import Contact from "../pages/public/Contact";
import Nganh from "../pages/public/Nganh";
import UnauthorizedPage from "../pages/public/UnauthorizedPage";

// (Tuỳ chọn) Dashboards
import PublicDashboard from "../pages/dashboard/PublicDashboard";
import ManageDashboard from "../pages/dashboard/ManageDashboard";
import AdminDashboard from "../pages/dashboard/AdminDashboard";
import StudentDashboard from "../pages/dashboard/StudentDashboard";
import TeacherDashboard from "../pages/dashboard/TeacherDashboard";

// Auth pages
import Login from "../pages/auth/Login";
import Register from "../pages/auth/Register";
import ForgotPassword from "../pages/auth/ForgotPassword";

// Student pages
import Profile from "../pages/student/Profile";
import Courses from "../pages/student/Courses";
import Schedule from "../pages/student/Schedule";
import Grades from "../pages/student/Grades";
import Tuition from "../pages/student/Tuition";
import RegisterCredit from "../pages/student/RegisterCredit";
import CancelCredit from "../pages/student/CancelCredit";
import ChatbotStudent from "../pages/student/ChatbotPage";

// Teacher pages
import StudentInfo from "../pages/teacher/StudentInfo";
import TeacherCourses from "../pages/teacher/TeacherCourses";
import TeacherSchedule from "../pages/teacher/TeacherSchedule";
import StudentGrades from "../pages/teacher/StudentGrades";
import UpdateGrades from "../pages/teacher/UpdateGrades";

// Accountant pages
import StudentTuition from "../pages/accountant/StudentTuition";
import CreateTuition from "../pages/accountant/CreateTuition";
import UpdateTuition from "../pages/accountant/UpdateTuition";

// Admin pages
import ManageAdmin from "../pages/admin/ManageAdmin";
import ManageReports from "../pages/admin/ManageReports";
import ManageSetting from "../pages/admin/ManageSetting";
import ManageStudents from "../pages/admin/ManageStudents";
import ManageCourses from "../pages/admin/ManageCourses";
import ManageSchedule from "../pages/admin/ManageSchedule";
import ManageGrades from "../pages/admin/ManageGrades";
import ManageTuition from "../pages/admin/ManageTuition";
import ManageCreditRegister from "../pages/admin/ManageCreditRegister";
import ManageMajors from "../pages/admin/ManageMajors";
import ManageEmpuloyees from "../pages/admin/ManageEmployees";
import ManageSchools from "../pages/admin/ManageSchools";
import ManageDepartments from "../pages/admin/ManageDepartments";
import ManageUsers from "../pages/admin/ManageUsers";
import ManageRoles from "../pages/admin/ManageRoles";
import ManagePermission from "../pages/admin/ManagePermission";
import ManagePartialClass from "../pages/admin/ManagePartialClass";

export default function AppRouter() {
    return (
        <Routes>

            {/* Auth routes */}
            <Route element={<AuthLayout />}>
                <Route path="/login" element={<Login />} />
                <Route path="/register" element={<Register />} />
                <Route path="/forgot-password" element={<ForgotPassword />} />
            </Route>

            {/* Public */}
            <Route path="/" element={<PublicLayout />}>
                <Route index element={<PublicDashboard />} />
                <Route path="/Dashboard" element={<PublicDashboard />} />
                <Route path="blog" element={<BlogGuide />} />
                <Route path="about" element={<About />} />
                <Route path="contact" element={<Contact />} />
                <Route path="nganh" element={<Nganh />} />
                <Route path="/unauthorized" element={<UnauthorizedPage />} />
                {/* … public routes … */}
            </Route>

            {/* Student */}
            <Route element={<ProtectedRoute roles={["STUDENT"]} />}>
                <Route element={<PrivateLayout userRole="STUDENT" />}>
                    <Route path="/student/dashboard" element={<StudentDashboard />} />
                    <Route path="/student/profile" element={<Profile />} />
                    <Route path="/student/courses" element={<Courses />} />
                    <Route path="/student/schedule" element={<Schedule />} />
                    <Route path="/student/grades" element={<Grades />} />
                    <Route path="/student/tuition" element={<Tuition />} />
                    <Route path="/student/register-credit" element={<RegisterCredit />} />
                    <Route path="/student/cancel-credit" element={<CancelCredit />} />
                    <Route path="/chatbotpage" element={<ChatbotStudent />} />
                    <Route path="/student/blog" element={<BlogGuide />} />
                    <Route path="/student/nganh" element={<Nganh />} />
                    <Route path="/student/notification" element={<Notification />} />
                    {/* …other student pages… */}
                </Route>
            </Route>

            {/* Teacher */}
            <Route element={<ProtectedRoute roles={["TEACHER"]} />}>
                <Route element={<PrivateLayout userRole="TEACHER" />}>
                    <Route path="/teacher/dashboard" element={<TeacherDashboard />} />
                    <Route path="/teacher/students" element={<StudentInfo />} />
                    <Route path="/teacher/courses" element={<TeacherCourses />} />
                    <Route path="/teacher/schedule" element={<TeacherSchedule />} />
                    <Route path="/teacher/grades" element={<StudentGrades />} />
                    <Route path="/teacher/update-grades" element={<UpdateGrades />} />
                    <Route path="/teacher/notification" element={<Notification />} />
                    {/* …other teacher pages… */}
                </Route>
            </Route>

            {/* Accountant */}
            <Route element={<ProtectedRoute roles={["ACCOUNTANT"]} />}>
                <Route element={<PrivateLayout userRole="ACCOUNTANT" />}>
                    <Route path="/accountant/tuition" element={<StudentTuition />} />
                    <Route path="/accountant/create" element={<CreateTuition />} />
                    <Route path="/accountant/update" element={<UpdateTuition />} />
                    <Route path="/accountant/notification" element={<Notification />} />
                    {/* … */}
                </Route>
            </Route>

            {/* Admin */}
            <Route element={<ProtectedRoute roles={["ADMIN"]} />}>
                <Route element={<PrivateLayout userRole="ADMIN" />}>
                    <Route path="/admin/dashboard" element={<AdminDashboard />} />
                    <Route path="/admin/manage" element={<ManageAdmin />} />
                    <Route path="/admin/manage_reports" element={<ManageReports />} />
                    <Route path="/admin/manage_setting" element={<ManageSetting />} />
                    <Route path="/admin/manage_students" element={<ManageStudents />} />
                    <Route path="/admin/manage_courses" element={<ManageCourses />} />
                    <Route path="/admin/manage_schedule" element={<ManageSchedule />} />
                    <Route path="/admin/manage_partial_class" element={<ManagePartialClass />} />
                    <Route path="/admin/manage_grades" element={<ManageGrades />} />
                    <Route path="/admin/manage_tuition" element={<ManageTuition />} />
                    <Route path="/admin/manage_credits" element={<ManageCreditRegister />} />
                    <Route path="/admin/manage_nganh" element={<ManageMajors />} />
                    <Route path="/admin/manage_employees" element={<ManageEmpuloyees />} />
                    <Route path="/admin/manage_truong" element={<ManageSchools />} />
                    <Route path="/admin/manage_khoa" element={<ManageDepartments />} />
                    <Route path="/admin/manage_user" element={<ManageUsers />} />
                    <Route path="/admin/manage_role" element={<ManageRoles />} />
                    <Route path="/admin/manage_permission" element={<ManagePermission />} />
                    <Route path="/admin/notification" element={<Notification />} />
                    {/* … */}
                </Route>
            </Route>
        </Routes >
    );
}

