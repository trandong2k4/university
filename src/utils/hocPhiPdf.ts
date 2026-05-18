import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';

export interface HocPhiInvoiceData {
  hoTen: string;
  maHocVien: string;
  tenNganh: string;
  hocPhiId: string;
  maHocKi: string;
  tenHocKi: string;
  soTinChi: number;
  soTien: number;
  trangThai: string;
  ngayThanhToan: string | null;
  phuongThucThanhToan: string | null;
}

const STATUS_LABELS: Record<string, string> = {
  DA_THANH_TOAN: 'ĐÃ THANH TOÁN',
  DANG_XU_LY: 'ĐANG XỬ LÝ (Chờ xác nhận)',
  CHUA_THANH_TOAN: 'CHƯA THANH TOÁN',
  QUA_HAN: 'QUÁ HẠN',
};

const STATUS_COLORS: Record<string, string> = {
  DA_THANH_TOAN: '#16a34a',
  DANG_XU_LY: '#d97706',
  CHUA_THANH_TOAN: '#4b5563',
  QUA_HAN: '#dc2626',
};

const PT_LABELS: Record<string, string> = {
  VI_DIEN_TU: 'Ví điện tử',
  CHUYEN_KHOAN: 'Chuyển khoản ngân hàng',
  THE_NOI_DIA: 'Thẻ nội địa (ATM)',
  THE_QUOC_TE: 'Thẻ quốc tế (Visa/Mastercard)',
};

function fmtCurrency(amount: number): string {
  return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(amount);
}

function fmtDate(dt: string | null): string {
  if (!dt) return '—';
  return new Date(dt).toLocaleDateString('vi-VN', { day: '2-digit', month: '2-digit', year: 'numeric' });
}

