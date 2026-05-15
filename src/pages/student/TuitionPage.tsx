import { useCallback, useEffect, useState } from 'react';
import { useNavigate } from 'react-router';
import { useAuth } from '@/hooks';
import { apiClient } from '@/api/common';
import { StudentSidebar } from '@/components/layouts/StudentSidebar';
import { StudentHeader } from '@/components/layouts/StudentHeader';
import { AIAssistantButton } from '@/components/chatbot/AIAssistantButton';
import {
  DollarSign,
  CreditCard,
  CheckCircle,
  AlertCircle,
  Clock,
  Download,
  Receipt,
  X,
  Wallet,
  FileText,
  Loader2,
  RefreshCw,
} from 'lucide-react';

// ── Types ─────────────────────────────────────────────────────────────────────

type TrangThai = 'CHUA_THANH_TOAN' | 'DA_THANH_TOAN' | 'QUA_HAN';

interface HocPhiItem {
  hocPhiId: string;
  hocKiId: string;
  maHocKi: string;
  tenHocKi: string;
  soTien: number;
  soTinChi: number;
  trangThai: TrangThai;
  ngayThanhToan: string | null;
  fileChungTu: string | null;
  phuongThucThanhToan: string | null;
  daThanhToan: boolean;
  taiLieuTaiVe: string;
}

interface TongQuanResponse {
  tongCanThanhToan: number;
  tongDaThanhToan: number;
  tongQuaHan: number;
  danhSachHocPhi: HocPhiItem[];
}

interface PhuongThuc {
  maPhuongThuc: string;
  tenPhuongThuc: string;
  moTa: string;
}

interface PayResponse {
  hocPhiId: string;
  thanhToanId: string | null;
  trangThaiGiaoDich: string;
  thongDiep: string;
  phuongThucThanhToan: string;
  ngayThanhToan: string | null;
  fileChungTu: string | null;
  taiBienLaiUrl: string | null;
}

type StatusFilter = 'all' | 'CHUA_THANH_TOAN' | 'DA_THANH_TOAN' | 'QUA_HAN';

// ── Helpers ───────────────────────────────────────────────────────────────────

const formatCurrency = (amount: number) =>
  new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(amount);

const formatDateTime = (dt: string | null) => {
  if (!dt) return '—';
  return new Date(dt).toLocaleDateString('vi-VN', {
    day: '2-digit', month: '2-digit', year: 'numeric',
    hour: '2-digit', minute: '2-digit',
  });
};

const statusMeta: Record<TrangThai, { text: string; color: string; icon: typeof CheckCircle }> = {
  DA_THANH_TOAN:    { text: 'Đã thanh toán',   color: 'bg-green-100 text-green-700',  icon: CheckCircle },
  CHUA_THANH_TOAN:  { text: 'Chưa thanh toán', color: 'bg-gray-100 text-gray-700',    icon: AlertCircle },
  QUA_HAN:          { text: 'Quá hạn',          color: 'bg-red-100 text-red-700',      icon: AlertCircle },
};

// ── Component ─────────────────────────────────────────────────────────────────

