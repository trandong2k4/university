import React, { useState } from "react";
import apiClient from "/src/api/apiClient";
import "../../styles/public/contact.css";

export default function Contact() {
    const [form, setForm] = useState({ name: "", email: "", message: "" });
    const [loading, setLoading] = useState(false);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setForm({ ...form, [name]: value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault(); // Ngăn chặn reload trang ngay lập tức
        setLoading(true);

        try {
            // Gửi request tới server
            const res = await apiClient.post(`/contact`, form);

            // Khi Backend có @Async, res.data sẽ phản hồi về rất nhanh (gần như tức thì)
            alert("Cảm ơn bạn! Thông tin liên hệ đã được ghi nhận.");

            // Reset form ngay sau khi thành công
            setForm({ name: "", email: "", message: "" });
        } catch (err) {
            console.error("Lỗi gửi liên hệ:", err);
            alert("Hệ thống đang bận, vui lòng thử lại sau!");
        } finally {
            setLoading(false); // Kết thúc trạng thái loading
        }
    };

    return (
        <div className="contact-page">
            <header className="contact-header">
                <h1>Liên hệ với Learning Hub</h1>
            </header>

            <section className="contact-section">
                <div className="contact-info">
                    <h2>Thông tin liên hệ</h2>
                    <p>📍 Hệ thống quản lý đào tạo</p>
                    <p>📧 Email: support@learninghub.edu.vn</p>
                    <p>📞 Hotline: 0203 040 506 </p>
                    <a href="https://university-two-gamma.vercel.app">🌐 Website: www.learninghub.edu.vn</a>
                    <div className="map-container">
                        {/* Thêm src map của bạn vào đây */}
                        <iframe
                            src="https://www.google.com/maps/embed?pb=..."
                            width="350"
                            height="200"
                            style={{ border: 0 }}
                            allowFullScreen=""
                            loading="lazy">
                        </iframe>
                    </div>
                </div>

                <div className="contact-form">
                    <h2>Gửi tin nhắn cho chúng tôi</h2>
                    <form onSubmit={handleSubmit}>
                        <input
                            type="text"
                            name="name"
                            placeholder="Họ và tên"
                            value={form.name}
                            onChange={handleChange}
                            required
                        />
                        <input
                            type="email"
                            name="email"
                            placeholder="Email"
                            value={form.email}
                            onChange={handleChange}
                            required
                        />
                        <textarea
                            name="message"
                            rows="5"
                            placeholder="Nội dung..."
                            value={form.message}
                            onChange={handleChange}
                            required
                        ></textarea>

                        {/* Nút bấm sẽ đổi trạng thái khi đang xử lý */}
                        <button type="submit" disabled={loading} className={loading ? "btn-loading" : ""}>
                            {loading ? "Đang xử lý..." : "Gửi liên hệ"}
                        </button>
                    </form>
                </div>
            </section>
        </div>
    );
}