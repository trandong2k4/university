import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router';
import { AxiosError } from 'axios';
import { useAuth } from '@/hooks';
import { apiClient } from '@/api/common';
import { StudentSidebar } from '@/components/layouts/StudentSidebar';
import { StudentHeader } from '@/components/layouts/StudentHeader';
import { AIAssistantButton } from '@/components/chatbot/AIAssistantButton';
import {
  Edit2, Save, X, User, Mail, Phone, Calendar,
  CheckCircle, AlertCircle, MapPin, CreditCard,
} from 'lucide-react';

type GioiTinh = 'NAM' | 'NU';

interface HocVienProfileResponse {
  id: string;
  userName: string;
  hoTen: string;
  diaChi: string | null;
  soDienThoai: string | null;
  email: string | null;
  gioiTinh: GioiTinh | null;
  ngaySinh: string | null;      // "yyyy-MM-dd"
  cccd: string;                 // masked "********2345"
  maHocVien: string;
  nganhId: string;
  ngayNhapHoc: string;
  ngayTotNghiep: string | null;
}

interface FormState {
  hoTen: string;
  diaChi: string;
  soDienThoai: string;
  email: string;
  gioiTinh: GioiTinh | '';
  ngaySinh: string;
  cccd: string;
}

interface HocVienProfileRequest {
  hoTen: string;
  diaChi?: string;
  soDienThoai?: string;
  email?: string;
  gioiTinh?: GioiTinh;
  ngaySinh?: string;
  cccd?: string;
}

const GIOI_TINH_LABELS: Record<GioiTinh, string> = {
  NAM: 'Nam',
  NU: 'Nữ',
};

const formatDate = (dateStr: string | null): string => {
  if (!dateStr) return '-';
  return new Date(dateStr).toLocaleDateString('vi-VN', {
    day: '2-digit', month: '2-digit', year: 'numeric',
  });
};

const inputClass = (editing: boolean, hasError: boolean) =>
  [
    'w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-[#0a2540] transition-colors',
    editing ? 'bg-white border-[#e5e7eb]' : 'bg-gray-50 border-gray-200 text-gray-600',
    hasError ? '!border-red-500' : '',
  ].join(' ');

interface FieldProps {
  label: string;
  icon: React.ReactNode;
  error?: string;
  hint?: string;
  children: React.ReactNode;
}

function Field({ label, icon, error, hint, children }: FieldProps) {
  return (
    <div>
      <label className="flex items-center gap-2 text-sm font-medium text-[#0a2540] mb-2">
        {icon}
        {label}
      </label>
      {children}
      {hint && <p className="text-[#6a7282] text-xs mt-1">{hint}</p>}
      {error && (
        <p className="text-red-500 text-sm mt-1 flex items-center gap-1">
          <AlertCircle className="w-3 h-3" />
          {error}
        </p>
      )}
    </div>
  );
}

function InfoCard({ label, value }: { label: string; value: string }) {
  return (
    <div className="bg-[#f5f7fa] rounded-lg p-4">
      <p className="text-sm text-[#6a7282] mb-1">{label}</p>
      <p className="text-[#0a2540] font-semibold">{value}</p>
    </div>
  );
}

