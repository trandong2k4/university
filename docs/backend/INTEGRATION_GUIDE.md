# 🔄 Frontend ↔ Backend Integration Guide

## Tóm tắt

Hướng dẫn này giúp bạn dễ dàng chuyển từ **mock data** sang **real Spring Boot backend** mà không cần thay đổi component code.

---

## 📍 Cấu trúc Hiện Tại

```
src/
├── config/
│   └── environment.ts          # 🔑 Cấu hình chính (mock vs real)
├── repositories/
│   ├── index.ts               # Export factory
│   └── tuitionRepository.ts   # Repository pattern (dễ swap)
├── services/
│   ├── api.ts                 # Axios instance với JWT
│   ├── tuition.ts             # Old: Call API trực tiếp
│   └── student.ts             # Old: Call API trực tiếp
├── hooks/
│   └── useAsync.ts            # Hook xử lý async + fallback mock
├── data/
│   └── mockTuition.ts         # Mock data
├── utils/
│   ├── constants.ts           # Constants & endpoints
│   ├── mockDataUtils.ts       # 🔧 Helper functions
│   └── storage.ts             # JWT token storage
└── app/data/
    └── mockTuitionData.ts     # Mock data chính
```

---

## 🚀 4 Bước Chuyển Đổi

### ✅ Bước 1: Cập nhật `.env` File

**File: `.env` (dev environment)**

```bash
# API Configuration
VITE_API_BASE_URL=http://localhost:8080/api
VITE_API_TIMEOUT=10000

# Feature Flags
VITE_USE_MOCK_DATA=false          # ← Change to FALSE khi backend ready
VITE_ENABLE_DEBUG_LOGS=true       # Debug mode

# Mock Delay (simulate network)
VITE_MOCK_DATA_DELAY=300

VITE_ENVIRONMENT=development
```

**File: `.env.production`**

```bash
VITE_API_BASE_URL=https://your-backend.com/api
VITE_USE_MOCK_DATA=false
VITE_ENABLE_DEBUG_LOGS=false
```

---

### ✅ Bước 2: Cập nhật Components (Từ Service → Repository)

#### Trước (Old - Direct Service Call):

```typescript
import { tuitionService } from '@/services';
import { mockTuitionRecords } from '@/data/mockTuition';

export function TuitionList() {
  // Problem: Muốn swap data source cần sửa chỗ này
  const { data, loading, error } = useAsync(
    () => tuitionService.getAllTuitions(),
    mockTuitionRecords  // Fallback
  );

  return <div>{data?.map(t => <div>{t.studentName}</div>)}</div>;
}
```

#### Sau (New - Repository Pattern):

```typescript
import { tuitionRepository } from '@/repositories';

export function TuitionList() {
  // ✨ Auto-swap: mock ↔ real based on envConfig
  const { data, loading, error } = useAsync(
    () => tuitionRepository.getAllTuitions()
  );

  return <div>{data?.map(t => <div>{t.studentName}</div>)}</div>;
}
```

**Lợi ích:**
- ✅ Không cần fallback data nữa (repository handle it)
- ✅ Tự động chuyển mock ↔ real qua `.env`
- ✅ Component code không thay đổi

---

### ✅ Bước 3: Kiểm Tra Mock Data Hoạt Động

```bash
# Terminal
npm run dev

# Mở browser console (F12)
# Sẽ thấy logs như:
# 🎭 Using Mock Tuition Repository
# 🎭 Mock Data [getAllTuitions]: [...]
```

---

### ✅ Bước 4: Khi Backend Ready

Chỉ cần thay đổi `.env`:

```diff
- VITE_USE_MOCK_DATA=true
+ VITE_USE_MOCK_DATA=false
```

**Done!** Frontend sẽ tự động:
1. Gọi real API từ Spring Boot
2. In logs: `✅ Using API Tuition Repository (Spring Boot)`
3. Không cần thay code component

---

## 📋 Repository Pattern Advantages

### 1️⃣ Single Responsibility
```typescript
// ❌ Before: Service làm nhiều việc
tuitionService.getAllTuitions()  // Cả mock và real API mix

// ✅ After: Repository xử lý data source
tuitionRepository.getAllTuitions()  // Rõ ràng
```

### 2️⃣ Easy to Test
```typescript
// Unit test: Dùng mock repository
const mockRepo = new MockTuitionRepository();
const data = await mockRepo.getAllTuitions();
expect(data).toHaveLength(3);

// Integration test: Dùng API repository
const apiRepo = new ApiTuitionRepository();
const data = await apiRepo.getAllTuitions();
```

### 3️⃣ Easy to Extend
```typescript
// Muốn add new feature? Implement ITuitionRepository
export class CachedTuitionRepository implements ITuitionRepository {
  // ...cache implementation
}

// Swap easily
export const tuitionRepository = 
  useCache 
    ? new CachedTuitionRepository()
    : useMockData
      ? new MockTuitionRepository()
      : new ApiTuitionRepository();
```

### 4️⃣ Type-Safe
```typescript
// TypeScript sẽ check bạn implement tất cả methods
class MyRepository implements ITuitionRepository {
  // ✅ Phải implement: getAllTuitions, getTuitionById, ...
  // ❌ Forgetting method → TypeScript error
}
```

---

## 🔧 Debugging Tips

### Check Logs
```javascript
// Open browser console (F12)
// Should see:
// 📋 Environment Config: { apiBaseUrl, useMockData, ... }
// 🎭 Mock Data [getAllTuitions]: [...]  // Mock mode
// ✅ Real API [/tuitions]: [...]         // API mode
```

