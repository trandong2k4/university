// ForgotPassword.jsx - placeholder
import React, { useState } from "react";
import { Link } from "react-router-dom";
import "../../styles/auth/ForgotPassword.css";

export default function ForgotPassword() {
  const [email, setEmail] = useState("");

  const onSubmit = (e) => {
    e.preventDefault();
    // Mock: chỉ alert
    alert(`Đã gửi liên kết đặt lại mật khẩu tới: ${email || "(chưa nhập email)"}`);
    setEmail("");
  };

  return (
    <div className="fp-container">
      <div className="fp-card">

        <div className="login-links">
          <h1>
            <Link>Learning Hub</Link>
          </h1>
        </div>
        <h2 className="fp-title">Quên mật khẩu (mock)</h2>

        <form onSubmit={onSubmit} className="fp-form">
          <div className="fp-field">
            <label className="fp-label">Email</label>
            <input
              type="email"
              className="fp-input"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@example.com"
            />
          </div>

          <button className="fp-button">Gửi liên kết đặt lại</button>
        </form>

        <div className="fp-footer">
          <Link to="/login" className="fp-link">
            Quay lại đăng nhập
          </Link>
        </div>
      </div>
    </div>
  );
}
