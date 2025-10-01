import React from "react";
import mockData from "../../mockData";
import "../../styles/dashboard/manageDashboard.css";

export default function ManageDashboard() {
    // Lấy số liệu thống kê từ mockData
    const totalStudents = mockData.entities.sinhVien.length;
    const totalStaff = mockData.entities.nhanVien.length;
    const totalMajors = mockData.entities.nganhHoc.length;
    const totalCourses = mockData.entities.monHoc.length;
    const totalRooms = mockData.entities.phongHoc.length;
    const paidFees = mockData.entities.hocPhi.filter(hp => hp.trangThai === "Đã đóng").length;
    const unpaidFees = mockData.entities.hocPhi.filter(hp => hp.trangThai === "Chưa đóng").length;

    return (
        <div className="manage-dashboard-container">
            <h1 className="dashboard-title">Admin Dashboard</h1>

            {/* KPI Cards */}
            <div className="kpi-cards">
                <div className="kpi-card">👨‍🎓 Sinh viên: {totalStudents}</div>
                <div className="kpi-card">👨‍🏫 Nhân sự: {totalStaff}</div>
                <div className="kpi-card">📚 Ngành học: {totalMajors}</div>
                <div className="kpi-card">📖 Môn học: {totalCourses}</div>
                <div className="kpi-card">🏫 Phòng học: {totalRooms}</div>
                <div className="kpi-card">💰 Học phí đã thu: {paidFees}/{paidFees + unpaidFees}</div>
            </div>

            {/* Thống kê chi tiết */}
            <div className="charts-section">
                <div className="chart-box">
                    <h3>📊 Sinh viên theo ngành</h3>
                    <ul>
                        {mockData.entities.nganhHoc.map(nganh => {
                            const count = mockData.entities.sinhVien.filter(sv =>
                                nganh.id === 1 ? sv.maSinhVien.includes("SV") : false
                            ).length;
                            return (
                                <li key={nganh.id}>
                                    {nganh.tenNganh}: {count} SV
                                </li>
                            );
                        })}
                    </ul>
                </div>

                <div className="chart-box">
                    <h3>💵 Trạng thái học phí</h3>
                    <p>Đã đóng: {paidFees}</p>
                    <p>Chưa đóng: {unpaidFees}</p>
                </div>
            </div>
        </div>
    );
}
