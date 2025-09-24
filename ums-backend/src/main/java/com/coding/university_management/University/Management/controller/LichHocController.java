package com.coding.university_management.University.Management.controller;

import com.coding.university_management.University.Management.dto.request.LichHocCreateRequest;
import com.coding.university_management.University.Management.dto.response.LichHocResponse;
import com.coding.university_management.University.Management.entity.LichHoc;
import com.coding.university_management.University.Management.mapper.LichHocMapper;
import com.coding.university_management.University.Management.repository.LichHocRepository;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/lich-hoc")
@RequiredArgsConstructor
public class LichHocController {

    private final LichHocRepository lichHocRepository;
    private final LichHocMapper lichHocMapper;

    @PostMapping
    public ResponseEntity<LichHocResponse> create(@Valid @RequestBody LichHocCreateRequest request) {
        LichHoc entity = lichHocMapper.toEntity(request);
        entity = lichHocRepository.save(entity);
        return ResponseEntity.ok(lichHocMapper.toResponse(entity));
    }

    @GetMapping
    public ResponseEntity<List<LichHocResponse>> getAll() {
        return ResponseEntity.ok(lichHocMapper.toResponseList(lichHocRepository.findAll()));
    }

    @GetMapping("/{id}")
    public ResponseEntity<LichHocResponse> getOne(@PathVariable String id) {
        return lichHocRepository.findById(id)
                .map(lichHocMapper::toResponse)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }
}
