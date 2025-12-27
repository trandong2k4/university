import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import "../../styles/admin/manageStudents.css";
import apiClient from "/src/api/apiClient";

export default function ManageStudents() {
    const navigate = useNavigate();
    const [students, setStudents] = useState([]);
    const [nganhs, setNganhs] = useState([]);
    const [selectedStudent, setSelectedStudent] = useState(null);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [modalMode, setModalMode] = useState("add"); // add | edit | view
    const [search, setSearch] = useState("");
    const [loading, setLoading] = useState(false);
    const [loadingsum, setLoadingsum] = useState(false);

    // Form data states
    const [svData, setSvData] = useState({
        id: "", maSinhVien: "", hoTen: "", ngayNhapHoc: "", ngayTotNghiep: "", soDienThoai: "", nganhId: ""
    });
    const [ctsvData, setCtsvData] = useState({
        id: "", diaChi: "", ngaySinh: "", gioiTinh: "NAM", quocTich: "Việt Nam", cccd: "", sdtNguoiThan: ""
    });

    const fetchData = async () => {
        setLoadingsum(true);
        try {
            const [resSv, resNganh] = await Promise.all([
                apiClient.get("/students/admin"),
                apiClient.get("/majors")
            ]);
            setStudents(resSv.data);
            setNganhs(resNganh.data);
        } catch (err) { console.error(err); }
        finally { setLoadingsum(false); }
    };

    useEffect(() => { fetchData(); }, []);

    const handleOpenModal = async (mode, student = null) => {
        setModalMode(mode);
        if (student) {
            setSelectedStudent(student);
            setLoading(true);
            try {
                const resDetail = await apiClient.get(`/student_details/by-sv/${student.id}`);
                setSvData({ ...student });
                setCtsvData(resDetail.data || {});
            } catch (err) {
                setSvData({ ...student });
                setCtsvData({ diaChi: "", ngaySinh: "", gioiTinh: "NAM", quocTich: "Việt Nam", cccd: "", sdtNguoiThan: "" });
            } finally { setLoading(false); }
        } else {
            setSvData({ maSinhVien: "", hoTen: "", soDienThoai: "", ngayNhapHoc: "", ngayTotNghiep: "", nganhId: "" });
            setCtsvData({ diaChi: "", ngaySinh: "", gioiTinh: "NAM", quocTich: "Việt Nam", cccd: "", sdtNguoiThan: "" });
        }
        setIsModalOpen(true);
    };

    const handleDelete = async () => {
        if (!selectedStudent) return alert("Vui lòng click chọn một dòng để xóa!");
        if (!window.confirm(`Bạn có chắc muốn xóa sinh viên ${selectedStudent.hoTen}?`)) return;
        try {
            await apiClient.delete(`/students/${selectedStudent.id}`);
            setStudents(students.filter(s => s.id !== selectedStudent.id));
            setSelectedStudent(null);
            alert("Xóa thành công!");
        } catch (err) { alert("Xóa thất bại!"); }
    };

    const handleSave = async (e) => {
        e.preventDefault();
        try {
            if (modalMode === "add") {
                const resSv = await apiClient.post("/students", svData);
                await apiClient.post("/student_details", { ...ctsvData, sinhVienId: resSv.data.id });
                alert("Thêm thành công!");
            } else {
                await apiClient.put(`/students/${svData.id}`, svData);
                await apiClient.put(`/student_details/student/${svData.id}`, ctsvData);
                alert("Cập nhật thành công!");
            }
            fetchData();
            setIsModalOpen(false);
        } catch (err) { alert("Thao tác thất bại!"); }
    };

    return (
        <main className="container">
            <section className="banner-section">
                <h1 className="banner-title">🎓 Quản lý Sinh viên</h1>
                <p className="banner-subtitle">Hệ thống quản lý dữ liệu tập trung ngang hàng.</p>
            </section>

            <div className="action-bar">
                <input type="text" placeholder="🔍 Tìm mã SV, tên hoặc ngành..." value={search} onChange={(e) => setSearch(e.target.value)} />
                <div className="actions">
                    <button onClick={() => handleOpenModal("add")} className="btn btn-blue">➕ Thêm mới</button>
                    <button onClick={() => selectedStudent ? handleOpenModal("edit", selectedStudent) : alert("Chọn SV để sửa")} className="btn btn-yellow">✏️ Sửa</button>
                    <button onClick={handleDelete} className="btn btn-red">🗑️ Xóa</button>
                    <button onClick={() => navigate("/admin/dashboard")} className="btn btn-gray">Quay lại</button>
                </div>
            </div>

            <section className="table-section">
                <h3 className="loading-sum">{loadingsum ? "Đang tải dữ liệu..." : `Tổng cộng: ${students.length} sinh viên`}</h3>
                <div className="table-wrapper">
                    <table className="students-table">
                        <thead>
                            <tr>
                                <th>Mã SV</th>
                                <th>Họ tên</th>
                                <th>Ngành</th>
                                <th style={{ textAlign: "center" }}>Hành động</th>
                            </tr>
                        </thead>
                        <tbody>
                            {students.filter(s => s.hoTen.toLowerCase().includes(search.toLowerCase()) || s.maSinhVien.includes(search)).map((sv) => (
                                <tr
                                    key={sv.id}
                                    onClick={() => setSelectedStudent(sv)}
                                    className={selectedStudent?.id === sv.id ? "selected" : ""}
                                >
                                    <td><strong>{sv.maSinhVien}</strong></td>
                                    <td>{sv.hoTen}</td>
                                    <td>{sv.tenNganh}</td>
                                    <td style={{ textAlign: "center" }}>
                                        <button
                                            className="btn-view-small"
                                            onClick={(e) => { e.stopPropagation(); handleOpenModal("view", sv); }}
                                        >
                                            Xem chi tiết
                                        </button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </section>

            {/* Modal Form giữ nguyên cấu trúc side-by-side của bạn */}
            {isModalOpen && (
                <div className="modal-overlay">
                    <div className="modal large">
                        <h2>{modalMode === "view" ? "👁️ Chi tiết sinh viên" : modalMode === "edit" ? "✏️ Chỉnh sửa" : "➕ Thêm mới"}</h2>
                        <form onSubmit={handleSave}>
                            <div className="form-center">
                                {/* CỘT TRÁI */}
                                <div className="form-section-column">
                                    <h3>📘 Thông tin sinh viên</h3>
                                    <div className="form-grid">
                                        <span>Mã sinh viên</span>
                                        <input
                                            value={svData.maSinhVien}
                                            onChange={(e) => setSvData({ ...svData, maSinhVien: e.target.value })}
                                            disabled={modalMode === "view"}
                                            required
                                        />

                                        <span>Họ tên</span>
                                        <input
                                            value={svData.hoTen}
                                            onChange={(e) => setSvData({ ...svData, hoTen: e.target.value })}
                                            disabled={modalMode === "view"}
                                            required
                                        />

                                        <span>Số điện thoại</span>
                                        <input
                                            value={svData.soDienThoai}
                                            onChange={(e) => setSvData({ ...svData, soDienThoai: e.target.value })}
                                            disabled={modalMode === "view"}
                                        />

                                        <span>Ngày nhập học</span>
                                        <input
                                            type="date"
                                            value={svData.ngayNhapHoc || ""}
                                            onChange={(e) => setSvData({ ...svData, ngayNhapHoc: e.target.value })}
                                            disabled={modalMode === "view"}
                                        />

                                        <span>Ngày tốt nghiệp</span>
                                        <input
                                            type="date"
                                            value={svData.ngayTotNghiep || ""}
                                            onChange={(e) => setSvData({ ...svData, ngayTotNghiep: e.target.value })}
                                            disabled={modalMode === "view"}
                                        />

                                        <span>Ngành học</span>
                                        <select
                                            value={svData.nganhId}
                                            onChange={(e) => setSvData({ ...svData, nganhId: e.target.value })}
                                            disabled={modalMode === "view"}
                                            required
                                        >
                                            <option value="">-- Chọn ngành --</option>
                                            {nganhs.map(n => (
                                                <option key={n.id} value={n.id}>{n.tenNganh}</option>
                                            ))}
                                        </select>
                                    </div>
                                </div>

                                {/* CỘT PHẢI */}
                                <div className="form-section-column">
                                    <h3>🏠 Thông tin chi tiết</h3>
                                    <div className="form-grid">
                                        <span>Ngày sinh</span>
                                        <input
                                            type="date"
                                            value={ctsvData.ngaySinh || ""}
                                            onChange={(e) => setCtsvData({ ...ctsvData, ngaySinh: e.target.value })}
                                            disabled={modalMode === "view"}
                                        />

                                        <span>Giới tính</span>
                                        <select
                                            value={ctsvData.gioiTinh}
                                            onChange={(e) => setCtsvData({ ...ctsvData, gioiTinh: e.target.value })}
                                            disabled={modalMode === "view"}
                                        >
                                            <option value="NAM">Nam</option>
                                            <option value="NU">Nữ</option>
                                        </select>

                                        <span>Quốc tịch</span>
                                        <input
                                            value={ctsvData.quocTich}
                                            onChange={(e) => setCtsvData({ ...ctsvData, quocTich: e.target.value })}
                                            disabled={modalMode === "view"}
                                        />

                                        <span>CCCD</span>
                                        <input
                                            value={ctsvData.cccd}
                                            onChange={(e) => setCtsvData({ ...ctsvData, cccd: e.target.value })}
                                            disabled={modalMode === "view"}
                                        />

                                        <span>Địa chỉ</span>
                                        <input
                                            value={ctsvData.diaChi}
                                            onChange={(e) => setCtsvData({ ...ctsvData, diaChi: e.target.value })}
                                            disabled={modalMode === "view"}
                                        />

                                        <span>SĐT người thân</span>
                                        <input
                                            value={ctsvData.sdtNguoiThan}
                                            onChange={(e) => setCtsvData({ ...ctsvData, sdtNguoiThan: e.target.value })}
                                            disabled={modalMode === "view"}
                                        />
                                    </div>
                                </div>
                            </div>

                            <div className="modal-actions">
                                {modalMode !== "view" && <button type="submit" className="btn btn-green">💾 Lưu dữ liệu</button>}
                                <button type="button" onClick={() => setIsModalOpen(false)} className="btn btn-gray">Đóng</button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </main>
    );
}