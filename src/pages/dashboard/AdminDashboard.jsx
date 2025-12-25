import React, { useEffect, useState } from "react";
import { Bar } from "react-chartjs-2";
import {
    Chart,
    BarElement,
    CategoryScale,
    LinearScale,
    Tooltip,
    Legend,
} from "chart.js";
import "../../styles/dashboard/adminDashboard.css";
import apiClient from "/src/api/apiClient";

Chart.register(BarElement, CategoryScale, LinearScale, Tooltip, Legend);

// Helper chuẩn hóa response từ API
const getResponseData = (res) => {
    if (!res || !res.data) return {};
    if (res.data.data) return res.data.data;
    if (res.data.content) return res.data.content;
    return res.data;
};

const AdminDashboard = () => {
    const [stats, setStats] = useState({});
    const [weekly, setWeekly] = useState({ labels: [], values: [] });
    const [students, setStudents] = useState([]);
    const [search, setSearch] = useState("");

    const [loadingStats, setLoadingStats] = useState(true);
    const [loadingChart, setLoadingChart] = useState(true);
    const [loadingStudents, setLoadingStudents] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        // Thống kê tổng quan
        const fetchSummary = async () => {
            try {
                const res = await apiClient.get("/admin/stats");
                setStats(getResponseData(res) || {});
            } catch (err) {
                setError("Lỗi tải thống kê tổng quan");
                console.error(err);
            } finally {
                setLoadingStats(false);
            }
        };

        // Thống kê theo tuần
        const fetchWeeklyStats = async () => {
            try {
                const res = await apiClient.get("/admin/stats/weekly");
                const data = getResponseData(res) || { labels: [], values: [] };
                setWeekly({
                    labels: data.labels || [],
                    values: data.values || [],
                });
            } catch (err) {
                setError("Lỗi tải dữ liệu biểu đồ");
                console.error(err);
            } finally {
                setLoadingChart(false);
            }
        };

        // Danh sách sinh viên
        const fetchStudents = async () => {
            try {
                const res = await apiClient.get("/students");
                const data = Array.isArray(getResponseData(res)) ? getResponseData(res) : [];
                setStudents(data);
            } catch (err) {
                setError("Lỗi tải danh sách sinh viên");
                console.error(err);
            } finally {
                setLoadingStudents(false);
            }
        };

        fetchSummary();
        fetchWeeklyStats();
        fetchStudents();
    }, []);

    // Tìm kiếm mở rộng
    const filteredStudents = students.filter((sv) => {
        const term = search.toLowerCase();
        return (
            (sv.hoTen?.toLowerCase() || "").includes(term) ||
            (sv.maSinhVien?.toLowerCase() || "").includes(term) ||
            (sv.email?.toLowerCase() || "").includes(term) ||
            (sv.tenNganh?.toLowerCase() || "").includes(term)
        );
    });

    // Thay đổi phần chartData bên trong AdminDashboard component
    const chartData = (canvas) => {
        const ctx = canvas.getContext("2d");
        const gradient = ctx.createLinearGradient(0, 0, 0, 400);
        gradient.addColorStop(0, "rgba(67, 97, 238, 0.8)");
        gradient.addColorStop(1, "rgba(67, 97, 238, 0.1)");

        return {
            labels: weekly.labels,
            datasets: [
                {
                    label: "Số Sinh viên",
                    data: weekly.values,
                    backgroundColor: gradient,
                    borderColor: "#4361ee",
                    borderWidth: 2,
                    borderRadius: 5, // Bo góc cột biểu đồ
                    fill: true,
                },
            ],
        };
    };

    const chartOptions = {
        responsive: true,
        plugins: {
            legend: { display: false },
            tooltip: { enabled: true },
        },
        scales: {
            y: {
                beginAtZero: true,
                ticks: { stepSize: 1 },
            },
        },
    };

    // Skeleton cho stat card
    const StatSkeleton = () => (
        <div className="stat-card skeleton">
            <h3>&nbsp;</h3>
            <p>&nbsp;</p>
        </div>
    );

    return (
        <div className="admin-dashboard">
            <main className="main-content">
                {/* Thông báo lỗi chung */}
                {error && <div className="error-banner">⚠️ {error}</div>}

                {/* Thống kê tổng quan */}
                <section className="stats-grid">
                    {loadingStats
                        ? Array(8).fill().map((_, i) => <StatSkeleton key={i} />)
                        : (
                            <>
                                <div className="stat-card">
                                    <h3>Sinh viên</h3>
                                    <p>{stats.sinhVienCount ?? "0"}</p>
                                </div>
                                <div className="stat-card">
                                    <h3>Đang học</h3>
                                    <p>{stats.sinhVienDangHoc ?? "0"}</p>
                                </div>
                                <div className="stat-card">
                                    <h3>Đã tốt nghiệp</h3>
                                    <p>{stats.sinhVienTotNghiep ?? "0"}</p>
                                </div>
                                <div className="stat-card">
                                    <h3>Ngành học</h3>
                                    <p>{stats.nganhCount ?? "0"}</p>
                                </div>
                                <div className="stat-card">
                                    <h3>Khoa đào tạo</h3>
                                    <p>{stats.khoaCount ?? "0"}</p>
                                </div>
                                <div className="stat-card">
                                    <h3>Trường đào tạo</h3>
                                    <p>{stats.truongCount ?? "0"}</p>
                                </div>
                                <div className="stat-card">
                                    <h3>Môn học</h3>
                                    <p>{stats.monHocCount ?? "0"}</p>
                                </div>
                                <div className="stat-card">
                                    <h3>Bài viết</h3>
                                    <p>{stats.baiVietCount ?? "0"}</p>
                                </div>
                                <div className="stat-card">
                                    <h3>Người dùng</h3>
                                    <p>{stats.userCount ?? "0"}</p>
                                </div>
                                <div className="stat-card">
                                    <h3>Giảng viên</h3>
                                    <p>{stats.giangVienCount ?? "0"}</p>
                                </div>
                            </>
                        )}
                </section>

                {/* Biểu đồ thống kê tuần */}
                <section className="chart-section">
                    <h3>📊 Thống kê sinh viên theo tuần</h3>
                    {loadingChart ? (
                        <p>⏳ Đang tải biểu đồ...</p>
                    ) : weekly.labels?.length > 0 ? (
                        // Trong phần render Bar chart, sửa lại thành:
                        <Bar
                            data={chartData(document.createElement('canvas'))}
                            options={chartOptions}
                        />
                    ) : (
                        <p>📉 Chưa có dữ liệu thống kê tuần</p>
                    )}
                </section>

                {/* Tìm kiếm sinh viên */}
                <section className="search-section">
                    <input
                        type="text"
                        placeholder="🔍 Tìm theo tên, mã SV, email hoặc ngành..."
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                    />
                </section>

                {/* Bảng sinh viên */}
                <section className="data-table">
                    {loadingStudents ? (
                        <p>⏳ Đang tải danh sách sinh viên...</p>
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
                                    <tr key={sv.id || sv.maSinhVien}>
                                        <td>{sv.maSinhVien || "-"}</td>
                                        <td>{sv.hoTen || "-"}</td>
                                        <td>{sv.email || "-"}</td>
                                        <td>{sv.tenNganh || "-"}</td>
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