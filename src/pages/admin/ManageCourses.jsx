// ManageCourses.jsx - placeholder
import React, { useState } from "react";
import mockData from "../../mockData";

export default function ManageCourses() {
    const [courses, setCourses] = useState(mockData.entities.monHoc || []);
    const majorsById = (mockData.entities.nganhHoc || []).reduce((a, m) => ((a[m.id] = m), a), {});

    const onDelete = (maMonHoc) => {
        if (confirm(`Bạn có chắc muốn xóa môn ${maMonHoc}?`)) {
            setCourses(courses.filter((c) => c.maMonHoc !== maMonHoc));
        }
    };

    return (
        <div className="space-y-4">
            <h1 className="text-2xl font-bold">Quản lý môn học</h1>
            <div className="overflow-x-auto bg-white rounded-xl border">
                <table className="min-w-[840px] w-full text-sm">
                    <thead className="bg-gray-50 text-gray-600">
                        <tr>
                            <th className="p-3 text-left">Mã môn</th>
                            <th className="p-3 text-left">Tên môn</th>
                            <th className="p-3 text-left">Ngành</th>
                            <th className="p-3 text-left">Tiên quyết</th>
                            <th className="p-3 text-left">Mô tả</th>
                            <th className="p-3 text-left">Thao tác</th>
                        </tr>
                    </thead>
                    <tbody>
                        {courses.map((c) => (
                            <tr key={c.maMonHoc} className="border-t">
                                <td className="p-3 font-mono">{c.maMonHoc}</td>
                                <td className="p-3">{c.tenMonHoc}</td>
                                <td className="p-3">
                                    {(c.nganhHocIds || []).map((id) => (
                                        <span
                                            key={id}
                                            className="inline-block px-2 py-1 text-xs bg-gray-100 rounded mr-1"
                                        >
                                            {majorsById[id]?.maNganh || `#${id}`}
                                        </span>
                                    ))}
                                </td>
                                <td className="p-3">{c.monHocTienQuyetId || "-"}</td>
                                <td className="p-3 text-gray-600">{c.moTa}</td>
                                <td className="p-3">
                                    <button
                                        onClick={() => onDelete(c.maMonHoc)}
                                        className="px-3 py-1 text-sm rounded bg-rose-600 text-white hover:bg-rose-700"
                                    >
                                        Xóa
                                    </button>
                                </td>
                            </tr>
                        ))}
                        {!courses.length && (
                            <tr>
                                <td className="p-3 text-gray-500" colSpan={6}>
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
