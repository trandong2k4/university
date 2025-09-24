package com.coding.university_management.University.Management.entity;

import jakarta.persistence.*;
import lombok.*;
import lombok.experimental.FieldDefaults;

import java.math.BigDecimal;

@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE)
@Entity
@Table(name = "KETQUAHOCTAP")
public class KetQuaHocTap {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    @Column(name = "id", columnDefinition = "CHAR(36)")
    String id;

    @ManyToOne
    @JoinColumn(name = "ma_sinh_vien", referencedColumnName = "ma_sinh_vien")
    SinhVien sinhVien;

    @ManyToOne
    @JoinColumn(name = "ma_mon_hoc", referencedColumnName = "ma_mon_hoc")
    MonHoc monHoc;

    @ManyToOne
    @JoinColumn(name = "ma_ki_hoc", referencedColumnName = "ma_ki_hoc")
    KiHoc kiHoc;

    @Column(name = "diem_so", columnDefinition = "DECIMAL(3,1)")
    BigDecimal diemSo;

    @Column(name = "lan_hoc", columnDefinition = "INT DEFAULT 1", nullable = false)
    Integer lanHoc = 1; // Khởi tạo giá trị mặc định

    @Column(name = "dat_mon", columnDefinition = "BOOLEAN DEFAULT TRUE")
    Boolean datMon = true;
}
