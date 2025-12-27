import React, { useState } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import "../../styles/auth/login.css";
import umsImage from "/src/assets/ums.png";
import apiClient from "/src/api/apiClient"; // ⚠️ Đảm bảo đúng đường dẫn

export default function Login() {
    const navigate = useNavigate();
    const { login } = useAuth(); // context lưu thông tin user
    const [params] = useSearchParams();

    // State input
    const [username, setUsername] = useState("");
    const [password, setPassword] = useState("");
    const [showPassword, setShowPassword] = useState(false);
    const [rememberMe, setRememberMe] = useState(false);
    const [loading, setLoading] = useState(false);

    const togglePassword = () => setShowPassword((prev) => !prev);

    const onSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);

        try {
            // Gọi API đăng nhập thông qua axios instance
            const response = await apiClient.post("/auth/login", {
                username,
                password,
            });

            const data = response.data;
            setRememberMe(params.get("remember") === "true");
            // Lưu thông tin vào context + storage
            login(data, rememberMe);

            // Điều hướng theo role
            const routes = {
                STUDENT: "/student/dashboard",
                TEACHER: "/teacher/dashboard",
                ACCOUNTANT: "/accountant/tuition",
                // ADMIN: "/auth/admin/login",
            };

            const roleKey = data.mrole?.toUpperCase();
            if (roleKey == "ADMIN") {
                alert("Chuyển đến luồng đăng nhập quản trị viên!");
                navigate("/auth/admin/login", { replace: true });
                return;
            }
            navigate(routes[roleKey] || "/", { replace: true });
        } catch (err) {
            console.error("Login error:", err);
            alert(
                err.response?.data?.message ||
                "Thông tin không hợp lệ. Vui lòng thử lại!"
            );
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="login-container">
            <div className="comeback-links">
                <Link className="comeback" to="/">
                    <p className="text-comeback">Trang Chủ</p>
                </Link>
            </div>

            <div className="login-card">
                <Link to="/">
                    <div className="login-logo">
                        <img className="logo-img" src={umsImage} alt="Erroll" />
                    </div>
                </Link>

                <h2 className="login-title">Đăng nhập</h2>

                <form onSubmit={onSubmit} className="login-form">
                    <div className="login-field">
                        <label className="login-label">Tên đăng nhập</label>
                        <input
                            className="login-input"
                            value={username}
                            onChange={(e) => setUsername(e.target.value)}
                            placeholder="Nhập tên đăng nhập"
                            required
                        />
                    </div>

                    <div className="login-field">
                        <label className="login-label">Mật khẩu</label>
                        <div className="input-wrapper">
                            <input
                                className="login-input"
                                type={showPassword ? "text" : "password"}
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                placeholder="Nhập mật khẩu"
                                required
                            />
                            <span className="toggle-icon" onClick={togglePassword}>
                                {showPassword ? "👁️" : "👁️‍🗨️"}
                            </span>
                        </div>
                    </div>

                    {/* <div className="user-note">
                        <input
                            type="checkbox"
                            className="user-checkbox"
                            checked={rememberMe}
                            onChange={(e) => setRememberMe(e.target.checked)}
                        />
                        <p className="user-node-text">Ghi nhớ tài khoản</p>
                    </div> */}

                    <button type="submit" className="login-btn" disabled={loading}>
                        {loading ? "Đang đăng nhập..." : "Đăng nhập"}
                    </button>
                </form>

                <div className="login-links">
                    <Link to="/forgot-password">Quên mật khẩu?</Link>
                </div>
            </div>
        </div>
    );
}
