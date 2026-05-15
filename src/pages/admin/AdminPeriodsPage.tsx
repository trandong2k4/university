import { AdminSidebar } from '@/components/layouts/AdminSidebar';
import { AdminHeader } from '@/components/layouts/AdminHeader';
import { useEffect, useState, useRef, FormEvent } from 'react';
import { Plus, Edit, Trash2, X, Search, RefreshCw, AlertCircle, CheckCircle, Clock, FileSpreadsheet, Upload } from 'lucide-react';
import AiAssistantButton from '@/imports/AiAssistantButton-4-13343';
import type { PeriodItem } from '@/types';
import * as gioHocApi from '@/api/admin/giohoc.api';

interface Toast { id: string; message: string; type: 'success' | 'error' | 'info'; }

function parseBackendTimeToInput(time?: string) {
    if (!time) return '';
    const parts = time.split(':');
    if (parts.length >= 2) return `${parts[0].padStart(2, '0')}:${parts[1].padStart(2, '0')}`;
    return '';
}

function formatTimeToBackend(value: string) {
    if (!value) return '';
    return `${value}:00`;
}

const extractError = (err: unknown, fallback: string): string => {
    if (err && typeof err === 'object') {
        const e = err as { response?: { data?: { detail?: string; message?: string } } };
        return e.response?.data?.detail || e.response?.data?.message || fallback;
    }
    return fallback;
};

