// Đổi BASE_API theo môi trường của Spring Boot
// ví dụ: http://localhost:8080/api hoặc https://ums-api.onrender.com/api
export const BASE_API = localStorage.getItem('API_BASE')
    || 'http://localhost:8080/api';

export const STORAGE_KEYS = {
    TOKEN: 'lh_token',
    PROFILE: 'lh_profile',
};

export const USE_MOCK = true;
export const MOCK_API = './mock-json';