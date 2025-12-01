import React, { useState, useEffect } from 'react';
import { Bell, AlertCircle, Calendar, FileText, Image, Clock } from 'lucide-react';
import { format } from 'date-fns';
import { vi } from 'date-fns/locale';
import apiClient from "/src/api/apiClient";

const NotificationDropdown = () => {
    const [posts, setPosts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [isOpen, setIsOpen] = useState(false);

    useEffect(() => {
        const fetchNotifications = async () => {
            try {
                setLoading(true);
                setError(null);

                const res = await apiClient.get("/posts");
                const allPosts = res.data || [];

                // Lọc chỉ lấy THONG_BAO + CONG_KHAI, sắp xếp mới nhất trước
                const notifications = allPosts
                    .filter(post =>
                        post.loaiBaiViet === 'THONG_BAO' &&
                        post.trangThai === 'CONG_KHAI'
                    )
                    .sort((a, b) => new Date(b.ngayDang) - new Date(a.ngayDang))
                    .slice(0, 2); // Chỉ lấy 2 cái mới nhất

                setPosts(notifications);
            } catch (err) {
                console.error("Lỗi tải thông báo:", err);
                setError("Không thể tải thông báo");
            } finally {
                setLoading(false);
            }
        };

        fetchNotifications();
        // Optional: Tự động refresh mỗi 5 phút
        // const interval = setInterval(fetchNotifications, 5 * 60 * 1000);
        // return () => clearInterval(interval);
    }, []);

    const getTimeAgo = (dateString) => {
        const date = new Date(dateString);
        const now = new Date();
        const diffInMinutes = Math.floor((now - date) / (1000 * 60));

        if (diffInMinutes < 1) return "Vừa xong";
        if (diffInMinutes < 60) return `${diffInMinutes} phút trước`;
        if (diffInMinutes < 1440) return `${Math.floor(diffInMinutes / 60)} giờ trước`;
        return format(date, 'dd/MM/yyyy', { locale: vi });
    };

    return (
        <div className="relative">
            {/* Icon chuông */}
            <button
                onClick={() => setIsOpen(!isOpen)}
                className="relative p-2 text-gray-600 hover:text-blue-600 hover:bg-gray-100 rounded-full transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-blue-500"
                aria-label="Thông báo"
            >
                <Bell size={24} />
                {/* Badge số lượng thông báo mới (nếu cần mở rộng sau) */}
                {posts.length > 0 && (
                    <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center animate-pulse">
                        {posts.length > 99 ? '99+' : posts.length}
                    </span>
                )}
            </button>

            {/* Dropdown */}
            {isOpen && (
                <>
                    {/* Overlay */}
                    <div
                        className="fixed inset-0 z-40"
                        onClick={() => setIsOpen(false)}
                    />

                    {/* Dropdown Box */}
                    <div className="absolute right-0 mt-2 w-96 bg-white rounded-xl shadow-xl border border-gray-200 z-50 overflow-hidden animate-in fade-in slide-in-from-top-2 duration-200">
                        {/* Header */}
                        <div className="px-5 py-4 bg-gradient-to-r from-blue-600 to-blue-700 text-white">
                            <h3 className="text-lg font-semibold flex items-center gap-2">
                                <AlertCircle size={20} />
                                Thông báo mới
                            </h3>
                        </div>

                        {/* Body */}
                        <div className="max-h-96 overflow-y-auto">
                            {loading && (
                                <div className="p-8 text-center">
                                    <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                                    <p className="mt-3 text-gray-500">Đang tải thông báo...</p>
                                </div>
                            )}

                            {error && (
                                <div className="p-6 text-center text-red-600">
                                    <AlertCircle size={40} className="mx-auto mb-2" />
                                    <p>{error}</p>
                                </div>
                            )}

                            {!loading && !error && posts.length === 0 && (
                                <div className="p-8 text-center text-gray-500">
                                    <Bell size={48} className="mx-auto mb-3 opacity-30" />
                                    <p>Chưa có thông báo nào</p>
                                </div>
                            )}

                            {!loading && posts.map((post) => (
                                <div
                                    key={post.id}
                                    className="px-5 py-4 border-b border-gray-100 hover:bg-gray-50 transition-colors cursor-pointer"
                                    onClick={() => {
                                        // Có thể mở modal chi tiết hoặc điều hướng
                                        console.log("Xem chi tiết bài viết:", post.id);
                                        setIsOpen(false);
                                    }}
                                >
                                    <div className="flex gap-3">
                                        {/* Icon loại bài */}
                                        <div className="flex-shrink-0">
                                            {post.hinhAnhUrl ? (
                                                <img
                                                    src={post.hinhAnhUrl}
                                                    alt="thumb"
                                                    className="w-12 h-12 rounded-lg object-cover"
                                                />
                                            ) : (
                                                <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                                                    <FileText className="text-blue-600" size={24} />
                                                </div>
                                            )}
                                        </div>

                                        <div className="flex-1 min-w-0">
                                            <h4 className="font-medium text-gray-900 line-clamp-2">
                                                {post.tieuDe}
                                            </h4>
                                            <p className="text-sm text-gray-600 mt-1 line-clamp-2">
                                                {post.noiDung?.replace(/<[^>]*>/g, '').substring(0, 100)}...
                                            </p>

                                            <div className="flex items-center gap-4 mt-2 text-xs text-gray-500">
                                                <span className="flex items-center gap-1">
                                                    <Calendar size={14} />
                                                    {format(new Date(post.ngayDang), 'dd/MM/yyyy', { locale: vi })}
                                                </span>
                                                <span className="flex items-center gap-1">
                                                    <Clock size={14} />
                                                    {getTimeAgo(post.ngayDang)}
                                                </span>
                                            </div>

                                            {post.tacGia && (
                                                <p className="text-xs text-gray-400 mt-1">
                                                    Bởi: {post.tacGia}
                                                </p>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>

                        {/* Footer */}
                        {posts.length > 0 && (
                            <div className="px-5 py-3 bg-gray-50 border-t border-gray-200 text-center">
                                <button
                                    onClick={() => {
                                        // Điều hướng đến trang danh sách thông báo
                                        window.location.href = '/notifications';
                                    }}
                                    className="text-sm font-medium text-blue-600 hover:text-blue-700"
                                >
                                    Xem tất cả thông báo →
                                </button>
                            </div>
                        )}
                    </div>
                </>
            )}
        </div>
    );
};

export default NotificationDropdown;