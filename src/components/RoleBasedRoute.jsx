// RoleBasedRoute.jsx - placeholder
import { Navigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

/**
 * RoleBasedRoute
 * @param {ReactElement} element - Component muốn render
 * @param {Array<string>} allowedRoles - Danh sách role được phép
 */
export default function RoleBasedRoute({ element, allowedRoles }) {
    const { user } = useAuth();

    if (!user) {
        // chưa đăng nhập
        return <Navigate to="/login" replace />;
    }

    // kiểm tra vai trò
    const hasRole = user.roles?.some((role) => allowedRoles.includes(role));

    if (!hasRole) {
        return <Navigate to="/unauthorized" replace />;
    }

    return element;
}
