// ManageTuition.jsx - placeholder
import React, { useMemo, useState } from "react";
import mockData from "../../mockData";

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
        <div className="space-y-5">
            <h1 className="text-2xl font-bold">Quản lý học phí</h1>

            <div className="overflow-x-auto bg-white rounded-xl border">
                <table className="min-w-[980px] w-full text-sm">
                    <thead className="bg-gray-50 text-gray-600">
                        <tr>
                            <th className="p-3 text-left">Sinh viên</th>
                            <th className="p-3 text-left">Kỳ</th>
                            <th className="p-3 text-right">Số tiền</th>
                            <th className="p-3 text-left">Ngày đóng</th>
                            <th className="p-3 text-left">Trạng thái</th>
                            <th className="p-3 text-left">Thao tác</th>
                        </tr>
                    </thead>
                    <tbody>
                        {rows.map(r => {
                            const sv = studentsById[r.sinhVienId];
                            const k = kiById[r.kiHocId];
                            return (
                                <tr key={r.id} className="border-t">
                                    <td className="p-3">{sv?.tenSinhVien} <span className="text-xs text-gray-500">({sv?.maSinhVien})</span></td>
                                    <td className="p-3">{k?.tenKiHoc}</td>
                                    <td className="p-3 text-right">
                                        <input type="number" min="0" className="w-28 text-right border rounded px-2 py-1"
                                            value={r.soTien ?? ""} onChange={(e) => onCell(r.id, "soTien", e.target.value)} />
                                    </td>
                                    <td className="p-3">
                                        <input type="date" className="border rounded px-2 py-1"
                                            value={r.ngayDong || ""} onChange={(e) => onCell(r.id, "ngayDong", e.target.value)} />
                                    </td>
                                    <td className="p-3">
                                        <select className="border rounded px-2 py-1"
                                            value={r.trangThai || "Chưa đóng"}
                                            onChange={(e) => onCell(r.id, "trangThai", e.target.value)}>
                                            <option>Chưa đóng</option><option>Đã đóng</option><option>Nợ</option>
                                        </select>
                                    </td>
                                    <td className="p-3 space-x-2">
                                        <button className="px-3 py-1 text-sm rounded bg-emerald-600 text-white" onClick={() => markPaid(r.id)}>Đánh dấu đã đóng</button>
                                        <button className="px-3 py-1 text-sm rounded bg-rose-600 text-white" onClick={() => remove(r.id)}>Xóa</button>
                                        <span className="text-xs text-gray-500 ml-1">Hiện tại: {formatVND(r.soTien)}</span>
                                    </td>
                                </tr>
                            );
                        })}
                        {!rows.length && <tr><td className="p-3 text-gray-500" colSpan={6}>Chưa có dữ liệu.</td></tr>}
                    </tbody>
                </table>
            </div>
        </div>
    );
}
