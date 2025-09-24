// Mock data for your university management system
// ------------------- ENTITY MOCKS -------------------
// Mock ViTri data
const viTriMock = [
    { id: 1, tenViTri: "Giảng Viên", moTa: "Giảng dạy các môn học"
    },
    { id: 2, tenViTri: "Trợ Giảng", moTa: "Hỗ trợ giảng dạy"
    },
    { id: 3, tenViTri: "Quản Lý Khoa", moTa: "Quản lý hoạt động của khoa"
    }
];

// Mock Role data
const roleMock = [
    { id: 1, name: "ADMIN", description: "Quản trị hệ thống"
    },
    { id: 2, name: "MANAGER", description: "Quản lý"
    },
    { id: 3, name: "USER", description: "Người dùng bình thường"
    }
];

// Mock Permission data
const permissionMock = [
    { id: 1, name: "CREATE_USER", description: "Tạo người dùng mới"
    },
    { id: 2, name: "VIEW_GRADES", description: "Xem điểm số"
    },
    { id: 3, name: "EDIT_COURSE", description: "Chỉnh sửa khóa học"
    }
];

// Mock User data
const userMock = [
    { id: 1, username: "admin1", email: "admin@example.com", fullName: "Admin User", roles: [
            1
        ]
    },
    { id: 2, username: "manager1", email: "manager@example.com", fullName: "Manager User", roles: [
            2
        ]
    },
    { id: 3, username: "user1", email: "user@example.com", fullName: "Normal User", roles: [
            3
        ]
    }
];

// Mock NhanVien data
const nhanVienMock = [
    { id: 1, maNhanVien: "NV001", tenNhanVien: "Nguyễn Văn A", userId: 1, viTriId: 1
    },
    { id: 2, maNhanVien: "NV002", tenNhanVien: "Trần Thị B", userId: 2, viTriId: 3
    }
];

// Mock SinhVien data
const sinhVienMock = [
    { id: 1, maSinhVien: "SV001", tenSinhVien: "Lê Văn C", userId: 3
    },
    { id: 2, maSinhVien: "SV002", tenSinhVien: "Phạm Thị D", userId: null
    }
];

// Mock ChiTietSinhVien data
const chiTietSinhVienMock = [
    { id: 1, sinhVienId: 1, diaChi: "Hà Nội", soDienThoai: "0123456789", email: "levanc@example.com"
    },
    { id: 2, sinhVienId: 2, diaChi: "Hồ Chí Minh", soDienThoai: "0987654321", email: "phamthid@example.com"
    }
];

// Mock NganhHoc data
const nganhHocMock = [
    { id: 1, maNganh: "CNTT", tenNganh: "Công Nghệ Thông Tin", moTa: "Chuyên ngành về công nghệ thông tin"
    },
    { id: 2, maNganh: "KTPM", tenNganh: "Kỹ Thuật Phần Mềm", moTa: "Chuyên ngành về phát triển phần mềm"
    }
];

// Mock MonHoc data
const monHocMock = [
    {
    maMonHoc: "CS101",
    tenMonHoc: "Lập Trình Cơ Bản",
    moTa: "Giới thiệu về lập trình",
    monHocTienQuyetId: null,
    nganhHocIds: [
            1,
            2
        ]
    },
    {
    maMonHoc: "CS201", 
    tenMonHoc: "Cấu Trúc Dữ Liệu",
    moTa: "Học về các cấu trúc dữ liệu",
    monHocTienQuyetId: "CS101",
    nganhHocIds: [
            1
        ]
    }
];

// Mock LoaiTinChi data
const loaiTinChiMock = [
    { id: 1, tenLoai: "Lý Thuyết", soTiet: 15
    },
    { id: 2, tenLoai: "Thực Hành", soTiet: 30
    },
    { id: 3, tenLoai: "Đồ Án", soTiet: 45
    }
];

// Mock TinChi data
const tinChiMock = [
    { id: 1, maTinChi: "TC001", monHocId: "CS101", loaiTinChiId: 1, soLuong: 2
    },
    { id: 2, maTinChi: "TC002", monHocId: "CS101", loaiTinChiId: 2, soLuong: 1
    },
    { id: 3, maTinChi: "TC003", monHocId: "CS201", loaiTinChiId: 1, soLuong: 3
    }
];

// Mock KiHoc data
const kiHocMock = [
    { id: 1, maKiHoc: "HK12023", tenKiHoc: "Học Kỳ 1 2023-2024", ngayBatDau: "2023-09-01", ngayKetThuc: "2023-12-31"
    },
    { id: 2, maKiHoc: "HK22023", tenKiHoc: "Học Kỳ 2 2023-2024", ngayBatDau: "2024-01-15", ngayKetThuc: "2024-05-15"
    }
];

// Mock PhongHoc data
const phongHocMock = [
    { id: 1, maPhong: "A101", tenPhong: "Phòng học A101", sucChua: 50, diaDiem: "Tòa nhà A"
    },
    { id: 2, maPhong: "B202", tenPhong: "Phòng lab B202", sucChua: 30, diaDiem: "Tòa nhà B"
    }
];

// Mock GioHoc data
const gioHocMock = [
    { id: 1, maGioHoc: "GH1", tietBatDau: 1, tietKetThuc: 3, gioBatDau: "07:30", gioKetThuc: "10:00"
    },
    { id: 2, maGioHoc: "GH2", tietBatDau: 4, tietKetThuc: 6, gioBatDau: "10:15", gioKetThuc: "12:45"
    }
];

// Mock BuoiHoc data
const buoiHocMock = [
    { id: 1, maBuoiHoc: "BH001", tenBuoi: "Sáng", moTa: "Buổi học sáng"
    },
    { id: 2, maBuoiHoc: "BH002", tenBuoi: "Chiều", moTa: "Buổi học chiều"
    }
];

