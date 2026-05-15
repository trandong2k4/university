import apiClient from './axiosClient';

export type LoaiThongBaoEnum =
    | 'THONG_BAO_CHUNG'
    | 'THONG_BAO_SINH_VIEN'
    | 'THONG_BAO_GIANG_VIEN'
    | 'THONG_BAO_KHOA'
    | 'THONG_BAO_DAO_TAO'
    | 'THONG_BAO_HOC_PHI'
    | 'THONG_BAO_TUYEN_SINH'
    | 'THONG_BAO_SU_KIEN'
    | 'THONG_BAO_KHAC';

export const LOAI_THONG_BAO_LABEL: Record<LoaiThongBaoEnum, string> = {
    THONG_BAO_CHUNG: 'Thông báo chung',
    THONG_BAO_SINH_VIEN: 'Thông báo sinh viên',
    THONG_BAO_GIANG_VIEN: 'Thông báo giảng viên',
    THONG_BAO_KHOA: 'Thông báo khoa',
    THONG_BAO_DAO_TAO: 'Thông báo đào tạo',
    THONG_BAO_HOC_PHI: 'Thông báo học phí',
    THONG_BAO_TUYEN_SINH: 'Thông báo tuyển sinh',
    THONG_BAO_SU_KIEN: 'Thông báo sự kiện',
    THONG_BAO_KHAC: 'Thông báo khác',
};

export interface NotificationResponse {
    id: string;
    tieuDe: string;
    noiDung: string;
    loaiThongBao: LoaiThongBaoEnum;
    createdAt: string;
    daNhan: boolean;
    fileThongBao?: string;
}

export interface NotificationRequest {
    tieuDe: string;
    noiDung: string;
    loaiThongBao: LoaiThongBaoEnum;
    fileThongBao?: string;
    userIds: string[];
}

export const getMyNotifications = async (): Promise<NotificationResponse[]> => {
    const response = await apiClient.get('/notifications/read');
    return response.data;
};

export const getUnreadNotifications = async (): Promise<NotificationResponse[]> => {
    const response = await apiClient.get('/notifications/unread');
    return response.data;
};

export const sendAdminNotification = async (
    payload: NotificationRequest
): Promise<{ message: string }> => {
    const response = await apiClient.post('/notifications/admin', payload);
    return response.data;
};

export const markNotificationAsRead = async (
    id: string
): Promise<{ message: string }> => {
    const response = await apiClient.put(`/notifications/${id}/read`);
    return response.data;
};

// ============================================================
// Admin ThongBao API
// ============================================================

export interface ThongBaoAdminResponse {
    id: string;
    tieuDe: string;
    noiDung: string;
    fileThongBao: string | null;
    loaiThongBao: LoaiThongBaoEnum;
    createdAt: string;
    usersId: string;
    userName: string;
    hoTen: string;
    soNguoiNhan: number;
    soNguoiDaNhan: number;
}

export interface ThongBaoAdminRequest {
    tieuDe: string;
    noiDung: string;
    loaiThongBao: LoaiThongBaoEnum;
    fileThongBao?: string;
    usersId: string;
    userIds: string[];
}

export interface ThongBaoNguoiDungAdminResponse {
    id: string;
    daNhan: boolean;
    userId: string;
    userName: string;
    hoTen: string;
    thongBaoId: string;
    tieuDe: string;
}

export interface ThongBaoCreateRequest {
    tieuDe: string;
    noiDung: string;
    loaiThongBao: LoaiThongBaoEnum;
    fileThongBao?: string;
    usersId: string;
    userIds: string[];
}

export interface ThongBaoNguoiDungCreateRequest {
    daNhan: boolean;
    userId: string;
    thongBaoId: string;
}

/**
 * Lay tat ca thong bao (view cua admin)
 */
export const getAllThongBao = async (): Promise<ThongBaoAdminResponse[]> => {
    const response = await apiClient.get('/admin/thong-bao');
    return response.data;
};

/**
 * Lay thong bao theo id
 */
export const getThongBaoById = async (id: string): Promise<ThongBaoAdminResponse> => {
    const response = await apiClient.get(`/admin/thong-bao/${id}`);
    return response.data;
};

/**
 * Tao thong bao (khong gui)
 */
export const createThongBao = async (
    payload: ThongBaoCreateRequest
): Promise<ThongBaoAdminResponse> => {
    const response = await apiClient.post('/admin/thong-bao', payload);
    return response.data;
};

/**
 * Gui thong bao den nguoi nhan (tao + gui)
 */
export const sendThongBao = async (
    payload: ThongBaoCreateRequest
): Promise<ThongBaoAdminResponse> => {
    const response = await apiClient.post('/admin/thong-bao/send', payload);
    return response.data;
};

/**
 * Cap nhat thong bao
 */
export const updateThongBao = async (
    id: string,
    payload: ThongBaoCreateRequest
): Promise<ThongBaoAdminResponse> => {
    const response = await apiClient.put(`/admin/thong-bao/${id}`, payload);
    return response.data;
};

/**
 * Xoa thong bao
 */
export const deleteThongBao = async (id: string): Promise<void> => {
    await apiClient.delete(`/admin/thong-bao/${id}`);
};

/**
 * Xoa nhieu thong bao
 */
export const deleteThongBaoList = async (ids: string[]): Promise<void> => {
    await apiClient.delete('/admin/thong-bao/delete-list', { data: ids });
};

/**
 * Lay danh sach nguoi nhan theo thong bao
 */
export const getThongBaoNguoiDungByThongBao = async (
    thongBaoId: string
): Promise<ThongBaoNguoiDungAdminResponse[]> => {
    const response = await apiClient.get(`/admin/thong-bao-nguoi-dung/thong-bao/${thongBaoId}`);
    return response.data;
};

/**
 * Lay thong bao theo nguoi gui
 */
export const getThongBaoBySender = async (
    usersId: string
): Promise<ThongBaoAdminResponse[]> => {
    const response = await apiClient.get(`/admin/thong-bao/sender/${usersId}`);
    return response.data;
};
