import { CheckCircle, ArrowRight } from 'lucide-react';

interface PasswordResetSuccessProps {
  onBackToLogin: () => void;
}

export function PasswordResetSuccess({ onBackToLogin }: PasswordResetSuccessProps) {
  return (
    <div className="w-full max-w-lg mx-auto px-4">
      <div className="bg-white rounded-2xl shadow-xl p-12 text-center border border-gray-100">
        {/* Success Icon */}
        <div className="relative mx-auto w-24 h-24 mb-6">
          <div className="absolute inset-0 bg-green-100 rounded-full animate-pulse" />
          <div className="absolute inset-3 bg-green-200 rounded-full opacity-60 animate-pulse" />
          <div className="absolute inset-0 flex items-center justify-center">
            <CheckCircle className="w-16 h-16 text-green-600" strokeWidth={2} />
          </div>
        </div>

        {/* Success Message */}
        <h2 className="text-3xl font-bold text-gray-900 mb-3">
          Đổi mật khẩu thành công!
        </h2>
        <p className="text-gray-600 mb-8 text-lg">
          Mật khẩu của bạn đã được cập nhật. Bạn có thể đăng nhập với mật khẩu mới ngay bây giờ.
        </p>

        {/* Login Button */}
        <button
          onClick={onBackToLogin}
          className="w-full bg-gradient-to-r from-blue-600 to-blue-700 text-white py-4 px-6 rounded-xl font-semibold hover:from-blue-700 hover:to-blue-800 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-all shadow-lg hover:shadow-xl flex items-center justify-center gap-3 text-lg"
        >
          <span>Đăng nhập ngay</span>
          <ArrowRight className="w-5 h-5" />
        </button>

        {/* Security Tip */}
        <div className="mt-8 bg-blue-50 border border-blue-100 rounded-lg p-4">
          <p className="text-sm text-blue-800">
            💡 <strong>Mẹo bảo mật:</strong> Không chia sẻ mật khẩu với bất kỳ ai và thay đổi mật khẩu định kỳ.
          </p>
        </div>
      </div>
    </div>
  );
}
