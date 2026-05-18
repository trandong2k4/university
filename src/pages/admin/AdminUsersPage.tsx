import { AdminSidebar } from '@/components/layouts/AdminSidebar';
import { AdminHeader } from '@/components/layouts/AdminHeader';
import { useEffect, useRef, useState } from 'react';
import { Plus, Edit, Trash2, X, Search, Users, AlertCircle, CheckCircle, Eye, EyeOff, Shield, Minus, FileSpreadsheet, Upload, Square, CheckSquare, RefreshCw } from 'lucide-react';
import AiAssistantButton from '@/imports/AiAssistantButton-4-13343';
import type { UsersItem, UserRoleAssignment, BatchDeleteResult } from '@/common/types';
import type { RoleItem } from '@/api/admin/role.api';
import * as usersApi from '@/api/admin/users.api';

interface Toast {
    id: string;
    message: string;
    type: 'success' | 'error' | 'info';
}

enum GioiTinhEnum {
    NAM = 'NAM',
    NU = 'NU'
}

const extractError = (err: unknown, fallback: string): string => {
    if (err && typeof err === 'object') {
        const e = err as { response?: { data?: { detail?: string; message?: string; errors?: Record<string, string> } } };
        const data = e.response?.data;
        if (data?.errors && typeof data.errors === 'object') {
            return Object.values(data.errors).join('\n');
        }
        return data?.detail || data?.message || fallback;
    }
    return fallback;
};

