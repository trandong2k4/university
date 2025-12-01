import { useState, useEffect, useRef } from "react";
import apiClient from "/src/api/apiClient"; // Đảm bảo đường dẫn đúng tới file cấu hình axios
import "../styles/components/chatbot.css";   // Import file CSS ở trên

export default function Chatbot() {
    const [isOpen, setIsOpen] = useState(false);
    const [message, setMessage] = useState("");
    const [chatHistory, setChatHistory] = useState([]);
    const [loading, setLoading] = useState(false);

    const chatEndRef = useRef(null);
    const inputRef = useRef(null);

    // 1. Load lịch sử chat khi component mount
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
    }, []);

    // 2. Lưu lịch sử mỗi khi có tin nhắn mới & Cuộn xuống cuối
    useEffect(() => {
        if (chatHistory.length > 0) {
            localStorage.setItem("chatHistory", JSON.stringify(chatHistory));
        }
        scrollToBottom();
    }, [chatHistory, isOpen]); // Chạy cả khi mở chat để cuộn xuống

    // 3. Focus vào ô input khi mở popup
    useEffect(() => {
        if (isOpen && inputRef.current) {
            setTimeout(() => inputRef.current.focus(), 100);
        }
    }, [isOpen]);

    const scrollToBottom = () => {
        chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
    };

    const toggleChat = () => setIsOpen(!isOpen);

    const handleSend = async () => {
        if (!message.trim() || loading) return;

        const userText = message;
        setMessage(""); // Xóa ô nhập ngay lập tức

        // Thêm tin nhắn user vào list
        const userMsg = { sender: "user", text: userText };
        setChatHistory((prev) => [...prev, userMsg]);
        setLoading(true);

        try {
            // Gọi API
            const res = await apiClient.post("/chatbot/chat", {
                message: userText,
            });

            // Xử lý dữ liệu trả về (hỗ trợ cả text thuần hoặc object)
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
        <div className="layout-chatbot">
            {/* Nút Chatbot - Luôn hiển thị khi đóng */}
            {!isOpen && (
                <button
                    className="chatbot-btn"
                    onClick={toggleChat}
                    title="Mở trợ lý ảo"
                >
                    {/* Emoji Robot làm trung tâm */}
                    <span style={{ marginTop: "-2px" }}>🤖</span>
                </button>
            )}

            {/* Popup Chatbot */}
            {isOpen && (
                <div className="chatbot-popup">
                    {/* Header */}
                    <div className="chatbot-header">
                        <div className="header-info">
                            <span>🤖 Trợ lý AI</span>
                        </div>
                        <div className="header-actions">
                            <button onClick={clearChat} title="Xóa lịch sử">
                                Xóa
                            </button>
                            <button onClick={toggleChat} title="Đóng">
                                Đóng
                            </button>
                        </div>
                    </div>

                    {/* Body Chat */}
                    <div className="chatbot-body">
                        <div className="chat-history">
                            {chatHistory.length === 0 && (
                                <div className="bot-msg intro">
                                    <p>Xin chào! 👋</p>
                                    <p>Tôi là trợ lý ảo AI hỗ trợ học vụ.</p>
                                    <p>Hãy đặt câu hỏi cho tôi nhé!</p>
                                </div>
                            )}

                            {chatHistory.map((msg, idx) => (
                                <div key={idx} className={`chat-msg ${msg.sender === "user" ? "user-msg" : "bot-msg"}`}>
                                    {msg.text}
                                </div>
                            ))}

                            {loading && (
                                <div className="loading-msg">
                                    <div className="dot"></div>
                                    <div className="dot"></div>
                                    <div className="dot"></div>
                                </div>
                            )}
                            <div ref={chatEndRef}></div>
                        </div>

                        {/* Input Area */}
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
                                {/* Icon Gửi SVG */}
                                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="22" y1="2" x2="11" y2="13"></line><polygon points="22 2 15 22 11 13 2 9 22 2"></polygon></svg>
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}