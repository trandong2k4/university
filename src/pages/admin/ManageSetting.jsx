import React, { useState } from "react";
import mockData from "../../mockData";
import "../../styles/admin/manageSetting.css";

export default function Settings() {
    const kiHoc = mockData.entities.kiHoc;
    const phongHoc = mockData.entities.phongHoc;
    const gioHoc = mockData.entities.gioHoc;
    const buoiHoc = mockData.entities.buoiHoc;
    const lichHoc = mockData.entities.lichHoc;
    const invalidatedToken = mockData.entities.invalidatedToken;

    return (
        <main className="p-6">
            <h1 className="text-3xl font-bold mb-6">Cài đặt hệ thống</h1>

            {/* Kỳ học */}
            <section className="mb-8">
                <h2 className="text-xl font-semibold mb-3">Kỳ học</h2>
                <table className="w-full border">
                    <thead className="bg-gray-100">
                        <tr>
                            <th className="p-2 border">Mã kỳ học</th>
                            <th className="p-2 border">Tên kỳ</th>
                            <th className="p-2 border">Ngày bắt đầu</th>
                            <th className="p-2 border">Ngày kết thúc</th>
                        </tr>
                    </thead>
                    <tbody>
                        {kiHoc.map(k => (
                            <tr key={k.id}>
                                <td className="p-2 border">{k.maKiHoc}</td>
                                <td className="p-2 border">{k.tenKiHoc}</td>
                                <td className="p-2 border">{k.ngayBatDau}</td>
                                <td className="p-2 border">{k.ngayKetThuc}</td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </section>

            {/* Phòng học */}
            <section className="mb-8">
                <h2 className="text-xl font-semibold mb-3">Phòng học</h2>
                <ul className="list-disc pl-6">
                    {phongHoc.map(p => (
                        <li key={p.id}>{p.tenPhong} - {p.diaDiem} (Sức chứa: {p.sucChua})</li>
                    ))}
                </ul>
            </section>

            {/* Giờ học */}
            <section className="mb-8">
                <h2 className="text-xl font-semibold mb-3">Giờ học</h2>
                <ul className="list-disc pl-6">
                    {gioHoc.map(g => (
                        <li key={g.id}>Tiết {g.tietBatDau}-{g.tietKetThuc} ({g.gioBatDau} - {g.gioKetThuc})</li>
                    ))}
                </ul>
            </section>

            {/* Buổi học */}
            <section className="mb-8">
                <h2 className="text-xl font-semibold mb-3">Buổi học</h2>
                <ul className="list-disc pl-6">
                    {buoiHoc.map(b => (
                        <li key={b.id}>{b.tenBuoi} - {b.moTa}</li>
                    ))}
                </ul>
            </section>

            {/* Token */}
            <section>
                <h2 className="text-xl font-semibold mb-3">Token đã hủy</h2>
                <table className="w-full border">
                    <thead className="bg-gray-100">
                        <tr>
                            <th className="p-2 border">User ID</th>
                            <th className="p-2 border">Token</th>
                            <th className="p-2 border">Thời gian</th>
                        </tr>
                    </thead>
                    <tbody>
                        {invalidatedToken.map(t => (
                            <tr key={t.id}>
                                <td className="p-2 border">{t.userId}</td>
                                <td className="p-2 border truncate">{t.token}</td>
                                <td className="p-2 border">{t.invalidatedAt}</td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </section>
        </main>
    );
}
