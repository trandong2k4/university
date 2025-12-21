import React, { useState, useEffect, useMemo } from "react";
import { useAuth } from "/src/context/AuthContext.jsx";
import apiClient from "/src/api/apiClient";
import "../../styles/public/blogGuide.css";
import "../../styles/student/blogStudent.css";

// Helper map để hiển thị Label và Màu sắc đẹp hơn
const POST_TYPE_CONFIG = {
    THONG_BAO: { label: "Thông báo", color: "blue", icon: "📢" },
    HUONG_DAN: { label: "Hướng dẫn", color: "green", icon: "🧑‍🏫" },
    TAI_LIEU: { label: "Tài liệu", color: "orange", icon: "📂" },
    CANH_BAO: { label: "Cảnh báo", color: "red", icon: "⚠️" },
};

const BlogStudent = () => {
    const { isAuthenticated, user } = useAuth();

    // State dữ liệu
    const [posts, setPosts] = useState([]);
    const [loading, setLoading] = useState(true);

    // State bộ lọc
    const [selectedType, setSelectedType] = useState("ALL"); // Chỉ chọn 1 loại hoặc tất cả cho đơn giản
    const [search, setSearch] = useState("");
    const [dateRange, setDateRange] = useState({ from: "", to: "" });

    // State phân trang (Load more)
    const [visibleCount, setVisibleCount] = useState(6);

    // 1. Fetch Data
    useEffect(() => {
        setLoading(true);
        apiClient
            .get("/posts")
            .then((res) => setPosts(res.data || []))
            .catch((err) => console.error("Lỗi tải bài viết:", err))
            .finally(() => setLoading(false));
    }, []);

    // 2. Logic lọc (Sử dụng useMemo để tối ưu hiệu năng khi render lại)
    const filteredPosts = useMemo(() => {
        return posts.filter((post) => {
            // Lọc theo loại (Tab)
            const matchType = selectedType === "ALL" || post.loaiBaiViet === selectedType;

            // Lọc theo từ khóa (Tiêu đề hoặc nội dung)
            const keyword = search.toLowerCase();
            const matchSearch =
                !search ||
                post.tieuDe?.toLowerCase().includes(keyword) ||
                post.noiDung?.toLowerCase().includes(keyword);

            // Lọc theo ngày
            const postDate = new Date(post.ngayDang);
            const matchFrom = !dateRange.from || postDate >= new Date(dateRange.from);
            const matchTo = !dateRange.to || postDate <= new Date(dateRange.to + "T23:59:59");

            // Lọc quyền riêng tư (Logic giữ nguyên từ code cũ)
            const isPrivate = String(post.trangThai || "").toUpperCase() === "RIENG_TU";
            const isAdminOrTeacher = ["ADMIN", "TEACHER"].includes(user?.role);
            // Sinh viên chỉ xem được nếu không phải riêng tư, hoặc nếu đã login (tùy nghiệp vụ trường bạn)
            // Ở đây giả sử: Riêng tư chỉ Admin/Teacher thấy, hoặc User đã login mới thấy
            const canView = !isPrivate || isAuthenticated || isAdminOrTeacher;

            return matchType && matchSearch && matchFrom && matchTo && canView;
        });
    }, [posts, selectedType, search, dateRange, isAuthenticated, user]);

    // Xử lý sự kiện thay đổi ngày
    const handleDateChange = (e) => {
        const { name, value } = e.target;
        setDateRange(prev => ({ ...prev, [name]: value }));
    };

    return (
        <div className="blog-page">
            {/* --- Banner --- */}
            <div className="blog-header">
                <div className="header-content">
                    <h1>Tin tức & Sự kiện</h1>
                    <p>Cập nhật những thông tin mới nhất dành cho sinh viên</p>
                </div>
            </div>

            {/* --- Toolbar: Tìm kiếm & Filter --- */}
            <div className="blog-toolbar">
                <div className="toolbar-top">
                    {/* Tabs chọn loại bài viết nhanh */}
                    <div className="category-tabs">
                        <button
                            className={`tab-btn ${selectedType === "ALL" ? "active" : ""}`}
                            onClick={() => setSelectedType("ALL")}
                        >
                            Tất cả
                        </button>
                        {Object.keys(POST_TYPE_CONFIG).map(type => (
                            <button
                                key={type}
                                className={`tab-btn ${selectedType === type ? "active" : ""}`}
                                onClick={() => setSelectedType(type)}
                            >
                                {POST_TYPE_CONFIG[type].icon} {POST_TYPE_CONFIG[type].label}
                            </button>
                        ))}
                    </div>

                    {/* Search Box */}
                    <div className="search-wrapper">
                        <input
                            type="text"
                            placeholder="Tìm kiếm thông báo..."
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                        />
                        <i className="search-icon">🔍</i>
                    </div>
                </div>

                {/* Filter Ngày (Advanced) */}
                <div className="toolbar-bottom">
                    <div className="date-inputs">
                        <label>Từ ngày:
                            <input type="date" name="from" value={dateRange.from} onChange={handleDateChange} />
                        </label>
                        <label>Đến ngày:
                            <input type="date" name="to" value={dateRange.to} onChange={handleDateChange} />
                        </label>
                    </div>
                </div>
            </div>

            {/* --- Danh sách bài viết (Grid Layout) --- */}
            <div className="blog-grid-container">
                {loading ? (
                    <div className="loading-state">Đang tải dữ liệu...</div>
                ) : filteredPosts.length > 0 ? (
                    <div className="blog-grid">
                        {filteredPosts.slice(0, visibleCount).map((post) => {
                            const config = POST_TYPE_CONFIG[post.loaiBaiViet] || { label: "Khác", color: "gray" };

                            return (
                                <article key={post.id} className="blog-card">
                                    {/* Badge loại bài viết */}
                                    <div className={`card-badge badge-${config.color}`}>
                                        {config.label}
                                    </div>

                                    {/* Ảnh thumbnail (nếu không có dùng placeholder màu) */}
                                    <div className="card-thumb" style={{
                                        backgroundImage: `url(${post.hinhAnhUrl || 'https://via.placeholder.com/400x200?text=DTU+News'})`
                                    }}></div>

                                    <div className="card-body">
                                        <div className="card-meta">
                                            <span>📅 {new Date(post.ngayDang).toLocaleDateString("vi-VN")}</span>
                                            <span>👤 {post.tenNguoiDang || "Nhà trường"}</span>
                                        </div>

                                        <h3 className="card-title" title={post.tieuDe}>
                                            {post.tieuDe}
                                        </h3>

                                        <p className="card-excerpt">
                                            {post.noiDung?.length > 100
                                                ? post.noiDung.substring(0, 100) + "..."
                                                : post.noiDung}
                                        </p>

                                        {/* Footer Card */}
                                        <div className="card-footer">
                                            {post.fileDinhKemUrl && (
                                                <a href={post.fileDinhKemUrl} target="_blank" rel="noreferrer" className="btn-download">
                                                    📥 Tải tài liệu
                                                </a>
                                            )}
                                            {post.trangThai === "RIENG_TU" && <span className="private-tag">🔒 Nội bộ</span>}
                                        </div>
                                    </div>
                                </article>
                            );
                        })}
                    </div>
                ) : (
                    <div className="empty-state">
                        <p>🚫 Không tìm thấy bài viết nào phù hợp.</p>
                    </div>
                )}

                {/* Nút Xem thêm */}
                {visibleCount < filteredPosts.length && (
                    <div className="load-more-wrapper">
                        <button className="btn-load-more" onClick={() => setVisibleCount(prev => prev + 6)}>
                            Xem thêm tin cũ hơn
                        </button>
                    </div>
                )}
            </div>
        </div>
    );
};

export default BlogStudent;