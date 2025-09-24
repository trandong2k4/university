package com.coding.university_management.University.Management.service;

import com.coding.university_management.University.Management.dto.request.LoaiTinChiRequest;
import com.coding.university_management.University.Management.dto.response.LoaiTinChiResponse;
import com.coding.university_management.University.Management.entity.LoaiTinChi;
import com.coding.university_management.University.Management.mapper.LoaiTinChiMapper;
import com.coding.university_management.University.Management.repository.LoaiTinChiRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@RequiredArgsConstructor
public class LoaiTinChiService {

    private final LoaiTinChiRepository loaiTinChiRepository;
    private final LoaiTinChiMapper loaiTinChiMapper;

    @Transactional
    public LoaiTinChiResponse create(LoaiTinChiRequest request) {
        if (loaiTinChiRepository.existsByTenLoaiTinChi(request.getTenLoaiTinChi())) {
            throw new IllegalArgumentException("LoaiTinChi already exists");
        }
        LoaiTinChi entity = loaiTinChiMapper.toEntity(request);
        return loaiTinChiMapper.toResponse(loaiTinChiRepository.save(entity));
    }

    public List<LoaiTinChiResponse> getAll() {
        return loaiTinChiRepository.findAll()
                .stream()
                .map(loaiTinChiMapper::toResponse)
                .toList();
    }

}
