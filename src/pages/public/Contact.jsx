import React, { useState } from "react";
import "../../styles/public/contact.css";

export default function Contact() {
    const [form, setForm] = useState({ name: "", email: "", message: "" });

    const handleChange = (e) => {
        const { name, value } = e.target;
        setForm({ ...form, [name]: value });
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        alert(`Cảm ơn ${form.name}, chúng tôi sẽ liên hệ với bạn qua ${form.email}.`);
        setForm({ name: "", email: "", message: "" });
    };

    return (
        <div className="contact-page">
            <header className="contact-header">
                <h1>Liên hệ với Learning Hub</h1>
            </header>

            <section className="contact-section">
                <div className="contact-info">
                    <h2>Thông tin liên hệ</h2>
                    <p>📍 Đại học Duy Tân, Đà Nẵng</p>
                    <p>📧 Email: support@learninghub.edu.vn</p>
                    <p>📞 Hotline: 0905 635 421</p>
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
                        <button type="submit">Gửi liên hệ</button>
                    </form>
                </div>
            </section>
        </div>
    );
}
