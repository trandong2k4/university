import apiClient from '@/common/axiosClient';

export type HocKiRequest = {
    maHocKi: string;
    tenHocKi: string;
    ngayBatDau?: string; // format: dd/MM/yyyy HH:mm:ss
    ngayKetThuc?: string; // format: dd/MM/yyyy HH:mm:ss
};

export async function getAllHocKi() {
    return (await apiClient.get('/admin/hoc-ki')).data;
}

export async function getHocKiById(id: string) {
    return (await apiClient.get(`/admin/hoc-ki/${id}`)).data;
}

export async function createHocKi(dto: HocKiRequest) {
    return (await apiClient.post('/admin/hoc-ki', dto)).data;
}

export async function updateHocKi(id: string, dto: HocKiRequest) {
    return (await apiClient.put(`/admin/hoc-ki/${id}`, dto)).data;
}

export async function deleteHocKi(id: string) {
    return await apiClient.delete(`/admin/hoc-ki/${id}`);
}

export default {
    getAllHocKi,
    getHocKiById,
    createHocKi,
    updateHocKi,
    deleteHocKi,
};
