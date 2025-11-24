import React, { useState, useEffect } from "react";
import "../../styles/admin/manageUsers.css";
import apiClient from "/src/api/apiClient";

export default function ManageUsers() {
    const [users, setUsers] = useState([]);
    const [selectedUser, setSelectedUser] = useState(null);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [modalMode, setModalMode] = useState("add");

    const [formData, setFormData] = useState({
        username: "",
        email: "",
        firstName: "",
        lastName: "",
        status: false,
        createDate: "",
    });

    // 🔹 Lấy danh sách user từ backend
    useEffect(() => {
        const fetchUsers = async () => {
            try {
                const res = await apiClient.get("/users"); // url sẽ tự cộng baseURL từ apiClient
                setUsers(res.data);
            } catch (err) {
                console.error("Lỗi fetch users:", err.response?.data || err);
            }
        };
        fetchUsers();
    }, []);

    // 🔹 Mở modal (thêm / sửa / xem)
    const openModal = (mode, user = null) => {
        setModalMode(mode);
        if (user) {
            setFormData({
                id: user.id || "",
                username: user.username || "",
                email: user.email || "",
                firstName: user.firstName || "",
                lastName: user.lastName || "",
                status: user.status || "",
                createDate: user.createDate || "",
            });
        } else {
            setFormData({
                username: "",
                password: "",
                email: "",
                firstName: "",
                lastName: "",
                status: false,
                createDate: "",
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
        try {
            let res;
            if (modalMode === "add") {
                res = await apiClient.post("/users", formData);
                setUsers([...users, res.data]);
            } else {
                res = await apiClient.put(`/users/${formData.id}`, formData);
                setUsers(users.map((u) => (u.id === res.data.id ? res.data : u)));
            }
            closeModal();
        } catch (err) {
            console.error("Lỗi lưu user:", err.response?.data || err);
            alert("Thao tác thất bại!");
        }
    };


    // 🔹 Xóa
    const handleDelete = async () => {
        if (!selectedUser) return alert("Chọn tài khoản để xóa!");
        if (!window.confirm("Bạn có chắc muốn xóa tài khoản này?")) return;

        try {
            await apiClient.delete(`/users/${selectedUser.id}`);
            setUsers(users.filter((u) => u.id !== selectedUser.id));
            setSelectedUser(null);
            alert("Xóa thành công!");
        } catch (err) {
            console.error("Lỗi xóa user:", err.response?.data || err);
            alert("Xóa thất bại!");
        }
    };

    return (
        <main className="container">
            <section className="banner-section">
                <h1 className="banner-title">👤 Quản lý Tài khoản</h1>
                <p className="banner-subtitle">
                    quản lý hoạt tài khoản người dùng trong hệ thống.
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
                            <th>Email</th>
                            <th>Ngày tạo</th>
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
                                <td>{u.email}</td>
                                <td>{u.createDate}</td>
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
                                type="email"
                                name="email"
                                value={formData.email}
                                onChange={handleChange}
                                placeholder="abc@gmail.com"
                                readOnly={modalMode === "view"}
                            />

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

                            <select
                                name="status"
                                value={formData.status === true ? "true" : "false"}
                                onChange={(e) =>
                                    setFormData({
                                        ...formData,
                                        status: e.target.value === "true",  // ép kiểu
                                    })
                                }
                                disabled={modalMode === "view"}
                            >
                                <option value="true">Kích hoạt</option>
                                <option value="false">Khoá</option>
                            </select>

                            <input
                                type="date"
                                name="create_date"
                                value={formData.createDate || ""}
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
