package com.coding.university_management.University.Management.controller;

import com.coding.university_management.University.Management.dto.request.LoaiTinChiRequest;
import com.coding.university_management.University.Management.dto.response.ApiResponse;
import com.coding.university_management.University.Management.dto.response.LoaiTinChiResponse;
import com.coding.university_management.University.Management.service.LoaiTinChiService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequiredArgsConstructor
@RequestMapping("/loai-tin-chi")
public class LoaiTinChiController {

    private final LoaiTinChiService loaiTinChiService;

    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    public ApiResponse<LoaiTinChiResponse> create
            (@RequestBody @Valid LoaiTinChiRequest request) {
        return new ApiResponse<>(HttpStatus.CREATED.value(), "Tạo loại tín chỉ thành công",
                loaiTinChiService.create(request));
    }

    @GetMapping
    public ApiResponse<List<LoaiTinChiResponse>> getAll() {
        return new ApiResponse<>(HttpStatus.OK.value(), "Lấy danh sách loại tín chỉ thành công",
                loaiTinChiService.getAll());
    }

}
