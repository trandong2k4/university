// ManageCreditRegister.jsx
import React, { useMemo, useState } from "react";
import mockData from "../../mockData";
import "../../styles/admin/manageCreditRegister.css";

export default function ManageCreditRegister() {
    const db = mockData.entities || {};
    const [rows, setRows] = useState(db.tinChi || []);

    const monHocById = useMemo(() => {
        const m = {};
        (db.monHoc || []).forEach(x => (m[x.maMonHoc] = x));
        return m;
    }, [db.monHoc]);

    const loaiById = useMemo(() => {
        const m = {};
        (db.loaiTinChi || []).forEach(x => (m[x.id] = x));
        return m;
    }, [db.loaiTinChi]);

    const [form, setForm] = useState({
        maTinChi: "TCNEW",
        monHocId: "CS101",
        loaiTinChiId: 1,
        soLuong: 1
    });

    const add = (e) => {
        e.preventDefault();
        const nextId = rows.length ? Math.max(...rows.map(x => x.id)) + 1 : 1;
        setRows([
            { id: nextId, ...form, loaiTinChiId: Number(form.loaiTinChiId), soLuong: Number(form.soLuong) },
            ...rows
        ]);
    };

    const remove = (id) => {
        if (!confirm("Xóa tín chỉ này?")) return;
        setRows(rows.filter(r => r.id !== id));
    };

    return (
        <div className="manage-credit-container space-y-5">
            <h1 className="manage-credit-title">Quản lý đăng ký tín chỉ</h1>

            <form onSubmit={add} className="manage-credit-form grid md:grid-cols-5 gap-3">
                <input
                    className="manage-credit-input"
                    placeholder="Mã TC"
                    value={form.maTinChi}
                    onChange={e => setForm({ ...form, maTinChi: e.target.value })}
                />
                <input
                    className="manage-credit-input"
                    placeholder="Mã môn (CS101)"
                    value={form.monHocId}
                    onChange={e => setForm({ ...form, monHocId: e.target.value })}
                />
                <select
                    className="manage-credit-select"
                    value={form.loaiTinChiId}
                    onChange={e => setForm({ ...form, loaiTinChiId: Number(e.target.value) })}
                >
                    {(db.loaiTinChi || []).map(l => (
                        <option key={l.id} value={l.id}>{l.tenLoai}</option>
                    ))}
                </select>
                <input
                    type="number"
                    min="1"
                    className="manage-credit-input"
                    placeholder="Số lượng"
                    value={form.soLuong}
                    onChange={e => setForm({ ...form, soLuong: e.target.value })}
                />
                <button className="manage-credit-btn">Thêm (mock)</button>
            </form>

            <div className="manage-credit-table-wrapper">
                <table className="manage-credit-table">
                    <thead className="manage-credit-thead">
                        <tr>
                            <th>Mã TC</th>
                            <th>Môn học</th>
                            <th>Loại</th>
                            <th>Số lượng</th>
                            <th>Thao tác</th>
                        </tr>
                    </thead>
                    <tbody>
                        {rows.map(r => (
                            <tr key={r.id}>
                                <td className="manage-credit-td">{r.maTinChi}</td>
                                <td className="manage-credit-td">{monHocById[r.monHocId]?.tenMonHoc || r.monHocId}</td>
                                <td className="manage-credit-td">{loaiById[r.loaiTinChiId]?.tenLoai || "-"}</td>
                                <td className="manage-credit-td">{r.soLuong}</td>
                                <td className="manage-credit-td">
                                    <button className="manage-credit-delete" onClick={() => remove(r.id)}>Xóa</button>
                                </td>
                            </tr>
                        ))}
                        {!rows.length && (
                            <tr>
                                <td colSpan={5} className="manage-credit-empty">Chưa có tín chỉ.</td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    );
}
