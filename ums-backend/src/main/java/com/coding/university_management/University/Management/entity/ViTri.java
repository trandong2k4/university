package com.coding.university_management.University.Management.entity;

import jakarta.persistence.*;
import lombok.*;
import lombok.experimental.FieldDefaults;

import java.math.BigDecimal;
import java.util.HashSet;
import java.util.Set;

@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE)
@Entity
@Table(name = "VITRIS")
public class ViTri {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    @Column(name = "ma_vi_tri", columnDefinition = "CHAR(36)")
    String maViTri;

    @Column(name = "ten_vi_tri", columnDefinition = "VARCHAR(50)", nullable = false)
    String tenViTri;

    @Column(name = "mo_ta", columnDefinition = "VARCHAR(255)")
    String moTa;

    @Column(name = "muc_luong_co_ban", columnDefinition = "DECIMAL(12,2)")
    BigDecimal mucLuongCoBan;

    @OneToMany(mappedBy = "viTri")
    Set<NhanVien> nhanViens = new HashSet<>();
}
