package com.coding.university_management.University.Management.entity;

import jakarta.persistence.*;
import lombok.*;
import lombok.experimental.FieldDefaults;

import java.time.LocalTime;
import java.util.HashSet;
import java.util.Set;

@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE)
@Entity
@Table(name = "GIOHOCS")
public class GioHoc {

    @Id
    @Column(name = "ma_gio_hoc", columnDefinition = "VARCHAR(36)")
    String maGioHoc;

    // VD: "08:00", "10:30", "14:00"
    @Column(name = "ten_gio_hoc", columnDefinition = "VARCHAR(50)")
    String tenGioHoc;

    // VD: "08:00:00", "10:30:00", "14:00:00"
    @Column(name = "thoi_gian_bat_dau", columnDefinition = "TIME")
    LocalTime thoiGianBatDau;

    // VD: "09:30:00", "12:00:00", "15:30:00"
    @Column(name = "thoi_gian_ket_thuc", columnDefinition = "TIME")
    LocalTime thoiGianKetThuc;

    /**
     * Danh sách các buổi học sử dụng khung giờ này.
     * Một khung giờ có thể được sử dụng cho nhiều buổi học khác nhau.
     * Mối quan hệ một-nhiều (One-to-Many) với bảng BUOIHOCS.
     */
    @OneToMany(mappedBy = "gioHoc")
    Set<BuoiHoc> buoiHocs = new HashSet<>();

}