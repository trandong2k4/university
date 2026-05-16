import { AdminSidebar } from '@/components/layouts/AdminSidebar';
import { AdminHeader } from '@/components/layouts/AdminHeader';
import { useEffect } from 'react';
import { useNavigate } from 'react-router';
import { useAuth } from '@/hooks';
import { 
  Users, 
  BookOpen, 
  DollarSign, 
  TrendingUp,
  UserPlus,
  GraduationCap,
  CreditCard,
  Activity
} from 'lucide-react';
import { AreaChart, Area, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { useMemo } from 'react';
import { AdminAIAssistantButton } from '@/components/chatbot/AIAssistantButton';
import { adminRepository } from '@/api';
import { useAsync } from '@/hooks';

export default function AdminDashboard() {
  const navigate = useNavigate();
  const { user, isAuthenticated } = useAuth();
  const { data: dashboard, loading } = useAsync(() => adminRepository.getDashboard(), undefined);

  useEffect(() => {
    if (!isAuthenticated || !user || user.role !== 'admin') {
      navigate('/');
    }
  }, [isAuthenticated, user, navigate]);

  // Revenue chart data from backend
  const revenueData = useMemo(() => {
    if (!dashboard?.doanhThuTheoThang?.length) {
      return [
        { id: 'rev-t1', thang: 'T1', doanhThu: 0, soLuong: 0 },
      ];
    }
    const thangNames: Record<number, string> = { 1: 'T1', 2: 'T2', 3: 'T3', 4: 'T4', 5: 'T5', 6: 'T6', 7: 'T7', 8: 'T8', 9: 'T9', 10: 'T10', 11: 'T11', 12: 'T12' };
    return dashboard.doanhThuTheoThang.map((item, i) => ({
      id: `rev-${i}`,
      thang: thangNames[item.thang] || `T${item.thang}`,
      doanhThu: item.tienDaThu || 0,
      soLuong: item.soLuong || 0,
    }));
  }, [dashboard]);

  // User growth chart data from backend
  const userGrowthData = useMemo(() => {
    if (!dashboard?.hocVienTheoNam?.length) {
      return [
        { id: 'user-1', nam: '2024', hocVien: 0 },
      ];
    }
    return dashboard.hocVienTheoNam.map((item, i) => ({
      id: `user-${i}`,
      nam: String(item.nam),
      hocVien: item.soHocVien || 0,
    }));
  }, [dashboard]);

  // Stats data
  const stats = [
    {
      id: 1,
      title: 'Tổng người dùng',
      value: dashboard ? dashboard.tongNguoiDung.toLocaleString('vi-VN') : '...',
      change: null,
      changeType: 'increase' as const,
      icon: <Users className="w-6 h-6" />,
      color: 'blue',
      bgColor: 'bg-blue-100',
      textColor: 'text-blue-600',
      details: `${dashboard ? dashboard.tongHocVien.toLocaleString('vi-VN') : '...'} học viên`
    },
    {
      id: 2,
      title: 'Lớp học phần',
      value: dashboard ? dashboard.tongLopHocPhan.toLocaleString('vi-VN') : '...',
      change: null,
      changeType: 'increase' as const,
      icon: <BookOpen className="w-6 h-6" />,
      color: 'purple',
      bgColor: 'bg-purple-100',
      textColor: 'text-purple-600',
      details: `${dashboard ? dashboard.lopDangHoatDong.toLocaleString('vi-VN') : '...'} đang hoạt động`
    },
    {
      id: 3,
      title: 'Tổng học phí',
      value: dashboard ? `${Math.round(dashboard.tongHocPhi / 1000000)}M VNĐ` : '...',
      change: null,
      changeType: 'increase' as const,
      icon: <DollarSign className="w-6 h-6" />,
      color: 'green',
      bgColor: 'bg-green-100',
      textColor: 'text-green-600',
      details: `Đã thu: ${dashboard ? Math.round(dashboard.hocPhiDaThu / 1000000) : '...'}M`
    },
    {
      id: 4,
      title: 'Giảng viên',
      value: dashboard ? dashboard.tongGiangVien.toLocaleString('vi-VN') : '...',
      change: null,
      changeType: 'increase' as const,
      icon: <GraduationCap className="w-6 h-6" />,
      color: 'orange',
      bgColor: 'bg-orange-100',
      textColor: 'text-orange-600',
      details: 'Đang giảng dạy'
    },
  ];

  // Quick stats
  const quickStats = [
    { label: 'Liên hệ chưa xử lý', value: dashboard ? dashboard.lienHeChuaXuLy.toString() : '...', icon: <UserPlus className="w-5 h-5 text-blue-600" /> },
    { label: 'Lớp đang hoạt động', value: dashboard ? dashboard.lopDangHoatDong.toString() : '...', icon: <Activity className="w-5 h-5 text-green-600" /> },
    { label: 'Học phí còn nợ', value: dashboard ? `${Math.round((dashboard.hocPhiConNo || 0) / 1000000)}M` : '...', icon: <CreditCard className="w-5 h-5 text-purple-600" /> },
  ];

  // Format time ago
  const timeAgo = (dateStr: string): string => {
    if (!dateStr) return '';
    const date = new Date(dateStr);
    const now = new Date();
    const diff = Math.floor((now.getTime() - date.getTime()) / 1000);
    if (diff < 60) return `${diff} giây trước`;
    if (diff < 3600) return `${Math.floor(diff / 60)} phút trước`;
    if (diff < 86400) return `${Math.floor(diff / 3600)} giờ trước`;
    return `${Math.floor(diff / 86400)} ngày trước`;
  };

  const activityIcon = (loai: string) => {
    switch (loai) {
      case 'LIEN_HE': return 'bg-blue-500';
      case 'THONG_BAO': return 'bg-green-500';
      case 'USER': return 'bg-purple-500';
      case 'LOP_HP': return 'bg-orange-500';
      default: return 'bg-gray-500';
    }
  };

  const formatCurrency = (value: number) => {
    return (value / 1000000).toFixed(0) + 'M';
  };

  return (
    <div className="flex h-screen bg-[#f1f5f9]">
      <AdminSidebar activeMenu="dashboard" />
      
      <div className="flex-1 ml-64 flex flex-col">
        <AdminHeader title="Dashboard" />
        
        <div className="flex-1 overflow-auto p-6">
          <div className="max-w-7xl mx-auto space-y-6">
            {/* Welcome Banner */}
            <div className="bg-gradient-to-r from-[#1e3a5f] via-[#2d4a6b] to-[#0a2540] rounded-2xl shadow-lg p-6 text-white relative overflow-hidden">
              <div className="absolute bg-[rgba(255,255,255,0.1)] left-[1010px] rounded-full w-64 h-64 top-[-128px]" />
              <div className="absolute bg-[rgba(255,255,255,0.1)] left-[956px] rounded-full w-40 h-40 top-[178px]" />
              <div className="flex items-center justify-between relative z-10">
                <div>
                  <h2 className="text-2xl font-bold mb-2">Chào mừng trở lại, Admin! 👋</h2>
                  <p className="text-blue-100">Tổng quan hệ thống LearningHub</p>
                </div>
                <div className="text-right">
                  <p className="text-sm text-blue-100">Hôm nay</p>
                  <p className="text-xl font-bold">{new Date().toLocaleDateString('vi-VN', { weekday: 'long', day: '2-digit', month: '2-digit', year: 'numeric' })}</p>
                </div>
              </div>
            </div>

            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {stats.map((stat) => (
                <div 
                  key={stat.id}
                  className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow"
                >
                  <div className="flex items-center justify-between mb-4">
                    <div className={`w-12 h-12 ${stat.bgColor} rounded-lg flex items-center justify-center`}>
                      <div className={stat.textColor}>
                        {stat.icon}
                      </div>
                    </div>
                    <span className={`text-sm font-medium px-2 py-1 rounded-full ${
                      stat.changeType === 'increase' 
                        ? 'text-green-600 bg-green-50' 
                        : 'text-red-600 bg-red-50'
                    }`}>
                      <TrendingUp className="w-3 h-3 inline mr-1" />
                      {stat.change}
                    </span>
                  </div>
                  <h3 className="text-gray-600 text-sm font-medium mb-1">{stat.title}</h3>
                  <p className="text-3xl font-bold text-gray-900 mb-2">{stat.value}</p>
                  <p className="text-xs text-gray-500">{stat.details}</p>
                </div>
              ))}
            </div>

            {/* Quick Stats */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {quickStats.map((stat, index) => (
                <div 
                  key={index}
                  className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 flex items-center gap-4"
                >
                  <div className="bg-gray-50 p-3 rounded-lg">
                    {stat.icon}
                  </div>
                  <div>
                    <p className="text-2xl font-bold text-gray-900">{stat.value}</p>
                    <p className="text-sm text-gray-600">{stat.label}</p>
                  </div>
                </div>
              ))}
            </div>

            {/* Charts Section */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Revenue Chart */}
              <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-xl font-bold text-gray-900 flex items-center gap-2">
                    <DollarSign className="w-5 h-5 text-green-600" />
                    Doanh thu theo tháng
                  </h2>
                  <select className="px-3 py-1 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500">
                    <option>Năm 2026</option>
                    <option>Năm 2025</option>
                  </select>
                </div>

                <ResponsiveContainer width="100%" height={300} key="revenue-chart-container">
                  <AreaChart data={revenueData} id="admin-revenue-chart" margin={{ top: 5, right: 5, left: 5, bottom: 5 }}>
                    <defs>
                      <linearGradient id="colorRevenueAdmin" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#10b981" stopOpacity={0.3}/>
                        <stop offset="95%" stopColor="#10b981" stopOpacity={0}/>
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                    <XAxis
                      dataKey="thang"
                      tick={{ fill: '#6b7280', fontSize: 12 }}
                    />
                    <YAxis
                      tick={{ fill: '#6b7280', fontSize: 12 }}
                      tickFormatter={formatCurrency}
                    />
                    <Tooltip
                      formatter={(value: number) => [formatCurrency(value) + ' VNĐ', 'Doanh thu']}
                      contentStyle={{
                        backgroundColor: '#fff',
                        border: '1px solid #e5e7eb',
                        borderRadius: '8px',
                        boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)'
                      }}
                    />
                    <Area
                      type="monotone"
                      dataKey="doanhThu"
                      stroke="#10b981"
                      strokeWidth={2}
                      fillOpacity={1}
                      fill="url(#colorRevenueAdmin)"
                      name="Doanh thu"
                    />
                  </AreaChart>
                </ResponsiveContainer>

                <div className="mt-4 p-4 bg-green-50 rounded-lg">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-gray-600">Tổng học phí</p>
                      <p className="text-2xl font-bold text-green-600">{dashboard ? Math.round(dashboard.tongHocPhi / 1000000) : '...'}M VNĐ</p>
                    </div>
                    <div className="text-right">
                      <p className="text-sm text-gray-600">Đã thu</p>
                      <p className="text-xl font-bold text-gray-900">{dashboard ? Math.round(dashboard.hocPhiDaThu / 1000000) : '...'}M VNĐ</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* User Growth Chart */}
              <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-xl font-bold text-gray-900 flex items-center gap-2">
                    <Users className="w-5 h-5 text-blue-600" />
                    Tăng trưởng User
                  </h2>
                  <select className="px-3 py-1 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500">
                    <option>6 tháng gần đây</option>
                    <option>12 tháng gần đây</option>
                  </select>
                </div>

                <ResponsiveContainer width="100%" height={300} key="user-growth-chart-container">
                  <BarChart data={userGrowthData} id="admin-user-growth-chart" margin={{ top: 5, right: 5, left: 5, bottom: 5 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                    <XAxis
                      dataKey="nam"
                      tick={{ fill: '#6b7280', fontSize: 12 }}
                    />
                    <YAxis tick={{ fill: '#6b7280', fontSize: 12 }} />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: '#fff',
                        border: '1px solid #e5e7eb',
                        borderRadius: '8px',
                        boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)'
                      }}
                    />
                    <Legend />
                    <Bar dataKey="hocVien" fill="#3b82f6" radius={[8, 8, 0, 0]} name="Học viên" />
                  </BarChart>
                </ResponsiveContainer>

                <div className="mt-4 grid grid-cols-2 gap-3">
                  <div className="p-3 bg-blue-50 rounded-lg">
                    <p className="text-xs text-gray-600 mb-1">Tổng học viên</p>
                    <p className="text-xl font-bold text-blue-600">{dashboard ? dashboard.tongHocVien.toLocaleString('vi-VN') : '...'}</p>
                  </div>
                  <div className="p-3 bg-purple-50 rounded-lg">
                    <p className="text-xs text-gray-600 mb-1">Tổng giảng viên</p>
                    <p className="text-xl font-bold text-purple-600">{dashboard ? dashboard.tongGiangVien.toLocaleString('vi-VN') : '...'}</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Recent Activities */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <h2 className="text-xl font-bold text-gray-900 mb-6">Hoạt động gần đây</h2>
              
              <div className="space-y-4">
                {dashboard?.hoatDongGanDay?.map((activity) => (
                  <div
                    key={activity.id}
                    className="flex items-start gap-4 p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
                  >
                    <div className={`w-2 h-2 mt-2 rounded-full ${activityIcon(activity.loai)}`} />
                    <div className="flex-1">
                      <p className="text-gray-900 font-medium">{activity.tieuDe}</p>
                      <p className="text-xs text-gray-500 mt-1">{timeAgo(activity.thoiGian)}</p>
                    </div>
                  </div>
                ))}
                {(!dashboard?.hoatDongGanDay || dashboard.hoatDongGanDay.length === 0) && (
                  <p className="text-center text-gray-400 py-4">Chưa có hoạt động nào</p>
                )}
              </div>

              <button className="w-full mt-4 py-2 text-blue-600 font-medium hover:bg-blue-50 rounded-lg transition-colors">
                Xem tất cả hoạt động
              </button>
            </div>
          </div>
        </div>
      </div>

      <AdminAIAssistantButton />
    </div>
  );
}

