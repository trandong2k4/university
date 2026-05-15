import apiClient from '@/common/axiosClient';

export type TrangThaiLHP = 'MO_DANG_KY' | 'DANG_HOC' | 'DA_KET_THUC';

export type LopHocPhanItem = {
    id: string;
    maLopHocPhan: string;
    soLuongToiDa: number;
    soLuongDaDangKy: number;
    trangThai: TrangThaiLHP;
    hanDangKy: string;
    hanHuy: string;
    hocKiId: string;
    maHocKi: string;
    tenHocKi: string;
    monHocId: string;
    maMonHoc: string;
    tenMonHoc: string;
    soTinChi: number;
};

export type CreateLopHocPhanRequest = {
    maLopHocPhan: string;
    soLuongToiDa: number;
    trangThai?: TrangThaiLHP;
    hanDangKy: string;
    hanHuy: string;
    hocKiId: string;
    monHocId: string;
};

export type UpdateLopHocPhanRequest = Partial<CreateLopHocPhanRequest>;

export async function getLopHocPhan() {
    return (await apiClient.get('/admin/lop-hoc-phan')).data as LopHocPhanItem[];
}

export async function getLopHocPhanById(id: string) {
    return (await apiClient.get(`/admin/lop-hoc-phan/${id}`)).data as LopHocPhanItem;
}

export async function getLopHocPhanByHocKi(hocKiId: string) {
    return (await apiClient.get(`/admin/lop-hoc-phan/hoc-ki/${hocKiId}`)).data as LopHocPhanItem[];
}

export async function getLopHocPhanByMonHoc(monHocId: string) {
    return (await apiClient.get(`/admin/lop-hoc-phan/mon-hoc/${monHocId}`)).data as LopHocPhanItem[];
}

export async function createLopHocPhan(data: CreateLopHocPhanRequest) {
    return (await apiClient.post('/admin/lop-hoc-phan', data)).data as LopHocPhanItem;
}

export async function updateLopHocPhan(id: string, data: UpdateLopHocPhanRequest) {
    return (await apiClient.put(`/admin/lop-hoc-phan/${id}`, data)).data as LopHocPhanItem;
}

export async function deleteLopHocPhan(id: string) {
    return (await apiClient.delete(`/admin/lop-hoc-phan/${id}`)).data;
}

export async function deleteLopHocPhanList(ids: string[]) {
    return (await apiClient.delete('/admin/lop-hoc-phan/delete-list', { data: ids })).data;
}

export default {
    getLopHocPhan,
    getLopHocPhanById,
    getLopHocPhanByHocKi,
    getLopHocPhanByMonHoc,
    createLopHocPhan,
    updateLopHocPhan,
    deleteLopHocPhan,
    deleteLopHocPhanList
};
