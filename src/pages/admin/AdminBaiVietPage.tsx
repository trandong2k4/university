import { AdminSidebar } from '@/components/layouts/AdminSidebar';
import { AdminHeader } from '@/components/layouts/AdminHeader';
import AiAssistantButton from '@/imports/AiAssistantButton-4-13343';
import { useEffect, useState, useCallback, useMemo, FormEvent } from 'react';
import {
    Plus, Edit, Trash2, X, Search, RefreshCw, AlertCircle,
    FileText, Eye, EyeOff, Newspaper,
} from 'lucide-react';
import { useAuth } from '@/hooks';
import * as baiVietApi from '@/api/admin/bai-viet.api';
import type { BaiVietResponse, LoaiBaiVietEnum, TrangThaiBaiVietEnum } from '@/api/admin/bai-viet.api';
import { LOAI_BAI_VIET_LABEL, TRANG_THAI_LABEL } from '@/api/admin/bai-viet.api';

interface Toast { id: string; message: string; type: 'success' | 'error' | 'info'; }

const inp = 'w-full px-3 py-2.5 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent';
const lbl = 'block text-sm font-medium text-slate-700 mb-1.5';

const extractError = (err: unknown, fallback: string): string => {
    if (err && typeof err === 'object') {
        const e = err as { response?: { data?: unknown } };
        const data = e.response?.data;
        if (data && typeof data === 'object') {
            const d = data as Record<string, unknown>;
            if (d.errors && typeof d.errors === 'object' && !Array.isArray(d.errors)) {
                const msgs = Object.values(d.errors as Record<string, unknown>).map(v => String(v)).join('\n');
                if (msgs) return msgs;
            }
            if (typeof d.detail === 'string' && d.detail && d.detail !== 'Validation failed') return d.detail;
            if (typeof d.message === 'string' && d.message) return d.message;
            if (typeof d.detail === 'string' && d.detail) return d.detail;
        }
    }
    return fallback;
};

const LOAI_OPTIONS: LoaiBaiVietEnum[] = ['THONG_BAO', 'TAI_LIEU', 'CANH_BAO', 'HUONG_DAN', 'CONG_KHAI'];
const TRANG_THAI_OPTIONS: TrangThaiBaiVietEnum[] = ['CONG_KHAI', 'RIENG_TU', 'NHAP'];

const loaiBadgeClass: Record<LoaiBaiVietEnum, string> = {
    THONG_BAO: 'bg-blue-100 text-blue-700',
    TAI_LIEU: 'bg-purple-100 text-purple-700',
    CANH_BAO: 'bg-red-100 text-red-700',
    HUONG_DAN: 'bg-green-100 text-green-700',
    CONG_KHAI: 'bg-slate-100 text-slate-700',
};

const trangThaiBadgeClass: Record<TrangThaiBaiVietEnum, string> = {
    CONG_KHAI: 'bg-emerald-100 text-emerald-700',
    RIENG_TU: 'bg-amber-100 text-amber-700',
    NHAP: 'bg-slate-100 text-slate-500',
};

const defaultForm = {
    tieuDe: '',
    noiDung: '',
    hinhAnhUrl: '',
    tacGia: '',
    ngayDang: '',
    loaiBaiViet: '' as LoaiBaiVietEnum | '',
    trangThai: 'NHAP' as TrangThaiBaiVietEnum,
};

