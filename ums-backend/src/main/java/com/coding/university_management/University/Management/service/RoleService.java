package com.coding.university_management.University.Management.service;

import com.coding.university_management.University.Management.dto.request.RoleRequest;
import com.coding.university_management.University.Management.dto.response.RoleResponse;
import com.coding.university_management.University.Management.mapper.RoleMapper;
import com.coding.university_management.University.Management.repository.PermissionRepository;
import com.coding.university_management.University.Management.repository.RoleRepository;
import jakarta.transaction.Transactional;
import lombok.AccessLevel;
import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

import java.util.HashSet;
import java.util.List;

@Service
@RequiredArgsConstructor
@Slf4j
@FieldDefaults(level = AccessLevel.PRIVATE, makeFinal = true)
public class RoleService {

    RoleRepository roleRepository;
    PermissionRepository permissionRepository;
    RoleMapper roleMapper;

    @Transactional
    public RoleResponse create(RoleRequest request) {
        var role = roleMapper.toRole(request);

        var permissions = permissionRepository.findAllById(request.getPermissions());
        role.setPermissions(new HashSet<>(permissions));

        role = roleRepository.save(role);
        return roleMapper.toRoleResponse(role);
    }

    public List<RoleResponse> getAll() {
        return this.roleRepository.findAll()
                .stream()
                .map(role -> this.roleMapper.toRoleResponse(role))
                .toList();
    }

    @Transactional
    public void delete(String roleId) {
        this.roleRepository.deleteById(roleId);
    }

}
