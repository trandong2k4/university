// ManageStudents.jsx - placeholder
import React, { useMemo, useState } from "react";
import mockData from "../../mockData";

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
        <div className="space-y-5">
            <h1 className="text-2xl font-bold">Quản lý sinh viên</h1>

            <form onSubmit={addStudent} className="bg-white rounded-xl border p-4 grid md:grid-cols-3 gap-3">
                <input className="border rounded px-3 py-2" placeholder="Mã SV"
                    value={form.maSinhVien} onChange={e => setForm({ ...form, maSinhVien: e.target.value })} />
                <input className="border rounded px-3 py-2" placeholder="Tên sinh viên"
                    value={form.tenSinhVien} onChange={e => setForm({ ...form, tenSinhVien: e.target.value })} />
                <button className="bg-blue-600 text-white rounded px-3 py-2">Thêm (mock)</button>
            </form>

            <div className="overflow-x-auto bg-white rounded-xl border">
                <table className="min-w-[820px] w-full text-sm">
                    <thead className="bg-gray-50 text-gray-600">
                        <tr>
                            <th className="p-3 text-left">Mã SV</th>
                            <th className="p-3 text-left">Tên</th>
                            <th className="p-3 text-left">Email</th>
                            <th className="p-3 text-left">SĐT</th>
                            <th className="p-3 text-left">Địa chỉ</th>
                            <th className="p-3 text-left">Thao tác</th>
                        </tr>
                    </thead>
                    <tbody>
                        {rows.map(r => {
                            const d = detailBySv[r.id];
                            return (
                                <tr key={r.id} className="border-t">
                                    <td className="p-3 font-mono">{r.maSinhVien}</td>
                                    <td className="p-3">{r.tenSinhVien}</td>
                                    <td className="p-3">{d?.email || "—"}</td>
                                    <td className="p-3">{d?.soDienThoai || "—"}</td>
                                    <td className="p-3">{d?.diaChi || "—"}</td>
                                    <td className="p-3">
                                        <button className="px-3 py-1 text-sm rounded bg-rose-600 text-white"
                                            onClick={() => remove(r.id)}>Xóa</button>
                                    </td>
                                </tr>
                            );
                        })}
                        {!rows.length && <tr><td className="p-3 text-gray-500" colSpan={6}>Không có sinh viên.</td></tr>}
                    </tbody>
                </table>
            </div>
        </div>
    );
}
