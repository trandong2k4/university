package com.coding.university_management.University.Management.dto.request;

import jakarta.validation.constraints.NotBlank;
import lombok.*;
import lombok.experimental.FieldDefaults;

import java.util.List;
import java.util.Set;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
@FieldDefaults(level = AccessLevel.PRIVATE)
public class MonHocCreateRequest {

    // Optional: if null/blank a UUID will be generated
    private String maMonHoc;

    @NotBlank
    private String tenMonHoc;

    private String moTa;

//    private Integer tongSoTinChi;

    // Optional prerequisite course
    private String maMonHocTienQuyet;

    // Majors to link (can be empty)
    private Set<String> maNganhHocs;

    // Optional inline TinChi creation
    private List<TinChiCreateRequest> tinChis;

}
