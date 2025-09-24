// StudentInfo.jsx - placeholder
import React from "react";
import mockData from "../../mockData";

export default function StudentInfo() {
    const students = mockData.entities.sinhVien || [];
    const details = mockData.entities.chiTietSinhVien || [];
    const bySvId = details.reduce((a, d) => ((a[d.sinhVienId] = d), a), {});

    return (
        <div className="space-y-4">
            <h1 className="text-2xl font-bold">Danh sách sinh viên</h1>
            <div className="grid md:grid-cols-2 gap-4">
                {students.map((sv) => {
                    const d = bySvId[sv.id];
                    return (
                        <div key={sv.id} className="bg-white rounded-xl border p-4">
                            <div className="font-semibold">{sv.tenSinhVien}</div>
                            <div className="text-sm text-gray-600">Mã SV: {sv.maSinhVien}</div>
                            <div className="text-sm text-gray-600 mt-1">
                                Email: {d?.email || "—"} • SĐT: {d?.soDienThoai || "—"}
                            </div>
                            <div className="text-sm text-gray-600">Địa chỉ: {d?.diaChi || "—"}</div>
                        </div>
                    );
                })}
            </div>
            {!students.length && <div className="text-sm text-gray-500">Chưa có sinh viên.</div>}
        </div>
    );
}
