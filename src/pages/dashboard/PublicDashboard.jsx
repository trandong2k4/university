// PublicDashboard.jsx - placeholder
import React, { useMemo, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import mockData from "../../mockData";

export default function PublicDashboard() {
    const navigate = useNavigate();
    const [q, setQ] = useState("");

    const majors = mockData.entities.nganhHoc || [];
    const courses = mockData.entities.monHoc || [];

    const kpis = useMemo(() => {
        return [
            { label: "Ngành học", value: majors.length },
            { label: "Môn học", value: courses.length },
            { label: "Bài viết (mock)", value: 3 },
            { label: "Chatbot AI", value: "Demo" },
        ];
    }, [majors.length, courses.length]);

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
        <div className="container mx-auto px-4 py-8 space-y-8">
            {/* Banner / Search */}
            <section className="bg-gradient-to-r from-blue-500 to-indigo-600 rounded-2xl text-white p-8 md:p-12 shadow">
                <h1 className="text-3xl md:text-4xl font-bold">Learning Hub – Public Dashboard</h1>
                <p className="mt-2 opacity-90">Smart Education Platform (Mock)</p>

                <form onSubmit={onSearch} className="mt-6 max-w-xl flex gap-2">
                    <input
                        className="flex-1 rounded-lg px-4 py-3 text-gray-800"
                        placeholder="Tìm kiếm ngành học / môn học"
                        value={q}
                        onChange={(e) => setQ(e.target.value)}
                    />
                    <button className="px-4 py-3 bg-white text-blue-600 rounded-lg font-medium">
                        Tìm kiếm
                    </button>
                </form>

                <div className="mt-4 flex gap-3 text-sm">
                    <Link to="/blog" className="underline">Bài viết hướng dẫn</Link>
                    <Link to="/chatbot" className="underline">Chatbot tư vấn (mock)</Link>
                </div>
            </section>

            {/* KPI cards */}
            <section>
                <h2 className="text-xl font-semibold mb-4">Tổng quan</h2>
                <div className="grid sm:grid-cols-2 md:grid-cols-4 gap-4">
                    {kpis.map((k) => (
                        <div key={k.label} className="p-4 bg-white rounded-xl border hover:shadow">
                            <div className="text-sm text-gray-500">{k.label}</div>
                            <div className="text-2xl font-semibold mt-1">{k.value}</div>
                        </div>
                    ))}
                </div>
            </section>

            {/* Majors */}
            <section className="space-y-3">
                <h2 className="text-xl font-semibold">Ngành học nổi bật</h2>
                <div className="grid md:grid-cols-3 gap-4">
                    {majors.slice(0, 6).map((m) => (
                        <Link
                            key={m.id}
                            to={`/majors/${m.id}`}
                            className="p-4 bg-white rounded-xl border hover:shadow transition"
                        >
                            <div className="text-lg font-medium">{m.tenNganh}</div>
                            <div className="text-xs text-gray-500 mt-1">Mã ngành: {m.maNganh}</div>
                            <p className="text-sm text-gray-600 mt-2 line-clamp-2">{m.moTa}</p>
                        </Link>
                    ))}
                </div>
            </section>

            {/* News mock */}
            <section className="space-y-3">
                <h2 className="text-xl font-semibold">Tin tức - Thông báo</h2>
                <div className="grid md:grid-cols-3 gap-4">
                    {news.map((n) => (
                        <Link key={n.id} to={n.link} className="p-4 bg-white rounded-xl border hover:shadow">
                            <div className="font-medium">{n.title}</div>
                            <div className="text-xs text-blue-600 mt-1">Xem chi tiết →</div>
                        </Link>
                    ))}
                </div>
            </section>
        </div>
    );
}
