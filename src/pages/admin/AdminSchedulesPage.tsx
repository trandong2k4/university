import { useState, useEffect, useMemo } from 'react';
import { AdminSidebar } from '@/components/layouts/AdminSidebar';
import { AdminHeader } from '@/components/layouts/AdminHeader';
import {
    Calendar, Search, Plus, Trash2, X, AlertCircle, CheckCircle, Edit,
    RefreshCw, CheckSquare, Square, Clock, MapPin, BookOpen, CalendarDays, Eye
} from 'lucide-react';
import AiAssistantButton from '@/imports/AiAssistantButton-4-13343';
import * as lichApi from '@/api/admin/lich.api';
import * as lopHocPhanApi from '@/api/admin/lop-hoc-phan.api';
import * as gioHocApi from '@/api/admin/giohoc.api';
import * as phongApi from '@/api/admin/phong.api';
import type { LichItem, CreateLichRequest } from '@/api/admin/lich.api';

interface Toast {
    id: string;
    message: string;
    type: 'success' | 'error' | 'info';
}

interface LopHocPhanItem {
    id: string;
    maLopHocPhan: string;
    tenMonHoc: string;
    tenHocKi: string;
}

interface GioHocItem {
    id: string;
    tenGioHoc: string;
    thoiGianBatDau: string;
    thoiGianKetThuc: string;
}

interface PhongItem {
    id: string;
    maPhong: string;
    tenPhong: string;
}

const extractError = (err: unknown, fallback: string): string => {
    if (err && typeof err === 'object') {
        const e = err as { response?: { data?: { detail?: string; message?: string } } };
        return e.response?.data?.detail || e.response?.data?.message || fallback;
    }
    return fallback;
};

