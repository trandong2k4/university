import { useEffect, useState } from "react";
import "../../styles/student/profile.css";
import { useAuth } from "../../context/AuthContext";

export default function StudentProfile() {
    const { user } = useAuth(); // ✅ Lấy user từ context
    const userId = user?.id;    // ✅ Lấy id của user đăng nhập

    const [basicInfo, setBasicInfo] = useState(null);
    const [detailInfo, setDetailInfo] = useState(null);

    useEffect(() => {
        if (!userId) return; // tránh lỗi khi user chưa có

        // 🔹 Gọi API lấy thông tin cơ bản
        fetch(`http://localhost:8080/students/by-user/${userId}`)
            .then((res) => res.json())
            .then(setBasicInfo)
            .catch(console.error);

        // 🔹 Gọi API lấy thông tin chi tiết
        fetch(`http://localhost:8080/student_details/by-user/${userId}`)
            .then((res) => res.json())
            .then(setDetailInfo)
            .catch(console.error);

    }, [userId]);

    if (!basicInfo || !detailInfo)
        return <p>Đang tải thông tin sinh viên...</p>;

    return (
        <div className="student-profile">
            <h2>📘 Hồ sơ sinh viên</h2>

            <div className="profile-section">
                <h3>Thông tin cơ bản</h3>
                <ul>
                    <li><strong>Mã sinh viên:</strong> {basicInfo.maSinhVien}</li>
                    <li><strong>Họ tên:</strong> {basicInfo.hoTen}</li>
                    <li><strong>Email:</strong> {basicInfo.email}</li>
                    <li><strong>Số điện thoại:</strong> {basicInfo.soDienThoai}</li>
                    <li><strong>Ngành:</strong> {basicInfo.tenNganh}</li>
                    <li><strong>Khoa:</strong> {basicInfo.tenKhoa}</li>
                    <li><strong>Trường:</strong> {basicInfo.tenTruong}</li>
                </ul>
            </div>

            <div className="profile-section">
                <h3>Thông tin chi tiết</h3>
                <ul>
                    <li><strong>Ngày sinh:</strong> {detailInfo.ngaySinh}</li>
                    <li><strong>Giới tính:</strong> {detailInfo.gioiTinh}</li>
                    <li><strong>Địa chỉ:</strong> {detailInfo.diaChi}</li>
                    <li><strong>Quốc tịch:</strong> {detailInfo.quocTich}</li>
                    <li><strong>CCCD:</strong> {detailInfo.cccd}</li>
                    <li><strong>SĐT người thân:</strong> {detailInfo.sdtNguoiThan}</li>
                </ul>
            </div>
        </div>
    );
}