export default function AdminBaiVietPage() {
    const { user } = useAuth();
    const [items, setItems] = useState<BaiVietResponse[]>([]);
    const [loading, setLoading] = useState(false);
    const [searchQuery, setSearchQuery] = useState('');
    const [filterLoai, setFilterLoai] = useState('');
    const [toasts, setToasts] = useState<Toast[]>([]);

    const [isAddOpen, setIsAddOpen] = useState(false);
    const [isEditOpen, setIsEditOpen] = useState(false);
    const [isDeleteOpen, setIsDeleteOpen] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [selected, setSelected] = useState<BaiVietResponse | null>(null);

    const [addForm, setAddForm] = useState(defaultForm);
    const [editForm, setEditForm] = useState(defaultForm);
    const [addError, setAddError] = useState<string | null>(null);
    const [editError, setEditError] = useState<string | null>(null);

    const addToast = useCallback((message: string, type: 'success' | 'error' | 'info' = 'info') => {
        const id = Date.now().toString();
        setToasts(p => [...p, { id, message, type }]);
        setTimeout(() => setToasts(p => p.filter(t => t.id !== id)), 4000);
    }, []);

    const fetchAll = useCallback(async () => {
        try {
            setLoading(true);
            const data = await baiVietApi.getAllBaiViet();
            setItems(data || []);
        } catch {
            addToast('Không thể tải danh sách bài viết', 'error');
        } finally {
            setLoading(false);
        }
    }, [addToast]);

    useEffect(() => { fetchAll(); }, [fetchAll]);

    const filtered = useMemo(() => {
        const q = searchQuery.toLowerCase().trim();
        return items.filter(item => {
            const matchSearch = !q || item.tieuDe.toLowerCase().includes(q) || (item.tacGia ?? '').toLowerCase().includes(q);
            const matchLoai = !filterLoai || item.loaiBaiViet === filterLoai;
            return matchSearch && matchLoai;
        });
    }, [items, searchQuery, filterLoai]);

    const stats = useMemo(() => ({
        total: items.length,
        congKhai: items.filter(i => i.trangThai === 'CONG_KHAI').length,
        nhap: items.filter(i => i.trangThai === 'NHAP').length,
        riengTu: items.filter(i => i.trangThai === 'RIENG_TU').length,
    }), [items]);

    const openAdd = () => {
        setAddForm({ ...defaultForm, tacGia: user?.fullName ?? '' });
        setAddError(null);
        setIsAddOpen(true);
    };

    const openEdit = (item: BaiVietResponse) => {
        setSelected(item);
        setEditForm({
            tieuDe: item.tieuDe,
            noiDung: item.noiDung ?? '',
            hinhAnhUrl: item.hinhAnhUrl ?? '',
            tacGia: item.tacGia ?? '',
            ngayDang: item.ngayDang ? item.ngayDang.slice(0, 10) : '',
            loaiBaiViet: item.loaiBaiViet ?? '',
            trangThai: item.trangThai ?? 'NHAP',
        });
        setEditError(null);
        setIsEditOpen(true);
    };

    const openDelete = (item: BaiVietResponse) => {
        setSelected(item);
        setIsDeleteOpen(true);
    };

    const handleAdd = async (e: FormEvent) => {
        e.preventDefault();
        if (!addForm.tieuDe.trim()) { setAddError('Tiêu đề không được để trống'); return; }
        if (!user?.id) { setAddError('Không xác định được người dùng'); return; }
        setIsSubmitting(true);
        setAddError(null);
        try {
            await baiVietApi.createBaiViet({
                tieuDe: addForm.tieuDe.trim(),
                noiDung: addForm.noiDung.trim() || undefined,
                hinhAnhUrl: addForm.hinhAnhUrl.trim() || undefined,
                tacGia: addForm.tacGia.trim() || undefined,
                ngayDang: addForm.ngayDang ? `${addForm.ngayDang}T00:00:00` : undefined,
                loaiBaiViet: (addForm.loaiBaiViet as LoaiBaiVietEnum) || undefined,
                trangThai: addForm.trangThai,
                usersId: user.id,
            });
            setIsAddOpen(false);
            addToast('Tạo bài viết thành công', 'success');
            fetchAll();
        } catch (err) {
            setAddError(extractError(err, 'Tạo bài viết thất bại'));
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleEdit = async (e: FormEvent) => {
        e.preventDefault();
        if (!selected) return;
        if (!editForm.tieuDe.trim()) { setEditError('Tiêu đề không được để trống'); return; }
        if (!user?.id) { setEditError('Không xác định được người dùng'); return; }
        setIsSubmitting(true);
        setEditError(null);
        try {
            await baiVietApi.updateBaiViet(selected.id, {
                tieuDe: editForm.tieuDe.trim(),
                noiDung: editForm.noiDung.trim() || undefined,
                hinhAnhUrl: editForm.hinhAnhUrl.trim() || undefined,
                tacGia: editForm.tacGia.trim() || undefined,
                ngayDang: editForm.ngayDang ? `${editForm.ngayDang}T00:00:00` : undefined,
                loaiBaiViet: (editForm.loaiBaiViet as LoaiBaiVietEnum) || undefined,
                trangThai: editForm.trangThai,
                usersId: user.id,
            });
            setIsEditOpen(false);
            addToast('Cập nhật bài viết thành công', 'success');
            fetchAll();
        } catch (err) {
            setEditError(extractError(err, 'Cập nhật bài viết thất bại'));
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleDelete = async () => {
        if (!selected) return;
        setIsSubmitting(true);
        try {
            await baiVietApi.deleteBaiViet(selected.id);
            setIsDeleteOpen(false);
            addToast('Xóa bài viết thành công', 'success');
            fetchAll();
        } catch (err) {
            addToast(extractError(err, 'Xóa bài viết thất bại'), 'error');
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleToggleStatus = async (item: BaiVietResponse) => {
        if (!user?.id) return;
        const next: TrangThaiBaiVietEnum = item.trangThai === 'CONG_KHAI' ? 'NHAP' : 'CONG_KHAI';
        try {
            await baiVietApi.updateBaiViet(item.id, {
                tieuDe: item.tieuDe,
                noiDung: item.noiDung ?? undefined,
                hinhAnhUrl: item.hinhAnhUrl ?? undefined,
                tacGia: item.tacGia ?? undefined,
                ngayDang: item.ngayDang ? item.ngayDang.includes('T') ? item.ngayDang : `${item.ngayDang}T00:00:00` : undefined,
                loaiBaiViet: item.loaiBaiViet ?? undefined,
                trangThai: next,
                usersId: user.id,
            });
            addToast(
                next === 'CONG_KHAI' ? 'Đã đăng bài viết' : 'Đã ẩn bài viết',
                'success'
            );
            fetchAll();
        } catch (err) {
            addToast(extractError(err, 'Cập nhật trạng thái thất bại'), 'error');
        }
    };

    return (
        <div className="flex h-screen bg-slate-50">
            <AdminSidebar />
            <div className="flex-1 ml-64 flex flex-col overflow-hidden">
                <AdminHeader title="Quản lý bài viết & tin tức" />
                <div className="flex-1 overflow-auto">
                    <div className="p-6 max-w-7xl mx-auto space-y-4">

                        {/* Stat cards */}
                        <div className="grid grid-cols-4 gap-4">
                            {[
                                { label: 'Tổng bài viết', value: stats.total, color: 'blue', icon: <Newspaper className="h-5 w-5" /> },
                                { label: 'Đã đăng', value: stats.congKhai, color: 'emerald', icon: <Eye className="h-5 w-5" /> },
                                { label: 'Nháp', value: stats.nhap, color: 'slate', icon: <FileText className="h-5 w-5" /> },
                                { label: 'Riêng tư', value: stats.riengTu, color: 'amber', icon: <EyeOff className="h-5 w-5" /> },
                            ].map(({ label, value, color, icon }) => (
                                <div key={label} className="bg-white rounded-xl p-4 shadow-sm border border-slate-100 flex items-center gap-3">
                                    <div className={`p-2 rounded-lg bg-${color}-100 text-${color}-600`}>{icon}</div>
                                    <div>
                                        <p className="text-xs text-slate-500">{label}</p>
                                        <p className="text-2xl font-bold text-slate-800">{value}</p>
                                    </div>
                                </div>
                            ))}
                        </div>

                        {/* Controls */}
                        <div className="bg-white rounded-xl shadow-sm border border-slate-100 p-4">
                            <div className="flex items-center gap-3 flex-wrap">
                                <div className="relative flex-1 min-w-[200px]">
                                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                                    <input
                                        className="w-full pl-9 pr-3 py-2 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                                        placeholder="Tìm kiếm tiêu đề, tác giả..."
                                        value={searchQuery}
                                        onChange={e => setSearchQuery(e.target.value)}
                                    />
                                </div>
                                <select
                                    className="px-3 py-2 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                                    value={filterLoai}
                                    onChange={e => setFilterLoai(e.target.value)}
                                >
                                    <option value="">Tất cả danh mục</option>
                                    {LOAI_OPTIONS.map(l => (
                                        <option key={l} value={l}>{LOAI_BAI_VIET_LABEL[l]}</option>
                                    ))}
                                </select>
                                <button
                                    onClick={fetchAll}
                                    className="p-2 border border-slate-300 rounded-lg text-slate-600 hover:bg-slate-50"
                                    title="Làm mới"
                                >
                                    <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
                                </button>
                                <button
                                    onClick={openAdd}
                                    className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 text-sm font-medium"
                                >
                                    <Plus className="h-4 w-4" /> Tạo bài viết
                                </button>
                            </div>
                        </div>

                        {/* Table */}
                        <div className="bg-white rounded-xl shadow-sm border border-slate-100 overflow-hidden">
                            <div className="px-4 py-3 border-b border-slate-100 flex items-center justify-between">
                                <span className="text-sm text-slate-500">
                                    {filtered.length} / {items.length} bài viết
                                </span>
                            </div>
                            {loading ? (
                                <div className="py-16 text-center text-slate-400 text-sm">Đang tải...</div>
                            ) : filtered.length === 0 ? (
                                <div className="py-16 text-center text-slate-400 text-sm">Không có bài viết nào</div>
                            ) : (
                                <div className="overflow-x-auto">
                                    <table className="w-full text-sm">
                                        <thead>
                                            <tr className="bg-slate-50 border-b border-slate-100">
                                                <th className="text-left px-4 py-3 font-medium text-slate-600">Tiêu đề</th>
                                                <th className="text-left px-4 py-3 font-medium text-slate-600">Danh mục</th>
                                                <th className="text-left px-4 py-3 font-medium text-slate-600">Trạng thái</th>
                                                <th className="text-left px-4 py-3 font-medium text-slate-600">Tác giả</th>
                                                <th className="text-left px-4 py-3 font-medium text-slate-600">Ngày đăng</th>
                                                <th className="text-center px-4 py-3 font-medium text-slate-600">Thao tác</th>
                                            </tr>
                                        </thead>
                                        <tbody className="divide-y divide-slate-50">
                                            {filtered.map(item => (
                                                <tr key={item.id} className="hover:bg-slate-50 transition-colors">
                                                    <td className="px-4 py-3">
                                                        <div className="font-medium text-slate-800 max-w-xs truncate">{item.tieuDe}</div>
                                                        {item.hinhAnhUrl && (
                                                            <div className="text-xs text-slate-400 truncate max-w-xs mt-0.5">{item.hinhAnhUrl}</div>
                                                        )}
                                                    </td>
                                                    <td className="px-4 py-3">
                                                        {item.loaiBaiViet ? (
                                                            <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${loaiBadgeClass[item.loaiBaiViet]}`}>
                                                                {LOAI_BAI_VIET_LABEL[item.loaiBaiViet]}
                                                            </span>
                                                        ) : <span className="text-slate-400">—</span>}
                                                    </td>
                                                    <td className="px-4 py-3">
                                                        {item.trangThai ? (
                                                            <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${trangThaiBadgeClass[item.trangThai]}`}>
                                                                {TRANG_THAI_LABEL[item.trangThai]}
                                                            </span>
                                                        ) : <span className="text-slate-400">—</span>}
                                                    </td>
                                                    <td className="px-4 py-3 text-slate-600">{item.tacGia ?? '—'}</td>
                                                    <td className="px-4 py-3 text-slate-500">
                                                        {item.ngayDang ? new Date(item.ngayDang).toLocaleDateString('vi-VN') : '—'}
                                                    </td>
                                                    <td className="px-4 py-3">
                                                        <div className="flex items-center justify-center gap-1">
                                                            <button
                                                                onClick={() => handleToggleStatus(item)}
                                                                title={item.trangThai === 'CONG_KHAI' ? 'Ẩn bài viết' : 'Đăng bài viết'}
                                                                className={`p-1.5 rounded-lg transition-colors ${
                                                                    item.trangThai === 'CONG_KHAI'
                                                                        ? 'text-emerald-600 hover:bg-emerald-50'
                                                                        : 'text-slate-400 hover:bg-slate-100'
                                                                }`}
                                                            >
                                                                {item.trangThai === 'CONG_KHAI'
                                                                    ? <Eye className="h-4 w-4" />
                                                                    : <EyeOff className="h-4 w-4" />}
                                                            </button>
                                                            <button
                                                                onClick={() => openEdit(item)}
                                                                className="p-1.5 rounded-lg text-blue-600 hover:bg-blue-50 transition-colors"
                                                                title="Chỉnh sửa"
                                                            >
                                                                <Edit className="h-4 w-4" />
                                                            </button>
                                                            <button
                                                                onClick={() => openDelete(item)}
                                                                className="p-1.5 rounded-lg text-red-500 hover:bg-red-50 transition-colors"
                                                                title="Xóa"
                                                            >
                                                                <Trash2 className="h-4 w-4" />
                                                            </button>
                                                        </div>
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>

            {/* Add Dialog */}
            {isAddOpen && (
                <div className="fixed inset-0 bg-black/30 flex items-center justify-center z-50 p-4" onClick={() => setIsAddOpen(false)}>
                    <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto" onClick={e => e.stopPropagation()}>
                        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100">
                            <div className="flex items-center gap-2">
                                <div className="p-2 bg-blue-100 rounded-lg"><Plus className="h-4 w-4 text-blue-600" /></div>
                                <h2 className="text-lg font-semibold text-slate-800">Tạo bài viết mới</h2>
                            </div>
                            <button onClick={() => setIsAddOpen(false)} className="p-1.5 hover:bg-slate-100 rounded-lg text-slate-400"><X className="h-5 w-5" /></button>
                        </div>
                        <form onSubmit={handleAdd} className="p-6 space-y-4">
                            {addError && (
                                <div className="flex items-start gap-2 p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">
                                    <AlertCircle className="h-4 w-4 mt-0.5 shrink-0" />
                                    <pre className="whitespace-pre-wrap font-sans">{addError}</pre>
                                </div>
                            )}
                            <div>
                                <label className={lbl}>Tiêu đề <span className="text-red-500">*</span></label>
                                <input className={inp} placeholder="Nhập tiêu đề bài viết" value={addForm.tieuDe} onChange={e => setAddForm(p => ({ ...p, tieuDe: e.target.value }))} />
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className={lbl}>Danh mục</label>
                                    <select className={inp} value={addForm.loaiBaiViet} onChange={e => setAddForm(p => ({ ...p, loaiBaiViet: e.target.value as LoaiBaiVietEnum | '' }))}>
                                        <option value="">-- Chọn danh mục --</option>
                                        {LOAI_OPTIONS.map(l => <option key={l} value={l}>{LOAI_BAI_VIET_LABEL[l]}</option>)}
                                    </select>
                                </div>
                                <div>
                                    <label className={lbl}>Trạng thái</label>
                                    <select className={inp} value={addForm.trangThai} onChange={e => setAddForm(p => ({ ...p, trangThai: e.target.value as TrangThaiBaiVietEnum }))}>
                                        {TRANG_THAI_OPTIONS.map(t => <option key={t} value={t}>{TRANG_THAI_LABEL[t]}</option>)}
                                    </select>
                                </div>
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className={lbl}>Tác giả</label>
                                    <input className={inp} placeholder="Tên tác giả" value={addForm.tacGia} onChange={e => setAddForm(p => ({ ...p, tacGia: e.target.value }))} />
                                </div>
                                <div>
                                    <label className={lbl}>Ngày đăng</label>
                                    <input type="date" className={inp} value={addForm.ngayDang} onChange={e => setAddForm(p => ({ ...p, ngayDang: e.target.value }))} />
                                </div>
                            </div>
                            <div>
                                <label className={lbl}>URL hình ảnh minh họa</label>
                                <input className={inp} placeholder="https://..." value={addForm.hinhAnhUrl} onChange={e => setAddForm(p => ({ ...p, hinhAnhUrl: e.target.value }))} />
                            </div>
                            <div>
                                <label className={lbl}>Nội dung</label>
                                <textarea
                                    className={`${inp} resize-none`}
                                    rows={6}
                                    placeholder="Nhập nội dung bài viết..."
                                    value={addForm.noiDung}
                                    onChange={e => setAddForm(p => ({ ...p, noiDung: e.target.value }))}
                                />
                            </div>
                            <div className="flex justify-end gap-3 pt-2">
                                <button type="button" onClick={() => setIsAddOpen(false)} className="px-4 py-2 border border-slate-300 text-slate-700 rounded-lg hover:bg-slate-50 text-sm">Hủy</button>
                                <button type="submit" disabled={isSubmitting} className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 text-sm font-medium disabled:opacity-60">
                                    {isSubmitting ? 'Đang lưu...' : 'Tạo bài viết'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* Edit Dialog */}
            {isEditOpen && selected && (
                <div className="fixed inset-0 bg-black/30 flex items-center justify-center z-50 p-4" onClick={() => setIsEditOpen(false)}>
                    <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto" onClick={e => e.stopPropagation()}>
                        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100">
                            <div className="flex items-center gap-2">
                                <div className="p-2 bg-blue-100 rounded-lg"><Edit className="h-4 w-4 text-blue-600" /></div>
                                <h2 className="text-lg font-semibold text-slate-800">Chỉnh sửa bài viết</h2>
                            </div>
                            <button onClick={() => setIsEditOpen(false)} className="p-1.5 hover:bg-slate-100 rounded-lg text-slate-400"><X className="h-5 w-5" /></button>
                        </div>
                        <form onSubmit={handleEdit} className="p-6 space-y-4">
                            {editError && (
                                <div className="flex items-start gap-2 p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">
                                    <AlertCircle className="h-4 w-4 mt-0.5 shrink-0" />
                                    <pre className="whitespace-pre-wrap font-sans">{editError}</pre>
                                </div>
                            )}
                            <div>
                                <label className={lbl}>Tiêu đề <span className="text-red-500">*</span></label>
                                <input className={inp} placeholder="Nhập tiêu đề bài viết" value={editForm.tieuDe} onChange={e => setEditForm(p => ({ ...p, tieuDe: e.target.value }))} />
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className={lbl}>Danh mục</label>
                                    <select className={inp} value={editForm.loaiBaiViet} onChange={e => setEditForm(p => ({ ...p, loaiBaiViet: e.target.value as LoaiBaiVietEnum | '' }))}>
                                        <option value="">-- Chọn danh mục --</option>
                                        {LOAI_OPTIONS.map(l => <option key={l} value={l}>{LOAI_BAI_VIET_LABEL[l]}</option>)}
                                    </select>
                                </div>
                                <div>
                                    <label className={lbl}>Trạng thái</label>
                                    <select className={inp} value={editForm.trangThai} onChange={e => setEditForm(p => ({ ...p, trangThai: e.target.value as TrangThaiBaiVietEnum }))}>
                                        {TRANG_THAI_OPTIONS.map(t => <option key={t} value={t}>{TRANG_THAI_LABEL[t]}</option>)}
                                    </select>
                                </div>
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className={lbl}>Tác giả</label>
                                    <input className={inp} placeholder="Tên tác giả" value={editForm.tacGia} onChange={e => setEditForm(p => ({ ...p, tacGia: e.target.value }))} />
                                </div>
                                <div>
                                    <label className={lbl}>Ngày đăng</label>
                                    <input type="date" className={inp} value={editForm.ngayDang} onChange={e => setEditForm(p => ({ ...p, ngayDang: e.target.value }))} />
                                </div>
                            </div>
                            <div>
                                <label className={lbl}>URL hình ảnh minh họa</label>
                                <input className={inp} placeholder="https://..." value={editForm.hinhAnhUrl} onChange={e => setEditForm(p => ({ ...p, hinhAnhUrl: e.target.value }))} />
                            </div>
                            <div>
                                <label className={lbl}>Nội dung</label>
                                <textarea
                                    className={`${inp} resize-none`}
                                    rows={6}
                                    placeholder="Nhập nội dung bài viết..."
                                    value={editForm.noiDung}
                                    onChange={e => setEditForm(p => ({ ...p, noiDung: e.target.value }))}
                                />
                            </div>
                            <div className="flex justify-end gap-3 pt-2">
                                <button type="button" onClick={() => setIsEditOpen(false)} className="px-4 py-2 border border-slate-300 text-slate-700 rounded-lg hover:bg-slate-50 text-sm">Hủy</button>
                                <button type="submit" disabled={isSubmitting} className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 text-sm font-medium disabled:opacity-60">
                                    {isSubmitting ? 'Đang lưu...' : 'Lưu thay đổi'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* Delete Dialog */}
            {isDeleteOpen && selected && (
                <div className="fixed inset-0 bg-black/30 flex items-center justify-center z-50 p-4" onClick={() => setIsDeleteOpen(false)}>
                    <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full" onClick={e => e.stopPropagation()}>
                        <div className="p-6">
                            <div className="flex items-center gap-3 mb-4">
                                <div className="p-2 bg-red-100 rounded-lg"><Trash2 className="h-5 w-5 text-red-600" /></div>
                                <h2 className="text-lg font-semibold text-slate-800">Xác nhận xóa</h2>
                            </div>
                            <p className="text-slate-600 text-sm mb-1">Bạn có chắc muốn xóa bài viết:</p>
                            <p className="font-medium text-slate-800 mb-4">"{selected.tieuDe}"?</p>
                            <p className="text-xs text-slate-400 mb-6">Hành động này không thể hoàn tác.</p>
                            <div className="flex justify-end gap-3">
                                <button onClick={() => setIsDeleteOpen(false)} className="px-4 py-2 border border-slate-300 text-slate-700 rounded-lg hover:bg-slate-50 text-sm">Hủy</button>
                                <button onClick={handleDelete} disabled={isSubmitting} className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 text-sm font-medium disabled:opacity-60">
                                    {isSubmitting ? 'Đang xóa...' : 'Xóa bài viết'}
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* Toasts */}
            <div className="fixed bottom-4 right-4 z-[60] space-y-2">
                {toasts.map(t => (
                    <div key={t.id} className={`flex items-center gap-2 px-4 py-3 rounded-xl shadow-lg text-sm font-medium text-white transition-all ${
                        t.type === 'success' ? 'bg-emerald-600' : t.type === 'error' ? 'bg-red-600' : 'bg-blue-600'
                    }`}>
                        {t.message}
                    </div>
                ))}
            </div>

            <button className="fixed bottom-8 right-8 w-14 h-14 z-50 hover:scale-110 transition-transform" aria-label="AI">
                <AiAssistantButton />
            </button>
        </div>
    );
}
