import { useEffect, useState, useMemo } from 'react';
import { AdminSidebar } from '@/components/layouts/AdminSidebar';
import { AdminHeader } from '@/components/layouts/AdminHeader';
import {
    BookOpen, Search, Plus, Trash2, RefreshCw, AlertCircle, CheckCircle,
    GraduationCap, BarChart3, X, Eye, Edit, ChevronLeft, ChevronRight,
    CheckSquare, Square, CreditCard, Lock, AlertTriangle, UserCheck,
} from 'lucide-react';
import AiAssistantButton from '@/imports/AiAssistantButton-4-13343';
import { useAuth } from '@/hooks';
import * as dangKyApi from '@/api/admin/dang-ky-tin-chi.api';
import * as lhpApi from '@/api/admin/lop-hoc-phan.api';
import * as hocKiApi from '@/api/admin/hocki.api';
import type { DangKyTinChiItem, HocVienDangKyView } from '@/api/admin/dang-ky-tin-chi.api';
import type { LopHocPhanItem } from '@/api/admin/lop-hoc-phan.api';

const PAGE_SIZE = 10;

interface Toast { id: string; message: string; type: 'success' | 'error' | 'info'; }
interface HocKiItem { id: string; maHocKi: string; tenHocKi: string; }

// ── Helpers (module-level, never re-created) ────────────────────────────────

const extractError = (err: unknown, fallback: string): string => {
    if (err && typeof err === 'object') {
        const e = err as { response?: { data?: { detail?: string; message?: string } } };
        return e.response?.data?.detail || e.response?.data?.message || fallback;
    }
    return fallback;
};

const mapBackendError = (detail: string): string => {
    const d = (detail || '').toLowerCase();
    if (d.includes('trùng lịch') || d.includes('trung lich') || d.includes('lich hoc'))
        return 'Học viên có lớp học phần trùng lịch với lớp này';
    if (d.includes('đã đăng ký lớp') || d.includes('da dang ky lop') || (d.includes('đã đăng ký') && d.includes('lớp')))
        return 'Học viên đã đăng ký lớp học phần này rồi';
    if (d.includes('cùng kỳ') || d.includes('cung ky') || d.includes('môn học này') || d.includes('mon hoc nay'))
        return 'Học viên đã đăng ký môn học này trong cùng học kỳ';
    if (d.includes('hết hạn') || d.includes('het han') || d.includes('da het han') || d.includes('qua han'))
        return 'Lớp học phần đã hết hạn đăng ký';
    if (d.includes('vượt quá') || d.includes('tín chỉ tối đa') || d.includes('tin chi toi da'))
        return 'Học viên đã vượt quá số tín chỉ tối đa trong học kỳ này';
    if (d.includes('đã đầy') || d.includes('da day') || d.includes('lop hoc phan da day') || d.includes('đầy'))
        return 'Lớp học phần đã đầy, không còn chỗ trống';
    if (d.includes('tiên quyết') || d.includes('tien quyet') || d.includes('chua hoc'))
        return 'Học viên chưa hoàn thành môn học tiên quyết';
    if (d.includes('đã học') || d.includes('da hoc mon') || d.includes('ban da hoc'))
        return 'Học viên đã học và hoàn thành môn này rồi';
    if (d.includes('da dang ky') || d.includes('đã đăng ký'))
        return 'Học viên đã đăng ký lớp học phần này rồi';
    return detail || 'Thêm đăng ký thất bại';
};

const formatCurrency = (amount: number) =>
    new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(amount);

