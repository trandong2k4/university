// Tuition.jsx - placeholder
import React from "react";
import mockData from "../../mockData";

const formatVND = (n) =>
    typeof n === "number" ? n.toLocaleString("vi-VN") + " ₫" : "-";

export default function Tuition() {
    const svId = mockData.entities.sinhVien?.[0]?.id;
    const fees = (mockData.entities.hocPhi || []).filter(f => f.sinhVienId === svId);
    const kiById = (mockData.entities.kiHoc || []).reduce((a, k) => (a[k.id] = k, a), {});

    return (
        <div className="space-y-4">
            <h1 className="text-2xl font-bold">Học phí</h1>
            <div className="overflow-x-auto bg-white rounded-xl border">
                <table className="min-w-[680px] w-full text-sm">
                    <thead className="bg-gray-50 text-gray-600">
                        <tr>
                            <th className="p-3 text-left">Kỳ</th>
                            <th className="p-3 text-right">Số tiền</th>
                            <th className="p-3 text-left">Ngày đóng</th>
                            <th className="p-3 text-left">Trạng thái</th>
                        </tr>
                    </thead>
                    <tbody>
                        {fees.map(f => (
                            <tr key={f.id} className="border-t">
                                <td className="p-3">{kiById[f.kiHocId]?.tenKiHoc || "-"}</td>
                                <td className="p-3 text-right font-medium">{formatVND(f.soTien)}</td>
                                <td className="p-3">{f.ngayDong || "-"}</td>
                                <td className="p-3">{f.trangThai}</td>
                            </tr>
                        ))}
                        {!fees.length && (
                            <tr><td className="p-3 text-gray-500" colSpan={4}>Chưa có học phí.</td></tr>
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    );
}
