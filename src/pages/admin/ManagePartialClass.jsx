import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import apiClient from "/src/api/apiClient";
import "../../styles/admin/manageClassSections.css";

export default function ManageClassSections() {
    const navigate = useNavigate();
    const [classes, setClasses] = useState([]);
    const [subjects, setSubjects] = useState([]);
    const [lecturers, setLecturers] = useState([]);
    const [semesters, setSemesters] = useState([]);

    const [selectedClass, setSelectedClass] = useState(null);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [modalMode, setModalMode] = useState("add"); // add | edit | view
    const [search, setSearch] = useState("");
    const [loading, setLoading] = useState(false);

    // Form data dựa trên LopHocPhanRequestDTO
    const [formData, setFormData] = useState({
        id: "",
        maLopHocPhan: "",
        so_luong_toi_da: 40,
        so_luong_hien_tai: 0,
        trang_thai: "MO_DANG_KY",
        monHocId: "",
        giangVienId: "",
        kiHocId: ""
    });

    const fetchData = async () => {
        setLoading(true);
        try {
            const [resClass, resSub, resLec, resSem] = await Promise.all([
                apiClient.get("/class"),
                apiClient.get("/subjects"), // Giả định endpoint lấy môn học
                apiClient.get("/staffs/by-vitri?viTri=GIANG_VIEN"), // Giả định endpoint lấy giảng viên
                apiClient.get("/semesters")  // Giả định endpoint lấy kì học
            ]);
            setClasses(resClass.data);
            setSubjects(resSub.data);
            setLecturers(resLec.data);
            setSemesters(resSem.data);
        } catch (err) {
            console.error("Lỗi tải dữ liệu:", err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => { fetchData(); }, []);

    const handleOpenModal = (mode, item = null) => {
        setModalMode(mode);
        if (item) {
            setFormData({
                id: item.id,
                maLopHocPhan: item.maLopHocPhan,
                so_luong_toi_da: item.soLuongToiDa,
                so_luong_hien_tai: item.soLuongHienTai,
                trang_thai: item.trangThai,
                monHocId: item.monHocId,
                giangVienId: item.giangVienId,
                kiHocId: item.kiHocId
            });
        } else {
            setFormData({
                id: "", maLopHocPhan: "", so_luong_toi_da: 40,
                so_luong_hien_tai: 0, trang_thai: "MO_DANG_KY",
                monHocId: "", giangVienId: "", kiHocId: ""
            });
        }
        setIsModalOpen(true);
    };

    const handleSave = async (e) => {
        e.preventDefault();
        try {
            if (modalMode === "add") {
                if (formData.monHocId != null) {
                    await apiClient.post("/class", formData);
                    alert("Thêm lớp học phần thành công!");
                } else {
                    alert("Môn học không được để trống!");
                }
            } else {
                await apiClient.put(`/class/${formData.id}`, formData);
                alert("Cập nhật thành công!");
            }
            fetchData();
            setIsModalOpen(false);
        } catch (err) {
            console.log(formData.monHocId);
            alert("Thao tác thất bại!");
        }
    };

    const handleDelete = async () => {
        if (!selectedClass) return alert("Vui lòng chọn lớp học phần để xóa!");
        if (!window.confirm(`Xóa lớp: ${selectedClass.maLopHocPhan}?`)) return;
        try {
            await apiClient.delete(`/class/${selectedClass.id}`);
            setClasses(classes.filter(c => c.id !== selectedClass.id));
            setSelectedClass(null);
            alert("Đã xóa!");
        } catch (err) { alert("Xóa thất bại!"); }
    };

    return (
        <main className="manage-class-container">
            <section className="banner-section">
                <h1 className="banner-title">🏫 Quản lý Lớp học phần</h1>
                <p className="banner-subtitle">Tổ chức lớp học, phân công giảng viên và quản lý sĩ số.</p>
            </section>

            <div className="toolbar-box">
                <input
                    type="text"
                    placeholder="🔍 Tìm mã lớp, môn học..."
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                />
                <div className="toolbar-buttons">
                    <button onClick={() => handleOpenModal("add")} className="btn btn-blue">➕ Thêm mới</button>
                    <button onClick={() => selectedClass ? handleOpenModal("edit", selectedClass) : alert("Chọn lớp để sửa")} className="btn btn-yellow">✏️ Sửa</button>
                    <button onClick={handleDelete} className="btn btn-red">🗑️ Xóa</button>
                    <button onClick={() => navigate("/admin/dashboard")} className="btn btn-gray">Quay lại</button>
                </div>
            </div>

            <section className="table-card">
                <table className="class-table">
                    <thead>
                        <tr>
                            <th>Mã LHP</th>
                            <th>Môn học</th>
                            <th>Giảng viên</th>
                            <th>Sĩ số</th>
                            <th>Trạng thái</th>
                            <th style={{ textAlign: "center" }}>Hành động</th>
                        </tr>
                    </thead>
                    <tbody>
                        {classes.filter(c => c.maLopHocPhan.toLowerCase().includes(search.toLowerCase())).map((item) => (
                            <tr
                                key={item.id}
                                onClick={() => setSelectedClass(item)}
                                className={selectedClass?.id === item.id ? "selected-row" : ""}
                            >
                                <td><strong>{item.maLopHocPhan}</strong></td>

                                <td>{item.tenMonHoc} ({item.tongSoTinChi}TC)</td>
                                <td>{item.hoTen}</td>
                                <td>{item.soLuongHienTai}/{item.soLuongToiDa}</td>
                                <td>
                                    <span className={`badge ${item.trangThai}`}>
                                        {item.trangThai}
                                    </span>
                                </td>
                                <td style={{ textAlign: "center" }}>
                                    <button className="btn-view-inline" onClick={(e) => { e.stopPropagation(); handleOpenModal("view", item); }}>
                                        Xem chi tiết
                                    </button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </section>

            {isModalOpen && (
                <div className="modal-overlay">
                    <div className="modal-large">
                        <h2>{modalMode === "view" ? "👁️ Chi tiết LHP" : modalMode === "edit" ? "✏️ Chỉnh sửa LHP" : "➕ Tạo lớp học phần"}</h2>
                        <form onSubmit={handleSave}>
                            <div className="form-split-2">
                                {/* CỘT 1: THÔNG TIN CHUNG */}
                                <div className="form-col">
                                    <h3>📘 Thông tin định danh</h3>
                                    <div className="input-group">
                                        <span>Mã lớp học phần</span>
                                        <input value={formData.maLopHocPhan} onChange={(e) => setFormData({ ...formData, maLopHocPhan: e.target.value })} disabled={modalMode === "view"} required />

                                        <span>Môn học</span>
                                        <select value={formData.monHocId} onChange={(e) => setFormData({ ...formData, monHocId: e.target.value })} disabled={modalMode === "view"} required>
                                            <option value="">-- Chọn môn học --</option>
                                            {subjects.map(s => <option key={s.id} value={s.id}>{s.tenMonHoc}</option>)}
                                        </select>

                                        <span>Kì học</span>
                                        <select value={formData.kiHocId} onChange={(e) => setFormData({ ...formData, kiHocId: e.target.value })} disabled={modalMode === "view"} required>
                                            <option value="">-- Chọn kì học --</option>
                                            {semesters.map(k => <option key={k.id} value={k.id}>{k.tenKiHoc}</option>)}
                                        </select>
                                    </div>
                                </div>

                                {/* CỘT 2: QUẢN LÝ ĐÀO TẠO */}
                                <div className="form-col">
                                    <h3>👨‍🏫 Giảng dạy & Sĩ số</h3>
                                    <div className="input-group">
                                        <span>Giảng viên</span>
                                        <select value={formData.giangVienId} onChange={(e) => setFormData({ ...formData, giangVienId: e.target.value })} disabled={modalMode === "view"} required>
                                            <option value="">-- Chọn giảng viên --</option>
                                            {lecturers.map(g => <option key={g.id} value={g.id}>{g.hoTen}</option>)}
                                        </select>

                                        <span>Số lượng tối đa</span>
                                        <input type="number" value={formData.so_luong_toi_da} onChange={(e) => setFormData({ ...formData, so_luong_toi_da: e.target.value })} disabled={modalMode === "view"} />

                                        <span>Trạng thái</span>
                                        <select value={formData.trang_thai} onChange={(e) => setFormData({ ...formData, trang_thai: e.target.value })} disabled={modalMode === "view"}>
                                            <option value="MO_DANG_KY">Đang mở đăng ký</option>
                                            <option value="DANG_HOC">Đang học</option>
                                            <option value="DA_KET_THUC">Đã kết thúc</option>

                                        </select>
                                    </div>
                                </div>
                            </div>
                            <div className="modal-foot">
                                {modalMode !== "view" && <button type="submit" className="btn-save">Xác nhận lưu</button>}
                                <button type="button" onClick={() => setIsModalOpen(false)} className="btn-close-modal">Đóng</button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </main>
    );
}