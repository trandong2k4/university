// Sidebar.jsx - placeholder
import React from "react";
import { NavLink } from "react-router-dom";

const MENU = {
    STUDENT: [
        { to: "/student/profile", label: "Thông tin sinh viên" },
        { to: "/student/courses", label: "Môn học" },
        { to: "/student/schedule", label: "Lịch học" },
        { to: "/student/grades", label: "Điểm" },
        { to: "/student/tuition", label: "Học phí" },
        { to: "/student/register-credit", label: "Đăng ký tín chỉ" },
        { to: "/student/cancel-credit", label: "Hủy tín chỉ" },
    ],
    TEACHER: [
        { to: "/teacher/students", label: "Sinh viên" },
        { to: "/teacher/courses", label: "Môn học" },
        { to: "/teacher/schedule", label: "Lịch dạy" },
        { to: "/teacher/grades", label: "Xem điểm" },       // khớp AppRouter
        { to: "/teacher/update-grades", label: "Nhập điểm" },
    ],
    ACCOUNTANT: [
        { to: "/accountant/tuition", label: "Xem học phí" },
        { to: "/accountant/create", label: "Tạo học phí" },
        { to: "/accountant/update", label: "Cập nhật học phí" },
    ],
    ADMIN: [
        { to: "/admin/students", label: "Quản lý sinh viên" },
        { to: "/admin/courses", label: "Quản lý môn học" },
        { to: "/admin/schedule", label: "Quản lý lịch học" },
        { to: "/admin/grades", label: "Quản lý điểm" },
        { to: "/admin/tuition", label: "Quản lý học phí" },
        { to: "/admin/credits", label: "Quản lý tín chỉ" },
    ],
};

export default function Sidebar({ userRole }) {
    const role = (userRole || "").toUpperCase();
    const items = MENU[role] || [];

    const linkClass = ({ isActive }) =>
        `block px-3 py-2 rounded-md transition-colors ${isActive ? "bg-blue-600 text-white" : "text-gray-700 hover:bg-gray-200"
        }`;

    return (
        <aside className="w-64 bg-gray-100 h-[calc(100vh-64px)] sticky top-0 shadow-md p-4">
            <h2 className="font-semibold text-lg mb-4">Menu</h2>
            <nav className="space-y-1">
                {items.map((it) => (
                    <NavLink key={it.to} to={it.to} className={linkClass} end>
                        {it.label}
                    </NavLink>
                ))}
                {items.length === 0 && (
                    <div className="text-sm text-gray-500">Không có menu cho role này.</div>
                )}
            </nav>
        </aside>
    );
}
