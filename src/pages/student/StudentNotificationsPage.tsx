import { useCallback, useEffect, useState } from 'react';
import { apiClient } from '@/api/common';
import { useAuth } from '@/hooks';
import { StudentSidebar } from '@/components/layouts/StudentSidebar';
import { StudentHeader } from '@/components/layouts/StudentHeader';
import {
  Award,
  Bell,
  BookOpen,
  Calendar,
  CheckCircle,
  ClipboardList,
  DollarSign,
  FileText,
  GraduationCap,
  Info,
  Users,
  X,
} from 'lucide-react';

type LoaiThongBaoEnum =
  | 'THONG_BAO_CHUNG'
  | 'THONG_BAO_SINH_VIEN'
  | 'THONG_BAO_GIANG_VIEN'
  | 'THONG_BAO_KHOA'
  | 'THONG_BAO_DAO_TAO'
  | 'THONG_BAO_HOC_PHI'
  | 'THONG_BAO_TUYEN_SINH'
  | 'THONG_BAO_SU_KIEN'
  | 'THONG_BAO_KHAC';

interface ThongBaoItem {
  id: string;
  tieuDe: string;
  noiDung: string;
  fileThongBao: string | null;
  loaiThongBao: LoaiThongBaoEnum;
  createdAt: string; // "dd/MM/yyyy HH:mm:ss"
  thongBaoNguoiDungId: string;
  daNhan: boolean;
}

function parseCreatedAt(createdAt: string): Date {
  const [datePart, timePart] = createdAt.split(' ');
  const [dd, MM, yyyy] = datePart.split('/');
  const [HH, mm, ss] = timePart.split(':');
  return new Date(+yyyy, +MM - 1, +dd, +HH, +mm, +ss);
}

function getTimeAgo(createdAt: string): string {
  const date = parseCreatedAt(createdAt);
  const seconds = Math.floor((Date.now() - date.getTime()) / 1000);
  if (seconds < 60) return 'Vừa xong';
  if (seconds < 3600) return `${Math.floor(seconds / 60)} phút trước`;
  if (seconds < 86400) return `${Math.floor(seconds / 3600)} giờ trước`;
  if (seconds < 172800) return 'Hôm qua';
  if (seconds < 604800) return `${Math.floor(seconds / 86400)} ngày trước`;
  return date.toLocaleDateString('vi-VN');
}

function getIcon(loaiThongBao: LoaiThongBaoEnum) {
  const cls = 'w-5 h-5';
  switch (loaiThongBao) {
    case 'THONG_BAO_CHUNG': return <Bell className={cls} />;
    case 'THONG_BAO_SINH_VIEN': return <GraduationCap className={cls} />;
    case 'THONG_BAO_GIANG_VIEN': return <Users className={cls} />;
    case 'THONG_BAO_KHOA': return <BookOpen className={cls} />;
    case 'THONG_BAO_DAO_TAO': return <ClipboardList className={cls} />;
    case 'THONG_BAO_HOC_PHI': return <DollarSign className={cls} />;
    case 'THONG_BAO_TUYEN_SINH': return <Award className={cls} />;
    case 'THONG_BAO_SU_KIEN': return <Calendar className={cls} />;
    case 'THONG_BAO_KHAC': return <Info className={cls} />;
  }
}

function getIconColor(loaiThongBao: LoaiThongBaoEnum): string {
  switch (loaiThongBao) {
    case 'THONG_BAO_CHUNG': return 'bg-blue-100 text-blue-600';
    case 'THONG_BAO_SINH_VIEN': return 'bg-purple-100 text-purple-600';
    case 'THONG_BAO_GIANG_VIEN': return 'bg-indigo-100 text-indigo-600';
    case 'THONG_BAO_KHOA': return 'bg-teal-100 text-teal-600';
    case 'THONG_BAO_DAO_TAO': return 'bg-sky-100 text-sky-600';
    case 'THONG_BAO_HOC_PHI': return 'bg-green-100 text-green-600';
    case 'THONG_BAO_TUYEN_SINH': return 'bg-orange-100 text-orange-600';
    case 'THONG_BAO_SU_KIEN': return 'bg-pink-100 text-pink-600';
    case 'THONG_BAO_KHAC': return 'bg-gray-100 text-gray-600';
  }
}

