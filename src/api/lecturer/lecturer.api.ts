import apiClient from '@/common/axiosClient';

// ── Types ──────────────────────────────────────────────────────────────────

export interface LecturerScheduleDTO {
  lichId: string;
  lopHocPhanId: string;
  maLopHocPhan: string;
  tenMonHoc: string;
  ngayHoc: string;
  gioBatDau: string;
  gioKetThuc: string;
  phong: string;
  toaNha: string;
}

export interface LecturerDashboardResponseDTO {
  todaySchedule: LecturerScheduleDTO[];
  weekSchedule: LecturerScheduleDTO[];
  monthSchedule: LecturerScheduleDTO[];
  totalClasses: number;
  ungradedAssignments: number;
  attendanceRate: number;
  totalStudents: number;
  pendingQuizAttempts: number;
  totalPendingWork: number;
  teachingClasses: LecturerDashboardClassDTO[];
  recentNotifications: LecturerDashboardNotificationDTO[];
  pendingWorkItems: LecturerDashboardWorkItemDTO[];
}

export interface LecturerDashboardClassDTO {
  lopHocPhanId: string;
  maLopHocPhan: string;
  tenMonHoc: string;
  phong: string;
  toaNha: string;
  ngayBatDau: string;
  ngayKetThuc: string;
  studentCount: number;
  scheduleCount: number;
}

export interface LecturerDashboardNotificationDTO {
  id: string;
  tieuDe: string;
  noiDung: string;
  loaiThongBao: string | null;
  createdAt: string;
  daNhan: boolean;
  source: 'RECEIVED' | 'SENT' | string;
}

export interface LecturerDashboardWorkItemDTO {
  id: string;
  type: 'ASSIGNMENT' | 'QUIZ' | string;
  title: string;
  classCode: string;
  className: string;
  studentName: string;
  createdAt: string;
  actionPath: string;
}

export interface LecturerProfileResponseDTO {
  id: string;
  userName: string;
  hoTen: string;
  diaChi: string;
  soDienThoai: string;
  email: string;
  gioiTinh: 'NAM' | 'NU' | null;
  ngaySinh: string;
  cccd: string;
  maNhanVien: string;
  ngayNhanViec: string;
  avatarUrl: string;
  schedule: LecturerScheduleDTO[];
}

export interface LecturerProfileRequestDTO {
  soDienThoai: string;
  email: string;
  hoTen?: string;
  diaChi?: string;
  gioiTinh?: 'NAM' | 'NU' | null;
  ngaySinh?: string;
  avatarUrl?: string;
}

export interface LecturerClassSummaryResponseDTO {
  lopHocPhanId: string;
  maLopHocPhan: string;
  tenMonHoc: string;
  phong: string;
  toaNha: string;
  ngayBatDau: string;
  ngayKetThuc: string;
}

export interface LecturerClassStudentResponseDTO {
  hocVienId: string;
  hoTen: string;
  maHocVien: string;
  avatarUrl: string;
}

export interface LecturerClassDetailResponseDTO {
  lopHocPhanId: string;
  maLopHocPhan: string;
  tenMonHoc: string;
  phong: string;
  toaNha: string;
  lichMoTa: string;
  hocViens: LecturerClassStudentResponseDTO[];
}

export interface DocumentResponseDTO {
  id: string;
  tenTaiLieu: string;
  moTa: string;
  fileTaiLieuUrl: string;
  loaiTaiLieu: string;
  ngayDang: string;
  lopHocPhanId: string;
}

export interface DocumentRequestDTO {
  lopHocPhanId: string;
  tenTaiLieu: string;
  moTa?: string;
  fileTaiLieuUrl: string;
  loaiTaiLieu?: string;
}

export interface AssignmentResponseDTO {
  id: string;
  tieuDe: string;
  moTa: string;
  createdAt: string;
  lopHocPhanId: string;
  submissionCount: number;
  fileExerciseUrl: string;
  thoiGianBatDau?: string;
  thoiGianKetThuc?: string;
  questionCount?: number;
  questions?: QuizQuestionDTO[];
  gioiHanLanLam?: number;
}

