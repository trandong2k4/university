import React, { useState, useEffect } from "react";
import "../../styles/admin/manageEmployees.css";

export default function ManageEmployees() {
    const [employees, setEmployees] = useState([]);
    const [positions, setPositions] = useState([]);
    const [users, setUsers] = useState([]);
    const [selectedEmployee, setSelectedEmployee] = useState(null);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [modalMode, setModalMode] = useState("add");

    const [formData, setFormData] = useState({
        hoTen: "",
        email: "",
        soDienThoai: "",
        ngayVaoLam: "",
        ngayNghiViec: "",
        viTriId: "",
        userId: "",
    });

    useEffect(() => {
        fetch("http://localhost:8080/api/nhanviens")
            .then((res) => res.json())
            .then(setEmployees);

        fetch("http://localhost:8080/api/vitris")
            .then((res) => res.json())
            .then(setPositions);

        fetch("http://localhost:8080/api/users")
            .then((res) => res.json())
            .then(setUsers);
    }, []);

    const openModal = (mode, emp = null) => {
        setModalMode(mode);
        if (emp) {
            setFormData(emp);
        } else {
            setFormData({
                hoTen: "",
                email: "",
                soDienThoai: "",
                ngayVaoLam: "",
                ngayNghiViec: "",
                viTriId: "",
                userId: "",
            });
        }
        setIsModalOpen(true);
    };

    const closeModal = () => {
        setIsModalOpen(false);
        setSelectedEmployee(null);
    };

    const handleChange = (e) => {
        if (modalMode === "view") return;
        const { name, value } = e.target;
        setFormData((prev) => ({ ...prev, [name]: value }));
    };

    const handleSave = async (e) => {
        e.preventDefault();
        const method = modalMode === "add" ? "POST" : "PUT";
        const url =
            modalMode === "add"
                ? "http://localhost:8080/api/nhanviens"
                : `http://localhost:8080/api/nhanviens/${formData.id}`;

        const res = await fetch(url, {
            method,
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(formData),
        });

        const data = await res.json();
        if (modalMode === "add") {
            setEmployees([...employees, data]);
        } else {
            setEmployees(employees.map((e) => (e.id === data.id ? data : e)));
        }
        closeModal();
    };

    const handleDelete = async () => {
        if (!selectedEmployee) return alert("Chọn nhân viên để xóa!");
        if (!window.confirm("Bạn có chắc muốn xóa nhân viên này?")) return;

        await fetch(`http://localhost:8080/api/nhanviens/${selectedEmployee.id}`, {
            method: "DELETE",
        });

        setEmployees(employees.filter((e) => e.id !== selectedEmployee.id));
        setSelectedEmployee(null);
    };

    return (
        <main className="container">
            <section className="banner-section">
                <h1 className="banner-title">Quản lý Nhân viên</h1>
                <p className="banner-subtitle">Quản lý thông tin nhân sự trong hệ thống.</p>
            </section>

            <section className="mt-8">
                <div className="content-box">
                    <div className="action-buttons">
                        <button onClick={() => openModal("add")} className="btn btn-blue">Thêm</button>
                        <button onClick={() => selectedEmployee ? openModal("edit", selectedEmployee) : alert("Chọn nhân viên để sửa")} className="btn btn-yellow">Sửa</button>
                        <button onClick={handleDelete} className="btn btn-red">Xóa</button>
                    </div>

                    <table className="employees-table">
                        <thead>
                            <tr>
                                <th>Họ tên</th>
                                <th>Email</th>
                                <th>SĐT</th>
                                <th>Vị trí</th>
                                <th>Người dùng</th>
                                <th>Chi tiết</th>
                            </tr>
                        </thead>
                        <tbody>
                            {employees.map((e) => (
                                <tr key={e.id} onClick={() => setSelectedEmployee(e)} className={selectedEmployee?.id === e.id ? "selected-row" : ""}>
                                    <td>{e.hoTen}</td>
                                    <td>{e.email}</td>
                                    <td>{e.soDienThoai}</td>
                                    <td>{e.tenViTri}</td>
                                    <td>{e.tenNguoiDung}</td>
                                    <td>
                                        <button onClick={(ev) => { ev.stopPropagation(); openModal("view", e); }} className="btn btn-gray">Xem</button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </section>

            {isModalOpen && (
                <div className="modal-overlay">
                    <div className="modal-box">
                        <h2>{modalMode === "add" ? "Thêm nhân viên" : modalMode === "edit" ? "Sửa nhân viên" : "Chi tiết nhân viên"}</h2>
                        <form onSubmit={handleSave}>
                            <input name="hoTen" value={formData.hoTen} onChange={handleChange} placeholder="Họ tên" readOnly={modalMode === "view"} />
                            <input name="email" value={formData.email} onChange={handleChange} placeholder="Email" readOnly={modalMode === "view"} />
                            <input name="soDienThoai" value={formData.soDienThoai} onChange={handleChange} placeholder="Số điện thoại" readOnly={modalMode === "view"} />
                            <span>Ngày vào làm</span>
                            <input type="date" name="ngayVaoLam" value={formData.ngayVaoLam || ""} onChange={handleChange} readOnly={modalMode === "view"} />
                            <span>Ngày nghĩ việc</span>
                            <input type="date" name="ngayNghiViec" value={formData.ngayNghiViec || ""} onChange={handleChange} readOnly={modalMode === "view"} />
                            <select name="viTriId" value={formData.viTriId} onChange={handleChange} disabled={modalMode === "view"}>
                                <option value="">-- Chọn vị trí --</option>
                                {positions.map((p) => (
                                    <option key={p.id} value={p.id}>{p.tenViTri}</option>
                                ))}
                            </select>

                            <select name="userId" value={formData.userId} onChange={handleChange} disabled={modalMode === "view"}>
                                <option value="">-- Chọn người dùng --</option>
                                {users.map((u) => (
                                    <option key={u.id} value={u.id}>{u.fullName}</option>
                                ))}
                            </select>

                            <div className="modal-actions">
                                {modalMode !== "view" && <button type="submit" className="btn btn-green">Lưu</button>}
                                <button type="button" onClick={closeModal} className="btn btn-gray">Đóng</button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </main>
    );
}