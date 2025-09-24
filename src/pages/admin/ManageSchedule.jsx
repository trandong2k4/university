// ManageSchedule.jsx - placeholder
import React, { useMemo, useState } from "react";
import mockData from "../../mockData";

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
        <div className="space-y-5">
            <h1 className="text-2xl font-bold">Quản lý lịch học</h1>

            <form onSubmit={add} className="bg-white rounded-xl border p-4 grid md:grid-cols-6 gap-3 text-sm">
                <input className="border rounded px-2 py-2" placeholder="Mã môn (vd: CS101)"
                    value={form.monHocId} onChange={e => setForm({ ...form, monHocId: e.target.value })} />
                <select className="border rounded px-2 py-2" value={form.phongHocId} onChange={e => setForm({ ...form, phongHocId: Number(e.target.value) })}>
                    {(db.phongHoc || []).map(p => <option key={p.id} value={p.id}>{p.tenPhong}</option>)}
                </select>
                <select className="border rounded px-2 py-2" value={form.gioHocId} onChange={e => setForm({ ...form, gioHocId: Number(e.target.value) })}>
                    {(db.gioHoc || []).map(g => <option key={g.id} value={g.id}>{g.gioBatDau}-{g.gioKetThuc}</option>)}
                </select>
                <select className="border rounded px-2 py-2" value={form.buoiHocId} onChange={e => setForm({ ...form, buoiHocId: Number(e.target.value) })}>
                    {(db.buoiHoc || []).map(b => <option key={b.id} value={b.id}>{b.tenBuoi}</option>)}
                </select>
                <select className="border rounded px-2 py-2" value={form.kiHocId} onChange={e => setForm({ ...form, kiHocId: Number(e.target.value) })}>
                    {(db.kiHoc || []).map(k => <option key={k.id} value={k.id}>{k.tenKiHoc}</option>)}
                </select>
                <select className="border rounded px-2 py-2" value={form.thuTrongTuan} onChange={e => setForm({ ...form, thuTrongTuan: Number(e.target.value) })}>
                    {[2, 3, 4, 5, 6, 7].map(d => <option key={d} value={d}>{dayNames[d]}</option>)}
                </select>
                <div className="md:col-span-6">
                    <button className="bg-blue-600 text-white rounded px-3 py-2">Thêm lịch (mock)</button>
                </div>
            </form>

            <div className="overflow-x-auto bg-white rounded-xl border">
                <table className="min-w-[960px] w-full text-sm">
                    <thead className="bg-gray-50 text-gray-600">
                        <tr>
                            <th className="p-3 text-left">Mã lịch</th>
                            <th className="p-3 text-left">Môn học</th>
                            <th className="p-3 text-left">Phòng</th>
                            <th className="p-3 text-left">Buổi</th>
                            <th className="p-3 text-left">Tiết/Giờ</th>
                            <th className="p-3 text-left">Thứ</th>
                            <th className="p-3 text-left">Kỳ</th>
                            <th className="p-3 text-left">Thao tác</th>
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
                                <tr key={r.id} className="border-t">
                                    <td className="p-3 font-mono">{r.maLichHoc || `LH-${r.id}`}</td>
                                    <td className="p-3">{m?.tenMonHoc} <span className="text-xs text-gray-500">({r.monHocId})</span></td>
                                    <td className="p-3">{p?.tenPhong}</td>
                                    <td className="p-3">{b?.tenBuoi}</td>
                                    <td className="p-3">{g ? `Tiết ${g.tietBatDau}-${g.tietKetThuc} (${g.gioBatDau}-${g.gioKetThuc})` : "-"}</td>
                                    <td className="p-3">{dayNames[r.thuTrongTuan]}</td>
                                    <td className="p-3">{k?.tenKiHoc}</td>
                                    <td className="p-3">
                                        <button className="px-3 py-1 text-sm rounded bg-rose-600 text-white" onClick={() => remove(r.id)}>Xóa</button>
                                    </td>
                                </tr>
                            );
                        })}
                        {!rows.length && <tr><td className="p-3 text-gray-500" colSpan={8}>Chưa có lịch.</td></tr>}
                    </tbody>
                </table>
            </div>
        </div>
    );
}
