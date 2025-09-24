package com.coding.university_management.University.Management.dto.response;

import lombok.*;
import lombok.experimental.FieldDefaults;

import java.math.BigDecimal;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
@FieldDefaults(level = AccessLevel.PRIVATE)
public class TinChiResponse {

    private String maTinChi;
    private Integer soTinChi;
    private BigDecimal giaTriTinChi;
    private String tenTinChi;
    private String maLoaiTinChi;
    private String maMonHoc;

}
