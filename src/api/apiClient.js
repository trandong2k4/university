// src/utils/apiClient.js
import axios from "axios";

const apiClient = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL, // tự động đổi giữa local / production
  headers: {
    "Content-Type": "application/json",
  },
});

// interceptor (tùy chọn): tự động gắn token vào header
apiClient.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

export default apiClient;
