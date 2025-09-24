// BlogGuide.jsx - placeholder
import React from "react";

const posts = [
    {
        id: 1,
        title: "Hướng dẫn học tập hiệu quả",
        content:
            "Tận dụng Pomodoro, ghi chép có cấu trúc, đặt mục tiêu theo tuần và theo dõi tiến độ…",
    },
    {
        id: 2,
        title: "Lộ trình Web hiện đại",
        content:
            "Bắt đầu với HTML/CSS/JS, sau đó là React + Node.js, học thêm Git, Docker, CI/CD.",
    },
];

export default function BlogGuide() {
    return (
        <div className="container mx-auto px-4 py-8 space-y-6">
            <h1 className="text-2xl font-bold">Bài viết hướng dẫn</h1>
            <div className="grid md:grid-cols-2 gap-4">
                {posts.map((p) => (
                    <article key={p.id} className="p-4 bg-white rounded-xl border hover:shadow">
                        <h2 className="font-semibold text-lg">{p.title}</h2>
                        <p className="text-sm text-gray-700 mt-2">{p.content}</p>
                    </article>
                ))}
            </div>
        </div>
    );
}
