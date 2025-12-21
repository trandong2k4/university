// src/pages/student/RegisterCredit.jsx
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
    const [loading, setLoading] = useState(true);
    const [actionLoading, setActionLoading] = useState(false);
    const [message, setMessage] = useState({ text: "", type: "" });

    useEffect(() => {
        if (!userId) return;

        const fetchData = async () => {
            try {
                setLoading(true);

                // 1. Lấy thông tin sinh viên từ userId
                const studentRes = await apiClient.get(`/students/by-user/${userId}`);
                const studentData = studentRes.data;
                setStudentId(studentData.id);

                // 2. Lấy danh sách lớp học phần đang mở đăng ký
                const lhpRes = await apiClient.get("/class");
                const classes = lhpRes.data || [];

                // 3. Lấy danh sách lớp đã đăng ký
                const dkRes = await apiClient.get(`/schedule_registrations/by-sinhvien/${studentData.id}`);
                const registeredIds = dkRes.data.map(item => item.lopHocPhan.id);

                setLopHocPhans(classes);
                setDangKyList(registeredIds);
            } catch (err) {
                console.error("Lỗi tải dữ liệu:", err);
                setMessage({ text: "Không thể tải dữ liệu. Vui lòng thử lại!", type: "error" });
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, [userId]);

    const handleToggle = async (lopId, isRegistered) => {
        if (actionLoading || !studentId) return;

        setActionLoading(true);
        setMessage({ text: "", type: "" });

        try {
            const url = `/schedule_registrations/${studentId}/${lopId}`;

            if (isRegistered) {
                await apiClient.delete(url);
                setMessage({ text: "Hủy đăng ký thành công!", type: "success" });
            } else {
                await apiClient.post(url);
                setMessage({ text: "Đăng ký thành công!", type: "success" });
            }

            setDangKyList(prev =>
                isRegistered ? prev.filter(id => id !== lopId) : [...prev, lopId]
            );

            setTimeout(() => setMessage({ text: "", type: "" }), 3000);
        } catch (err) {
            const msg = err.response?.data?.message || "Thao tác thất bại!";
            setMessage({ text: msg, type: "error" });
        } finally {
            setActionLoading(false);
        }
    };

    if (loading) {
        return (
            <div className="container py-12 text-center">
                <div className="spinner"></div>
                <p className="mt-4 text-gray-600">Đang tải danh sách lớp học phần...</p>
            </div>
        );
    }

    return (
        <div className="register-credit-container container mx-auto px-4 py-8 max-w-7xl">
            <div className="mb-8">
                <h1 className="text-3xl font-bold text-gray-800 mb-2">
                    Đăng ký tín chỉ học kỳ
                </h1>
                <p className="text-gray-600">
                    Chọn các lớp học phần phù hợp với lịch học và kế hoạch của bạn
                </p>
            </div>

            {/* Thông báo
      {message.text && (
        <div className={`alert alert-${message.type} mb-6 p-4 rounded-lg`}>
          {message.text}
        </div>
      )}

      {/* Tổng quan */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                <div className="stat-card bg-blue-50 p-6 rounded-xl">
                    <h3 className="text-lg font-semibold text-blue-900">Đã đăng ký</h3>
                    <p className="text-3xl font-bold text-blue-700 mt-2">{dangKyList.length}</p>
                </div>
                <div className="stat-card bg-green-50 p-6 rounded-xl">
                    <h3 className="text-lg font-semibold text-green-900">Lớp đang mở</h3>
                    <p className="text-3xl font-bold text-green-700 mt-2">
                        {lopHocPhans.filter(l => l.trangThai === "MO_DANG_KY").length}
                    </p>
                </div>
                <div className="stat-card bg-purple-50 p-6 rounded-xl">
                    <h3 className="text-lg font-semibold text-purple-900">Tổng lớp</h3>
                    <p className="text-3xl font-bold text-purple-700 mt-2">{lopHocPhans.length}</p>
                </div>
            </div>

            {/* Bảng lớp học phần */}
            <div className="bg-white rounded-xl shadow-lg overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full">
                        <thead>
                            <tr>
                                <th>Mã lớp</th>
                                <th>Môn học</th>
                                <th>Giảng viên</th>
                                <th>Sĩ số</th>
                                <th>Kỳ học</th>
                                <th>Trạng thái</th>
                                <th>Hành động</th>
                            </tr>
                        </thead>
                        <tbody>
                            {lopHocPhans.length === 0 ? (
                                <tr>
                                    <td colSpan="7" className="text-center py-12 text-gray-500">
                                        Hiện chưa có lớp học phần nào được mở đăng ký.
                                    </td>
                                </tr>
                            ) : (
                                lopHocPhans.map((lhp) => {
                                    const isRegistered = dangKyList.includes(lhp.id);
                                    const conCho = lhp.soLuongToiDa - lhp.soLuongHienTai;
                                    const isFull = conCho <= 0;
                                    const isOpen = lhp.trangThai === "MO_DANG_KY";

                                    return (
                                        <tr
                                            key={lhp.id}
                                            className={isRegistered ? "bg-green-50" : ""}
                                        >
                                            <td className="font-medium text-blue-700">
                                                {lhp.maLopHocPhan}
                                            </td>
                                            <td>
                                                <div className="font-semibold">{lhp.tenMonHoc}</div>
                                                <div className="text-sm text-gray-500">
                                                    {lhp.soTinChi} tín chỉ
                                                </div>
                                            </td>
                                            <td>
                                                {lhp.tenGiangVien || (
                                                    <span className="text-gray-400 italic">Chưa xếp GV</span>
                                                )}
                                            </td>
                                            <td className="text-center">
                                                <span className={`font-bold ${isFull ? "text-red-600" : "text-green-600"}`}>
                                                    {lhp.soLuongHienTai}/{lhp.soLuongToiDa}
                                                </span>
                                                {!isFull && (
                                                    <div className="text-xs text-gray-500 mt-1">
                                                        Còn {conCho} chỗ
                                                    </div>
                                                )}
                                            </td>
                                            <td className="text-center">
                                                <span className="bg-purple-100 text-purple-800 px-3 py-1 rounded-full text-sm font-medium">
                                                    {lhp.tenKiHoc}
                                                </span>
                                            </td>
                                            <td className="text-center">
                                                {isRegistered ? (
                                                    <span className="status status-registered">Đã đăng ký</span>
                                                ) : isFull ? (
                                                    <span className="status status-full">Hết chỗ</span>
                                                ) : !isOpen ? (
                                                    <span className="status status-closed">Đã đóng</span>
                                                ) : (
                                                    <span className="status status-open">Còn chỗ</span>
                                                )}
                                            </td>
                                            <td className="text-center">
                                                <button
                                                    onClick={() => handleToggle(lhp.id, isRegistered)}
                                                    disabled={actionLoading || !isOpen || isFull}
                                                    className={`btn ${isRegistered ? "btn-cancel" : "btn-register"}`}
                                                >
                                                    {actionLoading ? "Đang xử lý..." : isRegistered ? "Hủy đăng ký" : "Đăng ký"}
                                                </button>
                                            </td>
                                        </tr>
                                    );
                                })
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
}