/* sw-mock.js */

const SW_VERSION = 'ums-mock-v2';

// Mock user DB đơn giản
const USERS = [
    {
        id: '00000000-0000-0000-0000-000000000001',
        username: 'admin',
        firstName: 'System',
        lastName: 'Admin',
        dob: '1990-01-01',
        roles: [{ name: 'ADMIN', description: 'Admin role', permissions: [] }]
    },
    {
        id: '00000000-0000-0000-0000-000000000003',
        username: 'staff.ttb',
        firstName: 'Tran',
        lastName: 'Thi B',
        dob: '1992-06-10',
        roles: [{ name: 'STAFF', description: 'Staff role', permissions: [] }]
    },
    {
        id: '00000000-0000-0000-0000-000000000002',
        username: 'sv.nguyenvana',
        firstName: 'Nguyen',
        lastName: 'Van A',
        dob: '2004-03-15',
        roles: [{ name: 'STUDENT', description: 'Student role', permissions: [] }]
    },
    {
        id: '00000000-0000-0000-0000-000000000004',
        username: 'sv.lethic',
        firstName: 'Le',
        lastName: 'Thi C',
        dob: '2004-11-20',
        roles: [{ name: 'STUDENT', description: 'Student role', permissions: [] }]
    }
];

function jsonResponse(obj, { status = 200 } = {}) {
    return new Response(JSON.stringify(obj), {
        status,
        headers: { 'Content-Type': 'application/json; charset=utf-8' }
    });
}

self.addEventListener('install', (e) => { self.skipWaiting(); });
self.addEventListener('activate', (e) => { e.waitUntil(clients.claim()); });

self.addEventListener('fetch', (event) => {
    const url = new URL(event.request.url);
    if (!url.pathname.startsWith('/api/')) return; // chỉ chặn /api/*

    event.respondWith((async () => {
        const method = event.request.method;
        const path = url.pathname.replace(/^\/api\/?/, '').toLowerCase();

        // ========== AUTH: /auth/login (dynamic - đọc body) ==========
        if (method === 'POST' && path === 'auth/login') {
            const bodyText = await event.request.clone().text().catch(() => '');
            let payload = {};
            try { payload = bodyText ? JSON.parse(bodyText) : {}; } catch { }
            const { username, password } = payload;

            // Rule mock: chỉ cần username trùng một user mock là cho login (hoặc bạn kiểm tra cặp user/pw)
            const user = USERS.find(u => u.username === username);
            if (!user) {
                return jsonResponse({ code: 401, message: 'Sai tài khoản hoặc mật khẩu', result: null }, { status: 401 });
            }
            // fake token chứa username để /auth/me suy ra người dùng
            const token = `mock-${user.username}`;

            return jsonResponse({
                code: 200,
                message: 'Authenticated (mock)',
                result: { authenticated: true, token }
            });
        }

        // ========== AUTH: /auth/introspect (kiểm tra token mock) ==========
        if (method === 'POST' && path === 'auth/introspect') {
            const bodyText = await event.request.clone().text().catch(() => '');
            let payload = {};
            try { payload = bodyText ? JSON.parse(bodyText) : {}; } catch { }
            const token = payload?.token || '';
            const valid = typeof token === 'string' && token.startsWith('mock-');
            return jsonResponse({ code: 200, message: 'Introspect (mock)', result: { valid } });
        }

        // ========== AUTH: /auth/me (trả về user + roles theo token) ==========
        if (method === 'GET' && path === 'auth/me') {
            const auth = event.request.headers.get('authorization') || '';
            const token = auth.startsWith('Bearer ') ? auth.slice(7) : '';
            const username = token.startsWith('mock-') ? token.substring(5) : null;
            const user = username ? USERS.find(u => u.username === username) : null;

            if (!user) {
                return jsonResponse({ code: 401, message: 'Token không hợp lệ', result: null }, { status: 401 });
            }
            return jsonResponse({ code: 200, message: 'Profile (mock)', result: user });
        }

        // ========== Các route tĩnh khác: đọc file trong /mock-json ==========
        // Map nhanh:
        const staticMap = {
            'get:users': '/mock-json/users_list.json',
            'get:roles': '/mock-json/roles_list.json',
            'get:permissions': '/mock-json/permissions_list.json',
            'get:nganh-hoc': '/mock-json/nganh_hocs.json',
            'get:mon-hoc': '/mock-json/mon_hocs.json',
            'get:lich-hoc': '/mock-json/lich_hocs.json',
            'get:sinh-vien': '/mock-json/sinh_viens.json',
            'get:hoc-phi': '/mock-json/hoc_phis.json',
            'get:ket-qua-hoc-tap': '/mock-json/ket_qua_hoc_tap.json',
        };
        const key = `${method.toLowerCase()}:${path}`;
        const mockPath = staticMap[key];

        if (!mockPath) {
            return jsonResponse({ code: 404, message: `Mock route not found for ${method} /api/${path}`, result: null }, { status: 404 });
        }

        const res = await fetch(mockPath, { cache: 'no-store' });
        const text = await res.text();
        if (!text) return jsonResponse({ code: 500, message: `Empty mock file: ${mockPath}`, result: null }, { status: 500 });

        let data;
        try { data = JSON.parse(text); } catch { return jsonResponse({ code: 500, message: `Invalid JSON in ${mockPath}`, result: null }, { status: 500 }); }

        const wrapped = (data && typeof data === 'object' && 'code' in data && 'result' in data)
            ? data
            : { code: 200, message: 'OK (mock)', result: data };

        return jsonResponse(wrapped, { status: res.ok ? 200 : res.status });
    })());
});
