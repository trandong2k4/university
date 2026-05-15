import { AdminSidebar } from '@/components/layouts/AdminSidebar';
import { AdminHeader } from '@/components/layouts/AdminHeader';
import { useEffect, useMemo, useState } from 'react';
import {
    AlertCircle,
    CheckCircle,
    CheckSquare,
    Lock,
    Plus,
    RefreshCw,
    Save,
    Search,
    Shield,
    Square,
    Trash2,
} from 'lucide-react';
import AiAssistantButton from '@/imports/AiAssistantButton-4-13343';
import type { RoleItem } from '@/api/common/types';
import type { RolePermissionsItem } from '@/api/admin/role-permissions.api';
import * as rolePermissionsApi from '@/api/admin/role-permissions.api';
import * as roleApi from '@/api/admin/role.api';
import * as permissionsApi from '@/api/admin/permissions.api';
import type { PermissionsItem } from '@/api/admin/permissions.api';

interface Toast {
    id: string;
    message: string;
    type: 'success' | 'error' | 'info';
}

type StatusFilter = 'all' | 'assigned' | 'unassigned';

const extractError = (err: unknown, fallback: string): string => {
    if (err && typeof err === 'object') {
        const e = err as { response?: { data?: { detail?: string; message?: string } } };
        return e.response?.data?.detail || e.response?.data?.message || fallback;
    }
    return fallback;
};

const roleTone = (role: string) => {
    const key = role.toUpperCase();
    if (key.includes('ADMIN')) return 'bg-rose-50 text-rose-700 border-rose-200';
    if (key.includes('LECTURER')) return 'bg-blue-50 text-blue-700 border-blue-200';
    if (key.includes('STUDENT')) return 'bg-emerald-50 text-emerald-700 border-emerald-200';
    if (key.includes('ACCOUNT')) return 'bg-amber-50 text-amber-700 border-amber-200';
    return 'bg-slate-50 text-slate-700 border-slate-200';
};

