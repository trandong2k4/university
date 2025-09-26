// src/App.jsx
import React from "react";
import { BrowserRouter } from "react-router-dom";
import { AuthProvider } from "./context/AuthContext";
import AppRouter from "./router/AppRouter";
import PublicLayout from "./layouts/PublicLayout";
import "./App.css"; // nhớ import CSS layout

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <div className="app">
          <AppRouter />
        </div>
      </AuthProvider>
    </BrowserRouter>
  );
}
