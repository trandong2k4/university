import React from "react";
import mockData from "../../mockData";
import "../../styles/register-credit.css";

export default function RegisterCredit() {
    const credits = mockData.entities.tinChi || [];
    const monHocById = (mockData.entities.monHoc || []).reduce(
        (a, m) => ((a[m.maMonHoc] = m), a),
        {}
    );
    const loaiById = (mockData.entities.loaiTinChi || []).reduce(
        (a, l) => ((a[l.id] = l), a),
        {}
    );

    const onRegister = (tc) => {
        alert(
            `(Mock) Đăng ký tín chỉ ${tc.maTinChi} - ${monHocById[tc.monHocId]?.tenMonHoc || tc.monHocId}`
        );
    };

    return (
        <div className="register-credit-container">
            <h1 className="register-credit-title">Đăng ký tín chỉ</h1>

            <div className="register-credit-grid">
                {credits.map((tc) => (
                    <div key={tc.id} className="register-credit-card">
                        <div className="register-credit-course">
                            {monHocById[tc.monHocId]?.tenMonHoc || tc.monHocId}
                        </div>
                        <div className="register-credit-subtext">Mã TC: {tc.maTinChi}</div>
                        <div className="register-credit-info">
                            Loại: {loaiById[tc.loaiTinChiId]?.tenLoai} • Số lượng: {tc.soLuong}
                        </div>
                        <button
                            className="register-credit-btn"
                            onClick={() => onRegister(tc)}
                        >
                            Đăng ký
                        </button>
                    </div>
                ))}
            </div>

            {!credits.length && (
                <div className="register-credit-empty">Chưa có tín chỉ khả dụng.</div>
            )}
        </div>
    );
}