export default function AdminUsersPage() {
    const importRef = useRef<HTMLInputElement>(null);

    const [users, setUsers] = useState<UsersItem[]>([]);
    const [loading, setLoading] = useState(false);
    const [searchQuery, setSearchQuery] = useState('');
    const [activeTab, setActiveTab] = useState<string>('ALL');
    const [toasts, setToasts] = useState<Toast[]>([]);

    const [isAddOpen, setIsAddOpen] = useState(false);
    const [isEditOpen, setIsEditOpen] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [selected, setSelected] = useState<UsersItem | null>(null);
    const [showPassword, setShowPassword] = useState(false);

    const [isRoleModalOpen, setIsRoleModalOpen] = useState(false);
    const [selectedUserForRole, setSelectedUserForRole] = useState<UsersItem | null>(null);
    const [userRoles, setUserRoles] = useState<UserRoleAssignment[]>([]);
    const [allRoles, setAllRoles] = useState<RoleItem[]>([]);
    const [selectedRoleId, setSelectedRoleId] = useState('');
    const [loadingRoles, setLoadingRoles] = useState(false);
    const [assigningRole, setAssigningRole] = useState(false);

    const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
    const [isBatchDeleteOpen, setIsBatchDeleteOpen] = useState(false);
    const [isBatchDeleting, setIsBatchDeleting] = useState(false);
    const [batchDeleteResult, setBatchDeleteResult] = useState<BatchDeleteResult | null>(null);

    const [isImportOpen, setIsImportOpen] = useState(false);
    const [importFile, setImportFile] = useState<File | null>(null);
    const [importResult, setImportResult] = useState<usersApi.ExcelImportResult | null>(null);
    const [isImporting, setIsImporting] = useState(false);

    const [form, setForm] = useState({
        userName: '',
        passWord: '',
        email: '',
        cccd: '',
        hoTen: '',
        diaChi: '',
        gioiTinh: GioiTinhEnum.NAM,
        ngaySinh: '',
        soDienThoai: '',
        trangThai: true,
        ghiChu: ''
    });

    const addToast = (message: string, type: 'success' | 'error' | 'info' = 'info') => {
        const id = Date.now().toString();
        setToasts(prev => [...prev, { id, message, type }]);
        setTimeout(() => {
            setToasts(prev => prev.filter(t => t.id !== id));
        }, 3000);
    };

    const fetch = async () => {
        try {
            setLoading(true);
            const data = await usersApi.getUsers();
            setUsers(data || []);
        } catch (err) {
            console.error(err);
            addToast('Lỗi khi tải dữ liệu người dùng', 'error');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => { fetch(); }, []);

    const filtered = users.filter(u => {
        const matchesSearch =
            u.userName?.toLowerCase().includes(searchQuery.toLowerCase()) ||
            u.hoTen?.toLowerCase().includes(searchQuery.toLowerCase()) ||
            u.email?.toLowerCase().includes(searchQuery.toLowerCase());

        if (activeTab === 'ALL') return matchesSearch;

        if (activeTab === 'NO_ROLE') {
            return matchesSearch && (!u.roles || u.roles.length === 0 || u.roles.every(r => r == null));
        }

        const roles = u.roles || [];
        const roleCodes = roles.filter(r => r != null).map(r => r.toUpperCase());

        return matchesSearch && roleCodes.some(r => r === activeTab);
    });

    const allFilteredSelected = filtered.length > 0 && filtered.every(u => selectedIds.has(u.id));
    const someSelected = selectedIds.size > 0;

    const toggleSelectAll = () => {
        if (allFilteredSelected) {
            setSelectedIds(prev => {
                const next = new Set(prev);
                filtered.forEach(u => next.delete(u.id));
                return next;
            });
        } else {
            setSelectedIds(prev => {
                const next = new Set(prev);
                filtered.forEach(u => next.add(u.id));
                return next;
            });
        }
    };

    const toggleSelect = (id: string) => {
        setSelectedIds(prev => {
            const next = new Set(prev);
            if (next.has(id)) next.delete(id); else next.add(id);
            return next;
        });
    };

    const handleBatchDelete = async () => {
        setIsBatchDeleteOpen(false);
        setIsBatchDeleting(true);
        try {
            const result = await usersApi.deleteUsersBatch(Array.from(selectedIds));
            setBatchDeleteResult(result);
            setSelectedIds(new Set());
            await fetch();
        } catch (err) {
            console.error(err);
            addToast('Lỗi khi xóa người dùng', 'error');
        } finally {
            setIsBatchDeleting(false);
        }
    };

    const openAdd = () => {
        setForm({
            userName: '',
            passWord: '',
            email: '',
            cccd: '',
            hoTen: '',
            diaChi: '',
            gioiTinh: GioiTinhEnum.NAM,
            ngaySinh: '',
            soDienThoai: '',
            trangThai: true,
            ghiChu: ''
        });
        setShowPassword(false);
        setIsAddOpen(true);
    };

    const parseDateToInput = (dateStr?: string): string => {
        if (!dateStr) return '';
        // Backend trả về "dd/MM/yyyy", HTML input cần "yyyy-MM-dd"
        const parts = dateStr.split('/');
        if (parts.length === 3) return `${parts[2]}-${parts[1]}-${parts[0]}`;
        return dateStr.split('T')[0];
    };

    const openEdit = (item: UsersItem) => {
        setSelected(item);
        setForm({
            userName: item.userName,
            passWord: '',
            email: item.email || '',
            cccd: item.cccd,
            hoTen: item.hoTen,
            diaChi: item.diaChi || '',
            gioiTinh: item.gioiTinh ?? GioiTinhEnum.NAM,
            ngaySinh: parseDateToInput(item.ngaySinh),
            soDienThoai: item.soDienThoai || '',
            trangThai: item.trangThai,
            ghiChu: item.ghiChu || ''
        });
        setShowPassword(false);
        setIsEditOpen(true);
    };

    const validateForm = () => {
        if (!form.userName.trim()) {
            addToast('Vui lòng nhập tên đăng nhập', 'error');
            return false;
        }
        if (!form.hoTen.trim()) {
            addToast('Vui lòng nhập họ tên', 'error');
            return false;
        }
        if (!form.cccd.trim()) {
            addToast('Vui lòng nhập CCCD', 'error');
            return false;
        }
        if (!form.email.trim()) {
            addToast('Vui lòng nhập email', 'error');
            return false;
        }
        if (!isAddOpen && !form.passWord && !selected) {
            addToast('Vui lòng nhập mật khẩu', 'error');
            return false;
        }
        return true;
    };

    const handleCreate = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!validateForm()) return;

        try {
            setIsSubmitting(true);
            await usersApi.createUser(form);
            addToast('Thêm người dùng thành công!', 'success');
            setIsAddOpen(false);
            await fetch();
        } catch (err) {
            console.error(err);
            addToast('Lỗi khi thêm người dùng', 'error');
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleUpdate = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!selected) return;
        if (!validateForm()) return;

        try {
            setIsSubmitting(true);
            const updateData = form.passWord ? form : { ...form, passWord: undefined };
            await usersApi.updateUser(selected.id, updateData);
            addToast('Cập nhật người dùng thành công!', 'success');
            setIsEditOpen(false);
            setSelected(null);
            await fetch();
        } catch (err) {
            console.error(err);
            addToast('Lỗi khi cập nhật người dùng', 'error');
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleDelete = async (id: string) => {
        if (!confirm('Bạn có chắc chắn muốn xóa người dùng này? Hành động này không thể hoàn tác.')) return;
        try {
            await usersApi.deleteUser(id);
            addToast('Xóa người dùng thành công!', 'success');
            await fetch();
        } catch (err) {
            console.error(err);
            addToast('Lỗi khi xóa người dùng', 'error');
        }
    };

    const openImport = () => {
        setImportFile(null);
        setImportResult(null);
        if (importRef.current) importRef.current.value = '';
        setIsImportOpen(true);
    };

    const handleSelectImportFile = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0] || null;
        if (file && !/\.(xlsx|xls)$/i.test(file.name)) {
            addToast('Vui lòng chọn file Excel (.xlsx hoặc .xls)', 'error');
            e.target.value = '';
            setImportFile(null);
            setImportResult(null);
            return;
        }
        setImportFile(file);
        setImportResult(null);
    };

    const handleImport = async () => {
        if (!importFile) {
            addToast('Vui lòng chọn file Excel', 'error');
            return;
        }

        try {
            setIsImporting(true);
            const result = await usersApi.importUsersFromExcel(importFile);
            setImportResult(result);

            const defaultMessage = `Import hoàn tất: ${result.successCount}/${result.totalRows} dòng thành công`;
            if (result.successCount > 0) {
                addToast(result.message || defaultMessage, 'success');
                await fetch();
            } else if (result.errorCount > 0) {
                addToast(result.message || 'Import Excel không có dòng nào thành công', 'error');
            } else {
                addToast(result.message || defaultMessage, 'info');
            }
        } catch (err) {
            console.error(err);
            addToast(extractError(err, 'Lỗi khi import Excel'), 'error');
        } finally {
            setIsImporting(false);
        }
    };

    const openRoleModal = async (user: UsersItem) => {
        setSelectedUserForRole(user);
        setSelectedRoleId('');
        setIsRoleModalOpen(true);
        setLoadingRoles(true);
        try {
            const [roles, assignments] = await Promise.all([
                usersApi.getAllRoles(),
                usersApi.getUserRoleAssignments(user.id),
            ]);
            setAllRoles(roles);
            setUserRoles(assignments);
        } catch (err) {
            console.error(err);
            addToast('Lỗi khi tải dữ liệu role', 'error');
        } finally {
            setLoadingRoles(false);
        }
    };

    const handleAssignRole = async () => {
        if (!selectedUserForRole || !selectedRoleId) return;
        setAssigningRole(true);
        try {
            await usersApi.assignRoleToUser(selectedUserForRole.id, selectedRoleId);
            addToast('Gán role thành công!', 'success');
            const assignments = await usersApi.getUserRoleAssignments(selectedUserForRole.id);
            setUserRoles(assignments);
            setSelectedRoleId('');
            await fetch();
        } catch (err) {
            console.error(err);
            addToast('Lỗi khi gán role', 'error');
        } finally {
            setAssigningRole(false);
        }
    };

    const handleRemoveRole = async (assignmentId: string) => {
        try {
            await usersApi.removeUserRole(assignmentId);
            setUserRoles(prev => prev.filter(r => r.id !== assignmentId));
            addToast('Xóa role thành công!', 'success');
            await fetch();
        } catch (err) {
            console.error(err);
            addToast('Lỗi khi xóa role', 'error');
        }
    };

    return (
        <div className="flex h-screen bg-slate-50">
            <AdminSidebar activeMenu="users" />
            <div className="flex-1 ml-64 flex flex-col overflow-hidden">
                <AdminHeader title="Quản lý Người Dùng" />
                <div className="flex-1 overflow-auto">
                    <div className="p-6 max-w-7xl mx-auto space-y-6">
                        {/* Search and Add Section */}
                        <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                            <div className="relative flex-1 max-w-md w-full">
                                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                                <input
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                    placeholder="Tìm kiếm tên, email hoặc tài khoản..."
                                    className="w-full pl-10 pr-4 py-2.5 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                                />
                            </div>
                            <div className="flex items-center gap-2 w-full sm:w-auto">
                                <button
                                    onClick={fetch}
                                    title="Làm mới"
                                    className="p-2 border border-slate-300 rounded-lg text-slate-600 hover:bg-slate-50 transition-colors"
                                >
                                    <RefreshCw className="w-4 h-4" />
                                </button>
                                <div className="flex flex-col sm:flex-row gap-2 flex-1 sm:flex-none">
                                    <button
                                        onClick={openImport}
                                        className="flex items-center justify-center gap-1.5 px-3 py-2 border border-slate-300 text-slate-700 rounded-lg hover:bg-slate-50 text-sm font-medium transition-all"
                                    >
                                        <FileSpreadsheet className="w-4 h-4" /> Import
                                    </button>
                                    <button
                                        onClick={openAdd}
                                        className="flex items-center justify-center gap-1.5 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 text-sm font-medium shadow-sm transition-all whitespace-nowrap"
                                    >
                                        <Plus className="w-4 h-4" /> Thêm Người Dùng
                                    </button>
                                </div>
                            </div>
                        </div>

                        {/* Role Tabs */}
                        <div className="bg-white rounded-xl shadow-sm border border-slate-200 px-4">
                            <div className="flex items-center gap-1 overflow-x-auto">
                                {[
                                    { key: 'ALL', label: 'Tất cả', count: users.length },
                                    { key: 'STUDENT', label: 'Học viên', count: users.filter(u => (u.roles || []).filter(r => r != null).map(r => r.toUpperCase()).includes('STUDENT')).length },
                                    { key: 'LECTURER', label: 'Giảng viên', count: users.filter(u => (u.roles || []).filter(r => r != null).map(r => r.toUpperCase()).includes('LECTURER')).length },
                                    { key: 'ADMIN', label: 'Admin', count: users.filter(u => (u.roles || []).filter(r => r != null).map(r => r.toUpperCase()).includes('ADMIN')).length },
                                    { key: 'ACCOUNTANT', label: 'Kế toán', count: users.filter(u => (u.roles || []).filter(r => r != null).map(r => r.toUpperCase()).includes('ACCOUNTANT')).length },
                                    { key: 'NO_ROLE', label: 'Chưa có vai trò', count: users.filter(u => !u.roles || u.roles.length === 0 || u.roles.every(r => r == null)).length },
                                ].map(tab => (
                                    <button
                                        key={tab.key}
                                        onClick={() => setActiveTab(tab.key)}
                                        className={`px-4 py-3 text-sm font-medium border-b-2 transition-colors whitespace-nowrap ${
                                            activeTab === tab.key
                                                ? 'border-blue-600 text-blue-600'
                                                : 'border-transparent text-slate-500 hover:text-slate-700 hover:border-slate-300'
                                        }`}
                                    >
                                        {tab.label}
                                        <span className={`ml-2 px-2 py-0.5 rounded-full text-xs font-semibold ${
                                            activeTab === tab.key ? 'bg-blue-100 text-blue-700' : 'bg-slate-100 text-slate-600'
                                        }`}>
                                            {tab.count}
                                        </span>
                                    </button>
                                ))}
                            </div>
                        </div>

                        {/* Batch Action Bar */}
                        {someSelected && (
                            <div className="bg-red-50 border border-red-200 rounded-xl px-6 py-3 flex items-center justify-between gap-4">
                                <span className="text-sm font-semibold text-red-700">
                                    Đã chọn {selectedIds.size} người dùng
                                </span>
                                <div className="flex gap-2">
                                    <button
                                        onClick={() => setSelectedIds(new Set())}
                                        className="px-3 py-1.5 text-sm border border-red-300 rounded-lg text-red-600 hover:bg-red-100 transition-colors"
                                    >
                                        Bỏ chọn
                                    </button>
                                    <button
                                        onClick={() => setIsBatchDeleteOpen(true)}
                                        disabled={isBatchDeleting}
                                        className="px-3 py-1.5 text-sm bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors disabled:opacity-50"
                                    >
                                        {isBatchDeleting ? 'Đang xóa...' : 'Xóa đã chọn'}
                                    </button>
                                </div>
                            </div>
                        )}

                        {/* Table Section */}
                        <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
                            {loading ? (
                                <div className="flex items-center justify-center h-96">
                                    <div className="text-center">
                                        <div className="inline-block mb-4">
                                            <div className="w-12 h-12 border-4 border-slate-200 border-t-blue-600 rounded-full animate-spin"></div>
                                        </div>
                                        <p className="text-slate-600 font-medium">Đang tải dữ liệu...</p>
                                    </div>
                                </div>
                            ) : (
                                <div className="overflow-x-auto">
                                    <table className="w-full">
                                        <thead className="bg-gradient-to-r from-blue-600 to-blue-700 text-white">
                                            <tr>
                                                <th className="px-4 py-4 text-center w-10">
                                                    <button onClick={toggleSelectAll} className="text-white hover:text-blue-200 transition-colors">
                                                        {allFilteredSelected ? <CheckSquare className="w-5 h-5" /> : <Square className="w-5 h-5" />}
                                                    </button>
                                                </th>
                                                <th className="px-6 py-4 text-left text-sm font-semibold">Tài Khoản</th>
                                                <th className="px-6 py-4 text-left text-sm font-semibold">Họ Tên</th>
                                                <th className="px-6 py-4 text-left text-sm font-semibold">Vai trò</th>
                                                <th className="px-6 py-4 text-left text-sm font-semibold">Email</th>
                                                <th className="px-6 py-4 text-left text-sm font-semibold">Số ĐT</th>
                                                <th className="px-6 py-4 text-center text-sm font-semibold">Trạng Thái</th>
                                                <th className="px-6 py-4 text-center text-sm font-semibold">Thao Tác</th>
                                            </tr>
                                        </thead>

                                        <tbody className="divide-y divide-slate-200">
                                            {filtered.map((u) => (
                                                <tr key={u.id} className={`transition-colors ${selectedIds.has(u.id) ? 'bg-blue-50' : 'hover:bg-blue-50'}`}>
                                                    <td className="px-4 py-4 text-center">
                                                        <button onClick={() => toggleSelect(u.id)} className="text-slate-400 hover:text-blue-600 transition-colors">
                                                            {selectedIds.has(u.id) ? <CheckSquare className="w-5 h-5 text-blue-600" /> : <Square className="w-5 h-5" />}
                                                        </button>
                                                    </td>
                                                    <td className="px-6 py-4 text-sm font-semibold text-slate-900">{u.userName}</td>
                                                    <td className="px-6 py-4 text-sm font-medium text-slate-900">{u.hoTen}</td>
                                                    <td className="px-6 py-4 text-sm text-slate-600">
                                                        <div className="flex flex-wrap gap-1">
                                                            {(u.roles || []).filter(r => r != null).slice(0, 3).map((role, idx) => {
                                                                const code = role.toUpperCase();
                                                                const colorClass =
                                                                    code === 'STUDENT' ? 'bg-blue-100 text-blue-700' :
                                                                    code === 'LECTURER' ? 'bg-purple-100 text-purple-700' :
                                                                    code === 'ADMIN' ? 'bg-red-100 text-red-700' :
                                                                    code === 'ACCOUNTANT' ? 'bg-amber-100 text-amber-700' :
                                                                    'bg-slate-100 text-slate-700';
                                                                return (
                                                                    <span key={idx} className={`inline-block px-2 py-0.5 rounded text-xs font-semibold ${colorClass}`}>
                                                                        {role}
                                                                    </span>
                                                                );
                                                            })}
                                                            {(u.roles || []).filter(r => r != null).length === 0 && (
                                                                <span className="text-slate-400 text-xs italic">Chưa phân quyền</span>
                                                            )}
                                                        </div>
                                                    </td>
                                                    <td className="px-6 py-4 text-sm text-slate-600">{u.email}</td>
                                                    <td className="px-6 py-4 text-sm text-slate-600">{u.soDienThoai || '-'}</td>
                                                    <td className="px-6 py-4 text-center">
                                                        <span className={`inline-block px-3 py-1 rounded-full text-xs font-semibold ${u.trangThai
                                                            ? 'bg-green-100 text-green-800'
                                                            : 'bg-red-100 text-red-800'
                                                            }`}>
                                                            {u.trangThai ? 'Hoạt động' : 'Khóa'}
                                                        </span>
                                                    </td>
                                                    <td className="px-6 py-4">
                                                        <div className="flex items-center justify-center gap-2">
                                                            <button
                                                                onClick={() => openRoleModal(u)}
                                                                className="p-2 text-purple-600 hover:bg-purple-100 rounded-lg transition-colors"
                                                                title="Quản lý Role"
                                                            >
                                                                <Shield className="w-4 h-4" />
                                                            </button>
                                                            <button
                                                                onClick={() => openEdit(u)}
                                                                className="p-2 text-blue-600 hover:bg-blue-100 rounded-lg transition-colors"
                                                                title="Chỉnh sửa"
                                                            >
                                                                <Edit className="w-4 h-4" />
                                                            </button>
                                                            <button
                                                                onClick={() => handleDelete(u.id)}
                                                                className="p-2 text-red-600 hover:bg-red-100 rounded-lg transition-colors"
                                                                title="Xóa"
                                                            >
                                                                <Trash2 className="w-4 h-4" />
                                                            </button>
                                                        </div>
                                                    </td>
                                                </tr>
                                            ))}
                                            {!loading && filtered.length === 0 && (
                                                <tr>
                                                    <td colSpan={8} className="px-6 py-16">
                                                        <div className="flex flex-col items-center gap-3">
                                                            <div className="rounded-full bg-slate-100 p-4">
                                                                <Users className="w-8 h-8 text-slate-400" />
                                                            </div>
                                                            <p className="text-lg font-semibold text-slate-900">
                                                                {searchQuery ? 'Không tìm thấy người dùng' : 'Chưa có người dùng nào'}
                                                            </p>
                                                            <p className="text-sm text-slate-500">
                                                                {searchQuery ? 'Thử tìm kiếm với từ khóa khác' : 'Thêm người dùng mới để bắt đầu'}
                                                            </p>
                                                        </div>
                                                    </td>
                                                </tr>
                                            )}
                                        </tbody>
                                    </table>
                                </div>
                            )}
                        </div>

                        {/* Stats Footer */}
                        {!loading && users.length > 0 && (
                            <div className="flex items-center justify-between px-6 py-3 bg-slate-50 rounded-lg border border-slate-200">
                                <p className="text-sm text-slate-600">
                                    Hiển thị <span className="font-semibold text-slate-900">{filtered.length}</span> / <span className="font-semibold text-slate-900">{users.length}</span> người dùng
                                </p>
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {/* Add Modal */}
            {isAddOpen && (
                <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4" onClick={() => setIsAddOpen(false)}>
                    <div className="bg-white rounded-xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto" onClick={e => e.stopPropagation()}>
                        <div className="bg-gradient-to-r from-blue-600 to-blue-700 text-white px-6 py-4 flex items-center justify-between sticky top-0 z-10">
                            <h2 className="text-xl font-bold flex items-center gap-2"><Plus className="w-6 h-6" /> Thêm Người Dùng Mới</h2>
                            <button
                                onClick={() => setIsAddOpen(false)}
                                className="p-1 hover:bg-white/20 rounded-lg transition-colors"
                            >
                                <X className="w-6 h-6" />
                            </button>
                        </div>
                        <form className="p-6 space-y-4" onSubmit={handleCreate}>
                            {/* Account Info */}
                            <div>
                                <h3 className="text-sm font-semibold text-slate-900 mb-4 pb-3 border-b border-slate-200">Thông tin tài khoản</h3>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-sm font-semibold text-slate-900 mb-2">
                                            Tên đăng nhập <span className="text-red-500">*</span>
                                        </label>
                                        <input
                                            required
                                            value={form.userName}
                                            onChange={(e) => setForm({ ...form, userName: e.target.value })}
                                            placeholder="VD: nguyen.van.a"
                                            className="w-full px-3 py-2.5 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-semibold text-slate-900 mb-2">
                                            Mật khẩu <span className="text-red-500">*</span>
                                        </label>
                                        <div className="relative">
                                            <input
                                                required
                                                type={showPassword ? "text" : "password"}
                                                value={form.passWord}
                                                onChange={(e) => setForm({ ...form, passWord: e.target.value })}
                                                placeholder="Nhập mật khẩu"
                                                className="w-full px-3 py-2.5 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                                            />
                                            <button
                                                type="button"
                                                onClick={() => setShowPassword(!showPassword)}
                                                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-700"
                                            >
                                                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Personal Info */}
                            <div>
                                <h3 className="text-sm font-semibold text-slate-900 mb-4 pb-3 border-b border-slate-200">Thông tin cá nhân</h3>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-sm font-semibold text-slate-900 mb-2">
                                            Họ tên <span className="text-red-500">*</span>
                                        </label>
                                        <input
                                            required
                                            value={form.hoTen}
                                            onChange={(e) => setForm({ ...form, hoTen: e.target.value })}
                                            placeholder="VD: Nguyễn Văn A"
                                            className="w-full px-3 py-2.5 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-semibold text-slate-900 mb-2">
                                            CCCD <span className="text-red-500">*</span>
                                        </label>
                                        <input
                                            required
                                            value={form.cccd}
                                            onChange={(e) => setForm({ ...form, cccd: e.target.value })}
                                            placeholder="VD: 123456789012"
                                            className="w-full px-3 py-2.5 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-semibold text-slate-900 mb-2">
                                            Email <span className="text-red-500">*</span>
                                        </label>
                                        <input
                                            required
                                            type="email"
                                            value={form.email}
                                            onChange={(e) => setForm({ ...form, email: e.target.value })}
                                            placeholder="VD: nguyen@example.com"
                                            className="w-full px-3 py-2.5 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-semibold text-slate-900 mb-2">Số điện thoại</label>
                                        <input
                                            value={form.soDienThoai}
                                            onChange={(e) => setForm({ ...form, soDienThoai: e.target.value })}
                                            placeholder="VD: 0123456789"
                                            maxLength={10}
                                            className="w-full px-3 py-2.5 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-semibold text-slate-900 mb-2">Giới tính</label>
                                        <select
                                            value={form.gioiTinh}
                                            onChange={(e) => setForm({ ...form, gioiTinh: e.target.value as GioiTinhEnum })}
                                            className="w-full px-3 py-2.5 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                                        >
                                            <option value={GioiTinhEnum.NAM}>Nam</option>
                                            <option value={GioiTinhEnum.NU}>Nữ</option>
                                        </select>
                                    </div>
                                    <div>
                                        <label className="block text-sm font-semibold text-slate-900 mb-2">Ngày sinh</label>
                                        <input
                                            type="date"
                                            value={form.ngaySinh}
                                            onChange={(e) => setForm({ ...form, ngaySinh: e.target.value })}
                                            className="w-full px-3 py-2.5 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                                        />
                                    </div>
                                </div>
                            </div>

                            {/* Address and Notes */}
                            <div>
                                <h3 className="text-sm font-semibold text-slate-900 mb-4 pb-3 border-b border-slate-200">Địa chỉ và ghi chú</h3>
                                <div className="space-y-4">
                                    <div>
                                        <label className="block text-sm font-semibold text-slate-900 mb-2">Địa chỉ</label>
                                        <input
                                            value={form.diaChi}
                                            onChange={(e) => setForm({ ...form, diaChi: e.target.value })}
                                            placeholder="VD: 123 Đường Lý Thái Tổ, Quận Hoàn Kiếm, Hà Nội"
                                            className="w-full px-3 py-2.5 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-semibold text-slate-900 mb-2">Ghi chú</label>
                                        <textarea
                                            value={form.ghiChu}
                                            onChange={(e) => setForm({ ...form, ghiChu: e.target.value })}
                                            placeholder="Nhập ghi chú..."
                                            rows={3}
                                            className="w-full px-3 py-2.5 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all resize-none"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-semibold text-slate-900 mb-3">Trạng thái tài khoản</label>
                                        <div className="flex items-center gap-4">
                                            <label className="flex items-center gap-2 cursor-pointer">
                                                <input
                                                    type="radio"
                                                    checked={form.trangThai === true}
                                                    onChange={() => setForm({ ...form, trangThai: true })}
                                                    className="w-4 h-4"
                                                />
                                                <span className="text-sm font-medium text-slate-700">Hoạt động</span>
                                            </label>
                                            <label className="flex items-center gap-2 cursor-pointer">
                                                <input
                                                    type="radio"
                                                    checked={form.trangThai === false}
                                                    onChange={() => setForm({ ...form, trangThai: false })}
                                                    className="w-4 h-4"
                                                />
                                                <span className="text-sm font-medium text-slate-700">Khóa</span>
                                            </label>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <div className="flex gap-3 pt-4 border-t border-slate-200">
                                <button
                                    type="button"
                                    onClick={() => setIsAddOpen(false)}
                                    className="flex-1 px-4 py-2.5 border border-slate-300 rounded-lg hover:bg-slate-50 transition-colors font-medium text-slate-700"
                                >
                                    Hủy
                                </button>
                                <button
                                    type="submit"
                                    disabled={isSubmitting}
                                    className="flex-1 px-4 py-2.5 bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-lg hover:shadow-lg hover:from-blue-700 hover:to-blue-800 transition-all font-medium disabled:opacity-50 disabled:cursor-not-allowed"
                                >
                                    {isSubmitting ? 'Đang thêm...' : 'Thêm Người Dùng'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* Edit Modal */}
            {isEditOpen && selected && (
                <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4" onClick={() => setIsEditOpen(false)}>
                    <div className="bg-white rounded-xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto" onClick={e => e.stopPropagation()}>
                        <div className="bg-gradient-to-r from-blue-600 to-blue-700 text-white px-6 py-4 flex items-center justify-between sticky top-0 z-10">
                            <h2 className="text-xl font-bold flex items-center gap-2"><Edit className="w-6 h-6" /> Chỉnh Sửa Người Dùng</h2>
                            <button
                                onClick={() => setIsEditOpen(false)}
                                className="p-1 hover:bg-white/20 rounded-lg transition-colors"
                            >
                                <X className="w-6 h-6" />
                            </button>
                        </div>
                        <form className="p-6 space-y-4" onSubmit={handleUpdate}>
                            {/* Account Info */}
                            <div>
                                <h3 className="text-sm font-semibold text-slate-900 mb-4 pb-3 border-b border-slate-200">Thông tin tài khoản</h3>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-sm font-semibold text-slate-900 mb-2">Tên đăng nhập</label>
                                        <input
                                            disabled
                                            value={form.userName}
                                            className="w-full px-3 py-2.5 border border-slate-300 rounded-lg bg-slate-100 text-slate-600 cursor-not-allowed"
                                        />
                                        <p className="text-xs text-slate-500 mt-1">Không thể thay đổi tên đăng nhập</p>
                                    </div>
                                    <div>
                                        <label className="block text-sm font-semibold text-slate-900 mb-2">Mật khẩu mới (để trống để giữ nguyên)</label>
                                        <div className="relative">
                                            <input
                                                type={showPassword ? "text" : "password"}
                                                value={form.passWord}
                                                onChange={(e) => setForm({ ...form, passWord: e.target.value })}
                                                placeholder="Nhập mật khẩu mới"
                                                className="w-full px-3 py-2.5 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                                            />
                                            <button
                                                type="button"
                                                onClick={() => setShowPassword(!showPassword)}
                                                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-700"
                                            >
                                                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Personal Info */}
                            <div>
                                <h3 className="text-sm font-semibold text-slate-900 mb-4 pb-3 border-b border-slate-200">Thông tin cá nhân</h3>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-sm font-semibold text-slate-900 mb-2">Họ tên <span className="text-red-500">*</span></label>
                                        <input
                                            required
                                            value={form.hoTen}
                                            onChange={(e) => setForm({ ...form, hoTen: e.target.value })}
                                            className="w-full px-3 py-2.5 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-semibold text-slate-900 mb-2">CCCD <span className="text-red-500">*</span></label>
                                        <input
                                            disabled
                                            value={form.cccd}
                                            className="w-full px-3 py-2.5 border border-slate-300 rounded-lg bg-slate-100 text-slate-600 cursor-not-allowed"
                                        />
                                        <p className="text-xs text-slate-500 mt-1">Không thể thay đổi CCCD</p>
                                    </div>
                                    <div>
                                        <label className="block text-sm font-semibold text-slate-900 mb-2">Email <span className="text-red-500">*</span></label>
                                        <input
                                            required
                                            type="email"
                                            value={form.email}
                                            onChange={(e) => setForm({ ...form, email: e.target.value })}
                                            className="w-full px-3 py-2.5 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-semibold text-slate-900 mb-2">Số điện thoại</label>
                                        <input
                                            value={form.soDienThoai}
                                            onChange={(e) => setForm({ ...form, soDienThoai: e.target.value })}
                                            maxLength={10}
                                            className="w-full px-3 py-2.5 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-semibold text-slate-900 mb-2">Giới tính</label>
                                        <select
                                            value={form.gioiTinh}
                                            onChange={(e) => setForm({ ...form, gioiTinh: e.target.value as GioiTinhEnum })}
                                            className="w-full px-3 py-2.5 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                                        >
                                            <option value={GioiTinhEnum.NAM}>Nam</option>
                                            <option value={GioiTinhEnum.NU}>Nữ</option>
                                        </select>
                                    </div>
                                    <div>
                                        <label className="block text-sm font-semibold text-slate-900 mb-2">Ngày sinh</label>
                                        <input
                                            type="date"
                                            value={form.ngaySinh}
                                            onChange={(e) => setForm({ ...form, ngaySinh: e.target.value })}
                                            className="w-full px-3 py-2.5 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                                        />
                                    </div>
                                </div>
                            </div>

                            {/* Address and Notes */}
                            <div>
                                <h3 className="text-sm font-semibold text-slate-900 mb-4 pb-3 border-b border-slate-200">Địa chỉ và ghi chú</h3>
                                <div className="space-y-4">
                                    <div>
                                        <label className="block text-sm font-semibold text-slate-900 mb-2">Địa chỉ</label>
                                        <input
                                            value={form.diaChi}
                                            onChange={(e) => setForm({ ...form, diaChi: e.target.value })}
                                            className="w-full px-3 py-2.5 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-semibold text-slate-900 mb-2">Ghi chú</label>
                                        <textarea
                                            value={form.ghiChu}
                                            onChange={(e) => setForm({ ...form, ghiChu: e.target.value })}
                                            rows={3}
                                            className="w-full px-3 py-2.5 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all resize-none"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-semibold text-slate-900 mb-3">Trạng thái tài khoản</label>
                                        <div className="flex items-center gap-4">
                                            <label className="flex items-center gap-2 cursor-pointer">
                                                <input
                                                    type="radio"
                                                    checked={form.trangThai === true}
                                                    onChange={() => setForm({ ...form, trangThai: true })}
                                                    className="w-4 h-4"
                                                />
                                                <span className="text-sm font-medium text-slate-700">Hoạt động</span>
                                            </label>
                                            <label className="flex items-center gap-2 cursor-pointer">
                                                <input
                                                    type="radio"
                                                    checked={form.trangThai === false}
                                                    onChange={() => setForm({ ...form, trangThai: false })}
                                                    className="w-4 h-4"
                                                />
                                                <span className="text-sm font-medium text-slate-700">Khóa</span>
                                            </label>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <div className="flex gap-3 pt-4 border-t border-slate-200">
                                <button
                                    type="button"
                                    onClick={() => setIsEditOpen(false)}
                                    className="flex-1 px-4 py-2.5 border border-slate-300 rounded-lg hover:bg-slate-50 transition-colors font-medium text-slate-700"
                                >
                                    Hủy
                                </button>
                                <button
                                    type="submit"
                                    disabled={isSubmitting}
                                    className="flex-1 px-4 py-2.5 bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-lg hover:shadow-lg hover:from-blue-700 hover:to-blue-800 transition-all font-medium disabled:opacity-50 disabled:cursor-not-allowed"
                                >
                                    {isSubmitting ? 'Đang lưu...' : 'Lưu Thay Đổi'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* Import Modal */}
            {isImportOpen && (
                <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4" onClick={() => setIsImportOpen(false)}>
                    <div className="bg-white rounded-xl shadow-2xl max-w-md w-full overflow-hidden" onClick={e => e.stopPropagation()}>
                        <div className="bg-gradient-to-r from-emerald-600 to-emerald-700 text-white px-6 py-4 flex items-center justify-between">
                            <h2 className="text-xl font-bold flex items-center gap-2">
                                <FileSpreadsheet className="w-6 h-6" />
                                Import Người Dùng từ Excel
                            </h2>
                            <button
                                onClick={() => setIsImportOpen(false)}
                                className="p-1 hover:bg-white/20 rounded-lg transition-colors"
                            >
                                <X className="w-6 h-6" />
                            </button>
                        </div>

                        <div className="p-6 space-y-4">
                            <div
                                className={`border-2 border-dashed rounded-xl p-8 text-center cursor-pointer transition-all ${importFile
                                    ? 'border-emerald-400 bg-emerald-50'
                                    : 'border-slate-300 hover:border-emerald-400 hover:bg-emerald-50/60'
                                    }`}
                                onClick={() => importRef.current?.click()}
                            >
                                <input
                                    ref={importRef}
                                    type="file"
                                    accept=".xlsx,.xls"
                                    className="hidden"
                                    onChange={handleSelectImportFile}
                                />
                                <Upload className={`w-10 h-10 mx-auto mb-3 ${importFile ? 'text-emerald-500' : 'text-slate-400'}`} />
                                {importFile ? (
                                    <>
                                        <p className="font-semibold text-sm text-emerald-700 break-all">{importFile.name}</p>
                                        <p className="text-xs text-emerald-600 mt-1">Nhấn để đổi file</p>
                                    </>
                                ) : (
                                    <>
                                        <p className="text-sm font-medium text-slate-700">Chọn file Excel danh sách người dùng</p>
                                        <p className="text-xs text-slate-500 mt-1">Hỗ trợ .xlsx, .xls</p>
                                    </>
                                )}
                            </div>

                            <div className="rounded-lg bg-slate-50 border border-slate-200 p-3 text-xs text-slate-600">
                                Thứ tự cột: tài khoản, mật khẩu, email, CCCD, họ tên, địa chỉ, giới tính, ngày sinh, số điện thoại, trạng thái, ghi chú, mã role.
                            </div>

                            {importResult && (
                                <div className="rounded-xl border border-slate-200 overflow-hidden">
                                    <div className="grid grid-cols-3 divide-x divide-slate-200 bg-slate-50 text-center">
                                        <div className="py-3">
                                            <p className="text-xl font-bold text-slate-800">{importResult.totalRows}</p>
                                            <p className="text-xs text-slate-500">Tổng dòng</p>
                                        </div>
                                        <div className="py-3">
                                            <p className="text-xl font-bold text-emerald-600">{importResult.successCount}</p>
                                            <p className="text-xs text-slate-500">Thành công</p>
                                        </div>
                                        <div className="py-3">
                                            <p className="text-xl font-bold text-red-600">{importResult.errorCount}</p>
                                            <p className="text-xs text-slate-500">Lỗi</p>
                                        </div>
                                    </div>
                                </div>
                            )}

                            {importResult?.message && (
                                <div className={`rounded-lg p-3 text-sm font-medium ${importResult.errorCount > 0
                                    ? 'bg-amber-50 border border-amber-200 text-amber-700'
                                    : 'bg-green-50 border border-green-200 text-green-700'
                                    }`}>
                                    {importResult.message}
                                </div>
                            )}

                            {importResult?.errors && importResult.errors.length > 0 && (
                                <div className="rounded-xl border border-red-200 overflow-hidden max-h-40 overflow-y-auto">
                                    <div className="bg-red-50 px-3 py-2 text-xs font-semibold text-red-700">Danh sách lỗi</div>
                                    <div className="divide-y divide-red-100">
                                        {importResult.errors.map((err, idx) => (
                                            <div key={`${idx}-${err}`} className="px-3 py-2 text-xs text-red-600">{err}</div>
                                        ))}
                                    </div>
                                </div>
                            )}

                            <div className="flex gap-3 pt-2">
                                <button
                                    type="button"
                                    onClick={() => setIsImportOpen(false)}
                                    className="flex-1 px-4 py-2.5 border border-slate-300 rounded-lg hover:bg-slate-50 transition-colors font-medium text-slate-700"
                                >
                                    Đóng
                                </button>
                                <button
                                    type="button"
                                    onClick={handleImport}
                                    disabled={!importFile || isImporting}
                                    className="flex-1 px-4 py-2.5 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition-colors font-medium disabled:opacity-50 disabled:cursor-not-allowed"
                                >
                                    {isImporting ? 'Đang import...' : 'Import'}
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* Role Management Modal */}
            {isRoleModalOpen && selectedUserForRole && (
                <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4" onClick={() => setIsRoleModalOpen(false)}>
                    <div className="bg-white rounded-xl shadow-2xl w-full max-w-lg" onClick={e => e.stopPropagation()}>
                        <div className="bg-gradient-to-r from-purple-600 to-purple-700 text-white px-6 py-4 flex items-center justify-between rounded-t-xl">
                            <h2 className="text-xl font-bold flex items-center gap-2">
                                <Shield className="w-6 h-6" />
                                Quản lý Role — {selectedUserForRole.userName}
                            </h2>
                            <button onClick={() => setIsRoleModalOpen(false)} className="p-1 hover:bg-white/20 rounded-lg transition-colors">
                                <X className="w-6 h-6" />
                            </button>
                        </div>
                        <div className="p-6 space-y-6">
                            {loadingRoles ? (
                                <div className="flex justify-center py-8">
                                    <div className="w-8 h-8 border-4 border-purple-200 border-t-purple-600 rounded-full animate-spin" />
                                </div>
                            ) : (
                                <>
                                    {/* Current Roles */}
                                    <div>
                                        <h3 className="text-sm font-semibold text-slate-700 mb-3">Role hiện tại</h3>
                                        {userRoles.length === 0 ? (
                                            <p className="text-sm text-slate-400 italic">Chưa có role nào</p>
                                        ) : (
                                            <div className="space-y-2">
                                                {userRoles.map(r => (
                                                    <div key={r.id} className="flex items-center justify-between bg-purple-50 border border-purple-200 rounded-lg px-4 py-2">
                                                        <span className="font-semibold text-purple-800 text-sm">{r.maRole}</span>
                                                        <button
                                                            onClick={() => handleRemoveRole(r.id)}
                                                            className="p-1 text-red-500 hover:bg-red-100 rounded transition-colors"
                                                            title="Xóa role"
                                                        >
                                                            <Minus className="w-4 h-4" />
                                                        </button>
                                                    </div>
                                                ))}
                                            </div>
                                        )}
                                    </div>

                                    {/* Assign New Role */}
                                    <div>
                                        <h3 className="text-sm font-semibold text-slate-700 mb-3">Gán role mới</h3>
                                        <div className="flex gap-2">
                                            <select
                                                value={selectedRoleId}
                                                onChange={e => setSelectedRoleId(e.target.value)}
                                                className="flex-1 px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                                            >
                                                <option value="">-- Chọn role --</option>
                                                {allRoles
                                                    .filter(r => !userRoles.some(ur => ur.roleId === r.id))
                                                    .map(r => (
                                                        <option key={r.id} value={r.id}>{r.maRole}</option>
                                                    ))
                                                }
                                            </select>
                                            <button
                                                onClick={handleAssignRole}
                                                disabled={!selectedRoleId || assigningRole}
                                                className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors font-medium disabled:opacity-50 disabled:cursor-not-allowed"
                                            >
                                                {assigningRole ? 'Đang gán...' : 'Gán'}
                                            </button>
                                        </div>
                                    </div>
                                </>
                            )}
                        </div>
                    </div>
                </div>
            )}

            {/* Batch Delete Confirm Modal */}
            {isBatchDeleteOpen && (
                <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4" onClick={() => setIsBatchDeleteOpen(false)}>
                    <div className="bg-white rounded-xl shadow-2xl max-w-md w-full" onClick={e => e.stopPropagation()}>
                        <div className="bg-gradient-to-r from-red-600 to-red-700 text-white px-6 py-4 rounded-t-xl flex items-center gap-3">
                            <Trash2 className="w-6 h-6" />
                            <h2 className="text-xl font-bold">Xác nhận xóa</h2>
                        </div>
                        <div className="p-6 space-y-4">
                            <p className="text-slate-700">
                                Bạn có chắc chắn muốn xóa <span className="font-bold text-red-600">{selectedIds.size}</span> người dùng đã chọn?
                            </p>
                            <p className="text-sm text-slate-500">Người dùng đang là học viên hoặc nhân viên sẽ không thể xóa và sẽ được báo cáo chi tiết.</p>
                            <div className="flex gap-3 pt-2">
                                <button onClick={() => setIsBatchDeleteOpen(false)} className="flex-1 px-4 py-2.5 border border-slate-300 rounded-lg hover:bg-slate-50 transition-colors font-medium text-slate-700">Hủy</button>
                                <button onClick={handleBatchDelete} className="flex-1 px-4 py-2.5 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors font-medium">Xác nhận xóa</button>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* Batch Delete Result Modal */}
            {batchDeleteResult && (
                <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4" onClick={() => setBatchDeleteResult(null)}>
                    <div className="bg-white rounded-xl shadow-2xl max-w-lg w-full max-h-[80vh] flex flex-col" onClick={e => e.stopPropagation()}>
                        <div className={`px-6 py-4 rounded-t-xl flex items-center justify-between ${batchDeleteResult.failedCount === 0 ? 'bg-gradient-to-r from-green-600 to-green-700' : 'bg-gradient-to-r from-amber-500 to-amber-600'} text-white`}>
                            <h2 className="text-xl font-bold flex items-center gap-2">
                                {batchDeleteResult.failedCount === 0 ? <CheckCircle className="w-6 h-6" /> : <AlertCircle className="w-6 h-6" />}
                                Kết quả xóa người dùng
                            </h2>
                            <button onClick={() => setBatchDeleteResult(null)} className="p-1 hover:bg-white/20 rounded-lg transition-colors"><X className="w-6 h-6" /></button>
                        </div>
                        <div className="p-6 space-y-4 overflow-y-auto">
                            <div className="grid grid-cols-3 gap-3 text-center">
                                <div className="bg-slate-50 rounded-lg p-3">
                                    <p className="text-2xl font-bold text-slate-800">{batchDeleteResult.totalRequested}</p>
                                    <p className="text-xs text-slate-500">Tổng yêu cầu</p>
                                </div>
                                <div className="bg-green-50 rounded-lg p-3">
                                    <p className="text-2xl font-bold text-green-700">{batchDeleteResult.deletedCount}</p>
                                    <p className="text-xs text-slate-500">Đã xóa</p>
                                </div>
                                <div className="bg-red-50 rounded-lg p-3">
                                    <p className="text-2xl font-bold text-red-700">{batchDeleteResult.failedCount}</p>
                                    <p className="text-xs text-slate-500">Thất bại</p>
                                </div>
                            </div>
                            {batchDeleteResult.failedUsers && batchDeleteResult.failedUsers.length > 0 && (
                                <div className="rounded-xl border border-red-200 overflow-hidden">
                                    <div className="bg-red-50 px-4 py-2 text-xs font-semibold text-red-700">Người dùng không thể xóa</div>
                                    <div className="divide-y divide-red-100 max-h-48 overflow-y-auto">
                                        {batchDeleteResult.failedUsers.map((f, idx) => (
                                            <div key={`${f.id}-${idx}`} className="px-4 py-2 flex items-start justify-between gap-2">
                                                <span className="text-sm font-medium text-slate-800">{f.hoTen || f.id}</span>
                                                <span className="text-xs text-red-600 text-right shrink-0">{f.reason}</span>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}
                            <button onClick={() => setBatchDeleteResult(null)} className="w-full px-4 py-2.5 bg-slate-800 text-white rounded-lg hover:bg-slate-900 transition-colors font-medium">Đóng</button>
                        </div>
                    </div>
                </div>
            )}

            {/* Toast Notifications */}
            <div className="fixed bottom-24 right-8 space-y-3 z-[60]">
                {toasts.map(toast => (
                    <div
                        key={toast.id}
                        className={`flex items-center gap-3 px-4 py-3 rounded-lg shadow-lg text-white font-medium ${toast.type === 'success' ? 'bg-green-500' :
                            toast.type === 'error' ? 'bg-red-500' :
                                'bg-blue-500'
                            }`}
                    >
                        {toast.type === 'success' && <CheckCircle className="w-5 h-5" />}
                        {toast.type === 'error' && <AlertCircle className="w-5 h-5" />}
                        {toast.message}
                    </div>
                ))}
            </div>

            {/* AI Assistant Button */}
            <button
                className="fixed bottom-8 right-8 w-16 h-16 z-50 hover:scale-110 transition-transform"
                aria-label="AI Assistant"
            >
                <AiAssistantButton />
            </button>
        </div>
    );
}
