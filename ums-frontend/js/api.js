// Sửa js/api.js để chuyển sang mock khi USE_MOCK = true
import { USE_MOCK, BASE_API, STORAGE_KEYS } from './config.js';

function getToken() { return localStorage.getItem(STORAGE_KEYS.TOKEN); }
function setToken(t) { localStorage.setItem(STORAGE_KEYS.TOKEN, t); }
function clearToken() { localStorage.removeItem(STORAGE_KEYS.TOKEN); localStorage.removeItem(STORAGE_KEYS.PROFILE); }

const mockMap = {
    // Auth
    'POST /auth/login': '/mocks/auth_login_response.json',
    'GET  /auth/introspect': '/mocks/auth_introspect_response.json',
    'POST /auth/refresh': '/mocks/auth_refresh_response.json',

    // Dữ liệu học tập
    'GET  /hoc-phis': '/mocks/hoc_phis.json',
    'GET  /ket-qua-hoc-tap': '/mocks/ket_qua_hoc_tap.json',
    'GET  /lich-hocs': '/mocks/lich_hocs.json',
    'GET  /mon-hocs': '/mocks/mon_hocs.json',
    'GET  /nganh-hocs': '/mocks/nganh_hocs.json',

    // RBAC
    'GET  /users': '/mocks/users_list.json',
    'GET  /roles': '/mocks/roles_list.json',
    'GET  /permissions': '/mocks/permissions_list.json',

    // Ví dụ student self
    'GET  /sinh-viens/me': '/mocks/sinh_viens.json',
};

function matchMock(method, path) {
    // bỏ query ?q=... nếu có
    const p = path.split('?')[0];
    const key = `${method.toUpperCase().padStart(4, ' ')} ${p}`;
    return mockMap[key];
}

async function apiMock(path, { method = 'GET', body } = {}) {
    const url = matchMock(method, path);
    if (!url) throw new Error(`Mock not found for: ${method} ${path}`);

    // mô phỏng độ trễ nhẹ
    await new Promise(r => setTimeout(r, 250));

    const res = await fetch(url);
    if (!res.ok) throw new Error(`Cannot load mock ${url}`);
    const data = await res.json();

    // mô phỏng login: lưu token nếu file trả có accessToken
    if (path === '/auth/login' && method === 'POST' && data.accessToken) {
        setToken(data.accessToken);
    }
    return data;
}

export async function api(path, { method = 'GET', body, headers = {} } = {}) {
    if (USE_MOCK) {
        return apiMock(path, { method, body, headers });
    }

    // gọi BE thật
    const h = { 'Content-Type': 'application/json', ...headers };
    const token = getToken();
    if (token) h['Authorization'] = `Bearer ${token}`;

    const res = await fetch(`${BASE_API}${path}`, {
        method, headers: h, body: body ? JSON.stringify(body) : undefined
    });

    if (res.status === 401) { clearToken(); location.href = '/login.html'; return; }
    if (!res.ok) {
        let msg = ''; try { const d = await res.json(); msg = d.message || d.error; } catch { }
        throw new Error(msg || res.statusText);
    }
    return res.status === 204 ? null : res.json();
}

// Expose sẵn vài API hay dùng
export const AuthAPI = {
    login: (u, p) => api('/auth/login', { method: 'POST', body: { username: u, password: p } }),
    introspect: () => api('/auth/introspect'),
    refresh: () => api('/auth/refresh', { method: 'POST' }),
};
export const CatalogAPI = {
    monHocs: () => api('/mon-hocs'),
    nganhHocs: () => api('/nganh-hocs'),
};
export const RBACAPI = {
    users: () => api('/users'),
    roles: () => api('/roles'),
    permissions: () => api('/permissions'),
};
export { getToken, setToken, clearToken };

// Code gốc, chưa mock
/*
import { BASE_API, STORAGE_KEYS } from './config.js';

function getToken() { return localStorage.getItem(STORAGE_KEYS.TOKEN); }
function setToken(t) { localStorage.setItem(STORAGE_KEYS.TOKEN, t); }
function clearToken() {
    localStorage.removeItem(STORAGE_KEYS.TOKEN);
    localStorage.removeItem(STORAGE_KEYS.PROFILE);
}

export async function api(path, { method = 'GET', body, headers = {} } = {}) {
    const h = { 'Content-Type': 'application/json', ...headers };
    const token = getToken();
    if (token) h['Authorization'] = `Bearer ${token}`;

    const res = await fetch(`${BASE_API}${path}`, {
        method,
        headers: h,
        body: body ? JSON.stringify(body) : undefined,
    });

    // token hết hạn
    if (res.status === 401) { clearToken(); location.href = '/login.html'; return; }

    if (!res.ok) {
        const msg = await safeMsg(res);
        throw new Error(msg || res.statusText);
    }
    return res.status === 204 ? null : res.json();
}

async function safeMsg(res) {
    try { const d = await res.json(); return d.message || d.error || ''; }
    catch { return ''; }
}

// public API
export const AuthAPI = {
    login: (username, password) => api('/auth/login', { method: 'POST', body: { username, password } }),
    me: () => api('/auth/me'),
    logout: () => { clearToken(); },
};

export const UserAPI = {
    list: (q = '') => api(`/users?search=${encodeURIComponent(q)}`),
    create: (data) => api('/users', { method: 'POST', body: data }),
};
export { getToken, setToken, clearToken };
*/