export default function AdminPeriodsPage() {
    const scrollRef = useRef<HTMLDivElement>(null);
    const importRef = useRef<HTMLInputElement>(null);

    const [items, setItems] = useState<PeriodItem[]>([]);
    const [loading, setLoading] = useState(false);
    const [searchQuery, setSearchQuery] = useState('');
    const [toasts, setToasts] = useState<Toast[]>([]);

    const [isAddOpen, setIsAddOpen] = useState(false);
    const [isEditOpen, setIsEditOpen] = useState(false);
    const [isDeleteOpen, setIsDeleteOpen] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [selected, setSelected] = useState<PeriodItem | null>(null);

    const [form, setForm] = useState({ maGioHoc: '', tenGioHoc: '', thoiGianBatDau: '', thoiGianKetThuc: '' });

    const [isImportOpen, setIsImportOpen] = useState(false);
    const [importFile, setImportFile] = useState<File | null>(null);
    const [importResult, setImportResult] = useState<{
        totalRows: number; successCount: number; errorCount: number; errors: string[];
    } | null>(null);
    const [isImporting, setIsImporting] = useState(false);

    const addToast = (message: string, type: 'success' | 'error' | 'info' = 'info') => {
        const id = Date.now().toString();
        setToasts(p => [...p, { id, message, type }]);
        setTimeout(() => setToasts(p => p.filter(t => t.id !== id)), 4000);
    };

    const fetch = async () => {
        try {
            setLoading(true);
            const data = await gioHocApi.getAllGioHoc();
            setItems(data || []);
        } catch (err) {
            console.error(err);
            addToast(extractError(err, 'Lỗi khi tải giờ học'), 'error');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => { fetch(); }, []);

    const filtered = items.filter(i =>
        i.maGioHoc?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        i.tenGioHoc?.toLowerCase().includes(searchQuery.toLowerCase())
    );

    const openAdd = () => { setForm({ maGioHoc: '', tenGioHoc: '', thoiGianBatDau: '', thoiGianKetThuc: '' }); setIsAddOpen(true); };

    const openEdit = (item: PeriodItem) => {
        setSelected(item);
        setForm({
            maGioHoc: item.maGioHoc,
            tenGioHoc: item.tenGioHoc,
            thoiGianBatDau: parseBackendTimeToInput(item.thoiGianBatDau),
            thoiGianKetThuc: parseBackendTimeToInput(item.thoiGianKetThuc)
        });
        setIsEditOpen(true);
    };

    const openDelete = (item: PeriodItem) => { setSelected(item); setIsDeleteOpen(true); };

    const validate = () => {
        if (!form.maGioHoc.trim()) { addToast('Vui lòng nhập mã giờ học', 'error'); return false; }
        if (!form.tenGioHoc.trim()) { addToast('Vui lòng nhập tên giờ học', 'error'); return false; }
        if (form.thoiGianBatDau && form.thoiGianKetThuc) {
            if (form.thoiGianBatDau >= form.thoiGianKetThuc) {
                addToast('Thời gian bắt đầu phải nhỏ hơn thời gian kết thúc', 'error');
                return false;
            }
        }
        return true;
    };

    const handleCreate = async (e: FormEvent) => {
        e.preventDefault();
        if (!validate()) return;
        try {
            setIsSubmitting(true);
            await gioHocApi.createGioHoc({
                maGioHoc: form.maGioHoc,
                tenGioHoc: form.tenGioHoc,
                thoiGianBatDau: formatTimeToBackend(form.thoiGianBatDau),
                thoiGianKetThuc: formatTimeToBackend(form.thoiGianKetThuc)
            });
            addToast('Thêm giờ học thành công', 'success');
            setIsAddOpen(false);
            await fetch();
        } catch (err) {
            console.error(err);
            addToast(extractError(err, 'Lỗi khi thêm giờ học'), 'error');
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleUpdate = async (e: FormEvent) => {
        e.preventDefault();
        if (!selected || !validate()) return;
        try {
            setIsSubmitting(true);
            await gioHocApi.updateGioHoc(selected.id, {
                maGioHoc: form.maGioHoc,
                tenGioHoc: form.tenGioHoc,
                thoiGianBatDau: formatTimeToBackend(form.thoiGianBatDau),
                thoiGianKetThuc: formatTimeToBackend(form.thoiGianKetThuc)
            });
            addToast('Cập nhật giờ học thành công', 'success');
            setIsEditOpen(false);
            setSelected(null);
            await fetch();
        } catch (err) {
            console.error(err);
            addToast(extractError(err, 'Lỗi khi cập nhật giờ học'), 'error');
        } finally {
            setIsSubmitting(false);
        }
    };

    const confirmDelete = async () => {
        if (!selected) return;
        try {
            await gioHocApi.deleteGioHoc(selected.id);
            addToast('Xóa giờ học thành công', 'success');
            await fetch();
        } catch (err) {
            console.error(err);
            addToast(extractError(err, 'Lỗi khi xóa giờ học'), 'error');
        } finally {
            setIsDeleteOpen(false);
            setSelected(null);
        }
    };

    const handleImport = async () => {
        if (!importFile) return;
        setIsImporting(true);
        try {
            const result = await gioHocApi.importGioHocExcel(importFile);
            setImportResult(result);
            if (result.successCount > 0) {
                addToast(`Import ${result.successCount}/${result.totalRows} thành công`, 'success');
                await fetch();
            }
            if (result.errorCount > 0) {
                addToast(`${result.errorCount} dòng lỗi`, 'error');
            }
        } catch (err) {
            addToast(extractError(err, 'Lỗi khi import Excel'), 'error');
        } finally {
            setIsImporting(false);
        }
    };

    const inp = 'w-full px-3 py-2.5 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all';
    const lbl = 'block text-sm font-medium text-slate-700 mb-1.5';

    return (
        <div className="flex h-screen bg-slate-50">
            <AdminSidebar activeMenu="periods" />
            <div className="flex-1 ml-64 flex flex-col overflow-hidden">
                <AdminHeader title="Quản lý Giờ học" />
                <div className="flex-1 overflow-auto">
                    <div className="p-6 max-w-7xl mx-auto space-y-4">

                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                            <div className="bg-white border border-slate-200 rounded-xl px-5 py-3 flex items-center gap-3 shadow-sm">
                                <div className="rounded-lg bg-blue-100 p-2"><Clock className="w-5 h-5 text-blue-600" /></div>
                                <div>
                                    <p className="text-xl font-bold text-slate-900">{items.length}</p>
                                    <p className="text-xs text-slate-500">Tổng giờ học</p>
                                </div>
                            </div>
                            <div className="bg-white border border-slate-200 rounded-xl px-5 py-3 flex items-center gap-3 shadow-sm">
                                <div className="rounded-lg bg-green-100 p-2"><CheckCircle className="w-5 h-5 text-green-600" /></div>
                                <div>
                                    <p className="text-xl font-bold text-green-700">
                                        {items.filter(i => i.thoiGianBatDau && i.thoiGianKetThuc).length}
                                    </p>
                                    <p className="text-xs text-slate-500">Có thời gian</p>
                                </div>
                            </div>
                            <div className="bg-white border border-slate-200 rounded-xl px-5 py-3 flex items-center gap-3 shadow-sm">
                                <div className="rounded-lg bg-amber-100 p-2"><Clock className="w-5 h-5 text-amber-600" /></div>
                                <div>
                                    <p className="text-xl font-bold text-amber-700">
                                        {items.filter(i => !i.thoiGianBatDau || !i.thoiGianKetThuc).length}
                                    </p>
                                    <p className="text-xs text-slate-500">Chưa có thời gian</p>
                                </div>
                            </div>
                        </div>

                        <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-3 flex flex-col sm:flex-row gap-3 items-start sm:items-center justify-between sticky top-0 z-20">
                            <div className="relative flex-1 max-w-sm w-full">
                                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                                <input
                                    value={searchQuery}
                                    onChange={e => setSearchQuery(e.target.value)}
                                    placeholder="Tìm mã hoặc tên giờ học..."
                                    className="w-full pl-9 pr-4 py-2 text-sm border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                                />
                            </div>
                            <div className="flex items-center gap-2">
                                <button onClick={fetch} title="Làm mới"
                                    className="p-2 border border-slate-300 rounded-lg text-slate-600 hover:bg-slate-50 transition-colors">
                                    <RefreshCw className="w-4 h-4" />
                                </button>
                                <button onClick={() => { setImportFile(null); setImportResult(null); setIsImportOpen(true); }}
                                    className="flex items-center gap-1.5 px-3 py-2 border border-slate-300 text-slate-700 rounded-lg hover:bg-slate-50 text-sm font-medium">
                                    <FileSpreadsheet className="w-4 h-4" /> Import
                                </button>
                                <button onClick={openAdd}
                                    className="flex items-center gap-1.5 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 text-sm font-medium shadow-sm">
                                    <Plus className="w-4 h-4" /> Thêm mới
                                </button>
                            </div>
                        </div>

                        <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
                            {loading ? (
                                <div className="flex flex-col items-center justify-center h-72 gap-3">
                                    <div className="w-9 h-9 border-4 border-slate-200 border-t-blue-600 rounded-full animate-spin" />
                                    <p className="text-sm text-slate-500">Đang tải...</p>
                                </div>
                            ) : (
                                <div ref={scrollRef} className="overflow-auto" style={{ maxHeight: 'calc(100vh - 380px)' }}>
                                    <table className="w-full text-sm">
                                        <thead className="sticky top-0 z-10 bg-gradient-to-r from-blue-600 to-blue-700 text-white">
                                            <tr>
                                                <th className="px-4 py-3 text-left font-semibold">Mã Giờ Học</th>
                                                <th className="px-4 py-3 text-left font-semibold">Tên Giờ Học</th>
                                                <th className="px-4 py-3 text-left font-semibold">Bắt Đầu</th>
                                                <th className="px-4 py-3 text-left font-semibold">Kết Thúc</th>
                                                <th className="px-4 py-3 text-center font-semibold">Thao Tác</th>
                                            </tr>
                                        </thead>
                                        <tbody className="divide-y divide-slate-100">
                                            {filtered.map(i => (
                                                <tr key={i.id} className="transition-colors hover:bg-blue-50/60">
                                                    <td className="px-4 py-3 font-semibold text-slate-900">{i.maGioHoc}</td>
                                                    <td className="px-4 py-3 text-slate-700">{i.tenGioHoc}</td>
                                                    <td className="px-4 py-3 text-slate-500">{i.thoiGianBatDau || '—'}</td>
                                                    <td className="px-4 py-3 text-slate-500">{i.thoiGianKetThuc || '—'}</td>
                                                    <td className="px-4 py-3">
                                                        <div className="flex items-center justify-center gap-1">
                                                            <button onClick={() => openEdit(i)} title="Chỉnh sửa"
                                                                className="p-1.5 text-blue-600 hover:bg-blue-100 rounded-lg transition-colors">
                                                                <Edit className="w-4 h-4" />
                                                            </button>
                                                            <button onClick={() => openDelete(i)} title="Xóa"
                                                                className="p-1.5 text-red-500 hover:bg-red-100 rounded-lg transition-colors">
                                                                <Trash2 className="w-4 h-4" />
                                                            </button>
                                                        </div>
                                                    </td>
                                                </tr>
                                            ))}
                                            {filtered.length === 0 && (
                                                <tr>
                                                    <td colSpan={5} className="py-16 text-center">
                                                        <div className="flex flex-col items-center gap-2">
                                                            <div className="rounded-full bg-slate-100 p-4">
                                                                <Clock className="w-8 h-8 text-slate-400" />
                                                            </div>
                                                            <p className="font-medium text-slate-600">
                                                                {searchQuery ? 'Không tìm thấy kết quả' : 'Chưa có giờ học nào'}
                                                            </p>
                                                            <p className="text-sm text-slate-400">
                                                                {searchQuery ? 'Thử từ khóa khác' : 'Nhấn "Thêm mới" để bắt đầu'}
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

                        {!loading && items.length > 0 && (
                            <div className="flex items-center justify-between text-xs text-slate-500 px-1">
                                <span>
                                    Hiển thị <b className="text-slate-700">{filtered.length}</b> / <b className="text-slate-700">{items.length}</b> giờ học
                                </span>
                                {searchQuery && (
                                    <span>Tìm thấy {filtered.length} kết quả cho "{searchQuery}"</span>
                                )}
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {isAddOpen && (
                <div className="fixed inset-0 bg-black/30 flex items-center justify-center z-50 p-4" onClick={() => setIsAddOpen(false)}>
                    <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto" onClick={e => e.stopPropagation()}>
                        <div className="sticky top-0 bg-gradient-to-r from-blue-600 to-blue-700 text-white px-6 py-4 flex items-center justify-between rounded-t-2xl z-10">
                            <h2 className="text-base font-bold flex items-center gap-2"><Plus className="w-5 h-5" /> Thêm Giờ Học Mới</h2>
                            <button onClick={() => setIsAddOpen(false)} className="p-1 hover:bg-white/20 rounded-lg"><X className="w-5 h-5" /></button>
                        </div>
                        <form className="p-6 space-y-5" onSubmit={handleCreate}>
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className={lbl}>Mã giờ học <span className="text-red-500">*</span></label>
                                    <input required value={form.maGioHoc} onChange={e => setForm({ ...form, maGioHoc: e.target.value })} placeholder="VD: T1" className={inp} />
                                </div>
                                <div>
                                    <label className={lbl}>Tên giờ học <span className="text-red-500">*</span></label>
                                    <input required value={form.tenGioHoc} onChange={e => setForm({ ...form, tenGioHoc: e.target.value })} placeholder="VD: Tiết 1" className={inp} />
                                </div>
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className={lbl}>Thời gian bắt đầu</label>
                                    <input type="time" value={form.thoiGianBatDau} onChange={e => setForm({ ...form, thoiGianBatDau: e.target.value })} className={inp} />
                                </div>
                                <div>
                                    <label className={lbl}>Thời gian kết thúc</label>
                                    <input type="time" value={form.thoiGianKetThuc} onChange={e => setForm({ ...form, thoiGianKetThuc: e.target.value })} className={inp} />
                                </div>
                            </div>
                            <div className="flex gap-3 pt-4 border-t border-slate-100">
                                <button type="button" onClick={() => setIsAddOpen(false)} className="flex-1 py-2.5 border border-slate-300 rounded-xl text-sm font-medium text-slate-700 hover:bg-slate-50">Hủy</button>
                                <button type="submit" disabled={isSubmitting} className="flex-1 py-2.5 bg-blue-600 text-white rounded-xl text-sm font-medium hover:bg-blue-700 disabled:opacity-50">
                                    {isSubmitting ? 'Đang thêm...' : 'Thêm Giờ Học'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {isEditOpen && selected && (
                <div className="fixed inset-0 bg-black/30 flex items-center justify-center z-50 p-4" onClick={() => setIsEditOpen(false)}>
                    <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto" onClick={e => e.stopPropagation()}>
                        <div className="sticky top-0 bg-gradient-to-r from-blue-600 to-blue-700 text-white px-6 py-4 flex items-center justify-between rounded-t-2xl z-10">
                            <div>
                                <h2 className="text-base font-bold flex items-center gap-2"><Edit className="w-5 h-5" /> Chỉnh Sửa Giờ Học</h2>
                                <p className="text-xs text-blue-200 mt-0.5">{selected.maGioHoc} — {selected.tenGioHoc}</p>
                            </div>
                            <button onClick={() => setIsEditOpen(false)} className="p-1 hover:bg-white/20 rounded-lg"><X className="w-5 h-5" /></button>
                        </div>
                        <form className="p-6 space-y-5" onSubmit={handleUpdate}>
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className={lbl}>Mã giờ học <span className="text-red-500">*</span></label>
                                    <input required value={form.maGioHoc} onChange={e => setForm({ ...form, maGioHoc: e.target.value })} className={inp} />
                                </div>
                                <div>
                                    <label className={lbl}>Tên giờ học <span className="text-red-500">*</span></label>
                                    <input required value={form.tenGioHoc} onChange={e => setForm({ ...form, tenGioHoc: e.target.value })} className={inp} />
                                </div>
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className={lbl}>Thời gian bắt đầu</label>
                                    <input type="time" value={form.thoiGianBatDau} onChange={e => setForm({ ...form, thoiGianBatDau: e.target.value })} className={inp} />
                                </div>
                                <div>
                                    <label className={lbl}>Thời gian kết thúc</label>
                                    <input type="time" value={form.thoiGianKetThuc} onChange={e => setForm({ ...form, thoiGianKetThuc: e.target.value })} className={inp} />
                                </div>
                            </div>
                            <div className="flex gap-3 pt-4 border-t border-slate-100">
                                <button type="button" onClick={() => setIsEditOpen(false)} className="flex-1 py-2.5 border border-slate-300 rounded-xl text-sm font-medium text-slate-700 hover:bg-slate-50">Hủy</button>
                                <button type="submit" disabled={isSubmitting} className="flex-1 py-2.5 bg-blue-600 text-white rounded-xl text-sm font-medium hover:bg-blue-700 disabled:opacity-50">
                                    {isSubmitting ? 'Đang lưu...' : 'Lưu Thay Đổi'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {isDeleteOpen && selected && (
                <div className="fixed inset-0 bg-black/30 flex items-center justify-center z-[60] p-4" onClick={() => setIsDeleteOpen(false)}>
                    <div className="bg-white rounded-2xl shadow-2xl max-w-sm w-full p-6" onClick={e => e.stopPropagation()}>
                        <div className="flex items-center gap-3 mb-4">
                            <div className="rounded-full bg-red-100 p-3 flex-shrink-0">
                                <AlertCircle className="w-6 h-6 text-red-600" />
                            </div>
                            <h3 className="font-bold text-slate-900">Xác nhận xóa</h3>
                        </div>
                        <p className="text-sm text-slate-600 mb-6">
                            Bạn có chắc muốn xóa giờ học <b>{selected.tenGioHoc}</b>? Hành động không thể hoàn tác.
                        </p>
                        <div className="flex gap-3">
                            <button onClick={() => setIsDeleteOpen(false)} className="flex-1 py-2.5 border border-slate-300 rounded-xl text-sm font-medium text-slate-700 hover:bg-slate-50">Hủy</button>
                            <button onClick={confirmDelete} className="flex-1 py-2.5 bg-red-600 text-white rounded-xl text-sm font-medium hover:bg-red-700">
                                Xóa
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {isImportOpen && (
                <div className="fixed inset-0 bg-black/30 flex items-center justify-center z-50 p-4" onClick={() => setIsImportOpen(false)}>
                    <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full" onClick={e => e.stopPropagation()}>
                        <div className="bg-gradient-to-r from-emerald-600 to-emerald-700 text-white px-6 py-4 flex items-center justify-between rounded-t-2xl">
                            <h2 className="text-base font-bold flex items-center gap-2"><FileSpreadsheet className="w-5 h-5" /> Import Giờ Học từ Excel</h2>
                            <button onClick={() => setIsImportOpen(false)} className="p-1 hover:bg-white/20 rounded-lg"><X className="w-5 h-5" /></button>
                        </div>
                        <div className="p-5 space-y-4">
                            <div className={`border-2 border-dashed rounded-xl p-8 text-center cursor-pointer transition-all ${importFile ? 'border-emerald-400 bg-emerald-50' : 'border-slate-300 hover:border-blue-400 hover:bg-blue-50/50'}`}
                                onClick={() => importRef.current?.click()}>
                                <input ref={importRef} type="file" accept=".xlsx,.xls" className="hidden"
                                    onChange={e => { setImportFile(e.target.files?.[0] || null); setImportResult(null); }} />
                                <Upload className={`w-9 h-9 mx-auto mb-2 ${importFile ? 'text-emerald-500' : 'text-slate-400'}`} />
                                {importFile ? (
                                    <>
                                        <p className="font-semibold text-sm text-emerald-700">{importFile.name}</p>
                                        <p className="text-xs text-emerald-500 mt-1">Nhấn để đổi file</p>
                                    </>
                                ) : (
                                    <>
                                        <p className="text-sm font-medium text-slate-600">Kéo thả hoặc nhấn để chọn file</p>
                                        <p className="text-xs text-slate-400 mt-1">Hỗ trợ .xlsx, .xls</p>
                                    </>
                                )}
                            </div>

                            {importResult && (
                                <div className="rounded-xl border border-slate-200 overflow-hidden">
                                    <div className="grid grid-cols-3 divide-x divide-slate-200 bg-slate-50 text-center text-sm">
                                        <div className="py-3">
                                            <p className="text-xl font-bold text-slate-800">{importResult.totalRows}</p>
                                            <p className="text-xs text-slate-500">Tổng dòng</p>
                                        </div>
                                        <div className="py-3">
                                            <p className="text-xl font-bold text-emerald-600">{importResult.successCount}</p>
                                            <p className="text-xs text-slate-500">Thành công</p>
                                        </div>
                                        <div className="py-3">
                                            <p className="text-xl font-bold text-red-600">{importResult.errorCount}</p>
                                            <p className="text-xs text-slate-500">Lỗi</p>
                                        </div>
                                    </div>
                                    {importResult.errors.length > 0 && (
                                        <div className="bg-red-50 border-t border-red-200 p-3 max-h-28 overflow-y-auto">
                                            {importResult.errors.map((e, i) => (
                                                <p key={i} className="text-xs text-red-600 py-0.5">{e}</p>
                                            ))}
                                        </div>
                                    )}
                                </div>
                            )}

                            <div className="flex gap-3">
                                <button onClick={() => setIsImportOpen(false)} className="flex-1 py-2.5 border border-slate-300 rounded-xl text-sm font-medium text-slate-700 hover:bg-slate-50">Đóng</button>
                                <button onClick={handleImport} disabled={!importFile || isImporting}
                                    className="flex-1 py-2.5 bg-emerald-600 text-white rounded-xl text-sm font-medium hover:bg-emerald-700 disabled:opacity-50">
                                    {isImporting ? 'Đang import...' : 'Import'}
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            <div className="fixed bottom-24 right-6 space-y-2 z-[70] pointer-events-none">
                {toasts.map(t => (
                    <div key={t.id} className={`flex items-start gap-2.5 px-4 py-3 rounded-xl shadow-xl text-white text-sm font-medium max-w-xs pointer-events-auto ${t.type === 'success' ? 'bg-green-600' : t.type === 'error' ? 'bg-red-600' : 'bg-blue-600'}`}>
                        {t.type === 'success' && <CheckCircle className="w-4 h-4 flex-shrink-0 mt-0.5" />}
                        {t.type === 'error' && <AlertCircle className="w-4 h-4 flex-shrink-0 mt-0.5" />}
                        <span>{t.message}</span>
                    </div>
                ))}
            </div>

            <button className="fixed bottom-8 right-8 w-14 h-14 z-50 hover:scale-110 transition-transform" aria-label="AI">
                <AiAssistantButton />
            </button>
        </div>
    );
}
