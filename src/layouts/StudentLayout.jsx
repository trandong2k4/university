import React from "react";
import { Outlet } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import HeaderPrivate from "../components/HeaderPrivate";
import Sidebar from "../components/Sidebar";
import Footer from "../components/Footer";
import Chatbot from "../components/Chatbot";
<<<<<<< HEAD
import "../styles/student-layout.css"; // CSS riêng cho layout này
=======
import "../styles/layout/base-layout.css"; // Import CSS chung
import "../styles/layout/student-layout.css"; // CSS riêng
import imgStudent from "/src/assets/learning.jpg"; // Import image
>>>>>>> 3725551 (Publiclayout)

export default function StudentLayout() {
  const { user } = useAuth(); // { name, role }
  const userRole = user?.role || "STUDENT";

  return (
    <div className="student-layout">
<<<<<<< HEAD
      <HeaderPrivate userRole={userRole} className="student-layout-header" />

=======

      <HeaderPrivate userRole={userRole} className="student-layout-header" />

      <div className="layout-img">
        <img src={imgStudent} alt="Errol" />
      </div>

>>>>>>> 3725551 (Publiclayout)
      <div className="student-layout-body">
        <Sidebar userRole={userRole} className="student-sidebar-container" />
        <main className="student-layout-main">
          <Outlet />
        </main>
      </div>
<<<<<<< HEAD
      <Chatbot />
      <Footer className="student-layout-footer" />
=======

      <Chatbot />

      <Footer className="student-layout-footer" />

>>>>>>> 3725551 (Publiclayout)
    </div>
  );
}
