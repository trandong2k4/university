import { useAuth } from '@/hooks';
import { useNavigate } from 'react-router';
import { useEffect } from 'react';

interface ProtectedRouteProps {
  children: React.ReactNode;
  requiredRole?: string;
  requiredPermission?: string | string[];
}

export function ProtectedRoute({ children, requiredRole, requiredPermission }: ProtectedRouteProps) {
  const { isAuthenticated, user, isLoading } = useAuth();
  const navigate = useNavigate();

  const isUnauthorized = (() => {
    if (requiredRole && user?.role !== requiredRole) return true;
    if (!requiredPermission) return false;
    const required = Array.isArray(requiredPermission) ? requiredPermission : [requiredPermission];
    const userPerms = user?.permissions ?? [];
    const hasAny = required.some(r => userPerms.includes(r));
    return !hasAny;
  })();

  useEffect(() => {
    // Only redirect after session has been fully restored from localStorage
    if (isLoading) return;

    if (!isAuthenticated) {
      sessionStorage.setItem('lastVisitedPath', window.location.pathname);
      navigate('/', { replace: true });
      return;
    }
    if (isUnauthorized) {
      navigate('/', { replace: true });
    }
  }, [isLoading, isAuthenticated, isUnauthorized, navigate]);

  // Show loading spinner while session is being restored from localStorage
  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Đang tải...</p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated || isUnauthorized) {
    return null;
  }

  return <>{children}</>;
}
