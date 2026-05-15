import { Search, Bell, User, LogOut } from 'lucide-react';
import { useState } from 'react';
import { useNavigate } from 'react-router';
import { useAuth } from '@/hooks';
import { LogoutConfirmDialog } from '@/components/common/LogoutConfirmDialog';

interface InstructorHeaderProps {
  title: string;
}

export function InstructorHeader({ title }: InstructorHeaderProps) {
  const navigate = useNavigate();
  const { logout } = useAuth();
  const [showProfileMenu, setShowProfileMenu] = useState(false);
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);

  const confirmLogout = async () => {
    await logout();
    navigate('/');
  };

  const handleProfile = () => {
    navigate('/lecturer/profile');
    setShowProfileMenu(false);
  };

  return (
    <header className="h-16 bg-slate-900 border-b border-slate-800 flex items-center justify-between px-6 shadow-lg">
      <div className="flex items-center gap-4">
        <h1 className="text-xl font-bold text-white" style={{ fontFamily: "'Sora', sans-serif" }}>{title}</h1>
      </div>

      <div className="flex items-center gap-4">
        {/* Search */}
        <div className="relative hidden md:block">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
          <input
            type="text"
            placeholder="Tìm kiếm..."
            className="pl-10 pr-4 py-2 w-64 bg-slate-800 border border-slate-700 text-white placeholder-slate-400 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
          />
        </div>

        {/* Notifications */}
        <button className="relative p-2 text-slate-300 hover:bg-slate-800 hover:text-white rounded-lg transition-colors">
          <Bell className="w-6 h-6" />
          <span className="absolute top-1 right-1 w-2 h-2 bg-emerald-500 rounded-full"></span>
        </button>

        {/* Profile Dropdown */}
        <div className="relative">
          <button
            onClick={() => setShowProfileMenu(!showProfileMenu)}
            className="flex items-center gap-2 p-2 text-slate-300 hover:bg-slate-800 hover:text-white rounded-lg transition-colors"
          >
            <div className="w-8 h-8 bg-emerald-600 rounded-full flex items-center justify-center">
              <User className="w-5 h-5 text-white" />
            </div>
          </button>

          {showProfileMenu && (
            <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-xl border border-slate-200 py-2 z-50">
              <button
                onClick={handleProfile}
                className="w-full px-4 py-2 text-left text-slate-700 hover:bg-slate-100 flex items-center gap-2"
              >
                <User className="w-4 h-4" />
                Hồ sơ cá nhân
              </button>
              <div className="border-t border-slate-200 my-1"></div>
              <button
                onClick={() => {
                  setShowProfileMenu(false);
                  setShowLogoutConfirm(true);
                }}
                className="w-full px-4 py-2 text-left text-red-600 hover:bg-red-50 flex items-center gap-2"
              >
                <LogOut className="w-4 h-4" />
                Đăng xuất
              </button>
            </div>
          )}
        </div>
      </div>
      <LogoutConfirmDialog
        open={showLogoutConfirm}
        onCancel={() => setShowLogoutConfirm(false)}
        onConfirm={confirmLogout}
      />
    </header>
  );
}
