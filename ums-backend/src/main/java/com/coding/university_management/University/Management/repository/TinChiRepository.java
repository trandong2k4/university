package com.coding.university_management.University.Management.repository;

import com.coding.university_management.University.Management.entity.TinChi;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface TinChiRepository extends JpaRepository<TinChi, String> {
}
