// Centralized mock data for tuition management
// Used by: AccountantDashboard, TuitionListPage, InvoiceDetailPage, PaymentProcessingPage, StudentTuitionPage

import { TuitionStatus, PaymentMethod } from '@/types/tuition';

export interface TuitionRecord {
  id: string;
  studentName: string;
  studentCode: string;
  email: string;
  phone: string;
  major: string;
  semester: string;
  amount: number;
  status: TuitionStatus;
  createdDate: string;
  dueDate: string;
  paidDate?: string;
  paymentMethod?: PaymentMethod;
  transactionRef?: string;
  confirmedBy?: string;
  confirmedAt?: string;
  failureReason?: string;
  courses: CourseItem[];
  discount: number;
  note?: string;
}

export interface CourseItem {
  id: string;
  code: string;
  name: string;
  credits: number;
  pricePerCredit: number;
  total: number;
}

const TUITION_STORAGE_KEY = 'tuition_records_v2';

// Mock tuition records - Single source of truth
export const mockTuitionRecords: TuitionRecord[] = [
  {
    id: 'TUI001',
    studentName: 'Nguyễn Văn An',
    studentCode: 'SV001',
    email: 'an.nguyen@student.edu.vn',
    phone: '0901234567',
    major: 'Công nghệ Phần mềm',
    semester: 'HK2 2025-2026',
    amount: 5000000,
    status: 'paid',
    createdDate: '01/03/2026',
    dueDate: '15/03/2026',
    paidDate: '10/03/2026',
    paymentMethod: 'transfer',
    transactionRef: 'VCB20260310001',
    confirmedBy: 'Nguyễn Văn Lộc',
    confirmedAt: '10/03/2026 14:30',
    courses: [
      { id: '1', code: 'CS301', name: 'Lập trình Web nâng cao', credits: 3, pricePerCredit: 500000, total: 1500000 },
      { id: '2', code: 'CS302', name: 'Cơ sở dữ liệu', credits: 4, pricePerCredit: 500000, total: 2000000 },
      { id: '3', code: 'CS401', name: 'Mạng máy tính', credits: 3, pricePerCredit: 500000, total: 1500000 }
    ],
    discount: 0,
    note: 'Học phí học kỳ 2 năm học 2025-2026'
  },
  {
    id: 'TUI002',
    studentName: 'Trần Thị Bình',
    studentCode: 'SV002',
    email: 'binh.tran@student.edu.vn',
    phone: '0902345678',
    major: 'Khoa học Máy tính',
    semester: 'HK2 2025-2026',
    amount: 7500000,
    status: 'pending',
    createdDate: '01/03/2026',
    dueDate: '15/03/2026',
    courses: [
      { id: '1', code: 'CS201', name: 'Trí tuệ Nhân tạo', credits: 4, pricePerCredit: 600000, total: 2400000 },
      { id: '2', code: 'CS202', name: 'Machine Learning', credits: 4, pricePerCredit: 600000, total: 2400000 },
      { id: '3', code: 'CS203', name: 'Deep Learning', credits: 3, pricePerCredit: 600000, total: 1800000 },
      { id: '4', code: 'CS204', name: 'Computer Vision', credits: 3, pricePerCredit: 300000, total: 900000 }
    ],
    discount: 0
  },
  {
    id: 'TUI003',
    studentName: 'Lê Văn Cường',
    studentCode: 'SV003',
    email: 'cuong.le@student.edu.vn',
    phone: '0903456789',
    major: 'An toàn Thông tin',
    semester: 'HK2 2025-2026',
    amount: 6000000,
    status: 'paid',
    createdDate: '01/03/2026',
    dueDate: '15/03/2026',
    paidDate: '12/03/2026',
    paymentMethod: 'card',
    transactionRef: 'VISA20260312002',
    confirmedBy: 'Nguyễn Văn Lộc',
    confirmedAt: '12/03/2026 10:15',
    courses: [
      { id: '1', code: 'SEC101', name: 'An ninh Mạng', credits: 4, pricePerCredit: 550000, total: 2200000 },
      { id: '2', code: 'SEC102', name: 'Mật mã học', credits: 3, pricePerCredit: 550000, total: 1650000 },
      { id: '3', code: 'SEC103', name: 'Ethical Hacking', credits: 4, pricePerCredit: 550000, total: 2200000 }
    ],
    discount: 50000,
    note: 'Giảm giá 50k - Học bổng'
  },
  {
    id: 'TUI004',
    studentName: 'Phạm Thị Dung',
    studentCode: 'SV004',
    email: 'dung.pham@student.edu.vn',
    phone: '0904567890',
    major: 'Hệ thống Thông tin',
    semester: 'HK2 2025-2026',
    amount: 8000000,
    status: 'failed',
    createdDate: '01/03/2026',
    dueDate: '15/03/2026',
    failureReason: 'Số dư tài khoản không đủ',
    courses: [
      { id: '1', code: 'IS101', name: 'Phân tích Hệ thống', credits: 4, pricePerCredit: 500000, total: 2000000 },
      { id: '2', code: 'IS102', name: 'Quản trị Dự án', credits: 3, pricePerCredit: 500000, total: 1500000 },
      { id: '3', code: 'IS103', name: 'ERP Systems', credits: 4, pricePerCredit: 550000, total: 2200000 },
      { id: '4', code: 'IS104', name: 'Business Intelligence', credits: 4, pricePerCredit: 575000, total: 2300000 }
    ],
    discount: 0
  },
  {
    id: 'TUI005',
    studentName: 'Hoàng Văn Em',
    studentCode: 'SV005',
    email: 'em.hoang@student.edu.vn',
    phone: '0905678901',
    major: 'Công nghệ Phần mềm',
    semester: 'HK2 2025-2026',
    amount: 5500000,
    status: 'paid',
    createdDate: '01/03/2026',
    dueDate: '15/03/2026',
    paidDate: '14/03/2026',
    paymentMethod: 'ewallet',
    transactionRef: 'MOMO20260314003',
    confirmedBy: 'Nguyễn Văn Lộc',
    confirmedAt: '14/03/2026 16:45',
    courses: [
      { id: '1', code: 'SE101', name: 'Software Engineering', credits: 4, pricePerCredit: 500000, total: 2000000 },
      { id: '2', code: 'SE102', name: 'Agile Development', credits: 3, pricePerCredit: 500000, total: 1500000 },
      { id: '3', code: 'SE103', name: 'DevOps', credits: 4, pricePerCredit: 500000, total: 2000000 }
    ],
    discount: 0
  },
  {
    id: 'TUI006',
    studentName: 'Vũ Thị Phương',
    studentCode: 'SV006',
    email: 'phuong.vu@student.edu.vn',
    phone: '0906789012',
    major: 'Khoa học Dữ liệu',
    semester: 'HK2 2025-2026',
    amount: 6500000,
    status: 'pending',
    createdDate: '02/03/2026',
    dueDate: '15/03/2026',
    courses: [
      { id: '1', code: 'DS101', name: 'Data Analytics', credits: 4, pricePerCredit: 550000, total: 2200000 },
      { id: '2', code: 'DS102', name: 'Big Data', credits: 4, pricePerCredit: 550000, total: 2200000 },
      { id: '3', code: 'DS103', name: 'Data Visualization', credits: 3, pricePerCredit: 550000, total: 1650000 },
      { id: '4', code: 'DS104', name: 'Statistics', credits: 3, pricePerCredit: 150000, total: 450000 }
    ],
    discount: 0
  },
  {
    id: 'TUI007',
    studentName: 'Đặng Văn Giang',
    studentCode: 'SV007',
    email: 'giang.dang@student.edu.vn',
    phone: '0907890123',
    major: 'Kỹ thuật Máy tính',
    semester: 'HK2 2025-2026',
    amount: 7000000,
    status: 'paid',
    createdDate: '02/03/2026',
    dueDate: '15/03/2026',
    paidDate: '13/03/2026',
    paymentMethod: 'cash',
    confirmedBy: 'Nguyễn Văn Lộc',
    confirmedAt: '13/03/2026 09:20',
    courses: [
      { id: '1', code: 'CE101', name: 'Computer Architecture', credits: 4, pricePerCredit: 500000, total: 2000000 },
      { id: '2', code: 'CE102', name: 'Embedded Systems', credits: 4, pricePerCredit: 500000, total: 2000000 },
      { id: '3', code: 'CE103', name: 'IoT Systems', credits: 3, pricePerCredit: 600000, total: 1800000 },
      { id: '4', code: 'CE104', name: 'FPGA Design', credits: 4, pricePerCredit: 300000, total: 1200000 }
    ],
    discount: 0
  },
  {
    id: 'TUI008',
    studentName: 'Ngô Thị Hà',
    studentCode: 'SV008',
    email: 'ha.ngo@student.edu.vn',
    phone: '0908901234',
    major: 'Công nghệ Phần mềm',
    semester: 'HK2 2025-2026',
    amount: 5500000,
    status: 'pending',
    createdDate: '03/03/2026',
    dueDate: '15/03/2026',
    courses: [
      { id: '1', code: 'CS301', name: 'Lập trình Web nâng cao', credits: 3, pricePerCredit: 500000, total: 1500000 },
      { id: '2', code: 'CS302', name: 'Cơ sở dữ liệu', credits: 4, pricePerCredit: 500000, total: 2000000 },
      { id: '3', code: 'CS401', name: 'Mạng máy tính', credits: 4, pricePerCredit: 500000, total: 2000000 }
    ],
    discount: 0
  },
  {
    id: 'TUI009',
    studentName: 'Bùi Văn Hùng',
    studentCode: 'SV009',
    email: 'hung.bui@student.edu.vn',
    phone: '0909012345',
    major: 'An toàn Thông tin',
    semester: 'HK2 2025-2026',
    amount: 6000000,
    status: 'paid',
    createdDate: '03/03/2026',
    dueDate: '15/03/2026',
    paidDate: '11/03/2026',
    paymentMethod: 'transfer',
    transactionRef: 'ACB20260311004',
    confirmedBy: 'Nguyễn Văn Lộc',
    confirmedAt: '11/03/2026 11:00',
    courses: [
      { id: '1', code: 'SEC101', name: 'An ninh Mạng', credits: 4, pricePerCredit: 550000, total: 2200000 },
      { id: '2', code: 'SEC102', name: 'Mật mã học', credits: 3, pricePerCredit: 550000, total: 1650000 },
      { id: '3', code: 'SEC103', name: 'Ethical Hacking', credits: 4, pricePerCredit: 550000, total: 2200000 }
    ],
    discount: 50000,
    note: 'Giảm giá 50k - Học bổng'
  },
  {
    id: 'TUI010',
    studentName: 'Lý Thị Lan',
    studentCode: 'SV010',
    email: 'lan.ly@student.edu.vn',
    phone: '0900123456',
    major: 'Khoa học Máy tính',
    semester: 'HK2 2025-2026',
    amount: 7500000,
    status: 'failed',
    createdDate: '04/03/2026',
    dueDate: '15/03/2026',
    failureReason: 'Thông tin thẻ không hợp lệ',
    courses: [
      { id: '1', code: 'CS201', name: 'Trí tuệ Nhân tạo', credits: 4, pricePerCredit: 600000, total: 2400000 },
      { id: '2', code: 'CS202', name: 'Machine Learning', credits: 4, pricePerCredit: 600000, total: 2400000 },
      { id: '3', code: 'CS203', name: 'Deep Learning', credits: 3, pricePerCredit: 600000, total: 1800000 },
      { id: '4', code: 'CS204', name: 'Computer Vision', credits: 3, pricePerCredit: 300000, total: 900000 }
    ],
    discount: 0
  },
  {
    id: 'TUI011',
    studentName: 'Trương Văn Minh',
    studentCode: 'SV011',
    email: 'minh.truong@student.edu.vn',
    phone: '0901234560',
    major: 'Hệ thống Thông tin',
    semester: 'HK2 2025-2026',
    amount: 5000000,
    status: 'paid',
    createdDate: '04/03/2026',
    dueDate: '15/03/2026',
    paidDate: '09/03/2026',
    paymentMethod: 'transfer',
    transactionRef: 'TCB20260309005',
    confirmedBy: 'Nguyễn Văn Lộc',
    confirmedAt: '09/03/2026 15:30',
    courses: [
      { id: '1', code: 'IS101', name: 'Phân tích Hệ thống', credits: 4, pricePerCredit: 500000, total: 2000000 },
      { id: '2', code: 'IS102', name: 'Quản trị Dự án', credits: 3, pricePerCredit: 500000, total: 1500000 },
      { id: '3', code: 'IS103', name: 'ERP Systems', credits: 3, pricePerCredit: 500000, total: 1500000 }
    ],
    discount: 0
  },
  {
    id: 'TUI012',
    studentName: 'Phan Thị Nga',
    studentCode: 'SV012',
    email: 'nga.phan@student.edu.vn',
    phone: '0902345601',
    major: 'Khoa học Dữ liệu',
    semester: 'HK2 2025-2026',
    amount: 8000000,
    status: 'pending',
    createdDate: '05/03/2026',
    dueDate: '15/03/2026',
    courses: [
      { id: '1', code: 'DS101', name: 'Data Analytics', credits: 4, pricePerCredit: 550000, total: 2200000 },
      { id: '2', code: 'DS102', name: 'Big Data', credits: 4, pricePerCredit: 550000, total: 2200000 },
      { id: '3', code: 'DS103', name: 'Data Visualization', credits: 3, pricePerCredit: 550000, total: 1650000 },
      { id: '4', code: 'DS104', name: 'Statistics', credits: 4, pricePerCredit: 550000, total: 2200000 }
    ],
    discount: 250000,
    note: 'Giảm giá 250k - Ưu đãi đăng ký sớm'
  },
  {
    id: 'TUI015',
    studentName: 'Hoàng Văn Thành',
    studentCode: 'SV015',
    email: 'thanh.hoang@student.edu.vn',
    phone: '0905678902',
    major: 'Công nghệ Phần mềm',
    semester: 'HK2 2025-2026',
    amount: 6000000,
    status: 'failed',
    createdDate: '06/03/2026',
    dueDate: '15/03/2026',
    failureReason: 'Giao dịch bị ngân hàng từ chối',
    courses: [
      { id: '1', code: 'SE101', name: 'Software Engineering', credits: 4, pricePerCredit: 500000, total: 2000000 },
      { id: '2', code: 'SE102', name: 'Agile Development', credits: 3, pricePerCredit: 500000, total: 1500000 },
      { id: '3', code: 'SE103', name: 'DevOps', credits: 4, pricePerCredit: 500000, total: 2000000 },
      { id: '4', code: 'SE104', name: 'Cloud Computing', credits: 2, pricePerCredit: 250000, total: 500000 }
    ],
    discount: 0
  }
];

