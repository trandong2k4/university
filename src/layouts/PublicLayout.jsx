import React from "react";
import { Outlet } from "react-router-dom";
import HeaderPublic from "../components/HeaderPublic";
<<<<<<< HEAD
import Footer from "../components/Footer";
import Chatbot from "../components/Chatbot";
import "../styles/public-layout.css"; // thêm CSS riêng
import imglearning from "/src/assets/learning.jpg";
=======
import Image from "../components/Image";
import Footer from "../components/Footer";
import Chatbot from "../components/Chatbot";
import "../styles/layout/base-layout.css"; //Import CSS chung
import "../styles/layout/public-layout.css"; // Import CSS riêng
>>>>>>> 3725551 (Publiclayout)

export default function PublicLayout() {
  return (
    <div className="public-layout">
<<<<<<< HEAD

      <HeaderPublic />
      <div className="img-all">
        <img src={imglearning} alt="Errol" />
      </div>
      <main className="public-layout-content">
        <Outlet /> {/* Render các trang public */}
      </main>

      <Chatbot />

      <Footer />
=======
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
>>>>>>> 3725551 (Publiclayout)
    </div>
  );
}
