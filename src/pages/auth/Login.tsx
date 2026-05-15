import { useState, useEffect, useRef } from 'react';
import { useNavigate, useLocation, useSearchParams } from 'react-router';
import { LoginForm } from '@/components/forms/LoginForm';
import { LoginIllustration } from '@/components/common/LoginIllustration';
import { ForgotPasswordForm } from '@/components/forms/ForgotPasswordForm';
import { EmailSentNotification } from '@/components/notification/EmailSentNotification';
import { ResetPasswordForm } from '@/components/forms/ResetPasswordForm';
import { PasswordResetSuccess } from '@/components/forms/PasswordResetSuccess';
import {
  Zap,
  UserCheck,
} from 'lucide-react';
import { LearningHubMark } from '@/components/common/LearningHubMark';
import { useAuth } from '@/hooks';
import authApi from '@/api/auth';

export default function Login() {
  const navigate = useNavigate();
  const location = useLocation();
  const [searchParams] = useSearchParams();
  const { isAuthenticated, user, isLoading, switchRole } = useAuth();
  const hasNavigated = useRef(false);

  const [showForgotPassword, setShowForgotPassword] = useState(false);
  const [showEmailSent, setShowEmailSent] = useState(false);
  const [showResetPassword, setShowResetPassword] = useState(false);
  const [showResetSuccess, setShowResetSuccess] = useState(false);
  const [sentEmail, setSentEmail] = useState('');
  const [isRedirecting, setIsRedirecting] = useState(false);
  const [showRoleSelect, setShowRoleSelect] = useState(false);

  useEffect(() => {
    const token = searchParams.get('token');
    if (token) {
      navigate(`/reset-password?token=${token}`, { replace: true });
    }
  }, [navigate, searchParams]);

  const getUserRoles = (): string[] => {
    const rawRoles =
      (user as any)?.roles ||
      (user as any)?.roleList ||
      (user as any)?.authorities ||
      [];

    if (Array.isArray(rawRoles) && rawRoles.length > 0) {
      const normalizedRoles = rawRoles
        .map((role: any) => {
          if (typeof role === 'string') return role;

          return (
            role?.name ||
            role?.roleName ||
            role?.maRole ||
            role?.code ||
            role?.authority ||
            role?.role
          );
        })
        .filter(Boolean)
        .map((role: string) => role.toUpperCase().replace('ROLE_', ''));

      return Array.from(new Set(normalizedRoles));
    }

    return user?.role ? [user.role.toUpperCase().replace('ROLE_', '')] : [];
  };

  const getRoleLabel = (role: string) => {
    switch (role?.toUpperCase()) {
      case 'ADMIN':
        return 'Quản trị viên';
      case 'STUDENT':
        return 'Học viên';
      case 'LECTURER':
        return 'Giảng viên';
      case 'ACCOUNTANT':
        return 'Kế toán viên';
      default:
        return role;
    }
  };

  const getDashboardByRole = (role: string) => {
    switch (role?.toUpperCase().replace('ROLE_', '')) {
      case 'STUDENT':
        return '/student/dashboard';
      case 'LECTURER':
        return '/lecturer/dashboard';
      case 'ADMIN':
        return '/admin/dashboard';
      case 'ACCOUNTANT':
        return '/accountant/dashboard';
      default:
        return '/';
    }
  };

  const handleSelectRole = (role: string) => {
    const normalizedRole = role.toUpperCase().replace('ROLE_', '');

    sessionStorage.setItem('selectedRole', normalizedRole);
    switchRole(normalizedRole);
    setShowRoleSelect(false);
    hasNavigated.current = true;
    setIsRedirecting(true);

    setTimeout(() => {
      navigate(getDashboardByRole(normalizedRole), { replace: true });
    }, 100);
  };

  useEffect(() => {
    if (!isAuthenticated) {
      hasNavigated.current = false;
      setIsRedirecting(false);
      setShowRoleSelect(false);
      sessionStorage.removeItem('selectedRole');
    }
  }, [isAuthenticated]);

  useEffect(() => {
    if (isLoading) return;
    if (location.pathname !== '/' && location.pathname !== '/login') return;
    if (!isAuthenticated || !user || hasNavigated.current) return;

    const roles = getUserRoles();

    if (roles.length > 1) {
      const selectedRole = sessionStorage.getItem('selectedRole');

      if (!selectedRole) {
        setShowRoleSelect(true);
        return;
      }

      switchRole(selectedRole);
      hasNavigated.current = true;
      setIsRedirecting(true);

      const timer = setTimeout(() => {
        navigate(getDashboardByRole(selectedRole), { replace: true });
      }, 100);

      return () => clearTimeout(timer);
    }

    hasNavigated.current = true;
    setIsRedirecting(true);

    const lastVisited = sessionStorage.getItem('lastVisitedPath');
    let redirectPath: string;

    if (lastVisited && lastVisited !== '/' && lastVisited !== '/login') {
      redirectPath = lastVisited;
      sessionStorage.removeItem('lastVisitedPath');
    } else {
      redirectPath = getDashboardByRole(roles[0] || user.role);
    }

    const timer = setTimeout(() => navigate(redirectPath, { replace: true }), 100);
    return () => clearTimeout(timer);
  }, [isLoading, isAuthenticated, user, location.pathname, navigate, switchRole]);

  const handleForgotPasswordSuccess = (email: string) => {
    setSentEmail(email);
    setShowForgotPassword(false);
    setShowEmailSent(true);
  };

  const handleResetPasswordSuccess = () => {
    setShowResetPassword(false);
    setShowResetSuccess(true);
  };

  const handleResetPasswordCancel = () => {
    setShowResetPassword(false);
    setShowForgotPassword(false);
    setShowEmailSent(false);
    setSentEmail('');
  };

  const handleBackToLogin = () => {
    setShowForgotPassword(false);
    setShowEmailSent(false);
    setShowResetPassword(false);
    setShowResetSuccess(false);
    setSentEmail('');
  };

  if (isLoading) {
    return (
      <div className="size-full flex items-center justify-center bg-slate-50">
        <div className="text-center">
          <div className="relative mb-6">
            <div className="animate-ping absolute inset-0 bg-blue-500 rounded-full opacity-20 w-12 h-12 mx-auto" />
            <div className="animate-spin rounded-full h-12 w-12 border-[3px] border-blue-600 border-t-transparent mx-auto" />
          </div>
          <p className="text-gray-500 font-medium">Đang tải...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="h-screen max-h-screen [height:100dvh] [max-height:100dvh] w-full lg:grid lg:grid-cols-2 relative overflow-hidden bg-slate-50">
      <div className="hidden lg:block h-full overflow-hidden">
        <LoginIllustration />
      </div>

      <div className="h-full w-full flex items-center justify-center overflow-hidden p-5 sm:p-8 lg:px-10 xl:px-14 bg-slate-50 relative">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_20%,rgba(59,130,246,0.05),transparent_50%)]" />

        <div className="w-full max-w-[440px] relative z-10">
          <div className="lg:hidden mb-8 text-center">
            <div className="inline-flex items-center gap-3">
              <div className="bg-gradient-to-br from-blue-600 to-blue-700 p-3 rounded-2xl shadow-lg shadow-blue-500/25">
                <LearningHubMark className="w-8 h-8 text-white" />
              </div>

              <div className="text-left">
                <h1 className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-blue-800 bg-clip-text text-transparent">
                  LearningHub
                </h1>
                <p className="text-xs text-gray-500">Hệ thống Quản lý Đào tạo</p>
              </div>
            </div>
          </div>

          {showResetSuccess ? (
            <PasswordResetSuccess onBackToLogin={handleBackToLogin} />
          ) : showResetPassword ? (
            <ResetPasswordForm
              onSuccess={handleResetPasswordSuccess}
              onCancel={handleResetPasswordCancel}
            />
          ) : showEmailSent ? (
            <EmailSentNotification
              email={sentEmail}
              onBackToLogin={handleBackToLogin}
              onResend={async () => {
                await authApi.forgotPassword({ email: sentEmail });
              }}
            />
          ) : showForgotPassword ? (
            <ForgotPasswordForm
              onBack={handleBackToLogin}
              onSuccess={handleForgotPasswordSuccess}
            />
          ) : (
            <>
              <div className="bg-white rounded-3xl shadow-xl shadow-blue-900/5 p-7 xl:p-8 border border-gray-100 mb-5">
                <div className="mb-7">
                  <div className="flex items-center gap-2 mb-2">
                    <div className="h-1 w-8 bg-blue-600 rounded-full" />
                    <div className="h-1 w-4 bg-blue-300 rounded-full" />
                  </div>

                  <h2 className="text-2xl font-bold text-gray-900 mb-1">
                    {showRoleSelect ? 'Chọn vai trò' : 'Chào mừng trở lại'}
                  </h2>

                  <p className="text-gray-500 text-sm">
                    {showRoleSelect
                      ? 'Tài khoản của bạn có nhiều vai trò. Vui lòng chọn vai trò muốn sử dụng.'
                      : 'Đăng nhập để tiếp tục với LearningHub'}
                  </p>
                </div>

                {showRoleSelect ? (
                  <div className="space-y-3">
                    {getUserRoles().map((role) => (
                      <button
                        key={role}
                        type="button"
                        onClick={() => handleSelectRole(role)}
                        className="w-full flex items-center gap-3 rounded-xl border border-gray-200 px-4 py-3 text-left font-medium text-gray-700 hover:border-blue-500 hover:bg-blue-50 transition"
                      >
                        <div className="w-10 h-10 rounded-xl bg-blue-50 flex items-center justify-center text-blue-600">
                          <UserCheck className="w-5 h-5" />
                        </div>

                        <div>
                          <div className="font-semibold text-gray-900">
                            {getRoleLabel(role)}
                          </div>
                          <div className="text-xs text-gray-500">{role}</div>
                        </div>
                      </button>
                    ))}
                  </div>
                ) : (
                  <LoginForm onForgotPassword={() => setShowForgotPassword(true)} />
                )}
              </div>

              <div className="text-center">
                <div className="flex items-center justify-center gap-1.5 text-sm text-gray-400">
                  <Zap className="w-3.5 h-3.5" />
                  <span>2026 LearningHub. Mọi quyền được bảo lưu.</span>
                </div>
              </div>
            </>
          )}
        </div>
      </div>

      {isRedirecting && (
        <div className="fixed inset-0 bg-white/80 backdrop-blur-sm flex items-center justify-center z-50">
          <div className="text-center">
            <div className="relative mb-4 inline-block">
              <div className="animate-ping absolute inset-0 bg-blue-500 rounded-full opacity-20 w-12 h-12" />
              <div className="animate-spin rounded-full h-12 w-12 border-[3px] border-blue-600 border-t-transparent" />
            </div>
            <p className="text-gray-600 font-medium">Đang chuyển hướng...</p>
          </div>
        </div>
      )}
    </div>
  );
}
