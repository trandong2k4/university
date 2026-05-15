import apiClient from '@/common/axiosClient';

export type PhongRequest = {
    maPhong: string;
    tenPhong: string;
    tinhTrang?: string;
    toaNha?: string;
    tang?: number;
    sucChua?: number;
};

export async function getAllPhong() {
    return (await apiClient.get('/admin/phong')).data;
}

export async function getPhongById(id: string) {
    return (await apiClient.get(`/admin/phong/${id}`)).data;
}

export async function createPhong(dto: PhongRequest) {
    return (await apiClient.post('/admin/phong', dto)).data;
}

export async function updatePhong(id: string, dto: PhongRequest) {
    return (await apiClient.put(`/admin/phong/${id}`, dto)).data;
}

export async function deletePhong(id: string) {
    await apiClient.delete(`/admin/phong/${id}`);
}

export async function deletePhongBatch(ids: string[]) {
    await apiClient.delete('/admin/phong/batch', { data: ids });
}

export async function importPhongFromExcel(file: File): Promise<{
    totalRows: number;
    successCount: number;
    errorCount: number;
    errors: string[];
}> {
    const form = new FormData();
    form.append('file', file);
    const resp = await apiClient.post('/admin/phong/import-excel', form, {
        headers: { 'Content-Type': 'multipart/form-data' },
    });
    return resp.data;
}

export default {
    getAllPhong,
    getPhongById,
    createPhong,
    updatePhong,
    deletePhong,
    deletePhongBatch,
    importPhongFromExcel,
};
