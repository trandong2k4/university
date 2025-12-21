import React, { useState, useEffect } from "react";
import { useAuth } from "/src/context/AuthContext.jsx";
import "../../styles/public/blogGuide.css";
import apiClient from "/src/api/apiClient";

const BlogGuide = () => {
    const { isAuthenticated, user } = useAuth();

    const [posts, setPosts] = useState([]);
    const [selectedTypes, setSelectedTypes] = useState([]);
    const [search, setSearch] = useState("");
    const [authorFilter, setAuthorFilter] = useState("");
    const [fromDate, setFromDate] = useState("");
    const [toDate, setToDate] = useState("");
    const [loading, setLoading] = useState(true);

    // Hiển thị ban đầu 6 bài
    const [visibleCount, setVisibleCount] = useState(6);

    const postTypes = ["THONG_BAO", "HUONG_DAN", "TAI_LIEU", "CANH_BAO"];

    useEffect(() => {
        apiClient
            .get("/posts")
            .then((res) => {
                setPosts(res.data || []);
            })
            .catch((err) => {
                console.error("Lỗi tải bài viết:", err);
            })
            .finally(() => {
                setLoading(false);
            });
    }, []);

    const filteredPosts = posts.filter((post) => {
        const matchType =
            selectedTypes.length === 0 || selectedTypes.includes(post.loaiBaiViet);

        const matchSearch =
            !search ||
            post.tieuDe?.toLowerCase().includes(search.toLowerCase()) ||
            post.noiDung?.toLowerCase().includes(search.toLowerCase());

        const matchAuthor =
            !authorFilter ||
            post.tenNguoiDang?.toLowerCase().includes(authorFilter.toLowerCase());

        const postDate = new Date(post.ngayDang);
        const matchFrom = !fromDate || postDate >= new Date(fromDate);
        const matchTo = !toDate || postDate <= new Date(toDate + "T23:59:59");

        const isPrivate = String(post.trangThai || "").toUpperCase() === "RIENG_TU";
        const isAdmin = user?.role === "ADMIN" || user?.role === "STUDENT" || user?.role === "TEACHER";
        const canViewPrivate = isAuthenticated || isAdmin;

        return (
            matchType &&
            matchSearch &&
            matchAuthor &&
            matchFrom &&
            matchTo &&
            (!isPrivate || canViewPrivate)
        );
    });

    return (
        <div className="blog-container">

            {/* Banner */}
            <section className="blog-banner">
                <h1>Bài viết & Tin tức</h1>
                <p>Cập nhật thông báo, hướng dẫn và tài liệu mới nhất từ nhà trường.</p>
            </section>

            {/* Bộ lọc */}
            <section className="blog-filter">
                <div className="search-box">
                    <input
                        type="text"
                        placeholder="Tìm kiếm bài viết..."
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                    />
                </div>

                <div className="filter-group">
                    <div className="filter-types">
                        {postTypes.map((type) => (
                            <label key={type} className="checkbox-label">
                                <input
                                    type="checkbox"
                                    value={type}
                                    checked={selectedTypes.includes(type)}
                                    onChange={(e) => {
                                        const val = e.target.value;
                                        setSelectedTypes((prev) =>
                                            prev.includes(val)
                                                ? prev.filter((t) => t !== val)
                                                : [...prev, val]
                                        );
                                    }}
                                />
                                <span className="checkmark"></span>
                                {type}
                            </label>
                        ))}
                    </div>

                    <div className="filter-advanced">
                        <input
                            type="text"
                            placeholder="Người đăng..."
                            value={authorFilter}
                            onChange={(e) => setAuthorFilter(e.target.value)}
                        />

                        <div className="date-filter">
                            <input
                                type="date"
                                value={fromDate}
                                onChange={(e) => setFromDate(e.target.value)}
                            />
                            <input
                                type="date"
                                value={toDate}
                                onChange={(e) => setToDate(e.target.value)}
                            />
                        </div>
                    </div>
                </div>
            </section>

            {/* Danh sách bài viết */}
            {loading ? (
                <p className="loading">Đang tải bài viết...</p>
            ) : filteredPosts.length > 0 ? (
                <section className="blog-list">
                    {filteredPosts.slice(0, visibleCount).map((post) => (
                        <article key={post.id} className="news-card" data-category={post.loaiBaiViet}>
                            {post.hinhAnhUrl && (
                                <img src={post.hinhAnhUrl} alt={post.tieuDe} loading="lazy" />
                            )}

                            <div className="news-content">
                                <div className="news-meta">
                                    <span>{new Date(post.ngayDang).toLocaleDateString("vi-VN")}</span>

                                    {post.trangThai?.toUpperCase() === "RIENG_TU" && (
                                        <span className="badge private">Riêng tư</span>
                                    )}
                                </div>

                                <h3>{post.tieuDe}</h3>
                                <p className="news-excerpt">{post.noiDung}</p>

                                <div className="news-footer">
                                    <span>Người đăng: <strong>Admin:**_*{post.tenNguoiDang}**</strong></span>
                                    {post.fileDinhKemUrl && (
                                        <a href={post.fileDinhKemUrl} target="_blank" rel="noreferrer">
                                            Tải tài liệu
                                        </a>
                                    )}
                                </div>
                            </div>
                        </article>
                    ))}
                </section>
            ) : (
                <p className="no-results">Không tìm thấy bài viết nào phù hợp.</p>
            )}

            {/* Xem thêm */}
            {visibleCount < filteredPosts.length && (
                <div className="blog-loadmore">
                    <button onClick={() => setVisibleCount((prev) => prev + 6)}>
                        Xem thêm bài viết
                    </button>
                </div>
            )}
        </div>
    );
};

export default BlogGuide;
