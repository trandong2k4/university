import React, { useState, useEffect } from "react";
import "../../styles/admin/manageSchedule.css";

export default function ManageSchedule() {
    // ========== GIỜ HỌC ==========
    const [gioHocs, setGioHocs] = useState([]);
    const [lichHocs, setLichHocs] = useState([]);
    const [buoiHocs, setBuoiHocs] = useState([]);
    const [monHocs, setMonHocs] = useState([]);
    const [phongs, setPhongs] = useState([]);
    const [kiHocs, setKiHocs] = useState([]);
    const [selected, setSelected] = useState(null);

    // Modal control
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [modalMode, setModalMode] = useState("add");
    const [modalType, setModalType] = useState(""); // "giohoc" | "lichhoc" | "buoihoc"

    const [formData, setFormData] = useState({});

    // 🔹 Fetch tất cả dữ liệu khi component mount
    useEffect(() => {
        const fetchData = async () => {
            try {
                const [timesRes, schedulesRes, sessionsRes, subjectsRes, roomsRes, semestersRes] = await Promise.all([
                    apiClient.get("/class_times"),
                    apiClient.get("/schedules"),
                    apiClient.get("/class_sessions"),
                    apiClient.get("/subjects"),
                    apiClient.get("/rooms"),
                    apiClient.get("/semesters")
                ]);

                setGioHocs(timesRes.data);
                setLichHocs(schedulesRes.data);
                setBuoiHocs(sessionsRes.data);
                setMonHocs(subjectsRes.data);
                setPhongs(roomsRes.data);
                setKiHocs(semestersRes.data);
            } catch (err) {
                console.error("Lỗi fetch schedule data:", err.response?.data || err);
            }
        };
        fetchData();
    }, []);


    // ======== MODAL LOGIC ========
    const openModal = (type, mode, item = null) => {
        setModalType(type);
        setModalMode(mode);
        if (item) setFormData(item);
        else setFormData({});
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

    // 🔹 Xử lý lưu (thêm/sửa)
    const handleSave = async (e) => {
        e.preventDefault();
        let url = "", list = [], setList;

        if (modalType === "giohoc") {
            url = modalMode === "add" ? "/class_times" : `/class_times/${formData.id}`;
            list = gioHocs; setList = setGioHocs;
        } else if (modalType === "lichhoc") {
            url = modalMode === "add" ? "/schedules" : `/schedules/${formData.id}`;
            list = lichHocs; setList = setLichHocs;
        } else if (modalType === "buoihoc") {
            url = modalMode === "add" ? "/class_sessions" : `/class_sessions/${formData.id}`;
            list = buoiHocs; setList = setBuoiHocs;
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

    // 🔹 Xử lý xóa
    const handleDelete = async (type, id) => {
        const mapApi = {
            giohoc: "/class_times",
            lichhoc: "/schedules",
            buoihoc: "/class_sessions"
        };

        if (!window.confirm("Bạn có chắc muốn xóa mục này?")) return;

        try {
            await apiClient.delete(`${mapApi[type]}/${id}`);
            if (type === "giohoc") setGioHocs(gioHocs.filter((g) => g.id !== id));
            if (type === "lichhoc") setLichHocs(lichHocs.filter((l) => l.id !== id));
            if (type === "buoihoc") setBuoiHocs(buoihocs.filter((b) => b.id !== id));
        } catch (err) {
            console.error("Lỗi xóa dữ liệu:", err.response?.data || err);
            alert("Xóa thất bại!");
        }
    };

    return (
        <main className="schedule-container">
            <h1 className="title">📚 Quản lý Lịch học – Buổi học – Giờ học</h1>

            {/* === GIỜ HỌC === */}
            <section className="section">
                <h2>🕒 Giờ học</h2>
                <div className="actions">
                    <button className="btn btn-blue" onClick={() => openModal("giohoc", "add")}>Thêm</button>
                </div>
                <table>
                    <thead>
                        <tr><th>Mã</th><th>Tên giờ</th><th>Bắt đầu</th><th>Kết thúc</th><th>Hành động</th></tr>
                    </thead>
                    <tbody>
                        {gioHocs.map((g) => (
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

            {/* === BUỔI HỌC === */}
            <section className="section">
                <h2>📆 Buổi học</h2>
                <div className="actions">
                    <button className="btn btn-blue" onClick={() => openModal("buoihoc", "add")}>Thêm</button>
                </div>
                <table>
                    <thead>
                        <tr><th>Ngày</th><th>Thứ</th><th>Giờ học</th><th>Môn học</th><th>Ghi chú</th><th>Hành động</th></tr>
                    </thead>
                    <tbody>
                        {buoiHocs.map((b) => (
                            <tr key={b.id}>
                                <td>{b.ngayHoc}</td>
                                <td>{b.thuTrongTuan}</td>
                                <td>{b.tenGioHoc}</td>
                                <td>{b.tenMonHoc}</td>
                                <td>{b.ghiChu}</td>
                                <td>
                                    <button className="btn btn-yellow" onClick={() => openModal("buoihoc", "edit", b)}>Sửa</button>
                                    <button className="btn btn-red" onClick={() => handleDelete("buoihoc", b.id)}>Xóa</button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </section>

            {/* === LỊCH HỌC === */}
            <section className="section">
                <h2>📘 Lịch học</h2>
                <div className="actions">
                    <button className="btn btn-blue" onClick={() => openModal("lichhoc", "add")}>Thêm</button>
                </div>
                <table>
                    <thead>
                        <tr><th>Môn học</th><th>Phòng học</th><th>Kỳ học</th><th>Bắt đầu</th><th>Kết thúc</th><th>Hành động</th></tr>
                    </thead>
                    <tbody>
                        {lichHocs.map((l) => (
                            <tr key={l.id}>
                                <td>{l.tenMonHoc}</td>
                                <td>{l.tenPhongHoc}</td>
                                <td>{l.tenKiHoc}</td>
                                <td>{l.ngayBatDau}</td>
                                <td>{l.ngayKetThuc}</td>
                                <td>
                                    <button className="btn btn-yellow" onClick={() => openModal("lichhoc", "edit", l)}>Sửa</button>
                                    <button className="btn btn-red" onClick={() => handleDelete("lichhoc", l.id)}>Xóa</button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </section>

            {/* ======= MODAL ======= */}
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
                                    <select
                                        name="monHocId"
                                        value={formData.monHocId || ""}
                                        onChange={handleChange}
                                        required
                                    >
                                        <option value="">-- Chọn môn học --</option>
                                        {monHocs.map((m) => (
                                            <option key={m.id} value={m.id}>
                                                {m.tenMonHoc}
                                            </option>
                                        ))}
                                    </select>

                                    <select
                                        name="phongId"
                                        value={formData.phongId || ""}
                                        onChange={handleChange}
                                        required
                                    >
                                        <option value="">-- Chọn phòng học --</option>
                                        {phongs.map((p) => (
                                            <option key={p.id} value={p.id}>
                                                {p.tenPhongHoc}
                                            </option>
                                        ))}
                                    </select>

                                    <select
                                        name="kiHocId"
                                        value={formData.kiHocId || ""}
                                        onChange={handleChange}
                                        required
                                    >
                                        <option value="">-- Chọn kỳ học --</option>
                                        {kiHocs.map((k) => (
                                            <option key={k.id} value={k.id}>
                                                {k.tenKiHoc}
                                            </option>
                                        ))}
                                    </select>

                                    <input
                                        type="date"
                                        name="ngayBatDau"
                                        value={formData.ngayBatDau || ""}
                                        onChange={handleChange}
                                        required
                                    />
                                    <input
                                        type="date"
                                        name="ngayKetThuc"
                                        value={formData.ngayKetThuc || ""}
                                        onChange={handleChange}
                                        required
                                    />
                                </>
                            )}


                            {modalType === "buoihoc" && (
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