export default function TuitionPage() {
  const navigate = useNavigate();
  const { user: authUser, isAuthenticated } = useAuth();

  const [data, setData] = useState<TongQuanResponse | null>(null);
  const [methods, setMethods] = useState<PhuongThuc[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const [statusFilter, setStatusFilter] = useState<StatusFilter>('all');
  const [selectedItem, setSelectedItem] = useState<HocPhiItem | null>(null);
  const [selectedMethod, setSelectedMethod] = useState('');
  const [paying, setPaying] = useState(false);
  const [payError, setPayError] = useState('');

  useEffect(() => {
    if (!isAuthenticated || !authUser) { navigate('/'); return; }
    if (authUser.role !== 'student') { navigate('/'); return; }
  }, [isAuthenticated, authUser, navigate]);

  const fetchData = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const [summaryRes, methodsRes] = await Promise.all([
        apiClient.get<TongQuanResponse>('/student/hoc-phi/summary'),
        apiClient.get<PhuongThuc[]>('/student/hoc-phi/methods'),
      ]);
      setData(summaryRes.data);
      setMethods(methodsRes.data);
      if (methodsRes.data.length > 0) setSelectedMethod(methodsRes.data[0].maPhuongThuc);
    } catch {
      setError('Không thể tải dữ liệu học phí. Vui lòng thử lại.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchData(); }, [fetchData]);

  const filteredList = (data?.danhSachHocPhi ?? []).filter(
    item => statusFilter === 'all' || item.trangThai === statusFilter
  );

  const handlePay = async () => {
    if (!selectedItem || !selectedMethod) return;
    setPaying(true);
    setPayError('');
    try {
      const res = await apiClient.post<PayResponse>('/student/hoc-phi/pay', {
        hocPhiId: selectedItem.hocPhiId,
        phuongThucThanhToan: selectedMethod,
        idempotencyKey: crypto.randomUUID(),
      });
      if (res.data.trangThaiGiaoDich !== 'THANH_CONG') {
        setPayError(res.data.thongDiep || 'Thanh toán thất bại. Vui lòng thử lại.');
        return;
      }
      setSelectedItem(null);
      await fetchData();
    } catch (err: unknown) {
      // BE dùng ProblemDetail (RFC 7807) → field lỗi là "detail", không phải "message"
      const msg = (err as { response?: { data?: { detail?: string } } })?.response?.data?.detail;
      setPayError(msg || 'Thanh toán thất bại. Vui lòng thử lại.');
    } finally {
      setPaying(false);
    }
  };

  const handleDownload = async (item: HocPhiItem) => {
    try {
      // BE trả về path có tiền tố /api, nhưng apiClient.baseURL đã là .../api → cắt bỏ
      const path = item.taiLieuTaiVe.startsWith('/api')
        ? item.taiLieuTaiVe.slice(4)
        : item.taiLieuTaiVe;
      const res = await apiClient.get(path, { responseType: 'blob' });
      const url = URL.createObjectURL(res.data as Blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = item.daThanhToan
        ? `bien-lai-${item.maHocKi}.txt`
        : `hoa-don-${item.maHocKi}.txt`;
      a.click();
      URL.revokeObjectURL(url);
    } catch {
      alert('Không thể tải tài liệu. Vui lòng thử lại.');
    }
  };

  if (!authUser) return null;
  const userName = authUser.fullName || authUser.username || '';

  return (
    <div className="flex h-screen bg-[#f1f5f9]">
      <StudentSidebar />

      <div className="flex-1 ml-64 flex flex-col">
        <StudentHeader userName={userName} />

        <main className="flex-1 overflow-y-auto p-8">
          <div className="mb-6 flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-[#0a2540]">Học phí</h1>
              <p className="text-[#6a7282] mt-1">Quản lý và thanh toán học phí</p>
            </div>
            <button
              onClick={fetchData}
              className="p-2 text-[#6a7282] hover:text-[#0a2540] hover:bg-white rounded-lg transition-colors"
              title="Làm mới"
            >
              <RefreshCw className="w-5 h-5" />
            </button>
          </div>

          {loading ? (
            <div className="flex items-center justify-center py-32">
              <Loader2 className="w-10 h-10 animate-spin text-[#0a2540]" />
            </div>
          ) : error ? (
            <div className="flex flex-col items-center justify-center py-24 gap-3">
              <AlertCircle className="w-10 h-10 text-red-500" />
              <p className="text-red-600 font-medium">{error}</p>
              <button
                onClick={fetchData}
                className="px-5 py-2 bg-[#0a2540] text-white rounded-lg text-sm font-semibold hover:bg-[#0d2f52]"
              >
                Thử lại
              </button>
            </div>
          ) : (
            <>
              {/* Summary banner */}
              <div className="bg-gradient-to-br from-blue-600 via-blue-700 to-purple-700 rounded-[14px] shadow-xl p-8 mb-6 text-white">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                  <div>
                    <div className="flex items-center gap-2 mb-2">
                      <Receipt className="w-5 h-5 text-blue-200" />
                      <p className="text-blue-100 text-sm font-medium">Cần thanh toán</p>
                    </div>
                    <p className="text-4xl font-bold">{formatCurrency(data?.tongCanThanhToan ?? 0)}</p>
                  </div>
                  <div>
                    <div className="flex items-center gap-2 mb-2">
                      <CheckCircle className="w-5 h-5 text-green-300" />
                      <p className="text-blue-100 text-sm font-medium">Đã thanh toán</p>
                    </div>
                    <p className="text-4xl font-bold text-green-300">{formatCurrency(data?.tongDaThanhToan ?? 0)}</p>
                  </div>
                  <div>
                    <div className="flex items-center gap-2 mb-2">
                      <AlertCircle className="w-5 h-5 text-red-300" />
                      <p className="text-blue-100 text-sm font-medium">Quá hạn</p>
                    </div>
                    <p className="text-4xl font-bold text-red-300">{formatCurrency(data?.tongQuaHan ?? 0)}</p>
                  </div>
                </div>

                <div className="mt-6 pt-6 border-t border-white/20 flex items-center gap-4">
                  <div className="flex items-center gap-2">
                    <FileText className="w-4 h-4 text-blue-200" />
                    <span className="text-sm text-blue-100">
                      {data?.danhSachHocPhi.length ?? 0} kỳ học
                    </span>
                  </div>
                  {(data?.tongQuaHan ?? 0) > 0 && (
                    <div className="px-4 py-2 bg-red-500 rounded-lg flex items-center gap-2">
                      <AlertCircle className="w-4 h-4" />
                      <span className="font-semibold text-sm">Có khoản học phí quá hạn!</span>
                    </div>
                  )}
                </div>
              </div>

              {/* Stats */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
                <div className="bg-white rounded-[14px] border border-[#e5e7eb] shadow-sm p-6 flex items-center gap-4">
                  <div className="p-3 bg-green-100 rounded-lg">
                    <CheckCircle className="w-6 h-6 text-green-600" />
                  </div>
                  <div>
                    <p className="text-sm text-[#6a7282]">Đã hoàn tất</p>
                    <p className="text-xl font-bold text-[#0a2540]">
                      {data?.danhSachHocPhi.filter(r => r.trangThai === 'DA_THANH_TOAN').length ?? 0} kỳ
                    </p>
                  </div>
                </div>
                <div className="bg-white rounded-[14px] border border-[#e5e7eb] shadow-sm p-6 flex items-center gap-4">
                  <div className="p-3 bg-yellow-100 rounded-lg">
                    <Clock className="w-6 h-6 text-yellow-600" />
                  </div>
                  <div>
                    <p className="text-sm text-[#6a7282]">Chờ thanh toán</p>
                    <p className="text-xl font-bold text-[#0a2540]">
                      {data?.danhSachHocPhi.filter(r => r.trangThai === 'CHUA_THANH_TOAN').length ?? 0} kỳ
                    </p>
                  </div>
                </div>
                <div className="bg-white rounded-[14px] border border-[#e5e7eb] shadow-sm p-6 flex items-center gap-4">
                  <div className="p-3 bg-red-100 rounded-lg">
                    <AlertCircle className="w-6 h-6 text-red-600" />
                  </div>
                  <div>
                    <p className="text-sm text-[#6a7282]">Quá hạn</p>
                    <p className="text-xl font-bold text-[#0a2540]">
                      {data?.danhSachHocPhi.filter(r => r.trangThai === 'QUA_HAN').length ?? 0} kỳ
                    </p>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Records list */}
                <div className="lg:col-span-2">
                  <div className="bg-white rounded-[14px] border border-[#e5e7eb] shadow-sm overflow-hidden">
                    <div className="p-6 border-b border-[#e5e7eb] flex items-center justify-between">
                      <h3 className="text-lg font-bold text-[#0a2540] flex items-center gap-2">
                        <Receipt className="w-5 h-5 text-blue-600" />
                        Chi tiết học phí
                      </h3>
                      <select
                        value={statusFilter}
                        onChange={e => setStatusFilter(e.target.value as StatusFilter)}
                        className="px-4 py-2 border border-[#e5e7eb] rounded-lg text-sm font-medium bg-white focus:outline-none focus:ring-2 focus:ring-[#0a2540]"
                      >
                        <option value="all">Tất cả</option>
                        <option value="DA_THANH_TOAN">Đã thanh toán</option>
                        <option value="CHUA_THANH_TOAN">Chưa thanh toán</option>
                        <option value="QUA_HAN">Quá hạn</option>
                      </select>
                    </div>

                    <div className="divide-y divide-[#e5e7eb]">
                      {filteredList.length === 0 ? (
                        <div className="p-12 text-center">
                          <FileText className="w-12 h-12 text-[#9ca3af] mx-auto mb-3" />
                          <p className="text-[#6a7282]">Không có dữ liệu</p>
                        </div>
                      ) : filteredList.map(item => {
                        const meta = statusMeta[item.trangThai];
                        const Icon = meta.icon;
                        return (
                          <div key={item.hocPhiId} className="p-6 hover:bg-[#f9fafb] transition-colors">
                            <div className="flex items-start justify-between mb-4">
                              <div className="flex-1">
                                <div className="flex items-center gap-3 mb-1">
                                  <h4 className="font-bold text-[#0a2540] text-lg">{item.tenHocKi}</h4>
                                  <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold ${meta.color}`}>
                                    <Icon className="w-3.5 h-3.5" />
                                    {meta.text}
                                  </span>
                                </div>
                                <p className="text-sm text-[#6a7282]">
                                  {item.soTinChi} tín chỉ · Mã: {item.maHocKi}
                                </p>
                              </div>
                              <p className="text-2xl font-bold text-[#0a2540]">{formatCurrency(item.soTien)}</p>
                            </div>

                            <div className="flex items-center justify-between pt-4 border-t border-[#e5e7eb]">
                              <div className="text-sm text-[#6a7282]">
                                {item.daThanhToan && item.ngayThanhToan ? (
                                  <span className="flex items-center gap-2 text-green-600">
                                    <CheckCircle className="w-4 h-4" />
                                    Thanh toán: {formatDateTime(item.ngayThanhToan)}
                                    {item.phuongThucThanhToan && (
                                      <span className="text-[#6a7282]">· {item.phuongThucThanhToan.replace('_', ' ')}</span>
                                    )}
                                  </span>
                                ) : (
                                  <span className="flex items-center gap-2 text-orange-600 font-semibold">
                                    <DollarSign className="w-4 h-4" />
                                    Còn nợ: {formatCurrency(item.soTien)}
                                  </span>
                                )}
                              </div>

                              <div className="flex gap-2">
                                <button
                                  onClick={() => handleDownload(item)}
                                  className="px-3 py-2 border border-[#e5e7eb] text-[#0a2540] rounded-lg hover:bg-[#f1f5f9] transition-colors text-sm flex items-center gap-1.5"
                                  title={item.daThanhToan ? 'Tải biên lai' : 'Tải hóa đơn'}
                                >
                                  <Download className="w-4 h-4" />
                                  {item.daThanhToan ? 'Biên lai' : 'Hóa đơn'}
                                </button>
                                {!item.daThanhToan && (
                                  <button
                                    onClick={() => { setSelectedItem(item); setPayError(''); }}
                                    className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm font-medium flex items-center gap-2"
                                  >
                                    <CreditCard className="w-4 h-4" />
                                    Thanh toán
                                  </button>
                                )}
                              </div>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                </div>

                {/* Payment history sidebar */}
                <div className="lg:col-span-1">
                  <div className="bg-white rounded-[14px] border border-[#e5e7eb] shadow-sm p-6 sticky top-8">
                    <h3 className="text-lg font-bold text-[#0a2540] mb-4 flex items-center gap-2">
                      <Clock className="w-5 h-5 text-green-600" />
                      Lịch sử thanh toán
                    </h3>

                    <div className="space-y-3 max-h-[600px] overflow-y-auto">
                      {(() => {
                        const paid = (data?.danhSachHocPhi ?? []).filter(i => i.daThanhToan);
                        if (paid.length === 0) return (
                          <div className="text-center py-10">
                            <Wallet className="w-12 h-12 text-[#9ca3af] mx-auto mb-3" />
                            <p className="text-sm text-[#6a7282]">Chưa có lịch sử thanh toán</p>
                          </div>
                        );
                        return paid.map(item => (
                          <div key={item.hocPhiId} className="bg-[#f9fafb] rounded-lg p-4 border border-[#e5e7eb]">
                            <div className="flex items-start justify-between mb-2">
                              <div>
                                <p className="font-semibold text-[#0a2540] text-sm">{item.tenHocKi}</p>
                                <p className="text-xs text-[#6a7282]">{formatDateTime(item.ngayThanhToan)}</p>
                              </div>
                              <p className="font-bold text-green-600 text-sm">{formatCurrency(item.soTien)}</p>
                            </div>
                            {item.phuongThucThanhToan && (
                              <p className="text-xs text-[#6a7282] mb-3">
                                <span className="font-medium">Phương thức:</span> {item.phuongThucThanhToan.replace('_', ' ')}
                              </p>
                            )}
                            <button
                              onClick={() => handleDownload(item)}
                              className="w-full px-3 py-2 bg-white border border-[#e5e7eb] rounded-lg hover:bg-[#f1f5f9] transition-colors text-sm font-medium text-[#0a2540] flex items-center justify-center gap-2"
                            >
                              <Download className="w-4 h-4" />
                              Tải biên lai
                            </button>
                          </div>
                        ));
                      })()}
                    </div>
                  </div>
                </div>
              </div>
            </>
          )}
        </main>
      </div>

      <AIAssistantButton />

      {/* Payment modal */}
      {selectedItem && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4" onClick={() => setSelectedItem(null)}>
          <div
            className="bg-white rounded-[16px] shadow-xl w-full max-w-lg"
            onClick={e => e.stopPropagation()}
          >
            <div className="p-6 border-b border-[#e5e7eb] flex items-center justify-between">
              <h2 className="text-xl font-bold text-[#0a2540]">Thanh toán học phí</h2>
              <button onClick={() => setSelectedItem(null)} className="p-2 hover:bg-[#f1f5f9] rounded-lg transition-colors">
                <X className="w-5 h-5 text-[#6a7282]" />
              </button>
            </div>

            <div className="p-6 space-y-5">
              {/* Info */}
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-blue-700">Học kỳ</span>
                  <span className="font-bold text-blue-900">{selectedItem.tenHocKi}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-blue-700">Số tín chỉ</span>
                  <span className="font-semibold text-blue-900">{selectedItem.soTinChi} TC</span>
                </div>
                <div className="flex justify-between pt-2 border-t border-blue-200">
                  <span className="font-semibold text-blue-900">Số tiền cần trả</span>
                  <span className="text-xl font-bold text-blue-600">{formatCurrency(selectedItem.soTien)}</span>
                </div>
              </div>

              {/* Methods */}
              <div>
                <h3 className="font-semibold text-[#0a2540] mb-3">Phương thức thanh toán</h3>
                {methods.length === 0 ? (
                  <p className="text-sm text-[#6a7282]">Không có phương thức khả dụng.</p>
                ) : (
                  <div className="space-y-2">
                    {methods.map(m => (
                      <label
                        key={m.maPhuongThuc}
                        className={`flex items-center gap-4 p-4 border-2 rounded-lg cursor-pointer transition-all ${
                          selectedMethod === m.maPhuongThuc
                            ? 'border-blue-600 bg-blue-50'
                            : 'border-[#e5e7eb] hover:border-blue-300'
                        }`}
                      >
                        <input
                          type="radio"
                          name="method"
                          value={m.maPhuongThuc}
                          checked={selectedMethod === m.maPhuongThuc}
                          onChange={() => setSelectedMethod(m.maPhuongThuc)}
                          className="w-4 h-4 text-blue-600"
                        />
                        <div className="flex-1">
                          <p className="font-semibold text-[#0a2540] text-sm">{m.tenPhuongThuc}</p>
                          <p className="text-xs text-[#6a7282]">{m.moTa}</p>
                        </div>
                      </label>
                    ))}
                  </div>
                )}
              </div>

              {payError && (
                <div className="flex items-center gap-2 p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">
                  <AlertCircle className="w-4 h-4 flex-shrink-0" />
                  {payError}
                </div>
              )}
            </div>

            <div className="p-6 border-t border-[#e5e7eb] flex gap-3">
              <button
                onClick={() => setSelectedItem(null)}
                className="flex-1 py-3 bg-[#f1f5f9] text-[#0a2540] rounded-lg hover:bg-[#e5e7eb] transition-colors font-medium"
              >
                Hủy
              </button>
              <button
                onClick={handlePay}
                disabled={paying || !selectedMethod}
                className="flex-1 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium flex items-center justify-center gap-2 disabled:opacity-60 disabled:cursor-not-allowed"
              >
                {paying ? <Loader2 className="w-5 h-5 animate-spin" /> : <CheckCircle className="w-5 h-5" />}
                {paying ? 'Đang xử lý...' : 'Xác nhận thanh toán'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
