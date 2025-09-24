// ManageCreditRegister.jsx - placeholder
import React, { useMemo, useState } from "react";
import mockData from "../../mockData";

export default function ManageCreditRegister() {
    const db = mockData.entities || {};
    const [rows, setRows] = useState(db.tinChi || []);

    const monHocById = useMemo(() => {
        const m = {}; (db.monHoc || []).forEach(x => (m[x.maMonHoc] = x)); return m;
    }, [db.monHoc]);
    const loaiById = useMemo(() => {
        const m = {}; (db.loaiTinChi || []).forEach(x => (m[x.id] = x)); return m;
    }, [db.loaiTinChi]);

    const [form, setForm] = useState({ maTinChi: "TCNEW", monHocId: "CS101", loaiTinChiId: 1, soLuong: 1 });

    const add = (e) => {
        e.preventDefault();
        const nextId = rows.length ? Math.max(...rows.map(x => x.id)) + 1 : 1;
        setRows([{ id: nextId, ...form, loaiTinChiId: Number(form.loaiTinChiId), soLuong: Number(form.soLuong) }, ...rows]);
    };

    const remove = (id) => {
        if (!confirm("Xóa tín chỉ này?")) return;
        setRows(rows.filter(r => r.id !== id));
    };

    return (
        <div className="space-y-5">
            <h1 className="text-2xl font-bold">Quản lý đăng ký tín chỉ</h1>

            <form onSubmit={add} className="bg-white rounded-xl border p-4 grid md:grid-cols-5 gap-3 text-sm">
                <input className="border rounded px-2 py-2" placeholder="Mã TC" value={form.maTinChi}
                    onChange={e => setForm({ ...form, maTinChi: e.target.value })} />
                <input className="border rounded px-2 py-2" placeholder="Mã môn (CS101)" value={form.monHocId}
                    onChange={e => setForm({ ...form, monHocId: e.target.value })} />
                <select className="border rounded px-2 py-2" value={form.loaiTinChiId}
                    onChange={e => setForm({ ...form, loaiTinChiId: Number(e.target.value) })}>
                    {(db.loaiTinChi || []).map(l => <option key={l.id} value={l.id}>{l.tenLoai}</option>)}
                </select>
                <input type="number" min="1" className="border rounded px-2 py-2" placeholder="Số lượng"
                    value={form.soLuong} onChange={e => setForm({ ...form, soLuong: e.target.value })} />
                <button className="bg-blue-600 text-white rounded px-3 py-2">Thêm (mock)</button>
            </form>

            <div className="overflow-x-auto bg-white rounded-xl border">
                <table className="min-w-[880px] w-full text-sm">
                    <thead className="bg-gray-50 text-gray-600">
                        <tr>
                            <th className="p-3 text-left">Mã TC</th>
                            <th className="p-3 text-left">Môn học</th>
                            <th className="p-3 text-left">Loại</th>
                            <th className="p-3 text-left">Số lượng</th>
                            <th className="p-3 text-left">Thao tác</th>
                        </tr>
                    </thead>
                    <tbody>
                        {rows.map(r => (
                            <tr key={r.id} className="border-t">
                                <td className="p-3 font-mono">{r.maTinChi}</td>
                                <td className="p-3">{monHocById[r.monHocId]?.tenMonHoc || r.monHocId}</td>
                                <td className="p-3">{loaiById[r.loaiTinChiId]?.tenLoai || "-"}</td>
                                <td className="p-3">{r.soLuong}</td>
                                <td className="p-3">
                                    <button className="px-3 py-1 text-sm rounded bg-rose-600 text-white" onClick={() => remove(r.id)}>Xóa</button>
                                </td>
                            </tr>
                        ))}
                        {!rows.length && <tr><td className="p-3 text-gray-500" colSpan={5}>Chưa có tín chỉ.</td></tr>}
                    </tbody>
                </table>
            </div>
        </div>
    );
}
