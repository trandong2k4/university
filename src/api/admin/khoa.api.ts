import apiClient from '@/common/axiosClient';

export type KhoaRequest = {
    maKhoa: string;
    tenKhoa: string;
    diaChi: string;
    moTa?: string;
};

export async function getAllKhoa() {
    return (await apiClient.get('/admin/khoa')).data;
}

export async function getKhoaById(id: string) {
    return (await apiClient.get(`/admin/khoa/${id}`)).data;
}

export async function createKhoa(dto: KhoaRequest) {
    return (await apiClient.post('/admin/khoa', dto)).data;
}

export async function createKhoaList(dtos: KhoaRequest[]) {
    return (await apiClient.post('/admin/khoa/list', dtos)).data;
}

export async function updateKhoa(id: string, dto: KhoaRequest) {
    return (await apiClient.put(`/admin/khoa/${id}`, dto)).data;
}

export async function deleteKhoa(id: string) {
    return await apiClient.delete(`/admin/khoa/${id}`);
}

export async function deleteKhoaList(ids: string[]) {
    return await apiClient.delete('/admin/khoa/delete/by-list', { data: ids });
}

export async function importKhoaExcel(file: File) {
    const form = new FormData();
    form.append('file', file);
    return (await apiClient.post('/admin/khoa/import-excel', form, {
        headers: { 'Content-Type': 'multipart/form-data' },
    })).data;
}

export default {
    getAllKhoa,
    getKhoaById,
    createKhoa,
    createKhoaList,
    updateKhoa,
    deleteKhoa,
    deleteKhoaList,
    importKhoaExcel,
};
