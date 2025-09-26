// TeacherSchedule.jsx - placeholder
import React, { useMemo } from "react";
import mockData from "../../mockData";
import "../../styles/teacher/teacherSchedule.css";

const dayNames = {
    1: "Thứ 2",
    2: "Thứ 3",
    3: "Thứ 4",
    4: "Thứ 5",
    5: "Thứ 6",
    6: "Thứ 7",
    7: "CN",
};

export default function TeacherSchedule() {
    const monHocById = useMemo(() => {
        const map = {};
        (mockData.entities.monHoc || []).forEach((m) => (map[m.maMonHoc] = m));
        return map;
    }, []);
    const phongById = useMemo(() => {
        const map = {};
        (mockData.entities.phongHoc || []).forEach((p) => (map[p.id] = p));
        return map;
    }, []);
    const gioById = useMemo(() => {
        const map = {};
        (mockData.entities.gioHoc || []).forEach((g) => (map[g.id] = g));
        return map;
    }, []);
    const buoiById = useMemo(() => {
        const map = {};
        (mockData.entities.buoiHoc || []).forEach((b) => (map[b.id] = b));
        return map;
    }, []);
    const kiById = useMemo(() => {
        const map = {};
        (mockData.entities.kiHoc || []).forEach((k) => (map[k.id] = k));
        return map;
    }, []);

    // Mock: chưa có mapping giảng viên ↔ lịch, hiển thị toàn bộ
    const lich = mockData.entities.lichHoc || [];

    return (
        <div className="ts-container">
            <h1 className="ts-title">Lịch dạy (mock)</h1>
            <div className="ts-wrapper">
                <table className="ts-table">
                    <thead className="ts-thead">
                        <tr>
                            <th className="ts-th">Môn học</th>
                            <th className="ts-th">Phòng</th>
                            <th className="ts-th">Buổi</th>
                            <th className="ts-th">Tiết / Giờ</th>
                            <th className="ts-th">Thứ</th>
                            <th className="ts-th">Kỳ</th>
                        </tr>
                    </thead>
                    <tbody>
                        {lich.map((l) => {
                            const m = monHocById[l.monHocId];
                            const p = phongById[l.phongHocId];
                            const g = gioById[l.gioHocId];
                            const b = buoiById[l.buoiHocId];
                            const k = kiById[l.kiHocId];
                            return (
                                <tr key={l.id} className="ts-tr">
                                    <td className="ts-td">
                                        {m?.tenMonHoc}{" "}
                                        <span className="ts-sub">({l.monHocId})</span>
                                    </td>
                                    <td className="ts-td">{p?.tenPhong || "-"}</td>
                                    <td className="ts-td">{b?.tenBuoi || "-"}</td>
                                    <td className="ts-td">
                                        {g
                                            ? `Tiết ${g.tietBatDau}-${g.tietKetThuc} (${g.gioBatDau}–${g.gioKetThuc})`
                                            : "-"}
                                    </td>
                                    <td className="ts-td">{dayNames[l.thuTrongTuan] || "-"}</td>
                                    <td className="ts-td">{k?.tenKiHoc || "-"}</td>
                                </tr>
                            );
                        })}
                        {!lich.length && (
                            <tr>
                                <td className="ts-empty" colSpan={6}>
                                    Chưa có lịch dạy.
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    );
}
