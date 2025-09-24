package com.coding.university_management.University.Management.entity;

import jakarta.persistence.*;
import lombok.*;
import lombok.experimental.FieldDefaults;

import java.util.HashSet;
import java.util.Set;

@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE)
@Entity
@Table(name = "PHONGHOCS")
public class PhongHoc {

    /**
     * Mã phòng học, là khóa chính của bảng.
     * Được sinh tự động theo định dạng UUID.
     * Lưu trữ dưới dạng chuỗi có độ dài cố định 36 ký tự.
     */
    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    @Column(name = "ma_phong_hoc", columnDefinition = "CHAR(36)")  // Changed from VARCHAR to CHAR for consistency
    String maPhongHoc;

    @Column(name = "ten_phong", columnDefinition = "VARCHAR(50)")
    String tenPhong;

    @Column(name = "toa_nha", columnDefinition = "VARCHAR(50)")
    String toaNha;

    @Column(name = "tang", columnDefinition = "INT")
    Integer tang;

    @Column(name = "suc_chua", columnDefinition = "INT")
    Integer sucChua;

    /**
     * Danh sách các lịch học được tổ chức trong phòng học này.
     * Một phòng học có thể được sử dụng cho nhiều lịch học khác nhau.
     * Mối quan hệ một-nhiều (One-to-Many) với bảng LICHHOCS.
     */
    @OneToMany(mappedBy = "phongHoc")
    Set<LichHoc> lichHocs = new HashSet<>();

}
