package com.coding.university_management.University.Management.mapper;

import com.coding.university_management.University.Management.dto.request.PermissionRequest;
import com.coding.university_management.University.Management.dto.response.PermissionResponse;
import com.coding.university_management.University.Management.entity.Permission;
import org.mapstruct.Mapper;

@Mapper(componentModel = "spring")
public interface PermissionMapper {

    Permission toPermission(PermissionRequest request);
    PermissionResponse toPermissionResponse(Permission permission);

}
