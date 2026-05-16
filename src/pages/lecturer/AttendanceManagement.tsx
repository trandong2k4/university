import { InstructorSidebar } from '@/components/layouts/InstructorSidebar';
import { InstructorHeader } from '@/components/layouts/InstructorHeader';
import {
  AlertCircle, Calendar, CheckCheck, CheckCircle, ChevronDown, Clock,
  HelpCircle, MessageSquare, Save, Search, Timer, Users, X, XCircle
} from 'lucide-react';
import { useEffect, useMemo, useState } from 'react';
import { useAuth } from '@/hooks';
import AiAssistantButton from '@/imports/AiAssistantButton';
import lecturerApi, {
  AttendanceResponseDTO,
  AttendanceSessionDTO,
  AttendanceStatus,
  AttendanceStudentResponseDTO,
  LecturerClassSummaryResponseDTO,
} from '@/api/lecturer/lecturer.api';

interface StudentAttendance extends Omit<AttendanceStudentResponseDTO, 'ghiChu'> {
  ghiChu: string;
}

const STATUS_OPTIONS: Array<{
  value: AttendanceStatus;
  label: string;
  shortLabel: string;
  className: string;
}> = [
    { value: 'PRESENT', label: 'Có mặt', shortLabel: 'Có mặt', className: 'border-emerald-200 bg-emerald-50 text-emerald-700' },
    { value: 'LATE', label: 'Đi muộn', shortLabel: 'Muộn', className: 'border-amber-200 bg-amber-50 text-amber-700' },
    { value: 'EXCUSED', label: 'Vắng có phép', shortLabel: 'Có phép', className: 'border-blue-200 bg-blue-50 text-blue-700' },
    { value: 'ABSENT', label: 'Vắng không phép', shortLabel: 'Vắng', className: 'border-red-200 bg-red-50 text-red-700' },
  ];

function formatDate(value?: string) {
  if (!value) return 'Chưa có ngày';
  return new Date(`${value}T00:00:00`).toLocaleDateString('vi-VN', {
    weekday: 'short',
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  });
}

function formatTime(value?: string) {
  return value ? value.slice(0, 5) : '--:--';
}

function getStatusConfig(status: AttendanceStatus | null) {
  if (!status) {
    return {
      label: 'Chưa điểm danh',
      className: 'border-slate-200 bg-slate-50 text-slate-500',
      Icon: HelpCircle,
    };
  }

  const option = STATUS_OPTIONS.find(item => item.value === status);
  if (status === 'PRESENT') return { label: option?.label ?? status, className: option?.className ?? '', Icon: CheckCircle };
  if (status === 'LATE') return { label: option?.label ?? status, className: option?.className ?? '', Icon: Timer };
  return { label: option?.label ?? status, className: option?.className ?? '', Icon: XCircle };
}

function getInitials(name: string) {
  const parts = name.trim().split(/\s+/);
  if (parts.length >= 2) return `${parts[parts.length - 2][0]}${parts[parts.length - 1][0]}`.toUpperCase();
  return name.charAt(0).toUpperCase();
}

function getErrorMessage(err: unknown) {
  if (typeof err === 'object' && err !== null && 'response' in err) {
    const response = (err as { response?: { data?: { message?: string } | string } }).response;
    if (typeof response?.data === 'string') return response.data;
    if (response?.data?.message) return response.data.message;
  }
  return 'Không thể lưu dữ liệu điểm danh';
}