export default function AdminSchedulesPage() {
    const [schedules, setSchedules] = useState<LichItem[]>([]);
    const [loading, setLoading] = useState(false);
    const [toasts, setToasts] = useState<Toast[]>([]);
    const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
    const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
    const [isDeleting, setIsDeleting] = useState(false);

    // Filters
    const [search, setSearch] = useState('');
    const [selectedLopHPId, setSelectedLopHPId] = useState<string>('');
    const [selectedPhongId, setSelectedPhongId] = useState<string>('');

    // Dropdowns data
    const [lopHocPhans, setLopHocPhans] = useState<LopHocPhanItem[]>([]);
    const [phongs, setPhongs] = useState<PhongItem[]>([]);
    const [gioHocs, setGioHocs] = useState<GioHocItem[]>([]);

    // Modals
    const [isAddOpen, setIsAddOpen] = useState(false);
    const [isEditOpen, setIsEditOpen] = useState(false);
    const [isDetailOpen, setIsDetailOpen] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [selectedItem, setSelectedItem] = useState<LichItem | null>(null);

    // Forms
    const [lichForm, setLichForm] = useState<CreateLichRequest>({
        ngayHoc: '',
        gioHocId: '',
        phongId: '',
        lopHocPhanId: ''
    });

    const addToast = (message: string, type: 'success' | 'error' | 'info' = 'info') => {
        const id = Date.now().toString();
        setToasts(prev => [...prev, { id, message, type }]);
        setTimeout(() => setToasts(prev => prev.filter(t => t.id !== id)), 4000);
    };

    const fetchSchedules = async () => {
        try {
            setLoading(true);
            const data = await lichApi.getLich();
            setSchedules(data || []);
        } catch (err) {
            addToast(extractError(err, 'Lỗi khi tải dữ liệu lịch học'), 'error');
        } finally {
            setLoading(false);
        }
    };

    const fetchDropdownData = async () => {
        try {
            const [lhp, p, gh] = await Promise.all([
                lopHocPhanApi.getLopHocPhan(),
                phongApi.getAllPhong(),
                gioHocApi.getAllGioHoc()
            ]);
            setLopHocPhans(lhp || []);
            setPhongs(p || []);
            setGioHocs(gh || []);
        } catch (err) {
            console.error('Lỗi khi tải dữ liệu dropdown:', err);
        }
    };

    useEffect(() => {
        fetchSchedules();
        fetchDropdownData();
    }, []);

    const filtered = schedules.filter(item => {
        const matchSearch = !search ||
            item.lopHocPhan?.maLopHocPhan?.toLowerCase().includes(search.toLowerCase()) ||
            item.lopHocPhan?.tenMonHoc?.toLowerCase().includes(search.toLowerCase()) ||
            item.phong?.maPhong?.toLowerCase().includes(search.toLowerCase());
        const matchLopHP = !selectedLopHPId || item.lopHocPhanId === selectedLopHPId;
        const matchPhong = !selectedPhongId || item.phongId === selectedPhongId;
        return matchSearch && matchLopHP && matchPhong;
    });

    const toggleSelectAll = () => {
        if (selectedIds.size === sortedFiltered.length) {
            setSelectedIds(new Set());
        } else {
            setSelectedIds(new Set(sortedFiltered.map(s => s.id)));
        }
    };

    const toggleSelect = (id: string) => {
        const newSet = new Set(selectedIds);
        if (newSet.has(id)) newSet.delete(id);
        else newSet.add(id);
        setSelectedIds(newSet);
    };

    const handleDeleteSelected = () => {
        if (selectedIds.size === 0) return;
        setIsDeleteModalOpen(true);
    };

    const confirmDelete = async () => {
        setIsDeleting(true);
        try {
            await lichApi.deleteLichList(Array.from(selectedIds));
            addToast(`Xóa thành công ${selectedIds.size} lịch học!`, 'success');
            setSelectedIds(new Set());
            setIsDeleteModalOpen(false);
            await fetchSchedules();
        } catch (err: any) {
            addToast(extractError(err, 'Lỗi khi xóa'), 'error');
        } finally {
            setIsDeleting(false);
        }
    };

    const openAdd = () => {
        setLichForm({
            ngayHoc: '',
            gioHocId: gioHocs[0]?.id || '',
            phongId: phongs[0]?.id || '',
            lopHocPhanId: lopHocPhans[0]?.id || ''
        });
        setIsAddOpen(true);
    };

    const openEdit = (item: LichItem) => {
        setSelectedItem(item);
        setLichForm({
            ngayHoc: item.ngayHoc ? item.ngayHoc.split('/').reverse().join('-') : '',
            gioHocId: item.gioHocId,
            phongId: item.phongId,
            lopHocPhanId: item.lopHocPhanId
        });
        setIsEditOpen(true);
    };

    const handleViewDetail = (item: LichItem) => {
        setSelectedItem(item);
        setIsDetailOpen(true);
    };

    const handleCreate = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!lichForm.ngayHoc || !lichForm.gioHocId || !lichForm.phongId || !lichForm.lopHocPhanId) {
            addToast('Vui lòng điền đầy đủ thông tin', 'error');
            return;
        }
        try {
            setIsSubmitting(true);
            const payload = {
                ...lichForm,
                ngayHoc: lichForm.ngayHoc ? `${lichForm.ngayHoc}T00:00:00` : ''
            };
            await lichApi.createLich(payload);
            addToast('Thêm lịch học thành công!', 'success');
            setIsAddOpen(false);
            await fetchSchedules();
        } catch (err: any) {
            addToast(extractError(err, 'Lỗi khi thêm lịch học'), 'error');
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleUpdate = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!selectedItem) return;
        try {
            setIsSubmitting(true);
            const payload = {
                ...lichForm,
                ngayHoc: lichForm.ngayHoc ? `${lichForm.ngayHoc}T00:00:00` : ''
            };
            await lichApi.updateLich(selectedItem.id, payload);
            addToast('Cập nhật lịch học thành công!', 'success');
            setIsEditOpen(false);
            await fetchSchedules();
        } catch (err: any) {
            addToast(extractError(err, 'Lỗi khi cập nhật'), 'error');
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleDelete = async (item: LichItem) => {
        if (!confirm('Xóa lịch học này?')) return;
        try {
            await lichApi.deleteLich(item.id);
            addToast('Xóa lịch học thành công!', 'success');
            await fetchSchedules();
        } catch (err: any) {
            addToast(extractError(err, 'Lỗi khi xóa'), 'error');
        }
    };

    const getGioHocLabel = (item: LichItem) => {
        const gh = item.gioHoc;
        if (!gh) return '-';
        const trimTime = (t: string) => t ? t.substring(0, 5) : t;
        return `${trimTime(gh.gioBatDau)} - ${trimTime(gh.gioKetThuc)}`;
    };

    const parseViDate = (dateStr: string): Date | null => {
        if (!dateStr) return null;
        const parts = dateStr.split('/');
        if (parts.length === 3) {
            const d = new Date(`${parts[2]}-${parts[1]}-${parts[0]}`);
            return isNaN(d.getTime()) ? null : d;
        }
        const d = new Date(dateStr);
        return isNaN(d.getTime()) ? null : d;
    };

    const sortSchedules = (list: LichItem[]): LichItem[] => {
        return [...list].sort((a, b) => {
            const lhpA = a.lopHocPhan?.maLopHocPhan || '';
            const lhpB = b.lopHocPhan?.maLopHocPhan || '';
            if (lhpA !== lhpB) return lhpA.localeCompare(lhpB);

            const monA = a.lopHocPhan?.tenMonHoc || '';
            const monB = b.lopHocPhan?.tenMonHoc || '';
            if (monA !== monB) return monA.localeCompare(monB);

            const phongA = a.phong?.maPhong || '';
            const phongB = b.phong?.maPhong || '';
            if (phongA !== phongB) return phongA.localeCompare(phongB);

            const dateA = parseViDate(a.ngayHoc);
            const dateB = parseViDate(b.ngayHoc);
            if (dateA && dateB) {
                const diff = dateA.getTime() - dateB.getTime();
                if (diff !== 0) return diff;
            }

            const ghA = a.gioHoc?.gioBatDau || '';
            const ghB = b.gioHoc?.gioBatDau || '';
            return ghA.localeCompare(ghB);
        });
    };

    const sortedSchedules = useMemo(() => sortSchedules(schedules), [schedules]);
    const sortedFiltered = useMemo(() => sortSchedules(filtered), [filtered]);

    const formatDate = (dateStr: string) => {
        const d = parseViDate(dateStr);
        if (!d) return dateStr || '—';
        return d.toLocaleDateString('vi-VN', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' });
    };

    const formatShortDate = (dateStr: string) => {
        const d = parseViDate(dateStr);
        if (!d) return dateStr || '—';
        return d.toLocaleDateString('vi-VN');
    };

    return (
        <div className="flex h-screen bg-slate-50">
            <AdminSidebar activeMenu="schedules" />
            <div className="flex-1 ml-64 flex flex-col overflow-hidden">
                <AdminHeader title="Quản Lý Lịch Học" />
                <div className="flex-1 overflow-auto">
                    <div className="p-6 max-w-7xl mx-auto space-y-4">

                        {/* Stats */}
                        <div className="grid grid-cols-4 gap-4">
                            <div className="bg-white border border-slate-200 rounded-xl px-5 py-3 flex items-center gap-3 shadow-sm">
                                <div className="rounded-lg bg-blue-100 p-2"><Calendar className="w-5 h-5 text-blue-600" /></div>
                                <div>
                                    <p className="text-xl font-bold text-slate-900">{sortedSchedules.length}</p>
                                    <p className="text-xs text-slate-500">Tổng lịch</p>
                                </div>
                            </div>
                            <div className="bg-white border border-slate-200 rounded-xl px-5 py-3 flex items-center gap-3 shadow-sm">
                                <div className="rounded-lg bg-green-100 p-2"><CheckSquare className="w-5 h-5 text-green-600" /></div>
                                <div>
                                    <p className="text-xl font-bold text-green-700">{selectedIds.size}</p>
                                    <p className="text-xs text-slate-500">Đã chọn</p>
                                </div>
                            </div>
                            <div className="bg-white border border-slate-200 rounded-xl px-5 py-3 flex items-center gap-3 shadow-sm">
                                <div className="rounded-lg bg-purple-100 p-2"><BookOpen className="w-5 h-5 text-purple-600" /></div>
                                <div>
                                    <p className="text-xl font-bold text-purple-700">{lopHocPhans.length}</p>
                                    <p className="text-xs text-slate-500">Lớp HP</p>
                                </div>
                            </div>
                            <div className="bg-white border border-slate-200 rounded-xl px-5 py-3 flex items-center gap-3 shadow-sm">
                                <div className="rounded-lg bg-orange-100 p-2"><MapPin className="w-5 h-5 text-orange-600" /></div>
                                <div>
                                    <p className="text-xl font-bold text-orange-700">{phongs.length}</p>
                                    <p className="text-xs text-slate-500">Phòng học</p>
                                </div>
                            </div>
                        </div>

                        {/* Toolbar */}
                        <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-3 flex flex-col sm:flex-row gap-3 items-start sm:items-center justify-between sticky top-0 z-20">
                            <div className="flex flex-wrap items-center gap-2 flex-1">
                                <div className="relative min-w-[200px] max-w-xs">
                                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                                    <input
                                        type="text"
                                        placeholder="Tìm lớp, phòng..."
                                        value={search}
                                        onChange={(e) => setSearch(e.target.value)}
                                        className="w-full pl-9 pr-4 py-2 text-sm border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                                    />
                                </div>
                                <select
                                    value={selectedLopHPId}
                                    onChange={(e) => setSelectedLopHPId(e.target.value)}
                                    className="py-2 px-3 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                                >
                                    <option value="">-- Tất cả Lớp HP --</option>
                                    {lopHocPhans.map(lhp => (
                                        <option key={lhp.id} value={lhp.id}>{lhp.maLopHocPhan} - {lhp.tenMonHoc}</option>
                                    ))}
                                </select>
                                <select
                                    value={selectedPhongId}
                                    onChange={(e) => setSelectedPhongId(e.target.value)}
                                    className="py-2 px-3 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                                >
                                    <option value="">-- Tất cả Phòng --</option>
                                    {phongs.map(p => (
                                        <option key={p.id} value={p.id}>{p.maPhong} - {p.tenPhong}</option>
                                    ))}
                                </select>
                            </div>
                            <div className="flex items-center gap-2">
                                <button onClick={fetchSchedules} className="p-2 border border-slate-300 rounded-lg text-slate-600 hover:bg-slate-50">
                                    <RefreshCw className="w-4 h-4" />
                                </button>
                                {selectedIds.size > 0 && (
                                    <button onClick={handleDeleteSelected} className="flex items-center gap-1.5 px-3 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 text-sm font-medium">
                                        <Trash2 className="w-4 h-4" /> Xóa ({selectedIds.size})
                                    </button>
                                )}
                                <button onClick={openAdd} className="flex items-center gap-1.5 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 text-sm font-medium shadow-sm">
                                    <Plus className="w-4 h-4" /> Thêm lịch
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
                                <div className="overflow-x-auto" style={{ maxHeight: 'calc(100vh - 420px)' }}>
                                    <table className="w-full text-sm min-w-[800px]">
                                        <thead className="sticky top-0 z-10 bg-gradient-to-r from-blue-600 to-blue-700 text-white">
                                            <tr>
                                                <th className="px-4 py-3 w-12">
                                                    <button onClick={toggleSelectAll} className="p-1 hover:bg-white/20 rounded">
                                                        {selectedIds.size === sortedFiltered.length && sortedFiltered.length > 0
                                                            ? <CheckSquare className="w-4 h-4" />
                                                            : <Square className="w-4 h-4" />
                                                        }
                                                    </button>
                                                </th>
                                                <th className="px-4 py-3 text-left font-semibold">Lớp HP</th>
                                                <th className="px-4 py-3 text-left font-semibold">Môn học</th>
                                                <th className="px-4 py-3 text-left font-semibold">Phòng</th>
                                                <th className="px-4 py-3 text-left font-semibold">Ngày học</th>
                                                <th className="px-4 py-3 text-left font-semibold">Giờ học</th>
                                                <th className="px-4 py-3 text-center font-semibold">Thao tác</th>
                                            </tr>
                                        </thead>
                                        <tbody className="divide-y divide-slate-100">
                                            {sortedFiltered.map((item) => {
                                                const lhp = item.lopHocPhan;
                                                const isSelected = selectedIds.has(item.id);
                                                return (
                                                    <tr key={item.id} className={`transition-colors hover:bg-blue-50/60 ${isSelected ? 'bg-blue-50' : ''}`}>
                                                        <td className="px-4 py-3">
                                                            <button onClick={() => toggleSelect(item.id)} className="p-1 hover:bg-blue-100 rounded">
                                                                {isSelected
                                                                    ? <CheckSquare className="w-4 h-4 text-blue-600" />
                                                                    : <Square className="w-4 h-4 text-slate-400" />
                                                                }
                                                            </button>
                                                        </td>
                                                        <td className="px-4 py-3 font-semibold text-blue-600">{lhp?.maLopHocPhan || '-'}</td>
                                                        <td className="px-4 py-3 text-slate-700">{lhp?.tenMonHoc || '-'}</td>
                                                        <td className="px-4 py-3">
                                                            <div className="flex items-center gap-2">
                                                                <MapPin className="w-4 h-4 text-orange-500" />
                                                                <span>{item.phong?.maPhong || '-'}</span>
                                                            </div>
                                                        </td>
                                                        <td className="px-4 py-3">
                                                            <div className="flex items-center gap-2">
                                                                <CalendarDays className="w-4 h-4 text-blue-500" />
                                                                <span className="font-medium">{formatShortDate(item.ngayHoc)}</span>
                                                            </div>
                                                        </td>
                                                        <td className="px-4 py-3">
                                                            <div className="flex items-center gap-2">
                                                                <Clock className="w-4 h-4 text-slate-400" />
                                                                <span>{getGioHocLabel(item)}</span>
                                                            </div>
                                                        </td>
                                                        <td className="px-4 py-3">
                                                            <div className="flex items-center justify-center gap-1">
                                                                <button onClick={() => handleViewDetail(item)} className="p-1.5 text-blue-600 hover:bg-blue-100 rounded-lg" title="Xem chi tiết">
                                                                    <Eye className="w-4 h-4" />
                                                                </button>
                                                                <button onClick={() => openEdit(item)} className="p-1.5 text-green-600 hover:bg-green-100 rounded-lg" title="Sửa">
                                                                    <Edit className="w-4 h-4" />
                                                                </button>
                                                                <button onClick={() => handleDelete(item)} className="p-1.5 text-red-500 hover:bg-red-100 rounded-lg" title="Xóa">
                                                                    <Trash2 className="w-4 h-4" />
                                                                </button>
                                                            </div>
                                                        </td>
                                                    </tr>
                                                );
                                            })}
                                            {sortedFiltered.length === 0 && (
                                                <tr>
                                                    <td colSpan={7} className="py-16 text-center">
                                                        <div className="flex flex-col items-center gap-2">
                                                            <div className="rounded-full bg-slate-100 p-4"><Calendar className="w-8 h-8 text-slate-400" /></div>
                                                            <p className="font-medium text-slate-600">Không có lịch học nào</p>
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
                        {!loading && sortedSchedules.length > 0 && (
                            <div className="flex items-center justify-between text-xs text-slate-500 px-1">
                                <span>Hiển thị <b>{sortedFiltered.length}</b> / <b>{sortedSchedules.length}</b> lịch học</span>
                                {selectedIds.size > 0 && <span>Đã chọn <b className="text-blue-600">{selectedIds.size}</b></span>}
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {/* Add Modal */}
            {isAddOpen && (
                <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-50 p-4" onClick={() => setIsAddOpen(false)}>
                    <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full overflow-hidden animate-in fade-in zoom-in-95 duration-200" onClick={e => e.stopPropagation()}>
                        {/* Header */}
                        <div className="bg-gradient-to-r from-blue-600 to-blue-700 px-6 py-5 flex items-center justify-between">
                            <div className="flex items-center gap-3">
                                <div className="w-10 h-10 bg-white/20 rounded-xl flex items-center justify-center">
                                    <Plus className="w-5 h-5 text-white" />
                                </div>
                                <div>
                                    <h2 className="text-base font-bold text-white">Thêm Lịch Học</h2>
                                    <p className="text-xs text-blue-200 mt-0.5">Nhập thông tin lịch học mới</p>
                                </div>
                            </div>
                            <button onClick={() => setIsAddOpen(false)} className="p-2 hover:bg-white/20 rounded-xl transition-colors">
                                <X className="w-5 h-5 text-white" />
                            </button>
                        </div>

                        {/* Form */}
                        <form className="p-6 space-y-5" onSubmit={handleCreate}>
                            {/* Lớp HP - full width */}
                            <div>
                                <label className="flex items-center gap-2 text-sm font-semibold text-slate-700 mb-2">
                                    <BookOpen className="w-4 h-4 text-blue-500" />
                                    Lớp học phần <span className="text-red-500">*</span>
                                </label>
                                <select
                                    value={lichForm.lopHocPhanId}
                                    onChange={(e) => setLichForm({ ...lichForm, lopHocPhanId: e.target.value })}
                                    className="w-full px-4 py-3 border-2 border-slate-200 rounded-xl text-sm focus:outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-50 transition-all bg-slate-50 hover:border-slate-300 cursor-pointer"
                                >
                                    <option value="">-- Chọn lớp học phần --</option>
                                    {lopHocPhans.map(lhp => (
                                        <option key={lhp.id} value={lhp.id}>{lhp.maLopHocPhan} — {lhp.tenMonHoc}</option>
                                    ))}
                                </select>
                            </div>

                            {/* Phòng + Ngày */}
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="flex items-center gap-2 text-sm font-semibold text-slate-700 mb-2">
                                        <MapPin className="w-4 h-4 text-orange-500" />
                                        Phòng học <span className="text-red-500">*</span>
                                    </label>
                                    <select
                                        value={lichForm.phongId}
                                        onChange={(e) => setLichForm({ ...lichForm, phongId: e.target.value })}
                                        className="w-full px-4 py-3 border-2 border-slate-200 rounded-xl text-sm focus:outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-50 transition-all bg-slate-50 hover:border-slate-300 cursor-pointer"
                                    >
                                        <option value="">-- Phòng --</option>
                                        {phongs.map(p => (
                                            <option key={p.id} value={p.id}>{p.maPhong} — {p.tenPhong}</option>
                                        ))}
                                    </select>
                                </div>
                                <div>
                                    <label className="flex items-center gap-2 text-sm font-semibold text-slate-700 mb-2">
                                        <CalendarDays className="w-4 h-4 text-purple-500" />
                                        Ngày học <span className="text-red-500">*</span>
                                    </label>
                                    <input
                                        type="date"
                                        value={lichForm.ngayHoc}
                                        onChange={(e) => setLichForm({ ...lichForm, ngayHoc: e.target.value })}
                                        className="w-full px-4 py-3 border-2 border-slate-200 rounded-xl text-sm focus:outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-50 transition-all bg-slate-50 hover:border-slate-300"
                                    />
                                </div>
                            </div>

                            {/* Giờ học */}
                            <div>
                                <label className="flex items-center gap-2 text-sm font-semibold text-slate-700 mb-2">
                                    <Clock className="w-4 h-4 text-green-500" />
                                    Giờ học <span className="text-red-500">*</span>
                                </label>
                                <select
                                    value={lichForm.gioHocId}
                                    onChange={(e) => setLichForm({ ...lichForm, gioHocId: e.target.value })}
                                    className="w-full px-4 py-3 border-2 border-slate-200 rounded-xl text-sm focus:outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-50 transition-all bg-slate-50 hover:border-slate-300 cursor-pointer"
                                >
                                    <option value="">-- Chọn giờ học --</option>
                                    {gioHocs.map(gh => (
                                        <option key={gh.id} value={gh.id}>{gh.thoiGianBatDau?.substring(0,5)} — {gh.thoiGianKetThuc?.substring(0,5)}</option>
                                    ))}
                                </select>
                            </div>

                            {/* Actions */}
                            <div className="flex gap-3 pt-3">
                                <button type="button" onClick={() => setIsAddOpen(false)} className="flex-1 py-3 border-2 border-slate-200 rounded-xl text-sm font-semibold text-slate-600 hover:bg-slate-50 hover:border-slate-300 transition-all">
                                    Hủy bỏ
                                </button>
                                <button type="submit" disabled={isSubmitting} className="flex-1 py-3 bg-blue-600 text-white rounded-xl text-sm font-semibold hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-lg shadow-blue-200 active:scale-95">
                                    {isSubmitting ? (
                                        <span className="flex items-center justify-center gap-2">
                                            <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                                            Đang thêm...
                                        </span>
                                    ) : 'Thêm lịch'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* Edit Modal */}
            {isEditOpen && selectedItem && (
                <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-50 p-4" onClick={() => setIsEditOpen(false)}>
                    <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full overflow-hidden animate-in fade-in zoom-in-95 duration-200" onClick={e => e.stopPropagation()}>
                        {/* Header */}
                        <div className="bg-gradient-to-r from-green-600 to-green-700 px-6 py-5 flex items-center justify-between">
                            <div className="flex items-center gap-3">
                                <div className="w-10 h-10 bg-white/20 rounded-xl flex items-center justify-center">
                                    <Edit className="w-5 h-5 text-white" />
                                </div>
                                <div>
                                    <h2 className="text-base font-bold text-white">Sửa Lịch Học</h2>
                                    <p className="text-xs text-green-200 mt-0.5">Cập nhật thông tin lịch học</p>
                                </div>
                            </div>
                            <button onClick={() => setIsEditOpen(false)} className="p-2 hover:bg-white/20 rounded-xl transition-colors">
                                <X className="w-5 h-5 text-white" />
                            </button>
                        </div>

                        {/* Form */}
                        <form className="p-6 space-y-5" onSubmit={handleUpdate}>
                            {/* Lớp HP */}
                            <div>
                                <label className="flex items-center gap-2 text-sm font-semibold text-slate-700 mb-2">
                                    <BookOpen className="w-4 h-4 text-blue-500" />
                                    Lớp học phần <span className="text-red-500">*</span>
                                </label>
                                <select
                                    value={lichForm.lopHocPhanId}
                                    onChange={(e) => setLichForm({ ...lichForm, lopHocPhanId: e.target.value })}
                                    className="w-full px-4 py-3 border-2 border-slate-200 rounded-xl text-sm focus:outline-none focus:border-green-500 focus:ring-4 focus:ring-green-50 transition-all bg-slate-50 hover:border-slate-300 cursor-pointer"
                                >
                                    {lopHocPhans.map(lhp => (
                                        <option key={lhp.id} value={lhp.id}>{lhp.maLopHocPhan} — {lhp.tenMonHoc}</option>
                                    ))}
                                </select>
                            </div>

                            {/* Phòng + Ngày */}
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="flex items-center gap-2 text-sm font-semibold text-slate-700 mb-2">
                                        <MapPin className="w-4 h-4 text-orange-500" />
                                        Phòng học <span className="text-red-500">*</span>
                                    </label>
                                    <select
                                        value={lichForm.phongId}
                                        onChange={(e) => setLichForm({ ...lichForm, phongId: e.target.value })}
                                        className="w-full px-4 py-3 border-2 border-slate-200 rounded-xl text-sm focus:outline-none focus:border-green-500 focus:ring-4 focus:ring-green-50 transition-all bg-slate-50 hover:border-slate-300 cursor-pointer"
                                    >
                                        {phongs.map(p => (
                                            <option key={p.id} value={p.id}>{p.maPhong} — {p.tenPhong}</option>
                                        ))}
                                    </select>
                                </div>
                                <div>
                                    <label className="flex items-center gap-2 text-sm font-semibold text-slate-700 mb-2">
                                        <CalendarDays className="w-4 h-4 text-purple-500" />
                                        Ngày học <span className="text-red-500">*</span>
                                    </label>
                                    <input
                                        type="date"
                                        value={lichForm.ngayHoc}
                                        onChange={(e) => setLichForm({ ...lichForm, ngayHoc: e.target.value })}
                                        className="w-full px-4 py-3 border-2 border-slate-200 rounded-xl text-sm focus:outline-none focus:border-green-500 focus:ring-4 focus:ring-green-50 transition-all bg-slate-50 hover:border-slate-300"
                                    />
                                </div>
                            </div>

                            {/* Giờ học */}
                            <div>
                                <label className="flex items-center gap-2 text-sm font-semibold text-slate-700 mb-2">
                                    <Clock className="w-4 h-4 text-green-500" />
                                    Giờ học <span className="text-red-500">*</span>
                                </label>
                                <select
                                    value={lichForm.gioHocId}
                                    onChange={(e) => setLichForm({ ...lichForm, gioHocId: e.target.value })}
                                    className="w-full px-4 py-3 border-2 border-slate-200 rounded-xl text-sm focus:outline-none focus:border-green-500 focus:ring-4 focus:ring-green-50 transition-all bg-slate-50 hover:border-slate-300 cursor-pointer"
                                >
                                    <option value="">-- Chọn giờ học --</option>
                                    {gioHocs.map(gh => (
                                        <option key={gh.id} value={gh.id}>{gh.thoiGianBatDau?.substring(0,5)} — {gh.thoiGianKetThuc?.substring(0,5)}</option>
                                    ))}
                                </select>
                            </div>

                            {/* Actions */}
                            <div className="flex gap-3 pt-3">
                                <button type="button" onClick={() => setIsEditOpen(false)} className="flex-1 py-3 border-2 border-slate-200 rounded-xl text-sm font-semibold text-slate-600 hover:bg-slate-50 hover:border-slate-300 transition-all">
                                    Hủy bỏ
                                </button>
                                <button type="submit" disabled={isSubmitting} className="flex-1 py-3 bg-green-600 text-white rounded-xl text-sm font-semibold hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-lg shadow-green-200 active:scale-95">
                                    {isSubmitting ? (
                                        <span className="flex items-center justify-center gap-2">
                                            <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                                            Đang lưu...
                                        </span>
                                    ) : 'Lưu thay đổi'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* Detail Modal */}
            {isDetailOpen && selectedItem && (
                <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-50 p-4" onClick={() => setIsDetailOpen(false)}>
                    <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full overflow-hidden animate-in fade-in zoom-in-95 duration-200" onClick={e => e.stopPropagation()}>
                        {/* Header */}
                        <div className="bg-gradient-to-r from-slate-700 to-slate-800 px-6 py-5 flex items-center justify-between">
                            <div className="flex items-center gap-3">
                                <div className="w-10 h-10 bg-white/20 rounded-xl flex items-center justify-center">
                                    <Calendar className="w-5 h-5 text-white" />
                                </div>
                                <div>
                                    <h2 className="text-base font-bold text-white">Chi Tiết Lịch Học</h2>
                                    <p className="text-xs text-slate-300 mt-0.5">Thông tin chi tiết lịch học</p>
                                </div>
                            </div>
                            <button onClick={() => setIsDetailOpen(false)} className="p-2 hover:bg-white/20 rounded-xl transition-colors">
                                <X className="w-5 h-5 text-white" />
                            </button>
                        </div>

                        {/* Info */}
                        <div className="p-6 space-y-3">
                            {[
                                { icon: <BookOpen className="w-4 h-4" />, color: 'text-blue-500 bg-blue-50', label: 'Lớp HP', value: selectedItem.lopHocPhan?.maLopHocPhan || '—', sub: selectedItem.lopHocPhan?.tenMonHoc },
                                { icon: <MapPin className="w-4 h-4" />, color: 'text-orange-500 bg-orange-50', label: 'Phòng học', value: selectedItem.phong?.maPhong || '—', sub: selectedItem.phong?.tenPhong },
                                { icon: <CalendarDays className="w-4 h-4" />, color: 'text-purple-500 bg-purple-50', label: 'Ngày học', value: formatDate(selectedItem.ngayHoc) },
                                { icon: <Clock className="w-4 h-4" />, color: 'text-green-500 bg-green-50', label: 'Giờ học', value: getGioHocLabel(selectedItem) },
                            ].map((item, i) => (
                                <div key={i} className="flex items-start gap-4 p-4 bg-slate-50 rounded-xl hover:bg-slate-100 transition-colors">
                                    <div className={`w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 ${item.color}`}>
                                        {item.icon}
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <p className="text-xs text-slate-500 mb-0.5">{item.label}</p>
                                        <p className="font-semibold text-slate-800 truncate">{item.value}</p>
                                        {item.sub && <p className="text-xs text-slate-500 mt-0.5 truncate">{item.sub}</p>}
                                    </div>
                                </div>
                            ))}
                            {selectedItem.ghiChu && (
                                <div className="flex items-start gap-4 p-4 bg-amber-50 rounded-xl">
                                    <div className="w-10 h-10 rounded-xl flex items-center justify-center bg-amber-100 flex-shrink-0">
                                        <AlertCircle className="w-4 h-4 text-amber-600" />
                                    </div>
                                    <div className="flex-1">
                                        <p className="text-xs text-amber-600 mb-0.5">Ghi chú</p>
                                        <p className="font-medium text-slate-700">{selectedItem.ghiChu}</p>
                                    </div>
                                </div>
                            )}
                        </div>

                        {/* Actions */}
                        <div className="flex gap-3 px-6 pb-6">
                            <button onClick={() => { setIsDetailOpen(false); openEdit(selectedItem); }} className="flex-1 py-3 bg-green-600 text-white rounded-xl text-sm font-semibold hover:bg-green-700 transition-all shadow-lg shadow-green-200 active:scale-95 flex items-center justify-center gap-2">
                                <Edit className="w-4 h-4" /> Sửa
                            </button>
                            <button onClick={() => { setIsDetailOpen(false); handleDelete(selectedItem); }} className="flex-1 py-3 bg-red-600 text-white rounded-xl text-sm font-semibold hover:bg-red-700 transition-all shadow-lg shadow-red-200 active:scale-95 flex items-center justify-center gap-2">
                                <Trash2 className="w-4 h-4" /> Xóa
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Delete Confirmation Modal */}
            {isDeleteModalOpen && (
                <div className="fixed inset-0 bg-black/30 flex items-center justify-center z-50 p-4" onClick={() => !isDeleting && setIsDeleteModalOpen(false)}>
                    <div className="bg-white rounded-2xl shadow-2xl max-w-sm w-full p-6" onClick={e => e.stopPropagation()}>
                        <div className="flex items-center gap-3 mb-4">
                            <div className="rounded-full bg-red-100 p-3 flex-shrink-0"><AlertCircle className="w-6 h-6 text-red-600" /></div>
                            <h3 className="font-bold text-slate-900">Xác nhận xóa {selectedIds.size > 1 ? `${selectedIds.size} lịch` : 'lịch'}</h3>
                        </div>
                        <p className="text-sm text-slate-600 mb-4">Bạn có chắc muốn xóa <b>{selectedIds.size}</b> lịch học đã chọn?</p>
                        <div className="flex gap-3">
                            <button onClick={() => setIsDeleteModalOpen(false)} disabled={isDeleting} className="flex-1 py-2.5 border border-slate-300 rounded-xl text-sm font-medium text-slate-700 hover:bg-slate-50 disabled:opacity-50">Hủy</button>
                            <button onClick={confirmDelete} disabled={isDeleting} className="flex-1 py-2.5 bg-red-600 text-white rounded-xl text-sm font-medium hover:bg-red-700 disabled:opacity-50">
                                {isDeleting ? 'Đang xóa...' : 'Xóa'}
                            </button>
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
