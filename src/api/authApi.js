// authApi.js - placeholder
// Giả lập Auth API
import mockData from "../mockData";

const delay = (ms = 500) => new Promise((r) => setTimeout(r, ms));
const normalizeRole = (r) => (r ? String(r).trim().toUpperCase() : null);

const defaultUser = { name: "Nguyen Van A", role: "STUDENT" };

export async function login({ name, role } = {}) {
    await delay();
    const user = {
        name: name || defaultUser.name,
        role: normalizeRole(role) || defaultUser.role,
    };
    // token mock (không dùng thật)
    return { user, token: "mock-token" };
}

export async function logout() {
    await delay(200);
    return { ok: true };
}

export async function me() {
    await delay(200);
    // luôn trả về user mock (tuỳ bạn tích hợp LocalStorage phía UI)
    return { user: defaultUser };
}
