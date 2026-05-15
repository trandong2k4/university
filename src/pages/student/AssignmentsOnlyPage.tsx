import { useCallback, useEffect, useState } from 'react';
import { useNavigate } from 'react-router';
import { useAuth } from '@/hooks';
import apiClient from '@/api/common';
import { StudentSidebar } from '@/components/layouts/StudentSidebar';
import { StudentHeader } from '@/components/layouts/StudentHeader';
import { AIAssistantButton } from '@/components/chatbot/AIAssistantButton';
import { DocumentViewerModal } from '@/components/common/DocumentViewerModal';
import { uploadFile } from '@/utils/fileUtils';
import {
  Clock,
  CheckCircle,
  AlertCircle,
  Upload,
  ArrowLeft,
  FileText,
  Calendar,
  Search,
  Eye,
  Trash2,
  Loader2,
  RefreshCw,
  PlayCircle
} from 'lucide-react';

interface User {
  username: string;
  name?: string;
  role: string;
}

interface ExerciseDTO {
  id: string;
  tieude: string;
  moTa: string;
  fileExerciseUrl?: string;
  thoiGianBatDau: string;
  thoiGianKetThuc: string;
  updatedAt?: string;
  gioiHanLanLam?: number;
  soLanDaLam?: number;
  maLopHocPhan: string;
  trangThai: 'SAP_MO' | 'DANG_MO' | 'SAP_HET_HAN' | 'DA_DONG';
  dacoketqua: boolean;
  diemSo: number | null;
}

interface DangKyDTO { id: string; lopHocPhanId: string; maLopHocPhan: string }

interface PageResponse<T> { content: T[]; totalPages: number; totalElements: number }

interface ExerciseDetailDTO {
  id: string;
  tieuDe: string;
  moTa: string;
  fileExerciseUrl?: string;
  thoiGianBatDau: string;
  thoiGianKetThuc: string;
  updatedAt?: string;
  gioiHanLanLam?: number;
  maLopHocPhan?: string;
  tenMonHoc?: string;
  soLanDaLam?: number;
  diem: number | null;
  ghiChu: string | null;
  questions: ExerciseQuestionDTO[];
  submissionHistory?: ExerciseSubmissionHistoryDTO[];
}

interface ExerciseQuestionDTO {
  questionId: string;
  noiDung: string;
  loaiCauHoi: boolean;
  nhieuDapAn?: boolean;
  diem: number;
  answers: ExerciseAnswerDTO[];
}

interface ExerciseAnswerDTO {
  answerId: string;
  keyAnswers: string;
  conText: string;
}

interface ExerciseSubmissionHistoryDTO {
  submissionId: string;
  phienThucHien?: number;
  fileExerciseUrl?: string;
  thoiGianNop?: string;
  diem?: number | null;
  ghiChu?: string | null;
  answers?: ExerciseSubmissionAnswerDTO[];
}

interface ExerciseSubmissionAnswerDTO {
  questionId: string;
  answerId?: string;
  keyAnswers?: string;
  answerText?: string;
  noiDungTuLuan?: string;
  isCorrect?: boolean | null;
  diemDatDuoc?: number | null;
}

interface Assignment {
  id: string;
  title: string;
  subject: string;
  description: string;
  startTime: Date | null;
  deadline: Date;
  updatedAt: Date | null;
  status: AssignmentStatus;
  maxScore: number;
  fileExerciseUrl?: string;
  attemptLimit: number;
  attemptCount: number;
  score?: number;
  submittedAt?: Date;
  submittedFile?: { name: string; size: string };
}

type AssignmentStatus = 'pending' | 'submitted' | 'late' | 'not-open';
type StatusFilter = 'all' | AssignmentStatus;

function extractItems<T>(payload: PageResponse<T> | T[] | unknown): T[] {
  if (Array.isArray(payload)) return payload as T[];
  if (payload && typeof payload === 'object' && 'content' in payload) {
    const content = (payload as PageResponse<T>).content;
    return Array.isArray(content) ? content : [];
  }
  return [];
}

function getErrorMessage(error: unknown, fallback: string) {
  if (error && typeof error === 'object' && 'response' in error) {
    const response = (error as { response?: { data?: { detail?: string; message?: string } } }).response;
    return response?.data?.detail || response?.data?.message || fallback;
  }
  return fallback;
}

