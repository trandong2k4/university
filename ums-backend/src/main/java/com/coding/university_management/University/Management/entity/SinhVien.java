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
@Table(name = "SINHVIENS")
public class SinhVien {

    @Id
    @Column(name = "ma_sinh_vien", columnDefinition = "CHAR(36)")
    String maSinhVien;

    @OneToOne
    @MapsId
    @JoinColumn(name = "ma_sinh_vien", referencedColumnName = "ma_sinh_vien")
    ChiTietSinhVien chiTietSinhVien;

    @Column(name = "ho_ten", columnDefinition = "VARCHAR(50)")
    String hoTen;

    @Column(name = "email", columnDefinition = "VARCHAR(50)", unique = true)
    String email;

    @Column(name = "so_dien_thoai", columnDefinition = "CHAR(10)", unique = true)
    String soDienThoai;

    @Column(name = "ngay_nhap_hoc", columnDefinition = "DATE")
    LocalDate ngayNhapHoc;

    @Column(name = "ngay_tot_nghiep", columnDefinition = "DATE")
    LocalDate ngayTotNghiep;

    /**
     * Ngành học của sinh viên.
     * Mỗi sinh viên thuộc về một ngành học.
     */
    @ManyToOne
    @JoinColumn(name = "ma_nganh_hoc", referencedColumnName = "ma_nganh_hoc")
    NganhHoc nganhHoc;

    /**
     * Danh sách các kết quả học tập của sinh viên.
     */
    @OneToMany(mappedBy = "sinhVien", cascade = CascadeType.ALL, orphanRemoval = true)
    Set<KetQuaHocTap> ketQuaHocTaps = new HashSet<>();

    /**
     * Danh sách các lịch học mà sinh viên đã đăng ký.
     * Một sinh viên có thể đăng ký nhiều lịch học khác nhau.
     * Mối quan hệ nhiều-nhiều (Many-to-Many) với bảng LICHHOCS thông qua bảng trung gian DANGKY_LICHHOC.
     */
    @ManyToMany(mappedBy = "sinhViens")
    Set<LichHoc> lichHocs = new HashSet<>();

    /**
     * Liên kết với người dùng hệ thống.
     * Mỗi sinh viên có một tài khoản người dùng.
     * Mối quan hệ một-một (One-to-One) với bảng USERS.
     */
    @OneToOne
    @JoinColumn(name = "user_id", referencedColumnName = "id")
    User user;

}