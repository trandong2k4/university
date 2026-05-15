import { useState } from 'react';
import { useSearchParams, useNavigate } from 'react-router';
import { ResetPasswordForm } from '@/components/forms/ResetPasswordForm';
import { PasswordResetSuccess } from '@/components/forms/PasswordResetSuccess';
import { GraduationCap, AlertCircle } from 'lucide-react';

export default function ResetPasswordPage() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const token = searchParams.get('token') ?? '';
  const [resetSuccess, setResetSuccess] = useState(false);

  const handleBackToLogin = () => navigate('/', { replace: true });

  return (
    <div className="size-full flex">
      {/* Left Side – decorative (hidden on small screens) */}
      <div className="hidden lg:flex lg:w-1/2 xl:w-3/5 bg-gradient-to-br from-blue-600 to-blue-800 items-center justify-center p-12">
        <div className="text-center text-white">
          <div className="inline-flex items-center gap-4 mb-8">
            <div className="bg-white/20 backdrop-blur p-4 rounded-2xl">
              <GraduationCap className="w-12 h-12 text-white" />
            </div>
            <h1 className="text-4xl font-bold">Learning Hub</h1>
          </div>
          <p className="text-xl text-blue-100 max-w-md leading-relaxed">
            Đặt lại mật khẩu để tiếp tục truy cập hệ thống của bạn
          </p>
        </div>
      </div>

      {/* Right Side – form */}
      <div className="w-full lg:w-1/2 xl:w-2/5 flex items-center justify-center p-8 bg-gray-50">
        <div className="w-full max-w-md">
          {/* Mobile logo */}
          <div className="lg:hidden mb-8 text-center">
            <div className="inline-flex items-center gap-3 mb-4">
              <div className="bg-gradient-to-br from-blue-600 to-blue-700 p-3 rounded-2xl shadow-lg">
                <GraduationCap className="w-8 h-8 text-white" />
              </div>
              <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-blue-800 bg-clip-text text-transparent">
                Learning Hub
              </h1>
            </div>
          </div>

          {resetSuccess ? (
            <PasswordResetSuccess onBackToLogin={handleBackToLogin} />
          ) : !token ? (
            <div className="bg-white rounded-2xl shadow-xl p-8 border border-gray-100 text-center">
              <div className="mx-auto w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mb-4">
                <AlertCircle className="w-8 h-8 text-red-600" />
              </div>
              <h2 className="text-2xl font-bold text-gray-900 mb-2">Liên kết không hợp lệ</h2>
              <p className="text-gray-600 mb-6">
                Token đặt lại mật khẩu không tìm thấy hoặc đã hết hạn.
                Vui lòng yêu cầu lại liên kết đặt lại mật khẩu.
              </p>
              <button
                onClick={handleBackToLogin}
                className="w-full bg-gradient-to-r from-blue-600 to-blue-700 text-white py-3 px-4 rounded-lg font-medium hover:from-blue-700 hover:to-blue-800 transition-all shadow-lg"
              >
                Quay lại đăng nhập
              </button>
            </div>
          ) : (
            <ResetPasswordForm
              token={token}
              onSuccess={() => setResetSuccess(true)}
              onCancel={handleBackToLogin}
            />
          )}

          <div className="mt-6 text-center text-sm text-gray-500">
            <p>© 2026 Learning Hub. All rights reserved.</p>
          </div>
        </div>
      </div>
    </div>
  );
}
