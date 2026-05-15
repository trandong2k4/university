import { AdminSidebar } from '@/components/layouts/AdminSidebar';
import { AdminHeader } from '@/components/layouts/AdminHeader';
import { useState, useEffect, useRef, FormEvent } from 'react';
import {
  Plus,
  Edit,
  Trash2,
  X,
  Search,
  Home,
  AlertCircle,
  Upload,
  RefreshCw,
} from 'lucide-react';
import AiAssistantButton from '@/imports/AiAssistantButton-4-13343';
import * as schoolApi from '@/api/admin/school.api';
import type { SchoolItem } from '@/types';
import { Toast } from '@/components/notification/Toast';

type ToastState = { type: 'success' | 'error' | 'warning'; message: string } | null;

const emptyForm = {
  maTruong: '',
  tenTruong: '',
  diaChi: '',
  moTa: '',
  nguoiDaiDien: '',
  ngayThanhLap: '',
};

function extractError(err: any, fallback: string): string {
  return (
    err?.response?.data?.detail ||
    err?.response?.data?.message ||
    err?.message ||
    fallback
  );
}

export default function AdminSchoolsPage() {
  const [schools, setSchools] = useState<SchoolItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [toast, setToast] = useState<ToastState>(null);

  const [isAddOpen, setIsAddOpen] = useState(false);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  const [selected, setSelected] = useState<SchoolItem | null>(null);
  const [form, setForm] = useState(emptyForm);

  const fileInputRef = useRef<HTMLInputElement>(null);

  const fetchAll = async () => {
    try {
      setLoading(true);
      const data = await schoolApi.getSchools();
      setSchools(data || []);
    } catch (err) {
      setToast({ type: 'error', message: extractError(err, 'Lỗi khi tải danh sách trường') });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchAll(); }, []);

  const filtered = schools.filter(s =>
    s.maTruong?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    s.tenTruong?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    s.nguoiDaiDien?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const openAdd = () => {
    setForm(emptyForm);
    setIsAddOpen(true);
  };

  const openEdit = (item: SchoolItem) => {
    setSelected(item);
    setForm({
      maTruong: item.maTruong ?? '',
      tenTruong: item.tenTruong ?? '',
      diaChi: item.diaChi ?? '',
      moTa: item.moTa ?? '',
      nguoiDaiDien: item.nguoiDaiDien ?? '',
      ngayThanhLap: item.ngayThanhLap ?? '',
    });
    setIsEditOpen(true);
  };

  const openDelete = (item: SchoolItem) => {
    setSelected(item);
    setIsDeleteOpen(true);
  };

  const handleCreate = async (e: FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      await schoolApi.createSchool(form);
      setToast({ type: 'success', message: 'Thêm trường thành công' });
      setIsAddOpen(false);
      await fetchAll();
    } catch (err) {
      setToast({ type: 'error', message: extractError(err, 'Thêm trường thất bại') });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleUpdate = async (e: FormEvent) => {
    e.preventDefault();
    if (!selected) return;
    setIsSubmitting(true);
    try {
      await schoolApi.updateSchool(selected.id, form);
      setToast({ type: 'success', message: 'Cập nhật trường thành công' });
      setIsEditOpen(false);
      setSelected(null);
      await fetchAll();
    } catch (err) {
      setToast({ type: 'error', message: extractError(err, 'Cập nhật trường thất bại') });
    } finally {
      setIsSubmitting(false);
    }
  };

  const confirmDelete = async () => {
    if (!selected) return;
    setIsDeleting(true);
    try {
      await schoolApi.deleteSchool(selected.id);
      setToast({ type: 'success', message: 'Xóa trường thành công' });
      await fetchAll();
    } catch (err) {
      setToast({ type: 'error', message: extractError(err, 'Xóa trường thất bại') });
    } finally {
      setIsDeleteOpen(false);
      setSelected(null);
      setIsDeleting(false);
    }
  };

  const handleImportExcel = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    try {
      const result = await schoolApi.importSchoolsFromExcel(file);
      const { successCount = 0, failCount = 0 } = result ?? {};
      setToast({
        type: failCount > 0 ? 'warning' : 'success',
        message: `Import thành công ${successCount} trường${failCount > 0 ? `, ${failCount} lỗi` : ''}`,
      });
      await fetchAll();
    } catch (err) {
      setToast({ type: 'error', message: extractError(err, 'Import Excel thất bại') });
    } finally {
      e.target.value = '';
    }
  };

  const InputField = ({
    label,
    required,
    ...props
  }: React.InputHTMLAttributes<HTMLInputElement> & { label: string; required?: boolean }) => (
    <div>
      <label className="block text-sm font-medium text-gray-700 mb-1.5">
        {label} {required && <span className="text-red-500">*</span>}
      </label>
      <input
        {...props}
        required={required}
        className="w-full px-3 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
      />
    </div>
  );

  const SchoolForm = ({ onSubmit }: { onSubmit: (e: FormEvent) => void }) => (
    <form onSubmit={onSubmit} className="p-6 space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <InputField
          label="Mã trường"
          required
          value={form.maTruong}
          onChange={e => setForm({ ...form, maTruong: e.target.value })}
          placeholder="VD: DTU"
        />
        <InputField
          label="Tên trường"
          required
          value={form.tenTruong}
          onChange={e => setForm({ ...form, tenTruong: e.target.value })}
          placeholder="VD: Đại học Duy Tân"
        />
      </div>
      <InputField
        label="Địa chỉ"
        value={form.diaChi}
        onChange={e => setForm({ ...form, diaChi: e.target.value })}
        placeholder="VD: 182 Nguyễn Văn Linh, Đà Nẵng"
      />
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <InputField
          label="Người đại diện"
          value={form.nguoiDaiDien}
          onChange={e => setForm({ ...form, nguoiDaiDien: e.target.value })}
          placeholder="VD: GS. Nguyễn Văn A"
        />
        <InputField
          label="Ngày thành lập"
          type="date"
          value={form.ngayThanhLap}
          onChange={e => setForm({ ...form, ngayThanhLap: e.target.value })}
        />
      </div>
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1.5">Mô tả</label>
        <textarea
          value={form.moTa}
          onChange={e => setForm({ ...form, moTa: e.target.value })}
          placeholder="Nhập mô tả về trường..."
          rows={3}
          className="w-full px-3 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all resize-none"
        />
      </div>
      <div className="flex gap-3 pt-2 border-t border-gray-200">
        <button
          type="button"
          onClick={() => { setIsAddOpen(false); setIsEditOpen(false); }}
          className="flex-1 px-4 py-2.5 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors font-medium text-gray-700"
        >
          Hủy
        </button>
        <button
          type="submit"
          disabled={isSubmitting}
          className="flex-1 px-4 py-2.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isSubmitting ? 'Đang lưu...' : isAddOpen ? 'Thêm trường' : 'Lưu thay đổi'}
        </button>
      </div>
    </form>
  );

  return (
    <div className="flex h-screen bg-slate-50">
      <AdminSidebar activeMenu="schools" />

      <div className="flex-1 ml-64 flex flex-col overflow-hidden">
        <AdminHeader title="Quản lý Trường" />

        <div className="flex-1 overflow-auto">
          <div className="p-6 max-w-7xl mx-auto space-y-4">

            {/* Toolbar */}
            <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-3">
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
                <div className="relative flex-1 max-w-md w-full">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                  <input
                    value={searchQuery}
                    onChange={e => setSearchQuery(e.target.value)}
                    placeholder="Tìm theo mã, tên hoặc người đại diện..."
                    className="w-full pl-9 pr-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all text-sm"
                  />
                </div>
                <div className="flex items-center gap-2 shrink-0">
                  <button
                    onClick={fetchAll}
                    className="p-2 border border-slate-300 rounded-lg hover:bg-slate-50 transition-colors text-slate-600"
                    title="Làm mới"
                  >
                    <RefreshCw className="w-4 h-4" />
                  </button>
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept=".xlsx,.xls"
                    className="hidden"
                    onChange={handleImportExcel}
                  />
                  <button
                    onClick={() => fileInputRef.current?.click()}
                    className="flex items-center gap-1.5 px-3 py-2 border border-slate-300 rounded-lg hover:bg-slate-50 transition-colors text-sm font-medium text-slate-700"
                  >
                    <Upload className="w-4 h-4" />
                    Import Excel
                  </button>
                  <button
                    onClick={openAdd}
                    className="flex items-center gap-1.5 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm font-medium shadow-sm"
                  >
                    <Plus className="w-4 h-4" />
                    Thêm Trường
                  </button>
                </div>
              </div>
            </div>

            {/* Table */}
            <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
              {loading ? (
                <div className="flex items-center justify-center h-64">
                  <div className="text-center">
                    <div className="w-10 h-10 border-4 border-slate-200 border-t-blue-600 rounded-full animate-spin mx-auto mb-3" />
                    <p className="text-sm text-slate-500">Đang tải dữ liệu...</p>
                  </div>
                </div>
              ) : (
                <div className="overflow-auto" style={{ maxHeight: 'calc(100vh - 260px)' }}>
                  <table className="w-full">
                    <thead className="sticky top-0 z-10 bg-gradient-to-r from-blue-600 to-blue-700 text-white">
                      <tr>
                        <th className="px-6 py-4 text-left text-sm font-semibold">Mã trường</th>
                        <th className="px-6 py-4 text-left text-sm font-semibold">Tên trường</th>
                        <th className="px-6 py-4 text-left text-sm font-semibold">Địa chỉ</th>
                        <th className="px-6 py-4 text-left text-sm font-semibold">Người đại diện</th>
                        <th className="px-6 py-4 text-left text-sm font-semibold">Ngày thành lập</th>
                        <th className="px-6 py-4 text-center text-sm font-semibold">Thao tác</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {filtered.length > 0 ? filtered.map((s, idx) => (
                        <tr
                          key={s.id}
                          className={`hover:bg-blue-50/60 transition-colors ${idx % 2 === 0 ? 'bg-white' : 'bg-slate-50/50'}`}
                        >
                          <td className="px-6 py-4 text-sm font-semibold text-gray-900">
                            <span className="inline-flex items-center px-2.5 py-0.5 rounded-md bg-blue-100 text-blue-800 text-xs font-medium">
                              {s.maTruong}
                            </span>
                          </td>
                          <td className="px-6 py-4 text-sm font-medium text-gray-900">{s.tenTruong}</td>
                          <td className="px-6 py-4 text-sm text-gray-600 max-w-xs truncate">{s.diaChi || '—'}</td>
                          <td className="px-6 py-4 text-sm text-gray-600">{s.nguoiDaiDien || '—'}</td>
                          <td className="px-6 py-4 text-sm text-gray-600">
                            {s.ngayThanhLap ? new Date(s.ngayThanhLap).toLocaleDateString('vi-VN') : '—'}
                          </td>
                          <td className="px-6 py-4">
                            <div className="flex items-center justify-center gap-1.5">
                              <button
                                onClick={() => openEdit(s)}
                                className="p-2 text-blue-600 hover:bg-blue-100 rounded-lg transition-colors"
                                title="Chỉnh sửa"
                              >
                                <Edit className="w-4 h-4" />
                              </button>
                              <button
                                onClick={() => openDelete(s)}
                                className="p-2 text-red-600 hover:bg-red-100 rounded-lg transition-colors"
                                title="Xóa"
                              >
                                <Trash2 className="w-4 h-4" />
                              </button>
                            </div>
                          </td>
                        </tr>
                      )) : (
                        <tr>
                          <td colSpan={6} className="px-6 py-16 text-center">
                            <div className="flex flex-col items-center gap-3">
                              <div className="rounded-full bg-gray-100 p-4">
                                <Home className="w-8 h-8 text-gray-400" />
                              </div>
                              <p className="text-base font-semibold text-gray-700">
                                {searchQuery ? 'Không tìm thấy trường nào' : 'Chưa có trường nào'}
                              </p>
                              <p className="text-sm text-gray-500">
                                {searchQuery ? 'Thử tìm kiếm với từ khóa khác' : 'Nhấn "Thêm Trường" để bắt đầu'}
                              </p>
                            </div>
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              )}

              {!loading && filtered.length > 0 && (
                <div className="px-6 py-3 bg-slate-50 border-t border-slate-200">
                  <p className="text-xs text-slate-500">
                    Hiển thị <span className="font-semibold text-slate-700">{filtered.length}</span>
                    {filtered.length !== schools.length && (
                      <> / <span className="font-semibold text-slate-700">{schools.length}</span></>
                    )} trường
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Add Modal */}
      {isAddOpen && (
        <div className="fixed inset-0 bg-black/20 flex items-center justify-center z-50 p-4" onClick={() => setIsAddOpen(false)}>
          <div className="bg-white rounded-xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto" onClick={e => e.stopPropagation()}>
            <div className="bg-gradient-to-r from-blue-600 to-blue-700 text-white px-6 py-4 flex items-center justify-between sticky top-0 z-10 rounded-t-xl">
              <h2 className="text-lg font-bold flex items-center gap-2">
                <Plus className="w-5 h-5" /> Thêm Trường Mới
              </h2>
              <button onClick={() => setIsAddOpen(false)} className="p-1 hover:bg-white/20 rounded-lg transition-colors">
                <X className="w-5 h-5" />
              </button>
            </div>
            <SchoolForm onSubmit={handleCreate} />
          </div>
        </div>
      )}

      {/* Edit Modal */}
      {isEditOpen && selected && (
        <div className="fixed inset-0 bg-black/20 flex items-center justify-center z-50 p-4" onClick={() => setIsEditOpen(false)}>
          <div className="bg-white rounded-xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto" onClick={e => e.stopPropagation()}>
            <div className="bg-gradient-to-r from-blue-600 to-blue-700 text-white px-6 py-4 flex items-center justify-between sticky top-0 z-10 rounded-t-xl">
              <h2 className="text-lg font-bold flex items-center gap-2">
                <Edit className="w-5 h-5" /> Chỉnh Sửa Trường
              </h2>
              <button onClick={() => setIsEditOpen(false)} className="p-1 hover:bg-white/20 rounded-lg transition-colors">
                <X className="w-5 h-5" />
              </button>
            </div>
            <SchoolForm onSubmit={handleUpdate} />
          </div>
        </div>
      )}

      {/* Delete Confirm Modal */}
      {isDeleteOpen && selected && (
        <div className="fixed inset-0 bg-black/20 flex items-center justify-center z-50 p-4" onClick={() => setIsDeleteOpen(false)}>
          <div className="bg-white rounded-xl shadow-2xl max-w-md w-full" onClick={e => e.stopPropagation()}>
            <div className="p-6">
              <div className="flex items-center justify-center w-14 h-14 mx-auto bg-red-100 rounded-full mb-4">
                <Trash2 className="w-7 h-7 text-red-600" />
              </div>
              <h3 className="text-lg font-bold text-gray-900 text-center mb-2">Xác nhận xóa</h3>
              <p className="text-gray-600 text-center mb-4 text-sm">
                Bạn có chắc muốn xóa trường{' '}
                <span className="font-bold text-gray-900">{selected.tenTruong}</span>?
              </p>
              <div className="bg-red-50 border border-red-200 rounded-lg p-3 mb-5">
                <p className="text-sm text-red-700 flex items-start gap-2">
                  <AlertCircle className="w-4 h-4 mt-0.5 shrink-0" />
                  Trường đang có khoa liên kết sẽ không thể xóa. Hành động này không thể hoàn tác.
                </p>
              </div>
              <div className="flex gap-3">
                <button
                  onClick={() => { setIsDeleteOpen(false); setSelected(null); }}
                  className="flex-1 px-4 py-2.5 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors font-medium text-gray-700"
                >
                  Hủy
                </button>
                <button
                  onClick={confirmDelete}
                  disabled={isDeleting}
                  className="flex-1 px-4 py-2.5 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors font-medium disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isDeleting ? 'Đang xóa...' : 'Xóa'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* AI Assistant */}
      <button
        className="fixed bottom-8 right-8 w-16 h-16 z-50 hover:scale-110 transition-transform cursor-pointer"
        aria-label="AI Assistant"
      >
        <AiAssistantButton />
      </button>

      {/* Toast */}
      {toast && <Toast type={toast.type} message={toast.message} onClose={() => setToast(null)} />}
    </div>
  );
}
