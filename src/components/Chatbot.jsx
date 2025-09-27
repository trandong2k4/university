
// Chatbot.jsx
import { Link } from "react-router-dom";
import "../styles/layout/base-layout.css";
import "../styles/components/chatbot.css";

export default function Chatbot() {
    return (
        <div className="layout-chatbot">
            <Link to="/chatbot" aria-label="Mở Chatbot">
                <button title="🤖 Xin chào" className="chatbot-btn">🤖</button>
            </Link >
        </div >
    );
}
