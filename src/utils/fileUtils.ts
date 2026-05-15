import { envConfig } from '@/constants/environment';
import apiClient from '@/api/common';

export interface UploadedFileInfo {
  id?: string;
  fileName: string;
  originalFileName: string;
  fileUrl: string;
  storagePath?: string;
  fileSize: number;
  contentType?: string;
}

export function resolveFileUrl(url?: string | null) {
  if (!url) return '';
  if (/^https?:\/\//i.test(url) || url.startsWith('blob:') || url.startsWith('data:')) return url;
  if (url.startsWith('/api/')) {
    return `${envConfig.apiBaseUrl.replace(/\/api\/?$/, '')}${url}`;
  }
  if (url.startsWith('/')) return `${window.location.origin}${url}`;
  return url;
}

export function getFileNameFromUrl(url?: string | null) {
  if (!url) return '';
  const clean = url.split('?')[0].split('#')[0];
  const last = clean.split('/').pop() || clean;
  try {
    return decodeURIComponent(last);
  } catch {
    return last;
  }
}

export function isPreviewableFile(url?: string | null, contentType?: string | null) {
  const lower = (url || '').toLowerCase();
  return Boolean(
    contentType?.startsWith('image/')
      || contentType === 'application/pdf'
      || lower.endsWith('.pdf')
      || lower.endsWith('.png')
      || lower.endsWith('.jpg')
      || lower.endsWith('.jpeg')
      || lower.endsWith('.webp')
      || lower.endsWith('.txt')
  );
}

export async function uploadFile(file: File): Promise<UploadedFileInfo> {
  const formData = new FormData();
  formData.append('file', file);
  const response = await apiClient.post<UploadedFileInfo>('/files/upload', formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
    timeout: 60000,
  });
  return response.data;
}
