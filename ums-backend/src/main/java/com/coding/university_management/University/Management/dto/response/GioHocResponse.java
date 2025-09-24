package com.coding.university_management.University.Management.dto.response;

import lombok.*;
import lombok.experimental.FieldDefaults;

import java.time.LocalTime;

@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE)
public class GioHocResponse {
    String maGioHoc;
    String tenGioHoc;
    LocalTime thoiGianBatDau;
    LocalTime thoiGianKetThuc;
}