const readRecords = (): TuitionRecord[] => {
  try {
    const raw = localStorage.getItem(TUITION_STORAGE_KEY);
    if (!raw) return mockTuitionRecords;
    return JSON.parse(raw) as TuitionRecord[];
  } catch {
    return mockTuitionRecords;
  }
};

const writeRecords = (records: TuitionRecord[]) => {
  localStorage.setItem(TUITION_STORAGE_KEY, JSON.stringify(records));
};

// Helper functions
export const getTuitionById = (id: string): TuitionRecord | undefined => {
  return readRecords().find(record => record.id === id);
};

export const getTuitionsByStatus = (status: 'paid' | 'pending' | 'failed'): TuitionRecord[] => {
  return readRecords().filter(record => record.status === status);
};

export const getTuitionStats = () => {
  const records = readRecords();
  const paidRecords = records.filter(r => r.status === 'paid');
  const pendingRecords = records.filter(r => r.status === 'pending');
  const failedRecords = records.filter(r => r.status === 'failed');

  return {
    totalAmount: records.reduce((sum, r) => sum + r.amount, 0),
    paidAmount: paidRecords.reduce((sum, r) => sum + r.amount, 0),
    pendingAmount: pendingRecords.reduce((sum, r) => sum + r.amount, 0),
    failedAmount: failedRecords.reduce((sum, r) => sum + r.amount, 0),
    totalRecords: records.length,
    paidCount: paidRecords.length,
    pendingCount: pendingRecords.length,
    failedCount: failedRecords.length,
  };
};