export default function ProfilePage() {
  const navigate = useNavigate();
  const { user: authUser, isAuthenticated } = useAuth();

  const [profile, setProfile] = useState<HocVienProfileResponse | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [form, setForm] = useState<FormState>({
    hoTen: '', diaChi: '', soDienThoai: '', email: '',
    gioiTinh: '', ngaySinh: '', cccd: '',
  });
  const [errors, setErrors] = useState<Partial<Record<keyof FormState, string>>>({});
  const [notification, setNotification] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

  useEffect(() => {
    if (!isAuthenticated || !authUser) { navigate('/'); return; }
    if (authUser.role !== 'student') { navigate('/'); return; }
    fetchProfile();
  }, [isAuthenticated, authUser, navigate]);

  const fetchProfile = async () => {
    setIsLoading(true);
    try {
      const res = await apiClient.get<HocVienProfileResponse>('/student/profile');
      setProfile(res.data);
    } catch {
      showNotification('error', 'Không thể tải thông tin hồ sơ');
    } finally {
      setIsLoading(false);
    }
  };

  const startEditing = () => {
    if (!profile) return;
    setForm({
      hoTen: profile.hoTen ?? '',
      diaChi: profile.diaChi ?? '',
      soDienThoai: profile.soDienThoai ?? '',
      email: profile.email ?? '',
      gioiTinh: profile.gioiTinh ?? '',
      ngaySinh: profile.ngaySinh ?? '',
      cccd: '',
    });
    setErrors({});
    setIsEditing(true);
  };

  const handleCancel = () => {
    setErrors({});
    setIsEditing(false);
  };

  const handleChange = (field: keyof FormState, value: string) => {
    setForm(prev => ({ ...prev, [field]: value }));
    if (errors[field]) setErrors(prev => { const e = { ...prev }; delete e[field]; return e; });
  };

  const validate = (): boolean => {
    const e: Partial<Record<keyof FormState, string>> = {};
    if (!form.hoTen.trim()) e.hoTen = 'Họ tên không được để trống';
    if (form.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email))
      e.email = 'Email không hợp lệ';
    if (form.soDienThoai && !/^[0-9]{10}$/.test(form.soDienThoai))
      e.soDienThoai = 'Số điện thoại phải có đúng 10 chữ số';
    if (form.cccd && !/^[0-9]{12}$/.test(form.cccd))
      e.cccd = 'CCCD phải có đúng 12 chữ số';
    if (form.ngaySinh && new Date(form.ngaySinh) >= new Date())
      e.ngaySinh = 'Ngày sinh phải ở quá khứ';
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleSave = async () => {
    if (!validate()) { showNotification('error', 'Vui lòng kiểm tra lại thông tin!'); return; }
    setIsSaving(true);
    try {
      const body: HocVienProfileRequest = {
        hoTen: form.hoTen,
        ...(form.diaChi && { diaChi: form.diaChi }),
        ...(form.soDienThoai && { soDienThoai: form.soDienThoai }),
        ...(form.email && { email: form.email }),
        ...(form.gioiTinh && { gioiTinh: form.gioiTinh }),
        ...(form.ngaySinh && { ngaySinh: form.ngaySinh }),
        ...(form.cccd && { cccd: form.cccd }),
      };
      const res = await apiClient.put<HocVienProfileResponse>('/student/profile', body);
      setProfile(res.data);
      setIsEditing(false);
      showNotification('success', 'Cập nhật thông tin thành công!');
    } catch (err) {
      const axiosErr = err as AxiosError<{ detail?: string }>;
      const detail = axiosErr.response?.data?.detail;
      if (axiosErr.response?.status === 409)
        showNotification('error', detail || 'Email hoặc CCCD đã tồn tại trong hệ thống');
      else
        showNotification('error', detail || 'Đã xảy ra lỗi, vui lòng thử lại');
    } finally {
      setIsSaving(false);
    }
  };

  const showNotification = (type: 'success' | 'error', message: string) => {
    setNotification({ type, message });
    setTimeout(() => setNotification(null), 3000);
  };

  if (isLoading) {
    return (
      <div className="flex h-screen bg-[#f1f5f9]">
        <StudentSidebar />
        <div className="flex-1 ml-64 flex items-center justify-center text-[#6a7282]">
          Đang tải...
        </div>
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="flex h-screen bg-[#f1f5f9]">
        <StudentSidebar />
        <div className="flex-1 ml-64 flex items-center justify-center text-red-500">
          Không thể tải thông tin hồ sơ
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-screen bg-[#f1f5f9]">
      <StudentSidebar />

      <div className="flex-1 ml-64 flex flex-col">
        <StudentHeader userName={profile.hoTen} />

        <main className="flex-1 overflow-y-auto p-8">
          <div className="mb-6">
            <h1 className="text-3xl font-bold text-[#0a2540]">Hồ sơ cá nhân</h1>
            <p className="text-[#6a7282] mt-2">Quản lý thông tin cá nhân của bạn</p>
          </div>

          <div className="max-w-4xl mx-auto">
            <div className="bg-white rounded-[14px] border border-[#e5e7eb] shadow-sm overflow-hidden">

              {/* Header */}
              <div className="bg-gradient-to-r from-[#0a2540] to-[#1e4a7a] px-8 py-6">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div className="w-24 h-24 rounded-full border-4 border-white bg-white flex items-center justify-center">
                      <User className="w-12 h-12 text-[#0a2540]" />
                    </div>
                    <div>
                      <h2 className="text-2xl font-bold text-white">
                        {isEditing ? form.hoTen || profile.hoTen : profile.hoTen}
                      </h2>
                      <p className="text-white/80 mt-1">{profile.maHocVien} · Học viên</p>
                    </div>
                  </div>

                  {!isEditing ? (
                    <button
                      onClick={startEditing}
                      className="flex items-center gap-2 bg-white text-[#0a2540] px-4 py-2 rounded-lg hover:bg-gray-100 transition-colors font-medium"
                    >
                      <Edit2 className="w-4 h-4" />
                      Chỉnh sửa
                    </button>
                  ) : (
                    <div className="flex gap-3">
                      <button
                        onClick={handleCancel}
                        disabled={isSaving}
                        className="flex items-center gap-2 bg-white/10 text-white px-4 py-2 rounded-lg hover:bg-white/20 transition-colors font-medium border border-white/30 disabled:opacity-50"
                      >
                        <X className="w-4 h-4" />
                        Hủy
                      </button>
                      <button
                        onClick={handleSave}
                        disabled={isSaving}
                        className="flex items-center gap-2 bg-white text-[#0a2540] px-4 py-2 rounded-lg hover:bg-gray-100 transition-colors font-medium disabled:opacity-50"
                      >
                        <Save className="w-4 h-4" />
                        {isSaving ? 'Đang lưu...' : 'Lưu'}
                      </button>
                    </div>
                  )}
                </div>
              </div>

              {/* Body */}
              <div className="p-8">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">

                  <Field label="Họ và tên" icon={<User className="w-4 h-4" />} error={errors.hoTen}>
                    <input
                      type="text"
                      value={isEditing ? form.hoTen : profile.hoTen}
                      onChange={e => handleChange('hoTen', e.target.value)}
                      disabled={!isEditing}
                      className={inputClass(isEditing, !!errors.hoTen)}
                      placeholder="Nhập họ và tên"
                    />
                  </Field>

                  <Field label="Email" icon={<Mail className="w-4 h-4" />} error={errors.email}>
                    <input
                      type="email"
                      value={isEditing ? form.email : (profile.email ?? '')}
                      onChange={e => handleChange('email', e.target.value)}
                      disabled={!isEditing}
                      className={inputClass(isEditing, !!errors.email)}
                      placeholder="Nhập email"
                    />
                  </Field>

                  <Field label="Số điện thoại" icon={<Phone className="w-4 h-4" />} error={errors.soDienThoai}>
                    <input
                      type="tel"
                      value={isEditing ? form.soDienThoai : (profile.soDienThoai ?? '')}
                      onChange={e => handleChange('soDienThoai', e.target.value)}
                      disabled={!isEditing}
                      className={inputClass(isEditing, !!errors.soDienThoai)}
                      placeholder="Nhập số điện thoại (10 chữ số)"
                      maxLength={10}
                    />
                  </Field>

                  <Field label="Ngày sinh" icon={<Calendar className="w-4 h-4" />} error={errors.ngaySinh}>
                    <input
                      type="date"
                      value={isEditing ? form.ngaySinh : (profile.ngaySinh ?? '')}
                      onChange={e => handleChange('ngaySinh', e.target.value)}
                      disabled={!isEditing}
                      className={inputClass(isEditing, !!errors.ngaySinh)}
                    />
                  </Field>

                  <Field label="Địa chỉ" icon={<MapPin className="w-4 h-4" />} error={errors.diaChi}>
                    <input
                      type="text"
                      value={isEditing ? form.diaChi : (profile.diaChi ?? '')}
                      onChange={e => handleChange('diaChi', e.target.value)}
                      disabled={!isEditing}
                      className={inputClass(isEditing, !!errors.diaChi)}
                      placeholder="Nhập địa chỉ"
                    />
                  </Field>

                  <Field label="Giới tính" icon={<User className="w-4 h-4" />} error={errors.gioiTinh}>
                    {isEditing ? (
                      <select
                        value={form.gioiTinh}
                        onChange={e => handleChange('gioiTinh', e.target.value)}
                        className={inputClass(true, !!errors.gioiTinh)}
                      >
                        <option value="">-- Chọn giới tính --</option>
                        <option value="NAM">Nam</option>
                        <option value="NU">Nữ</option>
                      </select>
                    ) : (
                      <input
                        type="text"
                        value={profile.gioiTinh ? GIOI_TINH_LABELS[profile.gioiTinh] : ''}
                        disabled
                        className={inputClass(false, false)}
                      />
                    )}
                  </Field>

                  <Field
                    label="CCCD"
                    icon={<CreditCard className="w-4 h-4" />}
                    error={errors.cccd}
                    hint={isEditing ? 'Để trống nếu không muốn thay đổi' : undefined}
                  >
                    <input
                      type="text"
                      value={isEditing ? form.cccd : profile.cccd}
                      onChange={e => handleChange('cccd', e.target.value)}
                      disabled={!isEditing}
                      className={inputClass(isEditing, !!errors.cccd)}
                      placeholder={isEditing ? 'Nhập 12 chữ số nếu muốn cập nhật' : ''}
                      maxLength={12}
                    />
                  </Field>

                  <Field label="Tên đăng nhập" icon={<User className="w-4 h-4" />}>
                    <input
                      type="text"
                      value={profile.userName}
                      disabled
                      className={inputClass(false, false)}
                    />
                  </Field>

                </div>

                {/* Thông tin học tập */}
                <div className="mt-8 pt-6 border-t border-[#e5e7eb]">
                  <h3 className="text-lg font-semibold text-[#0a2540] mb-4">Thông tin học tập</h3>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <InfoCard label="Mã học viên" value={profile.maHocVien} />
                    <InfoCard label="Ngày nhập học" value={formatDate(profile.ngayNhapHoc)} />
                    <InfoCard label="Ngày tốt nghiệp" value={formatDate(profile.ngayTotNghiep)} />
                  </div>
                </div>
              </div>

            </div>
          </div>
        </main>
      </div>

      <AIAssistantButton />

      {notification && (
        <div className={`fixed top-8 right-8 z-50 flex items-center gap-3 px-6 py-4 rounded-lg shadow-lg border ${
          notification.type === 'success'
            ? 'bg-green-50 border-green-200 text-green-800'
            : 'bg-red-50 border-red-200 text-red-800'
        }`}>
          {notification.type === 'success'
            ? <CheckCircle className="w-5 h-5 text-green-600" />
            : <AlertCircle className="w-5 h-5 text-red-600" />}
          <p className="font-medium">{notification.message}</p>
        </div>
      )}
    </div>
  );
}
