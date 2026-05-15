import { useEffect, useState, useMemo } from 'react';
import { AdminSidebar } from '@/components/layouts/AdminSidebar';
import { AdminHeader } from '@/components/layouts/AdminHeader';
import {
    BookOpen, Users, Search, Plus, Trash2, RefreshCw, AlertCircle, CheckCircle,
    GraduationCap, BarChart3, X, Eye, Edit, ChevronLeft, ChevronRight,
    CheckSquare, Square, DollarSign, CreditCard, Lock
} from 'lucide-react';
import AiAssistantButton from '@/imports/AiAssistantButton-4-13343';
import { useAuth } from '@/hooks';
import * as dangKyApi from '@/api/admin/dang-ky-tin-chi.api';
import * as hocKiApi from '@/api/admin/hocki.api';
import type {
    DangKyTinChiItem,
    LopHocPhanDangKyView,
    HocVienDangKyView,
    CreateDangKyTinChiRequest,
} from '@/api/admin/dang-ky-tin-chi.api';

const PAGE_SIZE = 10;

interface Toast { id: string; message: string; type: 'success' | 'error' | 'info'; }

interface HocKiItem { id: string; maHocKi: string; tenHocKi: string; }

const extractError = (err: unknown, fallback: string): string => {
    if (err && typeof err === 'object') {
        const e = err as { response?: { data?: { detail?: string; message?: string } } };
        return e.response?.data?.detail || e.response?.data?.message || fallback;
    }
    return fallback;
};

const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(amount);
};

const formatDate = (dateStr: string | undefined | null) => {
    if (!dateStr) return '-';
    try {
        return new Date(dateStr).toLocaleString('vi-VN', {
            day: '2-digit', month: '2-digit', year: 'numeric',
            hour: '2-digit', minute: '2-digit'
        });
    } catch { return dateStr; }
};

