import { InstructorSidebar } from '@/components/layouts/InstructorSidebar';
import { InstructorHeader } from '@/components/layouts/InstructorHeader';
import {
  ArrowLeft, Search, Users, BookOpen, MapPin, AlertCircle, CheckCircle,
  FileText, BookMarked, ClipboardCheck, CalendarDays, Plus, X, Upload,
  Download, Trash2, Edit2, Clock, ChevronLeft, ChevronRight,
  GraduationCap, Star, Save, TrendingUp, Award, Check
} from 'lucide-react';
import { useEffect, useRef, useState, type FormEvent } from 'react';
import { useNavigate, useParams } from 'react-router';
import { useAuth } from '@/hooks';
import { LecturerAIAssistantButton } from '@/components/chatbot/AIAssistantButton';
import lecturerApi, {
  LecturerClassDetailResponseDTO, LecturerScheduleDTO,
  GradeResponseDTO,
  AssignmentResponseDTO, DocumentResponseDTO,
  AttendanceResponseDTO,
  AttendanceStatus
} from '@/api/lecturer/lecturer.api';
import { resolveFileUrl, uploadFile } from '@/utils/fileUtils';

// ── Tab type ────────────────────────────────────────────────────────────────

type ActiveTab = 'students' | 'schedule' | 'grades' | 'assignments' | 'documents' | 'attendance';

// ── Color scheme for schedule events ───────────────────────────────────────

const EVENT_COLORS = [
  { bg: 'bg-indigo-50', border: 'border-indigo-200', text: 'text-indigo-700', icon: 'bg-indigo-100' },
  { bg: 'bg-emerald-50', border: 'border-emerald-200', text: 'text-emerald-700', icon: 'bg-emerald-100' },
  { bg: 'bg-amber-50', border: 'border-amber-200', text: 'text-amber-700', icon: 'bg-amber-100' },
  { bg: 'bg-rose-50', border: 'border-rose-200', text: 'text-rose-700', icon: 'bg-rose-100' },
  { bg: 'bg-cyan-50', border: 'border-cyan-200', text: 'text-cyan-700', icon: 'bg-cyan-100' },
  { bg: 'bg-violet-50', border: 'border-violet-200', text: 'text-violet-700', icon: 'bg-violet-100' },
];

const getEventColor = (i: number) => EVENT_COLORS[i % EVENT_COLORS.length];

const GRADE_COLORS = (score: number | null) => {
  if (score === null) return { bg: 'bg-gray-100', text: 'text-gray-500', bar: 'bg-gray-200' };
  if (score >= 8.5) return { bg: 'bg-green-50', text: 'text-green-700', bar: 'bg-green-500' };
  if (score >= 7.0) return { bg: 'bg-blue-50', text: 'text-blue-700', bar: 'bg-blue-500' };
  if (score >= 5.0) return { bg: 'bg-yellow-50', text: 'text-yellow-700', bar: 'bg-yellow-500' };
  return { bg: 'bg-red-50', text: 'text-red-700', bar: 'bg-red-500' };
};

function gradeLabel(score: number | null) {
  if (score === null) return 'Chưa có điểm';
  if (score >= 8.5) return 'Xuất sắc';
  if (score >= 7.0) return 'Giỏi';
  if (score >= 5.0) return 'Trung bình';
  return 'Yếu';
}

// ── Helper ─────────────────────────────────────────────────────────────────

function getInitials(name: string) {
  const parts = name.trim().split(' ');
  if (parts.length >= 2) return (parts[parts.length - 2].charAt(0) + parts[parts.length - 1].charAt(0)).toUpperCase();
  return name.charAt(0).toUpperCase();
}

function fmtDate(iso: string) {
  return new Date(iso).toLocaleDateString('vi-VN', { day: '2-digit', month: '2-digit', year: 'numeric' });
}

function getAvatarBg(name: string) {
  const colors = [
    'from-violet-500 to-indigo-600', 'from-emerald-500 to-teal-600',
    'from-blue-500 to-cyan-600', 'from-amber-500 to-orange-600',
    'from-rose-500 to-pink-600', 'from-indigo-500 to-violet-600',
    'from-cyan-500 to-blue-600', 'from-teal-500 to-emerald-600',
  ];
  const idx = name.charCodeAt(0) % colors.length;
  return colors[idx];
}

// ── Class Detail Component ─────────────────────────────────────────────────

