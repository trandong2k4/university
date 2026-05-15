import { AdminSidebar } from '@/components/layouts/AdminSidebar';
import { AdminHeader } from '@/components/layouts/AdminHeader';
import { useEffect, useState, useMemo, useCallback } from 'react';
import { Plus, Trash2, X, Search, Users, AlertCircle, CheckCircle, RefreshCw, Shield } from 'lucide-react';
import AiAssistantButton from '@/imports/AiAssistantButton-4-13343';
import type { UserRoleItem, RoleItem, UsersItem } from '@/api/common/types';
import * as userRoleApi from '@/api/admin/user-role.api';
import * as usersApi from '@/api/admin/users.api';
import * as roleApi from '@/api/admin/role.api';

interface Toast {
    id: string;
    message: string;
    type: 'success' | 'error' | 'info';
}

export default function AdminPermissionsAssignPage() {
    const [loading, setLoading] = useState(false);
    const [searchQuery, setSearchQuery] = useState('');
    const [debouncedSearch, setDebouncedSearch] = useState('');
    const [toasts, setToasts] = useState<Toast[]>([]);
    const [confirmModal, setConfirmModal] = useState<{ open: boolean; message: string; onConfirm: (() => void) | null }>({ open: false, message: '', onConfirm: null });

    const [userRoles, setUserRoles] = useState<UserRoleItem[]>([]);
    const [users, setUsers] = useState<UsersItem[]>([]);
    const [roles, setRoles] = useState<RoleItem[]>([]);
    const [isAssignRoleOpen, setIsAssignRoleOpen] = useState(false);
    const [selectedUser, setSelectedUser] = useState<string>('');
    const [selectedRole, setSelectedRole] = useState<string>('');
    const [isSubmitting, setIsSubmitting] = useState(false);

    useEffect(() => {
        const timer = setTimeout(() => setDebouncedSearch(searchQuery), 300);
        return () => clearTimeout(timer);
    }, [searchQuery]);

    const addToast = useCallback((message: string, type: 'success' | 'error' | 'info' = 'info') => {
        const id = Date.now().toString();
        setToasts(prev => [...prev, { id, message, type }]);
        setTimeout(() => {
            setToasts(prev => prev.filter(t => t.id !== id));
        }, 4000);
    }, []);

    const fetchData = useCallback(async () => {
        try {
            setLoading(true);
            const [urData, usersData, rolesData] = await Promise.all([
                userRoleApi.getUserRoles(),
                usersApi.getUsers(),
                roleApi.getRoles(),
            ]);
            setUserRoles(urData || []);
            setUsers(usersData || []);
            setRoles(rolesData || []);
        } catch (err) {
            console.error(err);
            addToast('Lỗi khi tải dữ liệu', 'error');
        } finally {
            setLoading(false);
        }
    }, [addToast]);

    useEffect(() => { fetchData(); }, [fetchData]);

    const filteredUserRoles = useMemo(() =>
        userRoles.filter(ur =>
            users.find(u => u.id === ur.usersId)?.hoTen?.toLowerCase().includes(debouncedSearch.toLowerCase()) ||
            roles.find(r => r.id === ur.roleId)?.maRole?.toLowerCase().includes(debouncedSearch.toLowerCase())
        ),
        [userRoles, users, roles, debouncedSearch]
    );

    const uniqueUsersCount = useMemo(() => new Set(userRoles.map(ur => ur.usersId)).size, [userRoles]);
    const uniqueRolesCount = useMemo(() => new Set(userRoles.map(ur => ur.roleId)).size, [userRoles]);

    const handleAssignRole = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        if (!selectedUser || !selectedRole) {
            addToast('Vui lòng chọn người dùng và vai trò', 'error');
            return;
        }
        try {
            setIsSubmitting(true);
            await userRoleApi.assignUserRole({ usersId: selectedUser, roleId: selectedRole });
            addToast('Phân quyền thành công!', 'success');
            setIsAssignRoleOpen(false);
            setSelectedUser('');
            setSelectedRole('');
            await fetchData();
        } catch (err) {
            console.error(err);
            addToast('Lỗi khi phân quyền', 'error');
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleRemoveUserRole = (id: string) => {
        setConfirmModal({
            open: true,
            message: 'Bạn có chắc chắn muốn xóa phân quyền này? Hành động này không thể hoàn tác.',
            onConfirm: async () => {
                try {
                    await userRoleApi.removeUserRole(id);
                    addToast('Xóa quyền thành công!', 'success');
                    await fetchData();
                } catch (err) {
                    console.error(err);
                    addToast('Lỗi khi xóa quyền', 'error');
                }
            }
        });
    };

    return (
        <div className="flex h-screen bg-slate-50">
            <AdminSidebar activeMenu="permissions-assign" />
            <div className="flex-1 ml-64 flex flex-col overflow-hidden">
                <AdminHeader title="Phân Quyền Người Dùng" />
                <div className="flex-1 overflow-auto">
                    <div className="p-6 max-w-7xl mx-auto space-y-4">

                        {/* Stats Bar */}
                        <div className="grid grid-cols-3 gap-4">
                            <div className="bg-white border border-slate-200 rounded-xl px-5 py-3 flex items-center gap-3 shadow-sm">
                                <div className="rounded-lg bg-blue-100 p-2">
                                    <Shield className="w-5 h-5 text-blue-600" />
                                </div>
                                <div>
                                    <p className="text-xl font-bold text-slate-900">{userRoles.length}</p>
                                    <p className="text-xs text-slate-500">Tổng phân quyền</p>
                                </div>
                            </div>
                            <div className="bg-white border border-slate-200 rounded-xl px-5 py-3 flex items-center gap-3 shadow-sm">
                                <div className="rounded-lg bg-green-100 p-2">
                                    <Users className="w-5 h-5 text-green-600" />
                                </div>
                                <div>
                                    <p className="text-xl font-bold text-green-700">{uniqueUsersCount}</p>
                                    <p className="text-xs text-slate-500">Người dùng có quyền</p>
                                </div>
                            </div>
                            <div className="bg-white border border-slate-200 rounded-xl px-5 py-3 flex items-center gap-3 shadow-sm">
                                <div className="rounded-lg bg-purple-100 p-2">
                                    <Search className="w-5 h-5 text-purple-600" />
                                </div>
                                <div>
                                    <p className="text-xl font-bold text-purple-700">{uniqueRolesCount}</p>
                                    <p className="text-xs text-slate-500">Vai trò được dùng</p>
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
                                        placeholder="Tìm người dùng hoặc vai trò..."
                                        value={searchQuery}
                                        onChange={(e) => setSearchQuery(e.target.value)}
                                        className="w-full pl-9 pr-4 py-2 text-sm border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                                    />
                                </div>
                            </div>
                            <div className="flex items-center gap-2">
                                <button
                                    onClick={fetchData}
                                    title="Làm mới"
                                    className="p-2 border border-slate-300 rounded-lg text-slate-600 hover:bg-slate-50 transition-colors"
                                >
                                    <RefreshCw className="w-4 h-4" />
                                </button>
                                <button
                                    onClick={() => { setSelectedUser(''); setSelectedRole(''); setIsAssignRoleOpen(true); }}
                                    className="flex items-center gap-1.5 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 text-sm font-medium shadow-sm"
                                >
                                    <Plus className="w-4 h-4" /> Phân quyền
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
                                                <th className="px-4 py-3 text-left font-semibold">Tên Người Dùng</th>
                                                <th className="px-4 py-3 text-left font-semibold">Email</th>
                                                <th className="px-4 py-3 text-left font-semibold">Vai Trò</th>
                                                <th className="px-4 py-3 text-left font-semibold">Ngày Gán</th>
                                                <th className="px-4 py-3 text-center font-semibold">Thao Tác</th>
                                            </tr>
                                        </thead>
                                        <tbody className="divide-y divide-slate-100">
                                            {filteredUserRoles.map((ur) => {
                                                const user = users.find(u => u.id === ur.usersId);
                                                const role = roles.find(r => r.id === ur.roleId);
                                                return (
                                                    <tr key={ur.id} className="transition-colors hover:bg-blue-50/60">
                                                        <td className="px-4 py-3 font-semibold text-slate-900">{user?.hoTen || '-'}</td>
                                                        <td className="px-4 py-3 text-slate-600">{user?.email || '-'}</td>
                                                        <td className="px-4 py-3">
                                                            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-blue-100 text-blue-800">
                                                                <Shield className="w-3 h-3" />
                                                                {role?.maRole || '-'}
                                                            </span>
                                                        </td>
                                                        <td className="px-4 py-3 text-slate-500">
                                                            {ur.createdAt ? new Date(ur.createdAt).toLocaleDateString('vi-VN') : '-'}
                                                        </td>
                                                        <td className="px-4 py-3">
                                                            <div className="flex items-center justify-center">
                                                                <button
                                                                    onClick={() => handleRemoveUserRole(ur.id)}
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
                                            {filteredUserRoles.length === 0 && (
                                                <tr>
                                                    <td colSpan={5} className="py-16 text-center">
                                                        <div className="flex flex-col items-center gap-2">
                                                            <div className="rounded-full bg-slate-100 p-4">
                                                                <Users className="w-8 h-8 text-slate-400" />
                                                            </div>
                                                            <p className="font-medium text-slate-600">
                                                                {debouncedSearch ? 'Không tìm thấy kết quả' : 'Chưa có phân quyền nào'}
                                                            </p>
                                                            <p className="text-sm text-slate-400">
                                                                {debouncedSearch ? 'Thử từ khóa khác' : 'Nhấn "Phân quyền" để bắt đầu'}
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
                        {!loading && userRoles.length > 0 && (
                            <div className="flex items-center justify-between text-xs text-slate-500 px-1">
                                <span>
                                    Hiển thị <b className="text-slate-700">{filteredUserRoles.length}</b> / <b className="text-slate-700">{userRoles.length}</b> phân quyền
                                </span>
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {/* Assign Role Modal */}
            {isAssignRoleOpen && (
                <div className="fixed inset-0 bg-black/30 flex items-center justify-center z-50 p-4" onClick={() => setIsAssignRoleOpen(false)}>
                    <div className="bg-white rounded-2xl shadow-2xl max-w-lg w-full max-h-[90vh] overflow-y-auto" onClick={e => e.stopPropagation()}>
                        <div className="sticky top-0 bg-gradient-to-r from-blue-600 to-blue-700 text-white px-6 py-4 flex items-center justify-between rounded-t-2xl z-10">
                            <h2 className="text-base font-bold flex items-center gap-2"><Plus className="w-5 h-5" /> Phân Quyền Cho Người Dùng</h2>
                            <button onClick={() => setIsAssignRoleOpen(false)} className="p-1 hover:bg-white/20 rounded-lg">
                                <X className="w-5 h-5" />
                            </button>
                        </div>
                        <form className="p-6 space-y-5" onSubmit={handleAssignRole}>
                            <div>
                                <label className="block text-sm font-medium text-slate-700 mb-1.5">
                                    Người dùng <span className="text-red-500">*</span>
                                </label>
                                <select
                                    required
                                    value={selectedUser}
                                    onChange={(e) => setSelectedUser(e.target.value)}
                                    className="w-full px-3 py-2.5 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                                >
                                    <option value="">-- Chọn người dùng --</option>
                                    {users.map(u => (
                                        <option key={u.id} value={u.id}>{u.hoTen} ({u.userName})</option>
                                    ))}
                                </select>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-slate-700 mb-1.5">
                                    Vai trò <span className="text-red-500">*</span>
                                </label>
                                <select
                                    required
                                    value={selectedRole}
                                    onChange={(e) => setSelectedRole(e.target.value)}
                                    className="w-full px-3 py-2.5 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                                >
                                    <option value="">-- Chọn vai trò --</option>
                                    {roles.map(r => (
                                        <option key={r.id} value={r.id}>{r.maRole}</option>
                                    ))}
                                </select>
                            </div>
                            <div className="flex gap-3 pt-4 border-t border-slate-100">
                                <button type="button" onClick={() => setIsAssignRoleOpen(false)} className="flex-1 py-2.5 border border-slate-300 rounded-xl text-sm font-medium text-slate-700 hover:bg-slate-50">
                                    Hủy
                                </button>
                                <button type="submit" disabled={isSubmitting} className="flex-1 py-2.5 bg-blue-600 text-white rounded-xl text-sm font-medium hover:bg-blue-700 disabled:opacity-50">
                                    {isSubmitting ? 'Đang phân quyền...' : 'Phân Quyền'}
                                </button>
                            </div>
                        </form>
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

            {/* Confirm Delete Modal */}
            {confirmModal.open && (
                <div className="fixed inset-0 bg-black/30 flex items-center justify-center z-50 p-4" onClick={() => setConfirmModal(m => ({ ...m, open: false }))}>
                    <div className="bg-white rounded-2xl shadow-2xl max-w-sm w-full p-6" onClick={e => e.stopPropagation()}>
                        <div className="flex items-center gap-3 mb-4">
                            <div className="rounded-full bg-red-100 p-3 flex-shrink-0">
                                <AlertCircle className="w-6 h-6 text-red-600" />
                            </div>
                            <h3 className="font-bold text-slate-900">Xác nhận xóa</h3>
                        </div>
                        <p className="text-sm text-slate-600 mb-6">{confirmModal.message}</p>
                        <div className="flex gap-3">
                            <button onClick={() => setConfirmModal(m => ({ ...m, open: false }))} className="flex-1 py-2.5 border border-slate-300 rounded-xl text-sm font-medium text-slate-700 hover:bg-slate-50">
                                Hủy
                            </button>
                            <button
                                onClick={() => { confirmModal.onConfirm?.(); setConfirmModal(m => ({ ...m, open: false })); }}
                                className="flex-1 py-2.5 bg-red-600 text-white rounded-xl text-sm font-medium hover:bg-red-700"
                            >
                                Xóa
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
