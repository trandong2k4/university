import { AccountantSidebar } from '@/components/layouts/AccountantSidebar';
import { AccountantHeader } from '@/components/layouts/AccountantHeader';
import { useState, useMemo, useCallback, useEffect } from 'react';
import {
  DollarSign, CreditCard, Clock, AlertTriangle,
  Download, RefreshCw, Printer, FileText, TrendingUp,
} from 'lucide-react';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell,
} from 'recharts';
import { accountingApi, type BaoCaoThongKeOverviewResponse, type PaymentInfoResponse } from '@/api/accounting/accounting.api';
import { Toast } from '@/components/notification/Toast';

// ─── helpers ────────────────────────────────────────────────────────────────

const fmtVND = (n: number) =>
  n >= 1_000_000_000
    ? `${(n / 1_000_000_000).toFixed(2)} tỷ`
    : n >= 1_000_000
    ? `${(n / 1_000_000).toFixed(1)}M`
    : n.toLocaleString('vi-VN');

const fmtVNDFull = (n: number) => `${(n ?? 0).toLocaleString('vi-VN')} VNĐ`;

const fmtDate = (s: string | null | undefined) => {
  if (!s) return '—';
  try { return new Date(s).toLocaleDateString('vi-VN'); } catch { return s; }
};

const METHOD_LABELS: Record<string, string> = {
  BANK_TRANSFER: 'Chuyển khoản',
  CASH: 'Tiền mặt',
  ONLINE: 'Trực tuyến',
  VNPAY: 'VNPay',
  MOMO: 'MoMo',
};
const fmtMethod = (m: string | null | undefined) =>
  m ? (METHOD_LABELS[m] ?? m) : '—';

// ─── Print styles (injected once) ───────────────────────────────────────────

const PRINT_STYLE_ID = 'financial-report-print-style';
function ensurePrintStyle() {
  if (document.getElementById(PRINT_STYLE_ID)) return;
  const style = document.createElement('style');
  style.id = PRINT_STYLE_ID;
  style.textContent = `
    @media print {
      body > * { display: none !important; }
      #financial-print-area { display: block !important; }
      #financial-print-area { font-family: 'Times New Roman', serif; font-size: 12pt; color: #000; }
      #financial-print-area h1 { font-size: 18pt; text-align: center; font-weight: bold; margin-bottom: 4px; }
      #financial-print-area .print-sub { text-align: center; font-size: 10pt; color: #444; margin-bottom: 16px; }
      #financial-print-area .print-stats { display: flex; gap: 16px; margin-bottom: 16px; }
      #financial-print-area .print-stat { flex: 1; border: 1px solid #ccc; padding: 8px; border-radius: 4px; }
      #financial-print-area table { width: 100%; border-collapse: collapse; font-size: 11pt; }
      #financial-print-area th { background: #f0f0f0; border: 1px solid #aaa; padding: 6px 8px; text-align: left; font-weight: bold; }
      #financial-print-area td { border: 1px solid #ccc; padding: 5px 8px; }
      #financial-print-area tr:nth-child(even) td { background: #fafafa; }
      #financial-print-area .print-total { font-weight: bold; border-top: 2px solid #555; }
      #financial-print-area .print-footer { margin-top: 16px; font-size: 9pt; color: #666; text-align: right; }
    }
    #financial-print-area { display: none; }
  `;
  document.head.appendChild(style);
}

// ────────────────────────────────────────────────────────────────────────────

