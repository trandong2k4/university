// ManageCourses.jsx
import React, { useState } from "react";
import mockData from "../../mockData";
import "../../styles/admin/manageCourses.css";
import { useNavigate } from "react-router-dom";

export default function ManageCourses() {
    const navigate = useNavigate();

    // dùng mockData.entities.monHoc
    const [courses, setCourses] = useState(mockData.entities.monHoc);
    const [selectedCourse, setSelectedCourse] = useState(null);

    const [isModalOpen, setIsModalOpen] = useState(false);
    const [modalMode, setModalMode] = useState("add"); // add | edit | view

    const [formData, setFormData] = useState({
        maMonHoc: "",
        tenMonHoc: "",
        moTa: "",
        monHocTienQuyetId: "",
        nganhHocIds: []
    });

    // mở modal
    const handleOpenModal = (mode, course = null) => {
        setModalMode(mode);
        if ((mode === "edit" || mode === "view") && course) {
            setFormData(course);
        } else {
            setFormData({
                maMonHoc: "CS" + (courses.length + 1) * 100,
                tenMonHoc: "",
                moTa: "",
                monHocTienQuyetId: "",
                nganhHocIds: []
            });
        }
        setIsModalOpen(true);
    };

    const handleCloseModal = () => {
        setIsModalOpen(false);
        setSelectedCourse(null);
    };

    const handleChange = (e) => {
        if (modalMode === "view") return; // không cho sửa khi xem chi tiết
        const { name, value } = e.target;
        setFormData((prev) => ({ ...prev, [name]: value }));
    };

    const handleSave = (e) => {
        e.preventDefault();
        if (modalMode === "edit") {
            setCourses(courses.map((c) => (c.maMonHoc === formData.maMonHoc ? formData : c)));
            alert("Cập nhật môn học thành công!");
        } else if (modalMode === "add") {
            setCourses([...courses, formData]);
            alert("Thêm môn học thành công!");
        }
        handleCloseModal();
    };

    const handleDelete = () => {
        if (!selectedCourse) {
            alert("Vui lòng chọn môn học để xóa!");
            return;
        }
        if (window.confirm("Bạn có chắc muốn xóa môn học này?")) {
            setCourses(courses.filter((c) => c.maMonHoc !== selectedCourse.maMonHoc));
            setSelectedCourse(null);
        }
    };

    const handleBack = () => {
        navigate("/admin/dashboard");
    };

    return (
        <main className="container">
            {/* Banner */}
            <section className="banner-section">
                <h1 className="banner-title">Quản lý Môn học</h1>
                <p className="banner-subtitle">Quản lý thông tin chi tiết các môn học trong hệ thống.</p>
            </section>

            {/* Content */}
            <section className="mt-8">
                <div className="content-box">
                    {/* Buttons */}
                    <div className="action-buttons">
                        <button onClick={() => handleOpenModal("add")} className="btn btn-blue">
                            <i className="fas fa-plus-circle mr-2"></i> Thêm môn học
                        </button>
                        <button
                            onClick={() =>
                                selectedCourse
                                    ? handleOpenModal("edit", selectedCourse)
                                    : alert("Chọn môn học để sửa!")
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

                    {/* Table */}
                    <div className="overflow-x-auto">
                        <table className="courses-table">
                            <thead>
                                <tr>
                                    <th>Mã môn</th>
                                    <th>Tên môn</th>
                                    <th>Mô tả</th>
                                    <th>Môn học tiên quyết</th>
                                    <th>Ngành học</th>
                                    <th>Hành động</th>
                                </tr>
                            </thead>
                            <tbody>
                                {courses.map((course) => (
                                    <tr
                                        key={course.maMonHoc}
                                        onClick={() => setSelectedCourse(course)}
                                        className={`cursor-pointer ${selectedCourse?.maMonHoc === course.maMonHoc ? "selected-row" : ""
                                            }`}
                                    >
                                        <td>{course.maMonHoc}</td>
                                        <td>{course.tenMonHoc}</td>
                                        <td>{course.moTa}</td>
                                        <td>{course.monHocTienQuyetId || "Không"}</td>
                                        <td>{course.nganhHocIds.join(", ")}</td>
                                        <td>
                                            <button
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    handleOpenModal("view", course);
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

            {/* Modal */}
            {isModalOpen && (
                <div className="modal-overlay">
                    <div className="modal-box">
                        <h2>
                            {modalMode === "edit"
                                ? "Sửa môn học"
                                : modalMode === "view"
                                    ? "Chi tiết môn học"
                                    : "Thêm môn học"}
                        </h2>
                        <form onSubmit={handleSave}>
                            <input
                                type="text"
                                name="maMonHoc"
                                value={formData.maMonHoc}
                                onChange={handleChange}
                                readOnly={modalMode !== "add"}
                            />
                            <input
                                type="text"
                                name="tenMonHoc"
                                placeholder="Tên môn"
                                value={formData.tenMonHoc}
                                onChange={handleChange}
                                readOnly={modalMode === "view"}
                            />
                            <textarea
                                name="moTa"
                                placeholder="Mô tả"
                                value={formData.moTa}
                                onChange={handleChange}
                                readOnly={modalMode === "view"}
                            />
                            <input
                                type="text"
                                name="monHocTienQuyetId"
                                placeholder="Môn học tiên quyết"
                                value={formData.monHocTienQuyetId || ""}
                                onChange={handleChange}
                                readOnly={modalMode === "view"}
                            />
                            <input
                                type="text"
                                name="nganhHocIds"
                                placeholder="Ngành học (vd: 1,2)"
                                value={formData.nganhHocIds}
                                onChange={(e) =>
                                    setFormData({
                                        ...formData,
                                        nganhHocIds: e.target.value.split(",").map((x) => x.trim())
                                    })
                                }
                                readOnly={modalMode === "view"}
                            />

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
