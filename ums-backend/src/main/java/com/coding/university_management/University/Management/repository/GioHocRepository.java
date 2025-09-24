package com.coding.university_management.University.Management.repository;

import com.coding.university_management.University.Management.entity.GioHoc;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface GioHocRepository extends JpaRepository<GioHoc, String> {
    boolean existsByTenGioHoc(String tenGioHoc);
    Optional<GioHoc> findByTenGioHoc(String tenGioHoc);
}
