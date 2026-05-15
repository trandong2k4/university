import apiClient from '@/common/axiosClient';

export type PermissionsItem = {
    id: string;
    maPermissions: string;
    moTa?: string;
};

export type PermissionRequest = {
    maPermissions: string;
    moTa?: string;
};

export type CreatePermissionRequest = PermissionRequest;

export type UpdatePermissionRequest = Partial<PermissionRequest>;

export type ExcelImportResult = {
    success: number;
    failed: number;
    message: string;
};

export type DeletePermissionsBatchResult = {
    message?: string;
    cannotDelete?: string[];
};

/**
 * Lấy tất cả permissions
 */
export async function getAllPermissions(): Promise<PermissionsItem[]> {
    return (await apiClient.get('/admin/permissions')).data;
}

/**
 * Alias ngắn gọn
 */
export const getPermissions = getAllPermissions;

/**
 * Lấy permission theo ID
 */
export async function getPermissionById(
    id: string
): Promise<PermissionsItem> {
    return (
        await apiClient.get(`/admin/permissions/${id}`)
    ).data;
}

/**
 * Tìm kiếm permission
 */
export async function searchPermissions(
    keyword: string
): Promise<PermissionsItem[]> {
    return (
        await apiClient.get(
            `/admin/permissions/search?keyword=${encodeURIComponent(keyword)}`
        )
    ).data;
}

/**
 * Tạo permission
 */
export async function createPermission(
    data: CreatePermissionRequest
): Promise<PermissionsItem> {
    return (
        await apiClient.post('/admin/permissions', data)
    ).data;
}

/**
 * Cập nhật permission
 */
export async function updatePermission(
    id: string,
    data: UpdatePermissionRequest
): Promise<PermissionsItem> {
    return (
        await apiClient.put(`/admin/permissions/${id}`, data)
    ).data;
}

/**
 * Xóa permission
 */
export async function deletePermission(id: string) {
    return (
        await apiClient.delete(`/admin/permissions/${id}`)
    ).data;
}

/**
 * Xóa nhiều permission
 */
export async function deletePermissionsBatch(ids: string[]): Promise<DeletePermissionsBatchResult | undefined> {
    return (
        await apiClient.delete('/admin/permissions/batch', { data: ids })
    ).data;
}

/**
 * Import permissions từ file Excel
 */
export async function importFromExcel(
    formData: FormData
): Promise<ExcelImportResult> {
    return (
        await apiClient.post(
            '/admin/permissions/import-excel',
            formData,
            {
                headers: {
                    'Content-Type': 'multipart/form-data'
                }
            }
        )
    ).data;
}

export default {
    getAllPermissions,
    getPermissions,
    getPermissionById,
    searchPermissions,
    createPermission,
    updatePermission,
    deletePermission,
    deletePermissionsBatch,
    importFromExcel
};
