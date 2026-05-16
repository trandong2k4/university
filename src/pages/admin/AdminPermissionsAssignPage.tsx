import { AdminSidebar } from '@/components/layouts/AdminSidebar';
import { AdminHeader } from '@/components/layouts/AdminHeader';
import { useEffect, useState } from 'react';
import { Plus, Trash2, X, Search, Users, AlertCircle, CheckCircle } from 'lucide-react';
import AiAssistantButton from '@/imports/AiAssistantButton-4-13343';
import type { UserRoleItem } from '@/api/admin/user-role.api';
import type { RolePermissionsItem } from '@/api/admin/role-permissions.api';
import type { RoleItem } from '@/api/admin/role.api';
import type { PermissionsItem } from '@/api/admin/permissions.api';
import type { UsersItem } from '@/common/types';
import * as userRoleApi from '@/api/admin/user-role.api';
import * as rolePermissionsApi from '@/api/admin/role-permissions.api';
import * as usersApi from '@/api/admin/users.api';
import * as roleApi from '@/api/admin/role.api';
import * as permissionsApi from '@/api/admin/permissions.api';

interface Toast {
    id: string;
    message: string;
    type: 'success' | 'error' | 'info';
}

export default function AdminPermissionsAssignPage() {
    const [activeTab, setActiveTab] = useState<'user-roles' | 'role-permissions'>('user-roles');
    const [loading, setLoading] = useState(false);
    const [searchQuery, setSearchQuery] = useState('');
    const [toasts, setToasts] = useState<Toast[]>([]);

    // User Roles State
    const [userRoles, setUserRoles] = useState<UserRoleItem[]>([]);
    const [users, setUsers] = useState<UsersItem[]>([]);
    const [roles, setRoles] = useState<RoleItem[]>([]);
    const [isAssignRoleOpen, setIsAssignRoleOpen] = useState(false);
    const [selectedUser, setSelectedUser] = useState<string>('');
    const [selectedRole, setSelectedRole] = useState<string>('');
    const [isSubmitting, setIsSubmitting] = useState(false);

    // Role Permissions State
    const [rolePermissions, setRolePermissions] = useState<RolePermissionsItem[]>([]);
    const [permissions, setPermissions] = useState<PermissionsItem[]>([]);
    const [selectedRoleForPerm, setSelectedRoleForPerm] = useState<string>('');
    const [isAssignPermOpen, setIsAssignPermOpen] = useState(false);
    const [selectedPermission, setSelectedPermission] = useState<string>('');

    const addToast = (message: string, type: 'success' | 'error' | 'info' = 'info') => {
        const id = Date.now().toString();
        setToasts(prev => [...prev, { id, message, type }]);
        setTimeout(() => {
            setToasts(prev => prev.filter(t => t.id !== id));
        }, 3000);
    };

    const fetchUserRoles = async () => {
        try {
            const data = await userRoleApi.getUserRoles();
            setUserRoles(data || []);
        } catch (err) {
            console.error(err);
            addToast('Lỗi khi tải dữ liệu người dùng - vai trò', 'error');
        }
    };

    const fetchUsers = async () => {
        try {
            const data = await usersApi.getUsers();
            setUsers(data || []);
        } catch (err) {
            console.error(err);
        }
    };

    const fetchRoles = async () => {
        try {
            const data = await roleApi.getRoles();
            setRoles(data || []);
        } catch (err) {
            console.error(err);
        }
    };

    const fetchRolePermissions = async () => {
        try {
            const data = await rolePermissionsApi.getRolePermissions();
            setRolePermissions(data || []);
        } catch (err) {
            console.error(err);
            addToast('Lỗi khi tải dữ liệu vai trò - quyền hạn', 'error');
        }
    };

    const fetchPermissions = async () => {
        try {
            const data = await permissionsApi.getPermissions();
            setPermissions(data || []);
        } catch (err) {
            console.error(err);
        }
    };

    useEffect(() => {
        const loadData = async () => {
            setLoading(true);
            if (activeTab === 'user-roles') {
                await Promise.all([fetchUserRoles(), fetchUsers(), fetchRoles()]);
            } else {
                await Promise.all([fetchRolePermissions(), fetchRoles(), fetchPermissions()]);
            }
            setLoading(false);
        };
        loadData();
    }, [activeTab]);

    // User Roles Handlers
    const filteredUserRoles = userRoles.filter(ur =>
        users.find(u => u.id === ur.usersId)?.hoTen?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        roles.find(r => r.id === ur.roleId)?.maRole?.toLowerCase().includes(searchQuery.toLowerCase())
    );

    const handleAssignRole = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!selectedUser || !selectedRole) {
            addToast('Vui lòng chọn người dùng và vai trò', 'error');
            return;
        }

        try {
            setIsSubmitting(true);
            await userRoleApi.assignUserRole({
                usersId: selectedUser,
                roleId: selectedRole
            });
            addToast('Phân quyền thành công!', 'success');
            setIsAssignRoleOpen(false);
            setSelectedUser('');
            setSelectedRole('');
            await fetchUserRoles();
        } catch (err) {
            console.error(err);
            addToast('Lỗi khi phân quyền', 'error');
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleRemoveUserRole = async (id: string) => {
        if (!confirm('Bạn có chắc chắn muốn xóa quyền này?')) return;
        try {
            await userRoleApi.removeUserRole(id);
            addToast('Xóa quyền thành công!', 'success');
            await fetchUserRoles();
        } catch (err) {
            console.error(err);
            addToast('Lỗi khi xóa quyền', 'error');
        }
    };

    // Role Permissions Handlers
    const filteredRolePermissions = rolePermissions.filter(rp =>
        selectedRoleForPerm === '' || rp.roleId === selectedRoleForPerm
    );

    const handleAssignPermission = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!selectedRoleForPerm || !selectedPermission) {
            addToast('Vui lòng chọn vai trò và quyền hạn', 'error');
            return;
        }

        try {
            setIsSubmitting(true);
            await rolePermissionsApi.assignRolePermission({
                roleId: selectedRoleForPerm,
                permissionsId: selectedPermission
            });
            addToast('Gán quyền hạn thành công!', 'success');
            setIsAssignPermOpen(false);
            setSelectedPermission('');
            await fetchRolePermissions();
        } catch (err) {
            console.error(err);
            addToast('Lỗi khi gán quyền hạn', 'error');
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleRemoveRolePermission = async (id: string) => {
        if (!confirm('Bạn có chắc chắn muốn xóa quyền hạn này?')) return;
        try {
            await rolePermissionsApi.removeRolePermission(id);
            addToast('Xóa quyền hạn thành công!', 'success');
            await fetchRolePermissions();
        } catch (err) {
            console.error(err);
            addToast('Lỗi khi xóa quyền hạn', 'error');
        }
    };

    return (
        <div className="flex h-screen bg-slate-50">
            <AdminSidebar activeMenu="permissions" />
            <div className="flex-1 ml-64 flex flex-col overflow-hidden">
                <AdminHeader title="Phân Quyền" />
                <div className="flex-1 overflow-auto">
                    <div className="p-6 max-w-7xl mx-auto space-y-6">
                        {/* Tab Navigation */}
                        <div className="flex gap-2 bg-white rounded-xl shadow-sm border border-slate-200 p-2">
                            <button
                                onClick={() => setActiveTab('user-roles')}
                                className={`flex-1 px-4 py-2.5 rounded-lg font-medium transition-all ${activeTab === 'user-roles'
                                    ? 'bg-gradient-to-r from-blue-600 to-blue-700 text-white'
                                    : 'text-slate-700 hover:bg-slate-100'
                                    }`}
                            >
                                Người Dùng - Vai Trò
                            </button>
                            <button
                                onClick={() => setActiveTab('role-permissions')}
                                className={`flex-1 px-4 py-2.5 rounded-lg font-medium transition-all ${activeTab === 'role-permissions'
                                    ? 'bg-gradient-to-r from-blue-600 to-blue-700 text-white'
                                    : 'text-slate-700 hover:bg-slate-100'
                                    }`}
                            >
                                Vai Trò - Quyền Hạn
                            </button>
                        </div>

                        {/* User Roles Tab */}
                        {activeTab === 'user-roles' && (
                            <>
                                {/* Search and Add Section */}
                                <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                                    <div className="relative flex-1 max-w-md w-full">
                                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                                        <input
                                            value={searchQuery}
                                            onChange={(e) => setSearchQuery(e.target.value)}
                                            placeholder="Tìm kiếm người dùng hoặc vai trò..."
                                            className="w-full pl-10 pr-4 py-2.5 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                                        />
                                    </div>
                                    <button
                                        onClick={() => setIsAssignRoleOpen(true)}
                                        className="flex items-center gap-2 px-4 py-2.5 bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-lg hover:shadow-lg hover:from-blue-700 hover:to-blue-800 transition-all font-medium whitespace-nowrap"
                                    >
                                        <Plus className="w-5 h-5" /> Phân Quyền
                                    </button>
                                </div>

                                {/* Table Section */}
                                <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
                                    {loading ? (
                                        <div className="flex items-center justify-center h-96">
                                            <div className="text-center">
                                                <div className="inline-block mb-4">
                                                    <div className="w-12 h-12 border-4 border-slate-200 border-t-blue-600 rounded-full animate-spin"></div>
                                                </div>
                                                <p className="text-slate-600 font-medium">Đang tải dữ liệu...</p>
                                            </div>
                                        </div>
                                    ) : (
                                        <div className="overflow-x-auto">
                                            <table className="w-full">
                                                <thead className="bg-gradient-to-r from-blue-600 to-blue-700 text-white">
                                                    <tr>
                                                        <th className="px-6 py-4 text-left text-sm font-semibold">Tên Người Dùng</th>
                                                        <th className="px-6 py-4 text-left text-sm font-semibold">Email</th>
                                                        <th className="px-6 py-4 text-left text-sm font-semibold">Vai Trò</th>
                                                        <th className="px-6 py-4 text-left text-sm font-semibold">Ngày Gán</th>
                                                        <th className="px-6 py-4 text-center text-sm font-semibold">Thao Tác</th>
                                                    </tr>
                                                </thead>
                                                <tbody className="divide-y divide-slate-200">
                                                    {filteredUserRoles.map((ur) => {
                                                        const user = users.find(u => u.id === ur.usersId);
                                                        const role = roles.find(r => r.id === ur.roleId);
                                                        return (
                                                            <tr key={ur.id} className="hover:bg-blue-50 transition-colors">
                                                                <td className="px-6 py-4 text-sm font-semibold text-slate-900">{user?.hoTen}</td>
                                                                <td className="px-6 py-4 text-sm text-slate-600">{user?.email}</td>
                                                                <td className="px-6 py-4 text-sm">
                                                                    <span className="inline-block px-3 py-1 rounded-full text-xs font-semibold bg-blue-100 text-blue-800">
                                                                        {role?.maRole}
                                                                    </span>
                                                                </td>
                                                                <td className="px-6 py-4 text-sm text-slate-600">
                                                                    {new Date(ur.createdAt).toLocaleDateString('vi-VN')}
                                                                </td>
                                                                <td className="px-6 py-4">
                                                                    <div className="flex items-center justify-center">
                                                                        <button
                                                                            onClick={() => handleRemoveUserRole(ur.id)}
                                                                            className="p-2 text-red-600 hover:bg-red-100 rounded-lg transition-colors"
                                                                            title="Xóa"
                                                                        >
                                                                            <Trash2 className="w-4 h-4" />
                                                                        </button>
                                                                    </div>
                                                                </td>
                                                            </tr>
                                                        );
                                                    })}
                                                    {!loading && filteredUserRoles.length === 0 && (
                                                        <tr>
                                                            <td colSpan={5} className="px-6 py-16">
                                                                <div className="flex flex-col items-center gap-3">
                                                                    <div className="rounded-full bg-slate-100 p-4">
                                                                        <Users className="w-8 h-8 text-slate-400" />
                                                                    </div>
                                                                    <p className="text-lg font-semibold text-slate-900">
                                                                        {searchQuery ? 'Không tìm thấy phân quyền' : 'Chưa có phân quyền nào'}
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
                            </>
                        )}

                        {/* Role Permissions Tab */}
                        {activeTab === 'role-permissions' && (
                            <>
                                {/* Filter and Add Section */}
                                <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                                    <select
                                        value={selectedRoleForPerm}
                                        onChange={(e) => setSelectedRoleForPerm(e.target.value)}
                                        className="flex-1 max-w-sm px-3 py-2.5 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                                    >
                                        <option value="">-- Tất cả vai trò --</option>
                                        {roles.map(r => (
                                            <option key={r.id} value={r.id}>{r.maRole}</option>
                                        ))}
                                    </select>
                                    <button
                                        onClick={() => setIsAssignPermOpen(true)}
                                        className="flex items-center gap-2 px-4 py-2.5 bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-lg hover:shadow-lg hover:from-blue-700 hover:to-blue-800 transition-all font-medium whitespace-nowrap"
                                    >
                                        <Plus className="w-5 h-5" /> Gán Quyền
                                    </button>
                                </div>

                                {/* Table Section */}
                                <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
                                    {loading ? (
                                        <div className="flex items-center justify-center h-96">
                                            <div className="text-center">
                                                <div className="inline-block mb-4">
                                                    <div className="w-12 h-12 border-4 border-slate-200 border-t-blue-600 rounded-full animate-spin"></div>
                                                </div>
                                                <p className="text-slate-600 font-medium">Đang tải dữ liệu...</p>
                                            </div>
                                        </div>
                                    ) : (
                                        <div className="overflow-x-auto">
                                            <table className="w-full">
                                                <thead className="bg-gradient-to-r from-blue-600 to-blue-700 text-white">
                                                    <tr>
                                                        <th className="px-6 py-4 text-left text-sm font-semibold">Vai Trò</th>
                                                        <th className="px-6 py-4 text-left text-sm font-semibold">Quyền Hạn</th>
                                                        <th className="px-6 py-4 text-left text-sm font-semibold">Mô Tả</th>
                                                        <th className="px-6 py-4 text-center text-sm font-semibold">Thao Tác</th>
                                                    </tr>
                                                </thead>
                                                <tbody className="divide-y divide-slate-200">
                                                    {filteredRolePermissions.map((rp) => {
                                                        const role = roles.find(r => r.id === rp.roleId);
                                                        const permission = permissions.find(p => p.id === rp.permissionsId);
                                                        return (
                                                            <tr key={rp.id} className="hover:bg-blue-50 transition-colors">
                                                                <td className="px-6 py-4 text-sm font-semibold text-slate-900">
                                                                    <span className="inline-block px-3 py-1 rounded-full text-xs font-semibold bg-purple-100 text-purple-800">
                                                                        {role?.maRole}
                                                                    </span>
                                                                </td>
                                                                <td className="px-6 py-4 text-sm font-semibold text-slate-900">
                                                                    <span className="inline-block px-3 py-1 rounded-full text-xs font-semibold bg-green-100 text-green-800">
                                                                        {permission?.maPermissions}
                                                                    </span>
                                                                </td>
                                                                <td className="px-6 py-4 text-sm text-slate-600">{permission?.moTa || '-'}</td>
                                                                <td className="px-6 py-4">
                                                                    <div className="flex items-center justify-center">
                                                                        <button
                                                                            onClick={() => handleRemoveRolePermission(rp.id)}
                                                                            className="p-2 text-red-600 hover:bg-red-100 rounded-lg transition-colors"
                                                                            title="Xóa"
                                                                        >
                                                                            <Trash2 className="w-4 h-4" />
                                                                        </button>
                                                                    </div>
                                                                </td>
                                                            </tr>
                                                        );
                                                    })}
                                                    {!loading && filteredRolePermissions.length === 0 && (
                                                        <tr>
                                                            <td colSpan={4} className="px-6 py-16">
                                                                <div className="flex flex-col items-center gap-3">
                                                                    <div className="rounded-full bg-slate-100 p-4">
                                                                        <Users className="w-8 h-8 text-slate-400" />
                                                                    </div>
                                                                    <p className="text-lg font-semibold text-slate-900">
                                                                        Chưa có gán quyền hạn
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
                            </>
                        )}
                    </div>
                </div>
            </div>

            {/* Assign Role Modal */}
            {isAssignRoleOpen && activeTab === 'user-roles' && (
                <div className="fixed inset-0 bg-black bg-opacity-30 flex items-center justify-center z-50 p-4">
                    <div className="bg-white rounded-xl shadow-2xl max-w-lg w-full">
                        <div className="bg-gradient-to-r from-blue-600 to-blue-700 text-white px-6 py-4 flex items-center justify-between">
                            <h2 className="text-xl font-bold flex items-center gap-2"><Plus className="w-6 h-6" /> Phân Quyền Cho Người Dùng</h2>
                            <button
                                onClick={() => setIsAssignRoleOpen(false)}
                                className="p-1 hover:bg-white/20 rounded-lg transition-colors"
                            >
                                <X className="w-6 h-6" />
                            </button>
                        </div>
                        <form className="p-6 space-y-4" onSubmit={handleAssignRole}>
                            <div>
                                <label className="block text-sm font-semibold text-slate-900 mb-2">
                                    Người dùng <span className="text-red-500">*</span>
                                </label>
                                <select
                                    required
                                    value={selectedUser}
                                    onChange={(e) => setSelectedUser(e.target.value)}
                                    className="w-full px-3 py-2.5 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                                >
                                    <option value="">-- Chọn người dùng --</option>
                                    {users.map(u => (
                                        <option key={u.id} value={u.id}>{u.hoTen} ({u.userName})</option>
                                    ))}
                                </select>
                            </div>
                            <div>
                                <label className="block text-sm font-semibold text-slate-900 mb-2">
                                    Vai trò <span className="text-red-500">*</span>
                                </label>
                                <select
                                    required
                                    value={selectedRole}
                                    onChange={(e) => setSelectedRole(e.target.value)}
                                    className="w-full px-3 py-2.5 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                                >
                                    <option value="">-- Chọn vai trò --</option>
                                    {roles.map(r => (
                                        <option key={r.id} value={r.id}>{r.maRole}</option>
                                    ))}
                                </select>
                            </div>

                            <div className="flex gap-3 pt-4 border-t border-slate-200">
                                <button
                                    type="button"
                                    onClick={() => setIsAssignRoleOpen(false)}
                                    className="flex-1 px-4 py-2.5 border border-slate-300 rounded-lg hover:bg-slate-50 transition-colors font-medium text-slate-700"
                                >
                                    Hủy
                                </button>
                                <button
                                    type="submit"
                                    disabled={isSubmitting}
                                    className="flex-1 px-4 py-2.5 bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-lg hover:shadow-lg hover:from-blue-700 hover:to-blue-800 transition-all font-medium disabled:opacity-50 disabled:cursor-not-allowed"
                                >
                                    {isSubmitting ? 'Đang phân quyền...' : 'Phân Quyền'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* Assign Permission Modal */}
            {isAssignPermOpen && activeTab === 'role-permissions' && (
                <div className="fixed inset-0 bg-black bg-opacity-30 flex items-center justify-center z-50 p-4">
                    <div className="bg-white rounded-xl shadow-2xl max-w-lg w-full">
                        <div className="bg-gradient-to-r from-blue-600 to-blue-700 text-white px-6 py-4 flex items-center justify-between">
                            <h2 className="text-xl font-bold flex items-center gap-2"><Plus className="w-6 h-6" /> Gán Quyền Cho Vai Trò</h2>
                            <button
                                onClick={() => setIsAssignPermOpen(false)}
                                className="p-1 hover:bg-white/20 rounded-lg transition-colors"
                            >
                                <X className="w-6 h-6" />
                            </button>
                        </div>
                        <form className="p-6 space-y-4" onSubmit={handleAssignPermission}>
                            <div>
                                <label className="block text-sm font-semibold text-slate-900 mb-2">
                                    Vai trò <span className="text-red-500">*</span>
                                </label>
                                <select
                                    required
                                    value={selectedRoleForPerm}
                                    onChange={(e) => setSelectedRoleForPerm(e.target.value)}
                                    className="w-full px-3 py-2.5 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                                >
                                    <option value="">-- Chọn vai trò --</option>
                                    {roles.map(r => (
                                        <option key={r.id} value={r.id}>{r.maRole}</option>
                                    ))}
                                </select>
                            </div>
                            <div>
                                <label className="block text-sm font-semibold text-slate-900 mb-2">
                                    Quyền hạn <span className="text-red-500">*</span>
                                </label>
                                <select
                                    required
                                    value={selectedPermission}
                                    onChange={(e) => setSelectedPermission(e.target.value)}
                                    className="w-full px-3 py-2.5 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                                >
                                    <option value="">-- Chọn quyền hạn --</option>
                                    {permissions.map(p => (
                                        <option key={p.id} value={p.id}>{p.maPermissions}</option>
                                    ))}
                                </select>
                            </div>

                            <div className="flex gap-3 pt-4 border-t border-slate-200">
                                <button
                                    type="button"
                                    onClick={() => setIsAssignPermOpen(false)}
                                    className="flex-1 px-4 py-2.5 border border-slate-300 rounded-lg hover:bg-slate-50 transition-colors font-medium text-slate-700"
                                >
                                    Hủy
                                </button>
                                <button
                                    type="submit"
                                    disabled={isSubmitting}
                                    className="flex-1 px-4 py-2.5 bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-lg hover:shadow-lg hover:from-blue-700 hover:to-blue-800 transition-all font-medium disabled:opacity-50 disabled:cursor-not-allowed"
                                >
                                    {isSubmitting ? 'Đang gán...' : 'Gán Quyền'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* Toast Notifications */}
            <div className="fixed bottom-24 right-8 space-y-3 z-40">
                {toasts.map(toast => (
                    <div
                        key={toast.id}
                        className={`flex items-center gap-3 px-4 py-3 rounded-lg shadow-lg text-white font-medium ${toast.type === 'success' ? 'bg-green-500' :
                            toast.type === 'error' ? 'bg-red-500' :
                                'bg-blue-500'
                            }`}
                    >
                        {toast.type === 'success' && <CheckCircle className="w-5 h-5" />}
                        {toast.type === 'error' && <AlertCircle className="w-5 h-5" />}
                        {toast.message}
                    </div>
                ))}
            </div>

            {/* AI Assistant Button */}
            <button
                className="fixed bottom-8 right-8 w-16 h-16 z-50 hover:scale-110 transition-transform"
                aria-label="AI Assistant"
            >
                <AiAssistantButton />
            </button>
        </div>
    );
}
