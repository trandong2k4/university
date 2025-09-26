// StudentInfo.jsx - placeholder
import React from "react";
import mockData from "../../mockData";
import "../../styles/teacher/studentInfo.css";

export default function StudentInfo() {
    const students = mockData.entities.sinhVien || [];
    const details = mockData.entities.chiTietSinhVien || [];
    const bySvId = details.reduce((a, d) => ((a[d.sinhVienId] = d), a), {});

    return (
        <div className="si-container">
            <h1 className="si-title">Danh sách sinh viên</h1>
            <div className="si-grid">
                {students.map((sv) => {
                    const d = bySvId[sv.id];
                    return (
                        <div key={sv.id} className="si-card">
                            <div className="si-name">{sv.tenSinhVien}</div>
                            <div className="si-sub">Mã SV: {sv.maSinhVien}</div>
                            <div className="si-sub">
                                Email: {d?.email || "—"} • SĐT: {d?.soDienThoai || "—"}
                            </div>
                            <div className="si-sub">Địa chỉ: {d?.diaChi || "—"}</div>
                        </div>
                    );
                })}
            </div>
            {!students.length && <div className="si-empty">Chưa có sinh viên.</div>}
        </div>
    );
}
