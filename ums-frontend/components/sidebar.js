import { ROLES } from '../js/roles.js';

class AppSidebar extends HTMLElement {
    connectedCallback() {
        const role = this.getAttribute('role');
        let items = [];

        if (role === ROLES.ADMIN) {
            items = [
                { href: '/pages/admin/dashboard.html', label: 'Overview' },
                { href: '/pages/admin/users.html', label: 'Users' },
                { href: '/pages/admin/reports.html', label: 'Reports' },
            ];
        } else if (role === ROLES.LECTURER) {
            items = [
                { href: '/pages/lecturer/dashboard.html', label: 'Overview' },
                { href: '/pages/lecturer/my-courses.html', label: 'My Courses' },
                { href: '/pages/lecturer/gradebook.html', label: 'Gradebook' },
            ];
        } else {
            items = [
                { href: '/pages/student/dashboard.html', label: 'Overview' },
                { href: '/pages/student/enrollments.html', label: 'Enrollments' },
                { href: '/pages/student/transcripts.html', label: 'Transcripts' },
            ];
        }

        this.innerHTML = `
      <aside class="sidebar">
        <ul>
          ${items.map(i => `<li><a href="${i.href}">${i.label}</a></li>`).join('')}
        </ul>
      </aside>
    `;
    }
}
customElements.define('app-sidebar', AppSidebar);
