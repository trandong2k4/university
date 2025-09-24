package com.coding.university_management.University.Management.service;

import com.coding.university_management.University.Management.dto.request.MonHocCreateRequest;
import com.coding.university_management.University.Management.dto.request.TinChiCreateRequest;
import com.coding.university_management.University.Management.dto.response.MonHocResponse;
import com.coding.university_management.University.Management.entity.LoaiTinChi;
import com.coding.university_management.University.Management.entity.MonHoc;
import com.coding.university_management.University.Management.entity.NganhHoc;
import com.coding.university_management.University.Management.entity.TinChi;
import com.coding.university_management.University.Management.enums.TenTinChi;
import com.coding.university_management.University.Management.mapper.MonHocMapper;
import com.coding.university_management.University.Management.repository.LoaiTinChiRepository;
import com.coding.university_management.University.Management.repository.MonHocRepository;
import com.coding.university_management.University.Management.repository.NganhHocRepository;
import com.coding.university_management.University.Management.repository.TinChiRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.ArrayList;
import java.util.List;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class MonHocService {

    private final MonHocRepository monHocRepository;
    private final NganhHocRepository nganhHocRepository;
    private final TinChiRepository tinChiRepository;
    private final LoaiTinChiRepository loaiTinChiRepository;
    private final MonHocMapper monHocMapper;

    @Transactional
    public MonHocResponse createMonHoc(MonHocCreateRequest request) {
        // Generate ID if not provided
        if (request.getMaMonHoc() == null || request.getMaMonHoc().isBlank()) {
            request.setMaMonHoc(UUID.randomUUID().toString());
        }

        // Check if ID already exists
        if (monHocRepository.existsById(request.getMaMonHoc())) {
            throw new IllegalArgumentException("maMonHoc already exists");
        }

        // Use mapper to create entity (now with concrete implementation)
        MonHoc monHoc = monHocMapper.toEntity(request);
        monHoc.setMaMonHoc(request.getMaMonHoc());

        // Set prerequisite if specified
        if (request.getMaMonHocTienQuyet() != null && !request.getMaMonHocTienQuyet().isBlank()) {
            MonHoc pre = monHocRepository.findById(request.getMaMonHocTienQuyet())
                    .orElseThrow(() -> new IllegalArgumentException("Prerequisite not found"));
            monHoc.setMonHocTienQuyet(pre);
        }

        // Save entity first to get ID
        monHoc = monHocRepository.save(monHoc);

        // Link with majors
        if (request.getMaNganhHocs() != null && !request.getMaNganhHocs().isEmpty()) {
            List<NganhHoc> majors = nganhHocRepository.findAllById(request.getMaNganhHocs());
            if (majors.size() != request.getMaNganhHocs().size()) {
                throw new IllegalArgumentException("Some maNganhHoc not found");
            }

            for (NganhHoc nh : majors) {
                nh.getMonHocs().add(monHoc);
                monHoc.getNganhHocs().add(nh);
            }
            nganhHocRepository.saveAll(majors); // Save the owning side
        }

        // Create and link TinChi entries
        if (request.getTinChis() != null && !request.getTinChis().isEmpty()) {
            List<TinChi> toSave = new ArrayList<>();
            for (TinChiCreateRequest tReq : request.getTinChis()) {
                TinChi tc = TinChi.builder()
                        .soTinChi(tReq.getSoTinChi())
                        .giaTriTinChi(tReq.getGiaTriTinChi())
                        .tenTinChi(TenTinChi.valueOf(tReq.getTenTinChi()))
                        .monHoc(monHoc)
                        .build();

                LoaiTinChi loai = loaiTinChiRepository.findById(tReq.getMaLoaiTinChi())
                        .orElseThrow(() -> new IllegalArgumentException("LoaiTinChi not found: " + tReq.getMaLoaiTinChi()));
                tc.setLoaiTinChi(loai);
                toSave.add(tc);
            }
            tinChiRepository.saveAll(toSave);
            monHoc.getTinChis().addAll(toSave);
        }

        // Refresh entity to ensure all relationships are loaded
        MonHoc finalMonHoc = monHocRepository.findById(monHoc.getMaMonHoc()).orElse(monHoc);

        // Use the new mapper implementation to create response with full NganhHocResponse objects
        return monHocMapper.toResponse(finalMonHoc);
    }
}
