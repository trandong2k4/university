// Courses.jsx
import React from "react";
import { Link } from "react-router-dom";
import mockData from "../../mockData";
<<<<<<< HEAD
import "../../styles/courses.css";
=======
import "../../styles/student/courses.css";
>>>>>>> 3725551 (Publiclayout)

export default function Courses() {
    const courses = mockData.entities.monHoc || [];
    const majorsById = (mockData.entities.nganhHoc || []).reduce((a, m) => (a[m.id] = m, a), {});

    return (
        <div className="courses-container">
            <h1 className="courses-title">Môn học</h1>
            <div className="courses-list">
                {courses.map(c => (
                    <div key={c.maMonHoc} className="courses-card">
                        <div className="courses-header">
                            <div className="courses-name">{c.tenMonHoc}</div>
                            <span className="courses-code">{c.maMonHoc}</span>
                        </div>
                        <p className="courses-desc">{c.moTa}</p>
                        <div className="courses-prereq">
                            {c.monHocTienQuyetId ? `Tiên quyết: ${c.monHocTienQuyetId}` : "Không có tiên quyết"}
                        </div>
                        <div className="courses-majors">
                            {(c.nganhHocIds || []).map(id => (
                                <Link key={`${c.maMonHoc}-${id}`} to={`/majors/${id}`} className="courses-major-link">
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
