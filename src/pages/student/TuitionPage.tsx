import { useCallback, useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router';
import { useAuth } from '@/hooks';
import { apiClient } from '@/api/common';
import { StudentSidebar } from '@/components/layouts/StudentSidebar';
import { StudentHeader } from '@/components/layouts/StudentHeader';
import { AIAssistantButton } from '@/components/chatbot/AIAssistantButton';
import { uploadFile } from '@/utils/fileUtils';
import { downloadInvoicePDF } from '@/utils/hocPhiPdf';
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
  Upload,
  Image as ImageIcon,
  QrCode,
  Building2,
  ChevronDown,
} from 'lucide-react';

// ── Types ─────────────────────────────────────────────────────────────────────

type TrangThai = 'CHUA_THANH_TOAN' | 'DANG_XU_LY' | 'DA_THANH_TOAN' | 'QUA_HAN';
type ProofMode = 'transaction' | 'image';

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
  maHocVien?: string;
  hoTen?: string;
  tenNganh?: string;
}

interface PhuongThuc {
  maPhuongThuc: string;
  tenPhuongThuc: string;
  moTa: string;
}

// ── Constants ─────────────────────────────────────────────────────────────────

const PAYMENT_CONFIG: Record<string, { label: string; desc: string; fee: number }> = {
  VI_DIEN_TU:   { label: 'Ví điện tử',             desc: 'MoMo, ZaloPay, VNPay,...',             fee: 0 },
  CHUYEN_KHOAN: { label: 'Chuyển khoản ngân hàng',  desc: 'Chuyển khoản qua tài khoản ngân hàng', fee: 0 },
  THE_NOI_DIA:  { label: 'Thẻ nội địa (ATM)',        desc: 'Thẻ ghi nợ nội địa',                   fee: 3000 },
  THE_QUOC_TE:  { label: 'Thẻ quốc tế',             desc: 'Visa, Mastercard, JCB',                fee: 5000 },
};

const BANK_INFO = {
  tenNganHang: 'Ngân hàng TMCP Quân đội (MB Bank)',
  soTaiKhoan:  '0123456789',
  tenTaiKhoan: 'LEARNING HUB NỀN TẢNG ĐÀO TẠO THÔNG MINH',
  chiNhanh:    'Chi nhánh Đà Nẵng',
};

// ── Helpers ───────────────────────────────────────────────────────────────────

const fmt = (n: number) =>
  new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(n);

const fmtDT = (dt: string | null) => {
  if (!dt) return '—';
  return new Date(dt).toLocaleDateString('vi-VN', {
    day: '2-digit', month: '2-digit', year: 'numeric',
    hour: '2-digit', minute: '2-digit',
  });
};

const statusMeta: Record<TrangThai, { text: string; color: string; icon: typeof CheckCircle }> = {
  DA_THANH_TOAN:   { text: 'Đã thanh toán',   color: 'bg-green-100 text-green-700',   icon: CheckCircle },
  DANG_XU_LY:      { text: 'Đang xử lý',       color: 'bg-yellow-100 text-yellow-700', icon: Clock },
  CHUA_THANH_TOAN: { text: 'Chưa thanh toán',  color: 'bg-gray-100 text-gray-600',     icon: AlertCircle },
  QUA_HAN:         { text: 'Quá hạn',           color: 'bg-red-100 text-red-700',       icon: AlertCircle },
};

// ── Component ─────────────────────────────────────────────────────────────────

