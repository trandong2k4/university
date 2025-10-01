// BlogGuide.jsx
import React, { useState } from "react";
import "../../styles/public/blogGuide.css";

const BlogGuide = () => {
    // Dữ liệu tin tức mẫu
    const newsData = [
        {
            id: 1,
            category: "academic",
            date: "28/08/2025",
            title: "Kỳ học mới và những điều cần biết",
            content:
                "Thông báo về kế hoạch học tập, các mốc thời gian quan trọng và quy định mới trong kỳ học sắp tới.",
            image: "https://placehold.co/600x400/3B82F6/ffffff?text=Học+thuật",
        },
        {
            id: 2,
            category: "events",
            date: "27/08/2025",
            title: "Cuộc thi lập trình Code-A-Thon 2025",
            content:
                "Mời các bạn sinh viên tham gia cuộc thi lập trình thường niên với giải thưởng hấp dẫn. Đăng ký ngay!",
            image: "https://placehold.co/600x400/9CA3AF/ffffff?text=Sự+kiện",
        },
        {
            id: 3,
            category: "announcements",
            date: "26/08/2025",
            title: "Thông báo lịch bảo vệ đồ án tốt nghiệp",
            content:
                "Danh sách sinh viên, thời gian và địa điểm bảo vệ đồ án tốt nghiệp đã được công bố chính thức.",
            image: "https://placehold.co/600x400/EF4444/ffffff?text=Thông+báo",
        },
    ];

    const [filter, setFilter] = useState("all"); // bộ lọc loại tin
    const [search, setSearch] = useState(""); // từ khóa tìm kiếm

    // Lọc dữ liệu theo search + filter
    const filteredNews = newsData.filter((item) => {
        const matchCategory = filter === "all" || item.category === filter;
        const matchSearch =
            item.title.toLowerCase().includes(search.toLowerCase()) ||
            item.content.toLowerCase().includes(search.toLowerCase());
        return matchCategory && matchSearch;
    });

    return (
        <div className="blog-container">
            {/* Banner Section */}
            <section className="blog-banner">
                <h1>Tin tức</h1>
                <p>Cập nhật những tin tức, thông báo và sự kiện mới nhất.</p>
            </section>

            {/* Search and Filter Section */}
            <section className="blog-filter">
                <div className="search-box">
                    <input
                        type="text"
                        placeholder="Tìm kiếm tin tức..."
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                    />
                    <span className="icon">🔍</span>
                </div>
                <div className="filter-box">
                    <select value={filter} onChange={(e) => setFilter(e.target.value)}>
                        <option value="all">Tất cả</option>
                        <option value="academic">Học tập</option>
                        <option value="events">Sự kiện</option>
                        <option value="announcements">Thông báo</option>
                    </select>
                </div>
            </section>

            {/* News List Section */}
            <section className="blog-list">
                {filteredNews.length > 0 ? (
                    filteredNews.map((item) => (
                        <div key={item.id} className="news-card" data-category={item.category}>
                            <img src={item.image} alt={item.title} />
                            <div className="news-content">
                                <span>📅 {item.date}</span>
                                <h4>{item.title}</h4>
                                <p>{item.content}</p>
                                <a href="#">Xem chi tiết</a>
                            </div>
                        </div>
                    ))
                ) : (
                    <p className="no-results">⚠️ Không tìm thấy kết quả phù hợp.</p>
                )}
            </section>

            {/* Load More */}
            <div className="blog-loadmore">
                <button>➕ Xem thêm</button>
            </div>
        </div>
    );
};

export default BlogGuide;
