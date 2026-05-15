import { AdminSidebar } from '@/components/layouts/AdminSidebar';
import { AdminHeader } from '@/components/layouts/AdminHeader';
import { useEffect, useRef, useState } from 'react';
import {
    Plus, Edit, Trash2, X, Search, Users, AlertCircle,
    CheckCircle, Shield, Minus, FileSpreadsheet, Upload, RefreshCw
} from 'lucide-react';
import AiAssistantButton from '@/imports/AiAssistantButton-4-13343';
import type { UsersItem, RoleItem, UserRoleAssignment, BatchDeleteResult } from '@/api/common/types';
import * as usersApi from '@/api/admin/users.api';
import { UserFormModal } from '@/components/admin/UserFormModal';

// ─── Types ────────────────────────────────────────────────────────────────────

interface Toast { id: string; message: string; type: 'success' | 'error' | 'info' }


// ─── Helpers ──────────────────────────────────────────────────────────────────

const extractError = (err: unknown, fallback: string): string => {
    if (err && typeof err === 'object') {
        const e = err as { response?: { data?: { detail?: string; message?: string } } };
        return e.response?.data?.detail || e.response?.data?.message || fallback;
    }
    return fallback;
};

const ROLE_COLORS: Record<string, string> = {
    ADMIN: 'bg-rose-100 text-rose-700 border-rose-200',
    LECTURER: 'bg-blue-100 text-blue-700 border-blue-200',
    STUDENT: 'bg-green-100 text-green-700 border-green-200',
    ACCOUNTANT: 'bg-amber-100 text-amber-700 border-amber-200',
};
const roleColor = (role: string) =>
    ROLE_COLORS[role.toUpperCase()] ?? 'bg-slate-100 text-slate-600 border-slate-200';

// ─── Component ────────────────────────────────────────────────────────────────

