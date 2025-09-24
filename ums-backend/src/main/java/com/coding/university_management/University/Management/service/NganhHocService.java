package com.coding.university_management.University.Management.service;

import com.coding.university_management.University.Management.dto.request.NganhHocRequest;
import com.coding.university_management.University.Management.dto.response.NganhHocResponse;
import com.coding.university_management.University.Management.entity.NganhHoc;
import com.coding.university_management.University.Management.exception.AppException;
import com.coding.university_management.University.Management.exception.ErrorCode;
import com.coding.university_management.University.Management.mapper.NganhHocMapper;
import com.coding.university_management.University.Management.repository.NganhHocRepository;
import jakarta.transaction.Transactional;
import lombok.AccessLevel;
import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE, makeFinal = true)
public class NganhHocService {

    NganhHocRepository nganhHocRepository;
    NganhHocMapper nganhHocMapper;

    @PreAuthorize("hasRole('QUANTRIVIEN')")
    @Transactional
    public NganhHocResponse createNganhHoc(NganhHocRequest request) {
        if (nganhHocRepository.existsByTenNganhHoc(request.getTenNganhHoc())) {
            throw new AppException(ErrorCode.NGANH_HOC_EXISTED);
        }
        NganhHoc nganhHoc = nganhHocMapper.toNganhHoc(request);
        return nganhHocMapper.toNganhHocResponse(nganhHocRepository.save(nganhHoc));
    }

    public List<NganhHocResponse> getAllNganhHoc() {
        return nganhHocRepository.findAll().stream()
                .map(nganhHocMapper::toNganhHocResponse)
                .collect(Collectors.toList());
    }

    public NganhHocResponse getNganhHocById(String id) {
        NganhHoc nganhHoc = nganhHocRepository.findById(id)
                .orElseThrow(() -> new AppException(ErrorCode.NGANH_HOC_NOT_FOUND));
        return nganhHocMapper.toNganhHocResponse(nganhHoc);
    }

    @PreAuthorize("hasRole('QUANTRIVIEN')")
    @Transactional
    public NganhHocResponse updateNganhHoc(String id, NganhHocRequest request) {
        NganhHoc nganhHoc = nganhHocRepository.findById(id)
                .orElseThrow(() -> new AppException(ErrorCode.NGANH_HOC_NOT_FOUND));

        nganhHocMapper.updateNganhHoc(nganhHoc, request);
        return nganhHocMapper.toNganhHocResponse(nganhHocRepository.save(nganhHoc));
    }

    @PreAuthorize("hasRole('QUANTRIVIEN')")
    @Transactional
    public void deleteNganhHoc(String id) {
        if (!nganhHocRepository.existsById(id)) {
            throw new AppException(ErrorCode.NGANH_HOC_NOT_FOUND);
        }
        nganhHocRepository.deleteById(id);
    }
}