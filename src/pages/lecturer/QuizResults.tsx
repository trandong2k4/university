import { InstructorSidebar } from '@/components/layouts/InstructorSidebar';
import { InstructorHeader } from '@/components/layouts/InstructorHeader';
import {
  ArrowLeft, Search, Users, Clock, TrendingUp, CheckCircle,
  FileText, AlertCircle, Award, Edit2, Save, X as XIcon, Eye
} from 'lucide-react';
import { useEffect, useState } from 'react';
import { useNavigate, useParams, useSearchParams } from 'react-router';
import { useAuth } from '@/hooks';
import AiAssistantButton from '@/imports/AiAssistantButton';
import lecturerApi, {
  QuizAttemptDetailResponseDTO,
  QuizResultResponseDTO,
  StudentQuizResultDTO,
} from '@/api/lecturer/lecturer.api';

function getInitials(name: string) {
  const parts = name.trim().split(' ');
  if (parts.length >= 2) return (parts[parts.length - 2].charAt(0) + parts[parts.length - 1].charAt(0)).toUpperCase();
  return name.charAt(0).toUpperCase();
}

function getAvatarBg(name: string) {
  const colors = [
    'from-violet-500 to-indigo-600', 'from-emerald-500 to-teal-600',
    'from-blue-500 to-cyan-600', 'from-amber-500 to-orange-600',
    'from-rose-500 to-pink-600', 'from-indigo-500 to-violet-600',
    'from-cyan-500 to-blue-600', 'from-teal-500 to-emerald-600',
  ];
  const idx = name.charCodeAt(0) % colors.length;
  return colors[idx];
}

function formatTime(seconds: number | null): string {
  if (seconds == null) return '—';
  const mins = Math.floor(seconds / 60);
  const secs = seconds % 60;
  return `${mins}m ${secs}s`;
}

function gradeColor(diem: number | null) {
  if (diem === null) return { bg: 'bg-gray-100', text: 'text-gray-500', bar: 'bg-gray-200' };
  if (diem >= 8.5) return { bg: 'bg-green-50', text: 'text-green-700', bar: 'bg-green-500' };
  if (diem >= 7.0) return { bg: 'bg-blue-50', text: 'text-blue-700', bar: 'bg-blue-500' };
  if (diem >= 5.0) return { bg: 'bg-yellow-50', text: 'text-yellow-700', bar: 'bg-yellow-500' };
  return { bg: 'bg-red-50', text: 'text-red-700', bar: 'bg-red-500' };
}

function gradeLabel(diem: number | null) {
  if (diem === null) return '—';
  if (diem >= 8.5) return 'Xuất sắc';
  if (diem >= 7.0) return 'Giỏi';
  if (diem >= 5.0) return 'Trung bình';
  return 'Yếu';
}

