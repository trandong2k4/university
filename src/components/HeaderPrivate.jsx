// HeaderPrivate.jsx - placeholder
import { Link } from "react-router-dom";


export default function HeaderPrivate({ userRole }) {
    return (
        <header className="bg-indigo-700 text-white p-4 flex justify-between items-center shadow-md">
            <div className="font-bold text-xl">Learning Hub</div>
            <nav className="space-x-6 hidden md:flex">
                <Link to="/dashboard">Dashboard</Link>
                {userRole === "STUDENT" && <Link to="/student/profile">Sinh viên</Link>}
                {userRole === "TEACHER" && <Link to="/teacher/courses">Giảng viên</Link>}
                {userRole === "ACCOUNTANT" && <Link to="/accountant/tuition">Kế toán</Link>}
                {userRole === "ADMIN" && <Link to="/admin/students">Quản trị</Link>}
                <Link to="/logout">Đăng xuất</Link>
            </nav>
        </header>
    );
}