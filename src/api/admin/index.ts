// Re-export all admin API modules
export * from './dang-ky-tin-chi.api';
export * from './giang-day.api';
export * from './users.api';
export * from './role.api';
export * from './permissions.api';
export * from './role-permissions.api';
export * from './user-role.api';
export * from './school.api';
export * from './khoa.api';
export * from './nganh.api';
export * from './monhoc.api';
export * from './chuong-trinh-dao-tao.api';
export * from './hocki.api';
export * from './lop-hoc-phan.api';
export * from './lich.api';
export * from './giohoc.api';
export * from './phong.api';
export * from './nhan-vien.api';
export * from './hoc-vien.api';
export * from './bai-viet.api';
export * from './cot-diem.api';
export * from './admin.repository';

// Resolve duplicate names from star exports above.
export { getAllRoles } from './role.api';
export { getAvailableUsers } from './nhan-vien.api';
export { getUserRoles } from './user-role.api';
export { removeUserRole } from './user-role.api';
export type { ExcelImportResult } from './permissions.api';
export type { AvailableUser } from './nhan-vien.api';
