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
@Table(name = "LOAITINCHI")
public class LoaiTinChi {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    @Column(name = "ma_loai_tin_chi", columnDefinition = "CHAR(36)")
    String maLoaiTinChi;

    @Column(name = "ten_loai_tin_chi", columnDefinition = "VARCHAR(50)", nullable = false)
    String tenLoaiTinChi;

    @OneToMany(mappedBy = "loaiTinChi") // Xóa cascade = CascadeType.PERSIST
    Set<TinChi> tinChis = new HashSet<>();
}