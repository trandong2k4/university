import React from "react";
import mockData from "../../mockData";
<<<<<<< HEAD
import "../../styles/cancel-credit.css";
=======
import "../../styles/student/cancel-credit.css";
>>>>>>> 3725551 (Publiclayout)

export default function CancelCredit() {
    const credits = mockData.entities.tinChi || [];
    const monHocById = (mockData.entities.monHoc || []).reduce(
        (a, m) => ((a[m.maMonHoc] = m), a),
        {}
    );
    const loaiById = (mockData.entities.loaiTinChi || []).reduce(
        (a, l) => ((a[l.id] = l), a),
        {}
    );

    const onCancel = (tc) => {
        alert(
            `(Mock) Hủy tín chỉ ${tc.maTinChi} - ${monHocById[tc.monHocId]?.tenMonHoc || tc.monHocId}`
        );
    };

    return (
        <div className="cancel-credit-container">
            <h1 className="cancel-credit-title">Hủy tín chỉ</h1>

            <div className="cancel-credit-grid">
                {credits.map((tc) => (
                    <div key={tc.id} className="cancel-credit-card">
                        <div className="cancel-credit-course">
                            {monHocById[tc.monHocId]?.tenMonHoc || tc.monHocId}
                        </div>
                        <div className="cancel-credit-subtext">Mã TC: {tc.maTinChi}</div>
                        <div className="cancel-credit-info">
                            Loại: {loaiById[tc.loaiTinChiId]?.tenLoai} • Số lượng: {tc.soLuong}
                        </div>
                        <button
                            className="cancel-credit-btn"
                            onClick={() => onCancel(tc)}
                        >
                            Hủy
                        </button>
                    </div>
                ))}
            </div>

            {!credits.length && (
                <div className="cancel-credit-empty">Chưa có tín chỉ để hủy.</div>
            )}
        </div>
    );
}
