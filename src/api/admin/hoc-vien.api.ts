import apiClient from '@/common/axiosClient';

export type HocVienResponse = {
    id: string;
    maHocVien: string;
    ngayNhapHoc: string | null;
    ngayTotNghiep: string | null;
    nganhId: string | null;
    tenNganh: string | null;
    tenNhanVien: string | null;
    userName: string | null;
    email: string | null;
    cccd: string | null;
    diaChi: string | null;
    soDienThoai: string | null;
    gioiTinh: string | null;
    ngaySinh: string | null;
    usersId: string | null;
    trangThai: boolean | null;
    ghiChu: string | null;
};

export type CreateHocVienRequest = {
    maHocVien: string;
    maNganh: string;
    usersId: string;
    ngayNhapHoc?: string;
};

export type UpdateHocVienRequest = {
    maHocVien: string;
    maNganh: string;
    ngayNhapHoc?: string;
    ngayTotNghiep?: string;
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

export type HocVienUserDetails = {
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

export type HocVienCreateFullRequest = {
    userDetails: HocVienUserDetails;
    hocVienDetails: {
        maHocVien: string;
        maNganh: string;
        ngayNhapHoc?: string;
    };
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

export async function getAllHocVien(): Promise<HocVienResponse[]> {
    return (await apiClient.get('/admin/hoc-vien')).data;
}

export async function getHocVienById(id: string): Promise<HocVienResponse> {
    return (await apiClient.get(`/admin/hoc-vien/${id}`)).data;
}

export async function createHocVien(data: CreateHocVienRequest): Promise<HocVienResponse> {
    return (await apiClient.post('/admin/hoc-vien', data)).data;
}

export async function createHocVienFull(data: HocVienCreateFullRequest): Promise<HocVienResponse> {
    return (await apiClient.post('/admin/hoc-vien/full', data)).data;
}

export async function updateHocVien(id: string, data: UpdateHocVienRequest): Promise<HocVienResponse> {
    return (await apiClient.put(`/admin/hoc-vien/${id}`, data)).data;
}

export async function deleteHocVien(id: string): Promise<void> {
    await apiClient.delete(`/admin/hoc-vien/${id}`);
}

export async function deleteHocVienList(ids: string[]): Promise<void> {
    await apiClient.delete('/admin/hoc-vien/delete-list', { data: ids });
}

export async function getAvailableUsers(): Promise<AvailableUser[]> {
    return (await apiClient.get('/admin/hoc-vien/available-users')).data;
}

export async function assignUserToHocVien(hocVienId: string, usersId: string): Promise<HocVienResponse> {
    return (await apiClient.put(`/admin/hoc-vien/${hocVienId}/assign-user`, null, {
        params: { usersId },
    })).data;
}

export async function importHocVienExcel(file: File): Promise<{ totalRows: number; successCount: number; errorCount: number; errors: string[] }> {
    const form = new FormData();
    form.append('file', file);
    return (await apiClient.post('/admin/hoc-vien/import-excel', form, {
        headers: { 'Content-Type': 'multipart/form-data' },
    })).data;
}

// ─── Học phí Admin ───
export type HocPhiItem = {
    id: string;
    soTien: number;
    trangThai: 'CHUA_THANH_TOAN' | 'DA_THANH_TOAN' | 'QUA_HAN';
    soTinChi: number;
    createdAt: string;
    updatedAt: string;
    hocVienId: string;
    hocVienMa: string;
    hocVienHoTen: string;
    hocVienEmail: string;
    hocKiId: string;
    hocKiMa: string;
    hocKiTen: string;
    soTienConNo: number;
    thanhToanMaGiaoDich: string;
    thanhToanPhuongThuc: string;
    thanhToanNgay: string;
};

export type HocPhiDashboardTongQuan = {
    tongSoHocPhi: number;
    tongSoTien: number;
    soChuaThanhToan: number;
    soDaThanhToan: number;
    soQuaHan: number;
};

export type HocPhiDashboardTheoHocKi = {
    hocKiId: string;
    hocKiMa: string;
    hocKiTen: string;
    soLuong: number;
    tongTien: number;
    tienDaThu: number;
    tienConNo: number;
    soChuaThanhToan: number;
    soDaThanhToan: number;
    soQuaHan?: number;
};

export type HocPhiDashboardTheoThang = {
    nam: number;
    thang: number;
    soLuong: number;
    tongTien: number;
    tienDaThu: number;
};

export async function getAllHocPhi(): Promise<HocPhiItem[]> {
    return (await apiClient.get('/admin/hoc-phi')).data;
}

export async function getHocPhiDashboardTongQuan(): Promise<HocPhiDashboardTongQuan> {
    return (await apiClient.get('/admin/hoc-phi/dashboard/tong-quan')).data;
}

export async function getHocPhiDashboardTheoHocKi(): Promise<HocPhiDashboardTheoHocKi[]> {
    return (await apiClient.get('/admin/hoc-phi/dashboard/theo-hoc-ki')).data;
}

export async function getHocPhiDashboardTheoThang(): Promise<HocPhiDashboardTheoThang[]> {
    return (await apiClient.get('/admin/hoc-phi/dashboard/theo-thang')).data;
}

export default {
    getAllHocVien,
    getHocVienById,
    createHocVien,
    createHocVienFull,
    updateHocVien,
    deleteHocVien,
    deleteHocVienList,
    getAvailableUsers,
    assignUserToHocVien,
    importHocVienExcel,
    getAllHocPhi,
    getHocPhiDashboardTongQuan,
    getHocPhiDashboardTheoHocKi,
    getHocPhiDashboardTheoThang,
};