export interface AssignmentRequestDTO {
  lopHocPhanId: string;
  tieuDe: string;
  moTa?: string;
  thoiGianBatDau?: string;
  thoiGianKetThuc?: string;
  fileExerciseUrl?: string;
  gioiHanLanLam?: number;
  questions?: QuestionRequestDTO[];
}

export interface ExcelImportResult {
  totalRows: number;
  successCount: number;
  errorCount: number;
  errors: string[];
  message?: string;
}

export interface SubmissionResponseDTO {
  submissionId: string;
  assignmentId: string;
  assignmentTitle: string;
  studentId: string;
  studentName: string;
  studentCode: string;
  fileUrl: string;
  submittedAt: string;
  grade: number | null;
  feedback: string | null;
}

export interface GradeStudentResponseDTO {
  hocVienId: string;
  hoTen: string;
  maHocVien: string;
  diemTrungBinh: number | null;
  diemThanhPhan?: ComponentGradeEntryDTO[];
}

export interface ComponentGradeEntryDTO {
  cotDiemId: string;
  tenCotDiem: string;
  tiTrong: string;
  loai: string | null;
  diem: number | null;
  thuTuHienThi: number;
}

export interface GradeColumnDTO {
  cotDiemId: string;
  tenCotDiem: string;
  tiTrong: string;
  loai: string | null;
  thuTuHienThi: number;
}

export interface GradeResponseDTO {
  lopHocPhanId: string;
  columns: GradeColumnDTO[];
  students: GradeStudentResponseDTO[];
}

export interface GradeHistoryResponseDTO {
  historyId: string;
  diemCu: number;
  diemMoi: number;
  ghiChu: string | null;
  thoiGianThayDoi: string;
  nguoiThayDoi: string;
}

export interface GradeRequestDTO {
  lopHocPhanId: string;
  studentGrades: Record<string, number>;
}

export interface CreateCotDiemRequestDTO {
  tenCotDiem: string;
  tiTrong: string;
  loai: string | null;
  thuTuHienThi: number;
  lopHocPhanId: string;
}

export type AttendanceStatus = 'PRESENT' | 'ABSENT' | 'EXCUSED' | 'LATE';

export interface AttendanceStudentResponseDTO {
  hocVienId: string;
  hoTen: string;
  maHocVien: string;
  trangThai: AttendanceStatus | null;
  ghiChu: string | null;
  soBuoiVang: number;
}

export interface AttendanceSessionDTO {
  lichId: string;
  ngayHoc: string;
  gioBatDau: string;
  gioKetThuc: string;
  phong: string;
  currentSession: boolean;
  canTakeAttendance: boolean;
  hasAttendance: boolean;
}

export interface AttendanceStatsDTO {
  totalStudents: number;
  presentCount: number;
  absentCount: number;
  lateCount: number;
  excusedCount: number;
  pendingCount: number;
  attendanceRate: number;
}

export interface AttendanceResponseDTO {
  lopHocPhanId: string;
  selectedLichId: string | null;
  sessions: AttendanceSessionDTO[];
  students: AttendanceStudentResponseDTO[];
  statistics: AttendanceStatsDTO;
  canTakeAttendance: boolean;
  message: string;
  serverDateTime: string;
}

export interface AttendanceEntryDTO {
  hocVienId: string;
  trangThai: AttendanceStatus;
  ghiChu?: string;
}

export interface AttendanceRequestDTO {
  lopHocPhanId: string;
  lichId: string;
  ghiChu?: string;
  entries: AttendanceEntryDTO[];
}

export interface NotificationDetailResponseDTO {
  id: string;
  tieuDe: string;
  noiDung: string;
  fileThongBao: string | null;
  createdAt: string;
  tongNguoiNhan: number;
  nguoiDaNhan: number;
}

