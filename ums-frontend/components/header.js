import { ROLES } from '../js/roles.js';

class AppHeader extends HTMLElement {
  connectedCallback() {
    const profile = JSON.parse(localStorage.getItem('lh_profile') || '{}');
    const role = (profile.roles && profile.roles[0]) || null;

    let navContent = "";

    if (!role) {
      // Header public (chưa login)
      navContent = `
        <a href="index.html">Trang chủ</a>
        <a href="/pages/public/about.html">Về chúng tôi</a>
        <a href="/pages/public/services.html">Dịch vụ</a>
        <a href="/pages/public/contact.html">Liên hệ</a>
        <a href="login.html" class="btn">Đăng nhập</a>
      `;
    } else if (role === ROLES.ADMIN) {
      navContent = `
        <a href="/pages/admin/dashboard.html">Dashboard</a>
        <a href="/pages/admin/users.html">Quản lý người dùng</a>
        <a id="logout-link" href="#">Đăng xuất</a>
      `;
    } else if (role === ROLES.LECTURER) {
      navContent = `
        <a href="/pages/lecturer/dashboard.html">Dashboard</a>
        <a href="/pages/lecturer/courses.html">Khoá học của tôi</a>
        <a id="logout-link" href="#">Đăng xuất</a>
      `;
    } else if (role === ROLES.STUDENT) {
      navContent = `
        <a href="/pages/student/dashboard.html">Dashboard</a>
        <a href="/pages/student/mycourses.html">Khoá học đã đăng ký</a>
        <a id="logout-link" href="#">Đăng xuất</a>
      `;
    }

    this.innerHTML = `
      <style>
        header {
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 15px 40px;
          background-color: #4f60f1ff;
          color: white;
          position: sticky;
          top: 0;
          z-index: 1000;
        }

        .brand {
          font-size: 22px;
          font-weight: bold;
          text-decoration: none;
          color: #fff;
        }
          
        nav {
          position: absolute;
          left: 50%;
          transform: translateX(-50%);
          display: flex;
          gap: 20px;
        }
        nav a {
          text-decoration: none;
          color: #fff;
          font-size: 16px;
          transition: color 0.3s;
        }
        nav a:hover {
          color: #61ec45ff;
        }
        nav a.btn {
          background: #249deeff;
          padding-left: 20px;
          color: #f7f7f7ff;
          padding: 6px 14px;
          border-radius: 6px;
          font-weight: bold;
        }
        nav a.btn:hover {
          background: #1eff00ff;
          color: #000;
        }
      </style>
      <header class="container header">
        <a href="/index.html" class="brand">Learning Hub</a>
        <nav>${navContent}</nav>
      </header>
    `;

    const logout = this.querySelector('#logout-link');
    if (logout) {
      logout.addEventListener('click', (e) => {
        e.preventDefault();
        localStorage.clear();
        location.href = '/index.html';
      });
    }
  }
}

customElements.define('app-header', AppHeader);
export { AppHeader };