import React, { useMemo } from "react";
import mockData from "../../mockData";
import "../../styles/student/schedule.css";
import { Calendar, dateFnsLocalizer } from 'react-big-calendar'
import { format, parse, startOfWeek, getDay } from 'date-fns'
import vi from 'date-fns/locale/vi'
import 'react-big-calendar/lib/css/react-big-calendar.css'


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
  // Lich import
  const locales = { 'vi': vi }
  const localizer = dateFnsLocalizer({ format, parse, startOfWeek, getDay, locales })
  const events = [
    {
      title: 'ACC 102 Toán cao cấp A1',
      start: new Date(2025, 8, 29, 8, 0),  // 29/9/2025 8:00
      end: new Date(2025, 8, 29, 9, 30),
    },
    {
      title: ' CS502 Lập trình React ',
      start: new Date(2025, 8, 30, 13, 0),
      end: new Date(2025, 8, 30, 15, 0),
    },
  ]

  return (
    <div className="schedule-container">
      <h1 className="schedule-title">Lịch học</h1>

      {/* <div className="schedule-table-wrapper">
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

      </div> */}
      <div className="">
        <Calendar
          localizer={localizer}
          events={events}
          startAccessor="start"
          endAccessor="end"
          style={{ height: 500 }}
        />
      </div>
    </div>
  );
}
