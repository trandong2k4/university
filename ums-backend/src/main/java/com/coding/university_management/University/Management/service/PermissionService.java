package com.coding.university_management.University.Management.service;

import com.coding.university_management.University.Management.dto.request.PermissionRequest;
import com.coding.university_management.University.Management.dto.response.PermissionResponse;
import com.coding.university_management.University.Management.entity.Permission;
import com.coding.university_management.University.Management.mapper.PermissionMapper;
import com.coding.university_management.University.Management.repository.PermissionRepository;
import lombok.AccessLevel;
import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
@RequiredArgsConstructor
@Slf4j
@FieldDefaults(level = AccessLevel.PRIVATE, makeFinal = true)
public class PermissionService {

    PermissionRepository permissionRepository;
    PermissionMapper permissionMapper;

    public PermissionResponse create(PermissionRequest request) {
        Permission permission = this.permissionMapper.toPermission(request);
        permission = this.permissionRepository.save(permission);
        return this.permissionMapper.toPermissionResponse(permission);
    }

    public List<PermissionResponse> getAll() {
        List<Permission> permissions = this.permissionRepository.findAll();
        return permissions.stream()
                .map(permission -> this.permissionMapper.toPermissionResponse(permission))
                .toList();
    }

    public void delete(String permissionId) {
        this.permissionRepository.deleteById(permissionId);
    }

}
