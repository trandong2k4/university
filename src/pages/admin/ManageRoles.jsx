import React, { useState, useEffect } from "react";
import "../../styles/admin/manageRoles.css";

export default function ManageRoles() {
    const [roles, setRoles] = useState([]);
    const [selectedRole, setSelectedRole] = useState(null);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [modalMode, setModalMode] = useState("add");
    const [formData, setFormData] = useState({ tenViTri: "" });

    // 🔹 Fetch roles khi component mount
    useEffect(() => {
        const fetchRoles = async () => {
            try {
                const res = await apiClient.get("/roles");
                setRoles(res.data);
            } catch (err) {
                console.error("Lỗi fetch roles:", err.response?.data || err);
            }
        };
        fetchRoles();
    }, []);


    const openModal = (mode, role = null) => {
        setModalMode(mode);
        if (role) {
            setFormData({ tenViTri: role.tenViTri });
        } else {
            setFormData({ tenViTri: "" });
        }
        setIsModalOpen(true);
    };

    const closeModal = () => {
        setIsModalOpen(false);
        setSelectedRole(null);
    };

    const handleChange = (e) => {
        setFormData({ tenViTri: e.target.value });
    };

    // 🔹 Xử lý lưu vai trò (thêm/sửa
    const handleSave = async (e) => {
        e.preventDefault();

        try {
            let res;
            if (modalMode === "add") {
                res = await apiClient.post("/roles", formData);
                setRoles([...roles, res.data]);
                alert("Thêm vai trò thành công!");
            } else {
                res = await apiClient.put(`/roles/${selectedRole.id}`, formData);
                setRoles(
                    roles.map((r) => (r.id === res.data.id ? res.data : r))
                );
                alert("Cập nhật vai trò thành công!");
            }
            closeModal();
        } catch (err) {
            console.error("Lỗi lưu vai trò:", err.response?.data || err);
            alert("Thao tác thất bại!");
        }
    };

    // 🔹 Xử lý xóa vai trò
    const handleDelete = async () => {
        if (!selectedRole) return alert("Chọn vai trò để xóa!");
        if (!window.confirm("Bạn có chắc muốn xóa vai trò này?")) return;

        try {
            await apiClient.delete(`/roles/${selectedRole.id}`);
            setRoles(roles.filter((r) => r.id !== selectedRole.id));
            setSelectedRole(null);
            alert("Xóa vai trò thành công!");
        } catch (err) {
            console.error("Lỗi xóa vai trò:", err.response?.data || err);
            alert("Xóa thất bại!");
        }
    };

    return (
        <main className="container">
            <section className="banner-section">
                <h1 className="banner-title">🔐 Quản lý Vai trò</h1>
                <p className="banner-subtitle">Thêm, sửa, xóa hoặc xem chi tiết vai trò người dùng.</p>
            </section>

            <div className="content-box">
                <div className="action-buttons">
                    <button onClick={() => openModal("add")} className="btn btn-blue">Thêm</button>
                    <button onClick={() => selectedRole ? openModal("edit", selectedRole) : alert("Chọn vai trò để sửa")} className="btn btn-yellow">Sửa</button>
                    <button onClick={handleDelete} className="btn btn-red">Xóa</button>
                </div>

                <table className="roles-table">
                    <thead>
                        <tr>
                            <th>Tên vai trò</th>
                            <th>Chi tiết</th>
                        </tr>
                    </thead>
                    <tbody>
                        {roles.map((r) => (
                            <tr key={r.id} onClick={() => setSelectedRole(r)} className={selectedRole?.id === r.id ? "selected-row" : ""}>
                                <td>{r.tenViTri}</td>
                                <td>
                                    <button onClick={(ev) => { ev.stopPropagation(); openModal("view", r); }} className="btn btn-gray">Xem</button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            {isModalOpen && (
                <div className="modal-overlay">
                    <div className="modal-box">
                        <h2>{modalMode === "add" ? "➕ Thêm vai trò" : modalMode === "edit" ? "✏️ Sửa vai trò" : "👁️ Chi tiết vai trò"}</h2>
                        <form onSubmit={handleSave}>
                            <input
                                type="text"
                                name="tenViTri"
                                value={formData.tenViTri}
                                onChange={handleChange}
                                placeholder="Tên vai trò"
                                readOnly={modalMode === "view"}
                            />

                            <div className="modal-actions">
                                {modalMode !== "view" && <button type="submit" className="btn btn-green">💾 Lưu</button>}
                                <button type="button" onClick={closeModal} className="btn btn-gray">Đóng</button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </main>
    );
}