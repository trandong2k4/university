// ForgotPassword.jsx - placeholder
import React, { useState } from "react";
import { Link } from "react-router-dom";

export default function ForgotPassword() {
  const [email, setEmail] = useState("");

  const onSubmit = (e) => {
    e.preventDefault();
    // Mock: chỉ alert
    alert(`Đã gửi liên kết đặt lại mật khẩu tới: ${email || "(chưa nhập email)"}`);
    setEmail("");
  };

  return (
    <div className="container mx-auto px-4 py-12 flex justify-center">
      <div className="w-full max-w-md bg-white rounded-2xl border shadow-sm p-6">
        <h1 className="text-2xl font-bold mb-6">Quên mật khẩu (mock)</h1>

        <form onSubmit={onSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-1">Email</label>
            <input
              type="email"
              className="w-full rounded-lg border px-3 py-2"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@example.com"
            />
          </div>

        <button className="w-full rounded-lg bg-blue-600 text-white py-2 font-medium">
            Gửi liên kết đặt lại
          </button>
        </form>

        <div className="text-sm mt-4">
          <Link to="/login" className="text-blue-600 hover:underline">
            Quay lại đăng nhập
          </Link>
        </div>
      </div>
    </div>
  );
}
