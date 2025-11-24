import React, { useState, useEffect } from "react";
import { useAuth } from "/src/context/AuthContext.jsx";
import "../../styles/public/blogGuide.css";

const BlogGuide = () => {
    const { isLoggedIn } = useAuth();
    const [posts, setPosts] = useState([]);
    const [selectedTypes, setSelectedTypes] = useState([]);
    const [search, setSearch] = useState("");
    const [authorFilter, setAuthorFilter] = useState("");
    const [fromDate, setFromDate] = useState("");
    const [toDate, setToDate] = useState("");
    const [loading, setLoading] = useState(true);

    const postTypes = ["Thông báo", "Hướng dẫn", "Tài liệu"];

    useEffect(() => {
        fetch("http://localhost:8080/posts")
            .then((res) => res.json())
            .then((data) => {
                setPosts(data);
                setLoading(false);
            })
            .catch((err) => {
                console.error("Lỗi fetch baiviets:", err);
                setLoading(false);
            });
    }, []);

    const filteredPosts = posts.filter((post) => {
        const matchLoai =
            selectedTypes.length === 0 || selectedTypes.includes(post.loaiBaiViet);

        const matchSearch =
            post.tieuDe?.toLowerCase().includes(search.toLowerCase()) ||
            post.noiDung?.toLowerCase().includes(search.toLowerCase());

        const matchAuthor =
            authorFilter === "" || post.tenNguoiDang?.toLowerCase().includes(authorFilter.toLowerCase());

        const postDate = new Date(post.ngayDang);
        const matchFromDate = fromDate === "" || postDate >= new Date(fromDate);
        const matchToDate = toDate === "" || postDate <= new Date(toDate);

        const isPrivate = post.trangThai?.toLowerCase() === "riêng tư";
        const canView = !isPrivate || isLoggedIn;

        return matchLoai && matchSearch && matchAuthor && matchFromDate && matchToDate && canView;
    });

    return (
        <div className="blog-container">
            {/* Banner */}
            <section className="blog-banner">
                <h1>Bài viết & Tin tức</h1>
                <p>Cập nhật các thông tin học tập, sự kiện và thông báo mới nhất.</p>
            </section>

            {/* Filter */}
            <section className="blog-filter">
                <div className="search-box">
                    <input
                        type="text"
                        placeholder="Tìm kiếm bài viết..."
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                    />
                    <span className="icon">🔍</span>
                </div>

                <div className="filter-group">
                    {/* Lọc theo loại */}
                    <div className="filter-types">
                        {postTypes.map((type) => (
                            <label key={type}>
                                <input
                                    type="checkbox"
                                    value={type}
                                    checked={selectedTypes.includes(type)}
                                    onChange={(e) => {
                                        const value = e.target.value;
                                        setSelectedTypes((prev) =>
                                            prev.includes(value)
                                                ? prev.filter((t) => t !== value)
                                                : [...prev, value]
                                        );
                                    }}
                                />
                                {type}
                            </label>
                        ))}
                    </div>

                    {/* Lọc nâng cao */}
                    <div className="filter-advanced">
                        <input
                            type="text"
                            placeholder="Người đăng..."
                            value={authorFilter}
                            onChange={(e) => setAuthorFilter(e.target.value)}
                        />

                        <div className="date-filter">
                            <label>
                                Từ ngày:
                                <input
                                    type="date"
                                    value={fromDate}
                                    onChange={(e) => setFromDate(e.target.value)}
                                />
                            </label>
                            <label>
                                Đến ngày:
                                <input
                                    type="date"
                                    value={toDate}
                                    onChange={(e) => setToDate(e.target.value)}
                                />
                            </label>
                        </div>
                    </div>
                </div>
            </section>

            {/* Loading + List */}
            {loading ? (
                <p className="loading">⏳ Đang tải dữ liệu...</p>
            ) : (
                <section className="blog-list">
                    {filteredPosts.length > 0 ? (
                        filteredPosts.map((post) => (
                            <div key={post.id} className="news-card" data-category={post.loaiBaiViet}>
                                {post.hinhAnhUrl && (
                                    <img src={post.hinhAnhUrl} alt={post.tieuDe} />
                                )}
                                <div className="news-content">
                                    <span>📅 {post.ngayDang}</span>
                                    <h4>{post.tieuDe}</h4>
                                    <p>{post.noiDung}</p>
                                    <p>
                                        👤 {post.tacGia} | Người đăng: <b>{post.tenNguoiDang}</b>
                                    </p>
                                    <p>📌 Trạng thái: {post.trangThai}</p>
                                    {post.fileDinhKemUrl && (
                                        <a href={post.fileDinhKemUrl} target="_blank" rel="noreferrer">
                                            📎 Tệp đính kèm
                                        </a>
                                    )}
                                </div>
                            </div>
                        ))
                    ) : (
                        <p className="no-results">⚠️ Không tìm thấy kết quả phù hợp.</p>
                    )}
                </section>
            )}

            {/* Load more */}
            <div className="blog-loadmore">
                <button>➕ Xem thêm</button>
            </div>
        </div>
    );
};

export default BlogGuide;
