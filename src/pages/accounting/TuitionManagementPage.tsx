import { AccountantSidebar } from '@/components/layouts/AccountantSidebar';
import { AccountantHeader } from '@/components/layouts/AccountantHeader';
import { type ChangeEvent, useState, useMemo, useCallback, useRef } from 'react';
import {
  Bell, CheckCircle, FilePlus2, History, ImageIcon, RefreshCw, Search, ThumbsDown, ThumbsUp, Upload, Wallet, X
} from 'lucide-react';
import {
  accountingApi,
  type AccountingHocPhiResponse,
  type AccountingInvoiceGenerationResponse,
  type AccountingInvoiceSemesterResponse,
  type AccountingStudentLedgerResponse,
  type TrangThaiHocPhi,
  type CreatePaymentRequest
} from '@/api/accounting/accounting.api';
import { useAsync } from '@/hooks';
import { Toast } from '@/components/notification/Toast';
import { resolveFileUrl, uploadFile } from '@/utils/fileUtils';

const STATUS_LABEL: Record<TrangThaiHocPhi, string> = {
  CHUA_THANH_TOAN: 'Chưa thanh toán',
  DANG_XU_LY: 'Chờ xác nhận',
  DA_THANH_TOAN: 'Đã thanh toán',
  QUA_HAN: 'Quá hạn',
};

const STATUS_CLASS: Record<TrangThaiHocPhi, string> = {
  CHUA_THANH_TOAN: 'bg-amber-100 text-amber-700',
  DANG_XU_LY: 'bg-blue-100 text-blue-700',
  DA_THANH_TOAN: 'bg-emerald-100 text-emerald-700',
  QUA_HAN: 'bg-red-100 text-red-700',
};

const PHUONG_THUC_OPTIONS = [
  { value: 'TIEN_MAT',      label: 'Tiền mặt' },
  { value: 'CHUYEN_KHOAN',  label: 'Chuyển khoản ngân hàng' },
  { value: 'THE_TIN_DUNG',  label: 'Thẻ tín dụng / ghi nợ' },
  { value: 'VI_DIEN_TU',    label: 'Ví điện tử' },
];

interface PaymentModal {
  item: AccountingHocPhiResponse;
  ngayThanhToan: string;
  phuongThucThanhToan: string;
  proofMode: 'transaction' | 'image';
  transactionCode: string;
  proofFile: File | null;
  proofPreviewUrl: string;
}

const formatDate = (dt: string | null) => {
  if (!dt) return '—';
  return new Date(dt).toLocaleDateString('vi-VN', { day: '2-digit', month: '2-digit', year: 'numeric' });
};

const getApiErrorMessage = (err: unknown, fallback: string) =>
  (err as { response?: { data?: { detail?: string } } })?.response?.data?.detail || fallback;

