// CreateTuition.jsx - placeholder
import React, { useMemo, useState } from "react";
import mockData from "../../mockData";

export default function CreateTuition() {
    const students = mockData.entities.sinhVien || [];
    const semesters = mockData.entities.kiHoc || [];

    const [sinhVienId, setSinhVienId] = useState(students[0]?.id || "");
    const [kiHocId, setKiHocId] = useState(semesters[0]?.id || "");
    const [soTien, setSoTien] = useState("");
    const [ngayDong, setNgayDong] = useState("");
    const [trangThai, setTrangThai] = useState("Chưa đóng");

    const canSubmit = useMemo(
        () => String(sinhVienId) && String(kiHocId) && !!Number(soTien),
        [sinhVienId, kiHocId, soTien]
    );

    const onSubmit = (e) => {
        e.preventDefault();
        if (!canSubmit) return;
        const payload = { sinhVienId: Number(sinhVienId), kiHocId: Number(kiHocId), soTien: Number(soTien), ngayDong, trangThai };
        alert("(Mock) Tạo học phí:\n" + JSON.stringify(payload, null, 2));
        setSoTien("");
        setNgayDong("");
        setTrangThai("Chưa đóng");
    };

    return (
        <div className="space-y-4 max-w-xl">
            <h1 className="text-2xl font-bold">Tạo học phí</h1>

            <form onSubmit={onSubmit} className="bg-white rounded-xl border p-4 space-y-4">
                <div>
                    <label className="block text-sm font-medium mb-1">Sinh viên</label>
                    <select
                        className="w-full rounded-lg border px-3 py-2"
                        value={sinhVienId}
                        onChange={(e) => setSinhVienId(e.target.value)}
                    >
                        {students.map((s) => (
                            <option key={s.id} value={s.id}>
                                {s.tenSinhVien} ({s.maSinhVien})
                            </option>
                        ))}
                    </select>
                </div>

                <div>
                    <label className="block text-sm font-medium mb-1">Kỳ học</label>
                    <select
                        className="w-full rounded-lg border px-3 py-2"
                        value={kiHocId}
                        onChange={(e) => setKiHocId(e.target.value)}
                    >
                        {semesters.map((k) => (
                            <option key={k.id} value={k.id}>
                                {k.tenKiHoc}
                            </option>
                        ))}
                    </select>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                        <label className="block text-sm font-medium mb-1">Số tiền (VND)</label>
                        <input
                            type="number"
                            min="0"
                            className="w-full rounded-lg border px-3 py-2"
                            value={soTien}
                            onChange={(e) => setSoTien(e.target.value)}
                            placeholder="VD: 12000000"
                            required
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium mb-1">Ngày đóng (tuỳ chọn)</label>
                        <input
                            type="date"
                            className="w-full rounded-lg border px-3 py-2"
                            value={ngayDong}
                            onChange={(e) => setNgayDong(e.target.value)}
                            placeholder="YYYY-MM-DD"
                        />
                    </div>
                </div>

                <div>
                    <label className="block text-sm font-medium mb-1">Trạng thái</label>
                    <select
                        className="w-full rounded-lg border px-3 py-2"
                        value={trangThai}
                        onChange={(e) => setTrangThai(e.target.value)}
                    >
                        <option>Chưa đóng</option>
                        <option>Đã đóng</option>
                        <option>Nợ</option>
                    </select>
                </div>

                <button
                    className={`w-full rounded-lg py-2 font-medium ${canSubmit ? "bg-blue-600 text-white" : "bg-gray-200 text-gray-500"
                        }`}
                    disabled={!canSubmit}
                >
                    Tạo học phí (mock)
                </button>
            </form>
        </div>
    );
}
