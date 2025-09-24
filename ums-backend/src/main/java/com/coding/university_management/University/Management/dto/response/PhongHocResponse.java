package com.coding.university_management.University.Management.dto.response;

import lombok.*;
import lombok.experimental.FieldDefaults;

@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE)
public class PhongHocResponse {

    String maPhongHoc;
    String tenPhong;
    String toaNha;
    Integer tang;
    Integer sucChua;

}
