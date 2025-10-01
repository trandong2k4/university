import React from "react";
import "../../styles/dashboard/teacherDashboard.css";
import mockData from "../../mockData";

export default function TeacherDashboard() {
    // Lấy giảng viên từ mock
    const nhanVien = mockData.entities.nhanVien.find(
        (nv) => nv.viTriId === 1 // Giảng Viên
    );
    const viTri = mockData.entities.viTri.find((v) => v.id === nhanVien.viTriId);
    const user = mockData.entities.user.find((u) => u.id === nhanVien.userId);

    // Lấy danh sách môn học mà giảng viên có thể dạy (demo: toàn bộ monHocMock)
    const monHocList = mockData.entities.monHoc;

    // Lấy lịch dạy
    const lichHocList = mockData.entities.lichHoc.map((lh) => {
        const monHoc = mockData.entities.monHoc.find((m) => m.maMonHoc === lh.monHocId);
        const phongHoc = mockData.entities.phongHoc.find((p) => p.id === lh.phongHocId);
        const kiHoc = mockData.entities.kiHoc.find((k) => k.id === lh.kiHocId);
        return {
            ...lh,
            tenMonHoc: monHoc?.tenMonHoc,
            tenPhong: phongHoc?.tenPhong,
            tenKiHoc: kiHoc?.tenKiHoc,
        };
    });

    // Lấy sinh viên + kết quả học tập
    const sinhVienList = mockData.entities.sinhVien.map((sv) => {
        const chiTiet = mockData.entities.chiTietSinhVien.find(
            (ct) => ct.sinhVienId === sv.id
        );
        const ketQua = mockData.entities.ketQuaHocTap.filter(
            (kq) => kq.sinhVienId === sv.id
        );
        return {
            ...sv,
            email: chiTiet?.email,
            diaChi: chiTiet?.diaChi,
            soDienThoai: chiTiet?.soDienThoai,
            ketQua,
        };
    });

    return (
        <main className="teacher-dashboard-container">
            {/* Banner */}
            <section className="teacher-banner">
                <h1>Teacher Dashboard</h1>
                <p>Xin chào {nhanVien.tenNhanVien} ({user.username})</p>
            </section>

            {/* Thông tin giảng viên */}
            <section className="teacher-info">
                <h2>Thông tin giảng viên</h2>
                <ul>
                    <li><strong>Mã NV:</strong> {nhanVien.maNhanVien}</li>
                    <li><strong>Họ tên:</strong> {nhanVien.tenNhanVien}</li>
                    <li><strong>Vị trí:</strong> {viTri.tenViTri}</li>
                    <li><strong>Email:</strong> {user.email}</li>
                </ul>
            </section>

            {/* Danh sách môn học */}
            <section className="teacher-courses">
                <h2>Môn học phụ trách</h2>
                <div className="course-list">
                    {monHocList.map((mon) => (
                        <div key={mon.maMonHoc} className="course-card">
                            <h3>{mon.tenMonHoc}</h3>
                            <p>{mon.moTa}</p>
                        </div>
                    ))}
                </div>
            </section>

            {/* Lịch dạy */}
            <section className="teacher-schedule">
                <h2>Lịch giảng dạy</h2>
                <table>
                    <thead>
                        <tr>
                            <th>Mã lịch</th>
                            <th>Môn học</th>
                            <th>Phòng</th>
                            <th>Kỳ học</th>
                            <th>Thứ</th>
                        </tr>
                    </thead>
                    <tbody>
                        {lichHocList.map((lh) => (
                            <tr key={lh.id}>
                                <td>{lh.maLichHoc}</td>
                                <td>{lh.tenMonHoc}</td>
                                <td>{lh.tenPhong}</td>
                                <td>{lh.tenKiHoc}</td>
                                <td>{`Thứ ${lh.thuTrongTuan}`}</td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </section>

            {/* Danh sách sinh viên */}
            <section className="teacher-students">
                <h2>Sinh viên tham gia</h2>
                <table>
                    <thead>
                        <tr>
                            <th>Mã SV</th>
                            <th>Tên SV</th>
                            <th>Email</th>
                            <th>Điện thoại</th>
                            <th>Kết quả học tập</th>
                        </tr>
                    </thead>
                    <tbody>
                        {sinhVienList.map((sv) => (
                            <tr key={sv.id}>
                                <td>{sv.maSinhVien}</td>
                                <td>{sv.tenSinhVien}</td>
                                <td>{sv.email}</td>
                                <td>{sv.soDienThoai}</td>
                                <td>
                                    {sv.ketQua.length > 0 ? (
                                        sv.ketQua.map((kq) => (
                                            <div key={kq.id}>
                                                {kq.monHocId} ({kq.xepLoai}) - {kq.diemTongKet}
                                            </div>
                                        ))
                                    ) : (
                                        "Chưa có"
                                    )}
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </section>
        </main>
    );
}
