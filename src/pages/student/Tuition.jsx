import React from "react";
import mockData from "../../mockData";
import "../../styles/tuition.css";

const formatVND = (n) =>
    typeof n === "number" ? n.toLocaleString("vi-VN") + " ₫" : "-";

export default function Tuition() {
    const svId = mockData.entities.sinhVien?.[0]?.id;
    const fees = (mockData.entities.hocPhi || []).filter((f) => f.sinhVienId === svId);
    const kiById = (mockData.entities.kiHoc || []).reduce((a, k) => ((a[k.id] = k), a), {});

    return (
        <div className="tuition-container">
            <h1 className="tuition-title">Học phí</h1>

            <div className="tuition-table-wrapper">
                <table className="tuition-table">
                    <thead>
                        <tr>
                            <th>Kỳ</th>
                            <th>Số tiền</th>
                            <th>Ngày đóng</th>
                            <th>Trạng thái</th>
                        </tr>
                    </thead>
                    <tbody>
                        {fees.map((f) => (
                            <tr key={f.id}>
                                <td>{kiById[f.kiHocId]?.tenKiHoc || "-"}</td>
                                <td className="tuition-right">{formatVND(f.soTien)}</td>
                                <td>{f.ngayDong || "-"}</td>
                                <td>{f.trangThai}</td>
                            </tr>
                        ))}
                        {!fees.length && (
                            <tr>
                                <td className="tuition-empty" colSpan={4}>
                                    Chưa có học phí.
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    );
}
