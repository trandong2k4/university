// Login.jsx
import React, { useState } from 'react';
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import "../../styles/auth/login.css";
import umsImage from "/src/assets/ums.png";





export default function Login() {
    const navigate = useNavigate();
    const { login } = useAuth();
    const [params] = useSearchParams();
    const [username, setUsername] = useState("Nguyen Van A");
    const [password, setPassword] = useState("123456");
    const [role, setRole] = useState("student"); // student | teacher | accountant | admin
    const [showPassword, setShowPassword] = useState(false);

    const togglePassword = (e) => {
        e.preventDefault(); // tránh submit form khi nhấn nút
        setShowPassword(prev => !prev);
    };


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
                <div className="login-logo">
                    <img className="logo-img" src={umsImage} alt="Erroll" />
                </div>

                <h2 className="login-title">Đăng nhập</h2>

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
                        <div className="input-wrapper">
                            <input
                                className="login-input"
                                type={showPassword ? 'text' : 'password'}
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                placeholder="Nhập mật khẩu"
                            />
                            <span className="toggle-icon" onClick={togglePassword}>
                                {showPassword ? '👁️' : '👁️‍🗨️'}
                            </span>
                        </div>

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

                    <div className="user-note">
                        <input type="checkbox" className="user-checkbox" />
                        <p className="user-node-text">Ghi nhớ tài khoản</p>
                    </div>

                    <button type="submit" className="login-btn">
                        Đăng nhập
                    </button>
                </form >

                <div className="login-links">
                    <Link to="/forgot-password">Quên mật khẩu?</Link>
                    {/* <Link to="/register">Tạo tài khoản</Link> */}
                </div >
            </div >
        </div >
    );
}
