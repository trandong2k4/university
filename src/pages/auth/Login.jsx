import React, { useState } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import "../../styles/auth/login.css";
import umsImage from "/src/assets/ums.png";

export default function Login() {
    const navigate = useNavigate();
    const { login } = useAuth(); // context lưu thông tin user
    const [params] = useSearchParams();

    // state input
    const [username, setUsername] = useState("");
    const [password, setPassword] = useState("");
    const [showPassword, setShowPassword] = useState(false);
    const [rememberMe, setRememberMe] = useState(false);

    const togglePassword = () => setShowPassword((prev) => !prev);

    const onSubmit = async (e) => {
        e.preventDefault();

        try {
            // gọi API đăng nhập
            const response = await fetch("http://localhost:8080/api/auth/login", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ username, password }),
            });

            if (!response.ok) {
                const msg = await response.text();
                throw new Error(msg || "Đăng nhập thất bại");
            }

            // dữ liệu server trả về (ví dụ { token, username, role })
            const data = await response.json();

            console.log("Login response:", data);

            // lưu thông tin vào context + storage
            login(data, rememberMe);

            // nếu có query redirect thì ưu tiên chuyển về đó
            const redirect = params.get("redirect");
            if (redirect) return navigate(redirect, { replace: true });

            // điều hướng theo role
            const routes = {
                student: "/student/dashboard",// hoa02
                teacher: "/teacher/dashboard",// quyen10
                accountant: "/accountant/tuition",// anh04
                tt: "/admin/dashboard",//dong01
                qldt: "/admin/dashboard",
                qllh: "/admin/dashboard",
                qlnd: "/admin/dashboard",
                gvmn: "/admin/dashboard",
                tvts: "/admin/dashboard",
                admin: "/admin/dashboard",
            };

            const roleKey = data.role?.toLowerCase();

            console.log(roleKey);
            navigate(routes[roleKey] || "/Dashboard", { replace: true });
        } catch (err) {
            console.error("Login error:", err);
            alert("Sai tài khoản hoặc mật khẩu!");
        }
    };

    return (
        <div className="login-container">
            <div className="login-card">
                <div className="login-logo">
                    <img className="logo-img" src={umsImage} alt="UMS Logo" />
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

                    <div className="user-note">
                        <input
                            type="checkbox"
                            className="user-checkbox"
                            checked={rememberMe}
                            onChange={(e) => setRememberMe(e.target.checked)}
                        />
                        <p className="user-node-text">Ghi nhớ tài khoản</p>
                    </div>

                    <button type="submit" className="login-btn">
                        Đăng nhập
                    </button>
                </form>

                <div className="login-links">
                    <Link to="/forgot-password">Quên mật khẩu?</Link>
                </div>
            </div>
        </div>
    );
}
