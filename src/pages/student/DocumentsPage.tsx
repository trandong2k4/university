import { useEffect, useMemo, useState } from 'react';
import type { ReactNode } from 'react';
import { useNavigate } from 'react-router';
import { useAuth } from '@/hooks';
import { apiClient } from '@/api/common';
import { StudentSidebar } from '@/components/layouts/StudentSidebar';
import { StudentHeader } from '@/components/layouts/StudentHeader';
import { AIAssistantButton } from '@/components/chatbot/AIAssistantButton';
import { DocumentViewerModal } from '@/components/common/DocumentViewerModal';
import { resolveFileUrl } from '@/utils/fileUtils';
import {
  AlertCircle,
  Archive,
  BookOpen,
  Calendar,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  Download,
  Eye,
  File,
  FileText,
  Filter,
  FolderOpen,
  Search,
  Video,
} from 'lucide-react';

type LoaiTaiLieu = string;

interface LopHocPhan {
  id: string;
  lopHocPhanId: string;
  maLopHocPhan: string;
  maMonHoc: string;
  tenMonHoc?: string;
  soTinChi?: number;
}

interface TaiLieuItem {
  id: string;
  tenTaiLieu: string;
  moTa: string | null;
  fileTaiLieuUrl: string;
  loaiTaiLieu: string | null;
  ngayDang: string;
  lopHocPhanId: string;
}

interface PageResponse<T> {
  content: T[];
  totalElements: number;
  totalPages: number;
  size: number;
  number: number;
}

interface TypeConfig {
  value: string;
  label: string;
  icon: ReactNode;
  badgeClass: string;
  iconClass: string;
}

const PAGE_SIZE = 100;

const DOCUMENT_TYPES: TypeConfig[] = [
  {
    value: 'PDF',
    label: 'PDF',
    icon: <FileText className="w-4 h-4" />,
    badgeClass: 'bg-red-50 text-red-700 border-red-100',
    iconClass: 'bg-red-50 text-red-600',
  },
  {
    value: 'DOCX',
    label: 'Word',
    icon: <FileText className="w-4 h-4" />,
    badgeClass: 'bg-blue-50 text-blue-700 border-blue-100',
    iconClass: 'bg-blue-50 text-blue-600',
  },
  {
    value: 'PPTX',
    label: 'PowerPoint',
    icon: <FileText className="w-4 h-4" />,
    badgeClass: 'bg-orange-50 text-orange-700 border-orange-100',
    iconClass: 'bg-orange-50 text-orange-600',
  },
  {
    value: 'XLSX',
    label: 'Excel',
    icon: <FileText className="w-4 h-4" />,
    badgeClass: 'bg-emerald-50 text-emerald-700 border-emerald-100',
    iconClass: 'bg-emerald-50 text-emerald-600',
  },
  {
    value: 'ZIP',
    label: 'Nén',
    icon: <Archive className="w-4 h-4" />,
    badgeClass: 'bg-slate-50 text-slate-700 border-slate-100',
    iconClass: 'bg-slate-50 text-slate-600',
  },
  {
    value: 'VIDEO',
    label: 'Video',
    icon: <Video className="w-4 h-4" />,
    badgeClass: 'bg-pink-50 text-pink-700 border-pink-100',
    iconClass: 'bg-pink-50 text-pink-600',
  },
  {
    value: 'SLIDE',
    label: 'Slide',
    icon: <File className="w-4 h-4" />,
    badgeClass: 'bg-amber-50 text-amber-700 border-amber-100',
    iconClass: 'bg-amber-50 text-amber-600',
  },
  {
    value: 'OTHER',
    label: 'Khác',
    icon: <File className="w-4 h-4" />,
    badgeClass: 'bg-gray-50 text-gray-700 border-gray-100',
    iconClass: 'bg-gray-50 text-gray-600',
  },
];

