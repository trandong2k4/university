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
    <div className="container mx-auto px-4 py-8 space-y-6">
      <h1 className="text-2xl font-bold">Tìm kiếm môn học</h1>
      {q && <div className="text-sm text-gray-600">Từ khóa: “{q}”</div>}

      <div className="grid md:grid-cols-2 gap-4">
        {courses.map((c) => (
          <div key={c.maMonHoc} className="p-4 bg-white rounded-xl border hover:shadow">
            <div className="flex items-center justify-between">
              <div className="font-semibold">{c.tenMonHoc}</div>
              <span className="text-xs px-2 py-1 bg-blue-50 text-blue-700 rounded">
                {c.maMonHoc}
              </span>
            </div>
            <div className="text-sm text-gray-600 mt-1">{c.moTa}</div>
            <div className="text-sm text-gray-700 mt-2">{prereqLabel(c.monHocTienQuyetId)}</div>

            {/* Majors */}
            <div className="flex flex-wrap gap-2 mt-3">
              {(c.nganhHocIds || []).map((mid) => (
                <Link
                  key={`${c.maMonHoc}-${mid}`}
                  to={`/majors/${mid}`}
                  className="text-xs px-2 py-1 rounded bg-gray-100 hover:bg-gray-200"
                  title={majorsById[mid]?.tenNganh}
                >
                  {majorsById[mid]?.maNganh || `Mã ngành ${mid}`}
                </Link>
              ))}
            </div>
          </div>
        ))}
      </div>

      {!courses.length && (
        <div className="text-sm text-gray-500">Không tìm thấy môn học phù hợp.</div>
      )}
    </div>
  );
}
