import { AdminSidebar } from '@/components/layouts/AdminSidebar';
import { AdminHeader } from '@/components/layouts/AdminHeader';
import { useEffect, useRef, useState } from 'react';
import { Plus, Edit, Trash2, X, Search, Shield, AlertCircle, CheckCircle, RefreshCw, CheckSquare, Square } from 'lucide-react';
import AiAssistantButton from '@/imports/AiAssistantButton-4-13343';
import type { RoleItem } from '@/api/admin/role.api';
import * as roleApi from '@/api/admin/role.api';

interface Toast {
    id: string;
    message: string;
    type: 'success' | 'error' | 'info';
}

const extractError = (err: unknown, fallback: string): string => {
    if (err && typeof err === 'object') {
        const e = err as { response?: { data?: { detail?: string; message?: string } } };
        return e.response?.data?.detail || e.response?.data?.message || fallback;
    }
    return fallback;
};

export default function AdminRolesPage() {
    const [roles, setRoles] = useState<RoleItem[]>([]);
    const [loading, setLoading] = useState(false);
    const [searchQuery, setSearchQuery] = useState('');
    const [toasts, setToasts] = useState<Toast[]>([]);
    const [isAddOpen, setIsAddOpen] = useState(false);
    const [isEditOpen, setIsEditOpen] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [selected, setSelected] = useState<RoleItem | null>(null);
    const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
    const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
    const [isDeleting, setIsDeleting] = useState(false);

    const [form, setForm] = useState({
        maRole: '',
        moTa: ''
    });

    const addToast = (message: string, type: 'success' | 'error' | 'info' = 'info') => {
        const id = Date.now().toString();
        setToasts(prev => [...prev, { id, message, type }]);
        setTimeout(() => {
            setToasts(prev => prev.filter(t => t.id !== id));
        }, 4000);
    };

    const fetch = async () => {
        try {
            setLoading(true);
            const data = await roleApi.getAllRoles();
            setRoles(data || []);
        } catch (err) {
            console.error(err);
            addToast('Lỗi khi tải dữ liệu vai trò', 'error');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => { fetch(); }, []);

    const filtered = roles.filter(r =>
        r.maRole?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        r.moTa?.toLowerCase().includes(searchQuery.toLowerCase())
    );

    const openAdd = () => {
        setForm({ maRole: '', moTa: '' });
        setIsAddOpen(true);
    };

    const openEdit = (item: RoleItem) => {
        setSelected(item);
        setForm({
            maRole: item.maRole,
            moTa: item.moTa || ''
        });
        setIsEditOpen(true);
    };

    const toggleSelectAll = () => {
        if (selectedIds.size === filtered.length) {
            setSelectedIds(new Set());
        } else {
            setSelectedIds(new Set(filtered.map(r => r.id)));
        }
    };

    const toggleSelect = (id: string) => {
        const newSet = new Set(selectedIds);
        if (newSet.has(id)) {
            newSet.delete(id);
        } else {
            newSet.add(id);
        }
        setSelectedIds(newSet);
    };

    const handleDeleteSelected = async () => {
        if (selectedIds.size === 0) return;
        setIsDeleteModalOpen(true);
    };

    const confirmDeleteSelected = async () => {
        setIsDeleting(true);
        try {
            const ids = Array.from(selectedIds);
            await roleApi.deleteRolesBatch(ids);
            addToast(`Xóa thành công ${ids.length} vai trò!`, 'success');
            setSelectedIds(new Set());
            setIsDeleteModalOpen(false);
            await fetch();
        } catch (err: any) {
            addToast(extractError(err, 'Lỗi khi xóa vai trò'), 'error');
        } finally {
            setIsDeleting(false);
        }
    };

    const validateForm = () => {
        if (!form.maRole.trim()) {
            addToast('Vui lòng nhập mã vai trò', 'error');
            return false;
        }
        return true;
    };

    const handleCreate = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!validateForm()) return;

        try {
            setIsSubmitting(true);
            await roleApi.createRole(form);
            addToast('Thêm vai trò thành công!', 'success');
            setIsAddOpen(false);
            await fetch();
        } catch (err: any) {
            addToast(extractError(err, 'Lỗi khi thêm vai trò'), 'error');
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleUpdate = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!selected) return;
        if (!validateForm()) return;

        try {
            setIsSubmitting(true);
            await roleApi.updateRole(selected.id, form);
            addToast('Cập nhật vai trò thành công!', 'success');
            setIsEditOpen(false);
            setSelected(null);
            await fetch();
        } catch (err: any) {
            addToast(extractError(err, 'Lỗi khi cập nhật vai trò'), 'error');
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleDelete = (item: RoleItem) => {
        setSelected(item);
        setIsDeleteModalOpen(true);
    };

    const confirmDelete = async () => {
        if (!selected) return;
        setIsDeleting(true);
        try {
            await roleApi.deleteRole(selected.id);
            addToast('Xóa vai trò thành công!', 'success');
            setSelected(null);
            setIsDeleteModalOpen(false);
            await fetch();
        } catch (err: any) {
            addToast(extractError(err, 'Lỗi khi xóa vai trò'), 'error');
        } finally {
            setIsDeleting(false);
        }
    };

    return (
        <div className="flex h-screen bg-slate-50">
            <AdminSidebar activeMenu="roles" />
            <div className="flex-1 ml-64 flex flex-col overflow-hidden">
                <AdminHeader title="Quản lý Vai Trò" />
                <div className="flex-1 overflow-auto">
                    <div className="p-6 max-w-7xl mx-auto space-y-4">

                        {/* Stats Bar */}
                        <div className="grid grid-cols-3 gap-4">
                            <div className="bg-white border border-slate-200 rounded-xl px-5 py-3 flex items-center gap-3 shadow-sm">
                                <div className="rounded-lg bg-blue-100 p-2">
                                    <Shield className="w-5 h-5 text-blue-600" />
                                </div>
                                <div>
                                    <p className="text-xl font-bold text-slate-900">{roles.length}</p>
                                    <p className="text-xs text-slate-500">Tổng vai trò</p>
                                </div>
                            </div>
                            <div className="bg-white border border-slate-200 rounded-xl px-5 py-3 flex items-center gap-3 shadow-sm">
                                <div className="rounded-lg bg-green-100 p-2">
                                    <CheckSquare className="w-5 h-5 text-green-600" />
                                </div>
                                <div>
                                    <p className="text-xl font-bold text-green-700">{selectedIds.size}</p>
                                    <p className="text-xs text-slate-500">Đã chọn</p>
                                </div>
                            </div>
                            <div className="bg-white border border-slate-200 rounded-xl px-5 py-3 flex items-center gap-3 shadow-sm">
                                <div className="rounded-lg bg-purple-100 p-2">
                                    <Search className="w-5 h-5 text-purple-600" />
                                </div>
                                <div>
                                    <p className="text-xl font-bold text-purple-700">{filtered.length}</p>
                                    <p className="text-xs text-slate-500">Kết quả tìm kiếm</p>
                                </div>
                            </div>
                        </div>

                        {/* Toolbar */}
                        <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-3 flex flex-col sm:flex-row gap-3 items-start sm:items-center justify-between sticky top-0 z-20">
                            <div className="flex flex-wrap items-center gap-2 flex-1">
                                <div className="relative min-w-[200px] max-w-sm">
                                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                                    <input
                                        type="text"
                                        placeholder="Tìm mã hoặc mô tả..."
                                        value={searchQuery}
                                        onChange={(e) => setSearchQuery(e.target.value)}
                                        className="w-full pl-9 pr-4 py-2 text-sm border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                                    />
                                </div>
                            </div>
                            <div className="flex items-center gap-2">
                                <button
                                    onClick={fetch}
                                    title="Làm mới"
                                    className="p-2 border border-slate-300 rounded-lg text-slate-600 hover:bg-slate-50 transition-colors"
                                >
                                    <RefreshCw className="w-4 h-4" />
                                </button>
                                {selectedIds.size > 0 && (
                                    <button
                                        onClick={handleDeleteSelected}
                                        className="flex items-center gap-1.5 px-3 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 text-sm font-medium"
                                    >
                                        <Trash2 className="w-4 h-4" /> Xóa ({selectedIds.size})
                                    </button>
                                )}
                                <button
                                    onClick={openAdd}
                                    className="flex items-center gap-1.5 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 text-sm font-medium shadow-sm"
                                >
                                    <Plus className="w-4 h-4" /> Thêm mới
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
                                <div className="overflow-auto" style={{ maxHeight: 'calc(100vh - 380px)' }}>
                                    <table className="w-full text-sm">
                                        <thead className="sticky top-0 z-10 bg-gradient-to-r from-blue-600 to-blue-700 text-white">
                                            <tr>
                                                <th className="px-4 py-3 w-12">
                                                    <button
                                                        onClick={toggleSelectAll}
                                                        className="p-1 hover:bg-white/20 rounded"
                                                        title="Chọn tất cả"
                                                    >
                                                        {selectedIds.size === filtered.length && filtered.length > 0
                                                            ? <CheckSquare className="w-4 h-4" />
                                                            : <Square className="w-4 h-4" />
                                                        }
                                                    </button>
                                                </th>
                                                <th className="px-4 py-3 text-left font-semibold">Mã Vai Trò</th>
                                                <th className="px-4 py-3 text-left font-semibold">Mô Tả</th>
                                                <th className="px-4 py-3 text-left font-semibold">Ngày Tạo</th>
                                                <th className="px-4 py-3 text-center font-semibold">Thao Tác</th>
                                            </tr>
                                        </thead>
                                        <tbody className="divide-y divide-slate-100">
                                            {filtered.map((r) => (
                                                <tr key={r.id} className="transition-colors hover:bg-blue-50/60">
                                                    <td className="px-4 py-3">
                                                        <button
                                                            onClick={() => toggleSelect(r.id)}
                                                            className="p-1 hover:bg-blue-100 rounded transition-colors"
                                                        >
                                                            {selectedIds.has(r.id)
                                                                ? <CheckSquare className="w-4 h-4 text-blue-600" />
                                                                : <Square className="w-4 h-4 text-slate-400" />
                                                            }
                                                        </button>
                                                    </td>
                                                    <td className="px-4 py-3 font-semibold text-slate-900">
                                                        <div className="flex items-center gap-2">
                                                            <Shield className="w-4 h-4 text-blue-600" />
                                                            {r.maRole}
                                                        </div>
                                                    </td>
                                                    <td className="px-4 py-3 text-slate-600">{r.moTa || '-'}</td>
                                                    <td className="px-4 py-3 text-slate-500">
                                                        {r.createdAt ? new Date(r.createdAt).toLocaleDateString('vi-VN') : '-'}
                                                    </td>
                                                    <td className="px-4 py-3">
                                                        <div className="flex items-center justify-center gap-1">
                                                            <button
                                                                onClick={() => openEdit(r)}
                                                                className="p-1.5 text-blue-600 hover:bg-blue-100 rounded-lg transition-colors"
                                                                title="Chỉnh sửa"
                                                            >
                                                                <Edit className="w-4 h-4" />
                                                            </button>
                                                            <button
                                                                onClick={() => handleDelete(r)}
                                                                className="p-1.5 text-red-500 hover:bg-red-100 rounded-lg transition-colors"
                                                                title="Xóa"
                                                            >
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
                                                                <Shield className="w-8 h-8 text-slate-400" />
                                                            </div>
                                                            <p className="font-medium text-slate-600">
                                                                {searchQuery ? 'Không tìm thấy kết quả' : 'Chưa có vai trò nào'}
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
                        {!loading && roles.length > 0 && (
                            <div className="flex items-center justify-between text-xs text-slate-500 px-1">
                                <span>
                                    Hiển thị <b className="text-slate-700">{filtered.length}</b> / <b className="text-slate-700">{roles.length}</b> vai trò
                                </span>
                                {selectedIds.size > 0 && (
                                    <span>Đã chọn <b className="text-blue-600">{selectedIds.size}</b> vai trò</span>
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
                            <h2 className="text-base font-bold flex items-center gap-2"><Plus className="w-5 h-5" /> Thêm Vai Trò Mới</h2>
                            <button onClick={() => setIsAddOpen(false)} className="p-1 hover:bg-white/20 rounded-lg">
                                <X className="w-5 h-5" />
                            </button>
                        </div>
                        <form className="p-6 space-y-5" onSubmit={handleCreate}>
                            <div>
                                <label className="block text-sm font-medium text-slate-700 mb-1.5">
                                    Mã vai trò <span className="text-red-500">*</span>
                                </label>
                                <input
                                    required
                                    value={form.maRole}
                                    onChange={(e) => setForm({ ...form, maRole: e.target.value })}
                                    placeholder="VD: ADMIN, TEACHER, STUDENT"
                                    className="w-full px-3 py-2.5 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-slate-700 mb-1.5">Mô tả</label>
                                <textarea
                                    value={form.moTa}
                                    onChange={(e) => setForm({ ...form, moTa: e.target.value })}
                                    placeholder="Nhập mô tả về vai trò..."
                                    rows={3}
                                    className="w-full px-3 py-2.5 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
                                />
                            </div>
                            <div className="flex gap-3 pt-4 border-t border-slate-100">
                                <button type="button" onClick={() => setIsAddOpen(false)} className="flex-1 py-2.5 border border-slate-300 rounded-xl text-sm font-medium text-slate-700 hover:bg-slate-50">
                                    Hủy
                                </button>
                                <button type="submit" disabled={isSubmitting} className="flex-1 py-2.5 bg-blue-600 text-white rounded-xl text-sm font-medium hover:bg-blue-700 disabled:opacity-50">
                                    {isSubmitting ? 'Đang thêm...' : 'Thêm Vai Trò'}
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
                                <h2 className="text-base font-bold flex items-center gap-2"><Edit className="w-5 h-5" /> Chỉnh Sửa Vai Trò</h2>
                                <p className="text-xs text-blue-200 mt-0.5">{selected.maRole}</p>
                            </div>
                            <button onClick={() => setIsEditOpen(false)} className="p-1 hover:bg-white/20 rounded-lg">
                                <X className="w-5 h-5" />
                            </button>
                        </div>
                        <form className="p-6 space-y-5" onSubmit={handleUpdate}>
                            <div>
                                <label className="block text-sm font-medium text-slate-700 mb-1.5">Mã vai trò</label>
                                <input
                                    disabled
                                    value={form.maRole}
                                    className="w-full px-3 py-2.5 border border-slate-300 rounded-lg text-sm bg-slate-100 text-slate-600 cursor-not-allowed"
                                />
                                <p className="text-xs text-slate-500 mt-1">Không thể thay đổi mã vai trò</p>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-slate-700 mb-1.5">Mô tả</label>
                                <textarea
                                    value={form.moTa}
                                    onChange={(e) => setForm({ ...form, moTa: e.target.value })}
                                    rows={3}
                                    className="w-full px-3 py-2.5 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
                                />
                            </div>
                            <div className="flex gap-3 pt-4 border-t border-slate-100">
                                <button type="button" onClick={() => setIsEditOpen(false)} className="flex-1 py-2.5 border border-slate-300 rounded-xl text-sm font-medium text-slate-700 hover:bg-slate-50">
                                    Hủy
                                </button>
                                <button type="submit" disabled={isSubmitting} className="flex-1 py-2.5 bg-blue-600 text-white rounded-xl text-sm font-medium hover:bg-blue-700 disabled:opacity-50">
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
                            <div className="rounded-full bg-red-100 p-3 flex-shrink-0">
                                <AlertCircle className="w-6 h-6 text-red-600" />
                            </div>
                            <h3 className="font-bold text-slate-900">
                                {selected ? 'Xác nhận xóa vai trò' : `Xác nhận xóa ${selectedIds.size} vai trò`}
                            </h3>
                        </div>
                        <p className="text-sm text-slate-600 mb-4">
                            {selected
                                ? <>Bạn có chắc muốn xóa vai trò <b>"{selected.maRole}"</b>?</>
                                : <>Bạn có chắc muốn xóa <b>{selectedIds.size}</b> vai trò đã chọn?</>
                            }
                        </p>
                        <div className="bg-amber-50 border border-amber-200 rounded-lg p-3 mb-4">
                            <p className="text-xs text-amber-700">
                                <AlertCircle className="w-3 h-3 inline mr-1" />
                                Nếu vai trò có khóa ngoại (đang gán cho người dùng hoặc có quyền liên kết), hệ thống sẽ báo lỗi và không xóa được.
                            </p>
                        </div>
                        <div className="flex gap-3">
                            <button onClick={() => setIsDeleteModalOpen(false)} disabled={isDeleting} className="flex-1 py-2.5 border border-slate-300 rounded-xl text-sm font-medium text-slate-700 hover:bg-slate-50 disabled:opacity-50">
                                Hủy
                            </button>
                            <button
                                onClick={selected ? confirmDelete : confirmDeleteSelected}
                                disabled={isDeleting}
                                className="flex-1 py-2.5 bg-red-600 text-white rounded-xl text-sm font-medium hover:bg-red-700 disabled:opacity-50"
                            >
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

            {/* AI Assistant */}
            <button className="fixed bottom-8 right-8 w-14 h-14 z-50 hover:scale-110 transition-transform" aria-label="AI">
                <AiAssistantButton />
            </button>
        </div>
    );
}
