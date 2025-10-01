// ManageStudents.jsx
import React, { useMemo, useState } from "react";
import mockData from "../../mockData";
import "../../styles/admin/manageStudents.css";
import { useNavigate } from "react-router-dom";

export default function ManageStudents() {
    const navigate = useNavigate();

    // State quản lý danh sách sinh viên
    const [students, setStudents] = useState([
        { maSinhVien: "SV001", tenSinhVien: "Nguyễn Văn A", ngaySinh: "2003-05-15", lop: "CNTT K22", email: "nv.a@example.com", diemTB: 8.5 },
        { maSinhVien: "SV002", tenSinhVien: "Lê Thị B", ngaySinh: "2002-09-20", lop: "KT K21", email: "lt.b@example.com", diemTB: 7.8 },
        { maSinhVien: "SV003", tenSinhVien: "Trần Văn C", ngaySinh: "2003-12-10", lop: "CNTT K22", email: "tv.c@example.com", diemTB: 9.1 }
    ]);

    // State quản lý modal
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [newStudent, setNewStudent] = useState({
        maSinhVien: "",
        tenSinhVien: "",
        ngaySinh: "",
        lop: "",
        email: "",
        diemTB: ""
    });

    // Handlers
    const handleAddStudent = () => {
        setIsModalOpen(true);
    };

    const handleModalChange = (e) => {
        const { name, value } = e.target;
        setNewStudent((prev) => ({ ...prev, [name]: value }));
    };

    const handleSaveStudent = () => {
        if (!newStudent.maSinhVien || !newStudent.tenSinhVien) {
            alert("Vui lòng nhập đầy đủ thông tin!");
            return;
        }
        setStudents([...students, newStudent]);
        setIsModalOpen(false);
        setNewStudent({ maSinhVien: "", tenSinhVien: "", ngaySinh: "", lop: "", email: "", diemTB: "" });
    };

    const handleEditStudent = () => {
        alert("Chỉnh sửa sinh viên!");
        console.log("Mock chỉnh sửa:", students[0]);
    };

    const handleDeleteStudent = () => {
        if (students.length > 0) {
            const updated = [...students];
            updated.pop(); // xoá sinh viên cuối cùng demo
            setStudents(updated);
            alert("Xoá sinh viên cuối cùng thành công!");
        }
    };

    const handleViewResults = () => {
        alert("Xem kết quả học tập!");
        console.log("Mock KQ:", mockData.entities.ketQuaHocTap);
    };

    const handleBack = () => {
        navigate("/admin/dashboard");
    };

    return (
        <main className="container mx-auto px-4 py-8">
            {/* Banner */}
            <section id="banner" className="banner-section animate-fade-in text-center">
                <h1 className="banner-title">Quản lý Sinh viên</h1>
                <p className="banner-subtitle">Quản lý thông tin chi tiết của các sinh viên trong hệ thống.</p>
            </section>

            {/* Main Content Section */}
            <section className="mt-8">
                <div className="content-box">
                    {/* Action Buttons */}
                    <div className="action-buttons">
                        <button onClick={handleAddStudent} className="btn btn-blue">
                            <i className="fas fa-user-plus mr-2"></i> Thêm sinh viên
                        </button>
                        <button onClick={handleEditStudent} className="btn btn-yellow">
                            <i className="fas fa-edit mr-2"></i> Sửa
                        </button>
                        <button onClick={handleDeleteStudent} className="btn btn-red">
                            <i className="fas fa-trash-alt mr-2"></i> Xóa
                        </button>
                        <button onClick={handleViewResults} className="btn btn-green">
                            <i className="fas fa-chart-line mr-2"></i> Xem kết quả học tập
                        </button>
                        <div className="flex-grow"></div>
                        <button onClick={handleBack} className="btn btn-gray">
                            <i className="fas fa-arrow-left mr-2"></i> Quay lại
                        </button>
                    </div>

                    {/* Students Table */}
                    <div id="students-table-container" className="overflow-x-auto">
                        <table className="students-table">
                            <thead>
                                <tr>
                                    <th>Mã sinh viên</th>
                                    <th>Họ tên</th>
                                    <th>Ngày sinh</th>
                                    <th>Lớp</th>
                                    <th>Email</th>
                                    <th>Điểm TB</th>
                                </tr>
                            </thead>
                            <tbody>
                                {students.map((sv, idx) => (
                                    <tr key={idx}>
                                        <td>{sv.maSinhVien}</td>
                                        <td>{sv.tenSinhVien}</td>
                                        <td>{sv.ngaySinh}</td>
                                        <td>{sv.lop}</td>
                                        <td>{sv.email}</td>
                                        <td>{sv.diemTB}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            </section>

            {/* Modal thêm sinh viên */}
            {isModalOpen && (
                <div className="modal-overlay">
                    <div className="modal-box">
                        <h2>Thêm sinh viên mới</h2>
                        <input type="text" name="maSinhVien" placeholder="Mã sinh viên" value={newStudent.maSinhVien} onChange={handleModalChange} />
                        <input type="text" name="tenSinhVien" placeholder="Họ tên" value={newStudent.tenSinhVien} onChange={handleModalChange} />
                        <input type="date" name="ngaySinh" value={newStudent.ngaySinh} onChange={handleModalChange} />
                        <input type="text" name="lop" placeholder="Lớp" value={newStudent.lop} onChange={handleModalChange} />
                        <input type="email" name="email" placeholder="Email" value={newStudent.email} onChange={handleModalChange} />
                        <input type="number" step="0.1" name="diemTB" placeholder="Điểm TB" value={newStudent.diemTB} onChange={handleModalChange} />

                        <div className="modal-actions">
                            <button className="btn btn-green" onClick={handleSaveStudent}>Lưu</button>
                            <button className="btn btn-gray" onClick={() => setIsModalOpen(false)}>Hủy</button>
                        </div>
                    </div>
                </div>
            )}
        </main>
    );
}
