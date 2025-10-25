import React, { useState } from "react";
import { NavLink } from "react-router-dom";
import { FaUserGraduate, FaBook, FaCalendarAlt, FaRegChartBar, FaMoneyBill, FaClipboardList, FaTimesCircle, FaUsers, FaChalkboardTeacher, FaUserCog, FaCog, FaBars } from "react-icons/fa";
import "../styles/layout/base-layout.css";
import "../styles/components/sidebar.css";

// Menu có icon
const MENU = {
    STUDENT: [
        { to: "/student/profile", label: "Thông tin sinh viên", icon: <FaUserGraduate /> },
        { to: "/student/courses", label: "Môn học", icon: <FaBook /> },
        { to: "/student/schedule", label: "Lịch học", icon: <FaCalendarAlt /> },
        { to: "/student/grades", label: "Điểm", icon: <FaRegChartBar /> },
        { to: "/student/tuition", label: "Học phí", icon: <FaMoneyBill /> },
        { to: "/student/register-credit", label: "Đăng ký tín chỉ", icon: <FaClipboardList /> },
        // { to: "/student/cancel-credit", label: "Hủy tín chỉ", icon: <FaTimesCircle /> },
    ],

    TEACHER: [
        { to: "/teacher/students", label: "Danh sách sinh viên", icon: <FaUsers /> },
        { to: "/teacher/courses", label: "Môn giảng dạy", icon: <FaBook /> },
        { to: "/teacher/schedule", label: "Lịch dạy", icon: <FaCalendarAlt /> },
        { to: "/teacher/grades", label: "Xem điểm", icon: <FaRegChartBar /> },
        { to: "/teacher/update-grades", label: "Nhập điểm", icon: <FaClipboardList /> },
    ],

    ACCOUNTANT: [
        { to: "/accountant/tuition", label: "Xem học phí", icon: <FaMoneyBill /> },
        { to: "/accountant/create", label: "Tạo học phí", icon: <FaClipboardList /> },
        { to: "/accountant/update", label: "Cập nhật học phí", icon: <FaCog /> },
    ],

    ADMIN: [
        { to: "/admin/students", label: "Quản lý sinh viên", icon: <FaUsers /> },
        { to: "/admin/employees", label: "Quản lý nhân viên", icon: <FaUsers /> },
        { to: "/admin/nganh", label: "Quản lý ngành", icon: <FaClipboardList /> },
        { to: "/admin/khoa", label: "Quản lý khoa", icon: <FaClipboardList /> },
        // { to: "/admin/truong", label: "Quản lý trường", icon: <FaClipboardList /> },
        { to: "/admin/courses", label: "Quản lý môn học", icon: <FaBook /> },
        { to: "/admin/schedule", label: "Quản lý lịch học", icon: <FaCalendarAlt /> },
        // { to: "/admin/grades", label: "Quản lý điểm", icon: <FaRegChartBar /> },
        // { to: "/admin/tuition", label: "Quản lý học phí", icon: <FaMoneyBill /> },
        { to: "/admin/credits", label: "Quản lý tín chỉ", icon: <FaClipboardList /> },
        { to: "/admin/user", label: "Quản lý người dùng", icon: <FaClipboardList /> },
        // { to: "/admin/role", label: "Quản lý phân quyền", icon: <FaClipboardList /> },
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
            {/* Header */}
            <div className="sidebar-header">
                <h2 className="sidebar-title">
                    {open ? "Menu" : <FaBars />}
                </h2>
                <button
                    className="sidebar-toggle"
                    onClick={() => setOpen(!open)}
                    aria-label="Toggle Sidebar"
                >
                    {open ? "«" : "»"}
                </button>
            </div>

            {/* Navigation */}
            <nav className="sidebar-nav">
                {items.map((it) => (
                    <NavLink key={it.to} to={it.to} className={linkClass} end>
                        <span className="sidebar-icon">{it.icon}</span>
                        {open && <span className="sidebar-label">{it.label}</span>}
                    </NavLink>
                ))}
                {items.length === 0 && open && (
                    <div className="sidebar-empty">Không có menu cho role này.</div>
                )}
            </nav>
        </aside>
    );
}
