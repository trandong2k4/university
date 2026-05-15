import React, { useState, useEffect, useRef, FormEvent, useMemo, useCallback } from 'react';
import { AdminSidebar } from '@/components/layouts/AdminSidebar';
import { AdminHeader } from '@/components/layouts/AdminHeader';
import {
    Plus, Edit, Trash2, X, Search, MapPin, AlertCircle, CheckCircle,
    RefreshCw, Building2, Users, Upload, FileSpreadsheet, Filter,
} from 'lucide-react';
import AiAssistantButton from '@/imports/AiAssistantButton-4-13343';
import * as phongApi from '@/api/admin/phong.api';
import type { RoomItem } from '@/types';

interface Toast { id: string; message: string; type: 'success' | 'error' | 'info'; }

type TinhTrang = 'DANG_SU_DUNG' | 'CHUA_SU_DUNG' | 'DANG_SUA_CHUA' | 'KHONG_SU_DUNG_NUA' | '';

const TINH_TRANG_OPTIONS: { value: TinhTrang; label: string }[] = [
    { value: 'DANG_SU_DUNG', label: 'Đang sử dụng' },
    { value: 'CHUA_SU_DUNG', label: 'Chưa sử dụng' },
    { value: 'DANG_SUA_CHUA', label: 'Đang sửa chữa' },
    { value: 'KHONG_SU_DUNG_NUA', label: 'Không dùng nữa' },
];

const TINH_TRANG_BADGE: Record<string, { label: string; cls: string }> = {
    DANG_SU_DUNG:      { label: 'Đang sử dụng', cls: 'bg-green-100 text-green-700' },
    CHUA_SU_DUNG:      { label: 'Chưa sử dụng', cls: 'bg-blue-100 text-blue-700' },
    DANG_SUA_CHUA:     { label: 'Đang sửa chữa', cls: 'bg-yellow-100 text-yellow-700' },
    KHONG_SU_DUNG_NUA: { label: 'Không dùng nữa', cls: 'bg-red-100 text-red-700' },
};

const emptyForm = {
    maPhong: '', tenPhong: '', toaNha: '', tang: '', sucChua: '',
    tinhTrang: '' as TinhTrang,
};

const extractError = (err: unknown, fallback: string): string => {
    if (err && typeof err === 'object') {
        const e = err as { response?: { data?: { detail?: string; message?: string } } };
        return e.response?.data?.detail || e.response?.data?.message || fallback;
    }
    return fallback;
};

const inp = 'w-full px-3 py-2.5 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent';
const lbl = 'block text-sm font-medium text-slate-700 mb-1.5';

