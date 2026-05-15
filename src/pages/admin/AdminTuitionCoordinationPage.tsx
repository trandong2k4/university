import { useState, useEffect } from 'react';
import { AdminSidebar } from '@/components/layouts/AdminSidebar';
import { AdminHeader } from '@/components/layouts/AdminHeader';
import {
    ReceiptText, CircleDollarSign, AlertTriangle, Loader2,
    TrendingUp, CheckCircle2, XCircle, Clock, CalendarDays,
    RefreshCw, Search, CheckSquare, Square
} from 'lucide-react';
import AiAssistantButton from '@/imports/AiAssistantButton-4-13343';
import * as hocVienApi from '@/api/admin/hoc-vien.api';
import * as hocKiApi from '@/api/admin/hocki.api';

interface HocKiOption {
    id: string;
    maHocKi: string;
    tenHocKi: string;
    namHoc: string;
}

interface HocPhiItem {
    id: string;
    soTien: number;
    trangThai: 'CHUA_THANH_TOAN' | 'DA_THANH_TOAN' | 'QUA_HAN';
    hocVienMa: string;
    hocVienHoTen: string;
    hocVienEmail: string;
    hocKiMa: string;
    hocKiTen: string;
    soTienConNo: number;
    thanhToanMaGiaoDich: string;
    thanhToanPhuongThuc: string;
    thanhToanNgay: string;
}

const currency = (v: number) =>
    new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(v).replace('₫', 'VNĐ').trim();

const currencyShort = (v: number) => `${(v / 1000000).toFixed(1)}M`;

type TabType = 'overview' | 'details';

const STATUS_CONFIG = {
    DA_THANH_TOAN: { label: 'Đã thanh toán', icon: CheckCircle2, color: 'text-green-600 bg-green-50', dot: 'bg-green-500' },
    CHUA_THANH_TOAN: { label: 'Chưa thanh toán', icon: Clock, color: 'text-amber-600 bg-amber-50', dot: 'bg-amber-500' },
    QUA_HAN: { label: 'Quá hạn', icon: XCircle, color: 'text-red-600 bg-red-50', dot: 'bg-red-500' },
};

