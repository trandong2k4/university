package com.coding.university_management.University.Management.mapper;

import com.coding.university_management.University.Management.dto.request.PhongHocCreateRequest;
import com.coding.university_management.University.Management.dto.response.PhongHocResponse;
import com.coding.university_management.University.Management.entity.PhongHoc;
import org.springframework.stereotype.Component;

import java.util.List;
import java.util.UUID;

@Component
public class PhongHocMapper {

    public PhongHoc toEntity(PhongHocCreateRequest req) {
        if (req == null) return null;
        return PhongHoc.builder()
                .maPhongHoc(UUID.randomUUID().toString())
                .tenPhong(req.getTenPhong())
                .toaNha(req.getToaNha())
                .tang(req.getTang())
                .sucChua(req.getSucChua())
                .build();
    }

    public PhongHocResponse toResponse(PhongHoc entity) {
        if (entity == null) return null;
        return PhongHocResponse.builder()
                .maPhongHoc(entity.getMaPhongHoc())
                .tenPhong(entity.getTenPhong())
                .toaNha(entity.getToaNha())
                .tang(entity.getTang())
                .sucChua(entity.getSucChua())
                .build();
    }

    public List<PhongHocResponse> toResponseList(List<PhongHoc> list) {
        return list.stream().map(this::toResponse).toList();
    }

}
