import React from "react";
import { Outlet } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import HeaderPrivate from "../components/HeaderPrivate";
import Sidebar from "../components/Sidebar";
import Footer from "../components/Footer";
import Chatbot from "../components/Chatbot";
<<<<<<< HEAD
import "../styles/accountant-layout.css"; // import css riêng
=======
import "../styles/layout/base-layout.css"; // Css chung
import "../styles/layout/accountant-layout.css"; // Css riêng

>>>>>>> 3725551 (Publiclayout)

export default function AccountantLayout() {
  const { user } = useAuth();
  const userRole = user?.role || "ACCOUNTANT";

  return (
<<<<<<< HEAD
    <div className="accountant-layout">
      <HeaderPrivate userRole={userRole} />

      <div className="accountant-layout-body">
        <Sidebar userRole={userRole} />
        <main className="accountant-layout-content">
          <Outlet />
        </main>
      </div>

      <Chatbot className="accountant-chatbot-btn" />

      <Footer />
=======
    <div className="lauout-container">
      <div className="accountant-layout">
        <HeaderPrivate userRole={userRole} />

        <div className="accountant-layout-body">
          <Sidebar userRole={userRole} />
          <main className="accountant-layout-content">
            <Outlet />
          </main>
        </div>

        <Chatbot className="accountant-chatbot-btn" />

        <Footer />
      </div>
>>>>>>> 3725551 (Publiclayout)
    </div>
  );
}
