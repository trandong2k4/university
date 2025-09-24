package com.coding.university_management.University.Management.entity;

import com.coding.university_management.University.Management.enums.GioiTinh;
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
@Table(name = "CHITIETSINHVIENS")
public class ChiTietSinhVien {

    @Id
    @Column(name = "ma_sinh_vien", columnDefinition = "CHAR(36)")
    String maSinhVien;

    @OneToOne(mappedBy = "chiTietSinhVien")
    SinhVien sinhVien;

    @Column(name = "dia_chi", columnDefinition = "VARCHAR(100)")
    String diaChi; // Sửa từ hoTen thành diaChi

    @Column(name = "ngay_sinh", columnDefinition = "DATE")
    LocalDate ngaySinh;

    @Enumerated(EnumType.STRING)
    @Column(name = "gioi_tinh", columnDefinition = "VARCHAR(10)")
    GioiTinh gioiTinh;

    @Column(name = "quoc_tich", columnDefinition = "CHAR(50) DEFAULT 'Viet Nam'")
    String quocTich;

    @Column(name = "cccd", columnDefinition = "CHAR(12)", unique = true)
    String cccd;

    @Column(name = "sdt_nguoi_than", columnDefinition = "CHAR(10)")
    String sdtNguoiThan;

}