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

    // Fetch dữ liệu khi component mount
    useEffect(() => {
        const fetchData = async () => {
            try {
                const [staffsRes, positionsRes, usersRes] = await Promise.all([
                    apiClient.get("/staffs"),
                    apiClient.get("/locations"),
                    apiClient.get("/users"),
                ]);

                setEmployees(staffsRes.data);
                setPositions(positionsRes.data);
                setUsers(usersRes.data);
            } catch (err) {
                console.error("Lỗi fetch dữ liệu:", err.response?.data || err);
            }
        };
        fetchData();
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

    // Lưu nhân viên (thêm hoặc sửa)
    const handleSave = async (e) => {
        e.preventDefault();

        try {
            let res;
            if (modalMode === "add") {
                res = await apiClient.post("/staffs", formData);
                setEmployees([...employees, res.data]);
                alert("Thêm nhân viên thành công!");
            } else {
                res = await apiClient.put(`/staffs/${formData.id}`, formData);
                setEmployees(employees.map((e) => (e.id === res.data.id ? res.data : e)));
                alert("Cập nhật nhân viên thành công!");
            }
            closeModal();
        } catch (err) {
            console.error("Lỗi lưu nhân viên:", err.response?.data || err);
            alert("Thao tác thất bại!");
        }
    };

    // Xóa nhân viên
    const handleDelete = async () => {
        if (!selectedEmployee) return alert("Chọn nhân viên để xóa!");
        if (!window.confirm("Bạn có chắc muốn xóa nhân viên này?")) return;

        try {
            await apiClient.delete(`/staffs/${selectedEmployee.id}`);
            setEmployees(employees.filter((e) => e.id !== selectedEmployee.id));
            setSelectedEmployee(null);
            alert("Xóa nhân viên thành công!");
        } catch (err) {
            console.error("Lỗi xóa nhân viên:", err.response?.data || err);
            alert("Xóa thất bại!");
        }
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