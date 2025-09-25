import React from "react";
import mockData from "../../mockData";
import "../../styles/grades.css"; // CSS riêng

export default function Grades() {
    const svId = mockData.entities.sinhVien?.[0]?.id;
    const grades = (mockData.entities.ketQuaHocTap || []).filter(
        (g) => g.sinhVienId === svId
    );

    const monHocById = (mockData.entities.monHoc || []).reduce(
        (a, m) => ((a[m.maMonHoc] = m), a),
        {}
    );
    const kiById = (mockData.entities.kiHoc || []).reduce(
        (a, k) => ((a[k.id] = k), a),
        {}
    );

    return (
        <div className="grades-container">
            <h1 className="grades-title">Kết quả học tập</h1>

            <div className="grades-table-wrapper">
                <table className="grades-table">
                    <thead>
                        <tr>
                            <th>Môn học</th>
                            <th>Kỳ</th>
                            <th>Quá trình</th>
                            <th>Cuối kỳ</th>
                            <th>Tổng kết</th>
                            <th>Xếp loại</th>
                        </tr>
                    </thead>
                    <tbody>
                        {grades.map((r) => {
                            const m = monHocById[r.monHocId];
                            const k = kiById[r.kiHocId];
                            return (
                                <tr key={r.id}>
                                    <td>
                                        {m?.tenMonHoc}{" "}
                                        <span className="grades-subtext">({r.monHocId})</span>
                                    </td>
                                    <td>{k?.tenKiHoc || "-"}</td>
                                    <td className="grades-center">{r.diemQuaTrinh}</td>
                                    <td className="grades-center">{r.diemCuoiKy}</td>
                                    <td className="grades-center grades-bold">{r.diemTongKet}</td>
                                    <td className="grades-center">{r.xepLoai}</td>
                                </tr>
                            );
                        })}
                        {!grades.length && (
                            <tr>
                                <td className="grades-empty" colSpan={6}>
                                    Chưa có điểm.
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    );
}
