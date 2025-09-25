// Profile.jsx
import React from "react";
import mockData from "../../mockData";
import "../../styles/profile.css";

export default function Profile() {
    const sv = mockData.entities.sinhVien?.[0];
    const detail = mockData.entities.chiTietSinhVien?.find(d => d.sinhVienId === sv?.id);

    if (!sv) return <div className="profile-empty">Chưa có dữ liệu sinh viên.</div>;

    return (
        <div className="profile-container">
            <h1 className="profile-title">Thông tin sinh viên</h1>
            <div className="profile-card">
                <div className="profile-name">{sv.tenSinhVien}</div>
                <div className="profile-id">Mã SV: {sv.maSinhVien}</div>

                <div className="profile-detail-grid">
                    <div><span className="profile-label">Địa chỉ:</span> {detail?.diaChi || "—"}</div>
                    <div><span className="profile-label">SĐT:</span> {detail?.soDienThoai || "—"}</div>
                    <div><span className="profile-label">Email:</span> {detail?.email || "—"}</div>
                </div>
            </div>
        </div>
    );
}
