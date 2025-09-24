// TeacherCourses.jsx - placeholder
import React from "react";
import mockData from "../../mockData";

export default function TeacherCourses() {
    const courses = mockData.entities.monHoc || [];

    return (
        <div className="space-y-4">
            <h1 className="text-2xl font-bold">Môn học phụ trách (mock)</h1>
            <div className="grid md:grid-cols-2 gap-4">
                {courses.map((c) => (
                    <div key={c.maMonHoc} className="bg-white rounded-xl border p-4">
                        <div className="flex items-center justify-between">
                            <div className="font-semibold">{c.tenMonHoc}</div>
                            <span className="text-xs px-2 py-1 bg-blue-50 text-blue-700 rounded">
                                {c.maMonHoc}
                            </span>
                        </div>
                        <p className="text-sm text-gray-600 mt-1">{c.moTa}</p>
                        <div className="text-xs text-gray-500 mt-1">
                            {c.monHocTienQuyetId ? `Tiên quyết: ${c.monHocTienQuyetId}` : "Không có tiên quyết"}
                        </div>
                    </div>
                ))}
            </div>
            {!courses.length && <div className="text-sm text-gray-500">Chưa có môn học.</div>}
        </div>
    );
}
