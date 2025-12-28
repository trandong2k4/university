import "../../styles/student/schedule-modal.css";

export default function ScheduleModal({ event, onClose }) {
    const e = event.resource;

    return (
        <div className="modal-backdrop" onClick={onClose}>
            <div className="modal-card" onClick={(ev) => ev.stopPropagation()}>
                <div className="modal-header">
                    <span className="subject-tag">Môn học</span>
                    <h2>{e.tenMonHoc}</h2>
                    <button className="close-btn" onClick={onClose}>&times;</button>
                </div>

                <div className="modal-body">
                    <div className="info-item">
                        <span className="icon">🆔</span>
                        <div className="info-content">
                            <label>Lớp học phần</label>
                            <p>{e.maLopHocPhan}</p>
                        </div>
                    </div>

                    <div className="info-item">
                        <span className="icon">👨‍🏫</span>
                        <div className="info-content">
                            <label>Giảng viên</label>
                            <p>{e.tenGiangVien}</p>
                        </div>
                    </div>

                    <div className="info-item">
                        <span className="icon">📅</span>
                        <div className="info-content">
                            <label>Thời gian</label>
                            <p>{e.ngayHoc} | {e.gioBatDau} - {e.gioKetThuc}</p>
                        </div>
                    </div>

                    <div className="info-item">
                        <span className="icon">📍</span>
                        <div className="info-content">
                            <label>Địa điểm</label>
                            <p>{e.tenPhong} ({e.toaNha})</p>
                        </div>
                    </div>
                </div>

                <div className="modal-footer">
                    <button className="done-btn" onClick={onClose}>Xác nhận</button>
                </div>
            </div>
        </div>
    );
}