// ProtectedRoute.jsx - placeholder
import { Navigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

// props:
// - element: component muốn render
// - roles: mảng các quyền được phép (ví dụ: ["ADMIN", "MANAGER"])
export default function ProtectedRoute({ element, roles }) {
    const { user } = useAuth();

    if (!user) {
        // chưa đăng nhập
        return <Navigate to="/login" replace />;
    }

    if (roles && roles.length > 0) {
        const hasRole = user.roles?.some((r) => roles.includes(r));
        if (!hasRole) {
            // không có quyền hợp lệ
            return <Navigate to="/unauthorized" replace />;
        }
    }

    return element;
}
