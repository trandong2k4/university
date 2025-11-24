import React, { useState } from "react";

export default function ResetPassword() {
  const [username, setUsername] = useState("");
  const [message, setMessage] = useState("");

  const handleReset = async () => {
    if (!username.trim()) return;

    try {
      const res = await fetch(`http://localhost:8080/auth/reset-password/${username}`, {
        method: "PUT",
      });

      const text = await res.text();
      setMessage(text);
    } catch (err) {
      setMessage("❌ Lỗi khi reset mật khẩu");
      console.error(err);
    }
  };

  return (
    <div className="reset-container">
      <h2>🔐 Reset mật khẩu</h2>
      <input
        type="text"
        placeholder="Nhập username"
        value={username}
        onChange={(e) => setUsername(e.target.value)}
      />
      <button onClick={handleReset}>Đặt lại về 111</button>
      {message && <p>{message}</p>}
    </div>
  );
}