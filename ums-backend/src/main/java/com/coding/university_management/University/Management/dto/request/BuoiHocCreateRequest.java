package com.coding.university_management.University.Management.dto.request;

import com.coding.university_management.University.Management.enums.ThuTrongTuan;
import jakarta.validation.constraints.NotNull;
import lombok.*;
import lombok.experimental.FieldDefaults;

@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE)
public class BuoiHocCreateRequest {
    @NotNull
    ThuTrongTuan thuTrongTuan;

    @NotNull
    String maGioHoc;

    @NotNull
    String maLichHoc;
}