// AuthContext.jsx - placeholder
import React, { createContext, useContext, useEffect, useMemo, useState } from "react";

/**
 * AuthContext mock cho giai đoạn chưa có backend.
 * - user: { name, role }   // role chấp nhận viết thường, sẽ được chuẩn hoá lên UPPERCASE
 * - login({ name, role })
 * - logout()
 * - switchRole(role)       // đổi role nhanh để test ProtectedRoute
 * - hasRole(...roles)      // tiện kiểm tra trong component
 * - isAuthenticated
 *
 * Mặc định: user = { name: "Nguyen Van A", role: "STUDENT" }
 */

const AuthContext = createContext(null);
const STORAGE_KEY = "learninghub_auth_user";
const normalizeRole = (r) => (r ? String(r).trim().toUpperCase() : null);

const defaultUser = { name: "Nguyen Van A", role: "STUDENT" };

export const AuthProvider = ({ children }) => {
    // Khởi tạo từ localStorage (nếu có), không thì dùng defaultUser
    const [user, setUser] = useState(() => {
        try {
            const raw = localStorage.getItem(STORAGE_KEY);
            if (!raw) return defaultUser;
            const parsed = JSON.parse(raw);
            return {
                name: parsed?.name || defaultUser.name,
                role: normalizeRole(parsed?.role) || defaultUser.role,
            };
        } catch {
            return defaultUser;
        }
    });

    const role = user?.role ?? null;
    const isAuthenticated = Boolean(role);

    const login = ({ name = defaultUser.name, role = defaultUser.role } = {}) => {
        const normalized = normalizeRole(role);
        const nextUser = { name, role: normalized };
        setUser(nextUser);
    };

    const switchRole = (newRole) => {
        const normalized = normalizeRole(newRole);
        setUser((prev) => ({ ...(prev ?? defaultUser), role: normalized }));
    };

    const logout = () => setUser(null);

    const hasRole = (...roles) => {
        const set = roles.map(normalizeRole);
        return set.includes(role);
    };

    // Persist
    useEffect(() => {
        if (user) localStorage.setItem(STORAGE_KEY, JSON.stringify(user));
        else localStorage.removeItem(STORAGE_KEY);
    }, [user]);

    const value = useMemo(
        () => ({ user, role, isAuthenticated, login, logout, switchRole, hasRole }),
        [user, role, isAuthenticated]
    );

    return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => useContext(AuthContext);
