import { useState, useRef, useEffect } from 'react';
import { Plus, Edit, X, Eye, EyeOff } from 'lucide-react';
import type { RoleItem, UsersItem } from '@/api/common/types';
import { GioiTinhEnum } from '@/api/common/types';
import * as usersApi from '@/api/admin/users.api';

interface UserFormModalProps {
    isOpen: boolean;
    mode: 'create' | 'edit';
    user?: UsersItem | null;
    onClose: () => void;
    onSuccess: (message?: string) => void;
    onError?: (msg: string) => void;
}

const extractServerError = (err: unknown, fallback: string): string => {
    if (err && typeof err === 'object') {
        const e = err as { response?: { data?: { detail?: string; message?: string; error?: string } | string }; message?: string };
        if (typeof e.response?.data === 'string' && e.response.data) return e.response.data;
        const d = e.response?.data as { detail?: string; message?: string; error?: string } | undefined;
        return d?.detail || d?.message || d?.error || e.message || fallback;
    }
    return fallback;
};

export function UserFormModal({ isOpen, mode, user, onClose, onSuccess, onError }: UserFormModalProps) {
    const formRef = useRef<HTMLFormElement>(null);
    const [showPass, setShowPass] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [roles, setRoles] = useState<RoleItem[]>([]);

    const inp = "w-full px-3 py-2.5 text-sm border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all";
    const lbl = "block text-sm font-medium text-slate-700 mb-1.5";

    useEffect(() => {
        if (!isOpen || !formRef.current) return;
        const form = formRef.current;
        if (mode === 'create') {
            form.reset();
            const trangThaiInput = form.querySelector('[name="trangThai"]') as HTMLInputElement;
            if (trangThaiInput) trangThaiInput.checked = true;
        } else if (user) {
            form.reset();
            (form.querySelector('[name="userName"]') as HTMLInputElement).value = user.userName;
            (form.querySelector('[name="email"]') as HTMLInputElement).value = user.email || '';
            (form.querySelector('[name="cccd"]') as HTMLInputElement).value = user.cccd;
            (form.querySelector('[name="hoTen"]') as HTMLInputElement).value = user.hoTen;
            (form.querySelector('[name="diaChi"]') as HTMLInputElement).value = user.diaChi || '';
            (form.querySelector('[name="gioiTinh"]') as HTMLSelectElement).value = user.gioiTinh || 'NAM';
            (form.querySelector('[name="ngaySinh"]') as HTMLInputElement).value = user.ngaySinh ? user.ngaySinh.split('/').reverse().join('-') : '';
            (form.querySelector('[name="soDienThoai"]') as HTMLInputElement).value = user.soDienThoai || '';
            (form.querySelector('[name="trangThai"]') as HTMLInputElement).checked = user.trangThai;
            (form.querySelector('[name="ghiChu"]') as HTMLInputElement).value = user.ghiChu || '';
        }
    }, [isOpen, mode, user]);

    useEffect(() => {
        if (!isOpen || mode !== 'create') return;

        let cancelled = false;
        usersApi.getAllRoles()
            .then(data => {
                if (!cancelled) setRoles(Array.isArray(data) ? data : []);
            })
            .catch(err => {
                if (!cancelled) {
                    const msg = extractServerError(err, 'Không tải được danh sách vai trò');
                    (onError ?? alert)(msg);
                }
            });

        return () => { cancelled = true; };
    }, [isOpen, mode]);

    const validate = (formData: FormData, isCreate: boolean): string | null => {
        if (!formData.get('userName')?.toString().trim()) return 'Vui lòng nhập tên đăng nhập';
        if (!formData.get('hoTen')?.toString().trim()) return 'Vui lòng nhập họ tên';
        const cccd = formData.get('cccd')?.toString().trim() ?? '';
        if (!cccd) return 'Vui lòng nhập CCCD';
        if (!/^\d{12}$/.test(cccd)) return 'CCCD phải gồm đúng 12 chữ số';
        if (!formData.get('email')?.toString().trim()) return 'Vui lòng nhập email';
        if (isCreate && !formData.get('passWord')?.toString().trim()) return 'Vui lòng nhập mật khẩu';
        return null;
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!formRef.current) return;

        const formData = new FormData(formRef.current);
        const isCreate = mode === 'create';
        const error = validate(formData, isCreate);
        if (error) { (onError ?? alert)(error); return; }

        try {
            setIsSubmitting(true);
            const data = {
                userName: formData.get('userName')?.toString().trim() || '',
                passWord: formData.get('passWord')?.toString() || '',
                email: formData.get('email')?.toString().trim() || '',
                cccd: formData.get('cccd')?.toString().trim() || '',
                hoTen: formData.get('hoTen')?.toString().trim() || '',
                diaChi: formData.get('diaChi')?.toString().trim() || undefined,
                gioiTinh: formData.get('gioiTinh')?.toString() as GioiTinhEnum,
                ngaySinh: formData.get('ngaySinh')?.toString().trim() || undefined,
                soDienThoai: formData.get('soDienThoai')?.toString().trim() || undefined,
                trangThai: formData.get('trangThai') === 'on',
                ghiChu: formData.get('ghiChu')?.toString().trim() || undefined,
                maRole: isCreate ? formData.get('maRole')?.toString().trim() || undefined : undefined,
            };

            if (isCreate) {
                await usersApi.createUser(data);
                onSuccess('Thêm người dùng thành công!');
            } else {
                const { passWord: _pw, ...rest } = data;
                await usersApi.updateUser(user!.id, rest);
                onSuccess('Cập nhật người dùng thành công!');
            }
            onClose();
        } catch (err) {
            const msg = extractServerError(err, 'Đã xảy ra lỗi, vui lòng thử lại');
            (onError ?? alert)(msg);
        } finally {
            setIsSubmitting(false);
        }
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black/30 flex items-center justify-center z-50 p-4" onClick={onClose}>
            <div className="bg-white rounded-2xl shadow-2xl max-w-3xl w-full max-h-[90vh] overflow-y-auto" onClick={e => e.stopPropagation()}>
                <div className="bg-gradient-to-r from-blue-600 to-blue-700 text-white px-6 py-4 flex items-center justify-between rounded-t-2xl">
                    <h2 className="text-base font-bold flex items-center gap-2">
                        {mode === 'create' ? <Plus className="w-5 h-5" /> : <Edit className="w-5 h-5" />}
                        {mode === 'create' ? 'Thêm Người Dùng Mới' : 'Chỉnh Sửa Người Dùng'}
                    </h2>
                    <button onClick={onClose} className="p-1 hover:bg-white/20 rounded-lg"><X className="w-5 h-5" /></button>
                </div>
                <form ref={formRef} onSubmit={handleSubmit} className="p-6">
                    <div className="space-y-5">
                        {/* Tài khoản */}
                        <section>
                            <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-3 pb-2 border-b border-slate-100">Thông tin tài khoản</p>
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className={lbl}>Tên đăng nhập <span className="text-red-500">*</span></label>
                                    <input className={inp} name="userName" required placeholder="VD: nguyen.van.a" />
                                </div>
                                <div>
                                    <label className={lbl}>{mode === 'create' ? <>Mật khẩu <span className="text-red-500">*</span></> : 'Mật khẩu mới (trống = giữ nguyên)'}</label>
                                    <div className="relative">
                                        <input className={inp + ' pr-10'} name="passWord" required={mode === 'create'} type={showPass ? 'text' : 'password'}
                                            placeholder={mode === 'create' ? 'Nhập mật khẩu' : 'Nhập để đổi mật khẩu'} autoComplete="new-password" />
                                        <button type="button" onClick={() => setShowPass(p => !p)} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600">
                                            {showPass ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                                        </button>
                                    </div>
                                </div>
                                {mode === 'create' && (
                                    <div className="col-span-2">
                                        <label className={lbl}>Vai trò</label>
                                        <select className={inp} name="maRole" defaultValue="">
                                            <option value="">Không gán vai trò</option>
                                            {roles.map(role => (
                                                <option key={role.id} value={role.maRole}>
                                                    {role.maRole}{role.moTa ? ` - ${role.moTa}` : ''}
                                                </option>
                                            ))}
                                        </select>
                                    </div>
                                )}
                            </div>
                        </section>
                        {/* Cá nhân */}
                        <section>
                            <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-3 pb-2 border-b border-slate-100">Thông tin cá nhân</p>
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className={lbl}>Họ tên <span className="text-red-500">*</span></label>
                                    <input className={inp} name="hoTen" required placeholder="VD: Nguyễn Văn A" />
                                </div>
                                <div>
                                    <label className={lbl}>CCCD <span className="text-red-500">*</span></label>
                                    <input className={inp} name="cccd" required maxLength={12} placeholder="12 chữ số" />
                                </div>
                                <div>
                                    <label className={lbl}>Email <span className="text-red-500">*</span></label>
                                    <input className={inp} name="email" type="email" required placeholder="VD: nguyen@dtu.edu.vn" />
                                </div>
                                <div>
                                    <label className={lbl}>Số điện thoại</label>
                                    <input className={inp} name="soDienThoai" type="tel" maxLength={10} placeholder="10 chữ số" />
                                </div>
                                <div>
                                    <label className={lbl}>Giới tính</label>
                                    <select className={inp} name="gioiTinh">
                                        <option value="NAM">Nam</option>
                                        <option value="NU">Nữ</option>
                                    </select>
                                </div>
                                <div>
                                    <label className={lbl}>Ngày sinh</label>
                                    <input className={inp} name="ngaySinh" type="date" />
                                </div>
                                <div className="col-span-2">
                                    <label className={lbl}>Địa chỉ</label>
                                    <input className={inp} name="diaChi" placeholder="VD: 123 Nguyễn Văn Linh, Đà Nẵng" />
                                </div>
                            </div>
                        </section>
                        {/* Trạng thái & Ghi chú */}
                        <section>
                            <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-3 pb-2 border-b border-slate-100">Trạng thái & Ghi chú</p>
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="flex items-center gap-2 cursor-pointer">
                                        <input type="checkbox" name="trangThai" className="w-4 h-4 rounded border-slate-300 text-blue-600 focus:ring-blue-500" />
                                        <span className="text-sm text-slate-700">Kích hoạt tài khoản</span>
                                    </label>
                                </div>
                                <div>
                                    <label className={lbl}>Ghi chú</label>
                                    <input className={inp} name="ghiChu" placeholder="VD: Giảng viên thỉnh giảng" />
                                </div>
                            </div>
                        </section>
                    </div>
                    <div className="flex gap-3 mt-6 pt-4 border-t border-slate-100">
                        <button type="button" onClick={onClose} className="flex-1 py-2.5 border border-slate-300 rounded-xl text-sm font-medium text-slate-700 hover:bg-slate-50">Hủy</button>
                        <button type="submit" disabled={isSubmitting} className="flex-1 py-2.5 bg-blue-600 text-white rounded-xl text-sm font-medium hover:bg-blue-700 disabled:opacity-50">
                            {isSubmitting ? 'Đang xử lý...' : (mode === 'create' ? 'Thêm Người Dùng' : 'Lưu Thay Đổi')}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}
