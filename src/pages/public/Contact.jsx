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
        setLoading(true);
        e.preventDefault();
        try {
            const res = await apiClient.post(`/contact`, form);
            const result = res.data; // lấy trực tiếp từ response
            alert(result);
            setLoading(false);
            setForm({ name: "", email: "", message: "" });
        } catch (err) {
            console.error("Lỗi hệ thống, vui lòng liên hệ sau!:", err);
            alert("Có lỗi xảy ra khi gửi liên hệ!");
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
                    <a href="https://university-two-gamma.vercel.app">🌐 Website:www.learninghub.edu.vn</a>
                    <div className="map-container">
                        < iframe src="" width=" 350 " height="200 " > </iframe>
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
                        <button type="submit" disabled={loading}>
                            {loading ? "Đang gởi liên hệ ..." : "Gởi liên hệ"}
                        </button>
                    </form>
                </div>
            </section>
        </div>
    );
}
