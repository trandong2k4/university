package com.coding.university_management.University.Management.dto.request;

import jakarta.validation.constraints.NotBlank;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class LoaiTinChiRequest {

    @NotBlank
    private String tenLoaiTinChi;

}
