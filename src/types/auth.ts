// ─── Frontend user model ───────────────────────────────────────────────────
export type UserRole = 'student' | 'lecturer' | 'admin' | 'accountant';

export interface User {
  id: string;
  username: string;      // userName từ backend
  fullName: string;
  role: UserRole;
  roles?: string[]; // raw backend role codes
  permissions?: string[];
  avatar?: string;
  department?: string;
  phone?: string;
  address?: string;
}

// ─── Auth context ──────────────────────────────────────────────────────────
export interface AuthContextType {
  user: User | null;
  accessToken: string | null;
  isLoading: boolean;
  error: string | null;
  isAuthenticated: boolean;
  login: (username: string, password: string) => Promise<void>;
  switchRole: (role: UserRole | string) => void;
  logout: () => Promise<void>;
  refreshAccessToken: () => Promise<void>;
}

// ─── API request / response shapes (khớp backend DTO) ─────────────────────

/** POST /api/auth/login */
export interface LoginApiRequest {
  username: string;
  password: string;
}

/** POST /api/auth/login – response (LoginResponseDTO) */
export interface LoginApiResponse {
  id: string;
  userName: string;
  fullName: string;
  accessToken: string;
  refreshToken: string;
  drole: string[];
  message: string;
}

/** POST /api/auth/refresh */
export interface RefreshApiRequest {
  refreshToken: string;
}

/** POST /api/auth/refresh – response (RefreshResponseDTO) */
export interface RefreshApiResponse {
  accessToken: string;
  refreshToken: string;
}

/** POST /api/auth/logout */
export interface LogoutApiRequest {
  refreshToken: string;
}

/** POST /api/auth/forgot-password */
export interface ForgotPasswordApiRequest {
  email: string;
}

/** POST /api/auth/reset-password */
export interface ResetPasswordApiRequest {
  token: string;
  newPassword: string;
  confirmPassword: string;
}

/** Generic message response */
export interface MessageApiResponse {
  message: string;
}

// ─── Legacy aliases (giữ để không phá vỡ code cũ) ─────────────────────────
export interface LoginRequest {
  username: string;
  password: string;
}

export interface AuthToken {
  accessToken: string;
  refreshToken?: string;
}

export interface AuthResponse {
  user: User;
  token: AuthToken;
}
