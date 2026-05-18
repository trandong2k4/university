import { AdminSidebar } from '@/components/layouts/AdminSidebar';
import { AdminHeader } from '@/components/layouts/AdminHeader';
import { useEffect, useState, useRef, FormEvent, useMemo, useCallback } from 'react';
import { Plus, Edit, Trash2, X, Search, RefreshCw, AlertCircle, CheckCircle, GraduationCap, FileSpreadsheet, Upload, School, UserCheck, Shield, UserCog, Square, CheckSquare } from 'lucide-react';
import AiAssistantButton from '@/imports/AiAssistantButton-4-13343';
import * as hocVienApi from '@/api/admin/hoc-vien.api';
import * as nganhApi from '@/api/admin/nganh.api';
import type { AvailableUser, BatchDeleteResult } from '@/api/admin/hoc-vien.api';

interface Toast { id: string; message: string; type: 'success' | 'error' | 'info'; }
type AddMode = 'existing-user' | 'with-user';

const extractError = (err: unknown, fallback: string): string => {
    if (err && typeof err === 'object') {
        const e = err as { response?: { data?: unknown } };
        const data = e.response?.data;
        if (data && typeof data === 'object') {
            const d = data as Record<string, unknown>;
            // Spring ProblemDetail: có field errors (map field -> message)
            if (d.errors && typeof d.errors === 'object' && !Array.isArray(d.errors)) {
                const msgs = Object.values(d.errors as Record<string, unknown>)
                    .map(v => String(v))
                    .join('\n');
                if (msgs) return msgs;
            }
            // Fallback: detail hoặc message
            if (typeof d.detail === 'string' && d.detail && d.detail !== 'Validation failed') return d.detail;
            if (typeof d.message === 'string' && d.message) return d.message;
            if (typeof d.detail === 'string' && d.detail) return d.detail;
        }
    }
    return fallback;
};

