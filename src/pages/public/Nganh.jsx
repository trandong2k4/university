import React, { useState, useEffect } from "react";
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

        fetch(`http://localhost:8080/api/nganhs?${params.toString()}`)
            .then((res) => res.json())
            .then((data) => setNganhs(data))
            .catch((err) => console.error("Lỗi fetch ngành:", err));

    }, [search, khoaFilter]);

    // // Gọi API lấy danh sách Khoa
    // useEffect(() => {
    //     const params = new URLSearchParams();
    //     if (khoaFilter) params.append("tenKhoa", khoaFilter);

    //     fetch(`http://localhost:8080/api/khoas`)
    //         .then((res) => res.json())
    //         .then((data) => setKhoaFilter(data))
    //         .catch((err) => console.error("Lỗi fetch Khoa:", err));

    // });

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
                <p>Khám phá chi tiết về ngành học.</p>
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
