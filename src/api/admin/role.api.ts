import apiClient from '@/common/axiosClient';

export type RoleItem = {
    id: string;
    maRole: string;
    moTa?: string;
    createdAt?: string;
};

export type RoleRequest = {
    maRole: string;
    moTa?: string;
    createdAt?: string; // dd/MM/yyyy : hh:mm:ss
};

export type UpdateRoleRequest = Partial<RoleRequest>;

/**
 * Lấy danh sách tất cả role
 */
export async function getAllRoles(): Promise<RoleItem[]> {
    return (await apiClient.get('/admin/role')).data;
}

/**
 * Alias ngắn gọn
 */
export const getRoles = getAllRoles;

/**
 * Lấy role theo ID
 */
export async function getRoleById(id: string): Promise<RoleItem> {
    return (await apiClient.get(`/admin/role/${id}`)).data;
}

/**
 * Tìm kiếm role theo keyword
 */
export async function searchRoles(keyword: string): Promise<RoleItem[]> {
    return (
        await apiClient.get(
            `/admin/role/search?keyword=${encodeURIComponent(keyword)}`
        )
    ).data;
}

/**
 * Tạo 1 role
 */
export async function createRole(
    data: RoleRequest
): Promise<RoleItem> {
    return (await apiClient.post('/admin/role', data)).data;
}

/**
 * Tạo nhiều role
 */
export async function createRoles(
    data: RoleRequest[]
): Promise<RoleItem[]> {
    return (await apiClient.post('/admin/role/list', data)).data;
}

/**
 * Cập nhật role
 */
export async function updateRole(
    id: string,
    data: UpdateRoleRequest
): Promise<RoleItem> {
    return (await apiClient.put(`/admin/role/${id}`, data)).data;
}

/**
 * Xóa role
 */
export async function deleteRole(id: string) {
    return (await apiClient.delete(`/admin/role/${id}`)).data;
}

/**
 * Xóa nhiều role
 */
export async function deleteRolesBatch(ids: string[]) {
    return (await apiClient.delete('/admin/role/batch', { data: ids })).data;
}

export default {
    getAllRoles,
    getRoles,
    getRoleById,
    searchRoles,
    createRole,
    createRoles,
    updateRole,
    deleteRole,
    deleteRolesBatch
};
