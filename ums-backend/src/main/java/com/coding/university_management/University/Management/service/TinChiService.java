package com.coding.university_management.University.Management.service;

import com.coding.university_management.University.Management.dto.request.TinChiCreateRequest;
import com.coding.university_management.University.Management.dto.response.TinChiResponse;
import com.coding.university_management.University.Management.entity.LoaiTinChi;
import com.coding.university_management.University.Management.entity.MonHoc;
import com.coding.university_management.University.Management.entity.TinChi;
import com.coding.university_management.University.Management.enums.TenTinChi;
import com.coding.university_management.University.Management.repository.LoaiTinChiRepository;
import com.coding.university_management.University.Management.repository.MonHocRepository;
import com.coding.university_management.University.Management.repository.TinChiRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
public class TinChiService {

    private final TinChiRepository tinChiRepository;
    private final LoaiTinChiRepository loaiTinChiRepository;
    private final MonHocRepository monHocRepository;

    @Transactional
    public TinChiResponse create(TinChiCreateRequest req) {
        LoaiTinChi loai = loaiTinChiRepository.findById(req.getMaLoaiTinChi())
                .orElseThrow(() -> new IllegalArgumentException("LoaiTinChi not found"));

        MonHoc monHoc = monHocRepository.findById(req.getMaMonHoc())
                .orElseThrow(() -> new IllegalArgumentException("MonHoc not found"));

        TinChi tinChi = TinChi.builder()
                .soTinChi(req.getSoTinChi())
                .giaTriTinChi(req.getGiaTriTinChi())
                .loaiTinChi(loai)
                .monHoc(monHoc)
                .tenTinChi(TenTinChi.valueOf(req.getTenTinChi().toUpperCase()))
                .build();

        tinChi = tinChiRepository.save(tinChi);

        // maintain owning-side collections (optional for persistence, good for consistency)
        loai.getTinChis().add(tinChi);
        monHoc.getTinChis().add(tinChi);

        return TinChiResponse.builder()
                .maTinChi(tinChi.getMaTinChi())
                .soTinChi(tinChi.getSoTinChi())
                .giaTriTinChi(tinChi.getGiaTriTinChi())
                .tenTinChi(tinChi.getTenTinChi().name())
                .maLoaiTinChi(loai.getMaLoaiTinChi())
                .maMonHoc(monHoc.getMaMonHoc())
                .build();
    }

}
