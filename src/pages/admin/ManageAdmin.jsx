import React, { useState } from "react";
import mockData from "../../mockData";
import "../../styles/admin/manageAdmin.css";
export default function ManageAdmin() {
    const [users] = useState(mockData.entities.user);
    const [roles] = useState(mockData.entities.role);
    const [permissions] = useState(mockData.entities.permission);

    return (
        <main className="p-6">
            <h1 className="text-3xl font-bold mb-6">Quản trị hệ thống</h1>

            {/* Users */}
            <section className="mb-8">
                <h2 className="text-xl font-semibold mb-3">Người dùng</h2>
                <table className="w-full border">
                    <thead className="bg-gray-100">
                        <tr>
                            <th className="p-2 border">ID</th>
                            <th className="p-2 border">Username</th>
                            <th className="p-2 border">Email</th>
                            <th className="p-2 border">Full name</th>
                        </tr>
                    </thead>
                    <tbody>
                        {users.map((u) => (
                            <tr key={u.id}>
                                <td className="p-2 border">{u.id}</td>
                                <td className="p-2 border">{u.username}</td>
                                <td className="p-2 border">{u.email}</td>
                                <td className="p-2 border">{u.fullName}</td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </section>

            {/* Roles */}
            <section className="mb-8">
                <h2 className="text-xl font-semibold mb-3">Vai trò</h2>
                <ul className="list-disc pl-6">
                    {roles.map((r) => (
                        <li key={r.id}>{r.name} - {r.description}</li>
                    ))}
                </ul>
            </section>

            {/* Permissions */}
            <section>
                <h2 className="text-xl font-semibold mb-3">Quyền hạn</h2>
                <ul className="list-disc pl-6">
                    {permissions.map((p) => (
                        <li key={p.id}>{p.name} - {p.description}</li>
                    ))}
                </ul>
            </section>
        </main>
    );
}
