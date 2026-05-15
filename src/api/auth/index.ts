import {
  LoginApiRequest,
  LoginApiResponse,
  RefreshApiRequest,
  RefreshApiResponse,
  LogoutApiRequest,
  ForgotPasswordApiRequest,
  ResetPasswordApiRequest,
  MessageApiResponse,
} from '@/types';
import { API_ENDPOINTS } from '@/constants';
import apiClient from '../common/axiosClient';

const authApi = {
  /**
   * POST /api/auth/login
   * Body: { username, password }
   */
  login: async (data: LoginApiRequest): Promise<LoginApiResponse> => {
    const response = await apiClient.post<LoginApiResponse>(API_ENDPOINTS.LOGIN, data);
    return response.data;
  },

  /**
   * POST /api/auth/refresh
   * Body: { refreshToken }
   */
  refreshToken: async (data: RefreshApiRequest): Promise<RefreshApiResponse> => {
    const response = await apiClient.post<RefreshApiResponse>(API_ENDPOINTS.REFRESH, data);
    return response.data;
  },

  /**
   * POST /api/auth/logout
   * Header: Authorization: Bearer <accessToken>  (auto-attached by interceptor)
   * Body: { refreshToken }
   */
  logout: async (data: LogoutApiRequest): Promise<void> => {
    await apiClient.post(API_ENDPOINTS.LOGOUT, data);
  },

  /**
   * POST /api/auth/forgot-password
   * Body: { email }
   */
  forgotPassword: async (data: ForgotPasswordApiRequest): Promise<MessageApiResponse> => {
    const response = await apiClient.post<MessageApiResponse>(API_ENDPOINTS.FORGOT_PASSWORD, data);
    return response.data;
  },

  /**
   * POST /api/auth/reset-password
   * Body: { token, newPassword, confirmPassword }
   */
  resetPassword: async (data: ResetPasswordApiRequest): Promise<MessageApiResponse> => {
    const response = await apiClient.post<MessageApiResponse>(API_ENDPOINTS.RESET_PASSWORD, data);
    return response.data;
  },
};

export default authApi;
