import { useCallback, useEffect, useMemo, useState } from 'react';
import {
  Bell,
  Search,
  Send,
  X,
  CheckCircle,
  AlertCircle,
  Paperclip,
  Plus,
  Eye,
  Trash2,
  Users,
  Calendar,
  BookOpen,
  Award,
  ClipboardList,
  DollarSign,
  GraduationCap,
  Info,
  FileText,
  Loader2,
  RefreshCw,
  ChevronDown,
  Filter,
  Mail,
} from 'lucide-react';
import { AdminSidebar } from '@/components/layouts/AdminSidebar';
import { AdminHeader } from '@/components/layouts/AdminHeader';
import { useAuth } from '@/hooks';
import * as notificationsApi from '@/api/common/notifications.api';
import type {
  ThongBaoAdminResponse,
  ThongBaoNguoiDungAdminResponse,
} from '@/api/common/notifications.api';
import type { UsersItem } from '@/api/common/types';
import { LOAI_THONG_BAO_LABEL, type LoaiThongBaoEnum } from '@/api/common/notifications.api';

type Toast = {
  id: string;
  message: string;
  type: 'success' | 'error';
};

const LOAI_OPTIONS: LoaiThongBaoEnum[] = [
  'THONG_BAO_CHUNG',
  'THONG_BAO_SINH_VIEN',
  'THONG_BAO_GIANG_VIEN',
  'THONG_BAO_KHOA',
  'THONG_BAO_DAO_TAO',
  'THONG_BAO_HOC_PHI',
  'THONG_BAO_TUYEN_SINH',
  'THONG_BAO_SU_KIEN',
  'THONG_BAO_KHAC',
];

const LOAI_ICON: Record<LoaiThongBaoEnum, React.ReactNode> = {
  THONG_BAO_CHUNG: <Bell className="w-4 h-4" />,
  THONG_BAO_SINH_VIEN: <GraduationCap className="w-4 h-4" />,
  THONG_BAO_GIANG_VIEN: <Users className="w-4 h-4" />,
  THONG_BAO_KHOA: <BookOpen className="w-4 h-4" />,
  THONG_BAO_DAO_TAO: <ClipboardList className="w-4 h-4" />,
  THONG_BAO_HOC_PHI: <DollarSign className="w-4 h-4" />,
  THONG_BAO_TUYEN_SINH: <Award className="w-4 h-4" />,
  THONG_BAO_SU_KIEN: <Calendar className="w-4 h-4" />,
  THONG_BAO_KHAC: <Info className="w-4 h-4" />,
};

const LOAI_COLOR: Record<LoaiThongBaoEnum, string> = {
  THONG_BAO_CHUNG: 'bg-blue-100 text-blue-600',
  THONG_BAO_SINH_VIEN: 'bg-purple-100 text-purple-600',
  THONG_BAO_GIANG_VIEN: 'bg-indigo-100 text-indigo-600',
  THONG_BAO_KHOA: 'bg-teal-100 text-teal-600',
  THONG_BAO_DAO_TAO: 'bg-sky-100 text-sky-600',
  THONG_BAO_HOC_PHI: 'bg-green-100 text-green-600',
  THONG_BAO_TUYEN_SINH: 'bg-orange-100 text-orange-600',
  THONG_BAO_SU_KIEN: 'bg-pink-100 text-pink-600',
  THONG_BAO_KHAC: 'bg-gray-100 text-gray-600',
};

const initialForm = {
  tieuDe: '',
  noiDung: '',
  loaiThongBao: 'THONG_BAO_CHUNG' as LoaiThongBaoEnum,
  fileThongBao: '',
};