export interface NotificationResponseDTO {
  id: string;
  tieuDe: string;
  noiDung: string;
  fileThongBao: string | null;
  createdAt: string;
}

export interface ChangePasswordRequestDTO {
  oldPassword: string;
  newPassword: string;
  confirmPassword: string;
}

export interface NotificationRequestDTO {
  lopHocPhanId: string;
  tieuDe: string;
  noiDung: string;
  fileThongBao?: string;
}

export interface QuizResponseDTO {
  quizId: string;
  lopHocPhanId: string;
  tenLopHocPhan: string;
  tieuDe: string;
  moTa: string;
  thoiGianBatDau: string;
  thoiGianKetThuc: string;
  thoiGianLam: number;
  soLanLam: number | null;
  trinhTrang: boolean | null;
  createdAt: string;
  questionCount: number;
  questions?: QuizQuestionDTO[];
}

export interface QuizQuestionDTO {
  questionId: string;
  noiDung: string;
  loaiCauHoi: boolean;
  nhieuDapAn?: boolean;
  diem: number;
  answers: QuizAnswerDTO[];
}

export interface QuizAnswerDTO {
  answerId: string;
  keyAnswers: string;
  conText: string;
  isCorrect: boolean;
}

export interface QuizResultResponseDTO {
  quizId: string;
  tieuDe: string;
  thoiGianLam: number | null;
  soLanLam: number | null;
  trinhTrang: boolean | null;
  thoiGianBatDau: string | null;
  thoiGianKetThuc: string | null;
  tongSoHocVien: number;
  soLuongDaLam: number;
  diemTrungBinh: number | null;
  tongCauHoi: number;
  studentResults: StudentQuizResultDTO[];
}

export interface StudentQuizResultDTO {
  hocVienId: string;
  tenHocVien: string;
  maHocVien: string;
  diem: number | null;
  soCauDung: number;
  tongCauHoi: number;
  usedTime: number | null;
  remainingTime: number | null;
  status: string;
  daTuCham: boolean;
}

export interface QuizAttemptAnswerOptionDTO {
  answerId: string;
  keyAnswers: string;
  conText: string;
  isCorrect: boolean;
  selected: boolean;
}

export interface QuizAttemptAnswerDetailDTO {
  questionId: string;
  noiDung: string;
  diem: number | null;
  selectedAnswerId: string | null;
  selectedKeyAnswers: string | null;
  selectedAnswerText: string | null;
  selectedCorrect: boolean | null;
  answers: QuizAttemptAnswerOptionDTO[];
}

export interface QuizAttemptDetailResponseDTO {
  attemptId: string;
  quizId: string;
  hocVienId: string;
  tenHocVien: string;
  maHocVien: string;
  diem: number | null;
  soCauDung: number;
  tongCauHoi: number;
  usedTime: number | null;
  remainingTime: number | null;
  status: string;
  startTime: string;
  endTime: string | null;
  answers: QuizAttemptAnswerDetailDTO[];
}

// ── API ────────────────────────────────────────────────────────────────────