function normalizeDocumentType(value?: string | null) {
  const type = (value || 'OTHER').toUpperCase();
  if (type === 'DOC') return 'DOCX';
  if (type === 'PPT') return 'PPTX';
  if (type === 'XLS') return 'XLSX';
  if (type === 'RAR') return 'ZIP';
  return DOCUMENT_TYPES.some(item => item.value === type) ? type : 'OTHER';
}

function getTypeConfig(value?: string | null) {
  const type = normalizeDocumentType(value);
  return DOCUMENT_TYPES.find(item => item.value === type) ?? DOCUMENT_TYPES[DOCUMENT_TYPES.length - 1];
}

function normalizePageResponse<T>(
  payload: PageResponse<T> | T[] | unknown,
  page: number,
  size: number
): PageResponse<T> {
  if (Array.isArray(payload)) {
    return {
      content: payload,
      totalElements: payload.length,
      totalPages: 1,
      size,
      number: page,
    };
  }

  const maybePage = payload as Partial<PageResponse<T>>;
  return {
    content: Array.isArray(maybePage?.content) ? maybePage.content : [],
    totalElements: maybePage?.totalElements ?? maybePage?.content?.length ?? 0,
    totalPages: maybePage?.totalPages ?? 1,
    size: maybePage?.size ?? size,
    number: maybePage?.number ?? page,
  };
}

function formatDate(value?: string | null) {
  if (!value) return '-';
  return new Date(value).toLocaleDateString('vi-VN', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  });
}

function getErrorMessage(error: unknown) {
  const err = error as { response?: { status?: number; data?: { detail?: string; message?: string } } };
  if (err.response?.status === 403) {
    return 'Bạn không có quyền truy cập tài liệu của lớp học phần này.';
  }
  return err.response?.data?.detail || err.response?.data?.message || 'Không thể tải tài liệu. Vui lòng thử lại.';
}

