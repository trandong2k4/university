import { AccountantSidebar } from '@/components/layouts/AccountantSidebar';
import { AccountantHeader } from '@/components/layouts/AccountantHeader';
import { useEffect, useState, useMemo } from 'react';
import { useNavigate } from 'react-router';
import { useAuth } from '@/hooks';
import {
  DollarSign,
  Clock,
  AlertTriangle,
  TrendingUp,
  CheckCircle,
  ArrowUpRight
} from 'lucide-react';
import { AreaChart, Area, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import AiAssistantButton from '@/imports/AiAssistantButton-4-13343';
import { accountingApi, type BaoCaoThongKeOverviewResponse, type AccountingHocPhiResponse } from '@/api/accounting/accounting.api';
import { useAsync } from '@/hooks';
import { Toast } from '@/components/notification/Toast';

interface User {
  fullName: string;
  role: string;
}

export default function AccountantDashboard() {
  const navigate = useNavigate();
  const { user: authUser, isAuthenticated } = useAuth();
  const [user, setUser] = useState<User | null>(null);
  const [toast, setToast] = useState<{ type: 'success' | 'error' | 'warning'; message: string } | null>(null);

  const { data: overview } = useAsync<BaoCaoThongKeOverviewResponse | null>(
    () => accountingApi.getOverview(),
    null
  );

  const { data: dueList = [] } = useAsync<AccountingHocPhiResponse[]>(
    () => accountingApi.getDueHocPhi(),
    []
  );

  useEffect(() => {
    if (!isAuthenticated || !authUser) {
      navigate('/');
      return;
    }
    if (authUser.role !== 'accountant') {
      navigate('/');
      return;
    }
    setUser(authUser as User);
  }, [isAuthenticated, authUser, navigate]);

  const pendingCount = (dueList ?? []).filter(r => r.trangThai === 'CHUA_THANH_TOAN').length;
  const overdueCount = (dueList ?? []).filter(r => r.trangThai === 'QUA_HAN').length;
  const paidCount = overview?.soLuongThanhToan ?? 0;
  const totalRevenue = overview?.tongDoanhThu ?? 0;

  const revenueData = useMemo(() => {
    if (!overview?.doanhThuTheoThang?.length) return [];
    return overview.doanhThuTheoThang.map(m => ({
      month: m.namThang.replace(/^(\d{4})-(\d{2})$/, 'T$2'),
      revenue: m.doanhThu,
    }));
  }, [overview]);

  const paymentStatusData = useMemo(() => [
    { id: 'status-paid', name: 'Đã thanh toán', value: paidCount, color: '#10b981' },
    { id: 'status-pending', name: 'Chờ thanh toán', value: pendingCount, color: '#f59e0b' },
    { id: 'status-overdue', name: 'Quá hạn', value: overdueCount, color: '#ef4444' },
  ], [paidCount, pendingCount, overdueCount]);

  const stats = [
    {
      id: 1,
      title: 'Tổng doanh thu',
      value: totalRevenue >= 1_000_000
        ? `${(totalRevenue / 1_000_000).toFixed(1)}M VNĐ`
        : `${totalRevenue.toLocaleString('vi-VN')} VNĐ`,
      icon: <DollarSign className="w-6 h-6" />,
      bgColor: 'bg-emerald-100',
      textColor: 'text-emerald-600',
      details: 'Tổng tiền đã thu',
      route: '/accountant/receivables',
    },
    {
      id: 2,
      title: 'Đã thanh toán',
      value: paidCount.toString(),
      icon: <CheckCircle className="w-6 h-6" />,
      bgColor: 'bg-blue-100',
      textColor: 'text-blue-600',
      details: 'Giao dịch hoàn tất',
      route: '/accountant/tuition',
    },
    {
      id: 3,
      title: 'Chờ thanh toán',
      value: pendingCount.toString(),
      icon: <Clock className="w-6 h-6" />,
      bgColor: 'bg-amber-100',
      textColor: 'text-amber-600',
      details: 'Cần xử lý',
      route: '/accountant/payment',
    },
    {
      id: 4,
      title: 'Quá hạn',
      value: overdueCount.toString(),
      icon: <AlertTriangle className="w-6 h-6" />,
      bgColor: 'bg-red-100',
      textColor: 'text-red-600',
      details: 'Cần ưu tiên xử lý',
      route: '/accountant/payment',
    },
  ];

  const recentPayments = overview?.danhSachThanhToanMoiNhat ?? [];

  const formatCurrency = (value: number) => `${(value / 1_000_000).toFixed(0)}M`;

  const formatDate = (dt: string | null | undefined) => {
    if (!dt) return '—';
    try {
      return new Date(dt).toLocaleDateString('vi-VN');
    } catch {
      return dt;
    }
  };

  if (!user) return null;

  return (
    <div className="flex h-screen bg-stone-50">
      <AccountantSidebar />

      <div className="flex-1 ml-64 flex flex-col">
        <AccountantHeader title="Dashboard" />

        <div className="flex-1 overflow-auto p-6">
          <div className="max-w-7xl mx-auto space-y-6">
            {/* Welcome Banner */}
            <div className="bg-gradient-to-br from-slate-900 via-slate-800 to-emerald-900 rounded-2xl shadow-xl p-8 text-white relative overflow-hidden">
              <div className="absolute bg-emerald-600/20 right-[-50px] rounded-full w-64 h-64 top-[-128px] blur-3xl" />
              <div className="absolute bg-emerald-500/10 right-[100px] rounded-full w-40 h-40 top-[150px] blur-2xl" />
              <div className="flex items-center justify-between relative z-10">
                <div>
                  <h2 className="text-3xl font-bold mb-2" style={{ fontFamily: "'Sora', sans-serif" }}>
                    Chào mừng, {user.fullName || 'Kế toán'}! 👋
                  </h2>
                  <p className="text-slate-300">Tổng quan quản lý học phí và thanh toán</p>
                </div>
                <div className="text-right">
                  <p className="text-sm text-slate-400">Hôm nay</p>
                  <p className="text-xl font-semibold">{new Date().toLocaleDateString('vi-VN', { weekday: 'long', day: '2-digit', month: '2-digit', year: 'numeric' })}</p>
                </div>
              </div>
            </div>

            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {stats.map((stat) => (
                <div
                  key={stat.id}
                  className="bg-white rounded-xl shadow-sm border border-slate-200 p-6 hover:shadow-lg hover:border-emerald-300 transition-all group cursor-pointer"
                  onClick={() => navigate(stat.route)}
                >
                  <div className="flex items-start justify-between mb-4">
                    <div className={`w-12 h-12 ${stat.bgColor} rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform`}>
                      <div className={stat.textColor}>{stat.icon}</div>
                    </div>
                    <TrendingUp className="w-4 h-4 text-slate-300" />
                  </div>
                  <h3 className="text-slate-600 text-sm font-medium mb-1">{stat.title}</h3>
                  <p className="text-2xl font-bold text-slate-900 mb-1" style={{ fontFamily: "'Sora', sans-serif" }}>
                    {stat.value}
                  </p>
                  <div className="flex items-center justify-between">
                    <p className="text-xs text-slate-500">{stat.details}</p>
                    <ArrowUpRight className="w-4 h-4 text-slate-400 opacity-0 group-hover:opacity-100 transition-opacity" />
                  </div>
                </div>
              ))}
            </div>

            {/* Charts Section */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Revenue Chart */}
              <div className="lg:col-span-2 bg-white rounded-xl shadow-sm border border-slate-200 p-6">
                <h3 className="text-lg font-bold text-slate-900 mb-4" style={{ fontFamily: "'Sora', sans-serif" }}>
                  Doanh thu theo tháng
                </h3>
                {revenueData.length === 0 ? (
                  <div className="flex items-center justify-center h-[300px] text-slate-400">Chưa có dữ liệu</div>
                ) : (
                  <ResponsiveContainer width="100%" height={300}>
                    <AreaChart data={revenueData}>
                      <defs>
                        <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#10b981" stopOpacity={0.3} />
                          <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
                        </linearGradient>
                      </defs>
                      <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                      <XAxis dataKey="month" stroke="#64748b" />
                      <YAxis stroke="#64748b" tickFormatter={formatCurrency} />
                      <Tooltip formatter={(value: number) => [`${formatCurrency(value)} VNĐ`, 'Doanh thu']} />
                      <Area type="monotone" dataKey="revenue" stroke="#10b981" strokeWidth={2} fillOpacity={1} fill="url(#colorRevenue)" />
                    </AreaChart>
                  </ResponsiveContainer>
                )}
              </div>

              {/* Payment Status Pie Chart */}
              <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
                <h3 className="text-lg font-bold text-slate-900 mb-4" style={{ fontFamily: "'Sora', sans-serif" }}>
                  Tỷ lệ trạng thái
                </h3>
                <ResponsiveContainer width="100%" height={220}>
                  <PieChart>
                    <Pie
                      data={paymentStatusData}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      label={({ percent }) => `${(percent * 100).toFixed(0)}%`}
                      outerRadius={80}
                      dataKey="value"
                    >
                      {paymentStatusData.map((entry) => (
                        <Cell key={entry.id} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
                <div className="mt-4 space-y-2">
                  {paymentStatusData.map((item) => (
                    <div key={item.id} className="flex items-center justify-between text-sm">
                      <div className="flex items-center gap-2">
                        <div className="w-3 h-3 rounded-full" style={{ backgroundColor: item.color }} />
                        <span className="text-slate-600">{item.name}</span>
                      </div>
                      <span className="font-semibold text-slate-900">{item.value}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Recent Payments */}
            <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
              <div className="p-6 border-b border-slate-200">
                <h3 className="text-lg font-bold text-slate-900" style={{ fontFamily: "'Sora', sans-serif" }}>
                  Thanh toán gần đây
                </h3>
              </div>
              {recentPayments.length === 0 ? (
                <div className="p-8 text-center text-slate-400">Chưa có giao dịch nào</div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead className="bg-slate-50">
                      <tr>
                        <th className="px-6 py-3 text-left text-xs font-semibold text-slate-600 uppercase tracking-wider">Học viên</th>
                        <th className="px-6 py-3 text-left text-xs font-semibold text-slate-600 uppercase tracking-wider">Số tiền</th>
                        <th className="px-6 py-3 text-left text-xs font-semibold text-slate-600 uppercase tracking-wider">Ngày thanh toán</th>
                        <th className="px-6 py-3 text-left text-xs font-semibold text-slate-600 uppercase tracking-wider">Phương thức</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-200">
                      {recentPayments.map((p) => (
                        <tr key={p.paymentId} className="hover:bg-slate-50 transition-colors">
                          <td className="px-6 py-4 whitespace-nowrap">
                            <p className="font-semibold text-slate-900">{p.hocVienName ?? '—'}</p>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <span className="font-semibold text-slate-900">
                              {(p.amount ?? 0).toLocaleString('vi-VN')} VNĐ
                            </span>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-600">
                            {formatDate(p.ngayThanhToan)}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-600">
                            {p.phuongThucThanhToan ?? '—'}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {toast && (
        <Toast type={toast.type} message={toast.message} onClose={() => setToast(null)} />
      )}

      <button
        onClick={() => setToast({ type: 'warning', message: 'Tính năng Trợ lý AI đang được phát triển!' })}
        className="fixed bottom-8 right-8 w-16 h-16 hover:scale-110 transition-transform duration-200 z-50"
        aria-label="AI Assistant"
      >
        <AiAssistantButton />
      </button>
    </div>
  );
}
