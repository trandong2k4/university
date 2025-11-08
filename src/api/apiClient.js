import axios from "axios";

// Đọc base URL từ biến môi trường
// (Nó sẽ tự động lấy 'https://be-university.onrender.com/api' trên Vercel
// và 'http://localhost:8080/api' ở local)
const VITE_API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

// Tạo một instance (phiên bản) axios với cấu hình riêng
const apiClient = axios.create({
  baseURL: VITE_API_BASE_URL,
  headers: {
    "Content-Type": "application/json",
  },
});

// (Tùy chọn nâng cao) Bạn cũng có thể thêm "interceptors" tại đây
// để tự động đính kèm token (JWT) vào mọi request
// hoặc xử lý lỗi 401 (Unauthorized) một cách tập trung.

export default apiClient;