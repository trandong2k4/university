package com.coding.university_management.University.Management.dto.request;

import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import lombok.*;
import lombok.experimental.FieldDefaults;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
@FieldDefaults(level = lombok.AccessLevel.PRIVATE)
public class PhongHocCreateRequest {
    @NotBlank
    @Size(max = 50)
    String tenPhong;

    @NotBlank
    @Size(max = 50)
    String toaNha;

    @NotNull
    Integer tang;

    @NotNull
    @Min(1)
    Integer sucChua;
}
