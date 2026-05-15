import { useState, useMemo } from 'react';
import { AdminSidebar } from '@/components/layouts/AdminSidebar';
import { AdminHeader } from '@/components/layouts/AdminHeader';
import { useFetch } from '@/hooks/useFetch';
import * as lopHocPhanApi from '@/api/admin/lop-hoc-phan.api';
import * as nhanVienApi from '@/api/admin/nhan-vien.api';
import * as giangDayApi from '@/api/admin/giang-day.api';
import * as lichApi from '@/api/admin/lich.api';
import type { LopHocPhanItem } from '@/api/admin/lop-hoc-phan.api';
import type { NhanVienResponse } from '@/api/admin/nhan-vien.api';
import type { GiangDayResponse, CreateGiangDayRequest } from '@/api/admin/giang-day.api';
import type { LichItem } from '@/api/admin/lich.api';
import {
    Users, Search, UserCheck, BookOpen, Filter, Plus, Trash2, X,
    CheckCircle, AlertCircle, ChevronDown, RefreshCw, Calendar, Clock, AlertTriangle
} from 'lucide-react';

interface Toast {
    id: string;
    message: string;
    type: 'success' | 'error' | 'info';
}

interface ScheduleConflict {
    existingClass: string;
    existingTime: string;
    existingDate: string;
    newClass: string;
    newTime: string;
    newDate: string;
}

const VAI_TRO_OPTIONS = [
    { value: 'CHINH', label: 'Giảng dạy chính' },
    { value: 'PHO', label: 'Giảng dạy phụ' },
    { value: 'THUC_HANH', label: 'Thực hành' },
];

const WEEKDAYS = ['CN', 'T2', 'T3', 'T4', 'T5', 'T6', 'T7'];

function formatDate(dateStr: string): string {
    try {
        const date = new Date(dateStr);
        const weekday = WEEKDAYS[date.getDay()];
        const day = date.getDate().toString().padStart(2, '0');
        const month = (date.getMonth() + 1).toString().padStart(2, '0');
        const year = date.getFullYear();
        return `${weekday}, ${day}/${month}/${year}`;
    } catch {
        return dateStr;
    }
}

function formatTime(timeStr: string | undefined): string {
    if (!timeStr) return '';
    try {
        const time = timeStr.substring(0, 5);
        return time;
    } catch {
        return timeStr;
    }
}

function checkConflict(
    existingSchedules: LichItem[],
    newSchedules: LichItem[]
): ScheduleConflict | null {
    for (const existing of existingSchedules) {
        for (const newLich of newSchedules) {
            if (existing.lopHocPhan?.id === newLich.lopHocPhan?.id) continue;
            if (!existing.ngayHoc || !newLich.ngayHoc) continue;

            const existingDate = new Date(existing.ngayHoc).toDateString();
            const newDate = new Date(newLich.ngayHoc).toDateString();

            if (existingDate !== newDate) continue;

            if (existing.gioHoc && newLich.gioHoc) {
                const existingStart = existing.gioHoc.gioBatDau;
                const existingEnd = existing.gioHoc.gioKetThuc;
                const newStart = newLich.gioHoc.gioBatDau;
                const newEnd = newLich.gioHoc.gioKetThuc;

                if (existingStart < newEnd && newStart < existingEnd) {
                    return {
                        existingClass: existing.lopHocPhan?.maLopHocPhan || 'N/A',
                        existingTime: `${formatTime(existingStart)} - ${formatTime(existingEnd)}`,
                        existingDate: formatDate(existing.ngayHoc),
                        newClass: newLich.lopHocPhan?.maLopHocPhan || 'N/A',
                        newTime: `${formatTime(newStart)} - ${formatTime(newEnd)}`,
                        newDate: formatDate(newLich.ngayHoc),
                    };
                }
            }
        }
    }
    return null;
}

