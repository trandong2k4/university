package com.coding.university_management.University.Management.controller;

import com.coding.university_management.University.Management.dto.request.GioHocCreateRequest;
import com.coding.university_management.University.Management.dto.response.GioHocResponse;
import com.coding.university_management.University.Management.entity.GioHoc;
import com.coding.university_management.University.Management.mapper.GioHocMapper;
import com.coding.university_management.University.Management.repository.GioHocRepository;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/gio-hoc")
@RequiredArgsConstructor
public class GioHocController {

    private final GioHocRepository gioHocRepository;
    private final GioHocMapper gioHocMapper;

    @PostMapping
    public ResponseEntity<GioHocResponse> create(@Valid @RequestBody GioHocCreateRequest request) {
        GioHoc entity = gioHocMapper.toEntity(request);
        entity = gioHocRepository.save(entity);
        return ResponseEntity.ok(gioHocMapper.toResponse(entity));
    }

    @GetMapping
    public ResponseEntity<List<GioHocResponse>> getAll() {
        return ResponseEntity.ok(gioHocMapper.toResponseList(gioHocRepository.findAll()));
    }

    @GetMapping("/{id}")
    public ResponseEntity<GioHocResponse> getOne(@PathVariable String id) {
        return gioHocRepository.findById(id)
                .map(gioHocMapper::toResponse)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }
}