// Schedule.jsx - placeholder
import React, { useMemo } from "react";
import mockData from "../../mockData";

const dayNames = { 1: "Thứ 2", 2: "Thứ 3", 3: "Thứ 4", 4: "Thứ 5", 5: "Thứ 6", 6: "Thứ 7", 7: "CN" };

export default function Schedule() {
  const monHocById = useMemo(() => {
    const map = {};
    (mockData.entities.monHoc || []).forEach(m => (map[m.maMonHoc] = m));
    return map;
  }, []);
  const phongById = useMemo(() => {
    const map = {};
    (mockData.entities.phongHoc || []).forEach(p => (map[p.id] = p));
    return map;
  }, []);
  const gioById = useMemo(() => {
    const map = {};
    (mockData.entities.gioHoc || []).forEach(g => (map[g.id] = g));
    return map;
  }, []);
  const buoiById = useMemo(() => {
    const map = {};
    (mockData.entities.buoiHoc || []).forEach(b => (map[b.id] = b));
    return map;
  }, []);
  const kiById = useMemo(() => {
    const map = {};
    (mockData.entities.kiHoc || []).forEach(k => (map[k.id] = k));
    return map;
  }, []);

  const lich = mockData.entities.lichHoc || [];

  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-bold">Lịch học</h1>
      <div className="overflow-x-auto bg-white rounded-xl border">
        <table className="min-w-[720px] w-full text-sm">
          <thead className="bg-gray-50 text-gray-600">
            <tr>
              <th className="p-3 text-left">Môn học</th>
              <th className="p-3 text-left">Phòng</th>
              <th className="p-3 text-left">Buổi</th>
              <th className="p-3 text-left">Tiết / Giờ</th>
              <th className="p-3 text-left">Thứ</th>
              <th className="p-3 text-left">Kỳ</th>
            </tr>
          </thead>
          <tbody>
            {lich.map(l => {
              const m = monHocById[l.monHocId];
              const p = phongById[l.phongHocId];
              const g = gioById[l.gioHocId];
              const b = buoiById[l.buoiHocId];
              const k = kiById[l.kiHocId];
              return (
                <tr key={l.id} className="border-t">
                  <td className="p-3">{m?.tenMonHoc} <span className="text-xs text-gray-500">({l.monHocId})</span></td>
                  <td className="p-3">{p?.tenPhong || "-"}</td>
                  <td className="p-3">{b?.tenBuoi || "-"}</td>
                  <td className="p-3">
                    {g ? `Tiết ${g.tietBatDau}-${g.tietKetThuc} (${g.gioBatDau}–${g.gioKetThuc})` : "-"}
                  </td>
                  <td className="p-3">{dayNames[l.thuTrongTuan] || "-"}</td>
                  <td className="p-3">{k?.tenKiHoc || "-"}</td>
                </tr>
              );
            })}
            {!lich.length && (
              <tr><td className="p-3 text-gray-500" colSpan={6}>Chưa có lịch học.</td></tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
