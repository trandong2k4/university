import React, { useEffect, useState } from "react";
import { useAuth } from "../../context/AuthContext";
import apiClient from "/src/api/apiClient";
import "../../styles/student/register-credit.css";

export default function RegisterCredit() {
    const { user } = useAuth();
    const userId = user?.id;

    const [studentId, setStudentId] = useState(null);
    const [lopHocPhans, setLopHocPhans] = useState([]);
    const [dangKyList, setDangKyList] = useState([]);
    const [semesters, setSemesters] = useState([]);
    const [currentSemester, setCurrentSemester] = useState(null);

    const [loading, setLoading] = useState(true);
    const [actionLoading, setActionLoading] = useState(false);
    const [message, setMessage] = useState({ text: "", type: "" });

    const fetchData = async () => {
        if (!userId) return;
        try {
            setLoading(true);
            // 1. Lấy thông tin sinh viên
            const studentRes = await apiClient.get(`/students/by-user/${userId}`);
            const studentData = studentRes.data;
            setStudentId(studentData.id);

            // 2. Lấy dữ liệu hệ thống (Lớp, Kì học, Đã đăng ký)
            const [lhpRes, semRes, dkRes] = await Promise.all([
                apiClient.get("/class"),
                apiClient.get("/semesters"),
                apiClient.get(`/schedule_registrations/by-sinhvien/${studentData.id}`)
            ]);

            // Xác định kì học mới nhất (dựa trên ngày bắt đầu hoặc phần tử cuối cùng)
            const sortedSemesters = semRes.data.sort((a, b) => new Date(b.ngayBatDau) - new Date(a.ngayBatDau));
            const latestSem = sortedSemesters[0];

            setCurrentSemester(latestSem);
            setSemesters(semRes.data);
            setLopHocPhans(lhpRes.data || []);
            setDangKyList(dkRes.data.map(item => item.lopHocPhan.id));
        } catch (err) {
            console.error("Lỗi tải dữ liệu:", err);
            setMessage({ text: "Lỗi kết nối hệ thống!", type: "error" });
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => { fetchData(); }, [userId]);

    const handleToggle = async (lopId, isRegistered) => {
        if (actionLoading || !studentId) return;
        setActionLoading(true);
        try {
            const url = `/schedule_registrations/${studentId}/${lopId}`;
            if (isRegistered) {
                await apiClient.delete(url);
                setMessage({ text: "Hủy đăng ký thành công!", type: "success" });
            } else {
                await apiClient.post(url);
                setMessage({ text: "Đăng ký môn học thành công!", type: "success" });
            }
            fetchData(); // Reload để cập nhật sĩ số thời gian thực
        } catch (err) {
            setMessage({ text: err.response?.data?.message || "Thao tác thất bại!", type: "error" });
        } finally {
            setActionLoading(false);
            setTimeout(() => setMessage({ text: "", type: "" }), 3000);
        }
    };

    if (loading) return <div className="loading-screen"><div className="spinner"></div></div>;

    return (
        <main className="register-credit-container">
            {/* Banner Section - Giống ManageClass */}
            <section className="banner-section">
                <h1 className="banner-title">📝 Đăng ký tín chỉ trực tuyến</h1>
                <p className="banner-subtitle">
                    Kì học hiện tại: <strong>{currentSemester?.tenKiHoc || "Đang cập nhật"}</strong>
                    ({currentSemester?.maKiHoc})
                </p>
            </section>

            {/* Thông báo Toast */}
            {message.text && (
                <div className={`toast-msg ${message.type}`}>
                    {message.type === "success" ? "✅" : "⚠️"} {message.text}
                </div>
            )}

            {/* Stats Overview - Giống ManageClass Dashboard */}
            <div className="stats-row">
                <div className="stat-box blue">
                    <h3>Môn đã chọn</h3>
                    <p>{dangKyList.length} <span>Lớp</span></p>
                </div>
                <div className="stat-box green">
                    <h3>Trạng thái hệ thống</h3>
                    <p>Đang mở</p>
                </div>
                <div className="stat-box purple">
                    <h3>Hạn đăng ký</h3>
                    <p>{currentSemester ? new Date(currentSemester.ngayKetThuc).toLocaleDateString("vi-VN") : "--"}</p>
                </div>
            </div>

            {/* Table Section */}
            <section className="data-table-card">
                <div className="table-header">
                    <h3>Danh sách lớp học phần khả dụng</h3>
                </div>
                <div className="table-wrapper">
                    <table className="register-table">
                        <thead>
                            <tr>
                                <th>Mã LHP</th>
                                <th>Môn học & Tín chỉ</th>
                                <th>Giảng viên</th>
                                <th>Sĩ số</th>
                                <th>Kỳ học</th>
                                <th style={{ textAlign: "center" }}>Hành động</th>
                            </tr>
                        </thead>
                        <tbody>
                            {lopHocPhans.filter(l => l.kiHocId === currentSemester?.id).map((lhp) => {
                                const isRegistered = dangKyList.includes(lhp.id);
                                const isFull = lhp.soLuongHienTai >= lhp.soLuongToiDa;
                                const isOpen = lhp.trangThai === "MO_DANG_KY";

                                return (
                                    <tr key={lhp.id} className={isRegistered ? "selected-row" : ""}>
                                        <td><strong>{lhp.maLopHocPhan}</strong></td>
                                        <td>
                                            <div className="subject-main">{lhp.tenMonHoc}</div>
                                            <div className="subject-sub">{lhp.tongSoTinChi} Tín chỉ</div>
                                        </td>
                                        <td>{lhp.hoTen}</td>
                                        <td>
                                            <div className="capacity-info">
                                                <span className={isFull ? "text-red" : "text-green"}>
                                                    {lhp.soLuongHienTai}/{lhp.soLuongToiDa}
                                                </span>
                                                <div className="progress-bar">
                                                    <div className="progress-fill" style={{ width: `${(lhp.soLuongHienTai / lhp.soLuongToiDa) * 100}%` }}></div>
                                                </div>
                                            </div>
                                        </td>
                                        <td><span className="badge-sem">{lhp.tenKiHoc}</span></td>
                                        <td style={{ textAlign: "center" }}>
                                            <button
                                                className={`btn-reg ${isRegistered ? "btn-del" : "btn-add"}`}
                                                disabled={actionLoading || (!isRegistered && (isFull || !isOpen))}
                                                onClick={() => handleToggle(lhp.id, isRegistered)}
                                            >
                                                {actionLoading ? "..." : isRegistered ? "Hủy đăng ký" : isFull ? "Hết chỗ" : "Đăng ký"}
                                            </button>
                                        </td>
                                    </tr>
                                );
                            })}
                        </tbody>
                    </table>
                </div>
            </section>
        </main>
    );
}