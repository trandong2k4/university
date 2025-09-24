// AdminDashboard.jsx - placeholder
import React, { useMemo } from "react";
import { Link } from "react-router-dom";
import mockData from "../../mockData";

const formatVND = (n) =>
    typeof n === "number" ? n.toLocaleString("vi-VN") + " ₫" : "-";

export default function AdminDashboard() {
    const db = mockData.entities || {};
    const students = db.sinhVien || [];
    const courses = db.monHoc || [];
    const credits = db.tinChi || [];
    const schedule = db.lichHoc || [];
    const grades = db.ketQuaHocTap || [];
    const fees = db.hocPhi || [];
    const semesters = db.kiHoc || [];

    const { revenuePaid, revenueOutstanding } = useMemo(() => {
        const paid = fees
            .filter((f) => String(f.trangThai).toLowerCase() === "đã đóng" || String(f.trangThai).toLowerCase() === "da dong")
            .reduce((s, f) => s + (Number(f.soTien) || 0), 0);
        const outstanding = fees
            .filter((f) => String(f.trangThai).toLowerCase() !== "đã đóng" && String(f.trangThai).toLowerCase() !== "da dong")
            .reduce((s, f) => s + (Number(f.soTien) || 0), 0);
        return { revenuePaid: paid, revenueOutstanding: outstanding };
    }, [fees]);

    const kpis = useMemo(() => {
        return [
            { label: "Sinh viên", value: students.length, href: "/admin/students" },
            { label: "Môn học", value: courses.length, href: "/admin/courses" },
            { label: "Tín chỉ", value: credits.length, href: "/admin/credits" },
            { label: "Lịch học", value: schedule.length, href: "/admin/schedule" },
            { label: "Bảng điểm", value: grades.length, href: "/admin/grades" },
            { label: "Đã thu", value: formatVND(revenuePaid), href: "/admin/tuition" },
            { label: "Còn phải thu", value: formatVND(revenueOutstanding), href: "/admin/tuition" },
        ];
    }, [students.length, courses.length, credits.length, schedule.length, grades.length, revenuePaid, revenueOutstanding]);

    const studentsById = useMemo(() => {
        const map = {};
        students.forEach((s) => (map[s.id] = s));
        return map;
    }, [students]);

    const kiById = useMemo(() => {
        const map = {};
        semesters.forEach((k) => (map[k.id] = k));
        return map;
    }, [semesters]);

    // Top 5 khoản học phí đã đóng gần nhất (dựa trên ngayDong; nếu thiếu dùng id)
    const latestPaid = useMemo(() => {
        const paid = fees.filter((f) => String(f.trangThai).toLowerCase().includes("đã"));
        return [...paid].sort((a, b) => {
            const na = a.ngayDong || "";
            const nb = b.ngayDong || "";
            if (na && nb) return nb.localeCompare(na);
            // fallback theo id
            return (Number(b.id) || 0) - (Number(a.id) || 0);
        }).slice(0, 5);
    }, [fees]);

    return (
        <div className="container mx-auto px-4 py-8 space-y-8">
            <header>
                <h1 className="text-3xl font-bold">Admin Dashboard</h1>
                <p className="text-sm text-gray-600 mt-1">Tổng quan hệ thống & học phí (mock)</p>
            </header>

            {/* KPI cards */}
            <section>
                <div className="grid sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-4">
                    {kpis.map((k) => (
                        <Link
                            key={k.label}
                            to={k.href}
                            className="p-4 bg-white rounded-xl border hover:shadow transition"
                        >
                            <div className="text-sm text-gray-500">{k.label}</div>
                            <div className="text-2xl font-semibold mt-1">{k.value}</div>
                            <div className="text-xs text-blue-600 mt-2">Quản lý →</div>
                        </Link>
                    ))}
                </div>
            </section>

            {/* Tuition snapshot */}
            <section className="grid lg:grid-cols-2 gap-6">
                <div className="p-4 bg-white rounded-xl border">
                    <div className="font-semibold">Tổng quan học phí</div>
                    <div className="mt-4 grid grid-cols-2 gap-4">
                        <div className="p-3 rounded-lg bg-emerald-50 border">
                            <div className="text-sm text-gray-600">Đã thu</div>
                            <div className="text-xl font-semibold">{formatVND(revenuePaid)}</div>
                        </div>
                        <div className="p-3 rounded-lg bg-amber-50 border">
                            <div className="text-sm text-gray-600">Còn phải thu</div>
                            <div className="text-xl font-semibold">{formatVND(revenueOutstanding)}</div>
                        </div>
                    </div>
                    {/* Progress đơn giản */}
                    <div className="mt-4">
                        <div className="text-xs text-gray-500 mb-1">Tỷ lệ thu</div>
                        {(() => {
                            const total = revenuePaid + revenueOutstanding;
                            const pct = total ? Math.round((revenuePaid / total) * 100) : 0;
                            return (
                                <div className="w-full h-3 bg-gray-100 rounded">
                                    <div
                                        className="h-3 bg-emerald-500 rounded"
                                        style={{ width: `${pct}%` }}
                                        title={`${pct}%`}
                                    />
                                </div>
                            );
                        })()}
                    </div>
                </div>

                <div className="p-4 bg-white rounded-xl border">
                    <div className="font-semibold">Các khoản đã đóng gần đây</div>
                    <div className="mt-3 overflow-x-auto">
                        <table className="min-w-[640px] w-full text-sm">
                            <thead className="bg-gray-50 text-gray-600">
                                <tr>
                                    <th className="p-3 text-left">Sinh viên</th>
                                    <th className="p-3 text-left">Kỳ</th>
                                    <th className="p-3 text-right">Số tiền</th>
                                    <th className="p-3 text-left">Ngày đóng</th>
                                    <th className="p-3 text-left">Trạng thái</th>
                                </tr>
                            </thead>
                            <tbody>
                                {latestPaid.map((f) => {
                                    const sv = studentsById[f.sinhVienId];
                                    const k = kiById[f.kiHocId];
                                    return (
                                        <tr key={f.id} className="border-t">
                                            <td className="p-3">
                                                {sv?.tenSinhVien}{" "}
                                                <span className="text-xs text-gray-500">({sv?.maSinhVien})</span>
                                            </td>
                                            <td className="p-3">{k?.tenKiHoc || "-"}</td>
                                            <td className="p-3 text-right font-medium">{formatVND(f.soTien)}</td>
                                            <td className="p-3">{f.ngayDong || "-"}</td>
                                            <td className="p-3">{f.trangThai}</td>
                                        </tr>
                                    );
                                })}
                                {!latestPaid.length && (
                                    <tr>
                                        <td className="p-3 text-gray-500" colSpan={5}>
                                            Chưa có khoản đóng gần đây.
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                    <div className="mt-3 text-right">
                        <Link to="/admin/tuition" className="text-blue-600 text-sm">Xem tất cả →</Link>
                    </div>
                </div>
            </section>

            {/* Quick links */}
            <section className="p-4 bg-white rounded-xl border">
                <div className="font-semibold mb-2">Liên kết nhanh</div>
                <div className="flex flex-wrap gap-2 text-sm">
                    <Link className="px-3 py-2 rounded bg-gray-100 hover:bg-gray-200" to="/admin/students">Sinh viên</Link>
                    <Link className="px-3 py-2 rounded bg-gray-100 hover:bg-gray-200" to="/admin/courses">Môn học</Link>
                    <Link className="px-3 py-2 rounded bg-gray-100 hover:bg-gray-200" to="/admin/schedule">Lịch học</Link>
                    <Link className="px-3 py-2 rounded bg-gray-100 hover:bg-gray-200" to="/admin/grades">Điểm</Link>
                    <Link className="px-3 py-2 rounded bg-gray-100 hover:bg-gray-200" to="/admin/credits">Tín chỉ</Link>
                    <Link className="px-3 py-2 rounded bg-gray-100 hover:bg-gray-200" to="/admin/tuition">Học phí</Link>
                </div>
            </section>
        </div>
    );
}
