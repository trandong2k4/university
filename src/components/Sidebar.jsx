import React, { useState } from "react";
import { NavLink } from "react-router-dom";
import "../styles/layout/base-layout.css";
import "../styles/components/sidebar.css";

const MENU = {
    STUDENT: [
        { to: "/student/profile", label: "Thông tin sinh viên" },
        { to: "/student/courses", label: "Môn học" },
        { to: "/student/schedule", label: "Lịch học" },
        // { to: "/student/grades", label: "Chương trình học" },
        { to: "/student/grades", label: "Điểm" },
        { to: "/student/tuition", label: "Học phí" },
        { to: "/student/register-credit", label: "Đăng ký tín chỉ" },
        { to: "/student/cancel-credit", label: "Hủy tín chỉ" },
    ],
    TEACHER: [
        { to: "/teacher/students", label: "Sinh viên" },
        { to: "/teacher/courses", label: "Môn học" },
        { to: "/teacher/schedule", label: "Lịch dạy" },
        { to: "/teacher/grades", label: "Xem điểm" },
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
    const [open, setOpen] = useState(true);
    const role = (userRole || "").toUpperCase();
    const items = MENU[role] || [];

    const linkClass = ({ isActive }) =>
        `sidebar-link ${isActive ? "active" : ""}`;

    return (
        <aside className={`sidebar ${open ? "expanded" : "collapsed"}`}>
            <div className="sidebar-header">
                <h2 className="sidebar-title">Menu</h2>
                <button className="sidebar-toggle" onClick={() => setOpen(!open)}>
                    {open ? "«" : "»"}
                </button>
            </div>

            <nav className="sidebar-nav">
                {items.map((it) => (
                    <NavLink
                        key={it.to}
                        to={it.to}
                        className={linkClass}
                        end
                    >
                        {it.label}
                    </NavLink>
                ))}
                {items.length === 0 && (
                    <div className="sidebar-empty">Không có menu cho role này.</div>
                )}
            </nav>
        </aside>
    );
}