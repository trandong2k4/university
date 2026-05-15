import {
  Award,
  Bell,
  BookCheck,
  Calendar,
  ClipboardList,
  DollarSign,
  FileText,
  GitBranch,
  LayoutDashboard,
  MessageCircle,
  Star,
  TrendingUp,
  User,
} from 'lucide-react';
import { RoleSidebar, type RoleSidebarGroup } from './RoleSidebar';

const STUDENT_MENU_GROUPS: RoleSidebarGroup[] = [
  {
    defaultOpen: true,
    items: [
      {
        id: 'dashboard',
        icon: <LayoutDashboard className="h-4 w-4" />,
        label: 'Dashboard',
        path: '/student/dashboard',
        exact: true,
      },
      { id: 'profile', icon: <User className="h-4 w-4" />, label: 'Hồ sơ cá nhân', path: '/student/profile' },
      { id: 'schedule', icon: <Calendar className="h-4 w-4" />, label: 'Lịch học', path: '/student/schedule' },
      { id: 'documents', icon: <FileText className="h-4 w-4" />, label: 'Tài liệu', path: '/student/documents' },
      { id: 'assignments', icon: <ClipboardList className="h-4 w-4" />, label: 'Bài tập', path: '/student/assignments' },
      { id: 'quiz', icon: <Award className="h-4 w-4" />, label: 'Quiz', path: '/student/quiz' },
      { id: 'register', icon: <BookCheck className="h-4 w-4" />, label: 'Đăng ký tín chỉ', path: '/student/register' },
      { id: 'progress', icon: <TrendingUp className="h-4 w-4" />, label: 'Tiến độ học tập', path: '/student/progress' },
      { id: 'tuition', icon: <DollarSign className="h-4 w-4" />, label: 'Học phí', path: '/student/tuition' },
      { id: 'rating', icon: <Star className="h-4 w-4" />, label: 'Đánh giá giảng viên', path: '/student/rating' },
      { id: 'chatbot', icon: <MessageCircle className="h-4 w-4" />, label: 'Chatbot AI', path: '/student/chatbot' },
      { id: 'notifications', icon: <Bell className="h-4 w-4" />, label: 'Thông báo', path: '/student/notifications' },
      { id: 'study-program', icon: <GitBranch className="h-4 w-4" />, label: 'Chương trình học', path: '/student/study-program' },
    ],
  },
];

export function StudentSidebar() {
  return <RoleSidebar roleLabel="Sinh viên" menuGroups={STUDENT_MENU_GROUPS} />;
}