export const getAllTuitionRecords = (): TuitionRecord[] => {
  return readRecords();
};

// Update tuition status (for demo purposes - in real app this would be API call)
export const updateTuitionStatus = (
  id: string,
  status: 'paid' | 'failed',
  data?: {
    paymentMethod?: 'cash' | 'transfer' | 'card' | 'ewallet';
    transactionRef?: string;
    confirmedBy?: string;
    failureReason?: string;
  }
): boolean => {
  const records = readRecords();
  const record = records.find(r => r.id === id);
  if (!record) return false;

  record.status = status;

  if (status === 'paid' && data) {
    record.paidDate = new Date().toLocaleDateString('vi-VN');
    record.paymentMethod = data.paymentMethod;
    record.transactionRef = data.transactionRef;
    record.confirmedBy = data.confirmedBy;
    record.confirmedAt = new Date().toLocaleString('vi-VN');
  } else if (status === 'failed' && data?.failureReason) {
    record.failureReason = data.failureReason;
  }

  writeRecords(records);
  return true;
};

export const createTuitionFromEnrollment = (payload: {
  studentName: string;
  studentCode: string;
  email: string;
  phone?: string;
  major?: string;
  semester: string;
  courses: CourseItem[];
  note?: string;
}) => {
  const records = readRecords();
  const now = new Date();
  const dueDate = new Date(now);
  dueDate.setDate(dueDate.getDate() + 14);
  const amount = payload.courses.reduce((sum, course) => sum + course.total, 0);
  const nextId = `TUI${String(records.length + 1).padStart(3, '0')}`;

  const record: TuitionRecord = {
    id: nextId,
    studentName: payload.studentName,
    studentCode: payload.studentCode,
    email: payload.email,
    phone: payload.phone || 'Chưa cập nhật',
    major: payload.major || 'Chưa cập nhật',
    semester: payload.semester,
    amount,
    status: 'pending',
    createdDate: now.toLocaleDateString('vi-VN'),
    dueDate: dueDate.toLocaleDateString('vi-VN'),
    courses: payload.courses,
    discount: 0,
    note: payload.note || 'Học phí phát sinh từ đăng ký học phần',
  };

  records.unshift(record);
  writeRecords(records);
  return record;
};
