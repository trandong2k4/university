// src/components/Chatbot.jsx
import { useState, useEffect, useRef } from "react";
import "../styles/layout/base-layout.css";
import "../styles/components/chatbot.css";
import apiClient from "/src/api/apiClient";

export default function Chatbot() {
    const [isOpen, setIsOpen] = useState(false);
    const [message, setMessage] = useState("");
    const [chatHistory, setChatHistory] = useState([]);
    const [loading, setLoading] = useState(false);
    const chatEndRef = useRef(null);

    // 🔹 Khi component load → đọc lịch sử chat từ localStorage
    useEffect(() => {
        const saved = localStorage.getItem("chatHistory");
        if (saved) setChatHistory(JSON.parse(saved));
    }, []);

    // 🔹 Lưu lịch sử chat khi thay đổi
    useEffect(() => {
        localStorage.setItem("chatHistory", JSON.stringify(chatHistory));
        chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }, [chatHistory]);

    const toggleChat = () => {
        setIsOpen(!isOpen);
        setMessage("");
    };

    const handleSend = async () => {
        if (!message.trim()) return;

        const userMsg = { sender: "user", text: message };
        setChatHistory((prev) => [...prev, userMsg]);
        setMessage("");
        setLoading(true);

        try {
            const res = await apiClient.post("/chatbot/chat", {
                message,
            });

            const reply = await res.data;
            const botMsg = { sender: "bot", text: reply };
            setChatHistory((prev) => [...prev, botMsg]);
        } catch (err) {
            console.error("Chatbot error:", err);
            setChatHistory((prev) => [  
                ...prev,
                { sender: "bot", text: "❌ Lỗi khi gửi yêu cầu. Vui lòng thử lại." },
            ]);
        } finally {
            setLoading(false);
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
            <button title="Trợ lý ảo" className="chatbot-btn" onClick={toggleChat}>
                🤖
            </button>

            {isOpen && (
                <div className="chatbot-popup">
                    <div className="chatbot-header">
                        <span>Trợ lý ảo (AI)</span>
                        <div>
                            <button className="clear-btn" onClick={clearChat}>🗑</button>
                            <button className="close-btn" onClick={toggleChat}>✖</button>
                        </div>
                    </div>

                    <div className="chatbot-body">
                        <div className="chat-history">
                            {!chatHistory.length && (
                                <div className="bot-msg intro">
                                    Xin chào 👋! Tôi là trợ lý ảo của bạn.
                                    Hãy hỏi tôi bất cứ điều gì về học vụ nhé!
                                </div>
                            )}

                            {chatHistory.map((msg, idx) => (
                                <div key={idx} className={`chat-msg ${msg.sender === "user" ? "user-msg" : "bot-msg"}`}>
                                    {msg.text}
                                </div>
                            ))}

                            {loading && <div className="bot-msg loading-msg">Đang trả lời...</div>}
                            <div ref={chatEndRef}></div>
                        </div>

                        <div className="chat-input">
                            <input
                                type="text"
                                placeholder="Nhập câu hỏi..."
                                value={message}
                                onChange={(e) => setMessage(e.target.value)}
                                onKeyDown={(e) => e.key === "Enter" && handleSend()}
                            />
                            <button onClick={handleSend} disabled={loading}>
                                {loading ? "..." : "Gửi"}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}