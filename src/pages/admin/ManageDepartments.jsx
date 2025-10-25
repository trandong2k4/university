import React, { useState, useEffect } from "react";
import "../../styles/admin/manageDepartments.css";

export default function ManageDepartments() {
    const [departments, setDepartments] = useState([]);
    const [schools, setSchools] = useState([]);
    const [selectedDepartment, setSelectedDepartment] = useState(null);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [modalMode, setModalMode] = useState("add");

    const [formData, setFormData] = useState({
        maKhoa: "",
        tenKhoa: "",
        truongId: "",
    });

    useEffect(() => {
        fetch("http://localhost:8080/api/khoas")
            .then((res) => res.json())
            .then(setDepartments);

        fetch("http://localhost:8080/api/truongs")
            .then((res) => res.json())
            .then(setSchools);
    }, []);

    const openModal = (mode, dept = null) => {
        setModalMode(mode);
        if (dept) {
            setFormData(dept);
        } else {
            setFormData({
                maKhoa: "KH" + (departments.length + 1) * 100,
                tenKhoa: "",
                truongId: "",
            });
        }
        setIsModalOpen(true);
    };

    const closeModal = () => {
        setIsModalOpen(false);
        setSelectedDepartment(null);
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
                ? "http://localhost:8080/api/khoas"
                : `http://localhost:8080/api/khoas/${formData.id}`;

        const res = await fetch(url, {
            method,
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(formData),
        });

        const data = await res.json();
        if (modalMode === "add") {
            setDepartments([...departments, data]);
        } else {
            setDepartments(departments.map((d) => (d.id === data.id ? data : d)));
        }
        closeModal();
    };

    const handleDelete = async () => {
        if (!selectedDepartment) return alert("Chọn khoa để xóa!");
        if (!window.confirm("Bạn có chắc muốn xóa khoa này?")) return;

        await fetch(`http://localhost:8080/api/khoas/${selectedDepartment.id}`, {
            method: "DELETE",
        });

        setDepartments(departments.filter((d) => d.id !== selectedDepartment.id));
        setSelectedDepartment(null);
    };

    return (
        <main className="container">
            <section className="banner-section">
                <h1 className="banner-title">Quản lý Khoa</h1>
                <p className="banner-subtitle">Quản lý thông tin các khoa trong hệ thống.</p>
            </section>

            <section className="mt-8">
                <div className="content-box">
                    <div className="action-buttons">
                        <button onClick={() => openModal("add")} className="btn btn-blue">Thêm</button>
                        <button onClick={() => selectedDepartment ? openModal("edit", selectedDepartment) : alert("Chọn khoa để sửa")} className="btn btn-yellow">Sửa</button>
                        <button onClick={handleDelete} className="btn btn-red">Xóa</button>
                    </div>

                    <table className="departments-table">
                        <thead>
                            <tr>
                                <th>Mã khoa</th>
                                <th>Tên khoa</th>
                                <th>Trường</th>
                                <th>Chi tiết</th>
                            </tr>
                        </thead>
                        <tbody>
                            {departments.map((d) => (
                                <tr key={d.id} onClick={() => setSelectedDepartment(d)} className={selectedDepartment?.id === d.id ? "selected-row" : ""}>
                                    <td>{d.maKhoa}</td>
                                    <td>{d.tenKhoa}</td>
                                    <td>{d.tenTruong}</td>
                                    <td>
                                        <button onClick={(ev) => { ev.stopPropagation(); openModal("view", d); }} className="btn btn-gray">Xem</button>
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
                        <h2>{modalMode === "add" ? "Thêm khoa" : modalMode === "edit" ? "Sửa khoa" : "Chi tiết khoa"}</h2>
                        <form onSubmit={handleSave}>
                            <input name="maKhoa" value={formData.maKhoa} onChange={handleChange} placeholder="Mã khoa" readOnly={modalMode !== "add"} />
                            <input name="tenKhoa" value={formData.tenKhoa} onChange={handleChange} placeholder="Tên khoa" readOnly={modalMode === "view"} />

                            <select name="truongId" value={formData.truongId} onChange={handleChange} disabled={modalMode === "view"}>
                                <option value="">-- Chọn trường --</option>
                                {schools.map((s) => (
                                    <option key={s.id} value={s.id}>{s.tenTruong}</option>
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