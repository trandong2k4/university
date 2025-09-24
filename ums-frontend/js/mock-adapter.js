import { STORAGE_KEYS } from './config.js';

async function load(path) {
    const res = await fetch(path);
    if (!res.ok) throw new Error(`Mock load fail: ${path}`);
    return res.json();
}

// cache nho nhỏ
let __users = null;
async function getUsers() {
    if (!__users) {
        const data = await load('/mocks/users.json');
        __users = data.users || data; // hỗ trợ cả {users:[...]} hoặc [...]
    }
    return __users;
}

function setToken(t) { localStorage.setItem(STORAGE_KEYS.TOKEN, t); }
function clearToken() {
    localStorage.removeItem(STORAGE_KEYS.TOKEN);
    localStorage.removeItem(STORAGE_KEYS.PROFILE);
}

export const MockAPI = {
    // /auth/login
    async login(username, password) {
        const users = await getUsers();
        const u = users.find(x => x.username === username);
        if (!u) throw new Error('User not found');
        // với mock: so plain text (demo). Thực tế phải so hash ở BE.
        if (u.password_plain && u.password_plain !== password) throw new Error('Wrong password');
        const fakeJwt = btoa(JSON.stringify({ sub: u.id, roles: u.roles || [] }));
        setToken(fakeJwt);
        return { accessToken: fakeJwt };
    },
    // /auth/me
    async me() {
        const token = localStorage.getItem(STORAGE_KEYS.TOKEN);
        if (!token) throw new Error('Unauthorized');
        const users = await getUsers();
        // đơn giản hoá: luôn trả user đầu tiên có token
        const payload = JSON.parse(atob(token));
        const u = users.find(x => x.id === payload.sub) || users[0];
        const profile = {
            id: u.id,
            username: u.username,
            fullName: u.fullName,
            roles: u.roles || ['STUDENT']
        };
        localStorage.setItem(STORAGE_KEYS.PROFILE, JSON.stringify(profile));
        return profile;
    },
    logout() { clearToken(); },

    // ví dụ các API khác
    async listUsers(q = '') {
        const users = await getUsers();
        if (!q) return { items: users, total: users.length };
        const s = q.toLowerCase();
        const filtered = users.filter(u =>
            [u.username, u.fullName, u.email].some(v => (v || '').toLowerCase().includes(s))
        );
        return { items: filtered, total: filtered.length };
    },

    async adminStats() {
        const users = await getUsers();
        const rolesCount = users.reduce((acc, u) => {
            (u.roles || ['STUDENT']).forEach(r => acc[r] = (acc[r] || 0) + 1);
            return acc;
        }, {});
        return {
            users: users.length,
            courses: 12,
            enrollments: 87,
            roles: rolesCount
        };
    }
};
