# ============================================
# 📌 QUICK START GUIDE - Frontend Integration
# ============================================

## Mục tiêu
Giúp bạn dễ dàng chuyển từ mock data → real Spring Boot backend

## 📂 File quan trọng
1. `.env` - Cấu hình chính (mock vs real)
2. `src/config/environment.ts` - Cấu hình TypeScript
3. `src/repositories/` - Repository pattern (dễ swap data source)
4. `SPRING_BOOT_API_SPEC.md` - Backend API spec
5. `INTEGRATION_GUIDE.md` - Chi tiết hướng dẫn

## 🚀 3 Bước Cơ Bản

### Step 1: Copy `.env` file
```bash
cp .env.example .env
```

### Step 2: Kiểm tra mock data hoạt động
```bash
npm run dev
# Mở http://localhost:5173
# Xem F12 Console → 🎭 Mock Data logs
```

### Step 3: Khi backend ready (Spring Boot)
```bash
# Cập nhật .env
VITE_API_BASE_URL=http://localhost:8080/api
VITE_USE_MOCK_DATA=false

# Restart dev server
npm run dev

# Mở F12 Network tab → sẽ thấy API calls
```

## 📋 Repository Pattern là gì?

**Trước:**
- Service gọi API trực tiếp
- Muốn dùng mock data phải handle riêng
- Khó swap data source

**Sau:**
- Repository lựa chọn (mock vs real API)
- Component chỉ cần gọi `tuitionRepository.getAllTuitions()`
- `.env` flag tự động switch

## 🔄 Mock vs Real Data

| Feature | Mock Data | Real API |
|---------|-----------|----------|
| Data source | `src/app/data/mockTuitionData.ts` | Spring Boot backend |
| No network latency | ✅ Instant | ❌ Network delay |
| Data changes persist | ❌ No (browser reload = reset) | ✅ Yes (database) |
| Development speed | ✅ Fast | ⚠️ Slower (need backend) |
| Production ready | ❌ No | ✅ Yes |
| Switch method | Change `.env` + restart | Change `.env` + restart |

## 🎯 Checklist

### Development (Mock Data)
- [ ] `npm run dev` hoạt động
- [ ] `VITE_USE_MOCK_DATA=true`
- [ ] F12 Console thấy 🎭 Mock Data logs
- [ ] Tất cả pages load data

### Integration (Real API)
- [ ] Spring Boot backend running (port 8080)
- [ ] `VITE_API_BASE_URL=http://localhost:8080/api`
- [ ] `VITE_USE_MOCK_DATA=false`
- [ ] F12 Network tab thấy API calls
- [ ] F12 Console thấy ✅ Real API logs
- [ ] Test login/logout, CRUD operations

## 🆘 Troubleshooting

**Không thấy data?**
```bash
# 1. Check .env
cat .env | grep VITE_USE_MOCK_DATA

# 2. Clear cache
Ctrl+Shift+Delete (browser cache clear)

# 3. Hard refresh
Ctrl+Shift+R

# 4. Check logs
F12 → Console tab
```

**"Cannot GET /api/tuitions"?**
```bash
# 1. Backend not running
# Start Spring Boot: mvn spring-boot:run

# 2. Check backend URL in .env
VITE_API_BASE_URL=http://localhost:8080/api

# 3. Check CORS enabled in backend
```

**"401 Unauthorized"?**
```bash
# Re-login
# Go to http://localhost:5173/login
```

## 📚 Full Documentation

- [INTEGRATION_GUIDE.md](./INTEGRATION_GUIDE.md) - Chi tiết integration steps
- [SPRING_BOOT_API_SPEC.md](./SPRING_BOOT_API_SPEC.md) - Backend API specification
- [src/repositories/tuitionRepository.ts](./src/repositories/tuitionRepository.ts) - Repository implementation

## 💡 Pro Tips

1. **Develop fast with mock data**
   - No need to wait for backend
   - Focus on UI/UX
   - Test all scenarios with mock data

2. **Test both paths before production**
   - Test with mock data (VITE_USE_MOCK_DATA=true)
   - Test with real API (VITE_USE_MOCK_DATA=false)

3. **Use debug logs**
   - Set VITE_ENABLE_DEBUG_LOGS=true in dev
   - Helps see what data is being used

4. **Keep mock data in sync**
   - When API changes, update mock data too
   - MockTuitionRepository in `src/repositories/tuitionRepository.ts`

## 🔗 Quick Links

- Environment config: [src/config/environment.ts](./src/config/environment.ts)
- Tuition repository: [src/repositories/tuitionRepository.ts](./src/repositories/tuitionRepository.ts)
- Mock data: [src/app/data/mockTuitionData.ts](./src/app/data/mockTuitionData.ts)
- API client: [src/services/api.ts](./src/services/api.ts)

---

**Nếu có câu hỏi, xem [INTEGRATION_GUIDE.md](./INTEGRATION_GUIDE.md) để biết chi tiết!**
