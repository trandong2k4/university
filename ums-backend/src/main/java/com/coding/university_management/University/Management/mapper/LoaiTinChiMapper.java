package com.coding.university_management.University.Management.mapper;

import com.coding.university_management.University.Management.dto.request.LoaiTinChiRequest;
import com.coding.university_management.University.Management.dto.response.LoaiTinChiResponse;
import com.coding.university_management.University.Management.entity.LoaiTinChi;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;

@Mapper(componentModel = "spring")
public interface LoaiTinChiMapper {

    @Mapping(target = "maLoaiTinChi", ignore = true)
    LoaiTinChi toEntity(LoaiTinChiRequest request);

    LoaiTinChiResponse toResponse(LoaiTinChi entity);

}
