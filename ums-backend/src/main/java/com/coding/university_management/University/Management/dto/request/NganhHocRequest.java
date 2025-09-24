package com.coding.university_management.University.Management.dto.request;

import jakarta.validation.constraints.NotEmpty;
import lombok.*;
import lombok.experimental.FieldDefaults;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
@FieldDefaults(level = AccessLevel.PRIVATE)
public class NganhHocRequest {
    @NotEmpty(message = "Tên ngành học không được để trống")
    String tenNganhHoc;
    String moTa;
}