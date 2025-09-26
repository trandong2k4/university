// HeaderPublic.jsx - placeholder
import { Link } from "react-router-dom";
import "../styles/layout/base-layout.css";
import "../styles/components/header.css";
import profileImg from "/src/assets/profile.png";
import anouImg from "/src/assets/anou.jpg";

export default function HeaderPublic() {
    return (
        <header className="header">
            <div className="header-logo">
                <Link className="header-logo-text" to="/">Learning Hub</Link>
            </div>
            <nav className="header-nav">

                <Link to="/Dashboard">Trang chủ</Link>
                <Link to="/about">Giới thiệu</Link>
                <Link to="/">Ngành học</Link>
                <Link to="/blog">Tin tức</Link>
                <Link to="/contact">Liên hệ</Link>
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
                <Link className="nav-login" to="/login">Đăng nhập</Link>
            </nav >
        </header >
    );
}