export default function DocumentsPage() {
  const navigate = useNavigate();
  const { user: authUser, isAuthenticated } = useAuth();

  const [classes, setClasses] = useState<LopHocPhan[]>([]);
  const [selectedClassId, setSelectedClassId] = useState('');
  const [loadingClasses, setLoadingClasses] = useState(true);
  const [classError, setClassError] = useState('');

  const [documentsPage, setDocumentsPage] = useState<PageResponse<TaiLieuItem> | null>(null);
  const [loadingDocuments, setLoadingDocuments] = useState(false);
  const [documentError, setDocumentError] = useState('');

  const [keyword, setKeyword] = useState('');
  const [typeFilter, setTypeFilter] = useState<LoaiTaiLieu | ''>('');
  const [page, setPage] = useState(0);
  const [previewDoc, setPreviewDoc] = useState<TaiLieuItem | null>(null);

  useEffect(() => {
    if (!isAuthenticated || !authUser) {
      navigate('/');
      return;
    }
    if (authUser.role !== 'student') {
      navigate('/');
    }
  }, [isAuthenticated, authUser, navigate]);

  useEffect(() => {
    if (!isAuthenticated || !authUser || authUser.role !== 'student') return;

    let mounted = true;
    setLoadingClasses(true);
    setClassError('');

    apiClient.get<LopHocPhan[]>('/student/dang-ky-tin-chi')
      .then(response => {
        if (!mounted) return;
        const list = response.data ?? [];
        setClasses(list);
        setSelectedClassId(current => current || list[0]?.lopHocPhanId || '');
      })
      .catch(() => {
        if (mounted) setClassError('Không thể tải danh sách lớp học phần.');
      })
      .finally(() => {
        if (mounted) setLoadingClasses(false);
      });

    return () => {
      mounted = false;
    };
  }, [isAuthenticated, authUser]);

  useEffect(() => {
    if (!selectedClassId) {
      setDocumentsPage(null);
      return;
    }

    let mounted = true;
    const timeoutId = window.setTimeout(() => {
      setLoadingDocuments(true);
      setDocumentError('');

      apiClient.get<PageResponse<TaiLieuItem> | TaiLieuItem[]>('/student/tailieu/search', {
        params: {
          lopHocPhanId: selectedClassId,
          keyword: keyword.trim() || undefined,
          loaiTaiLieu: typeFilter || undefined,
          page,
          size: PAGE_SIZE,
        },
      })
        .then(response => {
          if (mounted) setDocumentsPage(normalizePageResponse<TaiLieuItem>(response.data, page, PAGE_SIZE));
        })
        .catch(error => {
          if (!mounted) return;
          setDocumentError(getErrorMessage(error));
          setDocumentsPage(null);
        })
        .finally(() => {
          if (mounted) setLoadingDocuments(false);
        });
    }, keyword.trim() ? 350 : 0);

    return () => {
      mounted = false;
      window.clearTimeout(timeoutId);
    };
  }, [selectedClassId, keyword, typeFilter, page]);

  const documents = documentsPage?.content ?? [];
  const selectedClass = useMemo(
    () => classes.find(item => item.lopHocPhanId === selectedClassId) ?? null,
    [classes, selectedClassId]
  );

  const groupedDocuments = useMemo(() => {
    const groups: Record<string, TaiLieuItem[]> = {};
    documents.forEach(doc => {
      const type = normalizeDocumentType(doc.loaiTaiLieu);
      if (!groups[type]) groups[type] = [];
      groups[type].push(doc);
    });
    return groups;
  }, [documents]);

  const typeCounts = useMemo(() => {
    return documents.reduce<Record<string, number>>((acc, doc) => {
      const type = normalizeDocumentType(doc.loaiTaiLieu);
      acc[type] = (acc[type] || 0) + 1;
      return acc;
    }, {});
  }, [documents]);

  const handleClassChange = (lopHocPhanId: string) => {
    setSelectedClassId(lopHocPhanId);
    setKeyword('');
    setTypeFilter('');
    setPage(0);
    setDocumentsPage(null);
  };

  const handleKeywordChange = (value: string) => {
    setKeyword(value);
    setPage(0);
  };

  const handleTypeChange = (value: string) => {
    setTypeFilter(value);
    setPage(0);
  };

  const openDocument = (doc: TaiLieuItem) => {
    setPreviewDoc(doc);
  };

  return (
    <div className="flex h-screen bg-[#f1f5f9]">
      <StudentSidebar />

      <div className="flex-1 ml-64 flex flex-col">
        <StudentHeader userName={authUser?.fullName ?? ''} title="Tài liệu học tập" />

        <main className="flex-1 overflow-y-auto p-6">
          <div className="max-w-7xl mx-auto space-y-6">
            <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
              <div>
                <h2 className="text-2xl font-bold text-[#0a2540]">Tài liệu học tập</h2>
                <p className="text-[#6a7282] mt-1">Xem tài liệu theo từng lớp học phần đã đăng ký</p>
              </div>

              <div className="bg-white rounded-xl px-4 py-3 border border-[#e5e7eb] shadow-sm flex gap-6">
                <div>
                  <p className="text-sm text-[#6a7282]">Tài liệu</p>
                  <p className="text-2xl font-bold text-blue-600">{documentsPage?.totalElements ?? documents.length}</p>
                </div>
                <div>
                  <p className="text-sm text-[#6a7282]">Loại file</p>
                  <p className="text-2xl font-bold text-emerald-600">{Object.keys(typeCounts).length}</p>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-xl shadow-sm border border-[#e5e7eb] p-6">
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium text-[#0a2540] mb-2">
                    <Filter className="w-4 h-4 inline mr-1" />
                    Lớp học phần
                  </label>
                  {loadingClasses ? (
                    <div className="h-12 bg-slate-100 rounded-lg animate-pulse" />
                  ) : classError ? (
                    <div className="flex items-center gap-2 text-red-600 text-sm h-12">
                      <AlertCircle className="w-4 h-4" />
                      {classError}
                    </div>
                  ) : classes.length === 0 ? (
                    <div className="flex items-center gap-2 text-[#6a7282] text-sm h-12">
                      <BookOpen className="w-4 h-4" />
                      Bạn chưa đăng ký lớp học phần nào.
                    </div>
                  ) : (
                    <div className="relative">
                      <select
                        value={selectedClassId}
                        onChange={event => handleClassChange(event.target.value)}
                        className="w-full px-4 py-3 pr-10 border border-[#e5e7eb] rounded-lg appearance-none focus:outline-none focus:ring-2 focus:ring-[#0a2540] bg-white"
                      >
                        {classes.map(item => (
                          <option key={item.lopHocPhanId} value={item.lopHocPhanId}>
                            {item.maLopHocPhan} - {item.tenMonHoc || item.maMonHoc}
                          </option>
                        ))}
                      </select>
                      <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 w-5 h-5 text-[#6a7282] pointer-events-none" />
                    </div>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-[#0a2540] mb-2">
                    <FolderOpen className="w-4 h-4 inline mr-1" />
                    Loại tài liệu
                  </label>
                  <div className="relative">
                    <select
                      value={typeFilter}
                      onChange={event => handleTypeChange(event.target.value)}
                      disabled={!selectedClassId}
                      className="w-full px-4 py-3 pr-10 border border-[#e5e7eb] rounded-lg appearance-none focus:outline-none focus:ring-2 focus:ring-[#0a2540] bg-white disabled:bg-slate-100 disabled:text-slate-400"
                    >
                      <option value="">Tất cả loại</option>
                      {DOCUMENT_TYPES.filter(item => item.value !== 'OTHER').map(item => (
                        <option key={item.value} value={item.value}>{item.label}</option>
                      ))}
                    </select>
                    <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 w-5 h-5 text-[#6a7282] pointer-events-none" />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-[#0a2540] mb-2">Tìm kiếm</label>
                  <div className="relative">
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-[#6a7282]" />
                    <input
                      type="text"
                      value={keyword}
                      onChange={event => handleKeywordChange(event.target.value)}
                      disabled={!selectedClassId}
                      placeholder="Tìm theo tên tài liệu..."
                      className="w-full pl-12 pr-4 py-3 border border-[#e5e7eb] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#0a2540] disabled:bg-slate-100 disabled:text-slate-400"
                    />
                  </div>
                </div>
              </div>

              {selectedClass && (
                <div className="mt-4 pt-4 border-t border-[#eef2f7] flex flex-wrap gap-3 text-sm text-[#6a7282]">
                  <span className="inline-flex items-center gap-2">
                    <BookOpen className="w-4 h-4 text-[#0a2540]" />
                    {selectedClass.maLopHocPhan}
                  </span>
                  <span>{selectedClass.tenMonHoc || selectedClass.maMonHoc}</span>
                  {selectedClass.soTinChi ? <span>{selectedClass.soTinChi} tín chỉ</span> : null}
                </div>
              )}
            </div>

            {documentError && (
              <div className="bg-red-50 border border-red-200 rounded-xl p-4 flex items-center gap-3 text-red-700">
                <AlertCircle className="w-5 h-5 shrink-0" />
                <p className="text-sm font-medium">{documentError}</p>
              </div>
            )}

            <div className="bg-white rounded-xl shadow-sm border border-[#e5e7eb] overflow-hidden">
              <div className="p-6 border-b border-[#e5e7eb] flex flex-col md:flex-row md:items-center md:justify-between gap-3">
                <div>
                  <h3 className="font-semibold text-[#0a2540]">Danh sách tài liệu</h3>
                  <p className="text-sm text-[#6a7282] mt-1">
                    {documentsPage?.totalElements ?? documents.length} tài liệu trong lớp học phần đang chọn
                  </p>
                </div>

                {typeFilter && (
                  <span className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-full border text-sm font-semibold ${getTypeConfig(typeFilter).badgeClass}`}>
                    {getTypeConfig(typeFilter).icon}
                    {getTypeConfig(typeFilter).label}
                  </span>
                )}
              </div>

              {loadingDocuments ? (
                <div className="p-6 space-y-4">
                  {[...Array(5)].map((_, index) => (
                    <div key={index} className="flex items-center gap-4 animate-pulse">
                      <div className="w-11 h-11 bg-slate-100 rounded-lg" />
                      <div className="flex-1 space-y-2">
                        <div className="h-4 bg-slate-100 rounded w-2/5" />
                        <div className="h-3 bg-slate-100 rounded w-3/5" />
                      </div>
                      <div className="h-8 bg-slate-100 rounded w-24" />
                    </div>
                  ))}
                </div>
              ) : !selectedClassId ? (
                <div className="p-12 text-center">
                  <BookOpen className="w-12 h-12 text-slate-300 mx-auto mb-3" />
                  <p className="text-[#6a7282]">Chọn lớp học phần để xem tài liệu.</p>
                </div>
              ) : documents.length === 0 ? (
                <div className="p-12 text-center">
                  <FileText className="w-12 h-12 text-slate-300 mx-auto mb-3" />
                  <p className="font-medium text-[#0a2540]">Lớp học phần này chưa có tài liệu</p>
                  <p className="text-sm text-[#6a7282] mt-1">Tài liệu do giảng viên đăng sẽ hiển thị tại đây.</p>
                </div>
              ) : typeFilter ? (
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead className="bg-[#f8fafc] border-b border-[#e5e7eb]">
                      <tr>
                        <th className="px-6 py-3 text-left font-semibold text-[#0a2540]">Tên tài liệu</th>
                        <th className="px-6 py-3 text-left font-semibold text-[#0a2540] w-36">Loại</th>
                        <th className="px-6 py-3 text-left font-semibold text-[#0a2540]">Mô tả</th>
                        <th className="px-6 py-3 text-left font-semibold text-[#0a2540] w-36">Ngày đăng</th>
                        <th className="px-6 py-3 text-center font-semibold text-[#0a2540] w-32">Thao tác</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-[#eef2f7]">
                      {documents.map(doc => {
                        const type = getTypeConfig(doc.loaiTaiLieu);
                        return (
                          <tr key={doc.id} className="hover:bg-[#f8fafc] transition-colors">
                            <td className="px-6 py-4">
                              <div className="flex items-center gap-3 min-w-0">
                                <span className={`w-10 h-10 rounded-lg flex items-center justify-center shrink-0 ${type.iconClass}`}>
                                  {type.icon}
                                </span>
                                <p className="font-medium text-[#0a2540] truncate">{doc.tenTaiLieu}</p>
                              </div>
                            </td>
                            <td className="px-6 py-4">
                              <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full border text-xs font-semibold ${type.badgeClass}`}>
                                {type.icon}
                                {type.label}
                              </span>
                            </td>
                            <td className="px-6 py-4 text-[#6a7282] max-w-md">
                              <p className="line-clamp-1">{doc.moTa || '-'}</p>
                            </td>
                            <td className="px-6 py-4 text-[#6a7282]">
                              <span className="inline-flex items-center gap-1.5">
                                <Calendar className="w-4 h-4" />
                                {formatDate(doc.ngayDang)}
                              </span>
                            </td>
                            <td className="px-6 py-4">
                              <div className="flex items-center justify-center gap-2">
                                <button
                                  type="button"
                                  onClick={() => openDocument(doc)}
                                  className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                                  title="Xem"
                                >
                                  <Eye className="w-4 h-4" />
                                </button>
                                <a
                                  href={resolveFileUrl(doc.fileTaiLieuUrl)}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  download
                                  className="p-2 text-slate-600 hover:bg-slate-100 rounded-lg transition-colors"
                                  title="Tải xuống"
                                >
                                  <Download className="w-4 h-4" />
                                </a>
                              </div>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              ) : (
                <div className="divide-y divide-[#eef2f7]">
                  {Object.entries(groupedDocuments)
                    .sort(([a], [b]) => getTypeConfig(a).label.localeCompare(getTypeConfig(b).label))
                    .map(([typeKey, docs]) => {
                      const type = getTypeConfig(typeKey);
                      return (
                        <section key={typeKey}>
                          <div className="px-6 py-3 bg-[#f8fafc] flex items-center justify-between">
                            <div className="flex items-center gap-2">
                              <span className={`w-8 h-8 rounded-lg flex items-center justify-center ${type.iconClass}`}>
                                {type.icon}
                              </span>
                              <span className="font-semibold text-[#0a2540]">{type.label}</span>
                            </div>
                            <span className="text-sm font-semibold text-[#6a7282]">{docs.length} tài liệu</span>
                          </div>

                          {docs.map(doc => (
                            <div key={doc.id} className="px-6 py-4 flex flex-col md:flex-row md:items-center md:justify-between gap-4 hover:bg-[#f8fafc] transition-colors">
                              <div className="min-w-0">
                                <p className="font-medium text-[#0a2540] truncate">{doc.tenTaiLieu}</p>
                                {doc.moTa && <p className="text-sm text-[#6a7282] line-clamp-1 mt-1">{doc.moTa}</p>}
                                <p className="text-xs text-slate-400 mt-1 inline-flex items-center gap-1.5">
                                  <Calendar className="w-3.5 h-3.5" />
                                  {formatDate(doc.ngayDang)}
                                </p>
                              </div>

                              <div className="flex items-center gap-2 shrink-0">
                                <button
                                  type="button"
                                  onClick={() => openDocument(doc)}
                                  className="inline-flex items-center gap-2 px-3 py-2 bg-[#0a2540] text-white text-sm rounded-lg hover:bg-[#0d2f52] transition-colors font-medium"
                                >
                                  <Eye className="w-4 h-4" />
                                  Xem
                                </button>
                                <a
                                  href={resolveFileUrl(doc.fileTaiLieuUrl)}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  download
                                  className="inline-flex items-center gap-2 px-3 py-2 bg-slate-100 text-slate-700 text-sm rounded-lg hover:bg-slate-200 transition-colors font-medium"
                                >
                                  <Download className="w-4 h-4" />
                                  Tải
                                </a>
                              </div>
                            </div>
                          ))}
                        </section>
                      );
                    })}
                </div>
              )}

              {documentsPage && documentsPage.totalPages > 1 && (
                <div className="flex items-center justify-between px-6 py-4 border-t border-[#e5e7eb]">
                  <p className="text-sm text-[#6a7282]">
                    Trang {documentsPage.number + 1} / {documentsPage.totalPages} - {documentsPage.totalElements} tài liệu
                  </p>
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => setPage(current => Math.max(0, current - 1))}
                      disabled={page === 0}
                      className="p-2 rounded-lg border border-[#e5e7eb] hover:bg-[#f1f5f9] disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
                    >
                      <ChevronLeft className="w-4 h-4" />
                    </button>
                    <button
                      type="button"
                      onClick={() => setPage(current => Math.min(documentsPage.totalPages - 1, current + 1))}
                      disabled={page >= documentsPage.totalPages - 1}
                      className="p-2 rounded-lg border border-[#e5e7eb] hover:bg-[#f1f5f9] disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
                    >
                      <ChevronRight className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </main>
      </div>

      <AIAssistantButton />
      <DocumentViewerModal
        open={!!previewDoc}
        title={previewDoc?.tenTaiLieu || 'Tài liệu'}
        url={previewDoc?.fileTaiLieuUrl}
        onClose={() => setPreviewDoc(null)}
      />
    </div>
  );
}
