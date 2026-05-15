import { useCallback, useEffect, useState } from 'react';
import { useNavigate } from 'react-router';
import { useAuth } from '@/hooks';
import { apiClient } from '@/api/common';
import { StudentSidebar } from '@/components/layouts/StudentSidebar';
import { StudentHeader } from '@/components/layouts/StudentHeader';
import { AIAssistantButton } from '@/components/chatbot/AIAssistantButton';
import {
  ChevronLeft,
  ChevronRight,
  Calendar as CalendarIcon,
  Clock,
  MapPin,
  BookOpen,
  Loader2,
  AlertTriangle,
  RefreshCw,
} from 'lucide-react';

// ── Types ─────────────────────────────────────────────────────────────────────

interface LichItem {
  lichId: string;
  lopHocPhanId: string;
  maLopHocPhan: string;
  monHocId: string;
  maMonHoc: string;
  tenMonHoc: string;
  ngayHoc: string;
  thoiGianBatDau: string;
  thoiGianKetThuc: string;
  phongId: string;
  maPhong: string;
  tenPhong: string;
  ghiChu: string | null;
}

interface ScheduleResponse {
  cheDoXem: string;
  ngayThamChieu: string;
  tuNgay: string;
  denNgay: string;
  tongSuKien: number;
  lich: LichItem[];
}

type ViewMode = 'week' | 'month';

// ── Helpers ───────────────────────────────────────────────────────────────────

const PALETTE = [
  '#3b82f6', '#10b981', '#8b5cf6', '#f59e0b',
  '#ef4444', '#06b6d4', '#ec4899', '#84cc16',
  '#f97316', '#14b8a6',
];

const subjectColorMap = new Map<string, string>();
let colorIndex = 0;
const colorFor = (monHocId: string): string => {
  if (!subjectColorMap.has(monHocId)) {
    subjectColorMap.set(monHocId, PALETTE[colorIndex++ % PALETTE.length]);
  }
  return subjectColorMap.get(monHocId)!;
};