export default function AdminStudentsPage() {
    const importRef = useRef<HTMLInputElement>(null);

    const [items, setItems] = useState<hocVienApi.HocVienResponse[]>([]);
    const [nganhs, setNganhs] = useState<{ id: string; maNganh: string; tenNganh: string }[]>([]);
    const [loading, setLoading] = useState(false);
    const [searchQuery, setSearchQuery] = useState('');
    const [filterNganh, setFilterNganh] = useState('');
    const [toasts, setToasts] = useState<Toast[]>([]);

    const [isAddOpen, setIsAddOpen] = useState(false);
    const [addMode, setAddMode] = useState<AddMode>('with-user');
    const [isEditOpen, setIsEditOpen] = useState(false);
    const [isDeleteOpen, setIsDeleteOpen] = useState(false);
    const [isAssignOpen, setIsAssignOpen] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [selected, setSelected] = useState<hocVienApi.HocVienResponse | null>(null);
    const [availableUsers, setAvailableUsers] = useState<AvailableUser[]>([]);
    const [assignSearch, setAssignSearch] = useState('');

    const [form, setForm] = useState({
        maHocVien: '', maNganh: '', ngayNhapHoc: '', ngayTotNghiep: '',
        hoTen: '', userName: '', passWord: '', email: '', cccd: '',
        gioiTinh: '' as '' | 'NAM' | 'NU',
        ngaySinh: '', soDienThoai: '', diaChi: '',
        trangThai: true, ghiChu: '',
    });
    const [editError, setEditError] = useState<string | null>(null);

    const defaultAddForm = {
        hoTen: '', userName: '', passWord: '', email: '', cccd: '',
        gioiTinh: '' as '' | 'NAM' | 'NU',
        ngaySinh: '', soDienThoai: '', diaChi: '', trangThai: true, ghiChu: '',
        maHocVien: '', maNganh: '', ngayNhapHoc: '', usersId: '',
    };
    const [addForm, setAddForm] = useState(defaultAddForm);

    const [addError, setAddError] = useState<string | null>(null);

    const [isImportOpen, setIsImportOpen] = useState(false);
    const [importFile, setImportFile] = useState<File | null>(null);
    const [importResult, setImportResult] = useState<{
        totalRows: number; successCount: number; errorCount: number; errors: string[];
    } | null>(null);
    const [isImporting, setIsImporting] = useState(false);

    const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
    const [isBatchDeleteOpen, setIsBatchDeleteOpen] = useState(false);
    const [isBatchDeleting, setIsBatchDeleting] = useState(false);
    const [batchDeleteResult, setBatchDeleteResult] = useState<BatchDeleteResult | null>(null);

    const addToast = useCallback((message: string, type: 'success' | 'error' | 'info' = 'info') => {
        const id = Date.now().toString();
        setToasts(p => [...p, { id, message, type }]);
        setTimeout(() => setToasts(p => p.filter(t => t.id !== id)), 4000);
    }, []);

    const fetchAll = useCallback(async () => {
        try {
            setLoading(true);
            const [hocVienData, nganhData] = await Promise.all([
                hocVienApi.getAllHocVien(),
                nganhApi.getAllNganh()
            ]);
            setItems(hocVienData || []);
            setNganhs(nganhData || []);
        } catch (err) {
            console.error(err);
            addToast(extractError(err, 'Lỗi khi tải dữ liệu'), 'error');
        } finally {
            setLoading(false);
        }
    }, [addToast]);

    const fetchAvailableUsers = useCallback(async () => {
        try {
            const data = await hocVienApi.getAvailableUsers();
            setAvailableUsers(data || []);
        } catch (err) {
            console.error(err);
            addToast(extractError(err, 'Lỗi khi tải danh sách người dùng'), 'error');
        }
    }, [addToast]);

    useEffect(() => { fetchAll(); }, [fetchAll]);

    const [debouncedSearch, setDebouncedSearch] = useState('');
    useEffect(() => {
        const t = setTimeout(() => setDebouncedSearch(searchQuery), 300);
        return () => clearTimeout(t);
    }, [searchQuery]);

    const filtered = useMemo(() => items.filter(i => {
        const matchSearch = !debouncedSearch ||
            i.maHocVien?.toLowerCase().includes(debouncedSearch.toLowerCase()) ||
            i.tenNhanVien?.toLowerCase().includes(debouncedSearch.toLowerCase());
        const matchNganh = !filterNganh || i.nganhId === filterNganh;
        return matchSearch && matchNganh;
    }), [items, debouncedSearch, filterNganh]);

    const parseDateForInput = (dateStr: string | null) => {
        if (!dateStr) return '';
        const parts = dateStr.split('/');
        if (parts.length === 3) return `${parts[2]}-${parts[1]}-${parts[0]}`;
        return dateStr.split('T')[0];
    };

    const openAdd = () => {
        setAddForm({ ...defaultAddForm, maNganh: nganhs[0]?.maNganh || '' });
        setAddError(null);
        setAddMode('with-user');
        setIsAddOpen(true);
    };

    const openEdit = (item: hocVienApi.HocVienResponse) => {
        setSelected(item);
        setEditError(null);
        const nganhItem = nganhs.find(n => n.id === item.nganhId);
        setForm({
            maHocVien: item.maHocVien || '',
            maNganh: nganhItem?.maNganh || '',
            ngayNhapHoc: parseDateForInput(item.ngayNhapHoc),
            ngayTotNghiep: parseDateForInput(item.ngayTotNghiep),
            hoTen: item.tenNhanVien || '',
            userName: item.userName || '',
            passWord: '',
            email: item.email || '',
            cccd: item.cccd || '',
            gioiTinh: (item.gioiTinh as '' | 'NAM' | 'NU') || '',
            ngaySinh: parseDateForInput(item.ngaySinh),
            soDienThoai: item.soDienThoai || '',
            diaChi: item.diaChi || '',
            trangThai: item.trangThai ?? true,
            ghiChu: item.ghiChu || '',
        });
        setIsEditOpen(true);
    };

    const openAssign = async (item: hocVienApi.HocVienResponse) => {
        setSelected(item);
        setAssignSearch('');
        await fetchAvailableUsers();
        setIsAssignOpen(true);
    };

    const openDelete = (item: hocVienApi.HocVienResponse) => { setSelected(item); setIsDeleteOpen(true); };

    const handleCreate = async (e: FormEvent) => {
        e.preventDefault();
        setAddError(null);
        try {
            setIsSubmitting(true);
            if (addMode === 'existing-user') {
                await hocVienApi.createHocVien({
                    maHocVien: addForm.maHocVien,
                    maNganh: addForm.maNganh,
                    usersId: addForm.usersId,
                    ngayNhapHoc: addForm.ngayNhapHoc ? `${addForm.ngayNhapHoc}T00:00:00` : undefined,
                });
                addToast('Thêm học viên với tài khoản có sẵn thành công', 'success');
            } else {
                await hocVienApi.createHocVienFull({
                    userDetails: {
                        hoTen: addForm.hoTen,
                        userName: addForm.userName,
                        passWord: addForm.passWord,
                        email: addForm.email || undefined,
                        cccd: addForm.cccd,
                        gioiTinh: addForm.gioiTinh || undefined,
                        ngaySinh: addForm.ngaySinh || undefined,
                        soDienThoai: addForm.soDienThoai || undefined,
                        diaChi: addForm.diaChi || undefined,
                        trangThai: addForm.trangThai,
                        ghiChu: addForm.ghiChu || undefined,
                    },
                    hocVienDetails: {
                        maHocVien: addForm.maHocVien,
                        maNganh: addForm.maNganh,
                        ngayNhapHoc: addForm.ngayNhapHoc ? `${addForm.ngayNhapHoc}T00:00:00` : undefined,
                    },
                });
                addToast('Thêm học viên và tài khoản thành công', 'success');
            }
            setIsAddOpen(false);
            await fetchAll();
        } catch (err) {
            console.error(err);
            setAddError(extractError(err, 'Lỗi khi thêm học viên'));
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleUpdate = async (e: FormEvent) => {
        e.preventDefault();
        if (!selected) return;
        setEditError(null);
        try {
            setIsSubmitting(true);
            await hocVienApi.updateHocVien(selected.id, {
                maHocVien: form.maHocVien,
                maNganh: form.maNganh,
                ngayNhapHoc: form.ngayNhapHoc ? `${form.ngayNhapHoc}T00:00:00` : undefined,
                ngayTotNghiep: form.ngayTotNghiep ? `${form.ngayTotNghiep}T00:00:00` : undefined,
                hoTen: form.hoTen || undefined,
                username: form.userName || undefined,
                passWord: form.passWord || undefined,
                email: form.email || undefined,
                cccd: form.cccd || undefined,
                gioiTinh: (form.gioiTinh as 'NAM' | 'NU') || undefined,
                ngaySinh: form.ngaySinh || undefined,
                soDienThoai: form.soDienThoai || undefined,
                diaChi: form.diaChi || undefined,
                trangThai: form.trangThai,
                ghiChu: form.ghiChu || undefined,
            });
            addToast('Cập nhật học viên thành công', 'success');
            setIsEditOpen(false);
            setSelected(null);
            await fetchAll();
        } catch (err) {
            setEditError(extractError(err, 'Lỗi khi cập nhật học viên'));
        } finally {
            setIsSubmitting(false);
        }
    };

    const confirmDelete = async () => {
        if (!selected) return;
        try {
            await hocVienApi.deleteHocVien(selected.id);
            addToast('Xóa học viên thành công', 'success');
            await fetchAll();
        } catch (err) {
            console.error(err);
            addToast(extractError(err, 'Lỗi khi xóa học viên'), 'error');
        } finally {
            setIsDeleteOpen(false);
            setSelected(null);
        }
    };

    const handleAssignUser = async (usersId: string) => {
        if (!selected) return;
        try {
            setIsSubmitting(true);
            await hocVienApi.assignUserToHocVien(selected.id, usersId);
            addToast('Gán tài khoản thành công', 'success');
            setIsAssignOpen(false);
            setSelected(null);
            await fetchAll();
        } catch (err) {
            console.error(err);
            addToast(extractError(err, 'Lỗi khi gán tài khoản'), 'error');
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleImport = async () => {
        if (!importFile) return;
        setIsImporting(true);
        try {
            const result = await hocVienApi.importHocVienExcel(importFile);
            setImportResult({ totalRows: result.totalRows, successCount: result.successCount, errorCount: result.errorCount, errors: result.errors || [] });
            if (result.successCount > 0) {
                addToast(`Import ${result.successCount} học viên thành công`, 'success');
                await fetchAll();
            }
            if (result.errorCount > 0) {
                addToast(`${result.errorCount} dòng lỗi`, 'error');
            }
        } catch (err) {
            const msg = extractError(err, 'Lỗi khi import Excel');
            setImportResult({ totalRows: 0, successCount: 0, errorCount: 1, errors: [msg] });
            addToast(msg, 'error');
        } finally {
            setIsImporting(false);
        }
    };

    const allFilteredSelected = filtered.length > 0 && filtered.every(i => selectedIds.has(i.id));
    const someSelected = filtered.some(i => selectedIds.has(i.id));

    const toggleSelectAll = () => {
        if (allFilteredSelected) {
            setSelectedIds(prev => {
                const next = new Set(prev);
                filtered.forEach(i => next.delete(i.id));
                return next;
            });
        } else {
            setSelectedIds(prev => {
                const next = new Set(prev);
                filtered.forEach(i => next.add(i.id));
                return next;
            });
        }
    };

    const toggleSelect = (id: string) => {
        setSelectedIds(prev => {
            const next = new Set(prev);
            if (next.has(id)) next.delete(id); else next.add(id);
            return next;
        });
    };

    const handleBatchDelete = async () => {
        if (selectedIds.size === 0) return;
        setIsBatchDeleting(true);
        try {
            const result = await hocVienApi.deleteHocVienList(Array.from(selectedIds));
            setBatchDeleteResult(result);
            setSelectedIds(new Set());
            await fetchAll();
            if (result.failedCount === 0) {
                addToast(`Đã xóa ${result.deletedCount} học viên thành công`, 'success');
            }
        } catch (err) {
            addToast(extractError(err, 'Lỗi khi xóa học viên'), 'error');
        } finally {
            setIsBatchDeleting(false);
            setIsBatchDeleteOpen(false);
        }
    };

    const getNganhTen = (nganhId: string | null) => {
        if (!nganhId) return '—';
        const nganh = nganhs.find(n => n.id === nganhId);
        return nganh?.tenNganh || '—';
    };

    const filteredAssignUsers = availableUsers.filter(u =>
        !assignSearch ||
        u.hoTen?.toLowerCase().includes(assignSearch.toLowerCase()) ||
        u.userName?.toLowerCase().includes(assignSearch.toLowerCase()) ||
        u.email?.toLowerCase().includes(assignSearch.toLowerCase()) ||
        u.cccd?.toLowerCase().includes(assignSearch.toLowerCase())
    );

    const inp = 'w-full px-3 py-2.5 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent';
    const lbl = 'block text-sm font-medium text-slate-700 mb-1.5';

    return (
        <div className="flex h-screen bg-slate-50">
            <AdminSidebar activeMenu="students" />
            <div className="flex-1 ml-64 flex flex-col overflow-hidden">
                <AdminHeader title="Quản lý Học viên" />
                <div className="flex-1 overflow-auto">
                    <div className="p-6 max-w-7xl mx-auto space-y-4">

                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                            <div className="bg-white border border-slate-200 rounded-xl px-5 py-3 flex items-center gap-3 shadow-sm">
                                <div className="rounded-lg bg-blue-100 p-2"><GraduationCap className="w-5 h-5 text-blue-600" /></div>
                                <div>
                                    <p className="text-xl font-bold text-slate-900">{items.length}</p>
                                    <p className="text-xs text-slate-500">Tổng học viên</p>
                                </div>
                            </div>
                            <div className="bg-white border border-slate-200 rounded-xl px-5 py-3 flex items-center gap-3 shadow-sm">
                                <div className="rounded-lg bg-green-100 p-2"><CheckCircle className="w-5 h-5 text-green-600" /></div>
                                <div>
                                    <p className="text-xl font-bold text-green-700">
                                        {items.filter(i => !i.ngayTotNghiep).length}
                                    </p>
                                    <p className="text-xs text-slate-500">Đang học</p>
                                </div>
                            </div>
                            <div className="bg-white border border-slate-200 rounded-xl px-5 py-3 flex items-center gap-3 shadow-sm">
                                <div className="rounded-lg bg-amber-100 p-2"><School className="w-5 h-5 text-amber-600" /></div>
                                <div>
                                    <p className="text-xl font-bold text-amber-700">
                                        {items.filter(i => i.ngayTotNghiep).length}
                                    </p>
                                    <p className="text-xs text-slate-500">Đã tốt nghiệp</p>
                                </div>
                            </div>
                        </div>

                        <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-3 flex flex-col sm:flex-row gap-3 items-start sm:items-center justify-between sticky top-0 z-20">
                            <div className="flex flex-wrap items-center gap-2 flex-1">
                                <div className="relative min-w-[180px] max-w-sm">
                                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                                    <input
                                        value={searchQuery}
                                        onChange={e => setSearchQuery(e.target.value)}
                                        placeholder="Tìm mã học viên..."
                                        className="w-full pl-9 pr-4 py-2 text-sm border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                                    />
                                </div>
                                <select
                                    value={filterNganh}
                                    onChange={e => setFilterNganh(e.target.value)}
                                    className="py-2 px-3 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                                >
                                    <option value="">Tất cả ngành</option>
                                    {nganhs.map(n => (
                                        <option key={n.id} value={n.id}>{n.tenNganh} ({n.maNganh})</option>
                                    ))}
                                </select>
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
                                    <Plus className="w-4 h-4" /> Thêm học viên
                                </button>
                            </div>
                        </div>

                        {selectedIds.size > 0 && (
                            <div className="bg-red-50 border border-red-200 rounded-xl px-4 py-2.5 flex items-center justify-between">
                                <span className="text-sm font-medium text-red-700">
                                    Đã chọn <b>{selectedIds.size}</b> học viên
                                </span>
                                <div className="flex items-center gap-2">
                                    <button onClick={() => setSelectedIds(new Set())}
                                        className="text-xs text-slate-500 hover:text-slate-700 px-2 py-1 rounded hover:bg-white transition-colors">
                                        Bỏ chọn
                                    </button>
                                    <button onClick={() => setIsBatchDeleteOpen(true)}
                                        className="flex items-center gap-1.5 px-3 py-1.5 bg-red-600 text-white rounded-lg hover:bg-red-700 text-sm font-medium transition-colors">
                                        <Trash2 className="w-4 h-4" /> Xóa đã chọn
                                    </button>
                                </div>
                            </div>
                        )}

                        <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
                            {loading ? (
                                <div className="flex flex-col items-center justify-center h-72 gap-3">
                                    <div className="w-9 h-9 border-4 border-slate-200 border-t-blue-600 rounded-full animate-spin" />
                                    <p className="text-sm text-slate-500">Đang tải...</p>
                                </div>
                            ) : (
                                <div className="overflow-auto" style={{ maxHeight: 'calc(100vh - 380px)' }}>
                                    <table className="w-full text-sm">
                                        <thead className="sticky top-0 z-10 bg-gradient-to-r from-blue-600 to-blue-700 text-white">
                                            <tr>
                                                <th className="px-3 py-3 w-10">
                                                    <button onClick={toggleSelectAll} className="flex items-center justify-center text-white/80 hover:text-white transition-colors">
                                                        {allFilteredSelected
                                                            ? <CheckSquare className="w-4 h-4" />
                                                            : someSelected
                                                                ? <CheckSquare className="w-4 h-4 opacity-50" />
                                                                : <Square className="w-4 h-4" />}
                                                    </button>
                                                </th>
                                                <th className="px-4 py-3 text-left font-semibold">Mã HV</th>
                                                <th className="px-4 py-3 text-left font-semibold">Họ tên</th>
                                                <th className="px-4 py-3 text-center font-semibold">GT</th>
                                                <th className="px-4 py-3 text-left font-semibold">Ngành</th>
                                                <th className="px-4 py-3 text-left font-semibold">Tài khoản</th>
                                                <th className="px-4 py-3 text-left font-semibold">Email / SĐT</th>
                                                <th className="px-4 py-3 text-left font-semibold">Ngày nhập học</th>
                                                <th className="px-4 py-3 text-left font-semibold">Trạng thái</th>
                                                <th className="px-4 py-3 text-center font-semibold">Thao tác</th>
                                            </tr>
                                        </thead>
                                        <tbody className="divide-y divide-slate-100">
                                            {filtered.map(i => (
                                                <tr key={i.id} className={`transition-colors hover:bg-blue-50/60 ${selectedIds.has(i.id) ? 'bg-blue-50' : ''}`}>
                                                    <td className="px-3 py-3">
                                                        <button onClick={() => toggleSelect(i.id)} className="flex items-center justify-center text-slate-400 hover:text-blue-600 transition-colors">
                                                            {selectedIds.has(i.id)
                                                                ? <CheckSquare className="w-4 h-4 text-blue-600" />
                                                                : <Square className="w-4 h-4" />}
                                                        </button>
                                                    </td>
                                                    <td className="px-4 py-3 font-semibold text-slate-900">{i.maHocVien}</td>
                                                    <td className="px-4 py-3 text-slate-700">{i.tenNhanVien || '—'}</td>
                                                    <td className="px-4 py-3 text-center">
                                                        {i.gioiTinh === 'NAM' ? 'Nam' : i.gioiTinh === 'NU' ? 'Nữ' : '—'}
                                                    </td>
                                                    <td className="px-4 py-3 text-slate-700">{getNganhTen(i.nganhId)}</td>
                                                    <td className="px-4 py-3">
                                                        {i.userName ? (
                                                            <button onClick={() => openAssign(i)} title="Gán lại tài khoản khác"
                                                                className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-700 hover:bg-blue-200 transition-colors cursor-pointer">
                                                                <CheckCircle className="w-3 h-3 mr-1" />{i.userName}
                                                            </button>
                                                        ) : (
                                                            <button onClick={() => openAssign(i)} title="Gán tài khoản"
                                                                className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-amber-100 text-amber-700 hover:bg-amber-200 transition-colors cursor-pointer">
                                                                <UserCheck className="w-3 h-3 mr-1" />Chưa gán
                                                            </button>
                                                        )}
                                                    </td>
                                                    <td className="px-4 py-3 text-slate-500 text-xs">
                                                        <div>{i.email || '—'}</div>
                                                        <div>{i.soDienThoai || '—'}</div>
                                                    </td>
                                                    <td className="px-4 py-3 text-slate-500">
                                                        {i.ngayNhapHoc ? new Date(i.ngayNhapHoc).toLocaleDateString('vi-VN') : '—'}
                                                    </td>
                                                    <td className="px-4 py-3">
                                                        {i.ngayTotNghiep ? (
                                                            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-amber-100 text-amber-700">Đã tốt nghiệp</span>
                                                        ) : (
                                                            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-700">Đang học</span>
                                                        )}
                                                    </td>
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
                                                    <td colSpan={10} className="py-16 text-center">
                                                        <div className="flex flex-col items-center gap-2">
                                                            <div className="rounded-full bg-slate-100 p-4">
                                                                <GraduationCap className="w-8 h-8 text-slate-400" />
                                                            </div>
                                                            <p className="font-medium text-slate-600">
                                                                {searchQuery || filterNganh ? 'Không tìm thấy kết quả' : 'Chưa có học viên nào'}
                                                            </p>
                                                            <p className="text-sm text-slate-400">
                                                                {searchQuery || filterNganh ? 'Thử từ khóa khác' : 'Nhấn "Thêm học viên" để bắt đầu'}
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
                                <span>Hiển thị <b className="text-slate-700">{filtered.length}</b> / <b className="text-slate-700">{items.length}</b> học viên</span>
                                {searchQuery && <span>Tìm thấy {filtered.length} kết quả</span>}
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
                            <h2 className="text-base font-bold flex items-center gap-2"><Plus className="w-5 h-5" /> Thêm Học Viên Mới</h2>
                            <button onClick={() => setIsAddOpen(false)} className="p-1 hover:bg-white/20 rounded-lg"><X className="w-5 h-5" /></button>
                        </div>
                        <form className="p-6 space-y-5" onSubmit={handleCreate}>
                            <div className="grid grid-cols-2 gap-2 rounded-xl bg-slate-100 p-1">
                                <button
                                    type="button"
                                    onClick={() => { setAddMode('existing-user'); setAddError(null); void fetchAvailableUsers(); }}
                                    className={`flex items-center justify-center gap-2 rounded-lg px-3 py-2 text-sm font-semibold transition-colors ${
                                        addMode === 'existing-user'
                                            ? 'bg-white text-blue-700 shadow-sm'
                                            : 'text-slate-600 hover:text-slate-900'
                                    }`}
                                >
                                    <UserCheck className="w-4 h-4" />
                                    Tài khoản có sẵn
                                </button>
                                <button
                                    type="button"
                                    onClick={() => { setAddMode('with-user'); setAddError(null); }}
                                    className={`flex items-center justify-center gap-2 rounded-lg px-3 py-2 text-sm font-semibold transition-colors ${
                                        addMode === 'with-user'
                                            ? 'bg-white text-blue-700 shadow-sm'
                                            : 'text-slate-600 hover:text-slate-900'
                                    }`}
                                >
                                    <UserCog className="w-4 h-4" />
                                    Tạo tài khoản mới
                                </button>
                            </div>

                            {addMode === 'existing-user' && (
                                <div>
                                    <h3 className="text-sm font-semibold text-slate-700 mb-3 pb-2 border-b border-slate-200 flex items-center gap-1.5">
                                        <UserCheck className="w-4 h-4 text-blue-500" /> Tài khoản có sẵn
                                    </h3>
                                    <select
                                        required
                                        value={addForm.usersId}
                                        onChange={e => setAddForm({ ...addForm, usersId: e.target.value })}
                                        className={inp}
                                    >
                                        <option value="">Chọn tài khoản chưa gán</option>
                                        {availableUsers.map(u => (
                                            <option key={u.id} value={u.id}>
                                                {u.hoTen || u.userName} (@{u.userName}){u.email ? ` - ${u.email}` : ''}
                                            </option>
                                        ))}
                                    </select>
                                </div>
                            )}

                            {/* Section: Thông tin tài khoản */}
                            {addMode === 'with-user' && (
                            <div>
                                <h3 className="text-sm font-semibold text-slate-700 mb-3 pb-2 border-b border-slate-200 flex items-center gap-1.5">
                                    <GraduationCap className="w-4 h-4 text-blue-500" /> Thông tin tài khoản
                                </h3>
                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label className={lbl}>Họ tên <span className="text-red-500">*</span></label>
                                        <input required value={addForm.hoTen} onChange={e => setAddForm({ ...addForm, hoTen: e.target.value })} placeholder="Nguyễn Văn A" className={inp} />
                                    </div>
                                    <div>
                                        <label className={lbl}>Tên đăng nhập <span className="text-red-500">*</span></label>
                                        <input required value={addForm.userName} onChange={e => setAddForm({ ...addForm, userName: e.target.value })} placeholder="nguyenvana" className={inp} />
                                    </div>
                                    <div>
                                        <label className={lbl}>Mật khẩu <span className="text-red-500">*</span></label>
                                        <input required type="password" value={addForm.passWord} onChange={e => setAddForm({ ...addForm, passWord: e.target.value })} placeholder="Nhập mật khẩu ban đầu" className={inp} />
                                    </div>
                                    <div>
                                        <label className={lbl}>Email</label>
                                        <input type="email" value={addForm.email} onChange={e => setAddForm({ ...addForm, email: e.target.value })} placeholder="example@email.com" className={inp} />
                                    </div>
                                    <div>
                                        <label className={lbl}>CCCD <span className="text-red-500">*</span></label>
                                        <input required pattern="[0-9]{12}" title="CCCD phải có đúng 12 chữ số" value={addForm.cccd} onChange={e => setAddForm({ ...addForm, cccd: e.target.value })} placeholder="012345678901" className={inp} />
                                    </div>
                                    <div>
                                        <label className={lbl}>Số điện thoại</label>
                                        <input value={addForm.soDienThoai} onChange={e => setAddForm({ ...addForm, soDienThoai: e.target.value })} placeholder="0912345678" className={inp} />
                                    </div>
                                    <div>
                                        <label className={lbl}>Giới tính</label>
                                        <select value={addForm.gioiTinh} onChange={e => setAddForm({ ...addForm, gioiTinh: e.target.value as '' | 'NAM' | 'NU' })} className={inp}>
                                            <option value="">-- Chọn --</option>
                                            <option value="NAM">Nam</option>
                                            <option value="NU">Nữ</option>
                                        </select>
                                    </div>
                                    <div>
                                        <label className={lbl}>Ngày sinh</label>
                                        <input type="date" value={addForm.ngaySinh} onChange={e => setAddForm({ ...addForm, ngaySinh: e.target.value })} className={inp} />
                                    </div>
                                    <div className="col-span-2">
                                        <label className={lbl}>Địa chỉ</label>
                                        <input value={addForm.diaChi} onChange={e => setAddForm({ ...addForm, diaChi: e.target.value })} placeholder="Số nhà, đường, quận/huyện..." className={inp} />
                                    </div>
                                    <div className="col-span-2 flex items-center gap-3">
                                        <label className="text-sm font-medium text-slate-700">Trạng thái tài khoản</label>
                                        <button type="button" onClick={() => setAddForm({ ...addForm, trangThai: !addForm.trangThai })}
                                            className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${addForm.trangThai ? 'bg-green-500' : 'bg-slate-300'}`}>
                                            <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${addForm.trangThai ? 'translate-x-6' : 'translate-x-1'}`} />
                                        </button>
                                        <span className={`text-sm font-medium ${addForm.trangThai ? 'text-green-600' : 'text-slate-500'}`}>
                                            {addForm.trangThai ? 'Đang hoạt động' : 'Bị khóa'}
                                        </span>
                                    </div>
                                </div>
                            </div>
                            )}

                            {/* Section: Thông tin học viên */}
                            <div>
                                <h3 className="text-sm font-semibold text-slate-700 mb-3 pb-2 border-b border-slate-200 flex items-center gap-1.5">
                                    <Shield className="w-4 h-4 text-blue-500" /> Thông tin học viên
                                </h3>
                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label className={lbl}>Mã học viên <span className="text-red-500">*</span></label>
                                        <input required value={addForm.maHocVien} onChange={e => setAddForm({ ...addForm, maHocVien: e.target.value })} placeholder="VD: HV001" className={inp} />
                                    </div>
                                    <div>
                                        <label className={lbl}>Ngành <span className="text-red-500">*</span></label>
                                        <select required value={addForm.maNganh} onChange={e => setAddForm({ ...addForm, maNganh: e.target.value })} className={inp}>
                                            <option value="">Chọn ngành</option>
                                            {nganhs.map(n => (
                                                <option key={n.id} value={n.maNganh}>{n.tenNganh} ({n.maNganh})</option>
                                            ))}
                                        </select>
                                    </div>
                                    <div>
                                        <label className={lbl}>Ngày nhập học</label>
                                        <input type="date" value={addForm.ngayNhapHoc} onChange={e => setAddForm({ ...addForm, ngayNhapHoc: e.target.value })} className={inp} />
                                    </div>
                                </div>
                            </div>

                            {addError && (
                                <div className="flex items-start gap-3 p-3.5 bg-red-50 border border-red-200 rounded-xl text-sm text-red-700">
                                    <AlertCircle className="w-4 h-4 mt-0.5 shrink-0 text-red-500" />
                                    <div className="flex-1 whitespace-pre-line">{addError}</div>
                                    <button type="button" onClick={() => setAddError(null)} className="shrink-0 text-red-400 hover:text-red-600">
                                        <X className="w-4 h-4" />
                                    </button>
                                </div>
                            )}
                            <div className="flex gap-3 pt-4 border-t border-slate-100">
                                <button type="button" onClick={() => setIsAddOpen(false)} className="flex-1 py-2.5 border border-slate-300 rounded-xl text-sm font-medium text-slate-700 hover:bg-slate-50">Hủy</button>
                                <button type="submit" disabled={isSubmitting} className="flex-1 py-2.5 bg-blue-600 text-white rounded-xl text-sm font-medium hover:bg-blue-700 disabled:opacity-50">
                                    {isSubmitting
                                        ? 'Đang thêm...'
                                        : addMode === 'existing-user'
                                            ? 'Thêm với tài khoản có sẵn'
                                            : 'Thêm học viên và tài khoản'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* Assign User Modal */}
            {isAssignOpen && selected && (
                <div className="fixed inset-0 bg-black/30 flex items-center justify-center z-50 p-4" onClick={() => setIsAssignOpen(false)}>
                    <div className="bg-white rounded-2xl shadow-2xl max-w-lg w-full max-h-[85vh] flex flex-col" onClick={e => e.stopPropagation()}>
                        <div className="bg-gradient-to-r from-purple-600 to-purple-700 text-white px-6 py-4 flex items-center justify-between rounded-t-2xl flex-shrink-0">
                            <div>
                                <h2 className="text-base font-bold flex items-center gap-2"><UserCheck className="w-5 h-5" /> {selected.userName ? 'Gán Lại Tài Khoản' : 'Gán Tài Khoản'}</h2>
                                <p className="text-xs text-purple-200 mt-0.5">{selected.maHocVien} — {selected.tenNhanVien || 'Chưa có tên'}</p>
                            </div>
                            <button onClick={() => setIsAssignOpen(false)} className="p-1 hover:bg-white/20 rounded-lg"><X className="w-5 h-5" /></button>
                        </div>
                        <div className="p-5 flex-1 overflow-y-auto">
                            {selected.userName && (
                                <div className="flex items-center gap-2 mb-4 p-3 bg-blue-50 border border-blue-200 rounded-xl text-sm">
                                    <CheckCircle className="w-4 h-4 text-blue-500 shrink-0" />
                                    <span>Tài khoản hiện tại: <span className="font-semibold text-blue-700">@{selected.userName}</span></span>
                                </div>
                            )}
                            <p className="text-sm text-slate-600 mb-4">
                                {selected.userName
                                    ? 'Chọn tài khoản chưa được sử dụng để gán lại cho học viên này:'
                                    : 'Chọn tài khoản người dùng chưa được gán để liên kết với học viên này:'}
                            </p>
                            <div className="relative mb-3">
                                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                                <input
                                    value={assignSearch}
                                    onChange={e => setAssignSearch(e.target.value)}
                                    placeholder="Tìm họ tên, tài khoản, email, CCCD..."
                                    className="w-full pl-9 pr-4 py-2 text-sm border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                                />
                            </div>
                            {filteredAssignUsers.length === 0 ? (
                                <div className="text-center py-8 text-sm text-slate-500">
                                    <GraduationCap className="w-10 h-10 mx-auto mb-2 text-slate-300" />
                                    <p>Không có tài khoản nào khả dụng</p>
                                </div>
                            ) : (
                                <div className="space-y-2 max-h-72 overflow-y-auto">
                                    {filteredAssignUsers.map(u => (
                                        <div key={u.id} className="border border-slate-200 rounded-xl p-3 hover:border-purple-400 hover:bg-purple-50/50 transition-colors cursor-pointer"
                                            onClick={() => !isSubmitting && handleAssignUser(u.id)}>
                                            <div className="flex items-center justify-between">
                                                <div>
                                                    <p className="font-semibold text-sm text-slate-900">{u.hoTen || '—'}</p>
                                                    <p className="text-xs text-slate-500">@{u.userName} · {u.email || '—'}</p>
                                                    <p className="text-xs text-slate-400">CCCD: {u.cccd || '—'}</p>
                                                </div>
                                                <div className="text-right text-xs text-slate-400">
                                                    <p>{u.soDienThoai || '—'}</p>
                                                    <p className={`mt-1 font-medium ${u.trangThai ? 'text-green-600' : 'text-red-500'}`}>
                                                        {u.trangThai ? 'Đang hoạt động' : 'Bị khóa'}
                                                    </p>
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            )}

            {/* Edit Modal */}
            {isEditOpen && selected && (
                <div className="fixed inset-0 bg-black/30 flex items-center justify-center z-50 p-4" onClick={() => setIsEditOpen(false)}>
                    <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto" onClick={e => e.stopPropagation()}>
                        <div className="sticky top-0 bg-gradient-to-r from-blue-600 to-blue-700 text-white px-6 py-4 flex items-center justify-between rounded-t-2xl z-10">
                            <div>
                                <h2 className="text-base font-bold flex items-center gap-2"><Edit className="w-5 h-5" /> Chỉnh Sửa Học Viên</h2>
                                <p className="text-xs text-blue-200 mt-0.5">{selected.maHocVien} — {selected.tenNhanVien || 'Chưa có tên'}</p>
                            </div>
                            <button onClick={() => setIsEditOpen(false)} className="p-1 hover:bg-white/20 rounded-lg"><X className="w-5 h-5" /></button>
                        </div>
                        <form className="p-6 space-y-5" onSubmit={handleUpdate}>

                            {/* Section: Thông tin tài khoản */}
                            {selected.usersId && (
                                <div>
                                    <h3 className="text-sm font-semibold text-slate-700 mb-3 pb-2 border-b border-slate-200 flex items-center gap-1.5">
                                        <UserCog className="w-4 h-4 text-blue-500" /> Thông tin tài khoản
                                    </h3>
                                    <div className="grid grid-cols-2 gap-4">
                                        <div>
                                            <label className={lbl}>Họ tên</label>
                                            <input value={form.hoTen} onChange={e => setForm({ ...form, hoTen: e.target.value })} placeholder="Nguyễn Văn A" className={inp} />
                                        </div>
                                        <div>
                                            <label className={lbl}>Tên đăng nhập</label>
                                            <input value={form.userName} onChange={e => setForm({ ...form, userName: e.target.value })} placeholder="nguyenvana" className={inp} />
                                        </div>
                                        <div>
                                            <label className={lbl}>Mật khẩu mới</label>
                                            <input type="password" value={form.passWord} onChange={e => setForm({ ...form, passWord: e.target.value })} placeholder="Để trống nếu không đổi" className={inp} />
                                        </div>
                                        <div>
                                            <label className={lbl}>Email</label>
                                            <input type="email" value={form.email} onChange={e => setForm({ ...form, email: e.target.value })} placeholder="example@email.com" className={inp} />
                                        </div>
                                        <div>
                                            <label className={lbl}>CCCD</label>
                                            <input pattern="[0-9]{12}" title="CCCD phải có đúng 12 chữ số" value={form.cccd} onChange={e => setForm({ ...form, cccd: e.target.value })} placeholder="012345678901" className={inp} />
                                        </div>
                                        <div>
                                            <label className={lbl}>Số điện thoại</label>
                                            <input value={form.soDienThoai} onChange={e => setForm({ ...form, soDienThoai: e.target.value })} placeholder="0912345678" className={inp} />
                                        </div>
                                        <div>
                                            <label className={lbl}>Giới tính</label>
                                            <select value={form.gioiTinh} onChange={e => setForm({ ...form, gioiTinh: e.target.value as '' | 'NAM' | 'NU' })} className={inp}>
                                                <option value="">-- Chọn --</option>
                                                <option value="NAM">Nam</option>
                                                <option value="NU">Nữ</option>
                                            </select>
                                        </div>
                                        <div>
                                            <label className={lbl}>Ngày sinh</label>
                                            <input type="date" value={form.ngaySinh} onChange={e => setForm({ ...form, ngaySinh: e.target.value })} className={inp} />
                                        </div>
                                        <div className="col-span-2">
                                            <label className={lbl}>Địa chỉ</label>
                                            <input value={form.diaChi} onChange={e => setForm({ ...form, diaChi: e.target.value })} placeholder="Số nhà, đường, quận/huyện..." className={inp} />
                                        </div>
                                        <div className="col-span-2">
                                            <label className={lbl}>Ghi chú</label>
                                            <input value={form.ghiChu} onChange={e => setForm({ ...form, ghiChu: e.target.value })} placeholder="Ghi chú thêm..." className={inp} />
                                        </div>
                                        <div className="col-span-2 flex items-center gap-3">
                                            <label className="text-sm font-medium text-slate-700">Trạng thái tài khoản</label>
                                            <button type="button" onClick={() => setForm({ ...form, trangThai: !form.trangThai })}
                                                className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${form.trangThai ? 'bg-green-500' : 'bg-slate-300'}`}>
                                                <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${form.trangThai ? 'translate-x-6' : 'translate-x-1'}`} />
                                            </button>
                                            <span className={`text-sm font-medium ${form.trangThai ? 'text-green-600' : 'text-slate-500'}`}>
                                                {form.trangThai ? 'Đang hoạt động' : 'Bị khóa'}
                                            </span>
                                        </div>
                                    </div>
                                </div>
                            )}

                            {/* Section: Thông tin học viên */}
                            <div>
                                <h3 className="text-sm font-semibold text-slate-700 mb-3 pb-2 border-b border-slate-200 flex items-center gap-1.5">
                                    <Shield className="w-4 h-4 text-blue-500" /> Thông tin học viên
                                </h3>
                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label className={lbl}>Mã học viên <span className="text-red-500">*</span></label>
                                        <input required value={form.maHocVien} onChange={e => setForm({ ...form, maHocVien: e.target.value })} className={inp} />
                                    </div>
                                    <div>
                                        <label className={lbl}>Ngành <span className="text-red-500">*</span></label>
                                        <select required value={form.maNganh} onChange={e => setForm({ ...form, maNganh: e.target.value })} className={inp}>
                                            <option value="">Chọn ngành</option>
                                            {nganhs.map(n => (
                                                <option key={n.id} value={n.maNganh}>{n.tenNganh} ({n.maNganh})</option>
                                            ))}
                                        </select>
                                    </div>
                                    <div>
                                        <label className={lbl}>Ngày nhập học</label>
                                        <input type="date" value={form.ngayNhapHoc} onChange={e => setForm({ ...form, ngayNhapHoc: e.target.value })} className={inp} />
                                    </div>
                                    <div>
                                        <label className={lbl}>Ngày tốt nghiệp</label>
                                        <input type="date" value={form.ngayTotNghiep} onChange={e => setForm({ ...form, ngayTotNghiep: e.target.value })} className={inp} />
                                    </div>
                                </div>
                            </div>

                            {editError && (
                                <div className="flex items-start gap-3 p-3.5 bg-red-50 border border-red-200 rounded-xl text-sm text-red-700">
                                    <AlertCircle className="w-4 h-4 mt-0.5 shrink-0 text-red-500" />
                                    <div className="flex-1 whitespace-pre-line">{editError}</div>
                                    <button type="button" onClick={() => setEditError(null)} className="shrink-0 text-red-400 hover:text-red-600">
                                        <X className="w-4 h-4" />
                                    </button>
                                </div>
                            )}

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

            {/* Batch Delete Confirm Modal */}
            {isBatchDeleteOpen && (
                <div className="fixed inset-0 bg-black/30 flex items-center justify-center z-[60] p-4" onClick={() => !isBatchDeleting && setIsBatchDeleteOpen(false)}>
                    <div className="bg-white rounded-2xl shadow-2xl max-w-sm w-full p-6" onClick={e => e.stopPropagation()}>
                        <div className="flex items-center gap-3 mb-4">
                            <div className="rounded-full bg-red-100 p-3 flex-shrink-0">
                                <Trash2 className="w-6 h-6 text-red-600" />
                            </div>
                            <h3 className="font-bold text-slate-900">Xóa hàng loạt</h3>
                        </div>
                        <p className="text-sm text-slate-600 mb-6">
                            Bạn có chắc muốn xóa <b>{selectedIds.size}</b> học viên đã chọn?
                            Những học viên đang có dữ liệu liên kết sẽ được báo cáo và bỏ qua.
                        </p>
                        <div className="flex gap-3">
                            <button disabled={isBatchDeleting} onClick={() => setIsBatchDeleteOpen(false)}
                                className="flex-1 py-2.5 border border-slate-300 rounded-xl text-sm font-medium text-slate-700 hover:bg-slate-50 disabled:opacity-50">Hủy</button>
                            <button disabled={isBatchDeleting} onClick={handleBatchDelete}
                                className="flex-1 py-2.5 bg-red-600 text-white rounded-xl text-sm font-medium hover:bg-red-700 disabled:opacity-50">
                                {isBatchDeleting ? 'Đang xóa...' : 'Xóa'}
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Batch Delete Result Modal */}
            {batchDeleteResult && (
                <div className="fixed inset-0 bg-black/30 flex items-center justify-center z-[60] p-4" onClick={() => setBatchDeleteResult(null)}>
                    <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full" onClick={e => e.stopPropagation()}>
                        <div className={`px-6 py-4 rounded-t-2xl flex items-center justify-between ${batchDeleteResult.failedCount === 0 ? 'bg-gradient-to-r from-green-600 to-green-700' : 'bg-gradient-to-r from-amber-500 to-amber-600'} text-white`}>
                            <h3 className="font-bold flex items-center gap-2">
                                {batchDeleteResult.failedCount === 0
                                    ? <><CheckCircle className="w-5 h-5" /> Xóa thành công</>
                                    : <><AlertCircle className="w-5 h-5" /> Xóa một phần</>}
                            </h3>
                            <button onClick={() => setBatchDeleteResult(null)} className="p-1 hover:bg-white/20 rounded-lg"><X className="w-5 h-5" /></button>
                        </div>
                        <div className="p-5 space-y-4">
                            <div className="grid grid-cols-3 gap-3 text-center">
                                <div className="bg-slate-50 rounded-xl p-3">
                                    <p className="text-xl font-bold text-slate-800">{batchDeleteResult.totalRequested}</p>
                                    <p className="text-xs text-slate-500">Yêu cầu</p>
                                </div>
                                <div className="bg-green-50 rounded-xl p-3">
                                    <p className="text-xl font-bold text-green-700">{batchDeleteResult.deletedCount}</p>
                                    <p className="text-xs text-slate-500">Đã xóa</p>
                                </div>
                                <div className="bg-red-50 rounded-xl p-3">
                                    <p className="text-xl font-bold text-red-600">{batchDeleteResult.failedCount}</p>
                                    <p className="text-xs text-slate-500">Không xóa được</p>
                                </div>
                            </div>
                            {batchDeleteResult.failedUsers.length > 0 && (
                                <div className="rounded-xl border border-red-200 overflow-hidden max-h-52 overflow-y-auto">
                                    <div className="bg-red-50 px-3 py-2 text-xs font-semibold text-red-700 sticky top-0">Danh sách không xóa được</div>
                                    <div className="divide-y divide-red-100">
                                        {batchDeleteResult.failedUsers.map((f, idx) => (
                                            <div key={idx} className="px-3 py-2 text-xs">
                                                <span className="font-medium text-slate-800">{f.hoTen || '—'}</span>
                                                <span className="text-red-600 ml-2">— {f.reason}</span>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}
                            <button onClick={() => setBatchDeleteResult(null)}
                                className="w-full py-2.5 bg-slate-800 text-white rounded-xl text-sm font-medium hover:bg-slate-700">
                                Đóng
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Delete Modal */}
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
                            Bạn có chắc muốn xóa học viên <b>{selected.tenNhanVien || selected.maHocVien}</b>? Hành động không thể hoàn tác.
                        </p>
                        <div className="flex gap-3">
                            <button onClick={() => setIsDeleteOpen(false)} className="flex-1 py-2.5 border border-slate-300 rounded-xl text-sm font-medium text-slate-700 hover:bg-slate-50">Hủy</button>
                            <button onClick={confirmDelete} className="flex-1 py-2.5 bg-red-600 text-white rounded-xl text-sm font-medium hover:bg-red-700">Xóa</button>
                        </div>
                    </div>
                </div>
            )}

            {/* Import Modal */}
            {isImportOpen && (
                <div className="fixed inset-0 bg-black/30 flex items-center justify-center z-50 p-4" onClick={() => setIsImportOpen(false)}>
                    <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full" onClick={e => e.stopPropagation()}>
                        <div className="bg-gradient-to-r from-emerald-600 to-emerald-700 text-white px-6 py-4 flex items-center justify-between rounded-t-2xl">
                            <h2 className="text-base font-bold flex items-center gap-2"><FileSpreadsheet className="w-5 h-5" /> Import Học Viên từ Excel</h2>
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
                                </div>
                            )}

                            {importResult && importResult.errors && importResult.errors.length > 0 && (
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

            <button className="fixed bottom-8 right-8 w-14 h-14 z-50 hover:scale-110 transition-transform" aria-label="AI">
                <AiAssistantButton />
            </button>
        </div>
    );
}
