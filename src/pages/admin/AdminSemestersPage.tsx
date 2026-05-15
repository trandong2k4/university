import { AdminSidebar } from '@/components/layouts/AdminSidebar';
import { AdminHeader } from '@/components/layouts/AdminHeader';
import { useEffect, useRef, useState } from 'react';
import { Plus, Edit, Trash2, X, Search, RefreshCw, AlertCircle, CheckCircle } from 'lucide-react';
import AiAssistantButton from '@/imports/AiAssistantButton-4-13343';
import type { SemesterItem } from '@/types';
import * as hocKiApi from '@/api/admin/hocki.api';

interface Toast { id: string; message: string; type: 'success' | 'info'; }

function parseBackendDateToInput(dateStr?: string) {
    if (!dateStr) return '';
    const parts = dateStr.split(' ');
    const datePart = parts[0];
    if (datePart.includes('/')) {
        const [d, m, y] = datePart.split('/');
        return `${y}-${m.padStart(2, '0')}-${d.padStart(2, '0')}`;
    }
    const dt = new Date(dateStr);
    if (!isNaN(dt.getTime())) {
        const y = dt.getFullYear();
        const m = String(dt.getMonth() + 1).padStart(2, '0');
        const d = String(dt.getDate()).padStart(2, '0');
        return `${y}-${m}-${d}`;
    }
    return '';
}

function formatToBackendDateTimeFromDateInput(value: string) {
    if (!value) return '';
    return `${value}T00:00:00`;
}

const extractError = (err: unknown, fallback: string): string => {
    if (err && typeof err === 'object') {
        const e = err as { response?: { data?: { detail?: string; message?: string } } };
        return e.response?.data?.detail || e.response?.data?.message || fallback;
    }
    return fallback;
};