export default function AdminCreditRegistrationsPage() {
    const { user } = useAuth();
    const userPermissions = user?.permissions ?? [];
    const canView = userPermissions.includes('ADMIN_ENROLLMENT_VIEW');
    const canCreate = userPermissions.includes('ADMIN_ENROLLMENT_CREATE');
    const canCancel = userPermissions.includes('ADMIN_ENROLLMENT_CANCEL');
    const canDelete = userPermissions.includes('ADMIN_ENROLLMENT_DELETE') || canCancel;

    const [registrations, setRegistrations] = useState<DangKyTinChiItem[]>([]);
    const [loading, setLoading] = useState(false);
    const [toasts, setToasts] = useState<Toast[]>([]);

    // Filters
    const [search, setSearch] = useState('');
    const [filterHocKi, setFilterHocKi] = useState('');
    const [filterLopHP, setFilterLopHP] = useState('');

    // Dropdown data
    const [hocKis, setHocKis] = useState<HocKiItem[]>([]);
    const [lopHocPhans, setLopHocPhans] = useState<LopHocPhanDangKyView[]>([]);
    const [hocViens, setHocViens] = useState<HocVienDangKyView[]>([]);

    // Pagination
    const [currentPage, setCurrentPage] = useState(1);

    // Selection
    const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());

    // Modals
    const [isAddOpen, setIsAddOpen] = useState(false);
    const [isEditOpen, setIsEditOpen] = useState(false);
    const [isDetailOpen, setIsDetailOpen] = useState(false);
    const [isDeleteOpen, setIsDeleteOpen] = useState(false);
    const [isMultiDeleteOpen, setIsMultiDeleteOpen] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [deletingId, setDeletingId] = useState<string | null>(null);

    const [selectedItem, setSelectedItem] = useState<DangKyTinChiItem | null>(null);

    // Form state
    const [formHocVien, setFormHocVien] = useState('');
    const [formLopHP, setFormLopHP] = useState('');

    const addToast = (message: string, type: 'success' | 'error' | 'info' = 'info') => {
        const id = Date.now().toString();
        setToasts(p => [...p, { id, message, type }]);
        setTimeout(() => setToasts(p => p.filter(t => t.id !== id)), 4000);
    };

    const fetchAll = async () => {
        try {
            setLoading(true);
            const [regData, hocKiData, lopHPData, hocVienData] = await Promise.all([
                dangKyApi.getAllDangKyTinChi(),
                hocKiApi.getAllHocKi(),
                dangKyApi.getLopHocPhanMoDangKy(),
                dangKyApi.getHocVienDangKy(),
            ]);
            setRegistrations(regData || []);
            setHocKis(hocKiData || []);
            setLopHocPhans(lopHPData || []);
            setHocViens(hocVienData || []);
        } catch (err) {
            addToast(extractError(err, 'Lỗi khi tải dữ liệu'), 'error');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => { fetchAll(); }, []);

    // Reset page when filters change
    useEffect(() => { setCurrentPage(1); setSelectedIds(new Set()); }, [search, filterHocKi, filterLopHP]);

    const filtered = useMemo(() => {
        return registrations.filter(r => {
            const matchSearch = !search ||
                (r.maHocVien?.toLowerCase() || '').includes(search.toLowerCase()) ||
                (r.hoTen?.toLowerCase() || '').includes(search.toLowerCase()) ||
                (r.maLopHocPhan?.toLowerCase() || '').includes(search.toLowerCase()) ||
                (r.tenMonHoc?.toLowerCase() || '').includes(search.toLowerCase()) ||
                (r.maMonHoc?.toLowerCase() || '').includes(search.toLowerCase());
            const matchHocKi = !filterHocKi || r.hocKiId === filterHocKi;
            const matchLopHP = !filterLopHP || r.lopHocPhanId === filterLopHP;
            return matchSearch && matchHocKi && matchLopHP;
        });
    }, [registrations, search, filterHocKi, filterLopHP]);

    const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
    const paginated = filtered.slice((currentPage - 1) * PAGE_SIZE, currentPage * PAGE_SIZE);

    // Stats
    const uniqueHocVien = new Set(registrations.map(r => r.hocVienId)).size;
    const totalTinChi = registrations.reduce((sum, r) => sum + (r.soTinChi || 0), 0);
    const totalTienHocPhi = registrations.reduce((sum, r) => sum + (r.tienHocPhi || 0), 0);
    const lopHPWithReg = new Set(registrations.map(r => r.lopHocPhanId)).size;

    // --- Actions ---

    const openAdd = () => {
        setFormHocVien('');
        setFormLopHP('');
        setIsAddOpen(true);
    };

    const handleAdd = async () => {
        if (!formHocVien || !formLopHP) {
            addToast('Vui lòng chọn đầy đủ học viên và lớp học phần', 'error');
            return;
        }
        try {
            setIsSubmitting(true);
            await dangKyApi.createDangKyTinChi({ hocVienId: formHocVien, lopHocPhanId: formLopHP });
            addToast('Thêm đăng ký thành công', 'success');
            setIsAddOpen(false);
            await fetchAll();
        } catch (err) {
            addToast(extractError(err, 'Lỗi khi thêm đăng ký'), 'error');
        } finally {
            setIsSubmitting(false);
        }
    };

    const openEdit = (item: DangKyTinChiItem) => {
        setSelectedItem(item);
        setFormHocVien(item.hocVienId);
        setFormLopHP(item.lopHocPhanId);
        setIsEditOpen(true);
    };

    const handleEdit = async () => {
        if (!selectedItem || !formHocVien || !formLopHP) return;
        try {
            setIsSubmitting(true);
            await dangKyApi.updateDangKyTinChi(selectedItem.id, { hocVienId: formHocVien, lopHocPhanId: formLopHP });
            addToast('Cập nhật đăng ký thành công', 'success');
            setIsEditOpen(false);
            await fetchAll();
        } catch (err) {
            addToast(extractError(err, 'Lỗi khi cập nhật đăng ký'), 'error');
        } finally {
            setIsSubmitting(false);
        }
    };

    const openDetail = (item: DangKyTinChiItem) => {
        setSelectedItem(item);
        setIsDetailOpen(true);
    };

    const openDelete = (id: string) => {
        setDeletingId(id);
        setIsDeleteOpen(true);
    };

    const confirmDelete = async () => {
        if (!deletingId) return;
        try {
            await dangKyApi.deleteDangKyTinChi(deletingId);
            addToast('Xóa đăng ký thành công', 'success');
            await fetchAll();
        } catch (err) {
            addToast(extractError(err, 'Lỗi khi xóa đăng ký'), 'error');
        } finally {
            setIsDeleteOpen(false);
            setDeletingId(null);
        }
    };

    const openMultiDelete = () => {
        if (selectedIds.size === 0) {
            addToast('Vui lòng chọn ít nhất một đăng ký để xóa', 'info');
            return;
        }
        setIsMultiDeleteOpen(true);
    };

    const confirmMultiDelete = async () => {
        try {
            await dangKyApi.deleteDangKyTinChiList(Array.from(selectedIds));
            addToast(`Đã xóa ${selectedIds.size} đăng ký`, 'success');
            setSelectedIds(new Set());
            setIsMultiDeleteOpen(false);
            await fetchAll();
        } catch (err) {
            addToast(extractError(err, 'Lỗi khi xóa nhiều đăng ký'), 'error');
        }
    };

    const toggleSelectAll = () => {
        if (selectedIds.size === paginated.length) {
            setSelectedIds(new Set());
        } else {
            setSelectedIds(new Set(paginated.map(r => r.id)));
        }
    };

    const toggleSelect = (id: string) => {
        const next = new Set(selectedIds);
        if (next.has(id)) next.delete(id);
        else next.add(id);
        setSelectedIds(next);
    };

    const getTrangThaiColor = (status: string) => {
        switch (status) {
            case 'MO_DANG_KY': return 'bg-green-100 text-green-700';
            case 'DANG_HOC': return 'bg-blue-100 text-blue-700';
            case 'DA_KET_THUC': return 'bg-slate-100 text-slate-600';
            default: return 'bg-slate-100 text-slate-600';
        }
    };

    const getTrangThaiLabel = (status: string) => {
        switch (status) {
            case 'MO_DANG_KY': return 'Mở đăng ký';
            case 'DANG_HOC': return 'Đang học';
            case 'DA_KET_THUC': return 'Đã kết thúc';
            default: return status || '-';
        }
    };

    return (
        <div className="flex h-screen bg-slate-50">
            <AdminSidebar activeMenu="credit-registrations" />
            <div className="flex-1 ml-64 flex flex-col overflow-hidden">
                <AdminHeader title="Quản lý Đăng ký Tín chỉ" />
                <div className="flex-1 overflow-auto">
                    <div className="p-6 max-w-7xl mx-auto space-y-5">

                        {/* Stats */}
                        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                            <div className="bg-white border border-slate-200 rounded-xl px-5 py-3 flex items-center gap-3 shadow-sm">
                                <div className="rounded-lg bg-blue-100 p-2.5"><BookOpen className="w-5 h-5 text-blue-600" /></div>
                                <div>
                                    <p className="text-xl font-bold text-slate-900">{registrations.length}</p>
                                    <p className="text-xs text-slate-500">Tổng lượt đăng ký</p>
                                </div>
                            </div>
                            <div className="bg-white border border-slate-200 rounded-xl px-5 py-3 flex items-center gap-3 shadow-sm">
                                <div className="rounded-lg bg-green-100 p-2.5"><GraduationCap className="w-5 h-5 text-green-600" /></div>
                                <div>
                                    <p className="text-xl font-bold text-green-700">{uniqueHocVien}</p>
                                    <p className="text-xs text-slate-500">Học viên đã đăng ký</p>
                                </div>
                            </div>
                            <div className="bg-white border border-slate-200 rounded-xl px-5 py-3 flex items-center gap-3 shadow-sm">
                                <div className="rounded-lg bg-purple-100 p-2.5"><BarChart3 className="w-5 h-5 text-purple-600" /></div>
                                <div>
                                    <p className="text-xl font-bold text-purple-700">{lopHPWithReg}</p>
                                    <p className="text-xs text-slate-500">Lớp HP có đăng ký</p>
                                </div>
                            </div>
                            <div className="bg-white border border-slate-200 rounded-xl px-5 py-3 flex items-center gap-3 shadow-sm">
                                <div className="rounded-lg bg-amber-100 p-2.5"><CreditCard className="w-5 h-5 text-amber-600" /></div>
                                <div>
                                    <p className="text-xl font-bold text-amber-700">{totalTinChi}</p>
                                    <p className="text-xs text-slate-500">Tổng tín chỉ</p>
                                </div>
                            </div>
                        </div>

                        {/* Toolbar */}
                        <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
                            <div className="px-5 py-4 border-b border-slate-100">
                                <div className="flex flex-wrap gap-3 items-center justify-between">
                                    <div className="flex flex-wrap gap-2 items-center">
                                        {canCreate ? (
                                            <button
                                                onClick={openAdd}
                                                className="flex items-center gap-1.5 px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700 transition-colors"
                                            >
                                                <Plus className="w-4 h-4" /> Thêm đăng ký
                                            </button>
                                        ) : (
                                            <div className="flex items-center gap-1.5 px-4 py-2 bg-slate-100 text-slate-400 rounded-lg text-sm">
                                                <Lock className="w-4 h-4" /> Không có quyền thêm đăng ký
                                            </div>
                                        )}
                                        {(canDelete || canCancel) && selectedIds.size > 0 && (
                                            <button
                                                onClick={openMultiDelete}
                                                className="flex items-center gap-1.5 px-4 py-2 bg-red-600 text-white rounded-lg text-sm font-medium hover:bg-red-700 transition-colors"
                                            >
                                                <Trash2 className="w-4 h-4" /> Xóa ({selectedIds.size})
                                            </button>
                                        )}
                                    </div>
                                    {!canCreate && (
                                        <div className="flex items-center gap-1.5 px-3 py-1.5 bg-amber-50 text-amber-600 rounded-lg text-xs border border-amber-200">
                                            <Lock className="w-3.5 h-3.5" /> Bạn chỉ có quyền xem
                                        </div>
                                    )}
                                    <div className="flex flex-wrap gap-2 items-center">
                                        <div className="relative">
                                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                                            <input
                                                value={search}
                                                onChange={e => setSearch(e.target.value)}
                                                placeholder="Tìm mã HV, tên, lớp, môn..."
                                                className="pl-9 pr-3 py-2 text-sm border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 w-56"
                                            />
                                        </div>
                                        <select
                                            value={filterHocKi}
                                            onChange={e => setFilterHocKi(e.target.value)}
                                            className="py-2 px-3 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                                        >
                                            <option value="">Tất cả học kì</option>
                                            {hocKis.map(hk => (
                                                <option key={hk.id} value={hk.id}>{hk.maHocKi} — {hk.tenHocKi}</option>
                                            ))}
                                        </select>
                                        <select
                                            value={filterLopHP}
                                            onChange={e => setFilterLopHP(e.target.value)}
                                            className="py-2 px-3 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                                        >
                                            <option value="">Tất cả lớp HP</option>
                                            {lopHocPhans.map(lhp => (
                                                <option key={lhp.id} value={lhp.id}>{lhp.maLopHocPhan} — {lhp.tenMonHoc}</option>
                                            ))}
                                        </select>
                                        <button
                                            onClick={fetchAll}
                                            className="p-2 border border-slate-300 rounded-lg text-slate-600 hover:bg-slate-50 transition-colors"
                                            title="Làm mới"
                                        >
                                            <RefreshCw className="w-4 h-4" />
                                        </button>
                                    </div>
                                </div>
                                {selectedIds.size > 0 && (
                                    <p className="mt-2 text-xs text-blue-600 font-medium">
                                        Đã chọn {selectedIds.size} / {filtered.length} đăng ký
                                    </p>
                                )}
                            </div>

                            {/* Table */}
                            {loading ? (
                                <div className="flex items-center justify-center h-48">
                                    <div className="w-8 h-8 border-4 border-slate-200 border-t-blue-600 rounded-full animate-spin" />
                                </div>
                            ) : (
                                <div className="overflow-auto" style={{ maxHeight: 'calc(100vh - 380px)' }}>
                                    <table className="w-full text-sm">
                                        <thead className="sticky top-0 z-10 bg-gradient-to-r from-blue-600 to-blue-700 text-white">
                                            <tr>
                                                <th className="px-3 py-3 text-left w-10">
                                                    <button onClick={toggleSelectAll} className="hover:bg-blue-500 rounded p-0.5">
                                                        {selectedIds.size === paginated.length && paginated.length > 0
                                                            ? <CheckSquare className="w-4 h-4" />
                                                            : <Square className="w-4 h-4" />}
                                                    </button>
                                                </th>
                                                <th className="px-3 py-3 text-left font-semibold">Mã HV</th>
                                                <th className="px-3 py-3 text-left font-semibold">Họ tên</th>
                                                <th className="px-3 py-3 text-left font-semibold">Lớp HP</th>
                                                <th className="px-3 py-3 text-left font-semibold">Môn học</th>
                                                <th className="px-3 py-3 text-center font-semibold">Tín chỉ</th>
                                                <th className="px-3 py-3 text-right font-semibold">Tiền HP</th>
                                                <th className="px-3 py-3 text-left font-semibold">Học kì</th>
                                                <th className="px-3 py-3 text-left font-semibold">Trạng thái</th>
                                                <th className="px-3 py-3 text-left font-semibold">Ngày DK</th>
                                                <th className="px-3 py-3 text-center font-semibold">Thao tác</th>
                                            </tr>
                                        </thead>
                                        <tbody className="divide-y divide-slate-100">
                                            {paginated.map(r => (
                                                <tr key={r.id} className={`hover:bg-blue-50/60 transition-colors ${selectedIds.has(r.id) ? 'bg-blue-50' : ''}`}>
                                                    <td className="px-3 py-3">
                                                        <button onClick={() => toggleSelect(r.id)} className="hover:bg-blue-100 rounded p-0.5">
                                                            {selectedIds.has(r.id)
                                                                ? <CheckSquare className="w-4 h-4 text-blue-600" />
                                                                : <Square className="w-4 h-4 text-slate-400" />}
                                                        </button>
                                                    </td>
                                                    <td className="px-3 py-3 font-semibold text-slate-800">{r.maHocVien || '-'}</td>
                                                    <td className="px-3 py-3 text-slate-700 max-w-[140px] truncate">{r.hoTen || '-'}</td>
                                                    <td className="px-3 py-3 text-blue-600 font-medium">{r.maLopHocPhan || '-'}</td>
                                                    <td className="px-3 py-3 text-slate-600 max-w-[160px] truncate" title={r.tenMonHoc}>{r.tenMonHoc || r.maMonHoc || '-'}</td>
                                                    <td className="px-3 py-3 text-center">
                                                        <span className="px-2 py-0.5 bg-blue-100 text-blue-700 rounded-full text-xs font-semibold">{r.soTinChi || 0} TC</span>
                                                    </td>
                                                    <td className="px-3 py-3 text-right text-amber-700 font-medium text-xs">
                                                        {r.tienHocPhi ? formatCurrency(r.tienHocPhi) : '-'}
                                                    </td>
                                                    <td className="px-3 py-3 text-slate-500 text-xs">
                                                        <div>{r.hocKiMa || '-'}</div>
                                                        <div className="text-slate-400">{r.hocKiTen || ''}</div>
                                                    </td>
                                                    <td className="px-3 py-3">
                                                        <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${getTrangThaiColor(r.trangThaiLopHocPhan)}`}>
                                                            {getTrangThaiLabel(r.trangThaiLopHocPhan)}
                                                        </span>
                                                    </td>
                                                    <td className="px-3 py-3 text-slate-400 text-xs whitespace-nowrap">{formatDate(r.createdAt)}</td>
                                                    <td className="px-3 py-3 text-center">
                                                        <div className="flex items-center justify-center gap-1">
                                                            <button
                                                                onClick={() => openDetail(r)}
                                                                className="p-1.5 text-slate-500 hover:bg-slate-100 rounded-lg transition-colors"
                                                                title="Xem chi tiết"
                                                            >
                                                                <Eye className="w-4 h-4" />
                                                            </button>
                                                            {canCreate && (
                                                                <button
                                                                    onClick={() => openEdit(r)}
                                                                    className="p-1.5 text-blue-500 hover:bg-blue-100 rounded-lg transition-colors"
                                                                    title="Cập nhật"
                                                                >
                                                                    <Edit className="w-4 h-4" />
                                                                </button>
                                                            )}
                                                            {(canCancel || canDelete) && (
                                                                <button
                                                                    onClick={() => openDelete(r.id)}
                                                                    className="p-1.5 text-red-500 hover:bg-red-100 rounded-lg transition-colors"
                                                                    title="Xóa"
                                                                >
                                                                    <Trash2 className="w-4 h-4" />
                                                                </button>
                                                            )}
                                                        </div>
                                                    </td>
                                                </tr>
                                            ))}
                                            {paginated.length === 0 && (
                                                <tr>
                                                    <td colSpan={11} className="py-14 text-center">
                                                        <div className="flex flex-col items-center gap-2">
                                                            <div className="rounded-full bg-slate-100 p-4">
                                                                <BookOpen className="w-8 h-8 text-slate-400" />
                                                            </div>
                                                            <p className="text-slate-500 font-medium">
                                                                {search || filterHocKi || filterLopHP ? 'Không tìm thấy kết quả phù hợp' : 'Chưa có đăng ký nào'}
                                                            </p>
                                                        </div>
                                                    </td>
                                                </tr>
                                            )}
                                        </tbody>
                                    </table>
                                </div>
                            )}

                            {/* Pagination */}
                            {!loading && filtered.length > 0 && (
                                <div className="px-5 py-3 border-t border-slate-100 flex items-center justify-between">
                                    <p className="text-xs text-slate-500">
                                        Hiển thị {(currentPage - 1) * PAGE_SIZE + 1} - {Math.min(currentPage * PAGE_SIZE, filtered.length)} trong {filtered.length} đăng ký
                                    </p>
                                    <div className="flex items-center gap-1">
                                        <button
                                            onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                                            disabled={currentPage === 1}
                                            className="p-1.5 rounded-lg border border-slate-300 text-slate-600 hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed"
                                        >
                                            <ChevronLeft className="w-4 h-4" />
                                        </button>
                                        {Array.from({ length: totalPages }, (_, i) => i + 1)
                                            .filter(p => p === 1 || p === totalPages || Math.abs(p - currentPage) <= 1)
                                            .reduce<(number | '...')[]>((acc, p, i, arr) => {
                                                if (i > 0 && (p as number) - (arr[i - 1] as number) > 1) acc.push('...');
                                                acc.push(p);
                                                return acc;
                                            }, [])
                                            .map((p, i) =>
                                                p === '...'
                                                    ? <span key={`ellipsis-${i}`} className="px-2 text-slate-400">...</span>
                                                    : <button
                                                        key={p}
                                                        onClick={() => setCurrentPage(p as number)}
                                                        className={`w-8 h-8 rounded-lg text-sm font-medium ${currentPage === p ? 'bg-blue-600 text-white' : 'border border-slate-300 text-slate-600 hover:bg-slate-50'}`}
                                                    >{p}</button>
                                            )
                                        }
                                        <button
                                            onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                                            disabled={currentPage === totalPages}
                                            className="p-1.5 rounded-lg border border-slate-300 text-slate-600 hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed"
                                        >
                                            <ChevronRight className="w-4 h-4" />
                                        </button>
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>

            {/* === ADD MODAL === */}
            {isAddOpen && (
                <div className="fixed inset-0 bg-black/30 flex items-center justify-center z-50 p-4" onClick={() => setIsAddOpen(false)}>
                    <div className="bg-white rounded-2xl shadow-2xl max-w-lg w-full" onClick={e => e.stopPropagation()}>
                        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100">
                            <h3 className="font-bold text-lg text-slate-900">Thêm đăng ký tín chỉ</h3>
                            <button onClick={() => setIsAddOpen(false)} className="p-1.5 hover:bg-slate-100 rounded-lg"><X className="w-5 h-5 text-slate-500" /></button>
                        </div>
                        <div className="px-6 py-5 space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-slate-700 mb-1.5">Học viên <span className="text-red-500">*</span></label>
                                <select
                                    value={formHocVien}
                                    onChange={e => setFormHocVien(e.target.value)}
                                    className="w-full px-3 py-2.5 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                                >
                                    <option value="">-- Chọn học viên --</option>
                                    {hocViens.map(hv => (
                                        <option key={hv.id} value={hv.id}>
                                            {hv.maHocVien} — {hv.hoTen} ({hv.nganhTen || 'N/A'})
                                        </option>
                                    ))}
                                </select>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-slate-700 mb-1.5">Lớp học phần <span className="text-red-500">*</span></label>
                                <select
                                    value={formLopHP}
                                    onChange={e => setFormLopHP(e.target.value)}
                                    className="w-full px-3 py-2.5 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                                >
                                    <option value="">-- Chọn lớp học phần --</option>
                                    {lopHocPhans.map(lhp => (
                                        <option key={lhp.id} value={lhp.id}>
                                            {lhp.maLopHocPhan} — {lhp.tenMonHoc} ({lhp.soTinChi} TC) [{lhp.hocKiMa}]
                                        </option>
                                    ))}
                                </select>
                            </div>
                            {formLopHP && (() => {
                                const selected = lopHocPhans.find(l => l.id === formLopHP);
                                if (!selected) return null;
                                return (
                                    <div className="bg-blue-50 border border-blue-200 rounded-lg px-4 py-3 text-sm">
                                        <div className="flex items-center gap-2 mb-1.5">
                                            <CreditCard className="w-4 h-4 text-blue-600" />
                                            <span className="font-semibold text-blue-800">Thông tin lớp học phần</span>
                                        </div>
                                        <div className="grid grid-cols-2 gap-2 text-blue-700">
                                            <div><span className="font-medium">Môn:</span> {selected.tenMonHoc}</div>
                                            <div><span className="font-medium">Tín chỉ:</span> {selected.soTinChi} TC</div>
                                            <div><span className="font-medium">Học kì:</span> {selected.hocKiTen} ({selected.hocKiMa})</div>
                                            <div><span className="font-medium">Năm:</span> {selected.namHoc}</div>
                                            <div><span className="font-medium">SL tối đa:</span> {selected.soLuongToiDa}</div>
                                            <div><span className="font-medium">Đã đăng ký:</span> {selected.soLuongDaDangKy}</div>
                                            <div className="col-span-2"><span className="font-medium">Học phí:</span> <span className="text-amber-700 font-semibold">{formatCurrency(selected.soTinChi * 700000)}</span></div>
                                        </div>
                                    </div>
                                );
                            })()}
                        </div>
                        <div className="px-6 py-4 border-t border-slate-100 flex gap-3 justify-end">
                            <button onClick={() => setIsAddOpen(false)} className="px-4 py-2 border border-slate-300 rounded-lg text-sm font-medium text-slate-700 hover:bg-slate-50">Hủy</button>
                            <button
                                onClick={handleAdd}
                                disabled={isSubmitting || !formHocVien || !formLopHP}
                                className="px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                            >
                                {isSubmitting ? <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" /> : null}
                                {isSubmitting ? 'Đang thêm...' : 'Thêm đăng ký'}
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* === EDIT MODAL === */}
            {isEditOpen && selectedItem && (
                <div className="fixed inset-0 bg-black/30 flex items-center justify-center z-50 p-4" onClick={() => setIsEditOpen(false)}>
                    <div className="bg-white rounded-2xl shadow-2xl max-w-lg w-full" onClick={e => e.stopPropagation()}>
                        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100">
                            <h3 className="font-bold text-lg text-slate-900">Cập nhật đăng ký tín chỉ</h3>
                            <button onClick={() => setIsEditOpen(false)} className="p-1.5 hover:bg-slate-100 rounded-lg"><X className="w-5 h-5 text-slate-500" /></button>
                        </div>
                        <div className="px-6 py-5 space-y-4">
                            <div className="bg-slate-50 border border-slate-200 rounded-lg px-4 py-3 text-sm">
                                <p><span className="font-medium text-slate-500">Mã đăng ký:</span> <span className="font-semibold">{selectedItem.id}</span></p>
                                <p><span className="font-medium text-slate-500">Ngày đăng ký:</span> {formatDate(selectedItem.createdAt)}</p>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-slate-700 mb-1.5">Học viên <span className="text-red-500">*</span></label>
                                <select
                                    value={formHocVien}
                                    onChange={e => setFormHocVien(e.target.value)}
                                    className="w-full px-3 py-2.5 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                                >
                                    <option value="">-- Chọn học viên --</option>
                                    {hocViens.map(hv => (
                                        <option key={hv.id} value={hv.id}>
                                            {hv.maHocVien} — {hv.hoTen} ({hv.nganhTen || 'N/A'})
                                        </option>
                                    ))}
                                </select>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-slate-700 mb-1.5">Lớp học phần <span className="text-red-500">*</span></label>
                                <select
                                    value={formLopHP}
                                    onChange={e => setFormLopHP(e.target.value)}
                                    className="w-full px-3 py-2.5 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                                >
                                    <option value="">-- Chọn lớp học phần --</option>
                                    {lopHocPhans.map(lhp => (
                                        <option key={lhp.id} value={lhp.id}>
                                            {lhp.maLopHocPhan} — {lhp.tenMonHoc} ({lhp.soTinChi} TC) [{lhp.hocKiMa}]
                                        </option>
                                    ))}
                                </select>
                            </div>
                            {formLopHP && (() => {
                                const selected = lopHocPhans.find(l => l.id === formLopHP);
                                if (!selected) return null;
                                return (
                                    <div className="bg-blue-50 border border-blue-200 rounded-lg px-4 py-3 text-sm">
                                        <div className="flex items-center gap-2 mb-1.5">
                                            <CreditCard className="w-4 h-4 text-blue-600" />
                                            <span className="font-semibold text-blue-800">Thông tin lớp học phần</span>
                                        </div>
                                        <div className="grid grid-cols-2 gap-2 text-blue-700">
                                            <div><span className="font-medium">Môn:</span> {selected.tenMonHoc}</div>
                                            <div><span className="font-medium">Tín chỉ:</span> {selected.soTinChi} TC</div>
                                            <div><span className="font-medium">Học kì:</span> {selected.hocKiTen} ({selected.hocKiMa})</div>
                                            <div><span className="font-medium">Năm:</span> {selected.namHoc}</div>
                                            <div><span className="font-medium">Học phí:</span> <span className="text-amber-700 font-semibold">{formatCurrency(selected.soTinChi * 700000)}</span></div>
                                        </div>
                                    </div>
                                );
                            })()}
                        </div>
                        <div className="px-6 py-4 border-t border-slate-100 flex gap-3 justify-end">
                            <button onClick={() => setIsEditOpen(false)} className="px-4 py-2 border border-slate-300 rounded-lg text-sm font-medium text-slate-700 hover:bg-slate-50">Hủy</button>
                            <button
                                onClick={handleEdit}
                                disabled={isSubmitting || !formHocVien || !formLopHP}
                                className="px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                            >
                                {isSubmitting ? <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" /> : null}
                                {isSubmitting ? 'Đang cập nhật...' : 'Cập nhật'}
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* === DETAIL MODAL === */}
            {isDetailOpen && selectedItem && (
                <div className="fixed inset-0 bg-black/30 flex items-center justify-center z-50 p-4" onClick={() => setIsDetailOpen(false)}>
                    <div className="bg-white rounded-2xl shadow-2xl max-w-xl w-full" onClick={e => e.stopPropagation()}>
                        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100">
                            <h3 className="font-bold text-lg text-slate-900">Chi tiết đăng ký tín chỉ</h3>
                            <button onClick={() => setIsDetailOpen(false)} className="p-1.5 hover:bg-slate-100 rounded-lg"><X className="w-5 h-5 text-slate-500" /></button>
                        </div>
                        <div className="px-6 py-5">
                            <div className="grid grid-cols-2 gap-x-6 gap-y-3 text-sm">
                                <div className="space-y-3">
                                    <div>
                                        <p className="text-xs text-slate-400 uppercase tracking-wide font-medium">Mã đăng ký</p>
                                        <p className="font-semibold text-slate-800">{selectedItem.id}</p>
                                    </div>
                                    <div>
                                        <p className="text-xs text-slate-400 uppercase tracking-wide font-medium">Mã học viên</p>
                                        <p className="font-semibold text-slate-800">{selectedItem.maHocVien || '-'}</p>
                                    </div>
                                    <div>
                                        <p className="text-xs text-slate-400 uppercase tracking-wide font-medium">Họ tên</p>
                                        <p className="font-semibold text-slate-800">{selectedItem.hoTen || '-'}</p>
                                    </div>
                                    <div>
                                        <p className="text-xs text-slate-400 uppercase tracking-wide font-medium">Email</p>
                                        <p className="text-slate-600">{selectedItem.email || '-'}</p>
                                    </div>
                                    <div>
                                        <p className="text-xs text-slate-400 uppercase tracking-wide font-medium">SĐT</p>
                                        <p className="text-slate-600">{selectedItem.soDienThoai || '-'}</p>
                                    </div>
                                </div>
                                <div className="space-y-3">
                                    <div>
                                        <p className="text-xs text-slate-400 uppercase tracking-wide font-medium">Lớp học phần</p>
                                        <p className="font-semibold text-blue-600">{selectedItem.maLopHocPhan || '-'}</p>
                                    </div>
                                    <div>
                                        <p className="text-xs text-slate-400 uppercase tracking-wide font-medium">Môn học</p>
                                        <p className="font-semibold text-slate-800">{selectedItem.tenMonHoc || selectedItem.maMonHoc || '-'}</p>
                                    </div>
                                    <div>
                                        <p className="text-xs text-slate-400 uppercase tracking-wide font-medium">Học kì</p>
                                        <p className="text-slate-600">{selectedItem.hocKiTen || '-'} ({selectedItem.hocKiMa || '-'})</p>
                                    </div>
                                    <div>
                                        <p className="text-xs text-slate-400 uppercase tracking-wide font-medium">Trạng thái lớp</p>
                                        <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${getTrangThaiColor(selectedItem.trangThaiLopHocPhan)}`}>
                                            {getTrangThaiLabel(selectedItem.trangThaiLopHocPhan)}
                                        </span>
                                    </div>
                                    <div>
                                        <p className="text-xs text-slate-400 uppercase tracking-wide font-medium">Hạn đăng ký</p>
                                        <p className="text-slate-600">{formatDate(selectedItem.hanDangKy)}</p>
                                    </div>
                                </div>
                            </div>

                            <div className="mt-4 pt-4 border-t border-slate-100 grid grid-cols-3 gap-4">
                                <div className="bg-blue-50 border border-blue-200 rounded-lg px-4 py-3 text-center">
                                    <p className="text-2xl font-bold text-blue-700">{selectedItem.soTinChi || 0}</p>
                                    <p className="text-xs text-blue-600 font-medium">Tín chỉ</p>
                                </div>
                                <div className="bg-amber-50 border border-amber-200 rounded-lg px-4 py-3 text-center">
                                    <p className="text-lg font-bold text-amber-700">{selectedItem.tienHocPhi ? formatCurrency(selectedItem.tienHocPhi) : '-'}</p>
                                    <p className="text-xs text-amber-600 font-medium">Học phí</p>
                                </div>
                                <div className="bg-green-50 border border-green-200 rounded-lg px-4 py-3 text-center">
                                    <p className="text-xs text-green-600 font-medium">Ngày đăng ký</p>
                                    <p className="text-sm font-semibold text-green-700 mt-0.5">{formatDate(selectedItem.createdAt)}</p>
                                </div>
                            </div>

                            <div className="mt-4 flex gap-3">
                                {canCreate && (
                                    <button
                                        onClick={() => { setIsDetailOpen(false); openEdit(selectedItem); }}
                                        className="flex-1 py-2.5 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700 flex items-center justify-center gap-2"
                                    >
                                        <Edit className="w-4 h-4" /> Cập nhật
                                    </button>
                                )}
                                {(canCancel || canDelete) && (
                                    <button
                                        onClick={() => { setIsDetailOpen(false); openDelete(selectedItem.id); }}
                                        className="flex-1 py-2.5 bg-red-600 text-white rounded-lg text-sm font-medium hover:bg-red-700 flex items-center justify-center gap-2"
                                    >
                                        <Trash2 className="w-4 h-4" /> Xóa
                                    </button>
                                )}
                                {!canCreate && !canCancel && !canDelete && (
                                    <div className="flex-1 py-2.5 bg-slate-100 text-slate-400 rounded-lg text-sm font-medium flex items-center justify-center gap-2">
                                        <Lock className="w-4 h-4" /> Không có quyền thao tác
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* === DELETE CONFIRM === */}
            {isDeleteOpen && (
                <div className="fixed inset-0 bg-black/30 flex items-center justify-center z-50 p-4" onClick={() => setIsDeleteOpen(false)}>
                    <div className="bg-white rounded-2xl shadow-2xl max-w-sm w-full p-6" onClick={e => e.stopPropagation()}>
                        <div className="flex items-center gap-3 mb-4">
                            <div className="rounded-full bg-red-100 p-3"><AlertCircle className="w-6 h-6 text-red-600" /></div>
                            <h3 className="font-bold text-slate-900">Xác nhận xóa</h3>
                        </div>
                        <p className="text-sm text-slate-600 mb-6">Bạn có chắc muốn xóa đăng ký này? Hành động không thể hoàn tác.</p>
                        <div className="flex gap-3">
                            <button onClick={() => setIsDeleteOpen(false)} className="flex-1 py-2.5 border border-slate-300 rounded-xl text-sm font-medium text-slate-700 hover:bg-slate-50">Hủy</button>
                            <button onClick={confirmDelete} className="flex-1 py-2.5 bg-red-600 text-white rounded-xl text-sm font-medium hover:bg-red-700">Xóa</button>
                        </div>
                    </div>
                </div>
            )}

            {/* === MULTI DELETE CONFIRM === */}
            {isMultiDeleteOpen && (
                <div className="fixed inset-0 bg-black/30 flex items-center justify-center z-50 p-4" onClick={() => setIsMultiDeleteOpen(false)}>
                    <div className="bg-white rounded-2xl shadow-2xl max-w-sm w-full p-6" onClick={e => e.stopPropagation()}>
                        <div className="flex items-center gap-3 mb-4">
                            <div className="rounded-full bg-red-100 p-3"><AlertCircle className="w-6 h-6 text-red-600" /></div>
                            <h3 className="font-bold text-slate-900">Xóa nhiều đăng ký</h3>
                        </div>
                        <p className="text-sm text-slate-600 mb-6">
                            Bạn có chắc muốn xóa <strong>{selectedIds.size}</strong> đăng ký đã chọn? Hành động không thể hoàn tác.
                        </p>
                        <div className="flex gap-3">
                            <button onClick={() => setIsMultiDeleteOpen(false)} className="flex-1 py-2.5 border border-slate-300 rounded-xl text-sm font-medium text-slate-700 hover:bg-slate-50">Hủy</button>
                            <button onClick={confirmMultiDelete} className="flex-1 py-2.5 bg-red-600 text-white rounded-xl text-sm font-medium hover:bg-red-700">Xóa {selectedIds.size} mục</button>
                        </div>
                    </div>
                </div>
            )}

            {/* Toasts */}
            <div className="fixed bottom-24 right-6 space-y-2 z-[70] pointer-events-none">
                {toasts.map(t => (
                    <div key={t.id} className={`flex items-center gap-2.5 px-4 py-3 rounded-xl shadow-xl text-white text-sm font-medium max-w-xs pointer-events-auto ${t.type === 'success' ? 'bg-green-600' : t.type === 'error' ? 'bg-red-600' : 'bg-blue-600'}`}>
                        {t.type === 'success' && <CheckCircle className="w-4 h-4 flex-shrink-0" />}
                        {t.type === 'error' && <AlertCircle className="w-4 h-4 flex-shrink-0" />}
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
