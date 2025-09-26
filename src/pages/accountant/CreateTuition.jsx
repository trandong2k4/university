// CreateTuition.jsx
import React, { useMemo, useState } from "react";
import mockData from "../../mockData";
<<<<<<< HEAD
import "../../styles/createTuition.css";
=======
import "../../styles/accountant/createTuition.css";
>>>>>>> 3725551 (Publiclayout)

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
        <div className="tuition-container">
            <h1 className="tuition-title">Tạo học phí</h1>

            <form onSubmit={onSubmit} className="tuition-form">
                <div className="tuition-field">
                    <label className="tuition-label">Sinh viên</label>
                    <select
                        className="tuition-select"
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

                <div className="tuition-field">
                    <label className="tuition-label">Kỳ học</label>
                    <select
                        className="tuition-select"
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

                <div className="tuition-grid">
                    <div className="tuition-field">
                        <label className="tuition-label">Số tiền (VND)</label>
                        <input
                            type="number"
                            min="0"
                            className="tuition-input"
                            value={soTien}
                            onChange={(e) => setSoTien(e.target.value)}
                            placeholder="VD: 12000000"
                            required
                        />
                    </div>

                    <div className="tuition-field">
                        <label className="tuition-label">Ngày đóng (tuỳ chọn)</label>
                        <input
                            type="date"
                            className="tuition-input"
                            value={ngayDong}
                            onChange={(e) => setNgayDong(e.target.value)}
                            placeholder="YYYY-MM-DD"
                        />
                    </div>
                </div>

                <div className="tuition-field">
                    <label className="tuition-label">Trạng thái</label>
                    <select
                        className="tuition-select"
                        value={trangThai}
                        onChange={(e) => setTrangThai(e.target.value)}
                    >
                        <option>Chưa đóng</option>
                        <option>Đã đóng</option>
                        <option>Nợ</option>
                    </select>
                </div>

                <button
                    className={`tuition-submit ${canSubmit ? "tuition-submit-active" : "tuition-submit-disabled"}`}
                    disabled={!canSubmit}
                >
                    Tạo học phí (mock)
                </button>
            </form>
        </div>
    );
}