export default function AdminTeachingManagementPage() {
    const [activeTab, setActiveTab] = useState<'assignments' | 'workload' | 'schedules'>('assignments');
    const [search, setSearch] = useState('');
    const [filterLhp, setFilterLhp] = useState('');
    const [filterNv, setFilterNv] = useState('');
    const [toasts, setToasts] = useState<Toast[]>([]);

    const [showAssignForm, setShowAssignForm] = useState(false);
    const [editingId, setEditingId] = useState<string | null>(null);
    const [formLhpId, setFormLhpId] = useState('');
    const [formNvId, setFormNvId] = useState('');
    const [formVaiTro, setFormVaiTro] = useState('CHINH');
    const [previewSchedule, setPreviewSchedule] = useState<LichItem[]>([]);
    const [scheduleConflict, setScheduleConflict] = useState<ScheduleConflict | null>(null);

    const addToast = (message: string, type: Toast['type'] = 'info') => {
        const id = Date.now().toString();
        setToasts(prev => [...prev, { id, message, type }]);
        setTimeout(() => setToasts(prev => prev.filter(t => t.id !== id)), 4000);
    };

    const { data: lopHocPhans = [], loading: loadingLhp, refetch: refetchLhp } = useFetch(
        () => lopHocPhanApi.getLopHocPhan(),
        { onError: (m) => addToast(m, 'error') }
    );

    const { data: lecturers = [], loading: loadingLecturers, refetch: refetchLecturers } = useFetch(
        () => nhanVienApi.getAllLecturers(),
        { onError: (m) => addToast(m, 'error') }
    );

    const { data: giangDays = [], loading: loadingGiangDay, refetch: refetchGiangDay } = useFetch(
        () => giangDayApi.getAllGiangDay(),
        { onError: (m) => addToast(m, 'error') }
    );

    const loading = loadingLhp || loadingLecturers || loadingGiangDay;

    const refetchAll = () => {
        refetchLhp();
        refetchLecturers();
        refetchGiangDay();
    };

    const filteredGiangDays = useMemo(() => {
        const q = search.toLowerCase();
        return giangDays.filter((gd: GiangDayResponse) => {
            const matchSearch =
                !q ||
                gd.tenNhanVien?.toLowerCase().includes(q) ||
                gd.maLopHocPhan?.toLowerCase().includes(q) ||
                gd.tenMonHoc?.toLowerCase().includes(q) ||
                gd.maNhanVien?.toLowerCase().includes(q) ||
                gd.tenHocKi?.toLowerCase().includes(q);
            const matchLhp = !filterLhp || gd.lopHocPhanId === filterLhp;
            const matchNv = !filterNv || gd.nhanVienId === filterNv;
            return matchSearch && matchLhp && matchNv;
        });
    }, [giangDays, search, filterLhp, filterNv]);

    const workloads = useMemo(() => {
        const grouped: Record<string, { lecturer: NhanVienResponse; classes: GiangDayResponse[] }> = {};
        giangDays.forEach((gd: GiangDayResponse) => {
            if (!grouped[gd.nhanVienId]) {
                const lecturer = lecturers.find((l: NhanVienResponse) => l.id === gd.nhanVienId);
                if (lecturer) {
                    grouped[gd.nhanVienId] = { lecturer, classes: [] };
                }
            }
            if (grouped[gd.nhanVienId]) {
                grouped[gd.nhanVienId].classes.push(gd);
            }
        });
        return Object.values(grouped)
            .filter(w => {
                const q = search.toLowerCase();
                return !q ||
                    w.lecturer.tenNhanVien?.toLowerCase().includes(q) ||
                    w.lecturer.maNhanVien?.toLowerCase().includes(q);
            })
            .map(w => ({
                ...w,
                totalClasses: w.classes.length,
                totalCredits: w.classes.reduce((s, c) => s + (c.soTinChi || 0), 0),
            }));
    }, [giangDays, lecturers, search]);

    const hasFilter = search || filterLhp || filterNv;

    const clearFilters = () => {
        setSearch('');
        setFilterLhp('');
        setFilterNv('');
    };

    const openCreateForm = () => {
        setEditingId(null);
        setFormLhpId('');
        setFormNvId('');
        setFormVaiTro('CHINH');
        setPreviewSchedule([]);
        setScheduleConflict(null);
        setShowAssignForm(true);
    };

    const openEditForm = (gd: GiangDayResponse) => {
        setEditingId(gd.id);
        setFormLhpId(gd.lopHocPhanId);
        setFormNvId(gd.nhanVienId);
        setFormVaiTro(gd.vaiTro || 'CHINH');
        setPreviewSchedule([]);
        setScheduleConflict(null);
        setShowAssignForm(true);
    };

    const handleLhpChange = async (lhpId: string) => {
        setFormLhpId(lhpId);
        setPreviewSchedule([]);
        setScheduleConflict(null);

        if (!lhpId || !formNvId) return;

        try {
            const newSchedules = await lichApi.getLichByLopHocPhan(lhpId);
            setPreviewSchedule(newSchedules);

            const assignedLhpIds = giangDays
                .filter((gd: GiangDayResponse) => gd.nhanVienId === formNvId)
                .map((gd: GiangDayResponse) => gd.lopHocPhanId);

            for (const assignedLhpId of assignedLhpIds) {
                if (assignedLhpId === lhpId && editingId) continue;

                const existingSchedules = await lichApi.getLichByLopHocPhan(assignedLhpId);
                const conflict = checkConflict(existingSchedules, newSchedules);

                if (conflict) {
                    setScheduleConflict(conflict);
                    break;
                }
            }
        } catch (error) {
            console.error('Error fetching schedule:', error);
        }
    };

    const handleSubmit = async () => {
        if (!formLhpId || !formNvId) {
            addToast('Vui lòng chọn lớp học phần và giảng viên', 'error');
            return;
        }

        if (scheduleConflict && !confirm('Phát hiện xung đột lịch! Bạn có chắc chắn muốn phân công không?')) {
            return;
        }

        try {
            if (editingId) {
                await giangDayApi.updateGiangDay(editingId, {
                    lopHocPhanId: formLhpId,
                    nhanVienId: formNvId,
                    vaiTro: formVaiTro,
                });
                addToast('Cập nhật phân công thành công!', 'success');
            } else {
                await giangDayApi.createGiangDay({
                    lopHocPhanId: formLhpId,
                    nhanVienId: formNvId,
                    vaiTro: formVaiTro,
                } as CreateGiangDayRequest);
                addToast('Phân công giảng viên thành công!', 'success');
            }
            setShowAssignForm(false);
            refetchGiangDay();
        } catch (error: any) {
            addToast(error.response?.data?.message || 'Đã xảy ra lỗi', 'error');
        }
    };

    const handleDelete = async (id: string) => {
        if (!confirm('Bạn có chắc chắn muốn xóa phân công này?')) return;
        try {
            await giangDayApi.deleteGiangDay(id);
            addToast('Xóa phân công thành công!', 'success');
            refetchGiangDay();
        } catch (error: any) {
            addToast(error.response?.data?.message || 'Đã xảy ra lỗi', 'error');
        }
    };

    const getVaiTroLabel = (vaiTro: string) => {
        const option = VAI_TRO_OPTIONS.find(o => o.value === vaiTro);
        return option ? option.label : vaiTro;
    };

    return (
        <div className="flex h-screen bg-[#f1f5f9]">
            <AdminSidebar activeMenu="teaching" />

            <div className="flex-1 ml-64 flex flex-col overflow-hidden">
                <AdminHeader title="Quản lý giảng dạy" />

                <div className="flex-1 overflow-y-auto">
                    <div className="sticky top-0 z-20 bg-white border-b border-gray-200 shadow-sm">
                        <div className="px-6 pt-4 flex items-center justify-between gap-4">
                            <div className="flex gap-1">
                                {(['assignments', 'workload', 'schedules'] as const).map(tab => (
                                    <button
                                        key={tab}
                                        onClick={() => setActiveTab(tab)}
                                        className={`px-4 py-2 rounded-t-lg text-sm font-medium transition-colors ${activeTab === tab
                                            ? 'bg-blue-600 text-white'
                                            : 'text-gray-600 hover:bg-gray-100'
                                            }`}
                                    >
                                        {tab === 'assignments' ? 'Phân công' :
                                            tab === 'workload' ? 'Workload' : 'Lịch giảng dạy'}
                                    </button>
                                ))}
                            </div>

                            <div className="flex items-center gap-2">
                                <button
                                    onClick={refetchAll}
                                    className="flex items-center gap-2 px-3 py-2 text-sm text-gray-600 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                                >
                                    <RefreshCw className="w-4 h-4" />
                                    Làm mới
                                </button>
                                <button
                                    onClick={openCreateForm}
                                    className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white text-sm rounded-lg hover:bg-blue-700 transition-colors"
                                >
                                    <Plus className="w-4 h-4" />
                                    Phân công mới
                                </button>
                            </div>
                        </div>

                        <div className="px-6 py-3 flex flex-wrap items-center gap-3">
                            <div className="relative flex-1 min-w-[200px] max-w-xs">
                                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4" />
                                <input
                                    type="text"
                                    placeholder="Tìm kiếm..."
                                    value={search}
                                    onChange={e => setSearch(e.target.value)}
                                    className="w-full pl-9 pr-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                                />
                            </div>

                            <div className="relative min-w-[200px]">
                                <Filter className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4" />
                                <select
                                    value={filterLhp}
                                    onChange={e => setFilterLhp(e.target.value)}
                                    className="w-full pl-9 pr-8 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 appearance-none bg-white"
                                >
                                    <option value="">Tất cả lớp học phần</option>
                                    {lopHocPhans.map((lhp: LopHocPhanItem) => (
                                        <option key={lhp.id} value={lhp.id}>
                                            {lhp.maLopHocPhan} — {lhp.tenMonHoc}
                                        </option>
                                    ))}
                                </select>
                                <ChevronDown className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4 pointer-events-none" />
                            </div>

                            <div className="relative min-w-[180px]">
                                <Users className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4" />
                                <select
                                    value={filterNv}
                                    onChange={e => setFilterNv(e.target.value)}
                                    className="w-full pl-9 pr-8 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 appearance-none bg-white"
                                >
                                    <option value="">Tất cả giảng viên</option>
                                    {lecturers.map((nv: NhanVienResponse) => (
                                        <option key={nv.id} value={nv.id}>
                                            {nv.tenNhanVien} ({nv.maNhanVien})
                                        </option>
                                    ))}
                                </select>
                                <ChevronDown className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4 pointer-events-none" />
                            </div>

                            {hasFilter && (
                                <button
                                    onClick={clearFilters}
                                    className="flex items-center gap-1 px-3 py-2 text-sm text-gray-500 hover:text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-50"
                                >
                                    <X className="w-4 h-4" />
                                    Xóa bộ lọc
                                </button>
                            )}

                            <span className="ml-auto text-sm text-gray-500">
                                {activeTab === 'assignments'
                                    ? `${filteredGiangDays.length} phân công`
                                    : activeTab === 'workload'
                                        ? `${workloads.length} giảng viên`
                                        : `${giangDays.length} lịch giảng dạy`}
                            </span>
                        </div>
                    </div>

                    <div className="p-6 space-y-4">
                        {loading && (
                            <div className="flex items-center justify-center py-20 text-gray-500">
                                <svg className="animate-spin w-6 h-6 mr-2 text-blue-500" fill="none" viewBox="0 0 24 24">
                                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z" />
                                </svg>
                                Đang tải dữ liệu...
                            </div>
                        )}

                        {!loading && activeTab === 'assignments' && (
                            <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
                                <div className="overflow-x-auto">
                                    <table className="w-full text-sm">
                                        <thead>
                                            <tr className="bg-gray-50 border-b border-gray-200">
                                                <th className="px-5 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">STT</th>
                                                <th className="px-5 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Giảng viên</th>
                                                <th className="px-5 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Mã lớp học phần</th>
                                                <th className="px-5 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Môn học</th>
                                                <th className="px-5 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Học kỳ</th>
                                                <th className="px-5 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Tín chỉ</th>
                                                <th className="px-5 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Vai trò</th>
                                                <th className="px-5 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Thao tác</th>
                                            </tr>
                                        </thead>
                                        <tbody className="divide-y divide-gray-100">
                                            {filteredGiangDays.map((gd: GiangDayResponse, idx: number) => (
                                                <tr key={gd.id} className="hover:bg-gray-50 transition-colors">
                                                    <td className="px-5 py-3 text-gray-400 font-mono">{idx + 1}</td>
                                                    <td className="px-5 py-3">
                                                        <div className="flex items-center gap-2">
                                                            <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 font-semibold text-xs flex-shrink-0">
                                                                {gd.tenNhanVien?.charAt(0) || '?'}
                                                            </div>
                                                            <div>
                                                                <p className="font-medium text-gray-900">{gd.tenNhanVien || 'N/A'}</p>
                                                                <p className="text-xs text-gray-400">{gd.maNhanVien || 'N/A'}</p>
                                                            </div>
                                                        </div>
                                                    </td>
                                                    <td className="px-5 py-3 font-mono text-gray-800">{gd.maLopHocPhan || 'N/A'}</td>
                                                    <td className="px-5 py-3 text-gray-800 max-w-[200px] truncate" title={gd.tenMonHoc}>
                                                        {gd.tenMonHoc || 'N/A'}
                                                    </td>
                                                    <td className="px-5 py-3 text-gray-600">{gd.tenHocKi || 'N/A'}</td>
                                                    <td className="px-5 py-3 text-center">
                                                        <span className="inline-flex items-center justify-center w-7 h-7 bg-blue-50 text-blue-700 rounded-full text-xs font-bold">
                                                            {gd.soTinChi || 0}
                                                        </span>
                                                    </td>
                                                    <td className="px-5 py-3">
                                                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-purple-100 text-purple-700">
                                                            {getVaiTroLabel(gd.vaiTro)}
                                                        </span>
                                                    </td>
                                                    <td className="px-5 py-3">
                                                        <div className="flex items-center gap-1">
                                                            <button
                                                                onClick={() => openEditForm(gd)}
                                                                className="p-1.5 text-blue-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                                                                title="Sửa"
                                                            >
                                                                <UserCheck className="w-4 h-4" />
                                                            </button>
                                                            <button
                                                                onClick={() => handleDelete(gd.id)}
                                                                className="p-1.5 text-red-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                                                                title="Xóa"
                                                            >
                                                                <Trash2 className="w-4 h-4" />
                                                            </button>
                                                        </div>
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>

                                {filteredGiangDays.length === 0 && (
                                    <div className="py-16 text-center text-gray-400">
                                        <BookOpen className="w-10 h-10 mx-auto mb-3 opacity-40" />
                                        <p className="font-medium">Không tìm thấy phân công nào</p>
                                        {hasFilter && (
                                            <button onClick={clearFilters} className="mt-2 text-sm text-blue-500 hover:underline">
                                                Xóa bộ lọc
                                            </button>
                                        )}
                                    </div>
                                )}
                            </div>
                        )}

                        {!loading && activeTab === 'workload' && (
                            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
                                {workloads.map(({ lecturer, totalClasses, totalCredits, classes }) => (
                                    <div key={lecturer.id} className="bg-white rounded-xl border border-gray-200 shadow-sm p-5">
                                        <div className="flex items-center gap-3 mb-4">
                                            <div className="w-11 h-11 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 font-bold text-sm flex-shrink-0">
                                                {lecturer.tenNhanVien?.charAt(0) || '?'}
                                            </div>
                                            <div className="min-w-0">
                                                <p className="font-semibold text-gray-900 truncate">{lecturer.tenNhanVien}</p>
                                                <p className="text-xs text-gray-400">{lecturer.maNhanVien}</p>
                                            </div>
                                        </div>

                                        <div className="grid grid-cols-2 gap-3 mb-4">
                                            <div className="bg-blue-50 rounded-lg px-3 py-2 text-center">
                                                <p className="text-2xl font-bold text-blue-600">{totalClasses}</p>
                                                <p className="text-xs text-blue-500 mt-0.5">Lớp học phần</p>
                                            </div>
                                            <div className="bg-purple-50 rounded-lg px-3 py-2 text-center">
                                                <p className="text-2xl font-bold text-purple-600">{totalCredits}</p>
                                                <p className="text-xs text-purple-500 mt-0.5">Tổng tín chỉ</p>
                                            </div>
                                        </div>

                                        {classes.length > 0 && (
                                            <div className="space-y-1.5 max-h-36 overflow-y-auto pr-1">
                                                {classes.map(cls => (
                                                    <div key={cls.id} className="flex items-center justify-between text-xs bg-gray-50 rounded-lg px-2.5 py-1.5">
                                                        <span className="font-mono text-gray-700">{cls.maLopHocPhan}</span>
                                                        <span className="text-gray-500 truncate ml-2 max-w-[120px]" title={cls.tenMonHoc}>
                                                            {cls.tenMonHoc}
                                                        </span>
                                                    </div>
                                                ))}
                                            </div>
                                        )}

                                        {classes.length === 0 && (
                                            <p className="text-xs text-gray-400 text-center py-2">Chưa được phân công lớp nào</p>
                                        )}
                                    </div>
                                ))}

                                {workloads.length === 0 && (
                                    <div className="col-span-3 py-16 text-center text-gray-400">
                                        <Users className="w-10 h-10 mx-auto mb-3 opacity-40" />
                                        <p>Không tìm thấy giảng viên nào</p>
                                    </div>
                                )}
                            </div>
                        )}

                        {!loading && activeTab === 'schedules' && (
                            <div className="space-y-4">
                                {workloads.map(({ lecturer, classes }) => (
                                    <div key={lecturer.id} className="bg-white rounded-xl border border-gray-200 shadow-sm p-5">
                                        <div className="flex items-center gap-3 mb-4 pb-3 border-b border-gray-100">
                                            <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 font-bold text-sm">
                                                {lecturer.tenNhanVien?.charAt(0) || '?'}
                                            </div>
                                            <div>
                                                <p className="font-semibold text-gray-900">{lecturer.tenNhanVien}</p>
                                                <p className="text-xs text-gray-400">{lecturer.maNhanVien} • {classes.length} lớp</p>
                                            </div>
                                        </div>

                                        <div className="space-y-3">
                                            {classes.map(cls => (
                                                <div key={cls.id} className="bg-gray-50 rounded-lg p-3">
                                                    <div className="flex items-center justify-between mb-2">
                                                        <div>
                                                            <span className="font-mono font-semibold text-gray-800">{cls.maLopHocPhan}</span>
                                                            <span className="mx-2 text-gray-300">•</span>
                                                            <span className="text-gray-600">{cls.tenMonHoc}</span>
                                                        </div>
                                                        <span className="text-xs bg-purple-100 text-purple-700 px-2 py-0.5 rounded-full">
                                                            {cls.soTinChi} tín chỉ
                                                        </span>
                                                    </div>
                                                </div>
                                            ))}

                                            {classes.length === 0 && (
                                                <p className="text-sm text-gray-400 text-center py-4">Chưa có lịch giảng dạy</p>
                                            )}
                                        </div>
                                    </div>
                                ))}

                                {workloads.length === 0 && (
                                    <div className="bg-white rounded-xl border border-gray-200 shadow-sm py-16 text-center text-gray-400">
                                        <Calendar className="w-10 h-10 mx-auto mb-3 opacity-40" />
                                        <p>Không có lịch giảng dạy</p>
                                    </div>
                                )}
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {showAssignForm && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
                    <div className="bg-white rounded-2xl shadow-xl w-full max-w-lg mx-4 p-6 max-h-[90vh] overflow-y-auto">
                        <div className="flex items-center justify-between mb-5">
                            <h2 className="text-lg font-semibold text-gray-900">
                                {editingId ? 'Cập nhật phân công' : 'Phân công giảng viên mới'}
                            </h2>
                            <button
                                onClick={() => setShowAssignForm(false)}
                                className="p-1.5 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg"
                            >
                                <X className="w-5 h-5" />
                            </button>
                        </div>

                        <div className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1.5">
                                    Giảng viên <span className="text-red-500">*</span>
                                </label>
                                <select
                                    value={formNvId}
                                    onChange={e => {
                                        setFormNvId(e.target.value);
                                        setFormLhpId('');
                                        setPreviewSchedule([]);
                                        setScheduleConflict(null);
                                    }}
                                    disabled={!!editingId}
                                    className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100 disabled:cursor-not-allowed"
                                >
                                    <option value="">-- Chọn giảng viên --</option>
                                    {lecturers.map((nv: NhanVienResponse) => (
                                        <option key={nv.id} value={nv.id}>
                                            {nv.tenNhanVien} ({nv.maNhanVien})
                                        </option>
                                    ))}
                                </select>
                                {editingId && (
                                    <p className="mt-1 text-xs text-gray-500">Không thể thay đổi giảng viên khi chỉnh sửa</p>
                                )}
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1.5">
                                    Lớp học phần <span className="text-red-500">*</span>
                                </label>
                                <select
                                    value={formLhpId}
                                    onChange={e => handleLhpChange(e.target.value)}
                                    className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                                >
                                    <option value="">-- Chọn lớp học phần --</option>
                                    {lopHocPhans.map((lhp: LopHocPhanItem) => (
                                        <option key={lhp.id} value={lhp.id}>
                                            {lhp.maLopHocPhan} — {lhp.tenMonHoc} ({lhp.tenHocKi})
                                        </option>
                                    ))}
                                </select>
                            </div>

                            {previewSchedule.length > 0 && (
                                <div className="bg-blue-50 rounded-lg p-4 border border-blue-100">
                                    <div className="flex items-center gap-2 mb-3">
                                        <Calendar className="w-4 h-4 text-blue-600" />
                                        <span className="text-sm font-medium text-blue-800">Lịch học của lớp</span>
                                    </div>
                                    <div className="space-y-2">
                                        {previewSchedule.map((lich: LichItem, idx: number) => (
                                            <div key={lich.id || idx} className="flex items-center gap-3 text-sm">
                                                <Clock className="w-4 h-4 text-gray-400 flex-shrink-0" />
                                                <div className="flex-1">
                                                    <span className="text-gray-700">{formatDate(lich.ngayHoc)}</span>
                                                    <span className="mx-2 text-gray-300">•</span>
                                                    <span className="text-gray-600">
                                                        {lich.gioHoc?.tenGioHoc || `${formatTime(lich.gioHoc?.gioBatDau)} - ${formatTime(lich.gioHoc?.gioKetThuc)}`}
                                                    </span>
                                                </div>
                                                <span className="text-xs text-gray-500">
                                                    {lich.phong?.maPhong || 'N/A'}
                                                </span>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}

                            {scheduleConflict && (
                                <div className="bg-red-50 rounded-lg p-4 border border-red-200">
                                    <div className="flex items-start gap-3">
                                        <AlertTriangle className="w-5 h-5 text-red-500 flex-shrink-0 mt-0.5" />
                                        <div className="flex-1">
                                            <span className="text-sm font-medium text-red-800">Xung đột lịch giảng dạy!</span>
                                            <div className="mt-2 text-xs text-red-600 space-y-1">
                                                <p>Lớp <strong>{scheduleConflict.existingClass}</strong> đã có lịch:</p>
                                                <p className="pl-2">• {scheduleConflict.existingDate} ({scheduleConflict.existingTime})</p>
                                                <p>Lớp mới <strong>{scheduleConflict.newClass}</strong> trùng lịch:</p>
                                                <p className="pl-2">• {scheduleConflict.newDate} ({scheduleConflict.newTime})</p>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            )}

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1.5">
                                    Vai trò
                                </label>
                                <select
                                    value={formVaiTro}
                                    onChange={e => setFormVaiTro(e.target.value)}
                                    className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                                >
                                    {VAI_TRO_OPTIONS.map(opt => (
                                        <option key={opt.value} value={opt.value}>
                                            {opt.label}
                                        </option>
                                    ))}
                                </select>
                            </div>
                        </div>

                        <div className="mt-6 flex justify-end gap-3">
                            <button
                                onClick={() => setShowAssignForm(false)}
                                className="px-4 py-2 text-sm text-gray-600 border border-gray-300 rounded-lg hover:bg-gray-50"
                            >
                                Hủy
                            </button>
                            <button
                                onClick={handleSubmit}
                                className={`flex items-center gap-2 px-5 py-2 text-sm rounded-lg disabled:cursor-not-allowed ${scheduleConflict
                                    ? 'bg-orange-500 hover:bg-orange-600 text-white'
                                    : 'bg-blue-600 hover:bg-blue-700 text-white'
                                    } disabled:bg-gray-300`}
                                disabled={!formLhpId || !formNvId}
                            >
                                <UserCheck className="w-4 h-4" />
                                {editingId ? 'Cập nhật' : 'Xác nhận phân công'}
                            </button>
                        </div>
                    </div>
                </div>
            )}

            <div className="fixed bottom-5 right-5 z-50 space-y-2">
                {toasts.map(t => (
                    <div
                        key={t.id}
                        className={`flex items-center gap-2.5 px-4 py-3 rounded-xl shadow-lg text-sm font-medium
                            ${t.type === 'success' ? 'bg-green-600 text-white' :
                                t.type === 'error' ? 'bg-red-600 text-white' :
                                    'bg-gray-800 text-white'}`}
                    >
                        {t.type === 'success' && <CheckCircle className="w-4 h-4" />}
                        {t.type === 'error' && <AlertCircle className="w-4 h-4" />}
                        {t.message}
                    </div>
                ))}
            </div>
        </div>
    );
}
