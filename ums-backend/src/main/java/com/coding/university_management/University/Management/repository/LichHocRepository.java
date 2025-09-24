package com.coding.university_management.University.Management.repository;

import com.coding.university_management.University.Management.entity.KiHoc;
import com.coding.university_management.University.Management.entity.LichHoc;
import com.coding.university_management.University.Management.entity.MonHoc;
import com.coding.university_management.University.Management.entity.PhongHoc;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.time.LocalDate;
import java.util.List;

@Repository
public interface LichHocRepository extends JpaRepository<LichHoc, String> {
    List<LichHoc> findByPhongHoc(PhongHoc phongHoc);
    List<LichHoc> findByKiHoc(KiHoc kiHoc);
    List<LichHoc> findByMonHoc(MonHoc monHoc);
    List<LichHoc> findByNgayBatDauGreaterThanEqual(LocalDate date);
}