export default function ClassDetail() {
  const { classId } = useParams<{ classId: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();

  const [detail, setDetail] = useState<LecturerClassDetailResponseDTO | null>(null);
  const [schedule, setSchedule] = useState<LecturerScheduleDTO[]>([]);
  const [grades, setGrades] = useState<GradeResponseDTO | null>(null);
  const [assignments, setAssignments] = useState<AssignmentResponseDTO[]>([]);
  const [documents, setDocuments] = useState<DocumentResponseDTO[]>([]);
  const [attendance, setAttendance] = useState<AttendanceResponseDTO | null>(null);
  const [loading, setLoading] = useState(true);

  const [activeTab, setActiveTab] = useState<ActiveTab>('students');
  const [searchTerm, setSearchTerm] = useState('');

  // Toast
  const [toast, setToast] = useState<{ msg: string; type: 'success' | 'error' } | null>(null);
  const showToast = (msg: string, type: 'success' | 'error' = 'success') => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 3500);
  };

  // Load data
  useEffect(() => {
    if (!classId || !user?.id) return;
    setLoading(true);

    const uid = user.id;
    Promise.all([
      lecturerApi.getClassDetail(classId, uid),
      lecturerApi.getSchedule(uid).then(s => s.filter(e => e.lopHocPhanId === classId)),
      lecturerApi.getGrades(classId, uid).catch(() => null as null),
      lecturerApi.getAssignments(classId, uid).catch(() => [] as AssignmentResponseDTO[]),
      lecturerApi.getDocuments(classId, uid).catch(() => [] as DocumentResponseDTO[]),
      lecturerApi.getAttendance(classId, uid).catch(() => null as null),
    ]).then(([d, s, g, a, doc, att]) => {
      setDetail(d);
      setSchedule(s);
      setGrades(g);
      setAssignments(a);
      setDocuments(doc);
      setAttendance(att);
    }).catch(() => {
      setDetail(null);
    }).finally(() => setLoading(false));
  }, [classId, user?.id]);

  if (!loading && !detail) {
    return (
      <div className="flex h-screen bg-gradient-to-br from-slate-50 to-blue-50">
        <InstructorSidebar />
        <div className="flex-1 ml-64 flex items-center justify-center">
          <div className="text-center">
            <div className="w-20 h-20 bg-red-50 rounded-2xl flex items-center justify-center mx-auto mb-5">
              <AlertCircle className="w-10 h-10 text-red-400" />
            </div>
            <h3 className="text-xl font-bold text-gray-700 mb-2">Không tìm thấy lớp học phần</h3>
            <p className="text-gray-400 text-sm mb-6">Bạn không có quyền truy cập hoặc lớp này không tồn tại</p>
            <button onClick={() => navigate('/lecturer/classes')} className="px-5 py-2.5 bg-indigo-600 text-white rounded-xl font-semibold text-sm hover:bg-indigo-700 transition-colors">
              Quay lại danh sách lớp
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-screen bg-gradient-to-br from-slate-100 via-blue-50 to-indigo-50">
      <InstructorSidebar />

      <div className="flex-1 ml-64 flex flex-col min-h-screen">
        <InstructorHeader title="Chi tiết lớp học phần" />

        <div className="flex-1 overflow-auto p-6 lg:p-8">
          <div className="max-w-7xl mx-auto space-y-5">

            {/* Back button + Page Header */}
            <div className="flex items-center justify-between">
              <button
                onClick={() => navigate('/lecturer/classes')}
                className="flex items-center gap-2 text-gray-500 hover:text-gray-800 transition-colors text-sm font-medium"
              >
                <ArrowLeft className="w-4 h-4" />
                Quay lại danh sách lớp
              </button>
              {detail && (
                <div className="hidden sm:flex items-center gap-3 text-sm">
                  <span className="px-3 py-1 bg-indigo-50 text-indigo-700 rounded-full text-xs font-semibold">
                    {detail.maLopHocPhan}
                  </span>
                </div>
              )}
            </div>

            {/* Class Hero Card */}
            {detail && (
              <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-indigo-600 via-violet-600 to-purple-700 p-px">
                <div className="bg-white rounded-3xl p-7">
                  <div className="flex flex-col sm:flex-row items-start gap-5">
                    <div className="w-16 h-16 bg-gradient-to-br from-indigo-500 to-violet-600 rounded-2xl flex items-center justify-center shadow-lg shrink-0">
                      <BookOpen className="w-8 h-8 text-white" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex flex-col sm:flex-row sm:items-center gap-3">
                        <div className="min-w-0">
                          <p className="text-indigo-200 text-xs font-semibold uppercase tracking-wider">{detail.maLopHocPhan}</p>
                          <h1 className="text-2xl font-bold text-gray-900 mt-0.5">{detail.tenMonHoc}</h1>
                        </div>
                      </div>
                      <div className="flex flex-wrap items-center gap-4 mt-3">
                        <div className="flex items-center gap-1.5 text-sm text-gray-600">
                          <MapPin className="w-4 h-4 text-gray-400" />
                          <span className="font-medium">{detail.phong} – {detail.toaNha}</span>
                        </div>
                        <div className="flex items-center gap-1.5 text-sm text-gray-600">
                          <Users className="w-4 h-4 text-gray-400" />
                          <span className="font-medium">{detail.hocViens.length} sinh viên</span>
                        </div>
                        {detail.lichMoTa && (
                          <div className="flex items-center gap-1.5 text-sm text-gray-600">
                            <Clock className="w-4 h-4 text-gray-400" />
                            <span className="font-medium">{detail.lichMoTa}</span>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Tab Navigation */}
            <div className="flex gap-1 bg-white/80 backdrop-blur-sm p-1.5 rounded-2xl shadow-sm border border-gray-200/60 overflow-x-auto">
              {[
                { key: 'students',   label: 'Sinh viên',   Icon: Users,          color: 'text-blue-600' },
                { key: 'schedule',  label: 'Lịch học',    Icon: CalendarDays,   color: 'text-violet-600' },
                { key: 'grades',    label: 'Điểm số',    Icon: Star,           color: 'text-amber-600' },
                { key: 'assignments', label: 'Bài tập',  Icon: BookMarked,     color: 'text-emerald-600' },
                { key: 'documents', label: 'Tài liệu',   Icon: FileText,        color: 'text-cyan-600' },
                { key: 'attendance', label: 'Điểm danh', Icon: ClipboardCheck, color: 'text-rose-600' },
              ].map(({ key, label, Icon, color }) => (
                <button
                  key={key}
                  onClick={() => setActiveTab(key as ActiveTab)}
                  className={`flex items-center gap-2 px-4 py-2.5 rounded-xl font-semibold text-sm transition-all duration-200 whitespace-nowrap ${
                    activeTab === key
                      ? `bg-gradient-to-r from-indigo-600 to-violet-600 text-white shadow-md shadow-indigo-200`
                      : `text-gray-500 hover:text-gray-800 hover:bg-gray-100`
                  }`}
                >
                  <Icon className={`w-4 h-4 ${activeTab === key ? '' : color}`} />
                  {label}
                </button>
              ))}
            </div>

            {/* Tab Content */}
            {loading ? (
              <div className="flex items-center justify-center py-20">
                <div className="text-center">
                  <div className="w-12 h-12 border-4 border-indigo-200 border-t-indigo-600 rounded-full animate-spin mx-auto mb-4"></div>
                  <p className="text-gray-500 font-medium">Đang tải dữ liệu...</p>
                </div>
              </div>
            ) : (
              <>
                {activeTab === 'students' && detail && (
                  <StudentsTab detail={detail} searchTerm={searchTerm} setSearchTerm={setSearchTerm} />
                )}
                {activeTab === 'schedule' && (
                  <ScheduleTab schedule={schedule} />
                )}
                {activeTab === 'grades' && (
                  <GradesTab
                    grades={grades}
                    classId={classId!}
                    userId={user?.id!}
                    showToast={showToast}
                  />
                )}
                {activeTab === 'assignments' && (
                  <AssignmentsTab
                    assignments={assignments}
                    classId={classId!}
                    userId={user?.id!}
                    showToast={showToast}
                    setAssignments={setAssignments}
                  />
                )}
                {activeTab === 'documents' && (
                  <DocumentsTab
                    documents={documents}
                    classId={classId!}
                    userId={user?.id!}
                    showToast={showToast}
                    setDocuments={setDocuments}
                  />
                )}
                {activeTab === 'attendance' && (
                  <AttendanceTab
                    attendance={attendance}
                    classId={classId!}
                    userId={user?.id!}
                    showToast={showToast}
                  />
                )}
              </>
            )}
          </div>
        </div>
      </div>

      {/* Toast */}
      {toast && (
        <div className="fixed bottom-8 left-1/2 -translate-x-1/2 z-50 animate-in slide-in-from-bottom-5 fade-in duration-300">
          <div className={`flex items-center gap-3 px-6 py-4 rounded-2xl shadow-2xl border ${
            toast.type === 'success'
              ? 'bg-emerald-500/95 text-white border-emerald-400/30'
              : 'bg-red-500/95 text-white border-red-400/30'
          }`}>
            {toast.type === 'success' ? <CheckCircle className="w-5 h-5" /> : <AlertCircle className="w-5 h-5" />}
            <span className="font-semibold">{toast.msg}</span>
          </div>
        </div>
      )}

      <LecturerAIAssistantButton />
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════════════════
//  TAB: STUDENTS
// ═══════════════════════════════════════════════════════════════════════════════

function StudentsTab({
  detail, searchTerm, setSearchTerm
}: {
  detail: LecturerClassDetailResponseDTO;
  searchTerm: string;
  setSearchTerm: (v: string) => void;
}) {
  const filtered = detail.hocViens.filter(s =>
    s.hoTen.toLowerCase().includes(searchTerm.toLowerCase()) ||
    s.maHocVien.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const maleCount = 0;
  const femaleCount = 0;

  return (
    <div className="space-y-4 animate-in fade-in duration-300">
      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        {[
          { label: 'Tổng sinh viên', value: detail.hocViens.length, icon: Users, color: 'text-indigo-600', bg: 'bg-indigo-50' },
          { label: 'Nam', value: maleCount, icon: GraduationCap, color: 'text-blue-600', bg: 'bg-blue-50' },
          { label: 'Nữ', value: femaleCount, icon: GraduationCap, color: 'text-pink-600', bg: 'bg-pink-50' },
        ].map(({ label, value, icon: Icon, color, bg }) => (
          <div key={label} className="bg-white rounded-2xl shadow-sm border border-gray-100 p-4 flex items-center gap-3">
            <div className={`w-10 h-10 rounded-xl ${bg} flex items-center justify-center`}>
              <Icon className={`w-5 h-5 ${color}`} />
            </div>
            <div>
              <p className="text-xs text-gray-500 font-medium">{label}</p>
              <p className="text-xl font-bold text-gray-900">{value}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Table */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="p-5 border-b border-gray-100 flex flex-col sm:flex-row items-start sm:items-center gap-3">
          <div className="flex items-center gap-2">
            <Users className="w-4.5 h-4.5 text-indigo-500" />
            <h3 className="font-bold text-gray-900">Danh sách sinh viên</h3>
            <span className="px-2 py-0.5 bg-indigo-50 text-indigo-700 text-xs font-bold rounded-full">
              {filtered.length}
            </span>
          </div>
          <div className="relative sm:ml-auto">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="text"
              placeholder="Tìm theo tên hoặc mã SV..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-9 pr-4 py-2 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-400 focus:border-indigo-300 w-full sm:w-72"
            />
          </div>
        </div>

        {filtered.length === 0 ? (
          <div className="p-12 text-center">
            <Users className="w-12 h-12 text-gray-300 mx-auto mb-3" />
            <p className="text-gray-500 font-medium">Không tìm thấy sinh viên</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="bg-gray-50 border-b border-gray-100">
                  <th className="text-left px-5 py-3 text-xs font-bold text-gray-500 uppercase tracking-wider w-12">#</th>
                  <th className="text-left px-3 py-3 text-xs font-bold text-gray-500 uppercase tracking-wider">Sinh viên</th>
                  <th className="text-left px-3 py-3 text-xs font-bold text-gray-500 uppercase tracking-wider">Mã SV</th>
                  <th className="text-left px-3 py-3 text-xs font-bold text-gray-500 uppercase tracking-wider hidden sm:table-cell">Email</th>
                  <th className="text-left px-3 py-3 text-xs font-bold text-gray-500 uppercase tracking-wider hidden md:table-cell">Trạng thái</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {filtered.map((s, i) => (
                  <tr key={s.hocVienId} className="hover:bg-gray-50/60 transition-colors">
                    <td className="px-5 py-4 text-sm text-gray-400 text-right">{i + 1}</td>
                    <td className="px-3 py-4">
                      <div className="flex items-center gap-3">
                        <div className={`w-10 h-10 rounded-full bg-gradient-to-br ${getAvatarBg(s.hoTen)} flex items-center justify-center text-white font-bold text-sm shrink-0 overflow-hidden`}>
                          {s.avatarUrl
                            ? <img src={s.avatarUrl} alt={s.hoTen} className="w-full h-full object-cover" />
                            : getInitials(s.hoTen)
                          }
                        </div>
                        <span className="font-semibold text-gray-900">{s.hoTen}</span>
                      </div>
                    </td>
                    <td className="px-3 py-4 text-sm text-gray-600 font-medium">{s.maHocVien}</td>
                      <td className="px-3 py-4 text-sm text-gray-500 hidden sm:table-cell">—</td>
                    <td className="px-3 py-4 hidden md:table-cell">
                      <span className="inline-flex items-center gap-1 px-2.5 py-1 bg-emerald-50 text-emerald-700 text-xs font-semibold rounded-full">
                        <CheckCircle className="w-3 h-3" />
                        Hoạt động
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════════════════
//  TAB: SCHEDULE
// ═══════════════════════════════════════════════════════════════════════════════

function ScheduleTab({ schedule }: { schedule: LecturerScheduleDTO[] }) {
  const [currentWeek, setCurrentWeek] = useState(0);

  const getWeekRange = (offset: number) => {
    const today = new Date();
    const day = today.getDay();
    const diff = day === 0 ? -6 : 1 - day;
    const monday = new Date(today);
    monday.setDate(today.getDate() + diff + offset * 7);
    const sunday = new Date(monday);
    sunday.setDate(monday.getDate() + 6);
    return { monday, sunday };
  };

  const { monday, sunday } = getWeekRange(currentWeek);
  const dayNames = ['CN', 'Th 2', 'Th 3', 'Th 4', 'Th 5', 'Th 6', 'Th 7'];

  const weekDates = Array.from({ length: 7 }, (_, i) => {
    const d = new Date(monday);
    d.setDate(monday.getDate() + i);
    return d;
  });

  const fmtD = (d: Date) => d.toLocaleDateString('vi-VN', { day: '2-digit', month: '2-digit' });

  const getEventsForDay = (date: Date) =>
    schedule.filter(e => new Date(e.ngayHoc).toDateString() === date.toDateString());

  const TIME_SLOTS = [
    { hour: '07', label: 'Sáng 1' },
    { hour: '09', label: 'Sáng 2' },
    { hour: '11', label: 'Trưa' },
    { hour: '13', label: 'Chiều 1' },
    { hour: '15', label: 'Chiều 2' },
    { hour: '17', label: 'Tối' },
  ];

  if (schedule.length === 0) {
    return (
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-16 text-center animate-in fade-in duration-300">
        <div className="w-16 h-16 bg-gray-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
          <CalendarDays className="w-8 h-8 text-gray-400" />
        </div>
        <h3 className="text-lg font-bold text-gray-700 mb-2">Không có lịch học</h3>
        <p className="text-gray-400 text-sm">Không có lịch học nào được phân công cho lớp này</p>
      </div>
    );
  }

  return (
    <div className="space-y-4 animate-in fade-in duration-300">
      {/* Week Navigation */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-4 flex flex-col sm:flex-row items-center gap-4">
        <div className="flex items-center gap-3">
          <button onClick={() => setCurrentWeek(w => w - 1)} className="w-10 h-10 flex items-center justify-center bg-gray-100 hover:bg-gray-200 rounded-xl transition-colors">
            <ChevronLeft className="w-5 h-5 text-gray-600" />
          </button>
          <div className="text-center min-w-[180px]">
            <h3 className="font-bold text-gray-900 text-base">
              {currentWeek === 0 ? 'Tuần hiện tại' : currentWeek > 0 ? `+${currentWeek} tuần` : `${Math.abs(currentWeek)} tuần trước`}
            </h3>
            <p className="text-sm text-gray-500 mt-0.5">{fmtD(monday)} — {fmtD(sunday)}</p>
          </div>
          <button onClick={() => setCurrentWeek(w => w + 1)} className="w-10 h-10 flex items-center justify-center bg-gray-100 hover:bg-gray-200 rounded-xl transition-colors">
            <ChevronRight className="w-5 h-5 text-gray-600" />
          </button>
        </div>
        <div className="h-px sm:h-8 sm:w-px bg-gray-200 w-full sm:w-auto order-first sm:order-none"></div>
        <button
          onClick={() => setCurrentWeek(0)}
          className={`flex-1 sm:flex-none px-5 py-2.5 rounded-xl font-semibold text-sm transition-all ${
            currentWeek === 0
              ? 'bg-indigo-600 text-white shadow-md'
              : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
          }`}
        >
          Hôm nay
        </button>
      </div>

      {/* Schedule Grid */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="grid grid-cols-8">
          <div className="p-4 bg-gradient-to-b from-slate-50 to-white border-b border-gray-100 flex items-center justify-center">
            <span className="text-xs font-bold text-gray-400 uppercase tracking-wider">Giờ</span>
          </div>
          {weekDates.map((date, i) => {
            const isToday = date.toDateString() === new Date().toDateString();
            return (
              <div key={i} className={`p-4 text-center border-b border-l border-gray-100 ${isToday ? 'bg-indigo-50' : 'bg-gradient-to-b from-slate-50 to-white'}`}>
                <div className="font-bold text-gray-700 text-sm">{dayNames[date.getDay()]}</div>
                <div className={`text-base font-bold mt-1 ${isToday ? 'text-indigo-600' : 'text-gray-500'}`}>{fmtD(date).split('/')[0]}</div>
                <div className={`text-xs ${isToday ? 'text-indigo-500' : 'text-gray-400'}`}>{fmtD(date).split('/')[1]}</div>
                {isToday && <div className="w-1.5 h-1.5 bg-indigo-500 rounded-full mx-auto mt-1"></div>}
              </div>
            );
          })}

          {TIME_SLOTS.map(({ hour, label }) => (
            <div key={hour} className="contents">
              <div className="p-3 border-b border-r border-gray-100 bg-gradient-to-r from-slate-50 to-white flex flex-col items-center justify-center">
                <span className="text-sm font-bold text-gray-700">{hour}:00</span>
                <span className="text-[10px] text-gray-400">{label}</span>
              </div>
              {weekDates.map((date, di) => {
                const dayEvents = getEventsForDay(date).filter(e => e.gioBatDau.startsWith(hour));
                const isToday = date.toDateString() === new Date().toDateString();
                return (
                  <div key={di} className={`p-2 border-b border-l border-gray-100 min-h-[90px] ${isToday ? 'bg-indigo-50/20' : ''}`}>
                    {dayEvents.map((e, ei) => {
                      const c = getEventColor(ei);
                      return (
                        <div key={e.lichId} className={`w-full p-2.5 rounded-xl ${c.bg} border ${c.border} mb-1.5`}>
                          <div className={`font-bold text-xs ${c.text}`}>{e.maLopHocPhan}</div>
                          <div className={`text-[11px] font-medium ${c.text} truncate`}>{e.tenMonHoc}</div>
                          <div className="flex items-center gap-1 mt-1 text-[11px] text-gray-500">
                            <Clock className="w-3 h-3" />
                            {e.gioBatDau} – {e.gioKetThuc}
                          </div>
                          <div className="flex items-center gap-1 text-[11px] text-gray-500">
                            <MapPin className="w-3 h-3" />
                            {e.phong} – {e.toaNha}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                );
              })}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════════════════
//  TAB: GRADES
// ═══════════════════════════════════════════════════════════════════════════════

function GradesTab({
  grades, classId, userId, showToast
}: {
  grades: GradeResponseDTO | null;
  classId: string;
  userId: string;
  showToast: (msg: string, type: 'success' | 'error') => void;
}) {
  const [editing, setEditing] = useState(false);
  const [localGrades, setLocalGrades] = useState<Record<string, number>>({});
  const [saving, setSaving] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');

  const students = grades?.students ?? [];

  const avgClass = students.length > 0
    ? students.reduce((sum, s) => sum + (s.diemTrungBinh ?? 0), 0) / students.filter(s => s.diemTrungBinh !== null).length
    : null;

  const passRate = students.length > 0 && students.filter(s => s.diemTrungBinh !== null).length > 0
    ? (students.filter(s => (s.diemTrungBinh ?? 0) >= 5.0).length / students.filter(s => s.diemTrungBinh !== null).length * 100)
    : null;

  const filtered = students.filter(s =>
    s.hoTen.toLowerCase().includes(searchTerm.toLowerCase()) ||
    s.maHocVien.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleEdit = () => {
    const init: Record<string, number> = {};
    students.forEach(s => { if (s.diemTrungBinh !== null) init[s.hocVienId] = s.diemTrungBinh; });
    setLocalGrades(init);
    setEditing(true);
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      await lecturerApi.updateGrades(userId, { lopHocPhanId: classId, studentGrades: localGrades });
      showToast('Lưu điểm thành công', 'success');
      setEditing(false);
    } catch {
      showToast('Lưu điểm thất bại', 'error');
    } finally {
      setSaving(false);
    }
  };

  const handleCancel = () => {
    setEditing(false);
    setLocalGrades({});
  };

  if (!grades || students.length === 0) {
    return (
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-16 text-center animate-in fade-in duration-300">
        <div className="w-16 h-16 bg-gray-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
          <Star className="w-8 h-8 text-gray-400" />
        </div>
        <h3 className="text-lg font-bold text-gray-700 mb-2">Chưa có dữ liệu điểm</h3>
        <p className="text-gray-400 text-sm">Dữ liệu điểm số chưa được cập nhật cho lớp này</p>
      </div>
    );
  }

  return (
    <div className="space-y-4 animate-in fade-in duration-300">
      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-4 gap-3">
        {[
          { label: 'Tổng SV', value: students.length, icon: Users, color: 'text-indigo-600', bg: 'bg-indigo-50' },
          { label: 'Đã có điểm', value: students.filter(s => s.diemTrungBinh !== null).length, icon: CheckCircle, color: 'text-emerald-600', bg: 'bg-emerald-50' },
          {
            label: 'Điểm TB lớp',
            value: avgClass !== null ? avgClass.toFixed(2) : '—',
            icon: TrendingUp, color: 'text-amber-600', bg: 'bg-amber-50',
            suffix: avgClass !== null ? '/10' : ''
          },
          {
            label: 'Tỷ lệ đạt',
            value: passRate !== null ? `${passRate.toFixed(0)}%` : '—',
            icon: Award, color: passRate !== null && passRate >= 70 ? 'text-emerald-600' : 'text-red-600',
            bg: passRate !== null && passRate >= 70 ? 'bg-emerald-50' : 'bg-red-50',
          },
        ].map(({ label, value, icon: Icon, color, bg }) => (
          <div key={label} className="bg-white rounded-2xl shadow-sm border border-gray-100 p-4 flex items-center gap-3">
            <div className={`w-10 h-10 rounded-xl ${bg} flex items-center justify-center`}>
              <Icon className={`w-5 h-5 ${color}`} />
            </div>
            <div>
              <p className="text-xs text-gray-500 font-medium">{label}</p>
              <p className="text-xl font-bold text-gray-900">{value}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Grade Table */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="p-5 border-b border-gray-100 flex flex-col sm:flex-row items-start sm:items-center gap-3">
          <div className="flex items-center gap-2">
            <Star className="w-4.5 h-4.5 text-amber-500" />
            <h3 className="font-bold text-gray-900">Bảng điểm sinh viên</h3>
            <span className="px-2 py-0.5 bg-amber-50 text-amber-700 text-xs font-bold rounded-full">{filtered.length}</span>
          </div>
          <div className="flex items-center gap-2 sm:ml-auto">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                type="text"
                placeholder="Tìm sinh viên..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-9 pr-4 py-2 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-amber-400 focus:border-amber-300 w-56"
              />
            </div>
            {!editing ? (
              <button
                onClick={handleEdit}
                className="flex items-center gap-2 px-4 py-2 bg-amber-500 text-white rounded-xl hover:bg-amber-600 font-semibold text-sm shadow-sm transition-colors"
              >
                <Edit2 className="w-4 h-4" />Nhập điểm
              </button>
            ) : (
              <div className="flex gap-2">
                <button onClick={handleCancel} className="flex items-center gap-2 px-4 py-2 bg-gray-100 text-gray-600 rounded-xl hover:bg-gray-200 font-semibold text-sm transition-colors">
                  <X className="w-4 h-4" />Hủy
                </button>
                <button
                  onClick={handleSave}
                  disabled={saving}
                  className="flex items-center gap-2 px-4 py-2 bg-emerald-500 text-white rounded-xl hover:bg-emerald-600 font-semibold text-sm shadow-sm transition-colors disabled:opacity-50"
                >
                  <Save className="w-4 h-4" />{saving ? 'Đang lưu...' : 'Lưu điểm'}
                </button>
              </div>
            )}
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="bg-gray-50 border-b border-gray-100">
                <th className="text-left px-5 py-3 text-xs font-bold text-gray-500 uppercase tracking-wider w-12">#</th>
                <th className="text-left px-3 py-3 text-xs font-bold text-gray-500 uppercase tracking-wider">Sinh viên</th>
                <th className="text-left px-3 py-3 text-xs font-bold text-gray-500 uppercase tracking-wider">Mã SV</th>
                <th className="text-center px-3 py-3 text-xs font-bold text-gray-500 uppercase tracking-wider w-40">Điểm (0-10)</th>
                <th className="text-center px-3 py-3 text-xs font-bold text-gray-500 uppercase tracking-wider w-32 hidden sm:table-cell">Xếp loại</th>
                <th className="text-left px-3 py-3 text-xs font-bold text-gray-500 uppercase tracking-wider w-40 hidden md:table-cell">Điểm TB lớp</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {filtered.map((s, i) => {
                const score = editing ? (localGrades[s.hocVienId] ?? s.diemTrungBinh) : s.diemTrungBinh;
                const gc = GRADE_COLORS(score);
                return (
                  <tr key={s.hocVienId} className="hover:bg-gray-50/60 transition-colors">
                    <td className="px-5 py-4 text-sm text-gray-400 text-right">{i + 1}</td>
                    <td className="px-3 py-4">
                      <div className="flex items-center gap-3">
                        <div className={`w-10 h-10 rounded-full bg-gradient-to-br ${getAvatarBg(s.hoTen)} flex items-center justify-center text-white font-bold text-sm shrink-0`}>
                          {getInitials(s.hoTen)}
                        </div>
                        <span className="font-semibold text-gray-900">{s.hoTen}</span>
                      </div>
                    </td>
                    <td className="px-3 py-4 text-sm text-gray-600 font-medium">{s.maHocVien}</td>
                    <td className="px-3 py-4">
                      {editing ? (
                        <div className="flex justify-center">
                          <input
                            type="number"
                            min="0"
                            max="10"
                            step="0.1"
                            value={localGrades[s.hocVienId] ?? ''}
                            onChange={e => setLocalGrades(prev => ({
                              ...prev,
                              [s.hocVienId]: parseFloat(e.target.value) || 0,
                            }))}
                            className={`w-24 px-3 py-2 border rounded-xl text-center font-semibold text-sm focus:outline-none focus:ring-2 focus:ring-amber-400 ${
                              (localGrades[s.hocVienId] ?? s.diemTrungBinh) !== null && (localGrades[s.hocVienId] ?? s.diemTrungBinh) >= 5
                                ? 'border-emerald-300 bg-emerald-50'
                                : (localGrades[s.hocVienId] ?? s.diemTrungBinh) !== null && (localGrades[s.hocVienId] ?? s.diemTrungBinh) < 5
                                ? 'border-red-300 bg-red-50'
                                : 'border-gray-300'
                            }`}
                          />
                        </div>
                      ) : (
                        <div className="flex justify-center">
                          <span className={`inline-flex items-center justify-center min-w-[52px] px-3 py-1.5 rounded-xl font-bold text-sm ${gc.bg} ${gc.text}`}>
                            {score !== null ? score.toFixed(1) : '—'}
                          </span>
                        </div>
                      )}
                    </td>
                    <td className="px-3 py-4 text-center hidden sm:table-cell">
                      <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold ${gc.bg} ${gc.text}`}>
                        {gradeLabel(score)}
                      </span>
                    </td>
                    <td className="px-3 py-4 hidden md:table-cell">
                      <div className="flex items-center gap-2">
                        <div className={`h-1.5 flex-1 rounded-full ${gc.bar} min-w-[40px]`}
                          style={{ width: score !== null ? `${Math.min((score / 10) * 100, 100)}%` : '0%' }}
                        />
                        <span className="text-xs text-gray-500 font-medium w-8">
                          {score !== null ? score.toFixed(1) : '—'}
                        </span>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════════════════
//  TAB: ASSIGNMENTS
// ═══════════════════════════════════════════════════════════════════════════════

function AssignmentsTab({
  assignments, classId, userId, showToast, setAssignments
}: {
  assignments: AssignmentResponseDTO[];
  classId: string;
  userId: string;
  showToast: (msg: string, type: 'success' | 'error') => void;
  setAssignments: React.Dispatch<React.SetStateAction<AssignmentResponseDTO[]>>;
}) {
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState({ tieuDe: '', moTa: '', thoiGianBatDau: '', thoiGianKetThuc: '', fileExerciseUrl: '' });
  const [saving, setSaving] = useState(false);
  const saveLockRef = useRef(false);
  const [uploadingFile, setUploadingFile] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');

  const filtered = assignments.filter(a =>
    a.tieuDe.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (a.moTa ?? '').toLowerCase().includes(searchTerm.toLowerCase())
  );

  const resetForm = () => {
    setForm({ tieuDe: '', moTa: '', thoiGianBatDau: '', thoiGianKetThuc: '', fileExerciseUrl: '' });
    setEditingId(null);
    setShowForm(false);
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (saveLockRef.current || saving) return;
    if (!form.tieuDe.trim()) { showToast('Tiêu đề bài tập không được để trống', 'error'); return; }

    saveLockRef.current = true;
    setSaving(true);
    try {
      const payload = {
        lopHocPhanId: classId,
        tieuDe: form.tieuDe,
        moTa: form.moTa || undefined,
        thoiGianBatDau: form.thoiGianBatDau ? `${form.thoiGianBatDau}T00:00:00` : undefined,
        thoiGianKetThuc: form.thoiGianKetThuc ? `${form.thoiGianKetThuc}T23:59:59` : undefined,
        fileExerciseUrl: form.fileExerciseUrl || '',
      };
      if (editingId) {
        const updated = await lecturerApi.updateAssignment(editingId, userId, payload);
        setAssignments(prev => prev.map(a => a.id === editingId ? updated : a));
        showToast('Cập nhật bài tập thành công', 'success');
      } else {
        const created = await lecturerApi.createAssignment(userId, payload);
        setAssignments(prev => [created, ...prev]);
        showToast('Tạo bài tập thành công', 'success');
      }
      resetForm();
    } catch {
      showToast('Thao tác thất bại, vui lòng thử lại', 'error');
    } finally {
      saveLockRef.current = false;
      setSaving(false);
    }
  };

  const handleEdit = (a: AssignmentResponseDTO) => {
    setForm({
      tieuDe: a.tieuDe,
      moTa: a.moTa || '',
      thoiGianBatDau: '',
      thoiGianKetThuc: '',
      fileExerciseUrl: a.fileExerciseUrl || '',
    });
    setEditingId(a.id);
    setShowForm(true);
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Bạn có chắc muốn xóa bài tập này?')) return;
    try {
      await lecturerApi.deleteAssignment(id, userId);
      setAssignments(prev => prev.filter(a => a.id !== id));
      showToast('Xóa bài tập thành công', 'success');
    } catch {
      showToast('Xóa thất bại', 'error');
    }
  };

  const handleUploadFile = async (file: File) => {
    setUploadingFile(true);
    try {
      const uploaded = await uploadFile(file);
      setForm(prev => ({ ...prev, fileExerciseUrl: uploaded.fileUrl }));
    } catch {
      showToast('Upload file thất bại', 'error');
    } finally {
      setUploadingFile(false);
    }
  };

  return (
    <div className="space-y-4 animate-in fade-in duration-300">
      {/* Header */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5 flex flex-col sm:flex-row items-start sm:items-center gap-3">
        <div className="flex items-center gap-2">
          <BookMarked className="w-4.5 h-4.5 text-emerald-500" />
          <h3 className="font-bold text-gray-900">Danh sách bài tập</h3>
          <span className="px-2 py-0.5 bg-emerald-50 text-emerald-700 text-xs font-bold rounded-full">{filtered.length}</span>
        </div>
        <div className="flex items-center gap-2 sm:ml-auto">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="text"
              placeholder="Tìm bài tập..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-9 pr-4 py-2 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-emerald-400 focus:border-emerald-300 w-56"
            />
          </div>
          <button
            onClick={() => setShowForm(v => !v)}
            className="flex items-center gap-2 px-4 py-2 bg-emerald-500 text-white rounded-xl hover:bg-emerald-600 font-semibold text-sm shadow-sm transition-colors"
          >
            <Plus className="w-4 h-4" />
            {showForm ? 'Đóng' : 'Tạo bài tập'}
          </button>
        </div>
      </div>

      {/* Create/Edit Form */}
      {showForm && (
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden animate-in slide-in-from-top-2 duration-200">
          <div className="px-6 py-4 bg-gradient-to-r from-emerald-50 to-teal-50 border-b border-gray-100 flex items-center gap-3">
            <div className="w-9 h-9 bg-emerald-100 rounded-xl flex items-center justify-center">
              <BookMarked className="w-4.5 h-4.5 text-emerald-600" />
            </div>
            <h3 className="font-bold text-gray-900">{editingId ? 'Cập nhật bài tập' : 'Tạo bài tập mới'}</h3>
          </div>
          <form onSubmit={handleSubmit} className="p-6 space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="md:col-span-2">
                <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1.5">Tiêu đề bài tập <span className="text-red-500">*</span></label>
                <input
                  type="text"
                  value={form.tieuDe}
                  onChange={e => setForm(p => ({ ...p, tieuDe: e.target.value }))}
                  placeholder="Nhập tiêu đề bài tập..."
                  className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-400 focus:border-emerald-300 text-sm font-medium"
                />
              </div>
              <div className="md:col-span-2">
                <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1.5">Mô tả</label>
                <textarea
                  value={form.moTa}
                  onChange={e => setForm(p => ({ ...p, moTa: e.target.value }))}
                  placeholder="Mô tả chi tiết bài tập..."
                  rows={3}
                  className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-400 focus:border-emerald-300 text-sm font-medium resize-none"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1.5">Ngày bắt đầu</label>
                <input
                  type="date"
                  value={form.thoiGianBatDau}
                  onChange={e => setForm(p => ({ ...p, thoiGianBatDau: e.target.value }))}
                  className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-400 focus:border-emerald-300 text-sm font-medium"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1.5">Hạn nộp</label>
                <input
                  type="date"
                  value={form.thoiGianKetThuc}
                  onChange={e => setForm(p => ({ ...p, thoiGianKetThuc: e.target.value }))}
                  className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-400 focus:border-emerald-300 text-sm font-medium"
                />
              </div>
              <div className="md:col-span-2">
                <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1.5">URL file bài tập</label>
                <div className="flex flex-col sm:flex-row gap-3">
                  <input
                    type="text"
                    value={form.fileExerciseUrl}
                    onChange={e => setForm(p => ({ ...p, fileExerciseUrl: e.target.value }))}
                    placeholder="Upload file hoặc nhập URL trực tiếp"
                    className="flex-1 px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-400 focus:border-emerald-300 text-sm font-medium"
                  />
                  <label className={`inline-flex items-center justify-center gap-2 px-4 py-3 rounded-xl text-sm font-semibold ${
                    uploadingFile ? 'bg-gray-100 text-gray-400 cursor-wait' : 'bg-emerald-50 text-emerald-700 hover:bg-emerald-100 cursor-pointer'
                  }`}>
                    <Upload className="w-4 h-4" />
                    {uploadingFile ? 'Đang upload...' : 'Upload file'}
                    <input
                      type="file"
                      accept=".pdf,.doc,.docx,.ppt,.pptx,.xls,.xlsx,.zip,.rar,.png,.jpg,.jpeg,.webp,.txt"
                      disabled={uploadingFile}
                      onChange={e => {
                        const file = e.target.files?.[0];
                        if (file) void handleUploadFile(file);
                        e.currentTarget.value = '';
                      }}
                      className="hidden"
                    />
                  </label>
                </div>
              </div>
            </div>
            <div className="flex justify-end gap-3 pt-2">
              <button type="button" onClick={resetForm} className="px-5 py-2.5 bg-gray-100 text-gray-600 rounded-xl hover:bg-gray-200 font-semibold text-sm transition-colors">
                Hủy
              </button>
              <button
                type="submit"
                disabled={saving || uploadingFile}
                className="flex items-center gap-2 px-6 py-2.5 bg-emerald-500 text-white rounded-xl hover:bg-emerald-600 font-semibold text-sm shadow-sm transition-colors disabled:opacity-50"
              >
                <Save className="w-4 h-4" />
                {saving ? 'Đang lưu...' : (editingId ? 'Cập nhật' : 'Tạo bài tập')}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Assignment List */}
      {filtered.length === 0 && !showForm ? (
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-16 text-center">
          <div className="w-16 h-16 bg-gray-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
            <BookMarked className="w-8 h-8 text-gray-400" />
          </div>
          <h3 className="text-lg font-bold text-gray-700 mb-2">Chưa có bài tập nào</h3>
          <p className="text-gray-400 text-sm mb-4">Tạo bài tập mới để sinh viên có thể nộp bài</p>
          <button
            onClick={() => setShowForm(true)}
            className="inline-flex items-center gap-2 px-5 py-2.5 bg-emerald-500 text-white rounded-xl hover:bg-emerald-600 font-semibold text-sm shadow-sm transition-colors"
          >
            <Plus className="w-4 h-4" />Tạo bài tập đầu tiên
          </button>
        </div>
      ) : (
        <div className="space-y-3">
          {filtered.map((a, idx) => {
            const colors = EVENT_COLORS[idx % EVENT_COLORS.length];
            return (
              <div key={a.id} className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden hover:shadow-md transition-shadow">
                <div className="p-5 flex items-start gap-4">
                  <div className={`w-12 h-12 rounded-xl ${colors.icon} flex items-center justify-center shrink-0`}>
                    <BookMarked className={`w-6 h-6 ${colors.text}`} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-3">
                      <div className="min-w-0">
                        <h4 className="font-bold text-gray-900">{a.tieuDe}</h4>
                        {a.moTa && <p className="text-sm text-gray-500 mt-1 line-clamp-2">{a.moTa}</p>}
                        <div className="flex flex-wrap items-center gap-3 mt-2">
                          <div className="flex items-center gap-1 text-xs text-gray-500">
                            <Users className="w-3 h-3" />
                            {a.submissionCount} bài nộp
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center gap-2 shrink-0">
                        {a.fileExerciseUrl && (
                          <a
                            href={resolveFileUrl(a.fileExerciseUrl)}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="w-9 h-9 flex items-center justify-center bg-gray-100 hover:bg-gray-200 rounded-xl transition-colors"
                            title="Tải file"
                          >
                            <Download className="w-4 h-4 text-gray-500" />
                          </a>
                        )}
                        <button onClick={() => handleEdit(a)} className="w-9 h-9 flex items-center justify-center bg-gray-100 hover:bg-gray-200 rounded-xl transition-colors" title="Sửa">
                          <Edit2 className="w-4 h-4 text-gray-500" />
                        </button>
                        <button onClick={() => handleDelete(a.id)} className="w-9 h-9 flex items-center justify-center bg-gray-100 hover:bg-red-100 rounded-xl transition-colors" title="Xóa">
                          <Trash2 className="w-4 h-4 text-gray-500 hover:text-red-500" />
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════════════════
//  TAB: DOCUMENTS
// ═══════════════════════════════════════════════════════════════════════════════

function DocumentsTab({
  documents, classId, userId, showToast, setDocuments
}: {
  documents: DocumentResponseDTO[];
  classId: string;
  userId: string;
  showToast: (msg: string, type: 'success' | 'error') => void;
  setDocuments: React.Dispatch<React.SetStateAction<DocumentResponseDTO[]>>;
}) {
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState({ tenTaiLieu: '', moTa: '', fileTaiLieuUrl: '', loaiTaiLieu: '' });
  const [saving, setSaving] = useState(false);
  const [uploadingFile, setUploadingFile] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState('Tất cả');

  const docTypes = ['Tất cả', ...new Set(documents.map(d => d.loaiTaiLieu || 'Khác'))];
  const filtered = documents.filter(d => {
    const matchSearch = d.tenTaiLieu.toLowerCase().includes(searchTerm.toLowerCase()) || (d.moTa ?? '').toLowerCase().includes(searchTerm.toLowerCase());
    const matchType = filterType === 'Tất cả' || (d.loaiTaiLieu || 'Khác') === filterType;
    return matchSearch && matchType;
  });

  const resetForm = () => {
    setForm({ tenTaiLieu: '', moTa: '', fileTaiLieuUrl: '', loaiTaiLieu: '' });
    setEditingId(null);
    setShowForm(false);
  };

  const inferTypeFromFileName = (fileName: string) => {
    const ext = fileName.split('.').pop()?.toLowerCase();
    if (ext === 'pdf') return 'PDF';
    if (ext === 'doc' || ext === 'docx') return 'DOCX';
    if (ext === 'ppt' || ext === 'pptx') return 'PPTX';
    if (ext === 'xls' || ext === 'xlsx') return 'XLSX';
    if (ext === 'zip' || ext === 'rar') return 'ZIP';
    if (['mp4', 'avi', 'mov', 'mkv'].includes(ext || '')) return 'VIDEO';
    return 'OTHER';
  };

  const handleUploadFile = async (file: File) => {
    setUploadingFile(true);
    try {
      const uploaded = await uploadFile(file);
      setForm(prev => ({
        ...prev,
        fileTaiLieuUrl: uploaded.fileUrl,
        tenTaiLieu: prev.tenTaiLieu || file.name.replace(/\.[^.]+$/, ''),
        loaiTaiLieu: prev.loaiTaiLieu || inferTypeFromFileName(file.name),
      }));
      showToast('Upload file thành công', 'success');
    } catch {
      showToast('Upload file thất bại', 'error');
    } finally {
      setUploadingFile(false);
    }
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!form.tenTaiLieu.trim()) { showToast('Tên tài liệu không được để trống', 'error'); return; }

    setSaving(true);
    try {
      const payload = {
        lopHocPhanId: classId,
        tenTaiLieu: form.tenTaiLieu,
        moTa: form.moTa || undefined,
        fileTaiLieuUrl: form.fileTaiLieuUrl || '',
        loaiTaiLieu: form.loaiTaiLieu || undefined,
      };
      if (editingId) {
        const updated = await lecturerApi.updateDocument(editingId, userId, payload);
        setDocuments(prev => prev.map(d => d.id === editingId ? updated : d));
        showToast('Cập nhật tài liệu thành công', 'success');
      } else {
        const created = await lecturerApi.createDocument(userId, payload);
        setDocuments(prev => [created, ...prev]);
        showToast('Tải lên tài liệu thành công', 'success');
      }
      resetForm();
    } catch {
      showToast('Thao tác thất bại, vui lòng thử lại', 'error');
    } finally {
      setSaving(false);
    }
  };

  const handleEdit = (d: DocumentResponseDTO) => {
    setForm({
      tenTaiLieu: d.tenTaiLieu,
      moTa: d.moTa || '',
      fileTaiLieuUrl: d.fileTaiLieuUrl || '',
      loaiTaiLieu: d.loaiTaiLieu || '',
    });
    setEditingId(d.id);
    setShowForm(true);
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Bạn có chắc muốn xóa tài liệu này?')) return;
    try {
      await lecturerApi.deleteDocument(id, userId);
      setDocuments(prev => prev.filter(d => d.id !== id));
      showToast('Xóa tài liệu thành công', 'success');
    } catch {
      showToast('Xóa thất bại', 'error');
    }
  };

  const DOC_TYPE_COLORS: Record<string, { bg: string; text: string; icon: string }> = {
    'PDF': { bg: 'bg-red-50', text: 'text-red-600', icon: 'bg-red-100' },
    'DOC': { bg: 'bg-blue-50', text: 'text-blue-600', icon: 'bg-blue-100' },
    'PPT': { bg: 'bg-orange-50', text: 'text-orange-600', icon: 'bg-orange-100' },
    'VIDEO': { bg: 'bg-purple-50', text: 'text-purple-600', icon: 'bg-purple-100' },
    'LINK': { bg: 'bg-cyan-50', text: 'text-cyan-600', icon: 'bg-cyan-100' },
    'default': { bg: 'bg-gray-50', text: 'text-gray-600', icon: 'bg-gray-100' },
  };

  const getDocTypeStyle = (type: string) => DOC_TYPE_COLORS[type] || DOC_TYPE_COLORS['default'];

  return (
    <div className="space-y-4 animate-in fade-in duration-300">
      {/* Header */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5 flex flex-col sm:flex-row items-start sm:items-center gap-3">
        <div className="flex items-center gap-2">
          <FileText className="w-4.5 h-4.5 text-cyan-500" />
          <h3 className="font-bold text-gray-900">Tài liệu học tập</h3>
          <span className="px-2 py-0.5 bg-cyan-50 text-cyan-700 text-xs font-bold rounded-full">{filtered.length}</span>
        </div>
        <div className="flex items-center gap-2 sm:ml-auto flex-wrap">
          <select
            value={filterType}
            onChange={e => setFilterType(e.target.value)}
            className="px-3 py-2 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-cyan-400 focus:border-cyan-300 bg-white"
          >
            {docTypes.map(t => <option key={t} value={t}>{t}</option>)}
          </select>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1-1/2 w-4 h-4 text-gray-400" />
            <input
              type="text"
              placeholder="Tìm tài liệu..."
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
              className="pl-9 pr-4 py-2 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-cyan-400 focus:border-cyan-300 w-56"
            />
          </div>
          <button
            onClick={() => setShowForm(v => !v)}
            className="flex items-center gap-2 px-4 py-2 bg-cyan-500 text-white rounded-xl hover:bg-cyan-600 font-semibold text-sm shadow-sm transition-colors"
          >
            <Upload className="w-4 h-4" />
            {showForm ? 'Đóng' : 'Tải lên'}
          </button>
        </div>
      </div>

      {/* Upload Form */}
      {showForm && (
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden animate-in slide-in-from-top-2 duration-200">
          <div className="px-6 py-4 bg-gradient-to-r from-cyan-50 to-blue-50 border-b border-gray-100 flex items-center gap-3">
            <div className="w-9 h-9 bg-cyan-100 rounded-xl flex items-center justify-center">
              <Upload className="w-4.5 h-4.5 text-cyan-600" />
            </div>
            <h3 className="font-bold text-gray-900">{editingId ? 'Cập nhật tài liệu' : 'Tải lên tài liệu mới'}</h3>
          </div>
          <form onSubmit={handleSubmit} className="p-6 space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1.5">Tên tài liệu <span className="text-red-500">*</span></label>
                <input
                  type="text"
                  value={form.tenTaiLieu}
                  onChange={e => setForm(p => ({ ...p, tenTaiLieu: e.target.value }))}
                  placeholder="Nhập tên tài liệu..."
                  className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-cyan-400 focus:border-cyan-300 text-sm font-medium"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1.5">Loại tài liệu</label>
                <select
                  value={form.loaiTaiLieu}
                  onChange={e => setForm(p => ({ ...p, loaiTaiLieu: e.target.value }))}
                  className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-cyan-400 focus:border-cyan-300 text-sm font-medium bg-white"
                >
                  <option value="">Chọn loại</option>
                  <option value="PDF">PDF</option>
                  <option value="DOC">Tài liệu Word</option>
                  <option value="PPT">Bài giảng PowerPoint</option>
                  <option value="VIDEO">Video bài giảng</option>
                  <option value="LINK">Liên kết</option>
                  <option value="Khác">Khác</option>
                </select>
              </div>
              <div className="md:col-span-2">
                <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1.5">Mô tả</label>
                <textarea
                  value={form.moTa}
                  onChange={e => setForm(p => ({ ...p, moTa: e.target.value }))}
                  placeholder="Mô tả ngắn về tài liệu..."
                  rows={2}
                  className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-cyan-400 focus:border-cyan-300 text-sm font-medium resize-none"
                />
              </div>
              <div className="md:col-span-2">
                <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1.5">File tài liệu</label>
                <div className="flex flex-col sm:flex-row gap-3">
                  <input
                    type="text"
                    value={form.fileTaiLieuUrl}
                    onChange={e => setForm(p => ({ ...p, fileTaiLieuUrl: e.target.value }))}
                    placeholder="Upload file hoặc nhập URL trực tiếp"
                    className="flex-1 px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-cyan-400 focus:border-cyan-300 text-sm font-medium"
                  />
                  <label className={`inline-flex items-center justify-center gap-2 px-4 py-3 rounded-xl text-sm font-semibold ${
                    uploadingFile ? 'bg-gray-100 text-gray-400 cursor-wait' : 'bg-cyan-50 text-cyan-700 hover:bg-cyan-100 cursor-pointer'
                  }`}>
                    <Upload className="w-4 h-4" />
                    {uploadingFile ? 'Đang upload...' : 'Upload file'}
                    <input
                      type="file"
                      accept=".pdf,.doc,.docx,.ppt,.pptx,.xls,.xlsx,.zip,.rar,.png,.jpg,.jpeg,.webp,.txt"
                      disabled={uploadingFile}
                      onChange={e => {
                        const file = e.target.files?.[0];
                        if (file) void handleUploadFile(file);
                        e.currentTarget.value = '';
                      }}
                      className="hidden"
                    />
                  </label>
                </div>
                {form.fileTaiLieuUrl.startsWith('/api/files/') && (
                  <p className="text-xs text-cyan-600 mt-1">File đã được lưu lên Supabase Storage.</p>
                )}
              </div>
            </div>
            <div className="flex justify-end gap-3 pt-2">
              <button type="button" onClick={resetForm} className="px-5 py-2.5 bg-gray-100 text-gray-600 rounded-xl hover:bg-gray-200 font-semibold text-sm transition-colors">
                Hủy
              </button>
              <button
                type="submit"
                disabled={saving || uploadingFile}
                className="flex items-center gap-2 px-6 py-2.5 bg-cyan-500 text-white rounded-xl hover:bg-cyan-600 font-semibold text-sm shadow-sm transition-colors disabled:opacity-50"
              >
                <Save className="w-4 h-4" />
                {saving ? 'Đang lưu...' : (editingId ? 'Cập nhật' : 'Tải lên')}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Document List */}
      {filtered.length === 0 && !showForm ? (
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-16 text-center">
          <div className="w-16 h-16 bg-gray-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
            <FileText className="w-8 h-8 text-gray-400" />
          </div>
          <h3 className="text-lg font-bold text-gray-700 mb-2">Chưa có tài liệu nào</h3>
          <p className="text-gray-400 text-sm mb-4">{searchTerm || filterType !== 'Tất cả' ? 'Không tìm thấy tài liệu phù hợp' : 'Tải lên tài liệu cho sinh viên học tập'}</p>
          {(!searchTerm && filterType === 'Tất cả') && (
            <button onClick={() => setShowForm(true)} className="inline-flex items-center gap-2 px-5 py-2.5 bg-cyan-500 text-white rounded-xl hover:bg-cyan-600 font-semibold text-sm shadow-sm transition-colors">
              <Upload className="w-4 h-4" />Tải lên tài liệu đầu tiên
            </button>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          {filtered.map((d) => {
            const ts = getDocTypeStyle(d.loaiTaiLieu || 'Khác');
            return (
              <div key={d.id} className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden hover:shadow-md transition-shadow group">
                <div className="p-5">
                  <div className="flex items-start justify-between gap-3 mb-3">
                    <div className={`w-12 h-12 rounded-xl ${ts.icon} flex items-center justify-center shrink-0`}>
                      <FileText className={`w-6 h-6 ${ts.text}`} />
                    </div>
                    <div className="flex items-center gap-1">
                      {d.loaiTaiLieu && (
                        <span className={`px-2 py-0.5 rounded-full text-xs font-bold ${ts.bg} ${ts.text}`}>
                          {d.loaiTaiLieu}
                        </span>
                      )}
                    </div>
                  </div>
                  <h4 className="font-bold text-gray-900 line-clamp-2">{d.tenTaiLieu}</h4>
                  {d.moTa && <p className="text-sm text-gray-500 mt-1 line-clamp-2">{d.moTa}</p>}
                  <div className="flex items-center gap-1 text-xs text-gray-400 mt-2">
                    <Clock className="w-3 h-3" />
                    {fmtDate(d.ngayDang)}
                  </div>
                  <div className="flex items-center gap-2 mt-4 pt-3 border-t border-gray-100">
                    {d.fileTaiLieuUrl && (
                      <a
                        href={resolveFileUrl(d.fileTaiLieuUrl)}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex-1 flex items-center justify-center gap-1.5 px-3 py-2 bg-gray-50 hover:bg-gray-100 rounded-xl text-xs font-semibold text-gray-600 transition-colors"
                      >
                        <Download className="w-3.5 h-3.5" />
                        Tải xuống
                      </a>
                    )}
                    <button onClick={() => handleEdit(d)} className="w-8 h-8 flex items-center justify-center bg-gray-50 hover:bg-gray-100 rounded-xl transition-colors">
                      <Edit2 className="w-3.5 h-3.5 text-gray-500" />
                    </button>
                    <button onClick={() => handleDelete(d.id)} className="w-8 h-8 flex items-center justify-center bg-gray-50 hover:bg-red-100 rounded-xl transition-colors">
                      <Trash2 className="w-3.5 h-3.5 text-gray-500 hover:text-red-500" />
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════════════════
//  TAB: ATTENDANCE
// ═══════════════════════════════════════════════════════════════════════════════

function AttendanceTab({
  attendance, classId, userId, showToast
}: {
  attendance: AttendanceResponseDTO | null;
  classId: string;
  userId: string;
  showToast: (msg: string, type: 'success' | 'error') => void;
}) {
  const [localAttendance, setLocalAttendance] = useState<Record<string, AttendanceStatus | null>>({});
  const [editing, setEditing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    if (attendance) {
      const init: Record<string, AttendanceStatus | null> = {};
      attendance.students.forEach(s => { init[s.hocVienId] = s.trangThai; });
      setLocalAttendance(init);
    }
  }, [attendance]);

  const students = attendance?.students ?? [];
  const filtered = students.filter(s =>
    s.hoTen.toLowerCase().includes(searchTerm.toLowerCase()) ||
    s.maHocVien.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const getLocalStatus = (student: { hocVienId: string; trangThai: AttendanceStatus | null }) =>
    localAttendance[student.hocVienId] ?? student.trangThai;

  const present = students.filter(s => {
    const status = getLocalStatus(s);
    return status === 'PRESENT' || status === 'LATE';
  }).length;
  const absent = students.filter(s => {
    const status = getLocalStatus(s);
    return status === 'ABSENT' || status === 'EXCUSED';
  }).length;
  const pending = students.length - present - absent;
  const rate = students.length > 0 ? (present / students.length * 100) : 0;

  const handleSave = async () => {
    if (!attendance?.selectedLichId || !attendance.canTakeAttendance) {
      showToast('Chỉ được điểm danh trong đúng ngày và giờ học hiện tại', 'error');
      return;
    }

    setSaving(true);
    try {
      const entries = students.map(s => ({
        hocVienId: s.hocVienId,
        trangThai: getLocalStatus(s) ?? 'ABSENT',
      }));
      await lecturerApi.updateAttendance(userId, {
        lopHocPhanId: classId,
        lichId: attendance.selectedLichId,
        entries,
      });
      setEditing(false);
      showToast('Lưu điểm danh thành công', 'success');
    } catch {
      showToast('Lưu thất bại, vui lòng thử lại', 'error');
    } finally {
      setSaving(false);
    }
  };

  if (!attendance || students.length === 0) {
    return (
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-16 text-center animate-in fade-in duration-300">
        <div className="w-16 h-16 bg-gray-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
          <ClipboardCheck className="w-8 h-8 text-gray-400" />
        </div>
        <h3 className="text-lg font-bold text-gray-700 mb-2">Chưa có dữ liệu điểm danh</h3>
        <p className="text-gray-400 text-sm">Dữ liệu điểm danh chưa được cập nhật cho lớp này</p>
      </div>
    );
  }

  return (
    <div className="space-y-4 animate-in fade-in duration-300">
      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-4 gap-3">
        {[
          { label: 'Tổng sinh viên', value: students.length, icon: Users, color: 'text-rose-600', bg: 'bg-rose-50' },
          { label: 'Có mặt', value: present, icon: CheckCircle, color: 'text-emerald-600', bg: 'bg-emerald-50' },
          { label: 'Vắng mặt', value: absent, icon: X, color: 'text-red-600', bg: 'bg-red-50' },
          {
            label: 'Tỷ lệ có mặt',
            value: `${rate.toFixed(0)}%`,
            icon: TrendingUp,
            color: rate >= 80 ? 'text-emerald-600' : rate >= 60 ? 'text-amber-600' : 'text-red-600',
            bg: rate >= 80 ? 'bg-emerald-50' : rate >= 60 ? 'bg-amber-50' : 'bg-red-50',
          },
        ].map(({ label, value, icon: Icon, color, bg }) => (
          <div key={label} className="bg-white rounded-2xl shadow-sm border border-gray-100 p-4 flex items-center gap-3">
            <div className={`w-10 h-10 rounded-xl ${bg} flex items-center justify-center`}>
              <Icon className={`w-5 h-5 ${color}`} />
            </div>
            <div>
              <p className="text-xs text-gray-500 font-medium">{label}</p>
              <p className="text-xl font-bold text-gray-900">{value}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Attendance Table */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="p-5 border-b border-gray-100 flex flex-col sm:flex-row items-start sm:items-center gap-3">
          <div className="flex items-center gap-2">
            <ClipboardCheck className="w-4.5 h-4.5 text-rose-500" />
            <h3 className="font-bold text-gray-900">Điểm danh hôm nay</h3>
            <span className="px-2 py-0.5 bg-rose-50 text-rose-700 text-xs font-bold rounded-full">{filtered.length}</span>
            {pending > 0 && (
              <span className="px-2 py-0.5 bg-slate-100 text-slate-600 text-xs font-bold rounded-full">{pending} chưa điểm danh</span>
            )}
          </div>
          <div className="flex items-center gap-2 sm:ml-auto">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                type="text"
                placeholder="Tìm sinh viên..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-9 pr-4 py-2 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-rose-400 focus:border-rose-300 w-56"
              />
            </div>
            {!editing ? (
              <button
                onClick={() => setEditing(true)}
                disabled={!attendance.canTakeAttendance}
                className="flex items-center gap-2 px-4 py-2 bg-rose-500 text-white rounded-xl hover:bg-rose-600 font-semibold text-sm shadow-sm transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
              >
                <Edit2 className="w-4 h-4" />Điểm danh
              </button>
            ) : (
              <div className="flex gap-2">
                <button onClick={() => { setEditing(false); const init: Record<string, AttendanceStatus | null> = {}; students.forEach(s => { init[s.hocVienId] = s.trangThai; }); setLocalAttendance(init); }} className="flex items-center gap-2 px-4 py-2 bg-gray-100 text-gray-600 rounded-xl hover:bg-gray-200 font-semibold text-sm transition-colors">
                  <X className="w-4 h-4" />Hủy
                </button>
                <button
                  onClick={handleSave}
                  disabled={saving}
                  className="flex items-center gap-2 px-4 py-2 bg-emerald-500 text-white rounded-xl hover:bg-emerald-600 font-semibold text-sm shadow-sm transition-colors disabled:opacity-50"
                >
                  <Save className="w-4 h-4" />{saving ? 'Đang lưu...' : 'Lưu điểm danh'}
                </button>
              </div>
            )}
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="bg-gray-50 border-b border-gray-100">
                <th className="text-left px-5 py-3 text-xs font-bold text-gray-500 uppercase tracking-wider w-12">#</th>
                <th className="text-left px-3 py-3 text-xs font-bold text-gray-500 uppercase tracking-wider">Sinh viên</th>
                <th className="text-left px-3 py-3 text-xs font-bold text-gray-500 uppercase tracking-wider">Mã SV</th>
                <th className="text-center px-3 py-3 text-xs font-bold text-gray-500 uppercase tracking-wider w-32">Trạng thái</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {filtered.map((s, i) => {
                const status = getLocalStatus(s);
                const checked = status === 'PRESENT' || status === 'LATE';
                return (
                  <tr key={s.hocVienId} className="hover:bg-gray-50/60 transition-colors">
                    <td className="px-5 py-4 text-sm text-gray-400 text-right">{i + 1}</td>
                    <td className="px-3 py-4">
                      <div className="flex items-center gap-3">
                        <div className={`w-10 h-10 rounded-full bg-gradient-to-br ${getAvatarBg(s.hoTen)} flex items-center justify-center text-white font-bold text-sm shrink-0`}>
                          {getInitials(s.hoTen)}
                        </div>
                        <span className="font-semibold text-gray-900">{s.hoTen}</span>
                      </div>
                    </td>
                    <td className="px-3 py-4 text-sm text-gray-600 font-medium">{s.maHocVien}</td>
                    <td className="px-3 py-4">
                      <div className="flex items-center justify-center gap-3">
                        {editing && (
                          <button
                            onClick={() => setLocalAttendance(prev => ({ ...prev, [s.hocVienId]: checked ? 'ABSENT' : 'PRESENT' }))}
                            className={`w-10 h-10 rounded-xl border-2 flex items-center justify-center transition-all ${
                              checked
                                ? 'border-emerald-400 bg-emerald-50 text-emerald-600'
                                : 'border-gray-200 bg-gray-50 text-gray-300'
                            }`}
                          >
                            <Check className="w-5 h-5" />
                          </button>
                        )}
                        <span className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold ${
                          !status ? 'bg-slate-50 text-slate-500' : checked ? 'bg-emerald-50 text-emerald-700' : 'bg-red-50 text-red-700'
                        }`}>
                          {checked ? <CheckCircle className="w-3.5 h-3.5" /> : <X className="w-3.5 h-3.5" />}
                          {!status ? 'Chưa điểm danh' : checked ? (status === 'LATE' ? 'Đi muộn' : 'Có mặt') : (status === 'EXCUSED' ? 'Vắng có phép' : 'Vắng')}
                        </span>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

