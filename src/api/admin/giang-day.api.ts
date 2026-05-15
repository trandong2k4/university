import apiClient from '@/common/axiosClient';

export type GiangDayResponse = {
    id: string;
    vaiTro: string;
    nhanVienId: string;
    maNhanVien: string;
    tenNhanVien: string;
    lopHocPhanId: string;
    maLopHocPhan: string;
    tenMonHoc: string;
    soTinChi: number;
    hocKiId: string;
    maHocKi: string;
    tenHocKi: string;
};

export type CreateGiangDayRequest = {
    vaiTro?: string;
    nhanVienId: string;
    lopHocPhanId: string;
};

export type UpdateGiangDayRequest = {
    vaiTro?: string;
    nhanVienId?: string;
    lopHocPhanId?: string;
};

export async function getAllGiangDay(): Promise<GiangDayResponse[]> {
    return (await apiClient.get('/admin/giang-day')).data;
}

export async function getGiangDayById(id: string): Promise<GiangDayResponse> {
    return (await apiClient.get(`/admin/giang-day/${id}`)).data;
}

export async function createGiangDay(data: CreateGiangDayRequest): Promise<GiangDayResponse> {
    return (await apiClient.post('/admin/giang-day', data)).data;
}

export async function updateGiangDay(id: string, data: UpdateGiangDayRequest): Promise<GiangDayResponse> {
    return (await apiClient.put(`/admin/giang-day/${id}`, data)).data;
}

export async function deleteGiangDay(id: string): Promise<void> {
    await apiClient.delete(`/admin/giang-day/${id}`);
}

export async function deleteGiangDayList(ids: string[]): Promise<void> {
    await apiClient.delete('/admin/giang-day/delete-list', { data: ids });
}
