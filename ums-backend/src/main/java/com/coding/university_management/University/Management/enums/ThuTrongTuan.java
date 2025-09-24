package com.coding.university_management.University.Management.enums;

public enum ThuTrongTuan {
    THU_HAI("Thứ Hai"),
    THU_BA("Thứ Ba"),
    THU_TU("Thứ Tư"),
    THU_NAM("Thứ Năm"),
    THU_SAU("Thứ Sáu"),
    THU_BAY("Thứ Bảy"),
    CHU_NHAT("Chủ Nhật");

    private final String tenThu;

    ThuTrongTuan(String tenThu) {
        this.tenThu = tenThu;
    }

    public String getTenThu() {
        return tenThu;
    }
}