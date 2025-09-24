import { ROLES } from './roles.js';
import { getToken } from './api.js';

export function authGuard() {
    if (!getToken()) { location.href = '/login.html'; return false; }
    return true;
}

export function roleGuard(allowed = []) {
    const raw = localStorage.getItem('lh_profile');
    if (!raw) { location.href = '/login.html'; return false; }
    const me = JSON.parse(raw);
    const userRoles = me?.roles || [];
    const ok = userRoles.some(r => allowed.includes(r));
    if (!ok) { location.href = '/403.html'; return false; }
    return true;
}

// ví dụ dùng trong dashboard ADMIN:
// if (authGuard() && roleGuard(['ADMIN'])) { ...render... }
