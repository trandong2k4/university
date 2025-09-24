package com.coding.university_management.University.Management.configuration;

import com.coding.university_management.University.Management.entity.*;
import com.coding.university_management.University.Management.enums.TenTinChi;
import com.coding.university_management.University.Management.repository.*;
import lombok.AccessLevel;
import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;
import lombok.experimental.NonFinal;
import lombok.extern.slf4j.Slf4j;
import org.springframework.boot.ApplicationRunner;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.crypto.password.PasswordEncoder;

import java.math.BigDecimal;
import java.util.*;
import java.util.stream.Collectors;

@Slf4j
@Configuration
@RequiredArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE, makeFinal = true)
public class ApplicationConfigInit {

    PasswordEncoder passwordEncoder;

    @NonFinal
    static final String ADMIN_USER_NAME = "admin";
    @NonFinal
    static final String ADMIN_PASSWORD = "12345678";

    @Bean
    public ApplicationRunner applicationRunner(UserRepository userRepository,
                                               RoleRepository roleRepository,
                                               PermissionRepository permissionRepository,
                                               LoaiTinChiRepository loaiTinChiRepository,
                                               NganhHocRepository nganhHocRepository,
                                               MonHocRepository monHocRepository,
                                               TinChiRepository tinChiRepository) {
        log.info("Initializing application.....");
        return args -> {
            if (userRepository.findByUsername(ADMIN_USER_NAME).isEmpty()) {
                // 1. Define all permissions
                Map<String, String> permissions = Map.ofEntries(
                        Map.entry("student:read", "Xem thông tin sinh viên"),
                        Map.entry("student:create", "Tạo sinh viên"),
                        Map.entry("student:update", "Cập nhật sinh viên"),
                        Map.entry("student:delete", "Xóa sinh viên"),
                        Map.entry("course:read", "Xem thông tin môn học"),
                        Map.entry("course:create", "Tạo môn học"),
                        Map.entry("course:update", "Cập nhật môn học"),
                        Map.entry("course:delete", "Xóa môn học"),
                        Map.entry("schedule:read", "Xem lịch học"),
                        Map.entry("schedule:create", "Tạo lịch học"),
                        Map.entry("schedule:update", "Cập nhật lịch học"),
                        Map.entry("schedule:delete", "Xóa lịch học"),
                        Map.entry("grade:read", "Xem điểm"),
                        Map.entry("grade:update", "Cập nhật điểm"),
                        Map.entry("tuition:read", "Xem học phí"),
                        Map.entry("tuition:create", "Tạo học phí"),
                        Map.entry("tuition:update", "Cập nhật học phí"),
                        Map.entry("credit:register", "Quyền đăng ký tín chỉ"),
                        Map.entry("credit:cancel", "Quyền hủy tín chỉ")
                );

                permissions.forEach((name, description) -> {
                    if (permissionRepository.findById(name).isEmpty()) {
                        permissionRepository.save(Permission.builder().name(name).description(description).build());
                    }
                });

                // 2. Define roles and assign permissions
                // SINHVIEN Role
                Set<Permission> studentPermissions = Set.of("student:read", "course:read", "schedule:read", "grade:read", "tuition:read", "credit:register", "credit:cancel")
                        .stream().map(permissionRepository::findById).map(p -> p.orElse(null)).collect(Collectors.toSet());
                roleRepository.save(Role.builder().name("SINHVIEN").description("Vai trò sinh viên").permissions(studentPermissions).build());

                // GIAOVIEN Role
                Set<Permission> teacherPermissions = Set.of("student:read", "course:read", "schedule:read", "grade:read", "grade:update")
                        .stream().map(permissionRepository::findById).map(p -> p.orElse(null)).collect(Collectors.toSet());
                roleRepository.save(Role.builder().name("GIAOVIEN").description("Vai trò giáo viên").permissions(teacherPermissions).build());

                // KETOAN Role
                Set<Permission> accountantPermissions = Set.of("student:read", "tuition:read", "tuition:create", "tuition:update")
                        .stream().map(permissionRepository::findById).map(p -> p.orElse(null)).collect(Collectors.toSet());
                roleRepository.save(Role.builder().name("KETOAN").description("Vai trò kế toán").permissions(accountantPermissions).build());

                // QUANTRIVIEN Role (Admin) - has all permissions
                Set<Permission> adminPermissions = new HashSet<>(permissionRepository.findAll());
                Role adminRole = roleRepository.save(Role.builder().name("QUANTRIVIEN").description("Vai trò quản trị viên").permissions(adminPermissions).build());

                // 3. Create admin user
                Set<Role> roles = new HashSet<>();
                roles.add(adminRole);

                User user = User.builder()
                        .username(ADMIN_USER_NAME)
                        .password(passwordEncoder.encode(ADMIN_PASSWORD))
                        .roles(roles)
                        .build();

                userRepository.save(user);
                log.warn("admin user has been created with default password: {}, please change it", ADMIN_PASSWORD);

                // Tạo data cho TINCHI, LOAITINCHI, MONHOC, NGANHHOC
                // Create LoaiTinChi (Credit Types) if they don't exist
                String lyThuyetId = "LT-" + UUID.randomUUID().toString().substring(0, 8);
                String thucHanhId = "TH-" + UUID.randomUUID().toString().substring(0, 8);

                if (loaiTinChiRepository.count() == 0) {
                    log.info("Creating credit types...");
                    LoaiTinChi lyThuyet = LoaiTinChi.builder()
                            .maLoaiTinChi(lyThuyetId)
                            .tenLoaiTinChi("Lý thuyết")
                            .build();

                    LoaiTinChi thucHanh = LoaiTinChi.builder()
                            .maLoaiTinChi(thucHanhId)
                            .tenLoaiTinChi("Thực hành")
                            .build();

                    loaiTinChiRepository.saveAll(List.of(lyThuyet, thucHanh));
                } else {
                    // Get IDs of existing types if they exist
                    lyThuyetId = loaiTinChiRepository.findByTenLoaiTinChi("Lý thuyết")
                            .map(LoaiTinChi::getMaLoaiTinChi)
                            .orElse(lyThuyetId);

                    thucHanhId = loaiTinChiRepository.findByTenLoaiTinChi("Thực hành")
                            .map(LoaiTinChi::getMaLoaiTinChi)
                            .orElse(thucHanhId);
                }

                // Create NganhHoc (Major) if it doesn't exist
                final String maNganh = "CNPM-" + UUID.randomUUID().toString().substring(0, 8);
                if (!nganhHocRepository.existsByTenNganhHoc("Công nghệ phần mềm")) {
                    log.info("Creating Software Engineering major...");
                    NganhHoc cnpm = NganhHoc.builder()
                            .maNganhHoc(maNganh)
                            .tenNganhHoc("Công nghệ phần mềm")
                            .moTa("Ngành học về kỹ thuật phát triển phần mềm")
                            .build();
                    nganhHocRepository.save(cnpm);
                }

                // Get the NganhHoc for linking
                NganhHoc cnpm = nganhHocRepository.findByTenNganhHoc("Công nghệ phần mềm")
                        .orElseThrow(() -> new RuntimeException("Major not found"));

                // Create 3 MonHoc (Courses) if they don't exist
                if (!monHocRepository.existsByTenMonHoc("Lập trình Java")) {
                    log.info("Creating courses for Software Engineering...");
                    // Course 1: Java Programming
                    MonHoc javaMonHoc = MonHoc.builder()
                            .maMonHoc("JAVA-" + UUID.randomUUID().toString().substring(0, 8))
                            .tenMonHoc("Lập trình Java")
                            .moTa("Môn học về ngôn ngữ lập trình Java")
                            .build();

                    // Initialize nganhHocs if null
                    if (javaMonHoc.getNganhHocs() == null) {
                        javaMonHoc.setNganhHocs(new HashSet<>());
                    }

                    // Add to major
                    javaMonHoc.getNganhHocs().add(cnpm);
                    monHocRepository.save(javaMonHoc);

                    // Course 2: Database Systems
                    MonHoc dbMonHoc = MonHoc.builder()
                            .maMonHoc("DB-" + UUID.randomUUID().toString().substring(0, 8))
                            .tenMonHoc("Hệ quản trị cơ sở dữ liệu")
                            .moTa("Môn học về thiết kế và quản lý cơ sở dữ liệu")
                            .build();

                    // Initialize nganhHocs if null
                    if (dbMonHoc.getNganhHocs() == null) {
                        dbMonHoc.setNganhHocs(new HashSet<>());
                    }

                    // Add to major
                    dbMonHoc.getNganhHocs().add(cnpm);
                    monHocRepository.save(dbMonHoc);

                    // Course 3: Web Programming
                    MonHoc webMonHoc = MonHoc.builder()
                            .maMonHoc("WEB-" + UUID.randomUUID().toString().substring(0, 8))
                            .tenMonHoc("Lập trình Web")
                            .moTa("Môn học về phát triển ứng dụng web")
                            .build();

                    // Initialize nganhHocs if null
                    if (webMonHoc.getNganhHocs() == null) {
                        webMonHoc.setNganhHocs(new HashSet<>());
                    }

                    // Add to major
                    webMonHoc.getNganhHocs().add(cnpm);
                    monHocRepository.save(webMonHoc);

                    // Create TinChi for Web course
//                    TinChi webLT = TinChi.builder()
//                            .soTinChi(2)
//                            .tenTinChi(TenTinChi.LY_THUYET)
//                            .giaTriTinChi(new BigDecimal("450000"))
//                            .loaiTinChi(loaiTinChiRepository.findById(lyThuyetId).orElse(null))
//                            .monHoc(webMonHoc)
//                            .build();
//
//                    TinChi webTH = TinChi.builder()
//                            .soTinChi(1)
//                            .tenTinChi(TenTinChi.THUC_HANH)
//                            .giaTriTinChi(new BigDecimal("500000"))
//                            .loaiTinChi(loaiTinChiRepository.findById(thucHanhId).orElse(null))
//                            .monHoc(webMonHoc)
//                            .build();
//
//                    tinChiRepository.saveAll(List.of(webLT, webTH));
                }
            }


            log.info("Application initialization completed .....");
        };
    }
}