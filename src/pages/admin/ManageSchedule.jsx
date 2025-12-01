import React, { useState, useEffect } from "react";
import apiClient from "/src/api/apiClient";
import "../../styles/admin/manageSchedule.css";

export default function ManageSchedule() {
    const [gioHocs, setGioHocs] = useState([]);
    const [lichHocs, setLichHocs] = useState([]);
    const [selected, setSelected] = useState(null);

    // Modal control
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [modalMode, setModalMode] = useState("add"); // add | edit | view
    const [modalType, setModalType] = useState(""); // "giohoc" | "lichhoc"

    const [formData, setFormData] = useState({});

    // Fetch dữ liệu
    useEffect(() => {
        const fetchData = async () => {
            try {
                const [timesRes, schedulesRes] = await Promise.all([
                    apiClient.get("/class_times"),
                    apiClient.get("/schedules"),
                ]);
                setGioHocs(timesRes.data);        // GioHocResponseDTO[]
                setLichHocs(schedulesRes.data);   // LichHocResponseDTO[]
            } catch (err) {
                console.error("Lỗi fetch schedule data:", err.response?.data || err);
            }
        };
        fetchData();
    }, []);

    // Modal logic
    const openModal = (type, mode, item = null) => {
        setModalType(type);
        setModalMode(mode);
        setFormData(item ? item : {});
        setIsModalOpen(true);
    };

    const closeModal = () => {
        setIsModalOpen(false);
        setSelected(null);
    };

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData((prev) => ({ ...prev, [name]: value }));
    };

    // Lưu (thêm/sửa)
    const handleSave = async (e) => {
        e.preventDefault();
        let url = "";
        let list = [];
        let setList;

        if (modalType === "giohoc") {
            url = modalMode === "add" ? "/class_times" : `/class_times/${formData.id}`;
            list = gioHocs; setList = setGioHocs;
        } else if (modalType === "lichhoc") {
            url = modalMode === "add" ? "/schedules" : `/schedules/${formData.id}`;
            list = lichHocs; setList = setLichHocs;
        }

        try {
            let res;
            if (modalMode === "add") {
                res = await apiClient.post(url, formData);
                setList([...list, res.data]);
            } else {
                res = await apiClient.put(url, formData);
                setList(list.map((i) => (i.id === res.data.id ? res.data : i)));
            }
            closeModal();
        } catch (err) {
            console.error("Lỗi lưu dữ liệu:", err.response?.data || err);
            alert("Thao tác thất bại!");
        }
    };

    // Xóa
    const handleDelete = async (type, id) => {
        const mapApi = { giohoc: "/class_times", lichhoc: "/schedules" };
        if (!window.confirm("Bạn có chắc muốn xóa mục này?")) return;

        try {
            await apiClient.delete(`${mapApi[type]}/${id}`);
            if (type === "giohoc") setGioHocs(gioHocs.filter((g) => g.id !== id));
            if (type === "lichhoc") setLichHocs(lichHocs.filter((l) => l.id !== id));
        } catch (err) {
            console.error("Lỗi xóa dữ liệu:", err.response?.data || err);
            alert("Xóa thất bại!");
        }
    };

    return (
        <main className="schedule-container">
            <h1 className="title">📚 Quản lý Lịch học & Giờ học</h1>

            {/* Giờ học */}
            <section className="section">
                <h2>🕒 Giờ học</h2>
                <button className="btn btn-blue" onClick={() => openModal("giohoc", "add")}>Thêm</button>
                <table>
                    <thead>
                        <tr><th>Mã</th><th>Tên giờ</th><th>Bắt đầu</th><th>Kết thúc</th><th>Hành động</th></tr>
                    </thead>
                    <tbody>
                        {gioHocs.map(g => (
                            <tr key={g.id}>
                                <td>{g.maGioHoc}</td>
                                <td>{g.tenGioHoc}</td>
                                <td>{g.thoiGianBatDau}</td>
                                <td>{g.thoiGianKetThuc}</td>
                                <td>
                                    <button className="btn btn-yellow" onClick={() => openModal("giohoc", "edit", g)}>Sửa</button>
                                    <button className="btn btn-red" onClick={() => handleDelete("giohoc", g.id)}>Xóa</button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </section>

            {/* Lịch học */}
            <section className="section">
                <h2>📘 Lịch học</h2>
                <button className="btn btn-blue" onClick={() => openModal("lichhoc", "add")}>Thêm</button>
                <table>
                    <thead>
                        <tr><th>Ngày</th><th>Thứ</th><th>Giờ học</th><th>Môn học</th><th>Ghi chú</th><th>Hành động</th></tr>
                    </thead>
                    <tbody>
                        {lichHocs.map(l => (
                            <tr key={l.id}>
                                <td>{l.ngayHoc}</td>
                                <td>{l.thuTrongTuan}</td>
                                <td>{l.tenGioHoc}</td>
                                <td>{l.tenMonHoc}</td>
                                <td>{l.ghiChu}</td>
                                <td>
                                    <button className="btn btn-yellow" onClick={() => openModal("lichhoc", "edit", l)}>Sửa</button>
                                    <button className="btn btn-red" onClick={() => handleDelete("lichhoc", l.id)}>Xóa</button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </section>

            {/* Modal */}
            {isModalOpen && (
                <div className="modal-overlay">
                    <div className="modal-box">
                        <h2>{modalMode === "add" ? "➕ Thêm" : "✏️ Sửa"} {modalType.toUpperCase()}</h2>
                        <form onSubmit={handleSave}>
                            {modalType === "giohoc" && (
                                <>
                                    <input name="maGioHoc" placeholder="Mã giờ học" value={formData.maGioHoc || ""} onChange={handleChange} />
                                    <input name="tenGioHoc" placeholder="Tên giờ học" value={formData.tenGioHoc || ""} onChange={handleChange} />
                                    <input type="time" name="thoiGianBatDau" value={formData.thoiGianBatDau || ""} onChange={handleChange} />
                                    <input type="time" name="thoiGianKetThuc" value={formData.thoiGianKetThuc || ""} onChange={handleChange} />
                                </>
                            )}

                            {modalType === "lichhoc" && (
                                <>
                                    <input type="date" name="ngayHoc" value={formData.ngayHoc || ""} onChange={handleChange} />
                                    <input name="thuTrongTuan" placeholder="Thứ trong tuần" value={formData.thuTrongTuan || ""} onChange={handleChange} />
                                    <input name="tenGioHoc" placeholder="Tên giờ học" value={formData.tenGioHoc || ""} onChange={handleChange} />
                                    <input name="tenMonHoc" placeholder="Tên môn học" value={formData.tenMonHoc || ""} onChange={handleChange} />
                                    <input name="ghiChu" placeholder="Ghi chú" value={formData.ghiChu || ""} onChange={handleChange} />
                                </>
                            )}

                            <div className="modal-actions">
                                <button type="submit" className="btn btn-green">💾 Lưu</button>
                                <button type="button" className="btn btn-gray" onClick={closeModal}>Đóng</button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </main>
    );
}
