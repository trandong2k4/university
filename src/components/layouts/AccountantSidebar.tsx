import { BarChart3, Bell, DollarSign, LayoutDashboard, User } from 'lucide-react';
import { RoleSidebar, type RoleSidebarGroup } from './RoleSidebar';

const ACCOUNTANT_MENU_GROUPS: RoleSidebarGroup[] = [
  {
    defaultOpen: true,
    items: [
      {
        id: 'dashboard',
        icon: <LayoutDashboard className="h-4 w-4" />,
        label: 'Dashboard',
        path: '/accountant/dashboard',
        exact: true,
      },
      { id: 'reports', icon: <BarChart3 className="h-4 w-4" />, label: 'Báo cáo thống kê', path: '/accountant/reports' },
      { id: 'tuition', icon: <DollarSign className="h-4 w-4" />, label: 'Quản lý học phí', path: '/accountant/tuition' },
      { id: 'notifications', icon: <Bell className="h-4 w-4" />, label: 'Thông báo học phí', path: '/accountant/notifications' },
      { id: 'profile', icon: <User className="h-4 w-4" />, label: 'Hồ sơ cá nhân', path: '/accountant/profile' },
    ],
  },
];

export function AccountantSidebar() {
  return <RoleSidebar roleLabel="Kế toán viên" menuGroups={ACCOUNTANT_MENU_GROUPS} />;
}
