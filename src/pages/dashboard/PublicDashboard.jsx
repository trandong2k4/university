// PublicDashboard.jsx
import React, { useMemo, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import mockData from "../../mockData";
<<<<<<< HEAD
import "../../styles/publicDashboard.css";
import bannerImg from "../../assets/banner.jpg";
=======
import "../../styles/dashboard/publicDashboard.css";
>>>>>>> 3725551 (Publiclayout)

export default function PublicDashboard() {
    const navigate = useNavigate();
    const [q, setQ] = useState("");

    const majors = mockData.entities.nganhHoc || [];
    const courses = mockData.entities.monHoc || [];

    const kpis = useMemo(() => [
        { label: "Ngành học", value: majors.length },
        { label: "Môn học", value: courses.length },
        { label: "Bài viết (mock)", value: 3 },
        { label: "Chatbot AI", value: "Demo" },
    ], [majors.length, courses.length]);

    const news = [
        { id: 1, title: "Khai giảng kỳ mới 10/10/2025", link: "/blog" },
        { id: 2, title: "Workshop: Ứng dụng AI trong giáo dục", link: "/blog" },
        { id: 3, title: "Cuộc thi Lập trình sinh viên 2025", link: "/blog" },
    ];

    const onSearch = (e) => {
        e.preventDefault();
        const s = q.trim();
        navigate(s ? `/courses?q=${encodeURIComponent(s)}` : "/courses");
    };

    return (
        <div className="dashboard-container">

            {/* Banner / Search */}
            <section className="dashboard-banner">

<<<<<<< HEAD
                <div className="banner-img">
                    <img src={bannerImg} alt="Errol" />
                </div>

=======
>>>>>>> 3725551 (Publiclayout)
                <h1 className="dashboard-title">Learning Hub - Public Dashboard</h1>
                <p className="dashboard-subtitle">Smart Education Platform (Mock)</p>

                <form onSubmit={onSearch} className="dashboard-search">
                    <input
                        className="dashboard-search-input"
                        placeholder="Tìm kiếm ngành học / môn học"
                        value={q}
                        onChange={(e) => setQ(e.target.value)}
                    />
                    <button className="dashboard-search-btn">Tìm kiếm</button>
                </form>

                <div className="dashboard-links">
                    <Link to="/blog">Bài viết hướng dẫn</Link>
                    <Link to="/chatbot">Chatbot tư vấn (mock)</Link>
                </div>
            </section>

            {/* KPI cards */}
            <section className="dashboard-kpis">
                <h2 className="dashboard-section-title">Tổng quan</h2>
                <div className="dashboard-kpi-list">
                    {kpis.map(k => (
                        <div key={k.label} className="dashboard-kpi-card">
                            <div className="dashboard-kpi-label">{k.label}</div>
                            <div className="dashboard-kpi-value">{k.value}</div>
                        </div>
                    ))}
                </div>
            </section>

            {/* Majors */}
            <section className="dashboard-majors">
                <h2 className="dashboard-section-title">Ngành học nổi bật</h2>
                <div className="dashboard-majors-list">
                    {majors.slice(0, 6).map(m => (
                        <Link key={m.id} to={`/majors/${m.id}`} className="dashboard-major-item">
                            <div className="dashboard-major-name">{m.tenNganh}</div>
                            <div className="dashboard-major-code">Mã ngành: {m.maNganh}</div>
                            <p className="dashboard-major-desc">{m.moTa}</p>
                        </Link>
                    ))}
                </div>
            </section>

            {/* News */}
            <section className="dashboard-news">
                <h2 className="dashboard-section-title">Tin tức - Thông báo</h2>
                <div className="dashboard-news-list">
                    {news.map(n => (
                        <Link key={n.id} to={n.link} className="dashboard-news-item">
                            <div className="dashboard-news-title">{n.title}</div>
                            <div className="dashboard-news-link">Xem chi tiết →</div>
                        </Link>
                    ))}
                </div>
            </section>
        </div>
    );
}
