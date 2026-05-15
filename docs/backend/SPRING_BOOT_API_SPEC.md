# Spring Boot Backend API Specification

Tài liệu này mô tả API endpoints mà backend Spring Boot cần implement để frontend có thể kết nối.

## 📋 Tổng quan

- **Base URL**: `http://localhost:8080/api` (dev) hoặc từ `.env` VITE_API_BASE_URL
- **Authentication**: JWT Bearer Token (header: `Authorization: Bearer <token>`)
- **Content-Type**: `application/json`
- **Response Format**: Tất cả responses phải trả về JSON

---

## 🔐 Authentication Endpoints

### POST `/auth/login`
Đăng nhập người dùng

**Request:**
```json
{
  "email": "user@example.com",
  "password": "password123"
}
```

**Response (200):**
```json
{
  "accessToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "refreshToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "id": "user123",
    "email": "user@example.com",
    "role": "student",
    "fullName": "Nguyễn Văn A"
  }
}
```

### POST `/auth/refresh`
Refresh access token

**Request:**
```json
{
  "refreshToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

**Response (200):**
```json
{
  "accessToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

### POST `/auth/logout`
Đăng xuất

**Response (200):**
```json
{
  "message": "Logout successful"
}
```

---

## 💰 Tuition Management Endpoints

### GET `/tuitions`
Lấy danh sách tất cả học phí

**Query Parameters:**
- `status` (optional): 'paid', 'pending', 'failed'
- `page` (optional): Số trang (default: 1)
- `limit` (optional): Số bản ghi mỗi trang (default: 20)

**Response (200):**
```json
[
  {
    "id": "TUI001",
    "studentName": "Nguyễn Văn An",
    "studentCode": "SV001",
    "email": "an.nguyen@student.edu.vn",
    "phone": "0901234567",
    "major": "Công nghệ Phần mềm",
    "semester": "HK2 2025-2026",
    "amount": 5000000,
    "status": "paid",
    "createdDate": "2026-03-01",
    "dueDate": "2026-03-15",
    "paidDate": "2026-03-10",
    "paymentMethod": "transfer",
    "transactionRef": "VCB20260310001",
    "confirmedBy": "Nguyễn Văn Lộc",
    "confirmedAt": "2026-03-10T14:30:00",
    "courses": [
      {
        "id": "C001",
        "code": "CS301",
        "name": "Lập trình Web nâng cao",
        "credits": 3,
        "pricePerCredit": 500000,
        "total": 1500000
      }
    ],
    "discount": 0,
    "note": "Học phí học kỳ 2 năm học 2025-2026"
  }
]
```

### GET `/tuitions/{id}`
Lấy thông tin học phí theo ID

**Response (200):**
```json
{
  "id": "TUI001",
  "studentName": "Nguyễn Văn An",
  "studentCode": "SV001",
  ...
}
```

**Response (404):**
```json
{
  "error": "Tuition not found",
  "code": "TUITION_NOT_FOUND"
}
```

### GET `/tuitions/stats`
Lấy thống kê học phí

**Response (200):**
```json
{
  "totalRecords": 45,
  "totalAmount": 225000000,
  "paidAmount": 180000000,
  "pendingAmount": 45000000,
  "failedAmount": 0,
  "averageAmount": 5000000,
  "paidCount": 36,
  "pendingCount": 9,
  "failedCount": 0,
  "paidPercentage": 80,
  "pendingPercentage": 20,
  "failedPercentage": 0
}
```

### POST `/tuitions`
Tạo bản ghi học phí mới

**Request:**
```json
{
  "studentName": "Trần Thị Bình",
  "studentCode": "SV002",
  "email": "binh.tran@student.edu.vn",
  "phone": "0902345678",
  "major": "Khoa học Máy tính",
  "semester": "HK2 2025-2026",
  "amount": 7500000,
  "courses": [
    {
      "code": "CS201",
      "name": "Trí tuệ Nhân tạo",
      "credits": 4,
      "pricePerCredit": 600000
    }
  ],
  "discount": 0,
  "note": "Học phí mới"
}
```

**Response (201):**
```json
{
  "id": "TUI123",
  "studentName": "Trần Thị Bình",
  ...
}
```

### PUT `/tuitions/{id}`
Cập nhật bản ghi học phí

**Request:**
```json
{
  "status": "paid",
  "paidDate": "2026-03-15",
  "paymentMethod": "transfer",
  "transactionRef": "VCB20260315001",
  "confirmedBy": "Nguyễn Văn Lộc",
  "confirmedAt": "2026-03-15T10:00:00"
}
```

**Response (200):**
```json
{
  "id": "TUI001",
  "status": "paid",
  ...
}
```

### DELETE `/tuitions/{id}`
Xóa bản ghi học phí

**Response (204):** No content

**Response (404):**
```json
{
  "error": "Tuition not found"
}
```

---

## 👨‍🎓 Student Endpoints

### GET `/students/me`
Lấy thông tin học sinh hiện tại (dựa vào JWT token)

**Response (200):**
```json
{
  "id": "STU001",
  "email": "student@example.com",
  "fullName": "Nguyễn Văn An",
  "phone": "0901234567",
  "address": "123 Đường ABC, Quận 1, TP.HCM",
  "avatar": "https://...",
  "enrollmentDate": "2023-09-01",
  "status": "active"
}
```

### GET `/students/{id}`
Lấy thông tin học sinh theo ID

### GET `/courses`
Lấy danh sách các khóa học mà học sinh đã đăng ký

**Response (200):**
```json
[
  {
    "id": "CRS001",
    "code": "CS301",
    "name": "Lập trình Web nâng cao",
    "credits": 3,
    "instructor": "TS. Nguyễn Văn Lộc",
    "status": "active",
    "grade": null
  }
]
```

### GET `/schedules`
Lấy lịch học của học sinh

**Response (200):**
```json
[
  {
    "id": "SCH001",
    "courseId": "CRS001",
    "courseName": "Lập trình Web nâng cao",
    "instructor": "TS. Nguyễn Văn Lộc",
    "dayOfWeek": "Monday",
    "startTime": "08:00",
    "endTime": "10:00",
    "room": "401",
    "building": "A"
  }
]
```

### GET `/grades`
Lấy điểm của học sinh

**Response (200):**
```json
[
  {
    "courseId": "CRS001",
    "courseName": "Lập trình Web nâng cao",
    "code": "CS301",
    "midtermScore": 8.5,
    "finalScore": 8.0,
    "practiceScore": 9.0,
    "totalScore": 8.5,
    "grade": "A",
    "gpa": 4.0
  }
]
```

### GET `/attendance`
Lấy bản ghi điểm danh của học sinh

**Response (200):**
```json
[
  {
    "id": "ATT001",
    "courseId": "CRS001",
    "courseName": "Lập trình Web nâng cao",
    "date": "2026-03-10",
    "status": "present",
    "note": ""
  }
]
```

### PUT `/students/me`
Cập nhật thông tin học sinh hiện tại

**Request:**
```json
{
  "fullName": "Nguyễn Văn An",
  "phone": "0901234567",
  "address": "..."
}
```

### POST `/courses/register`
Đăng ký khóa học

**Request:**
```json
{
  "courseIds": ["CRS001", "CRS002", "CRS003"]
}
```

**Response (200):**
```json
{
  "success": true,
  "message": "Đăng ký khóa học thành công",
  "registeredCourses": ["CRS001", "CRS002", "CRS003"]
}
```

---

## 📊 Admin Endpoints

### GET `/admin/accounts`
Lấy danh sách tài khoản (Admin only)

### GET `/admin/departments`
Lấy danh sách phòng ban (Admin only)

### GET `/admin/statistics`
Lấy thống kê hệ thống (Admin only)

---

## ⚠️ Error Responses

Tất cả errors phải follow format này:

```json
{
  "error": "Descriptive error message",
  "code": "ERROR_CODE",
  "status": 400,
  "timestamp": "2026-03-15T10:30:00Z"
}
```

**HTTP Status Codes:**
- `200` - OK
- `201` - Created
- `204` - No Content
- `400` - Bad Request
- `401` - Unauthorized
- `403` - Forbidden
- `404` - Not Found
- `409` - Conflict
- `500` - Internal Server Error
- `503` - Service Unavailable

---

## 🔄 Data Types Reference

### TuitionRecord
```typescript
interface TuitionRecord {
  id: string;
  studentName: string;
  studentCode: string;
  email: string;
  phone: string;
  major: string;
  semester: string;
  amount: number;
  status: 'paid' | 'pending' | 'failed';
  createdDate: string; // ISO 8601 format
  dueDate: string;
  paidDate?: string;
  paymentMethod?: 'cash' | 'transfer' | 'card' | 'ewallet';
  transactionRef?: string;
  confirmedBy?: string;
  confirmedAt?: string; // ISO 8601 format
  failureReason?: string;
  courses: CourseItem[];
  discount: number;
  note?: string;
}

interface CourseItem {
  id: string;
  code: string;
  name: string;
  credits: number;
  pricePerCredit: number;
  total: number;
}

interface TuitionStats {
  totalRecords: number;
  totalAmount: number;
  paidAmount: number;
  pendingAmount: number;
  failedAmount: number;
  averageAmount: number;
  paidCount: number;
  pendingCount: number;
  failedCount: number;
  paidPercentage: number;
  pendingPercentage: number;
  failedPercentage: number;
}
```

---

## 📝 Example: Spring Boot Controller Implementation

```java
@RestController
@RequestMapping("/api/tuitions")
@CrossOrigin(origins = "*", maxAge = 3600)
public class TuitionController {

    @Autowired
    private TuitionService tuitionService;

    @GetMapping
    public ResponseEntity<?> getAllTuitions(
        @RequestParam(required = false) String status,
        @RequestParam(defaultValue = "1") int page,
        @RequestParam(defaultValue = "20") int limit
    ) {
        try {
            List<TuitionDTO> tuitions = tuitionService.getAllTuitions(status, page, limit);
            return ResponseEntity.ok(tuitions);
        } catch (Exception e) {
            return ResponseEntity.status(500)
                .body(new ErrorResponse("Internal server error", "INTERNAL_ERROR", 500));
        }
    }

    @GetMapping("/{id}")
    public ResponseEntity<?> getTuitionById(@PathVariable String id) {
        try {
            TuitionDTO tuition = tuitionService.getTuitionById(id);
            if (tuition == null) {
                return ResponseEntity.status(404)
                    .body(new ErrorResponse("Tuition not found", "TUITION_NOT_FOUND", 404));
            }
            return ResponseEntity.ok(tuition);
        } catch (Exception e) {
            return ResponseEntity.status(500)
                .body(new ErrorResponse("Internal server error", "INTERNAL_ERROR", 500));
        }
    }

    @GetMapping("/stats")
    public ResponseEntity<?> getTuitionStats() {
        try {
            TuitionStatsDTO stats = tuitionService.getTuitionStats();
            return ResponseEntity.ok(stats);
        } catch (Exception e) {
            return ResponseEntity.status(500)
                .body(new ErrorResponse("Internal server error", "INTERNAL_ERROR", 500));
        }
    }

    @PostMapping
    public ResponseEntity<?> createTuition(@RequestBody CreateTuitionRequest request) {
        try {
            TuitionDTO newTuition = tuitionService.createTuition(request);
            return ResponseEntity.status(201).body(newTuition);
        } catch (Exception e) {
            return ResponseEntity.status(400)
                .body(new ErrorResponse("Bad request", "BAD_REQUEST", 400));
        }
    }

    @PutMapping("/{id}")
    public ResponseEntity<?> updateTuition(
        @PathVariable String id,
        @RequestBody UpdateTuitionRequest request
    ) {
        try {
            TuitionDTO updated = tuitionService.updateTuition(id, request);
            return ResponseEntity.ok(updated);
        } catch (EntityNotFoundException e) {
            return ResponseEntity.status(404)
                .body(new ErrorResponse("Tuition not found", "TUITION_NOT_FOUND", 404));
        } catch (Exception e) {
            return ResponseEntity.status(500)
                .body(new ErrorResponse("Internal server error", "INTERNAL_ERROR", 500));
        }
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<?> deleteTuition(@PathVariable String id) {
        try {
            tuitionService.deleteTuition(id);
            return ResponseEntity.noContent().build();
        } catch (EntityNotFoundException e) {
            return ResponseEntity.status(404)
                .body(new ErrorResponse("Tuition not found", "TUITION_NOT_FOUND", 404));
        } catch (Exception e) {
            return ResponseEntity.status(500)
                .body(new ErrorResponse("Internal server error", "INTERNAL_ERROR", 500));
        }
    }
}
```

---

## 🚀 Testing with Postman / cURL

### Test Get All Tuitions
```bash
curl -X GET http://localhost:8080/api/tuitions \
  -H "Authorization: Bearer <your_jwt_token>" \
  -H "Content-Type: application/json"
```

### Test Get Tuition by Status
```bash
curl -X GET "http://localhost:8080/api/tuitions?status=pending" \
  -H "Authorization: Bearer <your_jwt_token>" \
  -H "Content-Type: application/json"
```

### Test Create Tuition
```bash
curl -X POST http://localhost:8080/api/tuitions \
  -H "Authorization: Bearer <your_jwt_token>" \
  -H "Content-Type: application/json" \
  -d '{
    "studentName": "Nguyễn Văn A",
    "studentCode": "SV001",
    "amount": 5000000,
    ...
  }'
```

---

## 📞 Notes

1. **JWT Token**: Frontend sẽ gửi token ở header `Authorization: Bearer <token>`
2. **CORS**: Backend cần enable CORS để frontend có thể call từ dev server
3. **Date Format**: Dùng ISO 8601 format (YYYY-MM-DD hoặc YYYY-MM-DDTHH:mm:ss)
4. **Pagination**: Implement pagination cho endpoints trả về danh sách lớn
5. **Validation**: Kiểm tra dữ liệu input trước khi xử lý
6. **Error Handling**: Luôn trả về consistent error format
