import apiClient from '@/common/axiosClient';

export type LichItem = {
    id: string;
    ngayHoc: string;
    ghiChu?: string;
    createdAt: string;
    updatedAt?: string;
    gioHocId: string;
    phongId: string;
    lopHocPhanId: string;
    gioHoc?: {
        id: string;
        maGioHoc: string;
        tenGioHoc: string;
        gioBatDau: string;
        gioKetThuc: string;
    };
    phong?: {
        id: string;
        maPhong: string;
        tenPhong: string;
    };
    lopHocPhan?: {
        id: string;
        maLopHocPhan: string;
        tenMonHoc: string;
        tenHocKi: string;
    };
};

export type CreateLichRequest = {
    ngayHoc: string; // dd/MM/yyyy HH:mm:ss
    ghiChu?: string;
    gioHocId: string;
    phongId: string;
    lopHocPhanId: string;
};

export type UpdateLichRequest = Partial<CreateLichRequest>;

export async function getLich() {
    return (await apiClient.get('/admin/lich')).data as LichItem[];
}

export async function getLichById(id: string) {
    return (await apiClient.get(`/admin/lich/${id}`)).data as LichItem;
}

export async function getLichByLopHocPhan(lopHocPhanId: string) {
    return (await apiClient.get(`/admin/lich/lop-hoc-phan/${lopHocPhanId}`)).data as LichItem[];
}

export async function createLich(data: CreateLichRequest) {
    return (await apiClient.post('/admin/lich', data)).data as LichItem;
}

export async function updateLich(id: string, data: UpdateLichRequest) {
    return (await apiClient.put(`/admin/lich/${id}`, data)).data as LichItem;
}

export async function deleteLich(id: string) {
    return (await apiClient.delete(`/admin/lich/${id}`)).data;
}

export async function deleteLichList(ids: string[]) {
    return (await apiClient.delete('/admin/lich/delete/by-list', { data: ids })).data;
}

export default {
    getLich,
    getLichById,
    getLichByLopHocPhan,
    createLich,
    updateLich,
    deleteLich,
    deleteLichList
};
