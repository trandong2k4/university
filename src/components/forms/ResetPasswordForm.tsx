import { useState } from 'react';
import { Lock, Key, Eye, EyeOff, CheckCircle2, XCircle, Loader2 } from 'lucide-react';
import authApi from '@/api/auth';
import { getErrorMessage } from '@/utils';

interface ResetPasswordFormProps {
  /** Token từ email link (nếu có). Nếu không có, hiển thị ô nhập token. */
  token?: string;
  onSuccess: () => void;
  onCancel: () => void;
}

export function ResetPasswordForm({ token: tokenProp, onSuccess, onCancel }: ResetPasswordFormProps) {
  const [token, setToken]                 = useState(tokenProp ?? '');
  const [newPassword, setNewPassword]     = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isLoading, setIsLoading]         = useState(false);
  const [apiError, setApiError]           = useState('');
  const [errors, setErrors]               = useState<{
    token?: string;
    newPassword?: string;
    confirmPassword?: string;
  }>({});

  const validatePasswordStrength = (password: string) => {
    const validations = {
      length:    password.length >= 8,
      uppercase: /[A-Z]/.test(password),
      lowercase: /[a-z]/.test(password),
      number:    /[0-9]/.test(password),
      special:   /[!@#$%^&*(),.?":{}|<>@$!%*?&._-]/.test(password),
    };
    return { validations, strength: Object.values(validations).filter(Boolean).length };
  };

  const passwordStrength = validatePasswordStrength(newPassword);

  const getStrengthColor = (s: number) =>
    s <= 2 ? 'bg-red-500' : s <= 3 ? 'bg-yellow-500' : s <= 4 ? 'bg-blue-500' : 'bg-green-500';

  const getStrengthText = (s: number) =>
    s <= 2 ? 'Yếu' : s <= 3 ? 'Trung bình' : s <= 4 ? 'Mạnh' : 'Rất mạnh';

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const newErrors: typeof errors = {};

    if (!token.trim()) newErrors.token = 'Vui lòng nhập mã xác nhận từ email';
    if (newPassword.length < 8) newErrors.newPassword = 'Mật khẩu phải có ít nhất 8 ký tự';
    if (passwordStrength.strength < 3) newErrors.newPassword = 'Mật khẩu quá yếu';
    if (!confirmPassword) newErrors.confirmPassword = 'Vui lòng xác nhận mật khẩu';
    if (newPassword !== confirmPassword) newErrors.confirmPassword = 'Mật khẩu xác nhận không khớp';

    setErrors(newErrors);
    if (Object.keys(newErrors).length > 0) return;

    setIsLoading(true);
    setApiError('');
    try {
      await authApi.resetPassword({ token: token.trim(), newPassword, confirmPassword });
      onSuccess();
    } catch (err) {
      setApiError(getErrorMessage(err));
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="w-full max-w-lg mx-auto px-4">
      <div className="bg-white rounded-2xl shadow-xl p-8 border border-gray-100">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="mx-auto w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mb-4">
            <Lock className="w-8 h-8 text-blue-600" />
          </div>
          <h2 className="text-3xl font-bold text-gray-900 mb-2">Đặt lại mật khẩu</h2>
          <p className="text-gray-600">Nhập mã xác nhận từ email và mật khẩu mới</p>
        </div>

        {apiError && (
          <div className="mb-6 bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-lg text-sm flex items-start gap-2">
            <span>⚠️</span>
            <span>{apiError}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Token Input — ẩn nếu token đã được truyền qua prop */}
          {!tokenProp && (
            <div>
              <label htmlFor="reset-token" className="block text-sm font-medium text-gray-700 mb-2">
                Mã xác nhận (từ email)
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Key className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  id="reset-token"
                  type="text"
                  value={token}
                  onChange={(e) => { setToken(e.target.value); setErrors({ ...errors, token: undefined }); }}
                  className={`block w-full pl-10 pr-3 py-3 border ${
                    errors.token ? 'border-red-300' : 'border-gray-300'
                  } rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all font-mono text-sm`}
                  placeholder="Dán mã từ email vào đây"
                  disabled={isLoading}
                />
              </div>
              {errors.token && (
                <p className="mt-1 text-sm text-red-600 flex items-center gap-1">
                  <XCircle className="w-4 h-4" />{errors.token}
                </p>
              )}
            </div>
          )}

          {/* New Password */}
          <div>
            <label htmlFor="new-password" className="block text-sm font-medium text-gray-700 mb-2">
              Mật khẩu mới
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Lock className="h-5 w-5 text-gray-400" />
              </div>
              <input
                id="new-password"
                type={showNewPassword ? 'text' : 'password'}
                value={newPassword}
                onChange={(e) => { setNewPassword(e.target.value); setErrors({ ...errors, newPassword: undefined }); }}
                className={`block w-full pl-10 pr-12 py-3 border ${
                  errors.newPassword ? 'border-red-300' : 'border-gray-300'
                } rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all`}
                placeholder="Nhập mật khẩu mới"
                required
                disabled={isLoading}
              />
              <button type="button" onClick={() => setShowNewPassword(!showNewPassword)}
                className="absolute inset-y-0 right-0 pr-3 flex items-center" disabled={isLoading}>
                {showNewPassword ? <EyeOff className="h-5 w-5 text-gray-400" /> : <Eye className="h-5 w-5 text-gray-400" />}
              </button>
            </div>

            {newPassword && (
              <div className="mt-3">
                <div className="flex items-center justify-between mb-1">
                  <span className="text-xs text-gray-600">Độ mạnh:</span>
                  <span className={`text-xs font-semibold ${
                    passwordStrength.strength <= 2 ? 'text-red-600' :
                    passwordStrength.strength <= 3 ? 'text-yellow-600' :
                    passwordStrength.strength <= 4 ? 'text-blue-600' : 'text-green-600'
                  }`}>{getStrengthText(passwordStrength.strength)}</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2 mb-2">
                  <div className={`h-2 rounded-full transition-all ${getStrengthColor(passwordStrength.strength)}`}
                    style={{ width: `${(passwordStrength.strength / 5) * 100}%` }} />
                </div>
                <div className="grid grid-cols-2 gap-1">
                  {[
                    { key: 'length',    label: 'Ít nhất 8 ký tự' },
                    { key: 'uppercase', label: 'Chữ in hoa (A-Z)' },
                    { key: 'lowercase', label: 'Chữ thường (a-z)' },
                    { key: 'number',    label: 'Số (0-9)' },
                    { key: 'special',   label: 'Ký tự đặc biệt' },
                  ].map(({ key, label }) => (
                    <div key={key} className={`flex items-center gap-1 text-xs ${
                      passwordStrength.validations[key as keyof typeof passwordStrength.validations] ? 'text-green-600' : 'text-gray-400'
                    }`}>
                      {passwordStrength.validations[key as keyof typeof passwordStrength.validations]
                        ? <CheckCircle2 className="w-3 h-3" /> : <XCircle className="w-3 h-3" />}
                      {label}
                    </div>
                  ))}
                </div>
              </div>
            )}
            {errors.newPassword && (
              <p className="mt-1 text-sm text-red-600 flex items-center gap-1">
                <XCircle className="w-4 h-4" />{errors.newPassword}
              </p>
            )}
          </div>

          {/* Confirm Password */}
          <div>
            <label htmlFor="confirm-password" className="block text-sm font-medium text-gray-700 mb-2">
              Xác nhận mật khẩu
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Lock className="h-5 w-5 text-gray-400" />
              </div>
              <input
                id="confirm-password"
                type={showConfirmPassword ? 'text' : 'password'}
                value={confirmPassword}
                onChange={(e) => { setConfirmPassword(e.target.value); setErrors({ ...errors, confirmPassword: undefined }); }}
                className={`block w-full pl-10 pr-12 py-3 border ${
                  errors.confirmPassword ? 'border-red-300' : 'border-gray-300'
                } rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all`}
                placeholder="Nhập lại mật khẩu mới"
                required
                disabled={isLoading}
              />
              <button type="button" onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                className="absolute inset-y-0 right-0 pr-3 flex items-center" disabled={isLoading}>
                {showConfirmPassword ? <EyeOff className="h-5 w-5 text-gray-400" /> : <Eye className="h-5 w-5 text-gray-400" />}
              </button>
            </div>
            {confirmPassword && (
              <p className={`mt-1 text-sm flex items-center gap-1 ${newPassword === confirmPassword ? 'text-green-600' : 'text-red-600'}`}>
                {newPassword === confirmPassword
                  ? <><CheckCircle2 className="w-4 h-4" /> Mật khẩu khớp</>
                  : <><XCircle className="w-4 h-4" /> Mật khẩu không khớp</>}
              </p>
            )}
            {errors.confirmPassword && (
              <p className="mt-1 text-sm text-red-600 flex items-center gap-1">
                <XCircle className="w-4 h-4" />{errors.confirmPassword}
              </p>
            )}
          </div>

          <button type="submit" disabled={isLoading}
            className="w-full bg-gradient-to-r from-blue-600 to-blue-700 text-white py-3 px-4 rounded-lg font-medium hover:from-blue-700 hover:to-blue-800 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 shadow-lg">
            {isLoading
              ? <><Loader2 className="h-5 w-5 animate-spin" /><span>Đang xử lý...</span></>
              : <span>Xác nhận đổi mật khẩu</span>}
          </button>

          <button type="button" onClick={onCancel} disabled={isLoading}
            className="w-full text-gray-600 hover:text-gray-800 py-2 font-medium transition-colors">
            Hủy bỏ
          </button>
        </form>

        <div className="mt-6 pt-6 border-t border-gray-200">
          <p className="text-xs text-gray-500 text-center">
            🔒 Mật khẩu phải có ít nhất 8 ký tự, gồm chữ hoa, chữ thường, số và ký tự đặc biệt.
          </p>
        </div>
      </div>
    </div>
  );
}
