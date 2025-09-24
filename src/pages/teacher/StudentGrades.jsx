// StudentGrades.jsx - placeholder
import React from "react";
import mockData from "../../mockData";

export default function StudentGrades() {
  const grades = mockData.entities.ketQuaHocTap || [];
  const studentsById = (mockData.entities.sinhVien || []).reduce((a, s) => ((a[s.id] = s), a), {});
  const monHocById = (mockData.entities.monHoc || []).reduce((a, m) => ((a[m.maMonHoc] = m), a), {});
  const kiById = (mockData.entities.kiHoc || []).reduce((a, k) => ((a[k.id] = k), a), {});

  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-bold">Điểm sinh viên</h1>
      <div className="overflow-x-auto bg-white rounded-xl border">
        <table className="min-w-[820px] w-full text-sm">
          <thead className="bg-gray-50 text-gray-600">
            <tr>
              <th className="p-3 text-left">Sinh viên</th>
              <th className="p-3 text-left">Môn học</th>
              <th className="p-3 text-left">Kỳ</th>
              <th className="p-3 text-center">Quá trình</th>
              <th className="p-3 text-center">Cuối kỳ</th>
              <th className="p-3 text-center">Tổng kết</th>
              <th className="p-3 text-center">Xếp loại</th>
            </tr>
          </thead>
          <tbody>
            {grades.map((r) => {
              const sv = studentsById[r.sinhVienId];
              const m = monHocById[r.monHocId];
              const k = kiById[r.kiHocId];
              return (
                <tr key={r.id} className="border-t">
                  <td className="p-3">{sv?.tenSinhVien} <span className="text-xs text-gray-500">({sv?.maSinhVien})</span></td>
                  <td className="p-3">{m?.tenMonHoc} <span className="text-xs text-gray-500">({r.monHocId})</span></td>
                  <td className="p-3">{k?.tenKiHoc || "-"}</td>
                  <td className="p-3 text-center">{r.diemQuaTrinh}</td>
                  <td className="p-3 text-center">{r.diemCuoiKy}</td>
                  <td className="p-3 text-center font-medium">{r.diemTongKet}</td>
                  <td className="p-3 text-center">{r.xepLoai}</td>
                </tr>
              );
            })}
            {!grades.length && (
              <tr><td className="p-3 text-gray-500" colSpan={7}>Chưa có dữ liệu điểm.</td></tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
