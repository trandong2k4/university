// ------------------- ENTITY MOCKS -------------------

// ViTri
const viTriMock = [
    { id: 1, tenViTri: "Giảng Viên", moTa: "Giảng dạy các môn học" },
    { id: 2, tenViTri: "Trợ Giảng", moTa: "Hỗ trợ giảng dạy" },
    { id: 3, tenViTri: "Quản Lý Khoa", moTa: "Quản lý hoạt động của khoa" },
    { id: 4, tenViTri: "Kế Toán", moTa: "Quản lý học phí" },
    { id: 5, tenViTri: "Thủ Thư", moTa: "Quản lý tài liệu, thư viện" },
    { id: 6, tenViTri: "Cố Vấn Học Tập", moTa: "Hỗ trợ sinh viên trong học tập" },
    { id: 7, tenViTri: "Trưởng Bộ Môn", moTa: "Điều hành bộ môn" },
    { id: 8, tenViTri: "Nhân Viên Văn Phòng", moTa: "Xử lý giấy tờ, hành chính" },
    { id: 9, tenViTri: "Bảo Vệ", moTa: "Đảm bảo an ninh" },
    { id: 10, tenViTri: "Hiệu Trưởng", moTa: "Điều hành toàn trường" }
];

// Roles
const roleMock = [
    { id: 1, name: "ADMIN", description: "Quản trị hệ thống" },
    { id: 2, name: "MANAGER", description: "Quản lý" },
    { id: 3, name: "USER", description: "Người dùng bình thường" },
    { id: 4, name: "TEACHER", description: "Giáo viên" },
    { id: 5, name: "STUDENT", description: "Sinh viên" },
    { id: 6, name: "ACCOUNTANT", description: "Kế toán" },
    { id: 7, name: "LIBRARIAN", description: "Thủ thư" },
    { id: 8, name: "SUPPORT", description: "Hỗ trợ kỹ thuật" },
    { id: 9, name: "GUEST", description: "Khách" },
    { id: 10, name: "HEAD_DEPT", description: "Trưởng khoa" }
];

// Permissions
const permissionMock = [
    { id: 1, name: "CREATE_USER", description: "Tạo người dùng mới" },
    { id: 2, name: "VIEW_GRADES", description: "Xem điểm số" },
    { id: 3, name: "EDIT_COURSE", description: "Chỉnh sửa khóa học" },
    { id: 4, name: "DELETE_USER", description: "Xóa người dùng" },
    { id: 5, name: "MANAGE_FEES", description: "Quản lý học phí" },
    { id: 6, name: "VIEW_SCHEDULE", description: "Xem lịch học" },
    { id: 7, name: "EDIT_PROFILE", description: "Chỉnh sửa thông tin cá nhân" },
    { id: 8, name: "MANAGE_ROLES", description: "Phân quyền hệ thống" },
    { id: 9, name: "UPLOAD_MATERIAL", description: "Tải tài liệu học tập" },
    { id: 10, name: "ACCESS_CHATBOT", description: "Sử dụng Chatbot AI" }
];

// Users
const userMock = [
    { id: 1, username: "admin1", email: "admin@example.com", fullName: "Admin User", roles: [1] },
    { id: 2, username: "manager1", email: "manager@example.com", fullName: "Manager User", roles: [2] },
    { id: 3, username: "user1", email: "user1@example.com", fullName: "User One", roles: [3] },
    { id: 4, username: "teacher1", email: "teacher1@example.com", fullName: "Teacher One", roles: [4] },
    { id: 5, username: "student1", email: "student1@example.com", fullName: "Student One", roles: [5] },
    { id: 6, username: "student2", email: "student2@example.com", fullName: "Student Two", roles: [5] },
    { id: 7, username: "student3", email: "student3@example.com", fullName: "Student Three", roles: [5] },
    { id: 8, username: "account1", email: "account1@example.com", fullName: "Accountant", roles: [6] },
    { id: 9, username: "librarian1", email: "lib1@example.com", fullName: "Librarian User", roles: [7] },
    { id: 10, username: "guest1", email: "guest1@example.com", fullName: "Guest User", roles: [9] }
];

// NhanVien
const nhanVienMock = [
    { id: 1, maNhanVien: "NV001", tenNhanVien: "Nguyễn Văn A", userId: 1, viTriId: 1 },
    { id: 2, maNhanVien: "NV002", tenNhanVien: "Trần Thị B", userId: 2, viTriId: 3 },
    { id: 3, maNhanVien: "NV003", tenNhanVien: "Lê Văn C", userId: 4, viTriId: 1 },
    { id: 4, maNhanVien: "NV004", tenNhanVien: "Phạm Thị D", userId: 8, viTriId: 4 },
    { id: 5, maNhanVien: "NV005", tenNhanVien: "Hoàng Văn E", userId: 9, viTriId: 5 },
    { id: 6, maNhanVien: "NV006", tenNhanVien: "Ngô Thị F", userId: null, viTriId: 6 },
    { id: 7, maNhanVien: "NV007", tenNhanVien: "Phan Văn G", userId: null, viTriId: 7 },
    { id: 8, maNhanVien: "NV008", tenNhanVien: "Đỗ Thị H", userId: null, viTriId: 8 },
    { id: 9, maNhanVien: "NV009", tenNhanVien: "Bùi Văn I", userId: null, viTriId: 9 },
    { id: 10, maNhanVien: "NV010", tenNhanVien: "Nguyễn Văn J", userId: null, viTriId: 10 }
];

// SinhVien
const sinhVienMock = [
    { id: 1, maSinhVien: "SV001", tenSinhVien: "Lê Văn C", userId: 3 },
    { id: 2, maSinhVien: "SV002", tenSinhVien: "Phạm Thị D", userId: null },
    { id: 3, maSinhVien: "SV003", tenSinhVien: "Nguyễn Văn E", userId: 5 },
    { id: 4, maSinhVien: "SV004", tenSinhVien: "Trần Thị F", userId: 6 },
    { id: 5, maSinhVien: "SV005", tenSinhVien: "Hoàng Văn G", userId: 7 },
    { id: 6, maSinhVien: "SV006", tenSinhVien: "Đỗ Thị H", userId: null },
    { id: 7, maSinhVien: "SV007", tenSinhVien: "Phan Văn I", userId: null },
    { id: 8, maSinhVien: "SV008", tenSinhVien: "Ngô Thị K", userId: null },
    { id: 9, maSinhVien: "SV009", tenSinhVien: "Đinh Văn L", userId: null },
    { id: 10, maSinhVien: "SV010", tenSinhVien: "Bùi Thị M", userId: null }
];

// ------------------- ChiTietSinhVien -------------------
const chiTietSinhVienMock = [
    { id: 1, sinhVienId: 1, diaChi: "Hà Nội", soDienThoai: "0123456789", email: "sv1@example.com" },
    { id: 2, sinhVienId: 2, diaChi: "Hồ Chí Minh", soDienThoai: "0987654321", email: "sv2@example.com" },
    { id: 3, sinhVienId: 3, diaChi: "Đà Nẵng", soDienThoai: "0901234567", email: "sv3@example.com" },
    { id: 4, sinhVienId: 4, diaChi: "Cần Thơ", soDienThoai: "0912345678", email: "sv4@example.com" },
    { id: 5, sinhVienId: 5, diaChi: "Hải Phòng", soDienThoai: "0923456789", email: "sv5@example.com" },
    { id: 6, sinhVienId: 6, diaChi: "Huế", soDienThoai: "0934567890", email: "sv6@example.com" },
    { id: 7, sinhVienId: 7, diaChi: "Nha Trang", soDienThoai: "0945678901", email: "sv7@example.com" },
    { id: 8, sinhVienId: 8, diaChi: "Quảng Nam", soDienThoai: "0956789012", email: "sv8@example.com" },
    { id: 9, sinhVienId: 9, diaChi: "Bình Dương", soDienThoai: "0967890123", email: "sv9@example.com" },
    { id: 10, sinhVienId: 10, diaChi: "Đồng Nai", soDienThoai: "0978901234", email: "sv10@example.com" }
];

