package com.coding.university_management.University.Management.entity;

import jakarta.persistence.*;
import lombok.*;
import lombok.experimental.FieldDefaults;

import java.time.LocalDate;

@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE)
@Entity
@Table(name = "NHANVIENS")
public class NhanVien {

    @Id
    @Column(name = "ma_nhan_vien", columnDefinition = "CHAR(36)")
    String maNhanVien;

    @Column(name = "ho_ten", columnDefinition = "VARCHAR(50)")
    String hoTen;

    @Column(name = "email", columnDefinition = "VARCHAR(50)", unique = true)
    String email;

    @Column(name = "so_dien_thoai", columnDefinition = "CHAR(10)", unique = true)
    String soDienThoai;

    @Column(name = "ngay_vao_lam", columnDefinition = "DATE")
    LocalDate ngayVaoLam;

    @Column(name = "ngay_nghi_viec", columnDefinition = "DATE")
    LocalDate ngayNghiViec;

    /**
     * Vị trí công việc của nhân viên.
     * Mỗi nhân viên chỉ giữ một vị trí tại một thời điểm.
     * Mối quan hệ nhiều-một (Many-to-One) với bảng VITRIS.
     */
    @ManyToOne
    @JoinColumn(name = "ma_vi_tri", referencedColumnName = "ma_vi_tri")
    ViTri viTri;

    /**
     * Liên kết với người dùng hệ thống.
     * Mỗi nhân viên có một tài khoản người dùng.
     * Mối quan hệ một-một (One-to-One) với bảng USERS.
     */
    @OneToOne
    @JoinColumn(name = "user_id", referencedColumnName = "id")
    User user;
}
