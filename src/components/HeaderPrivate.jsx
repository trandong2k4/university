// HeaderPrivate.jsx
import { Link } from "react-router-dom";
import "../styles/layout/base-layout.css";
import "../styles/components/headerPrivate.css";
import Notification from "../components/Notification";
import profileImg from "/src/assets/profile.png";
import anouImg from "/src/assets/anou.jpg";


export default function HeaderPrivate({ userRole }) {
    const path = userRole?.toLowerCase();
    const link = userRole == "ADMIN" ? "admin/login" : "login";
    return (
        <header className="header">
            <div className="header-logo">
                <Link className="header-logo-text" to={`/${path}/dashboard`}>Learning Hub</Link>
            </div>
            <nav className="header-nav">
                {/* <Link to="/dashboard-sv">Dashboard</Link> */}
                {userRole === "STUDENT" && <Link to="/student/dashboard">Trang chủ</Link>}
                {userRole === "STUDENT" && <Link to="/student/nganh">Ngành học</Link>}
                {userRole === "STUDENT" && <Link to="/student/blog">Tin tức</Link>}
                {/* {userRole === "STUDENT" && <Link to="/student/profile">Sinh viên</Link>} */}
                {/* {userRole === "STUDENT" && <Link to="/student/profile">Lịch thi</Link>} */}


                {/* Teacher */}
                {userRole === "TEACHER" && <Link to="/teacher/dashboard">Trang chủ</Link>}
                {userRole === "TEACHER" && <Link to="/blog">Tin tức</Link>}
                {userRole === "TEACHER" && <Link to="/teacher/courses">Giảng viên</Link>}
                {userRole === "TEACHER" && <Link to="/teacher/courses">Giảng viên</Link>}
                {userRole === "TEACHER" && <Link to="/teacher/courses">Giảng viên</Link>}


                {/* Accounting */}
                {/* {userRole === "ACCOUNTANT" && <Link to="/accountant/tuition">Kế toán</Link>} */}
                {/* {/* {userRole === "ACCOUNTANT" && <Link to="/accountant/tuition"></Link>} */}
                {/* {userRole === "ACCOUNTANT" && <Link to="/accountant/tuition">Kế toán</Link>} */}

                {/* Admin */}
                {userRole === "ADMIN" && <Link to="/admin/dashboard">Trang chủ</Link>}
                {userRole === "ADMIN" && <Link to="/admin/manage_user">Quản trị</Link>}
                {userRole === "ADMIN" && <Link to="/admin/design">Báo cáo</Link>}
                {/* {userRole === "ADMIN" && <Link to="/admin/setting">Cài đặt</Link>} */}
            </nav>
            <div className="logo-icon">

                {/* <Notification /> */}
                {/* <Link to={`/${path}/notification`}>
                    <img title="Thông báo" className="icon-anou" src={anouImg} alt="" />
                </Link> */}

                <Link className="btn-logout" to={`/auth/${link}`}>Đăng xuất</Link>
                <div className="logo-profile">
                    <Link to="/icon/profile">
                        <img title="profile" className="nav-profile" src={profileImg} alt="" />
                    </Link>
                </div>
            </div>
        </header >
    );
}