// ------------------- NganhHoc -------------------
const nganhHocMock = [
    { id: 1, maNganh: "CNTT", tenNganh: "Công Nghệ Thông Tin", moTa: "Ngành CNTT" },
    { id: 2, maNganh: "KTPM", tenNganh: "Kỹ Thuật Phần Mềm", moTa: "Ngành Phần mềm" },
    { id: 3, maNganh: "KHMT", tenNganh: "Khoa Học Máy Tính", moTa: "Ngành KHMT" },
    { id: 4, maNganh: "HTTT", tenNganh: "Hệ Thống Thông Tin", moTa: "Ngành HTTT" },
    { id: 5, maNganh: "CNPM", tenNganh: "Công Nghệ Phần Mềm", moTa: "Ngành CNPM" },
    { id: 6, maNganh: "ANM", tenNganh: "An Ninh Mạng", moTa: "Ngành bảo mật" },
    { id: 7, maNganh: "TTNT", tenNganh: "Trí Tuệ Nhân Tạo", moTa: "Ngành AI" },
    { id: 8, maNganh: "DLT", tenNganh: "Dữ Liệu Lớn", moTa: "Ngành Big Data" },
    { id: 9, maNganh: "TMĐT", tenNganh: "Thương Mại Điện Tử", moTa: "Ngành TMĐT" },
    { id: 10, maNganh: "MOB", tenNganh: "Lập Trình Di Động", moTa: "Ngành Mobile" }
];

// ------------------- MonHoc -------------------
const monHocMock = [
    { maMonHoc: "CS101", tenMonHoc: "Lập Trình Cơ Bản", moTa: "Nhập môn lập trình", monHocTienQuyetId: null, nganhHocIds: [1, 2] },
    { maMonHoc: "CS102", tenMonHoc: "Lập Trình Nâng Cao", moTa: "C++ nâng cao", monHocTienQuyetId: "CS101", nganhHocIds: [1] },
    { maMonHoc: "CS201", tenMonHoc: "Cấu Trúc Dữ Liệu", moTa: "Data Structures", monHocTienQuyetId: "CS101", nganhHocIds: [1] },
    { maMonHoc: "CS202", tenMonHoc: "Giải Thuật", moTa: "Algorithms", monHocTienQuyetId: "CS201", nganhHocIds: [1] },
    { maMonHoc: "CS301", tenMonHoc: "Trí Tuệ Nhân Tạo", moTa: "AI cơ bản", monHocTienQuyetId: "CS202", nganhHocIds: [7] },
    { maMonHoc: "CS302", tenMonHoc: "Machine Learning", moTa: "Học máy", monHocTienQuyetId: "CS301", nganhHocIds: [7] },
    { maMonHoc: "CS303", tenMonHoc: "Deep Learning", moTa: "Mạng nơ-ron", monHocTienQuyetId: "CS302", nganhHocIds: [7] },
    { maMonHoc: "CS304", tenMonHoc: "Xử Lý Ngôn Ngữ Tự Nhiên", moTa: "NLP", monHocTienQuyetId: "CS302", nganhHocIds: [7] },
    { maMonHoc: "CS305", tenMonHoc: "Thị Giác Máy Tính", moTa: "Computer Vision", monHocTienQuyetId: "CS302", nganhHocIds: [7] },
    { maMonHoc: "CS401", tenMonHoc: "Phân Tích Dữ Liệu", moTa: "Data Analytics", monHocTienQuyetId: "CS202", nganhHocIds: [8] }
];

// ------------------- LoaiTinChi -------------------
const loaiTinChiMock = [
    { id: 1, tenLoai: "Lý Thuyết", soTiet: 15 },
    { id: 2, tenLoai: "Thực Hành", soTiet: 30 },
    { id: 3, tenLoai: "Đồ Án", soTiet: 45 },
    { id: 4, tenLoai: "Seminar", soTiet: 10 },
    { id: 5, tenLoai: "Thí Nghiệm", soTiet: 20 },
    { id: 6, tenLoai: "Online", soTiet: 12 },
    { id: 7, tenLoai: "Workshop", soTiet: 25 },
    { id: 8, tenLoai: "Khóa luận", soTiet: 60 },
    { id: 9, tenLoai: "Thực Tập", soTiet: 90 },
    { id: 10, tenLoai: "Chuyên Đề", soTiet: 8 }
];

// ------------------- TinChi -------------------
const tinChiMock = [
    { id: 1, maTinChi: "TC001", monHocId: "CS101", loaiTinChiId: 1, soLuong: 2 },
    { id: 2, maTinChi: "TC002", monHocId: "CS101", loaiTinChiId: 2, soLuong: 1 },
    { id: 3, maTinChi: "TC003", monHocId: "CS201", loaiTinChiId: 1, soLuong: 3 },
    { id: 4, maTinChi: "TC004", monHocId: "CS202", loaiTinChiId: 1, soLuong: 3 },
    { id: 5, maTinChi: "TC005", monHocId: "CS301", loaiTinChiId: 3, soLuong: 2 },
    { id: 6, maTinChi: "TC006", monHocId: "CS302", loaiTinChiId: 2, soLuong: 2 },
    { id: 7, maTinChi: "TC007", monHocId: "CS303", loaiTinChiId: 3, soLuong: 3 },
    { id: 8, maTinChi: "TC008", monHocId: "CS304", loaiTinChiId: 4, soLuong: 1 },
    { id: 9, maTinChi: "TC009", monHocId: "CS305", loaiTinChiId: 1, soLuong: 3 },
    { id: 10, maTinChi: "TC010", monHocId: "CS401", loaiTinChiId: 1, soLuong: 3 }
];

// ------------------- KiHoc -------------------
const kiHocMock = [
    { id: 1, maKiHoc: "HK12023", tenKiHoc: "Học Kỳ 1 2023-2024", ngayBatDau: "2023-09-01", ngayKetThuc: "2023-12-31" },
    { id: 2, maKiHoc: "HK22023", tenKiHoc: "Học Kỳ 2 2023-2024", ngayBatDau: "2024-01-15", ngayKetThuc: "2024-05-15" },
    { id: 3, maKiHoc: "HK12024", tenKiHoc: "Học Kỳ 1 2024-2025", ngayBatDau: "2024-09-01", ngayKetThuc: "2024-12-31" },
    { id: 4, maKiHoc: "HK22024", tenKiHoc: "Học Kỳ 2 2024-2025", ngayBatDau: "2025-01-15", ngayKetThuc: "2025-05-15" },
    { id: 5, maKiHoc: "HK12025", tenKiHoc: "Học Kỳ 1 2025-2026", ngayBatDau: "2025-09-01", ngayKetThuc: "2025-12-31" },
    { id: 6, maKiHoc: "HK22025", tenKiHoc: "Học Kỳ 2 2025-2026", ngayBatDau: "2026-01-15", ngayKetThuc: "2026-05-15" },
    { id: 7, maKiHoc: "HK12026", tenKiHoc: "Học Kỳ 1 2026-2027", ngayBatDau: "2026-09-01", ngayKetThuc: "2026-12-31" },
    { id: 8, maKiHoc: "HK22026", tenKiHoc: "Học Kỳ 2 2026-2027", ngayBatDau: "2027-01-15", ngayKetThuc: "2027-05-15" },
    { id: 9, maKiHoc: "HK12027", tenKiHoc: "Học Kỳ 1 2027-2028", ngayBatDau: "2027-09-01", ngayKetThuc: "2027-12-31" },
    { id: 10, maKiHoc: "HK22027", tenKiHoc: "Học Kỳ 2 2027-2028", ngayBatDau: "2028-01-15", ngayKetThuc: "2028-05-15" }
];

