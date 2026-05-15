import apiClient from '@/common/axiosClient';

export type NganhRequest = {
    maNganh: string;
    tenNganh: string;
    moTa?: string;
    danhGia?: string;
    maKhoa: string; // expects Khoa.maKhoa (code)
};

export async function getAllNganh() {
    return (await apiClient.get('/admin/nganh')).data;
}

export async function getNganhById(id: string) {
    return (await apiClient.get(`/admin/nganh/${id}`)).data;
}

export async function createNganh(dto: NganhRequest) {
    return (await apiClient.post('/admin/nganh', dto)).data;
}

export async function updateNganh(id: string, dto: NganhRequest) {
    return (await apiClient.put(`/admin/nganh/${id}`, dto)).data;
}

export async function deleteNganh(id: string) {
    return await apiClient.delete(`/admin/nganh/${id}`);
}

export async function searchNganh(keyword: string) {
    return (await apiClient.get('/admin/nganh/search', { params: { keyword } })).data;
}

export async function importNganhExcel(file: File) {
    const form = new FormData();
    form.append('file', file);
    return (await apiClient.post('/admin/nganh/import-excel', form, {
        headers: { 'Content-Type': 'multipart/form-data' },
    })).data;
}

export default {
    getAllNganh,
    getNganhById,
    createNganh,
    updateNganh,
    deleteNganh,
    searchNganh,
    importNganhExcel,
};
