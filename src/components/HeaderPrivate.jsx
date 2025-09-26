// HeaderPrivate.jsx
import { Link } from "react-router-dom";
import "../styles/layout/base-layout.css";
import "../styles/components/header.css";
import profileImg from "/src/assets/profile.png";
import anouImg from "/src/assets/anou.jpg";

export default function HeaderPrivate({ userRole }) {
    return (
        <header className="header">
            <div className="header-logo">
                <Link className="header-logo-text" to="/">Learning Hub</Link>
            </div>
            <nav className="header-nav">
                <Link to="/dashboard-sv">Dashboard</Link>
                {userRole === "STUDENT" && <Link to="/student/profile">Sinh viên</Link>}
                {userRole === "STUDENT" && <Link to="/student/profile">Lịch thi</Link>}

                {userRole === "TEACHER" && <Link to="/teacher/courses">Giảng viên</Link>}

                {userRole === "ACCOUNTANT" && <Link to="/accountant/tuition">Kế toán</Link>}

                {userRole === "ADMIN" && <Link to="/admin/students">Quản trị</Link>}

                <div className="logo-icon">
                    <Link to="Dashboard">
                        <img className="nav-anou" src={anouImg} alt="" />
                    </Link>
                </div>
                <div className="logo-icon">
                    <Link to="Dashboard">
                        <img className="nav-icon" src={profileImg} alt="" />
                    </Link>
                </div>

                <Link className="nav-logout" to="Dashboard">Đăng xuất</Link>
            </nav>
        </header>
    );
}
