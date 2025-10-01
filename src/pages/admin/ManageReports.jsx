
import React, { useState } from "react";
import mockData from "../../mockData";
import "../../styles/admin/manageReports.css";
import {
    PieChart, Pie, Cell, Tooltip,
    BarChart, Bar, XAxis, YAxis, CartesianGrid, Legend
} from "recharts";

export default function ManageReports() {
    const ketQua = mockData.entities.ketQuaHocTap;
    const hocPhi = mockData.entities.hocPhi;
    const monHoc = mockData.entities.monHoc;
    const sinhVien = mockData.entities.sinhVien;

    // Tính toán thống kê
    const hocPhiStats = [
        { name: "Đã đóng", value: hocPhi.filter(h => h.trangThai === "Đã đóng").length },
        { name: "Chưa đóng", value: hocPhi.filter(h => h.trangThai === "Chưa đóng").length },
    ];

    const diemStats = [
        { xepLoai: "A", count: ketQua.filter(k => k.xepLoai === "A").length },
        { xepLoai: "B", count: ketQua.filter(k => k.xepLoai === "B").length },
        { xepLoai: "C", count: ketQua.filter(k => k.xepLoai === "C").length },
        { xepLoai: "D", count: ketQua.filter(k => k.xepLoai === "D").length },
    ];

    const COLORS = ["#22c55e", "#ef4444", "#3b82f6", "#f59e0b"];

    return (
        <main className="p-6">
            <h1 className="text-3xl font-bold mb-6">Báo cáo & Thống kê</h1>

            {/* KPI Cards */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
                <div className="bg-white shadow rounded-lg p-4 text-center">
                    <h2 className="text-xl font-bold">{sinhVien.length}</h2>
                    <p>Sinh viên</p>
                </div>
                <div className="bg-white shadow rounded-lg p-4 text-center">
                    <h2 className="text-xl font-bold">{monHoc.length}</h2>
                    <p>Môn học</p>
                </div>
                <div className="bg-white shadow rounded-lg p-4 text-center">
                    <h2 className="text-xl font-bold">
                        {hocPhi.filter(h => h.trangThai === "Đã đóng").length}
                    </h2>
                    <p>Đã đóng học phí</p>
                </div>
                <div className="bg-white shadow rounded-lg p-4 text-center">
                    <h2 className="text-xl font-bold">
                        {hocPhi.filter(h => h.trangThai === "Chưa đóng").length}
                    </h2>
                    <p>Chưa đóng học phí</p>
                </div>
            </div>

            {/* Charts */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                {/* Học phí PieChart */}
                <div className="bg-white shadow rounded-lg p-4">
                    <h2 className="text-lg font-semibold mb-3">Tình trạng học phí</h2>
                    <PieChart width={400} height={300}>
                        <Pie
                            data={hocPhiStats}
                            dataKey="value"
                            cx="50%"
                            cy="50%"
                            outerRadius={100}
                            label
                        >
                            {hocPhiStats.map((entry, index) => (
                                <Cell key={`cell-${index}`} fill={COLORS[index]} />
                            ))}
                        </Pie>
                        <Tooltip />
                        <Legend />
                    </PieChart>
                </div>

                {/* Điểm số BarChart */}
                <div className="bg-white shadow rounded-lg p-4">
                    <h2 className="text-lg font-semibold mb-3">Kết quả học tập</h2>
                    <BarChart width={400} height={300} data={diemStats}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="xepLoai" />
                        <YAxis />
                        <Tooltip />
                        <Legend />
                        <Bar dataKey="count" fill="#3b82f6" />
                    </BarChart>
                </div>
            </div>
        </main>
    );
}
