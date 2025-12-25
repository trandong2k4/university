import React, { useState, useEffect } from "react";
import "../../styles/admin/manageUsers.css";
import apiClient from "/src/api/apiClient";

const INITIAL_FORM_STATE = {
    id: "",
    username: "",
    password: "",
    email: "",
    status: true,
    createDate: "",
    updateDate: "",
    note: "",
    roleId: "",
};

export default function ManageUsers() {
    const [users, setUsers] = useState([]);
    const [selectedUser, setSelectedUser] = useState(null);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [modalMode, setModalMode] = useState("view"); // add, edit, view
    const [formData, setFormData] = useState(INITIAL_FORM_STATE);

    // 1. Lấy danh sách user
    const fetchUsers = async () => {
        try {
            const res = await apiClient.get("/users");
            setUsers(res.data);
        } catch (err) {
            console.error("Lỗi fetch users:", err.response?.data || err);
        }
    };

    useEffect(() => {
        fetchUsers();
    }, []);

    // 2. Logic Mở Modal
    const openModal = (mode, user = null) => {
        setModalMode(mode);
        if (mode === "add") {
            setFormData({
                ...INITIAL_FORM_STATE,
                createDate: new Date().toISOString().split("T")[0], // Mặc định ngày hiện tại
            });
        } else if (user) {
            setFormData({
                id: user.id,
                username: user.username || "",
                password: "", // Không hiện mật khẩu cũ
                email: user.email || "",
                status: user.status ?? true,
                createDate: user.createDate || "",
                updateDate: user.updateDate || "",
                note: user.note || "",
                roleId: user.roleId || "",
            });
        }
        setIsModalOpen(true);
    };

    const closeModal = () => {
        setIsModalOpen(false);
        setFormData(INITIAL_FORM_STATE);
        // Lưu ý: Không nên reset selectedUser ở đây nếu bạn muốn giữ dòng được chọn sau khi đóng modal xem
    };

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData((prev) => ({ ...prev, [name]: value }));
    };

    // 3. Lưu (Thêm / Sửa)
    const handleSave = async (e) => {
        e.preventDefault();
        console.log("Dữ liệu gửi đi:", formData); // Kiểm tra xem có trường 'id' không
        if (modalMode === "edit" && !formData.id) {
            alert("Không tìm thấy ID của người dùng!");
            return;
        }
        try {
            if (modalMode === "add") {
                const res = await apiClient.post("/users", formData);
                setUsers([...users, res.data]);
                alert("Thêm thành công!");
            } else if (modalMode === "edit") {
                const res = await apiClient.put(`/users/${formData.id}`, formData);
                setUsers(users.map((u) => (u.id === formData.id ? res.data : u)));
                alert("Cập nhật thành công!");
            }
            closeModal();
        } catch (err) {
            alert("Thao tác thất bại! Vui lòng kiểm tra lại.");
        }
    };

    // 4. Xóa
    const handleDelete = async () => {
        if (!selectedUser) return alert("Vui lòng chọn 1 tài khoản từ bảng trước!");
        if (!window.confirm(`Bạn có chắc muốn xóa tài khoản ${selectedUser.username}?`)) return;

        try {
            await apiClient.delete(`/users/${selectedUser.id}`);
            setUsers(users.filter((u) => u.id !== selectedUser.id));
            setSelectedUser(null);
            alert("Xóa thành công!");
        } catch (err) {
            alert("Xóa thất bại!");
        }
    };

    return (
        <main className="container">
            <section className="banner-section">
                <h1>👤 Quản lý Tài khoản</h1>
                <p>Hệ thống quản lý người dùng tập trung.</p>
            </section>

            <div className="content-box">
                <div className="action-buttons">
                    <button onClick={() => openModal("add")} className="btn btn-blue">➕ Thêm mới</button>
                    <button
                        onClick={() => selectedUser ? openModal("edit", selectedUser) : alert("Chọn 1 dòng để sửa")}
                        className="btn btn-yellow"
                    >
                        ✏️ Sửa
                    </button>
                    <button onClick={handleDelete} className="btn btn-red">🗑️ Xóa</button>
                </div>

                <table className="users-table">
                    <thead>
                        <tr>
                            <th>Tên đăng nhập</th>
                            <th>Email</th>
                            <th>Ngày tạo</th>
                            <th>Trạng thái</th>
                            <th>Thao tác</th>
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
                                <td>{u.email}</td>
                                <td>{u.createDate}</td>
                                <td>
                                    <span className={`status-badge ${u.status ? "active" : "locked"}`}>
                                        {u.status ? "Hoạt động" : "Khoá"}
                                    </span>
                                </td>
                                <td>
                                    <button
                                        onClick={(e) => { e.stopPropagation(); openModal("view", u); }}
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

            {/* MODAL FORM */}
            {isModalOpen && (
                <div className="modal-overlay">
                    <div className="modal-box">
                        <h2>
                            {modalMode === "add" ? "➕ Thêm mới" : modalMode === "edit" ? "✏️ Chỉnh sửa" : "👁️ Chi tiết"}
                        </h2>

                        <form onSubmit={handleSave} className="user-form">
                            <div className="form-group">
                                <label>Tên đăng nhập</label>
                                <input
                                    type="text"
                                    name="username"
                                    value={formData.username}
                                    onChange={handleChange}
                                    readOnly={modalMode === "view"}
                                    className={modalMode === "view" ? "readonly-input" : ""}
                                    required
                                />
                            </div>

                            {modalMode !== "view" && (
                                <div className="form-group">
                                    <label>
                                        Mật khẩu {modalMode === "edit" && "(Bỏ trống nếu không đổi)"}
                                    </label>
                                    <input
                                        type="password"
                                        name="password"
                                        value={formData.password || ""}
                                        onChange={handleChange}
                                        // Chỉ bắt buộc nhập khi ở chế độ "add"
                                        required={modalMode === "add"}
                                        placeholder={modalMode === "add" ? "Nhập mật khẩu" : "Nhập mật khẩu mới (nếu muốn đổi)"}
                                    />
                                </div>
                            )}

                            <div className="form-group">
                                <label>Email</label>
                                <input
                                    type="email"
                                    name="email"
                                    value={formData.email}
                                    onChange={handleChange}
                                    readOnly={modalMode === "view"}
                                    className={modalMode === "view" ? "readonly-input" : ""}
                                    required
                                />
                            </div>

                            <div className="form-group">
                                <label>Trạng thái</label>
                                <select
                                    name="status"
                                    value={formData.status.toString()}
                                    onChange={(e) => setFormData({ ...formData, status: e.target.value === "true" })}
                                    disabled={modalMode === "view"}
                                >
                                    <option value="true">Kích hoạt</option>
                                    <option value="false">Khoá</option>
                                </select>
                            </div>

                            <div className="form-row">
                                <div className="form-group">
                                    <label>Ngày tạo</label>
                                    <input type="date" name="createDate" value={formData.createDate} readOnly className="readonly-input" />
                                </div>
                                <div className="form-group">
                                    <label>Ngày cập nhật</label>
                                    <input type="date" name="updateDate" value={formData.updateDate} readOnly className="readonly-input" />
                                </div>
                            </div>

                            <div className="form-group">
                                <label>Ghi chú</label>
                                <textarea
                                    name="note"
                                    value={formData.note}
                                    onChange={handleChange}
                                    readOnly={modalMode === "view"}
                                    className={modalMode === "view" ? "readonly-input" : ""}
                                ></textarea>
                            </div>

                            <div className="modal-actions">
                                {modalMode !== "view" && (
                                    <button type="submit" className="btn btn-green">💾 Lưu thay đổi</button>
                                )}
                                <button type="button" onClick={closeModal} className="btn btn-gray">Đóng</button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </main>
    );
}