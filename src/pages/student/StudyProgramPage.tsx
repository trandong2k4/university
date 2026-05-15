import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useNavigate } from 'react-router';
import { useAuth } from '@/hooks';
import { apiClient } from '@/api/common';
import { StudentSidebar } from '@/components/layouts/StudentSidebar';
import { StudentHeader } from '@/components/layouts/StudentHeader';
import { AIAssistantButton } from '@/components/chatbot/AIAssistantButton';
import {
  AlertCircle,
  BookOpen,
  ChevronLeft,
  ChevronRight,
  GraduationCap,
  Hash,
  Layers,
  Loader2,
  RefreshCw,
  Search,
  X,
} from 'lucide-react';

interface ChuongTrinhDaoTaoItem {
  id: string;
  maNganh: string;
  tenNganh: string;
  maMonHoc: string;
  tenMonHoc: string;
  soTinChi: number;
  moTa: string | null;
}

interface PageResponse {
  content: ChuongTrinhDaoTaoItem[];
  totalElements: number;
  totalPages: number;
  size: number;
  number: number;
}

const PAGE_SIZE = 10;
const MAX_PAGE_BUTTONS = 5;

const normalizePageResponse = (raw: unknown, currentPage: number): PageResponse => {
  if (raw && typeof raw === 'object' && Array.isArray((raw as PageResponse).content)) {
    const pageData = raw as PageResponse;
    return {
      content: pageData.content,
      totalElements: pageData.totalElements ?? pageData.content.length,
      totalPages: pageData.totalPages ?? Math.max(1, Math.ceil(pageData.content.length / PAGE_SIZE)),
      size: pageData.size ?? PAGE_SIZE,
      number: pageData.number ?? currentPage,
    };
  }

  if (Array.isArray(raw)) {
    return {
      content: raw as ChuongTrinhDaoTaoItem[],
      totalElements: raw.length,
      totalPages: Math.max(1, Math.ceil(raw.length / PAGE_SIZE)),
      size: PAGE_SIZE,
      number: currentPage,
    };
  }

  return {
    content: [],
    totalElements: 0,
    totalPages: 0,
    size: PAGE_SIZE,
    number: currentPage,
  };
};

const extractError = (err: unknown): string => {
  if (err && typeof err === 'object') {
    const e = err as {
      response?: {
        status?: number;
        data?: {
          detail?: string;
          message?: string;
          error?: string;
        };
      };
    };

    if (e.response?.status === 409) {
      return 'Tài khoản chưa được gán ngành học. Vui lòng liên hệ phòng đào tạo.';
    }

    return (
      e.response?.data?.detail ||
      e.response?.data?.message ||
      e.response?.data?.error ||
      'Không thể tải chương trình đào tạo. Vui lòng thử lại.'
    );
  }

  return 'Không thể tải chương trình đào tạo. Vui lòng thử lại.';
};

