// ManageGrades.jsx - placeholder
import React, { useMemo, useState } from "react";
import mockData from "../../mockData";

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
        setRows(prev => prev.map(r => (r.id === id ? { ...r, [field]: field.startsWith("diem") ? Number(value) : value } : r)));
    };

    const remove = (id) => {
        if (!confirm("Xóa bản điểm này?")) return;
        setRows(rows.filter(r => r.id !== id));
    };

    return (
        <div className="space-y-5">
            <h1 className="text-2xl font-bold">Quản lý điểm</h1>

            <div className="overflow-x-auto bg-white rounded-xl border">
                <table className="min-w-[1000px] w-full text-sm">
                    <thead className="bg-gray-50 text-gray-600">
                        <tr>
                            <th className="p-3 text-left">Sinh viên</th>
                            <th className="p-3 text-left">Môn học</th>
                            <th className="p-3 text-left">Kỳ</th>
                            <th className="p-3 text-center">Quá trình</th>
                            <th className="p-3 text-center">Cuối kỳ</th>
                            <th className="p-3 text-center">Tổng kết</th>
                            <th className="p-3 text-center">Xếp loại</th>
                            <th className="p-3 text-left">Thao tác</th>
                        </tr>
                    </thead>
                    <tbody>
                        {rows.map(r => {
                            const sv = studentsById[r.sinhVienId];
                            const m = monHocById[r.monHocId];
                            const k = kiById[r.kiHocId];
                            return (
                                <tr key={r.id} className="border-t">
                                    <td className="p-3">{sv?.tenSinhVien} <span className="text-xs text-gray-500">({sv?.maSinhVien})</span></td>
                                    <td className="p-3">{m?.tenMonHoc} <span className="text-xs text-gray-500">({r.monHocId})</span></td>
                                    <td className="p-3">{k?.tenKiHoc}</td>
                                    <td className="p-3 text-center"><input type="number" step="0.1" min="0" max="10" className="w-20 text-center border rounded px-2 py-1" value={r.diemQuaTrinh ?? ""} onChange={(e) => onCell(r.id, "diemQuaTrinh", e.target.value)} /></td>
                                    <td className="p-3 text-center"><input type="number" step="0.1" min="0" max="10" className="w-20 text-center border rounded px-2 py-1" value={r.diemCuoiKy ?? ""} onChange={(e) => onCell(r.id, "diemCuoiKy", e.target.value)} /></td>
                                    <td className="p-3 text-center"><input type="number" step="0.1" min="0" max="10" className="w-20 text-center border rounded px-2 py-1" value={r.diemTongKet ?? ""} onChange={(e) => onCell(r.id, "diemTongKet", e.target.value)} /></td>
                                    <td className="p-3 text-center"><input className="w-24 text-center border rounded px-2 py-1" value={r.xepLoai ?? ""} onChange={(e) => onCell(r.id, "xepLoai", e.target.value)} /></td>
                                    <td className="p-3">
                                        <button className="px-3 py-1 text-sm rounded bg-rose-600 text-white" onClick={() => remove(r.id)}>Xóa</button>
                                    </td>
                                </tr>
                            );
                        })}
                        {!rows.length && <tr><td className="p-3 text-gray-500" colSpan={8}>Chưa có dữ liệu điểm.</td></tr>}
                    </tbody>
                </table>
            </div>

            <div className="text-sm text-gray-500">* Lưu ý: Đây là mock, thay đổi chỉ lưu tại state.</div>
        </div>
    );
}
