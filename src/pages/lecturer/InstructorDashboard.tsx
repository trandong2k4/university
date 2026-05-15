import { InstructorHeader } from '@/components/layouts/InstructorHeader';
import { InstructorSidebar } from '@/components/layouts/InstructorSidebar';
import { useAuth } from '@/hooks';
import AiAssistantButton from '@/imports/AiAssistantButton';
import lecturerApi, {
  LecturerDashboardClassDTO,
  LecturerDashboardNotificationDTO,
  LecturerDashboardResponseDTO,
  LecturerDashboardWorkItemDTO,
  LecturerScheduleDTO,
} from '@/api/lecturer/lecturer.api';
import {
  AlertCircle,
  ArrowRight,
  Award,
  Bell,
  BookOpen,
  Calendar,
  CheckCircle,
  ClipboardList,
  Clock,
  FileText,
  MapPin,
  RefreshCw,
  Users,
} from 'lucide-react';
import { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router';

function formatDateTime(value?: string) {
  if (!value) return 'Chưa có dữ liệu';
  return new Date(value).toLocaleString('vi-VN', {
    day: '2-digit',
    month: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
  });
}

function formatDate(value?: string) {
  if (!value) return 'Chưa có ngày';
  return new Date(value).toLocaleDateString('vi-VN', {
    weekday: 'short',
    day: '2-digit',
    month: '2-digit',
  });
}

function formatPercent(value: number) {
  return `${Math.round((value ?? 0) * 100)}%`;
}

function isCurrentSchedule(item: LecturerScheduleDTO) {
  const today = new Date();
  const scheduleDate = new Date(item.ngayHoc);
  if (today.toDateString() !== scheduleDate.toDateString()) return false;

  const [startHour, startMinute] = item.gioBatDau.split(':').map(Number);
  const [endHour, endMinute] = item.gioKetThuc.split(':').map(Number);
  const start = new Date(scheduleDate);
  const end = new Date(scheduleDate);
  start.setHours(startHour, startMinute, 0, 0);
  end.setHours(endHour, endMinute, 0, 0);

  return today >= start && today <= end;
}

function EmptyState({ label }: { label: string }) {
  return (
    <div className="p-8 text-center">
      <AlertCircle className="w-10 h-10 text-slate-300 mx-auto mb-2" />
      <p className="text-sm text-slate-500">{label}</p>
    </div>
  );
}

function ScheduleRow({ item }: { item: LecturerScheduleDTO }) {
  const active = isCurrentSchedule(item);

  return (
    <button
      type="button"
      className={`w-full p-4 text-left flex items-center gap-4 transition-colors ${active ? 'bg-emerald-50' : 'hover:bg-slate-50'
        }`}
    >
      <div className={`w-11 h-11 rounded-lg flex items-center justify-center shrink-0 ${active ? 'bg-emerald-100' : 'bg-indigo-50'
        }`}>
        <Clock className={`w-5 h-5 ${active ? 'text-emerald-700' : 'text-indigo-600'}`} />
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex flex-wrap items-center gap-2">
          <p className="font-semibold text-slate-900 truncate">{item.tenMonHoc}</p>
          {active && (
            <span className="px-2 py-0.5 bg-emerald-100 text-emerald-700 rounded-full text-xs font-bold">
              Đang dạy
            </span>
          )}
        </div>
        <p className="text-sm text-slate-500">{item.maLopHocPhan}</p>
        <p className="text-xs text-slate-400 mt-1">{formatDate(item.ngayHoc)}</p>
      </div>
      <div className="text-right text-sm text-slate-600 shrink-0">
        <p>{item.gioBatDau} - {item.gioKetThuc}</p>
        <p className="flex items-center justify-end gap-1 mt-1">
          <MapPin className="w-3.5 h-3.5" />
          {item.phong} - {item.toaNha}
        </p>
      </div>
    </button>
  );
}

function ClassRow({ item, onOpen }: { item: LecturerDashboardClassDTO; onOpen: () => void }) {
  return (
    <button
      type="button"
      onClick={onOpen}
      className="w-full p-4 text-left hover:bg-slate-50 transition-colors"
    >
      <div className="flex items-start justify-between gap-4">
        <div className="min-w-0">
          <p className="font-semibold text-slate-900 truncate">{item.tenMonHoc}</p>
          <p className="text-sm text-slate-500">{item.maLopHocPhan}</p>
          <p className="text-xs text-slate-400 mt-1">
            {formatDate(item.ngayBatDau)} - {formatDate(item.ngayKetThuc)}
          </p>
        </div>
        <div className="text-right shrink-0">
          <p className="text-xl font-bold text-slate-900">{item.studentCount}</p>
          <p className="text-xs text-slate-500">sinh viên</p>
        </div>
      </div>
      <div className="mt-3 flex flex-wrap items-center gap-2 text-xs text-slate-500">
        <span className="px-2 py-1 bg-slate-100 rounded-lg">{item.scheduleCount} buổi học</span>
        <span className="px-2 py-1 bg-slate-100 rounded-lg">{item.phong} - {item.toaNha}</span>
      </div>
    </button>
  );
}

function NotificationRow({ item }: { item: LecturerDashboardNotificationDTO }) {
  return (
    <div className="p-4 hover:bg-slate-50 transition-colors">
      <div className="flex items-start gap-3">
        <div className={`w-9 h-9 rounded-lg flex items-center justify-center shrink-0 ${item.daNhan ? 'bg-slate-100' : 'bg-blue-50'
          }`}>
          <Bell className={`w-4 h-4 ${item.daNhan ? 'text-slate-500' : 'text-blue-600'}`} />
        </div>
        <div className="min-w-0">
          <div className="flex flex-wrap items-center gap-2">
            <p className="font-semibold text-slate-900 truncate">{item.tieuDe}</p>
            <span className="px-2 py-0.5 bg-slate-100 text-slate-600 rounded-full text-xs font-medium">
              {item.source === 'SENT' ? 'Đã gửi' : item.daNhan ? 'Đã đọc' : 'Mới'}
            </span>
          </div>
          <p className="text-sm text-slate-500 line-clamp-2 mt-1">{item.noiDung}</p>
          <p className="text-xs text-slate-400 mt-2">{formatDateTime(item.createdAt)}</p>
        </div>
      </div>
    </div>
  );
}

function WorkItemRow({ item, onOpen }: { item: LecturerDashboardWorkItemDTO; onOpen: () => void }) {
  const isQuiz = item.type === 'QUIZ';

  return (
    <button
      type="button"
      onClick={onOpen}
      className="w-full p-4 text-left hover:bg-slate-50 transition-colors"
    >
      <div className="flex items-start gap-3">
        <div className={`w-10 h-10 rounded-lg flex items-center justify-center shrink-0 ${isQuiz ? 'bg-violet-50' : 'bg-amber-50'
          }`}>
          {isQuiz ? <Award className="w-5 h-5 text-violet-600" /> : <FileText className="w-5 h-5 text-amber-600" />}
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <p className="font-semibold text-slate-900 truncate">{item.title}</p>
            <span className={`px-2 py-0.5 rounded-full text-xs font-bold ${isQuiz ? 'bg-violet-50 text-violet-700' : 'bg-amber-50 text-amber-700'
              }`}>
              {isQuiz ? 'Quiz' : 'Bài tập'}
            </span>
          </div>
          <p className="text-sm text-slate-500">{item.classCode} - {item.className}</p>
          <p className="text-xs text-slate-400 mt-1">
            {item.studentName} - {formatDateTime(item.createdAt)}
          </p>
        </div>
        <ArrowRight className="w-4 h-4 text-slate-400 shrink-0 mt-1" />
      </div>
    </button>
  );
}

export default function InstructorDashboard() {
  const navigate = useNavigate();
  const { user, isAuthenticated } = useAuth();
  const [dashboard, setDashboard] = useState<LecturerDashboardResponseDTO | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const loadDashboard = () => {
    if (!user?.id) return;
    setLoading(true);
    setError('');
    lecturerApi.getDashboard(user.id)
      .then(setDashboard)
      .catch((err) => {
        console.error(err);
        setError('Không thể tải dữ liệu dashboard giảng viên');
      })
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    if (!isAuthenticated || !user || user.role !== 'lecturer') {
      navigate('/');
      return;
    }
    loadDashboard();
  }, [isAuthenticated, user?.id, user?.role, navigate]);

  const currentSchedule = useMemo(
    () => (dashboard?.todaySchedule ?? []).find(isCurrentSchedule),
    [dashboard?.todaySchedule]
  );

  const stats = [
    {
      label: 'Lớp đang dạy',
      value: dashboard?.totalClasses ?? 0,
      Icon: BookOpen,
      bg: 'bg-indigo-50',
      text: 'text-indigo-700',
      path: '/lecturer/classes',
    },
    {
      label: 'Tổng sinh viên',
      value: dashboard?.totalStudents ?? 0,
      Icon: Users,
      bg: 'bg-emerald-50',
      text: 'text-emerald-700',
      path: '/lecturer/classes',
    },
    {
      label: 'Việc cần xử lý',
      value: dashboard?.totalPendingWork ?? 0,
      Icon: ClipboardList,
      bg: 'bg-amber-50',
      text: 'text-amber-700',
      path: '/lecturer/assignments',
    },
    {
      label: 'Tỷ lệ chuyên cần',
      value: formatPercent(dashboard?.attendanceRate ?? 0),
      Icon: CheckCircle,
      bg: 'bg-blue-50',
      text: 'text-blue-700',
      path: '/lecturer/attendance',
    },
  ];

  return (
    <div className="flex min-h-screen bg-slate-50">
      <InstructorSidebar />

      <div className="flex-1 ml-64 flex flex-col min-w-0">
        <InstructorHeader title="Dashboard" />

        <main className="flex-1 overflow-auto p-4 sm:p-6 lg:p-8">
          <div className="max-w-7xl mx-auto space-y-5">
            <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
              <div>
                <h1 className="text-2xl font-bold text-slate-900">
                  Xin chào, {user?.fullName || user?.username}
                </h1>
                <p className="text-slate-500 mt-1">
                  {new Date().toLocaleDateString('vi-VN', {
                    weekday: 'long',
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric',
                  })}
                </p>
              </div>
              <button
                type="button"
                onClick={loadDashboard}
                disabled={loading}
                className="inline-flex items-center gap-2 px-4 py-2.5 bg-white border border-slate-200 rounded-lg text-sm font-semibold text-slate-700 hover:bg-slate-50 disabled:opacity-50"
              >
                <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
                Làm mới
              </button>
            </div>

            {error && (
              <div className="flex items-center gap-3 px-4 py-3 rounded-xl border border-red-200 bg-red-50 text-red-700">
                <AlertCircle className="w-5 h-5" />
                <span className="text-sm font-semibold">{error}</span>
              </div>
            )}

            <section className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
              {stats.map(({ label, value, Icon, bg, text, path }) => (
                <button
                  type="button"
                  key={label}
                  onClick={() => navigate(path)}
                  className="bg-white rounded-xl border border-slate-200 p-5 text-left hover:border-slate-300 hover:shadow-sm transition-all"
                >
                  <div className="flex items-center gap-4">
                    <div className={`w-12 h-12 ${bg} rounded-lg flex items-center justify-center`}>
                      <Icon className={`w-6 h-6 ${text}`} />
                    </div>
                    <div>
                      <p className="text-sm text-slate-500">{label}</p>
                      <p className="text-2xl font-bold text-slate-900">
                        {loading ? '...' : value}
                      </p>
                    </div>
                  </div>
                </button>
              ))}
            </section>

            {currentSchedule && (
              <section className="bg-emerald-600 rounded-xl p-5 text-white flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                <div>
                  <p className="text-sm text-emerald-100 font-semibold">Lịch giảng dạy hiện tại</p>
                  <h2 className="text-xl font-bold mt-1">{currentSchedule.tenMonHoc}</h2>
                  <p className="text-sm text-emerald-100 mt-1">
                    {currentSchedule.maLopHocPhan} - {currentSchedule.gioBatDau} đến {currentSchedule.gioKetThuc}
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => navigate(`/lecturer/classes/${currentSchedule.lopHocPhanId}`)}
                  className="inline-flex items-center justify-center gap-2 px-4 py-2.5 bg-white text-emerald-700 rounded-lg text-sm font-bold hover:bg-emerald-50"
                >
                  Mở lớp học phần
                  <ArrowRight className="w-4 h-4" />
                </button>
              </section>
            )}

            <section className="grid grid-cols-1 xl:grid-cols-[1.15fr_0.85fr] gap-5">
              <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
                <div className="p-5 border-b border-slate-200 flex items-center justify-between gap-3">
                  <div className="flex items-center gap-2">
                    <BookOpen className="w-5 h-5 text-indigo-600" />
                    <h2 className="font-bold text-slate-900">Lớp học phần đang giảng dạy</h2>
                  </div>
                  <button
                    type="button"
                    onClick={() => navigate('/lecturer/classes')}
                    className="text-sm font-semibold text-indigo-600 hover:text-indigo-700"
                  >
                    Xem tất cả
                  </button>
                </div>

                {loading ? (
                  <div className="p-8 text-center text-slate-500">Đang tải lớp học phần...</div>
                ) : !dashboard?.teachingClasses?.length ? (
                  <EmptyState label="Chưa có lớp học phần đang phụ trách" />
                ) : (
                  <div className="divide-y divide-slate-100">
                    {dashboard.teachingClasses.slice(0, 5).map(item => (
                      <ClassRow
                        key={item.lopHocPhanId}
                        item={item}
                        onOpen={() => navigate(`/lecturer/classes/${item.lopHocPhanId}`)}
                      />
                    ))}
                  </div>
                )}
              </div>

              <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
                <div className="p-5 border-b border-slate-200 flex items-center justify-between gap-3">
                  <div className="flex items-center gap-2">
                    <Bell className="w-5 h-5 text-blue-600" />
                    <h2 className="font-bold text-slate-900">Thông báo mới</h2>
                  </div>
                  <button
                    type="button"
                    onClick={() => navigate('/lecturer/notifications')}
                    className="text-sm font-semibold text-blue-600 hover:text-blue-700"
                  >
                    Quản lý
                  </button>
                </div>

                {loading ? (
                  <div className="p-8 text-center text-slate-500">Đang tải thông báo...</div>
                ) : !dashboard?.recentNotifications?.length ? (
                  <EmptyState label="Chưa có thông báo mới" />
                ) : (
                  <div className="divide-y divide-slate-100">
                    {dashboard.recentNotifications.map(item => (
                      <NotificationRow key={`${item.source}-${item.id}`} item={item} />
                    ))}
                  </div>
                )}
              </div>
            </section>

            <section className="grid grid-cols-1 xl:grid-cols-2 gap-5">
              <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
                <div className="p-5 border-b border-slate-200 flex items-center justify-between gap-3">
                  <div className="flex items-center gap-2">
                    <Calendar className="w-5 h-5 text-emerald-600" />
                    <h2 className="font-bold text-slate-900">Lịch dạy hôm nay</h2>
                  </div>
                  <span className="text-sm text-slate-500">{dashboard?.todaySchedule?.length ?? 0} buổi</span>
                </div>

                {loading ? (
                  <div className="p-8 text-center text-slate-500">Đang tải lịch dạy...</div>
                ) : !dashboard?.todaySchedule?.length ? (
                  <EmptyState label="Không có lịch dạy hôm nay" />
                ) : (
                  <div className="divide-y divide-slate-100">
                    {dashboard.todaySchedule.map(item => (
                      <ScheduleRow key={item.lichId} item={item} />
                    ))}
                  </div>
                )}
              </div>

              <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
                <div className="p-5 border-b border-slate-200 flex items-center justify-between gap-3">
                  <div className="flex items-center gap-2">
                    <ClipboardList className="w-5 h-5 text-amber-600" />
                    <h2 className="font-bold text-slate-900">Bài tập / bài kiểm tra cần xử lý</h2>
                  </div>
                  <span className="text-sm text-slate-500">
                    {(dashboard?.ungradedAssignments ?? 0)} bài tập, {(dashboard?.pendingQuizAttempts ?? 0)} quiz
                  </span>
                </div>

                {loading ? (
                  <div className="p-8 text-center text-slate-500">Đang tải việc cần xử lý...</div>
                ) : !dashboard?.pendingWorkItems?.length ? (
                  <EmptyState label="Không có bài tập hoặc bài kiểm tra cần xử lý" />
                ) : (
                  <div className="divide-y divide-slate-100">
                    {dashboard.pendingWorkItems.map(item => (
                      <WorkItemRow key={`${item.type}-${item.id}`} item={item} onOpen={() => navigate(item.actionPath)} />
                    ))}
                  </div>
                )}
              </div>
            </section>

            <section className="bg-white rounded-xl border border-slate-200 overflow-hidden">
              <div className="p-5 border-b border-slate-200 flex items-center justify-between gap-3">
                <div className="flex items-center gap-2">
                  <Calendar className="w-5 h-5 text-violet-600" />
                  <h2 className="font-bold text-slate-900">Lịch dạy tuần này</h2>
                </div>
                <span className="text-sm text-slate-500">{dashboard?.weekSchedule?.length ?? 0} buổi</span>
              </div>

              {loading ? (
                <div className="p-8 text-center text-slate-500">Đang tải lịch tuần...</div>
              ) : !dashboard?.weekSchedule?.length ? (
                <EmptyState label="Không có lịch dạy tuần này" />
              ) : (
                <div className="grid grid-cols-1 lg:grid-cols-2 divide-y lg:divide-y-0 lg:divide-x divide-slate-100">
                  {dashboard.weekSchedule.slice(0, 6).map(item => (
                    <ScheduleRow key={item.lichId} item={item} />
                  ))}
                </div>
              )}
            </section>

            <section className="grid grid-cols-2 md:grid-cols-4 gap-3">
              {[
                { label: 'Lớp học phần', path: '/lecturer/classes', Icon: BookOpen },
                { label: 'Điểm danh', path: '/lecturer/attendance', Icon: CheckCircle },
                { label: 'Bài tập', path: '/lecturer/assignments', Icon: ClipboardList },
                { label: 'Quiz', path: '/lecturer/quiz', Icon: Award },
              ].map(({ label, path, Icon }) => (
                <button
                  type="button"
                  key={path}
                  onClick={() => navigate(path)}
                  className="bg-white rounded-xl border border-slate-200 p-4 text-left hover:border-emerald-300 hover:shadow-sm transition-all"
                >
                  <Icon className="w-5 h-5 text-emerald-600 mb-3" />
                  <p className="font-semibold text-slate-800 text-sm">{label}</p>
                </button>
              ))}
            </section>
          </div>
        </main>
      </div>

      <button
        className="fixed bottom-8 right-8 w-16 h-16 hover:scale-110 transition-transform duration-200 z-50"
        aria-label="AI Assistant"
      >
        <AiAssistantButton />
      </button>
    </div>
  );
}
