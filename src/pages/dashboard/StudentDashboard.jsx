import React, { useEffect, useMemo, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import "../../styles/dashboard/studentDashboard.css";
import apiClient from "/src/api/apiClient";
import { useAuth } from "../../context/AuthContext";

export default function StudentDashboard() {
    const { user } = useAuth();
    const role = user?.role;
    const path = role?.toLowerCase();

    const navigate = useNavigate();
    const [q, setQ] = useState("");

    // State dữ liệu thật từ backend
    const [majors, setMajors] = useState([]);     // ngành học
    const [courses, setCourses] = useState([]);   // môn học
    const [posts, setPosts] = useState([]);       // bài viết / thông báo
    const [loading, setLoading] = useState(true); // trạng thái loading

    // Gọi API khi component mount
    useEffect(() => {
        const fetchData = async () => {
            try {
                setLoading(true);

                const [majorsRes, coursesRes, postsRes] = await Promise.all([
                    apiClient.get("/majors"),
                    apiClient.get("/subjects"),
                    apiClient.get("/posts") // API trả về danh sách bài viết
                ]);

                setMajors(majorsRes.data || []);
                setCourses(coursesRes.data || []);
                setPosts(postsRes.data || []);
            } catch (error) {
                console.error("Lỗi khi tải dữ liệu dashboard:", error);
                // Có thể thêm thông báo toast ở đây
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, []);

    // KPI tổng quan
    const kpis = useMemo(
        () => [
            { label: "Ngành học", value: majors.length },
            { label: "Môn học", value: courses.length },
            { label: "Bài viết & Thông báo", value: posts.length },
        ],
        [majors.length, courses.length, posts.length]
    );

    // Xử lý tìm kiếm
    const onSearch = (e) => {
        e.preventDefault();
        const searchTerm = q.trim();
        navigate(searchTerm ? `/majors?q=${encodeURIComponent(searchTerm)}` : `/${path}/majors`);
    };

    // Format ngày đẹp hơn
    const formatDate = (dateString) => {
        if (!dateString) return "Chưa xác định";
        return new Date(dateString).toLocaleDateString("vi-VN", {
            day: "2-digit",
            month: "2-digit",
            year: "numeric",
        });
    };

    // Lọc bài viết công khai và sắp xếp mới nhất trước
    const publicPosts = posts
        .filter(post => post.trangThai === "CONG_KHAI")
        .sort((a, b) => new Date(b.ngayDang) - new Date(a.ngayDang))
        .slice(0, 6); // chỉ lấy 6 bài mới nhất

    return (
        <div className="dashboard-container">
            {/* Header / Search */}
            <section className="dashboard-learning">
                <h1 className="dashboard-title">Learning Hub - Trang chủ</h1>
                <p className="dashboard-subtitle">Nền tảng quản lý đào tạo thông minh tích hợp AI</p>

                <form onSubmit={onSearch} className="dashboard-search">
                    <input
                        className="dashboard-search-input"
                        placeholder="Tìm kiếm ngành học, môn học, thông báo..."
                        value={q}
                        onChange={(e) => setQ(e.target.value)}
                    />
                    <button type="submit" className="dashboard-search-btn">Tìm kiếm</button>
                </form>

                <div className="dashboard-links">
                    <Link to={`/${path}/blog`}>Tất cả bài viết</Link>
                    <Link to={`/${path}/chatbot`}>Chatbot AI tư vấn</Link>
                </div>
            </section>

            {/* Loading state */}
            {loading && (
                <div className="dashboard-loading">
                    <p>Đang tải dữ liệu...</p>
                </div>
            )}

            {/* KPI Cards */}
            {!loading && (
                <section className="dashboard-kpis">
                    <h2 className="dashboard-section-title">Tổng quan hệ thống</h2>
                    <div className="dashboard-kpi-list">
                        {kpis.map((kpi) => (
                            <div key={kpi.label} className="dashboard-kpi-card">
                                <div className="dashboard-kpi-label">{kpi.label}</div>
                                <div className="dashboard-kpi-value">{kpi.value}</div>
                            </div>
                        ))}
                    </div>
                </section>
            )}

            {/* Ngành học nổi bật */}
            <section className="dashboard-majors">
                <h2 className="dashboard-section-title">Ngành học nổi bật</h2>
                {majors.length === 0 && !loading ? (
                    <p>Chưa có ngành học nào.</p>
                ) : (
                    <div className="dashboard-majors-list">
                        {majors.slice(0, 6).map((major) => (
                            <Link
                                key={major.id}
                                to={`/${path}/nganh`}//${major.id}
                                className="dashboard-major-item"
                            >
                                <div className="dashboard-major-name">{major.tenNganh}</div>
                                <div className="dashboard-major-code">Mã ngành: {major.maNganh}</div>
                                <p className="dashboard-major-desc">
                                    {major.moTa || "Chưa có mô tả"}
                                </p>
                            </Link>
                        ))}
                    </div>
                )}
            </section>

            {/* Tin tức & Thông báo từ API */}
            <section className="dashboard-news">
                <div className="dashboard-section-header">
                    <h2 className="dashboard-section-title">Thông báo mới nhất</h2>
                    {publicPosts.length > 0 && (
                        <Link to={`/${path}/notifications`} className="dashboard-view-all">
                            Xem tất cả
                        </Link>
                    )}
                </div>

                {loading ? (
                    <p>Đang tải thông báo...</p>
                ) : publicPosts.length === 0 ? (
                    <p>Chưa có thông báo công khai nào.</p>
                ) : (
                    <div className="dashboard-news-list">
                        {publicPosts.map((post) => (
                            <Link
                                key={post.id}
                                to={`/${path}/notifications`}// /${post.id}
                                className="dashboard-news-item"
                            >
                                <div className="dashboard-news-header">
                                    <h3 className="dashboard-news-title">{post.tieuDe}</h3>
                                    <span className="dashboard-news-date">
                                        {formatDate(post.ngayDang)}
                                    </span>
                                </div>
                                <p className="dashboard-news-excerpt">
                                    {post.noiDung?.length > 120
                                        ? post.noiDung.substring(0, 120) + "..."
                                        : post.noiDung || "Xem chi tiết"}
                                </p>
                                <div className="dashboard-news-author">
                                    {post.tacGia || "Phòng Đào tạo"}
                                </div>
                            </Link>
                        ))}
                    </div>
                )}
            </section>
        </div>
    );
}