import { ArrowLeft, CheckCircle2, Mail, Loader2 } from 'lucide-react';
import { useState } from 'react';

interface EmailSentNotificationProps {
  email: string;
  onBackToLogin: () => void;
  onResend?: () => Promise<void>;
}

export function EmailSentNotification({ email, onBackToLogin, onResend }: EmailSentNotificationProps) {
  const [resending, setResending] = useState(false);
  const [resendMessage, setResendMessage] = useState('');

  const handleResend = async () => {
    if (!onResend) return;
    setResending(true);
    setResendMessage('');
    try {
      await onResend();
      setResendMessage('Email đã được gửi lại. Vui lòng kiểm tra hộp thư.');
    } catch {
      setResendMessage('Vui lòng đợi vài phút trước khi gửi lại.');
    } finally {
      setResending(false);
    }
  };

  return (
    <div className="w-full max-w-2xl mx-auto px-4">
      {/* Main Card */}
      <div className="bg-white rounded-3xl shadow-2xl p-12 text-center border border-gray-100">
        {/* Animated Email Icon */}
        <div className="relative mx-auto w-32 h-32 mb-8">
          <div className="absolute inset-0 bg-blue-100 rounded-full animate-pulse" />
          <div className="absolute inset-4 bg-blue-200 rounded-full opacity-60 animate-pulse delay-75" />
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="relative">
              <Mail className="w-16 h-16 text-blue-600" strokeWidth={1.5} />
              <div className="absolute -bottom-2 -right-2 bg-green-500 rounded-full p-1.5 shadow-lg border-4 border-white">
                <CheckCircle2 className="w-5 h-5 text-white" strokeWidth={3} />
              </div>
            </div>
          </div>
        </div>

        {/* Title */}
        <h1 className="text-4xl font-bold text-gray-900 mb-4">
          Kiểm tra email của bạn
        </h1>

        {/* Description */}
        <p className="text-lg text-gray-600 mb-6 leading-relaxed max-w-md mx-auto">
          Chúng tôi đã gửi liên kết đặt lại mật khẩu đến
        </p>

        {/* Email Display */}
        <div className="bg-blue-50 border-2 border-blue-200 rounded-xl px-6 py-4 mb-8 inline-block">
          <p className="text-blue-800 font-semibold text-lg">{email}</p>
        </div>

        {/* Instructions */}
        <div className="bg-gray-50 rounded-xl p-6 mb-8 max-w-lg mx-auto">
          <div className="space-y-3 text-left">
            {[
              <>Mở email và tìm thư từ <span className="font-semibold">LearningHub</span></>,
              <>Nhấn vào liên kết <span className="font-semibold">"Đặt lại mật khẩu"</span></>,
              <>Tạo mật khẩu mới cho tài khoản của bạn</>,
            ].map((text, i) => (
              <div key={i} className="flex items-start gap-3">
                <div className="flex-shrink-0 w-6 h-6 bg-blue-600 text-white rounded-full flex items-center justify-center text-sm font-bold mt-0.5">
                  {i + 1}
                </div>
                <p className="text-gray-700">{text}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Spam notice */}
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-8 max-w-lg mx-auto">
          <p className="text-sm text-yellow-800 flex items-center justify-center gap-2">
            <span className="text-xl">💡</span>
            <span>
              Không thấy email? Hãy kiểm tra thư mục <span className="font-semibold">Spam</span> hoặc <span className="font-semibold">Junk</span>
            </span>
          </p>
        </div>

        {/* Resend feedback */}
        {resendMessage && (
          <p className="text-sm text-green-700 bg-green-50 border border-green-200 rounded-lg px-4 py-2 mb-4 max-w-md mx-auto">
            {resendMessage}
          </p>
        )}

        {/* Action Buttons */}
        <div className="space-y-3">
          <button
            onClick={onBackToLogin}
            className="w-full max-w-md mx-auto bg-gradient-to-r from-blue-600 to-blue-700 text-white py-4 px-6 rounded-xl font-semibold hover:from-blue-700 hover:to-blue-800 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-all shadow-lg hover:shadow-xl flex items-center justify-center gap-3 text-lg"
          >
            <ArrowLeft className="w-5 h-5" />
            <span>Quay lại đăng nhập</span>
          </button>

          {onResend && (
            <button
              onClick={handleResend}
              disabled={resending}
              className="w-full max-w-md mx-auto text-gray-600 hover:text-gray-800 py-3 px-6 rounded-xl font-medium transition-colors hover:bg-gray-50 disabled:opacity-50 flex items-center justify-center gap-2"
            >
              {resending ? (
                <><Loader2 className="w-4 h-4 animate-spin" /> Đang gửi lại...</>
              ) : (
                'Chưa nhận được email? Gửi lại'
              )}
            </button>
          )}
        </div>

        {/* Support */}
        <div className="mt-8 pt-6 border-t border-gray-200">
          <p className="text-sm text-gray-500">
            Cần trợ giúp?{' '}
            <a href="mailto:support@learninghub.com" className="text-blue-600 hover:text-blue-700 font-medium transition-colors">
              Liên hệ hỗ trợ
            </a>
          </p>
        </div>
      </div>

      {/* Footer Note */}
      <div className="mt-6 text-center">
        <p className="text-sm text-gray-500">
          Liên kết đặt lại mật khẩu sẽ hết hạn sau <span className="font-semibold text-gray-700">15 phút</span>
        </p>
      </div>
    </div>
  );
}
