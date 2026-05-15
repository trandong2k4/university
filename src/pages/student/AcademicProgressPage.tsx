import { useCallback, useEffect, useState } from 'react';
import { useNavigate } from 'react-router';
import { useAuth } from '@/hooks';
import { apiClient } from '@/api/common';
import { StudentSidebar } from '@/components/layouts/StudentSidebar';
import { StudentHeader } from '@/components/layouts/StudentHeader';
import { AIAssistantButton } from '@/components/chatbot/AIAssistantButton';
import axios from 'axios';
import {
  TrendingUp,
  Award,
  Target,
  BookOpen,
  Calendar,
  ChevronDown,
  Trophy,
  Clock,
  CheckCircle,
  XCircle,
  AlertCircle,
  Loader2,
  RefreshCw,
} from 'lucide-react';
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts';

// ── Types ──────────────────────────────────────────────────────────────────────

interface MonHocResponse {
  monHocId: string;
  hocKiId: string | null;
  maMonHoc: string;
  tenMonHoc: string;
  soTinChi: number | null;
  maHocKi: string | null;
  tenHocKi: string | null;
  diemTongKet: number | null;
  diemHe4: number | null;
  daHoanThanh: boolean;
  daDat: boolean;
}

interface HocKyResponse {
  hocKiId: string;
  maHocKi: string;
  tenHocKi: string;
  tongTinChi: number;
  tinChiHoanThanh: number;
  gpaHocKy: number;
  phanTramHoanThanhHocKy: number;
  monHoc: MonHocResponse[];
}

interface TienDoResponse {
  tongSoMonTrongChuongTrinh: number;
  tongTinChiChuongTrinh: number;
  soMonDaHoc: number;
  soMonChuaHoc: number;
  soTinChiDaHoanThanh: number;
  gpaTichLuy: number;
  phanTramHoanThanh: number;
  monDaHoc: MonHocResponse[];
  monChuaHoc: MonHocResponse[];
  tienDoTheoHocKy: HocKyResponse[];
}

// ── Helpers ────────────────────────────────────────────────────────────────────

const getLetterGrade = (diem: number | null): string => {
  if (diem == null) return '—';
  if (diem >= 8.5) return 'A';
  if (diem >= 8.0) return 'B+';
  if (diem >= 7.0) return 'B';
  if (diem >= 6.5) return 'C+';
  if (diem >= 5.5) return 'C';
  if (diem >= 5.0) return 'D+';
  if (diem >= 4.0) return 'D';
  return 'F';
};

const getGradeColor = (diem: number | null): string => {
  if (diem == null) return 'text-gray-500 bg-gray-100';
  if (diem >= 7.0) return 'text-green-700 bg-green-100';
  if (diem >= 5.5) return 'text-yellow-700 bg-yellow-100';
  if (diem >= 5.0) return 'text-orange-700 bg-orange-100';
  return 'text-red-700 bg-red-100';
};

const getXepLoai = (gpa4: number): string => {
  if (gpa4 >= 3.6) return 'Xuất sắc';
  if (gpa4 >= 3.2) return 'Giỏi';
  if (gpa4 >= 2.5) return 'Khá';
  if (gpa4 >= 2.0) return 'Trung bình';
  if (gpa4 > 0) return 'Yếu';
  return '—';
};

const extractError = (err: unknown): string => {
  if (axios.isAxiosError(err)) {
    const detail = err.response?.data?.detail;
    if (detail) return detail;
  }
  return 'Có lỗi xảy ra. Vui lòng thử lại.';
};

// ── Component ──────────────────────────────────────────────────────────────────

