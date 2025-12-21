import React, { useState } from "react";
import { NavLink } from "react-router-dom";
import "../styles/layout/base-layout.css";
import "../styles/components/sidebar.css";
import {
    // NavLink,
    FaBars,
    FaBook,
    FaCalendarAlt,
    FaChalkboardTeacher,
    FaClipboardList,
    FaCog,
    FaMoneyBill,
    FaRegChartBar,
    FaChevronLeft,
    FaChevronRight,
    FaTimesCircle,
    FaUserCog,
    FaUserGraduate,
    FaUsers,
} from "react-icons/fa";

// Menu theo role – đã tối ưu, loại bỏ trùng lặp
const MENU = {
    STUDENT: [
        { to: "/student/schedule", label: "Lịch học", icon: <FaCalendarAlt /> },
        { to: "/student/profile", label: "Thông tin cá nhân", icon: <FaUserGraduate /> },
        { to: "/student/tuition", label: "Học phí", icon: <FaMoneyBill /> },
        { to: "/student/grades", label: "Điểm", icon: <FaRegChartBar /> },
        // { to: "/student/subjects", label: "Môn học", icon: <FaBook /> },
        { to: "/student/register-credit", label: "Đăng ký tín chỉ", icon: <FaClipboardList /> },
        { to: "/student/training-program", label: "Chương trình đào tạo", icon: <FaClipboardList /> },
        // { to: "/student/cancel-credit", label: "Hủy tín chỉ", icon: <FaTimesCircle /> },
    ],

    TEACHER: [
        { to: "/teacher/schedule", label: "Lịch dạy", icon: <FaCalendarAlt /> },
        { to: "/teacher/profile", label: "Thông tin cá nhân", icon: <FaUserGraduate /> },
        { to: "/teacher/students", label: "Sinh viên học tập", icon: <FaUsers /> },
        { to: "/teacher/students", label: "Lớp học phần", icon: <FaUsers /> },
        { to: "/teacher/documents", label: "Tài liệu môn học", icon: <FaBook /> },
        { to: "/teacher/grades", label: "Điểm học tập", icon: <FaRegChartBar /> },
        { to: "/teacher/courses", label: "Môn giảng dạy", icon: <FaBook /> },

    ],
    //  TEACHER: [
    //     { to: "/teacher/schedule", label: "Lịch dạy", icon: <FaCalendarAlt /> },
    //     { to: "/teacher/profile", label: "Thông tin cá nhân", icon: <FaUserGraduate /> },
    //     { to: "/teacher/classes", label: "Lớp học phần", icon: <FaUsers /> },
    //     { to: "/teacher/students", label: "Danh sách sinh viên", icon: <FaUsers /> },
    //     { to: "/teacher/documents", label: "Tài liệu môn học", icon: <FaBook /> },
    //     { to: "/teacher/grades", label: "Nhập điểm", icon: <FaRegChartBar /> },
    //     { to: "/teacher/courses", label: "Môn giảng dạy", icon: <FaBook /> },
    // ],

    // ACCOUNTANT: [
    //     { to: "/accountant/tuition", label: "Quản lý học phí", icon: <FaMoneyBill /> },
    //     { to: "/accountant/invoices", label: "Hóa đơn", icon: <FaClipboardList /> },
    //     { to: "/accountant/reports", label: "Báo cáo tài chính", icon: <FaRegChartBar /> },
    // ],

    ACCOUNTANT: [
        { to: "/accountant/tuition", label: "Xem học phí", icon: <FaMoneyBill /> },
        { to: "/accountant/create", label: "Tạo học phí", icon: <FaClipboardList /> },
        { to: "/accountant/update", label: "Cập nhật học phí", icon: <FaCog /> },
        { to: "/accountant/repost", label: "Báo cáo thống kê", icon: <FaCog /> },
    ],

    ADMIN: [
        { to: "/admin/dashboard", label: "Tổng quan", icon: <FaRegChartBar /> },
        // { to: "/admin/manage_truong", label: "Quản lý trường", icon: <FaClipboardList /> },
        { to: "/admin/manage_khoa", label: "Quản lý khoa", icon: <FaClipboardList /> },
        { to: "/admin/manage_nganh", label: "Quản lý ngành", icon: <FaClipboardList /> },
        { to: "/admin/manage_courses", label: "Quản lý môn học", icon: <FaBook /> },
        { to: "/admin/manage_schedule", label: "Quản lý lịch học", icon: <FaCalendarAlt /> },
        { to: "/admin/manage_partial_class", label: "Quản lý lớp học phần", icon: <FaCalendarAlt /> },
        { to: "/admin/manage_user", label: "Quản lý tài khoản", icon: <FaClipboardList /> },
        { to: "/admin/manage_students", label: "Quản lý sinh viên", icon: <FaUsers /> },
        { to: "/admin/manage_employees", label: "Quản lý nhân viên", icon: <FaChalkboardTeacher /> },
        { to: "/admin/manage_credits", label: "Quản lý tín chỉ", icon: <FaClipboardList /> },
        { to: "/admin/manage_grades", label: "Quản lý điểm", icon: <FaRegChartBar /> },
        { to: "/admin/manage_tuition", label: "Quản lý học phí", icon: <FaMoneyBill /> },
        { to: "/admin/manage_role", label: "Quản lý phân quyền", icon: <FaClipboardList /> },
        // { to: "/admin/manage_permission", label: "Quản lý phân quyền", icon: <FaClipboardList /> },
    ],
};

export default function Sidebar({ userRole }) {
    const [open, setOpen] = useState(true);
    const role = (userRole || "").toUpperCase();
    const items = MENU[role] || [];

    const linkClass = ({ isActive }) => `sidebar-link ${isActive ? "active" : ""}`;

    return (
        <aside className={`sidebar ${open ? "expanded" : "collapsed"}`}>
            <div className="sidebar-header">
                <h2 className="sidebar-title">
                    {open ? "Learning" : <FaBars />}
                </h2>
                <button
                    className="sidebar-toggle"
                    onClick={() => setOpen(!open)}
                    aria-label={open ? "Thu gọn" : "Mở rộng"}
                >
                    {open ? <FaChevronLeft /> : <FaChevronRight />}
                </button>
            </div>

            <nav className="sidebar-nav">
                {items.length > 0 ? (
                    items.map((item) => (
                        <NavLink
                            key={item.to}
                            to={item.to}
                            className={linkClass}
                            end
                            aria-label={item.label}
                        >
                            <span className="sidebar-icon">{item.icon}</span>
                            {open && <span className="sidebar-label">{item.label}</span>}
                        </NavLink>
                    ))
                ) : open ? (
                    <div className="sidebar-empty">
                        Không có menu cho vai trò này
                    </div>
                ) : null}
            </nav>
        </aside>
    );
}