// ------------------- PhongHoc -------------------
const phongHocMock = [
    { id: 1, maPhong: "A101", tenPhong: "Phòng học A101", sucChua: 50, diaDiem: "Tòa nhà A" },
    { id: 2, maPhong: "B202", tenPhong: "Phòng lab B202", sucChua: 30, diaDiem: "Tòa nhà B" },
    { id: 3, maPhong: "C303", tenPhong: "Phòng học C303", sucChua: 40, diaDiem: "Tòa nhà C" },
    { id: 4, maPhong: "D404", tenPhong: "Phòng máy D404", sucChua: 35, diaDiem: "Tòa nhà D" },
    { id: 5, maPhong: "E505", tenPhong: "Phòng học E505", sucChua: 60, diaDiem: "Tòa nhà E" },
    { id: 6, maPhong: "F606", tenPhong: "Phòng học F606", sucChua: 45, diaDiem: "Tòa nhà F" },
    { id: 7, maPhong: "G707", tenPhong: "Phòng học G707", sucChua: 55, diaDiem: "Tòa nhà G" },
    { id: 8, maPhong: "H808", tenPhong: "Phòng học H808", sucChua: 25, diaDiem: "Tòa nhà H" },
    { id: 9, maPhong: "I909", tenPhong: "Phòng lab I909", sucChua: 20, diaDiem: "Tòa nhà I" },
    { id: 10, maPhong: "J010", tenPhong: "Phòng học J010", sucChua: 70, diaDiem: "Tòa nhà J" }
];

// ------------------- GioHoc -------------------
const gioHocMock = [
    { id: 1, maGioHoc: "GH1", tietBatDau: 1, tietKetThuc: 3, gioBatDau: "07:30", gioKetThuc: "10:00" },
    { id: 2, maGioHoc: "GH2", tietBatDau: 4, tietKetThuc: 6, gioBatDau: "10:15", gioKetThuc: "12:45" },
    { id: 3, maGioHoc: "GH3", tietBatDau: 7, tietKetThuc: 9, gioBatDau: "13:30", gioKetThuc: "16:00" },
    { id: 4, maGioHoc: "GH4", tietBatDau: 10, tietKetThuc: 12, gioBatDau: "16:15", gioKetThuc: "18:45" },
    { id: 5, maGioHoc: "GH5", tietBatDau: 1, tietKetThuc: 2, gioBatDau: "07:00", gioKetThuc: "08:30" },
    { id: 6, maGioHoc: "GH6", tietBatDau: 3, tietKetThuc: 5, gioBatDau: "08:45", gioKetThuc: "11:15" },
    { id: 7, maGioHoc: "GH7", tietBatDau: 6, tietKetThuc: 8, gioBatDau: "12:30", gioKetThuc: "15:00" },
    { id: 8, maGioHoc: "GH8", tietBatDau: 9, tietKetThuc: 11, gioBatDau: "15:15", gioKetThuc: "17:45" },
    { id: 9, maGioHoc: "GH9", tietBatDau: 1, tietKetThuc: 4, gioBatDau: "07:00", gioKetThuc: "09:30" },
    { id: 10, maGioHoc: "GH10", tietBatDau: 5, tietKetThuc: 7, gioBatDau: "09:45", gioKetThuc: "12:15" }
];

// ------------------- BuoiHoc -------------------
const buoiHocMock = [
    { id: 1, maBuoiHoc: "BH001", tenBuoi: "Sáng", moTa: "Buổi sáng" },
    { id: 2, maBuoiHoc: "BH002", tenBuoi: "Chiều", moTa: "Buổi chiều" },
    { id: 3, maBuoiHoc: "BH003", tenBuoi: "Tối", moTa: "Buổi tối" },
    { id: 4, maBuoiHoc: "BH004", tenBuoi: "Cuối tuần sáng", moTa: "Sáng cuối tuần" },
    { id: 5, maBuoiHoc: "BH005", tenBuoi: "Cuối tuần chiều", moTa: "Chiều cuối tuần" },
    { id: 6, maBuoiHoc: "BH006", tenBuoi: "Online sáng", moTa: "Học online buổi sáng" },
    { id: 7, maBuoiHoc: "BH007", tenBuoi: "Online chiều", moTa: "Học online buổi chiều" },
    { id: 8, maBuoiHoc: "BH008", tenBuoi: "Online tối", moTa: "Học online buổi tối" },
    { id: 9, maBuoiHoc: "BH009", tenBuoi: "Bổ sung sáng", moTa: "Học thêm sáng" },
    { id: 10, maBuoiHoc: "BH010", tenBuoi: "Bổ sung chiều", moTa: "Học thêm chiều" }
];

// ------------------- LichHoc -------------------
const lichHocMock = [
    { id: 1, maLichHoc: "LH001", monHocId: "CS101", phongHocId: 1, gioHocId: 1, buoiHocId: 1, kiHocId: 1, thuTrongTuan: 2 },
    { id: 2, maLichHoc: "LH002", monHocId: "CS201", phongHocId: 2, gioHocId: 2, buoiHocId: 2, kiHocId: 1, thuTrongTuan: 4 },
    { id: 3, maLichHoc: "LH003", monHocId: "CS202", phongHocId: 3, gioHocId: 3, buoiHocId: 3, kiHocId: 2, thuTrongTuan: 3 },
    { id: 4, maLichHoc: "LH004", monHocId: "CS301", phongHocId: 4, gioHocId: 4, buoiHocId: 1, kiHocId: 2, thuTrongTuan: 5 },
    { id: 5, maLichHoc: "LH005", monHocId: "CS302", phongHocId: 5, gioHocId: 5, buoiHocId: 2, kiHocId: 3, thuTrongTuan: 2 },
    { id: 6, maLichHoc: "LH006", monHocId: "CS303", phongHocId: 6, gioHocId: 6, buoiHocId: 3, kiHocId: 3, thuTrongTuan: 4 },
    { id: 7, maLichHoc: "LH007", monHocId: "CS304", phongHocId: 7, gioHocId: 7, buoiHocId: 1, kiHocId: 4, thuTrongTuan: 5 },
    { id: 8, maLichHoc: "LH008", monHocId: "CS305", phongHocId: 8, gioHocId: 8, buoiHocId: 2, kiHocId: 4, thuTrongTuan: 3 },
    { id: 9, maLichHoc: "LH009", monHocId: "CS401", phongHocId: 9, gioHocId: 9, buoiHocId: 3, kiHocId: 5, thuTrongTuan: 4 },
    { id: 10, maLichHoc: "LH010", monHocId: "CS102", phongHocId: 10, gioHocId: 10, buoiHocId: 1, kiHocId: 5, thuTrongTuan: 2 }
];

