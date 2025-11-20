// src/layouts/AuthLayout.jsx
import React, { useState } from "react";
import { Outlet } from "react-router-dom";
import Chatbot from "../components/Chatbot";
import Footer from "../components/Footer";
import "../styles/layout/base-layout.css";
import "../styles/layout/auth-layout.css";
import Image from "../components/Image";

export default function AuthLayout() {
    const [sidebarOpen, setSidebarOpen] = useState(false);

    return (
        <div className="auth-layout">
            <Image className="img" />

            <div className="auth-body">
                <main className="auth-main">
                    <Outlet />
                </main>
            </div>

            <Chatbot />
            {/* <Footer /> */}
        </div>
    );
}
