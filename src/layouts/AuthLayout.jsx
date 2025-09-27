// src/layouts/AuthLayout.jsx
import React, { useState } from "react";
import { Outlet } from "react-router-dom";
import HeaderPrivate from "../components/HeaderPrivate";
import Sidebar from "../components/Sidebar";
import Chatbot from "../components/Chatbot";
import Footer from "../components/Footer";
import "../styles/layout/base-layout.css";
import "../styles/layout/auth-layout.css";
import Image from "../components/Image";

export default function AuthLayout({ userRole }) {
    const [sidebarOpen, setSidebarOpen] = useState(false);

    return (
        <div className="auth-layout">
            {/* <Image className="img" /> */}
            <HeaderPrivate
                userRole={userRole}
                onToggleSidebar={() => setSidebarOpen((o) => !o)}
            />

            <div className="auth-body">
                <Sidebar
                    userRole={userRole}
                    isOpen={sidebarOpen}
                    onClose={() => setSidebarOpen(false)}
                />

                <main className="auth-main">
                    <Outlet />
                </main>
            </div>

            <Chatbot />
            {/* <Footer /> */}
        </div>
    );
}