// ------------------- KetQuaHocTap -------------------
const ketQuaHocTapMock = [
    { id: 1, sinhVienId: 1, monHocId: "CS101", kiHocId: 1, diemQuaTrinh: 8.5, diemCuoiKy: 7.0, diemTongKet: 7.75, xepLoai: "B" },
    { id: 2, sinhVienId: 2, monHocId: "CS101", kiHocId: 1, diemQuaTrinh: 9.0, diemCuoiKy: 8.5, diemTongKet: 8.75, xepLoai: "A" },
    { id: 3, sinhVienId: 3, monHocId: "CS201", kiHocId: 2, diemQuaTrinh: 7.0, diemCuoiKy: 7.5, diemTongKet: 7.25, xepLoai: "B" },
    { id: 4, sinhVienId: 4, monHocId: "CS202", kiHocId: 2, diemQuaTrinh: 6.5, diemCuoiKy: 7.0, diemTongKet: 6.75, xepLoai: "C" },
    { id: 5, sinhVienId: 5, monHocId: "CS301", kiHocId: 3, diemQuaTrinh: 8.0, diemCuoiKy: 8.0, diemTongKet: 8.0, xepLoai: "B+" },
    { id: 6, sinhVienId: 6, monHocId: "CS302", kiHocId: 3, diemQuaTrinh: 9.5, diemCuoiKy: 9.0, diemTongKet: 9.25, xepLoai: "A+" },
    { id: 7, sinhVienId: 7, monHocId: "CS303", kiHocId: 4, diemQuaTrinh: 7.5, diemCuoiKy: 8.0, diemTongKet: 7.75, xepLoai: "B" },
    { id: 8, sinhVienId: 8, monHocId: "CS304", kiHocId: 4, diemQuaTrinh: 6.0, diemCuoiKy: 6.5, diemTongKet: 6.25, xepLoai: "C" },
    { id: 9, sinhVienId: 9, monHocId: "CS305", kiHocId: 5, diemQuaTrinh: 8.0, diemCuoiKy: 7.5, diemTongKet: 7.75, xepLoai: "B" },
    { id: 10, sinhVienId: 10, monHocId: "CS401", kiHocId: 5, diemQuaTrinh: 9.0, diemCuoiKy: 9.5, diemTongKet: 9.25, xepLoai: "A+" }
];

// ------------------- HocLai -------------------
const hocLaiMock = [
    { id: 1, sinhVienId: 1, monHocId: "CS201", kiHocId: 1, lanHoc: 2, ketQuaHocTapId: null },
    { id: 2, sinhVienId: 2, monHocId: "CS101", kiHocId: 2, lanHoc: 1, ketQuaHocTapId: null },
    { id: 3, sinhVienId: 3, monHocId: "CS202", kiHocId: 2, lanHoc: 2, ketQuaHocTapId: null },
    { id: 4, sinhVienId: 4, monHocId: "CS301", kiHocId: 3, lanHoc: 1, ketQuaHocTapId: null },
    { id: 5, sinhVienId: 5, monHocId: "CS302", kiHocId: 3, lanHoc: 2, ketQuaHocTapId: null },
    { id: 6, sinhVienId: 6, monHocId: "CS303", kiHocId: 4, lanHoc: 1, ketQuaHocTapId: null },
    { id: 7, sinhVienId: 7, monHocId: "CS304", kiHocId: 4, lanHoc: 2, ketQuaHocTapId: null },
    { id: 8, sinhVienId: 8, monHocId: "CS305", kiHocId: 5, lanHoc: 1, ketQuaHocTapId: null },
    { id: 9, sinhVienId: 9, monHocId: "CS401", kiHocId: 5, lanHoc: 2, ketQuaHocTapId: null },
    { id: 10, sinhVienId: 10, monHocId: "CS102", kiHocId: 5, lanHoc: 1, ketQuaHocTapId: null }
];

// ------------------- HocPhi -------------------
const hocPhiMock = [
    { id: 1, sinhVienId: 1, kiHocId: 1, soTien: 5000000, ngayDong: "2023-08-25", trangThai: "Đã đóng" },
    { id: 2, sinhVienId: 2, kiHocId: 1, soTien: 5000000, ngayDong: null, trangThai: "Chưa đóng" },
    { id: 3, sinhVienId: 3, kiHocId: 2, soTien: 5200000, ngayDong: "2024-02-01", trangThai: "Đã đóng" },
    { id: 4, sinhVienId: 4, kiHocId: 2, soTien: 5200000, ngayDong: null, trangThai: "Chưa đóng" },
    { id: 5, sinhVienId: 5, kiHocId: 3, soTien: 5500000, ngayDong: "2024-09-10", trangThai: "Đã đóng" },
    { id: 6, sinhVienId: 6, kiHocId: 3, soTien: 5500000, ngayDong: null, trangThai: "Chưa đóng" },
    { id: 7, sinhVienId: 7, kiHocId: 4, soTien: 5800000, ngayDong: "2025-02-05", trangThai: "Đã đóng" },
    { id: 8, sinhVienId: 8, kiHocId: 4, soTien: 5800000, ngayDong: null, trangThai: "Chưa đóng" },
    { id: 9, sinhVienId: 9, kiHocId: 5, soTien: 6000000, ngayDong: "2025-09-15", trangThai: "Đã đóng" },
    { id: 10, sinhVienId: 10, kiHocId: 5, soTien: 6000000, ngayDong: null, trangThai: "Chưa đóng" }
];

// ------------------- InvalidatedToken -------------------
const invalidatedTokenMock = [
    { id: 1, token: "token1...", userId: 1, invalidatedAt: "2023-10-15T14:30:00" },
    { id: 2, token: "token2...", userId: 2, invalidatedAt: "2023-10-16T09:15:00" },
    { id: 3, token: "token3...", userId: 3, invalidatedAt: "2023-11-01T08:00:00" },
    { id: 4, token: "token4...", userId: 4, invalidatedAt: "2023-11-02T09:00:00" },
    { id: 5, token: "token5...", userId: 5, invalidatedAt: "2023-11-03T10:00:00" },
    { id: 6, token: "token6...", userId: 6, invalidatedAt: "2023-11-04T11:00:00" },
    { id: 7, token: "token7...", userId: 7, invalidatedAt: "2023-11-05T12:00:00" },
    { id: 8, token: "token8...", userId: 8, invalidatedAt: "2023-11-06T13:00:00" },
    { id: 9, token: "token9...", userId: 9, invalidatedAt: "2023-11-07T14:00:00" },
    { id: 10, token: "token10...", userId: 10, invalidatedAt: "2023-11-08T15:00:00" }
];




// ------------------- DTO REQUEST MOCKS -------------------


// Authentication Request
const authenticationRequestMock = [
    { username: "admin1", password: "password123" },
    { username: "manager1", password: "manager123" },
    { username: "user1", password: "userpass1" },
    { username: "teacher1", password: "teacher123" },
    { username: "student1", password: "student123" },
    { username: "student2", password: "student234" },
    { username: "student3", password: "student345" },
    { username: "account1", password: "account123" },
    { username: "librarian1", password: "lib123" },
    { username: "guest1", password: "guest123" }
];

// Introspect Request (giả lập kiểm tra token)
const introspectRequestMock = [
    { token: "jwt_token_1" },
    { token: "jwt_token_2" },
    { token: "jwt_token_3" },
    { token: "jwt_token_4" },
    { token: "jwt_token_5" },
    { token: "jwt_token_6" },
    { token: "jwt_token_7" },
    { token: "jwt_token_8" },
    { token: "jwt_token_9" },
    { token: "jwt_token_10" }
];

// LoaiTinChi Request
const loaiTinChiRequestMock = [
    { tenLoai: "Lý Thuyết", soTiet: 15 },
    { tenLoai: "Thực Hành", soTiet: 30 },
    { tenLoai: "Đồ Án", soTiet: 45 },
    { tenLoai: "Seminar", soTiet: 10 },
    { tenLoai: "Thí Nghiệm", soTiet: 20 },
    { tenLoai: "Online", soTiet: 12 },
    { tenLoai: "Workshop", soTiet: 25 },
    { tenLoai: "Khóa luận", soTiet: 60 },
    { tenLoai: "Thực Tập", soTiet: 90 },
    { tenLoai: "Chuyên Đề", soTiet: 8 }
];

