import React, { useEffect, useMemo, useState } from "react";
import { Calendar, dateFnsLocalizer } from "react-big-calendar";
import format from "date-fns/format";
import parse from "date-fns/parse";
import startOfWeek from "date-fns/startOfWeek";
import getDay from "date-fns/getDay";
import isWithinInterval from "date-fns/isWithinInterval";
import viLocale from "date-fns/locale/vi";
import "react-big-calendar/lib/css/react-big-calendar.css";
import "../../styles/student/schedule.css";

import { useAuth } from "../../context/AuthContext";
import apiClient from "../../api/apiClient";
import ScheduleModal from "./ScheduleModal";

/* ================= Localizer ================= */
const localizer = dateFnsLocalizer({
  format,
  parse,
  startOfWeek: () => startOfWeek(new Date(), { weekStartsOn: 1 }),
  getDay,
  locales: { vi: viLocale },
});

/* ================= Màu theo môn ================= */
const COLOR_PALETTE = [
  "#2563eb", "#16a34a", "#dc2626",
  "#9333ea", "#ea580c", "#0891b2"
];

const subjectColorMap = {};
const getSubjectColor = (subject) => {
  if (!subjectColorMap[subject]) {
    subjectColorMap[subject] =
      COLOR_PALETTE[Object.keys(subjectColorMap).length % COLOR_PALETTE.length];
  }
  return subjectColorMap[subject];
};

export default function Schedule() {
  const { user } = useAuth();
  const userId = user?.id;

  const [scheduleData, setScheduleData] = useState([]);
  const [selectedEvent, setSelectedEvent] = useState(null);

  /* ================= Fetch ================= */
  useEffect(() => {
    if (!userId) return;

    const fetchSchedule = async () => {
      const studentRes = await apiClient.get(`/students/by-user/${userId}`);
      const studentId = studentRes.data.id;

      const scheduleRes = await apiClient.get(`/schedules/student/${studentId}`);
      setScheduleData(scheduleRes.data || []);
    };

    fetchSchedule();
  }, [userId]);

  /* ================= Events ================= */
  const events = useMemo(() => {
    return scheduleData.map(item => {
      const [y, m, d] = item.ngayHoc.split("-").map(Number);
      const [sh, sm] = item.gioBatDau.split(":").slice(0, 2).map(Number);
      const [eh, em] = item.gioKetThuc.split(":").slice(0, 2).map(Number);

      return {
        title: `${item.tenMonHoc}`,
        start: new Date(y, m - 1, d, sh, sm),
        end: new Date(y, m - 1, d, eh, em),
        resource: item
      };
    });
  }, [scheduleData]);

  /* ================= Style event ================= */
  const eventStyleGetter = (event) => {
    const now = new Date();
    const isOngoing = isWithinInterval(now, {
      start: event.start,
      end: event.end,
    });

    return {
      style: {
        backgroundColor: getSubjectColor(event.resource.tenMonHoc),
        opacity: isOngoing ? 1 : 0.85,
        border: isOngoing ? "3px solid #facc15" : "none",
        color: "white",
        borderRadius: "8px",
        padding: "6px",
        whiteSpace: "pre-line",
      },
    };
  };

  return (
    <div className="schedule-container">
      <h1 className="schedule-title">📅 Lịch học cá nhân</h1>

      <Calendar
        localizer={localizer}
        events={events}
        startAccessor="start"
        endAccessor="end"
        defaultView="week"
        views={["month", "week", "day", "agenda"]}
        style={{ height: 700 }}
        min={new Date(2020, 0, 1, 7, 0)}
        max={new Date(2020, 0, 1, 21, 0)}
        eventPropGetter={eventStyleGetter}
        tooltipAccessor={(event) =>
          `${event.resource.tenMonHoc}
${event.resource.maLopHocPhan}
Phòng: ${event.resource.tenPhong}
GV: ${event.resource.tenGiangVien}`
        }
        onSelectEvent={(event) => setSelectedEvent(event)}
        messages={{
          today: "Hôm nay",
          previous: "‹ Trước",
          next: "Sau ›",
          month: "Tháng",
          week: "Tuần",
          day: "Ngày",
          agenda: "Danh sách",
        }}
      />

      {/* ===== Modal ===== */}
      {selectedEvent && (
        <ScheduleModal
          event={selectedEvent}
          onClose={() => setSelectedEvent(null)}
        />
      )}
    </div>
  );
}
