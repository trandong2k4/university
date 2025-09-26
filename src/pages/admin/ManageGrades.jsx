// ManageGrades.jsx
import React, { useMemo, useState } from "react";
import mockData from "../../mockData";
<<<<<<< HEAD
import "../../styles/manageGrades.css";
=======
import "../../styles/admin/manageGrades.css";
>>>>>>> 3725551 (Publiclayout)

export default function ManageGrades() {
    const db = mockData.entities || {};
    const [rows, setRows] = useState(db.ketQuaHocTap || []);

    const studentsById = useMemo(() => {
        const m = {};
        (db.sinhVien || []).forEach(s => (m[s.id] = s));
        return m;
    }, [db.sinhVien]);

    const monHocById = useMemo(() => {
        const m = {};
        (db.monHoc || []).forEach(x => (m[x.maMonHoc] = x));
        return m;
    }, [db.monHoc]);

    const kiById = useMemo(() => {
        const m = {};
        (db.kiHoc || []).forEach(k => (m[k.id] = k));
        return m;
    }, [db.kiHoc]);

    const onCell = (id, field, value) => {
        setRows(prev =>
            prev.map(r => (r.id === id ? { ...r, [field]: field.startsWith("diem") ? Number(value) : value } : r))
        );
    };

    const remove = (id) => {
        if (!confirm("Xóa bản điểm này?")) return;
        setRows(rows.filter(r => r.id !== id));
    };

    return (
        <div className="grades-container">

            <h1 className="grades-title">Quản lý điểm</h1>

            <div className="grades-table-wrapper">
                <table className="grades-table">
                    <thead>
                        <tr>
                            <th>Sinh viên</th>
                            <th>Môn học</th>
                            <th>Kỳ</th>
                            <th>Quá trình</th>
                            <th>Cuối kỳ</th>
                            <th>Tổng kết</th>
                            <th>Xếp loại</th>
                            <th>Thao tác</th>
                        </tr>
                    </thead>
                    <tbody>
                        {rows.map(r => {
                            const sv = studentsById[r.sinhVienId];
                            const m = monHocById[r.monHocId];
                            const k = kiById[r.kiHocId];
                            return (
                                <tr key={r.id}>
                                    <td>{sv?.tenSinhVien} <span className="grades-small">({sv?.maSinhVien})</span></td>
                                    <td>{m?.tenMonHoc} <span className="grades-small">({r.monHocId})</span></td>
                                    <td>{k?.tenKiHoc}</td>
                                    <td><input type="number" step="0.1" min="0" max="10" className="grades-input" value={r.diemQuaTrinh ?? ""} onChange={(e) => onCell(r.id, "diemQuaTrinh", e.target.value)} /></td>
                                    <td><input type="number" step="0.1" min="0" max="10" className="grades-input" value={r.diemCuoiKy ?? ""} onChange={(e) => onCell(r.id, "diemCuoiKy", e.target.value)} /></td>
                                    <td><input type="number" step="0.1" min="0" max="10" className="grades-input" value={r.diemTongKet ?? ""} onChange={(e) => onCell(r.id, "diemTongKet", e.target.value)} /></td>
                                    <td><input className="grades-input grades-input-small" value={r.xepLoai ?? ""} onChange={(e) => onCell(r.id, "xepLoai", e.target.value)} /></td>
                                    <td>
                                        <button className="grades-btn-remove" onClick={() => remove(r.id)}>Xóa</button>
                                    </td>
                                </tr>
                            );
                        })}
                        {!rows.length && (
                            <tr>
                                <td colSpan={8} className="grades-empty">Chưa có dữ liệu điểm.</td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>

            <div className="grades-note">* Lưu ý: Đây là mock, thay đổi chỉ lưu tại state.</div>
        </div>
    );
}
