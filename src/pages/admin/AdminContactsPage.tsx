import { useEffect, useState, useMemo, ReactNode } from 'react';
import { useNavigate } from 'react-router';
import { useAuth } from '@/hooks';
import { AdminSidebar } from '@/components/layouts/AdminSidebar';
import { AdminHeader } from '@/components/layouts/AdminHeader';
import { adminRepository } from '@/api';
import {
    MessageCircle, Phone, Mail, Search, Filter, CheckCircle,
    Clock, AlertCircle, Calendar, Eye, X, ChevronLeft, ChevronRight,
    Trash2, Reply, Send, RotateCcw, User, RefreshCw,
} from 'lucide-react';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { Table, TableHeader, TableBody, TableHead, TableRow, TableCell } from '@/components/ui/table';
import type {
    PhanHoiLienHeItem,
    PhanHoiLienHeThongKe,
    PhanHoiLienHeStatusRequest,
    PhanHoiLienHeReplyRequest,
    TrangThaiLienHe,
    LichSuXuLyItem,
} from '@/types';

const ROWS_PER_PAGE = 10;

function formatDate(dateStr: string): string {
    if (!dateStr) return '—';
    try {
        const d = new Date(dateStr);
        return d.toLocaleDateString('vi-VN', {
            day: '2-digit', month: '2-digit', year: 'numeric',
            hour: '2-digit', minute: '2-digit',
        });
    } catch {
        return dateStr;
    }
}

function formatShortDate(dateStr: string): string {
    if (!dateStr) return '—';
    try {
        const d = new Date(dateStr);
        return d.toLocaleDateString('vi-VN', {
            day: '2-digit', month: '2-digit', year: 'numeric',
        });
    } catch {
        return dateStr;
    }
}

const TRANG_THAI_CONFIG: Record<TrangThaiLienHe, { label: string; bg: string; border: string; text: string; icon: ReactNode }> = {
    CHUA_XU_LY: {
        label: 'Chưa xử lý',
        bg: 'bg-amber-50',
        border: 'border-amber-200',
        text: 'text-amber-700',
        icon: <AlertCircle className="w-3.5 h-3.5" />,
    },
    DANG_XU_LY: {
        label: 'Đang xử lý',
        bg: 'bg-blue-50',
        border: 'border-blue-200',
        text: 'text-blue-700',
        icon: <Clock className="w-3.5 h-3.5" />,
    },
    DA_XU_LY: {
        label: 'Đã xử lý',
        bg: 'bg-green-50',
        border: 'border-green-200',
        text: 'text-green-700',
        icon: <CheckCircle className="w-3.5 h-3.5" />,
    },
};

