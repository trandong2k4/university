import React, { useEffect, useState } from "react";
import "../../styles/admin/manageDepartments.css";
import "../../styles/admin/manageEmployees.css";
import apiClient from "../../api/apiClient";

export default function ManageEmployees() {
    const [employees, setEmployees] = useState([]);
    const [users, setUsers] = useState([]);
    const [selected, setSelected] = useState(null);
    const [open, setOpen] = useState(false);
    const [mode, setMode] = useState("add"); // add | edit | view

    const [form, setForm] = useState({
        maNhanVien: "",
        hoTen: "",
        soDienThoai: "",
        viTri: "GIANG_VIEN",
        userId: "",
        ngayVaoLam: "",
        ngayNghiViec: "",
        tenNguoiDung: "",
    });

    useEffect(() => {
        loadData();
    }, []);

    const loadData = async () => {
        const [eRes, uRes] = await Promise.all([
            apiClient.get("/staffs"),
            apiClient.get("/users"),
        ]);
        setEmployees(eRes.data || []);
        setUsers(uRes.data || []);
    };

    const openModal = (m, emp) => {
        setMode(m);
        if (emp) {
            setForm({ ...emp });
            setSelected(emp);
        } else {
            setForm({
                maNhanVien: "",
                hoTen: "",
                soDienThoai: "",
                viTri: "GIANG_VIEN",
                userId: "",
                ngayVaoLam: new Date().toISOString().split("T")[0],
                ngayNghiViec: "",
                tenNguoiDung: "",
            });
            setSelected(null);
        }
        setOpen(true);
    };

    const save = async () => {
        const payload = { ...form };
        if (mode === "add") {
            const res = await apiClient.post("/staffs", payload);
            setEmployees([...employees, res.data]);
        }
        if (mode === "edit") {
            const res = await apiClient.put(`/staffs/${form.id}`, payload);
            setEmployees(employees.map(e => e.id === res.data.id ? res.data : e));
        }
        setOpen(false);
    };

    const remove = async () => {
        if (!selected) return;
        await apiClient.delete(`/staffs/${selected.id}`);
        setEmployees(employees.filter(e => e.id !== selected.id));
        setSelected(null);
    };

    return (
        <div className="crud-page">
            <section className="banner-section">
                <div className="banner-content">
                    <h1 className="banner-title">Quản Lý Nhân Sự</h1>
                    <p className="banner-subtitle">Hệ thống quản lý thông tin cán bộ, giảng viên</p>
                </div>
            </section>
            <div className="page-header">
                <div className="actions">
                    <button className="btn primary" onClick={() => openModal("add")}>+ Thêm</button>
                    <button className="btn" disabled={!selected} onClick={() => openModal("edit", selected)}>Sửa</button>
                    <button className="btn danger" disabled={!selected} onClick={remove}>Xóa</button>
                </div>
            </div>

            <table className="crud-table">
                <thead>
                    <tr>
                        <th>Mã Nhân viên</th>
                        <th>Họ tên</th>
                        <th>SĐT</th>
                        <th>Vị trí</th>
                        <th>User</th>
                        <th>Ngày vào</th>
                        <th></th>
                    </tr>
                </thead>
                <tbody>
                    {employees.map(e => (
                        <tr key={e.id} onClick={() => setSelected(e)} className={selected?.id === e.id ? "active" : ""}>
                            <td>{e.maNhanVien}</td>
                            <td>{e.hoTen}</td>
                            <td>{e.soDienThoai}</td>
                            <td><span className={`tag ${e.viTri}`}>{e.viTri}</span></td>
                            <td>{e.tenNguoiDung}</td>
                            <td>{e.ngayVaoLam}</td>
                            <td>
                                <button className="icon-btn" onClick={(ev) => { ev.stopPropagation(); openModal("view", e); }}>👁</button>
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>

            {open && (
                <div className="modal">
                    <div className="modal-card">
                        <h2>{mode === "add" ? "Thêm" : mode === "edit" ? "Cập nhật" : "Chi tiết"}</h2>
                        <div className="form-grid">
                            <input placeholder="Mã nhân viên" value={form.maNhanVien} disabled={mode === "view"}
                                onChange={e => setForm({ ...form, maNhanVien: e.target.value })} />
                            <input placeholder="Họ tên" value={form.hoTen} disabled={mode === "view"}
                                onChange={e => setForm({ ...form, hoTen: e.target.value })} />
                            <input placeholder="Số điện thoại" value={form.soDienThoai} disabled={mode === "view"}
                                onChange={e => setForm({ ...form, soDienThoai: e.target.value })} />
                            <select value={form.viTri} disabled={mode === "view"}
                                onChange={e => setForm({ ...form, viTri: e.target.value })}>
                                <option value="GIANG_VIEN">Giảng viên</option>
                                <option value="QUAN_TRI">Quản trị</option>
                                <option value="KE_TOAN">Kế toán</option>
                                <option value="HIEU_TRUONG">Hiệu trưởng</option>
                            </select>
                            <select value={form.userId} disabled={mode === "view"}
                                onChange={e => setForm({ ...form, userId: e.target.value })}>
                                <option value="">-- User --</option>
                                {users.map(u => <option key={u.id} value={u.id}>{u.username}</option>)}
                            </select>
                            <dev className="input-css">
                                <span>Ngày vào làm</span>
                                <input type="date" value={form.ngayVaoLam || ""} disabled={mode === "view"}
                                    onChange={e => setForm({ ...form, ngayVaoLam: e.target.value })} />
                            </dev>
                            <dev className="input-css">
                                <span>Ngày nghĩ việc</span>
                                <input type="date" value={form.ngayNghiViec || ""} disabled={mode === "view"}
                                    onChange={e => setForm({ ...form, ngayNghiViec: e.target.value })} />
                            </dev>
                        </div>
                        <div className="modal-actions">
                            <button className="btn" onClick={() => setOpen(false)}>Đóng</button>
                            {mode !== "view" && <button className="btn primary" onClick={save}>Lưu</button>}
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}