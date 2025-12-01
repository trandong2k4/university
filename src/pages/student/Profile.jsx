import React, { useEffect, useState } from "react";
import "../../styles/student/profile.css";
import { useAuth } from "../../context/AuthContext";
import apiClient from '../../api/apiClient';

// Enum giả định cho Giới tính
const GIOI_TINH_ENUM = {
    NAM: 'NAM',
    NU: 'NU'
};

export default function StudentProfile() {
    const { user } = useAuth();
    const userId = user?.id;

    const [basicInfo, setBasicInfo] = useState(null); // SinhVien entity
    const [detailInfo, setDetailInfo] = useState(null); // ChiTietSinhVien entity
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    // STATE cho chế độ chỉnh sửa và dữ liệu form
    const [isEditingBasic, setIsEditingBasic] = useState(false);
    const [isEditingDetail, setIsEditingDetail] = useState(false); // 🆕 Chế độ chỉnh sửa chi tiết
    const [basicFormData, setBasicFormData] = useState({});
    const [detailFormData, setDetailFormData] = useState({}); // 🆕 Dữ liệu form chi tiết
    const [updateMessage, setUpdateMessage] = useState("");
    const [isUpdating, setIsUpdating] = useState(false);

    // ---------------------------------------------
    // 1. Tải dữ liệu ban đầu
    // ---------------------------------------------
    const fetchStudentData = async () => {
        if (!userId) {
            setLoading(false);
            return;
        }

        setLoading(true);
        setError(null);

        try {
            // Lấy thông tin cơ bản
            const basicRes = await apiClient.get(`/students/by-user/${userId}`);
            const basicData = basicRes.data;

            // Lấy thông tin chi tiết
            const detailRes = await apiClient.get(`/student_details/by-user/${basicData.id}`);
            const detailData = detailRes.data;

            setBasicInfo(basicData);
            setDetailInfo(detailData);

            // Khởi tạo form data cơ bản
            setBasicFormData({
                maSinhVien: basicData.maSinhVien || '',
                hoTen: basicData.hoTen || '',
                soDienThoai: basicData.soDienThoai || '',
                nganhId: basicData.nganh?.id || null,
            });

            // 🆕 Khởi tạo form data chi tiết
            setDetailFormData({
                diaChi: detailData.diaChi || '',
                ngaySinh: detailData.ngaySinh || '', // Format 'YYYY-MM-DD' cho input type="date"
                gioiTinh: detailData.gioiTinh || GIOI_TINH_ENUM.KHAC,
                quocTich: detailData.quocTich || '',
                cccd: detailData.cccd || '',
                sdtNguoiThan: detailData.sdtNguoiThan || '',
                // sinhVienId: basicData.id // Không cần thiết trong form, nhưng cần cho payload
            });

        } catch (err) {
            console.error("Lỗi khi tải hồ sơ sinh viên:", err.response?.data || err.message || err);
            setError("Không thể tải dữ liệu hồ sơ. Vui lòng kiểm tra lại kết nối API.");
            setBasicInfo({});
            setDetailInfo({});
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchStudentData();
    }, [userId]);


    // ---------------------------------------------
    // 2. Hàm xử lý cập nhật thông tin CƠ BẢN
    // ---------------------------------------------
    const handleBasicUpdate = async (e) => {
        e.preventDefault();

        if (!basicInfo || !basicInfo.id) {
            setUpdateMessage("Không tìm thấy ID sinh viên để cập nhật.");
            return;
        }

        setIsUpdating(true);
        setUpdateMessage("");

        try {
            const updatePayload = {
                maSinhVien: basicFormData.maSinhVien,
                hoTen: basicFormData.hoTen,
                soDienThoai: basicFormData.soDienThoai,
                ngayNhapHoc: basicInfo.ngayNhapHoc || null,
                ngayTotNghiep: basicInfo.ngayTotNghiep || null,
                nganhId: basicFormData.nganhId,
                userId: userId,
            };

            await apiClient.put(`/students/${basicInfo.id}`, updatePayload);

            // Tải lại dữ liệu sau khi cập nhật thành công
            await fetchStudentData();

            setUpdateMessage("Cập nhật thông tin cơ bản thành công! 🎉");
            setIsEditingBasic(false);

        } catch (err) {
            const serverError = err.response?.data || err.message;
            console.error("Lỗi khi cập nhật hồ sơ:", serverError);
            setUpdateMessage("Lỗi khi cập nhật cơ bản: " + (serverError || "Đã xảy ra lỗi không xác định."));
        } finally {
            setIsUpdating(false);
            setTimeout(() => setUpdateMessage(""), 5000);
        }
    };


    // ---------------------------------------------
    // 🆕 3. Hàm xử lý cập nhật thông tin CHI TIẾT
    // ---------------------------------------------
    const handleDetailUpdate = async (e) => {
        e.preventDefault();

        // ⚠️ Sử dụng ID của ChiTietSinhVien entity
        if (!detailInfo || !detailInfo.id) {
            setUpdateMessage("Không tìm thấy ID chi tiết sinh viên để cập nhật.");
            return;
        }

        setIsUpdating(true);
        setUpdateMessage("");

        try {
            // Chuẩn bị DTO dựa trên ChiTietSinhVienRequestDTO
            const updatePayload = {
                diaChi: detailFormData.diaChi,
                ngaySinh: detailFormData.ngaySinh,
                gioiTinh: detailFormData.gioiTinh,
                quocTich: detailFormData.quocTich,
                cccd: detailFormData.cccd,
                sdtNguoiThan: detailFormData.sdtNguoiThan,
                sinhVienId: basicInfo.id // Cần ID SinhVien
            };

            // 🚀 Gọi API PUT cho ChiTietSinhVien
            await apiClient.put(`/student_details/${detailInfo.id}`, updatePayload);

            // Tải lại dữ liệu sau khi cập nhật thành công
            await fetchStudentData();

            setUpdateMessage("Cập nhật thông tin chi tiết thành công! ✅");
            setIsEditingDetail(false);

        } catch (err) {
            const serverError = err.response?.data || err.message;
            console.error("Lỗi khi cập nhật chi tiết hồ sơ:", serverError);
            setUpdateMessage("Lỗi khi cập nhật chi tiết: " + (serverError || "Đã xảy ra lỗi không xác định."));
        } finally {
            setIsUpdating(false);
            setTimeout(() => setUpdateMessage(""), 5000);
        }
    };


    // ---------------------------------------------
    // 4. Các Component Con (Render Logic)
    // ---------------------------------------------
    if (loading) return <p className="loading">Đang tải thông tin sinh viên...</p>;
    if (error) return <p className="error" style={{ color: 'red' }}>{error}</p>;
    if (!basicInfo || !detailInfo) return <p className="error">Không tìm thấy dữ liệu sinh viên.</p>;


    // Form chỉnh sửa Thông tin cơ bản
    const BasicInfoForm = () => (
        <form onSubmit={handleBasicUpdate} className="profile-edit-form">
            <ul>
                <li>
                    <label>Mã sinh viên:</label>
                    <input
                        type="text"
                        value={basicFormData.maSinhVien}
                        onChange={(e) => setBasicFormData({ ...basicFormData, maSinhVien: e.target.value })}
                        disabled={isUpdating}
                    />
                </li>
                <li>
                    <label>Họ tên:</label>
                    <input
                        type="text"
                        value={basicFormData.hoTen}
                        onChange={(e) => setBasicFormData({ ...basicFormData, hoTen: e.target.value })}
                        disabled={isUpdating}
                    />
                </li>
                <li>
                    <label>Số điện thoại:</label>
                    <input
                        type="text"
                        value={basicFormData.soDienThoai}
                        onChange={(e) => setBasicFormData({ ...basicFormData, soDienThoai: e.target.value })}
                        disabled={isUpdating}
                    />
                </li>
                <li>
                    <label>Ngành (Không chỉnh sửa):</label>
                    <input
                        type="text"
                        value={basicInfo.tenNganh || 'N/A'}
                        disabled
                        className="disabled"
                    />
                </li>
            </ul>
            <div className="form-actions">
                <button type="submit" disabled={isUpdating} className="btn-primary">
                    {isUpdating ? "Đang lưu..." : "Lưu thay đổi"}
                </button>
                <button type="button" onClick={() => setIsEditingBasic(false)} disabled={isUpdating} className="btn-secondary">
                    Hủy
                </button>
            </div>
        </form>
    );

    // Hiển thị Thông tin cơ bản (Statis)
    const BasicInfoDisplay = () => (
        <ul>
            <li><strong>Mã sinh viên:</strong> {basicInfo.maSinhVien || 'N/A'}</li>
            <li><strong>Họ tên:</strong> {basicInfo.hoTen || 'N/A'}</li>
            {/* <li><strong>Email:</strong> {basicInfo.email || user.email || 'N/A'}</li> */}
            <li><strong>Số điện thoại:</strong> {basicInfo.soDienThoai || 'N/A'}</li>
            <li><strong>Ngành:</strong> {basicInfo.tenNganh || 'N/A'}</li>
            <li><strong>Khoa:</strong> {basicInfo.tenKhoa || 'N/A'}</li>
            <li><strong>Trường:</strong> {basicInfo.tenTruong || 'N/A'}</li>
        </ul>
    );

    // 🆕 Form chỉnh sửa Thông tin chi tiết
    const DetailInfoForm = () => (
        <form onSubmit={handleDetailUpdate} className="profile-edit-form">
            <ul>
                <li>
                    <label>Ngày sinh:</label>
                    <input
                        type="date"
                        value={detailFormData.ngaySinh}
                        onChange={(e) => setDetailFormData({ ...detailFormData, ngaySinh: e.target.value })}
                        disabled={isUpdating}
                    />
                </li>
                <li>
                    <label>Giới tính:</label>
                    <select
                        value={detailFormData.gioiTinh}
                        onChange={(e) => setDetailFormData({ ...detailFormData, gioiTinh: e.target.value })}
                        disabled={isUpdating}
                    >
                        {Object.keys(GIOI_TINH_ENUM).map(key => (
                            <option key={key} value={key}>{GIOI_TINH_ENUM[key]}</option>
                        ))}
                    </select>
                </li>
                <li>
                    <label>Địa chỉ:</label>
                    <input
                        type="text"
                        value={detailFormData.diaChi}
                        onChange={(e) => setDetailFormData({ ...detailFormData, diaChi: e.target.value })}
                        disabled={isUpdating}
                    />
                </li>
                <li>
                    <label>Quốc tịch:</label>
                    <input
                        type="text"
                        value={detailFormData.quocTich}
                        onChange={(e) => setDetailFormData({ ...detailFormData, quocTich: e.target.value })}
                        disabled={isUpdating}
                    />
                </li>
                <li>
                    <label>CCCD:</label>
                    <input
                        type="text"
                        value={detailFormData.cccd}
                        onChange={(e) => setDetailFormData({ ...detailFormData, cccd: e.target.value })}
                        disabled={isUpdating}
                    />
                </li>
                <li>
                    <label>SĐT người thân:</label>
                    <input
                        type="text"
                        value={detailFormData.sdtNguoiThan}
                        onChange={(e) => setDetailFormData({ ...detailFormData, sdtNguoiThan: e.target.value })}
                        disabled={isUpdating}
                    />
                </li>
            </ul>
            <div className="form-actions">
                <button type="submit" disabled={isUpdating} className="btn-primary">
                    {isUpdating ? "Đang lưu..." : "Lưu chi tiết"}
                </button>
                <button type="button" onClick={() => setIsEditingDetail(false)} disabled={isUpdating} className="btn-secondary">
                    Hủy
                </button>
            </div>
        </form>
    );

    // Hiển thị Thông tin chi tiết (Statis)
    const DetailInfoDisplay = () => (
        <ul>
            <li><strong>Ngày sinh:</strong> {detailInfo.ngaySinh || 'N/A'}</li>
            <li><strong>Giới tính:</strong> {detailInfo.gioiTinh || 'N/A'}</li>
            <li><strong>Địa chỉ:</strong> {detailInfo.diaChi || 'N/A'}</li>
            <li><strong>Quốc tịch:</strong> {detailInfo.quocTich || 'N/A'}</li>
            <li><strong>CCCD:</strong> {detailInfo.cccd || 'N/A'}</li>
            <li><strong>SĐT người thân:</strong> {detailInfo.sdtNguoiThan || 'N/A'}</li>
        </ul>
    );


    return (
        <div className="student-profile">
            <h2>📘 Hồ sơ sinh viên</h2>

            {updateMessage && (
                <div className={`alert ${updateMessage.includes("thành công") ? "success" : "error"}`}>
                    {updateMessage}
                </div>
            )}

            {/* --- THÔNG TIN CƠ BẢN --- */}
            <div className="profile-section">
                <h3>Thông tin cơ bản</h3>

                {isEditingBasic ? <BasicInfoForm /> : <BasicInfoDisplay />}

                <button
                    onClick={() => {
                        setIsEditingBasic(true);
                        setUpdateMessage("");
                        setIsEditingDetail(false); // Đóng form chi tiết
                    }}
                    disabled={isEditingBasic || isUpdating}
                    className="btn-edit"
                >
                    Chỉnh sửa
                </button>
            </div>

            <hr />

            {/* --- THÔNG TIN CHI TIẾT --- */}
            <div className="profile-section">
                <h3>Thông tin chi tiết</h3>

                {isEditingDetail ? <DetailInfoForm /> : <DetailInfoDisplay />}

                <button
                    onClick={() => {
                        setIsEditingDetail(true);
                        setUpdateMessage("");
                        setIsEditingBasic(false); // Đóng form cơ bản
                    }}
                    disabled={isEditingDetail || isUpdating}
                    className="btn-edit"
                >
                    Chỉnh sửa
                </button>
            </div>
        </div>
    );
}