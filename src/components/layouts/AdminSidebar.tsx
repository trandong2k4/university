import {
  BarChart3,
  Bell,
  BookMarked,
  BookOpen,
  Calendar,
  CalendarDays,
  Clock,
  DollarSign,
  FileText,
  Key,
  LayoutDashboard,
  MapPin,
  MessageCircle,
  School,
  UserCheck,
  UserCog,
  Users,
} from 'lucide-react';
import { RoleSidebar, type RoleSidebarGroup } from './RoleSidebar';

interface AdminSidebarProps {
  activeMenu?: string;
}

const ADMIN_MENU_GROUPS: RoleSidebarGroup[] = [
  {
    title: 'TỔNG QUAN',
    defaultOpen: true,
    items: [
      {
        id: 'dashboard',
        icon: <LayoutDashboard className="h-4 w-4" />,
        label: 'Dashboard',
        path: '/admin/dashboard',
        exact: true,
      },
    ],
  },
  {
    title: 'QUẢN LÝ PHÂN QUYỀN',
    defaultOpen: true,
    items: [
      { id: 'users', icon: <Users className="h-4 w-4" />, label: 'Người dùng', path: '/admin/users' },
      { id: 'staff', icon: <UserCog className="h-4 w-4" />, label: 'Nhân viên', path: '/admin/staff' },
      { id: 'students', icon: <School className="h-4 w-4" />, label: 'Học viên', path: '/admin/students' },
      { id: 'roles', icon: <UserCheck className="h-4 w-4" />, label: 'Vai trò', path: '/admin/roles' },
      { id: 'permissions', icon: <Key className="h-4 w-4" />, label: 'Quyền', path: '/admin/permissions' },
      // {
      //   id: 'permissions-assign',
      //   icon: <Users className="h-4 w-4" />,
      //   label: 'Gán vai trò',
      //   path: '/admin/permissions-assign',
      // },
      {
        id: 'role-permissions',
        icon: <Key className="h-4 w-4" />,
        label: 'Gán quyền cho vai trò',
        path: '/admin/role-permissions',
      },
      // {
      //   id: 'authorization',
      //   icon: <FileText className="h-4 w-4" />,
      //   label: 'Ma trận phân quyền',
      //   path: '/admin/authorization',
      // },
    ],
  },
  {
    title: 'QUẢN LÝ ĐÀO TẠO',
    defaultOpen: true,
    items: [
      // { id: 'schools', icon: <School className="h-4 w-4" />, label: 'Trường / Cơ sở', path: '/admin/schools' },
      {
        id: 'departments',
        icon: <BookOpen className="h-4 w-4" />,
        label: 'Khoa / Ngành / Môn',
        path: '/admin/departments',
      },
      { id: 'rooms', icon: <MapPin className="h-4 w-4" />, label: 'Phòng học', path: '/admin/rooms' },
      { id: 'semesters', icon: <Calendar className="h-4 w-4" />, label: 'Học kỳ', path: '/admin/hoc-ki' },
      { id: 'periods', icon: <Clock className="h-4 w-4" />, label: 'Giờ học', path: '/admin/gio-hoc' },
      { id: 'classes', icon: <Calendar className="h-4 w-4" />, label: 'Lớp học phần', path: '/admin/classes' },
      { id: 'schedules', icon: <CalendarDays className="h-4 w-4" />, label: 'Lịch học', path: '/admin/schedules' },
      { id: 'teaching', icon: <UserCheck className="h-4 w-4" />, label: 'Quản lý giảng dạy', path: '/admin/teaching' },
      {
        id: 'credit-registrations',
        icon: <FileText className="h-4 w-4" />,
        label: 'Đăng ký tín chỉ',
        path: '/admin/credit-registrations',
      },
      // { id: 'submissions', icon: <FileText className="h-4 w-4" />, label: 'Bài làm học viên', path: '/admin/submissions' },
      {
        id: 'chuong-trinh-dao-tao',
        icon: <BookMarked className="h-4 w-4" />,
        label: 'Chương trình đào tạo',
        path: '/admin/chuong-trinh-dao-tao',
      },
    ],
  },
  {
    title: 'TÀI CHÍNH',
    defaultOpen: true,
    items: [
      { id: 'tuition', icon: <DollarSign className="h-4 w-4" />, label: 'Học phí', path: '/admin/tuition' },
      { id: 'reports', icon: <BarChart3 className="h-4 w-4" />, label: 'Báo cáo', path: '/admin/reports' },
    ],
  },
  {
    title: 'HỆ THỐNG',
    defaultOpen: true,
    items: [
      { id: 'contacts', icon: <MessageCircle className="h-4 w-4" />, label: 'Liên hệ', path: '/admin/contacts' },
      { id: 'notifications', icon: <Bell className="h-4 w-4" />, label: 'Thông báo hệ thống', path: '/admin/notifications' },
      { id: 'content', icon: <FileText className="h-4 w-4" />, label: 'Nội dung', path: '/admin/content' },
    ],
  },
];

export function AdminSidebar(_props: AdminSidebarProps) {
  return <RoleSidebar roleLabel="Admin Panel" menuGroups={ADMIN_MENU_GROUPS} />;
}
