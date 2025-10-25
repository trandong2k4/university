import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import "../../styles/admin/manageMajors.css";

export default function ManageMajors() {
    const navigate = useNavigate();
    const [majors, setMajors] = useState([]);
    const [selectedMajor, setSelectedMajor] = useState(null);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [modalMode, setModalMode] = useState("add"); // add | edit | view

    const [formData, setFormData] = useState({
        maNganh: "",
        tenNganh: "",
        khoaId: "",
    });

    const [khoas, setKhoas] = useState([]);

    // Lấy danh sách ngành và khoa
    useEffect(() => {
        fetch("http://localhost:8080/api/nganhs")
            .then((res) => res.json())
            .then((data) => setMajors(data))
            .catch((err) => console.error("Lỗi fetch ngành:", err));

        fetch("http://localhost:8080/api/khoas")
            .then((res) => res.json())
            .then((data) => setKhoas(data))
            .catch((err) => console.error("Lỗi fetch khoa:", err));
    }, []);

    const handleOpenModal = (mode, major = null) => {
        setModalMode(mode);
        if ((mode === "edit" || mode === "view") && major) {
            setFormData(major);
        } else {
            setFormData({
                maNganh: "NG" + (majors.length + 1) * 100,
                tenNganh: "",
                khoaId: "",
            });
        }
        setIsModalOpen(true);
    };

    const handleCloseModal = () => {
        setIsModalOpen(false);
        setSelectedMajor(null);
    };

    const handleChange = (e) => {
        if (modalMode === "view") return;
        const { name, value } = e.target;
        setFormData((prev) => ({ ...prev, [name]: value }));
    };

    const handleSave = async (e) => {
        e.preventDefault();
        try {
            if (modalMode === "add") {
                const res = await fetch("http://localhost:8080/api/nganhs", {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify(formData),
                });
                const newMajor = await res.json();
                setMajors([...majors, newMajor]);
                alert("Thêm ngành thành công!");
            } else if (modalMode === "edit") {
                const res = await fetch(`http://localhost:8080/api/nganhs/${formData.id}`, {
                    method: "PUT",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify(formData),
                });
                const updated = await res.json();
                setMajors(majors.map((m) => (m.id === updated.id ? updated : m)));
                alert("Cập nhật ngành thành công!");
            }
            handleCloseModal();
        } catch (err) {
            console.error("Lỗi lưu ngành:", err);
            alert("Thao tác thất bại!");
        }
    };

    const handleDelete = async () => {
        if (!selectedMajor) return alert("Vui lòng chọn ngành để xóa!");
        if (!window.confirm("Bạn có chắc muốn xóa ngành này?")) return;

        try {
            await fetch(`http://localhost:8080/api/nganhs/${selectedMajor.id}`, {
                method: "DELETE",
            });
            setMajors(majors.filter((m) => m.id !== selectedMajor.id));
            setSelectedMajor(null);
            alert("Xóa thành công!");
        } catch (err) {
            console.error("Lỗi xóa ngành:", err);
            alert("Xóa thất bại!");
        }
    };

    const handleBack = () => navigate("/admin/dashboard");

    return (
        <main className="container">
            <section className="banner-section">
                <h1 className="banner-title">Quản lý Ngành</h1>
                <p className="banner-subtitle">Quản lý thông tin các ngành đào tạo trong hệ thống.</p>
            </section>

            <section className="mt-8">
                <div className="content-box">
                    <div className="action-buttons">
                        <button onClick={() => handleOpenModal("add")} className="btn btn-blue">
                            <i className="fas fa-plus-circle mr-2"></i> Thêm ngành
                        </button>
                        <button
                            onClick={() =>
                                selectedMajor
                                    ? handleOpenModal("edit", selectedMajor)
                                    : alert("Chọn ngành để sửa!")
                            }
                            className="btn btn-yellow"
                        >
                            <i className="fas fa-edit mr-2"></i> Sửa
                        </button>
                        <button onClick={handleDelete} className="btn btn-red">
                            <i className="fas fa-trash-alt mr-2"></i> Xóa
                        </button>
                        <div className="flex-grow"></div>
                        <button onClick={handleBack} className="btn btn-gray">
                            <i className="fas fa-arrow-left mr-2"></i> Quay lại
                        </button>
                    </div>

                    <div className="overflow-x-auto">
                        <table className="majors-table">
                            <thead>
                                <tr>
                                    <th>Mã ngành</th>
                                    <th>Tên ngành</th>
                                    <th>Khoa</th>
                                    <th>Hành động</th>
                                </tr>
                            </thead>
                            <tbody>
                                {majors.map((major) => (
                                    <tr
                                        key={major.id}
                                        onClick={() => setSelectedMajor(major)}
                                        className={`cursor-pointer ${selectedMajor?.id === major.id ? "selected-row" : ""
                                            }`}
                                    >
                                        <td>{major.maNganh}</td>
                                        <td>{major.tenNganh}</td>
                                        <td>{major.tenKhoa}</td>
                                        <td>
                                            <button
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    handleOpenModal("view", major);
                                                }}
                                                className="bg-blue-500 text-white px-3 py-1 rounded-full text-xs hover:bg-blue-600"
                                            >
                                                Xem chi tiết
                                            </button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            </section>

            {isModalOpen && (
                <div className="modal-overlay">
                    <div className="modal-box">
                        <h2>
                            {modalMode === "edit"
                                ? "Sửa ngành"
                                : modalMode === "view"
                                    ? "Chi tiết ngành"
                                    : "Thêm ngành"}
                        </h2>
                        <form onSubmit={handleSave}>
                            <input
                                type="text"
                                name="maNganh"
                                value={formData.maNganh}
                                onChange={handleChange}
                                readOnly={modalMode !== "add"}
                            />
                            <input
                                type="text"
                                name="tenNganh"
                                placeholder="Tên ngành"
                                value={formData.tenNganh}
                                onChange={handleChange}
                                readOnly={modalMode === "view"}
                            />
                            <select
                                name="khoaId"
                                value={formData.khoaId}
                                onChange={handleChange}
                                disabled={modalMode === "view"}
                            >
                                <option value="">-- Chọn khoa --</option>
                                {khoas.map((khoa) => (
                                    <option key={khoa.id} value={khoa.id}>
                                        {khoa.tenKhoa}
                                    </option>
                                ))}
                            </select>

                            <div className="modal-actions">
                                {modalMode !== "view" && (
                                    <button type="submit" className="btn btn-green">
                                        Lưu
                                    </button>
                                )}
                                <button type="button" onClick={handleCloseModal} className="btn btn-gray">
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