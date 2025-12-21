import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import apiClient from "/src/api/apiClient";
import "../../styles/admin/manageMajors.css";

export default function ManagePartialClass() {
    const [data, setData] = useState([]);
    const [loading, setLoading] = useState(true);
    const navigate = useNavigate();

    const fetchData = async () => {
        try {
            const res = await apiClient.get("/class");
            setData(res.data);
        } catch (err) {
            console.error("Lỗi tải dữ liệu lớp học phần", err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchData();
    }, []);

    const handleDelete = async (id) => {
        if (!confirm("Xác nhận xóa lớp học phần?")) return;

        try {
            await apiClient.delete(`/class/${id}`);
            setData(data.filter((item) => item.id !== id));
        } catch (err) {
            console.error("Không thể xóa lớp học phần", err);
        }
    };

    const goCreate = () => navigate("/admin/partial-class/create");
    const goEdit = (id) => navigate(`/admin/partial-class/edit/${id}`);

    if (loading) return <p>Đang tải...</p>;

    return (
        <div className="majors-container">
            <h2>Quản lý lớp học phần</h2>

            <button className="btn-create" onClick={goCreate}>
                + Thêm lớp học phần
            </button>

            <table className="majors-table">
                <thead>
                    <tr>
                        <th>Mã lớp</th>
                        <th>Môn học</th>
                        <th>Kì học</th>
                        <th>Giảng viên</th>
                        <th>Số lượng</th>
                        <th>Trạng thái</th>
                        <th>Thao tác</th>
                    </tr>
                </thead>
                <tbody>
                    {data.map((lhp) => (
                        <tr key={lhp.id}>
                            <td>{lhp.maLopHocPhan}</td>
                            <td>{lhp.tenMonHoc}</td>
                            <td>{lhp.tenKiHoc}</td>
                            <td>{lhp.tenGiangVien}</td>
                            <td>
                                {lhp.soLuongHienTai}/{lhp.soLuongToiDa}
                            </td>
                            <td>{lhp.trangThai}</td>
                            <td>
                                <button onClick={() => goEdit(lhp.id)}>
                                    Sửa
                                </button>
                                <button
                                    className="btn-delete"
                                    onClick={() => handleDelete(lhp.id)}
                                >
                                    Xóa
                                </button>
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
}