export default function AdminSemestersPage() {
    const scrollRef = useRef<HTMLDivElement>(null);

    const [items, setItems] = useState<SemesterItem[]>([]);
    const [loading, setLoading] = useState(false);
    const [searchQuery, setSearchQuery] = useState('');
    const [selectedYear, setSelectedYear] = useState<string>('ALL');
    const [toasts, setToasts] = useState<Toast[]>([]);
    const [errorMsg, setErrorMsg] = useState<string | null>(null);

    const [isAddOpen, setIsAddOpen] = useState(false);
    const [isEditOpen, setIsEditOpen] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [selected, setSelected] = useState<SemesterItem | null>(null);
    const [confirm, setConfirm] = useState<{
        open: boolean;
        message: string;
        onConfirm: (() => void) | null;
    }>({ open: false, message: '', onConfirm: null });

    const [form, setForm] = useState({
        maHocKi: '',
        tenHocKi: '',
        ngayBatDau: '',
        ngayKetThuc: ''
    });

    const addToast = (message: string, type: 'success' | 'error' | 'info' = 'info') => {
        if (type === 'error') {
            setErrorMsg(message);
            setTimeout(() => setErrorMsg(null), 6000);
            return;
        }
        const id = Date.now().toString();
        setToasts(p => [...p, { id, message, type: type as 'success' | 'info' }]);
        setTimeout(() => setToasts(p => p.filter(t => t.id !== id)), 4000);
    };

    const fetch = async () => {
        try {
            setLoading(true);
            const data = await hocKiApi.getAllHocKi();
            setItems(data || []);
        } catch (err) {
            console.error(err);
            addToast(extractError(err, 'Lỗi khi tải học kỳ'), 'error');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => { fetch(); }, []);

    // Extract unique years from items based on ngayBatDau
    const years = Array.from(new Set(
        items
            .filter(i => i.ngayBatDau)
            .map(i => new Date(i.ngayBatDau!).getFullYear().toString())
    )).sort((a, b) => parseInt(b) - parseInt(a));

    // Also check ngayKetThuc for items that might not have ngayBatDau
    const yearsFromEnd = Array.from(new Set(
        items
            .filter(i => i.ngayKetThuc && !i.ngayBatDau)
            .map(i => new Date(i.ngayKetThuc!).getFullYear().toString())
    ));
    const allYears = Array.from(new Set([...years, ...yearsFromEnd])).sort((a, b) => parseInt(b) - parseInt(a));

    const filtered = items.filter(i => {
        const q = searchQuery.toLowerCase();
        const matchQuery = !q ||
            i.maHocKi?.toLowerCase().includes(q) ||
            i.tenHocKi?.toLowerCase().includes(q);

        if (!matchQuery) return false;

        // Filter by year
        if (selectedYear === 'ALL') return true;
        const startYear = i.ngayBatDau ? new Date(i.ngayBatDau).getFullYear().toString() : null;
        const endYear = i.ngayKetThuc ? new Date(i.ngayKetThuc).getFullYear().toString() : null;
        return startYear === selectedYear || endYear === selectedYear;
    });

    const TABS = [
        { key: 'ALL', label: 'Tất cả' },
        ...allYears.map(y => ({ key: y, label: `Năm ${y}` })),
    ] as const;

    const tabCount = (key: string) => {
        if (key === 'ALL') return items.length;
        return items.filter(i => {
            const startYear = i.ngayBatDau ? new Date(i.ngayBatDau).getFullYear().toString() : null;
            const endYear = i.ngayKetThuc ? new Date(i.ngayKetThuc).getFullYear().toString() : null;
            return startYear === key || endYear === key;
        }).length;
    };

    const openAdd = () => {
        setForm({ maHocKi: '', tenHocKi: '', ngayBatDau: '', ngayKetThuc: '' });
        setIsAddOpen(true);
    };

    const openEdit = (item: SemesterItem) => {
        setSelected(item);
        setForm({
            maHocKi: item.maHocKi,
            tenHocKi: item.tenHocKi,
            ngayBatDau: parseBackendDateToInput(item.ngayBatDau),
            ngayKetThuc: parseBackendDateToInput(item.ngayKetThuc)
        });
        setIsEditOpen(true);
    };

    const validate = (isCreate: boolean) => {
        if (!form.maHocKi.trim()) {
            addToast('Vui lòng nhập mã học kỳ', 'error');
            return false;
        }
        if (!form.tenHocKi.trim()) {
            addToast('Vui lòng nhập tên học kỳ', 'error');
            return false;
        }
        if (form.ngayBatDau && form.ngayKetThuc) {
            if (new Date(form.ngayBatDau) > new Date(form.ngayKetThuc)) {
                addToast('Ngày bắt đầu phải nhỏ hơn ngày kết thúc', 'error');
                return false;
            }
        }
        return true;
    };

    const handleCreate = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!validate(true)) return;
        try {
            setIsSubmitting(true);
            await hocKiApi.createHocKi({
                maHocKi: form.maHocKi,
                tenHocKi: form.tenHocKi,
                ngayBatDau: formatToBackendDateTimeFromDateInput(form.ngayBatDau),
                ngayKetThuc: formatToBackendDateTimeFromDateInput(form.ngayKetThuc)
            });
            addToast('Thêm học kỳ thành công', 'success');
            setIsAddOpen(false);
            await fetch();
        } catch (err) {
            console.error(err);
            addToast(extractError(err, 'Lỗi khi thêm học kỳ'), 'error');
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleUpdate = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!selected || !validate(false)) return;
        try {
            setIsSubmitting(true);
            await hocKiApi.updateHocKi(selected.id, {
                maHocKi: form.maHocKi,
                tenHocKi: form.tenHocKi,
                ngayBatDau: formatToBackendDateTimeFromDateInput(form.ngayBatDau),
                ngayKetThuc: formatToBackendDateTimeFromDateInput(form.ngayKetThuc)
            });
            addToast('Cập nhật học kỳ thành công', 'success');
            setIsEditOpen(false);
            setSelected(null);
            await fetch();
        } catch (err) {
            console.error(err);
            addToast(extractError(err, 'Lỗi khi cập nhật học kỳ'), 'error');
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleDelete = (id: string, tenHocKi: string) => {
        setConfirm({
            open: true,
            message: `Bạn có chắc muốn xóa học kỳ "${tenHocKi}"? Hành động không thể hoàn tác.`,
            onConfirm: async () => {
                try {
                    await hocKiApi.deleteHocKi(id);
                    addToast('Xóa học kỳ thành công', 'success');
                    await fetch();
                } catch (err) {
                    console.error(err);
                    addToast(extractError(err, 'Lỗi khi xóa học kỳ'), 'error');
                }
            }
        });
    };

    const inp = 'w-full px-3 py-2.5 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all';
    const lbl = 'block text-sm font-medium text-slate-700 mb-1.5';

    return (
        <div className="flex h-screen bg-slate-50">
            <AdminSidebar activeMenu="semesters" />
            <div className="flex-1 ml-64 flex flex-col overflow-hidden">
                <AdminHeader title="Quản lý Học kỳ" />
                <div className="flex-1 overflow-auto">
                    <div className="p-6 max-w-7xl mx-auto space-y-4">

                        {/* Stats bar */}
                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                            <div className="bg-white border border-slate-200 rounded-xl px-5 py-3 flex items-center gap-3 shadow-sm">
                                <div className="rounded-lg bg-blue-100 p-2">
                                    <span className="text-xl">📅</span>
                                </div>
                                <div>
                                    <p className="text-xl font-bold text-slate-900">{items.length}</p>
                                    <p className="text-xs text-slate-500">Tổng học kỳ</p>
                                </div>
                            </div>
                            <div className="bg-white border border-slate-200 rounded-xl px-5 py-3 flex items-center gap-3 shadow-sm">
                                <div className="rounded-lg bg-green-100 p-2">
                                    <CheckCircle className="w-5 h-5 text-green-600" />
                                </div>
                                <div>
                                    <p className="text-xl font-bold text-green-700">
                                        {items.filter(i => i.ngayBatDau && new Date(i.ngayBatDau) <= new Date()).length}
                                    </p>
                                    <p className="text-xs text-slate-500">Đã diễn ra</p>
                                </div>
                            </div>
                            <div className="bg-white border border-slate-200 rounded-xl px-5 py-3 flex items-center gap-3 shadow-sm">
                                <div className="rounded-lg bg-amber-100 p-2">
                                    <span className="text-xl">⏳</span>
                                </div>
                                <div>
                                    <p className="text-xl font-bold text-amber-700">
                                        {items.filter(i => i.ngayKetThuc && new Date(i.ngayKetThuc) >= new Date()).length}
                                    </p>
                                    <p className="text-xs text-slate-500">Sắp tới / Đang diễn ra</p>
                                </div>
                            </div>
                        </div>

                        {/* Toolbar with sticky search */}
                        <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-3 flex flex-col sm:flex-row gap-3 items-start sm:items-center justify-between sticky top-0 z-20">
                            <div className="relative flex-1 max-w-sm w-full">
                                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                                <input
                                    value={searchQuery}
                                    onChange={e => setSearchQuery(e.target.value)}
                                    placeholder="Tìm mã hoặc tên học kỳ..."
                                    className="w-full pl-9 pr-4 py-2 text-sm border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                                />
                            </div>
                            <div className="flex items-center gap-2">
                                <button
                                    onClick={fetch}
                                    title="Làm mới"
                                    className="p-2 border border-slate-300 rounded-lg text-slate-600 hover:bg-slate-50 transition-colors"
                                >
                                    <RefreshCw className="w-4 h-4" />
                                </button>
                                <button
                                    onClick={openAdd}
                                    className="flex items-center gap-1.5 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 text-sm font-medium shadow-sm"
                                >
                                    <Plus className="w-4 h-4" /> Thêm mới
                                </button>
                            </div>
                        </div>

                        {/* Year filter tabs */}
                        <div className="bg-white rounded-xl border border-slate-200 shadow-sm px-4 py-2 flex items-center gap-1 overflow-x-auto">
                            {TABS.map(tab => {
                                const count = tabCount(tab.key);
                                const active = selectedYear === tab.key;
                                return (
                                    <button
                                        key={tab.key}
                                        onClick={() => setSelectedYear(tab.key)}
                                        className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium whitespace-nowrap transition-all ${active
                                                ? 'bg-blue-600 text-white shadow-sm'
                                                : 'text-slate-600 hover:bg-slate-100'
                                            }`}
                                    >
                                        {tab.label}
                                        <span className={`text-xs px-1.5 py-0.5 rounded-full font-semibold ${active
                                                ? 'bg-white/25 text-white'
                                                : 'bg-slate-100 text-slate-500'
                                            }`}>
                                            {count}
                                        </span>
                                    </button>
                                );
                            })}
                        </div>

                        {/* Table */}
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
                                                <th className="px-4 py-3 text-left font-semibold">Mã Học Kỳ</th>
                                                <th className="px-4 py-3 text-left font-semibold">Tên Học Kỳ</th>
                                                <th className="px-4 py-3 text-left font-semibold">Ngày Bắt Đầu</th>
                                                <th className="px-4 py-3 text-left font-semibold">Ngày Kết Thúc</th>
                                                <th className="px-4 py-3 text-center font-semibold">Thao Tác</th>
                                            </tr>
                                        </thead>
                                        <tbody className="divide-y divide-slate-100">
                                            {filtered.map(i => {
                                                const isPast = i.ngayKetThuc && new Date(i.ngayKetThuc) < new Date();
                                                return (
                                                    <tr key={i.id} className={`transition-colors hover:bg-blue-50/60 ${isPast ? 'opacity-60' : ''}`}>
                                                        <td className="px-4 py-3 font-semibold text-slate-900">{i.maHocKi}</td>
                                                        <td className="px-4 py-3 text-slate-700">{i.tenHocKi}</td>
                                                        <td className="px-4 py-3 text-slate-500">{i.ngayBatDau || '—'}</td>
                                                        <td className="px-4 py-3 text-slate-500">{i.ngayKetThuc || '—'}</td>
                                                        <td className="px-4 py-3">
                                                            <div className="flex items-center justify-center gap-1">
                                                                <button
                                                                    onClick={() => openEdit(i)}
                                                                    title="Chỉnh sửa"
                                                                    className="p-1.5 text-blue-600 hover:bg-blue-100 rounded-lg transition-colors"
                                                                >
                                                                    <Edit className="w-4 h-4" />
                                                                </button>
                                                                <button
                                                                    onClick={() => handleDelete(i.id, i.tenHocKi)}
                                                                    title="Xóa"
                                                                    className="p-1.5 text-red-500 hover:bg-red-100 rounded-lg transition-colors"
                                                                >
                                                                    <Trash2 className="w-4 h-4" />
                                                                </button>
                                                            </div>
                                                        </td>
                                                    </tr>
                                                );
                                            })}
                                            {filtered.length === 0 && (
                                                <tr>
                                                    <td colSpan={5} className="py-16 text-center">
                                                        <div className="flex flex-col items-center gap-2">
                                                            <div className="rounded-full bg-slate-100 p-4">
                                                                <span className="text-3xl">📅</span>
                                                            </div>
                                                            <p className="font-medium text-slate-600">
                                                                {searchQuery ? 'Không tìm thấy kết quả' : 'Chưa có học kỳ nào'}
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

                        {/* Footer */}
                        {!loading && items.length > 0 && (
                            <div className="flex items-center justify-between text-xs text-slate-500 px-1">
                                <span>
                                    Hiển thị <b className="text-slate-700">{filtered.length}</b> / <b className="text-slate-700">{items.length}</b> học kỳ
                                </span>
                                <span>
                                    {selectedYear !== 'ALL' && `Đang lọc: Năm ${selectedYear}`}
                                    {searchQuery && (selectedYear !== 'ALL' ? ' | ' : '') + `Tìm: "${searchQuery}"`}
                                </span>
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {/* Add Modal */}
            {isAddOpen && (
                <div className="fixed inset-0 bg-black/30 flex items-center justify-center z-50 p-4" onClick={() => setIsAddOpen(false)}>
                    <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto" onClick={e => e.stopPropagation()}>
                        <div className="sticky top-0 bg-gradient-to-r from-blue-600 to-blue-700 text-white px-6 py-4 flex items-center justify-between rounded-t-2xl z-10">
                            <h2 className="text-base font-bold flex items-center gap-2"><Plus className="w-5 h-5" /> Thêm Học Kỳ Mới</h2>
                            <button onClick={() => setIsAddOpen(false)} className="p-1 hover:bg-white/20 rounded-lg"><X className="w-5 h-5" /></button>
                        </div>
                        <form className="p-6 space-y-5" onSubmit={handleCreate}>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div>
                                    <label className={lbl}>Mã học kỳ <span className="text-red-500">*</span></label>
                                    <input
                                        required
                                        value={form.maHocKi}
                                        onChange={e => setForm({ ...form, maHocKi: e.target.value })}
                                        placeholder="VD: HK20241"
                                        className={inp}
                                    />
                                </div>
                                <div>
                                    <label className={lbl}>Tên học kỳ <span className="text-red-500">*</span></label>
                                    <input
                                        required
                                        value={form.tenHocKi}
                                        onChange={e => setForm({ ...form, tenHocKi: e.target.value })}
                                        placeholder="VD: Học kỳ 1 - 2024"
                                        className={inp}
                                    />
                                </div>
                            </div>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div>
                                    <label className={lbl}>Ngày bắt đầu</label>
                                    <input
                                        type="date"
                                        value={form.ngayBatDau}
                                        onChange={e => setForm({ ...form, ngayBatDau: e.target.value })}
                                        className={inp}
                                    />
                                </div>
                                <div>
                                    <label className={lbl}>Ngày kết thúc</label>
                                    <input
                                        type="date"
                                        value={form.ngayKetThuc}
                                        onChange={e => setForm({ ...form, ngayKetThuc: e.target.value })}
                                        className={`${inp} ${form.ngayBatDau && form.ngayKetThuc && new Date(form.ngayBatDau) > new Date(form.ngayKetThuc) ? '!border-red-400' : ''}`}
                                    />
                                    {form.ngayBatDau && form.ngayKetThuc && new Date(form.ngayBatDau) > new Date(form.ngayKetThuc) && (
                                        <p className="text-xs text-red-500 mt-1">Ngày bắt đầu phải nhỏ hơn ngày kết thúc</p>
                                    )}
                                </div>
                            </div>
                            <div className="flex gap-3 pt-4 border-t border-slate-100">
                                <button type="button" onClick={() => setIsAddOpen(false)}
                                    className="flex-1 py-2.5 border border-slate-300 rounded-xl text-sm font-medium text-slate-700 hover:bg-slate-50">
                                    Hủy
                                </button>
                                <button type="submit" disabled={isSubmitting}
                                    className="flex-1 py-2.5 bg-blue-600 text-white rounded-xl text-sm font-medium hover:bg-blue-700 disabled:opacity-50">
                                    {isSubmitting ? 'Đang thêm...' : 'Thêm Học Kỳ'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* Edit Modal */}
            {isEditOpen && selected && (
                <div className="fixed inset-0 bg-black/30 flex items-center justify-center z-50 p-4" onClick={() => setIsEditOpen(false)}>
                    <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto" onClick={e => e.stopPropagation()}>
                        <div className="sticky top-0 bg-gradient-to-r from-blue-600 to-blue-700 text-white px-6 py-4 flex items-center justify-between rounded-t-2xl z-10">
                            <div>
                                <h2 className="text-base font-bold flex items-center gap-2"><Edit className="w-5 h-5" /> Chỉnh Sửa Học Kỳ</h2>
                                <p className="text-xs text-blue-200 mt-0.5">{selected.maHocKi} — {selected.tenHocKi}</p>
                            </div>
                            <button onClick={() => setIsEditOpen(false)} className="p-1 hover:bg-white/20 rounded-lg"><X className="w-5 h-5" /></button>
                        </div>
                        <form className="p-6 space-y-5" onSubmit={handleUpdate}>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div>
                                    <label className={lbl}>Mã học kỳ <span className="text-red-500">*</span></label>
                                    <input
                                        required
                                        value={form.maHocKi}
                                        onChange={e => setForm({ ...form, maHocKi: e.target.value })}
                                        className={inp}
                                    />
                                </div>
                                <div>
                                    <label className={lbl}>Tên học kỳ <span className="text-red-500">*</span></label>
                                    <input
                                        required
                                        value={form.tenHocKi}
                                        onChange={e => setForm({ ...form, tenHocKi: e.target.value })}
                                        className={inp}
                                    />
                                </div>
                            </div>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div>
                                    <label className={lbl}>Ngày bắt đầu</label>
                                    <input
                                        type="date"
                                        value={form.ngayBatDau}
                                        onChange={e => setForm({ ...form, ngayBatDau: e.target.value })}
                                        className={inp}
                                    />
                                </div>
                                <div>
                                    <label className={lbl}>Ngày kết thúc</label>
                                    <input
                                        type="date"
                                        value={form.ngayKetThuc}
                                        onChange={e => setForm({ ...form, ngayKetThuc: e.target.value })}
                                        className={`${inp} ${form.ngayBatDau && form.ngayKetThuc && new Date(form.ngayBatDau) > new Date(form.ngayKetThuc) ? '!border-red-400' : ''}`}
                                    />
                                    {form.ngayBatDau && form.ngayKetThuc && new Date(form.ngayBatDau) > new Date(form.ngayKetThuc) && (
                                        <p className="text-xs text-red-500 mt-1">Ngày bắt đầu phải nhỏ hơn ngày kết thúc</p>
                                    )}
                                </div>
                            </div>
                            <div className="flex gap-3 pt-4 border-t border-slate-100">
                                <button type="button" onClick={() => setIsEditOpen(false)}
                                    className="flex-1 py-2.5 border border-slate-300 rounded-xl text-sm font-medium text-slate-700 hover:bg-slate-50">
                                    Hủy
                                </button>
                                <button type="submit" disabled={isSubmitting}
                                    className="flex-1 py-2.5 bg-blue-600 text-white rounded-xl text-sm font-medium hover:bg-blue-700 disabled:opacity-50">
                                    {isSubmitting ? 'Đang lưu...' : 'Lưu Thay Đổi'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* Confirm Modal */}
            {confirm.open && (
                <div className="fixed inset-0 bg-black/30 flex items-center justify-center z-[60] p-4"
                    onClick={() => setConfirm(m => ({ ...m, open: false }))}>
                    <div className="bg-white rounded-2xl shadow-2xl max-w-sm w-full p-6" onClick={e => e.stopPropagation()}>
                        <div className="flex items-center gap-3 mb-4">
                            <div className="rounded-full bg-red-100 p-3 flex-shrink-0">
                                <AlertCircle className="w-6 h-6 text-red-600" />
                            </div>
                            <h3 className="font-bold text-slate-900">Xác nhận xóa</h3>
                        </div>
                        <p className="text-sm text-slate-600 mb-6">{confirm.message}</p>
                        <div className="flex gap-3">
                            <button onClick={() => setConfirm(m => ({ ...m, open: false }))}
                                className="flex-1 py-2.5 border border-slate-300 rounded-xl text-sm font-medium text-slate-700 hover:bg-slate-50">
                                Hủy
                            </button>
                            <button onClick={() => { confirm.onConfirm?.(); setConfirm(m => ({ ...m, open: false })); }}
                                className="flex-1 py-2.5 bg-red-600 text-white rounded-xl text-sm font-medium hover:bg-red-700">
                                Xóa
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Error Overlay — hiển thị giữa màn hình */}
            {errorMsg && (
                <div className="fixed inset-0 z-[80] flex items-center justify-center p-4 pointer-events-none">
                    <div className="bg-red-600 text-white rounded-2xl shadow-2xl max-w-md w-full px-6 py-5 flex items-start gap-4 pointer-events-auto">
                        <div className="flex-shrink-0 bg-white/20 rounded-full p-2">
                            <AlertCircle className="w-6 h-6" />
                        </div>
                        <div className="flex-1 min-w-0">
                            <p className="font-bold text-base mb-1">Có lỗi xảy ra</p>
                            <p className="text-sm opacity-90 break-words">{errorMsg}</p>
                        </div>
                        <button
                            onClick={() => setErrorMsg(null)}
                            className="flex-shrink-0 p-1 hover:bg-white/20 rounded-lg transition-colors"
                        >
                            <X className="w-5 h-5" />
                        </button>
                    </div>
                </div>
            )}

            {/* Success Toasts */}
            <div className="fixed bottom-24 right-6 space-y-2 z-[70] pointer-events-none">
                {toasts.map(t => (
                    <div key={t.id} className={`flex items-start gap-2.5 px-4 py-3 rounded-xl shadow-xl text-white text-sm font-medium max-w-xs pointer-events-auto ${t.type === 'success' ? 'bg-green-600' : 'bg-blue-600'}`}>
                        {t.type === 'success' && <CheckCircle className="w-4 h-4 flex-shrink-0 mt-0.5" />}
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
