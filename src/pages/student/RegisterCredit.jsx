import React, { useEffect, useState } from "react";
import { useAuth } from "../../context/AuthContext";
import "../../styles/student/register-credit.css";
import apiClient from "/src/api/apiClient";

export default function RegisterCredit() {
    const { id: sinhVienId } = useAuth();
    const [lopHocPhans, setLopHocPhans] = useState([]); // Tất cả lớp học phần mở đăng ký
    const [dangKyList, setDangKyList] = useState([]); // Danh sách lớp đã đăng ký (lưu ID)
    const [loading, setLoading] = useState(true);
    const [actionLoading, setActionLoading] = useState(false);
    const [message, setMessage] = useState(""); // Thông báo thành công/lỗi

    // Lấy dữ liệu khi component mount
    useEffect(() => {
        if (!sinhVienId) return;
        console.log(sinhVienId);
        const fetchData = async () => {
            try {
                setLoading(true);
                // 🚀 Sử dụng apiClient.get (axios.get) cho cả hai request
                const [lhpRes, dkRes] = await Promise.all([
                    apiClient.get("/lop-hoc-phans/dang-ky-mo"),
                    apiClient.get(`/schedule_registrations/by-sinhvien/${sinhVienId}`)
                ]);

                // 💡 Axios trả về dữ liệu trong thuộc tính 'data'
                setLopHocPhans(lhpRes.data);
                // Đảm bảo dữ liệu trả về từ API phù hợp với cấu trúc
                setDangKyList(dkRes.data.map(d => d.lopHocPhan.id)); // Lưu ID lớp học phần đã đăng ký
            } catch (err) {
                // Xử lý lỗi từ Axios
                setMessage("Lỗi tải dữ liệu. Vui lòng thử lại!");
                console.error("Lỗi tải dữ liệu:", err.response?.data || err.message || err);
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, [sinhVienId]);

    // Xử lý đăng ký / hủy
    const handleToggle = async (lopHocPhanId, isDangKy) => {
        if (actionLoading) return;

        setActionLoading(true);
        setMessage("");

        try {
            const url = `/schedule_registrations/${sinhVienId}/${lopHocPhanId}`;

            if (isDangKy) {
                // 🚀 HỦY ĐĂNG KÝ: Sử dụng apiClient.delete (HTTP DELETE)
                await apiClient.delete(url);
            } else {
                // 🚀 ĐĂNG KÝ: Sử dụng apiClient.post (HTTP POST)
                // Giả sử API POST không cần body, hoặc body được truyền ngầm/không cần thiết
                await apiClient.post(url);
            }

            // Cập nhật danh sách đăng ký
            setDangKyList(prev =>
                isDangKy
                    ? prev.filter(id => id !== lopHocPhanId)
                    : [...prev, lopHocPhanId]
            );

            setMessage(isDangKy ? "Hủy đăng ký thành công!" : "Đăng ký thành công!");
            setTimeout(() => setMessage(""), 3000);
        } catch (err) {
            // Xử lý lỗi từ Axios
            const errorMessage = err.response?.data || err.message || "Không thể thực hiện thao tác!";
            setMessage("Lỗi: " + errorMessage);
            setTimeout(() => setMessage(""), 5000);
            console.error("Lỗi thao tác:", err);
        } finally {
            setActionLoading(false);
        }
    };

    if (loading) return <div className="loading">Đang tải danh sách lớp học phần...</div>;

    return (
        <div className="register-schedule-container">
            <h2>Đăng ký tín chỉ học kỳ</h2>

            {message && (
                <div className={`alert ${message.includes("thành công") ? "success" : "error"}`}>
                    {message}
                </div>
            )}

            <div className="summary">
                <p>
                    Đã đăng ký: <strong>{dangKyList.length}</strong> lớp |
                    Còn lại: <strong>{lopHocPhans.length - dangKyList.length}</strong> lớp mở
                </p>
            </div>

            <table className="schedule-table">
                <thead>
                    <tr>
                        <th>Mã lớp</th>
                        <th>Môn học</th>
                        <th>Giảng viên</th>
                        <th>Sĩ số</th>
                        <th>Lịch học</th>
                        <th>Phòng</th>
                        <th>Trạng thái</th>
                        <th>Hành động</th>
                    </tr>
                </thead>
                <tbody>
                    {lopHocPhans.length === 0 ? (
                        <tr>
                            <td colSpan="8" style={{ textAlign: "center", padding: "2rem" }}>
                                Hiện chưa có lớp học phần nào mở đăng ký.
                            </td>
                        </tr>
                    ) : (
                        lopHocPhans.map(lhp => {
                            const isDangKy = dangKyList.includes(lhp.id);
                            const conCho = lhp.soLuongToiDa - lhp.soLuongHienTai;

                            return (
                                <tr key={lhp.id} className={isDangKy ? "registered" : ""}>
                                    <td><strong>{lhp.maLopHocPhan}</strong></td>
                                    <td>{lhp.monHoc.tenMonHoc} ({lhp.monHoc.soTinChi} tín chỉ)</td>
                                    <td>{lhp.giangVien?.hoTen || "Chưa xếp"}</td>
                                    <td>{lhp.soLuongHienTai}/{lhp.soLuongToiDa}</td>
                                    <td>
                                        {lhp.lichHocs?.map(lh => (
                                            <div key={lh.id} style={{ fontSize: "0.9em" }}>
                                                {lh.ngayHoc} - {lh.gioHoc.tenGioHoc}
                                            </div>
                                        ))}
                                    </td>
                                    <td>
                                        {lhp.lichHocs?.map(lh => (
                                            <div key={lh.id} style={{ fontSize: "0.9em" }}>
                                                {lh.phongHoc?.tenPhong || "-"}
                                            </div>
                                        ))}
                                    </td>
                                    <td>
                                        <span className={`status ${isDangKy ? "yes" : conCho > 0 ? "open" : "full"}`}>
                                            {isDangKy ? "Đã đăng ký" : conCho > 0 ? "Còn chỗ" : "Hết chỗ"}
                                        </span>
                                    </td>
                                    <td>
                                        <button
                                            className={isDangKy ? "btn-cancel" : "btn-register"}
                                            onClick={() => handleToggle(lhp.id, isDangKy)}
                                            disabled={actionLoading || (!isDangKy && conCho <= 0)}
                                        >
                                            {actionLoading ? "..." : isDangKy ? "Hủy" : "Đăng ký"}
                                        </button>
                                    </td>
                                </tr>
                            );
                        })
                    )}
                </tbody>
            </table>
        </div>
    );
}