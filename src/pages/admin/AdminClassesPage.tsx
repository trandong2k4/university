import { useState, useEffect } from 'react';
import { AdminSidebar } from '@/components/layouts/AdminSidebar';
import { AdminHeader } from '@/components/layouts/AdminHeader';
import {
    Users, Search, Plus, Trash2, X, AlertCircle, CheckCircle, Eye, Clock, MapPin,
    Edit, RefreshCw, CheckSquare, Square, Calendar, BookOpen, CalendarDays,
    BarChart2, GripVertical
} from 'lucide-react';
import * as lopHocPhanApi from '@/api/admin/lop-hoc-phan.api';
import * as lichApi from '@/api/admin/lich.api';
import * as hocKiApi from '@/api/admin/hocki.api';
import * as monHocApi from '@/api/admin/monhoc.api';
import * as phongApi from '@/api/admin/phong.api';
import * as gioHocApi from '@/api/admin/giohoc.api';
import * as cotDiemApi from '@/api/admin/cot-diem.api';
import type { LopHocPhanItem, CreateLopHocPhanRequest } from '@/api/admin/lop-hoc-phan.api';
import type { LichItem, CreateLichRequest } from '@/api/admin/lich.api';
import type { CotDiemItem, CreateCotDiemRequest, CotDiemLoai } from '@/api/admin/cot-diem.api';
import { COT_DIEM_LOAI_LABEL } from '@/api/admin/cot-diem.api';

interface Toast {
    id: string;
    message: string;
    type: 'success' | 'error' | 'info';
}

interface HocKiItem {
    id: string;
    maHocKi: string;
    tenHocKi: string;
}

interface MonHocItem {
    id: string;
    maMonHoc: string;
    tenMonHoc: string;
    soTinChi: number;
}

interface PhongItem {
    id: string;
    maPhong: string;
    tenPhong: string;
}

interface GioHocItem {
    id: string;
    maGioHoc: string;
    gioBatDau: string;
    gioKetThuc: string;
}

const extractError = (err: unknown, fallback: string): string => {
    if (err && typeof err === 'object') {
        const e = err as { response?: { data?: { detail?: string; message?: string } } };
        return e.response?.data?.detail || e.response?.data?.message || fallback;
    }
    return fallback;
};

