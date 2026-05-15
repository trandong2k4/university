import { AccountantSidebar } from '@/components/layouts/AccountantSidebar';
import { AccountantHeader } from '@/components/layouts/AccountantHeader';
import { useState, useEffect } from 'react';
import { User, Lock, Save, RefreshCw, Eye, EyeOff } from 'lucide-react';
import {
  accountingApi,
  type AccountingProfileResponse,
  type AccountingProfileRequest,
  type AccountingChangePasswordRequest
} from '@/api/accounting/accounting.api';
import { useAsync } from '@/hooks';
import { Toast } from '@/components/notification/Toast';

export default function AccountantProfilePage() {
  const [toast, setToast] = useState<{ type: 'success' | 'error'; message: string } | null>(null);
  const [activeTab, setActiveTab] = useState<'profile' | 'password'>('profile');
  const [editing, setEditing] = useState(false);
  const [saving, setSaving] = useState(false);

  const [form, setForm] = useState<AccountingProfileRequest>({
    hoTen: '', diaChi: '', soDienThoai: '', gioiTinh: undefined, ngaySinh: undefined
  });

  const [pwForm, setPwForm] = useState<AccountingChangePasswordRequest>({
    currentPassword: '', newPassword: ''
  });
  const [confirmPw, setConfirmPw] = useState('');
  const [showPw, setShowPw] = useState({ current: false, newPw: false, confirm: false });
  const [changingPw, setChangingPw] = useState(false);

  const { data: profile, loading, error: profileError, execute: reload } = useAsync<AccountingProfileResponse | null>(
    () => accountingApi.getProfile(),
    null
  );

  useEffect(() => {
    if (profile) {
      setForm({
        hoTen: profile.hoTen ?? '',
        diaChi: profile.diaChi ?? '',
        soDienThoai: profile.soDienThoai ?? '',
        gioiTinh: profile.gioiTinh ?? undefined,
        ngaySinh: profile.ngaySinh ?? undefined,
      });
    }
  }, [profile]);

  const saveProfile = async () => {
    if (form.soDienThoai && form.soDienThoai.length !== 10) {
      setToast({ type: 'error', message: 'Số điện thoại phải đủ 10 số' });
      return;
    }
    setSaving(true);
    try {
      await accountingApi.updateProfile(form);
      setToast({ type: 'success', message: 'Cập nhật hồ sơ thành công!' });
      setEditing(false);
      reload();
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Cập nhật thất bại';
      setToast({ type: 'error', message: msg });
    } finally {
      setSaving(false);
    }
  };

  const changePassword = async () => {
    if (!pwForm.currentPassword || !pwForm.newPassword) {
      setToast({ type: 'error', message: 'Vui lòng điền đầy đủ thông tin' });
      return;
    }
    if (pwForm.newPassword !== confirmPw) {
      setToast({ type: 'error', message: 'Mật khẩu mới không khớp' });
      return;
    }
    if (pwForm.newPassword.length < 6) {
      setToast({ type: 'error', message: 'Mật khẩu mới phải có ít nhất 6 ký tự' });
      return;
    }
    setChangingPw(true);
    try {
      await accountingApi.changePassword(pwForm);
      setToast({ type: 'success', message: 'Đổi mật khẩu thành công!' });
      setPwForm({ currentPassword: '', newPassword: '' });
      setConfirmPw('');
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Đổi mật khẩu thất bại';
      setToast({ type: 'error', message: msg });
    } finally {
      setChangingPw(false);
    }
  };

  const cancelEdit = () => {
    if (profile) {
      setForm({
        hoTen: profile.hoTen ?? '',
        diaChi: profile.diaChi ?? '',
        soDienThoai: profile.soDienThoai ?? '',
        gioiTinh: profile.gioiTinh ?? undefined,
        ngaySinh: profile.ngaySinh ?? undefined,
      });
    }
    setEditing(false);
  };

  const inputCls = (disabled: boolean) =>
    `w-full border rounded-lg px-3 py-2 text-sm focus:outline-none transition-colors ${
      disabled
        ? 'border-slate-200 bg-slate-50 text-slate-600 cursor-default'
        : 'border-slate-300 bg-white focus:ring-2 focus:ring-emerald-500'
    }`;

  return (
    <div className="flex h-screen bg-stone-50">
      <AccountantSidebar />
      <div className="flex-1 ml-64 flex flex-col">
        <AccountantHeader title="Hồ sơ kế toán" />
        <div className="flex-1 overflow-auto p-6">
          <div className="max-w-2xl mx-auto space-y-6">

            {/* Avatar + name banner */}
            {profile && (
              <div className="bg-gradient-to-br from-slate-900 via-slate-800 to-emerald-900 rounded-2xl p-6 text-white flex items-center gap-5">
                <div className="w-16 h-16 rounded-2xl bg-emerald-600 flex items-center justify-center text-2xl font-bold shadow-lg">
                  {(profile.hoTen?.[0] ?? 'K').toUpperCase()}
                </div>
                <div>
                  <h2 className="text-xl font-bold" style={{ fontFamily: "'Sora', sans-serif" }}>
                    {profile.hoTen}
                  </h2>
                  <p className="text-slate-300 text-sm">{profile.email}</p>
                  {profile.maNhanVien && (
                    <p className="text-slate-400 text-xs mt-0.5">Mã NV: {profile.maNhanVien}</p>
                  )}
                </div>
              </div>
            )}

            {/* Tabs */}
            <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-1 flex gap-1 w-fit">
              <button
                onClick={() => setActiveTab('profile')}
                className={`px-5 py-2 rounded-lg text-sm font-medium transition-colors flex items-center gap-2 ${
                  activeTab === 'profile' ? 'bg-emerald-600 text-white shadow-sm' : 'text-slate-600 hover:bg-slate-50'
                }`}
              >
                <User className="w-4 h-4" /> Thông tin cá nhân
              </button>
              <button
                onClick={() => setActiveTab('password')}
                className={`px-5 py-2 rounded-lg text-sm font-medium transition-colors flex items-center gap-2 ${
                  activeTab === 'password' ? 'bg-emerald-600 text-white shadow-sm' : 'text-slate-600 hover:bg-slate-50'
                }`}
              >
                <Lock className="w-4 h-4" /> Đổi mật khẩu
              </button>
            </div>

            {/* Profile Tab */}
            {activeTab === 'profile' && (
              <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6 space-y-5">
                <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                  <h3 className="font-semibold text-slate-900">Thông tin cá nhân</h3>
                  {!editing ? (
                    <button
                      onClick={() => setEditing(true)}
                      className="px-4 py-1.5 text-sm border border-slate-300 text-slate-600 rounded-lg hover:bg-slate-50 transition-colors"
                    >
                      Chỉnh sửa
                    </button>
                  ) : (
                    <div className="flex gap-2">
                      <button
                        onClick={cancelEdit}
                        className="px-4 py-1.5 text-sm border border-slate-300 text-slate-600 rounded-lg hover:bg-slate-50"
                      >
                        Hủy
                      </button>
                      <button
                        onClick={saveProfile} disabled={saving}
                        className="px-4 py-1.5 text-sm bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 disabled:opacity-50 flex items-center gap-2"
                      >
                        {saving ? <RefreshCw className="w-3 h-3 animate-spin" /> : <Save className="w-3 h-3" />}
                        Lưu
                      </button>
                    </div>
                  )}
                </div>

                {loading ? (
                  <div className="space-y-4">
                    {[1,2,3,4].map(i => (
                      <div key={i} className="animate-pulse">
                        <div className="h-4 bg-slate-200 rounded w-1/4 mb-2" />
                        <div className="h-10 bg-slate-100 rounded" />
                      </div>
                    ))}
                  </div>
                ) : profileError ? (
                  <div className="flex flex-col items-center gap-3 py-10 text-center">
                    <p className="text-red-500 text-sm font-medium">Không thể tải thông tin hồ sơ</p>
                    <p className="text-slate-400 text-xs">Vui lòng đăng xuất và đăng nhập lại để làm mới phiên</p>
                    <button onClick={reload} className="mt-2 px-4 py-2 text-sm border border-slate-300 rounded-lg hover:bg-slate-50 text-slate-600 transition-colors">
                      Thử lại
                    </button>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {/* Read-only fields */}
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-xs font-medium text-slate-500 mb-1">Tên đăng nhập</label>
                        <input value={profile?.userName ?? ''} disabled className={inputCls(true)} />
                      </div>
                      <div>
                        <label className="block text-xs font-medium text-slate-500 mb-1">Email</label>
                        <input value={profile?.email ?? ''} disabled className={inputCls(true)} />
                      </div>
                    </div>

                    <div>
                      <label className="block text-xs font-medium text-slate-500 mb-1">Họ và tên *</label>
                      <input
                        value={form.hoTen} disabled={!editing}
                        onChange={e => setForm(f => ({ ...f, hoTen: e.target.value }))}
                        className={inputCls(!editing)}
                      />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-xs font-medium text-slate-500 mb-1">Số điện thoại</label>
                        <input
                          value={form.soDienThoai ?? ''} disabled={!editing}
                          maxLength={10}
                          onChange={e => {
                            const v = e.target.value.replace(/\D/g, '').slice(0, 10);
                            setForm(f => ({ ...f, soDienThoai: v }));
                          }}
                          className={`${inputCls(!editing)} ${editing && form.soDienThoai && form.soDienThoai.length !== 10 ? 'border-red-400 focus:ring-red-400' : ''}`}
                        />
                        {editing && form.soDienThoai && form.soDienThoai.length !== 10 && (
                          <p className="text-xs text-red-500 mt-1">Số điện thoại phải đủ 10 số</p>
                        )}
                      </div>
                      <div>
                        <label className="block text-xs font-medium text-slate-500 mb-1">Ngày sinh</label>
                        <input
                          type="date" value={form.ngaySinh ?? ''} disabled
                          className={inputCls(true)}
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-xs font-medium text-slate-500 mb-1">Giới tính</label>
                        {!editing ? (
                          <input
                            value={form.gioiTinh === 'NAM' ? 'Nam' : form.gioiTinh === 'NU' ? 'Nữ' : '—'}
                            disabled className={inputCls(true)}
                          />
                        ) : (
                          <select
                            value={form.gioiTinh ?? ''}
                            onChange={e => setForm(f => ({ ...f, gioiTinh: (e.target.value || undefined) as 'NAM' | 'NU' | undefined }))}
                            className={inputCls(false)}
                          >
                            <option value="">-- Chọn --</option>
                            <option value="NAM">Nam</option>
                            <option value="NU">Nữ</option>
                          </select>
                        )}
                      </div>
                      {profile?.maNhanVien && (
                        <div>
                          <label className="block text-xs font-medium text-slate-500 mb-1">Mã nhân viên</label>
                          <input value={profile.maNhanVien} disabled className={inputCls(true)} />
                        </div>
                      )}
                    </div>

                    <div>
                      <label className="block text-xs font-medium text-slate-500 mb-1">Địa chỉ</label>
                      <input
                        value={form.diaChi ?? ''} disabled={!editing}
                        onChange={e => setForm(f => ({ ...f, diaChi: e.target.value }))}
                        className={inputCls(!editing)}
                      />
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Password Tab */}
            {activeTab === 'password' && (
              <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6 space-y-5">
                <div className="pb-3 border-b border-slate-100">
                  <h3 className="font-semibold text-slate-900">Đổi mật khẩu</h3>
                  <p className="text-xs text-slate-500 mt-1">Mật khẩu mới phải có ít nhất 6 ký tự</p>
                </div>

                <div className="space-y-4">
                  {(
                    [
                      { label: 'Mật khẩu hiện tại', key: 'current' as const, value: pwForm.currentPassword, onChange: (v: string) => setPwForm(f => ({ ...f, currentPassword: v })) },
                      { label: 'Mật khẩu mới', key: 'newPw' as const, value: pwForm.newPassword, onChange: (v: string) => setPwForm(f => ({ ...f, newPassword: v })) },
                      { label: 'Xác nhận mật khẩu mới', key: 'confirm' as const, value: confirmPw, onChange: setConfirmPw },
                    ]
                  ).map(field => (
                    <div key={field.key}>
                      <label className="block text-xs font-medium text-slate-500 mb-1">{field.label}</label>
                      <div className="relative">
                        <input
                          type={showPw[field.key] ? 'text' : 'password'}
                          value={field.value}
                          onChange={e => field.onChange(e.target.value)}
                          className="w-full border border-slate-300 rounded-lg px-3 py-2 pr-10 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
                        />
                        <button
                          type="button"
                          onClick={() => setShowPw(s => ({ ...s, [field.key]: !s[field.key] }))}
                          className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                        >
                          {showPw[field.key] ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                        </button>
                      </div>
                    </div>
                  ))}
                </div>

                <button
                  onClick={changePassword} disabled={changingPw}
                  className="w-full py-2.5 bg-emerald-600 text-white text-sm font-medium rounded-lg hover:bg-emerald-700 disabled:opacity-50 flex items-center justify-center gap-2 transition-colors"
                >
                  {changingPw ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Lock className="w-4 h-4" />}
                  Đổi mật khẩu
                </button>
              </div>
            )}

          </div>
        </div>
      </div>
      {toast && <Toast type={toast.type} message={toast.message} onClose={() => setToast(null)} />}
    </div>
  );
}
