package com.coding.university_management.University.Management.entity;

import jakarta.persistence.*;
import lombok.*;
import lombok.experimental.FieldDefaults;

import java.time.LocalDate;
import java.util.HashSet;
import java.util.Set;

@Getter // Dùng @Getter và @Setter thay cho @Data
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE)
@Entity
@Table(name = "USERS")
public class User {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    @Column(name = "id", columnDefinition = "CHAR(36)")
    String id;

    @Column(name = "username", columnDefinition = "VARCHAR(30)")
    String username;

    @Column(name = "password", columnDefinition = "VARCHAR(255)")
    String password;

    @Column(name = "first_name", columnDefinition = "VARCHAR(30)")
    String firstName;

    @Column(name = "last_name", columnDefinition = "VARCHAR(30)")
    String lastName;

    @Column(name = "date_of_birth", columnDefinition = "DATE")
    LocalDate dob;

    // Cấu hình @ManyToMany để hoạt động với khóa ngoại dạng số
    // ✨ CẬP NHẬT @JoinTable ĐỂ THAM CHIẾU ĐÚNG KHÓA CHÍNH CỦA ROLE ✨
    @Builder.Default
    @ManyToMany(fetch = FetchType.LAZY)
    @JoinTable(
            name = "users_roles",
            joinColumns = @JoinColumn(name = "user_id", referencedColumnName = "id"),
            inverseJoinColumns = @JoinColumn(name = "role_name", referencedColumnName = "name") // Phải tham chiếu đến "name"
    )
    private Set<Role> roles = new HashSet<>();

}
