import { AccountantSidebar } from '@/components/layouts/AccountantSidebar';
import { AccountantHeader } from '@/components/layouts/AccountantHeader';
import { useState, useMemo, useCallback } from 'react';
import { Bell, Send, RefreshCw, Search } from 'lucide-react';
import {
  accountingApi,
  type AccountingHocPhiResponse
} from '@/api/accounting/accounting.api';
import { useAsync } from '@/hooks';
import { Toast } from '@/components/notification/Toast';

type Tab = 'CHUA_THANH_TOAN' | 'QUA_HAN';

export default function NotificationsPage() {
  const [tab, setTab] = useState<Tab>('CHUA_THANH_TOAN');
  const [search, setSearch] = useState('');
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [sendingId, setSendingId] = useState<string | null>(null);
  const [bulkSending, setBulkSending] = useState(false);
  const [toast, setToast] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

  const { data: list = [], loading, execute: reload } = useAsync<AccountingHocPhiResponse[]>(
    () => accountingApi.getDueHocPhi(),
    []
  );

  const safeList = list ?? [];

  const tabItems = useMemo(() =>
    safeList.filter(r =>
      r.trangThai === tab &&
      (!search || r.hocVienName?.toLowerCase().includes(search.toLowerCase()) ||
        r.hocVienEmail?.toLowerCase().includes(search.toLowerCase()))
    ),
    [safeList, tab, search]
  );

  const toggleSelect = (id: string) => {
    setSelectedIds(prev => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
  };

  const toggleAll = () => {
    if (selectedIds.size === tabItems.length && tabItems.length > 0) {
      setSelectedIds(new Set());
    } else {
      setSelectedIds(new Set(tabItems.map(r => r.id)));
    }
  };

  const sendOne = useCallback(async (id: string) => {
    setSendingId(id);
    try {
      await accountingApi.sendNotification(id);
      setToast({ type: 'success', message: 'Đã gửi thông báo!' });
    } catch {
      setToast({ type: 'error', message: 'Gửi thông báo thất bại' });
    } finally {
      setSendingId(null);
    }
  }, []);

  const sendBulk = useCallback(async () => {
    if (selectedIds.size === 0) {
      setToast({ type: 'error', message: 'Vui lòng chọn ít nhất một học viên' });
      return;
    }
    setBulkSending(true);
    try {
      const result = await accountingApi.sendNotificationBulk([...selectedIds]);
      setToast({
        type: 'success',
        message: `Đã gửi ${result.sent}/${result.requested} thông báo thành công!`
      });
      setSelectedIds(new Set());
    } catch {
      setToast({ type: 'error', message: 'Gửi hàng loạt thất bại' });
    } finally {
      setBulkSending(false);
    }
  }, [selectedIds]);

  const pendingCount = safeList.filter(r => r.trangThai === 'CHUA_THANH_TOAN').length;
  const overdueCount = safeList.filter(r => r.trangThai === 'QUA_HAN').length;

  return (
    <div className="flex h-screen bg-stone-50">
      <AccountantSidebar />
      <div className="flex-1 ml-64 flex flex-col">
        <AccountantHeader title="Thông báo học phí" />
        <div className="flex-1 overflow-auto p-6">
          <div className="max-w-7xl mx-auto space-y-4">

            {/* Tabs */}
            <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-1 flex gap-1 w-fit">
              <button
                onClick={() => { setTab('CHUA_THANH_TOAN'); setSelectedIds(new Set()); }}
                className={`px-5 py-2 rounded-lg text-sm font-medium transition-colors flex items-center gap-2 ${
                  tab === 'CHUA_THANH_TOAN'
                    ? 'bg-amber-500 text-white shadow-sm'
                    : 'text-slate-600 hover:bg-slate-50'
                }`}
              >
                Chưa thanh toán
                <span className={`px-2 py-0.5 rounded-full text-xs font-bold ${
                  tab === 'CHUA_THANH_TOAN' ? 'bg-white/30 text-white' : 'bg-amber-100 text-amber-700'
                }`}>
                  {pendingCount}
                </span>
              </button>
              <button
                onClick={() => { setTab('QUA_HAN'); setSelectedIds(new Set()); }}
                className={`px-5 py-2 rounded-lg text-sm font-medium transition-colors flex items-center gap-2 ${
                  tab === 'QUA_HAN'
                    ? 'bg-red-500 text-white shadow-sm'
                    : 'text-slate-600 hover:bg-slate-50'
                }`}
              >
                Quá hạn
                <span className={`px-2 py-0.5 rounded-full text-xs font-bold ${
                  tab === 'QUA_HAN' ? 'bg-white/30 text-white' : 'bg-red-100 text-red-700'
                }`}>
                  {overdueCount}
                </span>
              </button>
            </div>

            {/* Actions bar */}
            <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-4 flex flex-wrap gap-3 items-center">
              <div className="relative flex-1 min-w-[200px]">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                <input
                  type="text" placeholder="Tìm theo tên, email..."
                  value={search} onChange={e => setSearch(e.target.value)}
                  className="w-full pl-9 pr-3 py-2 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
                />
              </div>
              <button
                onClick={reload}
                className="px-4 py-2 border border-slate-300 text-slate-600 text-sm rounded-lg hover:bg-slate-50 flex items-center gap-2"
              >
                <RefreshCw className="w-4 h-4" /> Làm mới
              </button>
              <button
                onClick={sendBulk} disabled={bulkSending || selectedIds.size === 0}
                className="px-5 py-2 bg-emerald-600 text-white text-sm font-medium rounded-lg hover:bg-emerald-700 disabled:opacity-50 flex items-center gap-2 transition-colors"
              >
                {bulkSending
                  ? <RefreshCw className="w-4 h-4 animate-spin" />
                  : <Send className="w-4 h-4" />
                }
                Gửi thông báo ({selectedIds.size})
              </button>
            </div>

            {/* Table */}
            <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
              {loading ? (
                <div className="p-10 text-center text-slate-400">Đang tải...</div>
              ) : tabItems.length === 0 ? (
                <div className="p-10 text-center">
                  <Bell className="w-12 h-12 text-slate-200 mx-auto mb-3" />
                  <p className="text-slate-400">Không có học viên nào trong danh sách này</p>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead className="bg-slate-50 border-b border-slate-200">
                      <tr>
                        <th className="px-4 py-3 text-left w-10">
                          <input
                            type="checkbox"
                            checked={selectedIds.size === tabItems.length && tabItems.length > 0}
                            onChange={toggleAll}
                            className="rounded border-slate-300"
                          />
                        </th>
                        {['Học viên', 'Email', 'Học kỳ', 'Số tín chỉ', 'Số tiền', 'Thao tác'].map(h => (
                          <th key={h} className="px-4 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wide">{h}</th>
                        ))}
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {tabItems.map(r => (
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
                            <button
                              onClick={() => sendOne(r.id)}
                              disabled={sendingId === r.id}
                              className="px-3 py-1.5 text-xs font-medium bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 disabled:opacity-50 flex items-center gap-1 transition-colors"
                            >
                              {sendingId === r.id
                                ? <RefreshCw className="w-3 h-3 animate-spin" />
                                : <Bell className="w-3 h-3" />
                              }
                              Gửi
                            </button>
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
      {toast && <Toast type={toast.type} message={toast.message} onClose={() => setToast(null)} />}
    </div>
  );
}
