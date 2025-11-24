// ManageTuition.jsx
import React, { useState, useEffect } from "react";
import "../../styles/admin/manageTuition.css";
export default function ManageHocPhi() {
    const [hocPhis, setHocPhis] = useState([]);
    const [selectedHocPhi, setSelectedHocPhi] = useState(null);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [modalMode, setModalMode] = useState("add");

    const [formData, setFormData] = useState({
        tenSinhVien: "",
        maSinhVien: "",
        tenKiHoc: "",
        soTien: "",
        giaTriTinChi: "",
        hanThanhToan: "",
        ngayThanhToan: "",
        trangThai: "",
        ghiChu: "",
    });

    // 🔹 Fetch danh sách học phí
    useEffect(() => {
        const fetchHocPhis = async () => {
            try {
                const res = await apiClient.get("/tuition_fees"); // hoặc "/hocphis" tùy backend
                setHocPhis(res.data);
            } catch (err) {
                console.error("Lỗi fetch học phí:", err.response?.data || err);
            }
        };
        fetchHocPhis();
    }, []);

    const openModal = (mode, hp = null) => {
        setModalMode(mode);
        if (hp) {
            setFormData({
                id: hp.id,
                tenSinhVien: hp.tenSinhVien,
                maSinhVien: hp.maSinhVien,
                tenKiHoc: hp.tenKiHoc,
                soTien: hp.soTien,
                giaTriTinChi: hp.giaTriTinChi,
                hanThanhToan: hp.hanThanhToan,
                ngayThanhToan: hp.ngayThanhToan,
                trangThai: hp.trangThai,
                ghiChu: hp.ghiChu || "",
            });
        } else {
            setFormData({
                tenSinhVien: "",
                maSinhVien: "",
                tenKiHoc: "",
                soTien: "",
                giaTriTinChi: "",
                hanThanhToan: "",
                ngayThanhToan: "",
                trangThai: "",
                ghiChu: "",
            });
        }
        setIsModalOpen(true);
    };

    const closeModal = () => {
        setIsModalOpen(false);
        setSelectedHocPhi(null);
    };

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData((prev) => ({ ...prev, [name]: value }));
    };

    // 🔹 Thêm / sửa
    const handleSave = async (e) => {
        e.preventDefault();
        try {
            let res;
            if (modalMode === "add") {
                res = await apiClient.post("/hocphis", formData);
                setHocPhis([...hocPhis, res.data]);
            } else {
                res = await apiClient.put(`/hocphis/${formData.id}`, formData);
                setHocPhis(hocPhis.map((h) => (h.id === res.data.id ? res.data : h)));
            }
            closeModal();
        } catch (err) {
            console.error("Lỗi lưu học phí:", err.response?.data || err);
            alert("Thao tác thất bại!");
        }
    };

    // 🔹 Xóa
    const handleDelete = async () => {
        if (!selectedHocPhi) return alert("Chọn học phí để xóa!");
        if (!window.confirm("Bạn có chắc muốn xóa học phí này?")) return;

        try {
            await apiClient.delete(`/hocphis/${selectedHocPhi.id}`);
            setHocPhis(hocPhis.filter((h) => h.id !== selectedHocPhi.id));
            setSelectedHocPhi(null);
            alert("Xóa thành công!");
        } catch (err) {
            console.error("Lỗi xóa học phí:", err.response?.data || err);
            alert("Xóa thất bại!");
        }
    };

    return (
        <main className="container">
            <section className="banner-section">
                <h1 className="banner-title">💰 Quản lý Học phí</h1>
                <p className="banner-subtitle">
                    Quản lý chi tiết các khoản học phí sinh viên trong từng kỳ học.
                </p>
            </section>

            <div className="content-box">
                <div className="action-buttons">
                    <button onClick={() => openModal("add")} className="btn btn-blue">
                        ➕ Thêm
                    </button>
                    <button
                        onClick={() =>
                            selectedHocPhi
                                ? openModal("edit", selectedHocPhi)
                                : alert("Chọn học phí để sửa")
                        }
                        className="btn btn-yellow"
                    >
                        ✏️ Sửa
                    </button>
                    <button onClick={handleDelete} className="btn btn-red">
                        🗑️ Xóa
                    </button>
                </div>

                <table className="hocphi-table">
                    <thead>
                        <tr>
                            <th>Tên sinh viên</th>
                            <th>Mã SV</th>
                            <th>Kỳ học</th>
                            <th>Số tiền</th>
                            <th>Giá trị TC</th>
                            <th>Hạn TT</th>
                            <th>Ngày TT</th>
                            <th>Trạng thái</th>
                            <th>Ghi chú</th>
                            <th>Chi tiết</th>
                        </tr>
                    </thead>
                    <tbody>
                        {hocPhis.map((hp) => (
                            <tr
                                key={hp.id}
                                onClick={() => setSelectedHocPhi(hp)}
                                className={selectedHocPhi?.id === hp.id ? "selected-row" : ""}
                            >
                                <td>{hp.tenSinhVien}</td>
                                <td>{hp.maSinhVien}</td>
                                <td>{hp.tenKiHoc}</td>
                                <td>{hp.soTien?.toLocaleString()} đ</td>
                                <td>{hp.giaTriTinChi?.toLocaleString()} đ</td>
                                <td>{hp.hanThanhToan || "—"}</td>
                                <td>{hp.ngayThanhToan || "—"}</td>
                                <td>
                                    {hp.trangThai === "DA_THANH_TOAN" ? "✅ Đã nộp" :
                                        hp.trangThai === "CHUA_THANH_TOAN" ? "❌ Chưa nộp" :
                                            hp.trangThai === "QUA_HAN" ? "⚠️ Quá hạn" : hp.trangThai}
                                </td>
                                <td>{hp.ghiChu || ""}</td>
                                <td>
                                    <button
                                        onClick={(ev) => {
                                            ev.stopPropagation();
                                            openModal("view", hp);
                                        }}
                                        className="btn btn-gray"
                                    >
                                        👁️ Xem
                                    </button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            {/* Modal thêm / sửa / xem */}
            {isModalOpen && (
                <div className="modal-overlay">
                    <div className="modal-box">
                        <h2>
                            {modalMode === "add"
                                ? "➕ Thêm học phí"
                                : modalMode === "edit"
                                    ? "✏️ Sửa học phí"
                                    : "👁️ Chi tiết học phí"}
                        </h2>

                        <form onSubmit={handleSave}>
                            <input
                                name="tenSinhVien"
                                value={formData.tenSinhVien}
                                onChange={handleChange}
                                placeholder="Tên sinh viên"
                                readOnly={modalMode === "view"}
                            />
                            <input
                                name="maSinhVien"
                                value={formData.maSinhVien}
                                onChange={handleChange}
                                placeholder="Mã sinh viên"
                                readOnly={modalMode === "view"}
                            />
                            <input
                                name="tenKiHoc"
                                value={formData.tenKiHoc}
                                onChange={handleChange}
                                placeholder="Tên kỳ học"
                                readOnly={modalMode === "view"}
                            />
                            <input
                                type="number"
                                name="soTien"
                                value={formData.soTien}
                                onChange={handleChange}
                                placeholder="Số tiền"
                                readOnly={modalMode === "view"}
                            />
                            <input
                                type="number"
                                name="giaTriTinChi"
                                value={formData.giaTriTinChi}
                                onChange={handleChange}
                                placeholder="Giá trị tín chỉ"
                                readOnly={modalMode === "view"}
                            />
                            <input
                                type="date"
                                name="hanThanhToan"
                                value={formData.hanThanhToan || ""}
                                onChange={handleChange}
                                readOnly={modalMode === "view"}
                            />
                            <input
                                type="date"
                                name="ngayThanhToan"
                                value={formData.ngayThanhToan || ""}
                                onChange={handleChange}
                                readOnly={modalMode === "view"}
                            />

                            {/* 🔹 Combo trạng thái */}
                            <select
                                name="trangThai"
                                value={formData.trangThai}
                                onChange={handleChange}
                                disabled={modalMode === "view"}
                            >
                                <option value="">-- Chọn trạng thái --</option>
                                <option value="CHUA_THANH_TOAN">Chưa thanh toán</option>
                                <option value="DA_THANH_TOAN">Đã thanh toán</option>
                                <option value="QUA_HAN">Quá hạn</option>
                            </select>

                            <textarea
                                name="ghiChu"
                                value={formData.ghiChu}
                                onChange={handleChange}
                                placeholder="Ghi chú"
                                readOnly={modalMode === "view"}
                                rows={2}
                            />

                            <div className="modal-actions">
                                {modalMode !== "view" && (
                                    <button type="submit" className="btn btn-green">
                                        💾 Lưu
                                    </button>
                                )}
                                <button
                                    type="button"
                                    onClick={closeModal}
                                    className="btn btn-gray"
                                >
                                    Đóng
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </main>
    );
}
