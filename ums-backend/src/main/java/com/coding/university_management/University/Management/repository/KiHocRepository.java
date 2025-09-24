package com.coding.university_management.University.Management.repository;

import com.coding.university_management.University.Management.entity.KiHoc;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.time.LocalDate;
import java.util.List;
import java.util.Optional;

@Repository
public interface KiHocRepository extends JpaRepository<KiHoc, String> {
    Optional<KiHoc> findByTenKiHoc(String tenKiHoc);
    List<KiHoc> findByNgayBatDauGreaterThanEqual(LocalDate date);
    List<KiHoc> findByNgayKetThucLessThanEqual(LocalDate date);
}
