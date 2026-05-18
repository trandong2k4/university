import apiClient from '@/common/axiosClient';

export type NhanVienResponse = {
    id: string;
    maNhanVien: string;
    tenNhanVien: string;
    gioiTinh: 'NAM' | 'NU' | null;
    ngayNhanViec: string | null;
    ngayNghiViec: string | null;
    usersId: string | null;
    userName: string | null;
    email: string | null;
    cccd: string | null;
    diaChi: string | null;
    soDienThoai: string | null;
    ngaySinh: string | null;
    trangThai: boolean | null;
    ghiChu: string | null;
};

export type NhanVienUserDetails = {
    userName: string;
    passWord?: string;
    email?: string;
    cccd: string;
    hoTen: string;
    diaChi?: string;
    gioiTinh?: 'NAM' | 'NU';
    ngaySinh?: string;
    soDienThoai?: string;
    trangThai: boolean;
    ghiChu?: string;
};

export type NhanVienDetails = {
    maNhanVien: string;
    ngayNhanViec?: string;
    ngayNghiViec?: string;
};

export type CreateNhanVienSimpleRequest = {
    maNhanVien: string;
    ngayNhanViec?: string;
    ngayNghiViec?: string;
    usersId: string;
};

export type CreateNhanVienRequest = {
    userDetails: NhanVienUserDetails;
    nhanVienDetails: NhanVienDetails;
};

export type UpdateNhanVienRequest = {
    maNhanVien: string;
    ngayNhanViec?: string;
    ngayNghiViec?: string;
    // User fields
    hoTen?: string;
    username?: string;
    passWord?: string;
    email?: string;
    cccd?: string;
    gioiTinh?: 'NAM' | 'NU';
    ngaySinh?: string;
    soDienThoai?: string;
    diaChi?: string;
    trangThai?: boolean;
    ghiChu?: string;
};

export type AvailableUser = {
    id: string;
    userName: string;
    email: string;
    cccd: string;
    hoTen: string;
    diaChi: string | null;
    gioiTinh: string | null;
    ngaySinh: string | null;
    soDienThoai: string | null;
    trangThai: boolean;
    ghiChu: string | null;
};

export type NhanVienUsersResponse = {
    userDetails: AvailableUser;
    nhanVienDetails: NhanVienResponse;
};

export async function getAllNhanVien(): Promise<NhanVienResponse[]> {
    return (await apiClient.get('/admin/nhan-vien/all')).data;
}

export async function getAllLecturers(): Promise<NhanVienResponse[]> {
    return (await apiClient.get('/admin/nhan-vien/lecturers')).data;
}

export async function getNhanVienById(id: string): Promise<NhanVienResponse> {
    return (await apiClient.get(`/admin/nhan-vien/${id}`)).data;
}

export async function createNhanVienSimple(data: CreateNhanVienSimpleRequest): Promise<NhanVienResponse> {
    return (await apiClient.post('/admin/nhan-vien/simple', data)).data;
}

export async function createNhanVien(data: CreateNhanVienRequest): Promise<NhanVienUsersResponse> {
    return (await apiClient.post('/admin/nhan-vien', data)).data;
}

export async function updateNhanVien(id: string, data: UpdateNhanVienRequest): Promise<NhanVienResponse> {
    return (await apiClient.put(`/admin/nhan-vien/${id}`, data)).data;
}

export async function deleteNhanVien(id: string): Promise<void> {
    await apiClient.delete(`/admin/nhan-vien/${id}`);
}

export type BatchDeleteResult = {
    totalRequested: number;
    deletedCount: number;
    failedCount: number;
    failedUsers: { id: string; hoTen: string | null; reason: string }[];
};

export async function deleteNhanVienList(ids: string[]): Promise<BatchDeleteResult> {
    return (await apiClient.delete('/admin/nhan-vien/delete-list', { data: ids })).data;
}

export async function getAvailableUsers(): Promise<AvailableUser[]> {
    return (await apiClient.get('/admin/nhan-vien/available-users')).data;
}

export async function assignUserToNhanVien(nhanVienId: string, usersId: string): Promise<NhanVienResponse> {
    return (await apiClient.put(`/admin/nhan-vien/${nhanVienId}/assign-user`, null, {
        params: { usersId },
    })).data;
}

export type ExcelImportResult = {
    totalRows: number;
    successCount: number;
    errorCount: number;
    errors: string[];
    message: string;
};

export async function importNhanVienExcel(file: File): Promise<ExcelImportResult> {
    const form = new FormData();
    form.append('file', file);
    return (await apiClient.post('/admin/nhan-vien/import-excel', form, {
        headers: { 'Content-Type': 'multipart/form-data' },
    })).data;
}

export default {
    getAllNhanVien,
    getAllLecturers,
    getNhanVienById,
    createNhanVienSimple,
    createNhanVien,
    updateNhanVien,
    deleteNhanVien,
    deleteNhanVienList,
    getAvailableUsers,
    assignUserToNhanVien,
    importNhanVienExcel,
};
