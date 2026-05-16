import { InstructorSidebar } from '@/components/layouts/InstructorSidebar';
import { InstructorHeader } from '@/components/layouts/InstructorHeader';
import {
  Search, BookOpen, Users, ChevronRight, BookMarked,
  Clock, MapPin, BarChart2, FileText
} from 'lucide-react';
import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router';
import { useAuth } from '@/hooks';
import { LecturerAIAssistantButton } from '@/components/chatbot/AIAssistantButton';
import lecturerApi, { LecturerClassSummaryResponseDTO } from '@/api/lecturer/lecturer.api';

const SUBJECT_COLORS = [
  { from: 'from-violet-500', to: 'to-indigo-600', icon: 'bg-violet-100', text: 'text-violet-600' },
  { from: 'from-emerald-500', to: 'to-teal-600', icon: 'bg-emerald-100', text: 'text-emerald-600' },
  { from: 'from-blue-500', to: 'to-cyan-600', icon: 'bg-blue-100', text: 'text-blue-600' },
  { from: 'from-amber-500', to: 'to-orange-600', icon: 'bg-amber-100', text: 'text-amber-600' },
  { from: 'from-rose-500', to: 'to-pink-600', icon: 'bg-rose-100', text: 'text-rose-600' },
  { from: 'from-indigo-500', to: 'to-violet-600', icon: 'bg-indigo-100', text: 'text-indigo-600' },
  { from: 'from-cyan-500', to: 'to-blue-600', icon: 'bg-cyan-100', text: 'text-cyan-600' },
  { from: 'from-teal-500', to: 'to-emerald-600', icon: 'bg-teal-100', text: 'text-teal-600' },
];

function getClassColor(index: number) {
  return SUBJECT_COLORS[index % SUBJECT_COLORS.length];
}

