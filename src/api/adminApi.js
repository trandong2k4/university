// adminApi.js - placeholder
// API mock cho Admin (CRUD các domain chính)
import mockData from "../mockData";
const delay = (ms = 400) => new Promise((r) => setTimeout(r, ms));
const db = mockData.entities || {};
const nextId = (arr) => (arr.length ? Math.max(...arr.map((x) => Number(x.id) || 0)) + 1 : 1);

// ----- Students -----
export async function listStudents() {
    await delay();
    return { students: db.sinhVien || [] };
}
export async function createStudent(payload) {
    await delay(500);
    return { ok: true, student: { id: nextId(db.sinhVien || []), ...payload } };
}
export async function updateStudent(id, patch) {
    await delay(500);
    const current = (db.sinhVien || []).find((x) => x.id === Number(id)) || { id: Number(id) };
    return { ok: true, student: { ...current, ...patch } };
}
export async function deleteStudent(id) {
    await delay(300);
    return { ok: true, id: Number(id) };
}

// ----- Courses -----
export async function listCourses() {
    await delay();
    return { courses: db.monHoc || [] };
}
export async function createCourse(payload) {
    await delay(500);
    // nếu payload có maMonHoc tự sinh bên UI; ở đây chỉ trả về mô phỏng
    return { ok: true, course: { ...payload } };
}
export async function updateCourse(code, patch) {
    await delay(500);
    const current = (db.monHoc || []).find((x) => x.maMonHoc === code) || { maMonHoc: code };
    return { ok: true, course: { ...current, ...patch } };
}
export async function deleteCourse(code) {
    await delay(300);
    return { ok: true, maMonHoc: String(code) };
}

// ----- Schedule -----
export async function listSchedule() {
    await delay();
    return {
        schedule: db.lichHoc || [],
        phongHoc: db.phongHoc || [],
        gioHoc: db.gioHoc || [],
        buoiHoc: db.buoiHoc || [],
        kiHoc: db.kiHoc || [],
        monHoc: db.monHoc || [],
    };
}
export async function createSchedule(payload) {
    await delay(500);
    return { ok: true, schedule: { id: nextId(db.lichHoc || []), ...payload } };
}
export async function updateSchedule(id, patch) {
    await delay(500);
    const current = (db.lichHoc || []).find((x) => x.id === Number(id)) || { id: Number(id) };
    return { ok: true, schedule: { ...current, ...patch } };
}
export async function deleteSchedule(id) {
    await delay(300);
    return { ok: true, id: Number(id) };
}

// ----- Grades -----
export async function listGrades() {
    await delay();
    return { grades: db.ketQuaHocTap || [] };
}
export async function updateGrade(id, patch) {
    await delay(400);
    const current = (db.ketQuaHocTap || []).find((x) => x.id === Number(id)) || { id: Number(id) };
    return { ok: true, grade: { ...current, ...patch } };
}
export async function deleteGrade(id) {
    await delay(300);
    return { ok: true, id: Number(id) };
}

// ----- Tuition (reuse accountant logic) -----
export async function listTuition() {
    await delay();
    return { fees: db.hocPhi || [] };
}
export async function createTuition(payload) {
    await delay(500);
    return { ok: true, tuition: { id: nextId(db.hocPhi || []), ...payload } };
}
export async function updateTuition(id, patch) {
    await delay(400);
    const current = (db.hocPhi || []).find((x) => x.id === Number(id)) || { id: Number(id) };
    return { ok: true, tuition: { ...current, ...patch } };
}
export async function deleteTuition(id) {
    await delay(300);
    return { ok: true, id: Number(id) };
}

// ----- Credits -----
export async function listCredits() {
    await delay();
    return { credits: db.tinChi || [] };
}
export async function createCredit(payload) {
    await delay(500);
    return { ok: true, credit: { id: nextId(db.tinChi || []), ...payload } };
}
export async function updateCredit(id, patch) {
    await delay(400);
    const current = (db.tinChi || []).find((x) => x.id === Number(id)) || { id: Number(id) };
    return { ok: true, credit: { ...current, ...patch } };
}
export async function deleteCredit(id) {
    await delay(300);
    return { ok: true, id: Number(id) };
}
