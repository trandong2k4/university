import { createContext, useContext, useEffect, useState } from "react";

const AuthContext = createContext(null);
const STORAGE_KEY = "learninghub_auth_user";

const normalizeRole = (r) => (r ? String(r).trim().toUpperCase() : null);

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);

    // Load từ localStorage khi khởi tạo app
    useEffect(() => {
        try {
            const raw = localStorage.getItem(STORAGE_KEY);
            if (raw) {
                setUser(JSON.parse(raw));
            }
        } catch (e) {
            console.error("Error loading auth data:", e);
        }
        setLoading(false);
    }, []);

    const login = (data, rememberMe = true) => {
        // ⭐ Luôn lưu token để F5 không bị mất login
        const nextUser = {
            id: data.id ?? null,
            maid: data.maid,
            name: data.username ?? data.name ?? null,
            role: normalizeRole(data.mrole ?? data.role),
            token: data.token ?? null,
        };

        setUser(nextUser);
        // ⭐ Luôn lưu vào localStorage (hoặc dùng rememberMe nếu bạn muốn)
        localStorage.setItem(STORAGE_KEY, JSON.stringify(nextUser));
    };

    const logout = () => {
        setUser(null);
        localStorage.removeItem(STORAGE_KEY);
    };

    return (
        <AuthContext.Provider
            value={{
                user,
                loading,                // ⭐ Quan trọng
                login,
                logout,
                isAuthenticated: Boolean(user?.token),
            }}
        >
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => useContext(AuthContext);
