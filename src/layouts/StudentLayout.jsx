import React from "react";
import { Outlet } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import HeaderPrivate from "../components/HeaderPrivate";
import Sidebar from "../components/Sidebar";
import Footer from "../components/Footer";
import Chatbot from "../components/Chatbot";
import "../styles/layout/base-layout.css"; // Import CSS chung
import "../styles/layout/student-layout.css"; // CSS riêng

export default function StudentLayout() {
  const { user } = useAuth(); // { name, role }
  const userRole = user?.role || "STUDENT";

  return (
    <div className="student-layout">

      <HeaderPrivate userRole={userRole} className="student-layout-header" />

      <div className="student-layout-body">
        <Sidebar userRole={userRole} className="student-sidebar-container" />
        <main className="student-layout-main">
          <Outlet />
        </main>
      </div>

      <Chatbot />

      <Footer className="student-layout-footer" />
    </div >
  );
}
