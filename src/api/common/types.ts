// Types for Users

// Types for Roles
export type RoleItem = {
    id: string;
    maRole: string;
    moTa?: string;
    createdAt?: string;
};

// Types for Permissions
export type PermissionsItem = {
    id: string;
    maPermissions: string;
    moTa?: string;
};

// Types for UserRole (Assignment)
export type UserRoleItem = {
    id: string;
    usersId: string;
    roleId: string;
    createdAt: string;
    updatedAt?: string;
};

// Auth Types
export type AuthRolePermission = {
    maRole: string;
    maPermissions?: string | null;
};

// School Types (existing)
export type SchoolItem = {
    id: string;
    maTruong: string;
    tenTruong: string;
    diaChi?: string;
    moTa?: string;
    nguoiDaiDien?: string;
    ngayThanhLap?: string;
    createdAt?: string;
    updatedAt?: string;
};


enum GioiTinhEnum {
    NAM = 'NAM',
    NU = 'NU'
}

export { GioiTinhEnum };


export type UsersItem = {
    id: string;
    userName: string;
    email: string;
    cccd: string;
    hoTen: string;
    diaChi?: string;
    gioiTinh?: GioiTinhEnum.NAM | GioiTinhEnum.NU;
    ngaySinh?: string;
    soDienThoai?: string;
    trangThai: boolean;
    ghiChu?: string;
    createAt?: string;
    updateAt?: string;
    roles?: string[];
};

export type CreateUserRequest = {
    userName: string;
    passWord: string;
    email: string;
    cccd: string;
    hoTen: string;
    diaChi?: string;
    gioiTinh?: GioiTinhEnum.NAM | GioiTinhEnum.NU;
    ngaySinh?: string;
    soDienThoai?: string;
    trangThai: boolean;
    ghiChu?: string;
    maRole?: string;
};

export type UpdateUserRequest = Partial<CreateUserRequest>;

export type UserRoleAssignment = {
    id: string;
    userId: string;
    roleId: string;
    userName: string;
    maRole: string;
    createdAt?: string;
    updatedAt?: string;
};

// Batch delete result from backend
export type BatchDeleteResult = {
    totalRequested: number;
    deletedCount: number;
    failedCount: number;
    failedUsers: {
        id: string;
        hoTen: string | null;
        reason: string;
    }[];
};