function formatDate(dateStr: string): string {
  if (!dateStr) return '-';
  try {
    const d = new Date(dateStr);
    return d.toLocaleString('vi-VN', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  } catch {
    return dateStr;
  }
}

export default function AdminNotificationsPage() {
  const { user } = useAuth();
  const [toasts, setToasts] = useState<Toast[]>([]);

  // State: danh sách thông báo đã gửi
  const [notifications, setNotifications] = useState<ThongBaoAdminResponse[]>([]);
  const [loadingNotifications, setLoadingNotifications] = useState(true);

  // State: danh sách người dùng (để chọn người nhận)
  const [users, setUsers] = useState<UsersItem[]>([]);
  const [loadingUsers, setLoadingUsers] = useState(true);

  // State: modal gửi / sửa
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState(initialForm);

  // State: modal xem chi tiết + danh sách người nhận
  const [detailModal, setDetailModal] = useState<ThongBaoAdminResponse | null>(null);
  const [receivers, setReceivers] = useState<ThongBaoNguoiDungAdminResponse[]>([]);
  const [loadingReceivers, setLoadingReceivers] = useState(false);

  // State: tìm kiếm & lọc
  const [search, setSearch] = useState('');
  const [filterLoai, setFilterLoai] = useState<LoaiThongBaoEnum | ''>('');
  const [filterDropdownOpen, setFilterDropdownOpen] = useState(false);

  // State: xóa nhiều
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [isDeleting, setIsDeleting] = useState(false);

  // Toast helper
  const addToast = useCallback((message: string, type: 'success' | 'error') => {
    const id = Date.now().toString();
    setToasts(prev => [...prev, { id, message, type }]);
    setTimeout(() => setToasts(prev => prev.filter(t => t.id !== id)), 3500);
  }, []);

  // Fetch danh sách thông báo đã gửi
  const fetchNotifications = useCallback(async () => {
    setLoadingNotifications(true);
    try {
      const raw = await notificationsApi.getAllThongBao();
      setNotifications(Array.isArray(raw) ? raw : []);
    } catch {
      addToast('Không thể tải danh sách thông báo', 'error');
      setNotifications([]);
    } finally {
      setLoadingNotifications(false);
    }
  }, [addToast]);

  // Fetch danh sách người dùng
  const fetchUsers = useCallback(async () => {
    setLoadingUsers(true);
    try {
      const { getUsers } = await import('@/api/admin/users.api');
      const data = await getUsers();
      setUsers(data);
    } catch {
      addToast('Không thể tải danh sách người dùng', 'error');
    } finally {
      setLoadingUsers(false);
    }
  }, [addToast]);

  useEffect(() => {
    void fetchNotifications();
    void fetchUsers();
  }, [fetchNotifications, fetchUsers]);

  // Lọc thông báo
  const filteredNotifications = useMemo(() => {
    const kw = search.trim().toLowerCase();
    return notifications.filter(n => {
      const matchSearch =
        !kw ||
        n.tieuDe.toLowerCase().includes(kw) ||
        n.noiDung.toLowerCase().includes(kw);
      const matchLoai = !filterLoai || n.loaiThongBao === filterLoai;
      return matchSearch && matchLoai;
    });
  }, [notifications, search, filterLoai]);

  // Thống kê
  const stats = useMemo(() => ({
    total: notifications.length,
    tongNguoiNhan: notifications.reduce((s, n) => s + (n.soNguoiNhan || 0), 0),
    tongDaDoc: notifications.reduce((s, n) => s + (n.soNguoiDaNhan || 0), 0),
  }), [notifications]);

  // Mở modal tạo mới
  const openCreateModal = () => {
    setForm(initialForm);
    setIsEditing(false);
    setEditingId(null);
    setIsModalOpen(true);
  };

  // Mở modal sửa
  const openEditModal = (item: ThongBaoAdminResponse) => {
    setForm({
      tieuDe: item.tieuDe,
      noiDung: item.noiDung,
      loaiThongBao: item.loaiThongBao,
      fileThongBao: item.fileThongBao || '',
    });
    setIsEditing(true);
    setEditingId(item.id);
    setIsModalOpen(true);
  };

  // Xem chi tiết thông báo + người nhận
  const openDetail = async (item: ThongBaoAdminResponse) => {
    setDetailModal(item);
    setLoadingReceivers(true);
    try {
      const data = await notificationsApi.getThongBaoNguoiDungByThongBao(item.id);
      setReceivers(data);
    } catch {
      setReceivers([]);
    } finally {
      setLoadingReceivers(false);
    }
  };

  // Gửi / cập nhật thông báo
  const handleSubmit = async () => {
    const tieuDe = form.tieuDe.trim();
    const noiDung = form.noiDung.trim();

    if (!tieuDe) { addToast('Vui lòng nhập tiêu đề', 'error'); return; }
    if (!noiDung) { addToast('Vui lòng nhập nội dung', 'error'); return; }
    if (!user?.id) { addToast('Không xác định được người gửi', 'error'); return; }

    const userIds = users.map(u => u.id);
    if (userIds.length === 0) { addToast('Không có người dùng để gửi', 'error'); return; }

    const payload = {
      tieuDe,
      noiDung,
      loaiThongBao: form.loaiThongBao,
      fileThongBao: form.fileThongBao.trim() || undefined,
      usersId: user.id,
      userIds,
    };

    try {
      if (isEditing && editingId) {
        await notificationsApi.updateThongBao(editingId, payload);
        addToast('Cập nhật thông báo thành công', 'success');
      } else {
        await notificationsApi.sendThongBao(payload);
        addToast('Gửi thông báo thành công', 'success');
      }
      setIsModalOpen(false);
      await fetchNotifications();
    } catch (err: any) {
      addToast(err?.response?.data?.message || 'Thao tác thất bại', 'error');
    }
  };

  // Xóa một thông báo
  const handleDelete = async (id: string) => {
    if (!confirm('Bạn có chắc muốn xóa thông báo này?')) return;
    try {
      await notificationsApi.deleteThongBao(id);
      addToast('Xóa thông báo thành công', 'success');
      setNotifications(prev => prev.filter(n => n.id !== id));
    } catch {
      addToast('Xóa thất bại', 'error');
    }
  };

  // Xóa nhiều
  const handleBulkDelete = async () => {
    if (selectedIds.size === 0) return;
    if (!confirm(`Xóa ${selectedIds.size} thông báo đã chọn?`)) return;
    setIsDeleting(true);
    try {
      await notificationsApi.deleteThongBaoList(Array.from(selectedIds));
      addToast(`Đã xóa ${selectedIds.size} thông báo`, 'success');
      setNotifications(prev => prev.filter(n => !selectedIds.has(n.id)));
      setSelectedIds(new Set());
    } catch {
      addToast('Xóa nhiều thất bại', 'error');
    } finally {
      setIsDeleting(false);
    }
  };

  // Toggle checkbox
  const toggleSelect = (id: string) => {
    setSelectedIds(prev => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const selectAll = filteredNotifications.length > 0 &&
    filteredNotifications.every(n => selectedIds.has(n.id));

  const toggleSelectAll = () => {
    if (selectAll) setSelectedIds(new Set());
    else setSelectedIds(new Set(filteredNotifications.map(n => n.id)));
  };

  return (
    <div className="flex min-h-screen bg-gray-100">
      <AdminSidebar activeMenu="notifications" />

      <div className="ml-64 flex flex-1 flex-col">
        <AdminHeader title="Quản lý thông báo hệ thống" />

        <main className="flex-1 p-6">
          <div className="mx-auto max-w-7xl space-y-6">

            {/* Thống kê */}
            <div className="grid grid-cols-1 gap-4 md:grid-cols-4">
              <div className="rounded-xl border border-blue-200 bg-gradient-to-br from-blue-50 to-white p-5 shadow-sm">
                <div className="flex items-center gap-3">
                  <div className="rounded-xl bg-blue-100 p-3">
                    <Bell className="h-6 w-6 text-blue-600" />
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Tổng thông báo</p>
                    <p className="text-2xl font-bold text-gray-900">{stats.total}</p>
                  </div>
                </div>
              </div>

              <div className="rounded-xl border border-purple-200 bg-gradient-to-br from-purple-50 to-white p-5 shadow-sm">
                <div className="flex items-center gap-3">
                  <div className="rounded-xl bg-purple-100 p-3">
                    <Users className="h-6 w-6 text-purple-600" />
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Tổng người nhận</p>
                    <p className="text-2xl font-bold text-gray-900">{stats.tongNguoiNhan}</p>
                  </div>
                </div>
              </div>

              <div className="rounded-xl border border-green-200 bg-gradient-to-br from-green-50 to-white p-5 shadow-sm">
                <div className="flex items-center gap-3">
                  <div className="rounded-xl bg-green-100 p-3">
                    <CheckCircle className="h-6 w-6 text-green-600" />
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Tổng đã đọc</p>
                    <p className="text-2xl font-bold text-gray-900">{stats.tongDaDoc}</p>
                  </div>
                </div>
              </div>

              <div className="rounded-xl border border-orange-200 bg-gradient-to-br from-orange-50 to-white p-5 shadow-sm">
                <div className="flex items-center gap-3">
                  <div className="rounded-xl bg-orange-100 p-3">
                    <Mail className="h-6 w-6 text-orange-600" />
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Người dùng</p>
                    <p className="text-2xl font-bold text-gray-900">{users.length}</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Thanh công cụ */}
            <div className="rounded-xl border bg-white p-4 shadow-sm">
              <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
                {/* Tìm kiếm */}
                <div className="relative flex-1 max-w-md">
                  <Search className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-gray-400" />
                  <input
                    value={search}
                    onChange={e => setSearch(e.target.value)}
                    placeholder="Tìm tiêu đề hoặc nội dung..."
                    className="w-full rounded-lg border border-gray-300 py-2 pl-10 pr-3 text-sm outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                  />
                </div>

                <div className="flex flex-wrap items-center gap-2">
                  {/* Lọc loại */}
                  <div className="relative">
                    <button
                      onClick={() => setFilterDropdownOpen(!filterDropdownOpen)}
                      className={`inline-flex items-center gap-1.5 rounded-lg border px-3 py-2 text-sm font-medium transition-colors ${
                        filterLoai
                          ? 'border-blue-500 bg-blue-50 text-blue-700'
                          : 'border-gray-300 text-gray-700 hover:bg-gray-50'
                      }`}
                    >
                      <Filter className="h-4 w-4" />
                      {filterLoai ? LOAI_THONG_BAO_LABEL[filterLoai] : 'Lọc loại'}
                      <ChevronDown className={`h-4 w-4 transition-transform ${filterDropdownOpen ? 'rotate-180' : ''}`} />
                    </button>
                    {filterDropdownOpen && (
                      <div className="absolute right-0 top-full mt-1 w-56 rounded-lg border border-gray-200 bg-white shadow-lg z-20 max-h-72 overflow-y-auto">
                        <button
                          onClick={() => { setFilterLoai(''); setFilterDropdownOpen(false); }}
                          className="w-full px-4 py-2 text-left text-sm hover:bg-gray-50"
                        >
                          Tất cả loại
                        </button>
                        {LOAI_OPTIONS.map(opt => (
                          <button
                            key={opt}
                            onClick={() => { setFilterLoai(opt); setFilterDropdownOpen(false); }}
                            className={`w-full flex items-center gap-2 px-4 py-2 text-left text-sm hover:bg-gray-50 ${filterLoai === opt ? 'bg-blue-50 text-blue-700' : ''}`}
                          >
                            <span className={`w-5 h-5 rounded flex items-center justify-center ${LOAI_COLOR[opt]}`}>
                              {LOAI_ICON[opt]}
                            </span>
                            {LOAI_THONG_BAO_LABEL[opt]}
                          </button>
                        ))}
                      </div>
                    )}
                  </div>

                  {/* Refresh */}
                  <button
                    onClick={() => { void fetchNotifications(); }}
                    className="inline-flex items-center gap-1.5 rounded-lg border border-gray-300 px-3 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors"
                  >
                    <RefreshCw className={`h-4 w-4 ${loadingNotifications ? 'animate-spin' : ''}`} />
                    Làm mới
                  </button>

                  {/* Tạo mới */}
                  <button
                    onClick={openCreateModal}
                    disabled={loadingUsers}
                    className="inline-flex items-center gap-1.5 rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700 disabled:opacity-60 transition-colors"
                  >
                    <Plus className="h-4 w-4" />
                    Tạo & gửi thông báo
                  </button>
                </div>
              </div>
            </div>

            {/* Bảng danh sách thông báo */}
            <div className="rounded-xl border bg-white shadow-sm overflow-hidden">
              {/* Header actions */}
              {selectedIds.size > 0 && (
                <div className="flex items-center gap-3 border-b bg-red-50 px-5 py-3">
                  <span className="text-sm font-medium text-red-700">
                    {selectedIds.size} thông báo đã chọn
                  </span>
                  <button
                    onClick={() => void handleBulkDelete()}
                    disabled={isDeleting}
                    className="inline-flex items-center gap-1.5 rounded-lg bg-red-600 px-3 py-1.5 text-sm font-medium text-white hover:bg-red-700 disabled:opacity-60 transition-colors"
                  >
                    {isDeleting ? <Loader2 className="h-4 w-4 animate-spin" /> : <Trash2 className="h-4 w-4" />}
                    Xóa đã chọn
                  </button>
                  <button
                    onClick={() => setSelectedIds(new Set())}
                    className="text-sm text-gray-500 hover:text-gray-700"
                  >
                    Bỏ chọn
                  </button>
                </div>
              )}

              {/* Table header */}
              <div className="grid grid-cols-12 border-b bg-gray-50 px-5 py-3 text-xs font-semibold text-gray-600 uppercase tracking-wide">
                <div className="col-span-1 flex items-center">
                  <input
                    type="checkbox"
                    checked={selectAll}
                    onChange={toggleSelectAll}
                    className="h-4 w-4 rounded border-gray-400"
                  />
                </div>
                <div className="col-span-3">Tiêu đề</div>
                <div className="col-span-2">Loại</div>
                <div className="col-span-2">Người gửi</div>
                <div className="col-span-2">Người nhận</div>
                <div className="col-span-1">Đã đọc</div>
                <div className="col-span-1">Thao tác</div>
              </div>

              {/* Table body */}
              {loadingNotifications ? (
                <div className="flex h-48 items-center justify-center">
                  <Loader2 className="h-8 w-8 animate-spin text-blue-500" />
                </div>
              ) : filteredNotifications.length === 0 ? (
                <div className="flex h-48 flex-col items-center justify-center gap-3">
                  <Bell className="h-12 w-12 text-gray-300" />
                  <p className="text-gray-500">
                    {search || filterLoai ? 'Không tìm thấy thông báo phù hợp' : 'Chưa có thông báo nào'}
                  </p>
                </div>
              ) : (
                <div className="divide-y">
                  {filteredNotifications.map(item => {
                    const readRate = item.soNguoiNhan > 0
                      ? Math.round((item.soNguoiDaNhan / item.soNguoiNhan) * 100)
                      : 0;

                    return (
                      <div
                        key={item.id}
                        className={`grid grid-cols-12 items-center px-5 py-4 hover:bg-gray-50 transition-colors ${
                          selectedIds.has(item.id) ? 'bg-blue-50' : ''
                        }`}
                      >
                        {/* Checkbox */}
                        <div className="col-span-1">
                          <input
                            type="checkbox"
                            checked={selectedIds.has(item.id)}
                            onChange={() => toggleSelect(item.id)}
                            className="h-4 w-4 rounded border-gray-400"
                          />
                        </div>

                        {/* Tiêu đề */}
                        <div className="col-span-3 min-w-0">
                          <p className="truncate font-semibold text-gray-900" title={item.tieuDe}>
                            {item.tieuDe}
                          </p>
                          <p className="mt-0.5 truncate text-xs text-gray-500" title={item.noiDung}>
                            {item.noiDung.length > 60 ? item.noiDung.substring(0, 60) + '…' : item.noiDung}
                          </p>
                          <p className="mt-1 text-xs text-gray-400">
                            {formatDate(item.createdAt)}
                          </p>
                        </div>

                        {/* Loại */}
                        <div className="col-span-2">
                          <span className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-medium ${LOAI_COLOR[item.loaiThongBao]}`}>
                            {LOAI_ICON[item.loaiThongBao]}
                            {LOAI_THONG_BAO_LABEL[item.loaiThongBao]}
                          </span>
                        </div>

                        {/* Người gửi */}
                        <div className="col-span-2">
                          <p className="truncate text-sm font-medium text-gray-800" title={item.hoTen}>
                            {item.hoTen || item.userName}
                          </p>
                        </div>

                        {/* Người nhận */}
                        <div className="col-span-2">
                          <div className="flex items-center gap-1.5">
                            <Users className="h-4 w-4 text-gray-400" />
                            <span className="text-sm text-gray-700">{item.soNguoiNhan}</span>
                          </div>
                          {item.soNguoiNhan > 0 && (
                            <div className="mt-1 flex items-center gap-1.5">
                              <div className="h-1.5 flex-1 overflow-hidden rounded-full bg-gray-200">
                                <div
                                  className="h-full rounded-full bg-green-500 transition-all"
                                  style={{ width: `${readRate}%` }}
                                />
                              </div>
                              <span className="text-xs text-gray-500">{readRate}%</span>
                            </div>
                          )}
                        </div>

                        {/* Đã đọc */}
                        <div className="col-span-1">
                          <span className={`inline-flex items-center gap-1 rounded-full px-2 py-1 text-xs font-medium ${
                            item.soNguoiDaNhan === item.soNguoiNhan && item.soNguoiNhan > 0
                              ? 'bg-green-100 text-green-700'
                              : item.soNguoiDaNhan > 0
                                ? 'bg-yellow-100 text-yellow-700'
                                : 'bg-gray-100 text-gray-500'
                          }`}>
                            {item.soNguoiDaNhan}/{item.soNguoiNhan}
                          </span>
                        </div>

                        {/* Thao tác */}
                        <div className="col-span-1 flex items-center gap-1">
                          <button
                            onClick={() => openDetail(item)}
                            title="Xem chi tiết"
                            className="rounded-lg p-1.5 text-gray-500 hover:bg-blue-50 hover:text-blue-600 transition-colors"
                          >
                            <Eye className="h-4 w-4" />
                          </button>
                          <button
                            onClick={() => openEditModal(item)}
                            title="Sửa"
                            className="rounded-lg p-1.5 text-gray-500 hover:bg-green-50 hover:text-green-600 transition-colors"
                          >
                            <FileText className="h-4 w-4" />
                          </button>
                          <button
                            onClick={() => void handleDelete(item.id)}
                            title="Xóa"
                            className="rounded-lg p-1.5 text-gray-500 hover:bg-red-50 hover:text-red-600 transition-colors"
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </div>
        </main>
      </div>

      {/* Modal tạo / sửa thông báo */}
      {isModalOpen && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/30 backdrop-blur-sm p-4"
          onClick={() => setIsModalOpen(false)}
        >
          <div
            className="w-full max-w-2xl rounded-2xl bg-white shadow-2xl"
            onClick={e => e.stopPropagation()}
          >
            {/* Modal header */}
            <div className="flex items-center justify-between border-b px-6 py-4">
              <div className="flex items-center gap-3">
                <div className="rounded-xl bg-blue-100 p-2">
                  <Send className="h-5 w-5 text-blue-600" />
                </div>
                <h2 className="text-lg font-bold text-gray-900">
                  {isEditing ? 'Cập nhật thông báo' : 'Tạo & gửi thông báo'}
                </h2>
              </div>
              <button
                onClick={() => setIsModalOpen(false)}
                className="rounded-lg p-1.5 text-gray-500 hover:bg-gray-100 transition-colors"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {/* Modal body */}
            <div className="space-y-4 p-6">
              {/* Tiêu đề */}
              <div>
                <label className="mb-1.5 block text-sm font-semibold text-gray-700">
                  Tiêu đề <span className="text-red-500">*</span>
                </label>
                <input
                  value={form.tieuDe}
                  onChange={e => setForm(p => ({ ...p, tieuDe: e.target.value }))}
                  maxLength={50}
                  placeholder="Nhập tiêu đề thông báo..."
                  className="w-full rounded-lg border border-gray-300 px-3 py-2.5 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                />
                <p className="mt-1 text-right text-xs text-gray-400">{form.tieuDe.length}/50 ký tự</p>
              </div>

              {/* Nội dung */}
              <div>
                <label className="mb-1.5 block text-sm font-semibold text-gray-700">
                  Nội dung <span className="text-red-500">*</span>
                </label>
                <textarea
                  value={form.noiDung}
                  onChange={e => setForm(p => ({ ...p, noiDung: e.target.value }))}
                  rows={5}
                  placeholder="Nhập nội dung thông báo..."
                  className="w-full resize-none rounded-lg border border-gray-300 px-3 py-2.5 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                />
              </div>

              {/* Loại thông báo */}
              <div>
                <label className="mb-1.5 block text-sm font-semibold text-gray-700">
                  Loại thông báo <span className="text-red-500">*</span>
                </label>
                <div className="grid grid-cols-3 gap-2">
                  {LOAI_OPTIONS.map(opt => (
                    <button
                      key={opt}
                      type="button"
                      onClick={() => setForm(p => ({ ...p, loaiThongBao: opt }))}
                      className={`inline-flex items-center gap-1.5 rounded-lg border px-3 py-2 text-xs font-medium transition-colors ${
                        form.loaiThongBao === opt
                          ? 'border-blue-500 bg-blue-50 text-blue-700'
                          : 'border-gray-200 text-gray-600 hover:border-gray-300 hover:bg-gray-50'
                      }`}
                    >
                      <span className={`w-5 h-5 rounded flex items-center justify-center ${LOAI_COLOR[opt]}`}>
                        {LOAI_ICON[opt]}
                      </span>
                      {LOAI_THONG_BAO_LABEL[opt]}
                    </button>
                  ))}
                </div>
              </div>

              {/* File đính kèm */}
              <div>
                <label className="mb-1.5 block text-sm font-semibold text-gray-700">
                  File đính kèm (URL)
                </label>
                <input
                  value={form.fileThongBao}
                  onChange={e => setForm(p => ({ ...p, fileThongBao: e.target.value }))}
                  placeholder="https://example.com/file.pdf"
                  className="w-full rounded-lg border border-gray-300 px-3 py-2.5 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                />
              </div>

              {/* Thông tin người nhận */}
              <div className="rounded-lg bg-blue-50 border border-blue-200 px-4 py-3">
                <div className="flex items-center gap-2 mb-1.5">
                  <Users className="h-4 w-4 text-blue-600" />
                  <span className="text-sm font-semibold text-blue-800">
                    Người nhận thông báo
                  </span>
                </div>
                <p className="text-sm text-blue-700">
                  Thông báo sẽ được gửi đến{' '}
                  <strong>{users.length}</strong> người dùng trong hệ thống.
                </p>
                {loadingUsers && (
                  <p className="mt-1 text-xs text-blue-600">Đang tải danh sách người dùng...</p>
                )}
              </div>
            </div>

            {/* Modal footer */}
            <div className="flex items-center justify-end gap-3 border-t px-6 py-4">
              <button
                type="button"
                onClick={() => setIsModalOpen(false)}
                className="rounded-lg border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors"
              >
                Hủy
              </button>
              <button
                type="button"
                onClick={() => void handleSubmit()}
                disabled={loadingUsers}
                className="inline-flex items-center gap-2 rounded-lg bg-blue-600 px-5 py-2 text-sm font-medium text-white hover:bg-blue-700 disabled:opacity-60 transition-colors"
              >
                <Send className="h-4 w-4" />
                {isEditing ? 'Cập nhật' : 'Gửi thông báo'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal chi tiết thông báo + danh sách người nhận */}
      {detailModal && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/30 backdrop-blur-sm p-4"
          onClick={() => setDetailModal(null)}
        >
          <div
            className="w-full max-w-3xl rounded-2xl bg-white shadow-2xl"
            onClick={e => e.stopPropagation()}
          >
            {/* Detail header */}
            <div className={`flex items-start justify-between border-b px-6 py-4 ${LOAI_COLOR[detailModal.loaiThongBao]}`}>
              <div className="flex items-start gap-3 flex-1 min-w-0 pr-4">
                <div className="rounded-xl bg-white/80 p-2 shadow-sm flex-shrink-0">
                  {LOAI_ICON[detailModal.loaiThongBao]}
                </div>
                <div className="min-w-0 flex-1">
                  <h2 className="text-xl font-bold text-gray-900 mb-1">{detailModal.tieuDe}</h2>
                  <div className="flex flex-wrap items-center gap-2 text-sm text-gray-600">
                    <span className="inline-flex items-center gap-1 rounded-full bg-white/80 px-2 py-0.5 font-medium">
                      {LOAI_THONG_BAO_LABEL[detailModal.loaiThongBao]}
                    </span>
                    <span>Gửi bởi: <strong>{detailModal.hoTen || detailModal.userName}</strong></span>
                    <span>{formatDate(detailModal.createdAt)}</span>
                  </div>
                </div>
              </div>
              <button
                onClick={() => setDetailModal(null)}
                className="rounded-lg p-1.5 text-gray-500 hover:bg-gray-100 transition-colors flex-shrink-0"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {/* Nội dung */}
            <div className="px-6 py-5">
              <h3 className="text-sm font-semibold text-gray-700 mb-2">Nội dung</h3>
              <div className="rounded-lg bg-gray-50 border border-gray-200 p-4">
                <p className="whitespace-pre-line text-sm text-gray-800 leading-relaxed">
                  {detailModal.noiDung}
                </p>
              </div>

              {detailModal.fileThongBao && (
                <a
                  href={detailModal.fileThongBao}
                  target="_blank"
                  rel="noreferrer"
                  className="mt-3 inline-flex items-center gap-1.5 text-sm text-blue-600 hover:underline"
                >
                  <Paperclip className="h-4 w-4" />
                  {detailModal.fileThongBao}
                </a>
              )}
            </div>

            {/* Danh sách người nhận */}
            <div className="border-t px-6 py-5">
              <div className="mb-3 flex items-center justify-between">
                <h3 className="text-sm font-semibold text-gray-700">
                  Danh sách người nhận ({receivers.length})
                </h3>
                <div className="flex items-center gap-2 text-sm">
                  <span className="flex items-center gap-1 text-green-600">
                    <CheckCircle className="h-3.5 w-3.5" />
                    {receivers.filter(r => r.daNhan).length} đã đọc
                  </span>
                  <span className="flex items-center gap-1 text-gray-500">
                    <Bell className="h-3.5 w-3.5" />
                    {receivers.filter(r => !r.daNhan).length} chưa đọc
                  </span>
                </div>
              </div>

              {loadingReceivers ? (
                <div className="flex items-center justify-center py-8">
                  <Loader2 className="h-6 w-6 animate-spin text-blue-500" />
                </div>
              ) : receivers.length === 0 ? (
                <p className="text-sm text-gray-500 py-4 text-center">Không có người nhận</p>
              ) : (
                <div className="max-h-64 overflow-y-auto rounded-lg border border-gray-200">
                  <table className="w-full text-sm">
                    <thead className="bg-gray-50 sticky top-0">
                      <tr>
                        <th className="px-4 py-2 text-left font-semibold text-gray-700">Người dùng</th>
                        <th className="px-4 py-2 text-center font-semibold text-gray-700">Trạng thái</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                      {receivers.map(r => (
                        <tr key={r.id} className="hover:bg-gray-50">
                          <td className="px-4 py-2">
                            <p className="font-medium text-gray-900">{r.hoTen || r.userName}</p>
                            <p className="text-xs text-gray-500">{r.userName}</p>
                          </td>
                          <td className="px-4 py-2 text-center">
                            {r.daNhan ? (
                              <span className="inline-flex items-center gap-1 rounded-full bg-green-100 px-2.5 py-0.5 text-xs font-medium text-green-700">
                                <CheckCircle className="h-3 w-3" />
                                Đã đọc
                              </span>
                            ) : (
                              <span className="inline-flex items-center gap-1 rounded-full bg-orange-100 px-2.5 py-0.5 text-xs font-medium text-orange-700">
                                <Bell className="h-3 w-3" />
                                Chưa đọc
                              </span>
                            )}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>

            {/* Footer */}
            <div className="flex items-center justify-end border-t px-6 py-4">
              <button
                onClick={() => setDetailModal(null)}
                className="rounded-lg bg-gray-100 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-200 transition-colors"
              >
                Đóng
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Toast notifications */}
      <div className="fixed bottom-6 right-6 z-[60] space-y-3">
        {toasts.map(toast => (
          <div
            key={toast.id}
            className={`flex items-center gap-2.5 rounded-xl px-4 py-3 text-sm font-medium text-white shadow-xl transition-all ${
              toast.type === 'success'
                ? 'bg-gradient-to-r from-green-500 to-emerald-600'
                : 'bg-gradient-to-r from-red-500 to-rose-600'
            }`}
          >
            {toast.type === 'success' ? (
              <CheckCircle className="h-5 w-5 flex-shrink-0" />
            ) : (
              <AlertCircle className="h-5 w-5 flex-shrink-0" />
            )}
            {toast.message}
          </div>
        ))}
      </div>
    </div>
  );
}
