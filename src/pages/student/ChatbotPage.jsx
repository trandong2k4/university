import React, { useEffect, useState } from "react";
import "../../styles/student/chatbot-page.css";

export default function ChatbotPage() {
    const [message, setMessage] = useState("");
    const [chatHistory, setChatHistory] = useState([]);
    const [loading, setLoading] = useState(false);
    const chatEndRef = useRef(null);

    useEffect(() => {
        const saved = localStorage.getItem("chatHistory");
        if (saved) setChatHistory(JSON.parse(saved));
    }, []);

    useEffect(() => {
        localStorage.setItem("chatHistory", JSON.stringify(chatHistory));
        chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }, [chatHistory]);

    const handleSend = async () => {
        if (!message.trim()) return;

        const userMsg = { sender: "user", text: message };
        setChatHistory((prev) => [...prev, userMsg]);
        setMessage("");
        setLoading(true);

        try {
            const res = await fetch("http://localhost:8080/chatbot/chat", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ message }),
            });

            const reply = await res.text();
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
        <main className="chatbot-page">
            <header className="chatbot-header">
                <h1>🤖 Trợ lý ảo học vụ</h1>
                <button onClick={clearChat} className="btn-clear">🗑 Xóa lịch sử</button>
            </header>

            <section className="chatbot-body">
                <div className="chat-history">
                    {!chatHistory.length && (
                        <div className="bot-msg intro">
                            Xin chào 👋! Tôi là trợ lý ảo của bạn. Hãy hỏi tôi bất cứ điều gì về học vụ nhé!
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
            </section>
        </main>
    );
}