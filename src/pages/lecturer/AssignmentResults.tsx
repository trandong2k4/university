import { InstructorSidebar } from '@/components/layouts/InstructorSidebar';
import { InstructorHeader } from '@/components/layouts/InstructorHeader';
import {
  ArrowLeft, Search, Users, CheckCircle, X, FileText,
  Clock, Edit, AlertCircle, Check, Award
} from 'lucide-react';
import { useEffect, useState } from 'react';
import { useNavigate, useParams, useSearchParams } from 'react-router';
import { useAuth } from '@/hooks';
import AiAssistantButton from '@/imports/AiAssistantButton';
import lecturerApi, {
  SubmissionResponseDTO,
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

function formatDate(s: string) {
  return new Date(s).toLocaleString('vi-VN', {
    day: '2-digit', month: '2-digit', year: 'numeric',
    hour: '2-digit', minute: '2-digit',
  });
}

function gradeColor(diem: number | null) {
  if (diem === null) return { bg: 'bg-gray-100', text: 'text-gray-500', bar: 'bg-gray-200' };
  if (diem >= 8.5) return { bg: 'bg-green-50', text: 'text-green-700', bar: 'bg-green-500' };
  if (diem >= 7.0) return { bg: 'bg-blue-50', text: 'text-blue-700', bar: 'bg-blue-500' };
  if (diem >= 5.0) return { bg: 'bg-yellow-50', text: 'text-yellow-700', bar: 'bg-yellow-500' };
  return { bg: 'bg-red-50', text: 'text-red-700', bar: 'bg-red-500' };
}

export default function AssignmentResults() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const lopHocPhanId = searchParams.get('classId') || '';
  const { assignmentId } = useParams<{ assignmentId: string }>();
  const { user } = useAuth();

  const [submissions, setSubmissions] = useState<SubmissionResponseDTO[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState<'all' | 'graded' | 'pending'>('all');

  // Grading modal
  const [gradingSubmission, setGradingSubmission] = useState<SubmissionResponseDTO | null>(null);
  const [gradeScore, setGradeScore] = useState('');
  const [gradeFeedback, setGradeFeedback] = useState('');
  const [grading, setGrading] = useState(false);

  // Toast
  const [toast, setToast] = useState<{ msg: string; type: 'success' | 'error' } | null>(null);
  const showToast = (msg: string, type: 'success' | 'error' = 'success') => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 3500);
  };

  useEffect(() => {
    if (!assignmentId || !lopHocPhanId || !user?.id) return;
    setLoading(true);
    lecturerApi.getSubmissions(lopHocPhanId, assignmentId, user.id)
      .then(setSubmissions)
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [assignmentId, lopHocPhanId, user?.id]);

  const filtered = submissions.filter(s => {
    const matchSearch =
      s.studentName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      s.studentCode.toLowerCase().includes(searchTerm.toLowerCase());
    const isGraded = s.grade != null;
    const matchFilter =
      filterStatus === 'all' ? true :
      filterStatus === 'graded' ? isGraded : !isGraded;
    return matchSearch && matchFilter;
  });

  const gradedCount = submissions.filter(s => s.grade != null).length;
  const pendingCount = submissions.filter(s => s.grade == null).length;

  const openGrading = (s: SubmissionResponseDTO) => {
    setGradingSubmission(s);
    setGradeScore(s.grade != null ? String(s.grade) : '');
    setGradeFeedback(s.feedback || '');
  };

  const confirmGrade = async () => {
    if (!gradingSubmission || !user?.id) return;
    const score = parseFloat(gradeScore);
    if (isNaN(score) || score < 0 || score > 10) {
      showToast('Điểm phải từ 0 đến 10', 'error');
      return;
    }
    setGrading(true);
    try {
      await lecturerApi.gradeSubmission(gradingSubmission.submissionId, user.id, score, gradeFeedback.trim() || undefined);
      setSubmissions(prev => prev.map(s =>
        s.submissionId === gradingSubmission.submissionId
          ? { ...s, grade: score, feedback: gradeFeedback.trim() || null }
          : s
      ));
      setGradingSubmission(null);
      showToast('Chấm điểm thành công', 'success');
    } catch (err) {
      console.error(err);
      showToast('Chấm điểm thất bại', 'error');
    } finally {
      setGrading(false);
    }
  };

  return (
    <div className="flex h-screen bg-gradient-to-br from-slate-100 via-blue-50 to-indigo-50">
      <InstructorSidebar />

      <div className="flex-1 ml-64 flex flex-col min-h-screen">
        <InstructorHeader title="Kết quả bài tập" />

        <div className="flex-1 overflow-auto p-6 lg:p-8">
          <div className="max-w-7xl mx-auto space-y-5">

            {/* Back button */}
            <button
              onClick={() => navigate('/lecturer/assignments')}
              className="inline-flex items-center gap-2 text-gray-500 hover:text-gray-800 transition-colors text-sm font-medium"
            >
              <ArrowLeft className="w-4 h-4" />
              Quay lại danh sách bài tập
            </button>

            {/* Header */}
            {submissions.length > 0 && (
              <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-emerald-600 via-teal-600 to-green-700 p-px">
                <div className="bg-white rounded-3xl p-7">
                  <div className="flex flex-col sm:flex-row items-start gap-5">
                    <div className="w-16 h-16 bg-gradient-to-br from-emerald-500 to-teal-600 rounded-2xl flex items-center justify-center shadow-lg shrink-0">
                      <Award className="w-8 h-8 text-white" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-emerald-200 text-xs font-semibold uppercase tracking-wider">Bài tập</p>
                      <h1 className="text-2xl font-bold text-gray-900 mt-0.5">{submissions[0]?.assignmentTitle}</h1>
                      <div className="flex flex-wrap items-center gap-4 mt-3">
                        <div className="flex items-center gap-1.5 text-sm text-gray-600">
                          <Users className="w-4 h-4 text-gray-400" />
                          <span className="font-medium">{submissions.length} sinh viên nộp bài</span>
                        </div>
                        <div className="flex items-center gap-1.5 text-sm text-emerald-600">
                          <CheckCircle className="w-4 h-4" />
                          <span className="font-medium">{gradedCount} đã chấm</span>
                        </div>
                        <div className="flex items-center gap-1.5 text-sm text-orange-600">
                          <Clock className="w-4 h-4" />
                          <span className="font-medium">{pendingCount} chưa chấm</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Stats */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              {[
                { label: 'Tổng bài nộp', value: submissions.length, icon: FileText, color: 'text-indigo-600', bg: 'bg-indigo-50' },
                { label: 'Đã chấm điểm', value: gradedCount, icon: CheckCircle, color: 'text-emerald-600', bg: 'bg-emerald-50' },
                { label: 'Chưa chấm điểm', value: pendingCount, icon: Clock, color: 'text-orange-600', bg: 'bg-orange-50' },
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
                      className="w-full pl-12 pr-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-400 focus:border-emerald-300 text-sm"
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1.5">Lọc theo trạng thái</label>
                  <div className="flex gap-2">
                    {[
                      { key: 'all', label: 'Tất cả', active: 'bg-emerald-600 text-white' },
                      { key: 'graded', label: 'Đã chấm', active: 'bg-green-600 text-white' },
                      { key: 'pending', label: 'Chưa chấm', active: 'bg-orange-600 text-white' },
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

            {/* Table */}
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
              <div className="p-5 border-b border-gray-100 flex items-center gap-2">
                <Award className="w-4.5 h-4.5 text-emerald-500" />
                <h3 className="font-bold text-gray-900">Danh sách bài nộp</h3>
                <span className="px-2 py-0.5 bg-emerald-50 text-emerald-700 text-xs font-bold rounded-full">
                  {filtered.length}
                </span>
              </div>

              {loading ? (
                <div className="flex items-center justify-center py-20">
                  <div className="text-center">
                    <div className="w-12 h-12 border-4 border-emerald-200 border-t-emerald-600 rounded-full animate-spin mx-auto mb-4"></div>
                    <p className="text-gray-500 font-medium">Đang tải dữ liệu...</p>
                  </div>
                </div>
              ) : filtered.length === 0 ? (
                <div className="p-12 text-center">
                  <FileText className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                  <p className="text-gray-500 font-medium">Không tìm thấy bài nộp</p>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="bg-gray-50 border-b border-gray-100">
                        <th className="text-left px-5 py-3 text-xs font-bold text-gray-500 uppercase tracking-wider w-12">#</th>
                        <th className="text-left px-3 py-3 text-xs font-bold text-gray-500 uppercase tracking-wider">Sinh viên</th>
                        <th className="text-left px-3 py-3 text-xs font-bold text-gray-500 uppercase tracking-wider">Mã SV</th>
                        <th className="text-left px-3 py-3 text-xs font-bold text-gray-500 uppercase tracking-wider hidden sm:table-cell">File bài nộp</th>
                        <th className="text-left px-3 py-3 text-xs font-bold text-gray-500 uppercase tracking-wider hidden md:table-cell">Thời gian nộp</th>
                        <th className="text-center px-3 py-3 text-xs font-bold text-gray-500 uppercase tracking-wider">Điểm</th>
                        <th className="text-left px-3 py-3 text-xs font-bold text-gray-500 uppercase tracking-wider">Thao tác</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-50">
                      {filtered.map((s, i) => {
                        const gc = gradeColor(s.grade);
                        return (
                          <tr key={s.submissionId} className="hover:bg-gray-50/60 transition-colors">
                            <td className="px-5 py-4 text-sm text-gray-400 text-right">{i + 1}</td>
                            <td className="px-3 py-4">
                              <div className="flex items-center gap-3">
                                <div className={`w-10 h-10 rounded-full bg-gradient-to-br ${getAvatarBg(s.studentName)} flex items-center justify-center text-white font-bold text-sm shrink-0`}>
                                  {getInitials(s.studentName)}
                                </div>
                                <span className="font-semibold text-gray-900">{s.studentName}</span>
                              </div>
                            </td>
                            <td className="px-3 py-4 text-sm text-gray-600 font-medium">{s.studentCode}</td>
                            <td className="px-3 py-4 hidden sm:table-cell">
                              {s.fileUrl ? (
                                <a
                                  href={s.fileUrl}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="inline-flex items-center gap-1 text-blue-600 hover:text-blue-700 text-sm font-medium"
                                >
                                  <FileText className="w-4 h-4" />
                                  Xem file
                                </a>
                              ) : (
                                <span className="text-gray-400 text-sm italic">Không có file</span>
                              )}
                            </td>
                            <td className="px-3 py-4 text-sm text-gray-600 hidden md:table-cell">
                              {s.submittedAt ? formatDate(s.submittedAt) : '—'}
                            </td>
                            <td className="px-3 py-4 text-center">
                              {s.grade != null ? (
                                <span className={`inline-flex items-center justify-center min-w-[52px] px-3 py-1.5 rounded-xl font-bold text-sm ${gc.bg} ${gc.text}`}>
                                  {s.grade.toFixed(1)}
                                </span>
                              ) : (
                                <span className="inline-flex items-center gap-1 px-2.5 py-1 bg-orange-50 text-orange-600 text-xs font-semibold rounded-full">
                                  <Clock className="w-3 h-3" />
                                  Chưa chấm
                                </span>
                              )}
                              {s.feedback && (
                                <p className="text-xs text-gray-500 mt-1 italic max-w-[120px] truncate" title={s.feedback}>
                                  {s.feedback}
                                </p>
                              )}
                            </td>
                            <td className="px-3 py-4">
                              <button
                                onClick={() => openGrading(s)}
                                className="inline-flex items-center gap-1.5 px-3 py-2 bg-emerald-500 text-white text-sm rounded-xl hover:bg-emerald-600 transition-colors font-semibold shadow-sm"
                              >
                                <Edit className="w-3.5 h-3.5" />
                                Chấm điểm
                              </button>
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

      {/* Grading Modal */}
      {gradingSubmission && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full mx-4 overflow-hidden">
            <div className="px-6 py-5 bg-gradient-to-r from-emerald-50 to-teal-50 border-b border-gray-100 flex items-center gap-3">
              <div className="w-10 h-10 bg-emerald-100 rounded-xl flex items-center justify-center shrink-0">
                <Edit className="w-5 h-5 text-emerald-600" />
              </div>
              <div>
                <h3 className="font-bold text-gray-900">Chấm điểm bài nộp</h3>
                <p className="text-sm text-gray-500">{gradingSubmission.studentName} – {gradingSubmission.studentCode}</p>
              </div>
            </div>
            <div className="p-6 space-y-4">
              {gradingSubmission.fileUrl && (
                <div>
                  <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1.5">File bài nộp</p>
                  <a
                    href={gradingSubmission.fileUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-2 px-4 py-2.5 bg-blue-50 text-blue-700 text-sm rounded-xl hover:bg-blue-100 transition-colors font-semibold"
                  >
                    <FileText className="w-4 h-4" />
                    Xem bài nộp của sinh viên
                  </a>
                </div>
              )}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1.5">
                  Điểm (0 – 10) <span className="text-red-500">*</span>
                </label>
                <input
                  type="number"
                  min="0"
                  max="10"
                  step="0.1"
                  value={gradeScore}
                  onChange={e => setGradeScore(e.target.value)}
                  placeholder="VD: 8.5"
                  className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-400 focus:border-emerald-300 text-sm font-medium"
                />
                <div className="flex gap-2 mt-2">
                  {[10, 8.5, 7.0, 5.0, 0].map(v => (
                    <button
                      key={v}
                      onClick={() => setGradeScore(String(v))}
                      className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors ${
                        gradeScore === String(v)
                          ? 'bg-emerald-500 text-white'
                          : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                      }`}
                    >
                      {v}
                    </button>
                  ))}
                </div>
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1.5">Nhận xét</label>
                <textarea
                  value={gradeFeedback}
                  onChange={e => setGradeFeedback(e.target.value)}
                  placeholder="Nhập nhận xét, góp ý cho sinh viên..."
                  rows={3}
                  className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-400 focus:border-emerald-300 text-sm font-medium resize-none"
                />
              </div>
            </div>
            <div className="px-6 pb-6 flex gap-3 justify-end">
              <button
                onClick={() => setGradingSubmission(null)}
                className="px-5 py-2.5 border border-gray-200 text-gray-600 rounded-xl hover:bg-gray-50 font-semibold text-sm transition-colors"
              >
                Hủy
              </button>
              <button
                onClick={confirmGrade}
                disabled={grading || gradeScore === '' || isNaN(parseFloat(gradeScore))}
                className="flex items-center gap-2 px-6 py-2.5 bg-emerald-500 text-white rounded-xl hover:bg-emerald-600 font-semibold text-sm shadow-sm transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <Check className="w-4 h-4" />
                {grading ? 'Đang lưu...' : 'Lưu điểm'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Toast */}
      {toast && (
        <div className="fixed bottom-8 left-1/2 -translate-x-1/2 z-50 animate-in slide-in-from-bottom-5 fade-in duration-300">
          <div className={`flex items-center gap-3 px-6 py-4 rounded-2xl shadow-2xl border ${
            toast.type === 'success'
              ? 'bg-emerald-500/95 text-white border-emerald-400/30'
              : 'bg-red-500/95 text-white border-red-400/30'
          }`}>
            {toast.type === 'success' ? <CheckCircle className="w-5 h-5" /> : <AlertCircle className="w-5 h-5" />}
            <span className="font-semibold">{toast.msg}</span>
          </div>
        </div>
      )}

      <button className="fixed bottom-8 right-8 w-16 h-16 hover:scale-110 transition-transform duration-200 z-40" aria-label="AI Assistant">
        <AiAssistantButton />
      </button>
    </div>
  );
}
