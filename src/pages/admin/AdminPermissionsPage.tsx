import { AdminSidebar } from '@/components/layouts/AdminSidebar';
import { AdminHeader } from '@/components/layouts/AdminHeader';
import { useEffect, useRef, useState } from 'react';
import { Plus, Edit, Trash2, X, Search, Lock, AlertCircle, CheckCircle, Upload, RefreshCw, CheckSquare, Square } from 'lucide-react';
import AiAssistantButton from '@/imports/AiAssistantButton-4-13343';
import type { PermissionsItem } from '@/api/admin/permissions.api';
import * as permissionsApi from '@/api/admin/permissions.api';

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

export default function AdminPermissionsPage() {
    const [permissions, setPermissions] = useState<PermissionsItem[]>([]);
    const [loading, setLoading] = useState(false);
    const [searchQuery, setSearchQuery] = useState('');
    const [toasts, setToasts] = useState<Toast[]>([]);
    const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
    const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
    const [isDeleting, setIsDeleting] = useState(false);

    const [isAddOpen, setIsAddOpen] = useState(false);
    const [isEditOpen, setIsEditOpen] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [selected, setSelected] = useState<PermissionsItem | null>(null);
    const [isUploading, setIsUploading] = useState(false);

    const [form, setForm] = useState({ maPermissions: '', moTa: '' });

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
            const data = await permissionsApi.getAllPermissions();
            setPermissions(data || []);
        } catch (err) {
            console.error(err);
            addToast('Lỗi khi tải dữ liệu quyền hạn', 'error');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => { fetch(); }, []);

    const filtered = permissions.filter(p =>
        p.maPermissions?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        p.moTa?.toLowerCase().includes(searchQuery.toLowerCase())
    );

    const toggleSelectAll = () => {
        if (selectedIds.size === filtered.length) {
            setSelectedIds(new Set());
        } else {
            setSelectedIds(new Set(filtered.map(p => p.id)));
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

    const handleDeleteSelected = () => {
        if (selectedIds.size === 0) return;
        setIsDeleteModalOpen(true);
    };

    const confirmDeleteSelected = async () => {
        setIsDeleting(true);
        try {
            const ids = Array.from(selectedIds);
            const result = await permissionsApi.deletePermissionsBatch(ids);
            const cannotDelete = Array.isArray(result?.cannotDelete) ? result.cannotDelete : [];
            const cannotDeleteSet = new Set(cannotDelete);
            const deletedIds = ids.filter(id => {
                const permission = permissions.find(p => p.id === id);
                return !permission || !cannotDeleteSet.has(permission.maPermissions);
            });

            setSelectedIds(new Set());
            setIsDeleteModalOpen(false);
            if (deletedIds.length > 0) {
                setPermissions(prev => prev.filter(p => !deletedIds.includes(p.id)));
            }

            if (cannotDelete.length > 0) {
                addToast(`Đã xóa ${deletedIds.length} quyền. ${cannotDelete.length} quyền không thể xóa (đang được gán cho vai trò).`, 'error');
            } else {
                addToast(`Xóa thành công ${deletedIds.length} quyền!`, 'success');
            }
            await fetch();
        } catch (err: any) {
            addToast(extractError(err, 'Lỗi khi xóa quyền'), 'error');
        } finally {
            setIsDeleting(false);
        }
    };

    const openAdd = () => {
        setForm({ maPermissions: '', moTa: '' });
        setIsAddOpen(true);
    };

    const openEdit = (item: PermissionsItem) => {
        setSelected(item);
        setForm({ maPermissions: item.maPermissions, moTa: item.moTa || '' });
        setIsEditOpen(true);
    };

    const handleDelete = (item: PermissionsItem) => {
        setSelectedIds(new Set([item.id]));
        setIsDeleteModalOpen(true);
    };

    const confirmDelete = async () => {
        if (selectedIds.size === 0) return;
        await confirmDeleteSelected();
    };

    const validateForm = () => {
        if (!form.maPermissions.trim()) {
            addToast('Vui lòng nhập mã quyền', 'error');
            return false;
        }
        return true;
    };

    const handleCreate = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        if (!validateForm()) return;
        try {
            setIsSubmitting(true);
            await permissionsApi.createPermission(form);
            addToast('Thêm quyền hạn thành công!', 'success');
            setIsAddOpen(false);
            await fetch();
        } catch (err: any) {
            addToast(extractError(err, 'Lỗi khi thêm quyền hạn'), 'error');
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleUpdate = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        if (!selected || !validateForm()) return;
        try {
            setIsSubmitting(true);
            await permissionsApi.updatePermission(selected.id, form);
            addToast('Cập nhật quyền hạn thành công!', 'success');
            setIsEditOpen(false);
            setSelected(null);
            await fetch();
        } catch (err: any) {
            addToast(extractError(err, 'Lỗi khi cập nhật quyền hạn'), 'error');
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;
        if (!file.name.endsWith('.xlsx')) {
            addToast('Vui lòng chọn file Excel (.xlsx)', 'error');
            return;
        }
        try {
            setIsUploading(true);
            const formData = new FormData();
            formData.append('file', file);
            await permissionsApi.importFromExcel(formData);
            addToast('Import dữ liệu từ Excel thành công!', 'success');
            await fetch();
        } catch (err: any) {
            addToast(extractError(err, 'Lỗi khi import dữ liệu từ Excel'), 'error');
        } finally {
            setIsUploading(false);
            e.target.value = '';
        }
    };

    return (
        <div className="flex h-screen bg-slate-50">
            <AdminSidebar activeMenu="permissions" />
            <div className="flex-1 ml-64 flex flex-col overflow-hidden">
                <AdminHeader title="Quản lý Quyền Hạn" />
                <div className="flex-1 overflow-auto">
                    <div className="p-6 max-w-7xl mx-auto space-y-4">

                        {/* Stats Bar */}
                        <div className="grid grid-cols-3 gap-4">
                            <div className="bg-white border border-slate-200 rounded-xl px-5 py-3 flex items-center gap-3 shadow-sm">
                                <div className="rounded-lg bg-blue-100 p-2">
                                    <Lock className="w-5 h-5 text-blue-600" />
                                </div>
                                <div>
                                    <p className="text-xl font-bold text-slate-900">{permissions.length}</p>
                                    <p className="text-xs text-slate-500">Tổng quyền</p>
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
                                <label className="flex items-center gap-1.5 px-3 py-2 border border-slate-300 bg-white text-slate-700 rounded-lg hover:bg-slate-50 transition-all text-sm font-medium cursor-pointer">
                                    <Upload className="w-4 h-4" /> Import
                                    <input type="file" accept=".xlsx" onChange={handleFileUpload} disabled={isUploading} className="hidden" />
                                </label>
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
                                <div className="overflow-auto" style={{ maxHeight: 'calc(100vh - 400px)' }}>
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
                                                <th className="px-4 py-3 text-left font-semibold">Mã Quyền</th>
                                                <th className="px-4 py-3 text-left font-semibold">Mô Tả</th>
                                                <th className="px-4 py-3 text-center font-semibold">Thao Tác</th>
                                            </tr>
                                        </thead>
                                        <tbody className="divide-y divide-slate-100">
                                            {filtered.map((p) => {
                                                const isSelected = selectedIds.has(p.id);
                                                return (
                                                    <tr key={p.id} className={`transition-colors hover:bg-blue-50/60 ${isSelected ? 'bg-blue-50' : ''}`}>
                                                        <td className="px-4 py-3">
                                                            <button
                                                                onClick={() => toggleSelect(p.id)}
                                                                className="p-1 hover:bg-blue-100 rounded transition-colors"
                                                            >
                                                                {isSelected
                                                                    ? <CheckSquare className="w-4 h-4 text-blue-600" />
                                                                    : <Square className="w-4 h-4 text-slate-400" />
                                                                }
                                                            </button>
                                                        </td>
                                                        <td className="px-4 py-3 font-semibold text-slate-900">
                                                            <div className="flex items-center gap-2">
                                                                <Lock className="w-4 h-4 text-blue-600" />
                                                                {p.maPermissions}
                                                            </div>
                                                        </td>
                                                        <td className="px-4 py-3 text-slate-600">{p.moTa || '-'}</td>
                                                        <td className="px-4 py-3">
                                                            <div className="flex items-center justify-center gap-1">
                                                                <button
                                                                    onClick={() => openEdit(p)}
                                                                    className="p-1.5 text-blue-600 hover:bg-blue-100 rounded-lg transition-colors"
                                                                    title="Chỉnh sửa"
                                                                >
                                                                    <Edit className="w-4 h-4" />
                                                                </button>
                                                                <button
                                                                    onClick={() => handleDelete(p)}
                                                                    className="p-1.5 text-red-500 hover:bg-red-100 rounded-lg transition-colors"
                                                                    title="Xóa"
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
                                                    <td colSpan={4} className="py-16 text-center">
                                                        <div className="flex flex-col items-center gap-2">
                                                            <div className="rounded-full bg-slate-100 p-4">
                                                                <Lock className="w-8 h-8 text-slate-400" />
                                                            </div>
                                                            <p className="font-medium text-slate-600">
                                                                {searchQuery ? 'Không tìm thấy kết quả' : 'Chưa có quyền hạn nào'}
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
                        {!loading && permissions.length > 0 && (
                            <div className="flex items-center justify-between text-xs text-slate-500 px-1">
                                <span>
                                    Hiển thị <b className="text-slate-700">{filtered.length}</b> / <b className="text-slate-700">{permissions.length}</b> quyền hạn
                                </span>
                                {selectedIds.size > 0 && (
                                    <span>Đã chọn <b className="text-blue-600">{selectedIds.size}</b> quyền</span>
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
                            <h2 className="text-base font-bold flex items-center gap-2"><Plus className="w-5 h-5" /> Thêm Quyền Hạn Mới</h2>
                            <button onClick={() => setIsAddOpen(false)} className="p-1 hover:bg-white/20 rounded-lg"><X className="w-5 h-5" /></button>
                        </div>
                        <form className="p-6 space-y-5" onSubmit={handleCreate}>
                            <div>
                                <label className="block text-sm font-medium text-slate-700 mb-1.5">Mã quyền <span className="text-red-500">*</span></label>
                                <input
                                    required
                                    value={form.maPermissions}
                                    onChange={(e) => setForm({ ...form, maPermissions: e.target.value })}
                                    placeholder="VD: CREATE_USER, EDIT_ROLE"
                                    className="w-full px-3 py-2.5 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-slate-700 mb-1.5">Mô tả</label>
                                <textarea
                                    value={form.moTa}
                                    onChange={(e) => setForm({ ...form, moTa: e.target.value })}
                                    placeholder="Nhập mô tả về quyền hạn..."
                                    rows={3}
                                    className="w-full px-3 py-2.5 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
                                />
                            </div>
                            <div className="flex gap-3 pt-4 border-t border-slate-100">
                                <button type="button" onClick={() => setIsAddOpen(false)} className="flex-1 py-2.5 border border-slate-300 rounded-xl text-sm font-medium text-slate-700 hover:bg-slate-50">
                                    Hủy
                                </button>
                                <button type="submit" disabled={isSubmitting} className="flex-1 py-2.5 bg-blue-600 text-white rounded-xl text-sm font-medium hover:bg-blue-700 disabled:opacity-50">
                                    {isSubmitting ? 'Đang thêm...' : 'Thêm Quyền'}
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
                                <h2 className="text-base font-bold flex items-center gap-2"><Edit className="w-5 h-5" /> Chỉnh Sửa Quyền Hạn</h2>
                                <p className="text-xs text-blue-200 mt-0.5">{selected.maPermissions}</p>
                            </div>
                            <button onClick={() => setIsEditOpen(false)} className="p-1 hover:bg-white/20 rounded-lg"><X className="w-5 h-5" /></button>
                        </div>
                        <form className="p-6 space-y-5" onSubmit={handleUpdate}>
                            <div>
                                <label className="block text-sm font-medium text-slate-700 mb-1.5">Mã quyền</label>
                                <input
                                    disabled
                                    value={form.maPermissions}
                                    className="w-full px-3 py-2.5 border border-slate-300 rounded-lg text-sm bg-slate-100 text-slate-600 cursor-not-allowed"
                                />
                                <p className="text-xs text-slate-500 mt-1">Không thể thay đổi mã quyền</p>
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
                                Xác nhận xóa {selectedIds.size > 1 ? `${selectedIds.size} quyền` : 'quyền'}
                            </h3>
                        </div>
                        <p className="text-sm text-slate-600 mb-4">
                            Bạn có chắc muốn xóa <b>{selectedIds.size}</b> quyền đã chọn?
                        </p>
                        <div className="bg-amber-50 border border-amber-200 rounded-lg p-3 mb-4">
                            <p className="text-xs text-amber-700">
                                <AlertCircle className="w-3 h-3 inline mr-1" />
                                Nếu quyền đang được gán cho vai trò, quyền đó sẽ không thể xóa.
                            </p>
                        </div>
                        <div className="flex gap-3">
                            <button onClick={() => setIsDeleteModalOpen(false)} disabled={isDeleting} className="flex-1 py-2.5 border border-slate-300 rounded-xl text-sm font-medium text-slate-700 hover:bg-slate-50 disabled:opacity-50">
                                Hủy
                            </button>
                            <button
                                onClick={confirmDelete}
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
