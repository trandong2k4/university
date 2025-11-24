import React, { useEffect, useState } from "react";
import { useAuth } from "../../context/AuthContext";
import "../../styles/student/registerSchedule.css";

export default function RegisterSchedule() {
    const { id: sinhVienId } = useAuth(); // lấy id sinh viên từ context
    const [lichHocs, setLichHocs] = useState([]); // tất cả lịch học
    const [dangKyList, setDangKyList] = useState([]); // các lịch đã đăng ký
    const [loading, setLoading] = useState(true);
    const [updating, setUpdating] = useState(false);

    // 🟢 Lấy danh sách lịch học và các đăng ký hiện có
    useEffect(() => {
        const fetchData = async () => {
            try {
                const [lichHocRes, dangKyRes] = await Promise.all([
                    fetch("http://localhost:8080/schedules").then(r => r.json()),
                    fetch(`http://localhost:8080/schedule_registrations/by-sinhvien/${sinhVienId}`).then(r => r.json())
                ]);

                setLichHocs(lichHocRes);
                setDangKyList(dangKyRes.map(d => d.lichHoc.id)); // chỉ lưu id lịch đã đăng ký
            } catch (err) {
                console.error("Lỗi tải dữ liệu:", err);
            } finally {
                setLoading(false);
            }
        };

        if (sinhVienId) fetchData();
    }, [sinhVienId]);

    // 🟡 Xử lý đăng ký / hủy đăng ký
    const toggleDangKy = async (lichHocId, isDangKy) => {
        if (!sinhVienId) return alert("Chưa xác định sinh viên!");
        setUpdating(true);

        try {
            const url = `http://localhost:8080/schedule_registrations/${sinhVienId}/${lichHocId}`;
            const method = isDangKy ? "DELETE" : "POST";

            const res = await fetch(url, { method });
            if (!res.ok) throw new Error("Lỗi thao tác đăng ký / hủy đăng ký!");

            // Cập nhật lại danh sách đăng ký
            setDangKyList(prev =>
                isDangKy ? prev.filter(id => id !== lichHocId) : [...prev, lichHocId]
            );
        } catch (err) {
            alert(err.message);
        } finally {
            setUpdating(false);
        }
    };

    if (loading) return <p>Đang tải danh sách lịch học...</p>;

    return (
        <div className="register-schedule-container">
            <h2>🗓️ Đăng ký lịch học</h2>

            <table className="schedule-table">
                <thead>
                    <tr>
                        <th>Tên môn học</th>
                        <th>Phòng học</th>
                        <th>Kỳ học</th>
                        <th>Ngày bắt đầu</th>
                        <th>Ngày kết thúc</th>
                        <th>Trạng thái</th>
                        <th>Hành động</th>
                    </tr>
                </thead>
                <tbody>
                    {lichHocs.map(lh => {
                        const isDangKy = dangKyList.includes(lh.id);
                        return (
                            <tr key={lh.id}>
                                <td>{lh.tenMonHoc}</td>
                                <td>{lh.tenPhongHoc}</td>
                                <td>{lh.tenKiHoc}</td>
                                <td>{lh.ngayBatDau}</td>
                                <td>{lh.ngayKetThuc}</td>
                                <td className={isDangKy ? "status-yes" : "status-no"}>
                                    {isDangKy ? "Đã đăng ký" : "Chưa đăng ký"}
                                </td>
                                <td>
                                    <button
                                        className={isDangKy ? "btn-cancel" : "btn-register"}
                                        onClick={() => toggleDangKy(lh.id, isDangKy)}
                                        disabled={updating}
                                    >
                                        {isDangKy ? "❌ Hủy đăng ký" : "✅ Đăng ký"}
                                    </button>
                                </td>
                            </tr>
                        );
                    })}
                </tbody>
            </table>
        </div>
    );
}
