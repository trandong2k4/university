import React from "react";
import "../../styles/public/about.css";

export default function About() {
    return (
        <div className="about-page">
            {/* Welcome Section */}
            <section className="about-section text-center">
                <img
                    src="https://placehold.co/150x150/1e40af/ffffff?text=Logo"
                    alt="Learning Hub Logo"
                    className="about-logo"
                />
                <h1 className="about-title">Chào mừng đến với Learning Hub</h1>
                <p className="about-description">
                    Chúng tôi là một nền tảng học tập trực tuyến tiên phong, mang đến một
                    không gian học thuật năng động và hiệu quả. Sứ mệnh của chúng tôi là
                    dân chủ hóa giáo dục, giúp mọi người dễ dàng tiếp cận với kiến thức
                    chất lượng cao, bất kể họ ở đâu.
                </p>
            </section>

            {/* Mission - Vision - Goals */}
            <section className="mission-vision grid">
                <div className="card purple">
                    <i className="fas fa-bullseye card-icon"></i>
                    <h3 className="card-title">Sứ Mệnh</h3>
                    <p>
                        Cung cấp các khóa học chất lượng cao, giúp người học phát triển kỹ
                        năng và đạt được mục tiêu cá nhân và nghề nghiệp.
                    </p>
                </div>
                <div className="card yellow">
                    <i className="fas fa-eye card-icon"></i>
                    <h3 className="card-title">Tầm Nhìn</h3>
                    <p>
                        Trở thành nền tảng giáo dục trực tuyến hàng đầu, xây dựng một cộng
                        đồng học tập toàn cầu, không ngừng đổi mới và sáng tạo.
                    </p>
                </div>
                <div className="card teal">
                    <i className="fas fa-trophy card-icon"></i>
                    <h3 className="card-title">Mục Tiêu</h3>
                    <p>
                        Tạo ra các trải nghiệm học tập tương tác, cá nhân hóa, và cung cấp
                        chứng chỉ uy tín cho người học.
                    </p>
                </div>
            </section>

            {/* Team Section */}
            <section className="team-section">
                <h3 className="section-title">Đội Ngũ Giảng Viên Chuyên Nghiệp</h3>
                <div className="team-grid">
                    <div className="team-card">
                        <img
                            src="https://studiochupanhdep.com/Upload/Images/Album/anh-cv-02.jpg"
                            alt="Avatar"
                            className="team-avatar"
                        />
                        <h4>Nguyễn Văn A</h4>
                        <p>Giảng viên Lập trình Web</p>
                    </div>
                    <div className="team-card">
                        <img
                            src="https://hthaostudio.com/wp-content/uploads/2021/12/Anh-avatar-linkedin-dep-4.jpg.webp"
                            alt="Avatar"
                            className="team-avatar"
                        />
                        <h4>Lê Thị B</h4>
                        <p>Chuyên gia Phân tích Dữ liệu</p>
                    </div>
                    <div className="team-card">
                        <img
                            src="https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcRjPBjQksKVfQYMCYfAfEXOO-_CmQxPHzUHmw&s"
                            alt="Avatar"
                            className="team-avatar"
                        />
                        <h4>Phạm Văn C</h4>
                        <p>Giảng viên Thiết kế Đồ họa</p>
                    </div>
                    <div className="team-card">
                        <img
                            src="https://hthaostudio.com/wp-content/uploads/2020/04/Anh-3-min.jpg.webp"
                            alt="Avatar"
                            className="team-avatar"
                        />
                        <h4>Trần Thị D</h4>
                        <p>Chuyên gia Marketing</p>
                    </div>
                </div>
            </section>

            {/* Benefits Section */}
            <section className="benefits-section">
                <h3 className="section-title">Lợi Ích Khi Tham Gia Learning Hub</h3>
                <div className="benefits-grid">
                    <div className="benefit-card">
                        <i className="fas fa-check-circle benefit-icon green"></i>
                        <div>
                            <h4>Khoa học chất lượng cao</h4>
                            <p>
                                Được biên soạn bởi các chuyên gia đầu ngành, cập nhật xu hướng
                                mới nhất.
                            </p>
                        </div>
                    </div>
                    <div className="benefit-card">
                        <i className="fas fa-clock benefit-icon blue"></i>
                        <div>
                            <h4>Linh hoạt về thời gian</h4>
                            <p>
                                Học mọi lúc, mọi nơi, trên mọi thiết bị với các bài giảng được
                                thiết kế chuyên nghiệp.
                            </p>
                        </div>
                    </div>
                    <div className="benefit-card">
                        <i className="fas fa-users benefit-icon indigo"></i>
                        <div>
                            <h4>Cộng đồng hỗ trợ</h4>
                            <p>
                                Tham gia vào các diễn đàn, nhóm học tập để trao đổi kiến thức và
                                kinh nghiệm.
                            </p>
                        </div>
                    </div>
                    <div className="benefit-card">
                        <i className="fas fa-certificate benefit-icon yellow"></i>
                        <div>
                            <h4>Chứng chỉ uy tín</h4>
                            <p>
                                Nhận chứng chỉ hoàn thành khóa học được công nhận, giúp tăng cơ
                                hội nghề nghiệp.
                            </p>
                        </div>
                    </div>
                </div>
            </section>
        </div>
    );
}
