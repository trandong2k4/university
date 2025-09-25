// MajorDetail.jsx - placeholder
import React, { useMemo } from "react";
import { useParams, Link } from "react-router-dom";
import mockData from "../../mockData";

export default function MajorDetail() {
    const { id } = useParams();
    const majorId = Number(id);

    const majors = mockData.entities.nganhHoc || [];
    const courses = mockData.entities.monHoc || [];

    const major = useMemo(() => majors.find((m) => m.id === majorId), [majors, majorId]);
    const relatedCourses = useMemo(
        () => courses.filter((c) => (c.nganhHocIds || []).includes(majorId)),
        [courses, majorId]
    );

    if (!major) {
        return (
            <div className="container mx-auto px-4 py-8">
                <div className="text-red-600 font-semibold">Không tìm thấy ngành học (id: {id}).</div>
                <Link to="/majors" className="text-blue-600 underline mt-2 inline-block">
                    Quay lại danh sách ngành
                </Link>
            </div>
        );
    }

    return (
        <div className="container mx-auto px-4 py-8 space-y-6">
            <div className="space-y-1">
                <h1 className="text-2xl font-bold">{major.tenNganh}</h1>
                <div className="text-sm text-gray-500">Mã ngành: {major.maNganh}</div>
                <p className="text-gray-700 mt-2">{major.moTa}</p>
            </div>

            <section className="space-y-3">
                <h2 className="text-xl font-semibold">Danh sách môn thuộc ngành</h2>
                <div className="grid md:grid-cols-2 gap-4">
                    {relatedCourses.map((c) => (
                        <div key={c.maMonHoc} className="p-4 bg-white rounded-xl border hover:shadow">
                            <div className="flex items-center justify-between">
                                <div className="font-medium">{c.tenMonHoc}</div>
                                <span className="text-xs px-2 py-1 bg-blue-50 text-blue-700 rounded">
                                    {c.maMonHoc}
                                </span>
                            </div>
                            <div className="text-sm text-gray-600 mt-1">{c.moTa}</div>
                            {c.monHocTienQuyetId && (
                                <div className="text-xs text-gray-500 mt-1">
                                    Tiên quyết: {c.monHocTienQuyetId}
                                </div>
                            )}
                        </div>
                    ))}
                </div>

                {!relatedCourses.length && (
                    <div className="text-sm text-gray-500">Chưa có môn học cho ngành này.</div>
                )}
            </section>


            <div className="container mx-auto px-4 py-8">
                <div className="text-red-600 font-semibold">Không tìm thấy ngành học (id: {id}).</div>
                <Link to="/" className="text-blue-600 underline mt-2 inline-block">
                    Quay lại danh sách ngành
                </Link>
            </div>
        </div>
    );
}
