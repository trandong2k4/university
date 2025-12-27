// src/components/NotificationFloating.jsx
import { useState, useEffect } from "react";
import { Bell, X, Clock, ChevronRight } from "lucide-react";
import { format, formatDistanceToNow } from "date-fns";
import { vi } from "date-fns/locale";
import apiClient from "/src/api/apiClient";
import "../styles/components/notification.css";

export default function NotificationFloating({ userRole }) {
    const path = userRole?.toLowerCase();
    const [isOpen, setIsOpen] = useState(false);
    const [notifications, setNotifications] = useState([]);
    const [loading, setLoading] = useState(false);

    const fetchNotifications = async () => {
        try {
            setLoading(true);
            const res = await apiClient.get("/posts");
            const filtered = (res.data || [])
                .filter(p => p.loaiBaiViet === "THONG_BAO" && p.trangThai === "CONG_KHAI")
                .sort((a, b) => new Date(b.ngayDang) - new Date(a.ngayDang))
                .slice(0, 10);
            setNotifications(filtered);
        } catch (err) {
            console.error("Lỗi tải thông báo:", err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchNotifications();
        const interval = setInterval(fetchNotifications, 3 * 60 * 1000); // 3 phút/lần
        return () => clearInterval(interval);
    }, []);

    const formatTime = (dateStr) => {
        if (!dateStr) return "Vừa xong";
        try {
            return formatDistanceToNow(new Date(dateStr), {
                addSuffix: true,
                locale: vi,
            });
        } catch {
            return "Không xác định";
        }
    };

    return (
        <div className="noti-container">
            {/* Nút chuông nổi */}
            <button
                onClick={() => setIsOpen(!isOpen)}
                className="noti-toggle"
                title="Thông báo"
            >
                <Bell size={24} strokeWidth={2} />
                {notifications.length > 0 && (
                    <span className="noti-badge">
                        {notifications.length > 9 ? "9+" : notifications.length}
                    </span>
                )}
            </button>

            {/* Panel thông báo */}
            {isOpen && (
                <>
                    <div className="noti-overlay" onClick={() => setIsOpen(false)} />
                    <div className="noti-panel">
                        <div className="noti-header">
                            <h3>Thông báo mới</h3>
                            <button onClick={() => setIsOpen(false)} className="noti-close">
                                <X size={18} />
                            </button>
                        </div>

                        <div className="noti-body">
                            {loading ? (
                                <div className="noti-loading">Đang tải...</div>
                            ) : notifications.length === 0 ? (
                                <div className="noti-empty">Chưa có thông báo nào</div>
                            ) : (
                                notifications.slice(0, 5).map((n) => (
                                    <div
                                        key={n.id}
                                        className="noti-item"
                                        onClick={() => {
                                            window.location.href = `/${path}/notifications`;// /${n.id}
                                            setIsOpen(false);
                                        }}
                                    >
                                        <div className="noti-avatar">
                                            {n.hinhAnhUrl ? (
                                                <img src={n.hinhAnhUrl} alt="thumb" />
                                            ) : (
                                                <div className="noti-avatar-placeholder" />
                                            )}
                                        </div>
                                        <div className="noti-content">
                                            <div className="noti-title">{n.tieuDe}</div>
                                            <div className="noti-time">
                                                <Clock size={12} />
                                                {formatTime(n.ngayDang)}
                                            </div>
                                        </div>
                                        <ChevronRight size={16} className="text-gray-400" />
                                    </div>
                                ))
                            )}
                        </div>

                        {notifications.length > 5 && (
                            <div className="noti-footer">
                                <button
                                    onClick={() => {
                                        window.location.href = `/${path}/notifications`;
                                        setIsOpen(false);
                                    }}
                                    className="noti-viewall"
                                >
                                    Xem tất cả ({notifications.length})
                                </button>
                            </div>
                        )}
                    </div>
                </>
            )}
        </div>
    );
}