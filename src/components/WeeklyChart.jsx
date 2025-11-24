import React, { useEffect, useState } from "react";
import { Bar } from "react-chartjs-2";
import { Chart, BarElement, CategoryScale, LinearScale } from "chart.js";
Chart.register(BarElement, CategoryScale, LinearScale);
import apiClient from "src/api/apiClient";

export default function WeeklyChart() {
    const [data, setData] = useState({ labels: [], values: [] });

    useEffect(() => {
        const fetchData = async () => {
            try {
                const res = await apiClient.get("/admin/stat/weekly");
                setData(res.data);
            } catch (err) {
                console.error("Lỗi biểu đồ:", err);
            }
        };
        fetchData();
    }, []);

    const chartData = {
        labels: data.labels,
        datasets: [
            {
                label: "Số sinh viên đăng ký",
                data: data.values,
                backgroundColor: "#007bff",
            },
        ],
    };

    const options = {
        responsive: true,
        plugins: {
            legend: { display: false },
        },
        scales: {
            y: { beginAtZero: true },
        },
    };

    return (
        <div style={{ marginTop: "2rem", background: "#fff", padding: "1rem", borderRadius: "8px" }}>
            <h3 style={{ marginBottom: "1rem" }}>📊 Thống kê sinh viên theo tuần</h3>
            <Bar data={chartData} options={options} />
        </div>
    );
}