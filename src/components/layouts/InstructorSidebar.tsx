import {
  Award,
  BarChart3,
  Bell,
  BookOpen,
  ClipboardList,
  FileText,
  LayoutDashboard,
  MessageCircle,
  User,
  UserCheck,
} from 'lucide-react';
import { RoleSidebar, type RoleSidebarGroup } from './RoleSidebar';

const INSTRUCTOR_MENU_GROUPS: RoleSidebarGroup[] = [
  {
    defaultOpen: true,
    items: [
      {
        id: 'dashboard',
        path: '/lecturer/dashboard',
        icon: <LayoutDashboard className="h-4 w-4" />,
        label: 'Dashboard',
        exact: true,
      },
      { id: 'profile', path: '/lecturer/profile', icon: <User className="h-4 w-4" />, label: 'Hồ sơ/Lịch dạy' },
      { id: 'classes', path: '/lecturer/classes', icon: <BookOpen className="h-4 w-4" />, label: 'Lớp học phần' },
      { id: 'documents', path: '/lecturer/documents', icon: <FileText className="h-4 w-4" />, label: 'Tài liệu' },
      { id: 'assignments', path: '/lecturer/assignments', icon: <ClipboardList className="h-4 w-4" />, label: 'Bài tập' },
      { id: 'quiz', path: '/lecturer/quiz', icon: <Award className="h-4 w-4" />, label: 'Bài kiểm tra' },
      { id: 'grades', path: '/lecturer/grades', icon: <BarChart3 className="h-4 w-4" />, label: 'Quản lý điểm' },
      { id: 'attendance', path: '/lecturer/attendance', icon: <UserCheck className="h-4 w-4" />, label: 'Điểm danh' },
      { id: 'chatbot', path: '/lecturer/chatbot', icon: <MessageCircle className="h-4 w-4" />, label: 'Trợ lý AI' },
      { id: 'notifications', path: '/lecturer/notifications', icon: <Bell className="h-4 w-4" />, label: 'Thông báo' },
    ],
  },
];

export function InstructorSidebar() {
  return <RoleSidebar roleLabel="Giảng viên" menuGroups={INSTRUCTOR_MENU_GROUPS} />;
}