function StatusBadge({ trangThai }: { trangThai: TrangThaiLienHe }) {
    const cfg = TRANG_THAI_CONFIG[trangThai] || TRANG_THAI_CONFIG['CHUA_XU_LY'];
    return (
        <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium border ${cfg.bg} ${cfg.border} ${cfg.text}`}>
            {cfg.icon}
            {cfg.label}
        </span>
    );
}

function SimplePagination({ current, total, onChange }: {
    current: number; total: number; onChange: (p: number) => void;
}) {
    if (total <= 1) return null;
    const pages = Array.from({ length: Math.min(total, 7) }, (_, i) => {
        if (total <= 7) return i + 1;
        if (i === 0) return 1;
        if (i === 6) return total;
        if (current <= 4) return i + 1;
        if (current >= total - 3) return total - 6 + i;
        return current - 3 + i;
    });

    return (
        <div className="flex items-center gap-1">
            <button
                onClick={() => onChange(current - 1)}
                disabled={current === 1}
                className="p-1.5 rounded-lg border border-gray-200 text-gray-500 hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed"
            >
                <ChevronLeft className="w-4 h-4" />
            </button>
            {pages.map((p, i) => (
                typeof p === 'number' ? (
                    <button
                        key={`${p}-${i}`}
                        onClick={() => onChange(p)}
                        className={`w-8 h-8 rounded-lg text-sm font-medium transition-colors ${p === current
                            ? 'bg-blue-600 text-white'
                            : 'border border-gray-200 text-gray-600 hover:bg-gray-50'
                            }`}
                    >
                        {p}
                    </button>
                ) : (
                    <span key={`ellipsis-${i}`} className="w-8 h-8 flex items-center justify-center text-gray-400">...</span>
                )
            ))}
            <button
                onClick={() => onChange(current + 1)}
                disabled={current === total}
                className="p-1.5 rounded-lg border border-gray-200 text-gray-500 hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed"
            >
                <ChevronRight className="w-4 h-4" />
            </button>
        </div>
    );
}

function StatCard({ label, value, bg, icon, accent }: {
    label: string; value: number; bg: string; icon: ReactNode; accent: string;
}) {
    return (
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-5">
            <div className="flex items-center justify-between">
                <div>
                    <p className="text-sm text-gray-500">{label}</p>
                    <p className="text-2xl font-bold text-gray-900 mt-1">{value}</p>
                </div>
                <div className={`w-11 h-11 rounded-xl flex items-center justify-center ${bg}`}>
                    <span className={accent}>{icon}</span>
                </div>
            </div>
        </div>
    );
}

function Toast({ message, type, onClose }: {
    message: string; type: 'success' | 'error'; onClose: () => void;
}) {
    useEffect(() => {
        const timer = setTimeout(onClose, 4000);
        return () => clearTimeout(timer);
    }, [onClose]);
    return (
        <div className={`fixed top-4 right-4 z-[100] flex items-center gap-3 px-4 py-3 rounded-xl shadow-lg text-sm font-medium animate-in slide-in-from-right ${
            type === 'success'
                ? 'bg-green-600 text-white'
                : 'bg-red-600 text-white'
        }`}>
            {type === 'success' ? <CheckCircle className="w-4 h-4 shrink-0" /> : <AlertCircle className="w-4 h-4 shrink-0" />}
            {message}
            <button onClick={onClose} className="ml-2 hover:opacity-70">
                <X className="w-4 h-4" />
            </button>
        </div>
    );
}

function HistoryTimeline({ items }: { items: LichSuXuLyItem[] }) {
    if (!items || items.length === 0) {
        return <p className="text-sm text-gray-400 text-center py-4">Chưa có lịch sử xử lý</p>;
    }
    return (
        <div className="space-y-3 max-h-60 overflow-y-auto pr-1">
            {[...items].reverse().map((item) => {
                const fromCfg = TRANG_THAI_CONFIG[item.trangThaiTruoc] || TRANG_THAI_CONFIG['CHUA_XU_LY'];
                const toCfg = TRANG_THAI_CONFIG[item.trangThaiMoi] || TRANG_THAI_CONFIG['CHUA_XU_LY'];
                return (
                    <div key={item.id} className="flex gap-3">
                        <div className="flex flex-col items-center">
                            <div className={`w-2 h-2 rounded-full mt-1.5 shrink-0 ${fromCfg.bg.replace('bg-', 'bg-').replace('-50', '-400')}`} />
                            <div className="w-px flex-1 bg-gray-200 my-1" />
                        </div>
                        <div className="flex-1 pb-3">
                            <div className="flex items-center gap-2 flex-wrap mb-1">
                                <span className={`text-xs font-medium ${fromCfg.text}`}>{fromCfg.label}</span>
                                <span className="text-gray-300 text-xs">→</span>
                                <span className={`text-xs font-medium ${toCfg.text}`}>{toCfg.label}</span>
                            </div>
                            <p className="text-xs text-gray-500 mb-0.5">
                                {item.nguoiThucHien} · {formatDate(item.thoiGianXuLy)}
                            </p>
                            {item.ghiChu && (
                                <p className="text-xs text-gray-600 bg-gray-50 rounded-lg px-2 py-1 mb-0.5">
                                    <span className="text-gray-400">Ghi chú: </span>{item.ghiChu}
                                </p>
                            )}
                            {item.noiDungPhanHoi && (
                                <div className="bg-blue-50 rounded-lg px-2 py-1.5 mt-1">
                                    <p className="text-xs text-blue-700 font-medium mb-0.5 flex items-center gap-1">
                                        <Reply className="w-3 h-3" /> Phản hồi:
                                    </p>
                                    <p className="text-xs text-blue-800">{item.noiDungPhanHoi}</p>
                                </div>
                            )}
                        </div>
                    </div>
                );
            })}
        </div>
    );
}

function ContactDetailModal({ item, onClose, onStatusUpdate, onReply, onDelete }: {
    item: PhanHoiLienHeItem;
    onClose: () => void;
    onStatusUpdate: (id: string, status: TrangThaiLienHe) => Promise<void>;
    onReply: (id: string, content: string) => Promise<void>;
    onDelete: (id: string) => Promise<void>;
}) {
    const [replyContent, setReplyContent] = useState('');
    const [submitting, setSubmitting] = useState(false);
    const [showReply, setShowReply] = useState(false);
    const [confirmDelete, setConfirmDelete] = useState(false);

    const handleReply = async () => {
        if (!replyContent.trim()) return;
        setSubmitting(true);
        try {
            await onReply(item.id, replyContent);
            setReplyContent('');
            setShowReply(false);
        } finally {
            setSubmitting(false);
        }
    };

    const handleDelete = async () => {
        setSubmitting(true);
        try {
            await onDelete(item.id);
            onClose();
        } finally {
            setSubmitting(false);
        }
    };

    return (
        <div
            className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50 flex items-center justify-center p-4"
            onClick={e => { if (e.target === e.currentTarget) onClose(); }}
        >
            <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] flex flex-col">
                <div className="flex items-center justify-between p-5 border-b border-gray-100 shrink-0">
                    <div className="flex items-center gap-3">
                        <div className="w-9 h-9 bg-blue-100 rounded-full flex items-center justify-center">
                            <MessageCircle className="w-5 h-5 text-blue-600" />
                        </div>
                        <div>
                            <h3 className="font-semibold text-gray-900">{item.hoTen}</h3>
                            <p className="text-xs text-gray-500">{item.chuDe}</p>
                        </div>
                    </div>
                    <div className="flex items-center gap-3">
                        <StatusBadge trangThai={item.trangThai} />
                        <button onClick={onClose} className="p-1.5 rounded-lg hover:bg-gray-100 text-gray-400">
                            <X className="w-5 h-5" />
                        </button>
                    </div>
                </div>

                <div className="flex-1 overflow-y-auto p-5 space-y-5">
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <p className="text-xs text-gray-400 mb-1">Email</p>
                            <div className="flex items-center gap-1.5 text-sm text-gray-700">
                                <Mail className="w-4 h-4 text-gray-400 shrink-0" />
                                <span className="truncate">{item.email}</span>
                            </div>
                        </div>
                        {item.soDienThoai && (
                            <div>
                                <p className="text-xs text-gray-400 mb-1">Điện thoại</p>
                                <div className="flex items-center gap-1.5 text-sm text-gray-700">
                                    <Phone className="w-4 h-4 text-gray-400 shrink-0" />
                                    {item.soDienThoai}
                                </div>
                            </div>
                        )}
                        <div>
                            <p className="text-xs text-gray-400 mb-1">Ngày gửi</p>
                            <p className="text-sm text-gray-700 flex items-center gap-1.5">
                                <Calendar className="w-4 h-4 text-gray-400 shrink-0" />
                                {formatDate(item.ngayTao)}
                            </p>
                        </div>
                        {item.nguoiXuLy && (
                            <div>
                                <p className="text-xs text-gray-400 mb-1">Người xử lý</p>
                                <p className="text-sm text-gray-700 flex items-center gap-1.5">
                                    <User className="w-4 h-4 text-gray-400 shrink-0" />
                                    {item.nguoiXuLy}
                                </p>
                            </div>
                        )}
                        {item.gioiTinh && (
                            <div>
                                <p className="text-xs text-gray-400 mb-1">Giới tính</p>
                                <p className="text-sm text-gray-700">{item.gioiTinh}</p>
                            </div>
                        )}
                    </div>

                    <div>
                        <p className="text-xs text-gray-400 mb-2">Nội dung liên hệ</p>
                        <div className="bg-gray-50 rounded-xl p-4 text-sm text-gray-700 leading-relaxed whitespace-pre-wrap">
                            {item.noiDung}
                        </div>
                    </div>

                    <div>
                        <p className="text-xs text-gray-400 mb-2">Lịch sử xử lý</p>
                        <HistoryTimeline items={item.lichSuXuLys || []} />
                    </div>

                    {showReply && (
                        <div>
                            <p className="text-xs text-gray-400 mb-2">Soạn phản hồi</p>
                            <textarea
                                value={replyContent}
                                onChange={e => setReplyContent(e.target.value)}
                                placeholder="Nhập nội dung phản hồi cho người gửi..."
                                rows={4}
                                className="w-full px-3 py-2 text-sm border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
                                maxLength={2000}
                            />
                            <div className="flex justify-end gap-2 mt-2">
                                <button
                                    onClick={() => setShowReply(false)}
                                    className="px-4 py-2 text-sm border border-gray-300 rounded-lg text-gray-600 hover:bg-gray-50"
                                >
                                    Hủy
                                </button>
                                <button
                                    onClick={handleReply}
                                    disabled={submitting || !replyContent.trim()}
                                    className="px-4 py-2 text-sm bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 flex items-center gap-1.5"
                                >
                                    {submitting ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
                                    Gửi phản hồi
                                </button>
                            </div>
                        </div>
                    )}
                </div>

                <div className="p-4 border-t border-gray-100 flex items-center justify-between shrink-0">
                    <button
                        onClick={() => setConfirmDelete(true)}
                        className="px-3 py-2 text-sm border border-red-200 text-red-600 rounded-lg hover:bg-red-50 flex items-center gap-1.5"
                    >
                        <Trash2 className="w-4 h-4" /> Xóa
                    </button>
                    <div className="flex gap-2">
                        {item.trangThai !== 'DA_XU_LY' && !showReply && (
                            <>
                                {item.trangThai === 'CHUA_XU_LY' && (
                                    <button
                                        onClick={async () => { await onStatusUpdate(item.id, 'DANG_XU_LY'); }}
                                        className="px-4 py-2 text-sm bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center gap-1.5"
                                    >
                                        <Clock className="w-4 h-4" /> Bắt đầu xử lý
                                    </button>
                                )}
                                <button
                                    onClick={async () => { await onStatusUpdate(item.id, 'DA_XU_LY'); }}
                                    className="px-4 py-2 text-sm bg-green-600 text-white rounded-lg hover:bg-green-700 flex items-center gap-1.5"
                                >
                                    <CheckCircle className="w-4 h-4" /> Đánh dấu đã xử lý
                                </button>
                                <button
                                    onClick={() => setShowReply(true)}
                                    className="px-4 py-2 text-sm border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 flex items-center gap-1.5"
                                >
                                    <Reply className="w-4 h-4" /> Phản hồi
                                </button>
                            </>
                        )}
                        {item.trangThai === 'DA_XU_LY' && (
                            <button
                                onClick={async () => { await onStatusUpdate(item.id, 'CHUA_XU_LY'); }}
                                className="px-4 py-2 text-sm border border-amber-300 text-amber-700 rounded-lg hover:bg-amber-50 flex items-center gap-1.5"
                            >
                                <RotateCcw className="w-4 h-4" /> Mở lại
                            </button>
                        )}
                    </div>
                </div>

                {confirmDelete && (
                    <div className="absolute inset-0 bg-black/30 rounded-2xl flex items-center justify-center">
                        <div className="bg-white rounded-xl p-5 shadow-xl max-w-sm mx-auto text-center">
                            <AlertCircle className="w-10 h-10 text-red-500 mx-auto mb-3" />
                            <h4 className="font-semibold text-gray-900 mb-2">Xác nhận xóa</h4>
                            <p className="text-sm text-gray-500 mb-4">
                                Bạn có chắc chắn muốn xóa liên hệ này? Hành động này không thể hoàn tác.
                            </p>
                            <div className="flex gap-2 justify-center">
                                <button
                                    onClick={() => setConfirmDelete(false)}
                                    className="px-4 py-2 text-sm border border-gray-300 rounded-lg text-gray-600 hover:bg-gray-50"
                                >
                                    Hủy
                                </button>
                                <button
                                    onClick={handleDelete}
                                    disabled={submitting}
                                    className="px-4 py-2 text-sm bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:opacity-50"
                                >
                                    Xóa
                                </button>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}

export default function AdminContactsPage() {
    const navigate = useNavigate();
    const { user, isAuthenticated } = useAuth();
    const [contacts, setContacts] = useState<PhanHoiLienHeItem[]>([]);
    const [thongKe, setThongKe] = useState<PhanHoiLienHeThongKe>({ chuaXuLy: 0, dangXuLy: 0, daXuLy: 0, tong: 0 });
    const [loading, setLoading] = useState(true);
    const [toasts, setToasts] = useState<{ id: string; message: string; type: 'success' | 'error' }[]>([]);

    // Tab 1 state
    const [searchTerm, setSearchTerm] = useState('');
    const [statusFilter, setStatusFilter] = useState<TrangThaiLienHe | 'ALL'>('ALL');
    const [currentPage, setCurrentPage] = useState(1);

    // Tab 2 state
    const [historySearch, setHistorySearch] = useState('');
    const [historyStatus, setHistoryStatus] = useState<TrangThaiLienHe | 'ALL'>('ALL');
    const [dateFrom, setDateFrom] = useState('');
    const [dateTo, setDateTo] = useState('');
    const [historyPage, setHistoryPage] = useState(1);

    const [selectedContact, setSelectedContact] = useState<PhanHoiLienHeItem | null>(null);

    const addToast = (message: string, type: 'success' | 'error') => {
        const id = Date.now().toString();
        setToasts(prev => [...prev, { id, message, type }]);
    };

    const removeToast = (id: string) => {
        setToasts(prev => prev.filter(t => t.id !== id));
    };

    useEffect(() => {
        if (!isAuthenticated || !user || user.role !== 'admin') navigate('/');
    }, [isAuthenticated, user, navigate]);

    useEffect(() => { loadData(); }, []);

    const loadData = async () => {
        setLoading(true);
        try {
            const [data, stats] = await Promise.all([
                adminRepository.getPhanHoiLienHe(),
                adminRepository.getPhanHoiLienHeThongKe(),
            ]);
            setContacts(data);
            setThongKe(stats);
        } catch (e) {
            console.error('Failed to load contacts:', e);
            addToast('Không thể tải danh sách liên hệ', 'error');
        } finally {
            setLoading(false);
        }
    };

    const handleStatusUpdate = async (id: string, status: TrangThaiLienHe) => {
        try {
            const request: PhanHoiLienHeStatusRequest = { trangThai: status, nguoiXuLy: user?.name || 'Admin' };
            const updated = await adminRepository.updatePhanHoiLienHeStatus(id, request);
            setContacts(prev => prev.map(c => c.id === id ? updated : c));
            if (selectedContact?.id === id) setSelectedContact(updated);
            const stats = await adminRepository.getPhanHoiLienHeThongKe();
            setThongKe(stats);
            addToast('Cập nhật trạng thái thành công', 'success');
        } catch (e) {
            console.error('Failed to update status:', e);
            addToast('Cập nhật trạng thái thất bại', 'error');
        }
    };

    const handleReply = async (id: string, content: string) => {
        try {
            const request: PhanHoiLienHeReplyRequest = { noiDungPhanHoi: content };
            const updated = await adminRepository.replyPhanHoiLienHe(id, request);
            setContacts(prev => prev.map(c => c.id === id ? updated : c));
            if (selectedContact?.id === id) setSelectedContact(updated);
            const stats = await adminRepository.getPhanHoiLienHeThongKe();
            setThongKe(stats);
            addToast('Gửi phản hồi thành công', 'success');
        } catch (e) {
            console.error('Failed to reply:', e);
            addToast('Gửi phản hồi thất bại', 'error');
            throw e;
        }
    };

    const handleDelete = async (id: string) => {
        try {
            await adminRepository.deletePhanHoiLienHe(id);
            setContacts(prev => prev.filter(c => c.id !== id));
            if (selectedContact?.id === id) setSelectedContact(null);
            const stats = await adminRepository.getPhanHoiLienHeThongKe();
            setThongKe(stats);
            addToast('Xóa liên hệ thành công', 'success');
        } catch (e) {
            console.error('Failed to delete:', e);
            addToast('Xóa liên hệ thất bại', 'error');
            throw e;
        }
    };

    // Tab 1: filtered + paginated
    const filteredContacts = useMemo(() => {
        const kw = searchTerm.toLowerCase();
        return contacts.filter(c => {
            const matchKw = !kw || c.hoTen.toLowerCase().includes(kw)
                || c.email.toLowerCase().includes(kw)
                || c.chuDe.toLowerCase().includes(kw);
            const matchStatus = statusFilter === 'ALL' || c.trangThai === statusFilter;
            return matchKw && matchStatus;
        });
    }, [contacts, searchTerm, statusFilter]);

    const totalPages = Math.ceil(filteredContacts.length / ROWS_PER_PAGE);
    const paginatedContacts = filteredContacts.slice((currentPage - 1) * ROWS_PER_PAGE, currentPage * ROWS_PER_PAGE);

    // Tab 2: history filtered + paginated
    const historyContacts = useMemo(() => {
        return contacts.filter(c => {
            const kw = historySearch.toLowerCase();
            if (kw && !c.hoTen.toLowerCase().includes(kw) && !c.email.toLowerCase().includes(kw) && !c.chuDe.toLowerCase().includes(kw)) return false;
            if (historyStatus !== 'ALL' && c.trangThai !== historyStatus) return false;
            if (dateFrom || dateTo) {
                const d = new Date(c.ngayTao);
                if (dateFrom && d < new Date(dateFrom)) return false;
                if (dateTo) {
                    const end = new Date(dateTo);
                    end.setHours(23, 59, 59);
                    if (d > end) return false;
                }
            }
            return true;
        }).sort((a, b) => new Date(b.ngayTao).getTime() - new Date(a.ngayTao).getTime());
    }, [contacts, historySearch, historyStatus, dateFrom, dateTo]);

    const historyTotalPages = Math.ceil(historyContacts.length / ROWS_PER_PAGE);
    const paginatedHistory = historyContacts.slice((historyPage - 1) * ROWS_PER_PAGE, historyPage * ROWS_PER_PAGE);

    if (loading) {
        return (
            <div className="flex h-screen bg-[#f1f5f9]">
                <AdminSidebar activeMenu="contacts" />
                <div className="flex-1 ml-64 flex flex-col">
                    <AdminHeader title="Quản lý liên hệ" />
                    <div className="flex-1 flex items-center justify-center">
                        <div className="text-center">
                            <RefreshCw className="w-8 h-8 text-blue-500 animate-spin mx-auto mb-2" />
                            <p className="text-gray-500">Đang tải dữ liệu...</p>
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="flex h-screen bg-[#f1f5f9]">
            <AdminSidebar activeMenu="contacts" />
            <div className="flex-1 ml-64 flex flex-col overflow-hidden">
                <AdminHeader title="Quản lý liên hệ" />
                <div className="flex-1 overflow-auto p-6">
                    <div className="max-w-7xl mx-auto space-y-5">

                        {/* Stats */}
                        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                            <StatCard
                                label="Tổng liên hệ"
                                value={thongKe.tong}
                                bg="bg-blue-100"
                                icon={<MessageCircle className="w-5 h-5 text-blue-600" />}
                                accent="text-blue-600"
                            />
                            <StatCard
                                label="Chưa xử lý"
                                value={thongKe.chuaXuLy}
                                bg="bg-amber-100"
                                icon={<AlertCircle className="w-5 h-5 text-amber-600" />}
                                accent="text-amber-600"
                            />
                            <StatCard
                                label="Đang xử lý"
                                value={thongKe.dangXuLy}
                                bg="bg-indigo-100"
                                icon={<Clock className="w-5 h-5 text-indigo-600" />}
                                accent="text-indigo-600"
                            />
                            <StatCard
                                label="Đã xử lý"
                                value={thongKe.daXuLy}
                                bg="bg-green-100"
                                icon={<CheckCircle className="w-5 h-5 text-green-600" />}
                                accent="text-green-600"
                            />
                        </div>

                        {/* Tabs */}
                        <Tabs defaultValue="manage">
                            <TabsList>
                                <TabsTrigger value="manage">Quản lý liên hệ</TabsTrigger>
                                <TabsTrigger value="history">Lịch sử xử lý</TabsTrigger>
                            </TabsList>

                            {/* ── Tab 1: Manage ── */}
                            <TabsContent value="manage" className="space-y-4 mt-4">
                                <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4">
                                    <div className="flex flex-col md:flex-row gap-3 items-center">
                                        <div className="flex-1 relative w-full">
                                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4" />
                                            <input
                                                type="text"
                                                placeholder="Tìm kiếm theo tên, email hoặc chủ đề..."
                                                value={searchTerm}
                                                onChange={e => { setSearchTerm(e.target.value); setCurrentPage(1); }}
                                                className="w-full pl-9 pr-4 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                                            />
                                        </div>
                                        <div className="flex items-center gap-2 shrink-0">
                                            <Filter className="w-4 h-4 text-gray-400" />
                                            <select
                                                value={statusFilter}
                                                onChange={e => { setStatusFilter(e.target.value as TrangThaiLienHe | 'ALL'); setCurrentPage(1); }}
                                                className="px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                                            >
                                                <option value="ALL">Tất cả trạng thái</option>
                                                <option value="CHUA_XU_LY">Chưa xử lý</option>
                                                <option value="DANG_XU_LY">Đang xử lý</option>
                                                <option value="DA_XU_LY">Đã xử lý</option>
                                            </select>
                                        </div>
                                        <span className="text-sm text-gray-500 whitespace-nowrap shrink-0">{filteredContacts.length} kết quả</span>
                                    </div>
                                </div>

                                {paginatedContacts.length > 0 ? (
                                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                                        {paginatedContacts.map(item => (
                                            <div key={item.id} className="bg-white rounded-xl shadow-sm border border-gray-200 p-5 hover:shadow-md transition-shadow">
                                                <div className="flex items-start justify-between mb-3">
                                                    <div className="flex items-center gap-3">
                                                        <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center shrink-0">
                                                            <User className="w-5 h-5 text-blue-600" />
                                                        </div>
                                                        <div>
                                                            <h3 className="font-semibold text-gray-900">{item.hoTen}</h3>
                                                            <p className="text-sm text-gray-500">{item.chuDe}</p>
                                                        </div>
                                                    </div>
                                                    <StatusBadge trangThai={item.trangThai} />
                                                </div>

                                                <div className="space-y-1.5 mb-3">
                                                    <div className="flex items-center gap-2 text-sm text-gray-600">
                                                        <Mail className="w-4 h-4 shrink-0 text-gray-400" />
                                                        <span className="truncate">{item.email}</span>
                                                    </div>
                                                    {item.soDienThoai && (
                                                        <div className="flex items-center gap-2 text-sm text-gray-600">
                                                            <Phone className="w-4 h-4 shrink-0 text-gray-400" />
                                                            <span>{item.soDienThoai}</span>
                                                        </div>
                                                    )}
                                                    <div className="flex items-center gap-2 text-xs text-gray-400">
                                                        <Calendar className="w-3.5 h-3.5 shrink-0" />
                                                        Nhận lúc: {formatShortDate(item.ngayTao)}
                                                    </div>
                                                </div>

                                                <div className="bg-gray-50 rounded-lg p-3 mb-3 text-sm text-gray-700 line-clamp-2 whitespace-pre-wrap">
                                                    {item.noiDung}
                                                </div>

                                                <div className="flex gap-2 flex-wrap">
                                                    <button
                                                        onClick={() => setSelectedContact(item)}
                                                        className="px-3 py-1.5 text-xs font-medium border border-gray-300 text-gray-600 rounded-lg hover:bg-gray-50 flex items-center gap-1.5 transition-colors"
                                                    >
                                                        <Eye className="w-3.5 h-3.5" /> Chi tiết
                                                    </button>
                                                    {item.trangThai === 'CHUA_XU_LY' && (
                                                        <button
                                                            onClick={async () => { await handleStatusUpdate(item.id, 'DANG_XU_LY'); }}
                                                            className="px-3 py-1.5 text-xs font-medium bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                                                        >
                                                            Bắt đầu xử lý
                                                        </button>
                                                    )}
                                                    {item.trangThai !== 'DA_XU_LY' && (
                                                        <>
                                                            <button
                                                                onClick={async () => { await handleStatusUpdate(item.id, 'DA_XU_LY'); }}
                                                                className="px-3 py-1.5 text-xs font-medium bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
                                                            >
                                                                Đã xử lý
                                                            </button>
                                                        </>
                                                    )}
                                                    <button
                                                        onClick={async () => { await handleDelete(item.id); }}
                                                        className="px-3 py-1.5 text-xs font-medium border border-red-200 text-red-600 rounded-lg hover:bg-red-50 transition-colors"
                                                    >
                                                        <Trash2 className="w-3.5 h-3.5" />
                                                    </button>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                ) : (
                                    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-12 text-center">
                                        <MessageCircle className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                                        <p className="text-gray-500">Không tìm thấy liên hệ nào</p>
                                    </div>
                                )}

                                {totalPages > 1 && (
                                    <div className="flex justify-center">
                                        <SimplePagination current={currentPage} total={totalPages} onChange={setCurrentPage} />
                                    </div>
                                )}
                            </TabsContent>

                            {/* ── Tab 2: History ── */}
                            <TabsContent value="history" className="space-y-4 mt-4">
                                <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4">
                                    <div className="flex flex-col lg:flex-row gap-3 flex-wrap">
                                        <div className="flex-1 min-w-48 relative">
                                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4" />
                                            <input
                                                type="text"
                                                placeholder="Tìm kiếm..."
                                                value={historySearch}
                                                onChange={e => { setHistorySearch(e.target.value); setHistoryPage(1); }}
                                                className="w-full pl-9 pr-4 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                                            />
                                        </div>
                                        <select
                                            value={historyStatus}
                                            onChange={e => { setHistoryStatus(e.target.value as TrangThaiLienHe | 'ALL'); setHistoryPage(1); }}
                                            className="px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 shrink-0"
                                        >
                                            <option value="ALL">Tất cả trạng thái</option>
                                            <option value="CHUA_XU_LY">Chưa xử lý</option>
                                            <option value="DANG_XU_LY">Đang xử lý</option>
                                            <option value="DA_XU_LY">Đã xử lý</option>
                                        </select>
                                        <div className="flex items-center gap-2 shrink-0">
                                            <Calendar className="w-4 h-4 text-gray-400 shrink-0" />
                                            <input
                                                type="date"
                                                value={dateFrom}
                                                onChange={e => { setDateFrom(e.target.value); setHistoryPage(1); }}
                                                className="px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                                            />
                                            <span className="text-gray-400 text-sm">—</span>
                                            <input
                                                type="date"
                                                value={dateTo}
                                                onChange={e => { setDateTo(e.target.value); setHistoryPage(1); }}
                                                className="px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                                            />
                                        </div>
                                        {(dateFrom || dateTo) && (
                                            <button
                                                onClick={() => { setDateFrom(''); setDateTo(''); setHistoryPage(1); }}
                                                className="px-3 py-2 text-sm text-gray-500 border border-gray-300 rounded-lg hover:bg-gray-50 flex items-center gap-1.5 transition-colors shrink-0"
                                            >
                                                <X className="w-3.5 h-3.5" /> Xóa lọc
                                            </button>
                                        )}
                                    </div>
                                </div>

                                <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
                                    <Table>
                                        <TableHeader>
                                            <TableRow className="bg-gray-50/80">
                                                <TableHead className="w-12 pl-4">#</TableHead>
                                                <TableHead>Người gửi</TableHead>
                                                <TableHead>Thông tin liên hệ</TableHead>
                                                <TableHead>Chủ đề</TableHead>
                                                <TableHead>Nội dung</TableHead>
                                                <TableHead>Trạng thái</TableHead>
                                                <TableHead>Ngày gửi</TableHead>
                                                <TableHead>Cập nhật</TableHead>
                                                <TableHead className="pr-4"></TableHead>
                                            </TableRow>
                                        </TableHeader>
                                        <TableBody>
                                            {paginatedHistory.length > 0 ? (
                                                paginatedHistory.map((item, i) => (
                                                    <TableRow key={item.id} className="hover:bg-blue-50/30">
                                                        <TableCell className="pl-4 text-gray-400 text-xs">
                                                            {(historyPage - 1) * ROWS_PER_PAGE + i + 1}
                                                        </TableCell>
                                                        <TableCell>
                                                            <span className="font-medium text-gray-900 text-sm">{item.hoTen}</span>
                                                        </TableCell>
                                                        <TableCell>
                                                            <div className="space-y-0.5">
                                                                <div className="flex items-center gap-1 text-xs text-gray-600">
                                                                    <Mail className="w-3 h-3 shrink-0" />{item.email}
                                                                </div>
                                                                {item.soDienThoai && (
                                                                    <div className="flex items-center gap-1 text-xs text-gray-600">
                                                                        <Phone className="w-3 h-3 shrink-0" />{item.soDienThoai}
                                                                    </div>
                                                                )}
                                                            </div>
                                                        </TableCell>
                                                        <TableCell>
                                                            <span className="max-w-36 truncate block text-sm text-gray-700">{item.chuDe}</span>
                                                        </TableCell>
                                                        <TableCell>
                                                            <span className="max-w-44 truncate block text-sm text-gray-500">{item.noiDung}</span>
                                                        </TableCell>
                                                        <TableCell>
                                                            <StatusBadge trangThai={item.trangThai} />
                                                        </TableCell>
                                                        <TableCell>
                                                            <span className="text-xs text-gray-500 whitespace-nowrap">{formatShortDate(item.ngayTao)}</span>
                                                        </TableCell>
                                                        <TableCell>
                                                            <span className="text-xs text-gray-400 whitespace-nowrap">{item.ngayCapNhat ? formatShortDate(item.ngayCapNhat) : '—'}</span>
                                                        </TableCell>
                                                        <TableCell className="pr-4">
                                                            <button
                                                                onClick={() => setSelectedContact(item)}
                                                                className="p-1.5 rounded-lg text-gray-400 hover:text-blue-600 hover:bg-blue-50 transition-colors"
                                                            >
                                                                <Eye className="w-4 h-4" />
                                                            </button>
                                                        </TableCell>
                                                    </TableRow>
                                                ))
                                            ) : (
                                                <TableRow>
                                                    <TableCell colSpan={9} className="text-center py-12">
                                                        <MessageCircle className="w-10 h-10 mx-auto mb-2 text-gray-200" />
                                                        <p className="text-gray-400 text-sm">Không có dữ liệu lịch sử</p>
                                                    </TableCell>
                                                </TableRow>
                                            )}
                                        </TableBody>
                                    </Table>
                                    {historyContacts.length > 0 && (
                                        <div className="px-4 py-3 border-t border-gray-100 flex items-center justify-between">
                                            <span className="text-sm text-gray-500">
                                                {Math.min((historyPage - 1) * ROWS_PER_PAGE + 1, historyContacts.length)}–{Math.min(historyPage * ROWS_PER_PAGE, historyContacts.length)} / {historyContacts.length} liên hệ
                                            </span>
                                            {historyTotalPages > 1 && (
                                                <SimplePagination current={historyPage} total={historyTotalPages} onChange={setHistoryPage} />
                                            )}
                                        </div>
                                    )}
                                </div>
                            </TabsContent>
                        </Tabs>
                    </div>
                </div>
            </div>

            {selectedContact && (
                <ContactDetailModal
                    item={selectedContact}
                    onClose={() => setSelectedContact(null)}
                    onStatusUpdate={handleStatusUpdate}
                    onReply={handleReply}
                    onDelete={handleDelete}
                />
            )}

            {toasts.map(toast => (
                <Toast
                    key={toast.id}
                    message={toast.message}
                    type={toast.type}
                    onClose={() => removeToast(toast.id)}
                />
            ))}
        </div>
    );
}
