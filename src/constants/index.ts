// Constants for the application
export const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8080/api';
export const API_TIMEOUT = import.meta.env.VITE_API_TIMEOUT ? parseInt(import.meta.env.VITE_API_TIMEOUT) : 10000;
export const USE_MOCK_DATA = import.meta.env.VITE_USE_MOCK_DATA === 'true';
export const DEBUG_LOGS = import.meta.env.VITE_ENABLE_DEBUG_LOGS === 'true';

export const API_ENDPOINTS = {
  // Auth - baseURL already ends with /api
  LOGIN: '/auth/login',
  LOGOUT: '/auth/logout',
  REFRESH: '/auth/refresh',
  FORGOT_PASSWORD: '/auth/forgot-password',
  RESET_PASSWORD: '/auth/reset-password',

  // Chatbot
  CHATBOT_SEND: '/chatbot/chat',
  CHATBOT_HISTORY: '/chatbot/history',

  // Notifications
  NOTIFICATIONS_READ: '/notifications/read',
  NOTIFICATIONS_UNREAD: '/notifications/unread',
  NOTIFICATIONS_SEND: '/notifications/admin',
  NOTIFICATIONS_MARK_READ: (id: string) => `/notifications/${id}/read`,

  // Tuition (admin)
  TUITION: '/admin/hoc-phi',
  TUITION_BY_ID: (id: string) => `/admin/hoc-phi/${id}`,
  TUITION_BY_STATUS: (status: string) => `/admin/hoc-phi?status=${status}`,
  TUITION_STATS: '/admin/hoc-phi/dashboard/tong-quan',
};

export const TOKEN_STORAGE_KEYS = {
  ACCESS_TOKEN: 'accessToken',
  REFRESH_TOKEN: 'refreshToken',
  USER: 'user',
  REMEMBER_ME: 'rememberMe',
};

export const HTTP_STATUS = {
  OK: 200,
  CREATED: 201,
  BAD_REQUEST: 400,
  UNAUTHORIZED: 401,
  FORBIDDEN: 403,
  NOT_FOUND: 404,
  CONFLICT: 409,
  INTERNAL_ERROR: 500,
  SERVICE_UNAVAILABLE: 503,
};

export const USER_ROLES = {
  ADMIN: 'admin',
  STUDENT: 'student',
  INSTRUCTOR: 'instructor',
  ACCOUNTANT: 'accountant',
} as const;

export const DEMO_USERS = [
  {
    email: 'locloclock41@gmail.com',
    password: 'Nvl2004@@@',
    role: 'admin' as const,
  },
  {
    email: 'student@learninghub.com',
    password: 'student123',
    role: 'student' as const,
  },
  {
    email: 'teacher@learninghub.com',
    password: 'teacher123',
    role: 'instructor' as const,
  },
];
