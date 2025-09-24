// StudentTuition.jsx - placeholder
import React, { useMemo } from "react";
import mockData from "../../mockData";

const formatVND = (n) => (typeof n === "number" ? n.toLocaleString("vi-VN") + " ₫" : "-");

export default function StudentTuition() {
    const fees = mockData.entities.hocPhi || [];
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

    return (
        <div className="space-y-4">
            <h1 className="text-2xl font-bold">Quản lý học phí (toàn bộ sinh viên)</h1>

            <div className="overflow-x-auto bg-white rounded-xl border">
                <table className="min-w-[840px] w-full text-sm">
                    <thead className="bg-gray-50 text-gray-600">
                        <tr>
                            <th className="p-3 text-left">Sinh viên</th>
                            <th className="p-3 text-left">Kỳ</th>
                            <th className="p-3 text-right">Số tiền</th>
                            <th className="p-3 text-left">Ngày đóng</th>
                            <th className="p-3 text-left">Trạng thái</th>
                        </tr>
                    </thead>
                    <tbody>
                        {fees.map((f) => {
                            const sv = studentsById[f.sinhVienId];
                            const k = kiById[f.kiHocId];
                            return (
                                <tr key={f.id} className="border-t">
                                    <td className="p-3">
                                        {sv?.tenSinhVien}{" "}
                                        <span className="text-xs text-gray-500">({sv?.maSinhVien})</span>
                                    </td>
                                    <td className="p-3">{k?.tenKiHoc || "-"}</td>
                                    <td className="p-3 text-right font-medium">{formatVND(f.soTien)}</td>
                                    <td className="p-3">{f.ngayDong || "-"}</td>
                                    <td className="p-3">{f.trangThai}</td>
                                </tr>
                            );
                        })}
                        {!fees.length && (
                            <tr>
                                <td className="p-3 text-gray-500" colSpan={5}>
                                    Chưa có dữ liệu học phí.
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    );
}
