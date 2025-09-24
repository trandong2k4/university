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
@Table(name = "PERMISSIONS")
public class Permission {

    @Id
    @Column(name = "name", columnDefinition = "CHAR(36)")
    String name;

    @Column(name = "description", columnDefinition = "VARCHAR(30)")
    String description;

    /**
     * Mối quan hệ nhiều-nhiều với Role.
     * 'mappedBy = "permissions"' chỉ ra rằng mối quan hệ này được quản lý
     * bởi trường 'permissions' trong Entity 'Role'.
     * Điều này giúp tránh việc tạo ra các cấu hình trùng lặp.
     */
    @ToString.Exclude
    @ManyToMany(mappedBy = "permissions", fetch = FetchType.LAZY)
    private Set<Role> roles = new HashSet<>();
}
