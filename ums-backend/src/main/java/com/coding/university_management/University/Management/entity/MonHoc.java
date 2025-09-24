package com.coding.university_management.University.Management.entity;

import jakarta.persistence.*;
import lombok.*;
import lombok.experimental.FieldDefaults;

import java.util.HashSet;
import java.util.Set;

@Getter // Dùng @Getter và @Setter thay cho @Data
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE)
@Entity
@Table(name = "MONHOCS")
public class MonHoc {

    // Ví dụ: "CS101", "MATH201", "PHY301"
    @Id
    @Column(name = "ma_mon_hoc", columnDefinition = "VARCHAR(36)", unique = true)
    String maMonHoc;

    @Column(name = "ten_mon_hoc", columnDefinition = "VARCHAR(30)")
    String tenMonHoc;

    @Column(name = "mo_ta", columnDefinition = "VARCHAR(255)")
    String moTa;

//    @Column(name = "tong_so_tin_chi", columnDefinition = "INT")
//    Integer tongSoTinChi;

    /**
     * Môn học tiên quyết cần hoàn thành trước khi học môn này.
     * Quan hệ tự tham chiếu (self-reference) với chính bảng MONHOCS.
     */
    @ManyToOne
    @JoinColumn(name = "ma_mon_hoc_tien_quyet")
    private MonHoc monHocTienQuyet;

    /**
     * Danh sách các môn học có môn học này là môn tiên quyết.
     */
    @OneToMany(mappedBy = "monHocTienQuyet")
    private Set<MonHoc> monHocPhuThuoc = new HashSet<>();

    /**
     * Liên kết với bảng TINCHI
     * Mỗi môn học có thể có nhiều tín chỉ, nhưng mỗi tín chỉ chỉ thuộc về một môn học.
     * CascadeType.PERSIST được sử dụng để tự động lưu các tín chỉ khi môn học được lưu.
     * Nếu cần, có thể thay đổi cascade type tùy theo yêu cầu của ứng dụng.
     * Ví dụ: CascadeType.ALL sẽ cho
     *  phép tất cả các thao tác
     *  (persist, merge, remove, refresh, detach) được áp dụng cho các tín chỉ liên kết.
     */
    @OneToMany(mappedBy = "monHoc") // Xóa cascade = CascadeType.PERSIST
    Set<TinChi> tinChis = new HashSet<>();

    @OneToMany(mappedBy = "monHoc", cascade = CascadeType.ALL, orphanRemoval = true)
    private Set<KetQuaHocTap> ketQuaHocTaps = new HashSet<>();

    @OneToMany(mappedBy = "monHoc", cascade = CascadeType.ALL, orphanRemoval = true)
    private Set<HocLai> hocLais = new HashSet<>();

    // Liên kết nhiều-nhiều với NganhHoc thông qua bảng trung gian NGANH_MONHOC
    @ManyToMany(mappedBy = "monHocs", fetch = FetchType.LAZY)
    Set<NganhHoc> nganhHocs = new HashSet<>();
}
