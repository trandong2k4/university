// BlogGuide.jsx
import React from "react";
import "../../styles/public/blogGuide.css";

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
        <div className="blog-container">
            <h1 className="blog-title">Bài viết hướng dẫn</h1>
            <div className="blog-posts">
                {posts.map((p) => (
                    <article key={p.id} className="blog-post">
                        <h2 className="blog-post-title">{p.title}</h2>
                        <p className="blog-post-content">{p.content}</p>
                    </article>
                ))}
            </div>
        </div>
    );
}
