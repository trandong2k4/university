import apiClient from '@/common/axiosClient';
import type { SchoolItem } from '@/common/types';

export type TruongCreateDTO = {
    maTruong: string;
    tenTruong?: string;
    diaChi?: string;
    moTa?: string;
    ngayThanhLap?: string; // ISO or formatted date
    nguoiDaiDien?: string;
};

export async function getSchools(): Promise<SchoolItem[]> {
    return (await apiClient.get('/admin/truong')).data as SchoolItem[];
}

export async function getSchoolById(id: string): Promise<SchoolItem> {
    return (await apiClient.get(`/admin/truong/${id}`)).data as SchoolItem;
}

export async function searchSchools(keyword: string): Promise<SchoolItem[]> {
    return (await apiClient.get('/admin/truong/search', { params: { keyword } })).data as SchoolItem[];
}

export async function createSchool(dto: TruongCreateDTO): Promise<SchoolItem> {
    return (await apiClient.post('/admin/truong', dto)).data as SchoolItem;
}

export async function updateSchool(id: string, dto: TruongCreateDTO): Promise<SchoolItem> {
    return (await apiClient.put(`/admin/truong/${id}`, dto)).data as SchoolItem;
}

export async function deleteSchool(id: string): Promise<void> {
    await apiClient.delete(`/admin/truong/${id}`);
}

export async function importSchoolsFromExcel(file: File): Promise<any> {
    const form = new FormData();
    form.append('file', file);
    const resp = await apiClient.post('/admin/truong/import-excel', form, {
        headers: { 'Content-Type': 'multipart/form-data' },
    });
    return resp.data;
}

export default {
    getSchools,
    getSchoolById,
    searchSchools,
    createSchool,
    updateSchool,
    deleteSchool,
    importSchoolsFromExcel,
};
