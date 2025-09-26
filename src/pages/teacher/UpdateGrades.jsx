// UpdateGrades.jsx - placeholder
import React, { useState } from "react";
import mockData from "../../mockData";
<<<<<<< HEAD
import "../../styles/updateGrades.css";
=======
import "../../styles/teacher/updateGrades.css";
>>>>>>> 3725551 (Publiclayout)

export default function UpdateGrades() {
    // Sao chép mảng để edit tại chỗ (mock)
    const [rows, setRows] = useState(() =>
        (mockData.entities.ketQuaHocTap || []).map((r) => ({ ...r }))
    );

    const studentsById = (mockData.entities.sinhVien || []).reduce(
        (a, s) => ((a[s.id] = s), a),
        {}
    );
    const monHocById = (mockData.entities.monHoc || []).reduce(
        (a, m) => ((a[m.maMonHoc] = m), a),
        {}
    );
    const kiById = (mockData.entities.kiHoc || []).reduce(
        (a, k) => ((a[k.id] = k), a),
        {}
    );

    const onChange = (id, field, value) => {
        setRows((prev) =>
            prev.map((r) =>
                r.id === id
                    ? { ...r, [field]: field.includes("diem") ? Number(value) : value }
                    : r
            )
        );
    };

    const onSave = () => {
        // Mock: chỉ alert JSON, không ghi ra mockData
        alert(
            `Đã lưu (mock):\n${JSON.stringify(rows.slice(0, 5), null, 2)}\n...`
        );
    };

    return (
        <div className="ug-container">
            <div className="ug-header">
                <h1 className="ug-title">Cập nhật điểm (mock)</h1>
                <button onClick={onSave} className="ug-save-btn">
                    Lưu thay đổi
                </button>
            </div>

            <div className="ug-wrapper">
                <table className="ug-table">
                    <thead className="ug-thead">
                        <tr>
                            <th className="ug-th">Sinh viên</th>
                            <th className="ug-th">Môn học</th>
                            <th className="ug-th">Kỳ</th>
                            <th className="ug-th text-center">Quá trình</th>
                            <th className="ug-th text-center">Cuối kỳ</th>
                            <th className="ug-th text-center">Tổng kết</th>
                            <th className="ug-th text-center">Xếp loại</th>
                        </tr>
                    </thead>
                    <tbody>
                        {rows.map((r) => {
                            const sv = studentsById[r.sinhVienId];
                            const m = monHocById[r.monHocId];
                            const k = kiById[r.kiHocId];
                            return (
                                <tr key={r.id} className="ug-tr">
                                    <td className="ug-td">{sv?.tenSinhVien}</td>
                                    <td className="ug-td">{m?.tenMonHoc}</td>
                                    <td className="ug-td">{k?.tenKiHoc || "-"}</td>
                                    <td className="ug-td text-center">
                                        <input
                                            type="number"
                                            min="0"
                                            max="10"
                                            step="0.1"
                                            className="ug-input"
                                            value={r.diemQuaTrinh ?? ""}
                                            onChange={(e) =>
                                                onChange(r.id, "diemQuaTrinh", e.target.value)
                                            }
                                        />
                                    </td>
                                    <td className="ug-td text-center">
                                        <input
                                            type="number"
                                            min="0"
                                            max="10"
                                            step="0.1"
                                            className="ug-input"
                                            value={r.diemCuoiKy ?? ""}
                                            onChange={(e) =>
                                                onChange(r.id, "diemCuoiKy", e.target.value)
                                            }
                                        />
                                    </td>
                                    <td className="ug-td text-center">
                                        <input
                                            type="number"
                                            min="0"
                                            max="10"
                                            step="0.1"
                                            className="ug-input"
                                            value={r.diemTongKet ?? ""}
                                            onChange={(e) =>
                                                onChange(r.id, "diemTongKet", e.target.value)
                                            }
                                        />
                                    </td>
                                    <td className="ug-td text-center">
                                        <input
                                            className="ug-input"
                                            value={r.xepLoai ?? ""}
                                            onChange={(e) =>
                                                onChange(r.id, "xepLoai", e.target.value)
                                            }
                                        />
                                    </td>
                                </tr>
                            );
                        })}
                        {!rows.length && (
                            <tr>
                                <td className="ug-empty" colSpan={7}>
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
