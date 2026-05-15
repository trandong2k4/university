import apiClient from '@/common/axiosClient';

// Matches backend RolePermissionsAdminResponseDTO exactly
export type RolePermissionsItem = {
    id: string | null; // null khi quyền chưa được gán (LEFT JOIN không match)
    permissionsId: string;
    permissionsName: string;
    status: boolean;
    roleId?: string; // attached client-side after fetch
};

export type RolePermissionsAdminRequestDTO = {
    roleId: string;
    permissionsId: string;
};

export async function getRolePermissions(): Promise<RolePermissionsItem[]> {
    return (await apiClient.get('/admin/role-permissions')).data;
}

export async function getRolePermissionsByRole(roleId: string) {
    return (await apiClient.get(`/admin/role-permissions/by-roleId?roleId=${encodeURIComponent(roleId)}`)).data as RolePermissionsItem[];
}

export async function assignRolePermission(data: RolePermissionsAdminRequestDTO) {
    return (await apiClient.post('/admin/role-permissions', data)).data as RolePermissionsItem;
}

export async function removeRolePermission(id: string) {
    return (await apiClient.delete(`/admin/role-permissions/${id}`)).data;
}

export async function removeRolePermissionByRequest(data: RolePermissionsAdminRequestDTO) {
    return (await apiClient.delete('/admin/role-permissions/delete-dto', { data })).data;
}

export async function removeRolePermissionsBatch(ids: string[]) {
    return (await apiClient.delete('/admin/role-permissions/batch', { data: ids })).data;
}

export async function syncRolePermissions(roleId: string, grantedIds: string[]) {
    return (await apiClient.put(`/admin/role-permissions/sync/${encodeURIComponent(roleId)}`, grantedIds)).data;
}

export default {
    getRolePermissions,
    getRolePermissionsByRole,
    assignRolePermission,
    removeRolePermission,
    removeRolePermissionByRequest,
    removeRolePermissionsBatch,
    syncRolePermissions,
};
