import React, { useState, useRef, useEffect } from "react";
import "../../styles/public/chatbot.css";

export default function Chatbot() {
    const [open, setOpen] = useState(false);
    const [input, setInput] = useState("");
    const [messages, setMessages] = useState([
        { from: "bot", text: "Xin chào 👋! Bạn muốn tư vấn ngành học nào?" }
    ]);
    const messagesEndRef = useRef(null);

    // Cuộn xuống cuối khi có tin nhắn mới
    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }, [messages]);

    const handleSend = () => {
        if (!input.trim()) return;

        const userMsg = { from: "user", text: input };
        const botReply = {
            from: "bot",
            text: `Mock trả lời cho: "${input}" 🤖 (sau này sẽ gọi API thực tế).`
        };

        setMessages((prev) => [...prev, userMsg, botReply]);
        setInput("");
    };

    return (
        <>
            {/* Nút nổi góc màn hình */}
            <button
                className="chatbot-btn"
                onClick={() => setOpen((o) => !o)}
                title={open ? "Đóng chatbot" : "Mở chatbot"}
            >
                💬
            </button>

            {open && (
                <div className="chatbot-container">
                    <div className="chatbot-header">
                        <span>Chatbot Tư vấn ngành học</span>
                        <button className="chatbot-close-btn" onClick={() => setOpen(false)}>
                            ✖
                        </button>
                    </div>

                    <div className="chatbot-window">
                        <div className="chatbot-messages">
                            {messages.map((msg, i) => (
                                <div
                                    key={i}
                                    className={`chatbot-message ${msg.from === "bot" ? "chatbot-bot" : "chatbot-user"
                                        }`}
                                >
                                    <span className="chatbot-avatar">
                                        {msg.from === "bot" ? "🤖" : "👤"}
                                    </span>
                                    <span className="chatbot-text">{msg.text}</span>
                                </div>
                            ))}
                            <div ref={messagesEndRef} />
                        </div>

                        <div className="chatbot-input-area">
                            <input
                                value={input}
                                onChange={(e) => setInput(e.target.value)}
                                onKeyDown={(e) => e.key === "Enter" && handleSend()}
                                className="chatbot-input"
                                placeholder="Nhập câu hỏi..."
                            />
                            <button className="chatbot-send-btn" onClick={handleSend}>
                                Gửi
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </>
    );
}
