import React, { useEffect, useState } from "react";
import axios from "axios";
import "../../styles/dashboard/publicDashboard.css";
import apiClient from "/src/api/apiClient";

export default function PublicDashboard() {
    const [nganhs, setNganhs] = useState([]);
    const [baiviets, setBaiviets] = useState([]);

    useEffect(() => {
        const fetchMajors = async () => {
            try {
                const res = await apiClient.get("/majors");
                const data = Array.isArray(res.data)
                    ? res.data
                    : res.data.data || res.data.content || [];

                setNganhs(data.slice(0, 3)); // Lấy 5 ngành đầu tiên
            } catch (err) {
                console.error("Lỗi khi lấy ngành:", err.response?.data || err);
            }
        };

        const fetchPosts = async () => {
            try {
                const res = await apiClient.get("/posts");
                const data = Array.isArray(res.data)
                    ? res.data
                    : res.data.data || res.data.content || [];

                setBaiviets(data.slice(0, 3)); // Lấy 5 bài viết đầu tiên
            } catch (err) {
                console.error("Lỗi khi lấy bài viết:", err.response?.data || err);
            }
        };

        fetchMajors();
        fetchPosts();
    }, []);


    return (
        <main className="dashboard-container">
            {/* Banner */}
            <section className="banner">
                <h1>Chào mừng đến với Learning Hub!</h1>
                <p>Nền tảng học tập trực tuyến hàng đầu dành cho bạn.</p>
                <div className="banner-placeholder">
                    <img src="/src/assets/banner.jpg" alt="" />
                </div>
            </section>

            {/* Giới thiệu + Khóa học nổi bật */}
            <section className="grid-3">
                <div className="card intro">
                    <h2>Giới thiệu</h2>
                    <p>
                        Learning Hub là hệ thống học tập trực tuyến toàn diện, cung cấp một
                        loạt các khóa học đa dạng từ nhiều lĩnh vực. Chúng tôi cam kết mang
                        đến trải nghiệm học tập tốt nhất, với tài liệu chất lượng cao và đội
                        ngũ giảng viên chuyên nghiệp, giúp bạn đạt được mục tiêu học vấn và
                        sự nghiệp.
                    </p>
                </div>

                <div className="card featured-courses">
                    <h2>Khóa học nổi bật</h2>
                    <ul>
                        {nganhs.map((nganh, index) => (
                            <li key={index}>
                                <h3>{nganh.tenNganh}</h3>
                                <p>Giảng viên: {nganh.giangVien || "Đang cập nhật"}</p>
                            </li>
                        ))}
                    </ul>
                </div>
            </section>

            {/* Lịch học + Tin tức */}
            <section className="grid-2">
                <div className="card calendar">
                    <h2>Tài liệu</h2>
                    <ul className="document-list">
                        <li>
                            <a href="https://example.com/huong-dan-su-dung-he-thong.pdf" target="_blank" rel="noopener noreferrer">
                                📘 Hướng dẫn sử dụng hệ thống
                            </a>
                        </li>
                        <li>
                            <a href="https://example.com/giao-trinh-lap-trinh-web.pdf" target="_blank" rel="noopener noreferrer">
                                💻 Giáo trình Lập trình Web
                            </a>
                        </li>
                        <li>
                            <a href="https://example.com/bieu-mau-dang-ky-mon-hoc.docx" target="_blank" rel="noopener noreferrer">
                                📝 Biểu mẫu đăng ký môn học
                            </a>
                        </li>
                        <li>
                            <a href="https://example.com/bao-cao-tot-nghiep-template.docx" target="_blank" rel="noopener noreferrer">
                                🎓 Mẫu báo cáo tốt nghiệp
                            </a>
                        </li>
                        <li>
                            <a href="https://example.com/tai-lieu-tham-khao.zip" target="_blank" rel="noopener noreferrer">
                                📂 Tài liệu tham khảo (ZIP)
                            </a>
                        </li>
                    </ul>
                </div>


                <div className="card news">
                    <h2>Tin tức mới</h2>
                    <ul>
                        {baiviets.map((bv, index) => (
                            <li key={index}>
                                <h3>{bv.tieuDe}</h3>
                                <p>{bv.ngayDang || "Đang cập nhật"}</p>
                            </li>
                        ))}
                    </ul>
                </div>
            </section>

        </main>
    );
}