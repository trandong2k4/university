import { AccountantSidebar } from '@/components/layouts/AccountantSidebar';
import { AccountantHeader } from '@/components/layouts/AccountantHeader';
import { useState, useMemo, useCallback } from 'react';
import {
  DollarSign, CreditCard, Clock, AlertTriangle, Download, RefreshCw
} from 'lucide-react';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer
} from 'recharts';
import { accountingApi, type BaoCaoThongKeOverviewResponse } from '@/api/accounting/accounting.api';
import { useAsync } from '@/hooks';
import { Toast } from '@/components/notification/Toast';

const fmt = (n: number) =>
  n >= 1_000_000
    ? `${(n / 1_000_000).toFixed(1)}M`
    : n.toLocaleString('vi-VN');

const fmtDate = (s: string | null | undefined) => {
  if (!s) return '—';
  try { return new Date(s).toLocaleDateString('vi-VN'); } catch { return s; }
};

export default function FinancialReportsPage() {
  const today = new Date();
  const firstOfYear = `${today.getFullYear()}-01-01`;
  const todayStr = today.toISOString().slice(0, 10);

  const [start, setStart] = useState(firstOfYear);
  const [end, setEnd] = useState(todayStr);
  const [appliedStart, setAppliedStart] = useState(firstOfYear);
  const [appliedEnd, setAppliedEnd] = useState(todayStr);
  const [toast, setToast] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

  const { data: overview, loading, error, execute: reload } = useAsync<BaoCaoThongKeOverviewResponse | null>(
    () => accountingApi.getOverview(appliedStart, appliedEnd),
    null,
    [appliedStart, appliedEnd]
  );

  const apply = () => {
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

  const exportCSV = useCallback(() => {
    const rows = overview?.danhSachThanhToanMoiNhat ?? [];
    if (!rows.length) { setToast({ type: 'error', message: 'Không có dữ liệu để xuất' }); return; }
    const header = 'Học viên,Số tiền (VNĐ),Ngày thanh toán,Phương thức';
    const lines = rows.map(p =>
      `"${p.hocVienName ?? ''}","${p.amount ?? 0}","${fmtDate(p.ngayThanhToan)}","${p.phuongThucThanhToan ?? ''}"`
    );
    const csv = [header, ...lines].join('\n');
    const url = URL.createObjectURL(new Blob(['﻿' + csv], { type: 'text/csv;charset=utf-8;' }));
    const a = document.createElement('a');
    a.href = url; a.download = `bao-cao-${appliedStart}_${appliedEnd}.csv`; a.click();
    URL.revokeObjectURL(url);
  }, [overview, appliedStart, appliedEnd]);

  const stats = [
    {
      id: 'revenue', label: 'Tổng doanh thu', value: `${fmt(overview?.tongDoanhThu ?? 0)} VNĐ`,
      icon: <DollarSign className="w-6 h-6" />, bg: 'bg-emerald-100', text: 'text-emerald-600'
    },
    {
      id: 'paid', label: 'Đã thanh toán', value: `${overview?.soLuongThanhToan ?? 0} giao dịch`,
      icon: <CreditCard className="w-6 h-6" />, bg: 'bg-blue-100', text: 'text-blue-600'
    },
    {
      id: 'pending', label: 'Chờ thanh toán', value: `${(overview?.tongCanThanhToan ?? 0).toLocaleString('vi-VN')} VNĐ`,
      icon: <Clock className="w-6 h-6" />, bg: 'bg-amber-100', text: 'text-amber-600'
    },
    {
      id: 'overdue', label: 'Quá hạn', value: `${(overview?.tongQuaHan ?? 0).toLocaleString('vi-VN')} VNĐ`,
      icon: <AlertTriangle className="w-6 h-6" />, bg: 'bg-red-100', text: 'text-red-600'
    },
  ];

  return (
    <div className="flex h-screen bg-stone-50">
      <AccountantSidebar />
      <div className="flex-1 ml-64 flex flex-col">
        <AccountantHeader title="Báo cáo thống kê" />
        <div className="flex-1 overflow-auto p-6">
          <div className="max-w-7xl mx-auto space-y-6">

            {/* Filter */}
            <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-4 flex flex-wrap gap-4 items-end">
              <div>
                <label className="block text-xs font-medium text-slate-500 mb-1">Từ ngày</label>
                <input
                  type="date" value={start} onChange={e => setStart(e.target.value)}
                  className="border border-slate-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-slate-500 mb-1">Đến ngày</label>
                <input
                  type="date" value={end} onChange={e => setEnd(e.target.value)}
                  className="border border-slate-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
                />
              </div>
              <button
                onClick={apply}
                className="px-5 py-2 bg-emerald-600 text-white text-sm font-medium rounded-lg hover:bg-emerald-700 transition-colors"
              >
                Áp dụng
              </button>
              <button
                onClick={reload}
                className="px-4 py-2 border border-slate-300 text-slate-600 text-sm font-medium rounded-lg hover:bg-slate-50 transition-colors flex items-center gap-2"
              >
                <RefreshCw className="w-4 h-4" /> Làm mới
              </button>
              <button
                onClick={exportCSV}
                className="ml-auto px-4 py-2 border border-emerald-500 text-emerald-600 text-sm font-medium rounded-lg hover:bg-emerald-50 transition-colors flex items-center gap-2"
              >
                <Download className="w-4 h-4" /> Xuất CSV
              </button>
            </div>

            {/* Stat Cards */}
            {loading ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {[1,2,3,4].map(i => (
                  <div key={i} className="bg-white rounded-xl border border-slate-200 p-6 animate-pulse">
                    <div className="h-12 w-12 bg-slate-200 rounded-xl mb-4" />
                    <div className="h-4 bg-slate-200 rounded w-2/3 mb-2" />
                    <div className="h-7 bg-slate-200 rounded w-1/2" />
                  </div>
                ))}
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {stats.map(s => (
                  <div key={s.id} className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
                    <div className={`w-12 h-12 ${s.bg} rounded-xl flex items-center justify-center mb-4`}>
                      <div className={s.text}>{s.icon}</div>
                    </div>
                    <p className="text-sm text-slate-500 mb-1">{s.label}</p>
                    <p className="text-xl font-bold text-slate-900" style={{ fontFamily: "'Sora', sans-serif" }}>{s.value}</p>
                  </div>
                ))}
              </div>
            )}

            {/* Bar Chart */}
            <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
              <h3 className="text-lg font-bold text-slate-900 mb-4" style={{ fontFamily: "'Sora', sans-serif" }}>
                Doanh thu theo tháng
              </h3>
              {revenueData.length === 0 ? (
                <div className="flex items-center justify-center h-48 text-slate-400">
                  {error ? 'Lỗi tải dữ liệu' : 'Chưa có dữ liệu trong khoảng thời gian này'}
                </div>
              ) : (
                <ResponsiveContainer width="100%" height={280}>
                  <BarChart data={revenueData} margin={{ top: 5, right: 20, left: 10, bottom: 5 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                    <XAxis dataKey="thang" stroke="#64748b" tick={{ fontSize: 12 }} />
                    <YAxis stroke="#64748b" tick={{ fontSize: 12 }}
                      tickFormatter={v => v >= 1_000_000 ? `${(v/1_000_000).toFixed(0)}M` : String(v)} />
                    <Tooltip formatter={(v: number) => [`${v.toLocaleString('vi-VN')} VNĐ`, 'Doanh thu']} />
                    <Bar dataKey="doanhThu" fill="#10b981" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              )}
            </div>

            {/* Recent Payments Table */}
            <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
              <div className="p-5 border-b border-slate-200 flex items-center justify-between">
                <h3 className="text-lg font-bold text-slate-900" style={{ fontFamily: "'Sora', sans-serif" }}>
                  Danh sách thanh toán gần đây
                </h3>
                <span className="text-sm text-slate-500">
                  {overview?.danhSachThanhToanMoiNhat?.length ?? 0} giao dịch
                </span>
              </div>
              {!overview?.danhSachThanhToanMoiNhat?.length ? (
                <div className="p-10 text-center text-slate-400">Chưa có giao dịch</div>
              ) : (
                <div className="overflow-x-auto overflow-y-auto max-h-72 scrollbar-thin">
                  <table className="w-full">
                    <thead className="bg-slate-50 sticky top-0 z-10">
                      <tr>
                        {['Học viên', 'Số tiền', 'Ngày thanh toán', 'Phương thức', 'Mã giao dịch'].map(h => (
                          <th key={h} className="px-5 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wide">{h}</th>
                        ))}
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {overview.danhSachThanhToanMoiNhat.map(p => (
                        <tr key={p.paymentId} className="hover:bg-slate-50 transition-colors">
                          <td className="px-5 py-3 font-medium text-slate-900">{p.hocVienName ?? '—'}</td>
                          <td className="px-5 py-3 font-semibold text-emerald-700">
                            {(p.amount ?? 0).toLocaleString('vi-VN')} VNĐ
                          </td>
                          <td className="px-5 py-3 text-sm text-slate-600">{fmtDate(p.ngayThanhToan)}</td>
                          <td className="px-5 py-3 text-sm text-slate-600">{p.phuongThucThanhToan ?? '—'}</td>
                          <td className="px-5 py-3 text-xs text-slate-400 font-mono">{p.maGiaoDichGateway ?? '—'}</td>
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
      {toast && <Toast type={toast.type} message={toast.message} onClose={() => setToast(null)} />}
    </div>
  );
}
