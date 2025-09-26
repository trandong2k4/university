// TeacherCourses.jsx - placeholder
import React from "react";
import mockData from "../../mockData";
<<<<<<< HEAD
import "../../styles/teacherCourses.css";
=======
import "../../styles/teacher/teacherCourses.css";
>>>>>>> 3725551 (Publiclayout)

export default function TeacherCourses() {
    const courses = mockData.entities.monHoc || [];

    return (
        <div className="tc-container">
            <h1 className="tc-title">Môn học phụ trách (mock)</h1>
            <div className="tc-grid">
                {courses.map((c) => (
                    <div key={c.maMonHoc} className="tc-card">
                        <div className="tc-header">
                            <div className="tc-name">{c.tenMonHoc}</div>
                            <span className="tc-code">{c.maMonHoc}</span>
                        </div>
                        <p className="tc-desc">{c.moTa}</p>
                        <div className="tc-prereq">
                            {c.monHocTienQuyetId
                                ? `Tiên quyết: ${c.monHocTienQuyetId}`
                                : "Không có tiên quyết"}
                        </div>
                    </div>
                ))}
            </div>
            {!courses.length && <div className="tc-empty">Chưa có môn học.</div>}
        </div>
    );
}
