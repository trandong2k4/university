// Login.jsx - placeholder
import React, { useState } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";

export default function Login() {
    const navigate = useNavigate();
    const { login } = useAuth();
    const [params] = useSearchParams();
    const [username, setUsername] = useState("Nguyen Van A");
    const [password, setPassword] = useState("123456");
    const [role, setRole] = useState("student"); // student | teacher | accountant | admin

    const onSubmit = (e) => {
        e.preventDefault();
        // Giả lập login: chỉ set user vào context
        login({ name: username || "Nguyen Van A", role });

        // Điều hướng theo role để test ProtectedRoute
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
        <div className="container mx-auto px-4 py-12 flex justify-center">
            <div className="w-full max-w-md bg-white rounded-2xl border shadow-sm p-6">
                <h1 className="text-2xl font-bold mb-6">Đăng nhập (mock)</h1>

                <form onSubmit={onSubmit} className="space-y-4">
                    <div>
                        <label className="block text-sm font-medium mb-1">Tên đăng nhập</label>
                        <input
                            className="w-full rounded-lg border px-3 py-2"
                            value={username}
                            onChange={(e) => setUsername(e.target.value)}
                            placeholder="Nhập tên đăng nhập"
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
                        <p className="text-xs text-gray-500 mt-1">
                            Chọn role để test route phân quyền.
                        </p>
                    </div>

                    <button
                        type="submit"
                        className="w-full rounded-lg bg-blue-600 text-white py-2 font-medium"
                    >
                        Đăng nhập
                    </button>
                </form>

                <div className="flex justify-between text-sm mt-4">
                    <Link to="/forgot-password" className="text-blue-600 hover:underline">
                        Quên mật khẩu?
                    </Link>
                    <Link to="/register" className="text-blue-600 hover:underline">
                        Tạo tài khoản
                    </Link>
                </div>
            </div>
        </div>
    );
}