export default function QuizResults() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const lopHocPhanId = searchParams.get('classId') || '';
  const { quizId } = useParams<{ quizId: string }>();
  const { user } = useAuth();

  const [result, setResult] = useState<QuizResultResponseDTO | null>(null);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState<'all' | 'completed' | 'not_done'>('all');

  // Grading modal
  const [gradingStudent, setGradingStudent] = useState<StudentQuizResultDTO | null>(null);
  const [gradingScore, setGradingScore] = useState('');
  const [gradingNote, setGradingNote] = useState('');
  const [savingGrade, setSavingGrade] = useState(false);
  const [attemptDetail, setAttemptDetail] = useState<QuizAttemptDetailResponseDTO | null>(null);
  const [loadingAttemptDetail, setLoadingAttemptDetail] = useState(false);

  useEffect(() => {
    if (!quizId || !lopHocPhanId || !user?.id) return;
    setLoading(true);
    lecturerApi.getQuizResults(lopHocPhanId, quizId, user.id)
      .then(setResult)
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [quizId, lopHocPhanId, user?.id]);

  const reload = () => {
    if (!quizId || !lopHocPhanId || !user?.id) return;
    lecturerApi.getQuizResults(lopHocPhanId, quizId, user.id)
      .then(setResult)
      .catch(console.error);
  };

  const filtered = (result?.studentResults ?? []).filter(s => {
    const matchSearch =
      s.tenHocVien.toLowerCase().includes(searchTerm.toLowerCase()) ||
      s.maHocVien.toLowerCase().includes(searchTerm.toLowerCase());
    const matchFilter =
      filterStatus === 'all' ? true :
      filterStatus === 'completed' ? s.status === 'COMPLETED' :
      s.status !== 'COMPLETED';
    return matchSearch && matchFilter;
  });

  const completedCount = (result?.studentResults ?? []).filter(s => s.status === 'COMPLETED').length;
  const notDoneCount = (result?.studentResults ?? []).filter(s => s.status !== 'COMPLETED').length;

  const openGrading = (student: StudentQuizResultDTO) => {
    setGradingStudent(student);
    setGradingScore(student.diem !== null ? String(student.diem) : '');
    setGradingNote('');
  };

  const openAttemptDetail = async (student: StudentQuizResultDTO) => {
    if (!quizId || !user?.id) return;
    setLoadingAttemptDetail(true);
    try {
      const detail = await lecturerApi.getQuizAttemptDetail(quizId, student.hocVienId, user.id);
      setAttemptDetail(detail);
    } catch (err) {
      console.error(err);
      alert('Không thể tải chi tiết bài làm');
    } finally {
      setLoadingAttemptDetail(false);
    }
  };

  const handleSaveGrade = async () => {
    if (!gradingStudent || !quizId || !user?.id) return;
    const score = gradingScore.trim() ? parseFloat(gradingScore) : undefined;
    if (score !== undefined && (isNaN(score) || score < 0 || score > 10)) {
      alert('Điểm phải từ 0 đến 10');
      return;
    }
    setSavingGrade(true);
    try {
      await lecturerApi.gradeQuizAttempt(quizId, gradingStudent.hocVienId, user.id, score, gradingNote.trim() || undefined);
      setGradingStudent(null);
      reload();
    } catch (err) {
      console.error(err);
      alert('Lưu điểm thất bại');
    } finally {
      setSavingGrade(false);
    }
  };

  if (!loading && !result) {
    return (
      <div className="flex h-screen bg-gradient-to-br from-slate-50 to-blue-50">
        <InstructorSidebar />
        <div className="flex-1 ml-64 flex items-center justify-center">
          <div className="text-center">
            <div className="w-20 h-20 bg-red-50 rounded-2xl flex items-center justify-center mx-auto mb-5">
              <AlertCircle className="w-10 h-10 text-red-400" />
            </div>
            <h3 className="text-xl font-bold text-gray-700 mb-2">Không tìm thấy kết quả</h3>
            <p className="text-gray-400 text-sm mb-6">Không thể tải dữ liệu kết quả bài kiểm tra</p>
            <button onClick={() => navigate('/lecturer/quiz')} className="px-5 py-2.5 bg-indigo-600 text-white rounded-xl font-semibold text-sm hover:bg-indigo-700 transition-colors">
              Quay lại quản lý bài kiểm tra
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-screen bg-gradient-to-br from-slate-100 via-blue-50 to-indigo-50">
      <InstructorSidebar />

      <div className="flex-1 ml-64 flex flex-col min-h-screen">
        <InstructorHeader title="Kết quả bài kiểm tra" />

        <div className="flex-1 overflow-auto p-6 lg:p-8">
          <div className="max-w-7xl mx-auto space-y-5">

            {/* Back button */}
            <button
              onClick={() => navigate('/lecturer/quiz')}
              className="inline-flex items-center gap-2 text-gray-500 hover:text-gray-800 transition-colors text-sm font-medium"
            >
              <ArrowLeft className="w-4 h-4" />
              Quay lại quản lý bài kiểm tra
            </button>

            {/* Header */}
            {result && (
              <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-indigo-600 via-violet-600 to-purple-700 p-px">
                <div className="bg-white rounded-3xl p-7">
                  <div className="flex flex-col sm:flex-row items-start gap-5">
                    <div className="w-16 h-16 bg-gradient-to-br from-indigo-500 to-violet-600 rounded-2xl flex items-center justify-center shadow-lg shrink-0">
                      <Award className="w-8 h-8 text-white" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-indigo-200 text-xs font-semibold uppercase tracking-wider">Kết quả bài kiểm tra</p>
                      <h1 className="text-2xl font-bold text-gray-900 mt-0.5">{result.tieuDe}</h1>
                      <div className="flex flex-wrap items-center gap-4 mt-3">
                        <div className="flex items-center gap-1.5 text-sm text-gray-600">
                          <Users className="w-4 h-4 text-gray-400" />
                          <span className="font-medium">{result.tongSoHocVien} sinh viên đăng ký</span>
                        </div>
                        <div className="flex items-center gap-1.5 text-sm text-gray-600">
                          <CheckCircle className="w-4 h-4 text-emerald-400" />
                          <span className="font-medium">{completedCount} đã hoàn thành</span>
                        </div>
                        {result.diemTrungBinh !== null && (
                          <div className="flex items-center gap-1.5 text-sm text-gray-600">
                            <TrendingUp className="w-4 h-4 text-amber-400" />
                            <span className="font-medium">Điểm TB: {result.diemTrungBinh.toFixed(2)}</span>
                          </div>
                        )}
                      </div>
                    </div>
                    {/* Quiz meta info */}
                    <div className="flex flex-wrap gap-2 sm:gap-3">
                      {result.thoiGianLam && (
                        <div className="px-3 py-1.5 bg-indigo-50 rounded-xl text-xs font-semibold text-indigo-700">
                          {result.thoiGianLam} phút
                        </div>
                      )}
                      {result.soLanLam && (
                        <div className="px-3 py-1.5 bg-emerald-50 rounded-xl text-xs font-semibold text-emerald-700">
                          {result.soLanLam} lần làm
                        </div>
                      )}
                      {result.tongCauHoi > 0 && (
                        <div className="px-3 py-1.5 bg-violet-50 rounded-xl text-xs font-semibold text-violet-700">
                          {result.tongCauHoi} câu MCQ
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Stats */}
            {result && (
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                {[
                  { label: 'Tổng sinh viên', value: result.tongSoHocVien, icon: Users, color: 'text-indigo-600', bg: 'bg-indigo-50' },
                  { label: 'Đã hoàn thành', value: completedCount, icon: CheckCircle, color: 'text-emerald-600', bg: 'bg-emerald-50' },
                  { label: 'Chưa làm', value: notDoneCount, icon: XIcon, color: 'text-orange-600', bg: 'bg-orange-50' },
                  {
                    label: 'Điểm TB lớp',
                    value: result.diemTrungBinh !== null ? result.diemTrungBinh.toFixed(2) : '—',
                    icon: TrendingUp,
                    color: result.diemTrungBinh !== null && result.diemTrungBinh >= 5 ? 'text-emerald-600' : 'text-red-600',
                    bg: result.diemTrungBinh !== null && result.diemTrungBinh >= 5 ? 'bg-emerald-50' : 'bg-red-50',
                    suffix: result.diemTrungBinh !== null ? '/10' : '',
                  },
                ].map(({ label, value, icon: Icon, color, bg }) => (
                  <div key={label} className="bg-white rounded-2xl shadow-sm border border-gray-100 p-4 flex items-center gap-3">
                    <div className={`w-10 h-10 rounded-xl ${bg} flex items-center justify-center`}>
                      <Icon className={`w-5 h-5 ${color}`} />
                    </div>
                    <div>
                      <p className="text-xs text-gray-500 font-medium">{label}</p>
                      <p className="text-xl font-bold text-gray-900">{value}</p>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* Filters */}
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1.5">Tìm kiếm sinh viên</label>
                  <div className="relative">
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                    <input
                      type="text"
                      placeholder="Tìm theo tên hoặc mã SV..."
                      value={searchTerm}
                      onChange={e => setSearchTerm(e.target.value)}
                      className="w-full pl-12 pr-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-400 focus:border-indigo-300 text-sm"
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1.5">Lọc theo trạng thái</label>
                  <div className="flex gap-2">
                    {[
                      { key: 'all', label: 'Tất cả', active: 'bg-indigo-600 text-white' },
                      { key: 'completed', label: 'Đã làm', active: 'bg-emerald-600 text-white' },
                      { key: 'not_done', label: 'Chưa làm', active: 'bg-orange-600 text-white' },
                    ].map(({ key, label, active }) => (
                      <button
                        key={key}
                        onClick={() => setFilterStatus(key as typeof filterStatus)}
                        className={`flex-1 px-4 py-3 rounded-xl font-semibold text-sm transition-all ${
                          filterStatus === key ? active : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                        }`}
                      >
                        {label}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            {/* Auto-grading info banner */}
            {result && result.tongCauHoi > 0 && (
              <div className="flex items-start gap-3 p-4 bg-emerald-50 border border-emerald-100 rounded-xl">
                <div className="w-8 h-8 bg-emerald-100 rounded-lg flex items-center justify-center shrink-0 mt-0.5">
                  <CheckCircle className="w-4 h-4 text-emerald-600" />
                </div>
                <div>
                  <p className="text-sm font-bold text-emerald-800">Hệ thống tự động chấm điểm trắc nghiệm</p>
                  <p className="text-xs text-emerald-600 mt-0.5">
                    {result.tongCauHoi} câu trắc nghiệm. Điểm tự động: đúng/tổng × 10, làm tròn 2 chữ số thập phân.
                    Giảng viên có thể điều chỉnh điểm thủ công bằng cách nhấn nút chỉnh sửa bên dưới.
                  </p>
                </div>
              </div>
            )}

            {/* Table */}
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
              <div className="p-5 border-b border-gray-100 flex items-center gap-2">
                <Award className="w-4.5 h-4.5 text-indigo-500" />
                <h3 className="font-bold text-gray-900">Kết quả chi tiết</h3>
                <span className="px-2 py-0.5 bg-indigo-50 text-indigo-700 text-xs font-bold rounded-full">
                  {filtered.length}
                </span>
              </div>

              {loading ? (
                <div className="flex items-center justify-center py-20">
                  <div className="text-center">
                    <div className="w-12 h-12 border-4 border-indigo-200 border-t-indigo-600 rounded-full animate-spin mx-auto mb-4"></div>
                    <p className="text-gray-500 font-medium">Đang tải kết quả...</p>
                  </div>
                </div>
              ) : filtered.length === 0 ? (
                <div className="p-12 text-center">
                  <FileText className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                  <p className="text-gray-500 font-medium">Không tìm thấy kết quả</p>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="bg-gray-50 border-b border-gray-100">
                        <th className="text-left px-5 py-3 text-xs font-bold text-gray-500 uppercase tracking-wider w-12">#</th>
                        <th className="text-left px-3 py-3 text-xs font-bold text-gray-500 uppercase tracking-wider">Sinh viên</th>
                        <th className="text-left px-3 py-3 text-xs font-bold text-gray-500 uppercase tracking-wider hidden sm:table-cell">Mã SV</th>
                        <th className="text-center px-3 py-3 text-xs font-bold text-gray-500 uppercase tracking-wider hidden md:table-cell">Trạng thái</th>
                        <th className="text-center px-3 py-3 text-xs font-bold text-gray-500 uppercase tracking-wider hidden lg:table-cell">Thời gian</th>
                        <th className="text-center px-3 py-3 text-xs font-bold text-gray-500 uppercase tracking-wider">Điểm</th>
                        <th className="text-center px-3 py-3 text-xs font-bold text-gray-500 uppercase tracking-wider hidden xl:table-cell">Đúng/Tổng</th>
                        <th className="text-left px-3 py-3 text-xs font-bold text-gray-500 uppercase tracking-wider hidden lg:table-cell">Xếp loại</th>
                        <th className="text-center px-3 py-3 text-xs font-bold text-gray-500 uppercase tracking-wider">Thao tác</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-50">
                      {filtered.map((s, i) => {
                        const gc = gradeColor(s.diem);
                        const isCompleted = s.status === 'COMPLETED';
                        return (
                          <tr key={s.hocVienId} className="hover:bg-gray-50/60 transition-colors">
                            <td className="px-5 py-4 text-sm text-gray-400 text-right">{i + 1}</td>
                            <td className="px-3 py-4">
                              <div className="flex items-center gap-3">
                                <div className={`w-10 h-10 rounded-full bg-gradient-to-br ${getAvatarBg(s.tenHocVien)} flex items-center justify-center text-white font-bold text-sm shrink-0`}>
                                  {getInitials(s.tenHocVien)}
                                </div>
                                <div>
                                  <span className="font-semibold text-gray-900">{s.tenHocVien}</span>
                                  {isCompleted && s.daTuCham && (
                                    <span className="ml-2 text-xs px-1.5 py-0.5 bg-emerald-50 text-emerald-600 rounded font-medium">Tự chấm</span>
                                  )}
                                </div>
                              </div>
                            </td>
                            <td className="px-3 py-4 text-sm text-gray-600 font-medium hidden sm:table-cell">{s.maHocVien}</td>
                            <td className="px-3 py-4 text-center hidden md:table-cell">
                              {isCompleted ? (
                                <span className="inline-flex items-center gap-1 px-2.5 py-1 bg-emerald-50 text-emerald-700 text-xs font-semibold rounded-full">
                                  <CheckCircle className="w-3 h-3" />
                                  Hoàn thành
                                </span>
                              ) : (
                                <span className="inline-flex items-center gap-1 px-2.5 py-1 bg-orange-50 text-orange-700 text-xs font-semibold rounded-full">
                                  <Clock className="w-3 h-3" />
                                  Chưa làm
                                </span>
                              )}
                            </td>
                            <td className="px-3 py-4 text-center text-sm text-gray-600 hidden lg:table-cell">
                              {isCompleted ? formatTime(s.usedTime) : '—'}
                            </td>
                            <td className="px-3 py-4 text-center">
                              {isCompleted ? (
                                <span className={`inline-flex items-center justify-center min-w-[52px] px-3 py-1.5 rounded-xl font-bold text-sm ${gc.bg} ${gc.text}`}>
                                  {s.diem !== null ? s.diem.toFixed(1) : '—'}
                                </span>
                              ) : (
                                <span className="text-gray-400 text-sm italic">—</span>
                              )}
                            </td>
                            <td className="px-3 py-4 text-center hidden xl:table-cell">
                              {isCompleted ? (
                                <span className={`inline-flex items-center justify-center min-w-[60px] px-3 py-1.5 rounded-xl text-sm font-bold ${
                                  s.soCauDung >= s.tongCauHoi * 0.85
                                    ? 'bg-green-50 text-green-700'
                                    : s.soCauDung >= s.tongCauHoi * 0.5
                                    ? 'bg-yellow-50 text-yellow-700'
                                    : 'bg-red-50 text-red-700'
                                }`}>
                                  {s.soCauDung}/{s.tongCauHoi}
                                </span>
                              ) : (
                                <span className="text-gray-400 text-sm italic">—</span>
                              )}
                            </td>
                            <td className="px-3 py-4 hidden lg:table-cell">
                              {isCompleted ? (
                                <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold ${gc.bg} ${gc.text}`}>
                                  {gradeLabel(s.diem)}
                                </span>
                              ) : (
                                <span className="text-gray-400 text-sm">—</span>
                              )}
                            </td>
                            <td className="px-3 py-4 text-center">
                              <div className="inline-flex items-center gap-2">
                                <button
                                  onClick={() => openAttemptDetail(s)}
                                  disabled={loadingAttemptDetail}
                                  className="w-9 h-9 flex items-center justify-center bg-gray-50 hover:bg-blue-50 rounded-xl transition-colors disabled:opacity-50"
                                  title="Xem chi tiết đáp án"
                                >
                                  <Eye className="w-4 h-4 text-blue-500" />
                                </button>
                                <button
                                  onClick={() => openGrading(s)}
                                  className="w-9 h-9 flex items-center justify-center bg-gray-50 hover:bg-indigo-50 rounded-xl transition-colors"
                                  title="Chỉnh sửa điểm"
                                >
                                  <Edit2 className="w-4 h-4 text-indigo-500" />
                                </button>
                              </div>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Attempt Detail Modal */}
      {attemptDetail && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-5xl w-full max-h-[88vh] overflow-hidden flex flex-col">
            <div className="px-6 py-5 border-b border-gray-100 flex items-start justify-between gap-4">
              <div>
                <h3 className="font-bold text-gray-900 text-lg">Chi tiết bài làm</h3>
                <p className="text-sm text-gray-500 mt-1">
                  {attemptDetail.tenHocVien} · {attemptDetail.maHocVien} · {attemptDetail.diem?.toFixed(2) ?? '—'}/10
                </p>
                <p className="text-xs text-gray-400 mt-1">
                  Bắt đầu: {new Date(attemptDetail.startTime).toLocaleString('vi-VN')}
                  {attemptDetail.endTime ? ` · Nộp: ${new Date(attemptDetail.endTime).toLocaleString('vi-VN')}` : ''}
                  {' · '}Thời gian: {formatTime(attemptDetail.usedTime)}
                </p>
              </div>
              <button
                onClick={() => setAttemptDetail(null)}
                className="p-2 text-gray-500 hover:text-gray-900 hover:bg-gray-100 rounded-xl"
                aria-label="Đóng"
              >
                <XIcon className="w-5 h-5" />
              </button>
            </div>

            <div className="px-6 py-4 bg-gray-50 border-b border-gray-100 flex flex-wrap gap-3">
              <span className="px-3 py-1.5 bg-white border border-gray-200 rounded-xl text-sm font-semibold text-gray-700">
                Đúng {attemptDetail.soCauDung}/{attemptDetail.tongCauHoi}
              </span>
              <span className="px-3 py-1.5 bg-white border border-gray-200 rounded-xl text-sm font-semibold text-gray-700">
                Trạng thái {attemptDetail.status === 'COMPLETED' ? 'Hoàn thành' : 'Đang làm'}
              </span>
            </div>

            <div className="flex-1 overflow-y-auto p-6 space-y-4">
              {attemptDetail.answers.map((question, index) => {
                const selectedCorrect = question.selectedCorrect === true;
                const selectedWrong = question.selectedCorrect === false;
                return (
                  <div key={question.questionId} className="border border-gray-200 rounded-2xl overflow-hidden">
                    <div className="p-4 bg-white border-b border-gray-100">
                      <div className="flex items-start justify-between gap-3">
                        <div className="min-w-0">
                          <p className="text-xs font-bold text-gray-400 uppercase tracking-wider">Câu {index + 1}</p>
                          <h4 className="font-semibold text-gray-900 mt-1">{question.noiDung}</h4>
                        </div>
                        <span className={`px-3 py-1 rounded-full text-xs font-bold shrink-0 ${
                          selectedCorrect
                            ? 'bg-emerald-50 text-emerald-700'
                            : selectedWrong
                            ? 'bg-red-50 text-red-700'
                            : 'bg-gray-100 text-gray-600'
                        }`}>
                          {selectedCorrect ? 'Đúng' : selectedWrong ? 'Sai' : 'Chưa chọn'}
                        </span>
                      </div>
                      <p className="text-sm text-gray-500 mt-2">
                        Học viên chọn: {question.selectedKeyAnswers ? `${question.selectedKeyAnswers}. ${question.selectedAnswerText}` : '—'}
                      </p>
                    </div>
                    <div className="p-4 bg-gray-50 grid grid-cols-1 md:grid-cols-2 gap-3">
                      {question.answers.map(answer => (
                        <div
                          key={answer.answerId}
                          className={`p-3 rounded-xl border text-sm ${
                            answer.selected
                              ? 'border-blue-300 bg-blue-50'
                              : answer.isCorrect
                              ? 'border-emerald-200 bg-emerald-50'
                              : 'border-gray-200 bg-white'
                          }`}
                        >
                          <div className="flex items-start justify-between gap-2">
                            <span className="font-medium text-gray-900">{answer.keyAnswers}. {answer.conText}</span>
                            <div className="flex items-center gap-1 shrink-0">
                              {answer.selected && <span className="text-xs font-bold text-blue-700">Đã chọn</span>}
                              {answer.isCorrect && <span className="text-xs font-bold text-emerald-700">Đáp án đúng</span>}
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* Grading Modal */}
      {gradingStudent && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full mx-4 overflow-hidden">
            <div className="px-6 py-5 bg-gradient-to-r from-indigo-50 to-violet-50 border-b border-gray-100 flex items-center gap-3">
              <div className="w-12 h-12 bg-indigo-100 rounded-xl flex items-center justify-center shrink-0">
                <Edit2 className="w-5 h-5 text-indigo-600" />
              </div>
              <div>
                <h3 className="font-bold text-gray-900">Chỉnh sửa điểm</h3>
                <p className="text-sm text-gray-500">{gradingStudent.tenHocVien}</p>
              </div>
            </div>
            <div className="p-6 space-y-4">
              {gradingStudent.status === 'COMPLETED' && gradingStudent.tongCauHoi > 0 && (
                <div className="flex items-center gap-3 p-3 bg-emerald-50 border border-emerald-100 rounded-xl">
                  <CheckCircle className="w-5 h-5 text-emerald-600 shrink-0" />
                  <div>
                    <p className="text-sm font-semibold text-emerald-800">Kết quả tự động</p>
                    <p className="text-xs text-emerald-600">
                      {gradingStudent.soCauDung}/{gradingStudent.tongCauHoi} câu đúng — Điểm tự động: {gradingStudent.diem?.toFixed(2) ?? '—'}/10
                      {gradingStudent.daTuCham && <span className="ml-1">(MCQ)</span>}
                    </p>
                  </div>
                </div>
              )}
              <div>
                <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1.5">Điểm điều chỉnh (0–10)</label>
                <input
                  type="number"
                  value={gradingScore}
                  onChange={e => setGradingScore(e.target.value)}
                  placeholder="Để trống nếu giữ nguyên điểm tự động"
                  min={0} max={10} step={0.1}
                  className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-400 text-sm font-medium"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1.5">Ghi chú</label>
                <textarea
                  value={gradingNote}
                  onChange={e => setGradingNote(e.target.value)}
                  placeholder="Nhận xét cho học viên (tùy chọn)..."
                  rows={2}
                  className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-400 text-sm font-medium resize-none"
                />
              </div>
            </div>
            <div className="px-6 pb-6 flex gap-3 justify-end">
              <button
                onClick={() => setGradingStudent(null)}
                className="px-5 py-2.5 border border-gray-200 text-gray-600 rounded-xl hover:bg-gray-50 font-semibold text-sm transition-colors flex items-center gap-2"
              >
                <XIcon className="w-4 h-4" />
                Hủy
              </button>
              <button
                onClick={handleSaveGrade}
                disabled={savingGrade}
                className="px-5 py-2.5 bg-indigo-600 text-white rounded-xl hover:bg-indigo-700 font-semibold text-sm shadow-sm transition-colors disabled:opacity-50 flex items-center gap-2"
              >
                <Save className="w-4 h-4" />
                {savingGrade ? 'Đang lưu...' : 'Lưu điểm'}
              </button>
            </div>
          </div>
        </div>
      )}

      <button className="fixed bottom-8 right-8 w-16 h-16 hover:scale-110 transition-transform duration-200 z-40" aria-label="AI Assistant">
        <AiAssistantButton />
      </button>
    </div>
  );
}
