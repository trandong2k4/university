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
@Table(name = "ROLES")
public class Role {

    @Id
    @Column(name = "name", columnDefinition = "CHAR(36)")
    String name;

    @Column(name = "description", columnDefinition = "VARCHAR(30)")
    String description;

    /**
     * Mối quan hệ nhiều-nhiều với Permission.
     * Hibernate sẽ quản lý bảng trung gian 'ROLES_PERMISSIONS'.
     * joinColumns: Cột trong bảng trung gian tham chiếu đến Entity này (Role).
     * inverseJoinColumns: Cột trong bảng trung gian tham chiếu đến Entity kia (Permission).
     */
    @ToString.Exclude
    @ManyToMany(fetch = FetchType.LAZY, cascade = { CascadeType.PERSIST, CascadeType.MERGE })
    @JoinTable(
            name = "ROLES_PERMISSIONS",
            joinColumns = @JoinColumn(name = "role_name"),
            inverseJoinColumns = @JoinColumn(name = "permission_name")
    )
    private Set<Permission> permissions = new HashSet<>();

    // Giữ nguyên mối quan hệ với User
    @ToString.Exclude
    @ManyToMany(mappedBy = "roles", fetch = FetchType.LAZY)
    private Set<User> users = new HashSet<>();
}
