import { Download, ExternalLink, FileText, X } from 'lucide-react';
import { getFileNameFromUrl, isPreviewableFile, resolveFileUrl } from '@/utils/fileUtils';

interface DocumentViewerModalProps {
  open: boolean;
  title: string;
  url?: string | null;
  onClose: () => void;
}

export function DocumentViewerModal({ open, title, url, onClose }: DocumentViewerModalProps) {
  if (!open || !url) return null;

  const resolvedUrl = resolveFileUrl(url);
  const fileName = getFileNameFromUrl(url);
  const canPreview = isPreviewableFile(url);

  return (
    <div className="fixed inset-0 bg-black/60 z-[80] flex items-center justify-center p-4">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-6xl h-[88vh] flex flex-col overflow-hidden">
        <div className="px-5 py-4 border-b border-slate-200 flex items-center justify-between gap-3">
          <div className="min-w-0">
            <h3 className="text-lg font-bold text-slate-900 truncate">{title}</h3>
            <p className="text-xs text-slate-500 truncate">{fileName || resolvedUrl}</p>
          </div>
          <div className="flex items-center gap-2 shrink-0">
            <a
              href={resolvedUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 px-3 py-2 text-sm font-medium bg-slate-100 text-slate-700 rounded-lg hover:bg-slate-200"
            >
              <ExternalLink className="w-4 h-4" />
              Mở tab mới
            </a>
            <a
              href={resolvedUrl}
              download
              className="inline-flex items-center gap-2 px-3 py-2 text-sm font-medium bg-[#0a2540] text-white rounded-lg hover:bg-[#0d2f52]"
            >
              <Download className="w-4 h-4" />
              Tải xuống
            </a>
            <button
              onClick={onClose}
              className="p-2 text-slate-500 hover:text-slate-900 hover:bg-slate-100 rounded-lg"
              aria-label="Đóng"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        <div className="flex-1 bg-slate-100">
          {canPreview ? (
            <iframe
              src={resolvedUrl}
              title={title}
              className="w-full h-full bg-white"
            />
          ) : (
            <div className="h-full flex items-center justify-center p-8">
              <div className="text-center max-w-md">
                <FileText className="w-16 h-16 text-slate-300 mx-auto mb-4" />
                <p className="font-semibold text-slate-900">Không thể xem trước định dạng này</p>
                <p className="text-sm text-slate-500 mt-2">
                  Dùng nút mở tab mới hoặc tải xuống để xem file bằng ứng dụng phù hợp.
                </p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
