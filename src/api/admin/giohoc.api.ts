import apiClient from '@/common/axiosClient';

export type GioHocRequest = {
    maGioHoc: string;
    tenGioHoc: string;
    thoiGianBatDau?: string;
    thoiGianKetThuc?: string;
};

export type ImportResult = {
    totalRows: number;
    successCount: number;
    errorCount: number;
    errors: string[];
};

export async function getAllGioHoc() {
    return (await apiClient.get('/admin/gio-hoc')).data;
}

export async function getGioHocById(id: string) {
    return (await apiClient.get(`/admin/gio-hoc/${id}`)).data;
}

export async function createGioHoc(dto: GioHocRequest) {
    return (await apiClient.post('/admin/gio-hoc', dto)).data;
}

export async function updateGioHoc(id: string, dto: GioHocRequest) {
    return (await apiClient.put(`/admin/gio-hoc/${id}`, dto)).data;
}

export async function deleteGioHoc(id: string) {
    return await apiClient.delete(`/admin/gio-hoc/${id}`);
}

export async function searchGioHocByName(keyword: string) {
    return (await apiClient.get(`/admin/gio-hoc/search-name?keyword=${encodeURIComponent(keyword)}`)).data;
}

export async function importGioHocExcel(file: File): Promise<ImportResult> {
    const formData = new FormData();
    formData.append('file', file);
    const response = await apiClient.post<ImportResult>('/admin/gio-hoc/import-excel', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
    });
    return response.data;
}

export default {
    getAllGioHoc,
    getGioHocById,
    createGioHoc,
    updateGioHoc,
    deleteGioHoc,
    searchGioHocByName,
    importGioHocExcel,
};
