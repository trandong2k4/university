import { AdminSidebar } from '@/components/layouts/AdminSidebar';
import { AdminHeader } from '@/components/layouts/AdminHeader';
import { useEffect, useRef, useState } from 'react';
import {
    Plus, Edit, Trash2, X, Search, Shield, Lock, Key,
    AlertCircle, CheckCircle, Upload, RefreshCw
} from 'lucide-react';
import AiAssistantButton from '@/imports/AiAssistantButton-4-13343';
import * as roleApi from '@/api/admin/role.api';
import * as permissionsApi from '@/api/admin/permissions.api';
import * as rolePermissionsApi from '@/api/admin/role-permissions.api';
import type { RoleItem } from '@/api/admin/role.api';
import type { PermissionsItem } from '@/api/admin/permissions.api';
import type { RolePermissionsItem } from '@/api/admin/role-permissions.api';

type TabType = 'roles' | 'permissions' | 'role-permissions';
interface Toast { id: string; message: string; type: 'success' | 'error' | 'info'; }

const extractError = (err: unknown, fallback: string): string => {
    if (err && typeof err === 'object') {
        const e = err as { response?: { data?: { detail?: string; message?: string } } };
        return e.response?.data?.detail || e.response?.data?.message || fallback;
    }
    return fallback;
};

