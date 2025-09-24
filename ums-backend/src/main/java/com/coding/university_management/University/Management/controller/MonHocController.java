package com.coding.university_management.University.Management.controller;

import com.coding.university_management.University.Management.dto.request.MonHocCreateRequest;
import com.coding.university_management.University.Management.dto.response.ApiResponse;
import com.coding.university_management.University.Management.dto.response.MonHocResponse;
import com.coding.university_management.University.Management.service.MonHocService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.*;

@RestController
@RequiredArgsConstructor
@RequestMapping("/mon-hoc")
public class MonHocController {

    private final MonHocService monHocService;

    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    public ApiResponse<MonHocResponse> create(@RequestBody @Valid MonHocCreateRequest request) {
        return new ApiResponse<>(HttpStatus.CREATED.value(),
                "Tạo môn học thành công",
                monHocService.createMonHoc(request));
    }
}