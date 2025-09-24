package com.coding.university_management.University.Management.mapper;

import com.coding.university_management.University.Management.dto.request.GioHocCreateRequest;
import com.coding.university_management.University.Management.dto.response.GioHocResponse;
import com.coding.university_management.University.Management.entity.GioHoc;
import org.springframework.stereotype.Component;

import java.util.List;
import java.util.UUID;

@Component
public class GioHocMapper {

    public GioHoc toEntity(GioHocCreateRequest req) {
        if (req == null) return null;
        return GioHoc.builder()
                .maGioHoc(UUID.randomUUID().toString())
                .tenGioHoc(req.getTenGioHoc())
                .thoiGianBatDau(req.getThoiGianBatDau())
                .thoiGianKetThuc(req.getThoiGianKetThuc())
                .build();
    }

    public GioHocResponse toResponse(GioHoc entity) {
        if (entity == null) return null;
        return GioHocResponse.builder()
                .maGioHoc(entity.getMaGioHoc())
                .tenGioHoc(entity.getTenGioHoc())
                .thoiGianBatDau(entity.getThoiGianBatDau())
                .thoiGianKetThuc(entity.getThoiGianKetThuc())
                .build();
    }

    public List<GioHocResponse> toResponseList(List<GioHoc> list) {
        return list.stream().map(this::toResponse).toList();
    }
}
