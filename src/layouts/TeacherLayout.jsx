// TeacherLayout.jsx - placeholder
import React from "react";
import { Outlet } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import HeaderPrivate from "../components/HeaderPrivate";
import Sidebar from "../components/Sidebar";
import Footer from "../components/Footer";

export default function TeacherLayout() {
  const { user } = useAuth();
  const userRole = user?.role || "TEACHER";

  return (
    <div className="min-h-screen flex flex-col">
      <HeaderPrivate userRole={userRole} />

      <div className="flex flex-1">
        <Sidebar userRole={userRole} />
        <main className="flex-1 p-6 bg-gray-50">
          <Outlet />
        </main>
      </div>

      <Footer />
    </div>
  );
}
