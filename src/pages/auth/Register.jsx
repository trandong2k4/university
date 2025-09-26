// Register.jsx
import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
<<<<<<< HEAD
import "../../styles/register.css";
=======
import "../../styles/auth/register.css";
>>>>>>> 3725551 (Publiclayout)

export default function Register() {
  const navigate = useNavigate();
  const { login } = useAuth();
  const [name, setName] = useState("Nguyen Van A");
  const [email, setEmail] = useState("a@example.com");
  const [password, setPassword] = useState("123456");
  const [role, setRole] = useState("student");

  const onSubmit = (e) => {
    e.preventDefault();
    login({ name, role });

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
    <div className="register-container">
      <div className="register-card">

        <div className="login-links">
          <h1 >
            <Link to="">Learning Hub</Link>
          </h1>
        </div>
        <h2 className="register-title">Đăng ký (mock)</h2>

        <form onSubmit={onSubmit} className="register-form">
          <div className="register-field">
            <label className="register-label">Họ và tên</label>
            <input
              className="register-input"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Nguyen Van A"
            />
          </div>

          <div className="register-field">
            <label className="register-label">Email</label>
            <input
              type="email"
              className="register-input"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@example.com"
            />
          </div>

          <div className="register-field">
            <label className="register-label">Mật khẩu</label>
            <input
              type="password"
              className="register-input"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
            />
          </div>

          <div className="register-field">
            <label className="register-label">Role (mock)</label>
            <select
              className="register-input"
              value={role}
              onChange={(e) => setRole(e.target.value)}
            >
              <option value="student">Student</option>
              <option value="teacher">Teacher</option>
              <option value="accountant">Accountant</option>
              <option value="admin">Admin</option>
            </select>
          </div>

          <button type="submit" className="register-btn">
            Đăng ký
          </button>
        </form>

        <div className="register-footer">
          Đã có tài khoản?{" "}
          <Link to="/login">Đăng nhập</Link>
        </div>
      </div>
    </div>
  );
}
