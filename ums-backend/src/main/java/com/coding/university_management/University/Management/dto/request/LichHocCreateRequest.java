package com.coding.university_management.University.Management.dto.request;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.*;
import lombok.experimental.FieldDefaults;

import java.time.LocalDate;

@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE)
public class LichHocCreateRequest {
    @NotBlank
    String maLichHoc;

    @NotNull
    LocalDate ngayBatDau;

    @NotNull
    LocalDate ngayKetThuc;

    @NotBlank
    String maPhongHoc;

    @NotBlank
    String maKiHoc;

    @NotBlank
    String maMonHoc;
}