export default function AdminTuitionCoordinationPage() {
    const [hocKis, setHocKis] = useState<HocKiOption[]>([]);
    const [selectedHocKiId, setSelectedHocKiId] = useState<string>('');
    const [selectedNamHoc, setSelectedNamHoc] = useState<string>('');
    const [activeTab, setActiveTab] = useState<TabType>('overview');

    const [hocPhiList, setHocPhiList] = useState<HocPhiItem[]>([]);
    const [loadingHocKi, setLoadingHocKi] = useState(true);
    const [loadingDetails, setLoadingDetails] = useState(false);

    const [dashboardData, setDashboardData] = useState<hocVienApi.HocPhiDashboardTheoHocKi[]>([]);

    const [searchDetail, setSearchDetail] = useState('');
    const [statusFilter, setStatusFilter] = useState<string>('');
    const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());

    useEffect(() => {
        loadDropdownData();
    }, []);

    useEffect(() => {
        if (activeTab === 'overview') {
            loadDashboard();
        } else {
            loadDetailData();
        }
    }, [activeTab, selectedHocKiId]);

    const loadDropdownData = async () => {
        try {
            const data = await hocKiApi.getAllHocKi();
            const list: HocKiOption[] = (data || []).map((h: any) => ({
                id: h.id,
                maHocKi: h.maHocKi,
                tenHocKi: h.tenHocKi,
                namHoc: h.namHoc || '',
            }));
            setHocKis(list);

            const years = [...new Set(list.map(h => h.namHoc).filter(Boolean))].sort().reverse();
            if (years.length > 0) setSelectedNamHoc(years[0] as string);

            if (list.length > 0) {
                const firstHocKi = list[0];
                setSelectedHocKiId(firstHocKi.id);
            }
        } catch (err) {
            console.error('Lỗi tải học kỳ:', err);
        } finally {
            setLoadingHocKi(false);
        }
    };

    const loadDashboard = async () => {
        try {
            const [, tk] = await Promise.all([
                hocVienApi.getHocPhiDashboardTongQuan(),
                hocVienApi.getHocPhiDashboardTheoHocKi(),
            ]);
            setDashboardData(tk || []);
        } catch (err) {
            console.error('Lỗi tải dashboard:', err);
        }
    };

    const loadDetailData = async () => {
        if (!selectedHocKiId) return;
        setLoadingDetails(true);
        try {
            const data = await hocVienApi.getAllHocPhi();
            const filtered = (data || []).filter((h: HocPhiItem) => {
                const matchHocKi = !selectedHocKiId || h.hocKiMa === hocKis.find(hk => hk.id === selectedHocKiId)?.maHocKi;
                return matchHocKi;
            });
            setHocPhiList(filtered);
        } catch (err) {
            console.error('Lỗi tải chi tiết:', err);
        } finally {
            setLoadingDetails(false);
        }
    };

    const filteredDetails = hocPhiList.filter(item => {
        const q = searchDetail.toLowerCase();
        const matchSearch = !q ||
            item.hocVienMa?.toLowerCase().includes(q) ||
            item.hocVienHoTen?.toLowerCase().includes(q) ||
            item.hocVienEmail?.toLowerCase().includes(q);
        const matchStatus = !statusFilter || item.trangThai === statusFilter;
        return matchSearch && matchStatus;
    });

    const totalExpected = dashboardData.reduce((s, i) => s + (i.tongTien || 0), 0);
    const totalPaid = dashboardData.reduce((s, i) => s + (i.tienDaThu || 0), 0);
    const totalRemaining = totalExpected - totalPaid;
    const rateOverall = totalExpected > 0 ? Math.round((totalPaid / totalExpected) * 100) : 0;

    const toggleSelectAll = () => {
        if (selectedIds.size === filteredDetails.length) setSelectedIds(new Set());
        else setSelectedIds(new Set(filteredDetails.map(s => s.id)));
    };
    const toggleSelect = (id: string) => {
        const n = new Set(selectedIds);
        n.has(id) ? n.delete(id) : n.add(id);
        setSelectedIds(n);
    };

    const tabs = [
        { id: 'overview' as TabType, label: 'Tổng quan', icon: TrendingUp },
        { id: 'details' as TabType, label: 'Chi tiết', icon: ReceiptText },
    ];

    const namHocOptions = [...new Set(hocKis.map(h => h.namHoc).filter(Boolean))].sort().reverse();
    const hocKiOptions = hocKis.filter(h => !selectedNamHoc || h.namHoc === selectedNamHoc);

    const statCards = [
        {
            label: 'Dự thu',
            value: currencyShort(totalExpected),
            unit: 'VNĐ',
            icon: CircleDollarSign,
            gradient: 'from-blue-500 to-blue-600',
            bg: 'bg-blue-50',
            textColor: 'text-blue-600',
        },
        {
            label: 'Đã thu',
            value: currencyShort(totalPaid),
            unit: 'VNĐ',
            icon: CheckCircle2,
            gradient: 'from-green-500 to-green-600',
            bg: 'bg-green-50',
            textColor: 'text-green-600',
        },
        {
            label: 'Còn nợ',
            value: currencyShort(totalRemaining),
            unit: 'VNĐ',
            icon: AlertTriangle,
            gradient: 'from-red-500 to-red-600',
            bg: 'bg-red-50',
            textColor: 'text-red-600',
        },
        {
            label: 'Tỉ lệ thu',
            value: `${rateOverall}`,
            unit: '%',
            icon: TrendingUp,
            gradient: 'from-purple-500 to-purple-600',
            bg: 'bg-purple-50',
            textColor: 'text-purple-600',
            isRate: true,
            rateValue: rateOverall,
        },
    ];

    return (
        <div className="flex h-screen bg-slate-50">
            <AdminSidebar activeMenu="tuition" />
            <div className="flex-1 ml-64 flex flex-col overflow-hidden">
                <AdminHeader title="Điều phối học phí" />
                <div className="flex-1 overflow-auto">
                    <div className="p-6 max-w-7xl mx-auto space-y-6">

                        {/* Tabs */}
                        <div className="flex items-center gap-1 bg-white rounded-xl p-1.5 border border-slate-200 shadow-sm w-fit">
                            {tabs.map(tab => (
                                <button
                                    key={tab.id}
                                    onClick={() => setActiveTab(tab.id)}
                                    className={`flex items-center gap-2 px-5 py-2.5 rounded-lg text-sm font-semibold transition-all ${activeTab === tab.id
                                        ? 'bg-blue-600 text-white shadow-md'
                                        : 'text-slate-600 hover:bg-slate-100'
                                        }`}
                                >
                                    <tab.icon className="w-4 h-4" />
                                    {tab.label}
                                </button>
                            ))}
                        </div>

                        {/* ── Tổng quan ── */}
                        {activeTab === 'overview' && (
                            <>
                                {/* Stats Cards */}
                                <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                                    {loadingHocKi ? (
                                        <div className="col-span-4 flex items-center justify-center py-12">
                                            <Loader2 className="w-7 h-7 animate-spin text-blue-600" />
                                            <span className="ml-3 text-slate-500">Đang tải dữ liệu...</span>
                                        </div>
                                    ) : (
                                        statCards.map((card, i) => (
                                            <div key={i} className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm hover:shadow-md transition-shadow">
                                                <div className="flex items-start justify-between">
                                                    <div>
                                                        <p className="text-sm font-medium text-slate-500 mb-1">{card.label}</p>
                                                        <div className="flex items-baseline gap-1">
                                                            <span className={`text-2xl font-bold ${card.textColor}`}>{card.value}</span>
                                                            {card.unit && <span className="text-sm font-medium text-slate-400">{card.unit}</span>}
                                                        </div>
                                                    </div>
                                                    <div className={`w-11 h-11 rounded-xl ${card.bg} flex items-center justify-center`}>
                                                        <card.icon className={`w-5 h-5 ${card.textColor}`} />
                                                    </div>
                                                </div>
                                                {card.isRate && (
                                                    <div className="mt-3">
                                                        <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
                                                            <div
                                                                className="h-full bg-gradient-to-r from-purple-500 to-purple-600 rounded-full transition-all duration-700"
                                                                style={{ width: `${card.rateValue}%` }}
                                                            />
                                                        </div>
                                                    </div>
                                                )}
                                            </div>
                                        ))
                                    )}
                                </div>

                                {/* Theo học kỳ */}
                                <div className="bg-white border border-slate-200 rounded-2xl shadow-sm overflow-hidden">
                                    <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between">
                                        <div className="flex items-center gap-2 font-semibold text-slate-800">
                                            <CalendarDays className="w-5 h-5 text-blue-500" />
                                            Biểu đồ theo học kỳ
                                        </div>
                                        <button onClick={loadDashboard} className="p-2 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors">
                                            <RefreshCw className="w-4 h-4" />
                                        </button>
                                    </div>
                                    {loadingHocKi ? (
                                        <div className="flex items-center justify-center py-16">
                                            <Loader2 className="w-7 h-7 animate-spin text-blue-600" />
                                        </div>
                                    ) : dashboardData.length === 0 ? (
                                        <div className="text-center py-16">
                                            <ReceiptText className="w-12 h-12 mx-auto mb-3 text-slate-300" />
                                            <p className="text-slate-400 font-medium">Chưa có dữ liệu học phí</p>
                                        </div>
                                    ) : (
                                        <div className="p-6">
                                            {/* Bar chart */}
                                            <div className="space-y-4">
                                                {dashboardData.map(item => {
                                                    const rate = item.tongTien && item.tongTien > 0
                                                        ? Math.round(((item.tienDaThu || 0) / item.tongTien) * 100)
                                                        : 0;
                                                    return (
                                                        <div key={item.hocKiId} className="group">
                                                            <div className="flex items-center justify-between mb-1.5">
                                                                <div className="flex items-center gap-2">
                                                                    <span className="text-sm font-semibold text-slate-700">{item.hocKiTen}</span>
                                                                    <span className="text-xs text-slate-400 bg-slate-100 px-2 py-0.5 rounded-full">{item.hocKiMa}</span>
                                                                </div>
                                                                <div className="flex items-center gap-4 text-xs">
                                                                    <span className="text-slate-500">Dự thu: <b className="text-slate-700">{currencyShort(item.tongTien || 0)}</b></span>
                                                                    <span className="text-green-600">Đã thu: <b>{currencyShort(item.tienDaThu || 0)}</b></span>
                                                                    <span className="text-orange-500">Nợ: <b>{currencyShort(item.tienConNo || 0)}</b></span>
                                                                </div>
                                                            </div>
                                                            <div className="w-full bg-slate-100 h-3 rounded-full overflow-hidden">
                                                                <div
                                                                    className="h-full bg-gradient-to-r from-blue-500 to-blue-600 rounded-full transition-all duration-700 group-hover:from-blue-600 group-hover:to-blue-700"
                                                                    style={{ width: `${rate}%` }}
                                                                />
                                                            </div>
                                                            <div className="flex items-center justify-between mt-1">
                                                                <span className={`text-xs font-semibold ${rate >= 80 ? 'text-green-600' : rate >= 50 ? 'text-amber-600' : 'text-red-600'}`}>
                                                                    {rate}%
                                                                </span>
                                                                {(item.soChuaThanhToan || 0) + (item.soQuaHan || 0) > 0 && (
                                                                    <span className="text-xs text-red-500 flex items-center gap-1">
                                                                        <AlertTriangle className="w-3 h-3" />
                                                                        {(item.soChuaThanhToan || 0) + (item.soQuaHan || 0)} SV chưa đóng
                                                                    </span>
                                                                )}
                                                            </div>
                                                        </div>
                                                    );
                                                })}
                                            </div>
                                        </div>
                                    )}
                                </div>
                            </>
                        )}

                        {/* ── Chi tiết ── */}
                        {activeTab === 'details' && (
                            <>
                                {/* Filter Toolbar */}
                                <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-4 flex flex-col sm:flex-row gap-3 items-start sm:items-center justify-between">
                                    <div className="flex flex-wrap items-center gap-3 flex-1">
                                        {/* Search */}
                                        <div className="relative min-w-[200px] max-w-xs">
                                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                                            <input
                                                type="text"
                                                placeholder="Tìm mã, tên, email..."
                                                value={searchDetail}
                                                onChange={e => { setSearchDetail(e.target.value); setSelectedIds(new Set()); }}
                                                className="w-full pl-9 pr-4 py-2 text-sm border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
                                            />
                                        </div>

                                        {/* Năm học */}
                                        <select
                                            value={selectedNamHoc}
                                            onChange={e => {
                                                setSelectedNamHoc(e.target.value);
                                                setSelectedHocKiId('');
                                            }}
                                            className="py-2 px-3 border border-slate-300 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 cursor-pointer"
                                        >
                                            <option value="">-- Tất cả năm học --</option>
                                            {namHocOptions.map(y => (
                                                <option key={y} value={y}>{y}</option>
                                            ))}
                                        </select>

                                        {/* Học kỳ */}
                                        <select
                                            value={selectedHocKiId}
                                            onChange={e => { setSelectedHocKiId(e.target.value); setSelectedIds(new Set()); }}
                                            className="py-2 px-3 border border-slate-300 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 cursor-pointer"
                                        >
                                            <option value="">-- Tất cả học kỳ --</option>
                                            {hocKiOptions.map(hk => (
                                                <option key={hk.id} value={hk.id}>{hk.tenHocKi} ({hk.maHocKi})</option>
                                            ))}
                                        </select>

                                        {/* Trạng thái */}
                                        <select
                                            value={statusFilter}
                                            onChange={e => { setStatusFilter(e.target.value); setSelectedIds(new Set()); }}
                                            className="py-2 px-3 border border-slate-300 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 cursor-pointer"
                                        >
                                            <option value="">-- Tất cả trạng thái --</option>
                                            <option value="DA_THANH_TOAN">Đã thanh toán</option>
                                            <option value="CHUA_THANH_TOAN">Chưa thanh toán</option>
                                            <option value="QUA_HAN">Quá hạn</option>
                                        </select>
                                    </div>

                                    <div className="flex items-center gap-2">
                                        <button onClick={loadDetailData} className="p-2 border border-slate-300 rounded-xl text-slate-600 hover:bg-slate-50">
                                            <RefreshCw className="w-4 h-4" />
                                        </button>
                                        <span className="text-sm text-slate-500">
                                            <b>{filteredDetails.length}</b> kết quả
                                        </span>
                                    </div>
                                </div>

                                {/* Table */}
                                <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
                                    {loadingDetails ? (
                                        <div className="flex flex-col items-center justify-center h-64 gap-3">
                                            <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
                                            <p className="text-sm text-slate-500">Đang tải chi tiết học phí...</p>
                                        </div>
                                    ) : (
                                        <div className="overflow-auto" style={{ maxHeight: 'calc(100vh - 420px)' }}>
                                            <table className="w-full text-sm min-w-[900px]">
                                                <thead className="sticky top-0 z-10 bg-gradient-to-r from-slate-700 to-slate-800 text-white">
                                                    <tr>
                                                        <th className="px-4 py-3.5 w-12">
                                                            <button onClick={toggleSelectAll} className="p-1 hover:bg-white/20 rounded transition-colors">
                                                                {selectedIds.size === filteredDetails.length && filteredDetails.length > 0
                                                                    ? <CheckSquare className="w-4 h-4" />
                                                                    : <Square className="w-4 h-4" />
                                                                }
                                                            </button>
                                                        </th>
                                                        <th className="px-4 py-3 text-left font-semibold">Mã HV</th>
                                                        <th className="px-4 py-3 text-left font-semibold">Họ tên</th>
                                                        <th className="px-4 py-3 text-left font-semibold">Email</th>
                                                        <th className="px-4 py-3 text-left font-semibold">Học kỳ</th>
                                                        <th className="px-4 py-3 text-right font-semibold">Số tiền</th>
                                                        <th className="px-4 py-3 text-left font-semibold">Trạng thái</th>
                                                        <th className="px-4 py-3 text-left font-semibold">Còn nợ</th>
                                                    </tr>
                                                </thead>
                                                <tbody className="divide-y divide-slate-100">
                                                    {filteredDetails.map(item => {
                                                        const cfg = STATUS_CONFIG[item.trangThai] || STATUS_CONFIG.CHUA_THANH_TOAN;
                                                        const StatusIcon = cfg.icon;
                                                        const isSelected = selectedIds.has(item.id);
                                                        return (
                                                            <tr key={item.id} className={`transition-colors hover:bg-blue-50/60 ${isSelected ? 'bg-blue-50' : ''}`}>
                                                                <td className="px-4 py-3">
                                                                    <button onClick={() => toggleSelect(item.id)} className="p-1 hover:bg-blue-100 rounded transition-colors">
                                                                        {isSelected
                                                                            ? <CheckSquare className="w-4 h-4 text-blue-600" />
                                                                            : <Square className="w-4 h-4 text-slate-400" />
                                                                        }
                                                                    </button>
                                                                </td>
                                                                <td className="px-4 py-3 font-semibold text-slate-700">{item.hocVienMa || '-'}</td>
                                                                <td className="px-4 py-3 font-medium text-slate-800">{item.hocVienHoTen || '-'}</td>
                                                                <td className="px-4 py-3 text-slate-500">{item.hocVienEmail || '-'}</td>
                                                                <td className="px-4 py-3">
                                                                    <div className="flex items-center gap-1.5">
                                                                        <CalendarDays className="w-3.5 h-3.5 text-blue-400" />
                                                                        <span className="text-slate-600">{item.hocKiTen || '-'}</span>
                                                                    </div>
                                                                </td>
                                                                <td className="px-4 py-3 text-right font-semibold text-slate-800">{currency(item.soTien || 0)}</td>
                                                                <td className="px-4 py-3">
                                                                    <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold ${cfg.color}`}>
                                                                        <span className={`w-1.5 h-1.5 rounded-full ${cfg.dot}`} />
                                                                        <StatusIcon className="w-3.5 h-3.5" />
                                                                        {cfg.label}
                                                                    </span>
                                                                </td>
                                                                <td className="px-4 py-3">
                                                                    {item.soTienConNo > 0 ? (
                                                                        <span className="text-red-600 font-semibold">{currency(item.soTienConNo)}</span>
                                                                    ) : (
                                                                        <span className="text-green-600 font-semibold">—</span>
                                                                    )}
                                                                </td>
                                                            </tr>
                                                        );
                                                    })}
                                                    {filteredDetails.length === 0 && (
                                                        <tr>
                                                            <td colSpan={8} className="py-16 text-center">
                                                                <div className="flex flex-col items-center gap-2">
                                                                    <div className="rounded-full bg-slate-100 p-4"><ReceiptText className="w-8 h-8 text-slate-400" /></div>
                                                                    <p className="font-medium text-slate-600">Không có kết quả</p>
                                                                </div>
                                                            </td>
                                                        </tr>
                                                    )}
                                                </tbody>
                                            </table>
                                        </div>
                                    )}
                                </div>

                                {!loadingDetails && filteredDetails.length > 0 && (
                                    <div className="flex items-center justify-between text-xs text-slate-500 px-1">
                                        <span>Hiển thị <b>{filteredDetails.length}</b> bản ghi</span>
                                        {selectedIds.size > 0 && <span>Đã chọn <b className="text-blue-600">{selectedIds.size}</b></span>}
                                    </div>
                                )}
                            </>
                        )}
                    </div>
                </div>
            </div>

            <button className="fixed bottom-8 right-8 w-14 h-14 z-50 hover:scale-110 transition-transform" aria-label="AI">
                <AiAssistantButton />
            </button>
        </div>
    );
}
