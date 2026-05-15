import { useEffect, useState, useCallback } from 'react';
import { useNavigate } from 'react-router';
import { StudentSidebar } from '@/components/layouts/StudentSidebar';
import { StudentHeader } from '@/components/layouts/StudentHeader';
import { AIAssistantButton } from '@/components/chatbot/AIAssistantButton';
import { useAuth } from '@/hooks';
import apiClient from '@/api/common';
import svgPaths from '@/imports/svg-szai56hjzo';
import {
  Calendar,
  TrendingUp,
  Bell,
  DollarSign,
  Clock,
  BookOpen,
  CheckCircle2,
  Brain,
  Globe
} from 'lucide-react';

interface User {
  username: string;
  name?: string;
  role: string;
}

interface LichItem {
  tenMonHoc: string;
  thoiGianBatDau: string;
  thoiGianKetThuc: string;
  maPhong: string;
}

interface DashboardData {
  thongTinCaNhan: { hoTen: string; maHocVien: string };
  lichHomNay: { lich: LichItem[] };
  tienDoHocTap: { phanTramHoanThanh: number; gpaTichLuy: number; soMonDaHoc: number; soMonChuaHoc: number };
  thongBao: { danhSachThongBao: { id: string; tieuDe: string; createdAt: string; daNhan: boolean }[] };
  hocPhi: { tongCanThanhToan: number; tongDaThanhToan: number; tongQuaHan: number };
}

const fmt = (iso: string) => new Date(iso).toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' });
const fmtCurrency = (n: number) => n.toLocaleString('vi-VN') + ' VNĐ';
const timeAgo = (iso: string) => {
  const diff = Date.now() - new Date(iso).getTime();
  const h = Math.floor(diff / 3600000);
  if (h < 24) return `${h} giờ trước`;
  return `${Math.floor(h / 24)} ngày trước`;
};