const toIsoDate = (d: Date): string =>
  `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;

const formatTime = (t: string): string => t.substring(0, 5);

const isSameDay = (a: Date, b: Date) =>
  a.getDate() === b.getDate() &&
  a.getMonth() === b.getMonth() &&
  a.getFullYear() === b.getFullYear();

const isToday = (d: Date) => isSameDay(d, new Date());

const getWeekDays = (date: Date): Date[] => {
  const d = new Date(date);
  const day = d.getDay();
  const diff = d.getDate() - day + (day === 0 ? -6 : 1);
  const monday = new Date(d.setDate(diff));
  return Array.from({ length: 7 }, (_, i) => {
    const x = new Date(monday);
    x.setDate(monday.getDate() + i);
    return x;
  });
};

const getMonthDays = (date: Date): Date[] => {
  const year = date.getFullYear();
  const month = date.getMonth();
  const firstDay = new Date(year, month, 1);
  const lastDay = new Date(year, month + 1, 0);
  const days: Date[] = [];

  const startOffset = firstDay.getDay() === 0 ? 6 : firstDay.getDay() - 1;
  for (let i = startOffset - 1; i >= 0; i--) {
    const d = new Date(firstDay);
    d.setDate(d.getDate() - i - 1);
    days.push(d);
  }
  for (let i = 1; i <= lastDay.getDate(); i++) days.push(new Date(year, month, i));
  const remaining = 42 - days.length;
  for (let i = 1; i <= remaining; i++) days.push(new Date(year, month + 1, i));
  return days;
};

const DAY_NAMES = ['T2', 'T3', 'T4', 'T5', 'T6', 'T7', 'CN'];
const WEEKDAY_VI: Record<number, string> = { 1: 'Thứ 2', 2: 'Thứ 3', 3: 'Thứ 4', 4: 'Thứ 5', 5: 'Thứ 6', 6: 'Thứ 7', 0: 'Chủ nhật' };

// ── Component ─────────────────────────────────────────────────────────────────

export default function SchedulePage() {
  const navigate = useNavigate();
  const { user: authUser, isAuthenticated } = useAuth();

  const [viewMode, setViewMode] = useState<ViewMode>('week');
  const [currentDate, setCurrentDate] = useState(new Date());
  const [scheduleData, setScheduleData] = useState<ScheduleResponse | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [selectedItem, setSelectedItem] = useState<LichItem | null>(null);

  useEffect(() => {
    if (!isAuthenticated || !authUser) { navigate('/'); return; }
    if (authUser.role !== 'student') { navigate('/'); return; }
  }, [isAuthenticated, authUser, navigate]);

  const fetchSchedule = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const res = await apiClient.get<ScheduleResponse>('/student/schedule/me', {
        params: {
          view: viewMode.toUpperCase(),
          date: toIsoDate(currentDate),
        },
      });
      setScheduleData(res.data);
    } catch {
      setError('Không thể tải lịch học. Vui lòng thử lại.');
    } finally {
      setLoading(false);
    }
  }, [viewMode, currentDate]);

  useEffect(() => { fetchSchedule(); }, [fetchSchedule]);

  const eventsForDay = (day: Date): LichItem[] =>
    (scheduleData?.lich ?? []).filter(item =>
      isSameDay(new Date(item.ngayHoc), day)
    ).sort((a, b) => a.thoiGianBatDau.localeCompare(b.thoiGianBatDau));

  const navigate_ = (dir: 1 | -1) => {
    const d = new Date(currentDate);
    if (viewMode === 'week') d.setDate(d.getDate() + dir * 7);
    else d.setMonth(d.getMonth() + dir);
    setCurrentDate(d);
  };

  const weekDays = getWeekDays(new Date(currentDate));
  const monthDays = getMonthDays(new Date(currentDate));

  const formatHeader = () => {
    if (viewMode === 'week') {
      const s = weekDays[0], e = weekDays[6];
      const sameMonth = s.getMonth() === e.getMonth();
      return sameMonth
        ? `${s.getDate()}–${e.getDate()} ${s.toLocaleDateString('vi-VN', { month: 'long', year: 'numeric' })}`
        : `${s.toLocaleDateString('vi-VN', { day: 'numeric', month: 'short' })} – ${e.toLocaleDateString('vi-VN', { day: 'numeric', month: 'short', year: 'numeric' })}`;
    }
    return currentDate.toLocaleDateString('vi-VN', { month: 'long', year: 'numeric' });
  };

  if (!authUser) return null;

  const userName = authUser.fullName || authUser.username || '';

  return (
    <div className="flex h-screen bg-[#f1f5f9]">
      <StudentSidebar />

      <div className="flex-1 ml-64 flex flex-col">
        <StudentHeader userName={userName} />

        <main className="flex-1 overflow-y-auto p-8">
          {/* Title */}
          <div className="mb-6">
            <h1 className="text-3xl font-bold text-[#0a2540]">Lịch học</h1>
            <p className="text-[#6a7282] mt-1">Thời khóa biểu cá nhân</p>
          </div>

          {/* Calendar card */}
          <div className="bg-white rounded-[14px] border border-[#e5e7eb] shadow-sm overflow-hidden">

            {/* Header bar */}
            <div className="px-6 py-4 border-b border-[#e5e7eb] flex items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <h2 className="text-lg font-bold text-[#0a2540]">{formatHeader()}</h2>
                <button
                  onClick={() => setCurrentDate(new Date())}
                  className="px-3 py-1.5 text-xs font-semibold text-[#0a2540] bg-[#f1f5f9] rounded-lg hover:bg-[#e5e7eb] transition-colors"
                >
                  Hôm nay
                </button>
                <button
                  onClick={fetchSchedule}
                  className="p-1.5 text-[#6a7282] hover:text-[#0a2540] hover:bg-[#f1f5f9] rounded-lg transition-colors"
                  title="Làm mới"
                >
                  <RefreshCw className="w-4 h-4" />
                </button>
              </div>

              <div className="flex items-center gap-3">
                {/* View toggle */}
                <div className="flex bg-[#f1f5f9] rounded-lg p-1">
                  {(['week', 'month'] as ViewMode[]).map(v => (
                    <button
                      key={v}
                      onClick={() => setViewMode(v)}
                      className={`px-4 py-1.5 text-sm font-medium rounded-md transition-colors ${
                        viewMode === v
                          ? 'bg-white text-[#0a2540] shadow-sm'
                          : 'text-[#6a7282] hover:text-[#0a2540]'
                      }`}
                    >
                      {v === 'week' ? 'Tuần' : 'Tháng'}
                    </button>
                  ))}
                </div>

                {/* Prev / Next */}
                <div className="flex gap-1">
                  <button onClick={() => navigate_(-1)} className="p-2 text-[#6a7282] hover:bg-[#f1f5f9] rounded-lg transition-colors">
                    <ChevronLeft className="w-5 h-5" />
                  </button>
                  <button onClick={() => navigate_(1)} className="p-2 text-[#6a7282] hover:bg-[#f1f5f9] rounded-lg transition-colors">
                    <ChevronRight className="w-5 h-5" />
                  </button>
                </div>
              </div>
            </div>

            {/* Body */}
            <div className="p-6">
              {loading ? (
                <div className="flex items-center justify-center py-20">
                  <Loader2 className="w-8 h-8 animate-spin text-[#0a2540]" />
                </div>
              ) : error ? (
                <div className="flex flex-col items-center justify-center py-16 text-red-600 gap-2">
                  <AlertTriangle className="w-8 h-8" />
                  <p className="text-sm">{error}</p>
                  <button onClick={fetchSchedule} className="mt-2 px-4 py-2 bg-[#0a2540] text-white rounded-lg text-sm font-semibold hover:bg-[#0d2f52]">
                    Thử lại
                  </button>
                </div>
              ) : viewMode === 'week' ? (
                /* ── Week view ─────────────────────────────────────────── */
                <div className="space-y-1">
                  {weekDays.map((day, i) => {
                    const dayEvents = eventsForDay(day);
                    const today = isToday(day);
                    return (
                      <div key={i} className={`flex gap-4 py-3 border-b border-[#f1f5f9] last:border-0 ${today ? 'bg-blue-50/40 rounded-lg px-2' : ''}`}>
                        {/* Day label */}
                        <div className="w-20 flex-shrink-0 pt-1">
                          <p className={`text-xs font-semibold uppercase tracking-wide ${today ? 'text-blue-600' : 'text-[#9ca3af]'}`}>
                            {DAY_NAMES[i]}
                          </p>
                          <div className={`inline-flex items-center justify-center w-9 h-9 rounded-full text-lg font-bold mt-0.5 ${
                            today ? 'bg-[#0a2540] text-white' : 'text-[#374151]'
                          }`}>
                            {day.getDate()}
                          </div>
                        </div>

                        {/* Events */}
                        <div className="flex-1 space-y-2 min-h-[56px]">
                          {dayEvents.length === 0 ? (
                            <p className="text-sm text-[#d1d5db] italic pt-3">Không có lịch</p>
                          ) : (
                            dayEvents.map(item => (
                              <div
                                key={item.lichId}
                                onClick={() => setSelectedItem(item)}
                                className="flex items-start gap-3 p-3 rounded-[10px] border border-[#e5e7eb] bg-white hover:shadow-md cursor-pointer transition-shadow border-l-4"
                                style={{ borderLeftColor: colorFor(item.monHocId) }}
                              >
                                <div className="flex-1 min-w-0">
                                  <p className="font-semibold text-[#0a2540] text-sm truncate">{item.tenMonHoc}</p>
                                  <div className="flex flex-wrap gap-x-4 gap-y-1 mt-1 text-xs text-[#6a7282]">
                                    <span className="flex items-center gap-1">
                                      <Clock className="w-3.5 h-3.5" />
                                      {formatTime(item.thoiGianBatDau)} – {formatTime(item.thoiGianKetThuc)}
                                    </span>
                                    <span className="flex items-center gap-1">
                                      <MapPin className="w-3.5 h-3.5" />
                                      {item.tenPhong || item.maPhong}
                                    </span>
                                  </div>
                                </div>
                                <span className="text-xs font-mono text-[#9ca3af] whitespace-nowrap pt-0.5">
                                  {item.maLopHocPhan}
                                </span>
                              </div>
                            ))
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              ) : (
                /* ── Month view ────────────────────────────────────────── */
                <div>
                  <div className="grid grid-cols-7 mb-1">
                    {DAY_NAMES.map(d => (
                      <div key={d} className="text-center text-xs font-semibold text-[#6a7282] py-2">{d}</div>
                    ))}
                  </div>
                  <div className="grid grid-cols-7 gap-1">
                    {monthDays.map((day, i) => {
                      const dayEvents = eventsForDay(day);
                      const today = isToday(day);
                      const currentMonth = day.getMonth() === currentDate.getMonth();
                      return (
                        <div
                          key={i}
                          className={`min-h-[100px] p-1.5 rounded-lg border ${
                            today ? 'bg-blue-50 border-blue-300' : 'bg-white border-[#e5e7eb]'
                          } ${!currentMonth ? 'opacity-35' : ''}`}
                        >
                          <div className={`text-xs font-semibold mb-1 w-6 h-6 flex items-center justify-center rounded-full ${
                            today ? 'bg-[#0a2540] text-white' : 'text-[#374151]'
                          }`}>
                            {day.getDate()}
                          </div>
                          <div className="space-y-0.5">
                            {dayEvents.slice(0, 3).map(item => (
                              <div
                                key={item.lichId}
                                onClick={() => setSelectedItem(item)}
                                className="text-[10px] px-1.5 py-0.5 rounded font-medium text-white truncate cursor-pointer hover:opacity-85"
                                style={{ backgroundColor: colorFor(item.monHocId) }}
                                title={`${item.tenMonHoc} ${formatTime(item.thoiGianBatDau)}`}
                              >
                                {formatTime(item.thoiGianBatDau)} {item.tenMonHoc}
                              </div>
                            ))}
                            {dayEvents.length > 3 && (
                              <p className="text-[10px] text-[#6a7282] font-medium pl-1">+{dayEvents.length - 3} môn</p>
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Legend */}
          {scheduleData && scheduleData.lich.length > 0 && (
            <div className="mt-4 bg-white rounded-[14px] border border-[#e5e7eb] shadow-sm p-4">
              <p className="text-xs font-semibold text-[#6a7282] uppercase tracking-wide mb-3">Môn học</p>
              <div className="flex flex-wrap gap-3">
                {Array.from(new Map(scheduleData.lich.map(i => [i.monHocId, i])).values()).map(item => (
                  <div key={item.monHocId} className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded-full" style={{ backgroundColor: colorFor(item.monHocId) }} />
                    <span className="text-sm text-[#374151]">{item.tenMonHoc}</span>
                    <span className="text-xs text-[#9ca3af]">({item.maMonHoc})</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Empty state (no events at all for period) */}
          {!loading && !error && scheduleData && scheduleData.tongSuKien === 0 && (
            <div className="mt-4 bg-white rounded-[14px] border border-[#e5e7eb] shadow-sm p-10 text-center">
              <CalendarIcon className="w-12 h-12 text-[#d1d5db] mx-auto mb-3" />
              <p className="text-[#6a7282] font-medium">Không có lịch học trong khoảng thời gian này</p>
            </div>
          )}
        </main>
      </div>

      <AIAssistantButton />

      {/* Detail modal */}
      {selectedItem && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4" onClick={() => setSelectedItem(null)}>
          <div
            className="bg-white rounded-[16px] shadow-xl w-full max-w-md"
            onClick={e => e.stopPropagation()}
          >
            {/* Modal header */}
            <div
              className="px-6 py-4 rounded-t-[16px] text-white"
              style={{ backgroundColor: colorFor(selectedItem.monHocId) }}
            >
              <p className="text-xs font-semibold opacity-80 mb-0.5">{selectedItem.maMonHoc} · {selectedItem.maLopHocPhan}</p>
              <h2 className="text-xl font-bold">{selectedItem.tenMonHoc}</h2>
            </div>

            {/* Modal body */}
            <div className="px-6 py-5 space-y-4">
              <div className="flex items-start gap-3">
                <CalendarIcon className="w-5 h-5 text-[#6a7282] mt-0.5 flex-shrink-0" />
                <div>
                  <p className="text-xs text-[#6a7282]">Ngày học</p>
                  <p className="font-semibold text-[#0a2540]">
                    {WEEKDAY_VI[new Date(selectedItem.ngayHoc).getDay()]},{' '}
                    {new Date(selectedItem.ngayHoc).toLocaleDateString('vi-VN', {
                      day: 'numeric', month: 'long', year: 'numeric',
                    })}
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <Clock className="w-5 h-5 text-[#6a7282] mt-0.5 flex-shrink-0" />
                <div>
                  <p className="text-xs text-[#6a7282]">Thời gian</p>
                  <p className="font-semibold text-[#0a2540]">
                    {formatTime(selectedItem.thoiGianBatDau)} – {formatTime(selectedItem.thoiGianKetThuc)}
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <MapPin className="w-5 h-5 text-[#6a7282] mt-0.5 flex-shrink-0" />
                <div>
                  <p className="text-xs text-[#6a7282]">Phòng học</p>
                  <p className="font-semibold text-[#0a2540]">
                    {selectedItem.tenPhong || selectedItem.maPhong}
                  </p>
                </div>
              </div>

              {selectedItem.ghiChu && (
                <div className="flex items-start gap-3">
                  <BookOpen className="w-5 h-5 text-[#6a7282] mt-0.5 flex-shrink-0" />
                  <div>
                    <p className="text-xs text-[#6a7282]">Ghi chú</p>
                    <p className="font-semibold text-[#0a2540]">{selectedItem.ghiChu}</p>
                  </div>
                </div>
              )}
            </div>

            <div className="px-6 pb-5">
              <button
                onClick={() => setSelectedItem(null)}
                className="w-full py-2.5 bg-[#0a2540] text-white rounded-[10px] font-semibold text-sm hover:bg-[#0d2f52] transition-colors"
              >
                Đóng
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