const lecturerApi = {
  getDashboard: (userId: string) =>
    apiClient.get<LecturerDashboardResponseDTO>(`/lecturer/dashboard/${userId}`).then(r => r.data),

  getProfile: (userId: string) =>
    apiClient.get<LecturerProfileResponseDTO>(`/lecturer/profile/${userId}`).then(r => r.data),

  updateProfile: (userId: string, data: LecturerProfileRequestDTO) =>
    apiClient.put<LecturerProfileResponseDTO>(`/lecturer/profile/${userId}`, data).then(r => r.data),

  changePassword: (userId: string, data: ChangePasswordRequestDTO) =>
    apiClient.post(`/lecturer/profile/${userId}/change-password`, data),

  getSchedule: (userId: string, from?: string, to?: string) =>
    apiClient.get<LecturerScheduleDTO[]>(`/lecturer/profile/${userId}/schedule`, {
      params: { from, to },
    }).then(r => r.data),

  getClasses: (userId: string) =>
    apiClient.get<LecturerClassSummaryResponseDTO[]>(`/lecturer/classes/${userId}`).then(r => r.data),

  getClassDetail: (lopHocPhanId: string, userId: string, keyword?: string) =>
    apiClient.get<LecturerClassDetailResponseDTO>(`/lecturer/classes/${lopHocPhanId}/detail`, {
      params: { userId, keyword },
    }).then(r => r.data),

  // Documents
  getDocuments: (lopHocPhanId: string, userId: string) =>
    apiClient.get<DocumentResponseDTO[]>(`/lecturer/documents/${lopHocPhanId}`, {
      params: { userId },
    }).then(r => r.data),

  createDocument: (userId: string, data: DocumentRequestDTO) =>
    apiClient.post<DocumentResponseDTO>(`/lecturer/documents`, data, {
      params: { userId },
    }).then(r => r.data),

  updateDocument: (documentId: string, userId: string, data: DocumentRequestDTO) =>
    apiClient.put<DocumentResponseDTO>(`/lecturer/documents/${documentId}`, data, {
      params: { userId },
    }).then(r => r.data),

  deleteDocument: (documentId: string, userId: string) =>
    apiClient.delete(`/lecturer/documents/${documentId}`, { params: { userId } }),

  // Assignments
  getAssignments: (lopHocPhanId: string, userId: string) =>
    apiClient.get<AssignmentResponseDTO[]>(`/lecturer/assignments/${lopHocPhanId}`, {
      params: { userId },
    }).then(r => r.data),

  createAssignment: (userId: string, data: AssignmentRequestDTO) =>
    apiClient.post<AssignmentResponseDTO>(`/lecturer/assignments`, data, {
      params: { userId },
    }).then(r => r.data),

  importAssignmentsFromExcel: (userId: string, lopHocPhanId: string, file: File) => {
    const formData = new FormData();
    formData.append('file', file);
    return apiClient.post<ExcelImportResult>(`/lecturer/assignments/import-excel`, formData, {
      params: { userId, lopHocPhanId },
      headers: { 'Content-Type': 'multipart/form-data' },
    }).then(r => r.data);
  },

  updateAssignment: (assignmentId: string, userId: string, data: AssignmentRequestDTO) =>
    apiClient.put<AssignmentResponseDTO>(`/lecturer/assignments/${assignmentId}`, data, {
      params: { userId },
    }).then(r => r.data),

  deleteAssignment: (assignmentId: string, userId: string) =>
    apiClient.delete(`/lecturer/assignments/${assignmentId}`, { params: { userId } }),

  gradeSubmission: (submissionId: string, userId: string, diem: number, feedback?: string) =>
    apiClient.put(`/lecturer/submissions/${submissionId}/grade`, null, {
      params: { userId, diem, feedback },
    }),

  // Submissions
  getSubmissions: (lopHocPhanId: string, assignmentId: string, userId: string) =>
    apiClient.get<SubmissionResponseDTO[]>(`/lecturer/submissions/${lopHocPhanId}/${assignmentId}`, {
      params: { userId },
    }).then(r => r.data),

  getSubmissionDetail: (submissionId: string, userId: string) =>
    apiClient.get<SubmissionResponseDTO>(`/lecturer/submissions/${submissionId}/detail`, {
      params: { userId },
    }).then(r => r.data),

  // Grades
  getGrades: (lopHocPhanId: string, userId: string) =>
    apiClient.get<GradeResponseDTO>(`/lecturer/grades/${lopHocPhanId}`, {
      params: { userId },
    }).then(r => r.data),

  updateGrades: (userId: string, data: GradeRequestDTO) =>
    apiClient.put(`/lecturer/grades`, data, { params: { userId } }),

  getGradeHistory: (lopHocPhanId: string, hocVienId: string, userId: string) =>
    apiClient.get<GradeHistoryResponseDTO[]>(`/lecturer/grades/${lopHocPhanId}/history/${hocVienId}`, {
      params: { userId },
    }).then(r => r.data),

  createCotDiem: (userId: string, data: CreateCotDiemRequestDTO) =>
    apiClient.post(`/lecturer/grades/columns`, data, { params: { userId } }),

  // Attendance
  getAttendance: (lopHocPhanId: string, userId: string, lichId?: string) =>
    apiClient.get<AttendanceResponseDTO>(`/lecturer/attendance/${lopHocPhanId}`, {
      params: { userId, lichId },
    }).then(r => r.data),

  updateAttendance: (userId: string, data: AttendanceRequestDTO) =>
    apiClient.put(`/lecturer/attendance`, data, { params: { userId } }),

  // Notifications
  sendNotification: (userId: string, data: NotificationRequestDTO) =>
    apiClient.post<NotificationResponseDTO>(`/lecturer/notifications`, data, {
      params: { userId },
    }).then(r => r.data),

  getMyNotifications: (userId: string) =>
    apiClient.get<NotificationDetailResponseDTO[]>(`/lecturer/notifications`, {
      params: { userId },
    }).then(r => r.data),

  deleteNotification: (notificationId: string, userId: string) =>
    apiClient.delete(`/lecturer/notifications/${notificationId}`, { params: { userId } }),

  // Quiz
  getQuizzesByClass: (lopHocPhanId: string, userId: string) =>
    apiClient.get<QuizResponseDTO[]>(`/lecturer/quiz/lop-hoc-phan/${lopHocPhanId}`, {
      params: { userId },
    }).then(r => r.data),

  getQuiz: (quizId: string, userId: string) =>
    apiClient.get<QuizResponseDTO>(`/lecturer/quiz/${quizId}`, {
      params: { userId },
    }).then(r => r.data),

  createQuiz: (userId: string, data: QuizRequestDTO) =>
    apiClient.post<QuizResponseDTO>(`/lecturer/quiz`, data, {
      params: { userId },
    }).then(r => r.data),

  updateQuiz: (quizId: string, userId: string, data: QuizRequestDTO) =>
    apiClient.put<QuizResponseDTO>(`/lecturer/quiz/${quizId}`, data, {
      params: { userId },
    }).then(r => r.data),

  deleteQuiz: (quizId: string, userId: string) =>
    apiClient.delete(`/lecturer/quiz/${quizId}`, { params: { userId } }),

  getQuizResults: (lopHocPhanId: string, quizId: string, userId: string) =>
    apiClient.get<QuizResultResponseDTO>(`/lecturer/quiz/${lopHocPhanId}/results/${quizId}`, {
      params: { userId },
    }).then(r => r.data),

  getQuizAttemptDetail: (quizId: string, hocVienId: string, userId: string) =>
    apiClient.get<QuizAttemptDetailResponseDTO>(`/lecturer/quiz/${quizId}/attempts/${hocVienId}/detail`, {
      params: { userId },
    }).then(r => r.data),

  gradeQuizAttempt: (quizId: string, hocVienId: string, userId: string, diem?: number, nhanXet?: string) =>
    apiClient.put(`/lecturer/quiz/${quizId}/grade/${hocVienId}`, null, {
      params: { userId, diem, nhanXet },
    }),
};

export interface QuizRequestDTO {
  lopHocPhanId: string;
  tieuDe: string;
  moTa?: string;
  thoiGianBatDau: string;
  thoiGianKetThuc: string;
  thoiGianLam: number;
  soLanLam?: number;
  trinhTrang?: boolean;
  questions: QuestionRequestDTO[];
}

export interface QuestionRequestDTO {
  noiDung: string;
  loaiCauHoi: boolean;
  nhieuDapAn?: boolean;
  diem: number;
  answers: AnswerRequestDTO[];
}

export interface AnswerRequestDTO {
  keyAnswers: string;
  conText: string;
  isCorrect: boolean;
}

export default lecturerApi;
