// studentApi.js - placeholder
// API mock cho Student
import mockData from "../mockData";
const delay = (ms = 400) => new Promise((r) => setTimeout(r, ms));

const db = mockData.entities || {};
const firstStudentId = () => db.sinhVien?.[0]?.id;

export async function getProfile(studentId = firstStudentId()) {
    await delay();
    const sv = (db.sinhVien || []).find((x) => x.id === studentId) || null;
    const detail = (db.chiTietSinhVien || []).find((x) => x.sinhVienId === studentId) || null;
    return { student: sv, detail };
}

export async function getCourses() {
    await delay();
    return { courses: db.monHoc || [] };
}

export async function getSchedule(studentId = firstStudentId()) {
    await delay();
    // mock chưa map theo sinh viên -> trả toàn bộ
    return {
        schedule: db.lichHoc || [],
        phongHoc: db.phongHoc || [],
        gioHoc: db.gioHoc || [],
        buoiHoc: db.buoiHoc || [],
        kiHoc: db.kiHoc || [],
        monHoc: db.monHoc || [],
    };
}

export async function getGrades(studentId = firstStudentId()) {
    await delay();
    const items = (db.ketQuaHocTap || []).filter((x) => x.sinhVienId === studentId);
    return { grades: items, monHoc: db.monHoc || [], kiHoc: db.kiHoc || [] };
}

export async function getTuition(studentId = firstStudentId()) {
    await delay();
    const fees = (db.hocPhi || []).filter((x) => x.sinhVienId === studentId);
    return { fees, kiHoc: db.kiHoc || [] };
}

// Các thao tác đăng ký/hủy tín chỉ chỉ alert/mock, không mutate DB
export async function registerCredit(creditId) {
    await delay(300);
    const tc = (db.tinChi || []).find((x) => x.id === Number(creditId));
    return { ok: true, credit: tc || null };
}

export async function cancelCredit(creditId) {
    await delay(300);
    const tc = (db.tinChi || []).find((x) => x.id === Number(creditId));
    return { ok: true, credit: tc || null };
}
