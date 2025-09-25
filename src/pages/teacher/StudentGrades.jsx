// StudentGrades.jsx - placeholder
import React from "react";
import mockData from "../../mockData";
import "../../styles/StudentGrades.css";

export default function StudentGrades() {
  const grades = mockData.entities.ketQuaHocTap || [];
  const studentsById = (mockData.entities.sinhVien || []).reduce((a, s) => ((a[s.id] = s), a), {});
  const monHocById = (mockData.entities.monHoc || []).reduce((a, m) => ((a[m.maMonHoc] = m), a), {});
  const kiById = (mockData.entities.kiHoc || []).reduce((a, k) => ((a[k.id] = k), a), {});

  return (
    <div className="sg-container">
      <h1 className="sg-title">Điểm sinh viên</h1>
      <div className="sg-table-wrapper">
        <table className="sg-table">
          <thead className="sg-thead">
            <tr>
              <th className="sg-th">Sinh viên</th>
              <th className="sg-th">Môn học</th>
              <th className="sg-th">Kỳ</th>
              <th className="sg-th sg-th-center">Quá trình</th>
              <th className="sg-th sg-th-center">Cuối kỳ</th>
              <th className="sg-th sg-th-center">Tổng kết</th>
              <th className="sg-th sg-th-center">Xếp loại</th>
            </tr>
          </thead>
          <tbody>
            {grades.map((r) => {
              const sv = studentsById[r.sinhVienId];
              const m = monHocById[r.monHocId];
              const k = kiById[r.kiHocId];
              return (
                <tr key={r.id} className="sg-tr">
                  <td className="sg-td">
                    {sv?.tenSinhVien}{" "}
                    <span className="sg-sub">{sv?.maSinhVien}</span>
                  </td>
                  <td className="sg-td">
                    {m?.tenMonHoc}{" "}
                    <span className="sg-sub">{r.monHocId}</span>
                  </td>
                  <td className="sg-td">{k?.tenKiHoc || "-"}</td>
                  <td className="sg-td sg-td-center">{r.diemQuaTrinh}</td>
                  <td className="sg-td sg-td-center">{r.diemCuoiKy}</td>
                  <td className="sg-td sg-td-center sg-td-bold">{r.diemTongKet}</td>
                  <td className="sg-td sg-td-center">{r.xepLoai}</td>
                </tr>
              );
            })}
            {!grades.length && (
              <tr>
                <td className="sg-td sg-td-empty" colSpan={7}>
                  Chưa có dữ liệu điểm.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