// Logout Request
const logoutRequestMock = [
    { token: "jwt_logout_1" },
    { token: "jwt_logout_2" },
    { token: "jwt_logout_3" },
    { token: "jwt_logout_4" },
    { token: "jwt_logout_5" },
    { token: "jwt_logout_6" },
    { token: "jwt_logout_7" },
    { token: "jwt_logout_8" },
    { token: "jwt_logout_9" },
    { token: "jwt_logout_10" }
];

// Refresh Request
const refreshRequestMock = [
    { refreshToken: "refresh_token_1" },
    { refreshToken: "refresh_token_2" },
    { refreshToken: "refresh_token_3" },
    { refreshToken: "refresh_token_4" },
    { refreshToken: "refresh_token_5" },
    { refreshToken: "refresh_token_6" },
    { refreshToken: "refresh_token_7" },
    { refreshToken: "refresh_token_8" },
    { refreshToken: "refresh_token_9" },
    { refreshToken: "refresh_token_10" }
];

// Role Request
const roleRequestMock = [
    { name: "ADMIN", description: "Quản trị hệ thống", permissions: [1, 2, 3] },
    { name: "MANAGER", description: "Quản lý", permissions: [2, 5, 6] },
    { name: "USER", description: "Người dùng", permissions: [6, 7] },
    { name: "TEACHER", description: "Giáo viên", permissions: [2, 3, 9] },
    { name: "STUDENT", description: "Sinh viên", permissions: [6, 10] },
    { name: "ACCOUNTANT", description: "Kế toán", permissions: [5] },
    { name: "LIBRARIAN", description: "Thủ thư", permissions: [9] },
    { name: "SUPPORT", description: "Hỗ trợ kỹ thuật", permissions: [7, 8] },
    { name: "GUEST", description: "Khách", permissions: [] },
    { name: "HEAD_DEPT", description: "Trưởng khoa", permissions: [1, 2, 8] }
];

// BuoiHoc Create Request
const buoiHocCreateRequestMock = [
    { maBuoiHoc: "BH001", tenBuoi: "Sáng", moTa: "Học buổi sáng" },
    { maBuoiHoc: "BH002", tenBuoi: "Chiều", moTa: "Học buổi chiều" },
    { maBuoiHoc: "BH003", tenBuoi: "Tối", moTa: "Học buổi tối" },
    { maBuoiHoc: "BH004", tenBuoi: "Cuối tuần sáng", moTa: "Học sáng cuối tuần" },
    { maBuoiHoc: "BH005", tenBuoi: "Cuối tuần chiều", moTa: "Học chiều cuối tuần" },
    { maBuoiHoc: "BH006", tenBuoi: "Online sáng", moTa: "Học trực tuyến sáng" },
    { maBuoiHoc: "BH007", tenBuoi: "Online chiều", moTa: "Học trực tuyến chiều" },
    { maBuoiHoc: "BH008", tenBuoi: "Online tối", moTa: "Học trực tuyến tối" },
    { maBuoiHoc: "BH009", tenBuoi: "Bổ sung sáng", moTa: "Học thêm sáng" },
    { maBuoiHoc: "BH010", tenBuoi: "Bổ sung chiều", moTa: "Học thêm chiều" }
];

// GioHoc Create Request
const gioHocCreateRequestMock = [
    { maGioHoc: "GH1", tietBatDau: 1, tietKetThuc: 3, gioBatDau: "07:30", gioKetThuc: "10:00" },
    { maGioHoc: "GH2", tietBatDau: 4, tietKetThuc: 6, gioBatDau: "10:15", gioKetThuc: "12:45" },
    { maGioHoc: "GH3", tietBatDau: 7, tietKetThuc: 9, gioBatDau: "13:30", gioKetThuc: "16:00" },
    { maGioHoc: "GH4", tietBatDau: 10, tietKetThuc: 12, gioBatDau: "16:15", gioKetThuc: "18:45" },
    { maGioHoc: "GH5", tietBatDau: 1, tietKetThuc: 2, gioBatDau: "07:00", gioKetThuc: "08:30" },
    { maGioHoc: "GH6", tietBatDau: 3, tietKetThuc: 5, gioBatDau: "08:45", gioKetThuc: "11:15" },
    { maGioHoc: "GH7", tietBatDau: 6, tietKetThuc: 8, gioBatDau: "12:30", gioKetThuc: "15:00" },
    { maGioHoc: "GH8", tietBatDau: 9, tietKetThuc: 11, gioBatDau: "15:15", gioKetThuc: "17:45" },
    { maGioHoc: "GH9", tietBatDau: 1, tietKetThuc: 4, gioBatDau: "07:00", gioKetThuc: "09:30" },
    { maGioHoc: "GH10", tietBatDau: 5, tietKetThuc: 7, gioBatDau: "09:45", gioKetThuc: "12:15" }
];

// KiHoc Create Request
const kiHocCreateRequestMock = [
    { maKiHoc: "HK12023", tenKiHoc: "Học Kỳ 1 2023-2024", ngayBatDau: "2023-09-01", ngayKetThuc: "2023-12-31" },
    { maKiHoc: "HK22023", tenKiHoc: "Học Kỳ 2 2023-2024", ngayBatDau: "2024-01-15", ngayKetThuc: "2024-05-15" },
    { maKiHoc: "HK12024", tenKiHoc: "Học Kỳ 1 2024-2025", ngayBatDau: "2024-09-01", ngayKetThuc: "2024-12-31" },
    { maKiHoc: "HK22024", tenKiHoc: "Học Kỳ 2 2024-2025", ngayBatDau: "2025-01-15", ngayKetThuc: "2025-05-15" },
    { maKiHoc: "HK12025", tenKiHoc: "Học Kỳ 1 2025-2026", ngayBatDau: "2025-09-01", ngayKetThuc: "2025-12-31" },
    { maKiHoc: "HK22025", tenKiHoc: "Học Kỳ 2 2025-2026", ngayBatDau: "2026-01-15", ngayKetThuc: "2026-05-15" },
    { maKiHoc: "HK12026", tenKiHoc: "Học Kỳ 1 2026-2027", ngayBatDau: "2026-09-01", ngayKetThuc: "2026-12-31" },
    { maKiHoc: "HK22026", tenKiHoc: "Học Kỳ 2 2026-2027", ngayBatDau: "2027-01-15", ngayKetThuc: "2027-05-15" },
    { maKiHoc: "HK12027", tenKiHoc: "Học Kỳ 1 2027-2028", ngayBatDau: "2027-09-01", ngayKetThuc: "2027-12-31" },
    { maKiHoc: "HK22027", tenKiHoc: "Học Kỳ 2 2027-2028", ngayBatDau: "2028-01-15", ngayKetThuc: "2028-05-15" }
];

