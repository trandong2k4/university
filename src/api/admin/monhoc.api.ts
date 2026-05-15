import apiClient from '@/common/axiosClient';

export type MonHocRequest = {
    maMonHoc: string;
    tenMonHoc: string;
    soTinChi?: number;
    moTa?: string;
};

export async function getAllMonHoc() {
    return (await apiClient.get('/admin/mon-hoc/all')).data;
}

export async function getMonHocById(id: string) {
    return (await apiClient.get(`/admin/mon-hoc/${id}`)).data;
}

export async function createMonHoc(dto: MonHocRequest) {
    return (await apiClient.post('/admin/mon-hoc', dto)).data;
}

export async function updateMonHoc(id: string, dto: MonHocRequest) {
    return (await apiClient.put(`/admin/mon-hoc/${id}`, dto)).data;
}

export async function deleteMonHoc(id: string) {
    // Backend exposes delete endpoint as delete-list expecting an array of UUIDs
    return await apiClient.delete('/admin/mon-hoc/delete-list', { data: [id] });
}

export async function deleteMonHocList(ids: string[]) {
    return await apiClient.delete('/admin/mon-hoc/delete-list', { data: ids });
}

export async function importMonHocExcel(file: File) {
    const form = new FormData();
    form.append('file', file);
    return (await apiClient.post('/admin/mon-hoc/import-excel', form, {
        headers: { 'Content-Type': 'multipart/form-data' },
    })).data;
}

export type TienQuyetResponse = {
    id: string;
    monHocId: string;
    maMonHoc: string;
    tenMonHoc: string;
    monTienQuyetId: string;
    maTienQuyet: string;
    tenMonTienQuyet: string;
};

export async function getTienQuyetByMonHoc(monHocId: string): Promise<TienQuyetResponse[]> {
    return (await apiClient.get(`/admin/mon-hoc-tien-quyet/by-mon-hoc/${monHocId}`)).data;
}

export async function createTienQuyet(monHocId: string, monTienQuyetId: string): Promise<TienQuyetResponse> {
    return (await apiClient.post('/admin/mon-hoc-tien-quyet', { monHocId, monTienQuyetId })).data;
}

export async function deleteTienQuyet(id: string): Promise<void> {
    await apiClient.delete(`/admin/mon-hoc-tien-quyet/${id}`);
}

export default {
    getAllMonHoc,
    getMonHocById,
    createMonHoc,
    updateMonHoc,
    deleteMonHoc,
    deleteMonHocList,
    importMonHocExcel,
    getTienQuyetByMonHoc,
    createTienQuyet,
    deleteTienQuyet,
};
