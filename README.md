1. Cài môi trường

Máy bạn cần có Node.js (khuyên dùng v18+ hoặc v20).
Kiểm tra:

node -v
npm -v


Nếu chưa có → tải Node.js LTS
.

2. Tạo & mở project

Nếu bạn đã có sẵn project folder (ví dụ university-management), mở Terminal tại thư mục đó.

Nếu chưa → tạo mới bằng Vite:

npm create vite@latest university-management
cd university-management
npm i -y
npm install


⚠️ Nếu bạn đã copy hết src/ như mình gửi, chỉ cần dán đè vào project thay cho src/ mặc định.

3. Cài dependency

Trong dự án hiện tại, bạn dùng:

React Router DOM (routing)

TailwindCSS (style)

Lucide React (icons)

Cài bằng:

npm install react react-dom react-router-dom lucide-react
npm install -D vite tailwindcss postcss autoprefixer


Nếu muốn Tailwind:

npm install -D tailwindcss postcss autoprefixer
npx tailwindcss init -p


Rồi chỉnh tailwind.config.js và import Tailwind trong index.css (cái này bạn đã làm từ đầu).

4. Chạy dự án
npm run dev


Mặc định Vite chạy ở http://localhost:5173
.
Bạn sẽ thấy:

/ → trang Home (hoặc PublicDashboard nếu bạn map router như thế).

/login, /register → form auth mock.

/student/... → mock pages sinh viên (nếu AuthContext.role = STUDENT).

/teacher/..., /accountant/..., /admin/... → các layout và page tương ứng.

5. Đổi role để test phân quyền

Trong file src/context/AuthContext.jsx, bạn có thể set mặc định:

const [role, setRole] = useState("ADMIN"); // hoặc "STUDENT", "TEACHER"


Sau đó chạy lại để test router bảo vệ.




LOi

Remove-Item -Recurse -Force node_modules
Remove-Item -Force package-lock.json
npm cache clean --force
npm install