export default function AdminRolePermissionsPage() {
    const [loading, setLoading] = useState(false);
    const [loadingPermissions, setLoadingPermissions] = useState(false);
    const [toasts, setToasts] = useState<Toast[]>([]);
    const [rolePermissions, setRolePermissions] = useState<RolePermissionsItem[]>([]);
    const [roles, setRoles] = useState<RoleItem[]>([]);
    const [permissions, setPermissions] = useState<PermissionsItem[]>([]);
    const [selectedRoleId, setSelectedRoleId] = useState('');
    const [roleQuery, setRoleQuery] = useState('');
    const [permissionQuery, setPermissionQuery] = useState('');
    const [statusFilter, setStatusFilter] = useState<StatusFilter>('all');
    const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
    const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
    const [isDeleting, setIsDeleting] = useState(false);

    // Local permission status — mirrors DB initially, updated on checkbox toggle
    const [localPermissions, setLocalPermissions] = useState<Map<string, boolean>>(new Map());
    const [hasChanges, setHasChanges] = useState(false);
    const [isSaving, setIsSaving] = useState(false);

    const addToast = (message: string, type: Toast['type'] = 'info') => {
        const id = Date.now().toString();
        setToasts(prev => [...prev, { id, message, type }]);
        setTimeout(() => {
            setToasts(prev => prev.filter(t => t.id !== id));
        }, 4000);
    };

    const selectedRole = useMemo(
        () => roles.find(role => role.id === selectedRoleId) ?? null,
        [roles, selectedRoleId]
    );

    const permissionById = useMemo(() => {
        const map = new Map<string, PermissionsItem>();
        permissions.forEach(permission => map.set(permission.id, permission));
        return map;
    }, [permissions]);

    const assignedItems = useMemo(
        () => rolePermissions.filter(item => localPermissions.get(item.permissionsId)),
        [rolePermissions, localPermissions]
    );

    const filteredRoles = useMemo(() => {
        const q = roleQuery.trim().toLowerCase();
        if (!q) return roles;
        return roles.filter(role =>
            role.maRole?.toLowerCase().includes(q) ||
            role.moTa?.toLowerCase().includes(q)
        );
    }, [roles, roleQuery]);

    const filteredPermissions = useMemo(() => {
        const q = permissionQuery.trim().toLowerCase();
        return rolePermissions.filter(item => {
            const permission = permissionById.get(item.permissionsId);
            const code = permission?.maPermissions ?? '';
            const desc = permission?.moTa ?? item.permissionsName ?? '';
            const currentStatus = localPermissions.get(item.permissionsId) ?? false;
            const matchesQuery = !q ||
                code.toLowerCase().includes(q) ||
                desc.toLowerCase().includes(q);
            const matchesStatus =
                statusFilter === 'all' ||
                (statusFilter === 'assigned' && currentStatus) ||
                (statusFilter === 'unassigned' && !currentStatus);

            return matchesQuery && matchesStatus;
        });
    }, [permissionById, permissionQuery, rolePermissions, statusFilter, localPermissions]);

    const selectableItems = useMemo(
        () => filteredPermissions.filter(item => item.status && item.id),
        [filteredPermissions]
    );

    const selectedVisibleCount = selectableItems.filter(item => item.id && selectedIds.has(item.id)).length;
    const allVisibleSelected = selectableItems.length > 0 && selectedVisibleCount === selectableItems.length;

    const loadPermissionsForRole = async (roleId: string, showSpinner = true) => {
        if (!roleId) {
            setRolePermissions([]);
            setLocalPermissions(new Map());
            setSelectedIds(new Set());
            setHasChanges(false);
            return;
        }

        try {
            if (showSpinner) setLoadingPermissions(true);
            const items = await rolePermissionsApi.getRolePermissionsByRole(roleId);
            const mapped = (items || []).map(item => ({ ...item, roleId }));
            setRolePermissions(mapped);

            // Sync local permission status from DB
            const local = new Map<string, boolean>();
            mapped.forEach(item => local.set(item.permissionsId, item.status));
            setLocalPermissions(local);
            setSelectedIds(new Set());
            setHasChanges(false);
        } catch (err) {
            console.error(err);
            setRolePermissions([]);
            setLocalPermissions(new Map());
            addToast(extractError(err, 'Không tải được quyền hạn của vai trò'), 'error');
        } finally {
            if (showSpinner) setLoadingPermissions(false);
        }
    };

    const fetchData = async () => {
        try {
            setLoading(true);
            const [rolesData, permsData] = await Promise.all([
                roleApi.getRoles(),
                permissionsApi.getAllPermissions(),
            ]);

            const nextRoles = rolesData || [];
            const nextRoleId = selectedRoleId && nextRoles.some(role => role.id === selectedRoleId)
                ? selectedRoleId
                : nextRoles[0]?.id ?? '';

            setRoles(nextRoles);
            setPermissions(permsData || []);
            setSelectedRoleId(nextRoleId);
            await loadPermissionsForRole(nextRoleId, false);
        } catch (err) {
            console.error(err);
            addToast('Lỗi khi tải dữ liệu', 'error');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchData();
    }, []);

    const handleSelectRole = async (roleId: string) => {
        if (roleId === selectedRoleId) return;
        setSelectedRoleId(roleId);
        setPermissionQuery('');
        setStatusFilter('all');
        await loadPermissionsForRole(roleId);
    };

    const toggleSelectAll = () => {
        if (allVisibleSelected) {
            const next = new Set(selectedIds);
            selectableItems.forEach(item => {
                if (item.id) next.delete(item.id);
            });
            setSelectedIds(next);
            return;
        }

        const next = new Set(selectedIds);
        selectableItems.forEach(item => {
            if (item.id) next.add(item.id);
        });
        setSelectedIds(next);
    };

    const toggleSelect = (id: string) => {
        const next = new Set(selectedIds);
        if (next.has(id)) {
            next.delete(id);
        } else {
            next.add(id);
        }
        setSelectedIds(next);
    };

    const handleTogglePermission = (item: RolePermissionsItem) => {
        if (!selectedRoleId || isSaving) return;
        setLocalPermissions(prev => {
            const next = new Map(prev);
            next.set(item.permissionsId, !next.get(item.permissionsId));
            return next;
        });
        setHasChanges(true);
    };

    const handleSave = async () => {
        if (!selectedRoleId) return;
        setIsSaving(true);
        try {
            const grantedIds = Array.from(localPermissions.entries())
                .filter(([, granted]) => granted)
                .map(([permId]) => permId);
            await rolePermissionsApi.syncRolePermissions(selectedRoleId, grantedIds);
            setHasChanges(false);
            await loadPermissionsForRole(selectedRoleId, false);
            addToast(`Đã lưu phân quyền cho vai trò ${selectedRole?.maRole ?? ''}`, 'success');
        } catch (err) {
            console.error(err);
            addToast(extractError(err, 'Lỗi khi lưu phân quyền'), 'error');
        } finally {
            setIsSaving(false);
        }
    };

    const handleDeleteSelected = () => {
        if (selectedIds.size === 0) return;
        setIsDeleteModalOpen(true);
    };

    const confirmDeleteSelected = async () => {
        if (selectedIds.size === 0) return;

        setIsDeleting(true);
        try {
            const ids = Array.from(selectedIds);
            const result = await rolePermissionsApi.removeRolePermissionsBatch(ids) as { cannotDelete?: string[] } | undefined;
            setSelectedIds(new Set());
            setIsDeleteModalOpen(false);

            if (result?.cannotDelete?.length) {
                addToast(`Đã xóa ${ids.length - result.cannotDelete.length} phân quyền. ${result.cannotDelete.length} phân quyền không thể xóa.`, 'error');
            } else {
                addToast(`Đã xóa ${ids.length} phân quyền khỏi ${selectedRole?.maRole ?? 'vai trò'}`, 'success');
            }

            await loadPermissionsForRole(selectedRoleId, false);
        } catch (err) {
            console.error(err);
            addToast(extractError(err, 'Lỗi khi xóa phân quyền'), 'error');
        } finally {
            setIsDeleting(false);
        }
    };

    const statusTabs: { value: StatusFilter; label: string; count: number }[] = [
        { value: 'all', label: 'Tất cả', count: rolePermissions.length },
        { value: 'assigned', label: 'Đã có', count: assignedItems.length },
        { value: 'unassigned', label: 'Chưa có', count: Math.max(rolePermissions.length - assignedItems.length, 0) },
    ];

    return (
        <div className="flex h-screen bg-slate-50">
            <AdminSidebar activeMenu="role-permissions" />
            <div className="flex-1 ml-64 flex flex-col overflow-hidden">
                <AdminHeader title="Vai Trò - Quyền Hạn" />
                <div className="flex-1 overflow-auto">
                    <div className="p-6 max-w-7xl mx-auto space-y-4">
                        <div className="grid grid-cols-4 gap-4">
                            <div className="bg-white border border-slate-200 rounded-lg px-5 py-3 flex items-center gap-3 shadow-sm">
                                <div className="rounded-lg bg-blue-100 p-2">
                                    <Shield className="w-5 h-5 text-blue-600" />
                                </div>
                                <div>
                                    <p className="text-xl font-bold text-slate-900">{roles.length}</p>
                                    <p className="text-xs text-slate-500">Vai trò</p>
                                </div>
                            </div>
                            <div className="bg-white border border-slate-200 rounded-lg px-5 py-3 flex items-center gap-3 shadow-sm">
                                <div className="rounded-lg bg-emerald-100 p-2">
                                    <CheckCircle className="w-5 h-5 text-emerald-600" />
                                </div>
                                <div>
                                    <p className="text-xl font-bold text-emerald-700">{assignedItems.length}</p>
                                    <p className="text-xs text-slate-500">Quyền đã có</p>
                                </div>
                            </div>
                            <div className="bg-white border border-slate-200 rounded-lg px-5 py-3 flex items-center gap-3 shadow-sm">
                                <div className="rounded-lg bg-amber-100 p-2">
                                    <Plus className="w-5 h-5 text-amber-600" />
                                </div>
                                <div>
                                    <p className="text-xl font-bold text-amber-700">{Math.max(rolePermissions.length - assignedItems.length, 0)}</p>
                                    <p className="text-xs text-slate-500">Có thể thêm</p>
                                </div>
                            </div>
                            <div className="bg-white border border-slate-200 rounded-lg px-5 py-3 flex items-center gap-3 shadow-sm">
                                <div className="rounded-lg bg-red-100 p-2">
                                    <Trash2 className="w-5 h-5 text-red-600" />
                                </div>
                                <div>
                                    <p className="text-xl font-bold text-red-600">{selectedIds.size}</p>
                                    <p className="text-xs text-slate-500">Đã chọn xóa</p>
                                </div>
                            </div>
                        </div>

                        <div className="grid grid-cols-12 gap-4 items-start">
                            <aside className="col-span-12 lg:col-span-4 bg-white border border-slate-200 rounded-lg shadow-sm overflow-hidden">
                                <div className="p-3 border-b border-slate-100">
                                    <div className="relative">
                                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                                        <input
                                            value={roleQuery}
                                            onChange={e => setRoleQuery(e.target.value)}
                                            placeholder="Tìm vai trò..."
                                            spellCheck={false}
                                            className="w-full pl-9 pr-3 py-2 text-sm border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                                        />
                                    </div>
                                </div>
                                <div className="max-h-[calc(100vh-270px)] overflow-auto">
                                    {loading ? (
                                        <div className="flex justify-center py-12">
                                            <div className="w-8 h-8 border-4 border-slate-200 border-t-blue-600 rounded-full animate-spin" />
                                        </div>
                                    ) : filteredRoles.length > 0 ? (
                                        <div className="divide-y divide-slate-100">
                                            {filteredRoles.map(role => {
                                                const active = role.id === selectedRoleId;
                                                return (
                                                    <button
                                                        key={role.id}
                                                        onClick={() => handleSelectRole(role.id)}
                                                        className={`w-full text-left px-4 py-3 transition-colors ${active ? 'bg-blue-50' : 'hover:bg-slate-50'}`}
                                                    >
                                                        <div className="flex items-center justify-between gap-3">
                                                            <div className="min-w-0">
                                                                <span className={`inline-flex max-w-full items-center gap-1.5 px-2.5 py-1 rounded-lg border text-xs font-semibold ${roleTone(role.maRole)}`}>
                                                                    <Shield className="w-3.5 h-3.5 flex-shrink-0" />
                                                                    <span className="truncate">{role.maRole}</span>
                                                                </span>
                                                                {role.moTa && (
                                                                    <p className="mt-1.5 text-xs text-slate-500 line-clamp-2">{role.moTa}</p>
                                                                )}
                                                            </div>
                                                            {active && <CheckCircle className="w-4 h-4 text-blue-600 flex-shrink-0" />}
                                                        </div>
                                                    </button>
                                                );
                                            })}
                                        </div>
                                    ) : (
                                        <div className="py-12 text-center text-sm text-slate-400">
                                            Không tìm thấy vai trò
                                        </div>
                                    )}
                                </div>
                            </aside>

                            <section className="col-span-12 lg:col-span-8 bg-white border border-slate-200 rounded-lg shadow-sm overflow-hidden">
                                <div className="p-3 border-b border-slate-100 flex flex-col xl:flex-row gap-3 xl:items-center xl:justify-between">
                                    <div className="min-w-0">
                                        <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">Vai trò đang chọn</p>
                                        <div className="mt-1 flex items-center gap-2">
                                            <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg border text-xs font-semibold ${selectedRole ? roleTone(selectedRole.maRole) : 'bg-slate-50 text-slate-500 border-slate-200'}`}>
                                                <Shield className="w-3.5 h-3.5" />
                                                {selectedRole?.maRole ?? 'Chưa có vai trò'}
                                            </span>
                                            {selectedRole?.moTa && <span className="text-sm text-slate-500 truncate">{selectedRole.moTa}</span>}
                                        </div>
                                    </div>
                                    <div className="flex flex-wrap items-center gap-2">
                                        <button
                                            onClick={fetchData}
                                            title="Làm mới"
                                            className="p-2 border border-slate-300 rounded-lg text-slate-600 hover:bg-slate-50 transition-colors"
                                        >
                                            <RefreshCw className="w-4 h-4" />
                                        </button>
                                        {hasChanges && (
                                            <button
                                                onClick={handleSave}
                                                disabled={isSaving}
                                                className="flex items-center gap-1.5 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 text-sm font-medium disabled:opacity-60"
                                            >
                                                {isSaving ? (
                                                    <span className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
                                                ) : (
                                                    <Save className="w-4 h-4" />
                                                )}
                                                Lưu thay đổi
                                            </button>
                                        )}
                                        {selectedIds.size > 0 && (
                                            <button
                                                onClick={handleDeleteSelected}
                                                className="flex items-center gap-1.5 px-3 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 text-sm font-medium"
                                            >
                                                <Trash2 className="w-4 h-4" /> Xóa ({selectedIds.size})
                                            </button>
                                        )}
                                    </div>
                                </div>

                                <div className="p-3 border-b border-slate-100 flex flex-col md:flex-row gap-3 md:items-center md:justify-between">
                                    <div className="relative flex-1 min-w-0">
                                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                                        <input
                                            value={permissionQuery}
                                            onChange={e => setPermissionQuery(e.target.value)}
                                            placeholder="Tìm mã hoặc mô tả quyền..."
                                            spellCheck={false}
                                            className="w-full pl-9 pr-3 py-2 text-sm border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                                        />
                                    </div>
                                    <div className="inline-flex rounded-lg border border-slate-200 bg-slate-50 p-1">
                                        {statusTabs.map(tab => (
                                            <button
                                                key={tab.value}
                                                onClick={() => setStatusFilter(tab.value)}
                                                className={`px-3 py-1.5 rounded-md text-xs font-semibold transition-colors ${statusFilter === tab.value ? 'bg-white text-blue-700 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
                                            >
                                                {tab.label} ({tab.count})
                                            </button>
                                        ))}
                                    </div>
                                </div>

                                {loading || loadingPermissions ? (
                                    <div className="flex flex-col items-center justify-center h-72 gap-3">
                                        <div className="w-9 h-9 border-4 border-slate-200 border-t-blue-600 rounded-full animate-spin" />
                                        <p className="text-sm text-slate-500">Đang tải...</p>
                                    </div>
                                ) : selectedRole ? (
                                    <div className="overflow-auto" style={{ maxHeight: 'calc(100vh - 360px)' }}>
                                        <table className="w-full text-sm">
                                            <thead className="sticky top-0 z-10 bg-slate-900 text-white">
                                                <tr>
                                                    <th className="px-4 py-3 w-12">
                                                        <button
                                                            onClick={toggleSelectAll}
                                                            className="p-1 hover:bg-white/10 rounded"
                                                            title="Chọn các quyền đã có đang hiển thị"
                                                        >
                                                            {allVisibleSelected
                                                                ? <CheckSquare className="w-4 h-4" />
                                                                : <Square className="w-4 h-4" />
                                                            }
                                                        </button>
                                                    </th>
                                                    <th className="px-4 py-3 text-left font-semibold">Quyền Hạn</th>
                                                    <th className="px-4 py-3 text-center font-semibold">Trạng Thái</th>
                                                    <th className="px-4 py-3 text-center font-semibold">Click</th>
                                                </tr>
                                            </thead>
                                            <tbody className="divide-y divide-slate-100">
                                                {filteredPermissions.map(item => {
                                                    const permission = permissionById.get(item.permissionsId);
                                                    const permissionCode = permission?.maPermissions ?? item.permissionsName ?? '—';
                                                    const permissionDescription = permission?.moTa ?? item.permissionsName ?? '';
                                                    const isAssigned = localPermissions.get(item.permissionsId) ?? false;
                                                    const isSelected = !!item.id && selectedIds.has(item.id);

                                                    return (
                                                        <tr
                                                            key={`${selectedRoleId}-${item.permissionsId}`}
                                                            role="button"
                                                            tabIndex={0}
                                                            onClick={() => handleTogglePermission(item)}
                                                            onKeyDown={event => {
                                                                if (event.key === 'Enter' || event.key === ' ') {
                                                                    event.preventDefault();
                                                                    handleTogglePermission(item);
                                                                }
                                                            }}
                                                            className={`cursor-pointer transition-colors ${isAssigned ? 'hover:bg-red-50/70' : 'hover:bg-blue-50/70'} ${isSelected ? 'bg-blue-50' : ''} ${isSaving ? 'opacity-70' : ''}`}
                                                        >
                                                            <td className="px-4 py-3" onClick={event => event.stopPropagation()}>
                                                                {isAssigned && item.id ? (
                                                                    <button
                                                                        onClick={() => toggleSelect(item.id as string)}
                                                                        className="p-1 hover:bg-blue-100 rounded transition-colors"
                                                                        title="Chọn để xóa nhanh"
                                                                    >
                                                                        {isSelected
                                                                            ? <CheckSquare className="w-4 h-4 text-blue-600" />
                                                                            : <Square className="w-4 h-4 text-slate-400" />
                                                                        }
                                                                    </button>
                                                                ) : (
                                                                    <span className="text-slate-300">—</span>
                                                                )}
                                                            </td>
                                                            <td className="px-4 py-3">
                                                                <div className="min-w-0">
                                                                    <p className="font-semibold text-slate-900 break-words">{permissionCode}</p>
                                                                    {permissionDescription && permissionDescription !== permissionCode && (
                                                                        <p className="mt-0.5 text-xs text-slate-500 break-words">{permissionDescription}</p>
                                                                    )}
                                                                </div>
                                                            </td>
                                                            <td className="px-4 py-3 text-center">
                                                                <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold ${isAssigned ? 'bg-emerald-100 text-emerald-700' : 'bg-slate-100 text-slate-500'}`}>
                                                                    {isAssigned ? <CheckCircle className="w-3.5 h-3.5" /> : <Plus className="w-3.5 h-3.5" />}
                                                                    {isAssigned ? 'Đã có' : 'Chưa có'}
                                                                </span>
                                                            </td>
                                                            <td className="px-4 py-3 text-center">
                                                                <span className={`inline-flex items-center justify-center w-8 h-8 rounded-lg ${isAssigned ? 'bg-emerald-100 text-emerald-600' : 'bg-slate-100 text-slate-400'}`}>
                                                                    {isAssigned ? (
                                                                        <CheckCircle className="w-4 h-4" />
                                                                    ) : (
                                                                        <Plus className="w-4 h-4" />
                                                                    )}
                                                                </span>
                                                            </td>
                                                        </tr>
                                                    );
                                                })}
                                                {filteredPermissions.length === 0 && (
                                                    <tr>
                                                        <td colSpan={4} className="py-16 text-center">
                                                            <div className="flex flex-col items-center gap-2">
                                                                <div className="rounded-full bg-slate-100 p-4">
                                                                    <Lock className="w-8 h-8 text-slate-400" />
                                                                </div>
                                                                <p className="font-medium text-slate-600">Không có quyền hạn phù hợp</p>
                                                            </div>
                                                        </td>
                                                    </tr>
                                                )}
                                            </tbody>
                                        </table>
                                    </div>
                                ) : (
                                    <div className="flex flex-col items-center justify-center h-72 gap-2">
                                        <div className="rounded-full bg-slate-100 p-4">
                                            <Shield className="w-8 h-8 text-slate-400" />
                                        </div>
                                        <p className="font-medium text-slate-600">Chưa có vai trò để phân quyền</p>
                                    </div>
                                )}
                            </section>
                        </div>

                        {!loading && selectedRole && (
                            <div className="flex items-center justify-between text-xs text-slate-500 px-1">
                                <span>
                                    Hiển thị <b className="text-slate-700">{filteredPermissions.length}</b> / <b className="text-slate-700">{rolePermissions.length}</b> quyền của vai trò <b className="text-slate-700">{selectedRole.maRole}</b>
                                </span>
                                <span>
                                    {hasChanges ? (
                                        <span className="text-blue-600 font-medium">Nhấn "Lưu thay đổi" để cập nhật</span>
                                    ) : (
                                        'Click vào quyền để bật/tắt, nhấn "Lưu thay đổi" khi hoàn tất'
                                    )}
                                </span>
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {isDeleteModalOpen && (
                <div className="fixed inset-0 bg-black/30 flex items-center justify-center z-50 p-4" onClick={() => !isDeleting && setIsDeleteModalOpen(false)}>
                    <div className="bg-white rounded-2xl shadow-2xl max-w-sm w-full p-6" onClick={e => e.stopPropagation()}>
                        <div className="flex items-center gap-3 mb-4">
                            <div className="rounded-full bg-red-100 p-3 flex-shrink-0">
                                <AlertCircle className="w-6 h-6 text-red-600" />
                            </div>
                            <h3 className="font-bold text-slate-900">Xác nhận xóa {selectedIds.size} phân quyền</h3>
                        </div>
                        <p className="text-sm text-slate-600 mb-6">
                            Bạn có chắc muốn xóa các quyền đã chọn khỏi vai trò <b>{selectedRole?.maRole ?? ''}</b>?
                        </p>
                        <div className="flex gap-3">
                            <button
                                onClick={() => setIsDeleteModalOpen(false)}
                                disabled={isDeleting}
                                className="flex-1 py-2.5 border border-slate-300 rounded-xl text-sm font-medium text-slate-700 hover:bg-slate-50 disabled:opacity-50"
                            >
                                Hủy
                            </button>
                            <button
                                onClick={confirmDeleteSelected}
                                disabled={isDeleting}
                                className="flex-1 py-2.5 bg-red-600 text-white rounded-xl text-sm font-medium hover:bg-red-700 disabled:opacity-50"
                            >
                                {isDeleting ? 'Đang xóa...' : 'Xóa'}
                            </button>
                        </div>
                    </div>
                </div>
            )}

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