### Check Network
```javascript
// F12 → Network tab
// Mock mode: ❌ No requests (uses local data)
// API mode:  ✅ See XHR requests to http://localhost:8080/api/...
```

### Check Config
```javascript
// Browser console
import { envConfig } from '@/config/environment'
console.log(envConfig)
// Output:
// {
//   apiBaseUrl: "http://localhost:8080/api",
//   useMockData: false,
//   environment: "development",
//   ...
// }
```

---

## 📝 Step-by-Step Backend Integration

### Phase 1: Setup Spring Boot Project (Backend)
```
1. Create Spring Boot project
2. Add dependencies: Spring Web, Spring Data JPA, Spring Security, JWT
3. Create models, repositories, services
4. Implement TuitionController with endpoints from SPRING_BOOT_API_SPEC.md
5. Test with Postman / cURL
```

### Phase 2: Test with Mock Data (Frontend)
```
1. Keep VITE_USE_MOCK_DATA=true
2. Verify all pages work with mock data
3. Component logic is correct
4. UI matches requirements
```

### Phase 3: Switch to Real API (Frontend ↔ Backend)
```
1. Start Spring Boot backend (port 8080)
2. Update .env: VITE_API_BASE_URL=http://localhost:8080/api
3. Change: VITE_USE_MOCK_DATA=false
4. Test in browser:
   - Check Network tab (see real API calls)
   - Check browser console (see ✅ Real API logs)
5. Test all features:
   - Login/logout
   - List, create, update, delete tuition
   - View statistics
```

### Phase 4: Production Deployment
```
1. Update .env.production with real backend URL
2. Build: npm run build
3. Deploy to hosting
```

---

## 🛠️ Common Issues & Solutions

### ❌ Issue: "Cannot GET /api/tuitions"

**Cause**: Backend not running or wrong URL

**Solution**:
```bash
# Check backend running
curl http://localhost:8080/api/tuitions -H "Authorization: Bearer <token>"

# Check .env
VITE_API_BASE_URL=http://localhost:8080/api
```

### ❌ Issue: "401 Unauthorized"

**Cause**: JWT token invalid or missing

**Solution**:
```javascript
// F12 Console
import { storageUtils } from '@/utils/storage'
console.log(storageUtils.getAccessToken())  // Should have token

// Re-login
// Go to /login page
```

### ❌ Issue: "CORS error"

**Cause**: Backend CORS not configured

**Solution**: Add to Spring Boot:
```java
@Configuration
public class CorsConfig {
    @Bean
    public WebMvcConfigurer corsConfigurer() {
        return new WebMvcConfigurer() {
            @Override
            public void addCorsMappings(CorsRegistry registry) {
                registry.addMapping("/api/**")
                    .allowedOrigins("*")
                    .allowedMethods("GET", "POST", "PUT", "DELETE")
                    .allowedHeaders("*")
                    .maxAge(3600);
            }
        };
    }
}
```

### ❌ Issue: Mock data not loading

**Cause**: VITE_USE_MOCK_DATA not set correctly

**Solution**:
```bash
# Check .env
VITE_USE_MOCK_DATA=true

# Clear browser cache
# Hard refresh: Ctrl+Shift+Delete or Cmd+Shift+Delete

# Check logs
# F12 → Console → should see: 🎭 Using Mock Tuition Repository
```

---

## 🎯 Migration Checklist

- [ ] Create `.env` file with VITE_USE_MOCK_DATA flag
- [ ] Implement `src/config/environment.ts`
- [ ] Implement `src/utils/mockDataUtils.ts`
- [ ] Implement `src/repositories/tuitionRepository.ts`
- [ ] Update components to use `tuitionRepository` instead of `tuitionService`
- [ ] Test with mock data (VITE_USE_MOCK_DATA=true)
- [ ] Implement Spring Boot backend with API endpoints
- [ ] Test Spring Boot endpoints with Postman
- [ ] Update `.env` to point to real backend
- [ ] Change VITE_USE_MOCK_DATA=false
- [ ] Test in browser (Network tab shows API calls)
- [ ] Deploy to production

---

## 📚 Reference

- [SPRING_BOOT_API_SPEC.md](./SPRING_BOOT_API_SPEC.md) - Detailed API specification
- [src/config/environment.ts](./src/config/environment.ts) - Configuration
- [src/repositories/tuitionRepository.ts](./src/repositories/tuitionRepository.ts) - Repository pattern
- [src/utils/mockDataUtils.ts](./src/utils/mockDataUtils.ts) - Mock utilities
- [src/services/api.ts](./src/services/api.ts) - Axios setup

---

## 💡 Best Practices

1. **Always use Repository Pattern**
   - Don't import services directly in components
   - Use `tuitionRepository` everywhere

2. **Keep Mock Data in Sync**
   - When backend API changes, update mock data too
   - Ensures consistency during development

3. **Use Feature Flags**
   - Toggle mock/real data easily
   - Don't hardcode data source choice

4. **Log Everything in Debug Mode**
   - Use `logMockDataUsage()` and `logRealDataUsage()`
   - Helps debugging during integration

5. **Test Both Paths**
   - Test with mock data (VITE_USE_MOCK_DATA=true)
   - Test with real API (VITE_USE_MOCK_DATA=false)

---

## ❓ Questions?

1. **Q: Do I need to change component code to switch mock ↔ real?**
   - A: No! Just change `.env` flag and restart dev server

2. **Q: Can I test both simultaneously?**
   - A: Yes! Run two instances with different `.env` settings

3. **Q: How do I keep mock data in sync with real API?**
   - A: Update MockTuitionRepository whenever API contract changes

4. **Q: What if backend endpoint structure changes?**
   - A: Only update repository + API_ENDPOINTS constant
   - Component code stays the same ✅

