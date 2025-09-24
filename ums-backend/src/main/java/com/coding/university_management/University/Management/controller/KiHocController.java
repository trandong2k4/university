package com.coding.university_management.University.Management.controller;

import com.coding.university_management.University.Management.dto.request.KiHocCreateRequest;
import com.coding.university_management.University.Management.dto.response.KiHocResponse;
import com.coding.university_management.University.Management.entity.KiHoc;
import com.coding.university_management.University.Management.mapper.KiHocMapper;
import com.coding.university_management.University.Management.repository.KiHocRepository;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/ki-hoc")
@RequiredArgsConstructor
public class KiHocController {

    private final KiHocRepository kiHocRepository;
    private final KiHocMapper kiHocMapper;

    @PostMapping
    public ResponseEntity<KiHocResponse> create(@Valid @RequestBody KiHocCreateRequest request) {
        KiHoc entity = kiHocMapper.toEntity(request);
        entity = kiHocRepository.save(entity);
        return ResponseEntity.ok(kiHocMapper.toResponse(entity));
    }

    @GetMapping
    public ResponseEntity<List<KiHocResponse>> getAll() {
        return ResponseEntity.ok(kiHocMapper.toResponseList(kiHocRepository.findAll()));
    }

    @GetMapping("/{id}")
    public ResponseEntity<KiHocResponse> getOne(@PathVariable String id) {
        return kiHocRepository.findById(id)
                .map(kiHocMapper::toResponse)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }
}
