import React, { createContext, useState, useCallback, useEffect, useMemo } from 'react';
import { AuthContextType, User, UserRole } from '@/types';
import { storageUtils } from '@/utils/storage';
import { isTokenExpired, getErrorMessage } from '@/utils';
import authApi from '@/api/auth';
import usersApi from '@/api/admin/users.api';

export const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Backend trả về role dạng "ADMIN", "STUDENT", "LECTURER", "ACCOUNTANT"
const mapBackendRole = (backendRole: string): UserRole => {
  switch (backendRole.toUpperCase()) {
    case 'ADMIN': return 'admin';
    case 'STUDENT': return 'student';
    case 'LECTURER': return 'lecturer';
    case 'ACCOUNTANT': return 'accountant';
    default: return 'student';
  }
};

const getLoginErrorMessage = (error: any): string => {
  const status = error?.response?.status;
  if ([400, 401, 403, 404].includes(status)) {
    return 'Tên đăng nhập hoặc mật khẩu không đúng.';
  }
  return getErrorMessage(error);
};

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [accessToken, setAccessToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Khôi phục session từ localStorage khi app mount
  useEffect(() => {
    setIsLoading(true);
    const storedUser = storageUtils.getUser();
    const storedToken = storageUtils.getAccessToken();

    if (storedUser && storedToken && !isTokenExpired(storedToken)) {
      setUser(storedUser);
      setAccessToken(storedToken);
    } else {
      storageUtils.clearAll();
    }
    setIsLoading(false);
  }, []);

  const login = useCallback(async (username: string, password: string) => {
    setIsLoading(true);
    setError(null);

    try {
      const res = await authApi.login({ username, password });

      // Map LoginResponseDTO → frontend User
      const backendRoles: string[] = res.drole ?? [];
      const mappedRoles = Array.from(new Set(backendRoles.map(r => mapBackendRole(r || ''))));
      let permissions: string[] = [];

      storageUtils.setAccessToken(res.accessToken);
      storageUtils.setRefreshToken(res.refreshToken);

      // Fetch extra roles/permissions via admin endpoint — only if the user is admin
      const isAdmin = backendRoles.some(r => r.toUpperCase() === 'ADMIN');
      if (isAdmin) {
        try {
          const authPairs = await usersApi.getUserRolesAndPermissions(res.id);
          const permSet = new Set<string>();
          const roleSet = new Set<string>();
          authPairs.forEach((p) => {
            if (p.maPermissions) permSet.add(p.maPermissions);
            if (p.maRole) roleSet.add(p.maRole);
          });
          permissions = Array.from(permSet);
          roleSet.forEach(r => {
            if (!backendRoles.includes(r)) {
              backendRoles.push(r);
              const mapped = mapBackendRole(r);
              if (!mappedRoles.includes(mapped)) mappedRoles.push(mapped);
            }
          });
        } catch {
          // ignore
        }
      }

      const userData: User = {
        id: res.id,
        username: res.userName,
        fullName: res.fullName,
        role: mappedRoles[0] ?? 'student',
        roles: mappedRoles,
        permissions,
      };

      storageUtils.setUser(userData);

      setUser(userData);
      setAccessToken(res.accessToken);
    } catch (err) {
      setError(getLoginErrorMessage(err));
    } finally {
      setIsLoading(false);
    }
  }, []);

  const logout = useCallback(async () => {
    const refreshToken = storageUtils.getRefreshToken();
    try {
      if (refreshToken) {
        await authApi.logout({ refreshToken });
      }
    } catch {
      // Bỏ qua lỗi logout — vẫn clear session phía client
    } finally {
      storageUtils.clearAll();
      setUser(null);
      setAccessToken(null);
      setError(null);
    }
  }, []);

  const switchRole = useCallback((role: UserRole | string) => {
    const selectedRole = mapBackendRole(String(role).replace(/^ROLE_/i, ''));

    setUser((currentUser) => {
      if (!currentUser) return currentUser;

      const hasRole = currentUser.roles?.includes(selectedRole) ?? currentUser.role === selectedRole;
      if (!hasRole) return currentUser;

      const nextUser = { ...currentUser, role: selectedRole };
      storageUtils.setUser(nextUser);
      return nextUser;
    });
  }, []);

  const refreshAccessToken = useCallback(async () => {
    const refreshToken = storageUtils.getRefreshToken();
    if (!refreshToken) {
      storageUtils.clearAll();
      setUser(null);
      setAccessToken(null);
      return;
    }

    try {
      const res = await authApi.refreshToken({ refreshToken });
      storageUtils.setAccessToken(res.accessToken);
      storageUtils.setRefreshToken(res.refreshToken);
      setAccessToken(res.accessToken);
    } catch (err) {
      storageUtils.clearAll();
      setUser(null);
      setAccessToken(null);
      throw err;
    }
  }, []);

  const value = useMemo<AuthContextType>(() => ({
    user,
    accessToken,
    isLoading,
    error,
    isAuthenticated: !!user && !!accessToken,
    login,
    switchRole,
    logout,
    refreshAccessToken,
  }), [user, accessToken, isLoading, error, login, switchRole, logout, refreshAccessToken]);

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export default AuthProvider;
