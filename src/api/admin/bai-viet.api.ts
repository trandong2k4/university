import apiClient from '@/common/axiosClient';

export type LoaiBaiVietEnum = 'THONG_BAO' | 'TAI_LIEU' | 'CANH_BAO' | 'HUONG_DAN' | 'CONG_KHAI';
export type TrangThaiBaiVietEnum = 'CONG_KHAI' | 'RIENG_TU' | 'NHAP';

export const LOAI_BAI_VIET_LABEL: Record<LoaiBaiVietEnum, string> = {
    THONG_BAO: 'Thông báo',
    TAI_LIEU: 'Tài liệu',
    CANH_BAO: 'Cảnh báo',
    HUONG_DAN: 'Hướng dẫn',
    CONG_KHAI: 'Công khai',
};

export const TRANG_THAI_LABEL: Record<TrangThaiBaiVietEnum, string> = {
    CONG_KHAI: 'Công khai',
    RIENG_TU: 'Riêng tư',
    NHAP: 'Nháp',
};

export type BaiVietResponse = {
    id: string;
    tieuDe: string;
    noiDung: string | null;
    ngayDang: string | null;
    tacGia: string | null;
    fileDinhKemUrl: string | null;
    hinhAnhUrl: string | null;
    loaiBaiViet: LoaiBaiVietEnum | null;
    trangThai: TrangThaiBaiVietEnum | null;
    createdAt: string | null;
    updatedAt: string | null;
};

export type CreateBaiVietRequest = {
    tieuDe: string;
    noiDung?: string;
    ngayDang?: string;
    tacGia?: string;
    fileDinhKemUrl?: string;
    hinhAnhUrl?: string;
    loaiBaiViet?: LoaiBaiVietEnum;
    trangThai?: TrangThaiBaiVietEnum;
    usersId: string;
};

export async function getAllBaiViet(): Promise<BaiVietResponse[]> {
    return (await apiClient.get('/admin/bai-viet')).data;
}

export async function getBaiVietById(id: string): Promise<BaiVietResponse> {
    return (await apiClient.get(`/admin/bai-viet/${id}`)).data;
}

export async function createBaiViet(data: CreateBaiVietRequest): Promise<BaiVietResponse> {
    return (await apiClient.post('/admin/bai-viet', data)).data;
}

export async function updateBaiViet(id: string, data: CreateBaiVietRequest): Promise<BaiVietResponse> {
    return (await apiClient.put(`/admin/bai-viet/${id}`, data)).data;
}

export async function deleteBaiViet(id: string): Promise<void> {
    await apiClient.delete(`/admin/bai-viet/${id}`);
}
