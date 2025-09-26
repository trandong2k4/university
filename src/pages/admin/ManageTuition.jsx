// ManageTuition.jsx
import React, { useMemo, useState } from "react";
import mockData from "../../mockData";
import "../../styles/admin/manageTuition.css";

const formatVND = (n) => (typeof n === "number" ? n.toLocaleString("vi-VN") + " ₫" : "-");

export default function ManageTuition() {
    const db = mockData.entities || {};
    const [rows, setRows] = useState(db.hocPhi || []);
    const studentsById = useMemo(() => {
        const m = {}; (db.sinhVien || []).forEach(s => (m[s.id] = s)); return m;
    }, [db.sinhVien]);
    const kiById = useMemo(() => {
        const m = {}; (db.kiHoc || []).forEach(k => (m[k.id] = k)); return m;
    }, [db.kiHoc]);

    const onCell = (id, field, value) => {
        setRows(prev => prev.map(r => (r.id === id ? { ...r, [field]: field === "soTien" ? Number(value) : value } : r)));
    };
    const markPaid = (id) => setRows(prev => prev.map(r => (r.id === id ? { ...r, trangThai: "Đã đóng" } : r)));
    const remove = (id) => { if (confirm("Xóa khoản học phí?")) setRows(rows.filter(r => r.id !== id)); };

    return (
        <div className="tuition-container">
            <h1 className="tuition-title">Quản lý học phí</h1>

            <div className="tuition-table-wrapper">
                <table className="tuition-table">
                    <thead>
                        <tr>
                            <th>Sinh viên</th>
                            <th>Kỳ</th>
                            <th>Số tiền</th>
                            <th>Ngày đóng</th>
                            <th>Trạng thái</th>
                            <th>Thao tác</th>
                        </tr>
                    </thead>
                    <tbody>
                        {rows.map(r => {
                            const sv = studentsById[r.sinhVienId];
                            const k = kiById[r.kiHocId];
                            return (
                                <tr key={r.id}>
                                    <td>{sv?.tenSinhVien} <span className="tuition-sv-code">({sv?.maSinhVien})</span></td>
                                    <td>{k?.tenKiHoc}</td>
                                    <td>
                                        <input type="number" min="0" className="tuition-input"
                                            value={r.soTien ?? ""} onChange={(e) => onCell(r.id, "soTien", e.target.value)} />
                                    </td>
                                    <td>
                                        <input type="date" className="tuition-input"
                                            value={r.ngayDong || ""} onChange={(e) => onCell(r.id, "ngayDong", e.target.value)} />
                                    </td>
                                    <td>
                                        <select className="tuition-select"
                                            value={r.trangThai || "Chưa đóng"}
                                            onChange={(e) => onCell(r.id, "trangThai", e.target.value)}>
                                            <option>Chưa đóng</option>
                                            <option>Đã đóng</option>
                                            <option>Nợ</option>
                                        </select>
                                    </td>
                                    <td className="tuition-actions">
                                        <button className="tuition-btn-paid" onClick={() => markPaid(r.id)}>Đánh dấu đã đóng</button>
                                        <button className="tuition-btn-delete" onClick={() => remove(r.id)}>Xóa</button>
                                        <span className="tuition-current">Hiện tại: {formatVND(r.soTien)}</span>
                                    </td>
                                </tr>
                            );
                        })}
                        {!rows.length && <tr><td className="tuition-no-data" colSpan={6}>Chưa có dữ liệu.</td></tr>}
                    </tbody>
                </table>
            </div>
        </div>
    );
}
