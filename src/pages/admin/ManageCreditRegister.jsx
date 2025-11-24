import React, { useState, useEffect } from "react";
import "../../styles/admin/manageCreditRegister.css";

export default function ManageTinChi() {
    const [tinChis, setTinChis] = useState([]);
    const [loaiTinChis, setLoaiTinChis] = useState([]);
    const [monHocs, setMonHocs] = useState([]);
    const [selectedTinChi, setSelectedTinChi] = useState(null);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [modalMode, setModalMode] = useState("add");

    const [formData, setFormData] = useState({
        tenTinChi: "",
        soTinChi: "",
        giaTriTinChi: "",
        loaiTinChiId: "",
        monHocId: "",
    });

    // 🔹 Lấy danh sách từ backend
    useEffect(() => {
        const fetchData = async () => {
            try {
                const [creditsRes, typesRes, subjectsRes] = await Promise.all([
                    apiClient.get("/credits"),
                    apiClient.get("/credit_types"),
                    apiClient.get("/subjects"),
                ]);

                setTinChis(creditsRes.data);
                setLoaiTinChis(typesRes.data);
                setMonHocs(subjectsRes.data);
            } catch (err) {
                console.error("Lỗi fetch dữ liệu:", err.response?.data || err);
            }
        };
        fetchData();
    }, []);


    const openModal = (mode, tc = null) => {
        setModalMode(mode);
        if (tc) {
            setFormData({
                id: tc.id,
                tenTinChi: tc.tenTinChi,
                soTinChi: tc.soTinChi,
                giaTriTinChi: tc.giaTriTinChi,
                loaiTinChiId: tc.loaiTinChiId || "",
                monHocId: tc.monHocId || "",
            });
        } else {
            setFormData({
                tenTinChi: "",
                soTinChi: "",
                giaTriTinChi: "",
                loaiTinChiId: "",
                monHocId: "",
            });
        }
        setIsModalOpen(true);
    };

    const closeModal = () => {
        setIsModalOpen(false);
        setSelectedTinChi(null);
    };

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData((prev) => ({ ...prev, [name]: value }));
    };

    // 🔹 Lưu (thêm / sửa)
    const handleSave = async (e) => {
        e.preventDefault();

        try {
            let res;
            if (modalMode === "add") {
                res = await apiClient.post("/credits", formData);
                setTinChis([...tinChis, res.data]);
                alert("Thêm tín chỉ thành công!");
            } else {
                res = await apiClient.put(`/credits/${formData.id}`, formData);
                setTinChis(tinChis.map((t) => (t.id === res.data.id ? res.data : t)));
                alert("Cập nhật tín chỉ thành công!");
            }
            closeModal();
        } catch (err) {
            console.error("Lỗi lưu tín chỉ:", err.response?.data || err);
            alert("Thao tác thất bại!");
        }
    };

    // 🔹 Xóa
    const handleDelete = async () => {
        if (!selectedTinChi) return alert("Chọn tín chỉ để xóa!");
        if (!window.confirm("Bạn có chắc muốn xóa tín chỉ này?")) return;

        try {
            await apiClient.delete(`/credits/${selectedTinChi.id}`);
            setTinChis(tinChis.filter((t) => t.id !== selectedTinChi.id));
            setSelectedTinChi(null);
            alert("Xóa thành công!");
        } catch (err) {
            console.error("Lỗi xóa tín chỉ:", err.response?.data || err);
            alert("Xóa thất bại!");
        }
    };

    return (
        <main className="container">
            <section className="banner-section">
                <h1 className="banner-title">🎓 Quản lý Tín chỉ</h1>
                <p className="banner-subtitle">
                    Thêm, sửa, xóa hoặc xem chi tiết tín chỉ.
                </p>
            </section>

            <div className="content-box">
                <div className="action-buttons">
                    <button onClick={() => openModal("add")} className="btn btn-blue">
                        ➕ Thêm
                    </button>
                    <button
                        onClick={() =>
                            selectedTinChi
                                ? openModal("edit", selectedTinChi)
                                : alert("Chọn tín chỉ để sửa")
                        }
                        className="btn btn-yellow"
                    >
                        ✏️ Sửa
                    </button>
                    <button onClick={handleDelete} className="btn btn-red">
                        🗑️ Xóa
                    </button>
                </div>

                {/* 🔹 Bảng danh sách */}
                <table className="tinchis-table">
                    <thead>
                        <tr>
                            <th>Tên tín chỉ</th>
                            <th>Số tín chỉ</th>
                            <th>Giá trị</th>
                            <th>Loại tín chỉ</th>
                            <th>Môn học</th>
                            <th>Chi tiết</th>
                        </tr>
                    </thead>
                    <tbody>
                        {tinChis.map((tc) => (
                            <tr
                                key={tc.id}
                                onClick={() => setSelectedTinChi(tc)}
                                className={selectedTinChi?.id === tc.id ? "selected-row" : ""}
                            >
                                <td>{tc.tenTinChi}</td>
                                <td>{tc.soTinChi}</td>
                                <td>{tc.giaTriTinChi?.toLocaleString()} đ</td>
                                <td>{tc.tenLoaiTinChi}</td>
                                <td>{tc.tenMonHoc}</td>
                                <td>
                                    <button
                                        onClick={(ev) => {
                                            ev.stopPropagation();
                                            openModal("view", tc);
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

            {/* 🔹 Modal Form */}
            {isModalOpen && (
                <div className="modal-overlay">
                    <div className="modal-box">
                        <h2>
                            {modalMode === "add"
                                ? "➕ Thêm tín chỉ"
                                : modalMode === "edit"
                                    ? "✏️ Sửa tín chỉ"
                                    : "👁️ Chi tiết tín chỉ"}
                        </h2>

                        <form onSubmit={handleSave}>
                            <input
                                type="text"
                                name="tenTinChi"
                                value={formData.tenTinChi}
                                onChange={handleChange}
                                placeholder="Tên tín chỉ"
                                readOnly={modalMode === "view"}
                            />
                            <input
                                type="number"
                                name="soTinChi"
                                value={formData.soTinChi}
                                onChange={handleChange}
                                placeholder="Số tín chỉ"
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

                            {/* 🔹 Combobox loại tín chỉ */}
                            <select
                                name="loaiTinChiId"
                                value={formData.loaiTinChiId}
                                onChange={handleChange}
                                disabled={modalMode === "view"}
                            >
                                <option value="">-- Chọn loại tín chỉ --</option>
                                {loaiTinChis.map((ltc) => (
                                    <option key={ltc.id} value={ltc.id}>
                                        {ltc.tenLoaiTinChi}
                                    </option>
                                ))}
                            </select>

                            {/* 🔹 Combobox môn học */}
                            <select
                                name="monHocId"
                                value={formData.monHocId}
                                onChange={handleChange}
                                disabled={modalMode === "view"}
                            >
                                <option value="">-- Chọn môn học --</option>
                                {monHocs.map((mh) => (
                                    <option key={mh.id} value={mh.id}>
                                        {mh.tenMonHoc}
                                    </option>
                                ))}
                            </select>

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
