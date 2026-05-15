import { AccountantSidebar } from '@/components/layouts/AccountantSidebar';
import { AccountantHeader } from '@/components/layouts/AccountantHeader';
import { useState, useMemo, useCallback } from 'react';
import {
  Search, Bell, CheckCircle, X, RefreshCw, Upload, ThumbsUp, ThumbsDown, Eye
} from 'lucide-react';
import {
  accountingApi,
  type AccountingHocPhiResponse,
  type TrangThaiHocPhi,
  type CreatePaymentRequest
} from '@/api/accounting/accounting.api';
import { useAsync } from '@/hooks';
import { Toast } from '@/components/notification/Toast';

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
  fileChungTu: string;
  phuongThucThanhToan: string;
}

const formatDate = (dt: string | null) => {
  if (!dt) return '—';
  return new Date(dt).toLocaleDateString('vi-VN', { day: '2-digit', month: '2-digit', year: 'numeric' });
};

export default function TuitionManagementPage() {
  const [search, setSearch] = useState('');
  const [filterStatus, setFilterStatus] = useState<TrangThaiHocPhi | 'ALL'>('ALL');
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [modal, setModal] = useState<PaymentModal | null>(null);
  const [detailItem, setDetailItem] = useState<AccountingHocPhiResponse | null>(null);
  const [saving, setSaving] = useState(false);
  const [toast, setToast] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

  const todayStr = new Date().toISOString().slice(0, 10);

  const { data: list = [], loading, execute: reload } = useAsync<AccountingHocPhiResponse[]>(
    () => accountingApi.getAllHocPhi(),
    []
  );

  const filtered = useMemo(() => {
    return (list ?? []).filter(r => {
      const matchStatus = filterStatus === 'ALL' || r.trangThai === filterStatus;
      const q = search.toLowerCase();
      const matchSearch =
        !q ||
        r.hocVienName?.toLowerCase().includes(q) ||
        r.hocVienEmail?.toLowerCase().includes(q) ||
        r.hocKiMa?.toLowerCase().includes(q);
      return matchStatus && matchSearch;
    });
  }, [list, search, filterStatus]);

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
    setModal({ item, ngayThanhToan: todayStr, fileChungTu: '', phuongThucThanhToan: 'TIEN_MAT' });
  };

  const submitPaymentModal = useCallback(async () => {
    if (!modal) return;
    if (!modal.fileChungTu.trim()) {
      setToast({ type: 'error', message: 'Vui lòng nhập chứng từ / mã giao dịch' });
      return;
    }
    setSaving(true);
    try {
      const payload: CreatePaymentRequest = {
        hocPhiId: modal.item.id,
        ngayThanhToan: modal.ngayThanhToan || undefined,
        fileChungTu: modal.fileChungTu,
        phuongThucThanhToan: modal.phuongThucThanhToan,
      };
      await accountingApi.createPayment(modal.item.id, payload);
      setToast({ type: 'success', message: 'Xác nhận thanh toán thành công!' });
      setModal(null);
      reload();
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Lỗi xác nhận thanh toán';
      setToast({ type: 'error', message: msg });
    } finally {
      setSaving(false);
    }
  }, [modal, reload]);

  const sendNotify = useCallback(async (id: string) => {
    try {
      await accountingApi.sendNotification(id);
      setToast({ type: 'success', message: 'Đã gửi thông báo!' });
    } catch {
      setToast({ type: 'error', message: 'Gửi thông báo thất bại' });
    }
  }, []);

  const confirmPayment = useCallback(async (id: string) => {
    try {
      await accountingApi.confirmPayment(id);
      setToast({ type: 'success', message: 'Đã xác nhận thanh toán!' });
      reload();
    } catch {
      setToast({ type: 'error', message: 'Xác nhận thất bại' });
    }
  }, [reload]);

  const rejectPayment = useCallback(async (id: string) => {
    try {
      await accountingApi.rejectPayment(id);
      setToast({ type: 'success', message: 'Đã từ chối, học viên cần nộp lại chứng từ' });
      reload();
    } catch {
      setToast({ type: 'error', message: 'Từ chối thất bại' });
    }
  }, [reload]);

  return (
    <div className="flex h-screen bg-stone-50">
      <AccountantSidebar />
      <div className="flex-1 ml-64 flex flex-col">
        <AccountantHeader title="Quản lý học phí" />
        <div className="flex-1 overflow-auto p-6">
          <div className="max-w-7xl mx-auto space-y-4">

            {/* Toolbar */}
            <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-4 flex flex-wrap gap-3 items-center">
              <div className="relative flex-1 min-w-[200px]">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                <input
                  type="text" placeholder="Tìm học viên, email, học kỳ..."
                  value={search} onChange={e => setSearch(e.target.value)}
                  className="w-full pl-9 pr-3 py-2 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
                />
              </div>
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
                onClick={reload}
                className="px-4 py-2 border border-slate-300 text-slate-600 text-sm rounded-lg hover:bg-slate-50 flex items-center gap-2"
              >
                <RefreshCw className="w-4 h-4" /> Làm mới
              </button>
              <span className="text-sm text-slate-500 ml-auto">{filtered.length} bản ghi</span>
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
                        {['Học viên', 'Email', 'Học kỳ', 'Số tín chỉ', 'Số tiền', 'Trạng thái', 'Thao tác'].map(h => (
                          <th key={h} className="px-4 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wide">{h}</th>
                        ))}
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {filtered.map(r => (
                        <tr key={r.id} className="hover:bg-slate-50 transition-colors">
                          <td className="px-4 py-3">
                            <input
                              type="checkbox" checked={selectedIds.has(r.id)}
                              onChange={() => toggleSelect(r.id)}
                              className="rounded border-slate-300"
                            />
                          </td>
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
                                    className="px-3 py-1.5 text-xs font-medium bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition-colors flex items-center gap-1"
                                  >
                                    <ThumbsUp className="w-3 h-3" /> Duyệt
                                  </button>
                                  <button
                                    onClick={() => rejectPayment(r.id)}
                                    className="px-3 py-1.5 text-xs font-medium bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors flex items-center gap-1"
                                  >
                                    <ThumbsDown className="w-3 h-3" /> Từ chối
                                  </button>
                                  <button
                                    onClick={() => setDetailItem(r)}
                                    className="px-3 py-1.5 text-xs font-medium border border-blue-300 text-blue-600 rounded-lg hover:bg-blue-50 transition-colors flex items-center gap-1"
                                  >
                                    <Eye className="w-3 h-3" /> Xem
                                  </button>
                                </>
                              )}
                              {(r.trangThai === 'CHUA_THANH_TOAN' || r.trangThai === 'QUA_HAN') && (
                                <button
                                  onClick={() => openModal(r)}
                                  className="px-3 py-1.5 text-xs font-medium bg-slate-600 text-white rounded-lg hover:bg-slate-700 transition-colors flex items-center gap-1"
                                >
                                  <CheckCircle className="w-3 h-3" /> Nhập tay
                                </button>
                              )}
                              {r.trangThai === 'DA_THANH_TOAN' && (
                                <button
                                  onClick={() => setDetailItem(r)}
                                  className="px-3 py-1.5 text-xs font-medium border border-emerald-300 text-emerald-600 rounded-lg hover:bg-emerald-50 transition-colors flex items-center gap-1"
                                >
                                  <Eye className="w-3 h-3" /> Chi tiết
                                </button>
                              )}
                              {r.trangThai !== 'DA_THANH_TOAN' && (
                                <button
                                  onClick={() => sendNotify(r.id)}
                                  className="px-3 py-1.5 text-xs font-medium border border-slate-300 text-slate-600 rounded-lg hover:bg-slate-50 transition-colors flex items-center gap-1"
                                >
                                  <Bell className="w-3 h-3" /> Nhắc
                                </button>
                              )}
                            </div>
                          </td>
                        </tr>
                      ))}
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
                  Chứng từ / Mã giao dịch <span className="text-red-500">*</span>
                </label>
                <input
                  type="text" placeholder="Nhập mã giao dịch hoặc URL chứng từ..."
                  value={modal.fileChungTu}
                  onChange={e => setModal(m => m ? { ...m, fileChungTu: e.target.value } : m)}
                  className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
                />
              </div>
            </div>
            <div className="flex gap-3 p-6 pt-0">
              <button
                onClick={() => setModal(null)}
                className="flex-1 px-4 py-2 border border-slate-300 text-slate-600 text-sm font-medium rounded-lg hover:bg-slate-50"
              >
                Hủy
              </button>
              <button
                onClick={submitPaymentModal} disabled={saving}
                className="flex-1 px-4 py-2 bg-emerald-600 text-white text-sm font-medium rounded-lg hover:bg-emerald-700 disabled:opacity-50 flex items-center justify-center gap-2"
              >
                {saving ? <RefreshCw className="w-4 h-4 animate-spin" /> : <CheckCircle className="w-4 h-4" />}
                Xác nhận
              </button>
            </div>
          </div>
        </div>
      )}

      {toast && <Toast type={toast.type} message={toast.message} onClose={() => setToast(null)} />}

      {/* Detail Modal (xem chứng từ) */}
      {detailItem && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4" onClick={() => setDetailItem(null)}>
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md" onClick={e => e.stopPropagation()}>
            <div className="flex items-center justify-between p-6 border-b border-slate-200">
              <h3 className="text-lg font-bold text-slate-900">Chi tiết thanh toán</h3>
              <button onClick={() => setDetailItem(null)} className="text-slate-400 hover:text-slate-600">
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="p-6 space-y-3 text-sm">
              <div className="bg-slate-50 rounded-xl p-4 space-y-2">
                <Row label="Học viên" value={detailItem.hocVienName} />
                <Row label="Email" value={detailItem.hocVienEmail} />
                <Row label="Học kỳ" value={`${detailItem.hocKiName} (${detailItem.hocKiMa})`} />
                <Row label="Số tín chỉ" value={`${detailItem.soTinChi} TC`} />
                <Row label="Số tiền" value={`${detailItem.soTien.toLocaleString('vi-VN')} VNĐ`} bold />
              </div>
              {(detailItem.ngayThanhToan || detailItem.phuongThucThanhToan || detailItem.fileChungTu) && (
                <div className={`rounded-xl p-4 space-y-2 ${detailItem.trangThai === 'DA_THANH_TOAN' ? 'bg-emerald-50 border border-emerald-200' : 'bg-blue-50 border border-blue-200'}`}>
                  <p className={`font-semibold text-xs uppercase tracking-wide mb-1 ${detailItem.trangThai === 'DA_THANH_TOAN' ? 'text-emerald-600' : 'text-blue-600'}`}>
                    Thông tin chứng từ
                  </p>
                  <Row label="Ngày thanh toán" value={formatDate(detailItem.ngayThanhToan)} />
                  <Row label="Phương thức" value={detailItem.phuongThucThanhToan?.replace(/_/g, ' ') ?? '—'} />
                  <Row label="Mã giao dịch" value={detailItem.fileChungTu ?? '—'} mono />
                  <Row label="Ref nội bộ" value={detailItem.maGiaoDich ?? '—'} mono />
                </div>
              )}
            </div>
            <div className="px-6 pb-6">
              <button
                onClick={() => setDetailItem(null)}
                className="w-full py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 text-sm font-medium rounded-xl transition-colors"
              >
                Đóng
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function Row({ label, value, bold, mono }: { label: string; value: string; bold?: boolean; mono?: boolean }) {
  return (
    <div className="flex justify-between gap-2">
      <span className="text-slate-500 shrink-0">{label}</span>
      <span className={`text-right ${bold ? 'font-bold text-emerald-700' : 'font-medium text-slate-900'} ${mono ? 'font-mono text-xs' : ''}`}>
        {value}
      </span>
    </div>
  );
}
