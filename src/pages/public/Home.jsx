// Home.jsx
import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import mockData from "../../mockData";
import "../../styles/home.css";

export default function Home() {
    const navigate = useNavigate();
    const [query, setQuery] = useState("");

    const majors = mockData.entities.nganhHoc || [];
    const news = [
        { id: 1, title: "Lịch khai giảng kỳ mới", content: "Khai giảng 10/10/2025..." },
        { id: 2, title: "Workshop AI trong giáo dục", content: "Ứng dụng AI vào học tập..." },
        { id: 3, title: "Cuộc thi lập trình", content: "Nhiều giải thưởng hấp dẫn..." },
    ];

    const onSearch = (e) => {
        e.preventDefault();
        const q = query.trim();
        navigate(q ? `/courses?q=${encodeURIComponent(q)}` : "/courses");
    };

    return (
        <div className="home-container">

            {/* Banner */}
            <section className="home-banner">
                <h1 className="home-title">LEARNING HUB</h1>
                <p className="home-subtitle">Smart Education Platform</p>
                <form onSubmit={onSearch} className="home-search">
                    <input
                        className="home-search-input"
                        placeholder="Tìm kiếm ngành học / môn học"
                        value={query}
                        onChange={(e) => setQuery(e.target.value)}
                    />
                    <button className="home-search-btn" type="submit">
                        Tìm kiếm
                    </button>
                </form>
            </section>

            {/* Danh sách ngành học */}
            <section className="home-majors">
                <h2 className="home-section-title">Ngành học</h2>
                <div className="home-majors-list">
                    {majors.map((m) => (
                        <Link
                            to={`/majors/${m.id}`}
                            key={m.id}
                            className="home-major-item"
                        >
                            <div className="home-major-name">{m.tenNganh}</div>
                            <div className="home-major-desc">{m.moTa}</div>
                        </Link>
                    ))}
                </div>
            </section>

            {/* Tin tức */}
            <section className="home-news">
                <h2 className="home-section-title">Tin tức - Thông báo</h2>
                <div className="home-news-list">
                    {news.map((n) => (
                        <div key={n.id} className="home-news-item">
                            <div className="home-news-title">{n.title}</div>
                            <div className="home-news-content">{n.content}</div>
                        </div>
                    ))}
                </div>
            </section>
        </div>
    );
}
