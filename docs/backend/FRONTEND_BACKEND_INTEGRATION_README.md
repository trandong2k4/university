# 🎯 Frontend Mock Data → Spring Boot Backend Integration Setup

## 📌 Overview

Bạn có thể dễ dàng chuyển từ **mock data** → **real Spring Boot backend** mà **không cần thay đổi component code**!

Kiến trúc được thiết kế với **Repository Pattern** + **Feature Flags** để:
- ✅ Phát triển nhanh với mock data
- ✅ Không cần backend lúc ban đầu
- ✅ Một cú click `.env` để switch sang real API
- ✅ Tất cả component code giữ nguyên

---

## 📂 Cấu Trúc Mới

```
src/
├── config/
│   └── environment.ts              # ⭐ Cấu hình chính
├── repositories/
│   ├── index.ts                    # Export factory
│   └── tuitionRepository.ts        # ⭐ Data layer abstraction
├── utils/
│   └── mockDataUtils.ts            # ⭐ Helper functions
└── (rest of project)
```

**3 file chính mà bạn cần hiểu:**
1. `src/config/environment.ts` - Config & feature flags
2. `src/repositories/` - Repository pattern
3. `src/utils/mockDataUtils.ts` - Debug utilities

---

## 🚀 Quick Start (3 Bước)

### Bước 1: Copy Environment File
```bash
cp .env.development .env
# Mở .env, xem config
```

### Bước 2: Test Mock Data
```bash
npm run dev
# Mở http://localhost:5173
# F12 → Console
# Sẽ thấy: 🎭 Mock Data [getAllTuitions]: [...]
```

### Bước 3: Khi Backend Ready
```bash
# 1. Update .env
VITE_API_BASE_URL=http://localhost:8080/api
VITE_USE_MOCK_DATA=false

# 2. Restart dev server
npm run dev

# 3. F12 Network tab → thấy API calls
# F12 Console → ✅ Real API [/tuitions]: [...]
```

**Done!** Không cần thay code component! 🎉

---

## 📖 Documentation

| File | Mục đích | Dành cho |
|------|---------|----------|
| **FRONTEND_INTEGRATION_QUICKSTART.md** | 🏃 Quick reference | Tất cả |
| **INTEGRATION_GUIDE.md** | 📚 Chi tiết hướng dẫn | Frontend dev |
| **SPRING_BOOT_API_SPEC.md** | 📋 API spec | Backend team |
| **MIGRATION_EXAMPLE.md** | 💻 Code examples | Frontend dev |

**Bắt đầu từ đây:**
1. Đọc [FRONTEND_INTEGRATION_QUICKSTART.md](./FRONTEND_INTEGRATION_QUICKSTART.md) (2 phút)
2. Đọc [INTEGRATION_GUIDE.md](./INTEGRATION_GUIDE.md) (10 phút)
3. Xem [MIGRATION_EXAMPLE.md](./MIGRATION_EXAMPLE.md) (code samples)
4. Share [SPRING_BOOT_API_SPEC.md](./SPRING_BOOT_API_SPEC.md) với backend team

---

## 🔄 How It Works

### Architecture Diagram

```
┌─────────────────────────────────────────────────────────┐
│                    React Component                       │
│         (AccountantDashboard, StudentProfile, ...)       │
└──────────────────────┬──────────────────────────────────┘
                       │
                       ↓
┌─────────────────────────────────────────────────────────┐
│          useAsync Hook (from @/hooks)                    │
│  Handles loading, error, data states                     │
└──────────────────────┬──────────────────────────────────┘
                       │
        ┌──────────────┴──────────────┐
        ↓                             ↓
┌────────────────────┐    ┌────────────────────────┐
│ tuitionRepository  │    │ studentRepository      │
│ adminRepository    │    │ instructorRepository   │
│ etc...             │    │ etc...                 │
└─────┬──────────────┘    └────────────┬───────────┘
      │                                │
      └────────────┬───────────────────┘
                   ↓
      ┌────────────────────────────┐
      │   Repository Factory       │
      │  (checks .env flag)        │
      └─────┬──────────────────────┘
            │
   ┌────────┴────────┐
   ↓                 ↓
MockRepository    ApiRepository
(mock data)       (Spring Boot)
```

