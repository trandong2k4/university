package com.coding.university_management.University.Management.controller;

import com.coding.university_management.University.Management.dto.request.RoleRequest;
import com.coding.university_management.University.Management.dto.response.ApiResponse;
import com.coding.university_management.University.Management.dto.response.RoleResponse;
import com.coding.university_management.University.Management.service.RoleService;
import lombok.AccessLevel;
import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;
import lombok.extern.slf4j.Slf4j;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/roles")
@RequiredArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE, makeFinal = true)
@Slf4j
public class RoleController {

    RoleService roleService;

    @PostMapping
    ApiResponse<RoleResponse> create(@RequestBody RoleRequest request) {
        return new ApiResponse<>(200,
                "Tạo role thành công", this.roleService.create(request));
    }

    @GetMapping
    ApiResponse<List<RoleResponse>> getAll() {
        return new ApiResponse<>(200,
                "Lấy danh sách role thành công", this.roleService.getAll());
    }

    @DeleteMapping("/{roleId}")
    ApiResponse<Void> delete(@PathVariable(name = "roleId") String permissionId) {
        this.roleService.delete(permissionId);
        return new ApiResponse<Void>(200, "Xóa role thành công");
    }

}
