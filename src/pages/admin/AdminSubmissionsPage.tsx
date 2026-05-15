import { useEffect, useState } from 'react';
import { AdminSidebar } from '@/components/layouts/AdminSidebar';
import { AdminHeader } from '@/components/layouts/AdminHeader';
import { DocumentViewerModal } from '@/components/common/DocumentViewerModal';
import apiClient from '@/api/common';
import * as lopHocPhanApi from '@/api/admin/lop-hoc-phan.api';
import type { LopHocPhanItem } from '@/api/admin/lop-hoc-phan.api';
import {
  AlertCircle,
  ChevronLeft,
  ChevronRight,
  Eye,
  FileText,
  Loader2,
  RefreshCw,
  Search,
} from 'lucide-react';

interface AdminSubmissionDTO {
  submissionId: string;
  phienThucHien?: number;
  fileExerciseUrl?: string;
  thoiGianNop?: string;
  diem?: number | null;
  assignmentTitle?: string;
  maLopHocPhan?: string;
  tenMonHoc?: string;
  maHocVien?: string;
  tenHocVien?: string;
}

interface PageResponse<T> {
  content: T[];
  totalElements: number;
  totalPages: number;
  number: number;
  size: number;
}

const PAGE_SIZE = 20;

function formatDateTime(value?: string) {
  if (!value) return '–';
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;
  return `${date.toLocaleDateString('vi-VN')} ${date.toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' })}`;
}

