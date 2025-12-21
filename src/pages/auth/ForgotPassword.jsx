// ForgotPassword.jsx - placeholder
import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import "../../styles/auth/ForgotPassword.css";
import apiClient from "/src/api/apiClient";
import umsImage from "/src/assets/ums.png";

export default function ForgotPassword() {
  const [email, setEmail] = useState("");
  const [username, setUsername] = useState("");

  const onSubmit = (e) => {
    e.preventDefault();
    // Mock: chỉ alert
    alert(`Đã gửi liên kết đặt lại mật khẩu tới: ${email || "(chưa nhập email)"}`);
    setEmail(email);
  };

  return (
    <div className="fp-container">
      <div className="comeback-links">
        <Link className="comeback" to="/"><p className="text-comeback">Trang Chủ</p></Link>
      </div>
      <div className="fp-card">
        <Link to="/">
          <div className="login-logo">
            <img className="logo-img" src={umsImage} alt="Erroll" />
          </div>
        </Link>
        <h2 className="fp-title">Quên mật khẩu</h2>

        <form onSubmit={onSubmit} className="fp-form">
          <div className="fp-field" style={{ gap: "4px" }}>
            <label className="fp-label">Nhập tên đăng nhập</label>
            <input
              type="text"
              className="fp-input"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              placeholder="Tên đăng nhập của bạn"
            />
            <label className="fp-label">Nhập địa chỉ email</label>
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
          <Link to="/auth/login" className="fp-link">
            Quay lại đăng nhập
          </Link>
        </div>
      </div>
    </div>
  );
}
