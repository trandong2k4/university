-- CREATE DATABASE `university-management`;

USE `university-management`;

CREATE TABLE USERS (
	id CHAR(36) PRIMARY KEY DEFAULT (UUID()),
    username VARCHAR(30) NOT NULL UNIQUE,
    password VARCHAR(255),
    first_name VARCHAR(30),
	last_name VARCHAR(30),
    date_of_birth DATE
);

CREATE TABLE USERS_ROLES (
    user_id CHAR(36) NOT NULL,
    role_name CHAR(36) NOT NULL
);

CREATE TABLE ROLES (
	name CHAR(36) PRIMARY KEY DEFAULT (UUID()),
    description VARCHAR(30)
);

CREATE TABLE PERMISSIONS (
	name CHAR(36) PRIMARY KEY DEFAULT (UUID()),
    description VARCHAR(30)
);

CREATE TABLE ROLES_PERMISSIONS (
    role_name CHAR(36) NOT NULL,
    permission_name CHAR(36) NOT NULL
);

CREATE TABLE SINHVIENS (
    ma_sinh_vien CHAR(36) PRIMARY KEY,
    ho_ten VARCHAR(50),
    email VARCHAR(50) UNIQUE,
    so_dien_thoai CHAR(10) UNIQUE,
    ngay_nhap_hoc DATE,
    ngay_tot_nghiep DATE
);

CREATE TABLE CHITIETSINHVIENS (
    ma_sinh_vien CHAR(36) PRIMARY KEY,
    dia_chi VARCHAR(100),
    ngay_sinh DATE,
    gioi_tinh VARCHAR(10),
    quoc_tich CHAR(50) DEFAULT 'Viet Nam',
    cccd CHAR(12) UNIQUE,
    sdt_nguoi_than CHAR(10),
    CONSTRAINT fk_chitietsinhvien_sinhvien FOREIGN KEY (ma_sinh_vien) REFERENCES SINHVIENS(ma_sinh_vien)
);

CREATE TABLE MONHOCS (
    ma_mon_hoc CHAR(36) PRIMARY KEY,
    ten_mon_hoc VARCHAR(30),
    mo_ta VARCHAR(255),
    tong_so_tin_chi INT,
    ma_mon_hoc_tien_quyet CHAR(36) NULL
);

CREATE TABLE LOAITINCHI (
    ma_loai_tin_chi CHAR(36) PRIMARY KEY,
    ten_loai_tin_chi VARCHAR(50) NOT NULL
);

CREATE TABLE TINCHI (
    ma_tin_chi CHAR(36) PRIMARY KEY,
    so_tin_chi INT NOT NULL,
    gia_tri_tin_chi DECIMAL(10, 2) NOT NULL,
    ma_loai_tin_chi CHAR(36),
    ma_mon_hoc CHAR(36),
    ten_tin_chi VARCHAR(20) NOT NULL,
    FOREIGN KEY (ma_loai_tin_chi) REFERENCES LOAITINCHI(ma_loai_tin_chi),
    FOREIGN KEY (ma_mon_hoc) REFERENCES MONHOCS(ma_mon_hoc)
);

CREATE TABLE KIHOCS (
    ma_ki_hoc VARCHAR(36) PRIMARY KEY,
    ten_ki_hoc VARCHAR(50),
    ngay_bat_dau DATE,
    ngay_ket_thuc DATE
);

CREATE TABLE MONHOCS (
    ma_mon_hoc VARCHAR(36) PRIMARY KEY,
    ten_mon_hoc VARCHAR(30),
    mo_ta VARCHAR(255),
    tong_so_tin_chi INT,
    ma_mon_hoc_tien_quyet VARCHAR(36),
    CONSTRAINT fk_monhoc_tienquyet FOREIGN KEY (ma_mon_hoc_tien_quyet) 
        REFERENCES MONHOCS(ma_mon_hoc)
);

CREATE TABLE PHONGHOCS (
    ma_phong_hoc CHAR(36) PRIMARY KEY,
    ten_phong VARCHAR(50),
    toa_nha VARCHAR(50),
    tang INT,
    suc_chua INT
);

CREATE TABLE SINHVIENS (
    ma_sinh_vien CHAR(36) PRIMARY KEY,
    ho_ten VARCHAR(50),
    email VARCHAR(50) UNIQUE,
    so_dien_thoai CHAR(10) UNIQUE,
    ngay_nhap_hoc DATE,
    ngay_tot_nghiep DATE
);

