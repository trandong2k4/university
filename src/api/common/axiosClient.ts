import axios, { AxiosInstance, AxiosRequestConfig, AxiosError } from 'axios';
import { envConfig } from '@/constants/environment';
import { storageUtils } from '@/utils/storage';
import { API_ENDPOINTS, HTTP_STATUS } from '@/constants';

type ApiEnvelope<T = unknown> = {
  data?: T;
  result?: T;
  payload?: T;
  content?: T;
  message?: string;
  error?: string;
  timestamp?: string;
};

const isSpringPagePayload = (raw: unknown): boolean => {
  if (!raw || typeof raw !== 'object') return false;

  const value = raw as Record<string, unknown>;
  return (
    Array.isArray(value.content) &&
    typeof value.totalElements === 'number' &&
    typeof value.totalPages === 'number' &&
    typeof value.size === 'number' &&
    typeof value.number === 'number'
  );
};

const unwrapApiPayload = <T>(raw: T | ApiEnvelope<T>): T => {
  if (isSpringPagePayload(raw)) {
    return raw as T;
  }

  if (raw && typeof raw === 'object') {
    const maybeEnvelope = raw as ApiEnvelope<T>;
    if (Object.prototype.hasOwnProperty.call(maybeEnvelope, 'data')) {
      return maybeEnvelope.data as T;
    }
    if (Object.prototype.hasOwnProperty.call(maybeEnvelope, 'result')) {
      return maybeEnvelope.result as T;
    }
    if (Object.prototype.hasOwnProperty.call(maybeEnvelope, 'payload')) {
      return maybeEnvelope.payload as T;
    }
    if (Object.prototype.hasOwnProperty.call(maybeEnvelope, 'content')) {
      return maybeEnvelope.content as T;
    }
  }
  return raw as T;
};

export const apiClient: AxiosInstance = axios.create({
  baseURL: envConfig.apiBaseUrl,
  timeout: envConfig.apiTimeout,
  headers: {
    'Content-Type': 'application/json',
  },
});

apiClient.interceptors.request.use(
  (config) => {
    const token = storageUtils.getAccessToken();
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

apiClient.interceptors.response.use(
  (response) => {
    response.data = unwrapApiPayload(response.data);
    return response;
  },
  async (error: AxiosError) => {
    const originalRequest = error.config as AxiosRequestConfig & { _retry?: boolean };

    if (error.response?.status === HTTP_STATUS.UNAUTHORIZED && !originalRequest?._retry) {
      originalRequest._retry = true;

      try {
        const refreshToken = storageUtils.getRefreshToken();
        if (refreshToken) {
          const response = await axios.post(`${envConfig.apiBaseUrl}${API_ENDPOINTS.REFRESH}`, { refreshToken });
          const refreshPayload = unwrapApiPayload(response.data) as { accessToken: string };
          const { accessToken } = refreshPayload;
          storageUtils.setAccessToken(accessToken);
          if (originalRequest.headers) {
            originalRequest.headers.Authorization = `Bearer ${accessToken}`;
          }
          return apiClient(originalRequest);
        }
      } catch (refreshError) {
        storageUtils.clearAll();
        window.location.href = '/';
        return Promise.reject(refreshError);
      }
    }

    return Promise.reject(error);
  }
);

export default apiClient;
