package com.coding.university_management.University.Management.repository;

import com.coding.university_management.University.Management.entity.NganhHoc;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface NganhHocRepository extends JpaRepository<NganhHoc, String> {
    boolean existsByTenNganhHoc(String tenNganhHoc);
    Optional<NganhHoc> findByTenNganhHoc(String tenNganhHoc);
}