import apiClient from '@/common/axiosClient';

export type DangKyTinChiItem = {
    id: string;
    lopHocPhanId: string;
    maLopHocPhan: string;
    hocVienId: string;
    maHocVien: string;
    usersId: string;
    monHocId: string;
    maMonHoc: string;
    soTinChi: number;
    createdAt: string;
    tenMonHoc: string;
    hocKiId: string;
    hocKiMa: string;
    hocKiTen: string;
    hoTen: string;
    email: string;
    soDienThoai: string;
    hanDangKy: string;
    hanHuy: string;
    soLuongToiDa: number;
    soLuongDaDangKy: number;
    trangThaiLopHocPhan: string;
    tienHocPhi: number;
};

export type CreateDangKyTinChiRequest = {
    lopHocPhanId: string;
    hocVienId: string;
};

export type UpdateDangKyTinChiRequest = {
    lopHocPhanId: string;
    hocVienId: string;
};

export type LopHocPhanDangKyView = {
    id: string;
    maLopHocPhan: string;
    tenMonHoc: string;
    soTinChi: number;
    hocKiMa: string;
    hocKiTen: string;
    namHoc: number;
    trangThai: string;
    soLuongDaDangKy: number;
    soLuongToiDa: number;
    hanDangKy: string;
};

export type HocVienDangKyView = {
    id: string;
    maHocVien: string;
    hoTen: string;
    email: string;
    soDienThoai: string;
    nganhTen: string;
};

export async function getAllDangKyTinChi(): Promise<DangKyTinChiItem[]> {
    return (await apiClient.get('/admin/dang-ky-tin-chi')).data;
}

export async function getDangKyTinChiById(id: string): Promise<DangKyTinChiItem> {
    return (await apiClient.get(`/admin/dang-ky-tin-chi/${id}`)).data;
}

export async function getDangKyTinChiByHocKi(hocKiId: string): Promise<DangKyTinChiItem[]> {
    return (await apiClient.get(`/admin/dang-ky-tin-chi/hoc-ki/${hocKiId}`)).data;
}

export async function getDangKyTinChiByHocVien(hocVienId: string): Promise<DangKyTinChiItem[]> {
    return (await apiClient.get(`/admin/dang-ky-tin-chi/hoc-vien/${hocVienId}`)).data;
}

export async function getDangKyTinChiByLopHocPhan(lopHocPhanId: string): Promise<DangKyTinChiItem[]> {
    return (await apiClient.get(`/admin/dang-ky-tin-chi/lop-hoc-phan/${lopHocPhanId}`)).data;
}

export async function searchDangKyTinChi(keyword: string): Promise<DangKyTinChiItem[]> {
    return (await apiClient.get('/admin/dang-ky-tin-chi/tim-kiem', {
        params: { keyword },
    })).data;
}

export async function getLopHocPhanMoDangKy(): Promise<LopHocPhanDangKyView[]> {
    return (await apiClient.get('/admin/dang-ky-tin-chi/dropdown/lop-hoc-phan-mo-dang-ky')).data;
}

export async function getHocVienDangKy(): Promise<HocVienDangKyView[]> {
    return (await apiClient.get('/admin/dang-ky-tin-chi/dropdown/hoc-vien')).data;
}

export async function createDangKyTinChi(data: CreateDangKyTinChiRequest): Promise<DangKyTinChiItem> {
    return (await apiClient.post('/admin/dang-ky-tin-chi', data)).data;
}

export async function updateDangKyTinChi(id: string, data: UpdateDangKyTinChiRequest): Promise<DangKyTinChiItem> {
    return (await apiClient.put(`/admin/dang-ky-tin-chi/${id}`, data)).data;
}

export async function deleteDangKyTinChi(id: string): Promise<void> {
    await apiClient.delete(`/admin/dang-ky-tin-chi/${id}`);
}

export async function deleteDangKyTinChiList(ids: string[]): Promise<void> {
    await apiClient.delete('/admin/dang-ky-tin-chi/xoa-nhieu', { data: ids });
}
