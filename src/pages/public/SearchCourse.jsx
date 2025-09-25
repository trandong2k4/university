// SearchCourse.jsx - placeholder
import React, { useMemo } from "react";
import { useSearchParams, Link } from "react-router-dom";
import mockData from "../../mockData";

export default function SearchCourse() {
  const [params] = useSearchParams();
  const q = (params.get("q") || "").trim().toLowerCase();

  const majorsById = useMemo(() => {
    const all = mockData.entities.nganhHoc || [];
    return all.reduce((acc, m) => ((acc[m.id] = m), acc), {});
  }, []);

  const courses = useMemo(() => {
    const all = mockData.entities.monHoc || [];
    if (!q) return all;
    return all.filter((c) => {
      const name = (c.tenMonHoc || "").toLowerCase();
      const code = (c.maMonHoc || "").toLowerCase();
      return name.includes(q) || code.includes(q);
    });
  }, [q]);

  const prereqLabel = (id) => (id ? `Tiên quyết: ${id}` : "Không có tiên quyết");

  return (
    <div className="search-container">
      <h1 className="search-title">Tìm kiếm môn học</h1>
      {q && <div className="search-result">Từ khóa: “{q}”</div>}

      <div className="search-grid">
        {courses.map((c) => (
          <div key={c.maMonHoc} className="search-card">
            <div className="search-card-header">
              <div>{c.tenMonHoc}</div>
              <span className="search-code">{c.maMonHoc}</span>
            </div>
            <div className="search-desc">{c.moTa}</div>
            <div className="search-prereq">{prereqLabel(c.monHocTienQuyetId)}</div>

            <div className="search-majors">
              {(c.nganhHocIds || []).map((mid) => (
                <Link
                  key={`${c.maMonHoc}-${mid}`}
                  to={`/majors/${mid}`}
                  className="search-major"
                  title={majorsById[mid]?.tenNganh}
                >
                  {majorsById[mid]?.maNganh || `Mã ngành ${mid}`}
                </Link>
              ))}
            </div>
          </div>
        ))}
      </div>

      {!courses.length && <div className="search-empty">Không tìm thấy môn học phù hợp.</div>}

      <div className="">
        <Link to="/" className="">
          Quay lại danh sách ngành
        </Link>
      </div>
    </div>

  );
}
