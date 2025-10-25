// AppRouter.jsx - placeholder

import { Routes, Route } from "react-router-dom";

// Layouts
import AuthLayout from "../layouts/AuthLayout";
import PublicLayout from "../layouts/PublicLayout";

// Guards
import ProtectedRoute from "../components/ProtectedRoute";

// Public pages
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
import Chatbot from "../pages/student/ChatbotPage";

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


export default function AppRouter() {
    return (
        <Routes>
            {/* Public */}
            <Route path="/" element={<PublicLayout />}>
                <Route index element={<PublicDashboard />} />
                <Route path="/Dashboard" element={<PublicDashboard />} />
                <Route path="blog" element={<BlogGuide />} />
                <Route path="about" element={<About />} />
                <Route path="contact" element={<Contact />} />
                <Route path="nganh" element={<Nganh />} />
                <Route path="/unauthorized" element={<UnauthorizedPage />} />
                {/* Auth routes */}
                <Route path="/login" element={<Login />} />
                <Route path="/register" element={<Register />} />
                <Route path="/forgot-password" element={<ForgotPassword />} />
                {/* … public routes … */}
            </Route>

            {/* Student */}
            <Route element={<ProtectedRoute roles={["STUDENT"]} />}>
                <Route element={<AuthLayout userRole="STUDENT" />}>
                    <Route path="/student/dashboard" element={<StudentDashboard />} />
                    <Route path="/student/profile" element={<Profile />} />
                    <Route path="/student/courses" element={<Courses />} />
                    <Route path="/student/schedule" element={<Schedule />} />
                    <Route path="/student/grades" element={<Grades />} />
                    <Route path="/student/tuition" element={<Tuition />} />
                    <Route path="/student/register-credit" element={<RegisterCredit />} />
                    <Route path="/student/cancel-credit" element={<CancelCredit />} />
                    <Route path="/chatbotpage" element={<Chatbot />} />
                    {/* …other student pages… */}
                </Route>
            </Route>

            {/* Teacher */}
            <Route element={<ProtectedRoute roles={["TEACHER"]} />}>
                <Route element={<AuthLayout userRole="TEACHER" />}>
                    <Route path="/teacher/dashboard" element={<TeacherDashboard />} />
                    <Route path="/teacher/students" element={<StudentInfo />} />
                    <Route path="/teacher/courses" element={<TeacherCourses />} />
                    <Route path="/teacher/schedule" element={<TeacherSchedule />} />
                    <Route path="/teacher/grades" element={<StudentGrades />} />
                    <Route path="/teacher/update-grades" element={<UpdateGrades />} />
                    {/* …other teacher pages… */}
                </Route>
            </Route>

            {/* Accountant */}
            <Route element={<ProtectedRoute roles={["ACCOUNTANT"]} />}>
                <Route element={<AuthLayout userRole="ACCOUNTANT" />}>
                    <Route path="/accountant/tuition" element={<StudentTuition />} />
                    <Route path="/accountant/create" element={<CreateTuition />} />
                    <Route path="/accountant/update" element={<UpdateTuition />} />
                    {/* … */}
                </Route>
            </Route>

            {/* Admin */}
            <Route element={<ProtectedRoute roles={["ADMIN"]} />}>
                <Route element={<AuthLayout userRole="ADMIN" />}>
                    <Route path="/admin/dashboard" element={<AdminDashboard />} />
                    <Route path="/admin/manage" element={<ManageAdmin />} />
                    <Route path="/admin/reports" element={<ManageReports />} />
                    <Route path="/admin/setting" element={<ManageSetting />} />
                    <Route path="/admin/students" element={<ManageStudents />} />
                    <Route path="/admin/courses" element={<ManageCourses />} />
                    <Route path="/admin/schedule" element={<ManageSchedule />} />
                    <Route path="/admin/grades" element={<ManageGrades />} />
                    <Route path="/admin/tuition" element={<ManageTuition />} />
                    <Route path="/admin/credits" element={<ManageCreditRegister />} />
                    <Route path="/admin/nganh" element={<ManageMajors />} />
                    <Route path="/admin/employees" element={<ManageEmpuloyees />} />
                    <Route path="/admin/truong" element={<ManageSchools />} />
                    <Route path="/admin/khoa" element={<ManageDepartments />} />
                    <Route path="/admin/user" element={<ManageUsers />} />
                    <Route path="/admin/role" element={<ManageRoles />} />
                    {/* … */}
                </Route>
            </Route>
        </Routes >
    );
}

