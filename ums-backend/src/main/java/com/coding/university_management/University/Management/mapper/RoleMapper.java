package com.coding.university_management.University.Management.mapper;

import com.coding.university_management.University.Management.dto.request.RoleRequest;
import com.coding.university_management.University.Management.dto.response.PermissionResponse;
import com.coding.university_management.University.Management.dto.response.RoleResponse;
import com.coding.university_management.University.Management.entity.Role;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;

/**
 * Mapper để chuyển đổi giữa Role entity và các DTO liên quan.
 * - componentModel = "spring": Tích hợp với Spring DI.
 * - uses = {PermissionMapper.class}: Cho phép RoleMapper sử dụng các phương thức từ PermissionMapper.
 */
@Mapper(componentModel = "spring", uses = {PermissionMapper.class})
public interface RoleMapper {

    @Mapping(target = "permissions", ignore = true)
    Role toRole(RoleRequest request);

    // MapStruct sẽ tự động tìm phương thức phù hợp bên dưới để map trường "permissions"
    RoleResponse toRoleResponse(Role role);

}