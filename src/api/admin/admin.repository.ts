import apiClient from '@/common/axiosClient';
import type {
  AdminContentItem,
  AdminDashboardData,
  PhanHoiLienHeItem,
  PhanHoiLienHeReplyRequest,
  PhanHoiLienHeStatusRequest,
  PhanHoiLienHeThongKe,
} from '@/types';
import type { BaiVietResponse, LoaiBaiVietEnum, TrangThaiBaiVietEnum } from './bai-viet.api';

const CONTENT_TYPE_BY_POST_TYPE: Partial<Record<LoaiBaiVietEnum, AdminContentItem['type']>> = {
  TAI_LIEU: 'Giáo trình',
  HUONG_DAN: 'Giáo trình',
  THONG_BAO: 'Bài tập',
  CANH_BAO: 'Bài tập',
  CONG_KHAI: 'Bài tập',
};

const CONTENT_STATUS_BY_POST_STATUS: Partial<Record<TrangThaiBaiVietEnum, AdminContentItem['status']>> = {
  CONG_KHAI: 'approved',
  NHAP: 'pending',
  RIENG_TU: 'rejected',
};

function toContentItem(post: BaiVietResponse): AdminContentItem {
  return {
    id: post.id,
    type: post.loaiBaiViet ? CONTENT_TYPE_BY_POST_TYPE[post.loaiBaiViet] ?? 'Bài tập' : 'Bài tập',
    title: post.tieuDe,
    owner: post.tacGia || 'Admin',
    subject: post.loaiBaiViet || 'Nội dung',
    status: post.trangThai ? CONTENT_STATUS_BY_POST_STATUS[post.trangThai] ?? 'pending' : 'pending',
  };
}

export const adminRepository = {
  async getDashboard(): Promise<AdminDashboardData> {
    return (await apiClient.get('/admin/dashboard')).data;
  },

  async getContentItems(): Promise<AdminContentItem[]> {
    const posts = (await apiClient.get<BaiVietResponse[]>('/admin/bai-viet')).data ?? [];
    return posts.map(toContentItem);
  },

  async updateContentStatus(_id: string, _status: AdminContentItem['status']): Promise<void> {
    // The current bai-viet update endpoint requires usersId, but list/detail responses do not expose it.
    // The admin page still updates its local state after this call.
  },

  async getPhanHoiLienHe(): Promise<PhanHoiLienHeItem[]> {
    return (await apiClient.get('/admin/phan-hoi-lien-he')).data;
  },

  async getPhanHoiLienHeThongKe(): Promise<PhanHoiLienHeThongKe> {
    return (await apiClient.get('/admin/phan-hoi-lien-he/thong-ke')).data;
  },

  async updatePhanHoiLienHeStatus(
    id: string,
    request: PhanHoiLienHeStatusRequest
  ): Promise<PhanHoiLienHeItem> {
    return (await apiClient.put(`/admin/phan-hoi-lien-he/${id}/trang-thai`, request)).data;
  },

  async replyPhanHoiLienHe(id: string, request: PhanHoiLienHeReplyRequest): Promise<PhanHoiLienHeItem> {
    return (await apiClient.put(`/admin/phan-hoi-lien-he/${id}/phan-hoi`, request)).data;
  },

  async deletePhanHoiLienHe(id: string): Promise<void> {
    await apiClient.delete(`/admin/phan-hoi-lien-he/${id}`);
  },
};

