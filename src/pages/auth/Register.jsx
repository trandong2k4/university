// Register.jsx - placeholder
import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";

export default function Register() {
  const navigate = useNavigate();
  const { login } = useAuth();
  const [name, setName] = useState("Nguyen Van A");
  const [email, setEmail] = useState("a@example.com");
  const [password, setPassword] = useState("123456");
  const [role, setRole] = useState("student");

  const onSubmit = (e) => {
    e.preventDefault();
    // Mock: sau khi "đăng ký", tự đăng nhập luôn
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
    <div className="container mx-auto px-4 py-12 flex justify-center">
      <div className="w-full max-w-md bg-white rounded-2xl border shadow-sm p-6">
        <h1 className="text-2xl font-bold mb-6">Đăng ký (mock)</h1>

        <form onSubmit={onSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-1">Họ và tên</label>
            <input
              className="w-full rounded-lg border px-3 py-2"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Nguyen Van A"
            />
          </div>

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

          <div>
            <label className="block text-sm font-medium mb-1">Mật khẩu</label>
            <input
              type="password"
              className="w-full rounded-lg border px-3 py-2"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">Role (mock)</label>
            <select
              className="w-full rounded-lg border px-3 py-2"
              value={role}
              onChange={(e) => setRole(e.target.value)}
            >
              <option value="student">Student</option>
              <option value="teacher">Teacher</option>
              <option value="accountant">Accountant</option>
              <option value="admin">Admin</option>
            </select>
          </div>

          <button className="w-full rounded-lg bg-blue-600 text-white py-2 font-medium">
            Đăng ký
          </button>
        </form>

        <div className="text-sm mt-4">
          Đã có tài khoản?{" "}
          <Link to="/login" className="text-blue-600 hover:underline">
            Đăng nhập
          </Link>
        </div>
      </div>
    </div>
  );
}