export default function StudentDashboard() {
  const navigate = useNavigate();
  const { user: authUser, isAuthenticated } = useAuth();
  const [user, setUser] = useState<User | null>(null);
  const [dashboard, setDashboard] = useState<DashboardData | null>(null);

  const fetchDashboard = useCallback(async () => {
    try {
      const res = await apiClient.get<DashboardData>('/student/dashboard');
      setDashboard(res.data);
    } catch {
      // giữ null, UI sẽ hiển thị giá trị mặc định
    }
  }, []);

  useEffect(() => {
    if (!isAuthenticated || !authUser) { navigate('/'); return; }
    if (authUser.role !== 'student') { navigate('/'); return; }
    setUser(authUser as User);
    fetchDashboard();
  }, [isAuthenticated, authUser, navigate, fetchDashboard]);

  if (!user) return null;

  const userName = user.name || user.username;
  const lich = dashboard?.lichHomNay?.lich ?? [];
  const tienDo = dashboard?.tienDoHocTap;
  const thongBao = dashboard?.thongBao?.danhSachThongBao ?? [];
  const hocPhi = dashboard?.hocPhi;

  return (
    <div className="flex h-screen bg-[#f1f5f9]">
      {/* Sidebar */}
      <StudentSidebar />

      {/* Main Content */}
      <div className="flex-1 ml-64 flex flex-col">
        {/* Header */}
        <StudentHeader userName={userName} />

        {/* Content */}
        <main className="flex-1 overflow-y-auto p-8">
          {/* Banner */}
          <div className="relative min-h-[360px] rounded-[14px] overflow-hidden mb-8" style={{ 
            backgroundImage: "linear-gradient(90deg, rgb(10, 37, 64) 0%, rgb(11, 40, 68) 7.1429%, rgb(13, 42, 72) 14.286%, rgb(14, 45, 76) 21.429%, rgb(15, 47, 80) 28.571%, rgb(17, 50, 84) 35.714%, rgb(18, 52, 88) 42.857%, rgb(20, 55, 92) 50%, rgb(21, 58, 96) 57.143%, rgb(23, 60, 101) 64.286%, rgb(24, 63, 105) 71.429%, rgb(26, 66, 109) 78.571%, rgb(27, 68, 113) 85.714%, rgb(29, 71, 118) 92.857%, rgb(30, 74, 122) 100%)" 
          }}>
            {/* Decorative Elements */}
            <div className="absolute bg-[rgba(255,255,255,0.1)] right-[-50px] rounded-full w-64 h-64 top-[-128px]" />
            <div className="absolute bg-[rgba(255,255,255,0.1)] right-[100px] rounded-full w-40 h-40 top-[178px]" />
            
            {/* Content Container */}
            <div className="relative px-8 py-8 h-full flex items-start justify-between">
              {/* Left Content */}
              <div className="max-w-3xl pb-4">
                {/* Icons Row */}
                <div className="flex gap-3 mb-4">
                  <div className="bg-[rgba(255,255,255,0.2)] p-3 rounded-[10px]">
                    <BookOpen className="w-7 h-7 text-white" strokeWidth={2.33} />
                  </div>
                  <div className="bg-[rgba(255,255,255,0.2)] p-3 rounded-[10px]">
                    <Brain className="w-7 h-7 text-white" strokeWidth={2.33} />
                  </div>
                  <div className="bg-[rgba(255,255,255,0.2)] p-3 rounded-[10px]">
                    <Globe className="w-7 h-7 text-white" strokeWidth={2.33} />
                  </div>
                </div>

                {/* Heading */}
                <h1 className="text-white text-[30px] font-bold leading-[36px] mb-4">
                  XÂY DỰNG LEARNINGHUB – NỀN TẢNG QUẢN LÝ ĐÀO TẠO THÔNG MINH TÍCH HỢP CHATBOT AI
                </h1>

                {/* Description */}
                <p className="text-[#dbeafe] text-[18px] leading-[29.25px] mb-6">
                  LearningHub là hệ thống quản lý đào tạo hiện đại, tích hợp công nghệ AI để hỗ trợ học viên theo dõi tiến độ học tập, quản lý lịch học, nộp bài tập và tương tác với giảng viên một cách hiệu quả. Chatbot AI thông minh sẵn sàng hỗ trợ bạn 24/7 trong suốt hành trình học tập.
                </p>

                {/* Tags */}
                <div className="flex flex-wrap gap-3">
                  <div className="bg-[rgba(255,255,255,0.2)] border border-[rgba(255,255,255,0.3)] rounded-[8px] px-3 py-1 flex items-center gap-2">
                    <CheckCircle2 className="w-3 h-3 text-white" />
                    <span className="text-white text-[12px] font-medium leading-[16px]">Quản lý học tập thông minh</span>
                  </div>
                  <div className="bg-[rgba(255,255,255,0.2)] border border-[rgba(255,255,255,0.3)] rounded-[8px] px-3 py-1 flex items-center gap-2">
                    <CheckCircle2 className="w-3 h-3 text-white" />
                    <span className="text-white text-[12px] font-medium leading-[16px]">Chatbot AI hỗ trợ 24/7</span>
                  </div>
                  <div className="bg-[rgba(255,255,255,0.2)] border border-[rgba(255,255,255,0.3)] rounded-[8px] px-3 py-1 flex items-center gap-2">
                    <CheckCircle2 className="w-3 h-3 text-white" />
                    <span className="text-white text-[12px] font-medium leading-[16px]">Theo dõi tiến độ realtime</span>
                  </div>
                </div>
              </div>

              {/* Right Brain Icon */}
              <div className="bg-[rgba(255,255,255,0.1)] rounded-[16px] w-48 h-48 flex items-center justify-center">
                <Brain className="w-24 h-24 text-white opacity-80" strokeWidth={1.5} />
              </div>
            </div>
          </div>

          {/* Dashboard Cards Grid */}
          <div className="grid grid-cols-2 gap-6">
            {/* Card 1: Lịch học hôm nay */}
            <div className="bg-white rounded-[14px] border border-[#e5e7eb] shadow-sm p-6">
              <div className="flex items-center gap-3 mb-6">
                <div className="bg-[rgba(10,37,64,0.1)] rounded-[10px] w-8 h-8 flex items-center justify-center">
                  <Calendar className="w-5 h-5 text-[#0a2540]" />
                </div>
                <h3 className="text-[#0a0a0a] text-[16px] font-medium">Lịch học hôm nay</h3>
              </div>

              <div className="space-y-4">
                {lich.length === 0 ? (
                  <p className="text-[#6a7282] text-[14px]">Không có lịch học hôm nay</p>
                ) : lich.map((item, i) => (
                  <div key={i} className="bg-[#f5f7fa] rounded-[10px] p-3 flex gap-3">
                    <div className="bg-[rgba(10,37,64,0.1)] rounded-[10px] w-10 h-10 flex items-center justify-center shrink-0">
                      <Clock className="w-5 h-5 text-[#0a2540]" />
                    </div>
                    <div>
                      <p className="text-[#101828] text-[16px] font-medium mb-1">{item.tenMonHoc}</p>
                      <p className="text-[#6a7282] text-[14px]">{fmt(item.thoiGianBatDau)} - {fmt(item.thoiGianKetThuc)}</p>
                      <p className="text-[#6a7282] text-[14px]">Phòng {item.maPhong}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Card 2: Tiến độ học tập */}
            <div className="bg-white rounded-[14px] border border-[#e5e7eb] shadow-sm p-6">
              <div className="flex items-center gap-3 mb-6">
                <div className="bg-[rgba(10,37,64,0.1)] rounded-[10px] w-8 h-8 flex items-center justify-center">
                  <TrendingUp className="w-5 h-5 text-[#0a2540]" />
                </div>
                <h3 className="text-[#0a0a0a] text-[16px] font-medium">Tiến độ học tập</h3>
              </div>

              <div className="space-y-5">
                <div>
                  <div className="flex justify-between mb-2">
                    <span className="text-[#4a5565] text-[14px]">Hoàn thành chương trình</span>
                    <span className="text-[#101828] text-[14px] font-medium">{tienDo?.phanTramHoanThanh?.toFixed(0) ?? 0}%</span>
                  </div>
                  <div className="h-2 bg-[#f3f4f6] rounded-full overflow-hidden">
                    <div className="h-full bg-[#0a2540] rounded-full" style={{ width: `${tienDo?.phanTramHoanThanh ?? 0}%` }} />
                  </div>
                </div>

                <div>
                  <div className="flex justify-between mb-2">
                    <span className="text-[#4a5565] text-[14px]">Môn đã hoàn thành</span>
                    <span className="text-[#101828] text-[14px] font-medium">
                      {tienDo?.soMonDaHoc ?? 0}/{(tienDo?.soMonDaHoc ?? 0) + (tienDo?.soMonChuaHoc ?? 0)}
                    </span>
                  </div>
                  <div className="h-2 bg-[#f3f4f6] rounded-full overflow-hidden">
                    <div className="h-full bg-[#0a2540] rounded-full" style={{
                      width: tienDo && (tienDo.soMonDaHoc + tienDo.soMonChuaHoc) > 0
                        ? `${(tienDo.soMonDaHoc / (tienDo.soMonDaHoc + tienDo.soMonChuaHoc)) * 100}%`
                        : '0%'
                    }} />
                  </div>
                </div>

                <div className="pt-4 border-t border-[#e5e7eb]">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <BookOpen className="w-4 h-4 text-[#6a7282]" />
                      <span className="text-[#4a5565] text-[14px]">GPA tích lũy</span>
                    </div>
                    <span className="text-[#101828] text-[24px] font-bold">{tienDo?.gpaTichLuy?.toFixed(2) ?? '—'}</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Card 3: Thông báo gần đây */}
            <div className="bg-white rounded-[14px] border border-[#e5e7eb] shadow-sm p-6">
              <div className="flex items-center gap-3 mb-6">
                <div className="bg-[rgba(10,37,64,0.1)] rounded-[10px] w-8 h-8 flex items-center justify-center">
                  <Bell className="w-5 h-5 text-[#0a2540]" />
                </div>
                <h3 className="text-[#0a0a0a] text-[16px] font-medium">Thông báo gần đây</h3>
              </div>

              <div className="space-y-4">
                {thongBao.length === 0 ? (
                  <p className="text-[#6a7282] text-[14px]">Không có thông báo mới</p>
                ) : thongBao.slice(0, 3).map((tb, i) => (
                  <div key={tb.id} className={i < thongBao.slice(0, 3).length - 1 ? 'pb-4 border-b border-[#e5e7eb]' : ''}>
                    <div className="flex justify-between items-start mb-1">
                      <p className={`text-[14px] font-medium ${tb.daNhan ? 'text-[#6a7282]' : 'text-[#101828]'}`}>{tb.tieuDe}</p>
                      <span className="text-[#6a7282] text-[12px] shrink-0 ml-2">{timeAgo(tb.createdAt)}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Card 4: Học phí */}
            <div className="bg-white rounded-[14px] border border-[#e5e7eb] shadow-sm p-6">
              <div className="flex items-center gap-3 mb-6">
                <div className="bg-[rgba(10,37,64,0.1)] rounded-[10px] w-8 h-8 flex items-center justify-center">
                  <DollarSign className="w-5 h-5 text-[#0a2540]" />
                </div>
                <h3 className="text-[#0a0a0a] text-[16px] font-medium">Học phí</h3>
              </div>

              <div className="space-y-4">
                <div className={`rounded-[10px] p-4 ${hocPhi && hocPhi.tongQuaHan > 0 ? 'bg-[#fef2f2]' : 'bg-[#f0fdf4]'}`}>
                  <p className="text-[#6a7282] text-[14px] mb-2">Cần thanh toán</p>
                  <div className="flex items-end justify-between">
                    <p className="text-[#101828] text-[24px] font-bold">{fmtCurrency(hocPhi?.tongCanThanhToan ?? 0)}</p>
                    {hocPhi && hocPhi.tongQuaHan > 0
                      ? <span className="text-[#ef4444] text-[14px] font-medium pb-1">Quá hạn</span>
                      : <span className="text-[#10b981] text-[14px] font-medium pb-1">Bình thường</span>}
                  </div>
                </div>

                <div className="space-y-3 pt-2">
                  <div className="flex justify-between">
                    <span className="text-[#6a7282] text-[14px]">Đã thanh toán</span>
                    <span className="text-[#10b981] text-[14px] font-medium">{fmtCurrency(hocPhi?.tongDaThanhToan ?? 0)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-[#6a7282] text-[14px]">Quá hạn</span>
                    <span className={`text-[14px] font-medium ${hocPhi && hocPhi.tongQuaHan > 0 ? 'text-[#ef4444]' : 'text-[#101828]'}`}>
                      {fmtCurrency(hocPhi?.tongQuaHan ?? 0)}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </main>
      </div>

      {/* AI Assistant Button */}
      <AIAssistantButton />
    </div>
  );
}