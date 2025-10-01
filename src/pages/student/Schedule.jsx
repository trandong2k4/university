import React, { useMemo } from "react";
import mockData from "../../mockData";
import "../../styles/student/schedule.css";
import { Calendar, dateFnsLocalizer } from 'react-big-calendar'
import { format, parse, startOfWeek, getDay } from 'date-fns'
import vi from 'date-fns/locale/vi'
import 'react-big-calendar/lib/css/react-big-calendar.css'


export default function Schedule() {

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
      <div className="">
        <Calendar
          localizer={localizer}
          events={events}
          startAccessor="start"
          endAccessor="end"
          style={{ height: 550 }}
          min={new Date(2025, 8, 29, 7, 0)}   // Giờ bắt đầu (7h sáng)
          max={new Date(2025, 8, 29, 22, 0)}  // Giờ kết thúc (21h tối)
          step={30} // Mỗi ô 30 phút (có thể chỉnh 15/60 tùy ý)
          timeslots={2} // Chia nhỏ trong 1h (vd: 2 = 30 phút)
          defaultView="week" // mặc định hiển thị theo tuần (có thể là "day", "month")
        />
      </div>
    </div>
  );
}
