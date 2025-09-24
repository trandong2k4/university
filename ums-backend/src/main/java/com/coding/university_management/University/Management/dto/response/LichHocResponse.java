package com.coding.university_management.University.Management.dto.response;

import lombok.*;
import lombok.experimental.FieldDefaults;

import java.time.LocalDate;

@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE)
public class LichHocResponse {
    String maLichHoc;
    LocalDate ngayBatDau;
    LocalDate ngayKetThuc;
    PhongHocResponse phongHoc;
    KiHocResponse kiHoc;
    MonHocResponse monHoc;
}