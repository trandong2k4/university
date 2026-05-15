import apiClient from '@/common/axiosClient';

export type UserRoleItem = {
    id: string;
    usersId: string;
    roleId: string;
    createdAt: string;
    updatedAt?: string;
};

export type CreateUserRoleRequest = {
    usersId: string;  // ← Thay userId thành usersId
    roleId: string;
};

/**
 * Lấy tất cả user-role
 */
export async function getUserRoles() {
    try {
        return (await apiClient.get('/admin/user-role')).data as UserRoleItem[];
    } catch (error) {
        console.error('Error fetching user roles:', error);
        return [];
    }
}

/**
 * Lấy user-role theo user ID
 */
export async function getUserRolesByUserId(usersId: string) {
    return (await apiClient.get(`/admin/user-role/user/${usersId}`)).data as UserRoleItem[];
}

/**
 * Lấy user-role theo role ID
 */
export async function getUserRolesByRoleId(roleId: string) {
    return (await apiClient.get(`/admin/user-role/role/${roleId}`)).data as UserRoleItem[];
}

/**
 * Lấy user-role theo ID
 */
export async function getUserRoleById(id: string) {
    return (await apiClient.get(`/admin/user-role/${id}`)).data as UserRoleItem;
}

/**
 * Tạo user-role mới
 */
export async function assignUserRole(data: CreateUserRoleRequest) {
    return (await apiClient.post('/admin/user-role', data)).data as UserRoleItem;
}

/**
 * Tạo nhiều user-role cùng lúc
 */
export async function createUserRoleList(data: CreateUserRoleRequest[]) {
    return (await apiClient.post('/admin/user-role/create-list', data)).data as UserRoleItem[];
}

/**
 * Xóa user-role
 */
export async function removeUserRole(id: string) {
    return (await apiClient.delete(`/admin/user-role/${id}`)).data;
}

/**
 * Xóa nhiều user-role
 */
export async function deleteUserRoleList(ids: string[]) {
    return (await apiClient.delete('/admin/user-role/delete-list', { data: ids })).data;
}

export default {
    getUserRoles,
    getUserRolesByUserId,
    getUserRolesByRoleId,
    getUserRoleById,
    assignUserRole,
    createUserRoleList,
    removeUserRole,
    deleteUserRoleList
};
