package com.coding.university_management.University.Management.entity;

import jakarta.persistence.*;
import lombok.*;
import lombok.experimental.FieldDefaults;

import java.util.HashSet;
import java.util.Set;

@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE)
@Entity
@Table(name = "NGANHHOCS")
public class NganhHoc {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    @Column(name = "ma_nganh_hoc", columnDefinition = "CHAR(36)")
    String maNganhHoc;

    @Column(name = "ten_nganh_hoc", columnDefinition = "VARCHAR(100)", nullable = false, unique = true)
    String tenNganhHoc;

    @Column(name = "mo_ta", columnDefinition = "VARCHAR(255)")
    String moTa;

    @OneToMany(mappedBy = "nganhHoc") // Xóa cascade = CascadeType.PERSIST
    Set<SinhVien> sinhViens = new HashSet<>();

    // Liên kết nhiều-nhiều với MonHoc thông qua bảng trung gian NGANH_MONHOC
    @ManyToMany(fetch = FetchType.LAZY)
    @JoinTable(
            name = "NGANH_MONHOC",
            joinColumns = @JoinColumn(name = "ma_nganh_hoc"),
            inverseJoinColumns = @JoinColumn(name = "ma_mon_hoc")
    )
    Set<MonHoc> monHocs = new HashSet<>();
}