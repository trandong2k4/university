// HeaderPublic.jsx - placeholder
import { Link } from "react-router-dom";
import "../styles/layout/base-layout.css";
import "../styles/components/headerPublic.css";

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

                <Link className="nav-login" to="/login">Đăng nhập</Link>

            </nav >
        </header >
    );
}
