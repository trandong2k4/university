// CancelCredit.jsx - placeholder
import React from "react";
import mockData from "../../mockData";

export default function CancelCredit() {
    // Mock: dùng cùng danh sách tín chỉ để minh hoạ hủy
    const credits = mockData.entities.tinChi || [];
    const monHocById = (mockData.entities.monHoc || []).reduce((a, m) => (a[m.maMonHoc] = m, a), {});
    const loaiById = (mockData.entities.loaiTinChi || []).reduce((a, l) => (a[l.id] = l, a), {});

    const onCancel = (tc) => {
        alert(`(Mock) Hủy tín chỉ ${tc.maTinChi} - ${monHocById[tc.monHocId]?.tenMonHoc || tc.monHocId}`);
    };

    return (
        <div className="space-y-4">
            <h1 className="text-2xl font-bold">Hủy tín chỉ</h1>
            <div className="grid md:grid-cols-2 gap-4">
                {credits.map(tc => (
                    <div key={tc.id} className="bg-white rounded-xl border p-4">
                        <div className="font-semibold">{monHocById[tc.monHocId]?.tenMonHoc || tc.monHocId}</div>
                        <div className="text-xs text-gray-500 mt-1">Mã TC: {tc.maTinChi}</div>
                        <div className="text-sm text-gray-600 mt-2">
                            Loại: {loaiById[tc.loaiTinChiId]?.tenLoai} • Số lượng: {tc.soLuong}
                        </div>
                        <button
                            className="mt-3 px-3 py-2 bg-rose-600 text-white rounded-lg text-sm"
                            onClick={() => onCancel(tc)}
                        >
                            Hủy
                        </button>
                    </div>
                ))}
            </div>
            {!credits.length && <div className="text-sm text-gray-500">Chưa có tín chỉ để hủy.</div>}
        </div>
    );
}
