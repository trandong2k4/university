import React from "react";
import { Outlet } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import HeaderPrivate from "../components/HeaderPrivate";
import Sidebar from "../components/Sidebar";
import Footer from "../components/Footer";
import Chatbot from "../components/Chatbot";
import "../styles/layout/base-layout.css"; //Import CSS chung
import "../styles/layout/teacher-layout.css"; // CSS riêng cho layout giảng viên

export default function TeacherLayout() {
  const { user } = useAuth();
  const userRole = user?.role || "TEACHER";

  return (
    <div className="teacher-layout">
      <HeaderPrivate userRole={userRole} className="teacher-layout-header" />

      <div className="teacher-layout-body">
        <Sidebar userRole={userRole} className="teacher-sidebar-container" />
        <main className="teacher-layout-main">
          <Outlet />
        </main>
      </div>

      <Chatbot />

      <Footer className="teacher-layout-footer" />
    </div>
  );
}
