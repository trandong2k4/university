// ManageSchedule.jsx
import React, { useMemo, useState } from "react";
import mockData from "../../mockData";
import "../../styles/admin/manageSchedule.css";

const dayNames = { 2: "Thứ 2", 3: "Thứ 3", 4: "Thứ 4", 5: "Thứ 5", 6: "Thứ 6", 7: "Thứ 7" };

export default function ManageSchedule() {
    const db = mockData.entities || {};
    const [rows, setRows] = useState(db.lichHoc || []);
    const monHocById = useMemo(() => {
        const m = {};
        (db.monHoc || []).forEach(x => (m[x.maMonHoc] = x));
        return m;
    }, [db.monHoc]);
    const phongById = useMemo(() => {
        const m = {};
        (db.phongHoc || []).forEach(x => (m[x.id] = x));
        return m;
    }, [db.phongHoc]);
    const gioById = useMemo(() => {
        const m = {};
        (db.gioHoc || []).forEach(x => (m[x.id] = x));
        return m;
    }, [db.gioHoc]);
    const buoiById = useMemo(() => {
        const m = {};
        (db.buoiHoc || []).forEach(x => (m[x.id] = x));
        return m;
    }, [db.buoiHoc]);
    const kiById = useMemo(() => {
        const m = {};
        (db.kiHoc || []).forEach(x => (m[x.id] = x));
        return m;
    }, [db.kiHoc]);

    const [form, setForm] = useState({
        monHocId: "CS101", phongHocId: 1, gioHocId: 1, buoiHocId: 1, kiHocId: 1, thuTrongTuan: 2
    });

    const add = (e) => {
        e.preventDefault();
        const nextId = rows.length ? Math.max(...rows.map(x => x.id)) + 1 : 1;
        setRows([{ id: nextId, maLichHoc: `LH${String(nextId).padStart(3, "0")}`, ...form }, ...rows]);
    };

    const remove = (id) => {
        if (!confirm("Xóa lịch học này?")) return;
        setRows(rows.filter(r => r.id !== id));
    };

    return (
        <div className="manage-container space-y-5">
            <h1 className="manage-title">Quản lý lịch học</h1>

            <form onSubmit={add} className="manage-form grid md:grid-cols-6 gap-3 text-sm">
                <input className="manage-input" placeholder="Mã môn (vd: CS101)"
                    value={form.monHocId} onChange={e => setForm({ ...form, monHocId: e.target.value })} />
                <select className="manage-select" value={form.phongHocId} onChange={e => setForm({ ...form, phongHocId: Number(e.target.value) })}>
                    {(db.phongHoc || []).map(p => <option key={p.id} value={p.id}>{p.tenPhong}</option>)}
                </select>
                <select className="manage-select" value={form.gioHocId} onChange={e => setForm({ ...form, gioHocId: Number(e.target.value) })}>
                    {(db.gioHoc || []).map(g => <option key={g.id} value={g.id}>{g.gioBatDau}-{g.gioKetThuc}</option>)}
                </select>
                <select className="manage-select" value={form.buoiHocId} onChange={e => setForm({ ...form, buoiHocId: Number(e.target.value) })}>
                    {(db.buoiHoc || []).map(b => <option key={b.id} value={b.id}>{b.tenBuoi}</option>)}
                </select>
                <select className="manage-select" value={form.kiHocId} onChange={e => setForm({ ...form, kiHocId: Number(e.target.value) })}>
                    {(db.kiHoc || []).map(k => <option key={k.id} value={k.id}>{k.tenKiHoc}</option>)}
                </select>
                <select className="manage-select" value={form.thuTrongTuan} onChange={e => setForm({ ...form, thuTrongTuan: Number(e.target.value) })}>
                    {[2, 3, 4, 5, 6, 7].map(d => <option key={d} value={d}>{dayNames[d]}</option>)}
                </select>
                <div className="md:col-span-6">
                    <button className="manage-btn-add">Thêm lịch (mock)</button>
                </div>
            </form>

            <div className="manage-table-wrapper">
                <table className="manage-table">
                    <thead className="manage-table-head">
                        <tr>
                            <th>Mã lịch</th>
                            <th>Môn học</th>
                            <th>Phòng</th>
                            <th>Buổi</th>
                            <th>Tiết/Giờ</th>
                            <th>Thứ</th>
                            <th>Kỳ</th>
                            <th>Thao tác</th>
                        </tr>
                    </thead>
                    <tbody>
                        {rows.map(r => {
                            const m = monHocById[r.monHocId];
                            const p = phongById[r.phongHocId];
                            const g = gioById[r.gioHocId];
                            const b = buoiById[r.buoiHocId];
                            const k = kiById[r.kiHocId];
                            return (
                                <tr key={r.id} className="manage-table-row">
                                    <td className="manage-table-cell">{r.maLichHoc || `LH-${r.id}`}</td>
                                    <td className="manage-table-cell">{m?.tenMonHoc} <span className="manage-table-sub">{r.monHocId}</span></td>
                                    <td className="manage-table-cell">{p?.tenPhong}</td>
                                    <td className="manage-table-cell">{b?.tenBuoi}</td>
                                    <td className="manage-table-cell">{g ? `Tiết ${g.tietBatDau}-${g.tietKetThuc} (${g.gioBatDau}-${g.gioKetThuc})` : "-"}</td>
                                    <td className="manage-table-cell">{dayNames[r.thuTrongTuan]}</td>
                                    <td className="manage-table-cell">{k?.tenKiHoc}</td>
                                    <td className="manage-table-cell">
                                        <button className="manage-btn-remove" onClick={() => remove(r.id)}>Xóa</button>
                                    </td>
                                </tr>
                            );
                        })}
                        {!rows.length && <tr><td className="manage-empty" colSpan={8}>Chưa có lịch.</td></tr>}
                    </tbody>
                </table>
            </div>
        </div>
    );
}
