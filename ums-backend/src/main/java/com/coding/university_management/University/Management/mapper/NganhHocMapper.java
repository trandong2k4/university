package com.coding.university_management.University.Management.mapper;

import com.coding.university_management.University.Management.dto.request.NganhHocRequest;
import com.coding.university_management.University.Management.dto.response.NganhHocResponse;
import com.coding.university_management.University.Management.entity.NganhHoc;
import org.mapstruct.Mapper;
import org.mapstruct.MappingTarget;

@Mapper(componentModel = "spring")
public interface NganhHocMapper {
    NganhHoc toNganhHoc(NganhHocRequest request);
    NganhHocResponse toNganhHocResponse(NganhHoc nganhHoc);
    void updateNganhHoc(@MappingTarget NganhHoc nganhHoc, NganhHocRequest request);
}