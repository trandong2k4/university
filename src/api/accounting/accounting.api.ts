import apiClient from '@/common/axiosClient';

export type TrangThaiHocPhi = 'CHUA_THANH_TOAN' | 'DANG_XU_LY' | 'DA_THANH_TOAN' | 'QUA_HAN';

export interface AccountingHocPhiResponse {
  id: string;
  soTien: number;
  trangThai: TrangThaiHocPhi;
  soTinChi: number;
  createdAt: string;
  updatedAt: string;
  hocVienId: string;
  hocVienName: string;
  hocVienEmail: string;
  hocKiId: string;
  hocKiMa: string;
  hocKiName: string;
  ngayThanhToan: string | null;
  phuongThucThanhToan: string | null;
  fileChungTu: string | null;
  maGiaoDich: string | null;
}

export interface PaymentInfoResponse {
  paymentId: string;
  hocPhiId: string;
  hocVienId: string;
  hocVienName: string;
  amount: number;
  ngayThanhToan: string;
  phuongThucThanhToan: string;
  maGiaoDichGateway: string;
  fileChungTu: string;
}

export interface MonthlyRevenue {
  namThang: string;
  doanhThu: number;
}

export interface BaoCaoThongKeOverviewResponse {
  tongDoanhThu: number;
  soLuongThanhToan: number;
  tongCanThanhToan: number;
  tongDaThanhToan: number;
  tongQuaHan: number;
  danhSachThanhToanMoiNhat: PaymentInfoResponse[];
  doanhThuTheoThang: MonthlyRevenue[];
}

export interface CreatePaymentRequest {
  hocPhiId: string;
  ngayThanhToan?: string;
  fileChungTu: string;
  phuongThucThanhToan?: string;
}

export interface AccountingProfileResponse {
  id: string;
  userName: string;
  hoTen: string;
  email: string;
  soDienThoai: string | null;
  diaChi: string | null;
  gioiTinh: 'NAM' | 'NU' | null;
  ngaySinh: string | null;
  maNhanVien: string | null;
  ngayNhanViec: string | null;
}

export interface AccountingProfileRequest {
  hoTen: string;
  diaChi?: string;
  soDienThoai?: string;
  gioiTinh?: 'NAM' | 'NU';
  ngaySinh?: string;
}

export interface AccountingChangePasswordRequest {
  currentPassword: string;
  newPassword: string;
}

export const accountingApi = {
  getDueHocPhi: (): Promise<AccountingHocPhiResponse[]> =>
    apiClient.get('/accounting/hoc-phi/due').then(r => r.data),

  getAllHocPhi: (): Promise<AccountingHocPhiResponse[]> =>
    apiClient.get('/accounting/hoc-phi').then(r => r.data),

  getOverview: (start?: string, end?: string): Promise<BaoCaoThongKeOverviewResponse> => {
    const params: Record<string, string> = {};
    if (start) params.start = start;
    if (end) params.end = end;
    return apiClient.get('/accounting/report/overview', { params }).then(r => r.data);
  },

  getPayments: (start?: string, end?: string): Promise<PaymentInfoResponse[]> => {
    const params: Record<string, string> = {};
    if (start) params.start = start;
    if (end) params.end = end;
    return apiClient.get('/accounting/report/payments', { params }).then(r => r.data);
  },

  createPayment: (hocPhiId: string, data: CreatePaymentRequest): Promise<unknown> =>
    apiClient.post(`/accounting/hoc-phi/${hocPhiId}/payment`, data).then(r => r.data),

  sendNotification: (hocPhiId: string): Promise<void> =>
    apiClient.post(`/accounting/hoc-phi/${hocPhiId}/notify`).then(() => undefined),

  sendNotificationBulk: (ids: string[]): Promise<{ requested: number; sent: number }> =>
    apiClient.post('/accounting/hoc-phi/notify/bulk', ids).then(r => r.data),

  sendNotificationToUser: (usersId: string): Promise<void> =>
    apiClient.post(`/accounting/hoc-phi/notify/user/${usersId}`).then(() => undefined),

  confirmPayment: (id: string): Promise<void> =>
    apiClient.post(`/accounting/hoc-phi/${id}/confirm`).then(() => undefined),

  rejectPayment: (id: string): Promise<void> =>
    apiClient.post(`/accounting/hoc-phi/${id}/reject`).then(() => undefined),

  getProfile: (): Promise<AccountingProfileResponse> =>
    apiClient.get('/accounting/profile').then(r => r.data),

  updateProfile: (data: AccountingProfileRequest): Promise<AccountingProfileResponse> =>
    apiClient.put('/accounting/profile', data).then(r => r.data),

  changePassword: (data: AccountingChangePasswordRequest): Promise<void> =>
    apiClient.put('/accounting/profile/change-password', data).then(() => undefined),
};

export default accountingApi;