// LichHoc Create Request
const lichHocCreateRequestMock = [
    { maLichHoc: "LH001", monHocId: "CS101", phongHocId: 1, gioHocId: 1, buoiHocId: 1, kiHocId: 1, thuTrongTuan: 2 },
    { maLichHoc: "LH002", monHocId: "CS201", phongHocId: 2, gioHocId: 2, buoiHocId: 2, kiHocId: 1, thuTrongTuan: 4 },
    { maLichHoc: "LH003", monHocId: "CS202", phongHocId: 3, gioHocId: 3, buoiHocId: 3, kiHocId: 2, thuTrongTuan: 3 },
    { maLichHoc: "LH004", monHocId: "CS301", phongHocId: 4, gioHocId: 4, buoiHocId: 1, kiHocId: 2, thuTrongTuan: 5 },
    { maLichHoc: "LH005", monHocId: "CS302", phongHocId: 5, gioHocId: 5, buoiHocId: 2, kiHocId: 3, thuTrongTuan: 2 },
    { maLichHoc: "LH006", monHocId: "CS303", phongHocId: 6, gioHocId: 6, buoiHocId: 3, kiHocId: 3, thuTrongTuan: 4 },
    { maLichHoc: "LH007", monHocId: "CS304", phongHocId: 7, gioHocId: 7, buoiHocId: 1, kiHocId: 4, thuTrongTuan: 5 },
    { maLichHoc: "LH008", monHocId: "CS305", phongHocId: 8, gioHocId: 8, buoiHocId: 2, kiHocId: 4, thuTrongTuan: 3 },
    { maLichHoc: "LH009", monHocId: "CS401", phongHocId: 9, gioHocId: 9, buoiHocId: 3, kiHocId: 5, thuTrongTuan: 4 },
    { maLichHoc: "LH010", monHocId: "CS102", phongHocId: 10, gioHocId: 10, buoiHocId: 1, kiHocId: 5, thuTrongTuan: 2 }
];
// ------------------- MonHoc Create Request -------------------
const monHocCreateRequestMock = [
    { maMonHoc: "CS101", tenMonHoc: "Lập Trình Cơ Bản", moTa: "Nhập môn lập trình", monHocTienQuyetId: null, nganhHocIds: [1, 2] },
    { maMonHoc: "CS102", tenMonHoc: "Lập Trình Nâng Cao", moTa: "C++ nâng cao", monHocTienQuyetId: "CS101", nganhHocIds: [1] },
    { maMonHoc: "CS201", tenMonHoc: "Cấu Trúc Dữ Liệu", moTa: "Data Structures", monHocTienQuyetId: "CS101", nganhHocIds: [1] },
    { maMonHoc: "CS202", tenMonHoc: "Giải Thuật", moTa: "Algorithms", monHocTienQuyetId: "CS201", nganhHocIds: [1] },
    { maMonHoc: "CS301", tenMonHoc: "Trí Tuệ Nhân Tạo", moTa: "AI cơ bản", monHocTienQuyetId: "CS202", nganhHocIds: [7] },
    { maMonHoc: "CS302", tenMonHoc: "Machine Learning", moTa: "Học máy", monHocTienQuyetId: "CS301", nganhHocIds: [7] },
    { maMonHoc: "CS303", tenMonHoc: "Deep Learning", moTa: "Mạng nơ-ron", monHocTienQuyetId: "CS302", nganhHocIds: [7] },
    { maMonHoc: "CS304", tenMonHoc: "Xử Lý Ngôn Ngữ Tự Nhiên", moTa: "NLP", monHocTienQuyetId: "CS302", nganhHocIds: [7] },
    { maMonHoc: "CS305", tenMonHoc: "Thị Giác Máy Tính", moTa: "Computer Vision", monHocTienQuyetId: "CS302", nganhHocIds: [7] },
    { maMonHoc: "CS401", tenMonHoc: "Phân Tích Dữ Liệu", moTa: "Data Analytics", monHocTienQuyetId: "CS202", nganhHocIds: [8] }
];

// ------------------- NganhHoc Request -------------------
const nganhHocRequestMock = [
    { maNganh: "CNTT", tenNganh: "Công Nghệ Thông Tin", moTa: "Ngành CNTT" },
    { maNganh: "KTPM", tenNganh: "Kỹ Thuật Phần Mềm", moTa: "Ngành Phần mềm" },
    { maNganh: "KHMT", tenNganh: "Khoa Học Máy Tính", moTa: "Ngành KHMT" },
    { maNganh: "HTTT", tenNganh: "Hệ Thống Thông Tin", moTa: "Ngành HTTT" },
    { maNganh: "CNPM", tenNganh: "Công Nghệ Phần Mềm", moTa: "Ngành CNPM" },
    { maNganh: "ANM", tenNganh: "An Ninh Mạng", moTa: "Ngành bảo mật" },
    { maNganh: "TTNT", tenNganh: "Trí Tuệ Nhân Tạo", moTa: "Ngành AI" },
    { maNganh: "DLT", tenNganh: "Dữ Liệu Lớn", moTa: "Ngành Big Data" },
    { maNganh: "TMĐT", tenNganh: "Thương Mại Điện Tử", moTa: "Ngành TMĐT" },
    { maNganh: "MOB", tenNganh: "Lập Trình Di Động", moTa: "Ngành Mobile" }
];

// ------------------- Permission Request -------------------
const permissionRequestMock = [
    { name: "CREATE_USER", description: "Tạo người dùng mới" },
    { name: "VIEW_GRADES", description: "Xem điểm số" },
    { name: "EDIT_COURSE", description: "Chỉnh sửa khóa học" },
    { name: "DELETE_USER", description: "Xóa người dùng" },
    { name: "MANAGE_FEES", description: "Quản lý học phí" },
    { name: "VIEW_SCHEDULE", description: "Xem lịch học" },
    { name: "EDIT_PROFILE", description: "Chỉnh sửa thông tin cá nhân" },
    { name: "MANAGE_ROLES", description: "Phân quyền hệ thống" },
    { name: "UPLOAD_MATERIAL", description: "Tải tài liệu học tập" },
    { name: "ACCESS_CHATBOT", description: "Sử dụng Chatbot AI" }
];

// ------------------- PhongHoc Create Request -------------------
const phongHocCreateRequestMock = [
    { maPhong: "A101", tenPhong: "Phòng học A101", sucChua: 50, diaDiem: "Tòa nhà A" },
    { maPhong: "B202", tenPhong: "Phòng lab B202", sucChua: 30, diaDiem: "Tòa nhà B" },
    { maPhong: "C303", tenPhong: "Phòng học C303", sucChua: 40, diaDiem: "Tòa nhà C" },
    { maPhong: "D404", tenPhong: "Phòng máy D404", sucChua: 35, diaDiem: "Tòa nhà D" },
    { maPhong: "E505", tenPhong: "Phòng học E505", sucChua: 60, diaDiem: "Tòa nhà E" },
    { maPhong: "F606", tenPhong: "Phòng học F606", sucChua: 45, diaDiem: "Tòa nhà F" },
    { maPhong: "G707", tenPhong: "Phòng học G707", sucChua: 55, diaDiem: "Tòa nhà G" },
    { maPhong: "H808", tenPhong: "Phòng học H808", sucChua: 25, diaDiem: "Tòa nhà H" },
    { maPhong: "I909", tenPhong: "Phòng lab I909", sucChua: 20, diaDiem: "Tòa nhà I" },
    { maPhong: "J010", tenPhong: "Phòng học J010", sucChua: 70, diaDiem: "Tòa nhà J" }
];

// ------------------- TinChi Create Request -------------------
const tinChiCreateRequestMock = [
    { maTinChi: "TC001", monHocId: "CS101", loaiTinChiId: 1, soLuong: 2 },
    { maTinChi: "TC002", monHocId: "CS101", loaiTinChiId: 2, soLuong: 1 },
    { maTinChi: "TC003", monHocId: "CS201", loaiTinChiId: 1, soLuong: 3 },
    { maTinChi: "TC004", monHocId: "CS202", loaiTinChiId: 1, soLuong: 3 },
    { maTinChi: "TC005", monHocId: "CS301", loaiTinChiId: 3, soLuong: 2 },
    { maTinChi: "TC006", monHocId: "CS302", loaiTinChiId: 2, soLuong: 2 },
    { maTinChi: "TC007", monHocId: "CS303", loaiTinChiId: 3, soLuong: 3 },
    { maTinChi: "TC008", monHocId: "CS304", loaiTinChiId: 4, soLuong: 1 },
    { maTinChi: "TC009", monHocId: "CS305", loaiTinChiId: 1, soLuong: 3 },
    { maTinChi: "TC010", monHocId: "CS401", loaiTinChiId: 1, soLuong: 3 }
];

