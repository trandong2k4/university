import React, { useMemo } from "react";
import mockData from "../../mockData";
import "../../styles/schedule.css";

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
    <div className="schedule-container">
      <h1 className="schedule-title">Lịch học</h1>

      <div className="schedule-table-wrapper">
        <table className="schedule-table">
          <thead>
            <tr>
              <th>Môn học</th>
              <th>Phòng</th>
              <th>Buổi</th>
              <th>Tiết / Giờ</th>
              <th>Thứ</th>
              <th>Kỳ</th>
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
                <tr key={l.id}>
                  <td>{m?.tenMonHoc} <span className="schedule-subtext">({l.monHocId})</span></td>
                  <td>{p?.tenPhong || "-"}</td>
                  <td>{b?.tenBuoi || "-"}</td>
                  <td>{g ? `Tiết ${g.tietBatDau}-${g.tietKetThuc} (${g.gioBatDau}–${g.gioKetThuc})` : "-"}</td>
                  <td>{dayNames[l.thuTrongTuan] || "-"}</td>
                  <td>{k?.tenKiHoc || "-"}</td>
                </tr>
              );
            })}
            {!lich.length && (
              <tr>
                <td className="schedule-empty" colSpan={6}>Chưa có lịch học.</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
