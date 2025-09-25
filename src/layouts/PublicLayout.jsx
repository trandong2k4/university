import React from "react";
import { Outlet } from "react-router-dom";
import HeaderPublic from "../components/HeaderPublic";
import Footer from "../components/Footer";
import Chatbot from "../components/Chatbot";
import "../styles/public-layout.css"; // thêm CSS riêng

export default function PublicLayout() {
  return (
    <div className="public-layout">

      <HeaderPublic />
      <img class="img-all" src="/src/assets/learning.jpg" alt=""></img>
      <main className="public-layout-content">
        <Outlet /> {/* Render các trang public */}
      </main>

      <Chatbot />

      <Footer />
    </div>
  );
}
