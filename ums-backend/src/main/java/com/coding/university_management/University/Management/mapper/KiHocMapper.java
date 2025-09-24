package com.coding.university_management.University.Management.mapper;

import com.coding.university_management.University.Management.dto.request.KiHocCreateRequest;
import com.coding.university_management.University.Management.dto.response.KiHocResponse;
import com.coding.university_management.University.Management.entity.KiHoc;
import org.springframework.stereotype.Component;

import java.util.List;

@Component
public class KiHocMapper {

    public KiHoc toEntity(KiHocCreateRequest req) {
        if (req == null) return null;
        return KiHoc.builder()
                .maKiHoc(req.getMaKiHoc())
                .tenKiHoc(req.getTenKiHoc())
                .ngayBatDau(req.getNgayBatDau())
                .ngayKetThuc(req.getNgayKetThuc())
                .build();
    }

    public KiHocResponse toResponse(KiHoc entity) {
        if (entity == null) return null;
        return KiHocResponse.builder()
                .maKiHoc(entity.getMaKiHoc())
                .tenKiHoc(entity.getTenKiHoc())
                .ngayBatDau(entity.getNgayBatDau())
                .ngayKetThuc(entity.getNgayKetThuc())
                .build();
    }

    public List<KiHocResponse> toResponseList(List<KiHoc> list) {
        return list.stream().map(this::toResponse).toList();
    }
}