function buildInvoiceHTML(data: HocPhiInvoiceData): string {
  const ngayLap = new Date().toLocaleDateString('vi-VN', { day: '2-digit', month: '2-digit', year: 'numeric' });
  const donGia = data.soTinChi > 0 ? Math.round(data.soTien / data.soTinChi) : 0;
  const trangThaiLabel = STATUS_LABELS[data.trangThai] ?? data.trangThai;
  const trangThaiColor = STATUS_COLORS[data.trangThai] ?? '#4b5563';
  const isPaid = data.trangThai === 'DA_THANH_TOAN';
  const isPending = data.trangThai === 'DANG_XU_LY';
  const ptLabel = data.phuongThucThanhToan
    ? (PT_LABELS[data.phuongThucThanhToan] ?? data.phuongThucThanhToan)
    : '—';
  const soHD = data.hocPhiId.substring(0, 8).toUpperCase();

  return `
<div style="width:714px;padding:40px 48px;font-family:'Times New Roman',Times,serif;font-size:13px;color:#111;background:#fff;box-sizing:border-box;">

  <!-- Header -->
  <table style="width:100%;border-collapse:collapse;margin-bottom:4px;">
    <tr>
      <td style="width:70%;vertical-align:top;">
        <div style="font-size:12px;font-weight:bold;text-transform:uppercase;letter-spacing:.5px;">LEARNING HUB NỀN TẢNG ĐÀO TẠO THÔNG MINH</div>
        <div style="font-size:11px;color:#555;margin-top:2px;">Phòng Tài chính – Kế toán</div>
        <div style="font-size:11px;color:#555;">123 VÕ CHÍ CÔNG, TP HỒ CHÍ MINH</div>
        <div style="font-size:11px;color:#555;">ĐT: (0236) 3650 403 | Fax: (0236) 3650 079</div>
      </td>
      <td style="width:30%;text-align:right;vertical-align:top;font-size:11px;color:#555;">
        <div>Mẫu số: 01-TT</div>
        <div style="margin-top:2px;">Ban hành kèm theo TT 133/2016/TT-BTC</div>
      </td>
    </tr>
  </table>

  <div style="text-align:center;border-top:3px double #111;border-bottom:1px solid #111;padding:10px 0;margin:14px 0 10px;">
    <div style="font-size:22px;font-weight:bold;letter-spacing:3px;text-transform:uppercase;">Hóa Đơn Học Phí</div>
    <div style="font-size:12px;margin-top:4px;color:#444;">Số: ${soHD} &nbsp;|&nbsp; Ngày lập: ${ngayLap}</div>
  </div>

  <!-- Student info -->
  <table style="width:100%;border-collapse:collapse;margin-bottom:14px;">
    <tr>
      <td style="padding:3px 12px 3px 0;width:38%;font-weight:bold;">Họ và tên học viên:</td>
      <td style="padding:3px 0;">${data.hoTen || '—'}</td>
    </tr>
    <tr>
      <td style="padding:3px 12px 3px 0;font-weight:bold;">Mã học viên:</td>
      <td style="padding:3px 0;">${data.maHocVien || '—'}</td>
    </tr>
    <tr>
      <td style="padding:3px 12px 3px 0;font-weight:bold;">Ngành học:</td>
      <td style="padding:3px 0;">${data.tenNganh || '—'}</td>
    </tr>
    <tr>
      <td style="padding:3px 12px 3px 0;font-weight:bold;">Đơn vị:</td>
      <td style="padding:3px 0;">LEANRNING HUB</td>
    </tr>
  </table>

  <!-- Invoice table -->
  <table style="width:100%;border-collapse:collapse;margin-bottom:14px;">
    <thead>
      <tr style="background:#1a1a1a;color:#fff;">
        <th style="padding:9px 10px;text-align:center;font-size:12px;width:36px;border:1px solid #333;">STT</th>
        <th style="padding:9px 10px;text-align:left;font-size:12px;border:1px solid #333;">Diễn giải</th>
        <th style="padding:9px 10px;text-align:center;font-size:12px;width:70px;border:1px solid #333;">Số TC</th>
        <th style="padding:9px 10px;text-align:right;font-size:12px;width:120px;border:1px solid #333;">Đơn giá/TC</th>
        <th style="padding:9px 10px;text-align:right;font-size:12px;width:140px;border:1px solid #333;">Thành tiền</th>
      </tr>
    </thead>
    <tbody>
      <tr>
        <td style="padding:10px;text-align:center;border:1px solid #ddd;font-size:12px;">1</td>
        <td style="padding:10px;border:1px solid #ddd;font-size:12px;">
          <div style="font-weight:bold;">${data.tenHocKi}</div>
          <div style="color:#666;font-size:11px;margin-top:2px;">Mã học kỳ: ${data.maHocKi}</div>
        </td>
        <td style="padding:10px;text-align:center;border:1px solid #ddd;font-size:12px;">${data.soTinChi}</td>
        <td style="padding:10px;text-align:right;border:1px solid #ddd;font-size:12px;">${fmtCurrency(donGia)}</td>
        <td style="padding:10px;text-align:right;border:1px solid #ddd;font-size:13px;font-weight:bold;">${fmtCurrency(data.soTien)}</td>
      </tr>
    </tbody>
    <tfoot>
      <tr style="background:#f5f5f5;">
        <td colspan="4" style="padding:10px;text-align:right;font-weight:bold;font-size:13px;border:1px solid #ddd;">TỔNG CỘNG (bằng số):</td>
        <td style="padding:10px;text-align:right;font-weight:bold;font-size:15px;color:#1d4ed8;border:1px solid #ddd;">${fmtCurrency(data.soTien)}</td>
      </tr>
    </tfoot>
  </table>

  <!-- Payment status box -->
  <div style="border:1px solid #ccc;border-radius:4px;padding:12px 16px;margin-bottom:16px;background:#fafafa;">
    <div style="display:flex;align-items:center;gap:6px;margin-bottom:${isPaid || isPending ? '8px' : '0'};">
      <span style="font-weight:bold;font-size:13px;">Trạng thái thanh toán:</span>
      <span style="color:${trangThaiColor};font-weight:bold;font-size:13px;">■ ${trangThaiLabel}</span>
    </div>
    ${isPaid ? `
      <table style="width:100%;font-size:12px;color:#444;">
        <tr>
          <td style="padding:2px 12px 2px 0;width:38%;"><strong>Ngày thanh toán:</strong></td>
          <td>${fmtDate(data.ngayThanhToan)}</td>
        </tr>
        <tr>
          <td style="padding:2px 12px 2px 0;"><strong>Phương thức:</strong></td>
          <td>${ptLabel}</td>
        </tr>
      </table>
    ` : isPending ? `
      <div style="font-size:12px;color:#d97706;">Chứng từ đã được nộp, đang chờ kế toán xác nhận.</div>
    ` : `
      <div style="font-size:12px;color:#dc2626;">Học phí chưa được thanh toán. Vui lòng thanh toán trước hạn để tránh bị khóa học.</div>
    `}
  </div>

  <!-- Signature -->
  <table style="width:100%;border-collapse:collapse;margin-top:24px;">
    <tr>
      <td style="width:45%;text-align:center;vertical-align:top;padding:0 8px;">
        <div style="font-size:12px;font-style:italic;">Đà Nẵng, ngày ${ngayLap}</div>
        <div style="margin-top:6px;font-weight:bold;font-size:12px;">HỌC VIÊN</div>
        <div style="font-style:italic;font-size:11px;color:#666;">(Ký, ghi rõ họ tên)</div>
        <div style="height:52px;"></div>
        <div style="font-size:12px;border-top:1px solid #888;display:inline-block;padding-top:4px;min-width:120px;">${data.hoTen || ''}</div>
      </td>
      <td style="width:10%;"></td>
      <td style="width:45%;text-align:center;vertical-align:top;padding:0 8px;">
        <div style="font-size:12px;font-weight:bold;text-transform:uppercase;">Phòng Tài chính – Kế toán</div>
        <div style="font-style:italic;font-size:11px;color:#666;">(Ký, đóng dấu, ghi rõ họ tên)</div>
        <div style="height:52px;"></div>
        <div style="font-size:11px;color:#888;border-top:1px solid #888;display:inline-block;padding-top:4px;min-width:120px;">___________________________</div>
      </td>
    </tr>
  </table>

  <!-- Footer -->
  <div style="border-top:2px solid #111;margin-top:20px;padding-top:8px;text-align:center;font-size:10px;color:#666;">
    Hóa đơn được xuất bởi Hệ thống Quản lý Đào tạo – LearningHub Nền Tảng Đào Tạo Thông Minh &nbsp;|&nbsp; ${new Date().toLocaleString('vi-VN')}
  </div>
</div>
  `;
}

