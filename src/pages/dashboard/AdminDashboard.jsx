import React, { useEffect, useState } from "react";
import { Bar } from "react-chartjs-2";
import { Chart, BarElement, CategoryScale, LinearScale } from "chart.js";
import "../../styles/dashboard/adminDashboard.css";
import apiClient from "/src/api/apiClient";

Chart.register(BarElement, CategoryScale, LinearScale);

const AdminDashboard = () => {
    const [stats, setStats] = useState({});
    const [weekly, setWeekly] = useState({ labels: [], values: [] });
    const [students, setStudents] = useState([]);
    const [search, setSearch] = useState("");
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        // Thống kê tổng quan
        const fetchSummary = async () => {
            try {
                const res = await apiClient.get("/admin/stats");
                const data = Array.isArray(res.data)
                    ? res.data
                    : res.data.data || res.data.content || [];

                setStats(data);
            } catch (err) {
                console.error("Lỗi khi lấy dữ liệu thống kê:", err.response?.data || err);
            }
        };

        // Thống kê theo tuần
        const fetchWeeklyStats = async () => {
            try {
                const res = await apiClient.get("/admin/stats/weekly");
                const data = Array.isArray(res.data)
                    ? res.data
                    : res.data.data || res.data.content || [];

                setWeekly(data);
            } catch (err) {
                console.error("Lỗi khi lấy dữ liệu biểu đồ:", err.response?.data || err);
            }
        };

        // Danh sách sinh viên
        const fetchStudents = async () => {
            try {
                const res = await apiClient.get("/students");
                const data = Array.isArray(res.data)
                    ? res.data
                    : res.data.data || res.data.content || [];

                setStudents(data);
            } catch (err) {
                console.error("Lỗi khi lấy danh sách sinh viên:", err.response?.data || err);
            } finally {
                setLoading(false);
            }
        };
        fetchSummary();
        fetchWeeklyStats();
        fetchStudents();
    }, []);

    const filteredStudents = students.filter((sv) =>
        sv.hoTen?.toLowerCase().includes(search.toLowerCase()) ||
        sv.maSinhVien?.toLowerCase().includes(search.toLowerCase())
    );

    const chartData = {
        labels: weekly.labels,
        datasets: [
            {
                label: "Số sinh viên đăng ký",
                data: weekly.values,
                backgroundColor: "#007bff",
            },
        ],
    };

    const chartOptions = {
        responsive: true,
        plugins: {
            legend: { display: false },
        },
        scales: {
            y: { beginAtZero: true },
        },
    };

    return (
        <div className="admin-dashboard">
            <main className="main-content">
                {/* Thống kê tổng quan */}
                <section className="stats-grid">
                    <div className="stat-card">
                        <h3>Sinh viên</h3>
                        <p>{stats.sinhVienCount ?? "..."}</p>
                    </div>
                    <div className="stat-card">
                        <h3>Đang học</h3>
                        <p>{stats.sinhVienDangHoc ?? "..."}</p>
                    </div>
                    <div className="stat-card">
                        <h3>Đã tốt nghiệp</h3>
                        <p>{stats.sinhVienTotNghiep ?? "..."}</p>
                    </div>
                    <div className="stat-card">
                        <h3>Ngành học</h3>
                        <p>{stats.nganhCount ?? "..."}</p>
                    </div>
                    <div className="stat-card">
                        <h3>Môn học</h3>
                        <p>{stats.monHocCount ?? "..."}</p>
                    </div>
                    <div className="stat-card">
                        <h3>Bài viết</h3>
                        <p>{stats.baiVietCount ?? "..."}</p>
                    </div>
                    <div className="stat-card">
                        <h3>Người dùng</h3>
                        <p>{stats.userCount ?? "..."}</p>
                    </div>
                    <div className="stat-card">
                        <h3>Giảng viên</h3>
                        <p>{stats.giangVienCount ?? "..."}</p>
                    </div>
                </section>

                {/* Biểu đồ thống kê tuần */}
                <section className="chart-section">
                    <h3>📊 Thống kê sinh viên đang học theo tuần</h3>
                    <Bar data={chartData} options={chartOptions} />
                </section>

                {/* Tìm kiếm sinh viên */}
                <section className="search-section">
                    <input
                        type="text"
                        placeholder="🔍 Tìm sinh viên theo tên hoặc mã..."
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                    />
                </section>

                {/* Bảng sinh viên */}
                <section className="data-table">
                    {loading ? (
                        <p>⏳ Đang tải dữ liệu...</p>
                    ) : filteredStudents.length > 0 ? (
                        <table>
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
                                    <tr key={sv.id}>
                                        <td>{sv.maSinhVien}</td>
                                        <td>{sv.hoTen}</td>
                                        <td>{sv.email}</td>
                                        <td>{sv.tenNganh}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    ) : (
                        <p>⚠️ Không tìm thấy sinh viên phù hợp.</p>
                    )}
                </section>
            </main>
        </div>
    );
};

export default AdminDashboard;