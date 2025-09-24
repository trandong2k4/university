package com.coding.university_management.University.Management.mapper;

import com.coding.university_management.University.Management.dto.request.BuoiHocCreateRequest;
import com.coding.university_management.University.Management.dto.response.BuoiHocResponse;
import com.coding.university_management.University.Management.dto.response.GioHocResponse;
import com.coding.university_management.University.Management.dto.response.LichHocResponse;
import com.coding.university_management.University.Management.entity.BuoiHoc;
import com.coding.university_management.University.Management.entity.GioHoc;
import com.coding.university_management.University.Management.entity.LichHoc;
import com.coding.university_management.University.Management.repository.GioHocRepository;
import com.coding.university_management.University.Management.repository.LichHocRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Component;

import java.util.List;

@Component
@RequiredArgsConstructor
public class BuoiHocMapper {
    private final GioHocRepository gioHocRepository;
    private final LichHocRepository lichHocRepository;

    private final LichHocMapper lichHocMapper;
    private final GioHocMapper gioHocMapper;

    public BuoiHoc toEntity(BuoiHocCreateRequest req) {
        if (req == null) return null;

        // Find GioHoc by ID
        GioHoc gioHoc = gioHocRepository.findById(req.getMaGioHoc())
                .orElseThrow(() -> new RuntimeException("GioHoc not found with ID: " + req.getMaGioHoc()));

        // Find LichHoc by ID
        LichHoc lichHoc = lichHocRepository.findById(req.getMaLichHoc())
                .orElseThrow(() -> new RuntimeException("LichHoc not found with ID: " + req.getMaLichHoc()));

        return BuoiHoc.builder()
                .thuTrongTuan(req.getThuTrongTuan())
                .gioHoc(gioHoc)
                .lichHoc(lichHoc)
                .build();
    }

    public BuoiHocResponse toResponse(BuoiHoc entity) {
        if (entity == null) return null;

        GioHocResponse gioHocResponse = gioHocMapper.toResponse(entity.getGioHoc());
        LichHocResponse lichHocResponse = lichHocMapper.toResponse(entity.getLichHoc());

        return BuoiHocResponse.builder()
                .maBuoiHoc(entity.getMaBuoiHoc())
                .thuTrongTuan(entity.getThuTrongTuan())
                .gioHoc(gioHocResponse)
                .lichHoc(lichHocResponse)  // Use the full lichHocResponse
                .build();
    }

    public List<BuoiHocResponse> toResponseList(List<BuoiHoc> list) {
        return list.stream().map(this::toResponse).toList();
    }
}
