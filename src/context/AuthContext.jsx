import React, { createContext, useContext, useEffect, useState } from "react";

const AuthContext = createContext(null);
const STORAGE_KEY = "learninghub_auth_user";
const normalizeRole = (r) => (r ? String(r).trim().toUpperCase() : null);

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(() => {
        try {
            const raw = localStorage.getItem(STORAGE_KEY);
            if (!raw) return null;
            const parsed = JSON.parse(raw);
            return {
                id: parsed.id ?? null,
                name: parsed.name ?? null,
                role: normalizeRole(parsed.role),
                token: parsed.token ?? null,
            };
        } catch {
            return null;
        }
    });

    const login = (data, rememberMe = false) => {
        const nextUser = {
            id: data.id ?? null,
            name: data.username ?? data.name ?? null,
            role: normalizeRole(data.mrole ?? data.role),
            token: data.token ?? null,
        };
        setUser(nextUser);
        if (rememberMe) localStorage.setItem(STORAGE_KEY, JSON.stringify(nextUser));
    };

    const logout = () => {
        setUser(null);
        localStorage.removeItem(STORAGE_KEY);
    };

    const switchRole = (newRole) => {
        setUser((prev) => ({ ...(prev ?? {}), role: normalizeRole(newRole) }));
    };

    const hasRole = (...roles) => {
        const set = roles.map(normalizeRole);
        return set.includes(user?.role);
    };

    const getToken = () => user?.token ?? null;

    return (
        <AuthContext.Provider
            value={{
                user,
                id: user?.id ?? null,
                name: user?.name ?? null,
                role: user?.role ?? null,
                token: user?.token ?? null,
                isAuthenticated: Boolean(user?.role),
                login,
                logout,
                switchRole,
                hasRole,
                getToken,
            }}
        >
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => useContext(AuthContext);