package com.coding.university_management.University.Management.mapper;

import com.coding.university_management.University.Management.dto.request.UserCreationRequest;
import com.coding.university_management.University.Management.dto.request.UserUpdateRequest;
import com.coding.university_management.University.Management.dto.response.RoleResponse;
import com.coding.university_management.University.Management.dto.response.UserResponse;
import com.coding.university_management.University.Management.entity.User;

import org.mapstruct.Mapper;
import org.mapstruct.Mapping;
import org.mapstruct.MappingTarget;

/**
 * Mapper để chuyển đổi giữa User entity và các DTO liên quan.
 * - componentModel = "spring": Tích hợp với Spring DI.
 * - uses = {RoleMapper.class}: Cho phép UserMapper sử dụng các phương thức từ RoleMapper.
 *   Đây là chìa khóa để map các trường phức tạp như 'roles' và 'permissions'.
 */
@Mapper(componentModel = "spring", uses = {RoleMapper.class}) // THÊM: uses = {RoleMapper.class}
public interface UserMapper {

    // SỬA LỖI 1: Thêm ignore = true để MapStruct không cố gắng map trường 'roles'
    @Mapping(target = "roles", ignore = true)
    // SỬA LỖI 2: Sửa lỗi chính tả từ "toUSer" -> "toUser"
    User toUser(UserCreationRequest request);

    // MapStruct sẽ tự động sử dụng phương thức bên dưới để map trường "roles"
    UserResponse toUserResponse(User user);

    // Bỏ qua trường roles, không mapping --> mapping thủ công trong Service
    @Mapping(target = "roles", ignore = true)
    void updateUser(@MappingTarget User user, UserUpdateRequest request);

    /**
     * Dạy cho MapStruct cách chuyển đổi một đối tượng UserRole (bảng trung gian)
     * thành một RoleResponse (DTO) hoàn chỉnh.
     */
//    @Mapping(target = "name", source = "role.name")
//    @Mapping(target = "description", source = "role.description")
//    @Mapping(target = "permissions", source = "role.permissions") // <-- Dòng quan trọng nhất
//    RoleResponse userRoleToRoleResponse(UserRole userRole);
}
