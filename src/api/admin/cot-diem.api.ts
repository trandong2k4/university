import apiClient from '@/common/axiosClient';

export type CotDiemLoai =
    | 'CHUYEN_CAN'
    | 'BAI_TAP'
    | 'THAO_LUAN'
    | 'KIEM_TRA_15_PHUT'
    | 'KIEM_TRA_1_TIET'
    | 'THUC_HANH'
    | 'THI_GIUA_KY'
    | 'DO_AN'
    | 'TIEU_LUAN'
    | 'BAO_CAO'
    | 'THI_CUOI_KY'
    | 'THI_LAI';

export const COT_DIEM_LOAI_LABEL: Record<CotDiemLoai, string> = {
    CHUYEN_CAN: 'Chuyên cần',
    BAI_TAP: 'Bài tập',
    THAO_LUAN: 'Thảo luận',
    KIEM_TRA_15_PHUT: 'Kiểm tra 15 phút',
    KIEM_TRA_1_TIET: 'Kiểm tra 1 tiết',
    THUC_HANH: 'Thực hành',
    THI_GIUA_KY: 'Thi giữa kỳ',
    DO_AN: 'Đồ án',
    TIEU_LUAN: 'Tiểu luận',
    BAO_CAO: 'Báo cáo',
    THI_CUOI_KY: 'Thi cuối kỳ',
    THI_LAI: 'Thi lại',
};

export type CotDiemItem = {
    id: string;
    tenCotDiem: string;
    tiTrong: string;
    loai: CotDiemLoai;
    thuTuHienThi: number;
    lopHocPhanId: string;
    maLopHocPhan: string;
};

export type CreateCotDiemRequest = {
    tenCotDiem: string;
    tiTrong: string;
    loai: CotDiemLoai;
    thuTuHienThi?: number;
    lopHocPhanId: string;
};

export type UpdateCotDiemRequest = Partial<CreateCotDiemRequest>;

export async function getCotDiemByLopHocPhan(lopHocPhanId: string) {
    return (await apiClient.get(`/admin/cot-diem/lop-hoc-phan/${lopHocPhanId}`)).data as CotDiemItem[];
}

export async function createCotDiem(data: CreateCotDiemRequest) {
    return (await apiClient.post('/admin/cot-diem', data)).data as CotDiemItem;
}

export async function updateCotDiem(id: string, data: UpdateCotDiemRequest) {
    return (await apiClient.put(`/admin/cot-diem/${id}`, data)).data as CotDiemItem;
}

export async function deleteCotDiem(id: string) {
    return (await apiClient.delete(`/admin/cot-diem/${id}`)).data;
}

export default {
    getCotDiemByLopHocPhan,
    createCotDiem,
    updateCotDiem,
    deleteCotDiem,
};
