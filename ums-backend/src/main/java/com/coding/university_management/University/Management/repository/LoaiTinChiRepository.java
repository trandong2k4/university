package com.coding.university_management.University.Management.repository;

import com.coding.university_management.University.Management.entity.LoaiTinChi;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface LoaiTinChiRepository extends JpaRepository<LoaiTinChi, String> {
    boolean existsByTenLoaiTinChi(String tenLoaiTinChi);
    Optional<LoaiTinChi> findByTenLoaiTinChi(String tenLoaiTinChi);
}
