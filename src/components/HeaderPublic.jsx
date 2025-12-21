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

                <Link to="/">Trang chủ</Link>
                <Link to="/about">Giới thiệu</Link>
                <Link to="/nganh">Ngành học</Link>
                <Link to="/blog">Tin tức</Link>
                <Link to="/contact">Liên hệ</Link>

            </nav >
            <div className="text-login">
                <Link className="btn-login" to="/auth/login">Đăng nhập</Link>
            </div>
        </header >
    );
}
