package com.coding.university_management.University.Management.dto.request;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import lombok.*;
import lombok.experimental.FieldDefaults;

import java.time.LocalDate;

@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE)
public class KiHocCreateRequest {
    @NotBlank
    @Size(max = 36)
    String maKiHoc;

    @NotBlank
    @Size(max = 50)
    String tenKiHoc;

    @NotNull
    LocalDate ngayBatDau;

    @NotNull
    LocalDate ngayKetThuc;
}