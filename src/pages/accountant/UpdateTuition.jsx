// UpdateTuition.jsx - placeholder
import React, { useMemo, useState } from "react";
import mockData from "../../mockData";

const formatVND = (n) => (typeof n === "number" ? n.toLocaleString("vi-VN") + " ₫" : "-");

export default function UpdateTuition() {
    // Sao chép mảng để chỉnh sửa tại chỗ (mock)
    const [rows, setRows] = useState(() => (mockData.entities.hocPhi || []).map((x) => ({ ...x })));

    const studentsById = useMemo(() => {
        const map = {};
        (mockData.entities.sinhVien || []).forEach((s) => (map[s.id] = s));
        return map;
    }, []);
    const kiById = useMemo(() => {
        const map = {};
        (mockData.entities.kiHoc || []).forEach((k) => (map[k.id] = k));
        return map;
    }, []);

    const onChange = (id, field, value) => {
        setRows((prev) => prev.map((r) => (r.id === id ? { ...r, [field]: field === "soTien" ? Number(value) : value } : r)));
    };

    const markPaid = (id) => {
        setRows((prev) => prev.map((r) => (r.id === id ? { ...r, trangThai: "Đã đóng" } : r)));
    };

    const onSave = () => {
        // Mock: chỉ alert
        alert("(Mock) Đã cập nhật:\n" + JSON.stringify(rows.slice(0, 5), null, 2) + "\n...");
    };

    return (
        <div className="space-y-4">
            <div className="flex items-center justify-between">
                <h1 className="text-2xl font-bold">Cập nhật học phí (mock)</h1>
                <button onClick={onSave} className="px-4 py-2 bg-blue-600 text-white rounded-lg">
                    Lưu thay đổi
                </button>
            </div>

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
                        {rows.map((r) => {
                            const sv = studentsById[r.sinhVienId];
                            const k = kiById[r.kiHocId];
                            return (
                                <tr key={r.id} className="border-t">
                                    <td className="p-3">
                                        {sv?.tenSinhVien} <span className="text-xs text-gray-500">({sv?.maSinhVien})</span>
                                    </td>
                                    <td className="p-3">{k?.tenKiHoc || "-"}</td>
                                    <td className="p-3 text-right">
                                        <input
                                            type="number"
                                            min="0"
                                            className="w-32 text-right border rounded px-2 py-1"
                                            value={r.soTien ?? ""}
                                            onChange={(e) => onChange(r.id, "soTien", e.target.value)}
                                        />
                                    </td>
                                    <td className="p-3">
                                        <input
                                            type="date"
                                            className="border rounded px-2 py-1"
                                            value={r.ngayDong || ""}
                                            onChange={(e) => onChange(r.id, "ngayDong", e.target.value)}
                                        />
                                    </td>
                                    <td className="p-3">
                                        <select
                                            className="border rounded px-2 py-1"
                                            value={r.trangThai || "Chưa đóng"}
                                            onChange={(e) => onChange(r.id, "trangThai", e.target.value)}
                                        >
                                            <option>Chưa đóng</option>
                                            <option>Đã đóng</option>
                                            <option>Nợ</option>
                                        </select>
                                    </td>
                                    <td className="p-3 space-x-2">
                                        <button
                                            className="px-3 py-1 text-sm rounded bg-emerald-600 text-white"
                                            onClick={() => markPaid(r.id)}
                                            title="Đánh dấu đã đóng"
                                        >
                                            Đánh dấu đã đóng
                                        </button>
                                        <span className="text-xs text-gray-500 ml-2">
                                            Hiện tại: {formatVND(r.soTien)}
                                        </span>
                                    </td>
                                </tr>
                            );
                        })}
                        {!rows.length && (
                            <tr>
                                <td className="p-3 text-gray-500" colSpan={6}>
                                    Chưa có dữ liệu để cập nhật.
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    );
}
