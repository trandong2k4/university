import { Navigate, Outlet } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

export default function ProtectedRoute({ roles }) {
    const { user, loading } = useAuth();

    // ⭐ ĐANG LOAD → KHÔNG redirect
    if (loading) return <div className="loading">Đang tải...</div>;

    // Sau khi load xong → kiểm tra đăng nhập
    if (!user) return <Navigate to="/auth/login" replace />;

    // Kiểm tra role
    if (roles && roles.length > 0) {
        const hasRole = roles.includes(user.role?.toUpperCase());
        if (!hasRole) return <Navigate to="/unauthorized" replace />;
    }

    return <Outlet />;
}
