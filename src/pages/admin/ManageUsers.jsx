import React, { useState, useEffect } from "react";
import "../../styles/admin/manageUsers.css";

export default function ManageUsers() {
    const [users, setUsers] = useState([]);
    const [selectedUser, setSelectedUser] = useState(null);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [modalMode, setModalMode] = useState("add");

    const [formData, setFormData] = useState({
        username: "",
        password: "",
        firstName: "",
        lastName: "",
        dateOfBirth: "",
    });

    // 🔹 Lấy danh sách user từ backend
    useEffect(() => {
        fetch("http://localhost:8080/api/users")
            .then((res) => res.json())
            .then(setUsers)
            .catch((err) => console.error("Lỗi fetch users:", err));
    }, []);

    const openModal = (mode, user = null) => {
        setModalMode(mode);
        if (user) {
            setFormData({
                id: user.id || "",
                username: user.username || "",
                password: "",
                firstName: user.firstName || "",
                lastName: user.lastName || "",
                dateOfBirth: user.dateOfBirth || "",
            });
        } else {
            setFormData({
                username: "",
                password: "",
                firstName: "",
                lastName: "",
                dateOfBirth: "",
            });
        }
        setIsModalOpen(true);
    };

    const closeModal = () => {
        setIsModalOpen(false);
        setSelectedUser(null);
    };

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData((prev) => ({ ...prev, [name]: value }));
    };

    // 🔹 Lưu (thêm / sửa)
    const handleSave = async (e) => {
        e.preventDefault();
        const method = modalMode === "add" ? "POST" : "PUT";
        const url =
            modalMode === "add"
                ? "http://localhost:8080/api/users"
                : `http://localhost:8080/api/users/${formData.id}`;

        const res = await fetch(url, {
            method,
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(formData),
        });

        const data = await res.json();

        if (modalMode === "add") {
            setUsers([...users, data]);
        } else {
            setUsers(users.map((u) => (u.id === data.id ? data : u)));
        }
        closeModal();
    };

    // 🔹 Xóa
    const handleDelete = async () => {
        if (!selectedUser) return alert("Chọn tài khoản để xóa!");
        if (!window.confirm("Bạn có chắc muốn xóa tài khoản này?")) return;

        await fetch(`http://localhost:8080/api/users/${selectedUser.id}`, {
            method: "DELETE",
        });

        setUsers(users.filter((u) => u.id !== selectedUser.id));
        setSelectedUser(null);
    };

    return (
        <main className="container">
            <section className="banner-section">
                <h1 className="banner-title">👤 Quản lý Tài khoản</h1>
                <p className="banner-subtitle">
                    Thêm, sửa, xóa hoặc xem chi tiết tài khoản người dùng trong hệ thống.
                </p>
            </section>

            <div className="content-box">
                <div className="action-buttons">
                    <button onClick={() => openModal("add")} className="btn btn-blue">
                        ➕ Thêm
                    </button>
                    <button
                        onClick={() =>
                            selectedUser
                                ? openModal("edit", selectedUser)
                                : alert("Chọn tài khoản để sửa")
                        }
                        className="btn btn-yellow"
                    >
                        ✏️ Sửa
                    </button>
                    <button onClick={handleDelete} className="btn btn-red">
                        🗑️ Xóa
                    </button>
                </div>

                {/* 🔹 Bảng hiển thị danh sách */}
                <table className="users-table">
                    <thead>
                        <tr>
                            <th>Tên đăng nhập</th>
                            <th>Họ</th>
                            <th>Tên</th>
                            <th>Ngày sinh</th>
                            <th>Chi tiết</th>
                        </tr>
                    </thead>
                    <tbody>
                        {users.map((u) => (
                            <tr
                                key={u.id}
                                onClick={() => setSelectedUser(u)}
                                className={selectedUser?.id === u.id ? "selected-row" : ""}
                            >
                                <td>{u.username}</td>
                                <td>{u.firstName}</td>
                                <td>{u.lastName}</td>
                                <td>{u.dateOfBirth || "—"}</td>
                                <td>
                                    <button
                                        onClick={(ev) => {
                                            ev.stopPropagation();
                                            openModal("view", u);
                                        }}
                                        className="btn btn-gray"
                                    >
                                        👁️ Xem
                                    </button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            {/* 🔹 Modal Form */}
            {isModalOpen && (
                <div className="modal-overlay">
                    <div className="modal-box">
                        <h2>
                            {modalMode === "add"
                                ? "➕ Thêm tài khoản"
                                : modalMode === "edit"
                                    ? "✏️ Sửa tài khoản"
                                    : "👁️ Chi tiết tài khoản"}
                        </h2>

                        <form onSubmit={handleSave}>
                            <input
                                type="text"
                                name="username"
                                value={formData.username}
                                onChange={handleChange}
                                placeholder="Tên đăng nhập"
                                readOnly={modalMode === "view"}
                            />

                            {modalMode !== "view" && (
                                <input
                                    type="password"
                                    name="password"
                                    value={formData.password}
                                    onChange={handleChange}
                                    placeholder="Mật khẩu"
                                />
                            )}

                            <input
                                type="text"
                                name="firstName"
                                value={formData.firstName}
                                onChange={handleChange}
                                placeholder="Họ"
                                readOnly={modalMode === "view"}
                            />
                            <input
                                type="text"
                                name="lastName"
                                value={formData.lastName}
                                onChange={handleChange}
                                placeholder="Tên"
                                readOnly={modalMode === "view"}
                            />
                            <input
                                type="date"
                                name="dateOfBirth"
                                value={formData.dateOfBirth || ""}
                                onChange={handleChange}
                                readOnly={modalMode === "view"}
                            />

                            <div className="modal-actions">
                                {modalMode !== "view" && (
                                    <button type="submit" className="btn btn-green">
                                        💾 Lưu
                                    </button>
                                )}
                                <button
                                    type="button"
                                    onClick={closeModal}
                                    className="btn btn-gray"
                                >
                                    Đóng
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </main>
    );
}