export default function AdminRoomsPage() {
    const importRef = useRef<HTMLInputElement>(null);

    const [rooms, setRooms] = useState<RoomItem[]>([]);
    const [loading, setLoading] = useState(false);
    const [searchQuery, setSearchQuery] = useState('');
    const [debouncedSearch, setDebouncedSearch] = useState('');
    const [filterToaNha, setFilterToaNha] = useState('');
    const [filterTinhTrang, setFilterTinhTrang] = useState<TinhTrang>('');
    const [toasts, setToasts] = useState<Toast[]>([]);

    const [isAddOpen, setIsAddOpen] = useState(false);
    const [isEditOpen, setIsEditOpen] = useState(false);
    const [isDeleteOpen, setIsDeleteOpen] = useState(false);
    const [isImportOpen, setIsImportOpen] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [isDeleting, setIsDeleting] = useState(false);
    const [selected, setSelected] = useState<RoomItem | null>(null);
    const [form, setForm] = useState(emptyForm);
    const [formError, setFormError] = useState<string | null>(null);

    const [importFile, setImportFile] = useState<File | null>(null);
    const [importResult, setImportResult] = useState<{
        totalRows: number; successCount: number; errorCount: number; errors: string[];
    } | null>(null);
    const [isImporting, setIsImporting] = useState(false);

    useEffect(() => {
        const t = setTimeout(() => setDebouncedSearch(searchQuery), 300);
        return () => clearTimeout(t);
    }, [searchQuery]);

    const addToast = useCallback((message: string, type: 'success' | 'error' | 'info' = 'info') => {
        const id = Date.now().toString();
        setToasts(p => [...p, { id, message, type }]);
        setTimeout(() => setToasts(p => p.filter(t => t.id !== id)), 4000);
    }, []);

    const fetchAll = useCallback(async () => {
        try {
            setLoading(true);
            const data = await phongApi.getAllPhong();
            setRooms(data || []);
        } catch (err) {
            addToast(extractError(err, 'Lỗi khi tải danh sách phòng'), 'error');
        } finally {
            setLoading(false);
        }
    }, [addToast]);

    useEffect(() => { fetchAll(); }, [fetchAll]);

    const toaNhaList = useMemo(() =>
        [...new Set(rooms.map(r => r.toaNha).filter(Boolean))] as string[],
        [rooms]
    );

    const filtered = useMemo(() => rooms.filter(r => {
        const q = debouncedSearch.toLowerCase();
        const matchSearch = !q ||
            r.maPhong?.toLowerCase().includes(q) ||
            r.tenPhong?.toLowerCase().includes(q) ||
            r.toaNha?.toLowerCase().includes(q);
        const matchToaNha = !filterToaNha || r.toaNha === filterToaNha;
        const matchTinhTrang = !filterTinhTrang || r.tinhTrang === filterTinhTrang;
        return matchSearch && matchToaNha && matchTinhTrang;
    }), [rooms, debouncedSearch, filterToaNha, filterTinhTrang]);

    // Stats
    const stats = useMemo(() => ({
        total:        rooms.length,
        dangDung:     rooms.filter(r => r.tinhTrang === 'DANG_SU_DUNG').length,
        chuaDung:     rooms.filter(r => r.tinhTrang === 'CHUA_SU_DUNG').length,
        suaChua:      rooms.filter(r => r.tinhTrang === 'DANG_SUA_CHUA').length,
    }), [rooms]);

    // Group filtered rooms by toaNha for display
    const groupedRows = useMemo(() => {
        if (filterToaNha || !debouncedSearch) {
            // Group by building
            const groups: { building: string; items: RoomItem[] }[] = [];
            const seen = new Map<string, RoomItem[]>();
            for (const r of filtered) {
                const key = r.toaNha || '—';
                if (!seen.has(key)) { seen.set(key, []); groups.push({ building: key, items: seen.get(key)! }); }
                seen.get(key)!.push(r);
            }
            return groups;
        }
        return [{ building: '', items: filtered }];
    }, [filtered, filterToaNha, debouncedSearch]);

    const buildRequest = () => ({
        maPhong:   form.maPhong,
        tenPhong:  form.tenPhong,
        toaNha:    form.toaNha || undefined,
        tang:      form.tang ? Number(form.tang) : undefined,
        sucChua:   form.sucChua ? Number(form.sucChua) : undefined,
        tinhTrang: form.tinhTrang || undefined,
    });

    const openAdd = () => { setForm(emptyForm); setFormError(null); setIsAddOpen(true); };

    const openEdit = (item: RoomItem) => {
        setSelected(item);
        setFormError(null);
        setForm({
            maPhong:   item.maPhong ?? '',
            tenPhong:  item.tenPhong ?? '',
            toaNha:    item.toaNha ?? '',
            tang:      item.tang != null ? String(item.tang) : '',
            sucChua:   item.sucChua != null ? String(item.sucChua) : '',
            tinhTrang: (item.tinhTrang ?? '') as TinhTrang,
        });
        setIsEditOpen(true);
    };

    const handleCreate = async (e: FormEvent) => {
        e.preventDefault();
        setFormError(null);
        setIsSubmitting(true);
        try {
            await phongApi.createPhong(buildRequest());
            addToast('Thêm phòng thành công', 'success');
            setIsAddOpen(false);
            await fetchAll();
        } catch (err) {
            setFormError(extractError(err, 'Lỗi khi thêm phòng'));
        } finally { setIsSubmitting(false); }
    };

    const handleUpdate = async (e: FormEvent) => {
        e.preventDefault();
        if (!selected) return;
        setFormError(null);
        setIsSubmitting(true);
        try {
            await phongApi.updatePhong(selected.id, buildRequest());
            addToast('Cập nhật phòng thành công', 'success');
            setIsEditOpen(false);
            setSelected(null);
            await fetchAll();
        } catch (err) {
            setFormError(extractError(err, 'Lỗi khi cập nhật phòng'));
        } finally { setIsSubmitting(false); }
    };

    const confirmDelete = async () => {
        if (!selected) return;
        setIsDeleting(true);
        try {
            await phongApi.deletePhong(selected.id);
            addToast('Xóa phòng thành công', 'success');
            setIsDeleteOpen(false);
            setSelected(null);
            await fetchAll();
        } catch (err) {
            addToast(extractError(err, 'Lỗi khi xóa phòng'), 'error');
            setIsDeleteOpen(false);
        } finally { setIsDeleting(false); }
    };

    const handleImport = async () => {
        if (!importFile) return;
        setIsImporting(true);
        try {
            const result = await phongApi.importPhongFromExcel(importFile);
            setImportResult(result);
            if (result.successCount > 0) await fetchAll();
            if (result.errorCount === 0) addToast(`Import thành công ${result.successCount} phòng`, 'success');
            else addToast(`${result.successCount} thành công, ${result.errorCount} lỗi`, result.successCount > 0 ? 'info' : 'error');
        } catch (err) {
            addToast(extractError(err, 'Import Excel thất bại'), 'error');
        } finally { setIsImporting(false); }
    };

    // Shared form body
    const RoomFormBody = () => (
        <>
            <div className="grid grid-cols-2 gap-4">
                <div>
                    <label className={lbl}>Mã phòng <span className="text-red-500">*</span></label>
                    <input required value={form.maPhong} onChange={e => setForm({ ...form, maPhong: e.target.value })}
                        placeholder="VD: P101" className={inp} />
                </div>
                <div>
                    <label className={lbl}>Tên phòng <span className="text-red-500">*</span></label>
                    <input required value={form.tenPhong} onChange={e => setForm({ ...form, tenPhong: e.target.value })}
                        placeholder="VD: Phòng thực hành 1" className={inp} />
                </div>
                <div>
                    <label className={lbl}>Tòa nhà</label>
                    <input value={form.toaNha} onChange={e => setForm({ ...form, toaNha: e.target.value })}
                        placeholder="VD: Nhà A" className={inp} />
                </div>
                <div>
                    <label className={lbl}>Tình trạng</label>
                    <select value={form.tinhTrang} onChange={e => setForm({ ...form, tinhTrang: e.target.value as TinhTrang })} className={inp}>
                        <option value="">-- Chọn tình trạng --</option>
                        {TINH_TRANG_OPTIONS.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
                    </select>
                </div>
                <div>
                    <label className={lbl}>Tầng</label>
                    <input type="number" min={1} value={form.tang} onChange={e => setForm({ ...form, tang: e.target.value })}
                        placeholder="VD: 1" className={inp} />
                </div>
                <div>
                    <label className={lbl}>Sức chứa</label>
                    <input type="number" min={1} value={form.sucChua} onChange={e => setForm({ ...form, sucChua: e.target.value })}
                        placeholder="VD: 40" className={inp} />
                </div>
            </div>

            {formError && (
                <div className="flex items-start gap-3 p-3.5 bg-red-50 border border-red-200 rounded-xl text-sm text-red-700">
                    <AlertCircle className="w-4 h-4 mt-0.5 shrink-0 text-red-500" />
                    <span className="flex-1">{formError}</span>
                    <button type="button" onClick={() => setFormError(null)} className="text-red-400 hover:text-red-600">
                        <X className="w-4 h-4" />
                    </button>
                </div>
            )}
        </>
    );

    return (
        <div className="flex h-screen bg-slate-50">
            <AdminSidebar activeMenu="rooms" />
            <div className="flex-1 ml-64 flex flex-col overflow-hidden">
                <AdminHeader title="Quản lý Phòng học" />
                <div className="flex-1 overflow-auto">
                    <div className="p-6 max-w-7xl mx-auto space-y-4">

                        {/* Stats */}
                        <div className="grid grid-cols-4 gap-4">
                            <div className="bg-white border border-slate-200 rounded-xl px-5 py-3 flex items-center gap-3 shadow-sm">
                                <div className="rounded-lg bg-blue-100 p-2"><MapPin className="w-5 h-5 text-blue-600" /></div>
                                <div>
                                    <p className="text-xl font-bold text-slate-900">{stats.total}</p>
                                    <p className="text-xs text-slate-500">Tổng phòng</p>
                                </div>
                            </div>
                            <div className="bg-white border border-slate-200 rounded-xl px-5 py-3 flex items-center gap-3 shadow-sm">
                                <div className="rounded-lg bg-green-100 p-2"><CheckCircle className="w-5 h-5 text-green-600" /></div>
                                <div>
                                    <p className="text-xl font-bold text-green-700">{stats.dangDung}</p>
                                    <p className="text-xs text-slate-500">Đang sử dụng</p>
                                </div>
                            </div>
                            <div className="bg-white border border-slate-200 rounded-xl px-5 py-3 flex items-center gap-3 shadow-sm">
                                <div className="rounded-lg bg-sky-100 p-2"><Building2 className="w-5 h-5 text-sky-600" /></div>
                                <div>
                                    <p className="text-xl font-bold text-sky-700">{stats.chuaDung}</p>
                                    <p className="text-xs text-slate-500">Chưa sử dụng</p>
                                </div>
                            </div>
                            <div className="bg-white border border-slate-200 rounded-xl px-5 py-3 flex items-center gap-3 shadow-sm">
                                <div className="rounded-lg bg-yellow-100 p-2"><AlertCircle className="w-5 h-5 text-yellow-600" /></div>
                                <div>
                                    <p className="text-xl font-bold text-yellow-700">{stats.suaChua}</p>
                                    <p className="text-xs text-slate-500">Đang sửa chữa</p>
                                </div>
                            </div>
                        </div>

                        {/* Toolbar */}
                        <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-3 flex flex-col sm:flex-row gap-3 items-start sm:items-center justify-between sticky top-0 z-20">
                            <div className="flex flex-wrap items-center gap-2 flex-1">
                                <div className="relative min-w-[200px] max-w-xs">
                                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                                    <input
                                        value={searchQuery}
                                        onChange={e => setSearchQuery(e.target.value)}
                                        placeholder="Tìm mã, tên, tòa nhà..."
                                        className="w-full pl-9 pr-4 py-2 text-sm border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                                    />
                                </div>
                                <div className="flex items-center gap-1.5">
                                    <Building2 className="w-4 h-4 text-slate-400 shrink-0" />
                                    <select value={filterToaNha} onChange={e => setFilterToaNha(e.target.value)}
                                        className="py-2 pl-2.5 pr-7 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 text-slate-700">
                                        <option value="">Tất cả tòa nhà</option>
                                        {toaNhaList.map(t => <option key={t} value={t}>{t}</option>)}
                                    </select>
                                </div>
                                <div className="flex items-center gap-1.5">
                                    <Filter className="w-4 h-4 text-slate-400 shrink-0" />
                                    <select value={filterTinhTrang} onChange={e => setFilterTinhTrang(e.target.value as TinhTrang)}
                                        className="py-2 pl-2.5 pr-7 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 text-slate-700">
                                        <option value="">Tất cả tình trạng</option>
                                        {TINH_TRANG_OPTIONS.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
                                    </select>
                                </div>
                            </div>
                            <div className="flex items-center gap-2">
                                <button onClick={fetchAll} title="Làm mới"
                                    className="p-2 border border-slate-300 rounded-lg text-slate-600 hover:bg-slate-50 transition-colors">
                                    <RefreshCw className="w-4 h-4" />
                                </button>
                                <button onClick={() => { setImportFile(null); setImportResult(null); setIsImportOpen(true); }}
                                    className="flex items-center gap-1.5 px-3 py-2 border border-slate-300 text-slate-700 rounded-lg hover:bg-slate-50 text-sm font-medium">
                                    <FileSpreadsheet className="w-4 h-4" /> Import
                                </button>
                                <button onClick={openAdd}
                                    className="flex items-center gap-1.5 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 text-sm font-medium shadow-sm">
                                    <Plus className="w-4 h-4" /> Thêm phòng
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
                                <div className="relative overflow-auto" style={{ maxHeight: 'calc(100vh - 370px)' }}>
                                    <table className="w-full min-w-[980px] border-separate border-spacing-0 text-sm">
                                        <thead className="sticky top-0 z-30 text-white">
                                            <tr>
                                                <th className="sticky left-0 z-40 w-32 bg-blue-600 px-4 py-3 text-left font-semibold whitespace-nowrap shadow-[4px_0_8px_-6px_rgba(15,23,42,0.45)]">Mã phòng</th>
                                                <th className="w-56 bg-blue-600 px-4 py-3 text-left font-semibold whitespace-nowrap">Tên phòng</th>
                                                <th className="w-40 bg-blue-600 px-4 py-3 text-left font-semibold whitespace-nowrap">Tòa nhà</th>
                                                <th className="w-28 bg-blue-600 px-4 py-3 text-center font-semibold whitespace-nowrap">Tầng</th>
                                                <th className="w-28 bg-blue-600 px-4 py-3 text-center font-semibold whitespace-nowrap">Sức chứa</th>
                                                <th className="w-28 bg-blue-600 px-4 py-3 text-center font-semibold whitespace-nowrap">Lịch học</th>
                                                <th className="w-44 bg-blue-600 px-4 py-3 text-left font-semibold whitespace-nowrap">Tình trạng</th>
                                                <th className="sticky right-0 z-40 w-28 bg-blue-700 px-4 py-3 text-center font-semibold whitespace-nowrap shadow-[-4px_0_8px_-6px_rgba(15,23,42,0.45)]">Thao tác</th>
                                            </tr>
                                        </thead>
                                        <tbody className="divide-y divide-slate-100">
                                            {groupedRows.length === 0 || groupedRows.every(g => g.items.length === 0) ? (
                                                <tr>
                                                    <td colSpan={8} className="py-16 text-center">
                                                        <div className="flex flex-col items-center gap-2">
                                                            <div className="rounded-full bg-slate-100 p-4">
                                                                <MapPin className="w-8 h-8 text-slate-400" />
                                                            </div>
                                                            <p className="font-medium text-slate-600">
                                                                {debouncedSearch || filterToaNha || filterTinhTrang ? 'Không tìm thấy kết quả' : 'Chưa có phòng nào'}
                                                            </p>
                                                            <p className="text-sm text-slate-400">
                                                                {debouncedSearch || filterToaNha || filterTinhTrang ? 'Thử thay đổi bộ lọc' : 'Nhấn "Thêm phòng" để bắt đầu'}
                                                            </p>
                                                        </div>
                                                    </td>
                                                </tr>
                                            ) : (
                                                groupedRows.map(group => (
                                                    <React.Fragment key={group.building || '__flat__'}>
                                                        {/* Building group header row */}
                                                        {group.building && !filterToaNha && (
                                                            <tr key={`grp-${group.building}`} className="bg-slate-50 border-y border-slate-200">
                                                                <td colSpan={8} className="px-4 py-2">
                                                                    <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-600 uppercase tracking-wide">
                                                                        <Building2 className="w-3.5 h-3.5 text-blue-500" />
                                                                        {group.building === '—' ? 'Chưa phân tòa' : group.building}
                                                                        <span className="ml-1 px-1.5 py-0.5 rounded-full bg-slate-200 text-slate-600 font-medium normal-case tracking-normal">
                                                                            {group.items.length} phòng
                                                                        </span>
                                                                    </span>
                                                                </td>
                                                            </tr>
                                                        )}
                                                        {group.items.map(r => {
                                                            const badge = TINH_TRANG_BADGE[r.tinhTrang ?? ''];
                                                            return (
                                                                <tr key={r.id} className="group transition-colors hover:bg-blue-50/60">
                                                                    {/* Sticky left: mã phòng */}
                                                                    <td className="sticky left-0 z-20 w-32 bg-white px-4 py-3 shadow-[4px_0_8px_-6px_rgba(15,23,42,0.28)] transition-colors group-hover:bg-blue-50">
                                                                        <span className="inline-flex items-center px-2.5 py-1 rounded-lg bg-blue-100 text-blue-800 text-xs font-bold">
                                                                            {r.maPhong}
                                                                        </span>
                                                                    </td>
                                                                    <td className="px-4 py-3 font-medium text-slate-800">{r.tenPhong || '—'}</td>
                                                                    <td className="px-4 py-3 text-slate-600">
                                                                        {r.toaNha ? (
                                                                            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-slate-100 text-slate-700 text-xs font-medium">
                                                                                <Building2 className="w-3 h-3" />{r.toaNha}
                                                                            </span>
                                                                        ) : '—'}
                                                                    </td>
                                                                    <td className="px-4 py-3 text-center text-slate-600">
                                                                        {r.tang != null ? `Tầng ${r.tang}` : '—'}
                                                                    </td>
                                                                    <td className="px-4 py-3 text-center">
                                                                        {r.sucChua != null ? (
                                                                            <span className="inline-flex items-center gap-1 text-xs font-medium text-slate-700">
                                                                                <Users className="w-3.5 h-3.5 text-slate-400" />{r.sucChua}
                                                                            </span>
                                                                        ) : '—'}
                                                                    </td>
                                                                    <td className="px-4 py-3 text-center">
                                                                        {(r.soLichHoc ?? 0) > 0 ? (
                                                                            <span className="inline-flex items-center px-2 py-0.5 rounded-full bg-purple-100 text-purple-700 text-xs font-medium">
                                                                                {r.soLichHoc} lịch
                                                                            </span>
                                                                        ) : <span className="text-xs text-slate-400">—</span>}
                                                                    </td>
                                                                    <td className="px-4 py-3">
                                                                        {badge ? (
                                                                            <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold ${badge.cls}`}>
                                                                                {badge.label}
                                                                            </span>
                                                                        ) : <span className="text-xs text-slate-400">—</span>}
                                                                    </td>
                                                                    {/* Sticky right: actions */}
                                                                    <td className="sticky right-0 z-20 w-28 bg-white px-4 py-3 shadow-[-4px_0_8px_-6px_rgba(15,23,42,0.28)] transition-colors group-hover:bg-blue-50">
                                                                        <div className="flex items-center justify-center gap-1">
                                                                            <button onClick={() => openEdit(r)} title="Chỉnh sửa"
                                                                                className="p-1.5 text-blue-600 hover:bg-blue-100 rounded-lg transition-colors">
                                                                                <Edit className="w-4 h-4" />
                                                                            </button>
                                                                            <button onClick={() => { setSelected(r); setIsDeleteOpen(true); }} title="Xóa"
                                                                                className="p-1.5 text-red-500 hover:bg-red-100 rounded-lg transition-colors">
                                                                                <Trash2 className="w-4 h-4" />
                                                                            </button>
                                                                        </div>
                                                                    </td>
                                                                </tr>
                                                            );
                                                        })}
                                                    </React.Fragment>
                                                ))
                                            )}
                                        </tbody>
                                    </table>
                                </div>
                            )}
                        </div>

                        {/* Footer */}
                        {!loading && rooms.length > 0 && (
                            <div className="text-xs text-slate-500 px-1">
                                Hiển thị <b className="text-slate-700">{filtered.length}</b> / <b className="text-slate-700">{rooms.length}</b> phòng
                                {toaNhaList.length > 0 && (
                                    <span className="ml-2 text-slate-400">· {toaNhaList.length} tòa nhà</span>
                                )}
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {/* Add Modal */}
            {isAddOpen && (
                <div className="fixed inset-0 bg-black/30 flex items-center justify-center z-50 p-4" onClick={() => setIsAddOpen(false)}>
                    <div className="bg-white rounded-2xl shadow-2xl max-w-lg w-full max-h-[90vh] overflow-y-auto" onClick={e => e.stopPropagation()}>
                        <div className="sticky top-0 bg-gradient-to-r from-blue-600 to-blue-700 text-white px-6 py-4 flex items-center justify-between rounded-t-2xl z-10">
                            <h2 className="text-base font-bold flex items-center gap-2"><Plus className="w-5 h-5" /> Thêm Phòng Mới</h2>
                            <button onClick={() => setIsAddOpen(false)} className="p-1 hover:bg-white/20 rounded-lg"><X className="w-5 h-5" /></button>
                        </div>
                        <form className="p-6 space-y-4" onSubmit={handleCreate}>
                            <RoomFormBody />
                            <div className="flex gap-3 pt-2 border-t border-slate-100">
                                <button type="button" onClick={() => setIsAddOpen(false)} className="flex-1 py-2.5 border border-slate-300 rounded-xl text-sm font-medium text-slate-700 hover:bg-slate-50">Hủy</button>
                                <button type="submit" disabled={isSubmitting} className="flex-1 py-2.5 bg-blue-600 text-white rounded-xl text-sm font-medium hover:bg-blue-700 disabled:opacity-50">
                                    {isSubmitting ? 'Đang thêm...' : 'Thêm Phòng'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* Edit Modal */}
            {isEditOpen && selected && (
                <div className="fixed inset-0 bg-black/30 flex items-center justify-center z-50 p-4" onClick={() => setIsEditOpen(false)}>
                    <div className="bg-white rounded-2xl shadow-2xl max-w-lg w-full max-h-[90vh] overflow-y-auto" onClick={e => e.stopPropagation()}>
                        <div className="sticky top-0 bg-gradient-to-r from-blue-600 to-blue-700 text-white px-6 py-4 flex items-center justify-between rounded-t-2xl z-10">
                            <div>
                                <h2 className="text-base font-bold flex items-center gap-2"><Edit className="w-5 h-5" /> Chỉnh Sửa Phòng</h2>
                                <p className="text-xs text-blue-200 mt-0.5">{selected.maPhong} — {selected.tenPhong}</p>
                            </div>
                            <button onClick={() => setIsEditOpen(false)} className="p-1 hover:bg-white/20 rounded-lg"><X className="w-5 h-5" /></button>
                        </div>
                        <form className="p-6 space-y-4" onSubmit={handleUpdate}>
                            <RoomFormBody />
                            <div className="flex gap-3 pt-2 border-t border-slate-100">
                                <button type="button" onClick={() => setIsEditOpen(false)} className="flex-1 py-2.5 border border-slate-300 rounded-xl text-sm font-medium text-slate-700 hover:bg-slate-50">Hủy</button>
                                <button type="submit" disabled={isSubmitting} className="flex-1 py-2.5 bg-blue-600 text-white rounded-xl text-sm font-medium hover:bg-blue-700 disabled:opacity-50">
                                    {isSubmitting ? 'Đang lưu...' : 'Lưu Thay Đổi'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* Delete Modal */}
            {isDeleteOpen && selected && (
                <div className="fixed inset-0 bg-black/30 flex items-center justify-center z-50 p-4" onClick={() => !isDeleting && setIsDeleteOpen(false)}>
                    <div className="bg-white rounded-2xl shadow-2xl max-w-sm w-full p-6" onClick={e => e.stopPropagation()}>
                        <div className="flex items-center gap-3 mb-4">
                            <div className="rounded-full bg-red-100 p-3 flex-shrink-0">
                                <AlertCircle className="w-6 h-6 text-red-600" />
                            </div>
                            <h3 className="font-bold text-slate-900">Xác nhận xóa</h3>
                        </div>
                        <p className="text-sm text-slate-600 mb-4">
                            Bạn có chắc muốn xóa phòng <b>{selected.tenPhong || selected.maPhong}</b>?
                        </p>
                        {(selected.soLichHoc ?? 0) > 0 && (
                            <div className="bg-red-50 border border-red-200 rounded-xl p-3 mb-4 text-sm text-red-700 flex items-start gap-2">
                                <AlertCircle className="w-4 h-4 mt-0.5 shrink-0" />
                                Phòng đang có <b>{selected.soLichHoc} lịch học</b> liên kết — không thể xóa.
                            </div>
                        )}
                        {(selected.soLichHoc ?? 0) === 0 && (
                            <div className="bg-amber-50 border border-amber-200 rounded-xl p-3 mb-4 text-sm text-amber-700 flex items-start gap-2">
                                <AlertCircle className="w-4 h-4 mt-0.5 shrink-0" />
                                Hành động này không thể hoàn tác.
                            </div>
                        )}
                        <div className="flex gap-3">
                            <button onClick={() => { setIsDeleteOpen(false); setSelected(null); }} disabled={isDeleting}
                                className="flex-1 py-2.5 border border-slate-300 rounded-xl text-sm font-medium text-slate-700 hover:bg-slate-50 disabled:opacity-50">Hủy</button>
                            <button onClick={confirmDelete}
                                disabled={isDeleting || (selected.soLichHoc ?? 0) > 0}
                                className="flex-1 py-2.5 bg-red-600 text-white rounded-xl text-sm font-medium hover:bg-red-700 disabled:opacity-50">
                                {isDeleting ? 'Đang xóa...' : 'Xóa'}
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Import Modal */}
            {isImportOpen && (
                <div className="fixed inset-0 bg-black/30 flex items-center justify-center z-50 p-4" onClick={() => setIsImportOpen(false)}>
                    <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full" onClick={e => e.stopPropagation()}>
                        <div className="bg-gradient-to-r from-emerald-600 to-emerald-700 text-white px-6 py-4 flex items-center justify-between rounded-t-2xl">
                            <h2 className="text-base font-bold flex items-center gap-2"><FileSpreadsheet className="w-5 h-5" /> Import Phòng từ Excel</h2>
                            <button onClick={() => setIsImportOpen(false)} className="p-1 hover:bg-white/20 rounded-lg"><X className="w-5 h-5" /></button>
                        </div>
                        <div className="p-5 space-y-4">
                            <div
                                className={`border-2 border-dashed rounded-xl p-8 text-center cursor-pointer transition-all ${importFile ? 'border-emerald-400 bg-emerald-50' : 'border-slate-300 hover:border-blue-400 hover:bg-blue-50/50'}`}
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
                                    <div className="grid grid-cols-3 divide-x divide-slate-200 bg-slate-50 text-center">
                                        <div className="py-3"><p className="text-xl font-bold text-slate-800">{importResult.totalRows}</p><p className="text-xs text-slate-500">Tổng dòng</p></div>
                                        <div className="py-3"><p className="text-xl font-bold text-emerald-600">{importResult.successCount}</p><p className="text-xs text-slate-500">Thành công</p></div>
                                        <div className="py-3"><p className="text-xl font-bold text-red-600">{importResult.errorCount}</p><p className="text-xs text-slate-500">Lỗi</p></div>
                                    </div>
                                </div>
                            )}

                            {importResult?.errors && importResult.errors.length > 0 && (
                                <div className="rounded-xl border border-red-200 overflow-hidden max-h-40 overflow-y-auto">
                                    <div className="bg-red-50 px-3 py-2 text-xs font-semibold text-red-700">Danh sách lỗi</div>
                                    <div className="divide-y divide-red-100">
                                        {importResult.errors.map((err, idx) => (
                                            <div key={idx} className="px-3 py-2 text-xs text-red-600">{err}</div>
                                        ))}
                                    </div>
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

            {/* Toasts */}
            <div className="fixed bottom-24 right-6 space-y-2 z-[70] pointer-events-none">
                {toasts.map(t => (
                    <div key={t.id} className={`flex items-start gap-2.5 px-4 py-3 rounded-xl shadow-xl text-white text-sm font-medium max-w-xs pointer-events-auto ${t.type === 'success' ? 'bg-green-600' : t.type === 'error' ? 'bg-red-600' : 'bg-blue-600'}`}>
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
