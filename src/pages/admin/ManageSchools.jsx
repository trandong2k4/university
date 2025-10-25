import React, { useState, useEffect } from "react";
import "../../styles/admin/manageSchools.css";

export default function ManageSchools() {
    const [schools, setSchools] = useState([]);
    const [selectedSchool, setSelectedSchool] = useState(null);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [modalMode, setModalMode] = useState("add");

    const [formData, setFormData] = useState({
        maTruong: "",
        tenTruong: "",
        diaChi: "",
        soDienThoai: "",
        email: "",
        website: "",
        moTa: "",
        logoUrl: "",
        ngayThanhLap: "",
        nguoiDaiDien: "",
    });
    useEffect(() => {
        fetch("http://localhost:8080/api/truongs")
            .then((res) => res.json())
            .then(setSchools)
            .catch((err) => console.error("Lỗi fetch danh sách trường:", err));
    }, []);

    const openModal = (mode, school = null) => {
        setModalMode(mode);
        if (school) {
            setFormData({
                ...school,
                ngayThanhLap: school.ngayThanhLap?.slice(0, 10) || "", // format yyyy-MM-dd
            });
        } else {
            setFormData({
                maTruong: "TR" + (schools.length + 1) * 100,
                tenTruong: "",
                diaChi: "",
                soDienThoai: "",
                email: "",
                website: "",
                moTa: "",
                logoUrl: "",
                ngayThanhLap: "",
                nguoiDaiDien: "",
            });
        }
        setIsModalOpen(true);
    };

    const closeModal = () => {
        setIsModalOpen(false);
        setSelectedSchool(null);
    };

    const handleChange = (e) => {
        if (modalMode === "view") return;
        const { name, value } = e.target;
        setFormData((prev) => ({ ...prev, [name]: value }));
    };

    const handleSave = async (e) => {
        e.preventDefault();
        const method = modalMode === "add" ? "POST" : "PUT";
        const url =
            modalMode === "add"
                ? "http://localhost:8080/api/truongs"
                : `http://localhost:8080/api/truongs/${formData.id}`;

        const res = await fetch(url, {
            method,
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(formData),
        });

        const data = await res.json();
        if (modalMode === "add") {
            setSchools([...schools, data]);
        } else {
            setSchools(schools.map((s) => (s.id === data.id ? data : s)));
        }
        closeModal();
    };

    const handleDelete = async () => {
        if (!selectedSchool) return alert("Chọn trường để xóa!");
        if (!window.confirm("Bạn có chắc muốn xóa trường này?")) return;

        await fetch(`http://localhost:8080/api/truongs/${selectedSchool.id}`, {
            method: "DELETE",
        });

        setSchools(schools.filter((s) => s.id !== selectedSchool.id));
        setSelectedSchool(null);
    };

    return (
        <main className="container">
            <section className="banner-section">
                <h1 className="banner-title">Quản lý Trường</h1>
                <p className="banner-subtitle">Quản lý thông tin các trường trong hệ thống.</p>
            </section>

            <section className="mt-8">
                <div className="content-box">
                    <div className="action-buttons">
                        <button onClick={() => openModal("add")} className="btn btn-blue">Thêm</button>
                        <button onClick={() => selectedSchool ? openModal("edit", selectedSchool) : alert("Chọn trường để sửa")} className="btn btn-yellow">Sửa</button>
                        <button onClick={handleDelete} className="btn btn-red">Xóa</button>
                    </div>

                    <table className="schools-table">
                        <thead>
                            <tr>
                                <th>Mã trường</th>
                                <th>Tên trường</th>
                                <th>Địa chỉ</th>
                                <th>Chi tiết</th>
                            </tr>
                        </thead>
                        <tbody>
                            {schools.map((s) => (
                                <tr key={s.id} onClick={() => setSelectedSchool(s)} className={selectedSchool?.id === s.id ? "selected-row" : ""}>
                                    <td>{s.maTruong}</td>
                                    <td>{s.tenTruong}</td>
                                    <td>{s.diaChi}</td>
                                    <td>
                                        <button onClick={(ev) => { ev.stopPropagation(); openModal("view", s); }} className="btn btn-gray">Xem</button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </section>

            {isModalOpen && (
                <div className="modal-overlay">
                    <div className="modal-box">
                        <h2>{modalMode === "add" ? "Thêm trường" : modalMode === "edit" ? "Sửa trường" : "Chi tiết trường"}</h2>
                        <form onSubmit={handleSave}>
                            <input name="maTruong" value={formData.maTruong} onChange={handleChange} placeholder="Mã trường" readOnly={modalMode !== "add"} />
                            <input name="tenTruong" value={formData.tenTruong} onChange={handleChange} placeholder="Tên trường" readOnly={modalMode === "view"} />
                            <input name="diaChi" value={formData.diaChi} onChange={handleChange} placeholder="Địa chỉ" readOnly={modalMode === "view"} />
                            <input name="soDienThoai" value={formData.soDienThoai} onChange={handleChange} placeholder="Số điện thoại" readOnly={modalMode === "view"} />
                            <input name="email" value={formData.email} onChange={handleChange} placeholder="Email" readOnly={modalMode === "view"} />
                            <input name="website" value={formData.website} onChange={handleChange} placeholder="Website" readOnly={modalMode === "view"} />
                            <input name="logoUrl" value={formData.logoUrl} onChange={handleChange} placeholder="Logo URL" readOnly={modalMode === "view"} />
                            <input type="date" name="ngayThanhLap" value={formData.ngayThanhLap} onChange={handleChange} placeholder="Ngày thành lập" readOnly={modalMode === "view"} />
                            <input name="nguoiDaiDien" value={formData.nguoiDaiDien} onChange={handleChange} placeholder="Người đại diện" readOnly={modalMode === "view"} />
                            <textarea name="moTa" value={formData.moTa} onChange={handleChange} placeholder="Mô tả" readOnly={modalMode === "view"} />

                            <div className="modal-actions">
                                {modalMode !== "view" && <button type="submit" className="btn btn-green">Lưu</button>}
                                <button type="button" onClick={closeModal} className="btn btn-gray">Đóng</button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </main>
    );
}