export default function AdminSubmissionsPage() {
  const [classes, setClasses] = useState<LopHocPhanItem[]>([]);
  const [selectedClassId, setSelectedClassId] = useState('');
  const [keyword, setKeyword] = useState('');
  const [page, setPage] = useState(0);
  const [data, setData] = useState<PageResponse<AdminSubmissionDTO> | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [preview, setPreview] = useState<{ title: string; url: string } | null>(null);

  const loadClasses = async () => {
    try {
      setClasses(await lopHocPhanApi.getLopHocPhan());
    } catch {
      setClasses([]);
    }
  };

  const loadSubmissions = async (targetPage = page) => {
    setLoading(true);
    setError('');
    try {
      const params = new URLSearchParams({
        page: String(targetPage),
        size: String(PAGE_SIZE),
      });
      if (keyword.trim()) params.set('keyword', keyword.trim());
      if (selectedClassId) params.set('lopHocPhanId', selectedClassId);
      const response = await apiClient.get<PageResponse<AdminSubmissionDTO>>(`/admin/submissions?${params}`);
      setData(response.data);
    } catch (err: any) {
      setError(err?.response?.data?.detail || err?.response?.data?.message || 'Không tải được danh sách bài làm.');
      setData(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void loadClasses();
  }, []);

  useEffect(() => {
    void loadSubmissions(page);
  }, [page, selectedClassId]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setPage(0);
    void loadSubmissions(0);
  };

  return (
    <div className="flex h-screen bg-slate-50">
      <AdminSidebar activeMenu="submissions" />
      <div className="flex-1 ml-64 flex flex-col overflow-hidden">
        <AdminHeader title="Bài làm học viên" />
        <main className="flex-1 overflow-auto p-6">
          <div className="max-w-7xl mx-auto space-y-5">
            <div>
              <h2 className="text-2xl font-bold text-slate-900">Bài làm học viên</h2>
              <p className="text-sm text-slate-500 mt-1">Xem file bài nộp theo lớp học phần, bài tập và học viên.</p>
            </div>

            <form onSubmit={handleSearch} className="bg-white border border-slate-200 rounded-xl p-4 shadow-sm grid grid-cols-1 lg:grid-cols-[1fr_260px_auto] gap-3">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                <input
                  value={keyword}
                  onChange={e => setKeyword(e.target.value)}
                  placeholder="Tìm theo bài tập, học viên, mã lớp..."
                  className="w-full pl-9 pr-3 py-2.5 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 text-sm"
                />
              </div>
              <select
                value={selectedClassId}
                onChange={e => { setSelectedClassId(e.target.value); setPage(0); }}
                className="px-3 py-2.5 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 bg-white text-sm"
              >
                <option value="">Tất cả lớp học phần</option>
                {classes.map(item => (
                  <option key={item.id} value={item.id}>{item.maLopHocPhan} - {item.tenMonHoc}</option>
                ))}
              </select>
              <button
                type="submit"
                disabled={loading}
                className="inline-flex items-center justify-center gap-2 px-4 py-2.5 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 disabled:opacity-60 text-sm font-semibold"
              >
                <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
                Lọc
              </button>
            </form>

            {error && (
              <div className="bg-red-50 border border-red-200 rounded-xl p-4 flex items-start gap-3 text-red-700">
                <AlertCircle className="w-5 h-5 mt-0.5" />
                <p className="text-sm font-medium">{error}</p>
              </div>
            )}

            <div className="bg-white border border-slate-200 rounded-xl shadow-sm overflow-hidden">
              {loading ? (
                <div className="p-12 text-center text-slate-500">
                  <Loader2 className="w-8 h-8 mx-auto mb-3 animate-spin text-emerald-600" />
                  Đang tải bài làm...
                </div>
              ) : !data?.content.length ? (
                <div className="p-12 text-center text-slate-500">
                  <FileText className="w-12 h-12 mx-auto mb-3 text-slate-300" />
                  Chưa có bài làm phù hợp
                </div>
              ) : (
                <>
                  <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                      <thead className="bg-slate-100 text-slate-600">
                        <tr>
                          {['Học viên', 'Lớp', 'Bài tập', 'Lần', 'Thời gian nộp', 'Điểm', 'File'].map(header => (
                            <th key={header} className="px-5 py-3 text-left font-semibold">{header}</th>
                          ))}
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100">
                        {data.content.map(item => (
                          <tr key={item.submissionId} className="hover:bg-slate-50">
                            <td className="px-5 py-4">
                              <p className="font-semibold text-slate-900">{item.tenHocVien || '–'}</p>
                              <p className="text-xs text-slate-500">{item.maHocVien || '–'}</p>
                            </td>
                            <td className="px-5 py-4">
                              <p className="font-medium text-slate-800">{item.maLopHocPhan || '–'}</p>
                              <p className="text-xs text-slate-500">{item.tenMonHoc || '–'}</p>
                            </td>
                            <td className="px-5 py-4 font-medium text-slate-900">{item.assignmentTitle || '–'}</td>
                            <td className="px-5 py-4 text-slate-700">{item.phienThucHien ?? '–'}</td>
                            <td className="px-5 py-4 text-slate-600">{formatDateTime(item.thoiGianNop)}</td>
                            <td className="px-5 py-4">
                              {item.diem != null ? (
                                <span className="px-2 py-1 rounded-full bg-green-100 text-green-700 font-bold">{item.diem.toFixed(1)}</span>
                              ) : (
                                <span className="text-slate-400">Chưa chấm</span>
                              )}
                            </td>
                            <td className="px-5 py-4">
                              {item.fileExerciseUrl ? (
                                <button
                                  onClick={() => setPreview({ title: `${item.tenHocVien || 'Bài làm'} - ${item.assignmentTitle || ''}`, url: item.fileExerciseUrl! })}
                                  className="inline-flex items-center gap-2 px-3 py-1.5 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 font-semibold text-xs"
                                >
                                  <Eye className="w-3.5 h-3.5" />
                                  Xem
                                </button>
                              ) : (
                                <span className="text-slate-400">Không có file</span>
                              )}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>

                  {data.totalPages > 1 && (
                    <div className="px-5 py-4 border-t border-slate-200 flex items-center justify-between">
                      <p className="text-sm text-slate-500">
                        Trang {data.number + 1} / {data.totalPages} - {data.totalElements} bài làm
                      </p>
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => setPage(p => Math.max(0, p - 1))}
                          disabled={page === 0}
                          className="p-2 border border-slate-300 rounded-lg hover:bg-slate-50 disabled:opacity-40"
                        >
                          <ChevronLeft className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => setPage(p => Math.min(data.totalPages - 1, p + 1))}
                          disabled={page >= data.totalPages - 1}
                          className="p-2 border border-slate-300 rounded-lg hover:bg-slate-50 disabled:opacity-40"
                        >
                          <ChevronRight className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  )}
                </>
              )}
            </div>
          </div>
        </main>
      </div>

      <DocumentViewerModal
        open={!!preview}
        title={preview?.title || 'Bài làm'}
        url={preview?.url}
        onClose={() => setPreview(null)}
      />
    </div>
  );
}
