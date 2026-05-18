import apiClient from '../common/axiosClient';
import { UsersItem, CreateUserRequest, UpdateUserRequest, AuthRolePermission, RoleItem, UserRoleAssignment, BatchDeleteResult } from '@/common/types';

export type ExcelImportResult = {
    totalRows: number;
    successCount: number;
    errorCount: number;
    errors: string[];
    message?: string;
};

export async function getUsers(): Promise<UsersItem[]> {
    return (await apiClient.get('/admin/users')).data;
}

/**
 * Lấy user theo ID
 */
export async function getUserById(
    id: string
): Promise<UsersItem> {
    return (
        await apiClient.get(`/admin/users/${id}`)
    ).data;
}

/**
 * Tìm kiếm user
 */
export async function searchUsers(
    keyword: string
): Promise<UsersItem[]> {
    return (
        await apiClient.get(
            `/admin/users/search?keyword=${encodeURIComponent(keyword)}`
        )
    ).data;
}

/**
 * Tạo user
 */
export async function createUser(
    data: CreateUserRequest
): Promise<UsersItem> {
    return (
        await apiClient.post('/admin/users', data)
    ).data;
}

/**
 * Cập nhật user
 */
export async function updateUser(
    id: string,
    data: UpdateUserRequest
): Promise<UsersItem> {
    return (
        await apiClient.put(`/admin/users/${id}`, data)
    ).data;
}

/**
 * Xóa user
 */
export async function deleteUser(id: string) {
    return (
        await apiClient.delete(`/admin/users/${id}`)
    ).data;
}

/**
 * Xóa nhiều user theo danh sách ID
 * @returns Chi tiết kết quả xóa: số xóa thành công, số thất bại, danh sách user bị chặn
 */
export async function deleteUsersBatch(ids: string[]): Promise<BatchDeleteResult> {
    return (
        await apiClient.delete('/admin/users/batch', { data: ids })
    ).data;
}

/**
 * Import user từ file Excel
 */
export async function importUsersFromExcel(file: File): Promise<ExcelImportResult> {
    const formData = new FormData();
    formData.append('file', file);
    return (
        await apiClient.post('/admin/users/import', formData, {
            headers: { 'Content-Type': 'multipart/form-data' },
        })
    ).data;
}

/**
 * =========================
 * ROLE & PERMISSION API
 * =========================
 */

/**
 * Lấy role và permission của user
 */
export async function getUserRolesAndPermissions(
    userId: string
): Promise<AuthRolePermission[]> {
    return (
        await apiClient.get(
            `/admin/users/list-role?userId=${encodeURIComponent(userId)}`
        )
    ).data;
}

/**
 * Alias ngắn gọn
 */
export const getUserRoles = getUserRolesAndPermissions;

/**
 * =========================
 * USER-ROLE ASSIGNMENT API
 * =========================
 */

export async function getUserRoleAssignments(userId: string): Promise<UserRoleAssignment[]> {
    return (await apiClient.get(`/admin/user-role/user/${userId}`)).data ?? [];
}

export async function getAllUserRoleAssignments(): Promise<UserRoleAssignment[]> {
    return (await apiClient.get('/admin/user-role')).data ?? [];
}

export async function assignRoleToUser(usersId: string, roleId: string): Promise<UserRoleAssignment> {
    return (await apiClient.post('/admin/user-role', { usersId, roleId })).data;
}

export async function removeUserRole(id: string): Promise<void> {
    await apiClient.delete(`/admin/user-role/${id}`);
}

export async function getAllRoles(): Promise<RoleItem[]> {
    return (await apiClient.get('/admin/role')).data;
}

/**
 * =========================
 * EXPORT DEFAULT
 * =========================
 */

export default {
    getUsers,
    getUserById,
    searchUsers,
    createUser,
    updateUser,
    deleteUser,
    deleteUsersBatch,
    importUsersFromExcel,
    getUserRolesAndPermissions,
    getUserRoles,
    getUserRoleAssignments,
    getAllUserRoleAssignments,
    assignRoleToUser,
    removeUserRole,
    getAllRoles,
};