function getLoaiThongBaoLabel(loaiThongBao: LoaiThongBaoEnum): string {
  switch (loaiThongBao) {
    case 'THONG_BAO_CHUNG': return 'Chung';
    case 'THONG_BAO_SINH_VIEN': return 'Sinh viên';
    case 'THONG_BAO_GIANG_VIEN': return 'Giảng viên';
    case 'THONG_BAO_KHOA': return 'Khoa';
    case 'THONG_BAO_DAO_TAO': return 'Đào tạo';
    case 'THONG_BAO_HOC_PHI': return 'Học phí';
    case 'THONG_BAO_TUYEN_SINH': return 'Tuyển sinh';
    case 'THONG_BAO_SU_KIEN': return 'Sự kiện';
    case 'THONG_BAO_KHAC': return 'Khác';
  }
}

export function NotificationsPage() {
  const { user: authUser } = useAuth();
  const userName = authUser?.fullName || authUser?.username || '';
  const [notifications, setNotifications] = useState<ThongBaoItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filter, setFilter] = useState<'all' | 'unread'>('all');
  const [selected, setSelected] = useState<ThongBaoItem | null>(null);
  const [markingAll, setMarkingAll] = useState(false);

  const fetchThongBao = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const res = await apiClient.get<ThongBaoItem[]>('/student/thongbao');
      setNotifications(res.data);
    } catch {
      setError('Không thể tải danh sách thông báo');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchThongBao();
  }, [fetchThongBao]);

  const handleNotificationClick = async (item: ThongBaoItem) => {
    setSelected(item);
    if (!item.daNhan) {
      try {
        await apiClient.patch('/student/thongbao/da-doc', {
          thongBaoNguoiDungId: item.thongBaoNguoiDungId,
        });
        setNotifications(prev =>
          prev.map(n =>
            n.thongBaoNguoiDungId === item.thongBaoNguoiDungId ? { ...n, daNhan: true } : n,
          ),
        );
        setSelected(prev =>
          prev?.thongBaoNguoiDungId === item.thongBaoNguoiDungId ? { ...prev, daNhan: true } : prev,
        );
      } catch {
        // read status failure is non-critical, don't show error
      }
    }
  };

  const handleMarkAllAsRead = async () => {
    if (markingAll) return;
    setMarkingAll(true);
    try {
      await apiClient.patch('/student/thongbao/da-doc/tat-ca');
      setNotifications(prev => prev.map(n => ({ ...n, daNhan: true })));
    } catch {
      // silent
    } finally {
      setMarkingAll(false);
    }
  };

  const filtered = notifications.filter(n => (filter === 'unread' ? !n.daNhan : true));
  const unreadCount = notifications.filter(n => !n.daNhan).length;

  return (
    <div className="flex h-screen bg-gray-50">
      <StudentSidebar />

      <div className="flex-1 ml-64 flex flex-col">
        <StudentHeader userName={userName} title="Thông báo" />

        <div className="flex-1 overflow-auto p-6">
          <div className="max-w-5xl mx-auto">
            {/* Header card */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-6">
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 bg-gradient-to-br from-blue-600 to-indigo-600 rounded-xl flex items-center justify-center">
                    <Bell className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <h1 className="text-2xl font-bold text-gray-900">Thông báo</h1>
                    <p className="text-sm text-gray-600">
                      {unreadCount > 0
                        ? `${unreadCount} thông báo chưa đọc`
                        : 'Không có thông báo mới'}
                    </p>
                  </div>
                </div>
                {unreadCount > 0 && (
                  <button
                    onClick={handleMarkAllAsRead}
                    disabled={markingAll}
                    className="flex items-center gap-2 px-4 py-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors disabled:opacity-50"
                  >
                    <CheckCircle className="w-4 h-4" />
                    Đánh dấu tất cả đã đọc
                  </button>
                )}
              </div>

              <div className="flex gap-2">
                <button
                  onClick={() => setFilter('all')}
                  className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                    filter === 'all'
                      ? 'bg-blue-600 text-white'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  Tất cả ({notifications.length})
                </button>
                <button
                  onClick={() => setFilter('unread')}
                  className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                    filter === 'unread'
                      ? 'bg-blue-600 text-white'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  Chưa đọc ({unreadCount})
                </button>
              </div>
            </div>

            {/* List */}
            {loading ? (
              <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-12 text-center">
                <p className="text-gray-500">Đang tải thông báo...</p>
              </div>
            ) : error ? (
              <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-12 text-center">
                <p className="text-red-500 mb-3">{error}</p>
                <button
                  onClick={fetchThongBao}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                >
                  Thử lại
                </button>
              </div>
            ) : filtered.length === 0 ? (
              <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-12 text-center">
                <Bell className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                <p className="text-gray-500 text-lg">Không có thông báo nào</p>
              </div>
            ) : (
              <div className="space-y-3">
                {filtered.map(item => (
                  <div
                    key={item.thongBaoNguoiDungId}
                    onClick={() => handleNotificationClick(item)}
                    className={`bg-white rounded-xl shadow-sm border border-gray-200 p-5 cursor-pointer transition-all hover:shadow-md hover:border-blue-300 ${
                      !item.daNhan ? 'border-l-4 border-l-blue-600 bg-blue-50' : ''
                    }`}
                  >
                    <div className="flex gap-4">
                      <div
                        className={`w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0 ${getIconColor(item.loaiThongBao)}`}
                      >
                        {getIcon(item.loaiThongBao)}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between gap-3 mb-1">
                          <h3 className={`text-gray-900 ${!item.daNhan ? 'font-bold' : 'font-semibold'}`}>
                            {item.tieuDe}
                          </h3>
                          {!item.daNhan && (
                            <div className="w-2.5 h-2.5 bg-blue-600 rounded-full flex-shrink-0 mt-1" />
                          )}
                        </div>
                        <p className="text-gray-600 text-sm mb-2 line-clamp-2">{item.noiDung}</p>
                        <div className="flex items-center gap-3 text-xs">
                          <span className={`px-2 py-1 rounded-full ${getIconColor(item.loaiThongBao)}`}>
                            {getLoaiThongBaoLabel(item.loaiThongBao)}
                          </span>
                          <span className="text-gray-500">{getTimeAgo(item.createdAt)}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Detail Modal */}
      {selected && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full max-h-[80vh] overflow-hidden">
            <div className={`p-6 border-b border-gray-200 ${getIconColor(selected.loaiThongBao)}`}>
              <div className="flex items-start justify-between gap-4">
                <div className="flex items-start gap-3 flex-1">
                  <div className="w-10 h-10 bg-white rounded-lg flex items-center justify-center shadow-sm">
                    {getIcon(selected.loaiThongBao)}
                  </div>
                  <div className="flex-1">
                    <h2 className="text-xl font-bold text-gray-900 mb-1">{selected.tieuDe}</h2>
                    <div className="flex items-center gap-2 text-sm">
                      <span className="px-2 py-1 bg-white rounded-full font-medium">
                        {getLoaiThongBaoLabel(selected.loaiThongBao)}
                      </span>
                      <span className="text-gray-600">{getTimeAgo(selected.createdAt)}</span>
                    </div>
                  </div>
                </div>
                <button
                  onClick={() => setSelected(null)}
                  className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-white/50 transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            <div className="p-6 overflow-y-auto" style={{ maxHeight: 'calc(80vh - 200px)' }}>
              <p className="text-gray-700 leading-relaxed whitespace-pre-line">{selected.noiDung}</p>
              {selected.fileThongBao && (
                <a
                  href={selected.fileThongBao}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="mt-4 flex items-center gap-2 text-blue-600 hover:underline"
                >
                  <FileText className="w-4 h-4" />
                  Xem tệp đính kèm
                </a>
              )}
            </div>

            <div className="p-6 border-t border-gray-200 flex justify-end">
              <button
                onClick={() => setSelected(null)}
                className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                Đóng
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
