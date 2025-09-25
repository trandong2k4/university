// StudentTuition.jsx
import React, { useMemo } from "react";
import mockData from "../../mockData";
import "../../styles/studentTuition.css";

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
        <div className="student-tuition-container">
            <h1 className="student-tuition-title">Quản lý học phí (toàn bộ sinh viên)</h1>

            <div className="student-tuition-table-wrapper">
                <table className="student-tuition-table">
                    <thead className="student-tuition-thead">
                        <tr>
                            <th className="stu-th">Sinh viên</th>
                            <th className="stu-th">Kỳ</th>
                            <th className="stu-th text-right">Số tiền</th>
                            <th className="stu-th">Ngày đóng</th>
                            <th className="stu-th">Trạng thái</th>
                        </tr>
                    </thead>
                    <tbody>
                        {fees.map((f) => {
                            const sv = studentsById[f.sinhVienId];
                            const k = kiById[f.kiHocId];
                            return (
                                <tr key={f.id} className="stu-tr">
                                    <td className="stu-td">
                                        {sv?.tenSinhVien}{" "}
                                        <span className="stu-subtext">({sv?.maSinhVien})</span>
                                    </td>
                                    <td className="stu-td">{k?.tenKiHoc || "-"}</td>
                                    <td className="stu-td text-right">{formatVND(f.soTien)}</td>
                                    <td className="stu-td">{f.ngayDong || "-"}</td>
                                    <td className="stu-td">{f.trangThai}</td>
                                </tr>
                            );
                        })}
                        {!fees.length && (
                            <tr>
                                <td className="stu-no-data" colSpan={5}>
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
