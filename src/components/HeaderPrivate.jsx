// HeaderPrivate.jsx
import { Link } from "react-router-dom";
import "../styles/layout/base-layout.css";
import "../styles/components/headerPrivate.css";
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

            </nav>
            <div className="logo-icon">
                <div className="logo-anou">
                    <Link to="Dashboard">
                        <img title="Thông báo" className="icon-anou" src={anouImg} alt="" />
                    </Link>
                </div>
                <Link className="btn-logout" to="Dashboard">Đăng xuất</Link>
                <div className="logo-profile">
                    <Link to="Dashboard">
                        <img title="profile" className="nav-profile" src={profileImg} alt="" />
                    </Link>
                </div>
            </div>
        </header>
    );
}
