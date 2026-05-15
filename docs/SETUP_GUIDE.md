# 🚀 BƯỚC 2 HOÀN THÀNH - Hướng Dẫn Tiếp Theo

## ✅ Những gì đã được tạo:

### 📁 Folder Structure:
```
src/
├── types/              ✅ TypeScript interfaces
│   ├── index.ts       - Export all types
│   ├── auth.ts        - Auth-related types
│   ├── tuition.ts     - Tuition data types
│   └── common.ts      - Common response types
│
├── services/          ✅ API Service Layer
│   ├── api.ts         - Axios instance (PLACEHOLDER)
│   ├── index.ts       - Auth service (PLACEHOLDER)
│   └── tuition.ts     - Tuition service (PLACEHOLDER)
│
├── context/           ✅ React Context
│   └── AuthContext.tsx - Authentication context
│
├── hooks/             ✅ Custom Hooks
│   ├── useAuth.ts     - Auth hook
│   └── index.ts       - Export hooks
│
├── utils/             ✅ Utilities
│   ├── constants.ts   - API endpoints, user roles
│   ├── storage.ts     - localStorage management
│   └── index.ts       - Common utilities
│
├── app/               (existing - pages & components)
└── styles/            (existing)
```

### 📝 Files Created:
- ✅ `src/types/auth.ts` - User, Login, Token types
- ✅ `src/types/tuition.ts` - TuitionRecord, TuitionStats types
- ✅ `src/types/common.ts` - ApiResponse, PaginatedResponse types
- ✅ `src/utils/constants.ts` - API URLs, endpoints, roles
- ✅ `src/utils/storage.ts` - Token storage utilities
- ✅ `src/utils/index.ts` - Helper functions (formatDate, formatCurrency, etc)
- ✅ `src/services/api.ts` - Axios instance (commented out - needs axios install)
- ✅ `src/services/index.ts` - Auth service functions
- ✅ `src/services/tuition.ts` - Tuition service functions
- ✅ `src/hooks/useAuth.ts` - Custom React hook
- ✅ `src/context/AuthContext.tsx` - Authentication provider

---

## ⚠️ BƯỚC 3 - CÀI ĐẶT DEPENDENCIES & CẤU HÌNH

### 1️⃣ **Cài đặt axios (dùng cho API calls)**
```bash
npm install axios
```
hoặc
```bash
pnpm add axios
```

**Sau khi cài xong**, sửa file: `src/services/api.ts`
- Bỏ comment phần `import axios` ở dầu
- Bỏ comment phần `apiClient` (dòng 11-70)
- Giữ lại comment ở dòng 73-88 (remove TODO comment)

### 2️⃣ **Cài đặt jwt-decode (optional - để decode JWT token)**
```bash
npm install jwt-decode
```

### 3️⃣ **Cập nhật vite.config.ts**
Kiểm tra xem alias `@` đã được cấu hình chưa (đã có, chỉ cần xác nhận)

---

## 🔄 BƯỚC 4 - KẾT NỐI VÀO MAIN APP

### 1️⃣ **Wrap App với AuthProvider**
Sửa file: `src/app/App.tsx`

```tsx
import AuthProvider from '@/context/AuthContext';

export default function App() {
  return (
    <AuthProvider>
      <RouterProvider router={router} />
    </AuthProvider>
  );
}
```

### 2️⃣ **Update LoginForm.tsx**
- Import `useAuth` từ `@/hooks`
- Gọi `authContext.login()` thay vì `onLogin()` prop
- Handle error từ context

### 3️⃣ **Update các pages sử dụng mock data**
Thay thế:
```tsx
import { mockTuitionRecords } from '../data/mockTuitionData';
```
Bằng:
```tsx
import { tuitionService } from '@/services';
```

---

## 🎯 Danh Sách Cầu Hình Chi Tiết

| Bước | Task | Công cụ | File |
|-----|------|--------|------|
| 3.1 | Cài axios | Terminal | `npm install axios` |
| 3.2 | Bỏ comment api.ts | Editor | `src/services/api.ts` |
| 3.3 | Wrap AuthProvider | Editor | `src/app/App.tsx` |
| 3.4 | Update LoginForm | Editor | `src/app/components/LoginForm.tsx` |
| 3.5 | Replace mock in pages | Editor | 8 pages (TuitionReceivablesPage, InvoicesPage, etc) |

---

## 🚨 CHƯA HOÀN THÀNH - Tạm thời có các hạn chế:

1. ❌ `src/services/api.ts` - Axios instance được comment (chờ install)
2. ❌ `src/services/index.ts` - Auth service functions thả error
3. ❌ `src/services/tuition.ts` - Tuition service functions thả error
4. ❌ `src/context/AuthContext.tsx` - login() function thả error
5. ❌ Chưa test kết nối thực với Backend Java

---

## 📱 Chuẩn bị sẵn cho bước tiếp theo:

✅ **Đã có cấu trúc folder chuyên nghiệp**
✅ **Đã có TypeScript types cho tất cả models**
✅ **Đã có utilities và helpers**
✅ **Đã có React Context setup**
✅ **Đã có placeholder cho API services**

❌ **Cần làm**:
- Cài axios
- Uncomment api.ts
- Wrap AuthProvider vào App
- Test login flow
- Thay mock data bằng API calls

---

## 📞 Các bước tiếp theo:

1. **Cài đặt dependencies** - BƯỚC 3
2. **Cấu hình & kết nối AuthContext** - BƯỚC 4
3. **Test login với Backend Java** - BƯỚC 5
4. **Replace tất cả mock data** - BƯỚC 6

---

**Sẵn sàng bước tiếp theo chưa?** 🚀
