// Profile.jsx - placeholder
import React from "react";
import mockData from "../../mockData";

export default function Profile() {
    // Dùng bản ghi SV đầu tiên để mock
    const sv = mockData.entities.sinhVien?.[0];
    const detail = mockData.entities.chiTietSinhVien?.find(d => d.sinhVienId === sv?.id);

    if (!sv) return <div className="p-6">Chưa có dữ liệu sinh viên.</div>;

    return (
        <div className="space-y-4">
            <h1 className="text-2xl font-bold">Thông tin sinh viên</h1>
            <div className="bg-white rounded-xl border p-4">
                <div className="text-lg font-medium">{sv.tenSinhVien}</div>
                <div className="text-sm text-gray-600">Mã SV: {sv.maSinhVien}</div>
                <div className="mt-2 grid sm:grid-cols-2 gap-3 text-sm">
                    <div><span className="text-gray-500">Địa chỉ:</span> {detail?.diaChi || "—"}</div>
                    <div><span className="text-gray-500">SĐT:</span> {detail?.soDienThoai || "—"}</div>
                    <div><span className="text-gray-500">Email:</span> {detail?.email || "—"}</div>
                </div>
            </div>
        </div>
    );
}
