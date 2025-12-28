import React, { useState, useEffect } from "react";
import apiClient from "/src/api/apiClient";
import "../../styles/admin/manageSchedule.css";

export default function ManageSchedule() {
    // Dữ liệu danh sách chính
    const [lichHocs, setLichHocs] = useState([]);

    // Dữ liệu danh mục để đổ vào SelectBox
    const [gioHocs, setGioHocs] = useState([]);
    const [phongHocs, setPhongHocs] = useState([]);
    const [lopHocPhans, setLopHocPhans] = useState([]);

    // Trạng thái UI
    const [selected, setSelected] = useState(null);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [modalMode, setModalMode] = useState("add"); // add | edit | view

    // Form data khớp với LichHocRequestDTO (Sử dụng ID để gửi lên server)
    const [formData, setFormData] = useState({
        ngayHoc: "",
        gioHocId: "",
        phongHocId: "",
        lopHocPhanId: "",
        ghiChu: ""
    });

    useEffect(() => {
        fetchInitialData();
    }, []);

    const fetchInitialData = async () => {
        try {
            const [times, rooms, classes, schedules] = await Promise.all([
                apiClient.get("/class_times"),
                apiClient.get("/rooms"),
                apiClient.get("/class"),
                apiClient.get("/schedules")
            ]);
            setLichHocs(schedules.data || []);
            setGioHocs(times.data || []);
            setPhongHocs(rooms.data || []);
            setLopHocPhans(classes.data || []);
        } catch (err) {
            console.error("Lỗi fetch dữ liệu:", err);
        }
    };

    const openModal = (mode, item = null) => {
        setModalMode(mode);
        if (item) {
            // Khi sửa, cần truyền ID của các thực thể liên quan vào form
            // Lưu ý: Đảm bảo item nhận được từ getAll có chứa các ID gốc hoặc map lại từ list danh mục
            setFormData({
                id: item.id,
                ngayHoc: item.ngayHoc,
                gioHocId: gioHocs.find(g => g.tenGioHoc === item.tengioHoc)?.id || "",
                phongHocId: phongHocs.find(p => p.tenPhong === item.tenPhong)?.id || "",
                lopHocPhanId: lopHocPhans.find(l => l.maLopHocPhan === item.tenLop)?.id || "",
                ghiChu: item.ghiChu || ""
            });
        } else {
            setFormData({
                ngayHoc: new Date().toISOString().split("T")[0],
                gioHocId: "",
                phongHocId: "",
                lopHocPhanId: "",
                ghiChu: ""
            });
        }
        setIsModalOpen(true);
    };

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleSave = async (e) => {
        e.preventDefault();
        try {
            let res;
            if (modalMode === "add") {
                res = await apiClient.post("/schedules", formData);
                setLichHocs([...lichHocs, res.data]);
                alert("Thêm lịch học thành công!");
            } else {
                res = await apiClient.put(`/schedules/${formData.id}`, formData);
                setLichHocs(lichHocs.map(l => l.id === res.data.id ? res.data : l));
                alert("Cập nhật thành công!");
            }
            setIsModalOpen(false);
        } catch (err) {
            alert(err.response?.data?.message || "Lỗi khi lưu dữ liệu!");
        }
    };

    const handleDelete = async (id) => {
        if (!window.confirm("Bạn có chắc chắn muốn xóa lịch học này?")) return;
        try {
            await apiClient.delete(`/schedules/${id}`);
            setLichHocs(lichHocs.filter(l => l.id !== id));
            alert("Đã xóa lịch học!");
        } catch (err) {
            alert("Xóa thất bại!");
        }
    };

    return (
        <main className="crud-page">
            <div className="header-actions">
                <h1>📅 Quản lý Lịch học Chi tiết</h1>
                <button className="btn btn-primary" onClick={() => openModal("add")}>+ Thêm lịch mới</button>
            </div>
            <div className="page-header">
                <p>Tổng số lịch học: <strong>{lichHocs.length}</strong></p>
                <div className="actions">
                    <button className="btn primary" onClick={() => openModal("add")}>+ Thêm lịch mới</button>
                </div>
            </div>

            <table className="crud-table">
                <thead>
                    <tr>
                        <th>Ngày học</th>
                        <th>Lớp / Môn học</th>
                        <th>Giờ học</th>
                        <th>Phòng học</th>
                        <th>Giảng viên</th>
                        <th>Ghi chú</th>
                        <th>Thao tác</th>
                    </tr>
                </thead>
                <tbody>
                    {lichHocs.map((l) => (
                        <tr key={l.id} onClick={() => setSelected(l)} className={selected?.id === l.id ? "active" : ""}>
                            <td>{l.ngayHoc}</td>
                            <td>
                                <div><strong>{l.tenLop}</strong></div>
                                <small style={{ color: '#667' }}>{l.tenMonHoc}</small>
                            </td>
                            <td>{l.tengioHoc}</td>
                            <td>
                                <div>{l.tenPhong}</div>
                                <small className="tag-location">{l.toaNha} - Tầng {l.tang}</small>
                            </td>
                            <td>{l.tenGiangVien}</td>
                            <td><span className="note-text">{l.ghiChu || "-"}</span></td>
                            <td>
                                <div className="cell-actions">
                                    <button className="icon-btn" onClick={(ev) => { ev.stopPropagation(); openModal("view", l); }}>👁</button>
                                    <button className="icon-btn edit" onClick={(ev) => { ev.stopPropagation(); openModal("edit", l); }}>✏️</button>
                                    <button className="icon-btn delete" onClick={(ev) => { ev.stopPropagation(); handleDelete(l.id); }}>🗑️</button>
                                </div>
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>

            {isModalOpen && (
                <div className="modal">
                    <div className="modal-card">
                        <div className="modal-header">
                            <h2>{modalMode === "add" ? "Thêm lịch học" : modalMode === "edit" ? "Sửa lịch học" : "Chi tiết lịch học"}</h2>
                        </div>
                        <form onSubmit={handleSave}>
                            <div className="form-grid">
                                <div className="form-group">
                                    <label>Ngày học</label>
                                    <input type="date" name="ngayHoc" value={formData.ngayHoc} onChange={handleChange} required disabled={modalMode === "view"} />
                                </div>

                                <div className="form-group">
                                    <label>Giờ học</label>
                                    <select name="gioHocId" value={formData.gioHocId} onChange={handleChange} required disabled={modalMode === "view"}>
                                        <option value="">-- Chọn giờ --</option>
                                        {gioHocs.map(g => <option key={g.id} value={g.id}>{g.tenGioHoc} ({g.thoiGianBatDau})</option>)}
                                    </select>
                                </div>

                                <div className="form-group">
                                    <label>Lớp học phần</label>
                                    <select name="lopHocPhanId" value={formData.lopHocPhanId} onChange={handleChange} required disabled={modalMode === "view"}>
                                        <option value="">-- Chọn lớp --</option>
                                        {lopHocPhans.map(l => <option key={l.id} value={l.id}>{l.maLopHocPhan}</option>)}
                                    </select>
                                </div>

                                <div className="form-group">
                                    <label>Phòng học</label>
                                    <select name="phongHocId" value={formData.phongHocId} onChange={handleChange} required disabled={modalMode === "view"}>
                                        <option value="">-- Chọn phòng --</option>
                                        {phongHocs.map(p => <option key={p.id} value={p.id}>{p.tenPhong} ({p.toaNha})</option>)}
                                    </select>
                                </div>

                                <div className="form-group full-width">
                                    <label>Ghi chú</label>
                                    <textarea name="ghiChu" value={formData.ghiChu} onChange={handleChange} disabled={modalMode === "view"} placeholder="Nhập ghi chú buổi học..."></textarea>
                                </div>
                            </div>
                            <div className="modal-actions">
                                <button type="button" className="btn" onClick={() => setIsModalOpen(false)}>Đóng</button>
                                {modalMode !== "view" && <button type="submit" className="btn primary">Lưu dữ liệu</button>}
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </main>
    );
}