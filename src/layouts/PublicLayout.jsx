// src/layouts/PublicLayout.jsx
import React from "react";
import { Outlet } from "react-router-dom";
import HeaderPublic from "../components/HeaderPublic";
import Footer from "../components/Footer";

export default function PublicLayout() {
  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      {/* Header */}
      <HeaderPublic />

      {/* Nội dung trang */}
      <main className="flex-1 container mx-auto px-4 py-6">
        <Outlet />
      </main>

      {/* Nút chatbot nổi (mock) */}
      <button
        type="button"
        className="fixed bottom-6 right-6 rounded-full shadow-lg p-4 bg-blue-600 text-white hover:bg-blue-700 transition"
        title="Chatbot AI (mock)"
      >
        🤖
      </button>

      {/* Footer */}
      <Footer />
    </div>
  );
}