// Mock LichHoc data
const lichHocMock = [
    { id: 1, maLichHoc: "LH001", monHocId: "CS101", phongHocId: 1, gioHocId: 1, buoiHocId: 1, kiHocId: 1, thuTrongTuan: 2
    },
    { id: 2, maLichHoc: "LH002", monHocId: "CS201", phongHocId: 2, gioHocId: 2, buoiHocId: 2, kiHocId: 1, thuTrongTuan: 4
    }
];

// Mock KetQuaHocTap data
const ketQuaHocTapMock = [
    { id: 1, sinhVienId: 1, monHocId: "CS101", kiHocId: 1, diemQuaTrinh: 8.5, diemCuoiKy: 7.0, diemTongKet: 7.75, xepLoai: "B"
    },
    { id: 2, sinhVienId: 2, monHocId: "CS101", kiHocId: 1, diemQuaTrinh: 9.0, diemCuoiKy: 8.5, diemTongKet: 8.75, xepLoai: "A"
    }
];

// Mock HocLai data
const hocLaiMock = [
    { id: 1, sinhVienId: 1, monHocId: "CS201", kiHocId: 1, lanHoc: 2, ketQuaHocTapId: null
    },
    { id: 2, sinhVienId: 2, monHocId: "CS101", kiHocId: 2, lanHoc: 1, ketQuaHocTapId: null
    }
];

// Mock HocPhi data
const hocPhiMock = [
    { id: 1, sinhVienId: 1, kiHocId: 1, soTien: 5000000, ngayDong: "2023-08-25", trangThai: "Đã đóng"
    },
    { id: 2, sinhVienId: 2, kiHocId: 1, soTien: 5000000, ngayDong: null, trangThai: "Chưa đóng"
    }
];

// Mock InvalidatedToken data
const invalidatedTokenMock = [
    { id: 1, token: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...", userId: 1, invalidatedAt: "2023-10-15T14:30:00"
    },
    { id: 2, token: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...", userId: 2, invalidatedAt: "2023-10-16T09:15:00"
    }
];

// ------------------- DTO REQUEST MOCKS -------------------

const authenticationRequestMock = [
    { username: "admin1", password: "password123"
    },
    { username: "user1", password: "userpass456"
    }
];

const buoiHocCreateRequestMock = [
    { maBuoiHoc: "BH003", tenBuoi: "Tối", moTa: "Buổi học tối"
    },
    { maBuoiHoc: "BH004", tenBuoi: "Cuối tuần", moTa: "Buổi học cuối tuần"
    }
];

const gioHocCreateRequestMock = [
    { maGioHoc: "GH3", tietBatDau: 7, tietKetThuc: 9, gioBatDau: "13:30", gioKetThuc: "16:00"
    },
    { maGioHoc: "GH4", tietBatDau: 10, tietKetThuc: 12, gioBatDau: "16:15", gioKetThuc: "18:45"
    }
];

const introspectRequestMock = [
    { token: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
    }
];

const kiHocCreateRequestMock = [
    { maKiHoc: "HK12024", tenKiHoc: "Học Kỳ 1 2024-2025", ngayBatDau: "2024-09-01", ngayKetThuc: "2024-12-31"
    }
];

const lichHocCreateRequestMock = [
    { 
    maLichHoc: "LH003", 
    monHocId: "CS101", 
    phongHocId: 1, 
    gioHocId: 1, 
    buoiHocId: 1, 
    kiHocId: 2, 
    thuTrongTuan: 3
    }
];

const loaiTinChiRequestMock = [
    { tenLoai: "Seminar", soTiet: 10
    }
];

const logoutRequestMock = [
    { token: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
    }
];

const monHocCreateRequestMock = [
    {
    maMonHoc: "CS301",
    tenMonHoc: "Trí Tuệ Nhân Tạo",
    moTa: "Nhập môn trí tuệ nhân tạo",
    monHocTienQuyetId: "CS201",
    nganhHocIds: [
            1
        ]
    }
];

const nganhHocRequestMock = [
    { maNganh: "KHMT", tenNganh: "Khoa Học Máy Tính", moTa: "Chuyên ngành về khoa học máy tính"
    }
];

const permissionRequestMock = [
    { name: "MANAGE_COURSES", description: "Quản lý các khóa học"
    }
];

const phongHocCreateRequestMock = [
    { maPhong: "C303", tenPhong: "Phòng học C303", sucChua: 45, diaDiem: "Tòa nhà C"
    }
];

const refreshRequestMock = [
    { refreshToken: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
    }
];

const roleRequestMock = [
    { name: "TEACHER", description: "Giáo viên", permissions: [
            2,
            3
        ]
    }
];

const tinChiCreateRequestMock = [
    { maTinChi: "TC004", monHocId: "CS201", loaiTinChiId: 2, soLuong: 2
    }
];

const userCreationRequestMock = [
    { 
    username: "teacher1", 
    password: "securepass123", 
    email: "teacher@example.com", 
    fullName: "Teacher User",
    roles: [
            4
        ]
    }
];

const userUpdateRequestMock = [
    { 
    id: 1,
    username: "admin1", 
    email: "newadmin@example.com", 
    fullName: "Admin Updated",
    roles: [
            1,
            2
        ]
    }
];

// ------------------- DTO RESPONSE MOCKS -------------------

const apiResponseMock = [
    { success: true, message: "Thao tác thành công", data: null
    },
    { success: false, message: "Đã xảy ra lỗi", data: null
    }
];

const authenticationResponseMock = [
    { 
    token: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    refreshToken: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    userId: 1,
    username: "admin1",
    roles: [
            "ADMIN"
        ]
    }
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
        // Other response types would follow here
    }
};

export default mockData;