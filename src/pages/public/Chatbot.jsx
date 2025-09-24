import React, { useState } from "react";
import "../../styles/chatbot.css";

export default function Chatbot() {
    const [open, setOpen] = useState(true);
    const [input, setInput] = useState("");
    const [messages, setMessages] = useState([
        { from: "bot", text: "Xin chào 👋! Bạn muốn tư vấn ngành học nào?" }
    ]);

    const handleSend = () => {
        if (!input.trim()) return;

        // Thêm câu hỏi user
        const userMsg = { from: "user", text: input };
        setMessages((prev) => [...prev, userMsg]);

        // Giả lập trả lời bot (placeholder)
        const botReply = {
            from: "bot",
            text: `Mock trả lời cho: "${input}" 🤖 (sau này sẽ gọi API tư vấn thực tế).`
        };
        setMessages((prev) => [...prev, userMsg, botReply]);

        setInput("");
    };

    return (
        <div className="container mx-auto px-4 py-8">
            <h1 className="text-2xl font-bold mb-4">
                Chatbot Tư vấn ngành học (mock)
            </h1>

            <div className="max-w-xl">
                <button
                    className="px-4 py-2 bg-blue-600 text-white rounded-lg"
                    onClick={() => setOpen((o) => !o)}
                >
                    {open ? "Đóng cửa sổ" : "Mở cửa sổ"}
                </button>

                {open && (
                    <div className="mt-4 p-4 bg-white rounded-xl border shadow-sm flex flex-col h-96">
                        {/* Vùng hiển thị tin nhắn */}
                        <div className="flex-1 overflow-y-auto space-y-2 mb-3">
                            {messages.map((msg, i) => (
                                <div
                                    key={i}
                                    className={`p-2 rounded-lg max-w-[80%] ${msg.from === "bot"
                                        ? "bg-gray-100 text-gray-800 self-start"
                                        : "bg-blue-600 text-white self-end ml-auto"
                                        }`}
                                >
                                    {msg.text}
                                </div>
                            ))}
                        </div>

                        {/* Input */}
                        <div className="flex space-x-2">
                            <input
                                value={input}
                                onChange={(e) => setInput(e.target.value)}
                                onKeyDown={(e) => e.key === "Enter" && handleSend()}
                                className="flex-1 px-3 py-2 rounded-lg border"
                                placeholder="Nhập câu hỏi..."
                            />
                            <button
                                onClick={handleSend}
                                className="px-4 py-2 bg-blue-600 text-white rounded-lg"
                            >
                                Gửi
                            </button>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}
