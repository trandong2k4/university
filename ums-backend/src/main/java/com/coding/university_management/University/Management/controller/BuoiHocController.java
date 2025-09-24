package com.coding.university_management.University.Management.controller;

import com.coding.university_management.University.Management.dto.request.BuoiHocCreateRequest;
import com.coding.university_management.University.Management.dto.response.BuoiHocResponse;
import com.coding.university_management.University.Management.entity.BuoiHoc;
import com.coding.university_management.University.Management.mapper.BuoiHocMapper;
import com.coding.university_management.University.Management.repository.BuoiHocRepository;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/buoi-hoc")
@RequiredArgsConstructor
public class BuoiHocController {

    private final BuoiHocRepository buoiHocRepository;
    private final BuoiHocMapper buoiHocMapper;

    @PostMapping
    public ResponseEntity<BuoiHocResponse> create(@Valid @RequestBody BuoiHocCreateRequest request) {
        BuoiHoc entity = buoiHocMapper.toEntity(request);
        entity = buoiHocRepository.save(entity);
        return ResponseEntity.ok(buoiHocMapper.toResponse(entity));
    }

    @GetMapping
    public ResponseEntity<List<BuoiHocResponse>> getAll() {
        return ResponseEntity.ok(buoiHocMapper.toResponseList(buoiHocRepository.findAll()));
    }

    @GetMapping("/{id}")
    public ResponseEntity<BuoiHocResponse> getOne(@PathVariable String id) {
        return buoiHocRepository.findById(id)
                .map(buoiHocMapper::toResponse)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }
}
