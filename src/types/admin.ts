export type AdminUserRole = 'admin' | 'lecturer' | 'student';
export type AdminUserStatus = 'active' | 'inactive' | 'suspended';

export interface AdminUserAccount {
  id: string;
  name: string;
  email: string;
  role: AdminUserRole;
  status: AdminUserStatus;
  createdAt: string;
  lastLogin: string;
}

export interface SchoolItem {
  id: string;
  maTruong: string;
  tenTruong: string;
  diaChi?: string;
  moTa?: string;
  ngayThanhLap?: string; // formatted date
  nguoiDaiDien?: string;
}

export interface DepartmentItem {
  id: string;
  code: string;
  name: string;
  diaChi?: string;
  moTa?: string;
}

export interface MajorItem {
  id: string;
  code: string;
  name: string;
  departmentId: string;
  departmentName: string;
}

export interface SubjectItem {
  id: string;
  code: string;
  name: string;
  credits: number;
  majorId: string;
  majorName: string;
}

export interface RoomItem {
  id: string;
  maPhong: string;
  tenPhong?: string;
  tinhTrang?: string;
  toaNha?: string;
  tang?: number;
  sucChua?: number;
  soLichHoc?: number;
}

export interface SemesterItem {
  id: string;
  maHocKi: string;
  tenHocKi: string;
  ngayBatDau?: string; // dd/MM/yyyy or ISO
  ngayKetThuc?: string;
}

export interface PeriodItem {
  id: string;
  maGioHoc: string;
  tenGioHoc: string;
  thoiGianBatDau?: string; // HH:mm:ss
  thoiGianKetThuc?: string; // HH:mm:ss
}

export interface ClassScheduleItem {
  id: string;
  classCode: string;
  subject: string;
  instructor: string;
  room: string;
  schedule: string;
  enrolled: number;
  capacity: number;
  status: 'open' | 'full' | 'upcoming';
}

export interface AdminContentItem {
  id: string;
  type: 'Giáo trình' | 'Quiz' | 'Bài tập';
  title: string;
  owner: string;
  subject: string;
  status: 'pending' | 'approved' | 'rejected';
}

export interface AdminDashboardSummary {
  totalUsers: number;
  totalClasses: number;
  totalRevenue: number;
  totalInstructors: number;
}

// ─── Admin Dashboard (Backend) ───
export interface AdminDashboardData {
  tongNguoiDung: number;
  tongGiangVien: number;
  tongLopHocPhan: number;
  tongHocVien: number;
  tongHocPhi: number;
  hocPhiDaThu: number;
  hocPhiConNo: number;
  hocVienMoi: number;
  lopDangHoatDong: number;
  lienHeChuaXuLy: number;
  lienHeDangXuLy: number;
  lienHeDaXuLy: number;
  doanhThuTheoThang: AdminDoanhThuThang[];
  hocVienTheoNam: AdminHocVienTheoNam[];
  hocVienTheoNganh: AdminHocVienTheoNganh[];
  hoatDongGanDay: AdminHoatDong[];
}

export interface AdminDoanhThuThang {
  thang: number;
  nam: number;
  soLuong: number;
  tongTien: number;
  tienDaThu: number;
}

export interface AdminHocVienTheoNam {
  nam: number;
  soHocVien: number;
}

export interface AdminHocVienTheoNganh {
  tenNganh: string;
  soHocVien: number;
}

export interface AdminHoatDong {
  id: string;
  loai: 'LIEN_HE' | 'THONG_BAO' | 'USER' | 'LOP_HP';
  tieuDe: string;
  moTa: string;
  thoiGian: string;
}

export interface CreditRegistrationItem {
  id: string;
  studentId: string;
  studentName: string;
  subjectId: string;
  subjectName: string;
  credits: number;
  semesterId: string;
  semesterName: string;
  status: 'pending' | 'approved' | 'rejected';
  registeredAt: string;
}

export interface ContactItem {
  id: string;
  name: string;
  email: string;
  phone?: string;
  subject: string;
  message: string;
  status: 'new' | 'in-progress' | 'resolved';
  createdAt: string;
  updatedAt?: string;
}

export interface SystemNotificationItem {
  id: string;
  title: string;
  content: string;
  targetAudience: 'all' | 'students' | 'instructors' | 'admins';
  priority: 'low' | 'medium' | 'high';
  status: 'draft' | 'sent' | 'scheduled';
  scheduledAt?: string;
  sentAt?: string;
  createdBy: string;
  createdAt: string;
}


export type AuthRolePermission = {
  maRole: string;
  maPermissions?: string | null;
};

// ─── PhanHoiLienHe (Contact Management) ───
export type TrangThaiLienHe = 'CHUA_XU_LY' | 'DANG_XU_LY' | 'DA_XU_LY';

export interface LichSuXuLyItem {
  id: string;
  trangThaiTruoc: TrangThaiLienHe;
  trangThaiMoi: TrangThaiLienHe;
  nguoiThucHien: string;
  ghiChu?: string;
  noiDungPhanHoi?: string;
  thoiGianXuLy: string;
}

export interface PhanHoiLienHeItem {
  id: string;
  hoTen: string;
  email: string;
  soDienThoai?: string;
  chuDe: string;
  noiDung: string;
  trangThai: TrangThaiLienHe;
  gioiTinh?: string;
  nguoiXuLy?: string;
  ngayTao: string;
  ngayCapNhat?: string;
  lichSuXuLys: LichSuXuLyItem[];
}

export interface PhanHoiLienHeStatusRequest {
  trangThai: TrangThaiLienHe;
  nguoiXuLy?: string;
  ghiChu?: string;
}

export interface PhanHoiLienHeReplyRequest {
  noiDungPhanHoi: string;
}

export interface PhanHoiLienHeThongKe {
  chuaXuLy: number;
  dangXuLy: number;
  daXuLy: number;
  tong: number;
}
