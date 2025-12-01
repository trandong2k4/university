

import { useState, useEffect } from "react";
import { Bell, X, Clock, ChevronRight } from "lucide-react";
import { format } from "date-fns";
import { vi } from "date-fns/locale";
import apiClient from "/src/api/apiClient";
import "../styles/components/notification.css"

export default function NotificationFloating({ userRole }) {
    const path = userRole?.toLowerCase();
    const [isOpen, setIsOpen] = useState(false);
    const [notifications, setNotifications] = useState([]);
    const [loading, setLoading] = useState(false);

    const fetchNoti = async () => {
        try {
            setLoading(true);
            const res = await apiClient.get("/posts");
            const filtered = (res.data || [])
                .filter(p => p.loaiBaiViet === "THONG_BAO" && p.trangThai === "CONG_KHAI")
                .sort((a, b) => new Date(b.ngayDang) - new Date(a.ngayDang))
                .slice(0, 8); // Tối đa 8 cái
            setNotifications(filtered);
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    const toggleChat = () => setIsOpen(!isOpen);

    useEffect(() => {
        fetchNoti();
        const interval = setInterval(fetchNoti, 3 * 60 * 1000); // Refresh mỗi 3 phút
        return () => clearInterval(interval);
    }, []);

    const formatTime = (dateStr) => {
        const date = new Date(dateStr);
        const now = new Date();
        const diff = now - date;
        const minutes = Math.floor(diff / 60000);
        if (minutes < 1) return "Vừa xong";
        if (minutes < 60) return `${minutes} phút trước`;
        if (minutes < 1440) return `${Math.floor(minutes / 60)} giờ trước`;
        return format(date, "dd/MM", { locale: vi });
    };

    return (
        <div className="noti-container">
            {/* Nút nổi */}
            <button title="Thông báo" onClick={() => setIsOpen(!isOpen)} className="noti-toggle">
                <Bell size={24} />
                {notifications.length > 0 && (
                    <span className="noti-badge">
                        {notifications.length > 9 ? "9+" : notifications.length}
                    </span>
                )}
            </button>

            {/* Popup nhỏ gọn */}
            {isOpen && (
                <>
                    <div className="noti-overlay" onClick={() => setIsOpen(false)} />
                    <div className="noti-panel">
                        <div className="noti-header">
                            <h3>Thông báo</h3>
                            <button onClick={() => setIsOpen(false)} className="noti-close">
                                <X size={18} />Đóng
                            </button>
                        </div>

                        <div className="noti-body">
                            {loading ? (
                                <div className="noti-loading">Đang tải...</div>
                            ) : notifications.length === 0 ? (
                                <div className="noti-empty">Chưa có thông báo mới</div>
                            ) : (
                                notifications.slice(0, 3).map((n) => (
                                    <div
                                        key={n.id}
                                        className="noti-item"
                                        onClick={() => {
                                            window.location.href = `/${path}/notifications/${n.id}`;
                                        }}
                                    >
                                        <div className="noti-icon">
                                            {n.hinhAnhUrl ? (
                                                <img src={n.hinhAnhUrl} alt="" />
                                            ) : (
                                                <div className="noti-icon-placeholder" />
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

                        {notifications.length > 3 && (
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