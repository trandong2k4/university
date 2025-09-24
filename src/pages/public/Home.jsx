// Home.jsx - placeholder
import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import mockData from "../../mockData";
import "../../styles/home.css";


export default function Home() {
    const navigate = useNavigate();
    const [query, setQuery] = useState("");

    const majors = mockData.entities.nganhHoc || [];
    // Tin tức demo (mock riêng vì mockData.txt chưa có bảng tin tức)
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
        <div className="container mx-auto px-4 py-8 space-y-10">

            {/* Banner */}
            <section className="text-center bg-gradient-to-r from-blue-500 to-indigo-600 text-white rounded-2xl py-16 px-6 shadow">
                <h1 className="text-4xl md:text-5xl font-bold tracking-wide">LEARNING HUB</h1>
                <p className="text-lg mt-2 opacity-90">Smart Education Platform</p>
                <form onSubmit={onSearch} className="mt-6 max-w-xl mx-auto flex gap-2">
                    <input
                        className="flex-1 rounded-lg px-4 py-3 text-gray-800"
                        placeholder="Tìm kiếm ngành học / môn học"
                        value={query}
                        onChange={(e) => setQuery(e.target.value)}
                    />
                    <button
                        className="px-4 py-3 bg-white text-blue-600 rounded-lg font-medium"
                        type="submit"
                    >
                        Tìm kiếm
                    </button>
                </form>
            </section>

            {/* Danh sách ngành học */}
            <section className="space-y-4">
                <h2 className="text-2xl font-semibold">Ngành học</h2>
                <div className="grid sm:grid-cols-2 md:grid-cols-3 gap-4">
                    {majors.map((m) => (
                        <Link
                            to={`/majors/${m.id}`}
                            key={m.id}
                            className="p-4 bg-white rounded-xl border hover:shadow transition"
                        >
                            <div className="text-lg font-medium">{m.tenNganh}</div>
                            <div className="text-sm text-gray-500 mt-1">{m.moTa}</div>
                        </Link>
                    ))}
                </div>
            </section>

            {/* Tin tức - Thông báo (mock) */}
            <section className="space-y-4">
                <h2 className="text-2xl font-semibold">Tin tức - Thông báo</h2>
                <div className="grid md:grid-cols-3 gap-4">
                    {news.map((n) => (
                        <div key={n.id} className="p-4 bg-white rounded-xl border hover:shadow">
                            <div className="font-semibold">{n.title}</div>
                            <div className="text-sm text-gray-600 mt-1">{n.content}</div>
                        </div>
                    ))}
                </div>
            </section>
        </div>
    );
}