export default function TuitionManagementPage() {
  const [studentCode, setStudentCode] = useState('');
  const [studentName, setStudentName] = useState('');
  const [filterSemester, setFilterSemester] = useState<string | 'ALL'>('ALL');
  const [filterStatus, setFilterStatus] = useState<TrangThaiHocPhi | 'ALL'>('ALL');
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [modal, setModal] = useState<PaymentModal | null>(null);
  const [ledgerModal, setLedgerModal] = useState<{ hocVienId: string; mode: 'debt' | 'history' } | null>(null);
  const [ledger, setLedger] = useState<AccountingStudentLedgerResponse | null>(null);
  const [ledgerLoading, setLedgerLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [paymentError, setPaymentError] = useState('');
  const [pendingActionIds, setPendingActionIds] = useState<Set<string>>(new Set());
  const [invoiceModalOpen, setInvoiceModalOpen] = useState(false);
  const [invoiceSemesters, setInvoiceSemesters] = useState<AccountingInvoiceSemesterResponse[]>([]);
  const [invoiceSemestersLoading, setInvoiceSemestersLoading] = useState(false);
  const [selectedInvoiceSemesterId, setSelectedInvoiceSemesterId] = useState('');
  const [invoicePreview, setInvoicePreview] = useState<AccountingInvoiceGenerationResponse | null>(null);
  const [invoicePreviewLoading, setInvoicePreviewLoading] = useState(false);
  const [invoiceGenerating, setInvoiceGenerating] = useState(false);
  const [toast, setToast] = useState<{ type: 'success' | 'error'; message: string } | null>(null);
  const proofFileInputRef = useRef<HTMLInputElement>(null);
  const paymentSubmittingRef = useRef(false);

  const todayStr = new Date().toISOString().slice(0, 10);

  const { data: list = [], loading, execute: reload } = useAsync<AccountingHocPhiResponse[]>(
    () => accountingApi.getAllHocPhi(),
    []
  );

  const semesters = useMemo(() => {
    const map = new Map<string, { id: string; label: string }>();
    (list ?? []).forEach(item => {
      if (!map.has(item.hocKiId)) {
        map.set(item.hocKiId, { id: item.hocKiId, label: `${item.hocKiName} (${item.hocKiMa})` });
      }
    });
    return Array.from(map.values());
  }, [list]);

  const filtered = useMemo(() => {
    return (list ?? []).filter(r => {
      const matchStatus = filterStatus === 'ALL' || r.trangThai === filterStatus;
      const matchSemester = filterSemester === 'ALL' || r.hocKiId === filterSemester;
      const matchStudentCode = !studentCode.trim()
        || r.maHocVien?.toLowerCase().includes(studentCode.trim().toLowerCase());
      const matchStudentName = !studentName.trim()
        || r.hocVienName?.toLowerCase().includes(studentName.trim().toLowerCase());
      return matchStatus && matchSemester && matchStudentCode && matchStudentName;
    });
  }, [list, studentCode, studentName, filterSemester, filterStatus]);

  const toggleSelect = (id: string) => {
    setSelectedIds(prev => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
  };

  const toggleAll = () => {
    if (selectedIds.size === filtered.length) {
      setSelectedIds(new Set());
    } else {
      setSelectedIds(new Set(filtered.map(r => r.id)));
    }
  };

  const openModal = (item: AccountingHocPhiResponse) => {
    setPaymentError('');
    setModal({
      item,
      ngayThanhToan: todayStr,
      phuongThucThanhToan: 'TIEN_MAT',
      proofMode: 'transaction',
      transactionCode: '',
      proofFile: null,
      proofPreviewUrl: '',
    });
  };

  const submitPaymentModal = useCallback(async () => {
    if (!modal || paymentSubmittingRef.current) return;
    if (modal.proofMode === 'transaction' && !modal.transactionCode.trim()) {
      setToast({ type: 'error', message: 'Vui lòng nhập mã giao dịch' });
      return;
    }
    if (modal.proofMode === 'image' && !modal.proofFile) {
      setToast({ type: 'error', message: 'Vui lòng chọn ảnh chứng từ' });
      return;
    }
    paymentSubmittingRef.current = true;
    setSaving(true);
    setPaymentError('');
    try {
      const fileChungTu = modal.proofMode === 'image'
        ? (await uploadFile(modal.proofFile as File)).fileUrl
        : modal.transactionCode.trim();
      const payload: CreatePaymentRequest = {
        hocPhiId: modal.item.id,
        ngayThanhToan: modal.ngayThanhToan || undefined,
        fileChungTu,
        phuongThucThanhToan: modal.phuongThucThanhToan,
      };
      await accountingApi.createPayment(modal.item.id, payload);
      setToast({ type: 'success', message: 'Xác nhận thanh toán thành công!' });
      setModal(null);
      reload();
    } catch (err: unknown) {
      const message = getApiErrorMessage(err, 'Thanh toán không thành công');
      setPaymentError(message);
      setToast({ type: 'error', message });
    } finally {
      paymentSubmittingRef.current = false;
      setSaving(false);
    }
  }, [modal, reload]);

  const sendNotify = useCallback(async (id: string) => {
    if (pendingActionIds.has(id)) return;
    setPendingActionIds(prev => new Set(prev).add(id));
    try {
      await accountingApi.sendNotification(id);
      setToast({ type: 'success', message: 'Đã gửi thông báo!' });
    } catch (err: unknown) {
      setToast({ type: 'error', message: getApiErrorMessage(err, 'Gửi thông báo thất bại') });
    } finally {
      setPendingActionIds(prev => {
        const next = new Set(prev);
        next.delete(id);
        return next;
      });
    }
  }, [pendingActionIds]);

  const confirmPayment = useCallback(async (id: string) => {
    if (pendingActionIds.has(id)) return;
    setPendingActionIds(prev => new Set(prev).add(id));
    try {
      await accountingApi.confirmPayment(id);
      setToast({ type: 'success', message: 'Đã xác nhận thanh toán!' });
      reload();
    } catch (err: unknown) {
      setToast({ type: 'error', message: getApiErrorMessage(err, 'Thanh toán không thành công') });
    } finally {
      setPendingActionIds(prev => {
        const next = new Set(prev);
        next.delete(id);
        return next;
      });
    }
  }, [pendingActionIds, reload]);

  const rejectPayment = useCallback(async (id: string) => {
    if (pendingActionIds.has(id)) return;
    setPendingActionIds(prev => new Set(prev).add(id));
    try {
      await accountingApi.rejectPayment(id);
      setToast({ type: 'success', message: 'Đã từ chối, học viên cần nộp lại chứng từ' });
      reload();
    } catch (err: unknown) {
      setToast({ type: 'error', message: getApiErrorMessage(err, 'Từ chối thất bại') });
    } finally {
      setPendingActionIds(prev => {
        const next = new Set(prev);
        next.delete(id);
        return next;
      });
    }
  }, [pendingActionIds, reload]);

  const openLedger = useCallback(async (item: AccountingHocPhiResponse, mode: 'debt' | 'history') => {
    setLedgerModal({ hocVienId: item.hocVienId, mode });
    setLedger(null);
    setLedgerLoading(true);
    try {
      const data = await accountingApi.getStudentLedger(item.hocVienId);
      setLedger(data);
    } catch {
      setLedgerModal(null);
      setToast({ type: 'error', message: 'Không thể tải thông tin công nợ của học viên' });
    } finally {
      setLedgerLoading(false);
    }
  }, []);

  const handleProofFileChange = (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;
    if (!file.type.startsWith('image/')) {
      setToast({ type: 'error', message: 'Chỉ chấp nhận file ảnh (JPG, PNG, GIF, WEBP)' });
      return;
    }
    if (file.size > 2 * 1024 * 1024) {
      setToast({ type: 'error', message: 'Ảnh chứng từ không được vượt quá 2MB' });
      return;
    }
    const reader = new FileReader();
    reader.onload = () => {
      setModal(current => current
        ? { ...current, proofFile: file, proofPreviewUrl: reader.result as string }
        : current);
    };
    reader.readAsDataURL(file);
  };

  const openInvoiceModal = useCallback(async () => {
    setInvoiceModalOpen(true);
    setInvoicePreview(null);
    setSelectedInvoiceSemesterId('');
    setInvoiceSemestersLoading(true);
    try {
      const data = await accountingApi.getInvoiceSemesters();
      setInvoiceSemesters(data);
    } catch (err: unknown) {
      setToast({ type: 'error', message: getApiErrorMessage(err, 'Không thể tải danh sách học kỳ') });
    } finally {
      setInvoiceSemestersLoading(false);
    }
  }, []);

  const loadInvoicePreview = useCallback(async (hocKiId: string) => {
    setInvoicePreviewLoading(true);
    try {
      const data = await accountingApi.previewInvoices(hocKiId);
      setInvoicePreview(data);
    } catch (err: unknown) {
      setInvoicePreview(null);
      setToast({ type: 'error', message: getApiErrorMessage(err, 'Không thể tải danh sách tạo hóa đơn') });
    } finally {
      setInvoicePreviewLoading(false);
    }
  }, []);

  const handleInvoiceSemesterChange = useCallback((hocKiId: string) => {
    setSelectedInvoiceSemesterId(hocKiId);
    setInvoicePreview(null);
    if (hocKiId) {
      void loadInvoicePreview(hocKiId);
    }
  }, [loadInvoicePreview]);

  const generateInvoices = useCallback(async () => {
    if (!selectedInvoiceSemesterId || invoiceGenerating) return;
    setInvoiceGenerating(true);
    try {
      const data = await accountingApi.generateInvoices(selectedInvoiceSemesterId);
      setInvoicePreview(data);
      setToast({
        type: 'success',
        message: `Đã tạo ${data.soHoaDonDaTao} hóa đơn học phí`,
      });
      reload();
    } catch (err: unknown) {
      setToast({ type: 'error', message: getApiErrorMessage(err, 'Tạo hóa đơn thất bại') });
    } finally {
      setInvoiceGenerating(false);
    }
  }, [invoiceGenerating, reload, selectedInvoiceSemesterId]);

  const selectedInvoiceSemester = invoiceSemesters.find(item => item.hocKiId === selectedInvoiceSemesterId);
  const invoiceTotals = invoicePreview?.items.reduce(
    (totals, item) => ({
      tongTinChi: totals.tongTinChi + item.tongSoTinChi,
      tongTien: totals.tongTien + item.soTien,
      coTheTao: totals.coTheTao + (item.daCoHoaDon ? 0 : 1),
    }),
    { tongTinChi: 0, tongTien: 0, coTheTao: 0 }
  );

  return (
    <div className="flex h-screen bg-stone-50">
      <AccountantSidebar />
      <div className="flex-1 ml-64 flex flex-col">
        <AccountantHeader title="Quản lý học phí" />
        <div className="flex-1 overflow-auto p-6">
          <div className="max-w-7xl mx-auto space-y-4">

            {/* Toolbar */}
            <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-4 grid gap-3 lg:grid-cols-[1fr_1fr_220px_220px_auto_auto_auto] items-center">
              <div className="relative min-w-[180px]">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                <input
                  type="text" placeholder="Mã sinh viên"
                  value={studentCode} onChange={e => setStudentCode(e.target.value)}
                  className="w-full pl-9 pr-3 py-2 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
                />
              </div>
              <div className="relative min-w-[180px]">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                <input
                  type="text" placeholder="Tên sinh viên"
                  value={studentName} onChange={e => setStudentName(e.target.value)}
                  className="w-full pl-9 pr-3 py-2 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
                />
              </div>
              <select
                value={filterSemester} onChange={e => setFilterSemester(e.target.value)}
                className="border border-slate-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
              >
                <option value="ALL">Tất cả học kỳ</option>
                {semesters.map(semester => (
                  <option key={semester.id} value={semester.id}>{semester.label}</option>
                ))}
              </select>
              <select
                value={filterStatus} onChange={e => setFilterStatus(e.target.value as TrangThaiHocPhi | 'ALL')}
                className="border border-slate-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
              >
                <option value="ALL">Tất cả trạng thái</option>
                <option value="DANG_XU_LY">Chờ xác nhận</option>
                <option value="CHUA_THANH_TOAN">Chưa thanh toán</option>
                <option value="DA_THANH_TOAN">Đã thanh toán</option>
                <option value="QUA_HAN">Quá hạn</option>
              </select>
              <button
                onClick={openInvoiceModal}
                className="px-4 py-2 bg-emerald-600 text-white text-sm rounded-lg hover:bg-emerald-700 flex items-center gap-2"
              >
                <FilePlus2 className="w-4 h-4" /> Tạo hóa đơn
              </button>
              <button
                onClick={reload}
                className="px-4 py-2 border border-slate-300 text-slate-600 text-sm rounded-lg hover:bg-slate-50 flex items-center gap-2"
              >
                <RefreshCw className="w-4 h-4" /> Làm mới
              </button>
              <span className="text-sm text-slate-500 lg:text-right">{filtered.length} bản ghi</span>
            </div>

            {/* Table */}
            <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
              {loading ? (
                <div className="p-10 text-center text-slate-400">Đang tải...</div>
              ) : filtered.length === 0 ? (
                <div className="p-10 text-center text-slate-400">Không có dữ liệu</div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead className="bg-slate-50 border-b border-slate-200">
                      <tr>
                        <th className="px-4 py-3 text-left w-10">
                          <input
                            type="checkbox"
                            checked={selectedIds.size === filtered.length && filtered.length > 0}
                            onChange={toggleAll}
                            className="rounded border-slate-300"
                          />
                        </th>
                        {['Mã sinh viên', 'Học viên', 'Email', 'Học kỳ', 'Số tín chỉ', 'Số tiền', 'Trạng thái', 'Thao tác'].map(h => (
                          <th key={h} className="px-4 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wide">{h}</th>
                        ))}
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {filtered.map(r => {
                        const rowPending = pendingActionIds.has(r.id);
                        return (
                        <tr key={r.id} className="hover:bg-slate-50 transition-colors">
                          <td className="px-4 py-3">
                            <input
                              type="checkbox" checked={selectedIds.has(r.id)}
                              onChange={() => toggleSelect(r.id)}
                              className="rounded border-slate-300"
                            />
                          </td>
                          <td className="px-4 py-3 font-medium text-slate-700">{r.maHocVien}</td>
                          <td className="px-4 py-3 font-medium text-slate-900">{r.hocVienName}</td>
                          <td className="px-4 py-3 text-sm text-slate-600">{r.hocVienEmail}</td>
                          <td className="px-4 py-3 text-sm text-slate-600">{r.hocKiName}</td>
                          <td className="px-4 py-3 text-sm text-slate-600 text-center">{r.soTinChi}</td>
                          <td className="px-4 py-3 font-semibold text-slate-900">
                            {r.soTien.toLocaleString('vi-VN')} VNĐ
                          </td>
                          <td className="px-4 py-3">
                            <span className={`px-2 py-1 rounded-full text-xs font-medium ${STATUS_CLASS[r.trangThai]}`}>
                              {STATUS_LABEL[r.trangThai]}
                            </span>
                          </td>
                          <td className="px-4 py-3">
                            <div className="flex gap-2 flex-wrap">
                              {r.trangThai === 'DANG_XU_LY' && (
                                <>
                                  <button
                                    onClick={() => confirmPayment(r.id)}
                                    disabled={rowPending}
                                    className="px-3 py-1.5 text-xs font-medium bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center gap-1"
                                  >
                                    {rowPending ? <RefreshCw className="w-3 h-3 animate-spin" /> : <ThumbsUp className="w-3 h-3" />} Duyệt
                                  </button>
                                  <button
                                    onClick={() => rejectPayment(r.id)}
                                    disabled={rowPending}
                                    className="px-3 py-1.5 text-xs font-medium bg-red-500 text-white rounded-lg hover:bg-red-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center gap-1"
                                  >
                                    <ThumbsDown className="w-3 h-3" /> Từ chối
                                  </button>
                                </>
                              )}
                              {(r.trangThai === 'CHUA_THANH_TOAN' || r.trangThai === 'QUA_HAN') && (
                                <button
                                  onClick={() => openModal(r)}
                                  disabled={rowPending}
                                  className="px-3 py-1.5 text-xs font-medium bg-slate-600 text-white rounded-lg hover:bg-slate-700 transition-colors flex items-center gap-1"
                                >
                                  <CheckCircle className="w-3 h-3" /> Nhập tay
                                </button>
                              )}
                              {r.trangThai === 'DA_THANH_TOAN' && (
                                <span className="px-3 py-1.5 text-xs font-medium bg-emerald-50 text-emerald-700 rounded-lg">
                                  Đã hoàn tất
                                </span>
                              )}
                              {r.trangThai !== 'DA_THANH_TOAN' && (
                                <button
                                  onClick={() => sendNotify(r.id)}
                                  disabled={rowPending}
                                  className="px-3 py-1.5 text-xs font-medium border border-slate-300 text-slate-600 rounded-lg hover:bg-slate-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center gap-1"
                                >
                                  <Bell className="w-3 h-3" /> Nhắc
                                </button>
                              )}
                              <button
                                onClick={() => openLedger(r, 'debt')}
                                className="px-3 py-1.5 text-xs font-medium border border-slate-300 text-slate-600 rounded-lg hover:bg-slate-50 transition-colors flex items-center gap-1"
                              >
                                <Wallet className="w-3 h-3" /> Công nợ
                              </button>
                              <button
                                onClick={() => openLedger(r, 'history')}
                                className="px-3 py-1.5 text-xs font-medium border border-slate-300 text-slate-600 rounded-lg hover:bg-slate-50 transition-colors flex items-center gap-1"
                              >
                                <History className="w-3 h-3" /> Lịch sử
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

      {/* Payment Modal */}
      {modal && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md">
            <div className="flex items-center justify-between p-6 border-b border-slate-200">
              <h3 className="text-lg font-bold text-slate-900" style={{ fontFamily: "'Sora', sans-serif" }}>
                Xác nhận thanh toán
              </h3>
              <button onClick={() => setModal(null)} className="text-slate-400 hover:text-slate-600">
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="p-6 space-y-4">
              <div className="bg-slate-50 rounded-lg p-4 space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-slate-500">Học viên</span>
                  <span className="font-medium text-slate-900">{modal.item.hocVienName}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Học kỳ</span>
                  <span className="font-medium text-slate-900">{modal.item.hocKiName}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Số tiền</span>
                  <span className="font-bold text-emerald-700">{modal.item.soTien.toLocaleString('vi-VN')} VNĐ</span>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Ngày thanh toán</label>
                  <input
                    type="date" value={modal.ngayThanhToan}
                    onChange={e => setModal(m => m ? { ...m, ngayThanhToan: e.target.value } : m)}
                    className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Phương thức</label>
                  <select
                    value={modal.phuongThucThanhToan}
                    onChange={e => setModal(m => m ? { ...m, phuongThucThanhToan: e.target.value } : m)}
                    className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  >
                    {PHUONG_THUC_OPTIONS.map(o => (
                      <option key={o.value} value={o.value}>{o.label}</option>
                    ))}
                  </select>
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">
                  <Upload className="w-4 h-4 inline mr-1" />
                  Chứng từ thanh toán <span className="text-red-500">*</span>
                </label>
                <div className="inline-flex rounded-lg border border-slate-200 bg-slate-50 p-1 mb-3">
                  <button
                    type="button"
                    onClick={() => setModal(m => m ? { ...m, proofMode: 'transaction' } : m)}
                    className={`px-3 py-1.5 text-sm font-medium rounded-md ${modal.proofMode === 'transaction' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-500'}`}
                  >
                    Mã giao dịch
                  </button>
                  <button
                    type="button"
                    onClick={() => setModal(m => m ? { ...m, proofMode: 'image' } : m)}
                    className={`px-3 py-1.5 text-sm font-medium rounded-md ${modal.proofMode === 'image' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-500'}`}
                  >
                    Ảnh chứng từ
                  </button>
                </div>

                {modal.proofMode === 'transaction' ? (
                  <input
                    type="text"
                    placeholder="Nhập mã giao dịch..."
                    value={modal.transactionCode}
                    onChange={e => setModal(m => m ? { ...m, transactionCode: e.target.value } : m)}
                    className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  />
                ) : (
                  <div className="rounded-xl border border-slate-200 bg-slate-50 p-4">
                    <input
                      ref={proofFileInputRef}
                      type="file"
                      accept="image/*"
                      className="hidden"
                      onChange={handleProofFileChange}
                    />
                    <div className="flex items-center gap-4">
                      {modal.proofPreviewUrl ? (
                        <img
                          src={modal.proofPreviewUrl}
                          alt="Xem trước chứng từ"
                          className="w-20 h-20 rounded-lg object-cover border border-slate-200 bg-white"
                        />
                      ) : (
                        <div className="w-20 h-20 rounded-lg border border-dashed border-slate-300 bg-white flex items-center justify-center text-slate-400">
                          <ImageIcon className="w-7 h-7" />
                        </div>
                      )}
                      <div className="min-w-0 flex-1">
                        <button
                          type="button"
                          onClick={() => proofFileInputRef.current?.click()}
                          className="inline-flex items-center gap-2 px-4 py-2 bg-emerald-50 text-emerald-700 border border-emerald-200 rounded-lg hover:bg-emerald-100 text-sm font-medium"
                        >
                          <ImageIcon className="w-4 h-4" />
                          Chọn ảnh
                        </button>
                        <p className="text-xs text-slate-400 mt-1.5">JPG, PNG, GIF, WEBP - Tối đa 2MB</p>
                        {modal.proofFile && (
                          <button
                            type="button"
                            onClick={() => {
                              setModal(m => m ? { ...m, proofFile: null, proofPreviewUrl: '' } : m);
                              if (proofFileInputRef.current) proofFileInputRef.current.value = '';
                            }}
                            className="text-xs text-red-500 hover:text-red-600 mt-1"
                          >
                            Xóa ảnh
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                )}
              </div>
              {paymentError && (
                <div className="rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm font-medium text-red-700">
                  {paymentError}
                </div>
              )}
            </div>
            <div className="flex gap-3 p-6 pt-0">
              <button
                onClick={() => setModal(null)}
                disabled={saving}
                className="flex-1 px-4 py-2 border border-slate-300 text-slate-600 text-sm font-medium rounded-lg hover:bg-slate-50 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Hủy
              </button>
              <button
                onClick={submitPaymentModal} disabled={saving}
                className="flex-1 px-4 py-2 bg-emerald-600 text-white text-sm font-medium rounded-lg hover:bg-emerald-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                {saving ? <RefreshCw className="w-4 h-4 animate-spin" /> : <CheckCircle className="w-4 h-4" />}
                {saving ? 'Đang xác nhận' : 'Xác nhận'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Invoice Generation Modal */}
      {invoiceModalOpen && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4" onClick={() => setInvoiceModalOpen(false)}>
          <div
            className="bg-white rounded-2xl shadow-2xl w-full max-w-5xl max-h-[88vh] overflow-hidden flex flex-col"
            onClick={event => event.stopPropagation()}
          >
            <div className="flex items-center justify-between p-6 border-b border-slate-200">
              <div>
                <h3 className="text-lg font-bold text-slate-900">Tạo hóa đơn học phí</h3>
                <p className="mt-1 text-sm text-slate-500">Đơn giá hiện tại: 700.000 VNĐ / tín chỉ</p>
              </div>
              <button onClick={() => setInvoiceModalOpen(false)} className="text-slate-400 hover:text-slate-600">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-6 border-b border-slate-200 space-y-4">
              <div className="grid gap-3 md:grid-cols-[minmax(260px,360px)_1fr] items-end">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Học kỳ</label>
                  <select
                    value={selectedInvoiceSemesterId}
                    onChange={event => handleInvoiceSemesterChange(event.target.value)}
                    disabled={invoiceSemestersLoading}
                    className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 disabled:bg-slate-50"
                  >
                    <option value="">
                      {invoiceSemestersLoading ? 'Đang tải học kỳ...' : 'Chọn học kỳ'}
                    </option>
                    {invoiceSemesters.map(item => (
                      <option key={item.hocKiId} value={item.hocKiId}>
                        {item.hocKiName} ({item.hocKiMa})
                      </option>
                    ))}
                  </select>
                </div>
                {selectedInvoiceSemester && (
                  <p className="text-sm text-slate-500">
                    {selectedInvoiceSemester.soHocVienDangKy} học viên đăng ký, {selectedInvoiceSemester.tongTinChi} tín chỉ,
                    dự kiến {selectedInvoiceSemester.tongTienDuKien.toLocaleString('vi-VN')} VNĐ
                  </p>
                )}
              </div>

              {!invoiceSemestersLoading && invoiceSemesters.length === 0 && (
                <div className="rounded-lg border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-500">
                  Chưa có học kỳ nào có dữ liệu đăng ký tín chỉ.
                </div>
              )}

              {invoicePreview && invoiceTotals && (
                <div className="grid gap-3 sm:grid-cols-3">
                  <div className="rounded-xl border border-slate-200 bg-slate-50 p-4">
                    <p className="text-xs font-medium uppercase text-slate-500">Học viên</p>
                    <p className="mt-1 text-lg font-bold text-slate-900">{invoicePreview.tongHocVien}</p>
                  </div>
                  <div className="rounded-xl border border-slate-200 bg-slate-50 p-4">
                    <p className="text-xs font-medium uppercase text-slate-500">Tổng tín chỉ</p>
                    <p className="mt-1 text-lg font-bold text-slate-900">{invoiceTotals.tongTinChi}</p>
                  </div>
                  <div className="rounded-xl border border-slate-200 bg-slate-50 p-4">
                    <p className="text-xs font-medium uppercase text-slate-500">Có thể tạo mới</p>
                    <p className="mt-1 text-lg font-bold text-slate-900">{invoiceTotals.coTheTao}</p>
                  </div>
                </div>
              )}
            </div>

            <div className="flex-1 overflow-auto p-6">
              {invoicePreviewLoading ? (
                <div className="py-16 text-center text-slate-400">Đang tải danh sách học viên...</div>
              ) : !invoicePreview ? (
                <div className="py-16 text-center text-slate-400">Chọn học kỳ để xem danh sách tạo hóa đơn.</div>
              ) : invoicePreview.items.length === 0 ? (
                <div className="rounded-xl border border-slate-200 bg-slate-50 p-6 text-center text-sm text-slate-500">
                  Học kỳ này chưa có học viên đăng ký tín chỉ.
                </div>
              ) : (
                <div className="overflow-x-auto rounded-xl border border-slate-200">
                  <table className="w-full text-sm">
                    <thead className="bg-slate-50 text-xs uppercase tracking-wide text-slate-500">
                      <tr>
                        <th className="px-4 py-3 text-left">Mã sinh viên</th>
                        <th className="px-4 py-3 text-left">Học viên</th>
                        <th className="px-4 py-3 text-left">Email</th>
                        <th className="px-4 py-3 text-left">Tổng tín chỉ</th>
                        <th className="px-4 py-3 text-left">Số tiền</th>
                        <th className="px-4 py-3 text-left">Tình trạng hóa đơn</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {invoicePreview.items.map(item => (
                        <tr key={item.hocVienId}>
                          <td className="px-4 py-3 font-medium text-slate-700">{item.maHocVien}</td>
                          <td className="px-4 py-3 text-slate-900">{item.hocVienName}</td>
                          <td className="px-4 py-3 text-slate-600">{item.hocVienEmail}</td>
                          <td className="px-4 py-3">{item.tongSoTinChi}</td>
                          <td className="px-4 py-3 font-semibold">{item.soTien.toLocaleString('vi-VN')} VNĐ</td>
                          <td className="px-4 py-3">
                            {item.daCoHoaDon && item.trangThaiHocPhi ? (
                              <span className={`px-2 py-1 rounded-full text-xs font-medium ${STATUS_CLASS[item.trangThaiHocPhi]}`}>
                                {STATUS_LABEL[item.trangThaiHocPhi]}
                              </span>
                            ) : (
                              <span className="px-2 py-1 rounded-full text-xs font-medium bg-slate-100 text-slate-600">
                                Chưa tạo
                              </span>
                            )}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>

            <div className="flex items-center justify-between gap-3 p-6 border-t border-slate-200">
              <div className="text-sm text-slate-500">
                {invoicePreview && invoicePreview.soHoaDonDaTao > 0
                  ? `Đã tạo ${invoicePreview.soHoaDonDaTao} hóa đơn, tổng ${invoicePreview.tongTienDaTao.toLocaleString('vi-VN')} VNĐ`
                  : 'Hệ thống chỉ tạo hóa đơn cho học viên chưa có hóa đơn trong học kỳ đã chọn.'}
              </div>
              <div className="flex gap-3">
                <button
                  onClick={() => setInvoiceModalOpen(false)}
                  className="px-4 py-2 border border-slate-300 text-slate-600 text-sm font-medium rounded-lg hover:bg-slate-50"
                >
                  Đóng
                </button>
                <button
                  onClick={generateInvoices}
                  disabled={!selectedInvoiceSemesterId || !invoiceTotals?.coTheTao || invoiceGenerating}
                  className="px-4 py-2 bg-emerald-600 text-white text-sm font-medium rounded-lg hover:bg-emerald-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                >
                  {invoiceGenerating ? <RefreshCw className="w-4 h-4 animate-spin" /> : <FilePlus2 className="w-4 h-4" />}
                  {invoiceGenerating ? 'Đang tạo' : 'Tạo hóa đơn'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {toast && <Toast type={toast.type} message={toast.message} onClose={() => setToast(null)} />}

      {/* Ledger Modal */}
      {ledgerModal && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4" onClick={() => setLedgerModal(null)}>
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-4xl max-h-[85vh] overflow-hidden flex flex-col" onClick={e => e.stopPropagation()}>
            <div className="flex items-center justify-between p-6 border-b border-slate-200">
              <div>
                <h3 className="text-lg font-bold text-slate-900">
                  {ledgerModal.mode === 'debt' ? 'Chi tiết công nợ' : 'Lịch sử thanh toán'}
                </h3>
                {ledger && (
                  <p className="text-sm text-slate-500 mt-1">
                    {ledger.maHocVien} - {ledger.hocVienName}
                  </p>
                )}
              </div>
              <button onClick={() => setLedgerModal(null)} className="text-slate-400 hover:text-slate-600">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="px-6 pt-5">
              <div className="inline-flex rounded-xl border border-slate-200 bg-slate-50 p-1">
                <button
                  onClick={() => setLedgerModal(current => current ? { ...current, mode: 'debt' } : current)}
                  className={`px-4 py-2 text-sm font-medium rounded-lg transition-colors ${ledgerModal.mode === 'debt' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-500'}`}
                >
                  Công nợ
                </button>
                <button
                  onClick={() => setLedgerModal(current => current ? { ...current, mode: 'history' } : current)}
                  className={`px-4 py-2 text-sm font-medium rounded-lg transition-colors ${ledgerModal.mode === 'history' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-500'}`}
                >
                  Lịch sử thanh toán
                </button>
              </div>
            </div>

            <div className="p-6 pt-5 overflow-auto space-y-5">
              {ledgerLoading || !ledger ? (
                <div className="py-14 text-center text-slate-400">Đang tải dữ liệu...</div>
              ) : (
                <>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    <SummaryCard label="Tổng công nợ" value={`${ledger.tongCongNo.toLocaleString('vi-VN')} VNĐ`} tone="amber" />
                    <SummaryCard label="Đã thanh toán" value={`${ledger.tongDaThanhToan.toLocaleString('vi-VN')} VNĐ`} tone="emerald" />
                    <SummaryCard label="Quá hạn" value={`${ledger.tongQuaHan.toLocaleString('vi-VN')} VNĐ`} tone="red" />
                  </div>

                  {ledgerModal.mode === 'debt' ? (
                    ledger.congNoItems.length === 0 ? (
                      <div className="rounded-xl border border-emerald-100 bg-emerald-50 p-6 text-center text-sm text-emerald-700">
                        Học viên không còn công nợ.
                      </div>
                    ) : (
                      <div className="overflow-x-auto rounded-xl border border-slate-200">
                        <table className="w-full text-sm">
                          <thead className="bg-slate-50 text-xs uppercase tracking-wide text-slate-500">
                            <tr>
                              <th className="px-4 py-3 text-left">Học kỳ</th>
                              <th className="px-4 py-3 text-left">Số tín chỉ</th>
                              <th className="px-4 py-3 text-left">Số tiền</th>
                              <th className="px-4 py-3 text-left">Trạng thái</th>
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-slate-100">
                            {ledger.congNoItems.map(item => (
                              <tr key={item.id}>
                                <td className="px-4 py-3">{item.hocKiName} ({item.hocKiMa})</td>
                                <td className="px-4 py-3">{item.soTinChi}</td>
                                <td className="px-4 py-3 font-semibold">{item.soTien.toLocaleString('vi-VN')} VNĐ</td>
                                <td className="px-4 py-3">
                                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${STATUS_CLASS[item.trangThai]}`}>
                                    {STATUS_LABEL[item.trangThai]}
                                  </span>
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    )
                  ) : ledger.lichSuThanhToan.length === 0 ? (
                    <div className="rounded-xl border border-slate-200 bg-slate-50 p-6 text-center text-sm text-slate-500">
                      Chưa có lịch sử thanh toán.
                    </div>
                  ) : (
                    <div className="overflow-x-auto rounded-xl border border-slate-200">
                      <table className="w-full text-sm">
                        <thead className="bg-slate-50 text-xs uppercase tracking-wide text-slate-500">
                          <tr>
                            <th className="px-4 py-3 text-left">Học kỳ</th>
                            <th className="px-4 py-3 text-left">Ngày thanh toán</th>
                            <th className="px-4 py-3 text-left">Số tiền</th>
                            <th className="px-4 py-3 text-left">Phương thức</th>
                            <th className="px-4 py-3 text-left">Chứng từ</th>
                            <th className="px-4 py-3 text-left">Trạng thái</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                          {ledger.lichSuThanhToan.map(item => (
                            <tr key={item.id}>
                              <td className="px-4 py-3">{item.hocKiName} ({item.hocKiMa})</td>
                              <td className="px-4 py-3">{formatDate(item.ngayThanhToan)}</td>
                              <td className="px-4 py-3 font-semibold">{item.soTien.toLocaleString('vi-VN')} VNĐ</td>
                              <td className="px-4 py-3">{item.phuongThucThanhToan?.replace(/_/g, ' ') ?? '—'}</td>
                              <td className="px-4 py-3 text-xs">
                                {item.fileChungTu ? (
                                  item.fileChungTu.startsWith('/api/files/')
                                    ? (
                                      <a
                                        href={resolveFileUrl(item.fileChungTu)}
                                        target="_blank"
                                        rel="noreferrer"
                                        className="font-medium text-emerald-700 hover:text-emerald-800"
                                      >
                                        Xem ảnh
                                      </a>
                                    )
                                    : <span className="font-mono">{item.fileChungTu}</span>
                                ) : '—'}
                              </td>
                              <td className="px-4 py-3">
                                <span className={`px-2 py-1 rounded-full text-xs font-medium ${STATUS_CLASS[item.trangThai]}`}>
                                  {STATUS_LABEL[item.trangThai]}
                                </span>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  )}
                </>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function SummaryCard({ label, value, tone }: { label: string; value: string; tone: 'amber' | 'emerald' | 'red' }) {
  const toneClass = {
    amber: 'border-amber-200 bg-amber-50 text-amber-800',
    emerald: 'border-emerald-200 bg-emerald-50 text-emerald-800',
    red: 'border-red-200 bg-red-50 text-red-800',
  }[tone];

  return (
    <div className={`rounded-xl border p-4 ${toneClass}`}>
      <p className="text-xs font-medium uppercase tracking-wide opacity-80">{label}</p>
      <p className="mt-1 text-lg font-bold">{value}</p>
    </div>
  );
}
