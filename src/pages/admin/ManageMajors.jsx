import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import apiClient from "/src/api/apiClient";
import "../../styles/admin/manageMajors.css";

export default function ManageMajors() {
    const navigate = useNavigate();
    const [majors, setMajors] = useState([]);
    const [khoas, setKhoas] = useState([]); // Danh mục khoa cho Dropdown
    const [selectedMajor, setSelectedMajor] = useState(null);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [modalMode, setModalMode] = useState("add");
    const [searchKeyword, setSearchKeyword] = useState("");

    const [formData, setFormData] = useState({
        id: "",
        maNganh: "",
        tenNganh: "",
        khoaId: "",
    });

    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () => {
        try {
            const [resMajors, resKhoas] = await Promise.all([
                apiClient.get("/majors"),
                apiClient.get("/departments") // Giả định endpoint lấy danh sách khoa
            ]);
            setMajors(resMajors.data);
            setKhoas(resKhoas.data);
        } catch (err) {
            console.error("Lỗi tải dữ liệu:", err);
        }
    };

    // Tìm kiếm theo keyword (gọi API search của Controller)
    const handleSearch = async () => {
        try {
            const res = await apiClient.get(`/majors/search?keyword=${searchKeyword}`);
            setMajors(res.data);
        } catch (err) {
            console.error("Lỗi tìm kiếm:", err);
        }
    };

    const handleOpenModal = (mode, major = null) => {
        setModalMode(mode);
        if (major) {
            setFormData({
                id: major.id,
                maNganh: major.maNganh,
                tenNganh: major.tenNganh,
                khoaId: major.khoaId || "",
            });
        } else {
            setFormData({ id: "", maNganh: "", tenNganh: "", khoaId: "" });
        }
        setIsModalOpen(true);
    };

    const handleSave = async (e) => {
        e.preventDefault();
        try {
            if (modalMode === "add") {
                await apiClient.post("/majors", formData);
            } else {
                await apiClient.put(`/majors/${formData.id}`, formData);
            }
            fetchData();
            setIsModalOpen(false);
            setSelectedMajor(null);
            alert("Thao tác thành công!");
        } catch (err) {
            alert("Thao tác thất bại!");
        }
    };

    const handleDelete = async () => {
        if (!selectedMajor) return alert("Vui lòng chọn một ngành!");
        if (!window.confirm(`Xóa ngành: ${selectedMajor.tenNganh}?`)) return;
        try {
            await apiClient.delete(`/majors/${selectedMajor.id}`);
            setMajors(majors.filter(m => m.id !== selectedMajor.id));
            setSelectedMajor(null);
            alert("Xóa thành công!");
        } catch (err) {
            alert("Xóa thất bại!");
        }
    };

    return (
        <main className="manage-majors-container">
            {/* Banner Section */}
            <section className="banner-header">
                <h1 className="banner-title">Quản lý Ngành học</h1>
                <p className="banner-subtitle">Cấu hình danh mục ngành và thông tin đào tạo</p>
            </section>

            <section className="content-wrapper">
                {/* Thanh công cụ: Tìm kiếm + Nút chức năng ngang hàng */}
                <div className="toolbar-area">
                    <div className="search-box">
                        <input
                            type="text"
                            placeholder="Tìm kiếm ngành..."
                            value={searchKeyword}
                            onChange={(e) => setSearchKeyword(e.target.value)}
                        />
                        <button onClick={handleSearch} className="btn-search">Tìm</button>
                    </div>

                    <div className="group-buttons">
                        <button onClick={() => handleOpenModal("add")} className="btn btn-blue">
                            ➕ Thêm mới
                        </button>
                        <button
                            onClick={() => selectedMajor ? handleOpenModal("edit", selectedMajor) : alert("Chọn ngành để sửa")}
                            className="btn btn-yellow"
                        >
                            ✏️ Sửa
                        </button>
                        <button onClick={handleDelete} className="btn btn-red">
                            🗑️ Xóa
                        </button>
                        <button onClick={() => navigate("/admin/dashboard")} className="btn btn-gray">
                            🔙 Quay lại
                        </button>
                    </div>
                </div>

                {/* Table Section */}
                <div className="table-card">
                    <table className="majors-table">
                        <thead>
                            <tr>
                                <th>Mã Ngành</th>
                                <th>Tên Ngành</th>
                                <th>Khoa Trực Thuộc</th>
                            </tr>
                        </thead>
                        <tbody>
                            {majors.map((m) => (
                                <tr
                                    key={m.id}
                                    onClick={() => setSelectedMajor(m)}
                                    className={selectedMajor?.id === m.id ? "active-row" : ""}
                                >
                                    <td>{m.maNganh}</td>
                                    <td>{m.tenNganh}</td>
                                    <td>{m.tenKhoa || "Chưa xác định"}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </section>

            {/* Modal Form */}
            {isModalOpen && (
                <div className="modal-overlay">
                    <div className="modal-content">
                        <h3>{modalMode === "add" ? "Thêm Ngành Mới" : "Cập nhật Thông tin"}</h3>
                        <form onSubmit={handleSave}>
                            <div className="form-item">
                                <label>Mã Ngành</label>
                                <input
                                    value={formData.maNganh}
                                    onChange={(e) => setFormData({ ...formData, maNganh: e.target.value })}
                                    required
                                    placeholder="Mã ngành"
                                />
                            </div>
                            <div className="form-item">
                                <label>Tên Ngành</label>
                                <input
                                    value={formData.tenNganh}
                                    onChange={(e) => setFormData({ ...formData, tenNganh: e.target.value })}
                                    required
                                    placeholder="Tên ngành"
                                />
                            </div>
                            <div className="form-item">
                                <label>Khoa</label>
                                <select
                                    value={formData.khoaId}
                                    onChange={(e) => setFormData({ ...formData, khoaId: e.target.value })}
                                    required
                                >
                                    <option value="">-- Chọn khoa --</option>
                                    {khoas.map(k => <option key={k.id} value={k.id}>{k.tenKhoa}</option>)}
                                </select>
                            </div>
                            <div className="modal-btns">
                                <button type="submit" className="btn-submit">Lưu</button>
                                <button type="button" onClick={() => setIsModalOpen(false)} className="btn-close">Hủy</button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </main>
    );
}