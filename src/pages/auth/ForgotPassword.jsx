// ForgotPassword.jsx - placeholder
import React, { useState } from "react";
import { Link } from "react-router-dom";
import "../../styles/auth/ForgotPassword.css";
import umsImage from "/src/assets/ums.png";

export default function ForgotPassword() {
  const [email, setEmail] = useState("");
  const [sdt, setSdt] = useState("");

  const onSubmit = (e) => {
    e.preventDefault();
    // Mock: chỉ alert
    alert(`Đã gửi liên kết đặt lại mật khẩu tới: ${email || "(chưa nhập email)"}`);
    setEmail(email);
  };

  return (
    <div className="fp-container">
      <div className="fp-card">

        <div className="login-logo">
          <img className="logo-img" src={umsImage} alt="Erroll" />
        </div>
        <h2 className="fp-title">Quên mật khẩu</h2>

        <form onSubmit={onSubmit} className="fp-form">
          <div className="fp-field" style={{ gap: "4px" }}>
            <label className="fp-label">Nhập địa chỉ email</label>
            <input
              type="email"
              className="fp-input"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@example.com"
            />
            <label className="fp-label">Nhập số điện thoại</label>
            <input
              type="text"
              className="fp-input"
              value={(s) => setSdt(s.target.value)}
              // onChange={(e) => setEmail(e.target.value)}
              placeholder="Số điện thoại của bạn"
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
