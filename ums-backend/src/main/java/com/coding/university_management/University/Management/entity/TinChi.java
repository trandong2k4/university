package com.coding.university_management.University.Management.entity;

import com.coding.university_management.University.Management.enums.TenTinChi;
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
@Table(name = "TINCHI")
public class TinChi {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    @Column(name = "ma_tin_chi", columnDefinition = "CHAR(36)")
    String maTinChi;

    @Column(name = "so_tin_chi", columnDefinition = "INT", nullable = false)
    Integer soTinChi;

    @Column(name = "gia_tri_tin_chi", columnDefinition = "DECIMAL(10, 2)", nullable = false)
    BigDecimal giaTriTinChi; // Sửa từ Double thành BigDecimal

    @ManyToOne
    @JoinColumn(name = "ma_loai_tin_chi", referencedColumnName = "ma_loai_tin_chi")
    LoaiTinChi loaiTinChi;

    @ManyToOne
    @JoinColumn(name = "ma_mon_hoc", referencedColumnName = "ma_mon_hoc")
    MonHoc monHoc;

    @Enumerated(EnumType.STRING)
    @Column(name = "ten_tin_chi", columnDefinition = "VARCHAR(20)", nullable = false)
    TenTinChi tenTinChi;
}