import { InstructorSidebar } from '@/components/layouts/InstructorSidebar';
import { InstructorHeader } from '@/components/layouts/InstructorHeader';
import {
  User, Mail, Phone, Calendar as CalendarIcon, Edit, Save, X,
  CheckCircle, ChevronLeft, ChevronRightIcon, Clock, DoorOpen,
  MapPin, Calendar, Users, Briefcase, Lock, Eye, EyeOff, AlertCircle,
  ImageIcon, Shield, GraduationCap, Award, BookOpen, TrendingUp,
} from 'lucide-react';
import { useEffect, useState, useRef, type ComponentType, type ReactNode } from 'react';
import { useAuth } from '@/hooks';
import AiAssistantButton from '@/imports/AiAssistantButton';
import lecturerApi, { LecturerProfileResponseDTO, LecturerScheduleDTO } from '@/api/lecturer/lecturer.api';

// ── Validation helpers ─────────────────────────────────────────────────────

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const PHONE_RE = /^\+?[0-9]{9,15}$/;
const PWD_RE = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).+$/;

function validateProfileFields(email: string, phone: string) {
  const errors: Record<string, string> = {};
  if (!email.trim()) errors.email = 'Email không được để trống';
  else if (!EMAIL_RE.test(email)) errors.email = 'Email không hợp lệ';
  if (!phone.trim()) errors.phone = 'Số điện thoại không được để trống';
  else if (!PHONE_RE.test(phone)) errors.phone = 'Số điện thoại không hợp lệ (9–15 chữ số)';
  return errors;
}

function validatePassword(oldPwd: string, newPwd: string, confirmPwd: string) {
  const errors: Record<string, string> = {};
  if (!oldPwd) errors.oldPassword = 'Mật khẩu cũ không được để trống';
  if (!newPwd) errors.newPassword = 'Mật khẩu mới không được để trống';
  else if (newPwd.length < 8) errors.newPassword = 'Mật khẩu phải có ít nhất 8 ký tự';
  else if (!PWD_RE.test(newPwd)) errors.newPassword = 'Mật khẩu phải chứa chữ hoa, chữ thường và chữ số';
  if (!confirmPwd) errors.confirmPassword = 'Xác nhận mật khẩu không được để trống';
  else if (newPwd && confirmPwd !== newPwd) errors.confirmPassword = 'Mật khẩu xác nhận không khớp';
  return errors;
}

function pwdStrength(pwd: string): { level: number; label: string; color: string; bgColor: string; textColor: string } {
  if (!pwd) return { level: 0, label: '', color: '', bgColor: '', textColor: '' };
  let score = 0;
  if (pwd.length >= 8) score++;
  if (/[A-Z]/.test(pwd)) score++;
  if (/[a-z]/.test(pwd)) score++;
  if (/\d/.test(pwd)) score++;
  if (/[^a-zA-Z\d]/.test(pwd)) score++;
  if (score <= 1) return { level: score, label: 'Rất yếu', color: 'bg-red-500', bgColor: 'bg-red-50', textColor: 'text-red-600' };
  if (score === 2) return { level: score, label: 'Yếu', color: 'bg-orange-500', bgColor: 'bg-orange-50', textColor: 'text-orange-600' };
  if (score === 3) return { level: score, label: 'Trung bình', color: 'bg-yellow-500', bgColor: 'bg-yellow-50', textColor: 'text-yellow-600' };
  if (score === 4) return { level: score, label: 'Mạnh', color: 'bg-blue-500', bgColor: 'bg-blue-50', textColor: 'text-blue-600' };
  return { level: score, label: 'Rất mạnh', color: 'bg-green-500', bgColor: 'bg-green-50', textColor: 'text-green-600' };
}

// ── Component ──────────────────────────────────────────────────────────────

