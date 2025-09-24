package com.coding.university_management.University.Management.dto.request;

import jakarta.validation.constraints.Digits;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.Getter;
import lombok.Setter;

import java.math.BigDecimal;

@Getter
@Setter
public class TinChiCreateRequest {

    @NotNull
    private Integer soTinChi;

    @NotNull
    @Digits(integer = 10, fraction = 2)
    private BigDecimal giaTriTinChi;

    @NotBlank
    private String maLoaiTinChi;

    @NotBlank
    private String tenTinChi; // enum TenTinChi

    @NotBlank
    private String maMonHoc;

}
