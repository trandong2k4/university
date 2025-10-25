// src/components/ProfilePopup.jsx
import { useEffect, useRef, useState } from "react";
import "../styles/components/profilePopup.css";

export default function ProfilePopup({ userId, onClose }) {
    const [userData, setUserData] = useState(null);
    const [loading, setLoading] = useState(true);
    const popupRef = useRef(null);

    // 🔹 Đóng popup khi click ra ngoài
    useEffect(() => {
        const handleClickOutside = (e) => {
            if (popupRef.current && !popupRef.current.contains(e.target)) onClose();
        };
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, [onClose]);

    // 🔹 Gọi API lấy thông tin user
    useEffect(() => {
        const fetchUser = async () => {
            try {
                const res = await fetch(`http://localhost:8080/api/user/${userId}`);
                if (!res.ok) throw new Error("Không thể lấy thông tin người dùng");
                const data = await res.json();
                setUserData(data);
            } catch (err) {
                console.error("Lỗi fetch user:", err);
            } finally {
                setLoading(false);
            }
        };
        if (userId) fetchUser();
    }, [userId]);

    if (loading) {
        return (
            <div className="profile-popup" ref={popupRef}>
                <p>⏳ Đang tải thông tin...</p>
            </div>
        );
    }

    if (!userData) {
        return (
            <div className="profile-popup" ref={popupRef}>
                <p>⚠️ Không tìm thấy người dùng.</p>
            </div>
        );
    }

    return (
        <div className="profile-popup" ref={popupRef}>
            <div className="profile-header">
                <img src={userData.avatar || "/src/assets/profile.png"} alt="Avatar" />
                <div>
                    <h3>{userData.fullName || `${userData.firstName} ${userData.lastName}`}</h3>
                    <p>{userData.role?.name || "Không rõ vai trò"}</p>
                </div>
            </div>

            <div className="profile-body">
                <p><strong>Email:</strong> {userData.email || "Chưa có"}</p>
                <p><strong>Tên đăng nhập:</strong> {userData.username}</p>
                <p><strong>SĐT:</strong> {userData.phone || "Chưa cập nhật"}</p>
            </div>

            <div className="profile-actions">
                <button className="edit-btn">✏️ Chỉnh sửa</button>
                <button className="logout-btn" onClick={() => alert("Đăng xuất...")}>🚪 Đăng xuất</button>
            </div>
        </div>
    );
}