export default function FinancialReportsPage() {
  const today = new Date();
  const firstOfYear = `${today.getFullYear()}-01-01`;
  const todayStr = today.toISOString().slice(0, 10);

  const [start, setStart] = useState(firstOfYear);
  const [end, setEnd] = useState(todayStr);
  const [appliedStart, setAppliedStart] = useState(firstOfYear);
  const [appliedEnd, setAppliedEnd] = useState(todayStr);

  const [overview, setOverview] = useState<BaoCaoThongKeOverviewResponse | null>(null);
  const [payments, setPayments] = useState<PaymentInfoResponse[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [toast, setToast] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

  useEffect(() => { ensurePrintStyle(); }, []);

  const fetchData = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const [ov, pays] = await Promise.all([
        accountingApi.getOverview(appliedStart, appliedEnd),
        accountingApi.getPayments(appliedStart, appliedEnd),
      ]);
      setOverview(ov);
      setPayments(pays ?? []);
    } catch {
      setError('Không thể tải dữ liệu. Vui lòng thử lại.');
      setToast({ type: 'error', message: 'Lỗi tải dữ liệu báo cáo' });
    } finally {
      setLoading(false);
    }
  }, [appliedStart, appliedEnd]);

  useEffect(() => { fetchData(); }, [fetchData]);

  const apply = () => {
    if (start > end) {
      setToast({ type: 'error', message: '"Từ ngày" không được lớn hơn "Đến ngày"' });
      return;
    }
    setAppliedStart(start);
    setAppliedEnd(end);
  };

  const revenueData = useMemo(() => {
    if (!overview?.doanhThuTheoThang?.length) return [];
    return overview.doanhThuTheoThang.map(m => ({
      thang: m.namThang.replace(/^(\d{4})-(\d{2})$/, 'T$2/$1'),
      doanhThu: m.doanhThu,
    }));
  }, [overview]);

  // ── Export Excel (CSV) ─────────────────────────────────────────────────────
  const exportExcel = useCallback(() => {
    if (!payments.length) {
      setToast({ type: 'error', message: 'Không có dữ liệu để xuất' });
      return;
    }
    const header = 'STT,Học viên,Số tiền (VNĐ),Ngày thanh toán,Phương thức,Mã giao dịch';
    const lines = payments.map((p, i) =>
      `${i + 1},"${p.hocVienName ?? ''}",${p.amount ?? 0},"${fmtDate(p.ngayThanhToan)}","${fmtMethod(p.phuongThucThanhToan)}","${p.maGiaoDichGateway ?? ''}"`
    );
    const totalRow = `,,${payments.reduce((s, p) => s + (p.amount ?? 0), 0)},,,`;
    const csv = ['﻿' + header, ...lines, `"TỔNG CỘNG",${totalRow}`].join('\n');
    const url = URL.createObjectURL(new Blob([csv], { type: 'text/csv;charset=utf-8;' }));
    const a = document.createElement('a');
    a.href = url;
    a.download = `bao-cao-hoc-phi_${appliedStart}_${appliedEnd}.csv`;
    a.click();
    URL.revokeObjectURL(url);
    setToast({ type: 'success', message: 'Đã xuất file Excel thành công' });
  }, [payments, appliedStart, appliedEnd]);

  // ── Export PDF (print) ─────────────────────────────────────────────────────
  const exportPDF = useCallback(() => {
    if (!payments.length && !overview) {
      setToast({ type: 'error', message: 'Không có dữ liệu để xuất' });
      return;
    }
    window.print();
  }, [payments, overview]);

  const totalAmount = useMemo(
    () => payments.reduce((s, p) => s + (p.amount ?? 0), 0),
    [payments]
  );

  const stats = [
    {
      id: 'revenue',
      label: 'Tổng doanh thu',
      value: fmtVNDFull(overview?.tongDoanhThu ?? 0),
      icon: <DollarSign className="w-6 h-6" />,
      bg: 'bg-emerald-50',
      iconBg: 'bg-emerald-100',
      text: 'text-emerald-600',
      border: 'border-emerald-200',
    },
    {
      id: 'paid',
      label: 'Số giao dịch',
      value: `${overview?.soLuongThanhToan ?? 0} giao dịch`,
      icon: <CreditCard className="w-6 h-6" />,
      bg: 'bg-blue-50',
      iconBg: 'bg-blue-100',
      text: 'text-blue-600',
      border: 'border-blue-200',
    },
    {
      id: 'pending',
      label: 'Chờ thanh toán',
      value: fmtVNDFull(overview?.tongCanThanhToan ?? 0),
      icon: <Clock className="w-6 h-6" />,
      bg: 'bg-amber-50',
      iconBg: 'bg-amber-100',
      text: 'text-amber-600',
      border: 'border-amber-200',
    },
    {
      id: 'overdue',
      label: 'Quá hạn',
      value: fmtVNDFull(overview?.tongQuaHan ?? 0),
      icon: <AlertTriangle className="w-6 h-6" />,
      bg: 'bg-red-50',
      iconBg: 'bg-red-100',
      text: 'text-red-600',
      border: 'border-red-200',
    },
  ];

  const dateRangeLabel = `${fmtDate(appliedStart)} – ${fmtDate(appliedEnd)}`;

  return (
    <div className="flex h-screen bg-stone-50">
      <AccountantSidebar />

      <div className="flex-1 ml-64 flex flex-col min-w-0">
        <AccountantHeader title="Báo cáo thống kê" />

        <div className="flex-1 overflow-auto p-6">
          <div className="max-w-7xl mx-auto space-y-6">

            {/* ── Page heading ──────────────────────────────────────────── */}
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-2xl font-bold text-slate-800" style={{ fontFamily: "'Sora', sans-serif" }}>
                  Báo cáo học phí
                </h2>
                <p className="text-sm text-slate-500 mt-0.5 flex items-center gap-1">
                  <FileText className="w-4 h-4" />
                  Khoảng thời gian: <span className="font-medium text-slate-700">{dateRangeLabel}</span>
                </p>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={exportExcel}
                  disabled={loading || !payments.length}
                  className="flex items-center gap-2 px-4 py-2 border border-emerald-500 text-emerald-700 text-sm font-medium rounded-lg hover:bg-emerald-50 transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
                >
                  <Download className="w-4 h-4" />
                  Xuất Excel
                </button>
                <button
                  onClick={exportPDF}
                  disabled={loading}
                  className="flex items-center gap-2 px-4 py-2 bg-slate-700 text-white text-sm font-medium rounded-lg hover:bg-slate-800 transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
                >
                  <Printer className="w-4 h-4" />
                  Xuất PDF
                </button>
              </div>
            </div>

            {/* ── Filter bar ────────────────────────────────────────────── */}
            <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-4 flex flex-wrap gap-4 items-end">
              <div>
                <label className="block text-xs font-medium text-slate-500 mb-1">Từ ngày</label>
                <input
                  type="date"
                  value={start}
                  max={end}
                  onChange={e => setStart(e.target.value)}
                  className="border border-slate-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-slate-500 mb-1">Đến ngày</label>
                <input
                  type="date"
                  value={end}
                  min={start}
                  onChange={e => setEnd(e.target.value)}
                  className="border border-slate-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
                />
              </div>
              <button
                onClick={apply}
                disabled={loading}
                className="px-5 py-2 bg-emerald-600 text-white text-sm font-semibold rounded-lg hover:bg-emerald-700 transition-colors disabled:opacity-50"
              >
                Áp dụng
              </button>
              <button
                onClick={fetchData}
                disabled={loading}
                className="px-4 py-2 border border-slate-300 text-slate-600 text-sm font-medium rounded-lg hover:bg-slate-50 transition-colors flex items-center gap-2 disabled:opacity-50"
              >
                <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
                Làm mới
              </button>

              {error && (
                <p className="ml-auto text-sm text-red-500 flex items-center gap-1">
                  <AlertTriangle className="w-4 h-4" /> {error}
                </p>
              )}
            </div>

            {/* ── Stat Cards ────────────────────────────────────────────── */}
            {loading ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
                {[1,2,3,4].map(i => (
                  <div key={i} className="bg-white rounded-xl border border-slate-200 p-6 animate-pulse">
                    <div className="h-12 w-12 bg-slate-200 rounded-xl mb-4" />
                    <div className="h-3 bg-slate-200 rounded w-2/3 mb-3" />
                    <div className="h-6 bg-slate-200 rounded w-1/2" />
                  </div>
                ))}
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
                {stats.map(s => (
                  <div key={s.id} className={`${s.bg} rounded-xl border ${s.border} p-5 flex items-start gap-4`}>
                    <div className={`w-11 h-11 ${s.iconBg} rounded-xl flex items-center justify-center shrink-0`}>
                      <span className={s.text}>{s.icon}</span>
                    </div>
                    <div className="min-w-0">
                      <p className="text-xs font-medium text-slate-500 mb-1">{s.label}</p>
                      <p className="text-lg font-bold text-slate-900 leading-tight truncate"
                        style={{ fontFamily: "'Sora', sans-serif" }}>
                        {s.value}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* ── Revenue Chart ─────────────────────────────────────────── */}
            <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
              <div className="flex items-center gap-2 mb-5">
                <TrendingUp className="w-5 h-5 text-emerald-600" />
                <h3 className="text-base font-bold text-slate-800" style={{ fontFamily: "'Sora', sans-serif" }}>
                  Doanh thu theo tháng
                </h3>
              </div>

              {loading ? (
                <div className="h-56 bg-slate-100 rounded-lg animate-pulse" />
              ) : revenueData.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-48 text-slate-400 gap-2">
                  <TrendingUp className="w-10 h-10 opacity-30" />
                  <span className="text-sm">Chưa có dữ liệu trong khoảng thời gian này</span>
                </div>
              ) : (
                <ResponsiveContainer width="100%" height={260}>
                  <BarChart data={revenueData} margin={{ top: 5, right: 20, left: 10, bottom: 5 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" vertical={false} />
                    <XAxis dataKey="thang" stroke="#94a3b8" tick={{ fontSize: 12 }} axisLine={false} tickLine={false} />
                    <YAxis stroke="#94a3b8" tick={{ fontSize: 11 }} axisLine={false} tickLine={false}
                      tickFormatter={v => v >= 1_000_000 ? `${(v / 1_000_000).toFixed(0)}M` : String(v)} />
                    <Tooltip
                      formatter={(v: number) => [fmtVNDFull(v), 'Doanh thu']}
                      contentStyle={{ borderRadius: '8px', border: '1px solid #e2e8f0', fontSize: '12px' }}
                    />
                    <Bar dataKey="doanhThu" radius={[6, 6, 0, 0]} maxBarSize={48}>
                      {revenueData.map((_, idx) => (
                        <Cell key={idx} fill={idx === revenueData.length - 1 ? '#059669' : '#10b981'} />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              )}
            </div>

            {/* ── Payment Table ─────────────────────────────────────────── */}
            <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
              <div className="px-6 py-4 border-b border-slate-200 flex items-center justify-between bg-slate-50">
                <div>
                  <h3 className="text-base font-bold text-slate-800" style={{ fontFamily: "'Sora', sans-serif" }}>
                    Danh sách thanh toán
                  </h3>
                  <p className="text-xs text-slate-500 mt-0.5">{dateRangeLabel}</p>
                </div>
                <div className="flex items-center gap-3">
                  <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium bg-emerald-100 text-emerald-700">
                    {loading ? '...' : `${payments.length} giao dịch`}
                  </span>
                  <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium bg-slate-100 text-slate-600">
                    Chỉ xem
                  </span>
                </div>
              </div>

              {loading ? (
                <div className="p-6 space-y-3">
                  {[1,2,3,4,5].map(i => (
                    <div key={i} className="h-10 bg-slate-100 rounded animate-pulse" />
                  ))}
                </div>
              ) : payments.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-16 text-slate-400 gap-3">
                  <CreditCard className="w-12 h-12 opacity-25" />
                  <p className="text-sm">Không có giao dịch nào trong khoảng thời gian đã chọn</p>
                </div>
              ) : (
                <>
                  <div className="overflow-x-auto overflow-y-auto max-h-96">
                    <table className="w-full text-sm">
                      <thead className="sticky top-0 z-10 bg-white border-b border-slate-200">
                        <tr>
                          {['STT', 'Học viên', 'Số tiền', 'Ngày thanh toán', 'Phương thức', 'Mã giao dịch'].map(h => (
                            <th key={h}
                              className="px-5 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wide whitespace-nowrap">
                              {h}
                            </th>
                          ))}
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100">
                        {payments.map((p, idx) => (
                          <tr key={p.paymentId} className="hover:bg-slate-50 transition-colors">
                            <td className="px-5 py-3 text-slate-400 text-xs">{idx + 1}</td>
                            <td className="px-5 py-3 font-medium text-slate-900">{p.hocVienName ?? '—'}</td>
                            <td className="px-5 py-3 font-semibold text-emerald-700 whitespace-nowrap">
                              {fmtVNDFull(p.amount ?? 0)}
                            </td>
                            <td className="px-5 py-3 text-slate-600 whitespace-nowrap">{fmtDate(p.ngayThanhToan)}</td>
                            <td className="px-5 py-3">
                              <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-slate-100 text-slate-700">
                                {fmtMethod(p.phuongThucThanhToan)}
                              </span>
                            </td>
                            <td className="px-5 py-3 text-xs text-slate-400 font-mono truncate max-w-[140px]">
                              {p.maGiaoDichGateway ?? '—'}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>

                  {/* Total row */}
                  <div className="px-6 py-3 bg-emerald-50 border-t-2 border-emerald-200 flex items-center justify-between">
                    <span className="text-sm font-semibold text-slate-700">
                      Tổng cộng ({payments.length} giao dịch)
                    </span>
                    <span className="text-base font-bold text-emerald-700" style={{ fontFamily: "'Sora', sans-serif" }}>
                      {fmtVNDFull(totalAmount)}
                    </span>
                  </div>
                </>
              )}
            </div>

          </div>
        </div>
      </div>

      {/* ── Hidden print area ──────────────────────────────────────────────── */}
      <div id="financial-print-area" aria-hidden="true">
        <h1>BÁO CÁO HỌC PHÍ</h1>
        <p className="print-sub">
          Khoảng thời gian: {dateRangeLabel} &nbsp;|&nbsp; Ngày in: {new Date().toLocaleDateString('vi-VN')}
        </p>

        <div className="print-stats">
          <div className="print-stat">
            <div>Tổng doanh thu</div>
            <strong>{fmtVNDFull(overview?.tongDoanhThu ?? 0)}</strong>
          </div>
          <div className="print-stat">
            <div>Số giao dịch</div>
            <strong>{overview?.soLuongThanhToan ?? 0}</strong>
          </div>
          <div className="print-stat">
            <div>Chờ thanh toán</div>
            <strong>{fmtVNDFull(overview?.tongCanThanhToan ?? 0)}</strong>
          </div>
          <div className="print-stat">
            <div>Quá hạn</div>
            <strong>{fmtVNDFull(overview?.tongQuaHan ?? 0)}</strong>
          </div>
        </div>

        <table>
          <thead>
            <tr>
              <th>STT</th>
              <th>Học viên</th>
              <th>Số tiền (VNĐ)</th>
              <th>Ngày thanh toán</th>
              <th>Phương thức</th>
              <th>Mã giao dịch</th>
            </tr>
          </thead>
          <tbody>
            {payments.map((p, idx) => (
              <tr key={p.paymentId}>
                <td>{idx + 1}</td>
                <td>{p.hocVienName ?? '—'}</td>
                <td>{(p.amount ?? 0).toLocaleString('vi-VN')}</td>
                <td>{fmtDate(p.ngayThanhToan)}</td>
                <td>{fmtMethod(p.phuongThucThanhToan)}</td>
                <td>{p.maGiaoDichGateway ?? '—'}</td>
              </tr>
            ))}
            <tr className="print-total">
              <td colSpan={2}><strong>TỔNG CỘNG ({payments.length} GD)</strong></td>
              <td><strong>{totalAmount.toLocaleString('vi-VN')}</strong></td>
              <td colSpan={3}></td>
            </tr>
          </tbody>
        </table>

        <p className="print-footer">
          Báo cáo được tạo tự động từ hệ thống LearningHub &nbsp;—&nbsp; Chỉ dùng để tham khảo.
        </p>
      </div>

      {toast && <Toast type={toast.type} message={toast.message} onClose={() => setToast(null)} />}
    </div>
  );
}
