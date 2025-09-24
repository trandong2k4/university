// /js/auth.js
const API_BASE = '/api';
const TOKEN_KEY = 'token';
const USER_KEY = 'currentUser';

export function getToken() { return localStorage.getItem(TOKEN_KEY); }
export function setToken(t) { localStorage.setItem(TOKEN_KEY, t); }
export function clearToken() { localStorage.removeItem(TOKEN_KEY); localStorage.removeItem(USER_KEY); }
export function getCurrentUser() { try { return JSON.parse(localStorage.getItem(USER_KEY) || 'null'); } catch { return null; } }
export function setCurrentUser(u) { localStorage.setItem(USER_KEY, JSON.stringify(u)); }

export function mapRoleToHome(roleName) {
    switch (roleName) {
        case 'ADMIN': return '/pages/admin/dashboard.html';
        case 'STAFF': return '/pages/staff/dashboard.html';
        case 'STUDENT': return '/pages/student/dashboard.html';
        default: return '/index.html';
    }
}

async function safeFetchJson(url, options = {}) {
    const headers = { 'Content-Type': 'application/json', ...(options.headers || {}) };
    const res = await fetch(url, { ...options, headers });
    const text = await res.text();
    let data = null;
    if (text) { try { data = JSON.parse(text); } catch { throw new Error(`Phản hồi không phải JSON hợp lệ: ${text.slice(0, 120)}...`); } }
    if (!res.ok) throw new Error(data?.message || res.statusText || `HTTP ${res.status}`);
    return data;
}

export async function handleLogin(formEl) {
    const username = formEl.querySelector('#username')?.value?.trim();
    const password = formEl.querySelector('#password')?.value || '';
    if (!username || !password) throw new Error('Vui lòng nhập đầy đủ thông tin');

    // 1) Login -> nhận token mock
    const loginRes = await safeFetchJson(`${API_BASE}/auth/login`, {
        method: 'POST',
        body: JSON.stringify({ username, password })
    });
    const token = loginRes?.result?.token;
    if (!token) throw new Error('Thiếu token trong phản hồi');

    setToken(token);

    // 2) Lấy profile để biết role
    const me = await safeFetchJson(`${API_BASE}/auth/me`, {
        method: 'GET',
        headers: { Authorization: `Bearer ${token}` }
    });
    const user = me?.result;
    if (!user) throw new Error('Không lấy được thông tin người dùng');
    setCurrentUser(user);

    // 3) redirect theo role đầu tiên
    const role = user?.roles?.[0]?.name || 'STUDENT';
    const dest = mapRoleToHome(role);
    // replace để tránh back quay lại login
    location.replace(dest);
}

export async function requireAuth() {
    if (window.__waitForSW) await window.__waitForSW(3000);

    const token = getToken();
    if (!token) { location.replace('/login.html'); return false; }

    try {
        const res = await safeFetchJson(`${API_BASE}/auth/introspect`, {
            method: 'POST',
            body: JSON.stringify({ token })
        });
        if (!res?.result?.valid) throw new Error('Token invalid');

        // đảm bảo có user trong localStorage, nếu chưa thì gọi /auth/me
        let user = getCurrentUser();
        if (!user) {
            const me = await safeFetchJson(`${API_BASE}/auth/me`, {
                method: 'GET',
                headers: { Authorization: `Bearer ${token}` }
            });
            user = me?.result;
            if (user) setCurrentUser(user);
        }
        return true;
    } catch (e) {
        clearToken();
        location.replace('/login.html');
        return false;
    }
}
