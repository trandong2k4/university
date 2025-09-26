// ManageCourses.jsx
import React, { useState } from "react";
import mockData from "../../mockData";
import "../../styles/admin/manageCourses.css";

export default function ManageCourses() {
    const [courses, setCourses] = useState(mockData.entities.monHoc || []);
    const majorsById = (mockData.entities.nganhHoc || []).reduce((a, m) => ((a[m.id] = m), a), {});

    const onDelete = (maMonHoc) => {
        if (confirm(`Bạn có chắc muốn xóa môn ${maMonHoc}?`)) {
            setCourses(courses.filter((c) => c.maMonHoc !== maMonHoc));
        }
    };

    return (
        <div className="manage-courses-container">
            <h1 className="manage-courses-title">Quản lý môn học</h1>
            <div className="manage-courses-table-wrapper">
                <table className="manage-courses-table">
                    <thead className="manage-courses-thead">
                        <tr>
                            <th>Mã môn</th>
                            <th>Tên môn</th>
                            <th>Ngành</th>
                            <th>Tiên quyết</th>
                            <th>Mô tả</th>
                            <th>Thao tác</th>
                        </tr>
                    </thead>
                    <tbody>
                        {courses.map((c) => (
                            <tr key={c.maMonHoc} className="manage-courses-row">
                                <td className="manage-courses-code">{c.maMonHoc}</td>
                                <td>{c.tenMonHoc}</td>
                                <td>
                                    {(c.nganhHocIds || []).map((id) => (
                                        <span key={id} className="manage-courses-major-badge">
                                            {majorsById[id]?.maNganh || `#${id}`}
                                        </span>
                                    ))}
                                </td>
                                <td>{c.monHocTienQuyetId || "-"}</td>
                                <td className="manage-courses-desc">{c.moTa}</td>
                                <td>
                                    <button
                                        onClick={() => onDelete(c.maMonHoc)}
                                        className="manage-courses-delete-btn"
                                    >
                                        Xóa
                                    </button>
                                </td>
                            </tr>
                        ))}
                        {!courses.length && (
                            <tr>
                                <td colSpan={6} className="manage-courses-empty">
                                    Không có môn học.
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    );
}