export default function StudyProgramPage() {
  const navigate = useNavigate();
  const { user: authUser, isAuthenticated } = useAuth();

  const [data, setData] = useState<PageResponse | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [keyword, setKeyword] = useState('');
  const [page, setPage] = useState(0);

  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    if (!isAuthenticated || !authUser) { navigate('/'); return; }
    if (authUser.role !== 'student') { navigate('/'); }
  }, [isAuthenticated, authUser, navigate]);

  const fetchData = useCallback(async (kw: string, pg: number) => {
    setIsLoading(true);
    setError(null);

    try {
      const res = await apiClient.post<unknown>(
        `/student/chuong-trinh-dao-tao/search?page=${pg}&size=${PAGE_SIZE}`,
        { keyword: kw.trim() || undefined }
      );

      setData(normalizePageResponse(res.data, pg));
    } catch (err) {
      setError(extractError(err));
      setData(null);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    if (!isAuthenticated || !authUser || authUser.role !== 'student') return;
    fetchData(keyword, page);
  }, [isAuthenticated, authUser, fetchData, page]);

  useEffect(() => () => {
    if (debounceRef.current) clearTimeout(debounceRef.current);
  }, []);

  const handleKeywordChange = (value: string) => {
    setKeyword(value);
    if (debounceRef.current) clearTimeout(debounceRef.current);

    debounceRef.current = setTimeout(() => {
      setPage(0);
      fetchData(value, 0);
    }, 400);
  };

  const handleClearKeyword = () => {
    if (debounceRef.current) clearTimeout(debounceRef.current);
    setKeyword('');
    setPage(0);
    fetchData('', 0);
  };

  const handleRefresh = () => {
    fetchData(keyword, page);
  };

  const handlePageChange = (newPage: number) => {
    if (!data) return;
    if (newPage < 0 || newPage >= data.totalPages || newPage === page) return;
    setPage(newPage);
  };

  const nganhInfo = data?.content?.[0] ?? null;
  const items = data?.content ?? [];
  const nganhLabel = nganhInfo ? `${nganhInfo.maNganh} - ${nganhInfo.tenNganh}` : '-';
  const visibleCredits = items.reduce((sum, item) => sum + (item.soTinChi ?? 0), 0);
  const creditsLabel = data && data.totalPages <= 1 ? 'Tổng tín chỉ' : 'Tín chỉ trang này';
  const showingFrom = data && data.totalElements > 0 ? data.number * data.size + 1 : 0;
  const showingTo = data ? Math.min((data.number + 1) * data.size, data.totalElements) : 0;
  const userName = authUser?.fullName || authUser?.username || '';

  const pageNumbers = useMemo(() => {
    if (!data || data.totalPages <= 0) return [];

    const current = data.number;
    let start = Math.max(0, current - Math.floor(MAX_PAGE_BUTTONS / 2));
    let end = Math.min(data.totalPages - 1, start + MAX_PAGE_BUTTONS - 1);
    start = Math.max(0, end - MAX_PAGE_BUTTONS + 1);

    return Array.from({ length: end - start + 1 }, (_, index) => start + index);
  }, [data]);

  return (
    <div className="flex h-screen bg-[#f1f5f9]">
      <StudentSidebar />

      <div className="flex-1 ml-64 flex flex-col min-w-0">
        <StudentHeader userName={userName} />

        <main className="flex-1 overflow-y-auto p-8">
          <div className="mb-6 flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
            <div>
              <h1 className="text-3xl font-bold text-[#0a2540]">Chương trình đào tạo</h1>
              <p className="text-[#6a7282] mt-2">Tra cứu danh sách môn học trong ngành của bạn</p>
            </div>

            <button
              onClick={handleRefresh}
              disabled={isLoading}
              className="inline-flex items-center justify-center gap-2 rounded-lg border border-[#e5e7eb] bg-white px-4 py-2.5 text-sm font-semibold text-[#0a2540] shadow-sm transition-colors hover:bg-[#f8fafc] disabled:cursor-not-allowed disabled:opacity-60"
            >
              <RefreshCw className={`h-4 w-4 ${isLoading ? 'animate-spin' : ''}`} />
              Làm mới
            </button>
          </div>

          {data && !error && (
            <div className="mb-6 grid grid-cols-1 gap-4 lg:grid-cols-4">
              <div className="rounded-[14px] border border-[#e5e7eb] bg-white p-5 shadow-sm lg:col-span-2">
                <div className="flex items-start gap-4">
                  <div className="rounded-xl bg-blue-50 p-3">
                    <GraduationCap className="h-6 w-6 text-blue-600" />
                  </div>
                  <div className="min-w-0">
                    <p className="mb-1 text-xs font-semibold uppercase tracking-wide text-[#6a7282]">Ngành học</p>
                    <p className="truncate text-lg font-bold text-[#0a2540]" title={nganhLabel}>
                      {nganhLabel}
                    </p>
                  </div>
                </div>
              </div>

              <div className="rounded-[14px] border border-[#e5e7eb] bg-white p-5 shadow-sm">
                <div className="flex items-start gap-4">
                  <div className="rounded-xl bg-emerald-50 p-3">
                    <BookOpen className="h-6 w-6 text-emerald-600" />
                  </div>
                  <div>
                    <p className="mb-1 text-xs font-semibold uppercase tracking-wide text-[#6a7282]">Tổng số môn</p>
                    <p className="text-2xl font-bold text-[#0a2540]">{data.totalElements}</p>
                  </div>
                </div>
              </div>

              <div className="rounded-[14px] border border-[#e5e7eb] bg-white p-5 shadow-sm">
                <div className="flex items-start gap-4">
                  <div className="rounded-xl bg-violet-50 p-3">
                    <Layers className="h-6 w-6 text-violet-600" />
                  </div>
                  <div>
                    <p className="mb-1 text-xs font-semibold uppercase tracking-wide text-[#6a7282]">{creditsLabel}</p>
                    <p className="text-2xl font-bold text-[#0a2540]">{visibleCredits}</p>
                  </div>
                </div>
              </div>
            </div>
          )}

          <div className="mb-4 rounded-[14px] border border-[#e5e7eb] bg-white p-4 shadow-sm">
            <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[#6a7282]" />
                <input
                  type="text"
                  value={keyword}
                  onChange={e => handleKeywordChange(e.target.value)}
                  placeholder="Tìm theo mã môn hoặc tên môn học..."
                  className="w-full rounded-lg border border-[#e5e7eb] py-2.5 pl-9 pr-10 text-sm text-[#0a2540] transition-colors focus:border-[#0a2540] focus:outline-none focus:ring-2 focus:ring-[#0a2540]/20"
                />
                {keyword && (
                  <button
                    type="button"
                    onClick={handleClearKeyword}
                    className="absolute right-2 top-1/2 rounded-md p-1 text-[#6a7282] transition-colors -translate-y-1/2 hover:bg-[#f1f5f9] hover:text-[#0a2540]"
                    aria-label="Xóa từ khóa tìm kiếm"
                  >
                    <X className="h-4 w-4" />
                  </button>
                )}
              </div>

              {data && !error && (
                <div className="whitespace-nowrap text-sm text-[#6a7282]">
                  Hiển thị <b className="font-semibold text-[#0a2540]">{showingFrom}-{showingTo}</b> /{' '}
                  <b className="font-semibold text-[#0a2540]">{data.totalElements}</b> môn học
                </div>
              )}
            </div>
          </div>

          {error && (
            <div className="rounded-[14px] border border-red-200 bg-red-50 p-6">
              <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                <div className="flex items-start gap-3 text-red-700">
                  <AlertCircle className="mt-0.5 h-5 w-5 shrink-0" />
                  <p className="font-medium">{error}</p>
                </div>
                <button
                  onClick={handleRefresh}
                  className="inline-flex items-center justify-center gap-2 rounded-lg bg-red-600 px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-red-700"
                >
                  <RefreshCw className="h-4 w-4" />
                  Thử lại
                </button>
              </div>
            </div>
          )}

          {isLoading && !error && (
            <div className="overflow-hidden rounded-[14px] border border-[#e5e7eb] bg-white shadow-sm">
              <div className="border-b border-[#e5e7eb] bg-[#f8fafc] px-6 py-4">
                <div className="h-4 w-56 animate-pulse rounded bg-gray-200" />
              </div>
              {[...Array(6)].map((_, i) => (
                <div key={i} className="flex gap-4 border-b border-[#f1f5f9] px-6 py-4 last:border-b-0">
                  <div className="h-4 w-24 animate-pulse rounded bg-gray-200" />
                  <div className="h-4 flex-1 animate-pulse rounded bg-gray-200" />
                  <div className="h-4 w-16 animate-pulse rounded bg-gray-200" />
                  <div className="h-4 w-40 animate-pulse rounded bg-gray-200" />
                </div>
              ))}
            </div>
          )}

          {!isLoading && !error && data && (
            <>
              {items.length === 0 ? (
                <div className="rounded-[14px] border border-[#e5e7eb] bg-white p-12 text-center shadow-sm">
                  <BookOpen className="mx-auto mb-3 h-12 w-12 text-[#9ca3af]" />
                  <p className="font-semibold text-[#0a2540]">
                    {keyword ? 'Không tìm thấy môn học phù hợp' : 'Chưa có môn học trong chương trình đào tạo'}
                  </p>
                  <p className="mt-1 text-sm text-[#6a7282]">
                    {keyword ? 'Thử từ khóa khác hoặc xóa bộ lọc tìm kiếm.' : 'Dữ liệu sẽ hiển thị sau khi phòng đào tạo cập nhật.'}
                  </p>
                  {keyword && (
                    <button
                      onClick={handleClearKeyword}
                      className="mt-4 rounded-lg bg-[#0a2540] px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-[#0d2f52]"
                    >
                      Xóa tìm kiếm
                    </button>
                  )}
                </div>
              ) : (
                <div className="overflow-hidden rounded-[14px] border border-[#e5e7eb] bg-white shadow-sm">
                  <div className="flex flex-col gap-2 border-b border-[#e5e7eb] bg-[#f8fafc] px-6 py-4 sm:flex-row sm:items-center sm:justify-between">
                    <div className="flex items-center gap-2">
                      <BookOpen className="h-5 w-5 text-blue-600" />
                      <h2 className="font-bold text-[#0a2540]">Danh sách môn học</h2>
                    </div>
                    <p className="text-sm text-[#6a7282]">
                      Trang {data.number + 1} / {Math.max(data.totalPages, 1)}
                    </p>
                  </div>

                  <div className="overflow-x-auto">
                    <table className="w-full min-w-[860px] text-sm">
                      <thead>
                        <tr className="border-b border-[#e5e7eb] bg-white">
                          <th className="w-32 px-6 py-3 text-left font-semibold text-[#0a2540]">Mã môn</th>
                          <th className="px-6 py-3 text-left font-semibold text-[#0a2540]">Tên môn học</th>
                          <th className="w-28 px-6 py-3 text-center font-semibold text-[#0a2540]">Tín chỉ</th>
                          <th className="px-6 py-3 text-left font-semibold text-[#0a2540]">Mô tả</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-[#f1f5f9]">
                        {items.map((item, index) => (
                          <tr key={item.id ?? `${item.maMonHoc}-${index}`} className="transition-colors hover:bg-[#f8fafc]">
                            <td className="px-6 py-4">
                              <span className="inline-flex items-center gap-2 font-mono text-sm font-semibold text-[#0a2540]">
                                <Hash className="h-3.5 w-3.5 text-[#9ca3af]" />
                                {item.maMonHoc}
                              </span>
                            </td>
                            <td className="px-6 py-4">
                              <p className="font-semibold text-[#0a2540]">{item.tenMonHoc}</p>
                            </td>
                            <td className="px-6 py-4 text-center">
                              <span className="inline-flex h-8 min-w-8 items-center justify-center rounded-full bg-violet-100 px-2 text-sm font-bold text-violet-700">
                                {item.soTinChi}
                              </span>
                            </td>
                            <td className="px-6 py-4 text-[#6a7282]">
                              {item.moTa ? (
                                <span className="line-clamp-2">{item.moTa}</span>
                              ) : (
                                <span className="text-[#9ca3af]">Chưa có mô tả</span>
                              )}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>

                  {data.totalPages > 1 && (
                    <div className="flex flex-col gap-3 border-t border-[#e5e7eb] px-6 py-4 sm:flex-row sm:items-center sm:justify-between">
                      <p className="text-sm text-[#6a7282]">
                        Hiển thị {showingFrom}-{showingTo} trong tổng {data.totalElements} môn học
                      </p>
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => handlePageChange(page - 1)}
                          disabled={page === 0}
                          className="inline-flex h-9 w-9 items-center justify-center rounded-lg border border-[#e5e7eb] text-[#0a2540] transition-colors hover:bg-[#f1f5f9] disabled:cursor-not-allowed disabled:opacity-40"
                          aria-label="Trang trước"
                        >
                          <ChevronLeft className="h-4 w-4" />
                        </button>

                        {pageNumbers[0] > 0 && (
                          <>
                            <button
                              onClick={() => handlePageChange(0)}
                              className="h-9 min-w-9 rounded-lg border border-[#e5e7eb] px-3 text-sm font-semibold text-[#334155] transition-colors hover:bg-[#f1f5f9]"
                            >
                              1
                            </button>
                            <span className="px-1 text-[#9ca3af]">...</span>
                          </>
                        )}

                        {pageNumbers.map((pageNumber) => (
                          <button
                            key={pageNumber}
                            onClick={() => handlePageChange(pageNumber)}
                            className={`h-9 min-w-9 rounded-lg px-3 text-sm font-semibold transition-colors ${
                              pageNumber === page
                                ? 'bg-[#0a2540] text-white'
                                : 'border border-[#e5e7eb] text-[#334155] hover:bg-[#f1f5f9]'
                            }`}
                          >
                            {pageNumber + 1}
                          </button>
                        ))}

                        {pageNumbers[pageNumbers.length - 1] < data.totalPages - 1 && (
                          <>
                            <span className="px-1 text-[#9ca3af]">...</span>
                            <button
                              onClick={() => handlePageChange(data.totalPages - 1)}
                              className="h-9 min-w-9 rounded-lg border border-[#e5e7eb] px-3 text-sm font-semibold text-[#334155] transition-colors hover:bg-[#f1f5f9]"
                            >
                              {data.totalPages}
                            </button>
                          </>
                        )}

                        <button
                          onClick={() => handlePageChange(page + 1)}
                          disabled={page >= data.totalPages - 1}
                          className="inline-flex h-9 w-9 items-center justify-center rounded-lg border border-[#e5e7eb] text-[#0a2540] transition-colors hover:bg-[#f1f5f9] disabled:cursor-not-allowed disabled:opacity-40"
                          aria-label="Trang sau"
                        >
                          <ChevronRight className="h-4 w-4" />
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              )}
            </>
          )}

          {isLoading && !error && (
            <div className="mt-4 flex items-center justify-center gap-2 text-sm text-[#6a7282]">
              <Loader2 className="h-4 w-4 animate-spin" />
              Đang tải chương trình đào tạo...
            </div>
          )}
        </main>
      </div>

      <AIAssistantButton />
    </div>
  );
}
