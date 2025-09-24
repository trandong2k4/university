// src/App.jsx
import React from "react";
import { BrowserRouter } from "react-router-dom";
import { AuthProvider } from "./context/AuthContext";
import PublicLayout from "./layouts/PublicLayout";
import AppRouter from "./router/AppRouter";
import "./index.css";

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <AppRouter />
      </AuthProvider>
    </BrowserRouter>
  );
}
