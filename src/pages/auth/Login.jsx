// Login.jsx
import React, { useState } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
<<<<<<< HEAD
import "../../styles/login.css";
=======
import "../../styles/auth/login.css";
import umsImage from "/src/assets/ums.png";
>>>>>>> 3725551 (Publiclayout)

export default function Login() {
    const navigate = useNavigate();
    const { login } = useAuth();
    const [params] = useSearchParams();
    const [username, setUsername] = useState("Nguyen Van A");
    const [password, setPassword] = useState("123456");
    const [role, setRole] = useState("student"); // student | teacher | accountant | admin

    const onSubmit = (e) => {
        e.preventDefault();
        login({ name: username || "Nguyen Van A", role });

        const redirect = params.get("redirect");
        if (redirect) return navigate(redirect, { replace: true });

        switch (role.toLowerCase()) {
            case "student":
                navigate("/student/profile", { replace: true });
                break;
            case "teacher":
                navigate("/teacher/students", { replace: true });
                break;
            case "accountant":
                navigate("/accountant/tuition", { replace: true });
                break;
            case "admin":
                navigate("/admin/students", { replace: true });
                break;
            default:
                navigate("/", { replace: true });
        }
    };

    return (
        <div className="login-container">
            <div className="login-card">
                <div className="login-links">
<<<<<<< HEAD
                    <h1 className="logo-text">
                        <Link to="/">Learning Hub</Link>
                    </h1>
                </div>

                <h2 className="login-title">Đăng nhập (mock)</h2>
=======
                    <Link to="/">
                        <img className="logo-img" src={umsImage} alt="Erroll" />
                    </Link>
                </div>

                <h2 className="login-title">Đăng nhập</h2>
>>>>>>> 3725551 (Publiclayout)

                <form onSubmit={onSubmit} className="login-form">
                    <div className="login-field">
                        <label className="login-label">Tên đăng nhập</label>
                        <input
                            className="login-input"
                            value={username}
                            onChange={(e) => setUsername(e.target.value)}
                            placeholder="Nhập tên đăng nhập"
                        />
                    </div>

                    <div className="login-field">
                        <label className="login-label">Mật khẩu</label>
                        <input
                            type="password"
                            className="login-input"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
<<<<<<< HEAD
                            placeholder="••••••••"
                        />
=======
                            placeholder="Nhập mật khẩu"
                        // autoComplete="current-password"
                        // name="password"
                        // aria-label="Mật khẩu"
                        />

>>>>>>> 3725551 (Publiclayout)
                    </div>

                    <div className="login-field">
                        <label className="login-label">Role (mock)</label>
                        <select
                            className="login-input"
                            value={role}
                            onChange={(e) => setRole(e.target.value)}
                        >
                            <option value="student">Student</option>
                            <option value="teacher">Teacher</option>
                            <option value="accountant">Accountant</option>
                            <option value="admin">Admin</option>
                        </select>
                        <p className="login-note">
                            Chọn role để test route phân quyền.
                        </p>
                    </div>

<<<<<<< HEAD
=======
                    <div className="user-note">
                        <input type="checkbox" className="user-checkbox" />
                        <p className="user-node-text">Ghi nhớ tài khoản</p>
                    </div>

>>>>>>> 3725551 (Publiclayout)
                    <button type="submit" className="login-btn">
                        Đăng nhập
                    </button>
                </form>

                <div className="login-links">
                    <Link to="/forgot-password">Quên mật khẩu?</Link>
<<<<<<< HEAD
                    <Link to="/register">Tạo tài khoản</Link>
=======
                    {/* <Link to="/register">Tạo tài khoản</Link> */}
>>>>>>> 3725551 (Publiclayout)
                </div>
            </div>
        </div>
    );
}
