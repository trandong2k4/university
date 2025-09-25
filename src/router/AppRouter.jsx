// AppRouter.jsx - placeholder

import { Routes, Route } from "react-router-dom";

// Layouts
import PublicLayout from "../layouts/PublicLayout";
import StudentLayout from "../layouts/StudentLayout";
import TeacherLayout from "../layouts/TeacherLayout";
import AccountantLayout from "../layouts/AccountantLayout";
import AdminLayout from "../layouts/AdminLayout";

// Guards
import ProtectedRoute from "../components/ProtectedRoute";

// Public pages
import Home from "../pages/public/Home";
import SearchCourse from "../pages/public/SearchCourse";
import MajorDetail from "../pages/public/MajorDetail";
import BlogGuide from "../pages/public/BlogGuide";
import Chatbot from "../pages/public/Chatbot";
import About from "../pages/public/About";
import Contact from "../pages/public/Contact";

// (Tuỳ chọn) Dashboards
import PublicDashboard from "../pages/dashboard/PublicDashboard";
import AdminDashboard from "../pages/dashboard/AdminDashboard";

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
import ManageStudents from "../pages/admin/ManageStudents";
import ManageCourses from "../pages/admin/ManageCourses";
import ManageSchedule from "../pages/admin/ManageSchedule";
import ManageGrades from "../pages/admin/ManageGrades";
import ManageTuition from "../pages/admin/ManageTuition";
import ManageCreditRegister from "../pages/admin/ManageCreditRegister";

export default function AppRouter() {
    return (
        <Routes>
            {/* Public routes */}
            <Route path="/" element={<PublicLayout />}>
                <Route index element={<PublicDashboard />} />
                <Route path="/Dashboard" element={<PublicDashboard />} />
                <Route path="courses" element={<SearchCourse />} />
                <Route path="/majors/:id" element={<MajorDetail />} />
                <Route path="blog" element={<BlogGuide />} />
                <Route path="chatbot" element={<Chatbot />} />
                <Route path="about" element={<About />} />
                <Route path="contact" element={<Contact />} />

                {/* Auth routes */}
                <Route path="/login" element={<Login />} />
                <Route path="/register" element={<Register />} />
                <Route path="/forgot-password" element={<ForgotPassword />} />

            </Route>



            {/* Student routes */}
            <Route element={<ProtectedRoute roles={["STUDENT"]} />}>
                <Route element={<StudentLayout />}>
                    <Route path="/student/profile" element={<Profile />} />
                    <Route path="/student/courses" element={<Courses />} />
                    <Route path="/student/schedule" element={<Schedule />} />
                    <Route path="/student/grades" element={<Grades />} />
                    <Route path="/student/tuition" element={<Tuition />} />
                    <Route path="/student/register-credit" element={<RegisterCredit />} />
                    <Route path="/student/cancel-credit" element={<CancelCredit />} />
                </Route>
            </Route>

            {/* Teacher routes */}
            <Route element={<ProtectedRoute roles={["TEACHER"]} />}>
                <Route element={<TeacherLayout />}>
                    <Route path="/teacher/students" element={<StudentInfo />} />
                    <Route path="/teacher/courses" element={<TeacherCourses />} />
                    <Route path="/teacher/schedule" element={<TeacherSchedule />} />
                    <Route path="/teacher/grades" element={<StudentGrades />} />
                    <Route path="/teacher/update-grades" element={<UpdateGrades />} />
                </Route>
            </Route>

            {/* Accountant routes */}
            <Route element={<ProtectedRoute roles={["ACCOUNTANT"]} />}>
                <Route element={<AccountantLayout />}>
                    <Route path="/accountant/tuition" element={<StudentTuition />} />
                    <Route path="/accountant/create" element={<CreateTuition />} />
                    <Route path="/accountant/update" element={<UpdateTuition />} />
                </Route>
            </Route>

            {/* Admin routes */}
            <Route element={<ProtectedRoute roles={["ADMIN"]} />}>
                <Route element={<AdminLayout />}>
                    {/* tuỳ chọn: admin dashboard */}
                    <Route path="/admin" element={<AdminDashboard />} />
                    <Route path="/admin/students" element={<ManageStudents />} />
                    <Route path="/admin/courses" element={<ManageCourses />} />
                    <Route path="/admin/schedule" element={<ManageSchedule />} />
                    <Route path="/admin/grades" element={<ManageGrades />} />
                    <Route path="/admin/tuition" element={<ManageTuition />} />
                    <Route path="/admin/credits" element={<ManageCreditRegister />} />
                </Route>
            </Route>
        </Routes>
    );
}
