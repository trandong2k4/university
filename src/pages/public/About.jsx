import React from "react";
<<<<<<< HEAD
import "../../styles/about.css";
=======
import "../../styles/public/about.css";
>>>>>>> 3725551 (Publiclayout)

export default function About() {
    return (
        <div className="about-page">
            <header className="about-header">
                <h1>Giới thiệu về Learning Hub</h1>
            </header>

            <section className="about-section">
                <h2>Tầm nhìn & Sứ mệnh</h2>
                <p>
                    Learning Hub là nền tảng quản lý đào tạo thông minh được phát triển bởi
                    sinh viên Đại học Duy Tân. Hệ thống giúp kết nối sinh viên, giảng viên
                    và nhà quản trị trong một không gian học tập hiện đại, tích hợp trí tuệ nhân tạo.
                </p>
            </section>

            <section className="about-section">
                <h2>Các tính năng nổi bật</h2>
                <ul>
                    <li>🎓 Quản lý sinh viên, giảng viên, môn học</li>
                    <li>📅 Lịch học & lịch thi thông minh</li>
                    <li>🤖 Chatbot AI tư vấn ngành học</li>
                    <li>💰 Quản lý học phí & báo cáo tài chính</li>
                    <li>📊 Thống kê & báo cáo trực quan</li>
                </ul>
            </section>

            <section className="about-section">
                <h2>Đội ngũ phát triển</h2>
                <p>
                    Nhóm sinh viên Khoa Công Nghệ Thông Tin – Trường Đại học Duy Tân,
                    dưới sự hướng dẫn của ThS. Phạm Phú Khương.
                </p>
            </section>

            <footer className="about-footer">
                © 2025 Learning Hub – Smart Education Platform
            </footer>
        </div>
    );
}
