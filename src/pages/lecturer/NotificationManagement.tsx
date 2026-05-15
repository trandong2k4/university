import { InstructorSidebar } from '@/components/layouts/InstructorSidebar';
import { InstructorHeader } from '@/components/layouts/InstructorHeader';
import {
  ChevronDown, Send, Bell, Users, Clock, CheckCircle, X,
  Trash2, Eye, ChevronLeft, ChevronRight, CheckCheck
} from 'lucide-react';
import { useEffect, useState } from 'react';
import { useAuth } from '@/hooks';
import AiAssistantButton from '@/imports/AiAssistantButton';
import lecturerApi, {
  LecturerClassSummaryResponseDTO, NotificationDetailResponseDTO
} from '@/api/lecturer/lecturer.api';

const PAGE_SIZE = 10;

export default function NotificationManagement() {
  const { user } = useAuth();
  const [classes, setClasses] = useState<LecturerClassSummaryResponseDTO[]>([]);
  const [selectedClassId, setSelectedClassId] = useState('');
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [sending, setSending] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');

  const [notifications, setNotifications] = useState<NotificationDetailResponseDTO[]>([]);
  const [loadingHistory, setLoadingHistory] = useState(false);

  const [selectedNotification, setSelectedNotification] = useState<NotificationDetailResponseDTO | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  useEffect(() => {
    if (!user?.id) return;
    lecturerApi.getClasses(user.id).then((data) => {
      setClasses(data);
      if (data.length > 0) setSelectedClassId(data[0].lopHocPhanId);
    }).catch(console.error);
    loadNotifications();
  }, [user?.id]);

  const loadNotifications = () => {
    if (!user?.id) return;
    setLoadingHistory(true);
    lecturerApi.getMyNotifications(user.id)
      .then((data) => setNotifications(data))
      .catch(console.error)
      .finally(() => setLoadingHistory(false));
  };

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !content.trim() || !selectedClassId || !user?.id) return;
    setSending(true);
    try {
      await lecturerApi.sendNotification(user.id, {
        lopHocPhanId: selectedClassId,
        tieuDe: title.trim(),
        noiDung: content.trim(),
      });
      setTitle('');
      setContent('');
      setSuccessMessage('Gửi thông báo thành công');
      setTimeout(() => setSuccessMessage(''), 4000);
      loadNotifications();
    } catch (err) {
      console.error(err);
    } finally {
      setSending(false);
    }
  };

  const handleDelete = async (notificationId: string) => {
    if (!user?.id || !confirm('Bạn có chắc muốn xóa thông báo này?')) return;
    setDeletingId(notificationId);
    try {
      await lecturerApi.deleteNotification(notificationId, user.id);
      setNotifications(prev => prev.filter(n => n.id !== notificationId));
      setSelectedNotification(null);
    } catch (err) {
      console.error(err);
    } finally {
      setDeletingId(null);
    }
  };

  const timeAgo = (iso: string) => {
    const diff = Date.now() - new Date(iso).getTime();
    const m = Math.floor(diff / 60000);
    if (m < 1) return 'Vừa xong';
    if (m < 60) return `${m} phút trước`;
    const h = Math.floor(m / 60);
    if (h < 24) return `${h} giờ trước`;
    return `${Math.floor(h / 24)} ngày trước`;
  };

  const formatDate = (iso: string) => {
    return new Date(iso).toLocaleString('vi-VN', {
      day: '2-digit', month: '2-digit', year: 'numeric',
      hour: '2-digit', minute: '2-digit'
    });
  };

  const selectedClass = classes.find(c => c.lopHocPhanId === selectedClassId);

  const totalPages = Math.ceil(notifications.length / PAGE_SIZE);
  const paginatedNotifications = notifications.slice(
    (currentPage - 1) * PAGE_SIZE,
    currentPage * PAGE_SIZE
  );

  return (
    <div className="flex h-screen bg-gray-50">
      <InstructorSidebar />

      <div className="flex-1 ml-64 flex flex-col">
        <InstructorHeader title="Thông báo lớp học phần" />

        <div className="flex-1 overflow-auto p-6">
          {successMessage && (
            <div className="max-w-4xl mx-auto mb-4">
              <div className="bg-green-50 border border-green-200 rounded-lg p-4 flex items-center gap-3 animate-fade-in">
                <CheckCircle className="w-5 h-5 text-green-600 shrink-0" />
                <p className="text-green-700 font-medium">{successMessage}</p>
              </div>
            </div>
          )}

          <div className="max-w-4xl mx-auto space-y-6">

            <div>
              <h2 className="text-2xl font-bold text-gray-900">Gửi thông báo</h2>
              <p className="text-gray-600 mt-1">Gửi thông báo đến sinh viên lớp học phần phụ trách</p>
            </div>

            {/* Compose form */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
              <div className="p-6 border-b border-gray-200 bg-gradient-to-r from-blue-600 to-indigo-600">
                <h3 className="font-semibold text-white text-lg flex items-center gap-2">
                  <Send className="w-5 h-5" />
                  Soạn thông báo mới
                </h3>
              </div>

              <form onSubmit={handleSend} className="p-6 space-y-5">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Gửi đến lớp học phần <span className="text-red-500">*</span>
                  </label>
                  <div className="relative">
                    <select
                      value={selectedClassId}
                      onChange={(e) => setSelectedClassId(e.target.value)}
                      className="w-full px-4 py-3 pr-10 border border-gray-300 rounded-lg appearance-none focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
                      required
                    >
                      {classes.length === 0 && <option value="">Chưa có lớp học phần</option>}
                      {classes.map(c => (
                        <option key={c.lopHocPhanId} value={c.lopHocPhanId}>
                          {c.maLopHocPhan} – {c.tenMonHoc}
                        </option>
                      ))}
                    </select>
                    <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 pointer-events-none" />
                  </div>
                  {selectedClass && (
                    <p className="text-xs text-gray-500 mt-1 flex items-center gap-1">
                      <Users className="w-3 h-3" />
                      {selectedClass.phong} – {selectedClass.toaNha}
                    </p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Tiêu đề <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    placeholder="VD: Thông báo thay đổi lịch học..."
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Nội dung <span className="text-red-500">*</span>
                  </label>
                  <textarea
                    value={content}
                    onChange={(e) => setContent(e.target.value)}
                    placeholder="Nhập nội dung thông báo..."
                    rows={5}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
                    required
                  />
                  <p className="text-xs text-gray-400 mt-1">{content.length} ký tự</p>
                </div>

                <div className="flex gap-3 pt-2 border-t border-gray-100">
                  <button
                    type="submit"
                    disabled={sending || !selectedClassId}
                    className="flex-1 inline-flex items-center justify-center gap-2 bg-blue-600 text-white py-3 px-6 rounded-lg hover:bg-blue-700 transition-colors font-medium disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <Send className="w-5 h-5" />
                    {sending ? 'Đang gửi...' : 'Gửi thông báo'}
                  </button>
                  <button
                    type="button"
                    onClick={() => { setTitle(''); setContent(''); }}
                    className="px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>
              </form>
            </div>

            {/* Notification History */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
              <div className="p-6 border-b border-gray-200 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Clock className="w-5 h-5 text-gray-400" />
                  <h3 className="font-semibold text-gray-900">
                    Lịch sử thông báo ({notifications.length})
                  </h3>
                </div>
                <button
                  onClick={loadNotifications}
                  disabled={loadingHistory}
                  className="text-sm text-blue-600 hover:text-blue-700 font-medium disabled:opacity-50"
                >
                  {loadingHistory ? 'Đang tải...' : 'Làm mới'}
                </button>
              </div>

              {loadingHistory && notifications.length === 0 ? (
                <div className="p-12 text-center">
                  <div className="animate-spin w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full mx-auto mb-3" />
                  <p className="text-gray-500">Đang tải lịch sử thông báo...</p>
                </div>
              ) : notifications.length === 0 ? (
                <div className="p-12 text-center">
                  <Bell className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                  <p className="text-gray-500">Chưa có thông báo nào được gửi</p>
                </div>
              ) : (
                <>
                  <div className="divide-y divide-gray-100">
                    {paginatedNotifications.map((n) => (
                      <div key={n.id} className="p-5 flex items-start gap-4 hover:bg-gray-50 transition-colors">
                        <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center shrink-0">
                          <Bell className="w-5 h-5 text-blue-600" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-start justify-between gap-2">
                            <div className="flex-1 min-w-0">
                              <p className="font-semibold text-gray-900 truncate">{n.tieuDe}</p>
                              <p className="text-sm text-gray-600 mt-1 line-clamp-2">{n.noiDung}</p>
                            </div>
                            <div className="flex items-center gap-1 shrink-0">
                              <button
                                onClick={() => setSelectedNotification(n)}
                                className="p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                                title="Xem chi tiết"
                              >
                                <Eye className="w-4 h-4" />
                              </button>
                              <button
                                onClick={() => handleDelete(n.id)}
                                disabled={deletingId === n.id}
                                className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors disabled:opacity-50"
                                title="Xóa thông báo"
                              >
                                <Trash2 className="w-4 h-4" />
                              </button>
                            </div>
                          </div>
                          <div className="flex items-center gap-4 mt-2 flex-wrap">
                            <span className="text-xs text-gray-400 flex items-center gap-1">
                              <Clock className="w-3 h-3" />
                              {timeAgo(n.createdAt)}
                            </span>
                            <span className="text-xs text-gray-400 flex items-center gap-1">
                              <Users className="w-3 h-3" />
                              {n.tongNguoiNhan} sinh viên
                            </span>
                            <span className="text-xs text-green-600 flex items-center gap-1">
                              <CheckCheck className="w-3 h-3" />
                              {n.nguoiDaNhan}/{n.tongNguoiNhan} đã đọc
                            </span>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>

                  {totalPages > 1 && (
                    <div className="p-4 border-t border-gray-100 flex items-center justify-between">
                      <p className="text-sm text-gray-500">
                        Hiển thị {(currentPage - 1) * PAGE_SIZE + 1}–{Math.min(currentPage * PAGE_SIZE, notifications.length)} của {notifications.length}
                      </p>
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                          disabled={currentPage === 1}
                          className="p-2 border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                          <ChevronLeft className="w-4 h-4" />
                        </button>
                        {Array.from({ length: totalPages }, (_, i) => i + 1).map(page => (
                          <button
                            key={page}
                            onClick={() => setCurrentPage(page)}
                            className={`w-9 h-9 text-sm rounded-lg transition-colors ${
                              currentPage === page
                                ? 'bg-blue-600 text-white'
                                : 'border border-gray-300 text-gray-700 hover:bg-gray-50'
                            }`}
                          >
                            {page}
                          </button>
                        ))}
                        <button
                          onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                          disabled={currentPage === totalPages}
                          className="p-2 border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                          <ChevronRight className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  )}
                </>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Detail Modal */}
      {selectedNotification && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-lg overflow-hidden">
            <div className="p-6 border-b border-gray-200 bg-gradient-to-r from-blue-600 to-indigo-600 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-white/20 rounded-lg flex items-center justify-center">
                  <Bell className="w-5 h-5 text-white" />
                </div>
                <h3 className="font-semibold text-white text-lg">Chi tiết thông báo</h3>
              </div>
              <button
                onClick={() => setSelectedNotification(null)}
                className="p-2 hover:bg-white/20 rounded-lg transition-colors"
              >
                <X className="w-5 h-5 text-white" />
              </button>
            </div>
            <div className="p-6 space-y-4">
              <div>
                <p className="text-xs text-gray-500 uppercase tracking-wide mb-1">Tiêu đề</p>
                <p className="font-semibold text-gray-900 text-lg">{selectedNotification.tieuDe}</p>
              </div>
              <div>
                <p className="text-xs text-gray-500 uppercase tracking-wide mb-1">Nội dung</p>
                <p className="text-gray-700 whitespace-pre-wrap leading-relaxed">{selectedNotification.noiDung}</p>
              </div>
              <div className="grid grid-cols-2 gap-4 pt-2">
                <div>
                  <p className="text-xs text-gray-500 uppercase tracking-wide mb-1">Ngày gửi</p>
                  <p className="text-sm text-gray-700">{formatDate(selectedNotification.createdAt)}</p>
                </div>
                <div>
                  <p className="text-xs text-gray-500 uppercase tracking-wide mb-1">Người nhận</p>
                  <p className="text-sm text-gray-700">{selectedNotification.tongNguoiNhan} sinh viên</p>
                </div>
                <div className="col-span-2">
                  <p className="text-xs text-gray-500 uppercase tracking-wide mb-1">Tình trạng đọc</p>
                  <div className="flex items-center gap-2 mt-1">
                    <div className="flex-1 bg-gray-100 rounded-full h-2 overflow-hidden">
                      <div
                        className="h-full bg-green-500 rounded-full transition-all"
                        style={{
                          width: selectedNotification.tongNguoiNhan > 0
                            ? `${(selectedNotification.nguoiDaNhan / selectedNotification.tongNguoiNhan) * 100}%`
                            : '0%'
                        }}
                      />
                    </div>
                    <span className="text-sm font-medium text-gray-700">
                      {selectedNotification.nguoiDaNhan}/{selectedNotification.tongNguoiNhan}
                    </span>
                  </div>
                </div>
              </div>
            </div>
            <div className="p-4 border-t border-gray-200 flex justify-end gap-3">
              <button
                onClick={() => handleDelete(selectedNotification.id)}
                disabled={deletingId === selectedNotification.id}
                className="inline-flex items-center gap-2 px-4 py-2 border border-red-300 text-red-600 rounded-lg hover:bg-red-50 transition-colors font-medium disabled:opacity-50"
              >
                <Trash2 className="w-4 h-4" />
                {deletingId === selectedNotification.id ? 'Đang xóa...' : 'Xóa thông báo'}
              </button>
              <button
                onClick={() => setSelectedNotification(null)}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium"
              >
                Đóng
              </button>
            </div>
          </div>
        </div>
      )}

      <button
        className="fixed bottom-8 right-8 w-16 h-16 hover:scale-110 transition-transform duration-200 z-50"
        aria-label="AI Assistant"
      >
        <AiAssistantButton />
      </button>
    </div>
  );
}
