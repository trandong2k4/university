package com.coding.university_management.University.Management.dto.response;

import com.coding.university_management.University.Management.enums.ThuTrongTuan;
import lombok.*;
import lombok.experimental.FieldDefaults;

@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE)
public class BuoiHocResponse {
    String maBuoiHoc;
    ThuTrongTuan thuTrongTuan;
    GioHocResponse gioHoc;
    LichHocResponse lichHoc;  // Replace maLichHoc with full LichHocResponse
}
