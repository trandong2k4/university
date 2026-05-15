import apiClient from '@/common/axiosClient';

export interface ChuongTrinhDaoTaoItem {
    id: string | null;
    nganhId: string;
    maNganh: string;
    tenNganh: string;
    monHocId: string;
    maMonHoc: string;
    tenMonHoc: string;
    soTinChi: number;
    moTa: string;
}

export interface NganhOption {
    id: string;
    maNganh: string;
    tenNganh: string;
}

export interface MonHocOption {
    id: string;
    maMonHoc: string;
    tenMonHoc: string;
    soTinChi: number;
}

export interface CtdtRequest {
    maNganh: string;
    maMonHoc: string;
}

export async function getAllCtdt() {
    return (await apiClient.get<ChuongTrinhDaoTaoItem[]>('/admin/chuong-trinh-dao-tao')).data;
}

export async function getCtdtByNganh(nganhId: string) {
    return (await apiClient.get<ChuongTrinhDaoTaoItem[]>(`/admin/chuong-trinh-dao-tao/by-nganh/${nganhId}`)).data;
}

export async function getNganhOptions() {
    return (await apiClient.get<NganhOption[]>('/admin/chuong-trinh-dao-tao/nganh-options')).data;
}

export async function getMonHocOptions() {
    return (await apiClient.get<MonHocOption[]>('/admin/chuong-trinh-dao-tao/monhoc-options')).data;
}

export async function createCtdt(dto: CtdtRequest) {
    return (await apiClient.post<ChuongTrinhDaoTaoItem>('/admin/chuong-trinh-dao-tao', dto)).data;
}

export async function createCtdtList(dtos: CtdtRequest[]) {
    return (await apiClient.post<ChuongTrinhDaoTaoItem[]>('/admin/chuong-trinh-dao-tao/list', dtos)).data;
}

export async function deleteCtdt(id: string) {
    return await apiClient.delete(`/admin/chuong-trinh-dao-tao/${id}`);
}

export async function deleteCtdtList(ids: string[]) {
    return await apiClient.delete('/admin/chuong-trinh-dao-tao/delete/by-list', { data: ids });
}

export default {
    getAllCtdt,
    getCtdtByNganh,
    getNganhOptions,
    getMonHocOptions,
    createCtdt,
    createCtdtList,
    deleteCtdt,
    deleteCtdtList,
};
