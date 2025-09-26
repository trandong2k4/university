import React from "react";
import { Outlet } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import HeaderPrivate from "../components/HeaderPrivate";
import Sidebar from "../components/Sidebar";
import Footer from "../components/Footer";
import Chatbot from "../components/Chatbot";
import "../styles/layout/base-layout.css"; //Import CSS chung
import "../styles/layout/admin-layout.css"; // CSS riêng

export default function AdminLayout() {
  const { user } = useAuth();
  const userRole = user?.role || "ADMIN";

  return (
    <div className="admin-layout">
      <HeaderPrivate userRole={userRole} />

      <div className="admin-layout-body">
        <Sidebar userRole={userRole} />
        <main className="admin-layout-content">
          <Outlet />
        </main>
      </div>

      <Chatbot />
      <Footer />
    </div>
  );
}
