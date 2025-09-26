import React from "react";
import { Outlet } from "react-router-dom";
import HeaderPublic from "../components/HeaderPublic";
import Image from "../components/Image";
import Footer from "../components/Footer";
import Chatbot from "../components/Chatbot";
import "../styles/layout/base-layout.css"; //Import CSS chung
import "../styles/layout/public-layout.css"; // Import CSS riêng

export default function PublicLayout() {
  return (
    <div className="public-layout">
      <Image />
      <div className="public-header">
        <HeaderPublic />
      </div>
      <div className="public-layout-content">
        <main >
          <Outlet /> {/* Render các trang public */}
        </main>
      </div>

      <div className="public-chatbot" >
        <Chatbot />
      </div>
      <div className="public-footer" >
        <Footer />
      </div>
    </div >
  );
}
