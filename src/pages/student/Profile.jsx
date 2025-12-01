import React, { useEffect, useState } from "react";
import "../../styles/student/profile.css";
import { useAuth } from "../../context/AuthContext";
// Giả định apiClient đã được import đúng cách
import apiClient from '../../api/apiClient';

export default function StudentProfile() {
    const { user } = useAuth();
    const userId = user?.id;

    const [basicInfo, setBasicInfo] = useState(null);
    const [detailInfo, setDetailInfo] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        if (!userId) {
            setLoading(false);
            return;
        }

        const fetchStudentData = async () => {
            setLoading(true);
            setError(null);

            let basicData = null;
            let detailData = null;

            try {
                // 1. GỌI API lấy thông tin cơ bản (Sử dụng apiClient.get)
                const basicRes = await apiClient.get(`/students/by-user/${userId}`);
                basicData = basicRes.data;


                setBasicInfo(basicData);

                const detailRes = await apiClient.get(`/student_details/by-user/${basicData.id}`);
                detailData = detailRes.data;
                setDetailInfo(detailData);

            } catch (err) {
                console.error("Lỗi khi tải hồ sơ sinh viên:", err);
                setError("Không thể tải dữ liệu hồ sơ. Vui lòng kiểm tra lại kết nối API.");

                // Đặt giá trị mặc định nếu API thất bại (hoặc để null để hiển thị lỗi)
                setBasicInfo({});
                setDetailInfo({});
            } finally {
                setLoading(false);
            }
        };

        fetchStudentData();
    }, [userId]);

    if (loading)
        return <p>Đang tải thông tin sinh viên...</p>;

    if (error)
        return <p style={{ color: 'red' }}>{error}</p>;

    // Xử lý trường hợp basicInfo/detailInfo bị null sau khi loading = false (Nếu API trả về rỗng)
    if (!basicInfo || !detailInfo)
        return <p>Không tìm thấy dữ liệu sinh viên.</p>;


    return (
        <div className="student-profile">
            <h2>📘 Hồ sơ sinh viên</h2>

            {/* 💡 Chú ý: Trường email không có trong dữ liệu mẫu bạn cung cấp. */}
            <div className="profile-section">
                <h3>Thông tin cơ bản</h3>
                <ul>
                    <li><strong>Mã sinh viên:</strong> {basicInfo.maSinhVien || 'N/A'}</li>
                    <li><strong>Họ tên:</strong> {basicInfo.hoTen || 'N/A'}</li>
                    <li><strong>Email:</strong> {basicInfo.email || user.email || 'N/A'}</li>
                    <li><strong>Số điện thoại:</strong> {basicInfo.soDienThoai || 'N/A'}</li>
                    <li><strong>Ngành:</strong> {basicInfo.tenNganh || 'N/A'}</li>
                    <li><strong>Khoa:</strong> {basicInfo.tenKhoa || 'N/A'}</li>
                    <li><strong>Trường:</strong> {basicInfo.tenTruong || 'N/A'}</li>
                </ul>
            </div>

            <div className="profile-section">
                <h3>Thông tin chi tiết</h3>
                <ul>
                    <li><strong>Ngày sinh:</strong> {detailInfo.ngaySinh || 'N/A'}</li>
                    <li><strong>Giới tính:</strong> {detailInfo.gioiTinh || 'N/A'}</li>
                    <li><strong>Địa chỉ:</strong> {detailInfo.diaChi || 'N/A'}</li>
                    <li><strong>Quốc tịch:</strong> {detailInfo.quocTich || 'N/A'}</li>
                    <li><strong>CCCD:</strong> {detailInfo.cccd || 'N/A'}</li>
                    <li><strong>SĐT người thân:</strong> {detailInfo.sdtNguoiThan || 'N/A'}</li>
                </ul>
            </div>
        </div>
    );
}