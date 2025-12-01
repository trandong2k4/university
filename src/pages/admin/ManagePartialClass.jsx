import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import apiClient from "/src/api/apiClient";
import "../../styles/admin/manageMajors.css";

export default function ManageMajors() {
    const navigate = useNavigate();
    const [majors, setMajors] = useState([]);
    const [selectedMajor, setSelectedMajor] = useState(null);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [modalMode, setModalMode] = useState("add"); // add | edit | view
    const [khoas, setKhoas] = useState([]);

    const [formData, setFormData] = useState({
        id: "",
        maNganh: "",
        tenNganh: "",
        khoaId: "",
        tenKhoa: "",
    });

    // Fetch danh sách ngành và khoa
    useEffect(() => {
        const fetchData = async () => {
            try {
                const [majorsRes, departmentsRes] = await Promise.all([
                    apiClient.get("/majors"),
                    apiClient.get("/departments"),
                ]);
                setMajors(majorsRes.data);
                setKhoas(departmentsRes.data);
            } catch (err) {
                console.error("Lỗi fetch dữ liệu:", err.response?.data || err);
            }
        };
        fetchData();
    }, []);

    const handleOpenModal = (mode, major = null) => {
        setModalMode(mode);
        if ((mode === "edit" || mode === "view") && major) {
            setFormData({
                id: major.id,
                maNganh: major.maNganh,
                tenNganh: major.tenNganh,
                khoaId: major.khoaId || "",
                tenKhoa: major.tenKhoa || "",
            });
        } else {
            setFormData({
                id: "",
                maNganh: "NG" + (majors.length + 1) * 100,
                tenNganh: "",
                khoaId: "",
                tenKhoa: "",
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
            let res;
            if (modalMode === "add") {
                res = await apiClient.post("/majors", formData);
                setMajors([...majors, res.data]);
                alert("Thêm ngành thành công!");
            } else if (modalMode === "edit") {
                res = await apiClient.put(`/majors/${formData.id}`, formData);
                setMajors(majors.map((m) => (m.id === res.data.id ? res.data : m)));
                alert("Cập nhật ngành thành công!");
            }
            handleCloseModal();
        } catch (err) {
            console.error("Lỗi lưu ngành:", err.response?.data || err);
            alert("Thao tác thất bại!");
        }
    };

    const handleDelete = async () => {
        if (!selectedMajor) return alert("Vui lòng chọn ngành để xóa!");
        if (!window.confirm("Bạn có chắc muốn xóa ngành này?")) return;

        try {
            await apiClient.delete(`/majors/${selectedMajor.id}`);
            setMajors(majors.filter((m) => m.id !== selectedMajor.id));
            setSelectedMajor(null);
            alert("Xóa thành công!");
        } catch (err) {
            console.error("Lỗi xóa ngành:", err.response?.data || err);
            alert("Xóa thất bại!");
        }
    };

    const handleBack = () => navigate("/admin/dashboard");

    return (
        <main className="container">
            <section className="banner-section">
                <h1 className="banner-title">Quản lý Lớp học phần</h1>
                <p className="banner-subtitle">
                    Quản lý lớp đào tạo trong hệ thống.
                </p>
            </section>

            <section className="mt-8">
                <div className="content-box">
                    <div className="action-buttons">
                        <button onClick={() => handleOpenModal("add")} className="btn btn-blue">
                            Thêm ngành
                        </button>
                        <button
                            onClick={() =>
                                selectedMajor ? handleOpenModal("edit", selectedMajor) : alert("Chọn ngành để sửa!")
                            }
                            className="btn btn-yellow"
                        >
                            Sửa
                        </button>
                        <button onClick={handleDelete} className="btn btn-red">
                            Xóa
                        </button>
                        <div className="flex-grow"></div>
                        <button onClick={handleBack} className="btn btn-gray">
                            Quay lại
                        </button>
                    </div>

                    <div className="overflow-x-auto">
                        <table className="majors-table">
                            <thead>
                                <tr>
                                    <th>Mã ngành</th>
                                    <th>Tên ngành</th>
                                    {/* <th>Khoa</th> */}
                                    <th>Hành động</th>
                                </tr>
                            </thead>
                            <tbody>
                                {majors.map((major) => (
                                    <tr
                                        key={major.id}
                                        onClick={() => setSelectedMajor(major)}
                                        className={selectedMajor?.id === major.id ? "selected-row" : ""}
                                    >
                                        <td>{major.maNganh}</td>
                                        <td>{major.tenNganh}</td>
                                        {/* <td>{major.tenKhoa}</td> */}
                                        <td>
                                            <button
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    handleOpenModal("view", major);
                                                }}
                                                className="btn btn-gray"
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
                                value={formData.tenNganh}
                                onChange={handleChange}
                                readOnly={modalMode === "view"}
                                placeholder="Tên ngành"
                            />
                            {modalMode === "view" ? (
                                <input
                                    type="text"
                                    value={formData.tenKhoa || ""}
                                    readOnly
                                    placeholder="Tên khoa"
                                />
                            ) : (
                                <select
                                    name="khoaId"
                                    value={formData.khoaId}
                                    onChange={handleChange}
                                    required
                                >
                                    <option value="">-- Chọn khoa --</option>
                                    {khoas.map((khoa) => (
                                        <option key={khoa.id} value={khoa.id}>
                                            {khoa.tenKhoa}
                                        </option>
                                    ))}
                                </select>
                            )}

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
