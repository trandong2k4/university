// Footer.jsx
import "../styles/footer.css";

export default function Footer() {
    return (
        <footer className="footer">
            <p className="footer-contact">
                Email: support@learninghub.edu | Phone: 0123 456 789 | Địa chỉ: 03 Quang Trung, Đà Nẵng
            </p>
            <div className="footer-links">
                <a href="/policy">Chính sách</a>
                <a href="/faq">FAQ</a>
                <a href="/support">Hỗ trợ</a>
            </div>
            <p className="footer-copy">© 2025 Learning Hub. All rights reserved.</p>
        </footer>
    );
}
