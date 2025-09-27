
node js
git

npm install
npm run dev


Ban do
npm install @react-google-maps/api
import { GoogleMap, LoadScript, Marker } from '@react-google-maps/api';

Lich
- React Big Calendar (react-big-calendar)
- Hiển thị dạng tháng, tuần, ngày.
- Bạn chỉ cần truyền vào danh sách sự kiện (events) với start và end.
- Hỗ trợ kéo thả, đổi lịch, style riêng.
npm install react-big-calendar date-fns
import { Calendar, dateFnsLocalizer } from 'react-big-calendar'
import { format, parse, startOfWeek, getDay } from 'date-fns'
import vi from 'date-fns/locale/vi'

const locales = { 'vi': vi }
const localizer = dateFnsLocalizer({ format, parse, startOfWeek, getDay, locales })
const events = [
  {
    title: 'Toán cao cấp',
    start: new Date(2025, 8, 29, 8, 0),  // 29/9/2025 8:00
    end: new Date(2025, 8, 29, 9, 30),
  },
  {
    title: 'Lập trình React',
    start: new Date(2025, 8, 30, 13, 0),
    end: new Date(2025, 8, 30, 15, 0),
  },
]
 <Calendar
        localizer={localizer}
        events={events}
        startAccessor="start"
        endAccessor="end"
        style={{ height: 500 }}
      />


