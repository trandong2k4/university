package com.coding.university_management.University.Management.repository;

import com.coding.university_management.University.Management.entity.MonHoc;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface MonHocRepository extends JpaRepository<MonHoc, String> {
    boolean existsByTenMonHoc(String tenMonHoc);
}