// ------------------- User Creation Request -------------------
const userCreationRequestMock = [
    { username: "admin1", password: "password123", email: "admin@example.com", fullName: "Admin User", roles: [1] },
    { username: "manager1", password: "manager123", email: "manager@example.com", fullName: "Manager User", roles: [2] },
    { username: "user1", password: "user123", email: "user1@example.com", fullName: "User One", roles: [3] },
    { username: "teacher1", password: "teacher123", email: "teacher1@example.com", fullName: "Teacher One", roles: [4] },
    { username: "student1", password: "student123", email: "student1@example.com", fullName: "Student One", roles: [5] },
    { username: "student2", password: "student234", email: "student2@example.com", fullName: "Student Two", roles: [5] },
    { username: "student3", password: "student345", email: "student3@example.com", fullName: "Student Three", roles: [5] },
    { username: "account1", password: "account123", email: "account1@example.com", fullName: "Accountant", roles: [6] },
    { username: "librarian1", password: "lib123", email: "lib1@example.com", fullName: "Librarian User", roles: [7] },
    { username: "guest1", password: "guest123", email: "guest1@example.com", fullName: "Guest User", roles: [9] }
];

// ------------------- User Update Request -------------------
const userUpdateRequestMock = [
    { id: 1, username: "admin1", email: "newadmin@example.com", fullName: "Admin Updated", roles: [1, 2] },
    { id: 2, username: "manager1", email: "newmanager@example.com", fullName: "Manager Updated", roles: [2] },
    { id: 3, username: "user1", email: "newuser1@example.com", fullName: "User One Updated", roles: [3] },
    { id: 4, username: "teacher1", email: "newteacher1@example.com", fullName: "Teacher One Updated", roles: [4] },
    { id: 5, username: "student1", email: "newstudent1@example.com", fullName: "Student One Updated", roles: [5] },
    { id: 6, username: "student2", email: "newstudent2@example.com", fullName: "Student Two Updated", roles: [5] },
    { id: 7, username: "student3", email: "newstudent3@example.com", fullName: "Student Three Updated", roles: [5] },
    { id: 8, username: "account1", email: "newaccount1@example.com", fullName: "Accountant Updated", roles: [6] },
    { id: 9, username: "librarian1", email: "newlib1@example.com", fullName: "Librarian Updated", roles: [7] },
    { id: 10, username: "guest1", email: "newguest1@example.com", fullName: "Guest Updated", roles: [9] }
];



// ------------------- DTO RESPONSE MOCKS -------------------


// API Response chung
const apiResponseMock = [
    { success: true, message: "Thao tác thành công", data: null },
    { success: false, message: "Đã xảy ra lỗi", data: null },
    { success: true, message: "Tạo mới thành công", data: { id: 1 } },
    { success: true, message: "Cập nhật thành công", data: { id: 2 } },
    { success: true, message: "Xóa thành công", data: { id: 3 } },
    { success: false, message: "Không tìm thấy dữ liệu", data: null },
    { success: true, message: "Đăng nhập thành công", data: { token: "jwt_token_1" } },
    { success: false, message: "Sai mật khẩu", data: null },
    { success: true, message: "Đăng xuất thành công", data: null },
    { success: true, message: "Làm mới token thành công", data: { refreshToken: "refresh_123" } }
];

// Authentication Response
const authenticationResponseMock = [
    { token: "jwt1...", refreshToken: "ref1...", userId: 1, username: "admin1", roles: ["ADMIN"] },
    { token: "jwt2...", refreshToken: "ref2...", userId: 2, username: "manager1", roles: ["MANAGER"] },
    { token: "jwt3...", refreshToken: "ref3...", userId: 3, username: "user1", roles: ["USER"] },
    { token: "jwt4...", refreshToken: "ref4...", userId: 4, username: "teacher1", roles: ["TEACHER"] },
    { token: "jwt5...", refreshToken: "ref5...", userId: 5, username: "student1", roles: ["STUDENT"] },
    { token: "jwt6...", refreshToken: "ref6...", userId: 6, username: "student2", roles: ["STUDENT"] },
    { token: "jwt7...", refreshToken: "ref7...", userId: 7, username: "student3", roles: ["STUDENT"] },
    { token: "jwt8...", refreshToken: "ref8...", userId: 8, username: "account1", roles: ["ACCOUNTANT"] },
    { token: "jwt9...", refreshToken: "ref9...", userId: 9, username: "librarian1", roles: ["LIBRARIAN"] },
    { token: "jwt10...", refreshToken: "ref10...", userId: 10, username: "guest1", roles: ["GUEST"] }
];

// User Response
const userResponseMock = [
    { id: 1, username: "admin1", email: "admin@example.com", fullName: "Admin User", roles: ["ADMIN"] },
    { id: 2, username: "manager1", email: "manager@example.com", fullName: "Manager User", roles: ["MANAGER"] },
    { id: 3, username: "user1", email: "user1@example.com", fullName: "User One", roles: ["USER"] },
    { id: 4, username: "teacher1", email: "teacher1@example.com", fullName: "Teacher One", roles: ["TEACHER"] },
    { id: 5, username: "student1", email: "student1@example.com", fullName: "Student One", roles: ["STUDENT"] },
    { id: 6, username: "student2", email: "student2@example.com", fullName: "Student Two", roles: ["STUDENT"] },
    { id: 7, username: "student3", email: "student3@example.com", fullName: "Student Three", roles: ["STUDENT"] },
    { id: 8, username: "account1", email: "account1@example.com", fullName: "Accountant", roles: ["ACCOUNTANT"] },
    { id: 9, username: "librarian1", email: "lib1@example.com", fullName: "Librarian User", roles: ["LIBRARIAN"] },
    { id: 10, username: "guest1", email: "guest1@example.com", fullName: "Guest User", roles: ["GUEST"] }
];

// SinhVien Response
const sinhVienResponseMock = [
    { id: 1, maSinhVien: "SV001", tenSinhVien: "Lê Văn C", email: "sv1@example.com", kiHocHienTai: "HK12023" },
    { id: 2, maSinhVien: "SV002", tenSinhVien: "Phạm Thị D", email: "sv2@example.com", kiHocHienTai: "HK12023" },
    { id: 3, maSinhVien: "SV003", tenSinhVien: "Nguyễn Văn E", email: "sv3@example.com", kiHocHienTai: "HK22023" },
    { id: 4, maSinhVien: "SV004", tenSinhVien: "Trần Thị F", email: "sv4@example.com", kiHocHienTai: "HK22023" },
    { id: 5, maSinhVien: "SV005", tenSinhVien: "Hoàng Văn G", email: "sv5@example.com", kiHocHienTai: "HK12024" },
    { id: 6, maSinhVien: "SV006", tenSinhVien: "Đỗ Thị H", email: "sv6@example.com", kiHocHienTai: "HK12024" },
    { id: 7, maSinhVien: "SV007", tenSinhVien: "Phan Văn I", email: "sv7@example.com", kiHocHienTai: "HK22024" },
    { id: 8, maSinhVien: "SV008", tenSinhVien: "Ngô Thị K", email: "sv8@example.com", kiHocHienTai: "HK22024" },
    { id: 9, maSinhVien: "SV009", tenSinhVien: "Đinh Văn L", email: "sv9@example.com", kiHocHienTai: "HK12025" },
    { id: 10, maSinhVien: "SV010", tenSinhVien: "Bùi Thị M", email: "sv10@example.com", kiHocHienTai: "HK12025" }
];

