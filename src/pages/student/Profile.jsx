// Profile.jsx
import React from "react";
import { useState } from "react";
import mockData from "../../mockData";
import "../../styles/student/profile.css";


export default function Profile() {
    const sv = mockData.entities.sinhVien?.[0];
    const detail = mockData.entities.chiTietSinhVien?.find(d => d.sinhVienId === sv?.id);
    const center = { lat: 16, lng: 34343 }; // Đà Nẵng
    const [value, setValue] = useState(new Date());


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

            


            {/* <div className="diachi">

                <iframe src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d479.2263626872295!2d108.22250022950536!3d16.075299660147333!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x314219001c106f59%3A0x19a6e3a5faaa4659!2zVMOyYSBuaMOgIER1eSBUw6JuLCDEkOG6oWkgaOG7jWMgRHV5IFTDom4!5e0!3m2!1svi!2sus!4v1758905014421!5m2!1svi!2sus"
                    width="600"
                    height="450"
                    style={{ border: 0 }}
                    allowFullScreen=""
                    loading="lazy"
                    referrerPolicy="no-referrer-when-downgrade"
                    title="Google Map"
                >
                </iframe>
            </div> */}

        </div>
    );
}
