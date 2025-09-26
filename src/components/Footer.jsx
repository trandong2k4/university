// Footer.jsx
import "../styles/layout/base-layout.css";
import "../styles/components/footer.css";

export default function Footer() {
    return (
        <div className="layout-footer">
            <footer className="footer">
                <h3 className="footer-contact">
                    Email: support@learninghub.edu | Phone: 0123 456 789 | Địa chỉ: 03 Quang Trung, Đà Nẵng
                </h3>
                <p className="footer-copy">© 2025 Learning Hub. All rights reserved.</p>
                <div className="footer-links">
                    <a href="/policy">Chính sách</a>
                    <a href="/faq">FAQ</a>
                    <a href="/support">Hỗ trợ</a>
                </div>
            </footer>
        </div>
    );
}
