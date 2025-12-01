import React, { useState, useEffect } from "react";
import apiClient from "/src/api/apiClient";
import "../../styles/public/nganh.css";

export default function Nganh() {
    const [nganhs, setNganhs] = useState([]);
    const [search, setSearch] = useState("");
    const [khoaFilter, setKhoaFilter] = useState("");
    const [openWeek, setOpenWeek] = useState(null);

    const toggleWeek = (week) => {
        setOpenWeek(openWeek === week ? null : week);
    };

    // Gọi API lấy danh sách ngành
    useEffect(() => {
        const params = new URLSearchParams();
        if (search) params.append("tenNganh", search);
        if (khoaFilter) params.append("tenKhoa", khoaFilter);

        apiClient
            .get(`/majors?${params.toString()}`)
            .then((res) => setNganhs(res.data))
            .catch((err) => console.error("Lỗi lấy ngành:", err));

    }, [search, khoaFilter]);


    // Gọi API lấy danh sách Khoa
    // useEffect(() => {
    //     apiClient
    //         .get("/departments")
    //         .then((res) => setKhoas(res.data))   // Đã sửa: không dùng setKhoaFilter
    //         .catch((err) => console.error("Lỗi lấy khoa:", err));
    // }, []);


    // Lọc ngành theo tên và khoa
    const filteredNganhs = nganhs.filter((nganh) => {
        const matchName = nganh.tenNganh.toLowerCase().includes(search.toLowerCase());
        const matchKhoa = khoaFilter ? nganh.tenKhoa === khoaFilter : true;
        return matchName && matchKhoa;
    });

    // Lấy danh sách khoa từ ngành (unique)
    const khoaOptions = [...new Set(nganhs.map((n) => n.tenKhoa))].filter(Boolean);

    return (
        <div className="nganh-page">
            {/* Banner */}
            <section className="banner">
                <h1>Ngành học</h1>
                <p>Khám phá về ngành học.</p>
            </section>

            {/* Search & Filter */}
            <section className="filter-section">
                <input
                    type="text"
                    placeholder="Tìm theo tên ngành..."
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                />
                <select
                    value={khoaFilter}
                    onChange={(e) => setKhoaFilter(e.target.value)}
                >
                    <option value="">-- Tất cả khoa --</option>
                    {khoaOptions.map((khoa, idx) => (
                        <option key={idx} value={khoa}>{khoa}</option>
                    ))}
                </select>
            </section>

            {/* Danh sách ngành */}
            <section className="list-nganh">
                {filteredNganhs.length > 0 ? (
                    <ul>
                        {filteredNganhs.map((nganh) => (
                            <li key={nganh.id} className="nganh-card">
                                <h3>{nganh.tenNganh}</h3>
                                <p><strong>Khoa:</strong> {nganh.tenKhoa}</p>
                                <p><strong>Mô tả:</strong> {nganh.moTa}</p>
                            </li>
                        ))}
                    </ul>
                ) : (
                    <p>Không tìm thấy ngành phù hợp</p>
                )}
            </section>
        </div>
    );
}
