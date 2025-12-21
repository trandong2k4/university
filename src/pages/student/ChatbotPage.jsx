import { useState, useEffect, useRef } from "react";
import apiClient from "/src/api/apiClient"; // Sử dụng apiClient như component mẫu
import "../../styles/student/chatbot-page.css"; // Giữ nguyên file CSS của trang

export default function ChatbotPage() {
    const [message, setMessage] = useState("");
    const [chatHistory, setChatHistory] = useState([]);
    const [loading, setLoading] = useState(false);

    const chatEndRef = useRef(null);
    const inputRef = useRef(null);

    // 1. Load lịch sử chat an toàn
    useEffect(() => {
        const saved = localStorage.getItem("chatHistory");
        if (saved) {
            try {
                setChatHistory(JSON.parse(saved));
            } catch (error) {
                console.error("Lỗi parse lịch sử chat:", error);
                localStorage.removeItem("chatHistory");
            }
        }
        // Focus vào ô input khi vào trang
        setTimeout(() => inputRef.current?.focus(), 100);
    }, []);

    // 2. Auto scroll và lưu local storage
    useEffect(() => {
        if (chatHistory.length > 0) {
            localStorage.setItem("chatHistory", JSON.stringify(chatHistory));
        }
        scrollToBottom();
    }, [chatHistory]);

    const scrollToBottom = () => {
        chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
    };

    // 3. Xử lý gửi tin nhắn (Logic từ Chatbot component)
    const handleSend = async () => {
        if (!message.trim() || loading) return;

        const userText = message;
        setMessage(""); // Clear input ngay lập tức

        // Thêm tin nhắn user
        const userMsg = { sender: "user", text: userText };
        setChatHistory((prev) => [...prev, userMsg]);
        setLoading(true);

        try {
            // Gọi API qua apiClient
            const res = await apiClient.post("/chatbot/chat", {
                message: userText,
            });

            // Xử lý dữ liệu trả về linh hoạt (giống component mẫu)
            let replyText = "Không có phản hồi.";
            if (res.data) {
                if (typeof res.data === "string") replyText = res.data;
                else if (res.data.reply) replyText = res.data.reply;
                else if (res.data.message) replyText = res.data.message;
                else replyText = JSON.stringify(res.data);
            }

            const botMsg = { sender: "bot", text: replyText };
            setChatHistory((prev) => [...prev, botMsg]);

        } catch (err) {
            console.error("Chatbot Error:", err);
            setChatHistory((prev) => [
                ...prev,
                { sender: "bot", text: "⚠️ Xin lỗi, tôi đang gặp sự cố kết nối. Vui lòng thử lại sau." }
            ]);
        } finally {
            setLoading(false);
            // Focus lại vào input sau khi bot trả lời xong
            setTimeout(() => inputRef.current?.focus(), 100);
        }
    };

    const handleKeyDown = (e) => {
        if (e.key === "Enter") {
            e.preventDefault();
            handleSend();
        }
    };

    const clearChat = () => {
        if (window.confirm("Bạn có chắc muốn xóa toàn bộ lịch sử trò chuyện?")) {
            setChatHistory([]);
            localStorage.removeItem("chatHistory");
        }
    };

    return (
        <main className="chatbot-page">
            {/* Header */}
            <header className="chatbot-header">
                <div className="header-title">
                    <h1>🤖 Trợ lý ảo học vụ</h1>
                    <p>Hỗ trợ giải đáp thắc mắc sinh viên 24/7</p>
                </div>
                <button onClick={clearChat} className="btn-clear" title="Xóa lịch sử trò chuyện">
                    🗑 Xóa lịch sử
                </button>
            </header>

            {/* Body Chat */}
            <section className="chatbot-body">
                <div className="chat-history">
                    {chatHistory.length === 0 && (
                        <div className="bot-msg intro">
                            <h3>Xin chào! 👋</h3>
                            <p>Tôi là trợ lý ảo AI. Bạn cần giúp đỡ gì về đăng ký môn học, tra cứu điểm hay thủ tục hành chính không?</p>
                        </div>
                    )}

                    {chatHistory.map((msg, idx) => (
                        <div key={idx} className={`chat-msg ${msg.sender === "user" ? "user-msg" : "bot-msg"}`}>
                            {msg.text}
                        </div>
                    ))}

                    {/* Hiệu ứng loading dots */}
                    {loading && (
                        <div className="bot-msg loading-msg">
                            <div className="dot"></div>
                            <div className="dot"></div>
                            <div className="dot"></div>
                        </div>
                    )}
                    <div ref={chatEndRef}></div>
                </div>

                {/* Input Area */}
                <div className="chat-input-container">
                    <div className="chat-input">
                        <input
                            ref={inputRef}
                            type="text"
                            placeholder="Nhập câu hỏi của bạn..."
                            value={message}
                            onChange={(e) => setMessage(e.target.value)}
                            onKeyDown={handleKeyDown}
                            disabled={loading}
                        />
                        <button onClick={handleSend} disabled={loading || !message.trim()}>
                            {/* Icon Send SVG */}
                            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                <line x1="22" y1="2" x2="11" y2="13"></line>
                                <polygon points="22 2 15 22 11 13 2 9 22 2"></polygon>
                            </svg>
                        </button>
                    </div>
                </div>
            </section>
        </main>
    );
}