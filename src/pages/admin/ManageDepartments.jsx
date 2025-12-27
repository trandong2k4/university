import React, { useState, useEffect } from "react";
import apiClient from "/src/api/apiClient";
import "../../styles/admin/manageDepartments.css";

export default function ManageDepartments() {
    const [departments, setDepartments] = useState([]);
    const [schools, setSchools] = useState([]);
    const [selectedDepartment, setSelectedDepartment] = useState(null);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [modalMode, setModalMode] = useState("add");

    const [formData, setFormData] = useState({
        id: "",
        maKhoa: "",
        tenKhoa: "",
        truongId: "",
        tenTruong: "",
    });

    useEffect(() => {
        const fetchData = async () => {
            try {
                const [departmentsRes, schoolsRes] = await Promise.all([apiClient.get("/departments"), apiClient.get("/schools")]);
                setDepartments(departmentsRes.data);
                setSchools(schoolsRes.data);
            } catch (err) {
                console.error("Lỗi fetch dữ liệu:", err.response?.data || err);
            }
        };
        fetchData();
    }, []);

    const openModal = (mode, dept = null) => {
        setModalMode(mode);
        if (dept) {
            setFormData({
                id: dept.id,
                maKhoa: dept.maKhoa,
                tenKhoa: dept.tenKhoa,
                truongId: dept.truongId || "",
                tenTruong: dept.tenTruong || "",
            });
        } else {
            setFormData({
                id: "",
                maKhoa: "KH" + (departments.length + 1) * 100,
                tenKhoa: "",
                truongId: "",
                tenTruong: "",
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
        try {
            let res;
            if (modalMode === "add") {
                res = await apiClient.post("/departments", formData);
                setDepartments([...departments, res.data]);
                alert("Thêm khoa thành công!");
            } else {
                res = await apiClient.put(`/departments/${formData.id}`, formData);
                setDepartments(
                    departments.map((d) => (d.id === res.data.id ? res.data : d))
                );
                alert("Cập nhật khoa thành công!");
            }
            closeModal();
        } catch (err) {
            console.error("Lỗi lưu khoa:", err.response?.data || err);
            alert("Thao tác thất bại!");
        }
    };

    const handleDelete = async () => {
        if (!selectedDepartment) return alert("Chọn khoa để xóa!");
        if (!window.confirm("Bạn có chắc muốn xóa khoa này?")) return;

        try {
            await apiClient.delete(`/departments/${selectedDepartment.id}`);
            setDepartments(departments.filter((d) => d.id !== selectedDepartment.id));
            setSelectedDepartment(null);
            alert("Xóa khoa thành công!");
        } catch (err) {
            console.error("Lỗi xóa khoa:", err.response?.data || err);
            alert("Xóa thất bại!");
        }
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
                        <button
                            onClick={() => selectedDepartment ? openModal("edit", selectedDepartment) : alert("Chọn khoa để sửa")}
                            className="btn btn-yellow"
                        >
                            Sửa
                        </button>
                        <button onClick={handleDelete} className="btn btn-red">Xóa</button>
                    </div>

                    <table className="departments-table">
                        <thead>
                            <tr>
                                <th>Mã khoa</th>
                                <th>Tên khoa</th>
                                <th>Chi tiết</th>
                            </tr>
                        </thead>
                        <tbody>
                            {departments.map((d) => (
                                <tr
                                    key={d.id}
                                    onClick={() => setSelectedDepartment(d)}
                                    className={selectedDepartment?.id === d.id ? "selected-row" : ""}
                                >
                                    <td>{d.maKhoa}</td>
                                    <td>{d.tenKhoa}</td>
                                    <td>
                                        <button
                                            onClick={(ev) => { ev.stopPropagation(); openModal("view", d); }}
                                            className="btn btn-gray"
                                        >
                                            Xem chi tiết
                                        </button>
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
                        <h2>
                            {modalMode === "add" ? "Thêm khoa" : modalMode === "edit" ? "Sửa khoa" : "Chi tiết khoa"}
                        </h2>
                        <form onSubmit={handleSave}>
                            <input
                                name="maKhoa"
                                value={formData.maKhoa}
                                onChange={handleChange}
                                placeholder="Mã khoa"
                                readOnly={modalMode !== "add"}
                            />

                            <input
                                name="tenKhoa"
                                value={formData.tenKhoa}
                                onChange={handleChange}
                                placeholder="Tên khoa"
                                readOnly={modalMode === "view"}
                            />

                            {modalMode === "view" ? (
                                <input
                                    value={formData.tenTruong || ""}
                                    readOnly
                                    placeholder="Tên trường"
                                />
                            ) : (
                                <select
                                    name="truongId"
                                    value={formData.truongId}
                                    onChange={handleChange}
                                >
                                    <option value="">-- Chọn trường --</option>
                                    {schools.map((s) => (
                                        <option key={s.id} value={s.id}>{s.tenTruong}</option>
                                    ))}
                                </select>
                            )}

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