export async function downloadInvoicePDF(data: HocPhiInvoiceData): Promise<void> {
  const container = document.createElement('div');
  container.style.cssText = 'position:fixed;top:-12000px;left:-12000px;width:810px;background:#fff;';
  container.innerHTML = buildInvoiceHTML(data);
  document.body.appendChild(container);

  try {
    const canvas = await html2canvas(container, {
      scale: 2,
      useCORS: true,
      backgroundColor: '#ffffff',
      logging: false,
      // Remove page stylesheets from the clone so html2canvas never sees
      // Tailwind v4's oklch() colors (unsupported by html2canvas 1.x).
      // Our invoice uses only inline hex/rgb styles so nothing is lost.
      onclone: (clonedDoc) => {
        clonedDoc
          .querySelectorAll('style, link[rel="stylesheet"]')
          .forEach(el => el.remove());
      },
    });

    const pdf = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' });
    const pageW = 210;
    const pageH = 297;
    const imgW = pageW;
    const imgH = (canvas.height * imgW) / canvas.width;
    const imgData = canvas.toDataURL('image/png');

    if (imgH <= pageH) {
      pdf.addImage(imgData, 'PNG', 0, 0, imgW, imgH);
    } else {
      // content taller than one page — scale to fit
      pdf.addImage(imgData, 'PNG', 0, 0, imgW, pageH);
    }

    const svCode = data.maHocVien || 'sv';
    pdf.save(`hoa-don-${data.maHocKi}-${svCode}.pdf`);
  } finally {
    document.body.removeChild(container);
  }
}
