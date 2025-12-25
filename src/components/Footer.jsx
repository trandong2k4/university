// Footer.jsx
import { useState, useEffect, use } from "react";
import "../styles/layout/base-layout.css";
import "../styles/components/footer.css";
import apiClient from "/src/api/apiClient";
import { set } from "date-fns";

export default function Footer() {

    const [lienhes, setLienHes] = useState([]);

    const fetchNotifications = async () => {
        try {
            const res = await apiClient.get("/posts");
            setLienHes(filtered);
        } catch (err) {
            console.error("Lỗi tải thông báo:", err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchNotifications();
        const interval = setInterval(fetchNotifications, 3 * 60 * 1000); // 3 phút/lần
        return () => clearInterval(interval);
    }, []);


    return (
        <div className="layout-footer">
            <footer className="footer">
                <h3 className="footer-contact">
                    Email: support@learninghub.edu.vn | Phone: 0123 456 789 | Địa chỉ: 123 Đường ABC, Thành phố XYZ
                </h3>
                <p className="footer-copy">© 2025 Learning Hub. All rights reserved.</p>
                <div className="footer-links">
                    <a title="chính sách" href="https://www.learninghub.ac.nz/study-skills/getting-started/independence/">Chính sách</a>
                    <a title="Mục hỏi" href="https://learninghub.sap.com/help-center/faq/queonlhfaqs">FAQ</a>
                    <a title="Help" href="https://learninghub.sap.com/help-center">Hỗ trợ</a>
                </div>
            </footer>
        </div>
    );
}