// MonHoc Response
const monHocResponseMock = [
    { maMonHoc: "CS101", tenMonHoc: "Lập Trình Cơ Bản", tinChi: 3, trangThai: "Đang mở" },
    { maMonHoc: "CS102", tenMonHoc: "Lập Trình Nâng Cao", tinChi: 3, trangThai: "Đang mở" },
    { maMonHoc: "CS201", tenMonHoc: "Cấu Trúc Dữ Liệu", tinChi: 4, trangThai: "Đang mở" },
    { maMonHoc: "CS202", tenMonHoc: "Giải Thuật", tinChi: 4, trangThai: "Đang mở" },
    { maMonHoc: "CS301", tenMonHoc: "Trí Tuệ Nhân Tạo", tinChi: 3, trangThai: "Sắp mở" },
    { maMonHoc: "CS302", tenMonHoc: "Machine Learning", tinChi: 3, trangThai: "Sắp mở" },
    { maMonHoc: "CS303", tenMonHoc: "Deep Learning", tinChi: 3, trangThai: "Sắp mở" },
    { maMonHoc: "CS304", tenMonHoc: "NLP", tinChi: 3, trangThai: "Đã đóng" },
    { maMonHoc: "CS305", tenMonHoc: "Computer Vision", tinChi: 3, trangThai: "Đã đóng" },
    { maMonHoc: "CS401", tenMonHoc: "Phân Tích Dữ Liệu", tinChi: 3, trangThai: "Đang mở" }
];

// ------------------- KetQuaHocTap Response -------------------
const ketQuaHocTapResponseMock = [
    { id: 1, sinhVienId: 1, monHocId: "CS101", kiHocId: 1, diemTongKet: 7.75, xepLoai: "B" },
    { id: 2, sinhVienId: 2, monHocId: "CS101", kiHocId: 1, diemTongKet: 8.75, xepLoai: "A" },
    { id: 3, sinhVienId: 3, monHocId: "CS201", kiHocId: 2, diemTongKet: 7.25, xepLoai: "B" },
    { id: 4, sinhVienId: 4, monHocId: "CS202", kiHocId: 2, diemTongKet: 6.75, xepLoai: "C" },
    { id: 5, sinhVienId: 5, monHocId: "CS301", kiHocId: 3, diemTongKet: 8.0, xepLoai: "B+" },
    { id: 6, sinhVienId: 6, monHocId: "CS302", kiHocId: 3, diemTongKet: 9.25, xepLoai: "A+" },
    { id: 7, sinhVienId: 7, monHocId: "CS303", kiHocId: 4, diemTongKet: 7.75, xepLoai: "B" },
    { id: 8, sinhVienId: 8, monHocId: "CS304", kiHocId: 4, diemTongKet: 6.25, xepLoai: "C" },
    { id: 9, sinhVienId: 9, monHocId: "CS305", kiHocId: 5, diemTongKet: 7.75, xepLoai: "B" },
    { id: 10, sinhVienId: 10, monHocId: "CS401", kiHocId: 5, diemTongKet: 9.25, xepLoai: "A+" }
];

// ------------------- HocPhi Response -------------------
const hocPhiResponseMock = [
    { id: 1, sinhVienId: 1, kiHocId: 1, soTien: 5000000, trangThai: "Đã đóng" },
    { id: 2, sinhVienId: 2, kiHocId: 1, soTien: 5000000, trangThai: "Chưa đóng" },
    { id: 3, sinhVienId: 3, kiHocId: 2, soTien: 5200000, trangThai: "Đã đóng" },
    { id: 4, sinhVienId: 4, kiHocId: 2, soTien: 5200000, trangThai: "Chưa đóng" },
    { id: 5, sinhVienId: 5, kiHocId: 3, soTien: 5500000, trangThai: "Đã đóng" },
    { id: 6, sinhVienId: 6, kiHocId: 3, soTien: 5500000, trangThai: "Chưa đóng" },
    { id: 7, sinhVienId: 7, kiHocId: 4, soTien: 5800000, trangThai: "Đã đóng" },
    { id: 8, sinhVienId: 8, kiHocId: 4, soTien: 5800000, trangThai: "Chưa đóng" },
    { id: 9, sinhVienId: 9, kiHocId: 5, soTien: 6000000, trangThai: "Đã đóng" },
    { id: 10, sinhVienId: 10, kiHocId: 5, soTien: 6000000, trangThai: "Chưa đóng" }
];

// ------------------- LichHoc Response -------------------
const lichHocResponseMock = [
    { id: 1, maLichHoc: "LH001", monHocId: "CS101", phongHoc: "A101", buoi: "Sáng", thu: 2 },
    { id: 2, maLichHoc: "LH002", monHocId: "CS201", phongHoc: "B202", buoi: "Chiều", thu: 4 },
    { id: 3, maLichHoc: "LH003", monHocId: "CS202", phongHoc: "C303", buoi: "Tối", thu: 3 },
    { id: 4, maLichHoc: "LH004", monHocId: "CS301", phongHoc: "D404", buoi: "Sáng", thu: 5 },
    { id: 5, maLichHoc: "LH005", monHocId: "CS302", phongHoc: "E505", buoi: "Chiều", thu: 2 },
    { id: 6, maLichHoc: "LH006", monHocId: "CS303", phongHoc: "F606", buoi: "Tối", thu: 4 },
    { id: 7, maLichHoc: "LH007", monHocId: "CS304", phongHoc: "G707", buoi: "Sáng", thu: 5 },
    { id: 8, maLichHoc: "LH008", monHocId: "CS305", phongHoc: "H808", buoi: "Chiều", thu: 3 },
    { id: 9, maLichHoc: "LH009", monHocId: "CS401", phongHoc: "I909", buoi: "Tối", thu: 4 },
    { id: 10, maLichHoc: "LH010", monHocId: "CS102", phongHoc: "J010", buoi: "Sáng", thu: 2 }
];


// Other response mocks would follow similar patterns as the entity mocks
// but may include only selected fields and different structure

// Export all mock data
const mockData = {
    entities: {
        viTri: viTriMock,
        role: roleMock,
        permission: permissionMock,
        user: userMock,
        nhanVien: nhanVienMock,
        sinhVien: sinhVienMock,
        chiTietSinhVien: chiTietSinhVienMock,
        nganhHoc: nganhHocMock,
        monHoc: monHocMock,
        loaiTinChi: loaiTinChiMock,
        tinChi: tinChiMock,
        kiHoc: kiHocMock,
        phongHoc: phongHocMock,
        gioHoc: gioHocMock,
        buoiHoc: buoiHocMock,
        lichHoc: lichHocMock,
        ketQuaHocTap: ketQuaHocTapMock,
        hocLai: hocLaiMock,
        hocPhi: hocPhiMock,
        invalidatedToken: invalidatedTokenMock
    },
    dtoRequests: {
        authenticationRequest: authenticationRequestMock,
        buoiHocCreateRequest: buoiHocCreateRequestMock,
        gioHocCreateRequest: gioHocCreateRequestMock,
        introspectRequest: introspectRequestMock,
        kiHocCreateRequest: kiHocCreateRequestMock,
        lichHocCreateRequest: lichHocCreateRequestMock,
        loaiTinChiRequest: loaiTinChiRequestMock,
        logoutRequest: logoutRequestMock,
        monHocCreateRequest: monHocCreateRequestMock,
        nganhHocRequest: nganhHocRequestMock,
        permissionRequest: permissionRequestMock,
        phongHocCreateRequest: phongHocCreateRequestMock,
        refreshRequest: refreshRequestMock,
        roleRequest: roleRequestMock,
        tinChiCreateRequest: tinChiCreateRequestMock,
        userCreationRequest: userCreationRequestMock,
        userUpdateRequest: userUpdateRequestMock
    },
    dtoResponses: {
        apiResponse: apiResponseMock,
        authenticationResponse: authenticationResponseMock,
        userResponse: userResponseMock,
        sinhVienResponse: sinhVienResponseMock,
        monHocResponse: monHocResponseMock,
        ketQuaHocTapResponse: ketQuaHocTapResponseMock,
        hocPhiResponse: hocPhiResponseMock,
        lichHocResponse: lichHocResponseMock
    }
};

export default mockData;

