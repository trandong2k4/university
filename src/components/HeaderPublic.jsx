// HeaderPublic.jsx - placeholder
import { Link } from "react-router-dom";
<<<<<<< HEAD
import "../styles/header.css";
=======
import "../styles/layout/base-layout.css";
import "../styles/components/header.css";
import profileImg from "/src/assets/profile.png";
import anouImg from "/src/assets/anou.jpg";
>>>>>>> 3725551 (Publiclayout)

export default function HeaderPublic() {
    return (
        <header className="header">
            <div className="header-logo">
                <Link className="header-logo-text" to="/">Learning Hub</Link>
            </div>
            <nav className="header-nav">
<<<<<<< HEAD
                <Link to="/Dashboard"><p>Trang chủ</p></Link>
=======
                <Link to="/Dashboard">Trang chủ</Link>
>>>>>>> 3725551 (Publiclayout)
                <Link to="/about">Giới thiệu</Link>
                <Link to="/">Ngành học</Link>
                <Link to="/blog">Tin tức</Link>
                <Link to="/contact">Liên hệ</Link>
<<<<<<< HEAD
=======
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
>>>>>>> 3725551 (Publiclayout)
                <Link className="nav-login" to="/login">Đăng nhập</Link>
            </nav>
        </header>
    );
}
