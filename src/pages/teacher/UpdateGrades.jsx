// UpdateGrades.jsx - placeholder
import React, { useState } from "react";
import mockData from "../../mockData";

export default function UpdateGrades() {
    // Sao chép mảng để edit tại chỗ (mock)
    const [rows, setRows] = useState(() => (mockData.entities.ketQuaHocTap || []).map((r) => ({ ...r })));

    const studentsById = (mockData.entities.sinhVien || []).reduce((a, s) => ((a[s.id] = s), a), {});
    const monHocById = (mockData.entities.monHoc || []).reduce((a, m) => ((a[m.maMonHoc] = m), a), {});
    const kiById = (mockData.entities.kiHoc || []).reduce((a, k) => ((a[k.id] = k), a), {});

    const onChange = (id, field, value) => {
        setRows((prev) =>
            prev.map((r) =>
                r.id === id ? { ...r, [field]: field.includes("diem") ? Number(value) : value } : r
            )
        );
    };

    const onSave = () => {
        // Mock: chỉ alert JSON, không ghi ra mockData
        alert(`Đã lưu (mock):\n${JSON.stringify(rows.slice(0, 5), null, 2)}\n...`);
    };

    return (
        <div className="space-y-4">
            <div className="flex items-center justify-between">
                <h1 className="text-2xl font-bold">Cập nhật điểm (mock)</h1>
                <button onClick={onSave} className="px-4 py-2 bg-blue-600 text-white rounded-lg">
                    Lưu thay đổi
                </button>
            </div>

            <div className="overflow-x-auto bg-white rounded-xl border">
                <table className="min-w-[960px] w-full text-sm">
                    <thead className="bg-gray-50 text-gray-600">
                        <tr>
                            <th className="p-3 text-left">Sinh viên</th>
                            <th className="p-3 text-left">Môn học</th>
                            <th className="p-3 text-left">Kỳ</th>
                            <th className="p-3 text-center">Quá trình</th>
                            <th className="p-3 text-center">Cuối kỳ</th>
                            <th className="p-3 text-center">Tổng kết</th>
                            <th className="p-3 text-center">Xếp loại</th>
                        </tr>
                    </thead>
                    <tbody>
                        {rows.map((r) => {
                            const sv = studentsById[r.sinhVienId];
                            const m = monHocById[r.monHocId];
                            const k = kiById[r.kiHocId];
                            return (
                                <tr key={r.id} className="border-t">
                                    <td className="p-3">{sv?.tenSinhVien}</td>
                                    <td className="p-3">{m?.tenMonHoc}</td>
                                    <td className="p-3">{k?.tenKiHoc || "-"}</td>
                                    <td className="p-3 text-center">
                                        <input
                                            type="number"
                                            min="0" max="10" step="0.1"
                                            className="w-20 text-center border rounded px-2 py-1"
                                            value={r.diemQuaTrinh ?? ""}
                                            onChange={(e) => onChange(r.id, "diemQuaTrinh", e.target.value)}
                                        />
                                    </td>
                                    <td className="p-3 text-center">
                                        <input
                                            type="number"
                                            min="0" max="10" step="0.1"
                                            className="w-20 text-center border rounded px-2 py-1"
                                            value={r.diemCuoiKy ?? ""}
                                            onChange={(e) => onChange(r.id, "diemCuoiKy", e.target.value)}
                                        />
                                    </td>
                                    <td className="p-3 text-center">
                                        <input
                                            type="number"
                                            min="0" max="10" step="0.1"
                                            className="w-20 text-center border rounded px-2 py-1"
                                            value={r.diemTongKet ?? ""}
                                            onChange={(e) => onChange(r.id, "diemTongKet", e.target.value)}
                                        />
                                    </td>
                                    <td className="p-3 text-center">
                                        <input
                                            className="w-24 text-center border rounded px-2 py-1"
                                            value={r.xepLoai ?? ""}
                                            onChange={(e) => onChange(r.id, "xepLoai", e.target.value)}
                                        />
                                    </td>
                                </tr>
                            );
                        })}
                        {!rows.length && (
                            <tr><td className="p-3 text-gray-500" colSpan={7}>Chưa có dữ liệu để cập nhật.</td></tr>
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    );
}
