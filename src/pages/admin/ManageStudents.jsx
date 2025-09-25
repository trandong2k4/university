// ManageStudents.jsx
import React, { useMemo, useState } from "react";
import mockData from "../../mockData";
import "../../styles/manageStudents.css";

export default function ManageStudents() {
    const [rows, setRows] = useState(mockData.entities.sinhVien || []);
    const detailBySv = useMemo(() => {
        const map = {};
        (mockData.entities.chiTietSinhVien || []).forEach(d => (map[d.sinhVienId] = d));
        return map;
    }, []);

    const [form, setForm] = useState({ maSinhVien: "", tenSinhVien: "" });

    const addStudent = (e) => {
        e.preventDefault();
        if (!form.maSinhVien || !form.tenSinhVien) return;
        const nextId = rows.length ? Math.max(...rows.map(x => x.id)) + 1 : 1;
        setRows([{ id: nextId, ...form, userId: null }, ...rows]);
        setForm({ maSinhVien: "", tenSinhVien: "" });
    };

    const remove = (id) => {
        if (!confirm("Xóa sinh viên này?")) return;
        setRows(rows.filter(r => r.id !== id));
    };

    return (
        <div className="ms-container">
            <h1 className="ms-title">Quản lý sinh viên</h1>

            <form onSubmit={addStudent} className="ms-form">
                <input
                    className="ms-input"
                    placeholder="Mã SV"
                    value={form.maSinhVien}
                    onChange={e => setForm({ ...form, maSinhVien: e.target.value })}
                />
                <input
                    className="ms-input"
                    placeholder="Tên sinh viên"
                    value={form.tenSinhVien}
                    onChange={e => setForm({ ...form, tenSinhVien: e.target.value })}
                />
                <button className="ms-btn-add">Thêm (mock)</button>
            </form>

            <div className="ms-table-wrapper">
                <table className="ms-table">
                    <thead className="ms-thead">
                        <tr>
                            <th>Mã SV</th>
                            <th>Tên</th>
                            <th>Email</th>
                            <th>SĐT</th>
                            <th>Địa chỉ</th>
                            <th>Thao tác</th>
                        </tr>
                    </thead>
                    <tbody>
                        {rows.map(r => {
                            const d = detailBySv[r.id];
                            return (
                                <tr key={r.id} className="ms-tr">
                                    <td className="ms-td-code">{r.maSinhVien}</td>
                                    <td className="ms-td">{r.tenSinhVien}</td>
                                    <td className="ms-td">{d?.email || "—"}</td>
                                    <td className="ms-td">{d?.soDienThoai || "—"}</td>
                                    <td className="ms-td">{d?.diaChi || "—"}</td>
                                    <td className="ms-td">
                                        <button className="ms-btn-remove" onClick={() => remove(r.id)}>Xóa</button>
                                    </td>
                                </tr>
                            );
                        })}
                        {!rows.length && (
                            <tr>
                                <td className="ms-no-data" colSpan={6}>Không có sinh viên.</td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    );
}
