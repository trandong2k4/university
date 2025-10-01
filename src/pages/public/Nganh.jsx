import React, { useState } from "react";
import "../../styles/public/nganh.css";

export default function Nganh() {
    const [openWeek, setOpenWeek] = useState(null);

    const toggleWeek = (week) => {
        setOpenWeek(openWeek === week ? null : week);
    };

    return (
        <div className="nganh-page">
            {/* Banner */}
            <section className="banner">
                <h1>Nội dung Khóa học</h1>
                <p>Khám phá chi tiết về môn học bạn đã chọn.</p>
            </section>

            {/* Course Info */}
            <section className="course-info">
                <h3>Lập trình Web nâng cao</h3>
                <div className="course-grid">
                    <div>
                        <i className="fas fa-barcode"></i>
                        <span className="label">Mã môn:</span> IT404
                    </div>
                    <div>
                        <i className="fas fa-user-tie"></i>
                        <span className="label">Giảng viên:</span> PGS.TS. Lê Văn Khôi
                    </div>
                    <div>
                        <i className="fas fa-credit-card"></i>
                        <span className="label">Số tín chỉ:</span> 4
                    </div>
                    <div>
                        <i className="fas fa-calendar-alt"></i>
                        <span className="label">Học kỳ:</span> Học kỳ II, 2024-2025
                    </div>
                </div>
            </section>

            {/* Description */}
            <section className="course-desc">
                <h3>Mô tả và Mục tiêu Môn học</h3>
                <p>
                    Môn học này cung cấp kiến thức chuyên sâu về lập trình web hiện đại,
                    tập trung vào các công nghệ front-end và back-end tiên tiến. Sinh viên
                    sẽ học cách xây dựng các ứng dụng web phức tạp, có khả năng mở rộng và
                    tương tác cao, sử dụng các framework phổ biến và các phương pháp phát
                    triển tốt nhất.
                </p>
                <p>Sau khi hoàn thành môn học, sinh viên sẽ có khả năng:</p>
                <ul>
                    <li>Thiết kế và phát triển SPA sử dụng React.js.</li>
                    <li>Xây dựng API RESTful với Node.js và Express.js.</li>
                    <li>
                        Tích hợp cơ sở dữ liệu (ví dụ: MongoDB, PostgreSQL) vào ứng dụng web.
                    </li>
                    <li>Triển khai và bảo trì ứng dụng trên các nền tảng đám mây.</li>
                </ul>
            </section>

            {/* Accordion */}
            <section className="syllabus">
                <div className="accordion">
                    <h3>Đề cương chi tiết</h3>
                    <div
                        className={`accordion-item ${openWeek === 1 ? "open" : ""}`}
                        onClick={() => toggleWeek(1)}
                    >
                        <div className="accordion-header">
                            <span>Tuần 1: Giới thiệu và tổng quan</span>
                            <i className="fas fa-chevron-down"></i>
                        </div>
                        {openWeek === 1 && (
                            <div className="accordion-content">
                                <ul>
                                    <li>
                                        Nội dung: Tổng quan về kiến trúc web hiện đại, giới thiệu về
                                        Front-end và Back-end.
                                    </li>
                                    <li>Tài liệu: Slide bài giảng, Chương 1 giáo trình.</li>
                                </ul>
                            </div>
                        )}
                    </div>

                    <div
                        className={`accordion-item ${openWeek === 2 ? "open" : ""}`}
                        onClick={() => toggleWeek(2)}
                    >
                        <div className="accordion-header">
                            <span>Tuần 2: Frontend Framework - React.js cơ bản</span>
                            <i className="fas fa-chevron-down"></i>
                        </div>
                        {openWeek === 2 && (
                            <div className="accordion-content">
                                <ul>
                                    <li>Nội dung: Cấu trúc dự án, Component, Props, State.</li>
                                    <li>Tài liệu: Slide bài giảng, video hướng dẫn.</li>
                                </ul>
                            </div>
                        )}
                    </div>
                </div>
            </section>

            {/* Materials & Schedule */}
            <section className="course-extra">
                <div className="materials">
                    <h3>Tài liệu học tập</h3>
                    <ul>
                        <li>
                            <a href="#">
                                <i className="fas fa-file-alt"></i> Giáo trình môn học (PDF)
                            </a>
                        </li>
                        <li>
                            <a href="#">
                                <i className="fas fa-file-powerpoint"></i> Slide bài giảng tuần
                                1-3
                            </a>
                        </li>
                        <li>
                            <a href="#">
                                <i className="fas fa-video"></i> Video bài giảng
                            </a>
                        </li>
                        <li>
                            <a href="https://nodejs.org/" target="_blank" rel="noreferrer">
                                <i className="fas fa-link"></i> Tài liệu tham khảo Node.js
                            </a>
                        </li>
                    </ul>
                </div>
                <div className="schedule">
                    <h3>Lịch học</h3>
                    <table>
                        <thead>
                            <tr>
                                <th>Ngày</th>
                                <th>Giờ</th>
                                <th>Phòng</th>
                                <th>Hình thức</th>
                            </tr>
                        </thead>
                        <tbody>
                            <tr>
                                <td>Thứ Ba</td>
                                <td>08:00 - 11:30</td>
                                <td>P.A202</td>
                                <td>Offline</td>
                            </tr>
                            <tr>
                                <td>Thứ Sáu</td>
                                <td>13:30 - 17:00</td>
                                <td>Online</td>
                                <td>Online</td>
                            </tr>
                        </tbody>
                    </table>
                </div>
            </section>
        </div>
    );
}
