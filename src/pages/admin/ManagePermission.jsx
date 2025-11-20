import React, { useState, useEffect } from "react";
import "../../styles/admin/manageRoles.css";

export default function ManagePermission() {
    const [permissions, setPermission] = useState([]);
    const [selectedPermission, setSelectedPermission] = useState(null);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [modalMode, setModalMode] = useState("add");
    const [formData, setFormData] = useState({ maPermission: "" });

    useEffect(() => {
        fetch("https://be-university.onrender.com/api/permissions")
            .then((res) => res.json())
            .then(setPermission);
    }, []);

    const openModal = (mode, permissions = null) => {
        setModalMode(mode);
        if (permissions) {
            setFormData({ maPermission: permissions.maPermission });
        } else {
            setFormData({ maPermission: "" });
        }
        setIsModalOpen(true);
    };

    const closeModal = () => {
        setIsModalOpen(false);
        setSelectedPermission(null);
    };

    const handleChange = (e) => {
        setFormData({ maPermission: e.target.value });
    };

    const handleSave = async (e) => {
        e.preventDefault();
        const method = modalMode === "add" ? "POST" : "PUT";
        const url =
            modalMode === "add"
                ? "https://be-university.onrender.com/api/permissions"
                : `https://be-university.onrender.com/api/permissions/${selectedPermission.id}`;

        const res = await fetch(url, {
            method,
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(formData),
        });

        const data = await res.json();
        if (modalMode === "add") {
            setPermission([...permissions, data]);
        } else {
            setPermission(permissions.map((r) => (r.id === data.id ? data : r)));
        }
        closeModal();
    };

    const handleDelete = async () => {
        if (!selectedPermission) return alert("Chọn quyền để xóa!");
        if (!window.confirm("Bạn có chắc muốn xóa quyền này?")) return;

        await fetch(`https://be-university.onrender.com/api/permissions/${selectedPermission.id}`, {
            method: "DELETE",
        });

        setPermission(permissions.filter((r) => r.id !== selectedPermission.id));
        setSelectedPermission(null);
    };

    return (
        <main className="container">
            <section className="banner-section">
                <h1 className="banner-title">🔐 Quản lý danh sách quyền</h1>
                <p className="banner-subtitle">Thêm, sửa, xóa hoặc xem chi tiết quyền người dùng.</p>
            </section>

            <div className="content-box">
                <div className="action-buttons">
                    <button onClick={() => openModal("add")} className="btn btn-blue">Thêm</button>
                    <button onClick={() => selectedPermission ? openModal("edit", selectedPermission) : alert("Chọn vai trò để sửa")} className="btn btn-yellow">Sửa</button>
                    <button onClick={handleDelete} className="btn btn-red">Xóa</button>
                </div>

                <table className="roles-table">
                    <thead>
                        <tr>
                            <th>Tên quyền</th>
                            <th>Chi tiết</th>
                        </tr>
                    </thead>
                    <tbody>
                        {roles.map((r) => (
                            <tr key={r.id} onClick={() => setSelectedPermission(r)} className={selectedPermission?.id === r.id ? "selected-row" : ""}>
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
                                value={formData.maPermission}
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