export default function AdminAuthorizationPage() {
    const fileInputRef = useRef<HTMLInputElement>(null);

    // ── UI state ─────────────────────────────────────────────────────────────
    const [activeTab, setActiveTab]     = useState<TabType>('roles');
    const [searchQuery, setSearchQuery] = useState('');
    const [loading, setLoading]         = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [toasts, setToasts]           = useState<Toast[]>([]);
    const [confirmModal, setConfirmModal] = useState<{
        open: boolean; message: string; onConfirm: (() => void) | null;
    }>({ open: false, message: '', onConfirm: null });

    // ── Data ─────────────────────────────────────────────────────────────────
    const [roles, setRoles]               = useState<RoleItem[]>([]);
    const [permissions, setPermissions]   = useState<PermissionsItem[]>([]);
    const [rolePermissions, setRolePerms] = useState<RolePermissionsItem[]>([]);

    // ── Role tab state ────────────────────────────────────────────────────────
    const [isRoleAddOpen,  setIsRoleAddOpen]  = useState(false);
    const [isRoleEditOpen, setIsRoleEditOpen] = useState(false);
    const [selectedRole,   setSelectedRole]   = useState<RoleItem | null>(null);
    const [roleForm, setRoleForm]             = useState({ maRole: '', moTa: '' });

    // ── Permission tab state ──────────────────────────────────────────────────
    const [isPermAddOpen,  setIsPermAddOpen]  = useState(false);
    const [isPermEditOpen, setIsPermEditOpen] = useState(false);
    const [selectedPerm,   setSelectedPerm]   = useState<PermissionsItem | null>(null);
    const [permForm, setPermForm]             = useState({ maPermissions: '', moTa: '' });
    const [isUploading, setIsUploading]       = useState(false);

    // ── Role-permissions tab state ────────────────────────────────────────────
    const [roleFilter,    setRoleFilter]    = useState('');
    const [isAssignOpen,  setIsAssignOpen]  = useState(false);
    const [assignRoleId,  setAssignRoleId]  = useState('');
    const [assignPermId,  setAssignPermId]  = useState('');

    // ─────────────────────────────────────────────────────────────────────────
    // Helpers
    // ─────────────────────────────────────────────────────────────────────────
    const addToast = (message: string, type: Toast['type'] = 'info') => {
        const id = Date.now().toString();
        setToasts(p => [...p, { id, message, type }]);
        setTimeout(() => setToasts(p => p.filter(t => t.id !== id)), 4000);
    };

    const confirm = (message: string, onConfirm: () => void) =>
        setConfirmModal({ open: true, message, onConfirm });

    // ─────────────────────────────────────────────────────────────────────────
    // Fetch
    // ─────────────────────────────────────────────────────────────────────────
    const fetchAll = async () => {
        setLoading(true);
        try {
            const [rolesData, permsData] = await Promise.all([
                roleApi.getAllRoles(),
                permissionsApi.getAllPermissions(),
            ]);
            setRoles(rolesData || []);
            setPermissions(permsData || []);

            const allAssigned: RolePermissionsItem[] = [];
            await Promise.all(
                (rolesData || []).map(async (role) => {
                    try {
                        const items = await rolePermissionsApi.getRolePermissionsByRole(role.id);
                        items.filter(i => i.status).forEach(i =>
                            allAssigned.push({ ...i, roleId: role.id })
                        );
                    } catch { /* vai trò chưa có quyền */ }
                })
            );
            setRolePerms(allAssigned);
        } catch (err) {
            addToast(extractError(err, 'Lỗi khi tải dữ liệu'), 'error');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => { fetchAll(); }, []);

    // ─────────────────────────────────────────────────────────────────────────
    // Role handlers
    // ─────────────────────────────────────────────────────────────────────────
    const handleCreateRole = async (e: React.SyntheticEvent) => {
        e.preventDefault();
        if (!roleForm.maRole.trim()) { addToast('Vui lòng nhập mã vai trò', 'error'); return; }
        try {
            setIsSubmitting(true);
            await roleApi.createRole(roleForm);
            addToast('Thêm vai trò thành công!', 'success');
            setIsRoleAddOpen(false);
            await fetchAll();
        } catch (err) { addToast(extractError(err, 'Lỗi khi thêm vai trò'), 'error'); }
        finally { setIsSubmitting(false); }
    };

    const handleUpdateRole = async (e: React.SyntheticEvent) => {
        e.preventDefault();
        if (!selectedRole) return;
        try {
            setIsSubmitting(true);
            await roleApi.updateRole(selectedRole.id, { moTa: roleForm.moTa });
            addToast('Cập nhật vai trò thành công!', 'success');
            setIsRoleEditOpen(false);
            await fetchAll();
        } catch (err) { addToast(extractError(err, 'Lỗi khi cập nhật'), 'error'); }
        finally { setIsSubmitting(false); }
    };

    const handleDeleteRole = (id: string) =>
        confirm('Xóa vai trò này? Hành động không thể hoàn tác.', async () => {
            try {
                await roleApi.deleteRole(id);
                addToast('Xóa vai trò thành công!', 'success');
                await fetchAll();
            } catch (err) { addToast(extractError(err, 'Lỗi khi xóa'), 'error'); }
        });

    // ─────────────────────────────────────────────────────────────────────────
    // Permission handlers
    // ─────────────────────────────────────────────────────────────────────────
    const handleCreatePerm = async (e: React.SyntheticEvent) => {
        e.preventDefault();
        if (!permForm.maPermissions.trim()) { addToast('Vui lòng nhập mã quyền', 'error'); return; }
        try {
            setIsSubmitting(true);
            await permissionsApi.createPermission(permForm);
            addToast('Thêm quyền hạn thành công!', 'success');
            setIsPermAddOpen(false);
            await fetchAll();
        } catch (err) { addToast(extractError(err, 'Lỗi khi thêm quyền'), 'error'); }
        finally { setIsSubmitting(false); }
    };

    const handleUpdatePerm = async (e: React.SyntheticEvent) => {
        e.preventDefault();
        if (!selectedPerm) return;
        try {
            setIsSubmitting(true);
            await permissionsApi.updatePermission(selectedPerm.id, { moTa: permForm.moTa });
            addToast('Cập nhật quyền hạn thành công!', 'success');
            setIsPermEditOpen(false);
            await fetchAll();
        } catch (err) { addToast(extractError(err, 'Lỗi khi cập nhật'), 'error'); }
        finally { setIsSubmitting(false); }
    };

    const handleDeletePerm = (id: string) =>
        confirm('Xóa quyền hạn này? Hành động không thể hoàn tác.', async () => {
            try {
                await permissionsApi.deletePermission(id);
                addToast('Xóa quyền hạn thành công!', 'success');
                await fetchAll();
            } catch (err) { addToast(extractError(err, 'Lỗi khi xóa'), 'error'); }
        });

    const handleImportExcel = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;
        try {
            setIsUploading(true);
            const formData = new FormData();
            formData.append('file', file);
            await permissionsApi.importFromExcel(formData);
            addToast('Import Excel thành công!', 'success');
            await fetchAll();
        } catch (err) { addToast(extractError(err, 'Lỗi khi import Excel'), 'error'); }
        finally {
            setIsUploading(false);
            if (fileInputRef.current) fileInputRef.current.value = '';
        }
    };

    // ─────────────────────────────────────────────────────────────────────────
    // Role-permissions handlers
    // ─────────────────────────────────────────────────────────────────────────
    const handleAssign = async (e: React.SyntheticEvent) => {
        e.preventDefault();
        if (!assignRoleId || !assignPermId) {
            addToast('Vui lòng chọn vai trò và quyền hạn', 'error'); return;
        }
        try {
            setIsSubmitting(true);
            await rolePermissionsApi.assignRolePermission({ roleId: assignRoleId, permissionsId: assignPermId });
            addToast('Gán quyền thành công!', 'success');
            setIsAssignOpen(false);
            setAssignRoleId(''); setAssignPermId('');
            await fetchAll();
        } catch (err) { addToast(extractError(err, 'Lỗi khi gán quyền'), 'error'); }
        finally { setIsSubmitting(false); }
    };

    const handleRemoveAssign = (id: string | null) => {
        if (!id) return;
        confirm('Xóa phân quyền này? Hành động không thể hoàn tác.', async () => {
            try {
                await rolePermissionsApi.removeRolePermission(id);
                addToast('Xóa phân quyền thành công!', 'success');
                await fetchAll();
            } catch (err) { addToast(extractError(err, 'Lỗi khi xóa'), 'error'); }
        });
    };

    // ─────────────────────────────────────────────────────────────────────────
    // Filtered data
    // ─────────────────────────────────────────────────────────────────────────
    const q = searchQuery.toLowerCase();

    const filteredRoles = roles.filter(r =>
        !q || r.maRole?.toLowerCase().includes(q) || r.moTa?.toLowerCase().includes(q)
    );

    const filteredPerms = permissions.filter(p =>
        !q || p.maPermissions?.toLowerCase().includes(q) || p.moTa?.toLowerCase().includes(q)
    );

    const filteredRolePerms = rolePermissions.filter(rp => {
        const roleName = roles.find(r => r.id === rp.roleId)?.maRole || '';
        const matchRole   = !roleFilter || rp.roleId === roleFilter;
        const matchSearch = !q || roleName.toLowerCase().includes(q) || rp.permissionsName?.toLowerCase().includes(q);
        return matchRole && matchSearch;
    });

    // ─────────────────────────────────────────────────────────────────────────
    // Style helpers
    // ─────────────────────────────────────────────────────────────────────────
    const tabCls = (active: boolean) =>
        `flex-1 flex items-center justify-center gap-2 px-4 py-3 rounded-lg font-medium transition-all ${
            active
                ? 'bg-gradient-to-r from-blue-600 to-blue-700 text-white shadow-md'
                : 'text-slate-700 hover:bg-slate-100'
        }`;

    const badgeCls = (active: boolean) =>
        `px-2 py-0.5 rounded-full text-xs font-semibold ${
            active ? 'bg-white/25 text-white' : 'bg-slate-200 text-slate-600'
        }`;

    const inp = 'w-full px-3 py-2.5 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all';
    const lbl = 'block text-sm font-semibold text-slate-800 mb-1.5';
    const mhdr = 'bg-gradient-to-r from-blue-600 to-blue-700 text-white px-6 py-4 flex items-center justify-between rounded-t-xl';

    const switchTab = (tab: TabType) => {
        setActiveTab(tab);
        setSearchQuery('');
        setRoleFilter('');
    };

    // ─────────────────────────────────────────────────────────────────────────
    // Render
    // ─────────────────────────────────────────────────────────────────────────
    return (
        <div className="flex h-screen bg-slate-50">
            <AdminSidebar activeMenu="authorization" />
            <div className="flex-1 ml-64 flex flex-col overflow-hidden">
                <AdminHeader title="Phân Quyền Hệ Thống" />
                <div className="flex-1 overflow-auto">
                    <div className="p-6 max-w-7xl mx-auto space-y-4">

                        {/* ── Tabs ─────────────────────────────────────────── */}
                        <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-2">
                            <div className="flex gap-2">
                                <button onClick={() => switchTab('roles')} className={tabCls(activeTab === 'roles')}>
                                    <Shield className="w-4 h-4" />
                                    Vai Trò
                                    <span className={badgeCls(activeTab === 'roles')}>{roles.length}</span>
                                </button>
                                <button onClick={() => switchTab('permissions')} className={tabCls(activeTab === 'permissions')}>
                                    <Lock className="w-4 h-4" />
                                    Quyền Hạn
                                    <span className={badgeCls(activeTab === 'permissions')}>{permissions.length}</span>
                                </button>
                                <button onClick={() => switchTab('role-permissions')} className={tabCls(activeTab === 'role-permissions')}>
                                    <Key className="w-4 h-4" />
                                    Phân Quyền
                                    <span className={badgeCls(activeTab === 'role-permissions')}>{rolePermissions.length}</span>
                                </button>
                            </div>
                        </div>

                        {/* ── Toolbar ──────────────────────────────────────── */}
                        <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-3 flex flex-wrap items-center gap-3">
                            <div className="relative flex-1 min-w-[200px] max-w-sm">
                                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                                <input
                                    value={searchQuery}
                                    onChange={e => setSearchQuery(e.target.value)}
                                    placeholder={
                                        activeTab === 'roles'            ? 'Tìm mã, mô tả vai trò...' :
                                        activeTab === 'permissions'      ? 'Tìm mã, mô tả quyền...' :
                                                                           'Tìm vai trò, quyền hạn...'
                                    }
                                    className="w-full pl-9 pr-4 py-2 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                                />
                            </div>

                            {activeTab === 'role-permissions' && (
                                <select
                                    value={roleFilter}
                                    onChange={e => setRoleFilter(e.target.value)}
                                    className="px-3 py-2 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                                >
                                    <option value="">-- Tất cả vai trò --</option>
                                    {roles.map(r => <option key={r.id} value={r.id}>{r.maRole}</option>)}
                                </select>
                            )}

                            <div className="flex items-center gap-2 ml-auto">
                                <button onClick={fetchAll} title="Làm mới"
                                    className="p-2 border border-slate-300 rounded-lg text-slate-600 hover:bg-slate-50 transition-colors">
                                    <RefreshCw className="w-4 h-4" />
                                </button>

                                {activeTab === 'permissions' && (
                                    <label className="flex items-center gap-1.5 px-3 py-2 border border-slate-300 text-slate-700 rounded-lg hover:bg-slate-50 text-sm font-medium cursor-pointer">
                                        <Upload className="w-4 h-4" />
                                        {isUploading ? 'Đang import...' : 'Import Excel'}
                                        <input
                                            ref={fileInputRef}
                                            type="file"
                                            accept=".xlsx"
                                            onChange={handleImportExcel}
                                            disabled={isUploading}
                                            className="hidden"
                                        />
                                    </label>
                                )}

                                <button
                                    onClick={() => {
                                        if (activeTab === 'roles') {
                                            setRoleForm({ maRole: '', moTa: '' });
                                            setIsRoleAddOpen(true);
                                        } else if (activeTab === 'permissions') {
                                            setPermForm({ maPermissions: '', moTa: '' });
                                            setIsPermAddOpen(true);
                                        } else {
                                            setAssignRoleId(''); setAssignPermId('');
                                            setIsAssignOpen(true);
                                        }
                                    }}
                                    className="flex items-center gap-1.5 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 text-sm font-medium shadow-sm"
                                >
                                    <Plus className="w-4 h-4" />
                                    {activeTab === 'roles' ? 'Thêm Vai Trò' :
                                     activeTab === 'permissions' ? 'Thêm Quyền' : 'Gán Quyền'}
                                </button>
                            </div>
                        </div>

                        {/* ── Table ────────────────────────────────────────── */}
                        <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
                            {loading ? (
                                <div className="flex flex-col items-center justify-center h-72 gap-3">
                                    <div className="w-9 h-9 border-4 border-slate-200 border-t-blue-600 rounded-full animate-spin" />
                                    <p className="text-sm text-slate-500">Đang tải...</p>
                                </div>
                            ) : (
                                <div className="overflow-auto" style={{ maxHeight: 'calc(100vh - 310px)' }}>
                                    <table className="w-full text-sm">
                                        <thead className="sticky top-0 z-10 bg-gradient-to-r from-blue-600 to-blue-700 text-white">
                                            {activeTab === 'roles' && (
                                                <tr>
                                                    <th className="px-6 py-3 text-left font-semibold">Mã Vai Trò</th>
                                                    <th className="px-6 py-3 text-left font-semibold">Mô Tả</th>
                                                    <th className="px-6 py-3 text-left font-semibold">Ngày Tạo</th>
                                                    <th className="px-6 py-3 text-center font-semibold">Thao Tác</th>
                                                </tr>
                                            )}
                                            {activeTab === 'permissions' && (
                                                <tr>
                                                    <th className="px-6 py-3 text-left font-semibold">Mã Quyền</th>
                                                    <th className="px-6 py-3 text-left font-semibold">Mô Tả</th>
                                                    <th className="px-6 py-3 text-center font-semibold">Thao Tác</th>
                                                </tr>
                                            )}
                                            {activeTab === 'role-permissions' && (
                                                <tr>
                                                    <th className="px-6 py-3 text-left font-semibold">Vai Trò</th>
                                                    <th className="px-6 py-3 text-left font-semibold">Quyền Hạn</th>
                                                    <th className="px-6 py-3 text-left font-semibold">Mô Tả</th>
                                                    <th className="px-6 py-3 text-center font-semibold">Thao Tác</th>
                                                </tr>
                                            )}
                                        </thead>
                                        <tbody className="divide-y divide-slate-100">

                                            {/* ── Roles ── */}
                                            {activeTab === 'roles' && filteredRoles.map(r => (
                                                <tr key={r.id} className="hover:bg-blue-50/60 transition-colors">
                                                    <td className="px-6 py-3 font-semibold text-slate-900">
                                                        <div className="flex items-center gap-2">
                                                            <Shield className="w-4 h-4 text-blue-600 shrink-0" />
                                                            {r.maRole}
                                                        </div>
                                                    </td>
                                                    <td className="px-6 py-3 text-slate-600">{r.moTa || '—'}</td>
                                                    <td className="px-6 py-3 text-slate-500">
                                                        {r.createdAt ? new Date(r.createdAt).toLocaleDateString('vi-VN') : '—'}
                                                    </td>
                                                    <td className="px-6 py-3">
                                                        <div className="flex items-center justify-center gap-1">
                                                            <button
                                                                onClick={() => {
                                                                    setSelectedRole(r);
                                                                    setRoleForm({ maRole: r.maRole, moTa: r.moTa || '' });
                                                                    setIsRoleEditOpen(true);
                                                                }}
                                                                className="p-1.5 text-blue-600 hover:bg-blue-100 rounded-lg transition-colors" title="Sửa"
                                                            >
                                                                <Edit className="w-4 h-4" />
                                                            </button>
                                                            <button onClick={() => handleDeleteRole(r.id)}
                                                                className="p-1.5 text-red-500 hover:bg-red-100 rounded-lg transition-colors" title="Xóa">
                                                                <Trash2 className="w-4 h-4" />
                                                            </button>
                                                        </div>
                                                    </td>
                                                </tr>
                                            ))}
                                            {activeTab === 'roles' && filteredRoles.length === 0 && (
                                                <tr><td colSpan={4} className="py-16 text-center">
                                                    <Shield className="w-10 h-10 mx-auto mb-2 text-slate-300" />
                                                    <p className="font-medium text-slate-600">{q ? 'Không tìm thấy vai trò' : 'Chưa có vai trò nào'}</p>
                                                </td></tr>
                                            )}

                                            {/* ── Permissions ── */}
                                            {activeTab === 'permissions' && filteredPerms.map(p => (
                                                <tr key={p.id} className="hover:bg-blue-50/60 transition-colors">
                                                    <td className="px-6 py-3 font-semibold text-slate-900">
                                                        <div className="flex items-center gap-2">
                                                            <Lock className="w-4 h-4 text-violet-600 shrink-0" />
                                                            {p.maPermissions}
                                                        </div>
                                                    </td>
                                                    <td className="px-6 py-3 text-slate-600">{p.moTa || '—'}</td>
                                                    <td className="px-6 py-3">
                                                        <div className="flex items-center justify-center gap-1">
                                                            <button
                                                                onClick={() => {
                                                                    setSelectedPerm(p);
                                                                    setPermForm({ maPermissions: p.maPermissions, moTa: p.moTa || '' });
                                                                    setIsPermEditOpen(true);
                                                                }}
                                                                className="p-1.5 text-blue-600 hover:bg-blue-100 rounded-lg transition-colors" title="Sửa"
                                                            >
                                                                <Edit className="w-4 h-4" />
                                                            </button>
                                                            <button onClick={() => handleDeletePerm(p.id)}
                                                                className="p-1.5 text-red-500 hover:bg-red-100 rounded-lg transition-colors" title="Xóa">
                                                                <Trash2 className="w-4 h-4" />
                                                            </button>
                                                        </div>
                                                    </td>
                                                </tr>
                                            ))}
                                            {activeTab === 'permissions' && filteredPerms.length === 0 && (
                                                <tr><td colSpan={3} className="py-16 text-center">
                                                    <Lock className="w-10 h-10 mx-auto mb-2 text-slate-300" />
                                                    <p className="font-medium text-slate-600">{q ? 'Không tìm thấy quyền hạn' : 'Chưa có quyền hạn nào'}</p>
                                                </td></tr>
                                            )}

                                            {/* ── Role-Permissions ── */}
                                            {activeTab === 'role-permissions' && filteredRolePerms.map((rp, idx) => {
                                                const roleName = roles.find(r => r.id === rp.roleId)?.maRole || rp.roleId || '';
                                                const permCode = permissions.find(p => p.id === rp.permissionsId)?.maPermissions || '';
                                                return (
                                                    <tr key={rp.id || idx} className="hover:bg-blue-50/60 transition-colors">
                                                        <td className="px-6 py-3">
                                                            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-blue-100 text-blue-700 border border-blue-200">
                                                                <Shield className="w-3 h-3" />
                                                                {roleName}
                                                            </span>
                                                        </td>
                                                        <td className="px-6 py-3">
                                                            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-violet-100 text-violet-700 border border-violet-200">
                                                                <Lock className="w-3 h-3" />
                                                                {permCode || rp.permissionsName}
                                                            </span>
                                                        </td>
                                                        <td className="px-6 py-3 text-slate-500 text-xs">{rp.permissionsName || '—'}</td>
                                                        <td className="px-6 py-3">
                                                            <div className="flex items-center justify-center">
                                                                <button onClick={() => handleRemoveAssign(rp.id)}
                                                                    className="p-1.5 text-red-500 hover:bg-red-100 rounded-lg transition-colors" title="Xóa phân quyền">
                                                                    <Trash2 className="w-4 h-4" />
                                                                </button>
                                                            </div>
                                                        </td>
                                                    </tr>
                                                );
                                            })}
                                            {activeTab === 'role-permissions' && filteredRolePerms.length === 0 && (
                                                <tr><td colSpan={4} className="py-16 text-center">
                                                    <Key className="w-10 h-10 mx-auto mb-2 text-slate-300" />
                                                    <p className="font-medium text-slate-600">{q || roleFilter ? 'Không tìm thấy phân quyền' : 'Chưa có phân quyền nào'}</p>
                                                </td></tr>
                                            )}

                                        </tbody>
                                    </table>
                                </div>
                            )}
                        </div>

                        {/* ── Footer ───────────────────────────────────────── */}
                        {!loading && (
                            <div className="text-xs text-slate-500 px-1">
                                {activeTab === 'roles' && (
                                    <span>Hiển thị <b className="text-slate-700">{filteredRoles.length}</b> / <b className="text-slate-700">{roles.length}</b> vai trò</span>
                                )}
                                {activeTab === 'permissions' && (
                                    <span>Hiển thị <b className="text-slate-700">{filteredPerms.length}</b> / <b className="text-slate-700">{permissions.length}</b> quyền hạn</span>
                                )}
                                {activeTab === 'role-permissions' && (
                                    <span>Hiển thị <b className="text-slate-700">{filteredRolePerms.length}</b> / <b className="text-slate-700">{rolePermissions.length}</b> phân quyền</span>
                                )}
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {/* ═══════════════════════════════════════════════════════════
                Modal: Thêm Vai Trò
            ═══════════════════════════════════════════════════════════ */}
            {isRoleAddOpen && (
                <div className="fixed inset-0 bg-black/30 flex items-center justify-center z-50 p-4" onClick={() => setIsRoleAddOpen(false)}>
                    <div className="bg-white rounded-xl shadow-2xl max-w-md w-full" onClick={e => e.stopPropagation()}>
                        <div className={mhdr}>
                            <h2 className="text-lg font-bold flex items-center gap-2"><Shield className="w-5 h-5" /> Thêm Vai Trò</h2>
                            <button onClick={() => setIsRoleAddOpen(false)} className="p-1 hover:bg-white/20 rounded-lg"><X className="w-5 h-5" /></button>
                        </div>
                        <form className="p-6 space-y-4" onSubmit={handleCreateRole}>
                            <div>
                                <label className={lbl}>Mã vai trò <span className="text-red-500">*</span></label>
                                <input required value={roleForm.maRole}
                                    onChange={e => setRoleForm({ ...roleForm, maRole: e.target.value })}
                                    placeholder="VD: ADMIN, TEACHER, STUDENT" className={inp} />
                            </div>
                            <div>
                                <label className={lbl}>Mô tả</label>
                                <textarea value={roleForm.moTa}
                                    onChange={e => setRoleForm({ ...roleForm, moTa: e.target.value })}
                                    rows={3} placeholder="Nhập mô tả vai trò..." className={inp + ' resize-none'} />
                            </div>
                            <div className="flex gap-3 pt-2 border-t border-slate-100">
                                <button type="button" onClick={() => setIsRoleAddOpen(false)}
                                    className="flex-1 px-4 py-2 border border-slate-300 rounded-lg text-slate-700 hover:bg-slate-50 text-sm font-medium">Hủy</button>
                                <button type="submit" disabled={isSubmitting}
                                    className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 text-sm font-medium disabled:opacity-50">
                                    {isSubmitting ? 'Đang thêm...' : 'Thêm vai trò'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* ═══════════════════════════════════════════════════════════
                Modal: Sửa Vai Trò
            ═══════════════════════════════════════════════════════════ */}
            {isRoleEditOpen && selectedRole && (
                <div className="fixed inset-0 bg-black/30 flex items-center justify-center z-50 p-4" onClick={() => setIsRoleEditOpen(false)}>
                    <div className="bg-white rounded-xl shadow-2xl max-w-md w-full" onClick={e => e.stopPropagation()}>
                        <div className={mhdr}>
                            <h2 className="text-lg font-bold flex items-center gap-2"><Edit className="w-5 h-5" /> Sửa Vai Trò</h2>
                            <button onClick={() => setIsRoleEditOpen(false)} className="p-1 hover:bg-white/20 rounded-lg"><X className="w-5 h-5" /></button>
                        </div>
                        <form className="p-6 space-y-4" onSubmit={handleUpdateRole}>
                            <div>
                                <label className={lbl}>Mã vai trò</label>
                                <input disabled value={roleForm.maRole}
                                    className={inp + ' bg-slate-100 text-slate-500 cursor-not-allowed'} />
                                <p className="text-xs text-slate-400 mt-1">Không thể thay đổi mã vai trò</p>
                            </div>
                            <div>
                                <label className={lbl}>Mô tả</label>
                                <textarea value={roleForm.moTa}
                                    onChange={e => setRoleForm({ ...roleForm, moTa: e.target.value })}
                                    rows={3} className={inp + ' resize-none'} />
                            </div>
                            <div className="flex gap-3 pt-2 border-t border-slate-100">
                                <button type="button" onClick={() => setIsRoleEditOpen(false)}
                                    className="flex-1 px-4 py-2 border border-slate-300 rounded-lg text-slate-700 hover:bg-slate-50 text-sm font-medium">Hủy</button>
                                <button type="submit" disabled={isSubmitting}
                                    className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 text-sm font-medium disabled:opacity-50">
                                    {isSubmitting ? 'Đang lưu...' : 'Lưu thay đổi'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* ═══════════════════════════════════════════════════════════
                Modal: Thêm Quyền Hạn
            ═══════════════════════════════════════════════════════════ */}
            {isPermAddOpen && (
                <div className="fixed inset-0 bg-black/30 flex items-center justify-center z-50 p-4" onClick={() => setIsPermAddOpen(false)}>
                    <div className="bg-white rounded-xl shadow-2xl max-w-md w-full" onClick={e => e.stopPropagation()}>
                        <div className={mhdr}>
                            <h2 className="text-lg font-bold flex items-center gap-2"><Lock className="w-5 h-5" /> Thêm Quyền Hạn</h2>
                            <button onClick={() => setIsPermAddOpen(false)} className="p-1 hover:bg-white/20 rounded-lg"><X className="w-5 h-5" /></button>
                        </div>
                        <form className="p-6 space-y-4" onSubmit={handleCreatePerm}>
                            <div>
                                <label className={lbl}>Mã quyền <span className="text-red-500">*</span></label>
                                <input required value={permForm.maPermissions}
                                    onChange={e => setPermForm({ ...permForm, maPermissions: e.target.value })}
                                    placeholder="VD: CREATE_USER, EDIT_ROLE" className={inp} />
                            </div>
                            <div>
                                <label className={lbl}>Mô tả</label>
                                <textarea value={permForm.moTa}
                                    onChange={e => setPermForm({ ...permForm, moTa: e.target.value })}
                                    rows={3} placeholder="Nhập mô tả quyền hạn..." className={inp + ' resize-none'} />
                            </div>
                            <div className="flex gap-3 pt-2 border-t border-slate-100">
                                <button type="button" onClick={() => setIsPermAddOpen(false)}
                                    className="flex-1 px-4 py-2 border border-slate-300 rounded-lg text-slate-700 hover:bg-slate-50 text-sm font-medium">Hủy</button>
                                <button type="submit" disabled={isSubmitting}
                                    className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 text-sm font-medium disabled:opacity-50">
                                    {isSubmitting ? 'Đang thêm...' : 'Thêm quyền'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* ═══════════════════════════════════════════════════════════
                Modal: Sửa Quyền Hạn
            ═══════════════════════════════════════════════════════════ */}
            {isPermEditOpen && selectedPerm && (
                <div className="fixed inset-0 bg-black/30 flex items-center justify-center z-50 p-4" onClick={() => setIsPermEditOpen(false)}>
                    <div className="bg-white rounded-xl shadow-2xl max-w-md w-full" onClick={e => e.stopPropagation()}>
                        <div className={mhdr}>
                            <h2 className="text-lg font-bold flex items-center gap-2"><Edit className="w-5 h-5" /> Sửa Quyền Hạn</h2>
                            <button onClick={() => setIsPermEditOpen(false)} className="p-1 hover:bg-white/20 rounded-lg"><X className="w-5 h-5" /></button>
                        </div>
                        <form className="p-6 space-y-4" onSubmit={handleUpdatePerm}>
                            <div>
                                <label className={lbl}>Mã quyền</label>
                                <input disabled value={permForm.maPermissions}
                                    className={inp + ' bg-slate-100 text-slate-500 cursor-not-allowed'} />
                                <p className="text-xs text-slate-400 mt-1">Không thể thay đổi mã quyền</p>
                            </div>
                            <div>
                                <label className={lbl}>Mô tả</label>
                                <textarea value={permForm.moTa}
                                    onChange={e => setPermForm({ ...permForm, moTa: e.target.value })}
                                    rows={3} className={inp + ' resize-none'} />
                            </div>
                            <div className="flex gap-3 pt-2 border-t border-slate-100">
                                <button type="button" onClick={() => setIsPermEditOpen(false)}
                                    className="flex-1 px-4 py-2 border border-slate-300 rounded-lg text-slate-700 hover:bg-slate-50 text-sm font-medium">Hủy</button>
                                <button type="submit" disabled={isSubmitting}
                                    className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 text-sm font-medium disabled:opacity-50">
                                    {isSubmitting ? 'Đang lưu...' : 'Lưu thay đổi'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* ═══════════════════════════════════════════════════════════
                Modal: Gán Quyền
            ═══════════════════════════════════════════════════════════ */}
            {isAssignOpen && (
                <div className="fixed inset-0 bg-black/30 flex items-center justify-center z-50 p-4" onClick={() => setIsAssignOpen(false)}>
                    <div className="bg-white rounded-xl shadow-2xl max-w-md w-full" onClick={e => e.stopPropagation()}>
                        <div className={mhdr}>
                            <h2 className="text-lg font-bold flex items-center gap-2"><Key className="w-5 h-5" /> Gán Quyền cho Vai Trò</h2>
                            <button onClick={() => setIsAssignOpen(false)} className="p-1 hover:bg-white/20 rounded-lg"><X className="w-5 h-5" /></button>
                        </div>
                        <form className="p-6 space-y-4" onSubmit={handleAssign}>
                            <div>
                                <label className={lbl}>Vai trò <span className="text-red-500">*</span></label>
                                <select required value={assignRoleId} onChange={e => setAssignRoleId(e.target.value)} className={inp}>
                                    <option value="">Chọn vai trò</option>
                                    {roles.map(r => <option key={r.id} value={r.id}>{r.maRole}</option>)}
                                </select>
                            </div>
                            <div>
                                <label className={lbl}>Quyền hạn <span className="text-red-500">*</span></label>
                                <select required value={assignPermId} onChange={e => setAssignPermId(e.target.value)} className={inp}>
                                    <option value="">Chọn quyền hạn</option>
                                    {permissions.map(p => (
                                        <option key={p.id} value={p.id}>{p.maPermissions}{p.moTa ? ` — ${p.moTa}` : ''}</option>
                                    ))}
                                </select>
                            </div>
                            <div className="flex gap-3 pt-2 border-t border-slate-100">
                                <button type="button" onClick={() => setIsAssignOpen(false)}
                                    className="flex-1 px-4 py-2 border border-slate-300 rounded-lg text-slate-700 hover:bg-slate-50 text-sm font-medium">Hủy</button>
                                <button type="submit" disabled={isSubmitting}
                                    className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 text-sm font-medium disabled:opacity-50">
                                    {isSubmitting ? 'Đang gán...' : 'Gán quyền'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* ═══════════════════════════════════════════════════════════
                Modal: Xác nhận xóa
            ═══════════════════════════════════════════════════════════ */}
            {confirmModal.open && (
                <div className="fixed inset-0 bg-black/30 flex items-center justify-center z-50 p-4"
                    onClick={() => setConfirmModal(m => ({ ...m, open: false }))}>
                    <div className="bg-white rounded-xl shadow-2xl max-w-sm w-full p-6" onClick={e => e.stopPropagation()}>
                        <div className="flex items-center gap-3 mb-4">
                            <div className="rounded-full bg-red-100 p-2.5">
                                <AlertCircle className="w-5 h-5 text-red-600" />
                            </div>
                            <h3 className="text-base font-bold text-slate-900">Xác nhận xóa</h3>
                        </div>
                        <p className="text-sm text-slate-600 mb-5">{confirmModal.message}</p>
                        <div className="flex gap-3">
                            <button onClick={() => setConfirmModal(m => ({ ...m, open: false }))}
                                className="flex-1 px-4 py-2 border border-slate-300 rounded-lg hover:bg-slate-50 text-sm font-medium text-slate-700">Hủy</button>
                            <button
                                onClick={() => {
                                    confirmModal.onConfirm?.();
                                    setConfirmModal(m => ({ ...m, open: false }));
                                }}
                                className="flex-1 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 text-sm font-medium">Xóa</button>
                        </div>
                    </div>
                </div>
            )}

            {/* ── Toasts ─────────────────────────────────────────────── */}
            <div className="fixed bottom-24 right-8 space-y-2 z-40">
                {toasts.map(t => (
                    <div key={t.id} className={`flex items-center gap-2 px-4 py-3 rounded-lg shadow-lg text-white text-sm font-medium ${
                        t.type === 'success' ? 'bg-green-600' : t.type === 'error' ? 'bg-red-600' : 'bg-blue-600'
                    }`}>
                        {t.type === 'success' && <CheckCircle className="w-4 h-4 shrink-0" />}
                        {t.type === 'error'   && <AlertCircle className="w-4 h-4 shrink-0" />}
                        {t.message}
                    </div>
                ))}
            </div>

            {/* ── AI Button ──────────────────────────────────────────── */}
            <button className="fixed bottom-8 right-8 w-16 h-16 z-50 hover:scale-110 transition-transform" aria-label="AI Assistant">
                <AiAssistantButton />
            </button>
        </div>
    );
}