export default function AcademicProgressPage() {
  const navigate = useNavigate();
  const { user: authUser, isAuthenticated } = useAuth();

  const [allData, setAllData] = useState<TienDoResponse | null>(null);
  const [data, setData] = useState<TienDoResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [selectedHocKiId, setSelectedHocKiId] = useState<string>('all');

  useEffect(() => {
    if (!isAuthenticated || !authUser) { navigate('/'); return; }
    if (authUser.role !== 'student') { navigate('/'); return; }
  }, [isAuthenticated, authUser, navigate]);

  const fetchAll = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const res = await apiClient.get<TienDoResponse>('/student/learning-progress/me');
      setAllData(res.data);
      setData(res.data);
    } catch (err) {
      setError(extractError(err));
    } finally {
      setLoading(false);
    }
  }, []);

  const fetchByHocKi = useCallback(async (hocKiId: string) => {
    setLoading(true);
    setError('');
    try {
      const res = await apiClient.get<TienDoResponse>(
        `/student/learning-progress/me?hocKiId=${hocKiId}`
      );
      setData(prev => ({
        ...res.data,
        tienDoTheoHocKy: allData?.tienDoTheoHocKy ?? prev?.tienDoTheoHocKy ?? [],
      }));
    } catch (err) {
      setError(extractError(err));
    } finally {
      setLoading(false);
    }
  }, [allData]);

  useEffect(() => { fetchAll(); }, [fetchAll]);

  useEffect(() => {
    if (selectedHocKiId === 'all') {
      if (allData) setData(allData);
    } else {
      fetchByHocKi(selectedHocKiId);
    }
  }, [selectedHocKiId, allData, fetchByHocKi]);

  const handleRefresh = useCallback(() => {
    setSelectedHocKiId('all');
    fetchAll();
  }, [fetchAll]);

  if (!authUser) return null;
  const userName = authUser.fullName || authUser.username || '';

  // ── Derived data ───────────────────────────────────────────────────────────────

  const selectedHocKy = selectedHocKiId === 'all'
    ? null
    : (allData?.tienDoTheoHocKy.find(s => s.hocKiId === selectedHocKiId) ?? null);

  const displayCourses: MonHocResponse[] = selectedHocKy
    ? selectedHocKy.monHoc
    : (data?.monDaHoc ?? []);

  const semesterGPAData = allData?.tienDoTheoHocKy.map(s => ({
    semester: s.maHocKi,
    gpa: s.gpaHocKy,
  })) ?? [];

  const allGraded = allData?.monDaHoc ?? [];
  const gradeDistribution = [
    { name: 'Giỏi (≥8.5)', value: allGraded.filter(m => (m.diemTongKet ?? -1) >= 8.5).length, color: '#10b981' },
    { name: 'Khá (7–8.5)', value: allGraded.filter(m => { const d = m.diemTongKet ?? -1; return d >= 7 && d < 8.5; }).length, color: '#3b82f6' },
    { name: 'TB (5–6.9)', value: allGraded.filter(m => { const d = m.diemTongKet ?? -1; return d >= 5 && d < 7; }).length, color: '#f59e0b' },
    { name: 'Yếu (<5)', value: allGraded.filter(m => m.diemTongKet != null && m.diemTongKet < 5).length, color: '#ef4444' },
  ].filter(d => d.value > 0);

  const topCourses = [...allGraded]
    .filter(m => m.diemTongKet != null)
    .sort((a, b) => (b.diemTongKet ?? 0) - (a.diemTongKet ?? 0))
    .slice(0, 6)
    .map(m => ({ name: m.maMonHoc, grade: m.diemTongKet!, fullName: m.tenMonHoc }));

  const currentGpa = selectedHocKy ? selectedHocKy.gpaHocKy : (data?.gpaTichLuy ?? 0);
  const currentGpaLabel = selectedHocKy ? 'GPA học kỳ' : 'GPA tích lũy';

  return (
    <div className="flex h-screen bg-[#f1f5f9]">
      <StudentSidebar />

      <div className="flex-1 ml-64 flex flex-col">
        <StudentHeader userName={userName} />

        <main className="flex-1 overflow-y-auto p-8">
          {/* Header */}
          <div className="mb-6 flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-[#0a2540]">Tiến độ học tập</h1>
              <p className="text-[#6a7282] mt-1">Theo dõi kết quả và tiến độ học tập của bạn</p>
            </div>
            <button
              onClick={handleRefresh}
              disabled={loading}
              className="p-2 text-[#6a7282] hover:text-[#0a2540] hover:bg-white rounded-lg transition-colors"
              title="Làm mới"
            >
              <RefreshCw className={`w-5 h-5 ${loading ? 'animate-spin' : ''}`} />
            </button>
          </div>

          {loading ? (
            <div className="flex items-center justify-center py-32">
              <Loader2 className="w-10 h-10 animate-spin text-[#0a2540]" />
            </div>
          ) : error ? (
            <div className="flex flex-col items-center justify-center py-24 gap-3">
              <AlertCircle className="w-10 h-10 text-red-500" />
              <p className="text-red-600 font-medium">{error}</p>
              <button
                onClick={handleRefresh}
                className="px-5 py-2 bg-[#0a2540] text-white rounded-lg text-sm font-semibold hover:bg-[#0d2f52]"
              >
                Thử lại
              </button>
            </div>
          ) : !data ? null : (
            <>
              {/* Stats cards */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
                {/* GPA card */}
                <div className="bg-gradient-to-br from-blue-600 to-purple-600 rounded-[14px] shadow-lg p-6 text-white md:col-span-2">
                  <div className="flex items-center justify-between mb-4">
                    <div>
                      <p className="text-blue-100 text-sm font-medium mb-1">{currentGpaLabel}</p>
                      <div className="flex items-baseline gap-2">
                        <h2 className="text-5xl font-bold">{currentGpa.toFixed(2)}</h2>
                        <span className="text-2xl text-blue-100">/4.0</span>
                      </div>
                    </div>
                    <div className="p-4 bg-white/20 rounded-full backdrop-blur-sm">
                      <Trophy className="w-10 h-10 text-white" />
                    </div>
                  </div>
                  <div className="flex items-center gap-4 mt-4 pt-4 border-t border-white/20">
                    <div>
                      <p className="text-xs text-blue-100">Xếp loại</p>
                      <p className="text-lg font-bold">{getXepLoai(currentGpa)}</p>
                    </div>
                    <div className="h-8 w-px bg-white/20" />
                    <div>
                      <p className="text-xs text-blue-100">Đã học</p>
                      <p className="text-lg font-bold">{data.soMonDaHoc}/{data.tongSoMonTrongChuongTrinh} môn</p>
                    </div>
                  </div>
                </div>

                {/* Credits progress */}
                <div className="bg-white rounded-[14px] border border-[#e5e7eb] shadow-sm p-6">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="p-3 bg-green-100 rounded-lg">
                      <BookOpen className="w-6 h-6 text-green-600" />
                    </div>
                    <div>
                      <p className="text-sm text-[#6a7282]">Tín chỉ hoàn thành</p>
                      <p className="text-2xl font-bold text-[#0a2540]">{data.soTinChiDaHoanThanh}</p>
                    </div>
                  </div>
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span className="text-[#6a7282]">Tiến độ</span>
                      <span className="font-semibold text-[#0a2540]">{data.phanTramHoanThanh.toFixed(0)}%</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div
                        className="bg-green-600 h-2 rounded-full transition-all"
                        style={{ width: `${Math.min(data.phanTramHoanThanh, 100)}%` }}
                      />
                    </div>
                    <p className="text-xs text-[#6a7282]">
                      Còn lại: {data.tongTinChiChuongTrinh - data.soTinChiDaHoanThanh} / {data.tongTinChiChuongTrinh} tín chỉ
                    </p>
                  </div>
                </div>

                {/* Remaining courses */}
                <div className="bg-white rounded-[14px] border border-[#e5e7eb] shadow-sm p-6">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="p-3 bg-orange-100 rounded-lg">
                      <Clock className="w-6 h-6 text-orange-600" />
                    </div>
                    <div>
                      <p className="text-sm text-[#6a7282]">Môn chưa học</p>
                      <p className="text-2xl font-bold text-[#0a2540]">{data.soMonChuaHoc}</p>
                    </div>
                  </div>
                  <div className="pt-3 border-t border-[#e5e7eb]">
                    <p className="text-xs text-[#6a7282]">Tổng chương trình</p>
                    <p className="text-sm font-semibold text-[#0a2540]">
                      {data.tongSoMonTrongChuongTrinh} môn · {data.tongTinChiChuongTrinh} tín chỉ
                    </p>
                  </div>
                </div>
              </div>

              {/* Charts */}
              {(allData?.tienDoTheoHocKy.length ?? 0) > 0 && (
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
                  {/* GPA trend line chart */}
                  <div className="bg-white rounded-[14px] border border-[#e5e7eb] shadow-sm p-6">
                    <h3 className="text-lg font-bold text-[#0a2540] mb-4 flex items-center gap-2">
                      <TrendingUp className="w-5 h-5 text-blue-600" />
                      Xu hướng GPA (hệ 4)
                    </h3>
                    <ResponsiveContainer width="100%" height={220}>
                      <LineChart data={semesterGPAData}>
                        <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                        <XAxis dataKey="semester" tick={{ fill: '#6a7282', fontSize: 11 }} stroke="#e5e7eb" />
                        <YAxis domain={[0, 4]} tick={{ fill: '#6a7282', fontSize: 11 }} stroke="#e5e7eb" />
                        <Tooltip
                          contentStyle={{ backgroundColor: '#fff', border: '1px solid #e5e7eb', borderRadius: '8px', fontSize: '12px' }}
                          formatter={(v: number) => [v.toFixed(2), 'GPA']}
                        />
                        <Line type="monotone" dataKey="gpa" stroke="#3b82f6" strokeWidth={3} dot={{ fill: '#3b82f6', r: 5 }} activeDot={{ r: 7 }} />
                      </LineChart>
                    </ResponsiveContainer>
                  </div>

                  {/* Grade distribution pie chart */}
                  <div className="bg-white rounded-[14px] border border-[#e5e7eb] shadow-sm p-6">
                    <h3 className="text-lg font-bold text-[#0a2540] mb-4 flex items-center gap-2">
                      <Target className="w-5 h-5 text-purple-600" />
                      Phân bố xếp loại
                    </h3>
                    {gradeDistribution.length > 0 ? (
                      <ResponsiveContainer width="100%" height={220}>
                        <PieChart>
                          <Pie
                            data={gradeDistribution}
                            cx="50%"
                            cy="50%"
                            labelLine={false}
                            label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                            outerRadius={80}
                            dataKey="value"
                          >
                            {gradeDistribution.map((entry, i) => (
                              <Cell key={i} fill={entry.color} />
                            ))}
                          </Pie>
                          <Tooltip />
                        </PieChart>
                      </ResponsiveContainer>
                    ) : (
                      <div className="flex items-center justify-center h-[220px] text-[#9ca3af] text-sm">
                        Chưa có dữ liệu điểm
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* Top courses bar chart */}
              {topCourses.length > 0 && (
                <div className="bg-white rounded-[14px] border border-[#e5e7eb] shadow-sm p-6 mb-6">
                  <h3 className="text-lg font-bold text-[#0a2540] mb-4 flex items-center gap-2">
                    <Award className="w-5 h-5 text-yellow-600" />
                    Môn học điểm cao nhất
                  </h3>
                  <ResponsiveContainer width="100%" height={260}>
                    <BarChart data={topCourses}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                      <XAxis dataKey="name" tick={{ fill: '#6a7282', fontSize: 12 }} stroke="#e5e7eb" />
                      <YAxis domain={[0, 10]} tick={{ fill: '#6a7282', fontSize: 12 }} stroke="#e5e7eb" />
                      <Tooltip
                        contentStyle={{ backgroundColor: '#fff', border: '1px solid #e5e7eb', borderRadius: '8px', fontSize: '12px' }}
                        formatter={(v: number, _: string, props) => [
                          v.toFixed(1),
                          (props?.payload as { fullName?: string })?.fullName ?? '',
                        ]}
                      />
                      <Bar dataKey="grade" fill="#10b981" radius={[8, 8, 0, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              )}

              {/* Grades table */}
              <div className="bg-white rounded-[14px] border border-[#e5e7eb] shadow-sm overflow-hidden">
                <div className="p-6 border-b border-[#e5e7eb] flex items-center justify-between">
                  <h3 className="text-lg font-bold text-[#0a2540] flex items-center gap-2">
                    <BookOpen className="w-5 h-5 text-blue-600" />
                    Bảng điểm ({displayCourses.length} môn)
                  </h3>
                  <div className="relative">
                    <select
                      value={selectedHocKiId}
                      onChange={e => setSelectedHocKiId(e.target.value)}
                      className="pl-4 pr-10 py-2 border border-[#e5e7eb] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#0a2540] bg-white appearance-none cursor-pointer font-medium text-sm"
                    >
                      <option value="all">Tất cả học kỳ</option>
                      {allData?.tienDoTheoHocKy.map(s => (
                        <option key={s.hocKiId} value={s.hocKiId}>
                          {s.tenHocKi || s.maHocKi}
                        </option>
                      ))}
                    </select>
                    <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#6a7282] pointer-events-none" />
                  </div>
                </div>

                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead className="bg-[#f9fafb] border-b border-[#e5e7eb]">
                      <tr>
                        <th className="px-6 py-4 text-left text-sm font-semibold text-[#0a2540]">Mã môn</th>
                        <th className="px-6 py-4 text-left text-sm font-semibold text-[#0a2540]">Tên môn học</th>
                        <th className="px-6 py-4 text-center text-sm font-semibold text-[#0a2540]">Tín chỉ</th>
                        <th className="px-6 py-4 text-center text-sm font-semibold text-[#0a2540]">Học kỳ</th>
                        <th className="px-6 py-4 text-center text-sm font-semibold text-[#0a2540]">Điểm (hệ 10)</th>
                        <th className="px-6 py-4 text-center text-sm font-semibold text-[#0a2540]">Điểm (hệ 4)</th>
                        <th className="px-6 py-4 text-center text-sm font-semibold text-[#0a2540]">Xếp loại</th>
                        <th className="px-6 py-4 text-center text-sm font-semibold text-[#0a2540]">Kết quả</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-[#e5e7eb]">
                      {displayCourses.length > 0 ? (
                        displayCourses.map(course => (
                          <tr
                            key={`${course.monHocId}-${course.hocKiId}`}
                            className="hover:bg-[#f9fafb] transition-colors"
                          >
                            <td className="px-6 py-4">
                              <span className="font-mono text-sm font-semibold text-[#0a2540]">{course.maMonHoc}</span>
                            </td>
                            <td className="px-6 py-4">
                              <p className="font-medium text-[#0a2540]">{course.tenMonHoc}</p>
                            </td>
                            <td className="px-6 py-4 text-center">
                              <span className="inline-flex items-center justify-center w-8 h-8 bg-purple-100 text-purple-700 rounded-full font-semibold text-sm">
                                {course.soTinChi ?? '—'}
                              </span>
                            </td>
                            <td className="px-6 py-4 text-center">
                              {course.maHocKi ? (
                                <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-blue-50 text-blue-700 rounded-full text-xs font-medium">
                                  <Calendar className="w-3 h-3" />
                                  {course.maHocKi}
                                </span>
                              ) : (
                                <span className="text-[#9ca3af] text-sm">—</span>
                              )}
                            </td>
                            <td className="px-6 py-4 text-center">
                              <span className="text-lg font-bold text-[#0a2540]">
                                {course.diemTongKet != null ? course.diemTongKet.toFixed(1) : '—'}
                              </span>
                            </td>
                            <td className="px-6 py-4 text-center">
                              <span className="text-sm font-semibold text-[#6a7282]">
                                {course.diemHe4 != null ? course.diemHe4.toFixed(1) : '—'}
                              </span>
                            </td>
                            <td className="px-6 py-4 text-center">
                              <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-semibold ${getGradeColor(course.diemTongKet)}`}>
                                {getLetterGrade(course.diemTongKet)}
                              </span>
                            </td>
                            <td className="px-6 py-4 text-center">
                              {!course.daHoanThanh ? (
                                <span className="inline-flex items-center gap-1 text-xs text-gray-500">
                                  <Clock className="w-3.5 h-3.5" />Đang học
                                </span>
                              ) : course.daDat ? (
                                <span className="inline-flex items-center gap-1 text-xs text-green-600 font-medium">
                                  <CheckCircle className="w-3.5 h-3.5" />Đạt
                                </span>
                              ) : (
                                <span className="inline-flex items-center gap-1 text-xs text-red-600 font-medium">
                                  <XCircle className="w-3.5 h-3.5" />Không đạt
                                </span>
                              )}
                            </td>
                          </tr>
                        ))
                      ) : (
                        <tr>
                          <td colSpan={8} className="px-6 py-12 text-center">
                            <Clock className="w-12 h-12 text-[#9ca3af] mx-auto mb-3" />
                            <p className="text-[#6a7282]">Chưa có dữ liệu điểm</p>
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>

                {displayCourses.length > 0 && (
                  <div className="p-6 bg-[#f9fafb] border-t border-[#e5e7eb] flex items-center justify-between">
                    <div className="flex items-center gap-6">
                      <div>
                        <p className="text-sm text-[#6a7282]">Tổng tín chỉ</p>
                        <p className="text-xl font-bold text-[#0a2540]">
                          {displayCourses.reduce((sum, c) => sum + (c.soTinChi ?? 0), 0)}
                        </p>
                      </div>
                      {selectedHocKy && (
                        <>
                          <div className="h-8 w-px bg-[#e5e7eb]" />
                          <div>
                            <p className="text-sm text-[#6a7282]">Hoàn thành</p>
                            <p className="text-xl font-bold text-[#0a2540]">
                              {selectedHocKy.tinChiHoanThanh}/{selectedHocKy.tongTinChi} tín chỉ
                            </p>
                          </div>
                        </>
                      )}
                    </div>
                    <div className="text-right">
                      <p className="text-sm text-[#6a7282]">GPA {selectedHocKy ? 'học kỳ' : 'tích lũy'}</p>
                      <p className="text-3xl font-bold text-blue-600">{currentGpa.toFixed(2)}</p>
                    </div>
                  </div>
                )}
              </div>
            </>
          )}
        </main>
      </div>

      <AIAssistantButton />
    </div>
  );
}