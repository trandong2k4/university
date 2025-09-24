package com.coding.university_management.University.Management.mapper;

import com.coding.university_management.University.Management.dto.request.LichHocCreateRequest;
import com.coding.university_management.University.Management.dto.response.LichHocResponse;
import com.coding.university_management.University.Management.entity.KiHoc;
import com.coding.university_management.University.Management.entity.LichHoc;
import com.coding.university_management.University.Management.entity.MonHoc;
import com.coding.university_management.University.Management.entity.PhongHoc;
import com.coding.university_management.University.Management.repository.KiHocRepository;
import com.coding.university_management.University.Management.repository.MonHocRepository;
import com.coding.university_management.University.Management.repository.PhongHocRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Component;

import java.util.List;

@Component
@RequiredArgsConstructor
public class LichHocMapper {
    private final MonHocRepository monHocRepository;
    private final PhongHocRepository phongHocRepository;
    private final KiHocRepository kiHocRepository;

    private final MonHocMapper monHocMapper;
    private final PhongHocMapper phongHocMapper;
    private final KiHocMapper kiHocMapper;

    public LichHoc toEntity(LichHocCreateRequest req) {
        if (req == null) return null;

        MonHoc monHoc = monHocRepository.findById(req.getMaMonHoc())
                .orElseThrow(() -> new RuntimeException("MonHoc not found"));

        PhongHoc phongHoc = phongHocRepository.findById(req.getMaPhongHoc())
                .orElseThrow(() -> new RuntimeException("PhongHoc not found"));

        KiHoc kiHoc = kiHocRepository.findById(req.getMaKiHoc())
                .orElseThrow(() -> new RuntimeException("KiHoc not found"));

        return LichHoc.builder()
                .maLichHoc(req.getMaLichHoc())
                .ngayBatDau(req.getNgayBatDau())
                .ngayKetThuc(req.getNgayKetThuc())
                .phongHoc(phongHoc)
                .kiHoc(kiHoc)
                .monHoc(monHoc)
                .build();
    }

    public LichHocResponse toResponse(LichHoc entity) {
        if (entity == null) return null;

        return LichHocResponse.builder()
                .maLichHoc(entity.getMaLichHoc())
                .ngayBatDau(entity.getNgayBatDau())
                .ngayKetThuc(entity.getNgayKetThuc())
                .phongHoc(phongHocMapper.toResponse(entity.getPhongHoc()))
                .kiHoc(kiHocMapper.toResponse(entity.getKiHoc()))
                .monHoc(monHocMapper.toResponse(entity.getMonHoc()))
                .build();
    }

    public List<LichHocResponse> toResponseList(List<LichHoc> list) {
        return list.stream().map(this::toResponse).toList();
    }
}