CREATE TABLE LICHHOCS (
    ma_lich_hoc VARCHAR(36) PRIMARY KEY,
    ngay_bat_dau DATE,
    ngay_ket_thuc DATE,
    ma_phong_hoc CHAR(36),
    ma_ki_hoc VARCHAR(36),
    ma_mon_hoc VARCHAR(36),
    CONSTRAINT fk_lichhoc_phonghoc FOREIGN KEY (ma_phong_hoc)
        REFERENCES PHONGHOCS(ma_phong_hoc),
    CONSTRAINT fk_lichhoc_kihoc FOREIGN KEY (ma_ki_hoc)
        REFERENCES KIHOCS(ma_ki_hoc),
    CONSTRAINT fk_lichhoc_monhoc FOREIGN KEY (ma_mon_hoc)
        REFERENCES MONHOCS(ma_mon_hoc)
);

CREATE TABLE DANGKY_LICHHOC (
    ma_lich_hoc VARCHAR(36),
    ma_sinh_vien CHAR(36),
    PRIMARY KEY (ma_lich_hoc, ma_sinh_vien),
    CONSTRAINT fk_dangky_lichhoc FOREIGN KEY (ma_lich_hoc)
        REFERENCES LICHHOCS(ma_lich_hoc),
    CONSTRAINT fk_dangky_sinhvien FOREIGN KEY (ma_sinh_vien)
        REFERENCES SINHVIENS(ma_sinh_vien)
);

CREATE TABLE GIOHOCS (
    ma_gio_hoc VARCHAR(36) PRIMARY KEY,
    ten_gio_hoc VARCHAR(50),
    thoi_gian_bat_dau TIME,
    thoi_gian_ket_thuc TIME
);

CREATE TABLE BUOIHOCS (
    ma_buoi_hoc CHAR(36) PRIMARY KEY,
    thu_trong_tuan VARCHAR(50),
    ma_gio_hoc VARCHAR(36),
    ma_lich_hoc VARCHAR(36),
    CONSTRAINT fk_buoihoc_giohoc FOREIGN KEY (ma_gio_hoc)
        REFERENCES GIOHOCS(ma_gio_hoc),
    CONSTRAINT fk_buoihoc_lichhoc FOREIGN KEY (ma_lich_hoc)
        REFERENCES LICHHOCS(ma_lich_hoc)
);

CREATE TABLE VITRIS (
    ma_vi_tri CHAR(36) PRIMARY KEY,
    ten_vi_tri VARCHAR(50) NOT NULL,
    mo_ta VARCHAR(255),
    muc_luong_co_ban DECIMAL(12,2)
);

CREATE TABLE NHANVIENS (
    ma_nhan_vien CHAR(36) PRIMARY KEY,
    ho_ten VARCHAR(50),
    email VARCHAR(50) UNIQUE,
    so_dien_thoai CHAR(10) UNIQUE,
    ngay_vao_lam DATE,
    ngay_nghi_viec DATE,
    ma_vi_tri CHAR(36),
    user_id CHAR(36) UNIQUE,
    FOREIGN KEY (ma_vi_tri) REFERENCES VITRIS(ma_vi_tri),
    FOREIGN KEY (user_id) REFERENCES USERS(id)
);

CREATE TABLE HOCPHIS (
    ma_hoc_phi CHAR(36) PRIMARY KEY,
    ma_sinh_vien CHAR(36) NOT NULL,
    ma_ki_hoc VARCHAR(36) NOT NULL,
    so_tien DECIMAL(12,2) NOT NULL,
    gia_tri_tin_chi DECIMAL(10,2),
    ngay_tao DATE,
    han_thanh_toan DATE,
    ngay_thanh_toan DATE,
    trang_thai VARCHAR(20),
    ghi_chu VARCHAR(255),
    FOREIGN KEY (ma_sinh_vien) REFERENCES SINHVIENS(ma_sinh_vien),
    FOREIGN KEY (ma_ki_hoc) REFERENCES KIHOCS(ma_ki_hoc)
);

CREATE TABLE HOCLAIS (
    ma_hoc_lai CHAR(36) PRIMARY KEY,
    ma_sinh_vien CHAR(36) NOT NULL,
    ma_mon_hoc VARCHAR(36) NOT NULL,
    ma_ki_hoc VARCHAR(36) NOT NULL,
    lan_hoc INT,
    diem_cu DECIMAL(3,1),
    ly_do VARCHAR(255),
    trang_thai VARCHAR(20),
    ma_lich_hoc VARCHAR(36),
    FOREIGN KEY (ma_sinh_vien) REFERENCES SINHVIENS(ma_sinh_vien),
    FOREIGN KEY (ma_mon_hoc) REFERENCES MONHOCS(ma_mon_hoc),
    FOREIGN KEY (ma_ki_hoc) REFERENCES KIHOCS(ma_ki_hoc),
    FOREIGN KEY (ma_lich_hoc) REFERENCES LICHHOCS(ma_lich_hoc)
);