export default function TuitionPage() {
  const navigate  = useNavigate();
  const { user: authUser, isAuthenticated } = useAuth();

  // remote data
  const [data,    setData]    = useState<TongQuanResponse | null>(null);
  const [methods, setMethods] = useState<PhuongThuc[]>([]);
  const [loading, setLoading] = useState(true);
  const [error,   setError]   = useState('');

  // semester selector — student must pick before anything is shown
  const [selectedHocPhiId, setSelectedHocPhiId] = useState('');

  // payment modal
  const [selectedItem,    setSelectedItem]    = useState<HocPhiItem | null>(null);
  const [selectedMethod,  setSelectedMethod]  = useState('');
  const [proofMode,       setProofMode]       = useState<ProofMode>('transaction');
  const [transactionCode, setTransactionCode] = useState('');
  const [proofFile,       setProofFile]       = useState<File | null>(null);
  const [proofPreviewUrl, setProofPreviewUrl] = useState('');
  const [paying,          setPaying]          = useState(false);
  const [payError,        setPayError]        = useState('');

  // pdf
  const [pdfLoading, setPdfLoading] = useState(false);

  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (!isAuthenticated || !authUser) { navigate('/'); return; }
    if (authUser.role !== 'student')   { navigate('/'); return; }
  }, [isAuthenticated, authUser, navigate]);

  const fetchData = useCallback(async () => {
    setLoading(true); setError('');
    try {
      const [sumRes, mRes] = await Promise.all([
        apiClient.get<TongQuanResponse>('/student/hoc-phi/summary'),
        apiClient.get<PhuongThuc[]>('/student/hoc-phi/methods'),
      ]);
      setData(sumRes.data);
      setMethods(mRes.data);
      if (mRes.data.length > 0) setSelectedMethod(mRes.data[0].maPhuongThuc);
      // reset semester selection on refresh — student must re-choose
      setSelectedHocPhiId('');
    } catch {
      setError('Không thể tải dữ liệu học phí. Vui lòng thử lại.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchData(); }, [fetchData]);

  const list        = data?.danhSachHocPhi ?? [];
  const activeItem  = list.find(i => i.hocPhiId === selectedHocPhiId) ?? null;
  const selectedFee = PAYMENT_CONFIG[selectedMethod]?.fee ?? 0;
  const totalFee    = selectedItem ? selectedItem.soTien + selectedFee : 0;
  const showQR      = selectedMethod === 'CHUYEN_KHOAN';

  // ── modal ──────────────────────────────────────────────────────────────────

  const openModal = (item: HocPhiItem) => {
    setSelectedItem(item);
    setPayError('');
    setProofMode('transaction');
    setTransactionCode('');
    setProofFile(null);
    setProofPreviewUrl('');
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const closeModal = () => {
    setSelectedItem(null);
    setProofFile(null);
    setProofPreviewUrl('');
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setProofFile(file);
    const reader = new FileReader();
    reader.onload = () => setProofPreviewUrl(reader.result as string);
    reader.readAsDataURL(file);
  };

  // ── submit proof ───────────────────────────────────────────────────────────

  const handlePay = async () => {
    if (!selectedItem || !selectedMethod) return;
    if (proofMode === 'transaction' && !transactionCode.trim()) { setPayError('Vui lòng nhập mã giao dịch.'); return; }
    if (proofMode === 'image'       && !proofFile)              { setPayError('Vui lòng chọn ảnh chứng từ.'); return; }
    setPaying(true); setPayError('');
    try {
      const fileChungTu = proofMode === 'image'
        ? (await uploadFile(proofFile as File)).fileUrl
        : transactionCode.trim();
      await apiClient.post('/student/hoc-phi/nop-chung-tu', {
        hocPhiId: selectedItem.hocPhiId,
        phuongThucThanhToan: selectedMethod,
        fileChungTu,
      });
      closeModal();
      // refresh data, keep current semester selected
      const saved = selectedItem.hocPhiId;
      await fetchData();
      // re-select the same semester after refresh
      setSelectedHocPhiId(saved);
    } catch (err: unknown) {
      const msg = (err as { response?: { data?: { detail?: string } } })?.response?.data?.detail;
      setPayError(msg || 'Nộp chứng từ thất bại. Vui lòng thử lại.');
    } finally {
      setPaying(false);
    }
  };

  // ── download receipt (TXT) ─────────────────────────────────────────────────

  const handleDownloadReceipt = async (item: HocPhiItem) => {
    try {
      const path = item.taiLieuTaiVe.startsWith('/api') ? item.taiLieuTaiVe.slice(4) : item.taiLieuTaiVe;
      const res  = await apiClient.get(path, { responseType: 'blob' });
      const url  = URL.createObjectURL(res.data as Blob);
      const a    = document.createElement('a');
      a.href = url; a.download = `bien-lai-${item.maHocKi}.txt`; a.click();
      URL.revokeObjectURL(url);
    } catch { alert('Không thể tải biên lai.'); }
  };

  // ── download invoice PDF ───────────────────────────────────────────────────

  const handleDownloadPDF = async (item: HocPhiItem) => {
    setPdfLoading(true);
    try {
      await downloadInvoicePDF({
        hoTen: data?.hoTen ?? authUser?.fullName ?? '',
        maHocVien: data?.maHocVien ?? '',
        tenNganh:  data?.tenNganh  ?? '',
        hocPhiId:  item.hocPhiId,
        maHocKi:   item.maHocKi,
        tenHocKi:  item.tenHocKi,
        soTinChi:  item.soTinChi,
        soTien:    item.soTien,
        trangThai: item.trangThai,
        ngayThanhToan:       item.ngayThanhToan,
        phuongThucThanhToan: item.phuongThucThanhToan,
      });
    } finally {
      setPdfLoading(false);
    }
  };

  if (!authUser) return null;
  const userName = authUser.fullName || authUser.username || '';

  // ── derived status for active item ────────────────────────────────────────

  const canPay    = activeItem?.trangThai === 'CHUA_THANH_TOAN' || activeItem?.trangThai === 'QUA_HAN';
  const isPending = activeItem?.trangThai === 'DANG_XU_LY';
  const isPaid    = activeItem?.trangThai === 'DA_THANH_TOAN';

  return (
    <div className="flex h-screen bg-[#f1f5f9]">
      <StudentSidebar />

      <div className="flex-1 ml-64 flex flex-col">
        <StudentHeader userName={userName} />

        <main className="flex-1 overflow-y-auto p-8">

          {/* Page header */}
          <div className="mb-6 flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-[#0a2540]">Học phí</h1>
              <p className="text-[#6a7282] mt-1">Tra cứu và thanh toán học phí theo học kỳ</p>
            </div>
            <button onClick={fetchData} className="p-2 text-[#6a7282] hover:text-[#0a2540] hover:bg-white rounded-lg transition-colors" title="Làm mới">
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
              <button onClick={fetchData} className="px-5 py-2 bg-[#0a2540] text-white rounded-lg text-sm font-semibold">Thử lại</button>
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
                    <p className="text-4xl font-bold">{fmt(data?.tongCanThanhToan ?? 0)}</p>
                  </div>
                  <div>
                    <div className="flex items-center gap-2 mb-2">
                      <CheckCircle className="w-5 h-5 text-green-300" />
                      <p className="text-blue-100 text-sm font-medium">Đã thanh toán</p>
                    </div>
                    <p className="text-4xl font-bold text-green-300">{fmt(data?.tongDaThanhToan ?? 0)}</p>
                  </div>
                  <div>
                    <div className="flex items-center gap-2 mb-2">
                      <AlertCircle className="w-5 h-5 text-red-300" />
                      <p className="text-blue-100 text-sm font-medium">Quá hạn</p>
                    </div>
                    <p className="text-4xl font-bold text-red-300">{fmt(data?.tongQuaHan ?? 0)}</p>
                  </div>
                </div>
                <div className="mt-6 pt-6 border-t border-white/20 flex items-center gap-4">
                  <FileText className="w-4 h-4 text-blue-200" />
                  <span className="text-sm text-blue-100">{list.length} kỳ học</span>
                  {(data?.tongQuaHan ?? 0) > 0 && (
                    <div className="px-4 py-2 bg-red-500 rounded-lg flex items-center gap-2">
                      <AlertCircle className="w-4 h-4" />
                      <span className="font-semibold text-sm">Có khoản học phí quá hạn!</span>
                    </div>
                  )}
                </div>
              </div>

              {/* ── Semester selector ── */}
              <div className="bg-white rounded-[14px] border border-[#e5e7eb] shadow-sm p-6 mb-6">
                <label className="block text-sm font-semibold text-[#0a2540] mb-2">
                  Chọn học kỳ để xem thông tin học phí
                </label>
                <div className="relative max-w-md">
                  <select
                    value={selectedHocPhiId}
                    onChange={e => setSelectedHocPhiId(e.target.value)}
                    className="w-full appearance-none px-4 py-3 pr-10 border-2 border-[#e5e7eb] rounded-xl text-sm bg-white focus:outline-none focus:border-blue-500 font-medium text-[#0a2540] cursor-pointer"
                  >
                    <option value="">-- Chọn học kỳ --</option>
                    {list.map(item => {
                      const badge = item.trangThai === 'QUA_HAN' ? ' ⚠ Quá hạn'
                                  : item.trangThai === 'DA_THANH_TOAN' ? ' ✓ Đã TT'
                                  : item.trangThai === 'DANG_XU_LY' ? ' ⏳ Đang xử lý'
                                  : '';
                      return (
                        <option key={item.hocPhiId} value={item.hocPhiId}>
                          {item.tenHocKi} ({item.maHocKi}){badge}
                        </option>
                      );
                    })}
                  </select>
                  <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#6a7282] pointer-events-none" />
                </div>
                {list.length === 0 && (
                  <p className="mt-2 text-sm text-[#6a7282]">Chưa có học kỳ nào được ghi nhận.</p>
                )}
              </div>

              {/* ── Content area: empty state OR semester detail ── */}
              {!activeItem ? (
                /* Empty state */
                <div className="bg-white rounded-[14px] border border-dashed border-[#d1d5db] p-16 text-center">
                  <div className="w-16 h-16 bg-blue-50 rounded-full flex items-center justify-center mx-auto mb-4">
                    <Receipt className="w-8 h-8 text-blue-400" />
                  </div>
                  <h3 className="text-lg font-semibold text-[#0a2540] mb-2">Chưa chọn học kỳ</h3>
                  <p className="text-sm text-[#6a7282] max-w-xs mx-auto">
                    Vui lòng chọn học kỳ ở trên để xem thông tin học phí, trạng thái thanh toán và tải hóa đơn.
                  </p>
                </div>
              ) : (
                /* Semester detail */
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

                  {/* Main detail card */}
                  <div className="lg:col-span-2 space-y-4">

                    {/* Status card */}
                    <div className="bg-white rounded-[14px] border border-[#e5e7eb] shadow-sm p-6">
                      <div className="flex items-start justify-between mb-5">
                        <div>
                          <h3 className="text-xl font-bold text-[#0a2540]">{activeItem.tenHocKi}</h3>
                          <p className="text-sm text-[#6a7282] mt-1">Mã: {activeItem.maHocKi} · {activeItem.soTinChi} tín chỉ</p>
                        </div>
                        <div className="text-right">
                          <p className="text-3xl font-bold text-[#0a2540]">{fmt(activeItem.soTien)}</p>
                          <span className={`inline-flex items-center gap-1.5 px-3 py-1 mt-1 rounded-full text-xs font-semibold ${statusMeta[activeItem.trangThai].color}`}>
                            {(() => { const I = statusMeta[activeItem.trangThai].icon; return <I className="w-3.5 h-3.5" />; })()}
                            {statusMeta[activeItem.trangThai].text}
                          </span>
                        </div>
                      </div>

                      {/* Payment detail (if paid or pending) */}
                      {(isPaid || isPending) && (
                        <div className={`rounded-lg p-4 mb-5 text-sm ${isPaid ? 'bg-green-50 border border-green-200' : 'bg-yellow-50 border border-yellow-200'}`}>
                          {isPaid ? (
                            <div className="space-y-1.5 text-green-800">
                              <div className="flex items-center gap-2 font-semibold">
                                <CheckCircle className="w-4 h-4" />
                                Đã thanh toán thành công
                              </div>
                              <div className="grid grid-cols-2 gap-2 mt-2 text-sm">
                                <div><span className="text-green-600">Ngày thanh toán:</span> {fmtDT(activeItem.ngayThanhToan)}</div>
                                {activeItem.phuongThucThanhToan && (
                                  <div><span className="text-green-600">Phương thức:</span> {PAYMENT_CONFIG[activeItem.phuongThucThanhToan]?.label ?? activeItem.phuongThucThanhToan}</div>
                                )}
                              </div>
                            </div>
                          ) : (
                            <div className="flex items-center gap-2 text-yellow-800 font-medium">
                              <Clock className="w-4 h-4" />
                              Chứng từ đã nộp — đang chờ kế toán xác nhận
                            </div>
                          )}
                        </div>
                      )}

                      {/* Unit price info */}
                      <div className="bg-[#f9fafb] rounded-lg p-4 mb-5 text-sm text-[#6a7282]">
                        <div className="flex justify-between">
                          <span>Số tín chỉ</span>
                          <span className="font-medium text-[#0a2540]">{activeItem.soTinChi} TC</span>
                        </div>
                        <div className="flex justify-between mt-1.5">
                          <span>Đơn giá / tín chỉ</span>
                          <span className="font-medium text-[#0a2540]">
                            {activeItem.soTinChi > 0 ? fmt(Math.round(activeItem.soTien / activeItem.soTinChi)) : '—'}
                          </span>
                        </div>
                        <div className="flex justify-between mt-2 pt-2 border-t border-[#e5e7eb] font-semibold text-[#0a2540]">
                          <span>Tổng học phí</span>
                          <span className="text-blue-600">{fmt(activeItem.soTien)}</span>
                        </div>
                      </div>

                      {/* Action buttons */}
                      <div className="flex flex-wrap gap-3">
                        {/* Always: PDF invoice */}
                        <button
                          onClick={() => handleDownloadPDF(activeItem)}
                          disabled={pdfLoading}
                          className="flex items-center gap-2 px-4 py-2.5 bg-[#0a2540] text-white rounded-lg hover:bg-[#0d2f52] font-medium text-sm transition-colors disabled:opacity-60"
                        >
                          {pdfLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <FileText className="w-4 h-4" />}
                          {pdfLoading ? 'Đang tạo PDF...' : 'Tải hóa đơn PDF'}
                        </button>

                        {/* Paid: receipt */}
                        {isPaid && (
                          <button
                            onClick={() => handleDownloadReceipt(activeItem)}
                            className="flex items-center gap-2 px-4 py-2.5 border border-[#e5e7eb] text-[#0a2540] rounded-lg hover:bg-[#f1f5f9] font-medium text-sm transition-colors"
                          >
                            <Download className="w-4 h-4" />
                            Tải biên lai
                          </button>
                        )}

                        {/* Unpaid / overdue: submit proof */}
                        {canPay && (
                          <button
                            onClick={() => openModal(activeItem)}
                            className="flex items-center gap-2 px-5 py-2.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium text-sm transition-colors ml-auto"
                          >
                            <CreditCard className="w-4 h-4" />
                            Nộp chứng từ thanh toán
                          </button>
                        )}

                        {/* Pending badge */}
                        {isPending && (
                          <span className="flex items-center gap-2 px-4 py-2.5 bg-yellow-50 text-yellow-700 border border-yellow-200 rounded-lg text-sm font-medium ml-auto">
                            <Clock className="w-4 h-4" />
                            Chờ kế toán xác nhận
                          </span>
                        )}
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
                      <div className="space-y-3 max-h-[480px] overflow-y-auto">
                        {(() => {
                          const paid = list.filter(i => i.daThanhToan);
                          if (paid.length === 0) return (
                            <div className="text-center py-10">
                              <Wallet className="w-10 h-10 text-[#9ca3af] mx-auto mb-3" />
                              <p className="text-sm text-[#6a7282]">Chưa có lịch sử thanh toán</p>
                            </div>
                          );
                          return paid.map(item => (
                            <div
                              key={item.hocPhiId}
                              onClick={() => setSelectedHocPhiId(item.hocPhiId)}
                              className={`rounded-lg p-4 border cursor-pointer transition-all ${
                                item.hocPhiId === selectedHocPhiId
                                  ? 'border-blue-400 bg-blue-50'
                                  : 'border-[#e5e7eb] bg-[#f9fafb] hover:border-blue-200'
                              }`}
                            >
                              <div className="flex items-start justify-between mb-1">
                                <div>
                                  <p className="font-semibold text-[#0a2540] text-sm">{item.tenHocKi}</p>
                                  <p className="text-xs text-[#6a7282]">{fmtDT(item.ngayThanhToan)}</p>
                                </div>
                                <p className="font-bold text-green-600 text-sm">{fmt(item.soTien)}</p>
                              </div>
                              {item.phuongThucThanhToan && (
                                <p className="text-xs text-[#6a7282] mb-3">
                                  {PAYMENT_CONFIG[item.phuongThucThanhToan]?.label ?? item.phuongThucThanhToan.replace(/_/g, ' ')}
                                </p>
                              )}
                              <div className="flex gap-2">
                                <button
                                  onClick={e => { e.stopPropagation(); handleDownloadReceipt(item); }}
                                  className="flex-1 px-2 py-1.5 bg-white border border-[#e5e7eb] rounded-lg hover:bg-[#f1f5f9] text-xs font-medium text-[#0a2540] flex items-center justify-center gap-1"
                                >
                                  <Download className="w-3.5 h-3.5" />
                                  Biên lai
                                </button>
                                <button
                                  onClick={e => { e.stopPropagation(); handleDownloadPDF(item); }}
                                  disabled={pdfLoading}
                                  className="flex-1 px-2 py-1.5 bg-[#0a2540] text-white rounded-lg hover:bg-[#0d2f52] text-xs font-medium flex items-center justify-center gap-1 disabled:opacity-50"
                                >
                                  {pdfLoading && selectedHocPhiId === item.hocPhiId
                                    ? <Loader2 className="w-3.5 h-3.5 animate-spin" />
                                    : <FileText className="w-3.5 h-3.5" />}
                                  PDF
                                </button>
                              </div>
                            </div>
                          ));
                        })()}
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </>
          )}
        </main>
      </div>

      <AIAssistantButton />

      {/* ── Payment Proof Modal ── */}
      {selectedItem && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4" onClick={closeModal}>
          <div
            className="bg-white rounded-[16px] shadow-xl w-full max-w-lg max-h-[92vh] overflow-y-auto"
            onClick={e => e.stopPropagation()}
          >
            {/* Header */}
            <div className="p-6 border-b border-[#e5e7eb] flex items-center justify-between sticky top-0 bg-white z-10 rounded-t-[16px]">
              <h2 className="text-xl font-bold text-[#0a2540]">Nộp chứng từ thanh toán</h2>
              <button onClick={closeModal} className="p-2 hover:bg-[#f1f5f9] rounded-lg transition-colors">
                <X className="w-5 h-5 text-[#6a7282]" />
              </button>
            </div>

            <div className="p-6 space-y-5">

              {/* Invoice summary */}
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-blue-700">Học kỳ</span>
                  <span className="font-bold text-blue-900">{selectedItem.tenHocKi}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-blue-700">Số tín chỉ</span>
                  <span className="font-semibold text-blue-900">{selectedItem.soTinChi} TC</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-blue-700">Học phí</span>
                  <span className="font-semibold text-blue-900">{fmt(selectedItem.soTien)}</span>
                </div>
                {selectedFee > 0 && (
                  <div className="flex justify-between text-orange-600">
                    <span>Phí giao dịch</span>
                    <span className="font-medium">+ {fmt(selectedFee)}</span>
                  </div>
                )}
                <div className="flex justify-between pt-2 border-t border-blue-200">
                  <span className="font-bold text-blue-900">Tổng thanh toán</span>
                  <span className="text-xl font-bold text-blue-600">{fmt(totalFee)}</span>
                </div>
              </div>

              {/* Payment methods */}
              <div>
                <h3 className="font-semibold text-[#0a2540] mb-3">Phương thức thanh toán</h3>
                <div className="space-y-2">
                  {methods.length === 0
                    ? <p className="text-sm text-[#6a7282]">Không có phương thức khả dụng.</p>
                    : methods.map(m => {
                        const cfg = PAYMENT_CONFIG[m.maPhuongThuc] ?? { label: m.tenPhuongThuc, desc: m.moTa, fee: 0 };
                        return (
                          <label
                            key={m.maPhuongThuc}
                            className={`flex items-center gap-4 p-4 border-2 rounded-lg cursor-pointer transition-all ${
                              selectedMethod === m.maPhuongThuc ? 'border-blue-600 bg-blue-50' : 'border-[#e5e7eb] hover:border-blue-300'
                            }`}
                          >
                            <input
                              type="radio" name="method" value={m.maPhuongThuc}
                              checked={selectedMethod === m.maPhuongThuc}
                              onChange={() => setSelectedMethod(m.maPhuongThuc)}
                              className="w-4 h-4 text-blue-600"
                            />
                            <div className="flex-1">
                              <div className="flex items-center justify-between">
                                <p className="font-semibold text-[#0a2540] text-sm">{cfg.label}</p>
                                {cfg.fee > 0 && (
                                  <span className="text-xs bg-orange-100 text-orange-700 px-2 py-0.5 rounded-full font-medium">
                                    + {fmt(cfg.fee)} phí
                                  </span>
                                )}
                              </div>
                              <p className="text-xs text-[#6a7282]">{cfg.desc}</p>
                            </div>
                          </label>
                        );
                      })}
                </div>
              </div>

              {/* QR bank info — Chuyển khoản only */}
              {showQR && (
                <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-4">
                  <h4 className="font-semibold text-emerald-900 mb-3 flex items-center gap-2 text-sm">
                    <Building2 className="w-4 h-4" />
                    Thông tin chuyển khoản
                  </h4>
                  <div className="flex gap-4">
                    <div className="flex-shrink-0">
                      <img
                        src="/qr_thanh_toan.jpeg"
                        alt="QR Thanh toán"
                        className="w-28 h-28 rounded-lg object-cover border border-emerald-200"
                        onError={e => { (e.target as HTMLImageElement).style.display = 'none'; }}
                      />
                      <div className="mt-1 flex items-center justify-center gap-1 text-xs text-emerald-700">
                        <QrCode className="w-3 h-3" />Quét QR
                      </div>
                    </div>
                    <div className="text-sm space-y-1.5 flex-1">
                      <div><span className="text-emerald-700 font-medium">Ngân hàng: </span>{BANK_INFO.tenNganHang}</div>
                      <div><span className="text-emerald-700 font-medium">Số TK: </span><strong className="font-mono tracking-wide">{BANK_INFO.soTaiKhoan}</strong></div>
                      <div><span className="text-emerald-700 font-medium">Chủ TK: </span><span className="font-medium">{BANK_INFO.tenTaiKhoan}</span></div>
                      <div><span className="text-emerald-700 font-medium">Chi nhánh: </span>{BANK_INFO.chiNhanh}</div>
                      <div className="mt-2 p-2 bg-amber-50 border border-amber-200 rounded-lg">
                        <p className="text-xs text-amber-700 font-medium">Nội dung chuyển khoản:</p>
                        <p className="font-mono text-amber-900 text-sm font-bold mt-0.5">
                          HP {selectedItem.maHocKi} {data?.maHocVien ?? ''}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Proof input */}
              <div>
                <h3 className="font-semibold text-[#0a2540] mb-3">Chứng từ xác nhận</h3>
                <div className="inline-flex rounded-lg border border-slate-200 bg-slate-50 p-1 mb-3">
                  <button type="button" onClick={() => setProofMode('transaction')}
                    className={`px-3 py-1.5 text-sm font-medium rounded-md transition-all ${proofMode === 'transaction' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}>
                    Mã giao dịch
                  </button>
                  <button type="button" onClick={() => setProofMode('image')}
                    className={`px-3 py-1.5 text-sm font-medium rounded-md transition-all ${proofMode === 'image' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}>
                    Ảnh chứng từ
                  </button>
                </div>

                {proofMode === 'transaction' ? (
                  <input
                    type="text" value={transactionCode} onChange={e => setTransactionCode(e.target.value)}
                    placeholder="Nhập mã giao dịch ngân hàng..."
                    className="w-full px-4 py-2.5 border border-[#e5e7eb] rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                ) : (
                  <div className="rounded-xl border border-slate-200 bg-slate-50 p-4">
                    <input ref={fileInputRef} type="file" accept="image/*" className="hidden" onChange={handleFileChange} />
                    <div className="flex items-center gap-4">
                      {proofPreviewUrl
                        ? <img src={proofPreviewUrl} alt="Xem trước" className="w-20 h-20 rounded-lg object-cover border border-slate-200 flex-shrink-0" />
                        : <div className="w-20 h-20 rounded-lg border-2 border-dashed border-slate-300 flex items-center justify-center flex-shrink-0">
                            <ImageIcon className="w-7 h-7 text-slate-300" />
                          </div>
                      }
                      <div className="flex-1">
                        <button type="button" onClick={() => fileInputRef.current?.click()}
                          className="inline-flex items-center gap-2 px-4 py-2 bg-blue-50 text-blue-700 border border-blue-200 rounded-lg hover:bg-blue-100 text-sm font-medium">
                          <Upload className="w-4 h-4" />Chọn ảnh
                        </button>
                        <p className="text-xs text-slate-400 mt-1.5">JPG, PNG, GIF, WEBP – Tối đa 2MB</p>
                        {proofFile && (
                          <button type="button"
                            onClick={() => { setProofFile(null); setProofPreviewUrl(''); if (fileInputRef.current) fileInputRef.current.value = ''; }}
                            className="text-xs text-red-500 hover:text-red-600 mt-1">
                            Xóa ảnh
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                )}
              </div>

              <div className="flex items-start gap-2 p-3 bg-yellow-50 border border-yellow-200 rounded-lg text-yellow-800 text-sm">
                <Clock className="w-4 h-4 flex-shrink-0 mt-0.5" />
                <p>Sau khi nộp, trạng thái chuyển sang <strong>Đang xử lý</strong>. Kế toán sẽ xác nhận trong thời gian sớm nhất.</p>
              </div>

              {payError && (
                <div className="flex items-center gap-2 p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">
                  <AlertCircle className="w-4 h-4 flex-shrink-0" />
                  {payError}
                </div>
              )}
            </div>

            {/* Footer */}
            <div className="p-6 border-t border-[#e5e7eb] flex gap-3 sticky bottom-0 bg-white rounded-b-[16px]">
              <button onClick={closeModal}
                className="flex-1 py-3 bg-[#f1f5f9] text-[#0a2540] rounded-lg hover:bg-[#e5e7eb] font-medium">
                Hủy
              </button>
              <button onClick={handlePay} disabled={paying || !selectedMethod}
                className="flex-1 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium flex items-center justify-center gap-2 disabled:opacity-60 disabled:cursor-not-allowed">
                {paying ? <Loader2 className="w-5 h-5 animate-spin" /> : <CheckCircle className="w-5 h-5" />}
                {paying ? 'Đang tải lên...' : 'Nộp chứng từ'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