export default function AdminClassesPage() {
    const [classes, setClasses] = useState<LopHocPhanItem[]>([]);
    const [loading, setLoading] = useState(false);
    const [toasts, setToasts] = useState<Toast[]>([]);
    const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
    const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
    const [isDeleting, setIsDeleting] = useState(false);

    // Visual feedback (thay thế success toast)
    const [flashClassId, setFlashClassId] = useState<string | null>(null);
    const [confirmDeleteClassId, setConfirmDeleteClassId] = useState<string | null>(null);
    const [deletingClassId, setDeletingClassId] = useState<string | null>(null);

    // Filters
    const [search, setSearch] = useState('');
    const [selectedHocKiId, setSelectedHocKiId] = useState<string>('');

    // Dropdowns data
    const [hocKis, setHocKis] = useState<HocKiItem[]>([]);
    const [monHocs, setMonHocs] = useState<MonHocItem[]>([]);
    const [phongs, setPhongs] = useState<PhongItem[]>([]);
    const [gioHocs, setGioHocs] = useState<GioHocItem[]>([]);

    // Modals
    const [isAddClassOpen, setIsAddClassOpen] = useState(false);
    const [isEditClassOpen, setIsEditClassOpen] = useState(false);
    const [isDetailOpen, setIsDetailOpen] = useState(false);
    const [selectedClass, setSelectedClass] = useState<LopHocPhanItem | null>(null);
    const [classSchedules, setClassSchedules] = useState<LichItem[]>([]);
    const [isSubmitting, setIsSubmitting] = useState(false);

    // Lịch học inline UI state
    const [isInlineLichFormOpen, setIsInlineLichFormOpen] = useState(false);
    const [confirmDeleteLichId, setConfirmDeleteLichId] = useState<string | null>(null);
    const [flashLichId, setFlashLichId] = useState<string | null>(null);

    // Detail tabs
    const [detailTab, setDetailTab] = useState<'info' | 'lich' | 'cotdiem'>('info');

    // Cột điểm state
    const [cotDiems, setCotDiems] = useState<CotDiemItem[]>([]);
    const [isAddCotDiemOpen, setIsAddCotDiemOpen] = useState(false);
    const [isEditCotDiemOpen, setIsEditCotDiemOpen] = useState(false);
    const [selectedCotDiem, setSelectedCotDiem] = useState<CotDiemItem | null>(null);
    const [cotDiemForm, setCotDiemForm] = useState<CreateCotDiemRequest>({
        tenCotDiem: '',
        tiTrong: '',
        loai: 'THI_CUOI_KY',
        thuTuHienThi: 1,
        lopHocPhanId: ''
    });

    // Forms
    const [classForm, setClassForm] = useState<CreateLopHocPhanRequest>({
        maLopHocPhan: '',
        soLuongToiDa: 40,
        trangThai: 'MO_DANG_KY',
        hanDangKy: '',
        hanHuy: '',
        hocKiId: '',
        monHocId: ''
    });

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

    const fetchClasses = async () => {
        try {
            setLoading(true);
            const data = await lopHocPhanApi.getLopHocPhan();
            setClasses(data || []);
        } catch (err) {
            addToast(extractError(err, 'Lỗi khi tải dữ liệu'), 'error');
        } finally {
            setLoading(false);
        }
    };

    const fetchDropdownData = async () => {
        try {
            const [hk, mh, p, gh] = await Promise.all([
                hocKiApi.getAllHocKi(),
                monHocApi.getAllMonHoc(),
                phongApi.getAllPhong(),
                gioHocApi.getAllGioHoc()
            ]);
            setHocKis(hk || []);
            setMonHocs(mh || []);
            setPhongs(p || []);
            setGioHocs(gh || []);
        } catch (err) {
            console.error('Lỗi khi tải dữ liệu dropdown:', err);
        }
    };

    useEffect(() => {
        fetchClasses();
        fetchDropdownData();
    }, []);

    const filtered = classes.filter(item => {
        const matchSearch = !search ||
            item.maLopHocPhan.toLowerCase().includes(search.toLowerCase()) ||
            item.tenMonHoc.toLowerCase().includes(search.toLowerCase());
        const matchHocKi = !selectedHocKiId || item.hocKiId === selectedHocKiId;
        return matchSearch && matchHocKi;
    });

    const toggleSelectAll = () => {
        if (selectedIds.size === filtered.length) {
            setSelectedIds(new Set());
        } else {
            setSelectedIds(new Set(filtered.map(c => c.id)));
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
            await lopHocPhanApi.deleteLopHocPhanList(Array.from(selectedIds));
            setSelectedIds(new Set());
            setIsDeleteModalOpen(false);
            await fetchClasses();
        } catch (err: any) {
            addToast(extractError(err, 'Lỗi khi xóa'), 'error');
        } finally {
            setIsDeleting(false);
        }
    };

    const openAddClass = () => {
        setClassForm({
            maLopHocPhan: '',
            soLuongToiDa: 40,
            trangThai: 'MO_DANG_KY',
            hanDangKy: '',
            hanHuy: '',
            hocKiId: hocKis[0]?.id || '',
            monHocId: monHocs[0]?.id || ''
        });
        setIsAddClassOpen(true);
    };

    const openEditClass = (item: LopHocPhanItem) => {
        setSelectedClass(item);
        // Convert backend date → datetime-local input format "yyyy-MM-ddTHH:mm"
        const toInput = (d: string) => {
        if (!d) return '';
        // Backend format: "dd/MM/yyyy HH:mm:ss" → input format: "yyyy-MM-ddTHH:mm"
        const ddMmYyyy = /^(\d{2})\/(\d{2})\/(\d{4})\s+(\d{2}:\d{2}):\d{2}$/;
        const m = d.match(ddMmYyyy);
        if (m) {
            return `${m[3]}-${m[2]}-${m[1]}T${m[4]}`;
        }
        // Already ISO format: "yyyy-MM-ddTHH:mm:ss" or "yyyy-MM-dd HH:mm:ss"
        const normalized = d.replace(' ', 'T');
        return normalized.substring(0, 16);
    };
        setClassForm({
            maLopHocPhan: item.maLopHocPhan,
            soLuongToiDa: item.soLuongToiDa,
            trangThai: item.trangThai,
            hanDangKy: toInput(item.hanDangKy),
            hanHuy: toInput(item.hanHuy),
            hocKiId: item.hocKiId,
            monHocId: item.monHocId
        });
        setIsEditClassOpen(true);
    };

    const formatDisplayDate = (d: string) => {
        if (!d) return '-';
        // Backend format: "dd/MM/yyyy HH:mm:ss" or ISO "yyyy-MM-ddTHH:mm:ss"
        const ddMmYyyy = /^(\d{2})\/(\d{2})\/(\d{4})/.exec(d);
        if (ddMmYyyy) {
            const day = ddMmYyyy[1];
            const month = ddMmYyyy[2];
            const year = ddMmYyyy[3];
            return `${day}/${month}/${year}`;
        }
        try {
            const parsed = new Date(d);
            if (isNaN(parsed.getTime())) return '-';
            return parsed.toLocaleDateString('vi-VN', { day: '2-digit', month: '2-digit', year: 'numeric' });
        } catch {
            return '-';
        }
    };

    // Convert datetime-local value "yyyy-MM-ddTHH:mm" → ISO backend format "yyyy-MM-ddTHH:mm:ss"
    const toBackendDateTime = (iso: string): string => {
        if (!iso) return '';
        if (iso.length === 16) return `${iso}:00`;
        return iso;
    };

    const handleCreateClass = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!classForm.maLopHocPhan.trim()) { addToast('Vui lòng nhập mã lớp học phần', 'error'); return; }
        if (!classForm.hocKiId || !classForm.monHocId) { addToast('Vui lòng chọn học kỳ và môn học', 'error'); return; }
        try {
            setIsSubmitting(true);
            const created = await lopHocPhanApi.createLopHocPhan({
                ...classForm,
                hanDangKy: toBackendDateTime(classForm.hanDangKy),
                hanHuy: toBackendDateTime(classForm.hanHuy)
            });
            setIsAddClassOpen(false);
            await fetchClasses();
            setFlashClassId(created.id);
            setTimeout(() => setFlashClassId(null), 2500);
        } catch (err: any) {
            addToast(extractError(err, 'Lỗi khi tạo lớp học phần'), 'error');
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleUpdateClass = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!selectedClass) return;
        try {
            setIsSubmitting(true);
            await lopHocPhanApi.updateLopHocPhan(selectedClass.id, {
                ...classForm,
                hanDangKy: toBackendDateTime(classForm.hanDangKy),
                hanHuy: toBackendDateTime(classForm.hanHuy)
            });
            const targetId = selectedClass.id;
            setIsEditClassOpen(false);
            await fetchClasses();
            setFlashClassId(targetId);
            setTimeout(() => setFlashClassId(null), 2500);
        } catch (err: any) {
            addToast(extractError(err, 'Lỗi khi cập nhật'), 'error');
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleDeleteClass = (item: LopHocPhanItem) => {
        setConfirmDeleteClassId(item.id);
    };

    const handleDeleteSingleClass = async (id: string) => {
        setDeletingClassId(id);
        setConfirmDeleteClassId(null);
        try {
            await lopHocPhanApi.deleteLopHocPhanList([id]);
            await fetchClasses();
        } catch (err: any) {
            addToast(extractError(err, 'Lỗi khi xóa'), 'error');
        } finally {
            setDeletingClassId(null);
        }
    };

    const fetchCotDiem = async (lopHocPhanId: string) => {
        try {
            const data = await cotDiemApi.getCotDiemByLopHocPhan(lopHocPhanId);
            setCotDiems((data || []).sort((a, b) => (a.thuTuHienThi ?? 0) - (b.thuTuHienThi ?? 0)));
        } catch {
            setCotDiems([]);
        }
    };

    const handleViewDetail = async (item: LopHocPhanItem) => {
        setSelectedClass(item);
        setDetailTab('info');
        setIsDetailOpen(true);
        try {
            const [schedules] = await Promise.all([
                lichApi.getLichByLopHocPhan(item.id)
            ]);
            setClassSchedules(schedules || []);
        } catch (err) {
            setClassSchedules([]);
        }
        await fetchCotDiem(item.id);
    };

    const openAddCotDiem = () => {
        setCotDiemForm({
            tenCotDiem: '',
            tiTrong: '',
            loai: 'THI_CUOI_KY',
            thuTuHienThi: cotDiems.length + 1,
            lopHocPhanId: selectedClass?.id || ''
        });
        setIsAddCotDiemOpen(true);
    };

    const openEditCotDiem = (item: CotDiemItem) => {
        setSelectedCotDiem(item);
        setCotDiemForm({
            tenCotDiem: item.tenCotDiem,
            tiTrong: item.tiTrong,
            loai: item.loai,
            thuTuHienThi: item.thuTuHienThi,
            lopHocPhanId: item.lopHocPhanId
        });
        setIsEditCotDiemOpen(true);
    };

    const totalTiTrong = cotDiems.reduce((sum, c) => sum + (parseFloat(c.tiTrong) || 0), 0);

    const validateTiTrong = (newValue: string, excludeId?: string): boolean => {
        const currentTotal = cotDiems
            .filter(c => c.id !== excludeId)
            .reduce((sum, c) => sum + (parseFloat(c.tiTrong) || 0), 0);
        return currentTotal + (parseFloat(newValue) || 0) <= 100;
    };

    const handleCreateCotDiem = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!cotDiemForm.tenCotDiem.trim()) {
            addToast('Vui lòng nhập tên cột điểm', 'error');
            return;
        }
        const val = parseFloat(cotDiemForm.tiTrong);
        if (!cotDiemForm.tiTrong || isNaN(val) || val <= 0 || val > 100) {
            addToast('Tỉ trọng phải là số từ 1 đến 100', 'error');
            return;
        }
        if (!validateTiTrong(cotDiemForm.tiTrong)) {
            addToast(`Tổng tỉ trọng vượt quá 100%. Hiện tại còn ${(100 - totalTiTrong).toFixed(0)}% khả dụng`, 'error');
            return;
        }
        try {
            setIsSubmitting(true);
            await cotDiemApi.createCotDiem(cotDiemForm);
            addToast('Thêm cột điểm thành công!', 'success');
            setIsAddCotDiemOpen(false);
            await fetchCotDiem(selectedClass!.id);
        } catch (err: any) {
            addToast(extractError(err, 'Lỗi khi thêm cột điểm'), 'error');
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleUpdateCotDiem = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!selectedCotDiem) return;
        const val = parseFloat(cotDiemForm.tiTrong);
        if (!cotDiemForm.tiTrong || isNaN(val) || val <= 0 || val > 100) {
            addToast('Tỉ trọng phải là số từ 1 đến 100', 'error');
            return;
        }
        if (!validateTiTrong(cotDiemForm.tiTrong, selectedCotDiem.id)) {
            const remaining = 100 - cotDiems.filter(c => c.id !== selectedCotDiem.id).reduce((s, c) => s + (parseFloat(c.tiTrong) || 0), 0);
            addToast(`Tổng tỉ trọng vượt quá 100%. Còn ${remaining.toFixed(0)}% khả dụng`, 'error');
            return;
        }
        try {
            setIsSubmitting(true);
            await cotDiemApi.updateCotDiem(selectedCotDiem.id, cotDiemForm);
            addToast('Cập nhật cột điểm thành công!', 'success');
            setIsEditCotDiemOpen(false);
            await fetchCotDiem(selectedClass!.id);
        } catch (err: any) {
            addToast(extractError(err, 'Lỗi khi cập nhật cột điểm'), 'error');
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleDeleteCotDiem = async (item: CotDiemItem) => {
        if (!confirm(`Xóa cột điểm "${item.tenCotDiem}"?`)) return;
        try {
            await cotDiemApi.deleteCotDiem(item.id);
            addToast('Xóa cột điểm thành công!', 'success');
            await fetchCotDiem(selectedClass!.id);
        } catch (err: any) {
            addToast(extractError(err, 'Lỗi khi xóa cột điểm'), 'error');
        }
    };

    const openAddLich = () => {
        setLichForm({
            ngayHoc: '',
            gioHocId: gioHocs[0]?.id || '',
            phongId: phongs[0]?.id || '',
            lopHocPhanId: selectedClass?.id || ''
        });
        setIsInlineLichFormOpen(true);
    };

    const handleCreateLich = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!lichForm.ngayHoc || !lichForm.gioHocId || !lichForm.phongId) return;
        try {
            setIsSubmitting(true);
            const created = await lichApi.createLich({
                ...lichForm,
                ngayHoc: `${lichForm.ngayHoc}T00:00:00`
            });
            const schedules = await lichApi.getLichByLopHocPhan(selectedClass!.id);
            setClassSchedules(schedules || []);
            setIsInlineLichFormOpen(false);
            setFlashLichId(created.id);
            setTimeout(() => setFlashLichId(null), 2000);
        } catch (err: any) {
            addToast(extractError(err, 'Lỗi khi thêm lịch học'), 'error');
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleDeleteLich = async (lichId: string) => {
        try {
            await lichApi.deleteLich(lichId);
            setConfirmDeleteLichId(null);
            const schedules = await lichApi.getLichByLopHocPhan(selectedClass!.id);
            setClassSchedules(schedules || []);
        } catch (err: any) {
            addToast(extractError(err, 'Lỗi khi xóa lịch học'), 'error');
        }
    };

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'DANG_HOC': return 'bg-blue-100 text-blue-700';
            case 'DA_KET_THUC': return 'bg-gray-100 text-gray-700';
            default: return 'bg-green-100 text-green-700';
        }
    };

    const getStatusLabel = (status: string) => {
        switch (status) {
            case 'DANG_HOC': return 'Đang học';
            case 'DA_KET_THUC': return 'Đã kết thúc';
            default: return 'Mở đăng ký';
        }
    };

    const calculateFillPercent = (enrolled: number, capacity: number) =>
        Math.min(Math.round((enrolled / capacity) * 100), 100);

    const getStatusStripe = (status: string) => {
        switch (status) {
            case 'DANG_HOC': return 'bg-blue-500';
            case 'DA_KET_THUC': return 'bg-slate-400';
            default: return 'bg-emerald-500';
        }
    };

    const getFillColor = (pct: number) =>
        pct >= 100 ? 'bg-red-500' : pct >= 80 ? 'bg-amber-400' : 'bg-emerald-500';

    return (
        <div className="flex h-screen bg-slate-50">
            <AdminSidebar activeMenu="classes" />
            <div className="flex-1 ml-64 flex flex-col overflow-hidden">
                <AdminHeader title="Lớp Học Phần & Lịch Học" />
                <div className="flex-1 overflow-auto">
                    <div className="p-6 max-w-7xl mx-auto space-y-5">

                        {/* Stats */}
                        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                            {[
                                { icon: BookOpen, bg: 'bg-blue-50', textColor: 'text-blue-600', val: classes.length, label: 'Tổng lớp HP' },
                                { icon: CheckCircle, bg: 'bg-emerald-50', textColor: 'text-emerald-600', val: classes.filter(c => c.trangThai === 'MO_DANG_KY').length, label: 'Mở đăng ký' },
                                { icon: Users, bg: 'bg-purple-50', textColor: 'text-purple-600', val: classes.filter(c => c.trangThai === 'DANG_HOC').length, label: 'Đang học' },
                                { icon: CalendarDays, bg: 'bg-slate-100', textColor: 'text-slate-500', val: classes.filter(c => c.trangThai === 'DA_KET_THUC').length, label: 'Đã kết thúc' },
                            ].map((s, i) => (
                                <div key={i} className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm hover:shadow-md transition-all hover:border-slate-300">
                                    <div className="flex items-start justify-between">
                                        <div>
                                            <p className={`text-2xl font-bold ${s.textColor}`}>{s.val}</p>
                                            <p className="text-xs text-slate-500 mt-1 font-medium">{s.label}</p>
                                        </div>
                                        <div className={`w-10 h-10 rounded-xl ${s.bg} flex items-center justify-center`}>
                                            <s.icon className={`w-5 h-5 ${s.textColor}`} />
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>

                        {/* Toolbar */}
                        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm px-5 py-4 flex flex-wrap gap-3 items-center justify-between">
                            <div className="flex flex-wrap items-center gap-3 flex-1">
                                <div className="relative min-w-[240px] max-w-xs">
                                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                                    <input
                                        type="text"
                                        placeholder="Tìm mã lớp hoặc môn học..."
                                        value={search}
                                        onChange={e => setSearch(e.target.value)}
                                        className="w-full pl-10 pr-4 py-2.5 text-sm border-2 border-slate-200 rounded-xl focus:outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-50 transition-all bg-slate-50 hover:border-slate-300"
                                    />
                                </div>
                                <select
                                    value={selectedHocKiId}
                                    onChange={e => setSelectedHocKiId(e.target.value)}
                                    className="py-2.5 px-4 border-2 border-slate-200 rounded-xl text-sm focus:outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-50 transition-all bg-slate-50 hover:border-slate-300 cursor-pointer"
                                >
                                    <option value="">Tất cả học kỳ</option>
                                    {hocKis.map(hk => <option key={hk.id} value={hk.id}>{hk.tenHocKi}</option>)}
                                </select>
                                {(search || selectedHocKiId) && (
                                    <button onClick={() => { setSearch(''); setSelectedHocKiId(''); }} className="flex items-center gap-1.5 text-xs font-medium text-slate-500 hover:text-red-500 px-3 py-2 border border-slate-200 rounded-xl bg-slate-50 hover:bg-red-50 transition-all">
                                        <X className="w-3.5 h-3.5" /> Xóa lọc
                                    </button>
                                )}
                            </div>
                            <div className="flex items-center gap-3">
                                <button onClick={fetchClasses} title="Làm mới" className="p-2.5 border-2 border-slate-200 rounded-xl text-slate-500 hover:bg-blue-50 hover:border-blue-300 hover:text-blue-600 transition-all">
                                    <RefreshCw className="w-4 h-4" />
                                </button>
                                {selectedIds.size > 0 && (
                                    <button onClick={handleDeleteSelected} className="flex items-center gap-2 px-4 py-2.5 bg-red-500 text-white rounded-xl hover:bg-red-600 text-sm font-semibold shadow-sm shadow-red-200 transition-all active:scale-95">
                                        <Trash2 className="w-4 h-4" /> Xóa {selectedIds.size}
                                    </button>
                                )}
                                <button onClick={openAddClass} className="flex items-center gap-2 px-5 py-2.5 bg-blue-600 text-white rounded-xl hover:bg-blue-700 text-sm font-semibold shadow-lg shadow-blue-200 transition-all active:scale-95">
                                    <Plus className="w-4 h-4" /> Thêm lớp HP
                                </button>
                            </div>
                        </div>

                        {/* Card Grid */}
                        {loading ? (
                            <div className="flex flex-col items-center justify-center h-64 gap-3">
                                <div className="w-10 h-10 border-4 border-slate-200 border-t-blue-600 rounded-full animate-spin" />
                                <p className="text-sm text-slate-500">Đang tải dữ liệu...</p>
                            </div>
                        ) : filtered.length === 0 ? (
                            <div className="flex flex-col items-center justify-center py-20 bg-white rounded-2xl border border-dashed border-slate-300">
                                <div className="w-16 h-16 rounded-2xl bg-slate-100 flex items-center justify-center mb-4">
                                    <BookOpen className="w-8 h-8 text-slate-400" />
                                </div>
                                <p className="text-base font-semibold text-slate-600">Không tìm thấy lớp học phần</p>
                                <p className="text-sm text-slate-400 mt-1">Thử thay đổi bộ lọc hoặc thêm lớp mới</p>
                            </div>
                        ) : (
                            <>
                                <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
                                    <div className="overflow-x-auto">
                                        <table className="w-full text-sm min-w-[900px]">
                                            <thead className="bg-slate-100 border-b border-slate-200">
                                                <tr>
                                                    <th className="px-4 py-3 w-10">
                                                        <button onClick={toggleSelectAll} className="p-1 rounded hover:bg-slate-200 transition-colors">
                                                            {selectedIds.size === filtered.length && filtered.length > 0
                                                                ? <CheckSquare className="w-4 h-4 text-blue-600" />
                                                                : <Square className="w-4 h-4 text-slate-400" />}
                                                        </button>
                                                    </th>
                                                    <th className="px-4 py-3 text-left text-xs font-semibold text-slate-600 uppercase tracking-wide">Mã LHP</th>
                                                    <th className="px-4 py-3 text-left text-xs font-semibold text-slate-600 uppercase tracking-wide">Môn học</th>
                                                    <th className="px-4 py-3 text-left text-xs font-semibold text-slate-600 uppercase tracking-wide">Học kỳ</th>
                                                    <th className="px-4 py-3 text-center text-xs font-semibold text-slate-600 uppercase tracking-wide">Sĩ số</th>
                                                    <th className="px-4 py-3 text-left text-xs font-semibold text-slate-600 uppercase tracking-wide">Hạn ĐK</th>
                                                    <th className="px-4 py-3 text-left text-xs font-semibold text-slate-600 uppercase tracking-wide">Hạn hủy</th>
                                                    <th className="px-4 py-3 text-center text-xs font-semibold text-slate-600 uppercase tracking-wide">Trạng thái</th>
                                                    <th className="px-4 py-3 text-center text-xs font-semibold text-slate-600 uppercase tracking-wide">Thao tác</th>
                                                </tr>
                                            </thead>
                                            <tbody className="divide-y divide-slate-100">
                                                {filtered.map(item => {
                                                    const pct = calculateFillPercent(item.soLuongDaDangKy, item.soLuongToiDa);
                                                    const isSelected = selectedIds.has(item.id);
                                                    const isFlashing = flashClassId === item.id;
                                                    const isConfirmingDelete = confirmDeleteClassId === item.id;
                                                    const isBeingDeleted = deletingClassId === item.id;

                                                    return (
                                                        <tr key={item.id} className={`transition-colors hover:bg-blue-50/60 group
                                                            ${isFlashing ? 'bg-emerald-50' : ''}
                                                            ${isConfirmingDelete ? 'bg-red-50' : ''}
                                                            ${isBeingDeleted ? 'opacity-40 pointer-events-none' : ''}
                                                            ${isSelected && !isFlashing && !isConfirmingDelete ? 'bg-blue-50' : ''}`}
                                                        >
                                                            <td className="px-4 py-3">
                                                                <button onClick={() => toggleSelect(item.id)} className="p-1 rounded hover:bg-blue-100 transition-colors">
                                                                    {isSelected
                                                                        ? <CheckSquare className="w-4 h-4 text-blue-600" />
                                                                        : <Square className="w-4 h-4 text-slate-400" />}
                                                                </button>
                                                            </td>
                                                            <td className="px-4 py-3">
                                                                <div className="flex items-center gap-2">
                                                                    <div className="w-8 h-8 rounded-lg bg-blue-50 flex items-center justify-center flex-shrink-0">
                                                                        <BookOpen className="w-4 h-4 text-blue-500" />
                                                                    </div>
                                                                    <div>
                                                                        <p className="font-bold text-blue-600">{item.maLopHocPhan}</p>
                                                                        <p className="text-xs text-slate-400">{item.maMonHoc}</p>
                                                                    </div>
                                                                </div>
                                                            </td>
                                                            <td className="px-4 py-3">
                                                                <p className="font-semibold text-slate-800">{item.tenMonHoc}</p>
                                                                <p className="text-xs text-slate-400">{item.soTinChi} tín chỉ</p>
                                                            </td>
                                                            <td className="px-4 py-3">
                                                                <span className="text-slate-700">{item.tenHocKi}</span>
                                                            </td>
                                                            <td className="px-4 py-3">
                                                                <div className="flex flex-col items-center gap-1">
                                                                    <span className={`text-sm font-bold tabular-nums ${pct >= 100 ? 'text-red-600' : pct >= 80 ? 'text-amber-600' : 'text-emerald-600'}`}>
                                                                        {item.soLuongDaDangKy}/{item.soLuongToiDa}
                                                                    </span>
                                                                    <div className="w-20 bg-slate-100 rounded-full h-1.5 overflow-hidden">
                                                                        <div className={`h-full rounded-full transition-all ${getFillColor(pct)}`} style={{ width: `${pct}%` }} />
                                                                    </div>
                                                                </div>
                                                            </td>
                                                            <td className="px-4 py-3">
                                                                <span className="text-sm text-amber-700 font-medium">{formatDisplayDate(item.hanDangKy)}</span>
                                                            </td>
                                                            <td className="px-4 py-3">
                                                                <span className="text-sm text-red-700 font-medium">{formatDisplayDate(item.hanHuy)}</span>
                                                            </td>
                                                            <td className="px-4 py-3 text-center">
                                                                <span className={`px-2.5 py-1 rounded-full text-xs font-semibold ${getStatusColor(item.trangThai)}`}>
                                                                    {getStatusLabel(item.trangThai)}
                                                                </span>
                                                            </td>
                                                            <td className="px-4 py-3">
                                                                <div className="flex items-center justify-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                                                    <button onClick={() => handleViewDetail(item)} title="Xem chi tiết" className="p-1.5 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors">
                                                                        <Eye className="w-4 h-4" />
                                                                    </button>
                                                                    <button onClick={() => openEditClass(item)} title="Sửa" className="p-1.5 text-slate-400 hover:text-emerald-600 hover:bg-emerald-50 rounded-lg transition-colors">
                                                                        <Edit className="w-4 h-4" />
                                                                    </button>
                                                                    <button onClick={() => handleDeleteClass(item)} title="Xóa" className="p-1.5 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors">
                                                                        <Trash2 className="w-4 h-4" />
                                                                    </button>
                                                                </div>
                                                            </td>
                                                        </tr>
                                                    );
                                                })}
                                                {filtered.length === 0 && (
                                                    <tr>
                                                        <td colSpan={9} className="py-16 text-center">
                                                            <div className="flex flex-col items-center gap-2">
                                                                <div className="w-14 h-14 rounded-2xl bg-slate-100 flex items-center justify-center">
                                                                    <BookOpen className="w-7 h-7 text-slate-400" />
                                                                </div>
                                                                <p className="font-semibold text-slate-600">Không tìm thấy lớp học phần</p>
                                                                <p className="text-sm text-slate-400">Thử thay đổi bộ lọc hoặc thêm lớp mới</p>
                                                            </div>
                                                        </td>
                                                    </tr>
                                                )}
                                            </tbody>
                                        </table>
                                    </div>
                                </div>

                                {/* Footer count */}
                                <div className="flex items-center justify-between text-xs text-slate-500 px-1">
                                    <span>Hiển thị <b>{filtered.length}</b> / <b>{classes.length}</b> lớp học phần</span>
                                    {selectedIds.size > 0 && (
                                        <span className="flex items-center gap-1">
                                            <CheckSquare className="w-3.5 h-3.5 text-blue-600" />
                                            Đã chọn <b className="text-blue-600 ml-1">{selectedIds.size}</b>
                                        </span>
                                    )}
                                </div>
                            </>
                        )}
                    </div>
                </div>
            </div>

            {/* Add Class Modal */}
            {isAddClassOpen && (
                <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-50 p-4" onClick={() => setIsAddClassOpen(false)}>
                    <div className="bg-white rounded-2xl shadow-2xl max-w-lg w-full overflow-hidden animate-in fade-in zoom-in-95 duration-200" onClick={e => e.stopPropagation()}>
                        <div className="bg-gradient-to-r from-blue-600 to-blue-700 px-6 py-5 flex items-center justify-between">
                            <div className="flex items-center gap-3">
                                <div className="w-10 h-10 bg-white/20 rounded-xl flex items-center justify-center">
                                    <Plus className="w-5 h-5 text-white" />
                                </div>
                                <div>
                                    <h2 className="text-base font-bold text-white">Thêm Lớp Học Phần</h2>
                                    <p className="text-xs text-blue-200 mt-0.5">Nhập thông tin lớp học phần mới</p>
                                </div>
                            </div>
                            <button onClick={() => setIsAddClassOpen(false)} className="p-2 hover:bg-white/20 rounded-xl transition-colors">
                                <X className="w-5 h-5 text-white" />
                            </button>
                        </div>
                        <form className="p-6 space-y-5" onSubmit={handleCreateClass}>
                            <div>
                                <label className="flex items-center gap-2 text-sm font-semibold text-slate-700 mb-2">
                                    <BookOpen className="w-4 h-4 text-blue-500" />
                                    Mã lớp HP <span className="text-red-500">*</span>
                                </label>
                                <input
                                    value={classForm.maLopHocPhan}
                                    onChange={(e) => setClassForm({ ...classForm, maLopHocPhan: e.target.value.toUpperCase() })}
                                    placeholder="VD: SE001"
                                    maxLength={10}
                                    className="w-full px-4 py-3 border-2 border-slate-200 rounded-xl text-sm focus:outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-50 transition-all bg-slate-50 hover:border-slate-300"
                                />
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="flex items-center gap-2 text-sm font-semibold text-slate-700 mb-2">
                                        <CalendarDays className="w-4 h-4 text-purple-500" />
                                        Học kỳ <span className="text-red-500">*</span>
                                    </label>
                                    <select
                                        value={classForm.hocKiId}
                                        onChange={(e) => setClassForm({ ...classForm, hocKiId: e.target.value })}
                                        className="w-full px-4 py-3 border-2 border-slate-200 rounded-xl text-sm focus:outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-50 transition-all bg-slate-50 hover:border-slate-300 cursor-pointer"
                                    >
                                        <option value="">-- Chọn HK --</option>
                                        {hocKis.map(hk => <option key={hk.id} value={hk.id}>{hk.tenHocKi}</option>)}
                                    </select>
                                </div>
                                <div>
                                    <label className="flex items-center gap-2 text-sm font-semibold text-slate-700 mb-2">
                                        <BookOpen className="w-4 h-4 text-blue-500" />
                                        Môn học <span className="text-red-500">*</span>
                                    </label>
                                    <select
                                        value={classForm.monHocId}
                                        onChange={(e) => setClassForm({ ...classForm, monHocId: e.target.value })}
                                        className="w-full px-4 py-3 border-2 border-slate-200 rounded-xl text-sm focus:outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-50 transition-all bg-slate-50 hover:border-slate-300 cursor-pointer"
                                    >
                                        <option value="">-- Chọn môn --</option>
                                        {monHocs.map(mh => <option key={mh.id} value={mh.id}>{mh.tenMonHoc}</option>)}
                                    </select>
                                </div>
                            </div>
                            <div>
                                <label className="flex items-center gap-2 text-sm font-semibold text-slate-700 mb-2">
                                    <Users className="w-4 h-4 text-purple-500" />
                                    Sĩ số tối đa
                                </label>
                                <input
                                    type="number"
                                    min="1"
                                    value={classForm.soLuongToiDa}
                                    onChange={(e) => setClassForm({ ...classForm, soLuongToiDa: parseInt(e.target.value) })}
                                    className="w-full px-4 py-3 border-2 border-slate-200 rounded-xl text-sm focus:outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-50 transition-all bg-slate-50 hover:border-slate-300"
                                />
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="flex items-center gap-2 text-sm font-semibold text-slate-700 mb-2">
                                        <Calendar className="w-4 h-4 text-amber-500" />
                                        Hạn đăng ký
                                    </label>
                                    <input
                                        type="datetime-local"
                                        value={classForm.hanDangKy}
                                        onChange={(e) => setClassForm({ ...classForm, hanDangKy: e.target.value })}
                                        className="w-full px-4 py-3 border-2 border-slate-200 rounded-xl text-sm focus:outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-50 transition-all bg-slate-50 hover:border-slate-300"
                                    />
                                </div>
                                <div>
                                    <label className="flex items-center gap-2 text-sm font-semibold text-slate-700 mb-2">
                                        <X className="w-4 h-4 text-red-500" />
                                        Hạn hủy đăng ký
                                    </label>
                                    <input
                                        type="datetime-local"
                                        value={classForm.hanHuy}
                                        onChange={(e) => setClassForm({ ...classForm, hanHuy: e.target.value })}
                                        className="w-full px-4 py-3 border-2 border-slate-200 rounded-xl text-sm focus:outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-50 transition-all bg-slate-50 hover:border-slate-300"
                                    />
                                </div>
                            </div>
                            <div className="flex gap-3 pt-3">
                                <button type="button" onClick={() => setIsAddClassOpen(false)} className="flex-1 py-3 border-2 border-slate-200 rounded-xl text-sm font-semibold text-slate-600 hover:bg-slate-50 hover:border-slate-300 transition-all">
                                    Hủy bỏ
                                </button>
                                <button type="submit" disabled={isSubmitting} className="flex-1 py-3 bg-blue-600 text-white rounded-xl text-sm font-semibold hover:bg-blue-700 disabled:opacity-50 transition-all shadow-lg shadow-blue-200 active:scale-95">
                                    {isSubmitting ? (
                                        <span className="flex items-center justify-center gap-2">
                                            <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                                            Đang tạo...
                                        </span>
                                    ) : (
                                        <span className="flex items-center justify-center gap-2">
                                            <Plus className="w-4 h-4" /> Tạo Lớp HP
                                        </span>
                                    )}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* Edit Class Modal */}
            {isEditClassOpen && selectedClass && (
                <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-50 p-4" onClick={() => setIsEditClassOpen(false)}>
                    <div className="bg-white rounded-2xl shadow-2xl max-w-lg w-full overflow-hidden animate-in fade-in zoom-in-95 duration-200" onClick={e => e.stopPropagation()}>
                        <div className="bg-gradient-to-r from-emerald-600 to-emerald-700 px-6 py-5 flex items-center justify-between">
                            <div className="flex items-center gap-3">
                                <div className="w-10 h-10 bg-white/20 rounded-xl flex items-center justify-center">
                                    <Edit className="w-5 h-5 text-white" />
                                </div>
                                <div>
                                    <h2 className="text-base font-bold text-white">Sửa Lớp Học Phần</h2>
                                    <p className="text-xs text-emerald-200 mt-0.5">{selectedClass.maLopHocPhan} — {selectedClass.tenMonHoc}</p>
                                </div>
                            </div>
                            <button onClick={() => setIsEditClassOpen(false)} className="p-2 hover:bg-white/20 rounded-xl transition-colors">
                                <X className="w-5 h-5 text-white" />
                            </button>
                        </div>
                        <form className="p-6 space-y-5" onSubmit={handleUpdateClass}>
                            <div className="bg-slate-50 border border-slate-200 rounded-xl p-3">
                                <label className="text-xs font-semibold text-slate-500 mb-1 block">Mã lớp HP</label>
                                <p className="font-bold text-blue-600 text-lg">{classForm.maLopHocPhan}</p>
                                <p className="text-xs text-slate-400 mt-1">Mã lớp HP không thể thay đổi</p>
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="flex items-center gap-2 text-sm font-semibold text-slate-700 mb-2">
                                        <CalendarDays className="w-4 h-4 text-purple-500" />
                                        Học kỳ <span className="text-red-500">*</span>
                                    </label>
                                    <select
                                        value={classForm.hocKiId}
                                        onChange={(e) => setClassForm({ ...classForm, hocKiId: e.target.value })}
                                        className="w-full px-4 py-3 border-2 border-slate-200 rounded-xl text-sm focus:outline-none focus:border-emerald-500 focus:ring-4 focus:ring-emerald-50 transition-all bg-slate-50 hover:border-slate-300 cursor-pointer"
                                    >
                                        {hocKis.map(hk => <option key={hk.id} value={hk.id}>{hk.tenHocKi}</option>)}
                                    </select>
                                </div>
                                <div>
                                    <label className="flex items-center gap-2 text-sm font-semibold text-slate-700 mb-2">
                                        <BookOpen className="w-4 h-4 text-blue-500" />
                                        Môn học <span className="text-red-500">*</span>
                                    </label>
                                    <select
                                        value={classForm.monHocId}
                                        onChange={(e) => setClassForm({ ...classForm, monHocId: e.target.value })}
                                        className="w-full px-4 py-3 border-2 border-slate-200 rounded-xl text-sm focus:outline-none focus:border-emerald-500 focus:ring-4 focus:ring-emerald-50 transition-all bg-slate-50 hover:border-slate-300 cursor-pointer"
                                    >
                                        {monHocs.map(mh => <option key={mh.id} value={mh.id}>{mh.tenMonHoc}</option>)}
                                    </select>
                                </div>
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="flex items-center gap-2 text-sm font-semibold text-slate-700 mb-2">
                                        <Users className="w-4 h-4 text-purple-500" />
                                        Sĩ số tối đa
                                    </label>
                                    <input
                                        type="number"
                                        min="1"
                                        value={classForm.soLuongToiDa}
                                        onChange={(e) => setClassForm({ ...classForm, soLuongToiDa: parseInt(e.target.value) })}
                                        className="w-full px-4 py-3 border-2 border-slate-200 rounded-xl text-sm focus:outline-none focus:border-emerald-500 focus:ring-4 focus:ring-emerald-50 transition-all bg-slate-50 hover:border-slate-300"
                                    />
                                </div>
                                <div>
                                    <label className="flex items-center gap-2 text-sm font-semibold text-slate-700 mb-2">
                                        Trạng thái
                                    </label>
                                    <select
                                        value={classForm.trangThai}
                                        onChange={(e) => setClassForm({ ...classForm, trangThai: e.target.value as any })}
                                        className="w-full px-4 py-3 border-2 border-slate-200 rounded-xl text-sm focus:outline-none focus:border-emerald-500 focus:ring-4 focus:ring-emerald-50 transition-all bg-slate-50 hover:border-slate-300 cursor-pointer"
                                    >
                                        <option value="MO_DANG_KY">Mở đăng ký</option>
                                        <option value="DANG_HOC">Đang học</option>
                                        <option value="DA_KET_THUC">Đã kết thúc</option>
                                    </select>
                                </div>
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="flex items-center gap-2 text-sm font-semibold text-slate-700 mb-2">
                                        <Calendar className="w-4 h-4 text-amber-500" />
                                        Hạn đăng ký
                                    </label>
                                    <input
                                        type="datetime-local"
                                        value={classForm.hanDangKy}
                                        onChange={(e) => setClassForm({ ...classForm, hanDangKy: e.target.value })}
                                        className="w-full px-4 py-3 border-2 border-slate-200 rounded-xl text-sm focus:outline-none focus:border-emerald-500 focus:ring-4 focus:ring-emerald-50 transition-all bg-slate-50 hover:border-slate-300"
                                    />
                                </div>
                                <div>
                                    <label className="flex items-center gap-2 text-sm font-semibold text-slate-700 mb-2">
                                        <X className="w-4 h-4 text-red-500" />
                                        Hạn hủy đăng ký
                                    </label>
                                    <input
                                        type="datetime-local"
                                        value={classForm.hanHuy}
                                        onChange={(e) => setClassForm({ ...classForm, hanHuy: e.target.value })}
                                        className="w-full px-4 py-3 border-2 border-slate-200 rounded-xl text-sm focus:outline-none focus:border-emerald-500 focus:ring-4 focus:ring-emerald-50 transition-all bg-slate-50 hover:border-slate-300"
                                    />
                                </div>
                            </div>
                            <div className="flex gap-3 pt-3">
                                <button type="button" onClick={() => setIsEditClassOpen(false)} className="flex-1 py-3 border-2 border-slate-200 rounded-xl text-sm font-semibold text-slate-600 hover:bg-slate-50 hover:border-slate-300 transition-all">
                                    Hủy bỏ
                                </button>
                                <button type="submit" disabled={isSubmitting} className="flex-1 py-3 bg-emerald-600 text-white rounded-xl text-sm font-semibold hover:bg-emerald-700 disabled:opacity-50 transition-all shadow-lg shadow-emerald-200 active:scale-95">
                                    {isSubmitting ? (
                                        <span className="flex items-center justify-center gap-2">
                                            <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                                            Đang lưu...
                                        </span>
                                    ) : (
                                        <span className="flex items-center justify-center gap-2">
                                            <CheckCircle className="w-4 h-4" /> Lưu Thay Đổi
                                        </span>
                                    )}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* Detail Modal with Tabs */}
            {isDetailOpen && selectedClass && (
                <div className="fixed inset-0 bg-black/30 flex items-center justify-center z-50 p-4" onClick={() => { setIsDetailOpen(false); setIsInlineLichFormOpen(false); setConfirmDeleteLichId(null); }}>
                    <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] flex flex-col" onClick={e => e.stopPropagation()}>
                        {/* Header */}
                        <div className="sticky top-0 bg-gradient-to-r from-blue-600 to-blue-700 text-white px-6 py-4 flex items-center justify-between rounded-t-2xl z-10">
                            <div>
                                <h2 className="text-base font-bold">{selectedClass.maLopHocPhan}</h2>
                                <p className="text-xs text-blue-200">{selectedClass.tenMonHoc} - {selectedClass.tenHocKi}</p>
                            </div>
                            <button onClick={() => { setIsDetailOpen(false); setIsInlineLichFormOpen(false); setConfirmDeleteLichId(null); }} className="p-1 hover:bg-white/20 rounded-lg"><X className="w-5 h-5" /></button>
                        </div>

                        {/* Tabs */}
                        <div className="flex border-b border-slate-200 bg-white px-6 gap-1">
                            {([
                                { key: 'info', label: 'Thông tin', icon: <BookOpen className="w-4 h-4" /> },
                                { key: 'lich', label: `Lịch học (${classSchedules.length})`, icon: <Calendar className="w-4 h-4" /> },
                                { key: 'cotdiem', label: `Cột điểm (${cotDiems.length})`, icon: <BarChart2 className="w-4 h-4" /> },
                            ] as const).map(tab => (
                                <button
                                    key={tab.key}
                                    onClick={() => setDetailTab(tab.key)}
                                    className={`flex items-center gap-1.5 px-4 py-3 text-sm font-medium border-b-2 transition-colors ${detailTab === tab.key
                                        ? 'border-blue-600 text-blue-600'
                                        : 'border-transparent text-slate-500 hover:text-slate-700'}`}
                                >
                                    {tab.icon}{tab.label}
                                </button>
                            ))}
                        </div>

                        <div className="p-6 overflow-auto flex-1">
                            {/* Tab: Thông tin */}
                            {detailTab === 'info' && (
                                <div className="grid grid-cols-2 gap-4 text-sm">
                                    <div className="bg-slate-50 p-3 rounded-lg">
                                        <p className="text-slate-500 text-xs">Môn học</p>
                                        <p className="font-semibold">{selectedClass.tenMonHoc} ({selectedClass.maMonHoc})</p>
                                    </div>
                                    <div className="bg-slate-50 p-3 rounded-lg">
                                        <p className="text-slate-500 text-xs">Tín chỉ</p>
                                        <p className="font-semibold">{selectedClass.soTinChi}</p>
                                    </div>
                                    <div className="bg-slate-50 p-3 rounded-lg">
                                        <p className="text-slate-500 text-xs">Sĩ số</p>
                                        <p className="font-semibold">{selectedClass.soLuongDaDangKy} / {selectedClass.soLuongToiDa}</p>
                                    </div>
                                    <div className="bg-slate-50 p-3 rounded-lg">
                                        <p className="text-slate-500 text-xs">Trạng thái</p>
                                        <span className={`inline-block px-3 py-1 rounded-full text-xs font-semibold ${getStatusColor(selectedClass.trangThai)}`}>
                                            {getStatusLabel(selectedClass.trangThai)}
                                        </span>
                                    </div>
                                    <div className="bg-slate-50 p-3 rounded-lg">
                                        <p className="text-slate-500 text-xs">Hạn đăng ký</p>
                                        <p className="font-semibold">{formatDisplayDate(selectedClass.hanDangKy)}</p>
                                    </div>
                                    <div className="bg-slate-50 p-3 rounded-lg">
                                        <p className="text-slate-500 text-xs">Hạn hủy</p>
                                        <p className="font-semibold">{formatDisplayDate(selectedClass.hanHuy)}</p>
                                    </div>
                                </div>
                            )}

                            {/* Tab: Lịch học */}
                            {detailTab === 'lich' && (() => {
                                const DOW = ['CN', 'Thứ 2', 'Thứ 3', 'Thứ 4', 'Thứ 5', 'Thứ 6', 'Thứ 7'];
                                const sorted = [...classSchedules].sort((a, b) => new Date(a.ngayHoc).getTime() - new Date(b.ngayHoc).getTime());

                                // group by month "MM/YYYY"
                                const groups: Record<string, typeof sorted> = {};
                                sorted.forEach(s => {
                                    const d = new Date(s.ngayHoc);
                                    const key = `${d.getMonth() + 1}/${d.getFullYear()}`;
                                    if (!groups[key]) groups[key] = [];
                                    groups[key].push(s);
                                });

                                return (
                                    <div className="space-y-4">
                                        {/* Toolbar */}
                                        <div className="flex items-center justify-between">
                                            <div className="flex items-center gap-2">
                                                <div className="w-8 h-8 rounded-lg bg-blue-100 flex items-center justify-center">
                                                    <Calendar className="w-4 h-4 text-blue-600" />
                                                </div>
                                                <div>
                                                    <p className="text-sm font-semibold text-slate-900">{classSchedules.length} buổi học</p>
                                                    <p className="text-xs text-slate-400">đã lên lịch</p>
                                                </div>
                                            </div>
                                            <button
                                                onClick={() => isInlineLichFormOpen ? setIsInlineLichFormOpen(false) : openAddLich()}
                                                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${isInlineLichFormOpen
                                                    ? 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                                                    : 'bg-blue-600 text-white hover:bg-blue-700'}`}
                                            >
                                                {isInlineLichFormOpen ? <><X className="w-3.5 h-3.5" /> Hủy</> : <><Plus className="w-3.5 h-3.5" /> Thêm lịch</>}
                                            </button>
                                        </div>

                                        {/* Inline add form */}
                                        {isInlineLichFormOpen && (
                                            <form onSubmit={handleCreateLich} className="bg-blue-50 border border-blue-200 rounded-xl p-4 space-y-3">
                                                <p className="text-xs font-semibold text-blue-700 uppercase tracking-wide">Buổi học mới</p>
                                                <div className="grid grid-cols-3 gap-2">
                                                    <div>
                                                        <label className="block text-xs font-medium text-slate-600 mb-1">Ngày học <span className="text-red-500">*</span></label>
                                                        <input
                                                            type="date"
                                                            value={lichForm.ngayHoc}
                                                            onChange={e => setLichForm({ ...lichForm, ngayHoc: e.target.value })}
                                                            required
                                                            className="w-full px-2.5 py-2 border border-slate-300 bg-white rounded-lg text-xs focus:outline-none focus:ring-2 focus:ring-blue-500"
                                                        />
                                                    </div>
                                                    <div>
                                                        <label className="block text-xs font-medium text-slate-600 mb-1">Giờ học <span className="text-red-500">*</span></label>
                                                        <select
                                                            value={lichForm.gioHocId}
                                                            onChange={e => setLichForm({ ...lichForm, gioHocId: e.target.value })}
                                                            required
                                                            className="w-full px-2.5 py-2 border border-slate-300 bg-white rounded-lg text-xs focus:outline-none focus:ring-2 focus:ring-blue-500"
                                                        >
                                                            <option value="">-- Chọn giờ --</option>
                                                            {gioHocs.map(gh => (
                                                                <option key={gh.id} value={gh.id}>{gh.thoiGianBatDau?.substring(0,5)} – {gh.thoiGianKetThuc?.substring(0,5)}</option>
                                                            ))}
                                                        </select>
                                                    </div>
                                                    <div>
                                                        <label className="block text-xs font-medium text-slate-600 mb-1">Phòng học <span className="text-red-500">*</span></label>
                                                        <select
                                                            value={lichForm.phongId}
                                                            onChange={e => setLichForm({ ...lichForm, phongId: e.target.value })}
                                                            required
                                                            className="w-full px-2.5 py-2 border border-slate-300 bg-white rounded-lg text-xs focus:outline-none focus:ring-2 focus:ring-blue-500"
                                                        >
                                                            <option value="">-- Chọn phòng --</option>
                                                            {phongs.map(p => (
                                                                <option key={p.id} value={p.id}>{p.maPhong} – {p.tenPhong}</option>
                                                            ))}
                                                        </select>
                                                    </div>
                                                </div>
                                                <div className="flex justify-end gap-2 pt-1">
                                                    <button
                                                        type="button"
                                                        onClick={() => setIsInlineLichFormOpen(false)}
                                                        className="px-3 py-1.5 text-xs font-medium text-slate-600 border border-slate-300 rounded-lg hover:bg-slate-50"
                                                    >
                                                        Hủy
                                                    </button>
                                                    <button
                                                        type="submit"
                                                        disabled={isSubmitting}
                                                        className="flex items-center gap-1.5 px-4 py-1.5 text-xs font-medium bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
                                                    >
                                                        {isSubmitting ? <><div className="w-3 h-3 border-2 border-white/40 border-t-white rounded-full animate-spin" /> Đang thêm...</> : <><Plus className="w-3.5 h-3.5" /> Xác nhận thêm</>}
                                                    </button>
                                                </div>
                                            </form>
                                        )}

                                        {/* Empty state */}
                                        {classSchedules.length === 0 && !isInlineLichFormOpen && (
                                            <div className="text-center py-12 bg-slate-50 rounded-xl border-2 border-dashed border-slate-200">
                                                <div className="w-12 h-12 rounded-full bg-slate-100 flex items-center justify-center mx-auto mb-3">
                                                    <CalendarDays className="w-6 h-6 text-slate-400" />
                                                </div>
                                                <p className="text-sm font-medium text-slate-600">Chưa có buổi học nào</p>
                                                <p className="text-xs text-slate-400 mt-1">Nhấn <b>Thêm lịch</b> để lên lịch buổi đầu tiên</p>
                                            </div>
                                        )}

                                        {/* Grouped schedule list */}
                                        {Object.entries(groups).map(([monthKey, items]) => (
                                            <div key={monthKey}>
                                                <div className="flex items-center gap-2 mb-2">
                                                    <span className="text-xs font-semibold text-slate-500 uppercase tracking-wide">Tháng {monthKey}</span>
                                                    <div className="flex-1 h-px bg-slate-200" />
                                                    <span className="text-xs text-slate-400">{items.length} buổi</span>
                                                </div>
                                                <div className="space-y-2">
                                                    {items.map(s => {
                                                        const date = new Date(s.ngayHoc);
                                                        const dow = DOW[date.getDay()];
                                                        const dateStr = date.toLocaleDateString('vi-VN', { day: '2-digit', month: '2-digit', year: 'numeric' });
                                                        const gio = s.gioHoc ?? (s as any).gioHocData;
                                                        const phong = s.phong ?? (s as any).phongData;
                                                        const isFlashing = flashLichId === s.id;
                                                        const isConfirming = confirmDeleteLichId === s.id;

                                                        return (
                                                            <div
                                                                key={s.id}
                                                                className={`rounded-xl border transition-all duration-500 overflow-hidden ${isFlashing
                                                                    ? 'border-green-400 bg-green-50 shadow-sm shadow-green-200'
                                                                    : isConfirming
                                                                        ? 'border-red-300 bg-red-50'
                                                                        : 'border-slate-200 bg-white hover:border-blue-300 hover:shadow-sm'}`}
                                                            >
                                                                <div className="flex items-center gap-0">
                                                                    {/* Day badge */}
                                                                    <div className={`flex-shrink-0 w-16 text-center py-3 px-2 border-r ${isFlashing ? 'border-green-300 bg-green-100' : isConfirming ? 'border-red-200 bg-red-100' : 'border-slate-100 bg-slate-50'}`}>
                                                                        <p className={`text-xs font-bold ${isFlashing ? 'text-green-700' : isConfirming ? 'text-red-600' : 'text-blue-600'}`}>{dow}</p>
                                                                        <p className="text-sm font-bold text-slate-800 leading-tight">{date.getDate()}</p>
                                                                        <p className="text-xs text-slate-400">/{date.getMonth() + 1}</p>
                                                                    </div>

                                                                    {/* Content */}
                                                                    <div className="flex-1 px-4 py-2.5 flex items-center gap-4 min-w-0">
                                                                        {gio ? (
                                                                            <div className="flex items-center gap-1.5">
                                                                                <div className="w-6 h-6 rounded-full bg-blue-100 flex items-center justify-center flex-shrink-0">
                                                                                    <Clock className="w-3 h-3 text-blue-600" />
                                                                                </div>
                                                                                <div>
                                                                                    <p className="text-xs font-semibold text-slate-800">{gio.thoiGianBatDau?.substring(0,5)} – {gio.thoiGianKetThuc?.substring(0,5)}</p>
                                                                                    {gio.tenGioHoc && <p className="text-xs text-slate-400">{gio.tenGioHoc}</p>}
                                                                                </div>
                                                                            </div>
                                                                        ) : (
                                                                            <span className="text-xs text-slate-400 italic">Chưa có giờ</span>
                                                                        )}
                                                                        {phong && (
                                                                            <div className="flex items-center gap-1.5">
                                                                                <div className="w-6 h-6 rounded-full bg-purple-100 flex items-center justify-center flex-shrink-0">
                                                                                    <MapPin className="w-3 h-3 text-purple-600" />
                                                                                </div>
                                                                                <div>
                                                                                    <p className="text-xs font-semibold text-slate-800">{phong.maPhong}</p>
                                                                                    {phong.tenPhong && <p className="text-xs text-slate-400 truncate max-w-[80px]">{phong.tenPhong}</p>}
                                                                                </div>
                                                                            </div>
                                                                        )}
                                                                        {isFlashing && (
                                                                            <div className="ml-auto flex items-center gap-1 text-green-600">
                                                                                <CheckCircle className="w-4 h-4" />
                                                                                <span className="text-xs font-medium">Đã thêm</span>
                                                                            </div>
                                                                        )}
                                                                    </div>

                                                                    {/* Actions */}
                                                                    <div className="flex-shrink-0 pr-3">
                                                                        {isConfirming ? (
                                                                            <div className="flex items-center gap-1.5">
                                                                                <span className="text-xs text-red-600 font-medium">Xóa buổi này?</span>
                                                                                <button
                                                                                    onClick={() => setConfirmDeleteLichId(null)}
                                                                                    className="px-2 py-1 text-xs border border-slate-300 rounded-lg text-slate-600 hover:bg-slate-100"
                                                                                >
                                                                                    Không
                                                                                </button>
                                                                                <button
                                                                                    onClick={() => handleDeleteLich(s.id)}
                                                                                    className="px-2 py-1 text-xs bg-red-600 text-white rounded-lg hover:bg-red-700"
                                                                                >
                                                                                    Xóa
                                                                                </button>
                                                                            </div>
                                                                        ) : (
                                                                            <button
                                                                                onClick={() => setConfirmDeleteLichId(s.id)}
                                                                                className="p-1.5 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                                                                                title="Xóa buổi học"
                                                                            >
                                                                                <Trash2 className="w-4 h-4" />
                                                                            </button>
                                                                        )}
                                                                    </div>
                                                                </div>
                                                            </div>
                                                        );
                                                    })}
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                );
                            })()}

                            {/* Tab: Cột điểm */}
                            {detailTab === 'cotdiem' && (
                                <div className="space-y-3">
                                    {/* Header + tổng tỉ trọng */}
                                    <div className="flex items-center justify-between">
                                        <h3 className="font-semibold text-slate-900 flex items-center gap-2">
                                            <BarChart2 className="w-5 h-5" /> Cột điểm ({cotDiems.length})
                                        </h3>
                                        <button onClick={openAddCotDiem} className="flex items-center gap-1.5 px-3 py-1.5 bg-indigo-600 text-white rounded-lg text-xs font-medium hover:bg-indigo-700">
                                            <Plus className="w-4 h-4" /> Thêm cột
                                        </button>
                                    </div>

                                    {/* Tỉ trọng tổng */}
                                    <div className={`flex items-center justify-between px-4 py-2.5 rounded-xl text-sm font-medium border ${totalTiTrong === 100
                                        ? 'bg-green-50 border-green-200 text-green-700'
                                        : totalTiTrong > 100
                                            ? 'bg-red-50 border-red-200 text-red-700'
                                            : 'bg-amber-50 border-amber-200 text-amber-700'}`}>
                                        <span>Tổng tỉ trọng</span>
                                        <div className="flex items-center gap-2">
                                            <div className="w-32 bg-white/60 rounded-full h-2 border border-current/20">
                                                <div
                                                    className={`h-2 rounded-full transition-all ${totalTiTrong === 100 ? 'bg-green-500' : totalTiTrong > 100 ? 'bg-red-500' : 'bg-amber-400'}`}
                                                    style={{ width: `${Math.min(totalTiTrong, 100)}%` }}
                                                />
                                            </div>
                                            <span className="font-bold tabular-nums">{totalTiTrong.toFixed(0)}%</span>
                                            {totalTiTrong === 100
                                                ? <CheckCircle className="w-4 h-4" />
                                                : <AlertCircle className="w-4 h-4" />}
                                        </div>
                                    </div>

                                    {/* Danh sách cột điểm */}
                                    {cotDiems.length === 0 ? (
                                        <div className="text-center py-10 bg-slate-50 rounded-xl">
                                            <BarChart2 className="w-8 h-8 text-slate-300 mx-auto mb-2" />
                                            <p className="text-sm text-slate-500">Chưa có cột điểm nào</p>
                                            <p className="text-xs text-slate-400 mt-1">Thêm cột điểm để cấu hình thang điểm lớp học</p>
                                        </div>
                                    ) : (
                                        <div className="space-y-2">
                                            {cotDiems.map(cd => (
                                                <div key={cd.id} className="flex items-center justify-between p-3 bg-slate-50 border border-slate-200 rounded-xl text-sm hover:bg-slate-100 transition-colors">
                                                    <div className="flex items-center gap-3 min-w-0">
                                                        <div className="text-slate-300 flex-shrink-0"><GripVertical className="w-4 h-4" /></div>
                                                        <div className="flex-shrink-0 w-6 h-6 rounded-full bg-indigo-100 text-indigo-600 flex items-center justify-center text-xs font-bold">
                                                            {cd.thuTuHienThi}
                                                        </div>
                                                        <div className="min-w-0">
                                                            <p className="font-semibold text-slate-900 truncate">{cd.tenCotDiem}</p>
                                                            <p className="text-xs text-slate-500">{COT_DIEM_LOAI_LABEL[cd.loai] ?? cd.loai}</p>
                                                        </div>
                                                    </div>
                                                    <div className="flex items-center gap-3 flex-shrink-0">
                                                        <div className="text-right">
                                                            <span className="font-bold text-indigo-600">{cd.tiTrong}%</span>
                                                        </div>
                                                        <div className="flex gap-1">
                                                            <button onClick={() => openEditCotDiem(cd)} className="p-1.5 text-green-600 hover:bg-green-100 rounded-lg" title="Sửa">
                                                                <Edit className="w-4 h-4" />
                                                            </button>
                                                            <button onClick={() => handleDeleteCotDiem(cd)} className="p-1.5 text-red-500 hover:bg-red-100 rounded-lg" title="Xóa">
                                                                <Trash2 className="w-4 h-4" />
                                                            </button>
                                                        </div>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    )}
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            )}


            {/* Add Cột điểm Modal */}
            {isAddCotDiemOpen && (
                <div className="fixed inset-0 bg-black/30 flex items-center justify-center z-[60] p-4" onClick={() => setIsAddCotDiemOpen(false)}>
                    <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full" onClick={e => e.stopPropagation()}>
                        <div className="bg-gradient-to-r from-indigo-600 to-indigo-700 text-white px-6 py-4 flex items-center justify-between rounded-t-2xl">
                            <h2 className="text-base font-bold flex items-center gap-2"><Plus className="w-5 h-5" /> Thêm Cột Điểm</h2>
                            <button onClick={() => setIsAddCotDiemOpen(false)} className="p-1 hover:bg-white/20 rounded-lg"><X className="w-5 h-5" /></button>
                        </div>
                        <form className="p-6 space-y-4" onSubmit={handleCreateCotDiem}>
                            <div>
                                <label className="block text-sm font-medium text-slate-700 mb-1.5">Tên cột điểm <span className="text-red-500">*</span></label>
                                <input
                                    value={cotDiemForm.tenCotDiem}
                                    onChange={e => setCotDiemForm({ ...cotDiemForm, tenCotDiem: e.target.value })}
                                    placeholder="VD: Kiểm tra giữa kỳ"
                                    className="w-full px-3 py-2.5 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-slate-700 mb-1.5">Loại cột điểm <span className="text-red-500">*</span></label>
                                <select
                                    value={cotDiemForm.loai}
                                    onChange={e => setCotDiemForm({ ...cotDiemForm, loai: e.target.value as CotDiemLoai })}
                                    className="w-full px-3 py-2.5 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                                >
                                    {(Object.entries(COT_DIEM_LOAI_LABEL) as [CotDiemLoai, string][]).map(([key, label]) => (
                                        <option key={key} value={key}>{label}</option>
                                    ))}
                                </select>
                            </div>
                            <div className="grid grid-cols-2 gap-3">
                                <div>
                                    <label className="block text-sm font-medium text-slate-700 mb-1.5">
                                        Tỉ trọng (%) <span className="text-red-500">*</span>
                                    </label>
                                    <div className="relative">
                                        <input
                                            type="number"
                                            min="1"
                                            max="100"
                                            step="1"
                                            value={cotDiemForm.tiTrong}
                                            onChange={e => setCotDiemForm({ ...cotDiemForm, tiTrong: e.target.value })}
                                            placeholder="VD: 30"
                                            className="w-full px-3 py-2.5 pr-8 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                                        />
                                        <span className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 text-sm">%</span>
                                    </div>
                                    <p className="text-xs text-slate-500 mt-1">Còn lại: <b>{(100 - totalTiTrong).toFixed(0)}%</b></p>
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-slate-700 mb-1.5">Thứ tự hiển thị</label>
                                    <input
                                        type="number"
                                        min="1"
                                        value={cotDiemForm.thuTuHienThi}
                                        onChange={e => setCotDiemForm({ ...cotDiemForm, thuTuHienThi: parseInt(e.target.value) || 1 })}
                                        className="w-full px-3 py-2.5 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                                    />
                                </div>
                            </div>
                            <div className="flex gap-3 pt-3 border-t border-slate-100">
                                <button type="button" onClick={() => setIsAddCotDiemOpen(false)} className="flex-1 py-2.5 border border-slate-300 rounded-xl text-sm font-medium text-slate-700 hover:bg-slate-50">Hủy</button>
                                <button type="submit" disabled={isSubmitting} className="flex-1 py-2.5 bg-indigo-600 text-white rounded-xl text-sm font-medium hover:bg-indigo-700 disabled:opacity-50">
                                    {isSubmitting ? 'Đang thêm...' : 'Thêm Cột Điểm'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* Edit Cột điểm Modal */}
            {isEditCotDiemOpen && selectedCotDiem && (
                <div className="fixed inset-0 bg-black/30 flex items-center justify-center z-[60] p-4" onClick={() => setIsEditCotDiemOpen(false)}>
                    <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full" onClick={e => e.stopPropagation()}>
                        <div className="bg-gradient-to-r from-green-600 to-green-700 text-white px-6 py-4 flex items-center justify-between rounded-t-2xl">
                            <div>
                                <h2 className="text-base font-bold flex items-center gap-2"><Edit className="w-5 h-5" /> Sửa Cột Điểm</h2>
                                <p className="text-xs text-green-200 mt-0.5">{selectedCotDiem.tenCotDiem}</p>
                            </div>
                            <button onClick={() => setIsEditCotDiemOpen(false)} className="p-1 hover:bg-white/20 rounded-lg"><X className="w-5 h-5" /></button>
                        </div>
                        <form className="p-6 space-y-4" onSubmit={handleUpdateCotDiem}>
                            <div>
                                <label className="block text-sm font-medium text-slate-700 mb-1.5">Tên cột điểm <span className="text-red-500">*</span></label>
                                <input
                                    value={cotDiemForm.tenCotDiem}
                                    onChange={e => setCotDiemForm({ ...cotDiemForm, tenCotDiem: e.target.value })}
                                    className="w-full px-3 py-2.5 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-green-500"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-slate-700 mb-1.5">Loại cột điểm</label>
                                <select
                                    value={cotDiemForm.loai}
                                    onChange={e => setCotDiemForm({ ...cotDiemForm, loai: e.target.value as CotDiemLoai })}
                                    className="w-full px-3 py-2.5 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-green-500"
                                >
                                    {(Object.entries(COT_DIEM_LOAI_LABEL) as [CotDiemLoai, string][]).map(([key, label]) => (
                                        <option key={key} value={key}>{label}</option>
                                    ))}
                                </select>
                            </div>
                            <div className="grid grid-cols-2 gap-3">
                                <div>
                                    <label className="block text-sm font-medium text-slate-700 mb-1.5">Tỉ trọng (%) <span className="text-red-500">*</span></label>
                                    <div className="relative">
                                        <input
                                            type="number"
                                            min="1"
                                            max="100"
                                            step="1"
                                            value={cotDiemForm.tiTrong}
                                            onChange={e => setCotDiemForm({ ...cotDiemForm, tiTrong: e.target.value })}
                                            className="w-full px-3 py-2.5 pr-8 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-green-500"
                                        />
                                        <span className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 text-sm">%</span>
                                    </div>
                                    <p className="text-xs text-slate-500 mt-1">
                                        Còn lại: <b>{(100 - cotDiems.filter(c => c.id !== selectedCotDiem.id).reduce((s, c) => s + (parseFloat(c.tiTrong) || 0), 0)).toFixed(0)}%</b>
                                    </p>
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-slate-700 mb-1.5">Thứ tự hiển thị</label>
                                    <input
                                        type="number"
                                        min="1"
                                        value={cotDiemForm.thuTuHienThi}
                                        onChange={e => setCotDiemForm({ ...cotDiemForm, thuTuHienThi: parseInt(e.target.value) || 1 })}
                                        className="w-full px-3 py-2.5 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-green-500"
                                    />
                                </div>
                            </div>
                            <div className="flex gap-3 pt-3 border-t border-slate-100">
                                <button type="button" onClick={() => setIsEditCotDiemOpen(false)} className="flex-1 py-2.5 border border-slate-300 rounded-xl text-sm font-medium text-slate-700 hover:bg-slate-50">Hủy</button>
                                <button type="submit" disabled={isSubmitting} className="flex-1 py-2.5 bg-green-600 text-white rounded-xl text-sm font-medium hover:bg-green-700 disabled:opacity-50">
                                    {isSubmitting ? 'Đang lưu...' : 'Lưu Thay Đổi'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* Delete Confirmation Modal */}
            {isDeleteModalOpen && (
                <div className="fixed inset-0 bg-black/30 flex items-center justify-center z-50 p-4" onClick={() => !isDeleting && setIsDeleteModalOpen(false)}>
                    <div className="bg-white rounded-2xl shadow-2xl max-w-sm w-full p-6" onClick={e => e.stopPropagation()}>
                        <div className="flex items-center gap-3 mb-4">
                            <div className="rounded-full bg-red-100 p-3 flex-shrink-0"><AlertCircle className="w-6 h-6 text-red-600" /></div>
                            <h3 className="font-bold text-slate-900">Xác nhận xóa {selectedIds.size > 1 ? `${selectedIds.size} lớp HP` : 'lớp HP'}</h3>
                        </div>
                        <p className="text-sm text-slate-600 mb-4">Bạn có chắc muốn xóa <b>{selectedIds.size}</b> lớp học phần đã chọn?</p>
                        <div className="bg-amber-50 border border-amber-200 rounded-lg p-3 mb-4">
                            <p className="text-xs text-amber-700"><AlertCircle className="w-3 h-3 inline mr-1" />Lớp đã có sinh viên đăng ký sẽ không thể xóa.</p>
                        </div>
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

            </div>
    );
}