### Data Flow Example

```javascript
// Component code (never changes)
const { data } = useAsync(
  () => tuitionRepository.getAllTuitions()
);

// If VITE_USE_MOCK_DATA=true:
// 🎭 MockTuitionRepository
// → Returns mockTuitionRecords
// → Simulates network delay (300ms)
// → Logs: 🎭 Mock Data [getAllTuitions]: [...]

// If VITE_USE_MOCK_DATA=false:
// ✅ ApiTuitionRepository
// → Calls apiClient.get('/tuitions')
// → Waits for Spring Boot response
// → Logs: ✅ Real API [/tuitions]: [...]
```

---

## 🎯 Key Benefits

| Benefit | Details |
|---------|---------|
| **No Code Changes** | Component code stays the same when switching |
| **Type-Safe** | TypeScript interfaces ensure correctness |
| **Easy Testing** | Test with mock or real data independently |
| **Fast Development** | Use mock data, no backend needed |
| **Scalable** | Pattern works for all services |
| **Easy Debugging** | Debug logs show which data source is used |
| **Flexible** | Can use different sources per environment |

---

## 📝 Component Example

### Before (Old Way)
```typescript
import { tuitionService } from '@/services';
import { mockTuitionRecords } from '@/data/mockTuition';

export function Dashboard() {
  // Problem: hardcoded mock data
  const { data } = useAsync(
    () => tuitionService.getAllTuitions(),
    mockTuitionRecords
  );
}
```

### After (New Way)
```typescript
import { tuitionRepository } from '@/repositories';

export function Dashboard() {
  // ✨ Cleaner: auto-switches based on .env
  const { data } = useAsync(
    () => tuitionRepository.getAllTuitions()
  );
}
```

---

## 🔧 Configuration

### .env File
```bash
# Use mock data (development)
VITE_USE_MOCK_DATA=true
VITE_API_BASE_URL=http://localhost:8080/api

# Real API (when backend ready)
VITE_USE_MOCK_DATA=false
VITE_API_BASE_URL=http://localhost:8080/api  # Your backend URL

# Debug mode
VITE_ENABLE_DEBUG_LOGS=true
```

### Programmatic Access
```typescript
import { envConfig, shouldUseMockData } from '@/config/environment';

if (shouldUseMockData()) {
  console.log('Using mock data');
} else {
  console.log('Using real API from:', envConfig.apiBaseUrl);
}
```

---

## 🧪 Testing

### Test with Mock Data
```bash
# .env: VITE_USE_MOCK_DATA=true
npm run dev

# F12 Console:
# 🎭 Mock Data [getAllTuitions]: [...]
# 🎭 Mock Data [getTuitionById]: {...}
```

### Test with Real API
```bash
# 1. Start Spring Boot backend
# mvn spring-boot:run  (in backend directory)

# 2. .env: VITE_USE_MOCK_DATA=false
# 3. Restart: npm run dev

# F12 Console:
# ✅ Real API [/tuitions]: [...]

# F12 Network tab:
# ✅ GET http://localhost:8080/api/tuitions → 200 OK
```

---

## 🚨 Common Issues

### Problem: Data not loading
**Solution:** Check .env flag
```bash
# Should be one of:
VITE_USE_MOCK_DATA=true   # Mock
VITE_USE_MOCK_DATA=false  # Real API
```

### Problem: "Cannot GET /api/tuitions"
**Solution:** Backend not running
```bash
# Start Spring Boot:
mvn spring-boot:run

# Check running on port 8080:
curl http://localhost:8080/api/tuitions
```

### Problem: "401 Unauthorized"
**Solution:** No JWT token
```bash
# Re-login at: http://localhost:5173/login
# Token will be saved to localStorage
```

