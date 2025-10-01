// src/pages/dashboard/PublicDashboard.jsx
import React from "react";
import "../../styles/dashboard/publicDashboard.css";

export default function PublicDashboard() {
    return (
        <main className="dashboard-container">
            {/* Banner */}
            <section className="banner">
                <h1>Chào mừng đến với Learning Hub!</h1>
                <p>Nền tảng học tập trực tuyến hàng đầu dành cho bạn.</p>
                <div className="banner-placeholder"></div>
            </section>

            {/* Giới thiệu + Khóa học nổi bật */}
            <section className="grid-3">
                {/* Giới thiệu */}
                <div className="card intro">
                    <h2>Giới thiệu</h2>
                    <p>
                        Learning Hub là hệ thống học tập trực tuyến toàn diện, cung cấp một
                        loạt các khóa học đa dạng từ nhiều lĩnh vực. Chúng tôi cam kết mang
                        đến trải nghiệm học tập tốt nhất, với tài liệu chất lượng cao và đội
                        ngũ giảng viên chuyên nghiệp, giúp bạn đạt được mục tiêu học vấn và
                        sự nghiệp.
                    </p>
                </div>

                {/* Khóa học nổi bật */}
                <div className="card featured-courses">
                    <h2>Khóa học nổi bật</h2>
                    <ul>
                        <li>
                            <h3>Lập trình Web nâng cao</h3>
                            <p>Giảng viên: Lê Văn Cường</p>
                        </li>
                        <li>
                            <h3>Thiết kế đồ họa với Figma</h3>
                            <p>Giảng viên: Nguyễn Thị Thu</p>
                        </li>
                        <li>
                            <h3>Kế toán doanh nghiệp</h3>
                            <p>Giảng viên: Phạm Xuân Hòa</p>
                        </li>
                    </ul>
                </div>
            </section>

            {/* Lịch học + Tin tức */}
            <section className="grid-2">
                {/* Lịch học */}
                <div className="card calendar">
                    <h2>Lịch học & Lịch thi</h2>
                    <div className="calendar-header">
                        <div>T2</div><div>T3</div><div>T4</div><div>T5</div>
                        <div>T6</div><div className="weekend">T7</div><div className="weekend">CN</div>
                    </div>
                    <div className="calendar-grid">
                        <div></div><div></div><div></div><div>1</div><div>2</div><div>3</div><div>4</div>
                        <div>5</div><div>6</div><div className="highlight">7</div><div>8</div><div>9</div><div>10</div><div className="holiday">11</div>
                        <div>12</div><div>13</div><div>14</div><div>15</div><div className="highlight">16</div><div>17</div><div>18</div>
                        <div>19</div><div>20</div><div>21</div><div>22</div><div>23</div><div>24</div><div>25</div>
                        <div>26</div><div className="highlight">27</div><div>28</div><div>29</div><div>30</div>
                    </div>
                </div>

                {/* Tin tức */}
                <div className="card news">
                    <h2>Tin tức mới</h2>
                    <ul>
                        <li>
                            <h3>Learning Hub đạt giải thưởng "Nền tảng giáo dục tốt nhất"</h3>
                            <p>25/08/2025</p>
                        </li>
                        <li>
                            <h3>Khuyến mãi 50% học phí cho khóa học tiếng Anh mới</h3>
                            <p>22/08/2025</p>
                        </li>
                        <li>
                            <h3>Hội thảo trực tuyến: Tương lai của AI trong giáo dục</h3>
                            <p>20/08/2025</p>
                        </li>
                    </ul>
                </div>
            </section>

            {/* Liên hệ */}
            <section className="card contact">
                <h2>Liên hệ với chúng tôi</h2>
                <form>
                    <label>
                        Tên
                        <input type="text" />
                    </label>
                    <label>
                        Email
                        <input type="email" />
                    </label>
                    <label>
                        Nội dung
                        <textarea rows="4"></textarea>
                    </label>
                    <button type="submit">Gửi</button>
                </form>
            </section>
        </main>
    );
}
