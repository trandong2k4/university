import React, { useState } from "react";
import "../../styles/admin/manageSchedule.css";

export default function ManageSchedules() {
    const [schedules, setSchedules] = useState([
        {
            id: "1",
            day: "Thứ Hai",
            session: "Ca 1 (7:00 - 9:00)",
            subject: "Cấu trúc dữ liệu và giải thuật",
            teacher: "Thầy Nam",
            class: "K20-CNTT",
            room: "P201",
        },
        {
            id: "2",
            day: "Thứ Ba",
            session: "Ca 2 (9:15 - 11:15)",
            subject: "Lập trình Web",
            teacher: "Cô Hoa",
            class: "K20-CNTT",
            room: "P302",
        },
    ]);

    const [selected, setSelected] = useState(null);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [isEditMode, setIsEditMode] = useState(false);
    const [formData, setFormData] = useState({
        day: "",
        session: "",
        subject: "",
        teacher: "",
        class: "",
        room: "",
    });

    const openModal = (mode, schedule = null) => {
        setIsEditMode(mode === "edit");
        if (mode === "edit" && schedule) {
            setFormData(schedule);
            setSelected(schedule);
        } else {
            setFormData({
                day: "",
                session: "",
                subject: "",
                teacher: "",
                class: "",
                room: "",
            });
        }
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

    const handleSave = (e) => {
        e.preventDefault();
        if (isEditMode && selected) {
            setSchedules(
                schedules.map((s) => (s.id === selected.id ? { ...formData, id: s.id } : s))
            );
            alert("Cập nhật lịch học thành công!");
        } else {
            const newId = (schedules.length + 1).toString();
            setSchedules([...schedules, { ...formData, id: newId }]);
            alert("Thêm lịch học thành công!");
        }
        closeModal();
    };

    const handleDelete = () => {
        if (!selected) {
            alert("Vui lòng chọn một lịch học để xóa!");
            return;
        }
        if (window.confirm("Bạn có chắc muốn xóa lịch học này?")) {
            setSchedules(schedules.filter((s) => s.id !== selected.id));
            setSelected(null);
            alert("Xóa lịch học thành công!");
        }
    };

    return (
        <div className="page-container">
            {/* Banner */}
            <section className="banner">
                <h1>Quản lý Lịch học</h1>
                <p>Quản lý và tra cứu lịch học của sinh viên và giảng viên.</p>
            </section>

            {/* Main */}
            <main className="content">
                {/* Action Buttons */}
                <div className="actions">
                    <button onClick={() => openModal("add")} className="btn btn-blue">
                        ➕ Thêm lịch học
                    </button>
                    <button
                        onClick={() =>
                            selected ? openModal("edit", selected) : alert("Chọn lịch học để sửa!")
                        }
                        className="btn btn-yellow"
                    >
                        ✏️ Sửa
                    </button>
                    <button onClick={handleDelete} className="btn btn-red">
                        🗑️ Xóa
                    </button>
                    <div className="flex-grow"></div>
                    <button className="btn btn-gray">⬅️ Quay lại</button>
                </div>

                {/* Table */}
                <div className="table-container">
                    <table>
                        <thead>
                            <tr>
                                <th>Thứ</th>
                                <th>Ca</th>
                                <th>Môn học</th>
                                <th>Giảng viên</th>
                                <th>Lớp</th>
                                <th>Phòng học</th>
                                <th>Hành động</th>
                            </tr>
                        </thead>
                        <tbody>
                            {schedules.map((s) => (
                                <tr
                                    key={s.id}
                                    onClick={() => setSelected(s)}
                                    className={selected?.id === s.id ? "selected" : ""}
                                >
                                    <td>{s.day}</td>
                                    <td>{s.session}</td>
                                    <td>{s.subject}</td>
                                    <td>{s.teacher}</td>
                                    <td>{s.class}</td>
                                    <td>{s.room}</td>
                                    <td>
                                        <button
                                            className="btn-mini"
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                alert(`Chi tiết lớp: ${s.class} - ${s.subject}`);
                                            }}
                                        >
                                            Xem chi tiết lớp
                                        </button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </main>

            {/* Modal */}
            {isModalOpen && (
                <div className="modal-overlay">
                    <div className="modal-box">
                        <h2>{isEditMode ? "Sửa lịch học" : "Thêm lịch học"}</h2>
                        <form onSubmit={handleSave}>
                            <input
                                type="text"
                                name="day"
                                placeholder="Thứ"
                                value={formData.day}
                                onChange={handleChange}
                                required
                            />
                            <input
                                type="text"
                                name="session"
                                placeholder="Ca"
                                value={formData.session}
                                onChange={handleChange}
                                required
                            />
                            <input
                                type="text"
                                name="subject"
                                placeholder="Môn học"
                                value={formData.subject}
                                onChange={handleChange}
                                required
                            />
                            <input
                                type="text"
                                name="teacher"
                                placeholder="Giảng viên"
                                value={formData.teacher}
                                onChange={handleChange}
                                required
                            />
                            <input
                                type="text"
                                name="class"
                                placeholder="Lớp"
                                value={formData.class}
                                onChange={handleChange}
                                required
                            />
                            <input
                                type="text"
                                name="room"
                                placeholder="Phòng học"
                                value={formData.room}
                                onChange={handleChange}
                                required
                            />

                            <div className="modal-actions">
                                <button type="submit" className="btn btn-green">
                                    Lưu
                                </button>
                                <button
                                    type="button"
                                    onClick={closeModal}
                                    className="btn btn-gray"
                                >
                                    Hủy
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}
