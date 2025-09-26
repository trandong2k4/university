// UpdateTuition.jsx
import React, { useMemo, useState } from "react";
import mockData from "../../mockData";
import "../../styles/accountant/updateTuition.css";

const formatVND = (n) => (typeof n === "number" ? n.toLocaleString("vi-VN") + " ₫" : "-");

export default function UpdateTuition() {
    const [rows, setRows] = useState(() => (mockData.entities.hocPhi || []).map((x) => ({ ...x })));

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

    const onChange = (id, field, value) => {
        setRows((prev) =>
            prev.map((r) => (r.id === id ? { ...r, [field]: field === "soTien" ? Number(value) : value } : r))
        );
    };

    const markPaid = (id) => {
        setRows((prev) => prev.map((r) => (r.id === id ? { ...r, trangThai: "Đã đóng" } : r)));
    };

    const onSave = () => {
        alert("(Mock) Đã cập nhật:\n" + JSON.stringify(rows.slice(0, 5), null, 2) + "\n...");
    };

    return (
        <div className="update-tuition-container">

            <div className="update-tuition-header">
                <h1 className="update-tuition-title">Cập nhật học phí (mock)</h1>
                <button onClick={onSave} className="update-tuition-save-btn">
                    Lưu thay đổi
                </button>
            </div>

            <div className="update-tuition-table-wrapper">
                <table className="update-tuition-table">
                    <thead className="update-tuition-thead">
                        <tr>
                            <th>Sinh viên</th>
                            <th>Kỳ</th>
                            <th>Số tiền</th>
                            <th>Ngày đóng</th>
                            <th>Trạng thái</th>
                            <th>Thao tác</th>
                        </tr>
                    </thead>
                    <tbody>
                        {rows.map((r) => {
                            const sv = studentsById[r.sinhVienId];
                            const k = kiById[r.kiHocId];
                            return (
                                <tr key={r.id} className="update-tuition-row">
                                    <td>{sv?.tenSinhVien} <span className="update-tuition-sv-code">({sv?.maSinhVien})</span></td>
                                    <td>{k?.tenKiHoc || "-"}</td>
                                    <td>
                                        <input
                                            type="number"
                                            min="0"
                                            className="update-tuition-input"
                                            value={r.soTien ?? ""}
                                            onChange={(e) => onChange(r.id, "soTien", e.target.value)}
                                        />
                                    </td>
                                    <td>
                                        <input
                                            type="date"
                                            className="update-tuition-input"
                                            value={r.ngayDong || ""}
                                            onChange={(e) => onChange(r.id, "ngayDong", e.target.value)}
                                        />
                                    </td>
                                    <td>
                                        <select
                                            className="update-tuition-input"
                                            value={r.trangThai || "Chưa đóng"}
                                            onChange={(e) => onChange(r.id, "trangThai", e.target.value)}
                                        >
                                            <option>Chưa đóng</option>
                                            <option>Đã đóng</option>
                                            <option>Nợ</option>
                                        </select>
                                    </td>
                                    <td className="update-tuition-actions">
                                        <button
                                            className="update-tuition-mark-paid"
                                            onClick={() => markPaid(r.id)}
                                            title="Đánh dấu đã đóng"
                                        >
                                            Đánh dấu đã đóng
                                        </button>
                                        <span className="update-tuition-current">{formatVND(r.soTien)}</span>
                                    </td>
                                </tr>
                            );
                        })}
                        {!rows.length && (
                            <tr>
                                <td colSpan={6} className="update-tuition-no-data">
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
