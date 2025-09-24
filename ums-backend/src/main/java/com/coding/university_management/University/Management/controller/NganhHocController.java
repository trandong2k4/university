package com.coding.university_management.University.Management.controller;

import com.coding.university_management.University.Management.dto.request.NganhHocRequest;
import com.coding.university_management.University.Management.dto.response.ApiResponse;
import com.coding.university_management.University.Management.dto.response.NganhHocResponse;
import com.coding.university_management.University.Management.service.NganhHocService;
import jakarta.validation.Valid;
import lombok.AccessLevel;
import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/nganh-hoc")
@RequiredArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE, makeFinal = true)
public class NganhHocController {

    NganhHocService nganhHocService;

    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    public ApiResponse<NganhHocResponse> createNganhHoc
            (@RequestBody @Valid NganhHocRequest request) {
        return new ApiResponse<>(HttpStatus.CREATED.value(),
                "Tạo ngành học thành công",
                nganhHocService.createNganhHoc(request));
    }

    @GetMapping
    public ApiResponse<List<NganhHocResponse>> getAllNganhHoc() {
        return new ApiResponse<>(HttpStatus.OK.value(),
                "Lấy danh sách ngành học thành công",
                nganhHocService.getAllNganhHoc());
    }

    @GetMapping("/{id}")
    public ApiResponse<NganhHocResponse> getNganhHocById(@PathVariable String id) {
        return new ApiResponse<>(HttpStatus.OK.value(),
                "Lấy thông tin ngành học thành công",
                nganhHocService.getNganhHocById(id));
    }

    @PutMapping("/{id}")
    public ApiResponse<NganhHocResponse> updateNganhHoc(@PathVariable String id, @RequestBody @Valid NganhHocRequest request) {
        return new ApiResponse<>(HttpStatus.OK.value(),
                "Cập nhật ngành học thành công",
                nganhHocService.updateNganhHoc(id, request));
    }

    @DeleteMapping("/{id}")
    public ApiResponse<Void> deleteNganhHoc(@PathVariable String id) {
        nganhHocService.deleteNganhHoc(id);
        return new ApiResponse<>(HttpStatus.OK.value(), "Xóa ngành học thành công");
    }
}