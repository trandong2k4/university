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
                    <a title="chính sách" href="https://www.learninghub.ac.nz/study-skills/getting-started/independence/">Chính sách</a>
                    <a title="Mục hỏi" href="https://learninghub.sap.com/help-center/faq/queonlhfaqs">FAQ</a>
                    <a title="Help" href="https://learninghub.sap.com/help-center">Hỗ trợ</a>
                </div>
            </footer>
        </div>
    );
}