### Problem: CORS Error
**Solution:** Backend CORS not enabled
```java
// Add to Spring Boot application
@Configuration
public class CorsConfig {
    @Bean
    public WebMvcConfigurer corsConfigurer() {
        return new WebMvcConfigurer() {
            @Override
            public void addCorsMappings(CorsRegistry registry) {
                registry.addMapping("/api/**")
                    .allowedOrigins("*")
                    .allowedMethods("*")
                    .allowedHeaders("*");
            }
        };
    }
}
```

---

## 📋 Migration Checklist

- [ ] Read [FRONTEND_INTEGRATION_QUICKSTART.md](./FRONTEND_INTEGRATION_QUICKSTART.md)
- [ ] Read [INTEGRATION_GUIDE.md](./INTEGRATION_GUIDE.md)
- [ ] Copy `.env.development` → `.env`
- [ ] Test mock data works (VITE_USE_MOCK_DATA=true)
- [ ] Start Spring Boot backend
- [ ] Share [SPRING_BOOT_API_SPEC.md](./SPRING_BOOT_API_SPEC.md) with backend team
- [ ] Implement backend endpoints
- [ ] Test backend with Postman/cURL
- [ ] Update .env to use real API (VITE_USE_MOCK_DATA=false)
- [ ] Test frontend ↔ backend integration
- [ ] Deploy to production

---

## 📚 File Reference

| File | Type | Purpose |
|------|------|---------|
| `src/config/environment.ts` | Code | Config & feature flags |
| `src/repositories/tuitionRepository.ts` | Code | Repository pattern for tuitions |
| `src/repositories/index.ts` | Code | Factory & exports |
| `src/utils/mockDataUtils.ts` | Code | Debug utilities |
| `.env.development` | Config | Dev environment config |
| `.env.production` | Config | Production environment config |
| `FRONTEND_INTEGRATION_QUICKSTART.md` | Doc | Quick start guide |
| `INTEGRATION_GUIDE.md` | Doc | Detailed integration guide |
| `SPRING_BOOT_API_SPEC.md` | Doc | Backend API specification |
| `MIGRATION_EXAMPLE.md` | Doc | Code migration examples |
| `README.md` | Doc | This file |

---

## 🔗 Next Steps

1. **Understand the Architecture**
   - Read the docs above
   - Look at the code files

2. **Test Mock Data**
   - Run `npm run dev`
   - Check browser console for logs

3. **Implement Backend (Backend Team)**
   - Follow SPRING_BOOT_API_SPEC.md
   - Test endpoints with Postman

4. **Integration Testing**
   - Set VITE_USE_MOCK_DATA=false
   - Test all features

5. **Deploy**
   - Update production .env
   - Build & deploy

---

## 💡 Pro Tips

1. **Develop Fast**
   - Use mock data during UI development
   - No need to wait for backend

2. **Parallel Development**
   - Frontend can develop with mock data
   - Backend implements API simultaneously
   - When both ready, just flip the switch!

3. **Keep Mock Data Updated**
   - When API spec changes, update mock data
   - Ensures consistency

4. **Use Debug Logs**
   - Set VITE_ENABLE_DEBUG_LOGS=true
   - See which data source is being used
   - Helps debugging

5. **Test Both Paths**
   - Test with VITE_USE_MOCK_DATA=true
   - Test with VITE_USE_MOCK_DATA=false
   - Ensure everything works

---

## 📞 Support

If you have questions:
1. Check [FRONTEND_INTEGRATION_QUICKSTART.md](./FRONTEND_INTEGRATION_QUICKSTART.md)
2. Read [INTEGRATION_GUIDE.md](./INTEGRATION_GUIDE.md) - has Q&A section
3. Review [MIGRATION_EXAMPLE.md](./MIGRATION_EXAMPLE.md) - code examples

---

## 🎉 Summary

**Old Way:**
- Mock data hardcoded in components
- Hard to swap to real API
- Lots of manual changes needed

**New Way (This Setup):**
- Mock data in repository layer
- `.env` flag to control data source
- Component code never changes
- Easy parallel development
- Production-ready!

**That's it!** You're ready to:
- ✅ Develop with mock data
- ✅ Switch to real backend when ready
- ✅ Deploy to production
- ✅ Never worry about data source again

Happy coding! 🚀
