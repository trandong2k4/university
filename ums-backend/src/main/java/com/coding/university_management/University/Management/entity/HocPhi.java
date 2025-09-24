package com.coding.university_management.University.Management.entity;

import jakarta.persistence.*;
import lombok.*;
import lombok.experimental.FieldDefaults;

import java.math.BigDecimal;
import java.time.LocalDate;

@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE)
@Entity
@Table(name = "HOCPHIS")
public class HocPhi {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    @Column(name = "ma_hoc_phi", columnDefinition = "CHAR(36)")
    String maHocPhi;

    /**
     * Sinh viên đóng học phí.
     * Mối quan hệ nhiều-một (Many-to-One) với bảng SINHVIENS.
     */
    @ManyToOne
    @JoinColumn(name = "ma_sinh_vien", referencedColumnName = "ma_sinh_vien")
    SinhVien sinhVien;

    /**
     * Kỳ học mà học phí áp dụng.
     * Mối quan hệ nhiều-một (Many-to-One) với bảng KIHOCS.
     */
    @ManyToOne
    @JoinColumn(name = "ma_ki_hoc", referencedColumnName = "ma_ki_hoc")
    KiHoc kiHoc;

    @Column(name = "so_tien", columnDefinition = "DECIMAL(12,2)", nullable = false)
    BigDecimal soTien;

    /**
     * Giá trị tín chỉ tại thời điểm tính học phí.
     * Lưu trữ để đảm bảo tính nhất quán của dữ liệu lịch sử khi giá tín chỉ thay đổi.
     */
    @Column(name = "gia_tri_tin_chi", columnDefinition = "DECIMAL(10,2)")
    BigDecimal giaTriTinChi;

    @Column(name = "ngay_tao", columnDefinition = "DATE")
    LocalDate ngayTao;

    @Column(name = "han_thanh_toan", columnDefinition = "DATE")
    LocalDate hanThanhToan;

    @Column(name = "ngay_thanh_toan", columnDefinition = "DATE")
    LocalDate ngayThanhToan;

    @Column(name = "trang_thai", columnDefinition = "VARCHAR(20)")
    String trangThai; // DA_THANH_TOAN, CHUA_THANH_TOAN, TRE_HAN

    @Column(name = "ghi_chu", columnDefinition = "VARCHAR(255)")
    String ghiChu;
}