export default function ClassManagement() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [searchTerm, setSearchTerm] = useState('');
  const [classes, setClasses] = useState<LecturerClassSummaryResponseDTO[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user?.id) return;
    lecturerApi.getClasses(user.id)
      .then(setClasses)
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [user?.id]);

  const filtered = classes.filter(c =>
    c.tenMonHoc.toLowerCase().includes(searchTerm.toLowerCase()) ||
    c.maLopHocPhan.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const fmtDate = (iso: string) =>
    new Date(iso).toLocaleDateString('vi-VN', { day: '2-digit', month: '2-digit', year: 'numeric' });

  return (
    <div className="flex h-screen bg-gradient-to-br from-slate-100 via-blue-50 to-indigo-50">
      <InstructorSidebar />

      <div className="flex-1 ml-64 flex flex-col min-h-screen">
        <InstructorHeader title="Lớp học phần" />

        <div className="flex-1 overflow-auto p-6 lg:p-8">
          <div className="max-w-7xl mx-auto space-y-6">

            {/* Page Header */}
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-3xl font-bold text-gray-900 tracking-tight">Quản lý lớp học phần</h1>
                <p className="text-gray-500 mt-1">Các lớp học phần bạn đang phụ trách giảng dạy</p>
              </div>
              <div className="hidden sm:flex items-center gap-4 text-sm">
                <div className="flex items-center gap-2 px-4 py-2 bg-white rounded-xl shadow-sm border border-gray-100">
                  <BookOpen className="w-4 h-4 text-indigo-500" />
                  <span className="text-gray-600">Tổng lớp:</span>
                  <span className="font-bold text-gray-900">{classes.length}</span>
                </div>
              </div>
            </div>

            {/* Stats Row */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              {[
                { label: 'Lớp đang giảng dạy', value: classes.length, icon: BookMarked, from: 'from-indigo-500', to: 'to-violet-600' },
                { label: 'Tổng giờ học/tuần', value: '—', icon: Clock, from: 'from-emerald-500', to: 'to-teal-600' },
                { label: 'Sinh viên đăng ký', value: '—', icon: Users, from: 'from-amber-500', to: 'to-orange-600' },
              ].map(({ label, value, icon: Icon, from, to }) => (
                <div key={label} className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5 flex items-center gap-4">
                  <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${from} ${to} flex items-center justify-center shadow-lg`}
                    style={{ boxShadow: `0 4px 12px rgba(0,0,0,0.1)` }}>
                    <Icon className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider">{label}</p>
                    <p className="text-2xl font-bold text-gray-900 mt-0.5">{value}</p>
                  </div>
                </div>
              ))}
            </div>

            {/* Search */}
            <div className="relative">
              <Search className="absolute left-5 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="text"
                placeholder="Tìm theo tên môn học hoặc mã lớp học phần..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-14 pr-5 py-4 bg-white/80 backdrop-blur-sm border border-gray-200/60 rounded-2xl shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-400 focus:border-indigo-300 transition-all text-sm"
              />
            </div>

            {/* Content */}
            {loading ? (
              <div className="flex items-center justify-center py-20">
                <div className="text-center">
                  <div className="w-12 h-12 border-4 border-indigo-200 border-t-indigo-600 rounded-full animate-spin mx-auto mb-4"></div>
                  <p className="text-gray-500 font-medium">Đang tải danh sách lớp...</p>
                </div>
              </div>
            ) : filtered.length === 0 ? (
              <div className="bg-white rounded-3xl shadow-sm border border-gray-100 p-16 text-center">
                <div className="w-20 h-20 bg-gray-100 rounded-2xl flex items-center justify-center mx-auto mb-5">
                  <BookOpen className="w-10 h-10 text-gray-400" />
                </div>
                <h3 className="text-xl font-bold text-gray-700 mb-2">Không có lớp học phần nào</h3>
                <p className="text-gray-400 text-sm max-w-sm mx-auto">
                  {searchTerm ? 'Không tìm thấy lớp phù hợp với từ khóa tìm kiếm' : 'Bạn chưa được phân công giảng dạy lớp học phần nào'}
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
                {filtered.map((cls, idx) => {
                  const colors = getClassColor(idx);
                  return (
                    <div
                      key={cls.lopHocPhanId}
                      className="group bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden hover:shadow-lg hover:border-indigo-200 transition-all duration-300 cursor-pointer hover:-translate-y-1"
                      onClick={() => navigate(`/lecturer/classes/${cls.lopHocPhanId}`)}
                    >
                      {/* Card Header with gradient */}
                      <div className={`relative px-6 pt-6 pb-5 bg-gradient-to-br ${colors.from} ${colors.to}`}>
                        <div className="absolute -top-6 -right-6 w-32 h-32 bg-white/10 rounded-full"></div>
                        <div className="absolute -bottom-4 -left-4 w-24 h-24 bg-white/10 rounded-full"></div>
                        <div className="relative">
                          <div className="flex items-start justify-between mb-3">
                            <div className="w-12 h-12 bg-white/20 backdrop-blur-sm rounded-xl flex items-center justify-center shadow-lg">
                              <BookOpen className="w-6 h-6 text-white" />
                            </div>
                            <div className={`px-3 py-1 rounded-full text-xs font-bold text-white bg-white/20 backdrop-blur-sm`}>
                              #{idx + 1}
                            </div>
                          </div>
                          <p className="text-white/80 text-xs font-semibold uppercase tracking-wider mb-1">
                            {cls.maLopHocPhan}
                          </p>
                          <h3 className="font-bold text-white text-lg leading-tight line-clamp-2">
                            {cls.tenMonHoc}
                          </h3>
                        </div>
                      </div>

                      {/* Card Body */}
                      <div className="p-5 space-y-3">
                        <div className="flex items-center gap-2.5 text-sm text-gray-600">
                          <div className="w-7 h-7 bg-gray-100 rounded-lg flex items-center justify-center shrink-0">
                            <MapPin className="w-3.5 h-3.5 text-gray-500" />
                          </div>
                          <span className="font-medium">{cls.phong} – {cls.toaNha}</span>
                        </div>

                        {cls.ngayBatDau && (
                          <div className="flex items-center gap-2.5 text-sm text-gray-600">
                            <div className="w-7 h-7 bg-gray-100 rounded-lg flex items-center justify-center shrink-0">
                              <Clock className="w-3.5 h-3.5 text-gray-500" />
                            </div>
                            <span className="font-medium">{fmtDate(cls.ngayBatDau)} – {fmtDate(cls.ngayKetThuc)}</span>
                          </div>
                        )}

                        {/* Quick action indicators */}
                        <div className="flex items-center gap-2 pt-2 border-t border-gray-100">
                          {[
                            { icon: FileText, label: 'Tài liệu' },
                            { icon: BarChart2, label: 'Điểm' },
                            { icon: Users, label: 'SV' },
                            { icon: BookMarked, label: 'Bài tập' },
                          ].map(({ icon: ActionIcon, label }) => (
                            <div key={label} className="flex items-center gap-1.5 px-2.5 py-1 bg-gray-50 rounded-lg">
                              <ActionIcon className={`w-3.5 h-3.5 ${colors.text}`} />
                              <span className="text-xs font-medium text-gray-500">{label}</span>
                            </div>
                          ))}
                        </div>
                      </div>

                      {/* Hover arrow */}
                      <div className="px-5 pb-4 flex justify-end">
                        <div className="flex items-center gap-1 text-xs font-semibold text-indigo-500 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                          Xem chi tiết
                          <ChevronRight className="w-3.5 h-3.5" />
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      </div>

      <LecturerAIAssistantButton />
    </div>
  );
}

