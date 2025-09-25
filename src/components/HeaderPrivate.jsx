// HeaderPrivate.jsx
import { Link } from "react-router-dom";
import "../styles/header.css";

export default function HeaderPrivate({ userRole }) {
    return (
        <header className="header">
            <div className="header-logo">Learning Hub</div>
            <nav className="header-nav">
                <Link to="/dashboard-sv">Dashboard</Link>
                {userRole === "STUDENT" && <Link to="/student/profile">Sinh viên</Link>}
                {userRole === "TEACHER" && <Link to="/teacher/courses">Giảng viên</Link>}
                {userRole === "ACCOUNTANT" && <Link to="/accountant/tuition">Kế toán</Link>}
                {userRole === "ADMIN" && <Link to="/admin/students">Quản trị</Link>}
                <Link to="Dashboard">Đăng xuất</Link>
            </nav>
        </header>
    );
}
