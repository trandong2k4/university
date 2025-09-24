package com.coding.university_management.University.Management.controller;

import com.coding.university_management.University.Management.dto.request.PhongHocCreateRequest;
import com.coding.university_management.University.Management.dto.response.PhongHocResponse;
import com.coding.university_management.University.Management.entity.PhongHoc;
import com.coding.university_management.University.Management.mapper.PhongHocMapper;
import com.coding.university_management.University.Management.repository.PhongHocRepository;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/phong-hoc")
@RequiredArgsConstructor
public class PhongHocController {

    private final PhongHocRepository phongHocRepository;
    private final PhongHocMapper phongHocMapper;

    @PostMapping
    public ResponseEntity<PhongHocResponse> create(@Valid @RequestBody PhongHocCreateRequest request) {
        PhongHoc entity = phongHocMapper.toEntity(request);
        entity = phongHocRepository.save(entity);
        return ResponseEntity.ok(phongHocMapper.toResponse(entity));
    }

    @GetMapping
    public ResponseEntity<List<PhongHocResponse>> getAll() {
        return ResponseEntity.ok(phongHocMapper.toResponseList(phongHocRepository.findAll()));
    }

    @GetMapping("/{id}")
    public ResponseEntity<PhongHocResponse> getOne(@PathVariable String id) {
        return phongHocRepository.findById(id)
                .map(phongHocMapper::toResponse)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

}
