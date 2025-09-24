// accountantApi.js - placeholder
// API mock cho Accountant
import mockData from "../mockData";
const delay = (ms = 400) => new Promise((r) => setTimeout(r, ms));

const db = mockData.entities || {};
const nextId = (arr) => (arr.length ? Math.max(...arr.map((x) => Number(x.id) || 0)) + 1 : 1);

export async function listAllTuition() {
    await delay();
    return { fees: db.hocPhi || [], students: db.sinhVien || [], kiHoc: db.kiHoc || [] };
}

export async function createTuition({ sinhVienId, kiHocId, soTien, ngayDong, trangThai }) {
    await delay(500);
    // mock: không ghi DB thật, chỉ trả object giả lập
    const newItem = {
        id: nextId(db.hocPhi || []),
        sinhVienId: Number(sinhVienId),
        kiHocId: Number(kiHocId),
        soTien: Number(soTien),
        ngayDong: ngayDong || null,
        trangThai: trangThai || "Chưa đóng",
    };
    return { ok: true, tuition: newItem };
}

export async function updateTuition(id, patch) {
    await delay(500);
    // mock: trả về object đã patch, không mutate
    const current = (db.hocPhi || []).find((x) => x.id === Number(id)) || { id: Number(id) };
    return { ok: true, tuition: { ...current, ...patch } };
}
