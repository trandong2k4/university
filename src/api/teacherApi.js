// teacherApi.js - placeholder
// API mock cho Teacher
import mockData from "../mockData";
const delay = (ms = 400) => new Promise((r) => setTimeout(r, ms));

const db = mockData.entities || {};

export async function listStudents() {
    await delay();
    const students = db.sinhVien || [];
    const details = db.chiTietSinhVien || [];
    return { students, details };
}

export async function listTeacherCourses(/* teacherId */) {
    await delay();
    // mock: trả toàn bộ môn học
    return { courses: db.monHoc || [] };
}

export async function getTeacherSchedule(/* teacherId */) {
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

export async function getStudentGrades() {
    await delay();
    return {
        grades: db.ketQuaHocTap || [],
        students: db.sinhVien || [],
        monHoc: db.monHoc || [],
        kiHoc: db.kiHoc || [],
    };
}

// Mock cập nhật điểm: không mutate dữ liệu gốc, chỉ trả về patch
export async function updateGrades(patches = []) {
    await delay(500);
    // patches: [{id, diemQuaTrinh, diemCuoiKy, diemTongKet, xepLoai}, ...]
    const applied = patches.map((p) => ({ ...p }));
    return { ok: true, updated: applied };
}
