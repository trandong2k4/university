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
@Table(name = "LICHHOCS")
public class LichHoc {

    // VD: "CS101-2023-2024-1", "MATH201-2023-2024-2"
    @Id
    @Column(name = "ma_lich_hoc", columnDefinition = "VARCHAR(36)")
    String maLichHoc;

    @Column(name = "ngay_bat_dau", columnDefinition = "DATE")
    LocalDate ngayBatDau;

    @Column(name = "ngay_ket_thuc", columnDefinition = "DATE")
    LocalDate ngayKetThuc;

    /**
     * Phòng học được sử dụng cho lịch học này.
     * Mỗi lịch học chỉ được tổ chức tại một phòng học.
     * Mối quan hệ nhiều-một (Many-to-One) với bảng PHONGHOCS.
     */
    @ManyToOne
    @JoinColumn(name = "ma_phong_hoc", referencedColumnName = "ma_phong_hoc")
    PhongHoc phongHoc;

    /**
     * Kì học mà lịch học này thuộc về.
     * Mỗi lịch học chỉ thuộc về một kì học.
     * Mối quan hệ nhiều-một (Many-to-One) với bảng KIHOCS.
     */
    @ManyToOne
    @JoinColumn(name = "ma_ki_hoc", referencedColumnName = "ma_ki_hoc")
    KiHoc kiHoc;

    /**
     * Môn học được giảng dạy trong lịch học này.
     * Mỗi lịch học chỉ phục vụ cho một môn học.
     * Mối quan hệ nhiều-một (Many-to-One) với bảng MONHOCS.
     */
    @ManyToOne
    @JoinColumn(name = "ma_mon_hoc", referencedColumnName = "ma_mon_hoc")
    MonHoc monHoc;

    /**
     * Danh sách các sinh viên đăng ký tham gia lịch học này.
     * Một lịch học có thể có nhiều sinh viên đăng ký.
     * Mối quan hệ nhiều-nhiều (Many-to-Many) với bảng SINHVIENS thông qua bảng trung gian DANGKY_LICHHOC.
     */
    @ManyToMany
    @JoinTable(
            name = "DANGKY_LICHHOC",
            joinColumns = @JoinColumn(name = "ma_lich_hoc"),
            inverseJoinColumns = @JoinColumn(name = "ma_sinh_vien")
    )
    Set<SinhVien> sinhViens = new HashSet<>();

    /**
     * Danh sách các buổi học thuộc về lịch học này.
     * Một lịch học có thể bao gồm nhiều buổi học khác nhau.
     * Mối quan hệ một-nhiều (One-to-Many) với bảng BUOIHOCS.
     */
    @OneToMany(mappedBy = "lichHoc")
    Set<BuoiHoc> buoiHocs = new HashSet<>();

}