import { AdminSidebar } from '@/components/layouts/AdminSidebar';
import { AdminHeader } from '@/components/layouts/AdminHeader';
import { useState, useEffect, useMemo, useCallback } from 'react';
import {
  Plus, Trash2, X, BookMarked, GraduationCap, BookOpen,
  AlertCircle, Search, RefreshCw, CheckCircle, Loader2,
  ChevronDown
} from 'lucide-react';
import AiAssistantButton from '@/imports/AiAssistantButton-4-13343';
import * as ctdtApi from '@/api/admin/chuong-trinh-dao-tao.api';
import type { ChuongTrinhDaoTaoItem, NganhOption, MonHocOption } from '@/api/admin/chuong-trinh-dao-tao.api';

interface Toast { id: string; message: string; type: 'success' | 'error' | 'info'; }

const extractError = (err: unknown, fallback: string): string => {
  if (err && typeof err === 'object') {
    const e = err as { response?: { data?: { detail?: string; message?: string; error?: string } } };
    return e.response?.data?.detail || e.response?.data?.message || e.response?.data?.error || fallback;
  }
  return fallback;
};

export default function AdminChuongTrinhDaoTaoPage() {
  const [toasts, setToasts] = useState<Toast[]>([]);
  const [loading, setLoading] = useState(false);
  const [ctdtList, setCtdtList] = useState<ChuongTrinhDaoTaoItem[]>([]);
  const [nganhList, setNganhList] = useState<NganhOption[]>([]);
  const [monHocList, setMonHocList] = useState<MonHocOption[]>([]);

  const [selectedNganh, setSelectedNganh] = useState<string>('');
  const [searchQuery, setSearchQuery] = useState('');
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [selectedItem, setSelectedItem] = useState<ChuongTrinhDaoTaoItem | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  // Batch add state
  const [batchMonHocIndexes, setBatchMonHocIndexes] = useState<number[]>([]);
  const [batchSearch, setBatchSearch] = useState('');

  const addToast = (message: string, type: 'success' | 'error' | 'info' = 'info') => {
    const id = Date.now().toString();
    setToasts(p => [...p, { id, message, type }]);
    setTimeout(() => setToasts(p => p.filter(t => t.id !== id)), 4000);
  };

  const fetchAll = async () => {
    setLoading(true);
    try {
      const [ctdtResp, nganhResp, monHocResp] = await Promise.all([
        ctdtApi.getAllCtdt(),
        ctdtApi.getNganhOptions(),
        ctdtApi.getMonHocOptions(),
      ]);
      setCtdtList(ctdtResp || []);
      setNganhList(nganhResp || []);
      setMonHocList(monHocResp || []);
    } catch (err) {
      console.error('Failed to load CTDT data', err);
      addToast('Lỗi khi tải dữ liệu', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchAll(); }, []);

  // Auto-select first nganh
  useEffect(() => {
    if (nganhList.length > 0 && !selectedNganh) {
      setSelectedNganh(nganhList[0].id);
    }
  }, [nganhList]);

  const filteredByNganh = useMemo(() =>
    ctdtList.filter(c => c.nganhId === selectedNganh),
    [ctdtList, selectedNganh]
  );

  const filteredBySearch = useMemo(() => filteredByNganh.filter(c => {
    const q = searchQuery.toLowerCase();
    return !q || c.tenMonHoc.toLowerCase().includes(q) || c.maMonHoc.toLowerCase().includes(q);
  }), [filteredByNganh, searchQuery]);

  const selectedNganhObj = nganhList.find(n => n.id === selectedNganh);

  const existingMonHocIds = useMemo(() =>
    new Set(filteredByNganh.map(c => c.monHocId)),
    [filteredByNganh]
  );

  const availableMonHoc = useMemo(() =>
    monHocList.filter(m =>
      !existingMonHocIds.has(m.id) &&
      (!batchSearch ||
        m.tenMonHoc.toLowerCase().includes(batchSearch.toLowerCase()) ||
        m.maMonHoc.toLowerCase().includes(batchSearch.toLowerCase()))
    ),
    [monHocList, existingMonHocIds, batchSearch]
  );

  const toggleBatchMonHoc = useCallback((idx: number, checked: boolean) => {
    setBatchMonHocIndexes(prev =>
      checked ? [...prev, idx] : prev.filter(x => x !== idx)
    );
  }, []);

  const toggleBatchAll = useCallback((checked: boolean) => {
    setBatchMonHocIndexes(checked ? availableMonHoc.map((_, i) => i) : []);
  }, [availableMonHoc]);

  const handleAddSingle = async (maMonHoc: string) => {
    if (!selectedNganh) return;
    setIsSubmitting(true);
    try {
      await ctdtApi.createCtdt({ maNganh: selectedNganhObj?.maNganh || '', maMonHoc });
      addToast('Thêm môn học vào CTĐT thành công', 'success');
      setIsAddModalOpen(false);
      await fetchAll();
    } catch (err: any) {
      addToast(extractError(err, 'Thêm môn học thất bại'), 'error');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleBatchAdd = async () => {
    if (batchMonHocIndexes.length === 0 || !selectedNganhObj) return;
    setIsSubmitting(true);
    try {
      const dtos = batchMonHocIndexes.map(idx => {
        const m = availableMonHoc[idx];
        return { maNganh: selectedNganhObj.maNganh, maMonHoc: m?.maMonHoc || '' };
      });
      await ctdtApi.createCtdtList(dtos);
      addToast(`Đã thêm ${batchMonHocIndexes.length} môn học vào CTĐT`, 'success');
      setBatchMonHocIndexes([]);
      setBatchSearch('');
      setIsAddModalOpen(false);
      await fetchAll();
    } catch (err: any) {
      addToast(extractError(err, 'Thêm nhiều môn thất bại'), 'error');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = (item: ChuongTrinhDaoTaoItem) => {
    setSelectedItem(item);
    setIsDeleteModalOpen(true);
  };

  const confirmDelete = async () => {
    if (!selectedItem) return;
    setIsDeleting(true);
    try {
      if (!selectedItem.id) { throw new Error('ID không hợp lệ'); }
      await ctdtApi.deleteCtdt(selectedItem.id);
      addToast('Đã xóa khỏi chương trình đào tạo', 'success');
      await fetchAll();
    } catch (err: any) {
      addToast(extractError(err, 'Xóa thất bại'), 'error');
    } finally {
      setIsDeleteModalOpen(false);
      setSelectedItem(null);
      setIsDeleting(false);
    }
  };

  const openAddModal = () => {
    setBatchMonHocIndexes([]);
    setBatchSearch('');
    setIsAddModalOpen(true);
  };

  const totalTinChi = filteredByNganh.reduce((sum, c) => sum + (c.soTinChi || 0), 0);

  const inp = 'w-full px-3 py-2.5 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all';
  const lbl = 'block text-sm font-medium text-slate-700 mb-1.5';

  return (
    <div className="flex h-screen bg-slate-50">
      <AdminSidebar activeMenu="chuong-trinh-dao-tao" />
      <div className="flex-1 ml-64 flex flex-col overflow-hidden">
        <AdminHeader title="Quản lý Chương trình Đào tạo" />

        <div className="flex-1 overflow-auto">
          <div className="p-6 max-w-7xl mx-auto space-y-4">

            {/* Stats bar */}
            <div className="grid grid-cols-3 gap-4">
              <div className="bg-white border border-slate-200 rounded-xl px-5 py-3 flex items-center gap-3 shadow-sm">
                <div className="rounded-lg bg-blue-100 p-2"><GraduationCap className="w-5 h-5 text-blue-600" /></div>
                <div>
                  <p className="text-xl font-bold text-slate-900">{nganhList.length}</p>
                  <p className="text-xs text-slate-500">Ngành đào tạo</p>
                </div>
              </div>
              <div className="bg-white border border-slate-200 rounded-xl px-5 py-3 flex items-center gap-3 shadow-sm">
                <div className="rounded-lg bg-purple-100 p-2"><BookMarked className="w-5 h-5 text-purple-600" /></div>
                <div>
                  <p className="text-xl font-bold text-purple-700">{filteredByNganh.length}</p>
                  <p className="text-xs text-slate-500">Môn học trong CTĐT</p>
                </div>
              </div>
              <div className="bg-white border border-slate-200 rounded-xl px-5 py-3 flex items-center gap-3 shadow-sm">
                <div className="rounded-lg bg-green-100 p-2"><BookOpen className="w-5 h-5 text-green-600" /></div>
                <div>
                  <p className="text-xl font-bold text-green-700">{totalTinChi}</p>
                  <p className="text-xs text-slate-500">Tổng tín chỉ</p>
                </div>
              </div>
            </div>

            {/* Nganh selector + toolbar */}
            <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-4 flex flex-col sm:flex-row gap-4 items-start sm:items-center">
              <div className="flex items-center gap-2 flex-shrink-0">
                <label className="text-sm font-medium text-slate-700">Ngành:</label>
                <div className="relative">
                  <select
                    value={selectedNganh}
                    onChange={e => { setSelectedNganh(e.target.value); setSearchQuery(''); }}
                    className="appearance-none pl-3 pr-9 py-2.5 border border-blue-300 rounded-lg text-sm font-semibold text-blue-700 bg-blue-50 focus:outline-none focus:ring-2 focus:ring-blue-500 cursor-pointer min-w-[240px]"
                  >
                    {nganhList.map(n => (
                      <option key={n.id} value={n.id}>{n.tenNganh} ({n.maNganh})</option>
                    ))}
                  </select>
                  <ChevronDown className="absolute right-2.5 top-1/2 -translate-y-1/2 w-4 h-4 text-blue-500 pointer-events-none" />
                </div>
              </div>

              <div className="flex-1 flex flex-wrap items-center gap-3 justify-end">
                <div className="relative min-w-[180px] max-w-xs">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                  <input
                    type="text"
                    placeholder="Tìm mã hoặc tên môn..."
                    value={searchQuery}
                    onChange={e => setSearchQuery(e.target.value)}
                    className="w-full pl-9 pr-4 py-2 text-sm border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <button
                  onClick={fetchAll}
                  className="p-2 border border-slate-300 rounded-lg text-slate-600 hover:bg-slate-50 transition-colors"
                  title="Làm mới"
                >
                  <RefreshCw className="w-4 h-4" />
                </button>
                <button
                  onClick={openAddModal}
                  disabled={!selectedNganh}
                  className="flex items-center gap-1.5 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 text-sm font-medium shadow-sm disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <Plus className="w-4 h-4" /> Thêm môn học
                </button>
              </div>
            </div>

            {/* Table */}
            <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
              {loading ? (
                <div className="flex flex-col items-center justify-center h-72 gap-3">
                  <div className="w-9 h-9 border-4 border-slate-200 border-t-blue-600 rounded-full animate-spin" />
                  <p className="text-sm text-slate-500">Đang tải...</p>
                </div>
              ) : (
                <div className="overflow-auto" style={{ maxHeight: 'calc(100vh - 420px)' }}>
                  <table className="w-full text-sm">
                    <thead className="sticky top-0 z-10 bg-gradient-to-r from-blue-600 to-blue-700 text-white">
                      <tr>
                        <th className="px-4 py-3 text-left font-semibold w-24">Mã môn</th>
                        <th className="px-4 py-3 text-left font-semibold">Tên môn học</th>
                        <th className="px-4 py-3 text-center font-semibold w-24">Tín chỉ</th>
                        <th className="px-4 py-3 text-center font-semibold w-32">Thao tác</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {filteredBySearch.map((item, idx) => (
                        <tr key={item.id ?? `${item.nganhId}-${item.monHocId}-${idx}`} className="transition-colors hover:bg-blue-50/60">
                          <td className="px-4 py-3 font-semibold text-slate-900">{item.maMonHoc}</td>
                          <td className="px-4 py-3 text-slate-700">
                            <div>
                              <p className="font-medium">{item.tenMonHoc}</p>
                              {item.moTa && <p className="text-xs text-slate-400 mt-0.5">{item.moTa}</p>}
                            </div>
                          </td>
                          <td className="px-4 py-3 text-center">
                            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full bg-blue-100 text-blue-800 text-xs font-semibold">
                              {item.soTinChi} TC
                            </span>
                          </td>
                          <td className="px-4 py-3">
                            <div className="flex items-center justify-center gap-1">
                              <button
                                onClick={() => handleDelete(item)}
                                disabled={!item.id}
                                className="p-1.5 text-red-500 hover:bg-red-100 rounded-lg transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
                                title={item.id ? 'Xóa khỏi CTĐT' : 'Không thể xóa (ID không hợp lệ)'}
                              >
                                <Trash2 className="w-4 h-4" />
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}

                      {filteredBySearch.length === 0 && (
                        <tr>
                          <td colSpan={4} className="py-16 text-center">
                            <div className="flex flex-col items-center gap-2">
                              <div className="rounded-full bg-slate-100 p-4">
                                <BookMarked className="w-7 h-7 text-slate-400" />
                              </div>
                              <p className="font-medium text-slate-600">
                                {searchQuery ? 'Không tìm thấy môn học nào' : 'Chưa có môn học nào trong CTĐT'}
                              </p>
                              <p className="text-sm text-slate-400">
                                {searchQuery ? 'Thử từ khóa khác' : 'Nhấn "Thêm môn học" để bắt đầu'}
                              </p>
                            </div>
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              )}
            </div>

            {/* Footer */}
            {!loading && filteredByNganh.length > 0 && (
              <div className="flex items-center justify-between text-xs text-slate-500 px-1">
                <span>
                  Hiển thị <b className="text-slate-700">{filteredBySearch.length}</b> / <b className="text-slate-700">{filteredByNganh.length}</b> môn học
                  {selectedNganhObj && ` trong CTĐT của ${selectedNganhObj.tenNganh}`}
                </span>
                <span>Tổng: <b>{totalTinChi}</b> tín chỉ</span>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Add Modal */}
      {isAddModalOpen && (
        <div className="fixed inset-0 bg-black/30 flex items-center justify-center z-50 p-4" onClick={() => setIsAddModalOpen(false)}>
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg max-h-[90vh] flex flex-col" onClick={e => e.stopPropagation()}>
            <div className="bg-gradient-to-r from-blue-600 to-blue-700 text-white px-6 py-4 flex items-center justify-between rounded-t-2xl flex-shrink-0">
              <div>
                <h2 className="text-base font-bold flex items-center gap-2"><Plus className="w-5 h-5" /> Thêm Môn học vào CTĐT</h2>
                <p className="text-xs text-blue-200 mt-0.5">{selectedNganhObj?.tenNganh} ({selectedNganhObj?.maNganh})</p>
              </div>
              <button onClick={() => setIsAddModalOpen(false)} className="p-1 hover:bg-white/20 rounded-lg">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-5 flex-1 overflow-y-auto space-y-4">
              {/* Quick add - available subjects */}
              <div>
                <p className="text-sm font-medium text-slate-700 mb-2">Môn học có thể thêm:</p>
                <div className="mb-2">
                  <div className="flex items-center justify-between">
                    <div className="relative flex-1">
                      <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                      <input
                        type="text"
                        placeholder="Tìm môn học để thêm..."
                        value={batchSearch}
                        onChange={e => setBatchSearch(e.target.value)}
                        className="w-full pl-9 pr-4 py-2 text-sm border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                    </div>
                    {availableMonHoc.length > 0 && (
                      <div
                        onClick={() => toggleBatchAll(!(batchMonHocIndexes.length === availableMonHoc.length && availableMonHoc.length > 0))}
                        className="flex items-center gap-2 px-3 py-2 text-sm font-medium text-blue-600 hover:text-blue-700 cursor-pointer select-none ml-2"
                      >
                        <span className="w-4 h-4 flex items-center justify-center">
                          <input
                            type="checkbox"
                            checked={batchMonHocIndexes.length === availableMonHoc.length && availableMonHoc.length > 0}
                            readOnly
                            ref={input => { if (input) input.indeterminate = batchMonHocIndexes.length > 0 && batchMonHocIndexes.length < availableMonHoc.length; }}
                            className="w-4 h-4 text-blue-600 rounded accent-blue-600 pointer-events-none"
                          />
                        </span>
                        Chọn tất cả
                      </div>
                    )}
                  </div>
                </div>
                {availableMonHoc.length === 0 ? (
                  <div className="text-center py-8 text-sm text-slate-400">
                    <BookOpen className="w-8 h-8 mx-auto mb-2 text-slate-300" />
                    <p>{batchSearch ? 'Không tìm thấy môn học nào phù hợp' : 'Tất cả môn học đã có trong CTĐT này'}</p>
                  </div>
                ) : (
                  <div className="max-h-64 overflow-y-auto space-y-1.5">
                    {availableMonHoc.map((m, idx) => (
                      <div
                        key={m.id}
                        onClick={() => toggleBatchMonHoc(idx, !batchMonHocIndexes.includes(idx))}
                        className={`flex items-center gap-3 p-3 rounded-xl border cursor-pointer transition-all ${
                          batchMonHocIndexes.includes(idx)
                            ? 'border-blue-400 bg-blue-50'
                            : 'border-slate-200 hover:border-blue-300 hover:bg-blue-50/50'
                        }`}
                      >
                        <span className="w-4 h-4 flex-shrink-0 flex items-center justify-center">
                          <input
                            type="checkbox"
                            checked={batchMonHocIndexes.includes(idx)}
                            readOnly
                            className="w-4 h-4 text-blue-600 rounded accent-blue-600 pointer-events-none"
                          />
                        </span>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-semibold text-slate-800">{m.tenMonHoc}</p>
                          <p className="text-xs text-slate-500">{m.maMonHoc} &bull; {m.soTinChi} tín chỉ</p>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>

            <div className="p-5 border-t border-slate-100 flex gap-3 flex-shrink-0">
              <button
                onClick={() => setIsAddModalOpen(false)}
                className="flex-1 py-2.5 border border-slate-300 rounded-xl text-sm font-medium text-slate-700 hover:bg-slate-50"
              >
                Hủy
              </button>
              <button
                onClick={handleBatchAdd}
                disabled={batchMonHocIndexes.length === 0 || isSubmitting}
                className="flex-1 py-2.5 bg-blue-600 text-white rounded-xl text-sm font-medium hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                {isSubmitting ? (
                  <><Loader2 className="w-4 h-4 animate-spin" /> Đang thêm...</>
                ) : (
                  <>Thêm {batchMonHocIndexes.length > 0 ? `${batchMonHocIndexes.length} môn` : 'môn học'}</>
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirmation */}
      {isDeleteModalOpen && selectedItem && (
        <div className="fixed inset-0 bg-black/30 flex items-center justify-center z-[60] p-4" onClick={() => setIsDeleteModalOpen(false)}>
          <div className="bg-white rounded-2xl shadow-2xl max-w-sm w-full p-6" onClick={e => e.stopPropagation()}>
            <div className="flex items-center gap-3 mb-4">
              <div className="rounded-full bg-red-100 p-3 flex-shrink-0">
                <AlertCircle className="w-6 h-6 text-red-600" />
              </div>
              <h3 className="font-bold text-slate-900">Xác nhận xóa</h3>
            </div>
            <p className="text-sm text-slate-600 mb-6">
              Bạn có chắc muốn xóa <b>{selectedItem.tenMonHoc}</b> khỏi chương trình đào tạo này?
            </p>
            <div className="flex gap-3">
              <button
                onClick={() => setIsDeleteModalOpen(false)}
                className="flex-1 py-2.5 border border-slate-300 rounded-xl text-sm font-medium text-slate-700 hover:bg-slate-50"
              >
                Hủy
              </button>
              <button
                onClick={confirmDelete}
                disabled={isDeleting}
                className="flex-1 py-2.5 bg-red-600 text-white rounded-xl text-sm font-medium hover:bg-red-700 disabled:opacity-50 flex items-center justify-center gap-2"
              >
                {isDeleting ? <><Loader2 className="w-4 h-4 animate-spin" /> Đang xóa...</> : 'Xóa'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Toasts */}
      <div className="fixed bottom-24 right-6 space-y-2 z-[70] pointer-events-none">
        {toasts.map(t => (
          <div
            key={t.id}
            className={`flex items-start gap-2.5 px-4 py-3 rounded-xl shadow-xl text-white text-sm font-medium max-w-xs pointer-events-auto ${
              t.type === 'success' ? 'bg-green-600' : t.type === 'error' ? 'bg-red-600' : 'bg-blue-600'
            }`}
          >
            {t.type === 'success' && <CheckCircle className="w-4 h-4 flex-shrink-0 mt-0.5" />}
            {t.type === 'error' && <AlertCircle className="w-4 h-4 flex-shrink-0 mt-0.5" />}
            <span>{t.message}</span>
          </div>
        ))}
      </div>

      {/* AI Assistant */}
      <button className="fixed bottom-8 right-8 w-14 h-14 z-50 hover:scale-110 transition-transform" aria-label="AI">
        <AiAssistantButton />
      </button>
    </div>
  );
}
