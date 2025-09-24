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
@Table(name = "HOCLAIS")
public class HocLai {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    @Column(name = "ma_hoc_lai", columnDefinition = "CHAR(36)")
    String maHocLai;

    @ManyToOne
    @JoinColumn(name = "ma_sinh_vien", referencedColumnName = "ma_sinh_vien")
    SinhVien sinhVien;

    @ManyToOne
    @JoinColumn(name = "ma_mon_hoc", referencedColumnName = "ma_mon_hoc")
    MonHoc monHoc;

    @ManyToOne
    @JoinColumn(name = "ma_ki_hoc", referencedColumnName = "ma_ki_hoc")
    KiHoc kiHoc;

    @Column(name = "lan_hoc", columnDefinition = "INT")
    Integer lanHoc;

    @Column(name = "diem_cu", columnDefinition = "DECIMAL(3,1)")
    BigDecimal diemCu;

    @Column(name = "ly_do", columnDefinition = "VARCHAR(255)")
    String lyDo;

    @Column(name = "trang_thai", columnDefinition = "VARCHAR(20)")
    String trangThai; // DANG_HOC, DA_HOAN_THANH, HUY

    @ManyToOne
    @JoinColumn(name = "ma_lich_hoc", referencedColumnName = "ma_lich_hoc")
    LichHoc lichHoc;
}