export default function InstructorProfile() {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState<'info' | 'password' | 'schedule'>('info');
  const [profile, setProfile] = useState<LecturerProfileResponseDTO | null>(null);

  // --- Info tab ---
  const [isEditing, setIsEditing] = useState(false);
  const [editHoTen, setEditHoTen] = useState('');
  const [editEmail, setEditEmail] = useState('');
  const [editPhone, setEditPhone] = useState('');
  const [editDiaChi, setEditDiaChi] = useState('');
  const [editGioiTinh, setEditGioiTinh] = useState<'NAM' | 'NU' | ''>('');
  const [editNgaySinh, setEditNgaySinh] = useState('');
  const [editAvatarUrl, setEditAvatarUrl] = useState('');
  const [avatarUploadError, setAvatarUploadError] = useState('');
  const [infoErrors, setInfoErrors] = useState<Record<string, string>>({});
  const [saving, setSaving] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // --- Password tab ---
  const [oldPassword, setOldPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showOld, setShowOld] = useState(false);
  const [showNew, setShowNew] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [pwdErrors, setPwdErrors] = useState<Record<string, string>>({});
  const [pwdSaving, setPwdSaving] = useState(false);

  // --- Schedule tab ---
  const [schedule, setSchedule] = useState<LecturerScheduleDTO[]>([]);
  const [currentWeek, setCurrentWeek] = useState(0);

  // --- Toast ---
  const [toast, setToast] = useState<{ msg: string; type: 'success' | 'error' } | null>(null);

  const showToast = (msg: string, type: 'success' | 'error' = 'success') => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 3500);
  };

  // ── Data loading ─────────────────────────────────────────────────────────

  useEffect(() => {
    if (!user?.id) return;
    lecturerApi.getProfile(user.id).then(p => {
      setProfile(p);
      setEditHoTen(p.hoTen || '');
      setEditEmail(p.email || '');
      setEditPhone(p.soDienThoai || '');
      setEditDiaChi(p.diaChi || '');
      setEditGioiTinh(p.gioiTinh || '');
      setEditNgaySinh(p.ngaySinh ? p.ngaySinh.split('T')[0] : '');
      setEditAvatarUrl(p.avatarUrl || '');
    }).catch(console.error);
  }, [user?.id]);

  const getWeekRange = (offset: number) => {
    const today = new Date();
    const day = today.getDay();
    const diff = day === 0 ? -6 : 1 - day;
    const monday = new Date(today);
    monday.setDate(today.getDate() + diff + offset * 7);
    const sunday = new Date(monday);
    sunday.setDate(monday.getDate() + 6);
    return { monday, sunday };
  };

  useEffect(() => {
    if (!user?.id) return;
    const { monday, sunday } = getWeekRange(currentWeek);
    const fmt = (d: Date) => d.toISOString().split('T')[0];
    lecturerApi.getSchedule(user.id, fmt(monday), fmt(sunday)).then(setSchedule).catch(console.error);
  }, [user?.id, currentWeek]);

  // ── Handlers ─────────────────────────────────────────────────────────────

  const handleSaveInfo = async () => {
    const errors = validateProfileFields(editEmail, editPhone);
    if (Object.keys(errors).length) { setInfoErrors(errors); return; }
    setInfoErrors({});
    if (!user?.id || !profile) return;
    setSaving(true);
    try {
      const updated = await lecturerApi.updateProfile(user.id, {
        hoTen: editHoTen,
        email: editEmail,
        soDienThoai: editPhone,
        diaChi: editDiaChi,
        gioiTinh: (editGioiTinh || null) as 'NAM' | 'NU' | null,
        ngaySinh: editNgaySinh ? `${editNgaySinh}T00:00:00` : undefined,
        avatarUrl: editAvatarUrl,
      });
      setProfile(updated);
      setEditAvatarUrl(updated.avatarUrl || '');
      setAvatarUploadError('');
      if (fileInputRef.current) fileInputRef.current.value = '';
      setIsEditing(false);
      showToast('Cập nhật thông tin thành công');
    } catch {
      showToast('Cập nhật thất bại, vui lòng thử lại', 'error');
    } finally {
      setSaving(false);
    }
  };

  const handleAvatarFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (!file.type.startsWith('image/')) {
      setAvatarUploadError('Chỉ chấp nhận file ảnh (JPG, PNG, GIF, WEBP)');
      return;
    }
    if (file.size > 2 * 1024 * 1024) {
      setAvatarUploadError('Ảnh không được vượt quá 2MB');
      return;
    }
    setAvatarUploadError('');
    const reader = new FileReader();
    reader.onload = () => setEditAvatarUrl(reader.result as string);
    reader.readAsDataURL(file);
  };

  const handleCancelInfo = () => {
    if (profile) {
      setEditHoTen(profile.hoTen || '');
      setEditEmail(profile.email || '');
      setEditPhone(profile.soDienThoai || '');
      setEditDiaChi(profile.diaChi || '');
      setEditGioiTinh(profile.gioiTinh || '');
      setEditNgaySinh(profile.ngaySinh ? profile.ngaySinh.split('T')[0] : '');
      setEditAvatarUrl(profile.avatarUrl || '');
    }
    setInfoErrors({});
    setIsEditing(false);
  };

  const handleChangePassword = async (e: React.SyntheticEvent) => {
    e.preventDefault();
    const errors = validatePassword(oldPassword, newPassword, confirmPassword);
    if (Object.keys(errors).length) { setPwdErrors(errors); return; }
    setPwdErrors({});
    if (!user?.id) return;
    setPwdSaving(true);
    try {
      await lecturerApi.changePassword(user.id, { oldPassword, newPassword, confirmPassword });
      setOldPassword(''); setNewPassword(''); setConfirmPassword('');
      showToast('Đổi mật khẩu thành công');
    } catch (err: any) {
      const msg = err?.response?.data?.message || 'Đổi mật khẩu thất bại';
      if (msg.toLowerCase().includes('cũ') || msg.toLowerCase().includes('incorrect') || msg.toLowerCase().includes('old')) {
        setPwdErrors({ oldPassword: 'Mật khẩu cũ không chính xác' });
      } else {
        showToast(msg, 'error');
      }
    } finally {
      setPwdSaving(false);
    }
  };

  // ── Schedule helpers ──────────────────────────────────────────────────────

  const getWeekDates = (offset: number) => {
    const { monday } = getWeekRange(offset);
    return Array.from({ length: 7 }, (_, i) => {
      const d = new Date(monday);
      d.setDate(monday.getDate() + i);
      return d;
    });
  };

  const weekDates = getWeekDates(currentWeek);
  const { monday, sunday } = getWeekRange(currentWeek);
  const dayNames = ['CN', 'Th 2', 'Th 3', 'Th 4', 'Th 5', 'Th 6', 'Th 7'];
  const fmt2 = (d: Date) => d.toLocaleDateString('vi-VN', { day: '2-digit', month: '2-digit' });
  const getEventsForDay = (date: Date) =>
    schedule.filter(e => new Date(e.ngayHoc).toDateString() === date.toDateString());

  const strength = pwdStrength(newPassword);
  const getInitials = (name: string) => {
    const parts = name.trim().split(' ');
    if (parts.length >= 2) return (parts[parts.length - 2].charAt(0) + parts[parts.length - 1].charAt(0)).toUpperCase();
    return name.charAt(0).toUpperCase();
  };

  const scheduleColors = [
    { bg: 'bg-indigo-50', border: 'border-indigo-200', text: 'text-indigo-700', icon: 'bg-indigo-100' },
    { bg: 'bg-emerald-50', border: 'border-emerald-200', text: 'text-emerald-700', icon: 'bg-emerald-100' },
    { bg: 'bg-amber-50', border: 'border-amber-200', text: 'text-amber-700', icon: 'bg-amber-100' },
    { bg: 'bg-rose-50', border: 'border-rose-200', text: 'text-rose-700', icon: 'bg-rose-100' },
    { bg: 'bg-cyan-50', border: 'border-cyan-200', text: 'text-cyan-700', icon: 'bg-cyan-100' },
    { bg: 'bg-violet-50', border: 'border-violet-200', text: 'text-violet-700', icon: 'bg-violet-100' },
  ];
  const colorIdx = (id: number) => scheduleColors[id % scheduleColors.length];

  if (!profile) {
    return (
      <div className="flex h-screen bg-gradient-to-br from-slate-50 to-blue-50">
        <InstructorSidebar />
        <div className="flex-1 ml-64 flex items-center justify-center">
          <div className="text-center">
            <div className="w-12 h-12 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin mx-auto mb-4"></div>
            <p className="text-gray-500 font-medium">Đang tải thông tin...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-screen bg-gradient-to-br from-slate-100 via-blue-50 to-indigo-50">
      <InstructorSidebar />
      <div className="flex-1 ml-64 flex flex-col min-h-screen">
        <InstructorHeader title="Hồ sơ cá nhân" />
        <div className="flex-1 overflow-auto p-6 lg:p-8">
          <div className="max-w-6xl mx-auto space-y-6">

            {/* ── Page Header ─────────────────────────────────────────────── */}
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-3xl font-bold text-gray-900 tracking-tight">Hồ sơ cá nhân</h1>
                <p className="text-gray-500 mt-1">Quản lý thông tin, bảo mật và lịch giảng dạy</p>
              </div>
            </div>

            {/* ── Pill Tabs ──────────────────────────────────────────────── */}
            <div className="flex gap-1 bg-white/80 backdrop-blur-sm p-1.5 rounded-2xl shadow-sm border border-gray-200/60 w-fit">
              {[
                { key: 'info', label: 'Thông tin cá nhân', Icon: User, color: 'text-violet-600' },
                { key: 'password', label: 'Bảo mật', Icon: Lock, color: 'text-amber-600' },
                { key: 'schedule', label: 'Lịch giảng dạy', Icon: CalendarIcon, color: 'text-emerald-600' },
              ].map(({ key, label, Icon, color }) => (
                <button
                  key={key}
                  onClick={() => setActiveTab(key as typeof activeTab)}
                  className={`flex items-center gap-2 px-5 py-2.5 rounded-xl font-semibold text-sm transition-all duration-200 ${activeTab === key
                    ? `bg-gradient-to-r from-violet-600 to-indigo-600 text-white shadow-md shadow-violet-200`
                    : `text-gray-500 hover:text-gray-800 hover:bg-gray-100`
                    }`}
                >
                  <Icon className={`w-4 h-4 ${activeTab === key ? '' : color}`} />
                  {label}
                </button>
              ))}
            </div>

            {/* ── TAB: Thông tin cá nhân ──────────────────────────────────── */}
            {activeTab === 'info' && (
              <div className="space-y-5 animate-in fade-in duration-300">

                {/* ── Hero Card (Avatar + Identity) ─────────────────────────── */}
                <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-violet-600 via-indigo-600 to-blue-700 p-px">
                  <div className="bg-white rounded-3xl p-8">
                    <div className="flex flex-col sm:flex-row items-center sm:items-start gap-6">
                      {/* Avatar */}
                      <div className="relative shrink-0 group">
                        <div className="absolute -inset-1 bg-gradient-to-r from-violet-400 via-indigo-400 to-blue-400 rounded-full opacity-30 group-hover:opacity-60 blur-sm transition-opacity duration-300"></div>
                        <div className="relative">
                          {(isEditing ? editAvatarUrl : profile.avatarUrl) ? (
                            <img
                              src={isEditing ? editAvatarUrl : (profile.avatarUrl ?? undefined)}
                              alt="Avatar"
                              className="w-32 h-32 rounded-full object-cover border-[4px] border-white shadow-xl"
                              onError={e => { (e.target as HTMLImageElement).style.display = 'none'; }}
                            />
                          ) : (
                            <div className="w-32 h-32 rounded-full bg-gradient-to-br from-violet-500 to-indigo-600 flex items-center justify-center border-[4px] border-white shadow-xl">
                              <span className="text-white text-4xl font-bold">{getInitials(profile.hoTen)}</span>
                            </div>
                          )}
                          {/* Online indicator */}
                          <div className="absolute bottom-1 right-1 w-5 h-5 bg-green-400 border-4 border-white rounded-full shadow"></div>
                        </div>
                      </div>

                      {/* Identity info */}
                      <div className="flex-1 text-center sm:text-left min-w-0">
                        <div className="flex flex-col sm:flex-row items-center sm:items-start gap-3 sm:gap-4">
                          <div className="min-w-0">
                            <h2 className="text-3xl font-bold text-gray-900 truncate">{profile.hoTen}</h2>
                            <p className="text-indigo-600 font-medium mt-1">{profile.email}</p>
                            {profile.maNhanVien && (
                              <div className="inline-flex items-center gap-1.5 mt-2 px-3 py-1 bg-indigo-50 text-indigo-700 rounded-full text-xs font-semibold">
                                <GraduationCap className="w-3.5 h-3.5" />
                                Mã giảng viên: {profile.maNhanVien}
                              </div>
                            )}
                          </div>
                          {/* Action buttons */}
                          <div className="flex gap-2 sm:ml-auto">
                            {!isEditing ? (
                              <button
                                onClick={() => setIsEditing(true)}
                                className="flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-indigo-600 to-violet-600 text-white rounded-xl hover:from-indigo-700 hover:to-violet-700 font-semibold text-sm shadow-lg shadow-indigo-200 transition-all duration-200 hover:shadow-xl hover:shadow-indigo-300 hover:-translate-y-0.5"
                              >
                                <Edit className="w-4 h-4" />Chỉnh sửa
                              </button>
                            ) : (
                              <>
                                <button onClick={handleCancelInfo} className="flex items-center gap-2 px-5 py-2.5 bg-gray-100 text-gray-600 rounded-xl hover:bg-gray-200 font-semibold text-sm transition-all duration-200">
                                  <X className="w-4 h-4" />Hủy
                                </button>
                                <button
                                  onClick={handleSaveInfo}
                                  disabled={saving}
                                  className="flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-emerald-600 to-teal-600 text-white rounded-xl hover:from-emerald-700 hover:to-teal-700 font-semibold text-sm shadow-lg shadow-emerald-200 transition-all duration-200 hover:shadow-xl hover:shadow-emerald-300 hover:-translate-y-0.5 disabled:opacity-50 disabled:hover:translate-y-0"
                                >
                                  <Save className="w-4 h-4" />{saving ? 'Đang lưu...' : 'Lưu thay đổi'}
                                </button>
                              </>
                            )}
                          </div>
                        </div>

                        {/* Stats row */}
                        <div className="flex flex-wrap justify-center sm:justify-start gap-3 mt-5 pt-5 border-t border-gray-100">
                          {[
                            { Icon: BookOpen, label: 'Giảng dạy', value: profile.ngayNhanViec ? `${new Date().getFullYear() - new Date(profile.ngayNhanViec).getFullYear()} năm` : '—' },
                            { Icon: Award, label: 'Vai trò', value: 'Giảng viên' },
                            { Icon: Shield, label: 'Tài khoản', value: 'Hoạt động' },
                          ].map(({ Icon, label, value }) => (
                            <div key={label} className="flex items-center gap-2 rounded-full border border-indigo-100 bg-indigo-50/70 px-3 py-1.5 text-indigo-700">
                              <Icon className="w-4 h-4" />
                              <span className="text-xs text-indigo-500">{label}:</span>
                              <span className="text-sm font-semibold text-indigo-900">{value}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>

                    {/* Avatar upload in edit mode */}
                    {isEditing && (
                      <div className="mt-4 p-4 bg-gray-50 rounded-xl border border-gray-200 space-y-3">
                        <p className="flex items-center gap-2 text-sm font-medium text-gray-600">
                          <ImageIcon className="w-4 h-4" />Ảnh đại diện
                        </p>
                        <div className="flex items-center gap-4">
                          {editAvatarUrl ? (
                            <img
                              src={editAvatarUrl}
                              alt="Preview"
                              className="w-16 h-16 rounded-full object-cover border-2 border-indigo-200 shrink-0"
                              onError={e => { (e.target as HTMLImageElement).style.display = 'none'; }}
                            />
                          ) : (
                            <div className="w-16 h-16 rounded-full bg-gradient-to-br from-violet-500 to-indigo-600 flex items-center justify-center shrink-0">
                              <span className="text-white text-xl font-bold">{getInitials(profile.hoTen)}</span>
                            </div>
                          )}
                          <div className="flex-1 min-w-0">
                            <input
                              ref={fileInputRef}
                              type="file"
                              accept="image/*"
                              className="hidden"
                              onChange={handleAvatarFileChange}
                            />
                            <button
                              type="button"
                              onClick={() => fileInputRef.current?.click()}
                              className="inline-flex items-center gap-2 px-4 py-2 bg-indigo-50 text-indigo-700 border border-indigo-200 rounded-xl hover:bg-indigo-100 text-sm font-medium transition-colors"
                            >
                              <ImageIcon className="w-4 h-4" />
                              Chọn ảnh
                            </button>
                            <p className="text-xs text-gray-400 mt-1.5">JPG, PNG, GIF, WEBP · Tối đa 2MB</p>
                            {avatarUploadError && (
                              <p className="text-xs text-red-500 font-medium mt-1 flex items-center gap-1">
                                <AlertCircle className="w-3.5 h-3.5" />{avatarUploadError}
                              </p>
                            )}
                            {editAvatarUrl && !avatarUploadError && (
                              <button
                                type="button"
                                onClick={() => { setEditAvatarUrl(''); if (fileInputRef.current) fileInputRef.current.value = ''; }}
                                className="text-xs text-red-400 hover:text-red-600 mt-1 flex items-center gap-1 transition-colors"
                              >
                                <X className="w-3 h-3" />Xóa ảnh
                              </button>
                            )}
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                </div>

                {/* ── Info Grid Cards ───────────────────────────────────────── */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">

                  {/* Contact Info Card */}
                  <div className="lg:col-span-2 bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
                    <div className="px-6 py-4 border-b border-gray-100 flex items-center gap-3 bg-gradient-to-r from-slate-50 to-white">
                      <div className="w-9 h-9 bg-indigo-100 rounded-xl flex items-center justify-center">
                        <User className="w-4.5 h-4.5 text-indigo-600" />
                      </div>
                      <div>
                        <h3 className="font-semibold text-gray-900">Thông tin liên hệ</h3>
                        <p className="text-xs text-gray-500">Thông tin cá nhân và liên lạc</p>
                      </div>
                    </div>
                    <div className="p-6">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                        <InfoField label="Họ và tên" Icon={User}>
                          <input
                            type="text"
                            value={editHoTen}
                            onChange={e => setEditHoTen(e.target.value)}
                            disabled={!isEditing}
                            className={editInputCls(isEditing)}
                          />
                        </InfoField>

                        <InfoField label="Email" Icon={Mail} error={infoErrors.email}>
                          <input
                            type="email"
                            value={editEmail}
                            onChange={e => { setEditEmail(e.target.value); setInfoErrors(p => ({ ...p, email: '' })); }}
                            disabled={!isEditing}
                            className={editInputCls(isEditing, !!infoErrors.email)}
                          />
                        </InfoField>

                        <InfoField label="Số điện thoại" Icon={Phone} error={infoErrors.phone}>
                          <input
                            type="tel"
                            value={editPhone}
                            onChange={e => { setEditPhone(e.target.value); setInfoErrors(p => ({ ...p, phone: '' })); }}
                            disabled={!isEditing}
                            className={editInputCls(isEditing, !!infoErrors.phone)}
                          />
                        </InfoField>

                        <InfoField label="Địa chỉ" Icon={MapPin}>
                          <input
                            type="text"
                            value={editDiaChi}
                            onChange={e => setEditDiaChi(e.target.value)}
                            disabled={!isEditing}
                            className={editInputCls(isEditing)}
                          />
                        </InfoField>

                        <InfoField label="Giới tính" Icon={Users}>
                          {isEditing ? (
                            <select
                              value={editGioiTinh}
                              onChange={e => setEditGioiTinh(e.target.value as 'NAM' | 'NU' | '')}
                              className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent bg-white appearance-none cursor-pointer"
                            >
                              <option value="">Chọn giới tính</option>
                              <option value="NAM">Nam</option>
                              <option value="NU">Nữ</option>
                            </select>
                          ) : (
                            <div className={staticValueCls}>
                              {profile.gioiTinh === 'NAM' ? 'Nam' : profile.gioiTinh === 'NU' ? 'Nữ' : '—'}
                            </div>
                          )}
                        </InfoField>

                        <InfoField label="Ngày sinh" Icon={Calendar}>
                          <input
                            type="date"
                            value={editNgaySinh}
                            onChange={e => setEditNgaySinh(e.target.value)}
                            disabled={!isEditing}
                            className={editInputCls(isEditing)}
                          />
                        </InfoField>
                      </div>
                    </div>
                  </div>

                  {/* Sidebar: Professional Info */}
                  <div className="space-y-5">
                    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
                      <div className="px-6 py-4 border-b border-gray-100 flex items-center gap-3 bg-gradient-to-r from-emerald-50 to-white">
                        <div className="w-9 h-9 bg-emerald-100 rounded-xl flex items-center justify-center">
                          <Briefcase className="w-4.5 h-4.5 text-emerald-600" />
                        </div>
                        <div>
                          <h3 className="font-semibold text-gray-900">Chuyên môn</h3>
                          <p className="text-xs text-gray-500">Thông tin công việc</p>
                        </div>
                      </div>
                      <div className="p-5 space-y-4">
                        {[
                          { label: 'Mã nhân viên', value: profile.maNhanVien || '—', icon: GraduationCap },
                          { label: 'Tên đăng nhập', value: profile.userName || '—', icon: User },
                          { label: 'Ngày nhận việc', value: profile.ngayNhanViec ? new Date(profile.ngayNhanViec).toLocaleDateString('vi-VN') : '—', icon: CalendarIcon },
                          { label: 'CCCD', value: profile.cccd || '—', icon: Shield },
                        ].map(({ label, value, icon: Icon }) => (
                          <div key={label} className="flex items-center justify-between">
                            <div className="flex items-center gap-2.5">
                              <div className="w-7 h-7 bg-gray-100 rounded-lg flex items-center justify-center">
                                <Icon className="w-3.5 h-3.5 text-gray-500" />
                              </div>
                              <span className="text-xs text-gray-500 font-medium">{label}</span>
                            </div>
                            <span className="text-sm font-semibold text-gray-800">{value}</span>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Quick Tips Card */}
                    <div className="bg-gradient-to-br from-amber-50 to-orange-50 rounded-2xl border border-amber-100 p-5">
                      <div className="flex items-center gap-2 mb-3">
                        <TrendingUp className="w-4.5 h-4.5 text-amber-600" />
                        <h4 className="font-semibold text-amber-800 text-sm">Mẹo bảo mật</h4>
                      </div>
                      <ul className="space-y-2">
                        {[
                          'Sử dụng mật khẩu mạnh với ít nhất 8 ký tự',
                          'Kết hợp chữ hoa, chữ thường và số',
                          'Thay đổi mật khẩu định kỳ 3 tháng/lần',
                          'Không chia sẻ thông tin đăng nhập',
                        ].map((tip, i) => (
                          <li key={i} className="flex items-start gap-2 text-xs text-amber-700">
                            <CheckCircle className="w-3.5 h-3.5 mt-0.5 text-amber-500 shrink-0" />
                            {tip}
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* ── TAB: Đổi mật khẩu ─────────────────────────────────────────── */}
            {activeTab === 'password' && (
              <div className="max-w-xl mx-auto animate-in fade-in duration-300">
                <div className="bg-white rounded-3xl shadow-sm border border-gray-100 overflow-hidden">
                  {/* Header */}
                  <div className="relative overflow-hidden px-8 py-8 bg-gradient-to-r from-amber-500 via-orange-500 to-red-500">
                    <div className="absolute inset-0 opacity-10">
                      <div className="absolute -top-10 -right-10 w-40 h-40 bg-white rounded-full"></div>
                      <div className="absolute -bottom-16 -left-8 w-32 h-32 bg-white rounded-full"></div>
                    </div>
                    <div className="relative flex items-center gap-4">
                      <div className="w-14 h-14 bg-white/20 backdrop-blur-sm rounded-2xl flex items-center justify-center">
                        <Lock className="w-7 h-7 text-white" />
                      </div>
                      <div>
                        <h2 className="text-2xl font-bold text-white">Thay đổi mật khẩu</h2>
                        <p className="text-orange-100 text-sm mt-0.5">Bảo vệ tài khoản của bạn với mật khẩu mạnh</p>
                      </div>
                    </div>
                  </div>

                  <form onSubmit={handleChangePassword} className="p-8 space-y-6">
                    {/* Old Password */}
                    <div className="space-y-2">
                      <label className="flex items-center gap-2 text-sm font-semibold text-gray-700">
                        <Lock className="w-4 h-4 text-gray-400" />
                        Mật khẩu cũ
                        <span className="text-red-500">*</span>
                      </label>
                      <div className="relative">
                        <input
                          type={showOld ? 'text' : 'password'}
                          value={oldPassword}
                          onChange={e => { setOldPassword(e.target.value); setPwdErrors(p => ({ ...p, oldPassword: '' })); }}
                          className={`w-full px-4 py-3.5 pr-12 border rounded-xl focus:outline-none focus:ring-2 transition-all ${pwdErrors.oldPassword ? 'border-red-400 bg-red-50 focus:ring-red-400' : 'border-gray-200 focus:ring-amber-400 focus:border-amber-400'
                            }`}
                          placeholder="Nhập mật khẩu hiện tại"
                        />
                        <button type="button" onClick={() => setShowOld(v => !v)} className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors">
                          {showOld ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                        </button>
                      </div>
                      {pwdErrors.oldPassword && <ErrorMsg msg={pwdErrors.oldPassword} />}
                    </div>

                    {/* New Password */}
                    <div className="space-y-2">
                      <label className="flex items-center gap-2 text-sm font-semibold text-gray-700">
                        <Lock className="w-4 h-4 text-gray-400" />
                        Mật khẩu mới
                        <span className="text-red-500">*</span>
                      </label>
                      <div className="relative">
                        <input
                          type={showNew ? 'text' : 'password'}
                          value={newPassword}
                          onChange={e => { setNewPassword(e.target.value); setPwdErrors(p => ({ ...p, newPassword: '' })); }}
                          className={`w-full px-4 py-3.5 pr-12 border rounded-xl focus:outline-none focus:ring-2 transition-all ${pwdErrors.newPassword ? 'border-red-400 bg-red-50 focus:ring-red-400' : 'border-gray-200 focus:ring-amber-400 focus:border-amber-400'
                            }`}
                          placeholder="Nhập mật khẩu mới"
                        />
                        <button type="button" onClick={() => setShowNew(v => !v)} className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors">
                          {showNew ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                        </button>
                      </div>

                      {/* Strength meter */}
                      {newPassword && (
                        <div className="mt-3 space-y-2">
                          <div className="flex gap-1.5">
                            {[1, 2, 3, 4, 5].map(i => (
                              <div
                                key={i}
                                className={`h-1.5 flex-1 rounded-full transition-all duration-300 ${i <= strength.level ? strength.color : 'bg-gray-100'
                                  }`}
                              />
                            ))}
                          </div>
                          <div className="flex items-center justify-between">
                            <p className="text-xs text-gray-500">Độ mạnh mật khẩu</p>
                            <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${strength.bgColor} ${strength.textColor}`}>
                              {strength.label}
                            </span>
                          </div>
                        </div>
                      )}
                      {pwdErrors.newPassword && <ErrorMsg msg={pwdErrors.newPassword} />}
                    </div>

                    {/* Confirm Password */}
                    <div className="space-y-2">
                      <label className="flex items-center gap-2 text-sm font-semibold text-gray-700">
                        <Lock className="w-4 h-4 text-gray-400" />
                        Xác nhận mật khẩu mới
                        <span className="text-red-500">*</span>
                      </label>
                      <div className="relative">
                        <input
                          type={showConfirm ? 'text' : 'password'}
                          value={confirmPassword}
                          onChange={e => { setConfirmPassword(e.target.value); setPwdErrors(p => ({ ...p, confirmPassword: '' })); }}
                          className={`w-full px-4 py-3.5 pr-12 border rounded-xl focus:outline-none focus:ring-2 transition-all ${pwdErrors.confirmPassword ? 'border-red-400 bg-red-50 focus:ring-red-400' : 'border-gray-200 focus:ring-amber-400 focus:border-amber-400'
                            }`}
                          placeholder="Nhập lại mật khẩu mới"
                        />
                        <button type="button" onClick={() => setShowConfirm(v => !v)} className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors">
                          {showConfirm ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                        </button>
                      </div>
                      {pwdErrors.confirmPassword && <ErrorMsg msg={pwdErrors.confirmPassword} />}
                    </div>

                    {/* Password requirements */}
                    <div className="bg-gray-50 rounded-xl p-4 space-y-1.5">
                      <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">Yêu cầu mật khẩu</p>
                      {[
                        { check: newPassword.length >= 8, text: 'Ít nhất 8 ký tự' },
                        { check: /[A-Z]/.test(newPassword), text: 'Ít nhất 1 chữ hoa (A-Z)' },
                        { check: /[a-z]/.test(newPassword), text: 'Ít nhất 1 chữ thường (a-z)' },
                        { check: /\d/.test(newPassword), text: 'Ít nhất 1 chữ số (0-9)' },
                      ].map(({ check, text }) => (
                        <div key={text} className="flex items-center gap-2">
                          <div className={`w-4 h-4 rounded-full flex items-center justify-center transition-colors ${check ? 'bg-emerald-500' : 'bg-gray-200'}`}>
                            {check && <CheckCircle className="w-3 h-3 text-white" />}
                          </div>
                          <span className={`text-xs ${check ? 'text-emerald-600 font-medium' : 'text-gray-500'}`}>{text}</span>
                        </div>
                      ))}
                    </div>

                    <button
                      type="submit"
                      disabled={pwdSaving}
                      className="w-full flex items-center justify-center gap-2 bg-gradient-to-r from-amber-500 via-orange-500 to-red-500 text-white py-3.5 rounded-xl hover:from-amber-600 hover:via-orange-600 hover:to-red-600 transition-all duration-200 font-semibold shadow-lg shadow-orange-200 hover:shadow-xl hover:shadow-orange-300 hover:-translate-y-0.5 disabled:opacity-50 disabled:hover:translate-y-0"
                    >
                      {pwdSaving ? (
                        <>
                          <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                          Đang xử lý...
                        </>
                      ) : (
                        <>
                          <Lock className="w-4 h-4" />
                          Đổi mật khẩu
                        </>
                      )}
                    </button>
                  </form>
                </div>
              </div>
            )}

            {/* ── TAB: Lịch dạy ──────────────────────────────────────────────── */}
            {activeTab === 'schedule' && (
              <div className="space-y-5 animate-in fade-in duration-300">
                {/* Week Navigation */}
                <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-4 flex flex-col sm:flex-row items-center gap-4">
                  <div className="flex items-center gap-3">
                    <button
                      onClick={() => setCurrentWeek(w => w - 1)}
                      className="w-10 h-10 flex items-center justify-center bg-gray-100 hover:bg-gray-200 rounded-xl transition-colors"
                    >
                      <ChevronLeft className="w-5 h-5 text-gray-600" />
                    </button>
                    <div className="text-center min-w-[180px]">
                      <h3 className="font-bold text-gray-900 text-base">
                        {currentWeek === 0 ? 'Tuần hiện tại' : currentWeek > 0 ? `+${currentWeek} tuần` : `${Math.abs(currentWeek)} tuần trước`}
                      </h3>
                      <p className="text-sm text-gray-500 mt-0.5">{fmt2(monday)} — {fmt2(sunday)}</p>
                    </div>
                    <button
                      onClick={() => setCurrentWeek(w => w + 1)}
                      className="w-10 h-10 flex items-center justify-center bg-gray-100 hover:bg-gray-200 rounded-xl transition-colors"
                    >
                      <ChevronRightIcon className="w-5 h-5 text-gray-600" />
                    </button>
                  </div>
                  <div className="h-px sm:h-8 sm:w-px bg-gray-200 w-full sm:w-auto order-first sm:order-none"></div>
                  <div className="flex items-center gap-3 w-full sm:w-auto justify-center">
                    <button
                      onClick={() => setCurrentWeek(0)}
                      className={`flex-1 sm:flex-none px-5 py-2.5 rounded-xl font-semibold text-sm transition-all duration-200 ${currentWeek === 0
                        ? 'bg-gradient-to-r from-indigo-600 to-violet-600 text-white shadow-lg shadow-indigo-200'
                        : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                        }`}
                    >
                      Hôm nay
                    </button>
                  </div>
                </div>

                {/* Schedule Grid */}
                <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
                  <div className="grid grid-cols-8">
                    {/* Header row */}
                    <div className="p-4 bg-gradient-to-b from-slate-50 to-white border-b border-gray-100 flex items-center justify-center">
                      <span className="text-xs font-bold text-gray-400 uppercase tracking-wider">Giờ</span>
                    </div>
                    {weekDates.map((date, i) => {
                      const isToday = date.toDateString() === new Date().toDateString();
                      return (
                        <div
                          key={i}
                          className={`p-4 text-center border-b border-l border-gray-100 transition-colors ${isToday
                            ? 'bg-gradient-to-b from-indigo-50 to-indigo-50/30'
                            : 'bg-gradient-to-b from-slate-50 to-white'
                            }`}
                        >
                          <div className="font-bold text-gray-700 text-sm">{dayNames[date.getDay()]}</div>
                          <div className={`text-base font-bold mt-1 ${isToday ? 'text-indigo-600' : 'text-gray-500'}`}>
                            {fmt2(date).split('/')[0]}
                          </div>
                          <div className={`text-xs ${isToday ? 'text-indigo-500' : 'text-gray-400'}`}>
                            {fmt2(date).split('/')[1]}
                          </div>
                          {isToday && <div className="w-1.5 h-1.5 bg-indigo-500 rounded-full mx-auto mt-1"></div>}
                        </div>
                      );
                    })}

                    {/* Time rows */}
                    {[
                      { hour: '07:00', label: 'Sáng 1' },
                      { hour: '09:00', label: 'Sáng 2' },
                      { hour: '11:00', label: 'Trưa' },
                      { hour: '13:00', label: 'Chiều 1' },
                      { hour: '15:00', label: 'Chiều 2' },
                      { hour: '17:00', label: 'Tối' },
                    ].map(({ hour, label }) => {
                      const [hStr] = hour.split(':');
                      return (
                        <div key={hour} className="contents">
                          <div className="p-3 border-b border-r border-gray-100 bg-gradient-to-r from-slate-50 to-white flex flex-col items-center justify-center">
                            <span className="text-sm font-bold text-gray-700">{hour}</span>
                            <span className="text-[10px] text-gray-400 font-medium">{label}</span>
                          </div>
                          {weekDates.map((date, di) => {
                            const dayEvents = getEventsForDay(date).filter(e => e.gioBatDau.startsWith(hStr));
                            const isToday = date.toDateString() === new Date().toDateString();
                            return (
                              <div
                                key={di}
                                className={`p-2 border-b border-l border-gray-100 min-h-[100px] transition-colors ${isToday ? 'bg-indigo-50/20' : ''
                                  }`}
                              >
                                {dayEvents.map((e, ei) => {
                                  const c = colorIdx(ei);
                                  return (
                                    <div
                                      key={e.lichId}
                                      className={`w-full p-3 rounded-xl mb-1.5 ${c.bg} border ${c.border} hover:shadow-md transition-shadow cursor-pointer group`}
                                    >
                                      <div className="flex items-start justify-between">
                                        <div className={`font-bold text-xs ${c.text}`}>{e.maLopHocPhan}</div>
                                      </div>
                                      <div className={`text-xs font-medium ${c.text} mt-0.5 truncate`}>{e.tenMonHoc}</div>
                                      <div className="flex items-center gap-1 mt-1.5 text-[11px] text-gray-500">
                                        <Clock className="w-3 h-3 shrink-0" />
                                        {e.gioBatDau} – {e.gioKetThuc}
                                      </div>
                                      <div className="flex items-center gap-1 text-[11px] text-gray-500">
                                        <DoorOpen className="w-3 h-3 shrink-0" />
                                        {e.phong} – {e.toaNha}
                                      </div>
                                    </div>
                                  );
                                })}
                              </div>
                            );
                          })}
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* Empty state */}
                {schedule.length === 0 && (
                  <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-12 text-center">
                    <div className="w-16 h-16 bg-gray-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
                      <CalendarIcon className="w-8 h-8 text-gray-400" />
                    </div>
                    <h3 className="text-lg font-semibold text-gray-700">Không có lịch dạy</h3>
                    <p className="text-gray-400 text-sm mt-1">Tuần này không có lịch giảng dạy nào được phân công</p>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* ── Toast Notification ────────────────────────────────────────────── */}
      {toast && (
        <div className="fixed bottom-8 left-1/2 -translate-x-1/2 z-50 animate-in slide-in-from-bottom-5 fade-in duration-300">
          <div className={`flex items-center gap-3 px-6 py-4 rounded-2xl shadow-2xl backdrop-blur-sm border ${toast.type === 'success'
            ? 'bg-emerald-500/95 text-white border-emerald-400/30'
            : 'bg-red-500/95 text-white border-red-400/30'
            }`}>
            {toast.type === 'success'
              ? <CheckCircle className="w-6 h-6" />
              : <AlertCircle className="w-6 h-6" />}
            <span className="font-semibold text-base">{toast.msg}</span>
          </div>
        </div>
      )}

      <button className="fixed bottom-8 right-8 w-16 h-16 hover:scale-110 transition-transform duration-200 z-40" aria-label="AI Assistant">
        <AiAssistantButton />
      </button>
    </div>
  );
}

// ── Helper sub-components ──────────────────────────────────────────────────

function InfoField({ label, Icon, error, children }: {
  label: string;
  Icon: ComponentType<{ className?: string }>;
  error?: string;
  children: ReactNode;
}) {
  return (
    <div className="space-y-1.5">
      <label className="flex items-center gap-2 text-xs font-semibold text-gray-500 uppercase tracking-wider">
        <Icon className="w-3.5 h-3.5" />{label}
      </label>
      {children}
      {error && <ErrorMsg msg={error} />}
    </div>
  );
}

function ErrorMsg({ msg }: { msg: string }) {
  return (
    <p className="flex items-center gap-1.5 mt-1 text-xs text-red-500 font-medium">
      <AlertCircle className="w-3.5 h-3.5" />
      {msg}
    </p>
  );
}

function editInputCls(editable: boolean, hasError = false) {
  if (!editable) return 'w-full px-4 py-3 bg-gray-50/70 border border-gray-100 rounded-xl text-gray-600 cursor-not-allowed text-sm font-medium';
  return `w-full px-4 py-3 border rounded-xl focus:outline-none focus:ring-2 transition-all text-sm font-medium ${hasError ? 'border-red-400 bg-red-50 focus:ring-red-400' : 'border-gray-200 focus:ring-indigo-400 focus:border-indigo-400 hover:border-indigo-300'
    }`;
}

const staticValueCls = 'w-full px-4 py-3 bg-gray-50/70 border border-gray-100 rounded-xl text-gray-700 cursor-not-allowed text-sm font-medium';
