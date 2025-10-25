import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import "../../styles/admin/manageStudents.css";

export default function ManageStudents() {
    const navigate = useNavigate();
    const [students, setStudents] = useState([]);
    const [selectedStudent, setSelectedStudent] = useState(null);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [nganhs, setNganhs] = useState([]);
    const [search, setSearch] = useState("");
    const [loading, setLoading] = useState(false);

    // Dữ liệu form gồm 2 phần
    const [svData, setSvData] = useState({
        maSinhVien: "",
        hoTen: "",
        email: "",
        soDienThoai: "",
        ngayNhapHoc: "",
        ngayTotNghiep: "",
        nganhId: "",
        userId: "", // có thể tự động tạo từ backend
    });

    const [ctsvData, setCtsvData] = useState({
        diaChi: "",
        ngaySinh: "",
        gioiTinh: "NAM",
        quocTich: "Việt Nam",
        cccd: "",
        sdtNguoiThan: "",
    });

    // --- FETCH dữ liệu ---
    useEffect(() => {
        fetch("http://localhost:8080/api/sinhviens")
            .then((res) => res.json())
            .then(setStudents)
            .catch((err) => console.error("Lỗi fetch sinh viên:", err));

        fetch("http://localhost:8080/api/nganhs")
            .then((res) => res.json())
            .then(setNganhs)
            .catch((err) => console.error("Lỗi fetch ngành:", err));
    }, []);

    // --- Lọc tìm kiếm ---
    const filteredStudents = students.filter(
        (s) =>
            s.hoTen?.toLowerCase().includes(search.toLowerCase()) ||
            s.maSinhVien?.toLowerCase().includes(search.toLowerCase()) ||
            s.email?.toLowerCase().includes(search.toLowerCase())
    );

    // --- Mở modal ---
    const handleOpenModal = () => {
        setSvData({
            maSinhVien: "SV" + (students.length + 1).toString().padStart(3, "0"),
            hoTen: "",
            email: "",
            soDienThoai: "",
            ngayNhapHoc: "",
            ngayTotNghiep: "",
            nganhId: "",
            userId: "",
        });
        setCtsvData({
            diaChi: "",
            ngaySinh: "",
            gioiTinh: "NAM",
            quocTich: "Việt Nam",
            cccd: "",
            sdtNguoiThan: "",
        });
        setIsModalOpen(true);
    };

    const handleCloseModal = () => setIsModalOpen(false);

    // --- Xử lý thay đổi input ---
    const handleChangeSv = (e) => {
        const { name, value } = e.target;
        console.log("📩 Thay đổi field:", name, "→", value);  // ✅ Log giá trị khi chọn
        setSvData((prev) => ({ ...prev, [name]: value }));
    };

    const handleChangeCtsv = (e) => {
        const { name, value } = e.target;
        console.log("📩 Thay đổi:", name, "=", value);
        setCtsvData((prev) => ({ ...prev, [name]: value }));
    };

    // --- Lưu sinh viên + chi tiết ---
    const handleSave = async (e) => {
        e.preventDefault();
        setLoading(true);
        try {
            console.log("📦 Dữ liệu gửi sinh viên:", svData);

            // 1️⃣ Gửi thông tin sinh viên
            const res1 = await fetch("http://localhost:8080/api/sinhviens", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(svData),
            });
            const svResult = await res1.json();
            if (!svResult.id) throw new Error("Không tạo được sinh viên");

            // 2️⃣ Gửi thông tin chi tiết sinh viên
            const res2 = await fetch("http://localhost:8080/api/chitietsinhviens", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ ...ctsvData, sinhVienId: svResult.id }),
            });
            if (!res2.ok) throw new Error("Không tạo được chi tiết sinh viên");

            // 3️⃣ Cập nhật danh sách
            setStudents([...students, svResult]);
            alert("✅ Thêm sinh viên thành công!");
            setIsModalOpen(false);
        } catch (err) {
            console.error("❌ Lỗi thêm sinh viên:", err);
            alert("❌ Lỗi khi thêm sinh viên hoặc chi tiết sinh viên!");
        } finally {
            setLoading(false);
        }
    };

    // --- Xóa sinh viên ---
    const handleDelete = async () => {
        if (!selectedStudent) return alert("Chọn sinh viên cần xóa!");
        if (!window.confirm("Bạn có chắc muốn xóa sinh viên này?")) return;

        try {
            await fetch(`http://localhost:8080/api/sinhviens/${selectedStudent.id}`, {
                method: "DELETE",
            });
            setStudents(students.filter((s) => s.id !== selectedStudent.id));
            alert("🗑️ Xóa thành công!");
        } catch (err) {
            console.error("Lỗi xóa:", err);
            alert("❌ Xóa thất bại!");
        }
    };

    return (
        <main className="container">
            <section className="banner-section">
                <h1 className="banner-title">🎓 Quản lý Sinh viên</h1>
                <p className="banner-subtitle">Thêm, sửa, xóa hoặc xem chi tiết sinh viên.</p>
            </section>

            <div className="action-bar">
                <input
                    type="text"
                    placeholder="🔍 Tìm kiếm sinh viên..."
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                />
                <div className="actions">
                    <button onClick={handleOpenModal} className="btn btn-blue">
                        ➕ Thêm
                    </button>
                    <button onClick={handleDelete} className="btn btn-red">
                        🗑️ Xóa
                    </button>
                    <button onClick={() => navigate("/admin/dashboard")} className="btn btn-gray">
                        ⬅️ Quay lại
                    </button>
                </div>
            </div>

            <section className="table-section">
                <table className="students-table">
                    <thead>
                        <tr>
                            <th>Mã SV</th>
                            <th>Họ tên</th>
                            <th>Email</th>
                            <th>Ngành</th>
                        </tr>
                    </thead>
                    <tbody>
                        {filteredStudents.map((sv) => (
                            <tr
                                key={sv.id}
                                onClick={() => setSelectedStudent(sv)}
                                className={selectedStudent?.id === sv.id ? "selected" : ""}
                            >
                                <td>{sv.maSinhVien}</td>
                                <td>{sv.hoTen}</td>
                                <td>{sv.email}</td>
                                <td>{sv.tenNganh}</td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </section>

            {/* ---------- MODAL ---------- */}
            {isModalOpen && (
                <div className="modal-overlay">
                    <div className="modal large">
                        <h2>➕ Thêm sinh viên mới</h2>
                        <form onSubmit={handleSave}>
                            <h3>📘 Thông tin sinh viên</h3>
                            <div className="form-grid">
                                <input
                                    name="maSinhVien"
                                    value={svData.maSinhVien}
                                    onChange={handleChangeSv}
                                    placeholder="Mã sinh viên"
                                    required
                                />
                                <input
                                    name="hoTen"
                                    value={svData.hoTen}
                                    onChange={handleChangeSv}
                                    placeholder="Họ tên"
                                    required
                                />
                                <input
                                    type="email"
                                    name="email"
                                    value={svData.email}
                                    onChange={handleChangeSv}
                                    placeholder="Email"
                                />
                                <input
                                    name="soDienThoai"
                                    value={svData.soDienThoai}
                                    onChange={handleChangeSv}
                                    placeholder="Số điện thoại"
                                />
                                <span>Ngày nhập học</span>
                                <input
                                    type="date"
                                    name="ngayNhapHoc"
                                    value={svData.ngayNhapHoc}
                                    onChange={handleChangeSv}
                                />
                                <span>Ngày tốt nghiệp</span>
                                <input
                                    type="date"
                                    name="ngayTotNghiep"
                                    value={svData.ngayTotNghiep}
                                    onChange={handleChangeSv}
                                />
                                {/* {console.log("📚 Danh sách ngành:", nganhs)} */}
                                <select
                                    name="nganhId"   // ✅ phải trùng với key trong state svData
                                    value={svData.nganhId}
                                    onChange={handleChangeSv}
                                    required
                                >
                                    <option value="">-- Chọn ngành --</option>
                                    {nganhs.map((nganh) => (
                                        <option key={nganh.id} value={nganh.id}>
                                            {nganh.tenNganh}
                                        </option>
                                    ))}
                                </select>

                            </div>

                            <h3>🏠 Thông tin chi tiết</h3>
                            <div className="form-grid">
                                <input
                                    name="diaChi"
                                    value={ctsvData.diaChi}
                                    onChange={handleChangeCtsv}
                                    placeholder="Địa chỉ"
                                />
                                <span>Ngày sinh</span>
                                <input
                                    type="date"
                                    name="ngaySinh"
                                    value={ctsvData.ngaySinh}
                                    onChange={handleChangeCtsv}
                                />
                                <select
                                    name="gioiTinh"
                                    value={ctsvData.gioiTinh}
                                    onChange={handleChangeCtsv}
                                >
                                    <option value="NAM">Nam</option>
                                    <option value="NU">Nữ</option>
                                </select>
                                <input
                                    name="quocTich"
                                    value={ctsvData.quocTich}
                                    onChange={handleChangeCtsv}
                                    placeholder="Quốc tịch"
                                />
                                <input
                                    name="cccd"
                                    value={ctsvData.cccd}
                                    onChange={handleChangeCtsv}
                                    placeholder="CCCD"
                                />
                                <input
                                    name="sdtNguoiThan"
                                    value={ctsvData.sdtNguoiThan}
                                    onChange={handleChangeCtsv}
                                    placeholder="SĐT người thân"
                                />
                            </div>

                            <div className="modal-actions">
                                <button type="submit" className="btn btn-green" disabled={loading}>
                                    {loading ? "Đang lưu..." : "💾 Lưu"}
                                </button>
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
