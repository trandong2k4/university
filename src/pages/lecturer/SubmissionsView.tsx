import { InstructorSidebar } from '@/components/layouts/InstructorSidebar';
import { InstructorHeader } from '@/components/layouts/InstructorHeader';
import {
  ArrowLeft, Eye, CheckCircle, Clock, FileText, Calendar, Search
} from 'lucide-react';
import { useEffect, useMemo, useState } from 'react';
import { useNavigate, useParams, useSearchParams } from 'react-router';
import { useAuth } from '@/hooks';
import { LecturerAIAssistantButton } from '@/components/chatbot/AIAssistantButton';
import lecturerApi, { SubmissionResponseDTO } from '@/api/lecturer/lecturer.api';
import { resolveFileUrl } from '@/utils/fileUtils';

export default function SubmissionsView() {
  const navigate = useNavigate();
  const { assignmentId } = useParams<{ assignmentId: string }>();
  const [searchParams] = useSearchParams();
  const lopHocPhanId = searchParams.get('classId') || '';
  const { user } = useAuth();
  const [submissions, setSubmissions] = useState<SubmissionResponseDTO[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState<'all' | 'graded' | 'pending'>('all');

  useEffect(() => {
    if (!assignmentId || !lopHocPhanId || !user?.id) return;
    setLoading(true);
    lecturerApi.getSubmissions(lopHocPhanId, assignmentId, user.id)
      .then(setSubmissions)
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [assignmentId, lopHocPhanId, user?.id]);

  const filtered = useMemo(() => submissions.filter(s => {
    const matchSearch =
      s.studentName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      s.studentCode.toLowerCase().includes(searchTerm.toLowerCase());
    const isGraded = s.grade != null;
    const matchFilter =
      filterStatus === 'all' ? true :
      filterStatus === 'graded' ? isGraded : !isGraded;
    return matchSearch && matchFilter;
  }), [submissions, searchTerm, filterStatus]);

  const gradedCount = submissions.filter(s => s.grade != null).length;
  const pendingCount = submissions.filter(s => s.grade == null).length;

  const formatDate = (s: string) =>
    new Date(s).toLocaleString('vi-VN', {
      day: '2-digit', month: '2-digit', year: 'numeric',
      hour: '2-digit', minute: '2-digit',
    });

  const getInitials = (name: string) => name.split(' ').pop()?.charAt(0).toUpperCase() ?? '?';
  const assignmentTitle = submissions[0]?.assignmentTitle ?? 'Chi tiết bài nộp';

  return (
    <div className="flex h-screen bg-gray-50">
      <InstructorSidebar />
      <div className="flex-1 ml-64 flex flex-col">
        <InstructorHeader title="Xem bài nộp" />
        <div className="flex-1 overflow-auto p-6">
          <div className="max-w-7xl mx-auto space-y-6">

            <button
              onClick={() => navigate('/lecturer/assignments')}
              className="inline-flex items-center gap-2 text-gray-600 hover:text-gray-900 transition-colors font-medium"
            >
              <ArrowLeft className="w-5 h-5" />
              Quay lại danh sách bài tập
            </button>

            {/* Assignment info */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <h2 className="text-2xl font-bold text-gray-900 mb-1">{assignmentTitle}</h2>
              <div className="flex items-center gap-2 text-sm text-gray-500">
                <Calendar className="w-4 h-4" />
                <span>Mã bài tập: {assignmentId}</span>
              </div>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-3 gap-6">
              {[
                { label: 'Tổng bài nộp', value: submissions.length, icon: FileText, color: 'blue' },
                { label: 'Đã chấm', value: gradedCount, icon: CheckCircle, color: 'green' },
                { label: 'Chưa chấm', value: pendingCount, icon: Clock, color: 'orange' },
              ].map(({ label, value, icon: Icon, color }) => (
                <div key={label} className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                  <div className="flex items-center gap-3">
                    <div className={`w-12 h-12 bg-${color}-100 rounded-lg flex items-center justify-center`}>
                      <Icon className={`w-6 h-6 text-${color}-600`} />
                    </div>
                    <div>
                      <p className="text-sm text-gray-600">{label}</p>
                      <p className={`text-2xl font-bold text-${color}-600`}>{value}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Filters */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Tìm kiếm sinh viên</label>
                  <div className="relative">
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                    <input
                      type="text"
                      placeholder="Tìm theo tên hoặc mã SV..."
                      value={searchTerm}
                      onChange={e => setSearchTerm(e.target.value)}
                      className="w-full pl-12 pr-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Lọc theo trạng thái</label>
                  <div className="flex gap-2">
                    {[
                      { key: 'all', label: 'Tất cả', active: 'bg-blue-600 text-white' },
                      { key: 'graded', label: 'Đã chấm', active: 'bg-green-600 text-white' },
                      { key: 'pending', label: 'Chưa chấm', active: 'bg-orange-600 text-white' },
                    ].map(({ key, label, active }) => (
                      <button
                        key={key}
                        onClick={() => setFilterStatus(key as 'all' | 'graded' | 'pending')}
                        className={`flex-1 px-4 py-3 rounded-lg font-medium transition-colors ${
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
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
              <div className="p-6 border-b border-gray-200">
                <h3 className="font-semibold text-gray-900">Danh sách bài nộp ({filtered.length})</h3>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-50">
                    <tr>
                      {['Sinh viên', 'File bài nộp', 'Thời gian nộp', 'Điểm', 'Trạng thái', 'Xem'].map(h => (
                        <th key={h} className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200">
                    {loading ? (
                      <tr><td colSpan={6} className="px-6 py-12 text-center text-gray-500">Đang tải...</td></tr>
                    ) : filtered.length === 0 ? (
                      <tr>
                        <td colSpan={6} className="px-6 py-12 text-center">
                          <FileText className="w-12 h-12 text-gray-300 mx-auto mb-2" />
                          <p className="text-gray-500">Không tìm thấy bài nộp</p>
                        </td>
                      </tr>
                    ) : filtered.map(s => (
                      <tr key={s.submissionId} className="hover:bg-gray-50 transition-colors">
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-full flex items-center justify-center text-white font-semibold">
                              {getInitials(s.studentName)}
                            </div>
                            <div>
                              <p className="font-medium text-gray-900">{s.studentName}</p>
                              <p className="text-sm text-gray-500">{s.studentCode}</p>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-2 text-sm text-gray-600">
                            <FileText className="w-4 h-4 text-gray-400" />
                            <span>{s.fileUrl ? 'Đã nộp' : '–'}</span>
                          </div>
                        </td>
                        <td className="px-6 py-4 text-sm text-gray-700">{formatDate(s.submittedAt)}</td>
                        <td className="px-6 py-4">
                          {s.grade != null ? (
                            <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-sm font-semibold ${
                              s.grade >= 8.5 ? 'bg-green-100 text-green-700' :
                              s.grade >= 7.0 ? 'bg-blue-100 text-blue-700' :
                              s.grade >= 5.0 ? 'bg-yellow-100 text-yellow-700' :
                              'bg-red-100 text-red-700'
                            }`}>
                              {s.grade}
                            </span>
                          ) : <span className="text-gray-400 text-sm">Chưa chấm</span>}
                        </td>
                        <td className="px-6 py-4">
                          {s.grade != null ? (
                            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium bg-green-100 text-green-700">
                              <CheckCircle className="w-3 h-3" />Đã chấm
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium bg-orange-100 text-orange-700">
                              <Clock className="w-3 h-3" />Chưa chấm
                            </span>
                          )}
                        </td>
                        <td className="px-6 py-4">
                          {s.fileUrl && (
                            <a
                              href={resolveFileUrl(s.fileUrl)}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors inline-flex"
                              title="Xem file"
                            >
                              <Eye className="w-4 h-4" />
                            </a>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>
      </div>

      <LecturerAIAssistantButton />
    </div>
  );
}

