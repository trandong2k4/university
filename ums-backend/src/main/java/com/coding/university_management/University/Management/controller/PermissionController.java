package com.coding.university_management.University.Management.controller;

import com.coding.university_management.University.Management.dto.request.PermissionRequest;
import com.coding.university_management.University.Management.dto.response.ApiResponse;
import com.coding.university_management.University.Management.dto.response.PermissionResponse;
import com.coding.university_management.University.Management.service.PermissionService;
import lombok.AccessLevel;
import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;
import lombok.extern.slf4j.Slf4j;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/permissions")
@RequiredArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE, makeFinal = true)
@Slf4j
public class PermissionController {

    PermissionService permissionService;

    @PostMapping
    ApiResponse<PermissionResponse> create(@RequestBody PermissionRequest request) {
        return new ApiResponse<>(200,
                "Tạo permission thành công", this.permissionService.create(request));
    }

    @GetMapping
    ApiResponse<List<PermissionResponse>> getAll() {
        return new ApiResponse<>(200,
                "Lấy danh sách permission thành công", this.permissionService.getAll());
    }

    @DeleteMapping("/{permissionId}")
    ApiResponse<Void> delete(@PathVariable(name = "permissionId") String permissionId) {
        this.permissionService.delete(permissionId);
        return new ApiResponse<Void>(200, "Xóa permission thành công");
    }

}