function isHttpUrl(value?: string) {
  return Boolean(value && (/^https?:\/\//i.test(value) || value.startsWith('/api/') || value.startsWith('/')));
}

function formatDateTime(value?: string) {
  if (!value) return '–';
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;
  return `${date.toLocaleDateString('vi-VN')} ${date.toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' })}`;
}

function getAssignmentStatus(
  startTime: Date | null,
  deadline: Date,
  hasSubmitted: boolean,
  serverStatus?: ExerciseDTO['trangThai']
): AssignmentStatus {
  const now = new Date();
  if (hasSubmitted) return 'submitted';
  if (serverStatus === 'SAP_MO' || (startTime && now < startTime)) return 'not-open';
  if (serverStatus === 'DA_DONG' || now > deadline) return 'late';
  return 'pending';
}

function toAssignment(exercise: ExerciseDTO): Assignment {
  const startTime = exercise.thoiGianBatDau ? new Date(exercise.thoiGianBatDau) : null;
  const deadline = exercise.thoiGianKetThuc ? new Date(exercise.thoiGianKetThuc) : new Date();
  const updatedAt = exercise.updatedAt ? new Date(exercise.updatedAt) : null;
  const attemptCount = exercise.soLanDaLam ?? 0;
  const hasSubmitted = exercise.dacoketqua || attemptCount > 0;
  const status = getAssignmentStatus(startTime, deadline, hasSubmitted, exercise.trangThai);

  return {
    id: exercise.id,
    title: exercise.tieude,
    subject: exercise.maLopHocPhan,
    description: exercise.moTa,
    startTime,
    deadline,
    updatedAt,
    status,
    maxScore: 10,
    fileExerciseUrl: exercise.fileExerciseUrl,
    attemptLimit: exercise.gioiHanLanLam ?? 1,
    attemptCount,
    score: exercise.diemSo ?? undefined,
  };
}

export default function AssignmentsOnlyPage() {
  const navigate = useNavigate();
  const { user: authUser, isAuthenticated } = useAuth();
  const [user, setUser] = useState<User | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<StatusFilter>('all');
  const [selectedAssignment, setSelectedAssignment] = useState<Assignment | null>(null);
  const [selectedDetail, setSelectedDetail] = useState<ExerciseDetailDTO | null>(null);
  const [loadingDetail, setLoadingDetail] = useState(false);
  const [selectedAnswerIds, setSelectedAnswerIds] = useState<Record<string, string[]>>({});
  const [essayAnswers, setEssayAnswers] = useState<Record<string, string>>({});
  const [uploadedFile, setUploadedFile] = useState<File | null>(null);
  const [assignments, setAssignments] = useState<Assignment[]>([]);
  const [loadingAssignments, setLoadingAssignments] = useState(false);
  const [pageError, setPageError] = useState('');
  const [submitError, setSubmitError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [previewFile, setPreviewFile] = useState<{ title: string; url: string } | null>(null);

  const syncAssignmentFromDetail = useCallback((detail: ExerciseDetailDTO) => {
    const latestSubmission = detail.submissionHistory?.[0];
    setAssignments(prev => prev.map(assignment => {
      if (assignment.id !== detail.id) return assignment;

      const startTime = detail.thoiGianBatDau ? new Date(detail.thoiGianBatDau) : null;
      const deadline = detail.thoiGianKetThuc ? new Date(detail.thoiGianKetThuc) : assignment.deadline;
      const updatedAt = detail.updatedAt ? new Date(detail.updatedAt) : assignment.updatedAt;
      const attemptCount = detail.soLanDaLam ?? assignment.attemptCount;
      const status = getAssignmentStatus(startTime, deadline, attemptCount > 0);

      return {
        ...assignment,
        title: detail.tieuDe || assignment.title,
        subject: detail.maLopHocPhan || assignment.subject,
        description: detail.moTa || assignment.description,
        fileExerciseUrl: detail.fileExerciseUrl || assignment.fileExerciseUrl,
        startTime,
        deadline,
        updatedAt,
        attemptLimit: detail.gioiHanLanLam ?? assignment.attemptLimit,
        attemptCount,
        score: detail.diem ?? assignment.score,
        submittedAt: latestSubmission?.thoiGianNop ? new Date(latestSubmission.thoiGianNop) : assignment.submittedAt,
        submittedFile: latestSubmission?.fileExerciseUrl
          ? { name: latestSubmission.fileExerciseUrl, size: '-' }
          : assignment.submittedFile,
        status,
      };
    }));

    setSelectedAssignment(current => {
      if (!current || current.id !== detail.id) return current;

      const startTime = detail.thoiGianBatDau ? new Date(detail.thoiGianBatDau) : null;
      const deadline = detail.thoiGianKetThuc ? new Date(detail.thoiGianKetThuc) : current.deadline;
      const updatedAt = detail.updatedAt ? new Date(detail.updatedAt) : current.updatedAt;
      const attemptCount = detail.soLanDaLam ?? current.attemptCount;
      const status = getAssignmentStatus(startTime, deadline, attemptCount > 0);

      return {
        ...current,
        title: detail.tieuDe || current.title,
        subject: detail.maLopHocPhan || current.subject,
        description: detail.moTa || current.description,
        fileExerciseUrl: detail.fileExerciseUrl || current.fileExerciseUrl,
        startTime,
        deadline,
        updatedAt,
        attemptLimit: detail.gioiHanLanLam ?? current.attemptLimit,
        attemptCount,
        score: detail.diem ?? current.score,
        submittedAt: latestSubmission?.thoiGianNop ? new Date(latestSubmission.thoiGianNop) : current.submittedAt,
        submittedFile: latestSubmission?.fileExerciseUrl
          ? { name: latestSubmission.fileExerciseUrl, size: '-' }
          : current.submittedFile,
        status,
      };
    });
  }, []);

  const loadAssignments = useCallback(async () => {
    setLoadingAssignments(true);
    setPageError('');
    try {
      const regRes = await apiClient.get<DangKyDTO[]>('/student/dang-ky-tin-chi');
      const registrations = Array.isArray(regRes.data) ? regRes.data : [];
      const all: Assignment[] = [];

      await Promise.all(registrations.map(async (registration) => {
        const res = await apiClient.get<PageResponse<ExerciseDTO> | ExerciseDTO[]>(
          `/student/exercises?lopHocPhanId=${registration.lopHocPhanId}&page=0&size=100`
        );
        extractItems<ExerciseDTO>(res.data).forEach(exercise => {
          all.push(toAssignment(exercise));
        });
      }));

      all.sort((a, b) => a.deadline.getTime() - b.deadline.getTime());
      setAssignments(all);
    } catch (error) {
      setAssignments([]);
      setPageError(getErrorMessage(error, 'Không tải được danh sách bài tập.'));
    } finally {
      setLoadingAssignments(false);
    }
  }, []);

  useEffect(() => {
    if (!isAuthenticated || !authUser) {
      navigate('/');
      return;
    }
    if (authUser.role !== 'student') {
      navigate('/');
      return;
    }
    setUser({
      username: authUser.username,
      name: authUser.fullName,
      role: authUser.role,
    });
    loadAssignments();
  }, [isAuthenticated, authUser, navigate, loadAssignments]);

  const filteredAssignments = assignments.filter(assignment => {
    const matchesSearch = assignment.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         assignment.subject.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = statusFilter === 'all' || assignment.status === statusFilter;
    
    return matchesSearch && matchesStatus;
  });

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'submitted':
        return {
          bg: 'bg-green-100',
          text: 'text-green-700',
          icon: <CheckCircle className="w-4 h-4" />,
          label: 'Đã nộp'
        };
      case 'pending':
        return {
          bg: 'bg-yellow-100',
          text: 'text-yellow-700',
          icon: <Clock className="w-4 h-4" />,
          label: 'Chưa nộp'
        };
      case 'late':
        return {
          bg: 'bg-red-100',
          text: 'text-red-700',
          icon: <AlertCircle className="w-4 h-4" />,
          label: 'Trễ hạn'
        };
      case 'not-open':
        return {
          bg: 'bg-slate-100',
          text: 'text-slate-700',
          icon: <Clock className="w-4 h-4" />,
          label: 'Chưa mở'
        };
      default:
        return {
          bg: 'bg-gray-100',
          text: 'text-gray-700',
          icon: null,
          label: 'Không xác định'
        };
    }
  };

  const getTimeRemaining = (deadline: Date): string => {
    const now = new Date();
    const diff = deadline.getTime() - now.getTime();
    
    if (diff < 0) return 'Đã quá hạn';
    
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    
    if (days > 0) return `Còn ${days} ngày ${hours} giờ`;
    if (hours > 0) return `Còn ${hours} giờ`;
    
    const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
    return `Còn ${minutes} phút`;
  };

  const isDeadlineNear = (deadline: Date): boolean => {
    const now = new Date();
    const diff = deadline.getTime() - now.getTime();
    const hoursRemaining = diff / (1000 * 60 * 60);
    return hoursRemaining > 0 && hoursRemaining <= 48;
  };

  const isNotOpenYet = (assignment: Assignment) =>
    assignment.startTime != null && new Date() < assignment.startTime;

  const closeSubmitModal = () => {
    setSelectedAssignment(null);
    setSelectedDetail(null);
    setUploadedFile(null);
    setSelectedAnswerIds({});
    setEssayAnswers({});
  };

  const openSubmitModal = async (assignment: Assignment) => {
    if (isNotOpenYet(assignment)) {
      setSubmitError('Bài tập chưa mở. Bạn chỉ có thể xem chi tiết sau thời gian bắt đầu.');
      return;
    }
    setSelectedAssignment(assignment);
    setSelectedDetail(null);
    setUploadedFile(null);
    setSelectedAnswerIds({});
    setEssayAnswers({});
    setSubmitError('');
    setSuccessMessage('');
    setLoadingDetail(true);
    try {
      const res = await apiClient.get<ExerciseDetailDTO>(`/student/exercises/${assignment.id}`);
      setSelectedDetail(res.data);
      syncAssignmentFromDetail(res.data);
    } catch (error) {
      setSubmitError(getErrorMessage(error, 'Không tải được chi tiết bài tập.'));
      closeSubmitModal();
    } finally {
      setLoadingDetail(false);
    }
  };

  const toggleAnswer = (question: ExerciseQuestionDTO, answerId: string) => {
    setSelectedAnswerIds(prev => {
      const questionId = question.questionId;
      const current = prev[questionId] ?? [];
      const exists = current.includes(answerId);
      return {
        ...prev,
        [questionId]: question.nhieuDapAn
          ? (exists ? current.filter(id => id !== answerId) : [...current, answerId])
          : (exists ? [] : [answerId]),
      };
    });
  };

  const hasAnyAnswer = () => {
    const hasMultipleChoiceAnswer = Object.values(selectedAnswerIds).some(ids => ids.length > 0);
    const hasEssayAnswer = Object.values(essayAnswers).some(value => value.trim());
    return hasMultipleChoiceAnswer || hasEssayAnswer;
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setUploadedFile(e.target.files[0]);
    }
  };

  const handleSubmit = async () => {
    if (!selectedAssignment) return;
    setSubmitError('');
    setSuccessMessage('');
    if (isNotOpenYet(selectedAssignment)) {
      setSubmitError('Bài tập chưa mở, chưa thể nộp bài.');
      return;
    }
    if (new Date() > selectedAssignment.deadline) {
      setSubmitError('Bài tập đã hết hạn, không thể nộp bài.');
      return;
    }
    if (selectedAssignment.attemptCount >= selectedAssignment.attemptLimit) {
      setSubmitError('Bạn đã vượt quá giới hạn số lần làm bài.');
      return;
    }
    if (!uploadedFile && !hasAnyAnswer()) {
      setSubmitError('Vui lòng chọn file hoặc trả lời câu hỏi trước khi nộp.');
      return;
    }
    if (!user || !selectedDetail) return;

    const answers = selectedDetail.questions.flatMap(question => {
      if (question.loaiCauHoi) {
        return (selectedAnswerIds[question.questionId] ?? []).map(answerId => ({
          questionId: question.questionId,
          answerId,
        }));
      }
      const content = essayAnswers[question.questionId]?.trim();
      return content ? [{ questionId: question.questionId, noiDungTuLuan: content }] : [];
    });

    setSubmitting(true);
    try {
      const uploaded = uploadedFile ? await uploadFile(uploadedFile) : null;
      await apiClient.post('/student/exercise/submit', {
        exerciseId: selectedAssignment.id,
        fileExerciseUrl: uploaded?.fileUrl,
        answers,
      });
      setSuccessMessage('Nộp bài thành công.');
      await loadAssignments();
      closeSubmitModal();
    } catch (error) {
      setSubmitError(getErrorMessage(error, 'Nộp bài thất bại, vui lòng thử lại.'));
    } finally {
      setSubmitting(false);
    }
  };

  if (!user) return null;

  const userName = user.name || user.username;

  const stats = {
    total: assignments.length,
    submitted: assignments.filter(a => a.status === 'submitted').length,
    pending: assignments.filter(a => a.status === 'pending').length,
    late: assignments.filter(a => a.status === 'late').length
  };
  const selectedNotOpen = selectedAssignment ? isNotOpenYet(selectedAssignment) : false;
  const selectedExpired = selectedAssignment ? new Date() > selectedAssignment.deadline : false;
  const selectedAttemptExceeded = selectedAssignment
    ? selectedAssignment.attemptCount >= selectedAssignment.attemptLimit
    : false;
  const canWorkSelected = !!selectedAssignment
    && !selectedNotOpen
    && !selectedExpired
    && !selectedAttemptExceeded;
  const canSubmitSelected = !!selectedAssignment
    && !!selectedDetail
    && !loadingDetail
    && !submitting
    && canWorkSelected
    && (!!uploadedFile || hasAnyAnswer());

  return (
    <div className="flex h-screen bg-[#f1f5f9]">
      <StudentSidebar />

      <div className="flex-1 ml-64 flex flex-col">
        <StudentHeader userName={userName} />

        <main className="flex-1 overflow-y-auto p-8">
          <div className="mb-6">
            <h1 className="text-3xl font-bold text-[#0a2540]">Bài tập</h1>
            <p className="text-[#6a7282] mt-2">Quản lý và nộp bài tập dễ dàng</p>
          </div>

          {pageError && (
            <div className="mb-6 bg-red-50 border border-red-200 rounded-[14px] p-4 flex items-start gap-3">
              <AlertCircle className="w-5 h-5 text-red-600 mt-0.5" />
              <p className="text-sm font-medium text-red-800">{pageError}</p>
            </div>
          )}

          {submitError && !selectedAssignment && (
            <div className="mb-6 bg-red-50 border border-red-200 rounded-[14px] p-4 flex items-start gap-3">
              <AlertCircle className="w-5 h-5 text-red-600 mt-0.5" />
              <p className="text-sm font-medium text-red-800">{submitError}</p>
            </div>
          )}

          {successMessage && (
            <div className="mb-6 bg-green-50 border border-green-200 rounded-[14px] p-4 flex items-start gap-3">
              <CheckCircle className="w-5 h-5 text-green-600 mt-0.5" />
              <p className="text-sm font-medium text-green-800">{successMessage}</p>
            </div>
          )}

          {/* Statistics */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-6">
            <div className="bg-white rounded-[14px] border border-[#e5e7eb] shadow-sm p-6">
              <div className="flex items-center gap-3">
                <div className="p-3 bg-blue-100 rounded-lg">
                  <FileText className="w-6 h-6 text-blue-600" />
                </div>
                <div>
                  <p className="text-sm text-[#6a7282]">Tổng số</p>
                  <p className="text-2xl font-bold text-[#0a2540]">{stats.total}</p>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-[14px] border border-[#e5e7eb] shadow-sm p-6">
              <div className="flex items-center gap-3">
                <div className="p-3 bg-green-100 rounded-lg">
                  <CheckCircle className="w-6 h-6 text-green-600" />
                </div>
                <div>
                  <p className="text-sm text-[#6a7282]">Đã nộp</p>
                  <p className="text-2xl font-bold text-[#0a2540]">{stats.submitted}</p>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-[14px] border border-[#e5e7eb] shadow-sm p-6">
              <div className="flex items-center gap-3">
                <div className="p-3 bg-yellow-100 rounded-lg">
                  <Clock className="w-6 h-6 text-yellow-600" />
                </div>
                <div>
                  <p className="text-sm text-[#6a7282]">Chưa nộp</p>
                  <p className="text-2xl font-bold text-[#0a2540]">{stats.pending}</p>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-[14px] border border-[#e5e7eb] shadow-sm p-6">
              <div className="flex items-center gap-3">
                <div className="p-3 bg-red-100 rounded-lg">
                  <AlertCircle className="w-6 h-6 text-red-600" />
                </div>
                <div>
                  <p className="text-sm text-[#6a7282]">Trễ hạn</p>
                  <p className="text-2xl font-bold text-[#0a2540]">{stats.late}</p>
                </div>
              </div>
            </div>
          </div>

          {/* Search and Filter */}
          <div className="bg-white rounded-[14px] border border-[#e5e7eb] shadow-sm p-6 mb-6">
            <div className="flex flex-col md:flex-row gap-4">
              <div className="flex-1 relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-[#6a7282]" />
                <input
                  type="text"
                  placeholder="Tìm kiếm bài tập..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 border border-[#e5e7eb] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#0a2540] transition-colors"
                />
              </div>

              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value as StatusFilter)}
                className="px-4 py-3 border border-[#e5e7eb] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#0a2540] transition-colors bg-white appearance-none cursor-pointer min-w-[200px]"
              >
                <option value="all">Tất cả trạng thái</option>
                <option value="not-open">Chưa mở</option>
                <option value="pending">Chưa nộp</option>
                <option value="submitted">Đã nộp</option>
                <option value="late">Trễ hạn</option>
              </select>

              <button
                type="button"
                onClick={loadAssignments}
                disabled={loadingAssignments}
                className="inline-flex items-center justify-center gap-2 px-4 py-3 bg-[#0a2540] text-white rounded-lg hover:bg-[#0d2f52] transition-colors disabled:opacity-60 disabled:cursor-not-allowed font-medium"
              >
                <RefreshCw className={`w-4 h-4 ${loadingAssignments ? 'animate-spin' : ''}`} />
                Cập nhật
              </button>
            </div>

            <div className="mt-4 pt-4 border-t border-[#e5e7eb]">
              <p className="text-sm text-[#6a7282]">
                Tìm thấy <span className="font-semibold text-[#0a2540]">{filteredAssignments.length}</span> bài tập
              </p>
            </div>
          </div>

          {/* Assignments Table/Cards */}
          <div className="space-y-4">
            {loadingAssignments ? (
              <div className="bg-white rounded-[14px] border border-[#e5e7eb] shadow-sm p-12 text-center">
                <Loader2 className="w-8 h-8 text-[#0a2540] mx-auto mb-3 animate-spin" />
                <p className="text-[#6a7282]">Đang tải danh sách bài tập...</p>
              </div>
            ) : filteredAssignments.length > 0 ? (
              filteredAssignments.map((assignment) => {
                const statusBadge = getStatusBadge(assignment.status);
                const timeRemaining = getTimeRemaining(assignment.deadline);
                const isNearDeadline = isDeadlineNear(assignment.deadline);

                return (
                  <div
                    key={assignment.id}
                    className="bg-white rounded-[14px] border border-[#e5e7eb] shadow-sm overflow-hidden hover:shadow-md transition-shadow"
                  >
                    <div className="p-6">
                      <div className="flex items-start justify-between mb-4">
                        <div className="flex-1">
                          <div className="flex items-center gap-3 mb-2">
                            <h3 className="text-xl font-bold text-[#0a2540]">{assignment.title}</h3>
                            <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-sm font-medium ${statusBadge.bg} ${statusBadge.text}`}>
                              {statusBadge.icon}
                              {statusBadge.label}
                            </span>
                          </div>
                          <p className="text-sm text-[#6a7282] mb-2">{assignment.subject}</p>
                          <p className="text-[#6a7282]">
                            {assignment.status === 'not-open'
                              ? 'Nội dung chi tiết sẽ hiển thị khi bài tập được mở.'
                              : assignment.description}
                          </p>
                        </div>
                      </div>

                      <div className="flex flex-wrap items-center gap-6 mb-4">
                        {assignment.startTime && (
                          <div className="flex items-center gap-2">
                            <Calendar className="w-4 h-4 text-[#6a7282]" />
                            <span className="text-sm text-[#6a7282]">
                              Mở: {assignment.startTime.toLocaleDateString('vi-VN')} {assignment.startTime.toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' })}
                            </span>
                          </div>
                        )}

                        <div className="flex items-center gap-2">
                          <Calendar className="w-4 h-4 text-[#6a7282]" />
                          <span className="text-sm text-[#6a7282]">
                            Hạn nộp: {assignment.deadline.toLocaleDateString('vi-VN')} {assignment.deadline.toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' })}
                          </span>
                        </div>

                        <div className={`flex items-center gap-2 px-3 py-1.5 rounded-lg ${isNearDeadline ? 'bg-red-50 text-red-700' : 'bg-gray-50 text-[#6a7282]'}`}>
                          <Clock className="w-4 h-4" />
                          <span className="text-sm font-semibold">{timeRemaining}</span>
                        </div>

                        <div className="flex items-center gap-2">
                          <span className="text-sm text-[#6a7282]">
                            Điểm tối đa: <span className="font-semibold text-[#0a2540]">{assignment.maxScore}</span>
                          </span>
                        </div>

                        <div className="flex items-center gap-2">
                          <span className="text-sm text-[#6a7282]">
                            Lần làm: <span className="font-semibold text-[#0a2540]">{assignment.attemptCount}/{assignment.attemptLimit}</span>
                          </span>
                        </div>

                        {assignment.updatedAt && (
                          <div className="flex items-center gap-2">
                            <RefreshCw className="w-4 h-4 text-[#6a7282]" />
                            <span className="text-sm text-[#6a7282]">
                              Cập nhật: {assignment.updatedAt.toLocaleDateString('vi-VN')} {assignment.updatedAt.toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' })}
                            </span>
                          </div>
                        )}
                      </div>

                      {/* Submitted Info */}
                      {assignment.status === 'submitted' && assignment.submittedFile && (
                        <div className="bg-[#f9fafb] rounded-lg p-4 mb-4">
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-3">
                              <div className="p-2 bg-green-100 rounded-lg">
                                <FileText className="w-5 h-5 text-green-600" />
                              </div>
                              <div>
                                <p className="text-sm font-medium text-[#0a2540]">{assignment.submittedFile.name}</p>
                                <p className="text-xs text-[#6a7282]">
                                  Nộp lúc: {assignment.submittedAt?.toLocaleDateString('vi-VN')} {assignment.submittedAt?.toLocaleTimeString('vi-VN')} • {assignment.submittedFile.size}
                                </p>
                              </div>
                            </div>
                            {assignment.score !== undefined && (
                              <div className="text-right">
                                <p className="text-2xl font-bold text-green-600">{assignment.score.toFixed(1)}</p>
                                <p className="text-xs text-[#6a7282]">/{assignment.maxScore} điểm</p>
                              </div>
                            )}
                          </div>
                        </div>
                      )}

                      {/* Actions */}
                      <div className="flex flex-wrap gap-3">
                        {assignment.status === 'not-open' && (
                          <button
                            disabled
                            className="flex items-center gap-2 px-6 py-3 bg-slate-100 text-slate-700 rounded-lg cursor-not-allowed font-medium"
                          >
                            <Clock className="w-4 h-4" />
                            Chưa mở
                          </button>
                        )}

                        {assignment.status === 'pending' && (
                          <button
                            onClick={() => openSubmitModal(assignment)}
                            className="flex items-center gap-2 px-6 py-3 bg-[#0a2540] text-white rounded-lg hover:bg-[#0d2f52] transition-colors font-medium"
                          >
                            <PlayCircle className="w-4 h-4" />
                            Bắt đầu làm bài
                          </button>
                        )}

                        {assignment.status === 'submitted'
                          && new Date() <= assignment.deadline
                          && assignment.attemptCount < assignment.attemptLimit && (
                          <button
                            onClick={() => openSubmitModal(assignment)}
                            className="flex items-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium"
                          >
                            <PlayCircle className="w-4 h-4" />
                            Bắt đầu làm lại
                          </button>
                        )}

                        {assignment.status === 'late' && (
                          <button
                            disabled
                            className="flex items-center gap-2 px-6 py-3 bg-red-100 text-red-700 rounded-lg cursor-not-allowed font-medium"
                          >
                            <AlertCircle className="w-4 h-4" />
                            Đã hết hạn
                          </button>
                        )}

                        {assignment.status !== 'pending' && assignment.status !== 'not-open' && (
                          <button
                            onClick={() => openSubmitModal(assignment)}
                            className="flex items-center gap-2 px-6 py-3 rounded-lg bg-[#f1f5f9] text-[#0a2540] hover:bg-[#e5e7eb] transition-colors font-medium"
                          >
                            <Eye className="w-4 h-4" />
                            Chi tiết
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })
            ) : (
              <div className="bg-white rounded-[14px] border border-[#e5e7eb] shadow-sm p-12 text-center">
                <FileText className="w-16 h-16 text-[#9ca3af] mx-auto mb-4" />
                <p className="text-[#6a7282] mb-4">Không tìm thấy bài tập nào</p>
                <button
                  onClick={() => {
                    setSearchQuery('');
                    setStatusFilter('all');
                  }}
                  className="text-sm text-[#0a2540] hover:underline"
                >
                  Xóa bộ lọc
                </button>
              </div>
            )}
          </div>
        </main>
      </div>

      <AIAssistantButton />

      {/* Assignment workspace */}
      {selectedAssignment && (
        <div className="fixed inset-0 z-50 bg-[#f1f5f9] overflow-y-auto">
          <div className="min-h-screen flex flex-col">
            <div className="sticky top-0 z-20 border-b border-[#e5e7eb] bg-white/95 backdrop-blur">
              <div className="max-w-7xl mx-auto px-4 sm:px-6 py-4 flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
                <div className="flex flex-col gap-3 sm:flex-row sm:items-start min-w-0">
                  <button
                    onClick={closeSubmitModal}
                    className="inline-flex items-center justify-center gap-2 px-4 py-2 bg-[#f1f5f9] text-[#0a2540] rounded-lg hover:bg-[#e5e7eb] transition-colors font-medium"
                  >
                    <ArrowLeft className="w-4 h-4" />
                    Quay lại
                  </button>
                  <div className="min-w-0">
                    <h2 className="text-2xl font-bold text-[#0a2540] mb-1">
                      {selectedNotOpen || selectedExpired || selectedAttemptExceeded ? 'Chi tiết bài tập' : 'Làm bài tập'}
                    </h2>
                    <p className="text-[#6a7282] truncate">{selectedAssignment.title}</p>
                  </div>
                </div>
                <div className="flex flex-wrap items-center gap-2 text-sm text-[#475569]">
                  <span className="px-3 py-1.5 rounded-lg bg-[#f8fafc] border border-[#e5e7eb]">
                    {selectedAssignment.maxScore} điểm
                  </span>
                  <span className="px-3 py-1.5 rounded-lg bg-[#f8fafc] border border-[#e5e7eb]">
                    Lần làm {selectedAssignment.attemptCount}/{selectedAssignment.attemptLimit}
                  </span>
                </div>
              </div>
            </div>

            <main className="flex-1 w-full max-w-7xl mx-auto px-4 sm:px-6 py-6 space-y-6">
              <div className="bg-[#f9fafb] rounded-lg p-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm text-[#6a7282]">Môn học</p>
                    <p className="font-medium text-[#0a2540]">{selectedAssignment.subject}</p>
                  </div>
                  <div>
                    <p className="text-sm text-[#6a7282]">Thời gian mở</p>
                    <p className="font-medium text-[#0a2540]">
                      {selectedAssignment.startTime
                        ? `${selectedAssignment.startTime.toLocaleDateString('vi-VN')} ${selectedAssignment.startTime.toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' })}`
                        : 'Đang mở'}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-[#6a7282]">Hạn nộp</p>
                    <p className="font-medium text-[#0a2540]">
                      {selectedAssignment.deadline.toLocaleDateString('vi-VN')} {selectedAssignment.deadline.toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' })}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-[#6a7282]">Điểm tối đa</p>
                    <p className="font-medium text-[#0a2540]">{selectedAssignment.maxScore} điểm</p>
                  </div>
                  <div>
                    <p className="text-sm text-[#6a7282]">Thời gian còn lại</p>
                    <p className="font-medium text-[#0a2540]">{getTimeRemaining(selectedAssignment.deadline)}</p>
                  </div>
                  <div>
                    <p className="text-sm text-[#6a7282]">Số lần làm</p>
                    <p className="font-medium text-[#0a2540]">
                      {selectedAssignment.attemptCount}/{selectedAssignment.attemptLimit}
                    </p>
                  </div>
                  {selectedAssignment.updatedAt && (
                    <div>
                      <p className="text-sm text-[#6a7282]">Cập nhật gần nhất</p>
                      <p className="font-medium text-[#0a2540]">
                        {selectedAssignment.updatedAt.toLocaleDateString('vi-VN')} {selectedAssignment.updatedAt.toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' })}
                      </p>
                    </div>
                  )}
                </div>
              </div>

              {submitError && (
                <div className="bg-red-50 border border-red-200 rounded-lg p-4 flex items-start gap-3">
                  <AlertCircle className="w-5 h-5 text-red-600 mt-0.5" />
                  <p className="text-sm font-medium text-red-800">{submitError}</p>
                </div>
              )}

              {(selectedDetail?.fileExerciseUrl || selectedAssignment.fileExerciseUrl) && (
                <button
                  type="button"
                  onClick={() => setPreviewFile({
                    title: `Đề bài - ${selectedAssignment.title}`,
                    url: (selectedDetail?.fileExerciseUrl || selectedAssignment.fileExerciseUrl)!,
                  })}
                  className="inline-flex items-center gap-2 px-4 py-2 bg-blue-50 text-blue-700 rounded-lg hover:bg-blue-100 font-medium"
                >
                  <FileText className="w-4 h-4" />
                  Xem file đề bài
                </button>
              )}

              {selectedDetail?.submissionHistory?.length ? (
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 space-y-3">
                  <div className="flex items-center justify-between gap-3">
                    <p className="text-sm font-bold text-blue-900">Lịch sử làm bài</p>
                    <span className="text-xs font-semibold text-blue-700 bg-white/70 px-2 py-1 rounded">
                      {selectedDetail.submissionHistory.length} lần nộp
                    </span>
                  </div>

                  {selectedDetail.submissionHistory.map((submission) => (
                    <div key={submission.submissionId} className="rounded-lg bg-white border border-blue-100 p-3 space-y-2">
                      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
                        <div>
                          <p className="text-sm font-semibold text-[#0a2540]">
                            Lần {submission.phienThucHien ?? '–'}
                          </p>
                          <p className="text-xs text-[#6a7282]">
                            Nộp lúc: {formatDateTime(submission.thoiGianNop)}
                          </p>
                        </div>
                        {submission.diem != null && (
                          <div className="text-sm font-bold text-green-700">
                            {submission.diem.toFixed(1)} điểm
                          </div>
                        )}
                      </div>

                      {submission.fileExerciseUrl ? (
                        isHttpUrl(submission.fileExerciseUrl) ? (
                          <button
                            type="button"
                            onClick={() => setPreviewFile({
                              title: `Bài nộp lần ${submission.phienThucHien ?? ''}`,
                              url: submission.fileExerciseUrl!,
                            })}
                            className="inline-flex items-center gap-2 text-sm font-medium text-blue-700 hover:text-blue-800"
                          >
                            <FileText className="w-4 h-4" />
                            Xem file đã nộp
                          </button>
                        ) : (
                          <div className="inline-flex items-center gap-2 text-sm text-blue-800">
                            <FileText className="w-4 h-4" />
                            {submission.fileExerciseUrl}
                          </div>
                        )
                      ) : (
                        <p className="text-sm text-[#6a7282]">Không có file đính kèm</p>
                      )}

                      {submission.answers?.length ? (
                        <div className="text-xs text-[#475569] space-y-1">
                          {submission.answers.map((answer, idx) => (
                            <p key={`${submission.submissionId}-${answer.questionId}-${answer.answerId || idx}`}>
                              {answer.keyAnswers
                                ? `Đáp án ${answer.keyAnswers}: ${answer.answerText || ''}`
                                : answer.noiDungTuLuan
                                  ? `Tự luận: ${answer.noiDungTuLuan}`
                                  : 'Chưa trả lời'}
                            </p>
                          ))}
                        </div>
                      ) : null}
                    </div>
                  ))}
                </div>
              ) : selectedAssignment.submittedFile ? (
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                  <p className="text-sm font-medium text-blue-900 mb-2">Bài đã nộp:</p>
                  <div className="flex items-center gap-3">
                    <FileText className="w-5 h-5 text-blue-600" />
                    <div>
                      <p className="text-sm font-medium text-blue-900">{selectedAssignment.submittedFile.name}</p>
                      <p className="text-xs text-blue-700">{selectedAssignment.submittedFile.size}</p>
                    </div>
                  </div>
                </div>
              ) : null}

              {loadingDetail ? (
                <div className="rounded-lg border border-[#e5e7eb] p-4 text-sm text-[#6a7282]">
                  Đang tải câu hỏi...
                </div>
              ) : selectedDetail?.questions?.length ? (
                <div className="space-y-4">
                  <h3 className="font-bold text-[#0a2540]">Câu hỏi</h3>
                  {selectedDetail.questions.map((question, index) => (
                    <div key={question.questionId} className="rounded-lg border border-[#e5e7eb] p-4 space-y-3">
                      <div className="flex items-start justify-between gap-3">
                        <div>
                          <p className="font-semibold text-[#0a2540]">Câu {index + 1}</p>
                          <p className="text-[#334155] mt-1">{question.noiDung}</p>
                        </div>
                        <span className="text-sm font-semibold text-[#0a2540] bg-[#f1f5f9] px-2 py-1 rounded">
                          {question.diem} điểm
                        </span>
                      </div>

                      {question.loaiCauHoi ? (
                        <div className="space-y-2">
                          <p className="text-xs font-medium text-[#64748b]">
                            {question.nhieuDapAn ? 'Có thể chọn nhiều đáp án' : 'Chỉ chọn một đáp án'}
                          </p>
                          {question.answers.map(answer => {
                            const checked = (selectedAnswerIds[question.questionId] ?? []).includes(answer.answerId);
                            return (
                              <label
                                key={answer.answerId}
                                className={`flex items-center gap-3 rounded-lg border px-3 py-2 cursor-pointer ${
                                  checked ? 'border-[#0a2540] bg-[#f8fafc]' : 'border-[#e5e7eb] bg-white'
                                }`}
                              >
                                <input
                                  type={question.nhieuDapAn ? 'checkbox' : 'radio'}
                                  name={`question-${question.questionId}`}
                                  checked={checked}
                                  onChange={() => toggleAnswer(question, answer.answerId)}
                                  disabled={!canWorkSelected}
                                  className="w-4 h-4 disabled:cursor-not-allowed"
                                />
                                <span className="font-semibold text-[#0a2540]">{answer.keyAnswers}.</span>
                                <span className="text-[#334155]">{answer.conText}</span>
                              </label>
                            );
                          })}
                        </div>
                      ) : (
                        <textarea
                          value={essayAnswers[question.questionId] ?? ''}
                          onChange={e => setEssayAnswers(prev => ({ ...prev, [question.questionId]: e.target.value }))}
                          placeholder="Nhập câu trả lời..."
                          disabled={!canWorkSelected}
                          rows={4}
                          className="w-full px-4 py-3 border border-[#e5e7eb] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#0a2540] resize-none disabled:bg-[#f8fafc] disabled:text-[#94a3b8]"
                        />
                      )}
                    </div>
                  ))}
                </div>
              ) : null}

              <div>
                <label className="block text-sm font-medium text-[#0a2540] mb-3">
                  Chọn file nộp bài
                </label>
                
                {uploadedFile ? (
                  <div className="border-2 border-[#e5e7eb] rounded-lg p-4 bg-[#f9fafb]">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="p-2 bg-blue-100 rounded-lg">
                          <FileText className="w-6 h-6 text-blue-600" />
                        </div>
                        <div>
                          <p className="font-medium text-[#0a2540]">{uploadedFile.name}</p>
                          <p className="text-sm text-[#6a7282]">
                            {(uploadedFile.size / (1024 * 1024)).toFixed(2)} MB
                          </p>
                        </div>
                      </div>
                      <button
                        onClick={() => setUploadedFile(null)}
                        className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                      >
                        <Trash2 className="w-5 h-5" />
                      </button>
                    </div>
                  </div>
                ) : (
                  <label className={`block border-2 border-dashed border-[#e5e7eb] rounded-lg p-8 text-center transition-colors ${
                    canWorkSelected
                      ? 'cursor-pointer hover:border-[#0a2540] hover:bg-[#f9fafb]'
                      : 'cursor-not-allowed bg-[#f8fafc] opacity-70'
                  }`}>
                    <Upload className="w-12 h-12 text-[#6a7282] mx-auto mb-3" />
                    <p className="text-[#0a2540] font-medium mb-1">Chọn file để tải lên</p>
                    <p className="text-sm text-[#6a7282]">PDF, DOC, DOCX, ZIP (Tối đa 50MB)</p>
                    <input
                      type="file"
                      onChange={handleFileChange}
                      accept=".pdf,.doc,.docx,.zip,.rar"
                      disabled={!canWorkSelected}
                      className="hidden"
                    />
                  </label>
                )}
              </div>

              {selectedNotOpen && (
                <div className="bg-slate-50 border border-slate-200 rounded-lg p-4 flex items-start gap-3">
                  <Clock className="w-5 h-5 text-slate-600 mt-0.5" />
                  <div>
                    <p className="text-sm font-medium text-slate-900">Bài tập chưa mở</p>
                    <p className="text-sm text-slate-700">Bạn có thể xem thông tin bài tập nhưng chưa thể nộp bài.</p>
                  </div>
                </div>
              )}

              {selectedExpired && (
                <div className="bg-red-50 border border-red-200 rounded-lg p-4 flex items-start gap-3">
                  <AlertCircle className="w-5 h-5 text-red-600 mt-0.5" />
                  <div>
                    <p className="text-sm font-medium text-red-900">Bài tập đã hết hạn</p>
                    <p className="text-sm text-red-700">Hệ thống không cho nộp bài sau thời gian kết thúc.</p>
                  </div>
                </div>
              )}

              {selectedAttemptExceeded && (
                <div className="bg-red-50 border border-red-200 rounded-lg p-4 flex items-start gap-3">
                  <AlertCircle className="w-5 h-5 text-red-600 mt-0.5" />
                  <div>
                    <p className="text-sm font-medium text-red-900">Đã đạt giới hạn lần làm</p>
                    <p className="text-sm text-red-700">Bạn không thể nộp thêm phiên mới cho bài tập này.</p>
                  </div>
                </div>
              )}
            </main>

            <div className="sticky bottom-0 z-20 border-t border-[#e5e7eb] bg-white/95 backdrop-blur">
              <div className="max-w-7xl mx-auto px-4 sm:px-6 py-4 flex flex-col sm:flex-row gap-3 sm:justify-end">
                <button
                  onClick={closeSubmitModal}
                  className="w-full sm:w-auto px-5 py-3 bg-[#f1f5f9] text-[#0a2540] rounded-lg hover:bg-[#e5e7eb] transition-colors font-medium"
                >
                  <span className="inline-flex items-center justify-center gap-2">
                    <ArrowLeft className="w-4 h-4" />
                    Quay lại
                  </span>
                </button>
                <button
                  onClick={handleSubmit}
                  disabled={!canSubmitSelected}
                  className={`w-full sm:w-auto min-w-40 px-5 py-3 rounded-lg transition-colors font-medium ${
                    canSubmitSelected
                      ? 'bg-[#0a2540] text-white hover:bg-[#0d2f52]'
                      : 'bg-[#e5e7eb] text-[#9ca3af] cursor-not-allowed'
                  }`}
                >
                  {submitting ? (
                    <span className="inline-flex items-center justify-center gap-2">
                      <Loader2 className="w-4 h-4 animate-spin" />
                      Đang nộp...
                    </span>
                  ) : 'Nộp bài'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      <DocumentViewerModal
        open={!!previewFile}
        title={previewFile?.title || 'Tài liệu'}
        url={previewFile?.url}
        onClose={() => setPreviewFile(null)}
      />
    </div>
  );
}
