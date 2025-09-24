// Courses.jsx - placeholder
import React from "react";
import { Link } from "react-router-dom";
import mockData from "../../mockData";

export default function Courses() {
    const courses = mockData.entities.monHoc || [];
    const majorsById = (mockData.entities.nganhHoc || []).reduce((a, m) => (a[m.id] = m, a), {});

    return (
        <div className="space-y-4">
            <h1 className="text-2xl font-bold">Môn học</h1>
            <div className="grid md:grid-cols-2 gap-4">
                {courses.map(c => (
                    <div key={c.maMonHoc} className="bg-white rounded-xl border p-4">
                        <div className="flex items-center justify-between">
                            <div className="font-semibold">{c.tenMonHoc}</div>
                            <span className="text-xs px-2 py-1 bg-blue-50 text-blue-700 rounded">{c.maMonHoc}</span>
                        </div>
                        <p className="text-sm text-gray-600 mt-1">{c.moTa}</p>
                        <div className="text-xs text-gray-500 mt-1">
                            {c.monHocTienQuyetId ? `Tiên quyết: ${c.monHocTienQuyetId}` : "Không có tiên quyết"}
                        </div>
                        <div className="flex flex-wrap gap-2 mt-3">
                            {(c.nganhHocIds || []).map(id => (
                                <Link key={`${c.maMonHoc}-${id}`} to={`/majors/${id}`} className="text-xs px-2 py-1 rounded bg-gray-100 hover:bg-gray-200">
                                    {majorsById[id]?.maNganh || `Ngành ${id}`}
                                </Link>
                            ))}
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}
