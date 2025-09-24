package com.coding.university_management.University.Management.repository;

import com.coding.university_management.University.Management.entity.PhongHoc;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface PhongHocRepository extends JpaRepository<PhongHoc, String> {
    boolean existsByTenPhong(String tenPhong);
}
