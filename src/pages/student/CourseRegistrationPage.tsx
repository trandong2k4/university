import { useCallback, useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router';
import { useAuth } from '@/hooks';
import { apiClient } from '@/api/common';
import { StudentSidebar } from '@/components/layouts/StudentSidebar';
import { StudentHeader } from '@/components/layouts/StudentHeader';
import { AIAssistantButton } from '@/components/chatbot/AIAssistantButton';
import axios from 'axios';
import { toast } from 'sonner';
import {
  Award,
  AlertTriangle,
  CheckCircle,
  Search,
  BookOpen,
  BookCheck,
  ChevronLeft,
  ChevronRight,
  Loader2,
  Trash2,
  RefreshCw,
  Calendar,
  ChevronDown,
  Clock,
  X,
} from 'lucide-react';

// ── Types ─────────────────────────────────────────────────────────────────────

interface HocKiItem {
  id: string;
  maHocKi: string;
  tenHocKi: string;
  ngayBatDau: string;
  ngayKetThuc: string;
  dangHoatDong: boolean;
  nam: number;
  maxTinChi: number;
}

interface LopHocPhanItem {
  id: string;
  maLopHocPhan: string;
  soLuongToiDa: number;
  soLuongHienTai: number;
  hanDangKy: string;
  monHocId: string;
  maMonHoc: string;
  tenMonHoc: string;
  soTinChi: number;
  hocKiId: string;
  maHocKi: string;
  tenHocKi: string;
}

interface DangKyTinChi {
  id: string;
  createdAt: string;
  hocVienId: string;
  maHocVien: string;
  lopHocPhanId: string;
  maLopHocPhan: string;
  monHocId: string;
  maMonHoc: string;
  soTinChi: number;
  hocKiId: string;
}

interface LichItem {
  thu: string;
  thoiGianBatDau: string;
  thoiGianKetThuc: string;
  tenGioHoc: string;
  maPhong: string;
  tenPhong: string;
}

interface PageResponse<T> {
  content: T[];
  totalElements: number;
  totalPages: number;
  number: number;
  size: number;
}

// ── Constants ─────────────────────────────────────────────────────────────────

const PAGE_SIZE = 10;

// ── Pure helpers (no state dependency) ────────────────────────────────────────

const parseHanDangKy = (s: string): Date => {
  const [d, mo, y, h, mi, sec] = s.replace(' ', '/').replace(/:/g, '/').split('/').map(Number);
  return new Date(y, mo - 1, d, h, mi, sec);
};

const parseDateMY = (s: string | null): { month: number; year: number } | null => {
  if (!s) return null;
  if (s.includes('/')) {
    // "dd/MM/yyyy" hoặc "dd/MM/yyyy HH:mm:ss"
    const p = s.split('/');
    if (p.length < 3) return null;
    const month = Number(p[1]);
    const year = Number(p[2].split(' ')[0].split('T')[0]);
    if (isNaN(month) || isNaN(year)) return null;
    return { month, year };
  }
  // ISO "yyyy-MM-dd" hoặc "yyyy-MM-ddTHH:mm:ss"
  const iso = s.split('T')[0].split('-');
  if (iso.length >= 3) {
    const year = Number(iso[0]);
    const month = Number(iso[1]);
    if (isNaN(month) || isNaN(year)) return null;
    return { month, year };
  }
  return null;
};

// Tháng >= 8 → năm học bắt đầu năm đó  (vd: 9/2025 → 2025)
// Tháng <  8 → năm học bắt đầu năm trước (vd: 1/2026 → 2025)
const computeNamHoc = (ngayBatDau: string | null): number => {
  const p = parseDateMY(ngayBatDau);
  if (!p) return 0;
  return p.month >= 8 ? p.year : p.year - 1;
};

// Tháng 8–12 → Kỳ 1 | Tháng 6–7 → Kỳ hè | Tháng 1–5 → Kỳ 2
const getSemesterType = (ngayBatDau: string | null): 'hk1' | 'hk2' | 'hkhe' => {
  const p = parseDateMY(ngayBatDau);
  if (!p) return 'hk2';
  if (p.month >= 8) return 'hk1';
  if (p.month >= 6) return 'hkhe';
  return 'hk2';
};

const formatMonthRange = (batDau: string | null, ketThuc: string | null): string => {
  const b = parseDateMY(batDau);
  const k = parseDateMY(ketThuc);
  const bd = b ? `Tháng ${b.month}/${b.year}` : '—';
  const kt = k ? `Tháng ${k.month}/${k.year}` : '—';
  return `${bd} → ${kt}`;
};

const formatNamHoc = (nam: number) => `${nam}–${nam + 1}`;

// ── Component ─────────────────────────────────────────────────────────────────

export default function CourseRegistrationPage() {
  const navigate = useNavigate();
  const { user: authUser, isAuthenticated } = useAuth();

  const [activeTab, setActiveTab] = useState<'browse' | 'registered'>('browse');

  // HocKi selection state
  const [hocKis, setHocKis] = useState<HocKiItem[]>([]);
  const [selectedNam, setSelectedNam] = useState<number | null>(null);
  const [selectedHocKiId, setSelectedHocKiId] = useState<string | null>(null);
  const [hocKiLoading, setHocKiLoading] = useState(false);

  // Browse state
  const [lopHocPhans, setLopHocPhans] = useState<LopHocPhanItem[]>([]);
  const [keyword, setKeyword] = useState('');
  const [debouncedKeyword, setDebouncedKeyword] = useState('');
  const [page, setPage] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [totalElements, setTotalElements] = useState(0);
  const [browseLoading, setBrowseLoading] = useState(false);
  const [browseError, setBrowseError] = useState('');

  // Registered state
  const [myRegistrations, setMyRegistrations] = useState<DangKyTinChi[]>([]);
  const [regLoading, setRegLoading] = useState(false);
  const [regError, setRegError] = useState('');

  // Action state
  const [registeringId, setRegisteringId] = useState<string | null>(null);
  const [cancelingId, setCancelingId] = useState<string | null>(null);
  const [actionError, setActionError] = useState('');
  const [actionSuccess, setActionSuccess] = useState('');

  // Schedule modal state
  const [scheduleModal, setScheduleModal] = useState<{ id: string; ma: string } | null>(null);
  const [scheduleItems, setScheduleItems] = useState<LichItem[]>([]);
  const [scheduleLoading, setScheduleLoading] = useState(false);

  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    if (!isAuthenticated || !authUser) { navigate('/'); return; }
    if (authUser.role !== 'student') { navigate('/'); return; }
  }, [isAuthenticated, authUser, navigate]);

  // Load danh sách học kỳ và tự chọn học kỳ đang hoạt động
  useEffect(() => {
    const fetchHocKis = async () => {
      setHocKiLoading(true);
      try {
        const res = await apiClient.get<HocKiItem[]>('/student/hoc-ki');

setHocKis(res.data);

        const active = res.data.find(hk => hk.dangHoatDong);
        if (active) {
          setSelectedNam(computeNamHoc(active.ngayBatDau));
          setSelectedHocKiId(active.id);
        } else if (res.data.length > 0) {
          const latest = res.data[res.data.length - 1];
          setSelectedNam(computeNamHoc(latest.ngayBatDau));
          setSelectedHocKiId(latest.id);
        }
      } catch {
        // silently ignore
      } finally {
        setHocKiLoading(false);
      }
    };
    fetchHocKis();
  }, []);

  // Debounce keyword
  useEffect(() => {
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => {
      setDebouncedKeyword(keyword);
      setPage(0);
    }, 400);
    return () => { if (debounceRef.current) clearTimeout(debounceRef.current); };
  }, [keyword]);

  const fetchLopHocPhans = useCallback(async () => {
    if (!selectedHocKiId) return;
    setBrowseLoading(true);
    setBrowseError('');
    try {
      const params: Record<string, string | number> = {
        hocKiId: selectedHocKiId,
        page,
        size: PAGE_SIZE,
      };
      if (debouncedKeyword) params.keyword = debouncedKeyword;
      const res = await apiClient.get<PageResponse<LopHocPhanItem>>(
        '/student/lop-hoc-phan', { params });
      setLopHocPhans(res.data.content);
      setTotalPages(res.data.totalPages);
      setTotalElements(res.data.totalElements);
    } catch {
      setBrowseError('Không thể tải danh sách lớp học phần. Vui lòng thử lại.');
    } finally {
      setBrowseLoading(false);
    }
  }, [selectedHocKiId, debouncedKeyword, page]);

  const fetchMyRegistrations = useCallback(async () => {
    setRegLoading(true);
    setRegError('');
    try {
      const res = await apiClient.get<DangKyTinChi[]>('/student/dang-ky-tin-chi');
      setMyRegistrations(res.data);
    } catch {
      setRegError('Không thể tải danh sách đã đăng ký.');
    } finally {
      setRegLoading(false);
    }
  }, []);

  useEffect(() => { fetchLopHocPhans(); }, [fetchLopHocPhans]);
  useEffect(() => { fetchMyRegistrations(); }, [fetchMyRegistrations]);

  // Reset page khi đổi học kỳ
  useEffect(() => { setPage(0); }, [selectedHocKiId]);

  // Auto-clear messages after 4s
  useEffect(() => {
    if (!actionSuccess && !actionError) return;
    const t = setTimeout(() => { setActionSuccess(''); setActionError(''); }, 4000);
    return () => clearTimeout(t);
  }, [actionSuccess, actionError]);

  const openScheduleModal = async (id: string, ma: string) => {
    setScheduleModal({ id, ma });
    setScheduleItems([]);
    setScheduleLoading(true);
    try {
      const res = await apiClient.get<LichItem[]>(`/student/lop-hoc-phan/${id}/lich`);
      setScheduleItems(res.data);
    } catch {
      // silently ignore
    } finally {
      setScheduleLoading(false);
    }
  };

  const mapBackendError = (detail: string): string => {
    const lower = detail.toLowerCase();
    if (lower.includes('trung lich') || lower.includes('lich hoc')) return 'Lớp học phần này có lịch học trùng với một lớp bạn đã đăng ký.';
    if (lower.includes('het han dang ky') || lower.includes('da het han')) return 'Đã hết hạn đăng ký lớp học phần này.';
    if (lower.includes('da dang ky')) return 'Bạn đã đăng ký lớp học phần này rồi.';
    if (lower.includes('ban da hoc') || lower.includes('da hoc mon')) return 'Bạn đã hoàn thành môn học này rồi.';
    if (lower.includes('tien quyet') || lower.includes('chua hoc')) return 'Bạn chưa hoàn thành môn học tiên quyết.';
    if (lower.includes('vuot qua') || lower.includes('tin chi toi da')) return 'Vượt quá số tín chỉ tối đa trong học kỳ này.';
    if (lower.includes('da day') || lower.includes('lop hoc phan da day')) return 'Lớp học phần đã đầy chỗ.';
    if (lower.includes('han huy') || lower.includes('qua han huy')) return 'Đã quá hạn hủy đăng ký.';
    return detail;
  };

  const extractError = (err: unknown): string => {
    if (axios.isAxiosError(err)) {
      const detail = err.response?.data?.detail;
      if (detail) return mapBackendError(detail);
    }
    return 'Có lỗi xảy ra. Vui lòng thử lại.';
  };

  const isScheduleConflict = (err: unknown): boolean => {
    if (!axios.isAxiosError(err)) return false;
    const detail: string = err.response?.data?.detail ?? '';
    return detail.toLowerCase().includes('lich');
  };

  const handleRegister = async (lopHocPhanId: string) => {
    setActionError('');
    setActionSuccess('');
    setRegisteringId(lopHocPhanId);
    try {
      await apiClient.post('/student/dang-ky-tin-chi', { lopHocPhanId });
      setActionSuccess('Đăng ký thành công!');
      toast.success('Đăng ký thành công!', {
        description: 'Lớp học phần đã được thêm vào danh sách đăng ký của bạn.',
      });
      await Promise.all([fetchLopHocPhans(), fetchMyRegistrations()]);
    } catch (err) {
      if (isScheduleConflict(err)) {
        toast.error('Trùng lịch học!', {
          description: 'Lớp học phần này có lịch học trùng với một lớp bạn đã đăng ký. Vui lòng kiểm tra lịch và chọn lớp khác.',
          duration: 6000,
        });
        setActionError('Trùng lịch học! Lớp này có lịch trùng với một lớp bạn đã đăng ký.');
      } else {
        const msg = extractError(err);
        toast.error(msg);
        setActionError(msg);
      }
    } finally {
      setRegisteringId(null);
    }
  };

  const handleCancel = async (id: string) => {
    if (!confirm('Bạn có chắc muốn hủy đăng ký lớp học phần này?')) return;
    setActionError('');
    setActionSuccess('');
    setCancelingId(id);
    try {
      await apiClient.delete(`/student/dang-ky-tin-chi/${id}`);
      setActionSuccess('Hủy đăng ký thành công!');
      toast.success('Hủy đăng ký thành công!');
      await Promise.all([fetchLopHocPhans(), fetchMyRegistrations()]);
    } catch (err) {
      const msg = extractError(err);
      toast.error(msg);
      setActionError(msg);
    } finally {
      setCancelingId(null);
    }
  };

  const registeredIds = new Set(myRegistrations.map(r => r.lopHocPhanId));
  const userName = authUser?.fullName || authUser?.username || '';

  // Tính danh sách năm học duy nhất và học kỳ theo năm
  const namHocList = [...new Set(hocKis.map(hk => computeNamHoc(hk.ngayBatDau)))].sort((a, b) => a - b);
  const hocKisTrongNam = hocKis.filter(hk => computeNamHoc(hk.ngayBatDau) === selectedNam);
  const selectedHocKi = hocKis.find(hk => hk.id === selectedHocKiId);

  // Tín chỉ và giới hạn theo học kỳ đang chọn
  const maxTinChi = selectedHocKi?.maxTinChi ?? 25;
  const semesterRegistrations = selectedHocKiId
    ? myRegistrations.filter(r => r.hocKiId === selectedHocKiId)
    : myRegistrations;
  const totalRegisteredCredits = semesterRegistrations.reduce((s, r) => s + r.soTinChi, 0);

  if (!authUser) return null;

  return (
    <div className="flex h-screen bg-[#f1f5f9]">
      <StudentSidebar />

      <div className="flex-1 ml-64 flex flex-col">
        <StudentHeader userName={userName} />

        <main className="flex-1 overflow-y-auto p-8">
          {/* Page title */}
          <div className="mb-6">
            <h1 className="text-3xl font-bold text-[#0a2540]">Đăng ký tín chỉ</h1>
            <p className="text-[#6a7282] mt-2">Chọn học kỳ và đăng ký lớp học phần</p>
          </div>

          {/* ── Học kỳ Selector ───────────────────────────────────────────── */}
          <div className="bg-white rounded-[14px] border border-[#e5e7eb] shadow-sm p-5 mb-6">
            <div className="flex items-center gap-2 mb-4">
              <Calendar className="w-5 h-5 text-[#0a2540]" />
              <span className="font-semibold text-[#0a2540]">Chọn học kỳ đăng ký</span>
            </div>

            {hocKiLoading ? (
              <div className="flex items-center gap-2 text-[#6a7282] text-sm">
                <Loader2 className="w-4 h-4 animate-spin" />
                Đang tải học kỳ...
              </div>
            ) : hocKis.length === 0 ? (
              <p className="text-sm text-[#6a7282]">Chưa có học kỳ nào được tạo.</p>
            ) : (
              <div className="space-y-4">
                {/* Chọn năm học — Year Picker */}
                <div className="flex items-center gap-3">
                  <p className="text-xs font-semibold text-[#6a7282] uppercase tracking-wide whitespace-nowrap">
                    Năm học
                  </p>
                  <div className="relative inline-block">
                    <select
                      value={selectedNam ?? ''}
                      onChange={e => {
                        const nam = Number(e.target.value);
                        setSelectedNam(nam);
                        const activeInYear = hocKis.find(hk => computeNamHoc(hk.ngayBatDau) === nam && hk.dangHoatDong);
                        const first = activeInYear ?? hocKis.find(hk => computeNamHoc(hk.ngayBatDau) === nam);
                        if (first) setSelectedHocKiId(first.id);
                      }}
                      className="appearance-none pl-4 pr-10 py-2 border border-[#e5e7eb] rounded-lg bg-white text-[#0a2540] font-semibold text-sm focus:outline-none focus:ring-2 focus:ring-[#0a2540] cursor-pointer min-w-[110px] transition-colors hover:border-[#0a2540]"
                    >
                      {namHocList.map(nam => (
                        <option key={nam} value={nam}>{formatNamHoc(nam)}</option>
                      ))}
                    </select>
                    <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#6a7282] pointer-events-none" />
                  </div>
                </div>

                {/* Chọn kỳ trong năm */}
                {selectedNam !== null && hocKisTrongNam.length > 0 && (
                  <div>
                    <p className="text-xs font-semibold text-[#6a7282] uppercase tracking-wide mb-2">
                      Học kỳ
                    </p>
                    <div className="flex flex-wrap gap-3">
                      {hocKisTrongNam.map(hk => {
                        const type = getSemesterType(hk.ngayBatDau);
                        const isSelected = selectedHocKiId === hk.id;
                        const isHe = type === 'hkhe';
                        const semLabel = type === 'hk1' ? 'Học kỳ 1' : type === 'hk2' ? 'Học kỳ 2' : 'Học kỳ hè';
                        const displayName = `${semLabel} năm ${formatNamHoc(computeNamHoc(hk.ngayBatDau))}`;
                        return (
                          <button
                            key={hk.id}
                            onClick={() => setSelectedHocKiId(hk.id)}
                            className={`relative flex flex-col items-start px-4 py-3 rounded-[10px] border-2 transition-all min-w-[190px] ${
                              isSelected
                                ? 'border-[#0a2540] bg-[#0a2540]/5'
                                : 'border-[#e5e7eb] bg-white hover:border-[#0a2540]/40'
                            }`}
                          >
                            {hk.dangHoatDong && (
                              <span className="absolute top-2 right-2 flex items-center gap-1 text-xs font-semibold text-green-600 bg-green-50 px-1.5 py-0.5 rounded-full">
                                <span className="w-1.5 h-1.5 rounded-full bg-green-500 inline-block" />
                                Đang mở
                              </span>
                            )}

                            {/* Type badge + TC limit */}
                            <div className="flex items-center gap-2 mb-2">
                              <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${
                                isHe
                                  ? 'bg-orange-100 text-orange-600'
                                  : 'bg-blue-100 text-blue-600'
                              }`}>
                                {type === 'hk1' ? 'Kỳ 1' : type === 'hk2' ? 'Kỳ 2' : 'Kỳ hè'}
                              </span>
                              <span className={`text-xs font-medium px-1.5 py-0.5 rounded ${
                                isHe ? 'bg-orange-50 text-orange-500' : 'bg-gray-100 text-[#6a7282]'
                              }`}>
                                {hk.maxTinChi} TC
                              </span>
                            </div>

                            <span className={`text-sm font-bold ${isSelected ? 'text-[#0a2540]' : 'text-[#374151]'}`}>
                              {displayName}
                            </span>
                            <span className="text-xs text-[#6a7282] mt-1">
                              {formatMonthRange(hk.ngayBatDau, hk.ngayKetThuc)}
                            </span>
                          </button>
                        );
                      })}
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Hiển thị học kỳ đang chọn */}
          {selectedHocKi && (
            <div className="flex items-center gap-2 mb-4 text-sm text-[#6a7282]">
              <ChevronDown className="w-4 h-4" />
              Đang xem:
              {(() => {
                const t = getSemesterType(selectedHocKi.ngayBatDau);
                const lbl = t === 'hk1' ? 'Học kỳ 1' : t === 'hk2' ? 'Học kỳ 2' : 'Học kỳ hè';
                return (
                  <>
                    <span className="font-semibold text-[#0a2540]">
                      {lbl} năm {formatNamHoc(computeNamHoc(selectedHocKi.ngayBatDau))}
                    </span>
                    <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${
                      t === 'hkhe' ? 'bg-orange-100 text-orange-600' : 'bg-blue-100 text-blue-600'
                    }`}>
                      {t === 'hk1' ? 'Kỳ 1' : t === 'hk2' ? 'Kỳ 2' : 'Kỳ hè'}
                    </span>
                  </>
                );
              })()}
              <span className="text-xs">
                {formatMonthRange(selectedHocKi.ngayBatDau, selectedHocKi.ngayKetThuc)}
              </span>
            </div>
          )}

          {/* Action feedback */}
          {(actionSuccess || actionError) && (
            <div className={`mb-4 flex items-center gap-3 rounded-[10px] border p-4 ${
              actionSuccess
                ? 'bg-green-50 border-green-200 text-green-800'
                : 'bg-red-50 border-red-200 text-red-800'
            }`}>
              {actionSuccess
                ? <CheckCircle className="w-5 h-5 flex-shrink-0" />
                : <AlertTriangle className="w-5 h-5 flex-shrink-0" />}
              <p className="text-sm font-medium">{actionSuccess || actionError}</p>
            </div>
          )}

          {/* Credit summary */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
            <div className="bg-white rounded-[14px] border border-[#e5e7eb] shadow-sm p-5 flex items-center gap-4">
              <div className="p-3 bg-blue-100 rounded-lg">
                <BookOpen className="w-6 h-6 text-blue-600" />
              </div>
              <div>
                <p className="text-sm text-[#6a7282]">Lớp đang mở</p>
                <p className="text-2xl font-bold text-[#0a2540]">{totalElements}</p>
              </div>
            </div>

            <div className="bg-white rounded-[14px] border border-[#e5e7eb] shadow-sm p-5 flex items-center gap-4">
              <div className="p-3 bg-green-100 rounded-lg">
                <BookCheck className="w-6 h-6 text-green-600" />
              </div>
              <div>
                <p className="text-sm text-[#6a7282]">Đã đăng ký (kỳ này)</p>
                <p className="text-2xl font-bold text-[#0a2540]">{semesterRegistrations.length} lớp</p>
              </div>
            </div>

            <div className={`bg-white rounded-[14px] border shadow-sm p-5 flex items-center gap-4 ${
              totalRegisteredCredits > maxTinChi ? 'border-red-300' : 'border-[#e5e7eb]'
            }`}>
              <div className={`p-3 rounded-lg ${
                totalRegisteredCredits > maxTinChi * 0.8 ? 'bg-yellow-100' : 'bg-purple-100'
              }`}>
                <Award className={`w-6 h-6 ${
                  totalRegisteredCredits > maxTinChi * 0.8 ? 'text-yellow-600' : 'text-purple-600'
                }`} />
              </div>
              <div>
                <p className="text-sm text-[#6a7282]">Tín chỉ đã đăng ký (kỳ này)</p>
                <p className="text-2xl font-bold text-[#0a2540]">
                  {totalRegisteredCredits}
                  <span className="text-sm font-normal text-[#6a7282]">/{maxTinChi}</span>
                </p>
              </div>
            </div>
          </div>

          {/* Credit progress */}
          <div className="bg-white rounded-[14px] border border-[#e5e7eb] shadow-sm p-5 mb-6">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-semibold text-[#0a2540]">Tiến độ tín chỉ (kỳ này)</span>
              <span className="text-sm text-[#6a7282]">
                {totalRegisteredCredits}/{maxTinChi} TC ({((totalRegisteredCredits / maxTinChi) * 100).toFixed(0)}%)
              </span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2.5">
              <div
                className={`h-2.5 rounded-full transition-all ${
                  totalRegisteredCredits > maxTinChi
                    ? 'bg-red-600'
                    : totalRegisteredCredits > maxTinChi * 0.8
                    ? 'bg-yellow-500'
                    : 'bg-green-500'
                }`}
                style={{ width: `${Math.min((totalRegisteredCredits / maxTinChi) * 100, 100)}%` }}
              />
            </div>
          </div>

          {/* Tabs */}
          <div className="flex border-b border-[#e5e7eb] mb-6">
            <button
              onClick={() => setActiveTab('browse')}
              className={`px-6 py-3 text-sm font-semibold border-b-2 transition-colors ${
                activeTab === 'browse'
                  ? 'border-[#0a2540] text-[#0a2540]'
                  : 'border-transparent text-[#6a7282] hover:text-[#0a2540]'
              }`}
            >
              Lớp học phần mở đăng ký
            </button>
            <button
              onClick={() => setActiveTab('registered')}
              className={`px-6 py-3 text-sm font-semibold border-b-2 transition-colors flex items-center gap-2 ${
                activeTab === 'registered'
                  ? 'border-[#0a2540] text-[#0a2540]'
                  : 'border-transparent text-[#6a7282] hover:text-[#0a2540]'
              }`}
            >
              Đã đăng ký
              {semesterRegistrations.length > 0 && (
                <span className="bg-[#0a2540] text-white text-xs rounded-full px-2 py-0.5">
                  {semesterRegistrations.length}
                </span>
              )}
            </button>
          </div>

          {/* Tab: Browse */}
          {activeTab === 'browse' && (
            <div>
              {!selectedHocKiId ? (
                <div className="bg-white rounded-[14px] border border-[#e5e7eb] shadow-sm p-12 text-center">
                  <Calendar className="w-12 h-12 text-[#9ca3af] mx-auto mb-3" />
                  <p className="text-[#6a7282] font-medium">Vui lòng chọn học kỳ để xem lớp học phần</p>
                </div>
              ) : (
                <>
                  {/* Search */}
                  <div className="bg-white rounded-[14px] border border-[#e5e7eb] shadow-sm p-5 mb-5">
                    <div className="flex gap-4 items-center">
                      <div className="flex-1 relative">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-[#6a7282]" />
                        <input
                          type="text"
                          placeholder="Tìm theo mã lớp, tên môn học..."
                          value={keyword}
                          onChange={e => setKeyword(e.target.value)}
                          className="w-full pl-10 pr-4 py-2.5 border border-[#e5e7eb] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#0a2540] transition-colors"
                        />
                      </div>
                      <button
                        onClick={() => fetchLopHocPhans()}
                        className="p-2.5 border border-[#e5e7eb] rounded-lg hover:bg-[#f9fafb] transition-colors"
                        title="Làm mới"
                      >
                        <RefreshCw className="w-5 h-5 text-[#6a7282]" />
                      </button>
                    </div>
                    <p className="mt-3 text-sm text-[#6a7282]">
                      Tìm thấy <span className="font-semibold text-[#0a2540]">{totalElements}</span> lớp học phần
                    </p>
                  </div>

                  {/* Table */}
                  <div className="bg-white rounded-[14px] border border-[#e5e7eb] shadow-sm overflow-hidden">
                    {browseError && (
                      <div className="p-6 text-center text-red-600">
                        <AlertTriangle className="w-8 h-8 mx-auto mb-2" />
                        <p>{browseError}</p>
                      </div>
                    )}

                    {browseLoading ? (
                      <div className="p-12 flex items-center justify-center">
                        <Loader2 className="w-8 h-8 text-[#0a2540] animate-spin" />
                      </div>
                    ) : (
                      <>
                        <div className="overflow-x-auto">
                          <table className="w-full">
                            <thead className="bg-[#f9fafb] border-b border-[#e5e7eb]">
                              <tr>
                                <th className="px-5 py-4 text-left text-sm font-semibold text-[#0a2540]">Mã lớp HP</th>
                                <th className="px-5 py-4 text-left text-sm font-semibold text-[#0a2540]">Mã môn</th>
                                <th className="px-5 py-4 text-left text-sm font-semibold text-[#0a2540]">Tên môn học</th>
                                <th className="px-5 py-4 text-center text-sm font-semibold text-[#0a2540]">TC</th>
                                <th className="px-5 py-4 text-center text-sm font-semibold text-[#0a2540]">Sĩ số</th>
                                <th className="px-5 py-4 text-left text-sm font-semibold text-[#0a2540]">Hạn đăng ký</th>
                                <th className="px-5 py-4 text-center text-sm font-semibold text-[#0a2540]">Lịch học</th>
                                <th className="px-5 py-4 text-center text-sm font-semibold text-[#0a2540]">Thao tác</th>
                              </tr>
                            </thead>
                            <tbody className="divide-y divide-[#e5e7eb]">
                              {lopHocPhans.length === 0 ? (
                                <tr>
                                  <td colSpan={8} className="px-5 py-12 text-center">
                                    <BookOpen className="w-10 h-10 text-[#9ca3af] mx-auto mb-2" />
                                    <p className="text-[#6a7282]">Không có lớp học phần nào đang mở đăng ký trong kỳ này</p>
                                  </td>
                                </tr>
                              ) : (
                                lopHocPhans.map(lhp => {
                                  const isFull = lhp.soLuongHienTai >= lhp.soLuongToiDa;
                                  const alreadyRegistered = registeredIds.has(lhp.id);
                                  const hetHan = lhp.hanDangKy ? new Date() > parseHanDangKy(lhp.hanDangKy) : true;
                                  const wouldExceed = totalRegisteredCredits + lhp.soTinChi > maxTinChi;
                                  const isRegistering = registeringId === lhp.id;
                                  const disabled = isFull || alreadyRegistered || wouldExceed || hetHan || !!registeringId;

                                  return (
                                    <tr key={lhp.id} className={`hover:bg-[#f9fafb] transition-colors ${alreadyRegistered ? 'bg-green-50' : hetHan ? 'opacity-60' : ''}`}>
                                      <td className="px-5 py-4">
                                        <span className="font-mono text-sm font-semibold text-[#0a2540]">
                                          {lhp.maLopHocPhan}
                                        </span>
                                        {alreadyRegistered && (
                                          <span className="ml-2 text-xs bg-green-100 text-green-700 px-1.5 py-0.5 rounded">
                                            Đã đăng ký
                                          </span>
                                        )}
                                      </td>
                                      <td className="px-5 py-4">
                                        <span className="font-mono text-sm text-[#0a2540]">{lhp.maMonHoc}</span>
                                      </td>
                                      <td className="px-5 py-4">
                                        <p className="font-medium text-[#0a2540]">{lhp.tenMonHoc}</p>
                                        {wouldExceed && !alreadyRegistered && !hetHan && (
                                          <p className="text-xs text-orange-600 mt-0.5">Vượt giới hạn tín chỉ</p>
                                        )}
                                      </td>
                                      <td className="px-5 py-4 text-center">
                                        <span className="inline-flex items-center justify-center w-8 h-8 bg-purple-100 text-purple-700 rounded-full font-semibold text-sm">
                                          {lhp.soTinChi}
                                        </span>
                                      </td>
                                      <td className="px-5 py-4 text-center">
                                        <span className={`text-sm font-semibold ${isFull ? 'text-red-600' : 'text-[#0a2540]'}`}>
                                          {lhp.soLuongHienTai}/{lhp.soLuongToiDa}
                                        </span>
                                        {isFull && (
                                          <p className="text-xs text-red-500">Đã đủ</p>
                                        )}
                                      </td>
                                      <td className="px-5 py-4">
                                        <p className="text-sm text-[#0a2540]">{lhp.hanDangKy}</p>
                                        {hetHan && (
                                          <span className="text-xs text-red-500 font-medium">Hết hạn đăng ký</span>
                                        )}
                                      </td>
                                      <td className="px-5 py-4 text-center">
                                        <button
                                          onClick={() => openScheduleModal(lhp.id, lhp.maLopHocPhan)}
                                          className="p-2 rounded-lg border border-[#e5e7eb] hover:bg-blue-50 hover:border-blue-300 transition-colors mx-auto flex items-center gap-1 text-xs text-[#6a7282] hover:text-blue-600"
                                          title="Xem lịch học"
                                        >
                                          <Clock className="w-4 h-4" />
                                          Xem
                                        </button>
                                      </td>
                                      <td className="px-5 py-4 text-center">
                                        {alreadyRegistered ? (
                                          <CheckCircle className="w-5 h-5 text-green-600 mx-auto" />
                                        ) : hetHan ? (
                                          <span className="text-xs text-[#9ca3af]">Đã đóng</span>
                                        ) : (
                                          <button
                                            onClick={() => handleRegister(lhp.id)}
                                            disabled={disabled}
                                            className={`px-4 py-1.5 rounded-lg text-sm font-semibold transition-colors flex items-center gap-1.5 mx-auto ${
                                              disabled
                                                ? 'bg-[#e5e7eb] text-[#9ca3af] cursor-not-allowed'
                                                : 'bg-[#0a2540] text-white hover:bg-[#0d2f52]'
                                            }`}
                                          >
                                            {isRegistering && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
                                            Đăng ký
                                          </button>
                                        )}
                                      </td>
                                    </tr>
                                  );
                                })
                              )}
                            </tbody>
                          </table>
                        </div>

                        {/* Pagination */}
                        {totalPages > 1 && (
                          <div className="px-5 py-4 border-t border-[#e5e7eb] flex items-center justify-between">
                            <p className="text-sm text-[#6a7282]">
                              Trang {page + 1} / {totalPages}
                            </p>
                            <div className="flex gap-2">
                              <button
                                onClick={() => setPage(p => Math.max(0, p - 1))}
                                disabled={page === 0}
                                className="p-2 rounded-lg border border-[#e5e7eb] hover:bg-[#f9fafb] disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
                              >
                                <ChevronLeft className="w-4 h-4" />
                              </button>
                              <button
                                onClick={() => setPage(p => Math.min(totalPages - 1, p + 1))}
                                disabled={page >= totalPages - 1}
                                className="p-2 rounded-lg border border-[#e5e7eb] hover:bg-[#f9fafb] disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
                              >
                                <ChevronRight className="w-4 h-4" />
                              </button>
                            </div>
                          </div>
                        )}
                      </>
                    )}
                  </div>
                </>
              )}
            </div>
          )}

          {/* Tab: Registered */}
          {activeTab === 'registered' && (
            <div className="space-y-4">
              {regError && (
                <div className="p-6 text-center text-red-600 bg-white rounded-[14px] border border-[#e5e7eb]">
                  <AlertTriangle className="w-8 h-8 mx-auto mb-2" />
                  <p>{regError}</p>
                </div>
              )}

              {regLoading ? (
                <div className="bg-white rounded-[14px] border border-[#e5e7eb] shadow-sm p-12 flex items-center justify-center">
                  <Loader2 className="w-8 h-8 text-[#0a2540] animate-spin" />
                </div>
              ) : (
                <>
                  {/* Đăng ký kỳ đang chọn */}
                  <div className="bg-white rounded-[14px] border border-[#e5e7eb] shadow-sm overflow-hidden">
                    {/* Sub-header */}
                    <div className="px-5 py-4 border-b border-[#e5e7eb] flex items-center justify-between bg-[#f9fafb]">
                      <div className="flex items-center gap-2">
                        <BookCheck className="w-4 h-4 text-[#0a2540]" />
                        <span className="font-semibold text-[#0a2540] text-sm">
                          {selectedHocKi ? (() => {
                            const t = getSemesterType(selectedHocKi.ngayBatDau);
                            const lbl = t === 'hk1' ? 'Học kỳ 1' : t === 'hk2' ? 'Học kỳ 2' : 'Học kỳ hè';
                            return `${lbl} năm ${formatNamHoc(computeNamHoc(selectedHocKi.ngayBatDau))}`;
                          })() : 'Học kỳ đang chọn'}
                        </span>
                      </div>
                      <div className="flex items-center gap-3 text-sm text-[#6a7282]">
                        <span>{semesterRegistrations.length} lớp</span>
                        <span className={`font-semibold px-2 py-0.5 rounded-full text-xs ${
                          totalRegisteredCredits >= maxTinChi
                            ? 'bg-red-100 text-red-700'
                            : totalRegisteredCredits >= maxTinChi * 0.8
                            ? 'bg-yellow-100 text-yellow-700'
                            : 'bg-green-100 text-green-700'
                        }`}>
                          {totalRegisteredCredits}/{maxTinChi} TC
                        </span>
                      </div>
                    </div>

                    {semesterRegistrations.length === 0 ? (
                      <div className="p-10 text-center">
                        <BookCheck className="w-10 h-10 text-[#9ca3af] mx-auto mb-3" />
                        <p className="text-[#6a7282] text-sm">Chưa đăng ký lớp học phần nào trong kỳ này</p>
                        <button
                          onClick={() => setActiveTab('browse')}
                          className="mt-3 px-4 py-2 bg-[#0a2540] text-white rounded-lg text-sm font-semibold hover:bg-[#0d2f52] transition-colors"
                        >
                          Xem lớp đang mở
                        </button>
                      </div>
                    ) : (
                      <div className="overflow-x-auto">
                        <table className="w-full">
                          <thead className="bg-[#f9fafb] border-b border-[#e5e7eb]">
                            <tr>
                              <th className="px-5 py-3 text-left text-xs font-semibold text-[#6a7282] uppercase tracking-wide">Mã lớp HP</th>
                              <th className="px-5 py-3 text-left text-xs font-semibold text-[#6a7282] uppercase tracking-wide">Mã môn</th>
                              <th className="px-5 py-3 text-center text-xs font-semibold text-[#6a7282] uppercase tracking-wide">TC</th>
                              <th className="px-5 py-3 text-left text-xs font-semibold text-[#6a7282] uppercase tracking-wide">Ngày đăng ký</th>
                              <th className="px-5 py-3 text-center text-xs font-semibold text-[#6a7282] uppercase tracking-wide">Thao tác</th>
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-[#e5e7eb]">
                            {semesterRegistrations.map(reg => {
                              const isCanceling = cancelingId === reg.id;
                              return (
                                <tr key={reg.id} className="hover:bg-[#f9fafb] transition-colors">
                                  <td className="px-5 py-4">
                                    <span className="font-mono text-sm font-semibold text-[#0a2540]">
                                      {reg.maLopHocPhan}
                                    </span>
                                  </td>
                                  <td className="px-5 py-4">
                                    <span className="font-mono text-sm text-[#0a2540]">{reg.maMonHoc}</span>
                                  </td>
                                  <td className="px-5 py-4 text-center">
                                    <span className="inline-flex items-center justify-center w-8 h-8 bg-purple-100 text-purple-700 rounded-full font-semibold text-sm">
                                      {reg.soTinChi}
                                    </span>
                                  </td>
                                  <td className="px-5 py-4">
                                    <p className="text-sm text-[#0a2540]">{reg.createdAt}</p>
                                  </td>
                                  <td className="px-5 py-4 text-center">
                                    <button
                                      onClick={() => handleCancel(reg.id)}
                                      disabled={isCanceling || !!cancelingId}
                                      className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-1.5 mx-auto text-sm font-medium"
                                    >
                                      {isCanceling
                                        ? <Loader2 className="w-4 h-4 animate-spin" />
                                        : <Trash2 className="w-4 h-4" />}
                                      Hủy
                                    </button>
                                  </td>
                                </tr>
                              );
                            })}
                          </tbody>
                          <tfoot className="bg-[#f9fafb] border-t-2 border-[#e5e7eb]">
                            <tr>
                              <td colSpan={2} className="px-5 py-3 text-sm font-semibold text-[#0a2540]">
                                Tổng kỳ này
                              </td>
                              <td className="px-5 py-3 text-center">
                                <span className="inline-flex items-center justify-center w-8 h-8 bg-[#0a2540] text-white rounded-full font-bold text-sm">
                                  {totalRegisteredCredits}
                                </span>
                              </td>
                              <td colSpan={2} className="px-5 py-3 text-sm text-[#6a7282]">
                                / {maxTinChi} tín chỉ tối đa
                              </td>
                            </tr>
                          </tfoot>
                        </table>
                      </div>
                    )}
                  </div>

                  {/* Tóm tắt tất cả kỳ */}
                  {myRegistrations.length > 0 && (
                    <div className="bg-white rounded-[14px] border border-[#e5e7eb] shadow-sm p-4">
                      <p className="text-xs font-semibold text-[#6a7282] uppercase tracking-wide mb-3">
                        Tổng tất cả học kỳ
                      </p>
                      <div className="flex flex-wrap gap-3">
                        {namHocList.map(nam => {
                          const kyTrongNam = hocKis.filter(hk => computeNamHoc(hk.ngayBatDau) === nam);
                          return kyTrongNam.map(hk => {
                            const regsInKy = myRegistrations.filter(r => r.hocKiId === hk.id);
                            if (regsInKy.length === 0) return null;
                            const tc = regsInKy.reduce((s, r) => s + r.soTinChi, 0);
                            const t = getSemesterType(hk.ngayBatDau);
                            const lbl = t === 'hk1' ? 'Kỳ 1' : t === 'hk2' ? 'Kỳ 2' : 'Kỳ hè';
                            const isActive = hk.id === selectedHocKiId;
                            return (
                              <button
                                key={hk.id}
                                onClick={() => { setSelectedHocKiId(hk.id); setSelectedNam(nam); }}
                                className={`flex items-center gap-2 px-3 py-2 rounded-lg border text-sm transition-colors ${
                                  isActive
                                    ? 'border-[#0a2540] bg-[#0a2540]/5 font-semibold'
                                    : 'border-[#e5e7eb] hover:border-[#0a2540]/40'
                                }`}
                              >
                                <span className="text-[#6a7282]">{lbl} {formatNamHoc(nam)}</span>
                                <span className="bg-purple-100 text-purple-700 text-xs font-bold px-1.5 py-0.5 rounded-full">
                                  {tc} TC
                                </span>
                                <span className="text-[#9ca3af] text-xs">{regsInKy.length} lớp</span>
                              </button>
                            );
                          });
                        })}
                      </div>
                      <p className="text-xs text-[#9ca3af] mt-2">
                        Tổng cộng {myRegistrations.length} lớp · {myRegistrations.reduce((s, r) => s + r.soTinChi, 0)} tín chỉ toàn khóa
                      </p>
                    </div>
                  )}
                </>
              )}
            </div>
          )}
        </main>
      </div>

      {/* ── Schedule Modal ───────────────────────────────────────────────── */}
      {scheduleModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40">
          <div className="bg-white rounded-[16px] shadow-xl w-full max-w-lg max-h-[80vh] flex flex-col">
            {/* Header */}
            <div className="flex items-center justify-between px-6 py-4 border-b border-[#e5e7eb]">
              <div className="flex items-center gap-2">
                <Clock className="w-5 h-5 text-[#0a2540]" />
                <span className="font-bold text-[#0a2540]">Lịch học — {scheduleModal.ma}</span>
              </div>
              <button
                onClick={() => setScheduleModal(null)}
                className="p-1.5 rounded-lg hover:bg-[#f9fafb] transition-colors"
              >
                <X className="w-5 h-5 text-[#6a7282]" />
              </button>
            </div>

            {/* Body */}
            <div className="flex-1 overflow-y-auto px-6 py-4">
              {scheduleLoading ? (
                <div className="flex items-center justify-center py-10">
                  <Loader2 className="w-7 h-7 animate-spin text-[#0a2540]" />
                </div>
              ) : scheduleItems.length === 0 ? (
                <div className="py-10 text-center text-[#6a7282]">
                  <Calendar className="w-10 h-10 mx-auto mb-2 text-[#9ca3af]" />
                  <p className="text-sm">Chưa có lịch học cho lớp này.</p>
                </div>
              ) : (
                <table className="w-full text-sm">
                  <thead>
                    <tr className="bg-[#f9fafb] border-b border-[#e5e7eb]">
                      <th className="px-3 py-2 text-left font-semibold text-[#0a2540]">Thứ</th>
                      <th className="px-3 py-2 text-left font-semibold text-[#0a2540]">Ca học</th>
                      <th className="px-3 py-2 text-left font-semibold text-[#0a2540]">Giờ</th>
                      <th className="px-3 py-2 text-left font-semibold text-[#0a2540]">Phòng</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#e5e7eb]">
                    {scheduleItems.map((item, idx) => (
                      <tr key={idx} className="hover:bg-[#f9fafb]">
                        <td className="px-3 py-2.5">
                          <span className="font-semibold text-[#0a2540]">{item.thu}</span>
                        </td>
                        <td className="px-3 py-2.5 text-[#374151]">{item.tenGioHoc}</td>
                        <td className="px-3 py-2.5">
                          <span className="font-mono text-[#0a2540]">
                            {item.thoiGianBatDau} – {item.thoiGianKetThuc}
                          </span>
                        </td>
                        <td className="px-3 py-2.5">
                          <span className="text-[#374151]">{item.maPhong}</span>
                          {item.tenPhong && (
                            <span className="text-xs text-[#6a7282] ml-1">({item.tenPhong})</span>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>

            <div className="px-6 py-3 border-t border-[#e5e7eb] flex justify-end">
              <button
                onClick={() => setScheduleModal(null)}
                className="px-4 py-2 bg-[#0a2540] text-white rounded-lg text-sm font-semibold hover:bg-[#0d2f52] transition-colors"
              >
                Đóng
              </button>
            </div>
          </div>
        </div>
      )}

      <AIAssistantButton />
    </div>
  );
}
