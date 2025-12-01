// src/components/student/Schedule.jsx
import React, { useState, useEffect, useMemo } from "react";
import { Calendar, dateFnsLocalizer } from 'react-big-calendar';
import format from 'date-fns/format';
import parse from 'date-fns/parse';
import startOfWeek from 'date-fns/startOfWeek';
import getDay from 'date-fns/getDay';
import viLocale from 'date-fns/locale/vi';
import 'react-big-calendar/lib/css/react-big-calendar.css';
import '../../styles/student/schedule.css'; // Đã tách riêng
import { useAuth } from "../../context/AuthContext";
import apiClient from '../../api/apiClient';

const localizer = dateFnsLocalizer({
  format,
  parse,
  startOfWeek,
  getDay,
  locales: { 'vi': viLocale },
});

export default function Schedule() {
  const { user } = useAuth();
  const userId = user?.id;

  const [scheduleData, setScheduleData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!userId) {
      setLoading(false);
      setError("Vui lòng đăng nhập để xem lịch học.");
      return;
    }

    const fetchSchedule = async () => {
      try {
        setLoading(true);
        const studentRes = await apiClient.get(`/students/by-user/${userId}`);
        const studentId = studentRes.data?.id;
        if (!studentId) throw new Error("Không tìm thấy sinh viên.");

        const scheduleRes = await apiClient.get(`/schedules/student/${studentId}`);
        setScheduleData(scheduleRes.data || []);
      } catch (err) {
        setError("Không thể tải lịch học. Vui lòng thử lại.");
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchSchedule();
  }, [userId]);

  const events = useMemo(() => {
    if (!scheduleData.length) return [];

    return scheduleData.map(item => {
      const [y, m, d] = item.ngayHoc.split('-').map(Number);
      const [sh, sm] = item.gioBatDau.split(':').map(Number);
      const [eh, em] = item.gioKetThuc.split(':').map(Number);

      return {
        title: `${item.maLopHocPhan} - ${item.tenMonHoc}\nPhòng: ${item.tenPhong} (${item.toaNha || 'N/A'})`,
        start: new Date(y, m - 1, d, sh, sm),
        end: new Date(y, m - 1, d, eh, em),
        resource: item,
      };
    });
  }, [scheduleData]);

  if (loading) return <div className="schedule-container schedule-loading">Đang tải lịch học...</div>;
  if (error) return <div className="schedule-container schedule-error">{error}</div>;
  if (events.length === 0) return <div className="schedule-container schedule-empty">Chưa có lịch học trong học kỳ này</div>;

  return (
    <div className="schedule-container">
      <h1 className="schedule-title">Lịch học cá nhân</h1>

      <div className="rbc-calendar-wrapper">
        <Calendar
          localizer={localizer}
          events={events}
          startAccessor="start"
          endAccessor="end"
          style={{ height: 700 }}
          defaultView="week"
          views={['month', 'week', 'day', 'agenda']}
          min={new Date(2020, 0, 1, 7, 0)}
          max={new Date(2020, 0, 1, 21, 0)}
          messages={{
            today: "Hôm nay",
            previous: "‹ Trước",
            next: "Sau ›",
            month: "Tháng",
            week: "Tuần",
            day: "Ngày",
            agenda: "Danh sách",
            noEventsInRange: "Không có lịch học trong khoảng này",
            showMore: total => `+ ${total} sự kiện nữa`
          }}
          eventPropGetter={() => ({
            style: { whiteSpace: 'pre-wrap' }
          })}
        />
      </div>

      <div className="schedule-footer">
        Múi giờ Việt Nam (GMT+7) • Dữ liệu được cập nhật tự động
      </div>
    </div>
  );
}