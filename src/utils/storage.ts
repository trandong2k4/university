import { TOKEN_STORAGE_KEYS } from '@/constants';

// localStorage utilities for token management
export const storageUtils = {
  // Access Token
  getAccessToken: (): string | null => {
    return localStorage.getItem(TOKEN_STORAGE_KEYS.ACCESS_TOKEN);
  },

  setAccessToken: (token: string): void => {
    localStorage.setItem(TOKEN_STORAGE_KEYS.ACCESS_TOKEN, token);
  },

  removeAccessToken: (): void => {
    localStorage.removeItem(TOKEN_STORAGE_KEYS.ACCESS_TOKEN);
  },

  // Refresh Token
  getRefreshToken: (): string | null => {
    return localStorage.getItem(TOKEN_STORAGE_KEYS.REFRESH_TOKEN);
  },

  setRefreshToken: (token: string): void => {
    localStorage.setItem(TOKEN_STORAGE_KEYS.REFRESH_TOKEN, token);
  },

  removeRefreshToken: (): void => {
    localStorage.removeItem(TOKEN_STORAGE_KEYS.REFRESH_TOKEN);
  },

  // User
  getUser: () => {
    const userJson = localStorage.getItem(TOKEN_STORAGE_KEYS.USER);
    return userJson ? JSON.parse(userJson) : null;
  },

  setUser: (user: any): void => {
    localStorage.setItem(TOKEN_STORAGE_KEYS.USER, JSON.stringify(user));
  },

  removeUser: (): void => {
    localStorage.removeItem(TOKEN_STORAGE_KEYS.USER);
  },

  // Remember Me
  getRememberMe: (): boolean => {
    return localStorage.getItem(TOKEN_STORAGE_KEYS.REMEMBER_ME) === 'true';
  },

  setRememberMe: (remember: boolean): void => {
    localStorage.setItem(TOKEN_STORAGE_KEYS.REMEMBER_ME, remember ? 'true' : 'false');
  },

  // Clear All
  clearAll: (): void => {
    localStorage.removeItem(TOKEN_STORAGE_KEYS.ACCESS_TOKEN);
    localStorage.removeItem(TOKEN_STORAGE_KEYS.REFRESH_TOKEN);
    localStorage.removeItem(TOKEN_STORAGE_KEYS.USER);
    localStorage.removeItem(TOKEN_STORAGE_KEYS.REMEMBER_ME);
  },
};
