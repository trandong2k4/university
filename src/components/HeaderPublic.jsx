// HeaderPublic.jsx - placeholder
import { Link } from "react-router-dom";


export default function HeaderPublic() {
    return (
        <header className="bg-blue-600 text-white p-4 flex justify-between items-center shadow-md">
            <div className="font-bold text-xl">Learning Hub</div>
            <nav className="space-x-6 hidden md:flex">
                <Link to="/">Trang chủ</Link>
                <Link to="/gioi-thieu">Giới thiệu</Link>
                <Link to="/nganh-hoc">Ngành học</Link>
                <Link to="/tin-tuc">Tin tức</Link>
                <Link to="/lien-he">Liên hệ</Link>
                <Link to="/login">Đăng nhập</Link>
            </nav>
        </header>
    );
}