export default function AttendanceManagement() {
  const { user } = useAuth();
  const [classes, setClasses] = useState<LecturerClassSummaryResponseDTO[]>([]);
  const [selectedClassId, setSelectedClassId] = useState('');
  const [sessions, setSessions] = useState<AttendanceSessionDTO[]>([]);
  const [selectedSessionId, setSelectedSessionId] = useState('');
  const [attendanceData, setAttendanceData] = useState<AttendanceResponseDTO | null>(null);
  const [students, setStudents] = useState<StudentAttendance[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);
  const [saving, setSaving] = useState(false);
  const [loadingStudents, setLoadingStudents] = useState(false);
  const [toast, setToast] = useState<{ msg: string; type: 'success' | 'error' } | null>(null);

  const showToast = (msg: string, type: 'success' | 'error' = 'success') => {
    setToast({ msg, type });
    window.setTimeout(() => setToast(null), 3500);
  };

  useEffect(() => {
    if (!user?.id) return;
    lecturerApi.getClasses(user.id).then((data) => {
      setClasses(data);
      if (data.length > 0) setSelectedClassId(data[0].lopHocPhanId);
    }).catch(console.error);
  }, [user?.id]);

  useEffect(() => {
    if (!selectedClassId || !user?.id) return;
    let cancelled = false;
    setLoadingStudents(true);

    lecturerApi.getAttendance(selectedClassId, user.id, selectedSessionId || undefined)
      .then((data) => {
        if (cancelled) return;

        const loadedSessions = data.sessions ?? [];
        const fallbackSessionId =
          selectedSessionId ||
          data.selectedLichId ||
          loadedSessions.find(session => session.currentSession)?.lichId ||
          loadedSessions[0]?.lichId ||
          '';

        setSessions(loadedSessions);

        if (!selectedSessionId && fallbackSessionId && fallbackSessionId !== data.selectedLichId) {
          setSelectedSessionId(fallbackSessionId);
          return;
        }

        if (!selectedSessionId && data.selectedLichId) {
          setSelectedSessionId(data.selectedLichId);
        }

        setAttendanceData(data);
        setStudents(data.students.map(student => ({
          ...student,
          ghiChu: student.ghiChu ?? '',
        })));
        setHasUnsavedChanges(false);
      })
      .catch((err) => {
        console.error(err);
        showToast('Không thể tải dữ liệu điểm danh', 'error');
        setAttendanceData(null);
        setStudents([]);
      })
      .finally(() => {
        if (!cancelled) setLoadingStudents(false);
      });

    return () => { cancelled = true; };
  }, [selectedClassId, selectedSessionId, user?.id]);

  const selectedClass = classes.find(c => c.lopHocPhanId === selectedClassId);
  const selectedSession = sessions.find(session => session.lichId === selectedSessionId);
  const canTakeAttendance = Boolean(attendanceData?.canTakeAttendance && selectedSession?.canTakeAttendance);

  const filtered = students.filter(s =>
    s.hoTen.toLowerCase().includes(searchTerm.toLowerCase()) ||
    s.maHocVien.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const counts = useMemo(() => {
    const result = { present: 0, late: 0, absent: 0, excused: 0, pending: 0 };
    students.forEach(student => {
      if (student.trangThai === 'PRESENT') result.present += 1;
      else if (student.trangThai === 'LATE') result.late += 1;
      else if (student.trangThai === 'ABSENT') result.absent += 1;
      else if (student.trangThai === 'EXCUSED') result.excused += 1;
      else result.pending += 1;
    });
    return result;
  }, [students]);

  const attendanceRate = students.length > 0
    ? Math.round(((counts.present + counts.late) / students.length) * 100)
    : 0;

  const updateStudentStatus = (hocVienId: string, trangThai: AttendanceStatus) => {
    if (!canTakeAttendance) return;
    setStudents(prev => prev.map(student =>
      student.hocVienId === hocVienId ? { ...student, trangThai } : student
    ));
    setHasUnsavedChanges(true);
  };

  const updateStudentNote = (hocVienId: string, ghiChu: string) => {
    if (!canTakeAttendance) return;
    setStudents(prev => prev.map(student =>
      student.hocVienId === hocVienId ? { ...student, ghiChu } : student
    ));
    setHasUnsavedChanges(true);
  };

  const markAll = (trangThai: AttendanceStatus) => {
    if (!canTakeAttendance) return;
    setStudents(prev => prev.map(student => ({ ...student, trangThai })));
    setHasUnsavedChanges(true);
  };

  const handleClassChange = (classId: string) => {
    if (hasUnsavedChanges && !window.confirm('Bạn có thay đổi chưa lưu. Chuyển lớp sẽ bỏ các thay đổi này.')) return;
    setSelectedClassId(classId);
    setSelectedSessionId('');
    setAttendanceData(null);
    setStudents([]);
    setSearchTerm('');
    setHasUnsavedChanges(false);
  };

  const handleSessionChange = (sessionId: string) => {
    if (hasUnsavedChanges && !window.confirm('Bạn có thay đổi chưa lưu. Chuyển buổi học sẽ bỏ các thay đổi này.')) return;
    setSelectedSessionId(sessionId);
    setAttendanceData(null);
    setStudents([]);
    setHasUnsavedChanges(false);
  };

  const handleSave = async () => {
    if (!user?.id || !selectedClassId || !selectedSessionId) return;
    if (!canTakeAttendance) {
      showToast('Chỉ được điểm danh trong đúng ngày và giờ học của buổi học hiện tại', 'error');
      return;
    }

    const pendingStudents = students.filter(student => !student.trangThai);
    if (pendingStudents.length > 0) {
      showToast('Vui lòng chọn trạng thái cho tất cả sinh viên trước khi lưu', 'error');
      return;
    }

    setSaving(true);
    try {
      await lecturerApi.updateAttendance(user.id, {
        lopHocPhanId: selectedClassId,
        lichId: selectedSessionId,
        entries: students.map(student => ({
          hocVienId: student.hocVienId,
          trangThai: student.trangThai as AttendanceStatus,
          ghiChu: student.ghiChu.trim() || undefined,
        })),
      });

      const refreshed = await lecturerApi.getAttendance(selectedClassId, user.id, selectedSessionId);
      setAttendanceData(refreshed);
      setSessions(refreshed.sessions ?? []);
      setStudents(refreshed.students.map(student => ({ ...student, ghiChu: student.ghiChu ?? '' })));
      setHasUnsavedChanges(false);
      showToast('Lưu dữ liệu điểm danh thành công', 'success');
    } catch (err) {
      console.error(err);
      showToast(getErrorMessage(err), 'error');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="flex h-screen bg-slate-50">
      <InstructorSidebar />

      <div className="flex-1 ml-64 flex flex-col">
        <InstructorHeader title="Điểm danh sinh viên" />

        <div className="flex-1 overflow-auto p-6 lg:p-8">
          <div className="max-w-7xl mx-auto space-y-5">
            {toast && (
              <div className={`flex items-center gap-3 px-5 py-3 rounded-xl border shadow-sm ${toast.type === 'success'
                  ? 'bg-emerald-50 text-emerald-800 border-emerald-200'
                  : 'bg-red-50 text-red-800 border-red-200'
                }`}>
                {toast.type === 'success' ? <CheckCircle className="w-5 h-5" /> : <AlertCircle className="w-5 h-5" />}
                <span className="font-semibold text-sm">{toast.msg}</span>
              </div>
            )}

            <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
              <div>
                <h1 className="text-2xl font-bold text-slate-900">Điểm danh sinh viên</h1>
                <p className="text-slate-500 mt-1">Ghi nhận chuyên cần theo từng buổi học của lớp học phần</p>
              </div>
              <div className="flex items-center gap-3">
                {hasUnsavedChanges && (
                  <span className="inline-flex items-center gap-2 px-4 py-2 bg-amber-50 text-amber-700 rounded-lg text-sm font-semibold border border-amber-200">
                    <AlertCircle className="w-4 h-4" />Chưa lưu
                  </span>
                )}
                <button
                  onClick={handleSave}
                  disabled={!hasUnsavedChanges || saving || !canTakeAttendance}
                  className={`inline-flex items-center gap-2 px-5 py-2.5 rounded-lg font-semibold text-sm transition-colors ${hasUnsavedChanges && !saving && canTakeAttendance
                      ? 'bg-emerald-600 text-white hover:bg-emerald-700'
                      : 'bg-slate-200 text-slate-500 cursor-not-allowed'
                    }`}
                >
                  <Save className="w-4 h-4" />
                  {saving ? 'Đang lưu...' : 'Lưu điểm danh'}
                </button>
              </div>
            </div>

            <div className="grid grid-cols-2 xl:grid-cols-6 gap-3">
              {[
                { label: 'Tổng SV', value: students.length, Icon: Users, box: 'bg-slate-100', text: 'text-slate-700' },
                { label: 'Có mặt', value: counts.present, Icon: CheckCircle, box: 'bg-emerald-50', text: 'text-emerald-700' },
                { label: 'Đi muộn', value: counts.late, Icon: Timer, box: 'bg-amber-50', text: 'text-amber-700' },
                { label: 'Vắng KP', value: counts.absent, Icon: XCircle, box: 'bg-red-50', text: 'text-red-700' },
                { label: 'Có phép', value: counts.excused, Icon: CheckCheck, box: 'bg-blue-50', text: 'text-blue-700' },
                { label: 'Tỷ lệ', value: `${attendanceRate}%`, Icon: Clock, box: 'bg-indigo-50', text: 'text-indigo-700' },
              ].map(({ label, value, Icon, box, text }) => (
                <div key={label} className="bg-white rounded-xl shadow-sm border border-slate-200 p-4 flex items-center gap-3">
                  <div className={`w-10 h-10 rounded-lg ${box} flex items-center justify-center`}>
                    <Icon className={`w-5 h-5 ${text}`} />
                  </div>
                  <div>
                    <p className="text-xs text-slate-500 font-medium">{label}</p>
                    <p className={`text-xl font-bold ${text}`}>{value}</p>
                  </div>
                </div>
              ))}
            </div>

            <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-5">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wide mb-1.5">
                    Lớp học phần
                  </label>
                  <div className="relative">
                    <select
                      value={selectedClassId}
                      onChange={(e) => handleClassChange(e.target.value)}
                      className="w-full px-4 py-3 pr-10 border border-slate-300 rounded-lg appearance-none focus:outline-none focus:ring-2 focus:ring-emerald-500 bg-white text-sm font-medium"
                    >
                      {classes.map(c => (
                        <option key={c.lopHocPhanId} value={c.lopHocPhanId}>
                          {c.maLopHocPhan} - {c.tenMonHoc}
                        </option>
                      ))}
                    </select>
                    <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400 pointer-events-none" />
                  </div>
                  {selectedClass && (
                    <p className="text-xs text-slate-500 mt-2 flex items-center gap-1">
                      <Clock className="w-3 h-3" />
                      {selectedClass.phong} - {selectedClass.toaNha}
                    </p>
                  )}
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wide mb-1.5">
                    Buổi học
                  </label>
                  <div className="relative">
                    <select
                      value={selectedSessionId}
                      onChange={(e) => handleSessionChange(e.target.value)}
                      className="w-full px-4 py-3 pr-10 border border-slate-300 rounded-lg appearance-none focus:outline-none focus:ring-2 focus:ring-emerald-500 bg-white text-sm font-medium"
                    >
                      {sessions.length === 0 && <option value="">Lớp chưa có lịch học</option>}
                      {sessions.map(session => (
                        <option key={session.lichId} value={session.lichId}>
                          {formatDate(session.ngayHoc)} - {formatTime(session.gioBatDau)}-{formatTime(session.gioKetThuc)} - {session.phong}
                          {session.currentSession ? ' - Đang diễn ra' : ''}
                        </option>
                      ))}
                    </select>
                    <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400 pointer-events-none" />
                  </div>
                </div>
              </div>

              <div className={`mt-4 flex items-start gap-3 p-4 rounded-xl border ${canTakeAttendance
                  ? 'bg-emerald-50 border-emerald-200 text-emerald-800'
                  : 'bg-slate-50 border-slate-200 text-slate-700'
                }`}>
                <Calendar className={`w-5 h-5 mt-0.5 ${canTakeAttendance ? 'text-emerald-600' : 'text-slate-500'}`} />
                <div>
                  <p className="text-sm font-bold">
                    {canTakeAttendance ? 'Đang trong buổi học hiện tại' : 'Chế độ xem điểm danh'}
                  </p>
                  <p className="text-sm mt-0.5">
                    {attendanceData?.message ?? 'Chọn buổi học để xem hoặc cập nhật dữ liệu điểm danh.'}
                  </p>
                  {selectedSession && (
                    <p className="text-xs mt-1 opacity-80">
                      {formatDate(selectedSession.ngayHoc)} - {formatTime(selectedSession.gioBatDau)} đến {formatTime(selectedSession.gioKetThuc)}
                    </p>
                  )}
                </div>
              </div>
            </div>

            <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-5 flex flex-col lg:flex-row gap-4 lg:items-center justify-between">
              <div className="relative flex-1 max-w-md">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                <input
                  type="text"
                  placeholder="Tìm kiếm theo tên hoặc mã sinh viên..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-12 pr-4 py-3 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 text-sm"
                />
              </div>
              <div className="flex flex-wrap items-center gap-2">
                <button
                  onClick={() => markAll('PRESENT')}
                  disabled={!canTakeAttendance}
                  className="inline-flex items-center gap-2 px-4 py-2.5 bg-emerald-50 text-emerald-700 border border-emerald-200 rounded-lg hover:bg-emerald-100 transition-colors font-semibold text-sm disabled:opacity-40 disabled:cursor-not-allowed"
                >
                  <CheckCheck className="w-4 h-4" />Tất cả có mặt
                </button>
                <button
                  onClick={() => markAll('ABSENT')}
                  disabled={!canTakeAttendance}
                  className="inline-flex items-center gap-2 px-4 py-2.5 bg-red-50 text-red-700 border border-red-200 rounded-lg hover:bg-red-100 transition-colors font-semibold text-sm disabled:opacity-40 disabled:cursor-not-allowed"
                >
                  <X className="w-4 h-4" />Tất cả vắng
                </button>
              </div>
            </div>

            <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
              <div className="p-5 border-b border-slate-200 bg-slate-900 text-white flex items-center justify-between">
                <div>
                  <h3 className="font-bold text-lg">Danh sách sinh viên</h3>
                  <p className="text-sm text-slate-300">{filtered.length} sinh viên hiển thị</p>
                </div>
                {counts.pending > 0 && (
                  <span className="px-3 py-1 bg-slate-700 text-slate-100 rounded-full text-xs font-semibold">
                    {counts.pending} chưa điểm danh
                  </span>
                )}
              </div>

              {loadingStudents ? (
                <div className="p-12 text-center text-slate-500">Đang tải dữ liệu điểm danh...</div>
              ) : filtered.length === 0 ? (
                <div className="p-12 text-center">
                  <Users className="w-12 h-12 text-slate-300 mx-auto mb-2" />
                  <p className="text-slate-500">Không có sinh viên phù hợp</p>
                </div>
              ) : (
                <div className="divide-y divide-slate-100">
                  {filtered.map((student, index) => {
                    const status = getStatusConfig(student.trangThai);
                    const StatusIcon = status.Icon;
                    return (
                      <div key={student.hocVienId} className="p-5 hover:bg-slate-50 transition-colors">
                        <div className="grid grid-cols-1 xl:grid-cols-[1fr_520px_180px] gap-4 xl:items-center">
                          <div className="flex items-center gap-4 min-w-0">
                            <span className="w-8 text-sm text-slate-400 text-right">{index + 1}</span>
                            <div className="w-11 h-11 rounded-full bg-gradient-to-br from-emerald-500 to-teal-600 flex items-center justify-center text-white font-bold text-sm shrink-0">
                              {getInitials(student.hoTen)}
                            </div>
                            <div className="min-w-0">
                              <p className="font-bold text-slate-900 truncate">{student.hoTen}</p>
                              <p className="text-sm text-slate-500">{student.maHocVien}</p>
                            </div>
                          </div>

                          <div className="grid grid-cols-2 lg:grid-cols-4 gap-2">
                            {STATUS_OPTIONS.map(option => {
                              const selected = student.trangThai === option.value;
                              return (
                                <button
                                  key={option.value}
                                  onClick={() => updateStudentStatus(student.hocVienId, option.value)}
                                  disabled={!canTakeAttendance}
                                  className={`px-3 py-2 rounded-lg border text-sm font-semibold transition-colors ${selected
                                      ? option.className
                                      : 'border-slate-200 bg-white text-slate-500 hover:bg-slate-50'
                                    } disabled:cursor-not-allowed disabled:opacity-70`}
                                >
                                  {option.shortLabel}
                                </button>
                              );
                            })}
                          </div>

                          <div className="flex items-center xl:justify-end gap-3">
                            <span className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border text-xs font-bold ${status.className}`}>
                              <StatusIcon className="w-3.5 h-3.5" />
                              {status.label}
                            </span>
                            <span className="text-xs font-semibold text-slate-500 bg-slate-100 px-2.5 py-1.5 rounded-lg">
                              Vắng: {student.soBuoiVang ?? 0}
                            </span>
                          </div>
                        </div>

                        <div className="mt-3 flex items-center gap-2 xl:ml-[76px]">
                          <MessageSquare className="w-4 h-4 text-slate-400 shrink-0" />
                          <input
                            type="text"
                            value={student.ghiChu}
                            onChange={(e) => updateStudentNote(student.hocVienId, e.target.value)}
                            disabled={!canTakeAttendance}
                            placeholder="Ghi chú điểm danh..."
                            className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 disabled:bg-slate-50 disabled:text-slate-500"
                          />
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </div>
        </div>
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