const formatDate = (dateStr: string | undefined | null) => {
    if (!dateStr) return '-';
    try {
        return new Date(dateStr).toLocaleString('vi-VN', {
            day: '2-digit', month: '2-digit', year: 'numeric',
            hour: '2-digit', minute: '2-digit',
        });
    } catch { return dateStr; }
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

// ── Combobox (module-level — KHÔNG được định nghĩa bên trong component) ────
interface ComboboxProps<T> {
    value: string;
    searchText: string;
    onSearchChange: (text: string) => void;
    onSelect: (item: T) => void;
    onClear: () => void;
    options: T[];
    getKey: (item: T) => string;
    getLabel: (item: T) => string;
    getSub: (item: T) => string;
    placeholder: string;
    showDrop: boolean;
    onFocus: () => void;
    onBlur: () => void;
}

function Combobox<T>({
    value, searchText, onSearchChange, onSelect, onClear,
    options, getKey, getLabel, getSub, placeholder, showDrop, onFocus, onBlur,
}: ComboboxProps<T>) {
    return (
        <div className="relative">
            <div className="relative flex items-center">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
                <input
                    type="text"
                    value={searchText}
                    onChange={e => onSearchChange(e.target.value)}
                    onFocus={onFocus}
                    onBlur={onBlur}
                    placeholder={placeholder}
                    className={`w-full pl-9 pr-8 py-2.5 border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all ${
                        value ? 'border-blue-400 bg-blue-50/40' : 'border-slate-300'
                    }`}
                />
                {value && (
                    <button
                        type="button"
                        onMouseDown={onClear}
                        className="absolute right-2.5 top-1/2 -translate-y-1/2 p-0.5 text-slate-400 hover:text-slate-600"
                    >
                        <X className="w-3.5 h-3.5" />
                    </button>
                )}
            </div>
            {showDrop && (
                <div className="absolute z-40 top-full left-0 right-0 mt-1 bg-white border border-slate-200 rounded-lg shadow-xl max-h-52 overflow-y-auto">
                    {options.length > 0 ? options.map(item => (
                        <div
                            key={getKey(item)}
                            onMouseDown={() => onSelect(item)}
                            className="px-4 py-2.5 hover:bg-blue-50 cursor-pointer border-b border-slate-50 last:border-0"
                        >
                            <p className="text-sm font-semibold text-slate-800 truncate">{getLabel(item)}</p>
                            <p className="text-xs text-slate-500 truncate mt-0.5">{getSub(item)}</p>
                        </div>
                    )) : (
                        <div className="px-4 py-4 text-sm text-slate-400 text-center">Không tìm thấy kết quả</div>
                    )}
                </div>
            )}
        </div>
    );
}

// ── CapacityBar (module-level) ──────────────────────────────────────────────
function CapacityBar({ lhp }: { lhp: LopHocPhanItem }) {
    const pct = lhp.soLuongToiDa > 0 ? (lhp.soLuongDaDangKy / lhp.soLuongToiDa) * 100 : 0;
    const color = pct >= 100 ? 'bg-red-500' : pct >= 80 ? 'bg-amber-500' : 'bg-green-500';
    const textColor = pct >= 100 ? 'text-red-700' : pct >= 80 ? 'text-amber-700' : 'text-green-700';
    return (
        <div className="space-y-1">
            <div className="flex justify-between text-xs">
                <span className="text-slate-500">Sĩ số:</span>
                <span className={`font-semibold ${textColor}`}>
                    {lhp.soLuongDaDangKy}/{lhp.soLuongToiDa}{pct >= 100 && ' (Đầy)'}
                </span>
            </div>
            <div className="w-full h-1.5 bg-slate-200 rounded-full overflow-hidden">
                <div className={`h-full rounded-full transition-all ${color}`} style={{ width: `${Math.min(pct, 100)}%` }} />
            </div>
        </div>
    );
}

// ── Main Page ───────────────────────────────────────────────────────────────
export default function AdminCreditRegistrationsPage() {
    const { user } = useAuth();
    const userPermissions = user?.permissions ?? [];
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

    // Data
    const [hocKis, setHocKis] = useState<HocKiItem[]>([]);
    const [allLhp, setAllLhp] = useState<LopHocPhanItem[]>([]);
    const [hocViens, setHocViens] = useState<HocVienDangKyView[]>([]);

    // Pagination & selection
    const [currentPage, setCurrentPage] = useState(1);
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

    // Form: selected IDs
    const [formHocVien, setFormHocVien] = useState('');
    const [formLopHP, setFormLopHP] = useState('');

    // Combobox search text & dropdown visibility
    const [hvSearch, setHvSearch] = useState('');
    const [showHvDrop, setShowHvDrop] = useState(false);
    const [lhpSearch, setLhpSearch] = useState('');
    const [showLhpDrop, setShowLhpDrop] = useState(false);

    // ── Toast ─────────────────────────────────────────────────────────────
    const addToast = (message: string, type: 'success' | 'error' | 'info' = 'info') => {
        const id = Date.now().toString();
        setToasts(p => [...p, { id, message, type }]);
        setTimeout(() => setToasts(p => p.filter(t => t.id !== id)), 4500);
    };

    // ── Data fetch ────────────────────────────────────────────────────────
    const fetchAll = async () => {
        try {
            setLoading(true);
            const [regData, hocKiData, lhpData, hocVienData] = await Promise.all([
                dangKyApi.getAllDangKyTinChi(),
                hocKiApi.getAllHocKi(),
                lhpApi.getLopHocPhan(),
                dangKyApi.getHocVienDangKy(),
            ]);
            setRegistrations(regData || []);
            setHocKis(hocKiData || []);
            setAllLhp(lhpData || []);
            setHocViens(hocVienData || []);
        } catch (err) {
            addToast(extractError(err, 'Lỗi khi tải dữ liệu'), 'error');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => { fetchAll(); }, []);
    useEffect(() => { setCurrentPage(1); setSelectedIds(new Set()); }, [search, filterHocKi, filterLopHP]);

    // ── Combobox options ──────────────────────────────────────────────────
    const hvOptions = useMemo(() => {
        const q = hvSearch.toLowerCase();
        const list = q
            ? hocViens.filter(hv =>
                hv.maHocVien.toLowerCase().includes(q) ||
                hv.hoTen.toLowerCase().includes(q) ||
                (hv.email || '').toLowerCase().includes(q))
            : hocViens;
        return list.slice(0, 30);
    }, [hocViens, hvSearch]);

    const lhpOptions = useMemo(() => {
        const q = lhpSearch.toLowerCase();
        const list = q
            ? allLhp.filter(lhp =>
                lhp.maLopHocPhan.toLowerCase().includes(q) ||
                lhp.tenMonHoc.toLowerCase().includes(q) ||
                lhp.maMonHoc.toLowerCase().includes(q) ||
                (lhp.maHocKi || '').toLowerCase().includes(q))
            : allLhp;
        return list.slice(0, 30);
    }, [allLhp, lhpSearch]);

    const selectedHv = useMemo(() => hocViens.find(hv => hv.id === formHocVien), [hocViens, formHocVien]);
    const selectedLhp = useMemo(() => allLhp.find(lhp => lhp.id === formLopHP), [allLhp, formLopHP]);

    // ── Pre-validation warnings ───────────────────────────────────────────
    const formWarnings = useMemo((): { msg: string; isBlocking: boolean }[] => {
        if (!formHocVien || !selectedLhp) return [];
        const w: { msg: string; isBlocking: boolean }[] = [];

        if (registrations.some(r => r.hocVienId === formHocVien && r.lopHocPhanId === formLopHP)) {
            return [{ msg: 'Học viên đã đăng ký lớp học phần này rồi', isBlocking: true }];
        }
        if (registrations.some(r =>
            r.hocVienId === formHocVien &&
            r.monHocId === selectedLhp.monHocId &&
            r.hocKiId === selectedLhp.hocKiId
        )) {
            w.push({ msg: 'Học viên đã đăng ký môn học này trong học kỳ này (lớp khác)', isBlocking: true });
        }
        if (selectedLhp.soLuongDaDangKy >= selectedLhp.soLuongToiDa) {
            w.push({ msg: 'Lớp học phần đã đầy, không còn chỗ trống', isBlocking: true });
        }
        if (selectedLhp.hanDangKy && new Date(selectedLhp.hanDangKy) < new Date()) {
            w.push({ msg: 'Lớp học phần đã qua hạn đăng ký — admin vẫn có thể đăng ký bổ sung', isBlocking: false });
        }
        if (selectedLhp.trangThai !== 'MO_DANG_KY') {
            w.push({ msg: `Lớp đang ở trạng thái "${getTrangThaiLabel(selectedLhp.trangThai)}" — admin vẫn có thể đăng ký bổ sung`, isBlocking: false });
        }
        return w;
    }, [formHocVien, formLopHP, selectedLhp, registrations]);

    const hasBlockingWarning = formWarnings.some(w => w.isBlocking);

    // ── Toolbar filter: chỉ lớp có đăng ký ──────────────────────────────
    const lhpFilterOptions = useMemo(() => {
        const regIds = new Set(registrations.map(r => r.lopHocPhanId));
        return allLhp.filter(lhp => regIds.has(lhp.id));
    }, [allLhp, registrations]);

    // ── Table filter ──────────────────────────────────────────────────────
    const filtered = useMemo(() => registrations.filter(r => {
        const q = search.toLowerCase();
        const matchSearch = !q ||
            (r.maHocVien || '').toLowerCase().includes(q) ||
            (r.hoTen || '').toLowerCase().includes(q) ||
            (r.maLopHocPhan || '').toLowerCase().includes(q) ||
            (r.tenMonHoc || '').toLowerCase().includes(q) ||
            (r.maMonHoc || '').toLowerCase().includes(q);
        return matchSearch &&
            (!filterHocKi || r.hocKiId === filterHocKi) &&
            (!filterLopHP || r.lopHocPhanId === filterLopHP);
    }), [registrations, search, filterHocKi, filterLopHP]);

    const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
    const paginated = filtered.slice((currentPage - 1) * PAGE_SIZE, currentPage * PAGE_SIZE);

    const uniqueHocVien = new Set(registrations.map(r => r.hocVienId)).size;
    const totalTinChi = registrations.reduce((sum, r) => sum + (r.soTinChi || 0), 0);
    const lopHPWithReg = new Set(registrations.map(r => r.lopHocPhanId)).size;

    // ── Form helpers ──────────────────────────────────────────────────────
    const resetForm = () => {
        setFormHocVien(''); setHvSearch(''); setShowHvDrop(false);
        setFormLopHP(''); setLhpSearch(''); setShowLhpDrop(false);
    };

    const selectHv = (hv: HocVienDangKyView) => {
        setFormHocVien(hv.id);
        setHvSearch(`${hv.maHocVien} — ${hv.hoTen}`);
        setShowHvDrop(false);
    };

    const selectLhp = (lhp: LopHocPhanItem) => {
        setFormLopHP(lhp.id);
        setLhpSearch(`${lhp.maLopHocPhan} — ${lhp.tenMonHoc}`);
        setShowLhpDrop(false);
    };

    // ── Actions ───────────────────────────────────────────────────────────
    const openAdd = () => { resetForm(); setIsAddOpen(true); };

    const handleAdd = async () => {
        if (!formHocVien || !formLopHP) { addToast('Vui lòng chọn đầy đủ học viên và lớp học phần', 'error'); return; }
        if (hasBlockingWarning) { addToast(formWarnings.find(w => w.isBlocking)!.msg, 'error'); return; }
        try {
            setIsSubmitting(true);
            await dangKyApi.createDangKyTinChi({ hocVienId: formHocVien, lopHocPhanId: formLopHP });
            addToast('Đăng ký tín chỉ thành công', 'success');
            setIsAddOpen(false);
            await fetchAll();
        } catch (err) {
            addToast(mapBackendError(extractError(err, '')), 'error');
        } finally {
            setIsSubmitting(false);
        }
    };

    const openEdit = (item: DangKyTinChiItem) => {
        setSelectedItem(item);
        setFormHocVien(item.hocVienId); setHvSearch(`${item.maHocVien} — ${item.hoTen}`);
        setFormLopHP(item.lopHocPhanId); setLhpSearch(`${item.maLopHocPhan} — ${item.tenMonHoc}`);
        setShowHvDrop(false); setShowLhpDrop(false);
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
            addToast(mapBackendError(extractError(err, '')), 'error');
        } finally {
            setIsSubmitting(false);
        }
    };

    const openDetail = (item: DangKyTinChiItem) => { setSelectedItem(item); setIsDetailOpen(true); };
    const openDelete = (id: string) => { setDeletingId(id); setIsDeleteOpen(true); };

    const confirmDelete = async () => {
        if (!deletingId) return;
        try {
            await dangKyApi.deleteDangKyTinChi(deletingId);
            addToast('Xóa đăng ký thành công', 'success');
            await fetchAll();
        } catch (err) {
            addToast(extractError(err, 'Lỗi khi xóa đăng ký'), 'error');
        } finally {
            setIsDeleteOpen(false); setDeletingId(null);
        }
    };

    const openMultiDelete = () => {
        if (selectedIds.size === 0) { addToast('Vui lòng chọn ít nhất một đăng ký để xóa', 'info'); return; }
        setIsMultiDeleteOpen(true);
    };

    const confirmMultiDelete = async () => {
        try {
            await dangKyApi.deleteDangKyTinChiList(Array.from(selectedIds));
            addToast(`Đã xóa ${selectedIds.size} đăng ký`, 'success');
            setSelectedIds(new Set()); setIsMultiDeleteOpen(false);
            await fetchAll();
        } catch (err) {
            addToast(extractError(err, 'Lỗi khi xóa nhiều đăng ký'), 'error');
        }
    };

    const toggleSelectAll = () =>
        setSelectedIds(selectedIds.size === paginated.length ? new Set() : new Set(paginated.map(r => r.id)));

    const toggleSelect = (id: string) => {
        const next = new Set(selectedIds);
        next.has(id) ? next.delete(id) : next.add(id);
        setSelectedIds(next);
    };

    // ── Form JSX (biến thường, KHÔNG phải component — tránh re-mount) ────
    // Quan trọng: dùng {formJsx} trong JSX thay vì <FormBody /> để React
    // không tạo component mới mỗi render (gây mất focus sau mỗi ký tự).
    const formJsx = (
        <div className="space-y-4">
            {/* Học viên */}
            <div>
                <label className="block text-sm font-medium text-slate-700 mb-1.5">
                    Học viên <span className="text-red-500">*</span>
                </label>
                <Combobox<HocVienDangKyView>
                    value={formHocVien}
                    searchText={hvSearch}
                    onSearchChange={text => { setHvSearch(text); setFormHocVien(''); setShowHvDrop(true); }}
                    onSelect={selectHv}
                    onClear={() => { setFormHocVien(''); setHvSearch(''); }}
                    options={hvOptions}
                    getKey={hv => hv.id}
                    getLabel={hv => `${hv.maHocVien} — ${hv.hoTen}`}
                    getSub={hv => `${hv.nganhTen || ''}${hv.email ? ' · ' + hv.email : ''}`}
                    placeholder="Tìm theo mã HV, họ tên, email..."
                    showDrop={showHvDrop}
                    onFocus={() => { setShowHvDrop(true); setShowLhpDrop(false); }}
                    onBlur={() => setTimeout(() => setShowHvDrop(false), 150)}
                />
                {selectedHv && (
                    <p className="mt-1.5 flex items-center gap-1.5 text-xs text-green-700">
                        <UserCheck className="w-3.5 h-3.5" />
                        <span>Đã chọn: <b>{selectedHv.maHocVien}</b> — {selectedHv.hoTen}</span>
                    </p>
                )}
            </div>

            {/* Lớp học phần */}
            <div>
                <label className="block text-sm font-medium text-slate-700 mb-1.5">
                    Lớp học phần <span className="text-red-500">*</span>
                </label>
                <Combobox<LopHocPhanItem>
                    value={formLopHP}
                    searchText={lhpSearch}
                    onSearchChange={text => { setLhpSearch(text); setFormLopHP(''); setShowLhpDrop(true); }}
                    onSelect={selectLhp}
                    onClear={() => { setFormLopHP(''); setLhpSearch(''); }}
                    options={lhpOptions}
                    getKey={lhp => lhp.id}
                    getLabel={lhp => `${lhp.maLopHocPhan} — ${lhp.tenMonHoc}`}
                    getSub={lhp => `${lhp.soTinChi} TC · ${lhp.maHocKi} · ${getTrangThaiLabel(lhp.trangThai)} · ${lhp.soLuongDaDangKy}/${lhp.soLuongToiDa} SV`}
                    placeholder="Tìm theo mã lớp, tên môn, mã môn, học kỳ..."
                    showDrop={showLhpDrop}
                    onFocus={() => { setShowLhpDrop(true); setShowHvDrop(false); }}
                    onBlur={() => setTimeout(() => setShowLhpDrop(false), 150)}
                />
            </div>

            {/* Card thông tin lớp đã chọn */}
            {selectedLhp && (
                <div className="bg-blue-50 border border-blue-200 rounded-xl px-4 py-3 space-y-2.5">
                    <div className="flex items-center justify-between">
                        <span className="text-xs font-semibold text-blue-700 uppercase tracking-wide flex items-center gap-1.5">
                            <CreditCard className="w-3.5 h-3.5" /> Thông tin lớp học phần
                        </span>
                        <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${getTrangThaiColor(selectedLhp.trangThai)}`}>
                            {getTrangThaiLabel(selectedLhp.trangThai)}
                        </span>
                    </div>
                    <div className="grid grid-cols-2 gap-x-4 gap-y-1.5 text-sm">
                        <div><span className="text-slate-500 text-xs">Môn học:</span> <span className="font-medium text-slate-800">{selectedLhp.tenMonHoc}</span></div>
                        <div><span className="text-slate-500 text-xs">Tín chỉ:</span> <span className="font-semibold text-blue-700">{selectedLhp.soTinChi} TC</span></div>
                        <div><span className="text-slate-500 text-xs">Học kỳ:</span> <span className="font-medium text-slate-700">{selectedLhp.tenHocKi} ({selectedLhp.maHocKi})</span></div>
                        <div><span className="text-slate-500 text-xs">Học phí:</span> <span className="font-semibold text-amber-700">{formatCurrency(selectedLhp.soTinChi * 700000)}</span></div>
                        <div className="col-span-2"><span className="text-slate-500 text-xs">Hạn đăng ký:</span> <span className="font-medium text-slate-700"> {formatDate(selectedLhp.hanDangKy)}</span></div>
                    </div>
                    <CapacityBar lhp={selectedLhp} />
                </div>
            )}

            {/* Cảnh báo validation */}
            {formWarnings.length > 0 && (
                <div className="space-y-2">
                    {formWarnings.map((w, i) => (
                        <div key={i} className={`flex items-start gap-2 px-3 py-2.5 rounded-lg text-sm border ${
                            w.isBlocking
                                ? 'bg-red-50 border-red-200 text-red-700'
                                : 'bg-amber-50 border-amber-200 text-amber-700'
                        }`}>
                            {w.isBlocking
                                ? <AlertCircle className="w-4 h-4 flex-shrink-0 mt-0.5" />
                                : <AlertTriangle className="w-4 h-4 flex-shrink-0 mt-0.5" />}
                            <span>{w.msg}</span>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );

    // ═══════════════════════════════════════════════════════════════════════
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
                                <div><p className="text-xl font-bold text-slate-900">{registrations.length}</p><p className="text-xs text-slate-500">Tổng lượt đăng ký</p></div>
                            </div>
                            <div className="bg-white border border-slate-200 rounded-xl px-5 py-3 flex items-center gap-3 shadow-sm">
                                <div className="rounded-lg bg-green-100 p-2.5"><GraduationCap className="w-5 h-5 text-green-600" /></div>
                                <div><p className="text-xl font-bold text-green-700">{uniqueHocVien}</p><p className="text-xs text-slate-500">Học viên đã đăng ký</p></div>
                            </div>
                            <div className="bg-white border border-slate-200 rounded-xl px-5 py-3 flex items-center gap-3 shadow-sm">
                                <div className="rounded-lg bg-purple-100 p-2.5"><BarChart3 className="w-5 h-5 text-purple-600" /></div>
                                <div><p className="text-xl font-bold text-purple-700">{lopHPWithReg}</p><p className="text-xs text-slate-500">Lớp HP có đăng ký</p></div>
                            </div>
                            <div className="bg-white border border-slate-200 rounded-xl px-5 py-3 flex items-center gap-3 shadow-sm">
                                <div className="rounded-lg bg-amber-100 p-2.5"><CreditCard className="w-5 h-5 text-amber-600" /></div>
                                <div><p className="text-xl font-bold text-amber-700">{totalTinChi}</p><p className="text-xs text-slate-500">Tổng tín chỉ</p></div>
                            </div>
                        </div>

                        {/* Toolbar */}
                        <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
                            <div className="px-5 py-4 border-b border-slate-100">
                                <div className="flex flex-wrap gap-3 items-center justify-between">
                                    <div className="flex flex-wrap gap-2 items-center">
                                        {canCreate ? (
                                            <button onClick={openAdd} className="flex items-center gap-1.5 px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700 transition-colors">
                                                <Plus className="w-4 h-4" /> Thêm đăng ký
                                            </button>
                                        ) : (
                                            <div className="flex items-center gap-1.5 px-4 py-2 bg-slate-100 text-slate-400 rounded-lg text-sm">
                                                <Lock className="w-4 h-4" /> Không có quyền thêm
                                            </div>
                                        )}
                                        {(canDelete || canCancel) && selectedIds.size > 0 && (
                                            <button onClick={openMultiDelete} className="flex items-center gap-1.5 px-4 py-2 bg-red-600 text-white rounded-lg text-sm font-medium hover:bg-red-700 transition-colors">
                                                <Trash2 className="w-4 h-4" /> Xóa ({selectedIds.size})
                                            </button>
                                        )}
                                    </div>
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
                                        <select value={filterHocKi} onChange={e => setFilterHocKi(e.target.value)} className="py-2 px-3 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500">
                                            <option value="">Tất cả học kì</option>
                                            {hocKis.map(hk => <option key={hk.id} value={hk.id}>{hk.maHocKi} — {hk.tenHocKi}</option>)}
                                        </select>
                                        <select value={filterLopHP} onChange={e => setFilterLopHP(e.target.value)} className="py-2 px-3 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500">
                                            <option value="">Tất cả lớp HP</option>
                                            {lhpFilterOptions.map(lhp => <option key={lhp.id} value={lhp.id}>{lhp.maLopHocPhan} — {lhp.tenMonHoc}</option>)}
                                        </select>
                                        <button onClick={fetchAll} className="p-2 border border-slate-300 rounded-lg text-slate-600 hover:bg-slate-50 transition-colors" title="Làm mới">
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
                                                        {selectedIds.size === paginated.length && paginated.length > 0 ? <CheckSquare className="w-4 h-4" /> : <Square className="w-4 h-4" />}
                                                    </button>
                                                </th>
                                                <th className="px-3 py-3 text-left font-semibold">Mã HV</th>
                                                <th className="px-3 py-3 text-left font-semibold">Họ tên</th>
                                                <th className="px-3 py-3 text-left font-semibold">Lớp HP</th>
                                                <th className="px-3 py-3 text-left font-semibold">Môn học</th>
                                                <th className="px-3 py-3 text-center font-semibold">Tín chỉ</th>
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
                                                            {selectedIds.has(r.id) ? <CheckSquare className="w-4 h-4 text-blue-600" /> : <Square className="w-4 h-4 text-slate-400" />}
                                                        </button>
                                                    </td>
                                                    <td className="px-3 py-3 font-semibold text-slate-800">{r.maHocVien || '-'}</td>
                                                    <td className="px-3 py-3 text-slate-700 max-w-[140px] truncate">{r.hoTen || '-'}</td>
                                                    <td className="px-3 py-3 text-blue-600 font-medium">{r.maLopHocPhan || '-'}</td>
                                                    <td className="px-3 py-3 text-slate-600 max-w-[160px] truncate" title={r.tenMonHoc}>{r.tenMonHoc || r.maMonHoc || '-'}</td>
                                                    <td className="px-3 py-3 text-center">
                                                        <span className="px-2 py-0.5 bg-blue-100 text-blue-700 rounded-full text-xs font-semibold">{r.soTinChi || 0} TC</span>
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
                                                            <button onClick={() => openDetail(r)} className="p-1.5 text-slate-500 hover:bg-slate-100 rounded-lg" title="Xem chi tiết"><Eye className="w-4 h-4" /></button>
                                                            {canCreate && <button onClick={() => openEdit(r)} className="p-1.5 text-blue-500 hover:bg-blue-100 rounded-lg" title="Cập nhật"><Edit className="w-4 h-4" /></button>}
                                                            {(canCancel || canDelete) && <button onClick={() => openDelete(r.id)} className="p-1.5 text-red-500 hover:bg-red-100 rounded-lg" title="Xóa"><Trash2 className="w-4 h-4" /></button>}
                                                        </div>
                                                    </td>
                                                </tr>
                                            ))}
                                            {paginated.length === 0 && (
                                                <tr>
                                                    <td colSpan={10} className="py-14 text-center">
                                                        <div className="flex flex-col items-center gap-2">
                                                            <div className="rounded-full bg-slate-100 p-4"><BookOpen className="w-8 h-8 text-slate-400" /></div>
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
                                        Hiển thị {(currentPage - 1) * PAGE_SIZE + 1}–{Math.min(currentPage * PAGE_SIZE, filtered.length)} trong {filtered.length} đăng ký
                                    </p>
                                    <div className="flex items-center gap-1">
                                        <button onClick={() => setCurrentPage(p => Math.max(1, p - 1))} disabled={currentPage === 1} className="p-1.5 rounded-lg border border-slate-300 text-slate-600 hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed">
                                            <ChevronLeft className="w-4 h-4" />
                                        </button>
                                        {Array.from({ length: totalPages }, (_, i) => i + 1)
                                            .filter(p => p === 1 || p === totalPages || Math.abs(p - currentPage) <= 1)
                                            .reduce<(number | '...')[]>((acc, p, i, arr) => {
                                                if (i > 0 && (p as number) - (arr[i - 1] as number) > 1) acc.push('...');
                                                acc.push(p); return acc;
                                            }, [])
                                            .map((p, i) => p === '...'
                                                ? <span key={`el-${i}`} className="px-2 text-slate-400">...</span>
                                                : <button key={p} onClick={() => setCurrentPage(p as number)} className={`w-8 h-8 rounded-lg text-sm font-medium ${currentPage === p ? 'bg-blue-600 text-white' : 'border border-slate-300 text-slate-600 hover:bg-slate-50'}`}>{p}</button>
                                            )}
                                        <button onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))} disabled={currentPage === totalPages} className="p-1.5 rounded-lg border border-slate-300 text-slate-600 hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed">
                                            <ChevronRight className="w-4 h-4" />
                                        </button>
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>

            {/* ═══ ADD MODAL ═══════════════════════════════════════════════════════ */}
            {isAddOpen && (
                <div className="fixed inset-0 bg-black/30 flex items-start justify-center z-50 p-4 pt-14 overflow-y-auto" onClick={() => setIsAddOpen(false)}>
                    <div className="bg-white rounded-2xl shadow-2xl max-w-lg w-full mb-4" onClick={e => e.stopPropagation()}>
                        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100">
                            <div>
                                <h3 className="font-bold text-lg text-slate-900">Thêm đăng ký tín chỉ</h3>
                                <p className="text-xs text-slate-400 mt-0.5">Tìm và chọn học viên, sau đó chọn lớp học phần</p>
                            </div>
                            <button onClick={() => setIsAddOpen(false)} className="p-1.5 hover:bg-slate-100 rounded-lg"><X className="w-5 h-5 text-slate-500" /></button>
                        </div>
                        <div className="px-6 py-5">
                            {formJsx}
                        </div>
                        <div className="px-6 py-4 border-t border-slate-100 flex gap-3 justify-end">
                            <button onClick={() => setIsAddOpen(false)} className="px-4 py-2 border border-slate-300 rounded-lg text-sm font-medium text-slate-700 hover:bg-slate-50">Hủy</button>
                            <button
                                onClick={handleAdd}
                                disabled={isSubmitting || !formHocVien || !formLopHP || hasBlockingWarning}
                                className="px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                            >
                                {isSubmitting && <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />}
                                {isSubmitting ? 'Đang đăng ký...' : 'Xác nhận đăng ký'}
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* ═══ EDIT MODAL ══════════════════════════════════════════════════════ */}
            {isEditOpen && selectedItem && (
                <div className="fixed inset-0 bg-black/30 flex items-start justify-center z-50 p-4 pt-14 overflow-y-auto" onClick={() => setIsEditOpen(false)}>
                    <div className="bg-white rounded-2xl shadow-2xl max-w-lg w-full mb-4" onClick={e => e.stopPropagation()}>
                        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100">
                            <div>
                                <h3 className="font-bold text-lg text-slate-900">Cập nhật đăng ký tín chỉ</h3>
                                <p className="text-xs text-slate-400 mt-0.5">Ngày đăng ký: {formatDate(selectedItem.createdAt)}</p>
                            </div>
                            <button onClick={() => setIsEditOpen(false)} className="p-1.5 hover:bg-slate-100 rounded-lg"><X className="w-5 h-5 text-slate-500" /></button>
                        </div>
                        <div className="px-6 py-5">
                            {formJsx}
                        </div>
                        <div className="px-6 py-4 border-t border-slate-100 flex gap-3 justify-end">
                            <button onClick={() => setIsEditOpen(false)} className="px-4 py-2 border border-slate-300 rounded-lg text-sm font-medium text-slate-700 hover:bg-slate-50">Hủy</button>
                            <button
                                onClick={handleEdit}
                                disabled={isSubmitting || !formHocVien || !formLopHP}
                                className="px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                            >
                                {isSubmitting && <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />}
                                {isSubmitting ? 'Đang cập nhật...' : 'Lưu cập nhật'}
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* ═══ DETAIL MODAL ════════════════════════════════════════════════════ */}
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
                                    <div><p className="text-xs text-slate-400 uppercase tracking-wide font-medium">Mã học viên</p><p className="font-semibold text-slate-800">{selectedItem.maHocVien || '-'}</p></div>
                                    <div><p className="text-xs text-slate-400 uppercase tracking-wide font-medium">Họ tên</p><p className="font-semibold text-slate-800">{selectedItem.hoTen || '-'}</p></div>
                                    <div><p className="text-xs text-slate-400 uppercase tracking-wide font-medium">Email</p><p className="text-slate-600">{selectedItem.email || '-'}</p></div>
                                    <div><p className="text-xs text-slate-400 uppercase tracking-wide font-medium">SĐT</p><p className="text-slate-600">{selectedItem.soDienThoai || '-'}</p></div>
                                </div>
                                <div className="space-y-3">
                                    <div><p className="text-xs text-slate-400 uppercase tracking-wide font-medium">Lớp học phần</p><p className="font-semibold text-blue-600">{selectedItem.maLopHocPhan || '-'}</p></div>
                                    <div><p className="text-xs text-slate-400 uppercase tracking-wide font-medium">Môn học</p><p className="font-semibold text-slate-800">{selectedItem.tenMonHoc || selectedItem.maMonHoc || '-'}</p></div>
                                    <div><p className="text-xs text-slate-400 uppercase tracking-wide font-medium">Học kì</p><p className="text-slate-600">{selectedItem.hocKiTen || '-'} ({selectedItem.hocKiMa || '-'})</p></div>
                                    <div>
                                        <p className="text-xs text-slate-400 uppercase tracking-wide font-medium">Trạng thái lớp</p>
                                        <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${getTrangThaiColor(selectedItem.trangThaiLopHocPhan)}`}>
                                            {getTrangThaiLabel(selectedItem.trangThaiLopHocPhan)}
                                        </span>
                                    </div>
                                </div>
                            </div>
                            <div className="mt-4 pt-4 border-t border-slate-100 grid grid-cols-3 gap-4">
                                <div className="bg-blue-50 border border-blue-200 rounded-lg px-4 py-3 text-center">
                                    <p className="text-2xl font-bold text-blue-700">{selectedItem.soTinChi || 0}</p>
                                    <p className="text-xs text-blue-600 font-medium">Tín chỉ</p>
                                </div>
                                <div className="bg-amber-50 border border-amber-200 rounded-lg px-4 py-3 text-center">
                                    <p className="text-sm font-bold text-amber-700">{selectedItem.tienHocPhi ? formatCurrency(selectedItem.tienHocPhi) : '-'}</p>
                                    <p className="text-xs text-amber-600 font-medium">Học phí</p>
                                </div>
                                <div className="bg-green-50 border border-green-200 rounded-lg px-4 py-3 text-center">
                                    <p className="text-xs text-green-600 font-medium">Ngày đăng ký</p>
                                    <p className="text-xs font-semibold text-green-700 mt-0.5">{formatDate(selectedItem.createdAt)}</p>
                                </div>
                            </div>
                            <div className="mt-4 flex gap-3">
                                {canCreate && (
                                    <button onClick={() => { setIsDetailOpen(false); openEdit(selectedItem); }} className="flex-1 py-2.5 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700 flex items-center justify-center gap-2">
                                        <Edit className="w-4 h-4" /> Cập nhật
                                    </button>
                                )}
                                {(canCancel || canDelete) && (
                                    <button onClick={() => { setIsDetailOpen(false); openDelete(selectedItem.id); }} className="flex-1 py-2.5 bg-red-600 text-white rounded-lg text-sm font-medium hover:bg-red-700 flex items-center justify-center gap-2">
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

            {/* ═══ DELETE CONFIRM ══════════════════════════════════════════════════ */}
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

            {/* ═══ MULTI DELETE CONFIRM ════════════════════════════════════════════ */}
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
                    <div key={t.id} className={`flex items-center gap-2.5 px-4 py-3 rounded-xl shadow-xl text-white text-sm font-medium max-w-xs pointer-events-auto ${
                        t.type === 'success' ? 'bg-green-600' : t.type === 'error' ? 'bg-red-600' : 'bg-blue-600'
                    }`}>
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
