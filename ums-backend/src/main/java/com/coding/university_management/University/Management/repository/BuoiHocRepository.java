package com.coding.university_management.University.Management.repository;

import com.coding.university_management.University.Management.entity.BuoiHoc;
import com.coding.university_management.University.Management.entity.GioHoc;
import com.coding.university_management.University.Management.entity.LichHoc;
import com.coding.university_management.University.Management.enums.ThuTrongTuan;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface BuoiHocRepository extends JpaRepository<BuoiHoc, String> {
    List<BuoiHoc> findByLichHoc(LichHoc lichHoc);
    List<BuoiHoc> findByGioHoc(GioHoc gioHoc);
    List<BuoiHoc> findByThuTrongTuan(ThuTrongTuan thuTrongTuan);
}
