package com.coding.university_management.University.Management.entity;

import jakarta.persistence.*;
import lombok.*;
import lombok.experimental.FieldDefaults;

import java.time.LocalDate;
import java.util.HashSet;
import java.util.Set;

@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE)
@Entity
@Table(name = "KIHOCS")
public class KiHoc {

    // VD: "2023-2024-1", "2023-2024-2", "2023-2024-HE"
    @Id
    @Column(name = "ma_ki_hoc", columnDefinition = "VARCHAR(36)")
    String maKiHoc;

    @Column(name = "ten_ki_hoc", columnDefinition = "VARCHAR(50)")
    String tenKiHoc;

    @Column(name = "ngay_bat_dau", columnDefinition = "DATE")
    LocalDate ngayBatDau;

    @Column(name = "ngay_ket_thuc", columnDefinition = "DATE")
    LocalDate ngayKetThuc;

    @OneToMany(mappedBy = "kiHoc", cascade = CascadeType.ALL, orphanRemoval = true)
    private Set<HocPhi> hocPhis = new HashSet<>();

    @OneToMany(mappedBy = "kiHoc", cascade = CascadeType.ALL, orphanRemoval = true)
    private Set<HocLai> hocLais = new HashSet<>();

    @OneToMany(mappedBy = "kiHoc", cascade = CascadeType.ALL, orphanRemoval = true)
    private Set<LichHoc> lichHocs = new HashSet<>();

    @OneToMany(mappedBy = "kiHoc", cascade = CascadeType.ALL, orphanRemoval = true)
    private Set<KetQuaHocTap> ketQuaHocTaps = new HashSet<>();

}