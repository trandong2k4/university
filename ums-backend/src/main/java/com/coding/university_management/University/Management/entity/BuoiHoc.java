package com.coding.university_management.University.Management.entity;

import com.coding.university_management.University.Management.enums.ThuTrongTuan;
import jakarta.persistence.*;
import lombok.*;
import lombok.experimental.FieldDefaults;

@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE)
@Entity
@Table(name = "BUOIHOCS")
public class BuoiHoc {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    @Column(name = "ma_buoi_hoc", columnDefinition = "CHAR(36)")
    String maBuoiHoc;

    /**
     * Thứ trong tuần của buổi học.
     * Được lưu trữ dưới dạng enum để đảm bảo tính nhất quán của dữ liệu.
     */
    @Enumerated(EnumType.STRING)
    @Column(name = "thu_trong_tuan", columnDefinition = "VARCHAR(50)")
    ThuTrongTuan thuTrongTuan;

    /**
     * Giờ học được áp dụng cho buổi học này.
     * Mỗi buổi học có một khung giờ cụ thể.
     * Mối quan hệ nhiều-một (Many-to-One) với bảng GIOHOCS.
     */
    @ManyToOne
    @JoinColumn(name = "ma_gio_hoc", referencedColumnName = "ma_gio_hoc")
    GioHoc gioHoc;

    /**
     * Lịch học mà buổi học này thuộc về.
     * Mỗi buổi học chỉ thuộc về một lịch học.
     * Mối quan hệ nhiều-một (Many-to-One) với bảng LICHHOCS.
     */
    @ManyToOne
    @JoinColumn(name = "ma_lich_hoc", referencedColumnName = "ma_lich_hoc")
    LichHoc lichHoc;


}