export default function AdminUsersPage() {
    const scrollRef = useRef<HTMLDivElement>(null);
    const importRef = useRef<HTMLInputElement>(null);

    // ── Data state ──────────────────────────────────────────────────
    const [users, setUsers] = useState<UsersItem[]>([]);
    const [roleMap, setRoleMap] = useState<Record<string, UserRoleAssignment[]>>({});
    const [loading, setLoading] = useState(false);

    // ── Search / select / role tab ──────────────────────────────────
    const [query, setQuery] = useState('');
    const [roleTab, setRoleTab] = useState('ALL');
    const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());

    // ── Toasts ──────────────────────────────────────────────────────
    const [toasts, setToasts] = useState<Toast[]>([]);
    const addToast = (message: string, type: Toast['type'] = 'info') => {
        const id = Date.now().toString();
        setToasts(p => [...p, { id, message, type }]);
        setTimeout(() => setToasts(p => p.filter(t => t.id !== id)), 4000);
    };

    // ── Confirm modal ───────────────────────────────────────────────
    const [confirm, setConfirm] = useState<{
        open: boolean; message: string; onConfirm: (() => void) | null;
    }>({ open: false, message: '', onConfirm: null });

    // ── CRUD modals ─────────────────────────────────────────────────
    const [isAddOpen, setIsAddOpen] = useState(false);
    const [isEditOpen, setIsEditOpen] = useState(false);
    const [selected, setSelected] = useState<UsersItem | null>(null);

    // ── Import modal ────────────────────────────────────────────────
    const [isImportOpen, setIsImportOpen] = useState(false);
    const [importFile, setImportFile] = useState<File | null>(null);
    const [importResult, setImportResult] = useState<{
        totalRows: number; successCount: number; errorCount: number; errors: string[];
    } | null>(null);
    const [isImporting, setIsImporting] = useState(false);

    // ── Role modal ──────────────────────────────────────────────────
    const [isRoleOpen, setIsRoleOpen] = useState(false);
    const [roleUser, setRoleUser] = useState<UsersItem | null>(null);
    const [userRoles, setUserRoles] = useState<UserRoleAssignment[]>([]);
    const [allRoles, setAllRoles] = useState<RoleItem[]>([]);
    const [pickRoleId, setPickRoleId] = useState('');
    const [loadingRoles, setLoadingRoles] = useState(false);
    const [assigningRole, setAssigningRole] = useState(false);

    // ────────────────────────────────────────────────────────────────
    // Fetch
    // ────────────────────────────────────────────────────────────────
    const buildRoleMap = (assignments: UserRoleAssignment[]) => {
        const map: Record<string, UserRoleAssignment[]> = {};
        for (const a of assignments) {
            // backend trả userId hoặc usersId — thử cả hai field
            const key = (a as any).userId ?? (a as any).usersId ?? '';
            if (!key) continue;
            if (!map[key]) map[key] = [];
            map[key].push(a);
        }
        return map;
    };

    const loadRoles = async () => {
        try {
            const assignments = await usersApi.getAllUserRoleAssignments();
            const list = Array.isArray(assignments) ? assignments : [];
            console.log('[AdminUsersPage] role assignments received:', list.length, list[0] ?? 'empty');
            setRoleMap(buildRoleMap(list));
        } catch (err) {
            console.error('[AdminUsersPage] role load failed:', err);
            addToast(extractError(err, 'Không tải được danh sách vai trò'), 'error');
        }
    };

    const loadAll = async () => {
        try {
            setLoading(true);
            const usersData = await usersApi.getUsers();
            setUsers(usersData || []);
            setSelectedIds(new Set());
            // Tải roles riêng — không block giao diện nếu lỗi
            await loadRoles();
        } catch (err) {
            addToast(extractError(err, 'Lỗi khi tải dữ liệu người dùng'), 'error');
        } finally {
            setLoading(false);
        }
    };

    const isMounted = useRef(false);

    useEffect(() => {
        if (!isMounted.current) {
            isMounted.current = true;
            loadAll();
        }
        return () => { isMounted.current = false; };
    }, []);

    // ────────────────────────────────────────────────────────────────
    // Filter / select helpers
    // ────────────────────────────────────────────────────────────────
    const filtered = users.filter(u => {
        const q = query.toLowerCase();
        const matchQuery = !q ||
            u.userName?.toLowerCase().includes(q) ||
            u.hoTen?.toLowerCase().includes(q) ||
            u.email?.toLowerCase().includes(q);
        if (!matchQuery) return false;
        if (roleTab === 'ALL') return true;
        if (roleTab === 'NONE') return !(roleMap[u.id]?.length);
        return (roleMap[u.id] || []).some(r => r.maRole.toUpperCase() === roleTab);
    });

    const allSelected = filtered.length > 0 && filtered.every(u => selectedIds.has(u.id));
    const toggleAll = () => setSelectedIds(allSelected ? new Set() : new Set(filtered.map(u => u.id)));
    const toggleOne = (id: string) => setSelectedIds(p => {
        const n = new Set(p); n.has(id) ? n.delete(id) : n.add(id); return n;
    });

    // ────────────────────────────────────────────────────────────────
    // CRUD handlers
    // Note: Form logic is now in UserFormModal component
    // ────────────────────────────────────────────────────────────────
    const openAdd = () => { setSelected(null); setIsAddOpen(true); };
    const openEdit = (item: UsersItem) => { setSelected(item); setIsEditOpen(true); };

    const handleDelete = (id: string) => setConfirm({
        open: true,
        message: 'Bạn có chắc muốn xóa người dùng này? Hành động không thể hoàn tác.',
        onConfirm: async () => {
            try {
                await usersApi.deleteUser(id);
                addToast('Xóa người dùng thành công!', 'success');
                await loadAll();
            } catch (err) { addToast(extractError(err, 'Lỗi khi xóa người dùng'), 'error'); }
        }
    });

    // ── Batch delete result modal ─────────────────────────────────
    const [batchResult, setBatchResult] = useState<BatchDeleteResult | null>(null);

    const handleBatchDelete = () => setConfirm({
        open: true,
        message: `Xóa ${selectedIds.size} người dùng đã chọn? Hành động không thể hoàn tác.`,
        onConfirm: async () => {
            try {
                const result = await usersApi.deleteUsersBatch(Array.from(selectedIds));
                setBatchResult(result);
                if (result.failedCount === 0) {
                    addToast(`Đã xóa thành công ${result.deletedCount} người dùng!`, 'success');
                } else if (result.deletedCount > 0) {
                    addToast(`Đã xóa ${result.deletedCount}/${result.totalRequested} người dùng`, 'info');
                } else {
                    addToast(`Không thể xóa người dùng đã chọn`, 'error');
                }
                await loadAll();
            } catch (err) { addToast(extractError(err, 'Lỗi khi xóa danh sách'), 'error'); }
        }
    });

    // ── Import ───────────────────────────────────────────────────────
    const handleImport = async () => {
        if (!importFile) return;
        try {
            setIsImporting(true);
            setImportResult(null);
            const r = await usersApi.importUsersFromExcel(importFile);
            setImportResult(r);
            if (r.successCount > 0) { addToast(`Import ${r.successCount}/${r.totalRows} thành công`, 'success'); await loadAll(); }
            if (r.errorCount > 0) { addToast(`${r.errorCount} dòng lỗi`, 'error'); }
        } catch (err) { addToast(extractError(err, 'Lỗi khi import Excel'), 'error'); }
        finally { setIsImporting(false); }
    };

    // ── Role modal ───────────────────────────────────────────────────
    const openRoleModal = async (user: UsersItem) => {
        setRoleUser(user);
        setPickRoleId('');
        setIsRoleOpen(true);
        setLoadingRoles(true);
        try {
            const [roles, assignments] = await Promise.all([
                usersApi.getAllRoles(),
                usersApi.getUserRoleAssignments(user.id),
            ]);
            setAllRoles(roles);
            setUserRoles(assignments);
        } catch (err) { addToast(extractError(err, 'Lỗi khi tải vai trò'), 'error'); }
        finally { setLoadingRoles(false); }
    };

    const handleAssignRole = async () => {
        if (!roleUser || !pickRoleId) return;
        setAssigningRole(true);
        try {
            await usersApi.assignRoleToUser(roleUser.id, pickRoleId);
            addToast('Gán vai trò thành công!', 'success');
            const updated = await usersApi.getUserRoleAssignments(roleUser.id);
            setUserRoles(updated);
            setPickRoleId('');
            // Refresh role badges in table
            await loadAll();
        } catch (err) { addToast(extractError(err, 'Lỗi khi gán vai trò'), 'error'); }
        finally { setAssigningRole(false); }
    };

    const handleRemoveRole = async (assignId: string) => {
        try {
            await usersApi.removeUserRole(assignId);
            setUserRoles(p => p.filter(r => r.id !== assignId));
            addToast('Xóa vai trò thành công!', 'success');
            await loadAll();
        } catch (err) { addToast(extractError(err, 'Lỗi khi xóa vai trò'), 'error'); }
    };

    // ────────────────────────────────────────────────────────────────
    // Shared form fields
    // ────────────────────────────────────────────────────────────────
    // Stats & tab counts
    // ────────────────────────────────────────────────────────────────
    const activeCount = users.filter(u => u.trangThai).length;
    const lockedCount = users.length - activeCount;

    const TABS = [
        { key: 'ALL', label: 'Tất cả' },
        { key: 'STUDENT', label: 'Học viên' },
        { key: 'LECTURER', label: 'Giảng viên' },
        { key: 'ADMIN', label: 'Quản trị' },
        { key: 'ACCOUNTANT', label: 'Kế toán' },
        { key: 'NONE', label: 'Chưa có vai trò' },
    ] as const;

    const tabCount = (key: string) => {
        if (key === 'ALL') return users.length;
        if (key === 'NONE') return users.filter(u => !(roleMap[u.id]?.length)).length;
        return users.filter(u =>
            (roleMap[u.id] || []).some(r => r.maRole.toUpperCase() === key)
        ).length;
    };

    // ────────────────────────────────────────────────────────────────
    // Render
    // ────────────────────────────────────────────────────────────────
    return (
        <div className="flex h-screen bg-slate-50">
            <AdminSidebar activeMenu="users" />
            <div className="flex-1 ml-64 flex flex-col overflow-hidden">
                <AdminHeader title="Quản lý Người Dùng" />
                <div className="flex-1 overflow-auto">
                    <div className="p-6 max-w-7xl mx-auto space-y-4">

                        {/* ── Stats bar ─────────────────────────────────────────── */}
                        <div className="grid grid-cols-3 gap-4">
                            <div className="bg-white border border-slate-200 rounded-xl px-5 py-3 flex items-center gap-3 shadow-sm">
                                <div className="rounded-lg bg-blue-100 p-2"><Users className="w-5 h-5 text-blue-600" /></div>
                                <div>
                                    <p className="text-xl font-bold text-slate-900">{users.length}</p>
                                    <p className="text-xs text-slate-500">Tổng người dùng</p>
                                </div>
                            </div>
                            <div className="bg-white border border-slate-200 rounded-xl px-5 py-3 flex items-center gap-3 shadow-sm">
                                <div className="rounded-lg bg-green-100 p-2"><CheckCircle className="w-5 h-5 text-green-600" /></div>
                                <div>
                                    <p className="text-xl font-bold text-green-700">{activeCount}</p>
                                    <p className="text-xs text-slate-500">Đang hoạt động</p>
                                </div>
                            </div>
                            <div className="bg-white border border-slate-200 rounded-xl px-5 py-3 flex items-center gap-3 shadow-sm">
                                <div className="rounded-lg bg-red-100 p-2"><AlertCircle className="w-5 h-5 text-red-600" /></div>
                                <div>
                                    <p className="text-xl font-bold text-red-600">{lockedCount}</p>
                                    <p className="text-xs text-slate-500">Tài khoản khóa</p>
                                </div>
                            </div>
                        </div>

                        {/* ── Toolbar ────────────────────────────────────────────── */}
                        <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-3 flex flex-col sm:flex-row gap-3 items-start sm:items-center justify-between">
                            <div className="relative flex-1 max-w-sm">
                                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                                <input value={query} onChange={e => setQuery(e.target.value)}
                                    placeholder="Tìm tên, email, tài khoản..." spellCheck={false}
                                    className="w-full pl-9 pr-4 py-2 text-sm border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500" />
                            </div>
                            <div className="flex items-center gap-2">
                                <button onClick={loadAll} title="Làm mới"
                                    className="p-2 border border-slate-300 rounded-lg text-slate-600 hover:bg-slate-50 transition-colors">
                                    <RefreshCw className="w-4 h-4" />
                                </button>
                                {selectedIds.size > 0 && (
                                    <button onClick={handleBatchDelete}
                                        className="flex items-center gap-1.5 px-3 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 text-sm font-medium">
                                        <Trash2 className="w-4 h-4" /> Xóa ({selectedIds.size})
                                    </button>
                                )}
                                <button onClick={() => { setImportFile(null); setImportResult(null); setIsImportOpen(true); }}
                                    className="flex items-center gap-1.5 px-3 py-2 border border-slate-300 text-slate-700 rounded-lg hover:bg-slate-50 text-sm font-medium">
                                    <FileSpreadsheet className="w-4 h-4" /> Import
                                </button>
                                <button onClick={openAdd}
                                    className="flex items-center gap-1.5 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 text-sm font-medium shadow-sm">
                                    <Plus className="w-4 h-4" /> Thêm mới
                                </button>
                            </div>
                        </div>

                        {/* ── Role tabs ─────────────────────────────────────────── */}
                        <div className="bg-white rounded-xl border border-slate-200 shadow-sm px-4 py-2 flex items-center gap-1 overflow-x-auto">
                            {TABS.map(tab => {
                                const count = tabCount(tab.key);
                                const active = roleTab === tab.key;
                                return (
                                    <button
                                        key={tab.key}
                                        onClick={() => { setRoleTab(tab.key); setSelectedIds(new Set()); }}
                                        className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium whitespace-nowrap transition-all ${active
                                            ? 'bg-blue-600 text-white shadow-sm'
                                            : 'text-slate-600 hover:bg-slate-100'
                                            }`}
                                    >
                                        {tab.label}
                                        <span className={`text-xs px-1.5 py-0.5 rounded-full font-semibold ${active
                                            ? 'bg-white/25 text-white'
                                            : 'bg-slate-100 text-slate-500'
                                            }`}>
                                            {count}
                                        </span>
                                    </button>
                                );
                            })}
                        </div>

                        {/* ── Table ──────────────────────────────────────────────── */}
                        <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
                            {loading ? (
                                <div className="flex flex-col items-center justify-center h-72 gap-3">
                                    <div className="w-9 h-9 border-4 border-slate-200 border-t-blue-600 rounded-full animate-spin" />
                                    <p className="text-sm text-slate-500">Đang tải...</p>
                                </div>
                            ) : (
                                <div ref={scrollRef} className="overflow-auto" style={{ maxHeight: 'calc(100vh - 330px)' }}>
                                    <table className="w-full text-sm">
                                        <thead className="sticky top-0 z-10 bg-gradient-to-r from-blue-600 to-blue-700 text-white">
                                            <tr>
                                                <th className="px-4 py-3 w-10">
                                                    <input type="checkbox" checked={allSelected} onChange={toggleAll}
                                                        className="w-4 h-4 rounded cursor-pointer accent-white" />
                                                </th>
                                                <th className="px-4 py-3 text-left font-semibold">Tài Khoản</th>
                                                <th className="px-4 py-3 text-left font-semibold">Họ Tên</th>
                                                <th className="px-4 py-3 text-left font-semibold">Email</th>
                                                <th className="px-4 py-3 text-left font-semibold">Số ĐT</th>
                                                <th className="px-4 py-3 text-left font-semibold">Vai Trò</th>
                                                <th className="px-4 py-3 text-center font-semibold">Trạng Thái</th>
                                                <th className="px-4 py-3 text-center font-semibold">Thao Tác</th>
                                            </tr>
                                        </thead>
                                        <tbody className="divide-y divide-slate-100">
                                            {filtered.map(u => {
                                                const roles = roleMap[u.id] || [];
                                                const isSelected = selectedIds.has(u.id);
                                                return (
                                                    <tr key={u.id}
                                                        className={`transition-colors hover:bg-blue-50/60 ${isSelected ? 'bg-blue-50' : ''}`}>
                                                        <td className="px-4 py-3 text-center">
                                                            <input type="checkbox" checked={isSelected}
                                                                onChange={() => toggleOne(u.id)}
                                                                className="w-4 h-4 rounded cursor-pointer accent-blue-600" />
                                                        </td>
                                                        <td className="px-4 py-3 font-semibold text-slate-900">{u.userName}</td>
                                                        <td className="px-4 py-3 text-slate-700">{u.hoTen}</td>
                                                        <td className="px-4 py-3 text-slate-500">{u.email || '—'}</td>
                                                        <td className="px-4 py-3 text-slate-500">{u.soDienThoai || '—'}</td>

                                                        {/* Vai trò */}
                                                        <td className="px-4 py-3">
                                                            <div className="flex flex-wrap gap-1">
                                                                {roles.length === 0
                                                                    ? <span className="text-xs text-slate-400 italic">Chưa có</span>
                                                                    : roles.map(r => (
                                                                        <span key={r.id}
                                                                            className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-semibold border ${roleColor(r.maRole)}`}>
                                                                            {r.maRole}
                                                                        </span>
                                                                    ))
                                                                }
                                                            </div>
                                                        </td>

                                                        {/* Trạng thái */}
                                                        <td className="px-4 py-3 text-center">
                                                            <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold ${u.trangThai
                                                                ? 'bg-green-100 text-green-700'
                                                                : 'bg-red-100 text-red-600'}`}>
                                                                <span className={`w-1.5 h-1.5 rounded-full ${u.trangThai ? 'bg-green-500' : 'bg-red-500'}`} />
                                                                {u.trangThai ? 'Hoạt động' : 'Khóa'}
                                                            </span>
                                                        </td>

                                                        {/* Thao tác */}
                                                        <td className="px-4 py-3">
                                                            <div className="flex items-center justify-center gap-1">
                                                                <button onClick={() => openRoleModal(u)} title="Quản lý vai trò"
                                                                    className="p-1.5 text-purple-600 hover:bg-purple-100 rounded-lg transition-colors">
                                                                    <Shield className="w-4 h-4" />
                                                                </button>
                                                                <button onClick={() => openEdit(u)} title="Chỉnh sửa"
                                                                    className="p-1.5 text-blue-600 hover:bg-blue-100 rounded-lg transition-colors">
                                                                    <Edit className="w-4 h-4" />
                                                                </button>
                                                                <button onClick={() => handleDelete(u.id)} title="Xóa"
                                                                    className="p-1.5 text-red-500 hover:bg-red-100 rounded-lg transition-colors">
                                                                    <Trash2 className="w-4 h-4" />
                                                                </button>
                                                            </div>
                                                        </td>
                                                    </tr>
                                                );
                                            })}
                                            {filtered.length === 0 && (
                                                <tr><td colSpan={8} className="py-16 text-center">
                                                    <div className="flex flex-col items-center gap-2">
                                                        <div className="rounded-full bg-slate-100 p-4">
                                                            <Users className="w-8 h-8 text-slate-300" />
                                                        </div>
                                                        <p className="font-medium text-slate-600">
                                                            {query ? 'Không tìm thấy kết quả' : 'Chưa có người dùng'}
                                                        </p>
                                                        <p className="text-sm text-slate-400">
                                                            {query ? 'Thử từ khóa khác' : 'Nhấn "Thêm mới" để bắt đầu'}
                                                        </p>
                                                    </div>
                                                </td></tr>
                                            )}
                                        </tbody>
                                    </table>
                                </div>
                            )}
                        </div>

                        {/* ── Footer ─────────────────────────────────────────────── */}
                        {!loading && users.length > 0 && (
                            <div className="flex items-center justify-between text-xs text-slate-500 px-1">
                                <span>
                                    Hiển thị <b className="text-slate-700">{filtered.length}</b> / <b className="text-slate-700">{users.length}</b> người dùng
                                </span>
                                {selectedIds.size > 0 && (
                                    <span className="text-blue-600 font-medium">Đã chọn {selectedIds.size}</span>
                                )}
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {/* ═══════════════════════════════════════════════════════
                Modal: Thêm mới / Chỉnh sửa (sử dụng component riêng)
            ═══════════════════════════════════════════════════════ */}
            <UserFormModal
                isOpen={isAddOpen || (isEditOpen && !!selected)}
                mode={isAddOpen ? 'create' : 'edit'}
                user={selected}
                onClose={() => { setIsAddOpen(false); setIsEditOpen(false); setSelected(null); }}
                onSuccess={() => { loadAll(); }}
                onError={(msg) => addToast(msg, 'error')}
            />

            {/* ═══════════════════════════════════════════════════════
                Modal: Quản lý vai trò
            ═══════════════════════════════════════════════════════ */}
            {isRoleOpen && roleUser && (
                <div className="fixed inset-0 bg-black/30 flex items-center justify-center z-50 p-4"
                    onClick={() => setIsRoleOpen(false)}>
                    <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md"
                        onClick={e => e.stopPropagation()}>
                        <div className="bg-gradient-to-r from-purple-600 to-purple-700 text-white px-6 py-4 flex items-center justify-between rounded-t-2xl">
                            <div>
                                <h2 className="text-base font-bold flex items-center gap-2"><Shield className="w-5 h-5" /> Quản lý Vai Trò</h2>
                                <p className="text-xs text-purple-200 mt-0.5">@{roleUser.userName} — {roleUser.hoTen}</p>
                            </div>
                            <button onClick={() => setIsRoleOpen(false)} className="p-1 hover:bg-white/20 rounded-lg"><X className="w-5 h-5" /></button>
                        </div>

                        <div className="p-5 space-y-5">
                            {loadingRoles ? (
                                <div className="flex justify-center py-10">
                                    <div className="w-8 h-8 border-4 border-purple-200 border-t-purple-600 rounded-full animate-spin" />
                                </div>
                            ) : (
                                <>
                                    {/* Vai trò hiện tại */}
                                    <div>
                                        <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">
                                            Vai trò hiện tại ({userRoles.length})
                                        </p>
                                        {userRoles.length === 0
                                            ? <div className="text-center py-4 text-sm text-slate-400 italic bg-slate-50 rounded-xl border border-dashed border-slate-200">
                                                Chưa được gán vai trò nào
                                            </div>
                                            : <div className="space-y-2">
                                                {userRoles.map(r => (
                                                    <div key={r.id}
                                                        className={`flex items-center justify-between px-4 py-2.5 rounded-xl border ${roleColor(r.maRole)}`}>
                                                        <div className="flex items-center gap-2">
                                                            <Shield className="w-3.5 h-3.5 opacity-70" />
                                                            <span className="font-semibold text-sm">{r.maRole}</span>
                                                        </div>
                                                        <button onClick={() => handleRemoveRole(r.id)}
                                                            className="p-1 rounded-lg hover:bg-red-100 text-red-500 transition-colors"
                                                            title="Gỡ vai trò">
                                                            <Minus className="w-3.5 h-3.5" />
                                                        </button>
                                                    </div>
                                                ))}
                                            </div>
                                        }
                                    </div>

                                    {/* Gán vai trò mới */}
                                    <div>
                                        <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">
                                            Gán vai trò mới
                                        </p>
                                        <div className="flex gap-2">
                                            <select value={pickRoleId} onChange={e => setPickRoleId(e.target.value)}
                                                className="flex-1 px-3 py-2 text-sm border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500">
                                                <option value="">— Chọn vai trò —</option>
                                                {allRoles
                                                    .filter(r => !userRoles.some(ur => ur.roleId === r.id))
                                                    .map(r => <option key={r.id} value={r.id}>{r.maRole}</option>)
                                                }
                                            </select>
                                            <button onClick={handleAssignRole}
                                                disabled={!pickRoleId || assigningRole}
                                                className="px-4 py-2 bg-purple-600 text-white text-sm font-medium rounded-xl hover:bg-purple-700 disabled:opacity-50 transition-colors">
                                                {assigningRole ? '...' : 'Gán'}
                                            </button>
                                        </div>
                                    </div>
                                </>
                            )}
                        </div>
                    </div>
                </div>
            )}

            {/* ═══════════════════════════════════════════════════════
                Modal: Import Excel
            ═══════════════════════════════════════════════════════ */}
            {isImportOpen && (
                <div className="fixed inset-0 bg-black/30 flex items-center justify-center z-50 p-4"
                    onClick={() => setIsImportOpen(false)}>
                    <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md"
                        onClick={e => e.stopPropagation()}>
                        <div className="bg-gradient-to-r from-emerald-600 to-emerald-700 text-white px-6 py-4 flex items-center justify-between rounded-t-2xl">
                            <h2 className="text-base font-bold flex items-center gap-2"><FileSpreadsheet className="w-5 h-5" /> Import từ Excel</h2>
                            <button onClick={() => setIsImportOpen(false)} className="p-1 hover:bg-white/20 rounded-lg"><X className="w-5 h-5" /></button>
                        </div>
                        <div className="p-5 space-y-4">
                            <div className={`border-2 border-dashed rounded-xl p-8 text-center cursor-pointer transition-all ${importFile ? 'border-emerald-400 bg-emerald-50' : 'border-slate-300 hover:border-blue-400 hover:bg-blue-50/50'}`}
                                onClick={() => importRef.current?.click()}>
                                <input ref={importRef} type="file" accept=".xlsx,.xls" className="hidden"
                                    onChange={e => { setImportFile(e.target.files?.[0] || null); setImportResult(null); }} />
                                <Upload className={`w-9 h-9 mx-auto mb-2 ${importFile ? 'text-emerald-500' : 'text-slate-400'}`} />
                                {importFile
                                    ? <><p className="font-semibold text-sm text-emerald-700">{importFile.name}</p>
                                        <p className="text-xs text-emerald-500 mt-1">Nhấn để đổi file</p></>
                                    : <><p className="text-sm font-medium text-slate-600">Kéo thả hoặc nhấn để chọn file</p>
                                        <p className="text-xs text-slate-400 mt-1">Hỗ trợ .xlsx, .xls</p></>
                                }
                            </div>

                            {importResult && (
                                <div className="rounded-xl border border-slate-200 overflow-hidden">
                                    <div className="grid grid-cols-3 divide-x divide-slate-200 bg-slate-50 text-center text-sm">
                                        {[
                                            { label: 'Tổng dòng', val: importResult.totalRows, cls: 'text-slate-800' },
                                            { label: 'Thành công', val: importResult.successCount, cls: 'text-emerald-600' },
                                            { label: 'Lỗi', val: importResult.errorCount, cls: 'text-red-600' },
                                        ].map(s => (
                                            <div key={s.label} className="py-3">
                                                <p className={`text-xl font-bold ${s.cls}`}>{s.val}</p>
                                                <p className="text-xs text-slate-500">{s.label}</p>
                                            </div>
                                        ))}
                                    </div>
                                    {importResult.errors.length > 0 && (
                                        <div className="bg-red-50 border-t border-red-200 p-3 max-h-28 overflow-y-auto">
                                            {importResult.errors.map((e, i) =>
                                                <p key={i} className="text-xs text-red-600 py-0.5">{e}</p>)}
                                        </div>
                                    )}
                                </div>
                            )}

                            <div className="flex gap-3">
                                <button onClick={() => setIsImportOpen(false)}
                                    className="flex-1 py-2.5 border border-slate-300 rounded-xl text-sm font-medium text-slate-700 hover:bg-slate-50">
                                    Đóng
                                </button>
                                <button onClick={handleImport} disabled={!importFile || isImporting}
                                    className="flex-1 py-2.5 bg-emerald-600 text-white rounded-xl text-sm font-medium hover:bg-emerald-700 disabled:opacity-50">
                                    {isImporting ? 'Đang import...' : 'Import'}
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* ═══════════════════════════════════════════════════════
                Modal: Kết quả xóa nhiều người dùng
            ═══════════════════════════════════════════════════════ */}
            {batchResult && (
                <div className="fixed inset-0 bg-black/30 flex items-center justify-center z-[60] p-4"
                    onClick={() => setBatchResult(null)}>
                    <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-6"
                        onClick={e => e.stopPropagation()}>
                        <div className="flex items-center gap-3 mb-4">
                            <div className={`rounded-full p-3 flex-shrink-0 ${batchResult.failedCount === 0 ? 'bg-green-100' : 'bg-amber-100'}`}>
                                {batchResult.failedCount === 0
                                    ? <CheckCircle className="w-6 h-6 text-green-600" />
                                    : <AlertCircle className="w-6 h-6 text-amber-600" />
                                }
                            </div>
                            <div>
                                <h3 className="font-bold text-slate-900">
                                    {batchResult.failedCount === 0 ? 'Xóa thành công' : 'Xóa một phần'}
                                </h3>
                                <p className="text-sm text-slate-500">
                                    Đã xóa {batchResult.deletedCount}/{batchResult.totalRequested} người dùng
                                </p>
                            </div>
                        </div>

                        {batchResult.failedCount > 0 && (
                            <div className="mb-4">
                                <p className="text-sm font-semibold text-slate-700 mb-2">
                                    {batchResult.failedCount} người dùng không thể xóa:
                                </p>
                                <div className="bg-red-50 border border-red-200 rounded-xl p-3 max-h-48 overflow-y-auto space-y-2">
                                    {batchResult.failedUsers.map(fu => (
                                        <div key={fu.id} className="text-sm">
                                            <span className="font-semibold text-slate-800">{fu.hoTen ?? fu.id}</span>
                                            <span className="text-red-600 text-xs block">{fu.reason}</span>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}

                        <button onClick={() => setBatchResult(null)}
                            className="w-full py-2.5 bg-blue-600 text-white rounded-xl text-sm font-medium hover:bg-blue-700">
                            Đóng
                        </button>
                    </div>
                </div>
            )}

            {/* ═══════════════════════════════════════════════════════
                Modal: Xác nhận xóa
            ═══════════════════════════════════════════════════════ */}
            {confirm.open && (
                <div className="fixed inset-0 bg-black/30 flex items-center justify-center z-[60] p-4"
                    onClick={() => setConfirm(m => ({ ...m, open: false }))}>
                    <div className="bg-white rounded-2xl shadow-2xl max-w-sm w-full p-6"
                        onClick={e => e.stopPropagation()}>
                        <div className="flex items-center gap-3 mb-4">
                            <div className="rounded-full bg-red-100 p-3 flex-shrink-0">
                                <AlertCircle className="w-6 h-6 text-red-600" />
                            </div>
                            <h3 className="font-bold text-slate-900">Xác nhận xóa</h3>
                        </div>
                        <p className="text-sm text-slate-600 mb-6">{confirm.message}</p>
                        <div className="flex gap-3">
                            <button onClick={() => setConfirm(m => ({ ...m, open: false }))}
                                className="flex-1 py-2.5 border border-slate-300 rounded-xl text-sm font-medium text-slate-700 hover:bg-slate-50">
                                Hủy
                            </button>
                            <button onClick={() => { confirm.onConfirm?.(); setConfirm(m => ({ ...m, open: false })); }}
                                className="flex-1 py-2.5 bg-red-600 text-white rounded-xl text-sm font-medium hover:bg-red-700">
                                Xóa
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* ═══════════════════════════════════════════════════════
                Toasts
            ═══════════════════════════════════════════════════════ */}
            <div className="fixed bottom-24 right-6 space-y-2 z-[70] pointer-events-none">
                {toasts.map(t => (
                    <div key={t.id} className={`flex items-start gap-2.5 px-4 py-3 rounded-xl shadow-xl text-white text-sm font-medium max-w-xs pointer-events-auto ${t.type === 'success' ? 'bg-green-600' : t.type === 'error' ? 'bg-red-600' : 'bg-blue-600'}`}>
                        {t.type === 'success' && <CheckCircle className="w-4 h-4 flex-shrink-0 mt-0.5" />}
                        {t.type === 'error' && <AlertCircle className="w-4 h-4 flex-shrink-0 mt-0.5" />}
                        <span>{t.message}</span>
                    </div>
                ))}
            </div>

            {/* AI Assistant */}
            <button className="fixed bottom-8 right-8 w-14 h-14 z-50 hover:scale-110 transition-transform" aria-label="AI">
                <AiAssistantButton />
            </button>
        </div>
    );
}
