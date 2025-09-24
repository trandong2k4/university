package com.coding.university_management.University.Management.dto.request;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import lombok.*;
import lombok.experimental.FieldDefaults;

import java.time.LocalTime;

@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE)
public class GioHocCreateRequest {
    @NotBlank
    @Size(max = 50)
    String tenGioHoc;

    @NotNull
    LocalTime thoiGianBatDau;

    @NotNull
    LocalTime thoiGianKetThuc;
}
