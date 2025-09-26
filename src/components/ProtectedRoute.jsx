// ProtectedRoute.jsx
import { Navigate, Outlet } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
<<<<<<< HEAD
=======
import "../styles/layout/base-layout.css";
>>>>>>> 3725551 (Publiclayout)

export default function ProtectedRoute({ roles }) {
    const { user } = useAuth();

    if (!user) return <Navigate to="/login" replace />;

    if (roles && roles.length > 0) {
        const hasRole = roles.includes(user.role?.toUpperCase());
        if (!hasRole) return <Navigate to="/unauthorized" replace />;
    }

    return <Outlet />; // render các route con
}
