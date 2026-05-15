import { useCallback, useEffect, useState } from 'react';
import { useNavigate } from 'react-router';
import { useAuth } from '@/hooks';
import { apiClient } from '@/api/common';
import { StudentSidebar } from '@/components/layouts/StudentSidebar';
import { StudentHeader } from '@/components/layouts/StudentHeader';
import { AIAssistantButton } from '@/components/chatbot/AIAssistantButton';
import axios from 'axios';
import {
  Star,
  CheckCircle,
  Clock,
  Send,
  X,
  UserCheck,
  MessageSquare,
  TrendingUp,
  BookOpen,
  AlertCircle,
  Loader2,
  RefreshCw,
  Save,
} from 'lucide-react';

// ── Types ─────────────────────────────────────────────────────────────────────

interface DanhGiaItem {
  lopHocPhanId: string;
  maLopHocPhan: string;
  tenMonHoc: string;
  nhanVienId: string;
  maNhanVien: string;
  tenGiangVien: string;
  diemDanhGia: number | null;
  nhanXet: string | null;
  daGui: boolean;
  coTheDanhGia: boolean;
  thoiGianMoDanhGia: string | null;
  thoiGianDongDanhGia: string | null;
}

// ── Helpers ───────────────────────────────────────────────────────────────────

const formatDateTime = (dt: string | null) => {
  if (!dt) return '—';
  return new Date(dt).toLocaleDateString('vi-VN', {
    day: '2-digit', month: '2-digit', year: 'numeric',
  });
};

const extractError = (err: unknown): string => {
  if (axios.isAxiosError(err)) {
    const detail = err.response?.data?.detail;
    if (detail) return detail;
  }
  return 'Có lỗi xảy ra. Vui lòng thử lại.';
};

// ── Star component ─────────────────────────────────────────────────────────────

function StarRating({
  value,
  onChange,
  readOnly = false,
  size = 'md',
}: {
  value: number;
  onChange?: (v: number) => void;
  readOnly?: boolean;
  size?: 'sm' | 'md' | 'lg';
}) {
  const [hover, setHover] = useState(0);
  const sz = size === 'sm' ? 'w-4 h-4' : size === 'lg' ? 'w-9 h-9' : 'w-6 h-6';
  const display = hover || value;

  return (
    <div className="flex items-center gap-1">
      {[1, 2, 3, 4, 5].map(s => (
        <button
          key={s}
          type="button"
          disabled={readOnly}
          onClick={() => !readOnly && onChange?.(s)}
          onMouseEnter={() => !readOnly && setHover(s)}
          onMouseLeave={() => !readOnly && setHover(0)}
          className={`transition-transform focus:outline-none ${!readOnly ? 'hover:scale-110 cursor-pointer' : 'cursor-default'}`}
        >
          <Star className={`${sz} transition-colors ${s <= display ? 'fill-yellow-400 text-yellow-400' : 'text-gray-300'}`} />
        </button>
      ))}
    </div>
  );
}

const DIEM_LABEL: Record<number, string> = {
  1: 'Kém',
  2: 'Yếu',
  3: 'Trung bình',
  4: 'Tốt',
  5: 'Xuất sắc',
};

// ── Component ─────────────────────────────────────────────────────────────────

export default function InstructorRatingPage() {
  const navigate = useNavigate();
  const { user: authUser, isAuthenticated } = useAuth();

  const [list, setList] = useState<DanhGiaItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const [selected, setSelected] = useState<DanhGiaItem | null>(null);
  const [diem, setDiem] = useState(0);
  const [nhanXet, setNhanXet] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [savingDraft, setSavingDraft] = useState(false);
  const [modalError, setModalError] = useState('');

  useEffect(() => {
    if (!isAuthenticated || !authUser) { navigate('/'); return; }
    if (authUser.role !== 'student') { navigate('/'); return; }
  }, [isAuthenticated, authUser, navigate]);

  const fetchList = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const res = await apiClient.get<DanhGiaItem[]>('/student/danh-gia-giang-vien');
      setList(res.data);
    } catch {
      setError('Không thể tải danh sách đánh giá. Vui lòng thử lại.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchList(); }, [fetchList]);

  const openModal = (item: DanhGiaItem) => {
    setSelected(item);
    setDiem(item.diemDanhGia ?? 0);
    setNhanXet(item.nhanXet ?? '');
    setModalError('');
  };

  const closeModal = () => {
    setSelected(null);
    setDiem(0);
    setNhanXet('');
    setModalError('');
  };

  const handleSaveDraft = async () => {
    if (!selected || diem === 0) { setModalError('Vui lòng chọn điểm đánh giá.'); return; }
    setSavingDraft(true);
    setModalError('');
    try {
      await apiClient.post('/student/danh-gia-giang-vien/draft', {
        lopHocPhanId: selected.lopHocPhanId,
        diemDanhGia: diem,
        nhanXet: nhanXet.trim() || undefined,
      });
      await fetchList();
    } catch (err) {
      setModalError(extractError(err));
    } finally {
      setSavingDraft(false);
    }
  };

  const handleSubmit = async () => {
    if (!selected) return;
    if (diem === 0) { setModalError('Vui lòng chọn điểm đánh giá.'); return; }
    if (!nhanXet.trim()) { setModalError('Vui lòng nhập nhận xét.'); return; }
    if (nhanXet.trim().length < 10) { setModalError('Nhận xét cần ít nhất 10 ký tự.'); return; }

    setSubmitting(true);
    setModalError('');
    try {
      await apiClient.post('/student/danh-gia-giang-vien/submit', {
        lopHocPhanId: selected.lopHocPhanId,
        diemDanhGia: diem,
        nhanXet: nhanXet.trim(),
      });
      closeModal();
      await fetchList();
    } catch (err) {
      setModalError(extractError(err));
    } finally {
      setSubmitting(false);
    }
  };

  if (!authUser) return null;
  const userName = authUser.fullName || authUser.username || '';

  const daGuiCount = list.filter(i => i.daGui).length;
  const coTheDanhGiaCount = list.filter(i => i.coTheDanhGia).length;
  const chuaMoCount = list.filter(i => !i.daGui && !i.coTheDanhGia).length;
  const completionRate = list.length > 0 ? (daGuiCount / list.length) * 100 : 0;

  return (
    <div className="flex h-screen bg-[#f1f5f9]">
      <StudentSidebar />

      <div className="flex-1 ml-64 flex flex-col">
        <StudentHeader userName={userName} />

        <main className="flex-1 overflow-y-auto p-8">
          <div className="mb-6 flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-[#0a2540]">Đánh giá giảng viên</h1>
              <p className="text-[#6a7282] mt-1">Các môn học đã hoàn thành — đánh giá trong 30 ngày sau khi kỳ kết thúc</p>
            </div>
            <button onClick={fetchList} className="p-2 text-[#6a7282] hover:text-[#0a2540] hover:bg-white rounded-lg transition-colors" title="Làm mới">
              <RefreshCw className="w-5 h-5" />
            </button>
          </div>

          {loading ? (
            <div className="flex items-center justify-center py-32">
              <Loader2 className="w-10 h-10 animate-spin text-[#0a2540]" />
            </div>
          ) : error ? (
            <div className="flex flex-col items-center justify-center py-24 gap-3">
              <AlertCircle className="w-10 h-10 text-red-500" />
              <p className="text-red-600 font-medium">{error}</p>
              <button onClick={fetchList} className="px-5 py-2 bg-[#0a2540] text-white rounded-lg text-sm font-semibold hover:bg-[#0d2f52]">
                Thử lại
              </button>
            </div>
          ) : (
            <>
              {/* Stats */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
                <div className="bg-white rounded-[14px] border border-[#e5e7eb] shadow-sm p-5 flex items-center gap-3">
                  <div className="p-2.5 bg-blue-100 rounded-lg"><BookOpen className="w-5 h-5 text-blue-600" /></div>
                  <div>
                    <p className="text-xs text-[#6a7282]">Tổng môn học</p>
                    <p className="text-2xl font-bold text-[#0a2540]">{list.length}</p>
                  </div>
                </div>
                <div className="bg-white rounded-[14px] border border-[#e5e7eb] shadow-sm p-5 flex items-center gap-3">
                  <div className="p-2.5 bg-green-100 rounded-lg"><CheckCircle className="w-5 h-5 text-green-600" /></div>
                  <div>
                    <p className="text-xs text-[#6a7282]">Đã đánh giá</p>
                    <p className="text-2xl font-bold text-[#0a2540]">{daGuiCount}</p>
                  </div>
                </div>
                <div className="bg-white rounded-[14px] border border-[#e5e7eb] shadow-sm p-5 flex items-center gap-3">
                  <div className="p-2.5 bg-yellow-100 rounded-lg"><Star className="w-5 h-5 text-yellow-600" /></div>
                  <div>
                    <p className="text-xs text-[#6a7282]">Chờ đánh giá</p>
                    <p className="text-2xl font-bold text-[#0a2540]">{coTheDanhGiaCount}</p>
                  </div>
                </div>
                <div className="bg-white rounded-[14px] border border-[#e5e7eb] shadow-sm p-5 flex items-center gap-3">
                  <div className="p-2.5 bg-purple-100 rounded-lg"><TrendingUp className="w-5 h-5 text-purple-600" /></div>
                  <div>
                    <p className="text-xs text-[#6a7282]">Tỷ lệ hoàn thành</p>
                    <p className="text-2xl font-bold text-[#0a2540]">{completionRate.toFixed(0)}%</p>
                  </div>
                </div>
              </div>

              {/* Progress */}
              {list.length > 0 && (
                <div className="bg-white rounded-[14px] border border-[#e5e7eb] shadow-sm p-5 mb-6">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-semibold text-[#0a2540]">Tiến độ đánh giá</span>
                    <span className="text-sm text-[#6a7282]">{daGuiCount}/{list.length} môn ({completionRate.toFixed(0)}%)</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2.5">
                    <div className="bg-gradient-to-r from-blue-600 to-purple-600 h-2.5 rounded-full transition-all" style={{ width: `${completionRate}%` }} />
                  </div>
                  {coTheDanhGiaCount > 0 && (
                    <p className="text-sm text-orange-600 mt-2 flex items-center gap-1.5">
                      <Clock className="w-4 h-4" />
                      Còn {coTheDanhGiaCount} môn đang trong thời gian đánh giá
                    </p>
                  )}
                </div>
              )}

              {/* List */}
              {list.length === 0 ? (
                <div className="bg-white rounded-[14px] border border-[#e5e7eb] shadow-sm p-16 text-center">
                  <UserCheck className="w-14 h-14 text-[#d1d5db] mx-auto mb-3" />
                  <p className="text-[#6a7282] font-medium">Chưa có môn học nào đã hoàn thành</p>
                  <p className="text-sm text-[#9ca3af] mt-1">Sau khi kỳ học kết thúc, bạn có thể đánh giá giảng viên tại đây</p>
                </div>
              ) : (
                <div className="bg-white rounded-[14px] border border-[#e5e7eb] shadow-sm overflow-hidden">
                  <div className="px-6 py-4 border-b border-[#e5e7eb]">
                    <h3 className="font-bold text-[#0a2540] flex items-center gap-2">
                      <UserCheck className="w-5 h-5 text-blue-600" />
                      Danh sách môn học ({list.length})
                    </h3>
                  </div>

                  <div className="divide-y divide-[#e5e7eb]">
                    {list.map(item => {
                      const canAct = item.coTheDanhGia && !item.daGui;
                      const hasDraft = !item.daGui && item.diemDanhGia != null;

                      return (
                        <div key={item.lopHocPhanId} className={`p-6 transition-colors ${!item.daGui && !item.coTheDanhGia ? 'opacity-60' : 'hover:bg-[#f9fafb]'}`}>
                          <div className="flex items-start gap-4">
                            {/* Avatar */}
                            <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white font-bold text-lg flex-shrink-0">
                              {item.tenGiangVien.charAt(0)}
                            </div>

                            <div className="flex-1 min-w-0">
                              <div className="flex items-start justify-between gap-3 mb-1">
                                <div>
                                  <h4 className="font-bold text-[#0a2540]">{item.tenGiangVien}</h4>
                                  <p className="text-xs text-[#6a7282]">Mã NV: {item.maNhanVien}</p>
                                </div>
                                {/* Status badge */}
                                {item.daGui ? (
                                  <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-green-100 text-green-700 rounded-full text-xs font-semibold whitespace-nowrap">
                                    <CheckCircle className="w-3.5 h-3.5" />
                                    Đã đánh giá
                                  </span>
                                ) : item.coTheDanhGia ? (
                                  <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-yellow-100 text-yellow-700 rounded-full text-xs font-semibold whitespace-nowrap">
                                    <Clock className="w-3.5 h-3.5" />
                                    {hasDraft ? 'Có bản nháp' : 'Chờ đánh giá'}
                                  </span>
                                ) : (
                                  <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-gray-100 text-gray-500 rounded-full text-xs font-semibold whitespace-nowrap">
                                    <AlertCircle className="w-3.5 h-3.5" />
                                    Chưa mở
                                  </span>
                                )}
                              </div>

                              {/* Course info */}
                              <div className="flex items-center gap-2 text-sm mb-2">
                                <BookOpen className="w-4 h-4 text-[#6a7282] flex-shrink-0" />
                                <span className="font-mono text-[#0a2540] font-semibold">{item.maLopHocPhan}</span>
                                <span className="text-[#9ca3af]">·</span>
                                <span className="text-[#374151]">{item.tenMonHoc}</span>
                              </div>

                              {/* Evaluation window */}
                              {item.thoiGianMoDanhGia && (
                                <p className="text-xs text-[#9ca3af] mb-3">
                                  Thời gian đánh giá: {formatDateTime(item.thoiGianMoDanhGia)} → {formatDateTime(item.thoiGianDongDanhGia)}
                                </p>
                              )}

                              {/* Submitted rating preview */}
                              {item.daGui && (
                                <div className="flex items-center gap-2">
                                  <StarRating value={item.diemDanhGia ?? 0} readOnly size="sm" />
                                  {item.diemDanhGia && (
                                    <span className="text-xs font-semibold text-[#6a7282]">
                                      {item.diemDanhGia}/5 · {DIEM_LABEL[item.diemDanhGia]}
                                    </span>
                                  )}
                                </div>
                              )}

                              {/* Draft preview */}
                              {hasDraft && (
                                <div className="flex items-center gap-2 mt-1">
                                  <StarRating value={item.diemDanhGia!} readOnly size="sm" />
                                  <span className="text-xs text-yellow-600 font-medium">Bản nháp · {item.diemDanhGia}/5</span>
                                </div>
                              )}

                              {/* Action */}
                              <div className="mt-3">
                                {canAct ? (
                                  <button
                                    onClick={() => openModal(item)}
                                    className="px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-semibold hover:bg-blue-700 transition-colors flex items-center gap-2"
                                  >
                                    <Star className="w-4 h-4" />
                                    {hasDraft ? 'Tiếp tục đánh giá' : 'Đánh giá ngay'}
                                  </button>
                                ) : item.daGui ? (
                                  <span className="text-xs text-green-600 font-medium flex items-center gap-1">
                                    <CheckCircle className="w-3.5 h-3.5" />
                                    Đã gửi đánh giá
                                  </span>
                                ) : (
                                  <span className="text-xs text-[#9ca3af]">
                                    {item.thoiGianMoDanhGia && new Date(item.thoiGianMoDanhGia) > new Date()
                                      ? `Mở từ ${formatDateTime(item.thoiGianMoDanhGia)}`
                                      : item.thoiGianDongDanhGia && new Date(item.thoiGianDongDanhGia) < new Date()
                                      ? 'Đã hết thời hạn đánh giá'
                                      : 'Chưa có thông tin thời gian đánh giá'}
                                  </span>
                                )}
                              </div>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>

                  {chuaMoCount > 0 && (
                    <div className="px-6 py-3 bg-[#f9fafb] border-t border-[#e5e7eb]">
                      <p className="text-xs text-[#9ca3af]">
                        {chuaMoCount} môn chưa trong thời gian đánh giá (mờ dần)
                      </p>
                    </div>
                  )}
                </div>
              )}
            </>
          )}
        </main>
      </div>

      <AIAssistantButton />

      {/* Rating Modal */}
      {selected && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4" onClick={closeModal}>
          <div className="bg-white rounded-[16px] shadow-xl w-full max-w-lg" onClick={e => e.stopPropagation()}>
            {/* Header */}
            <div className="px-6 py-5 border-b border-[#e5e7eb] flex items-center justify-between">
              <div>
                <h2 className="text-xl font-bold text-[#0a2540]">Đánh giá giảng viên</h2>
                <p className="text-sm text-[#6a7282] mt-0.5">{selected.tenMonHoc}</p>
              </div>
              <button onClick={closeModal} className="p-2 hover:bg-[#f1f5f9] rounded-lg transition-colors">
                <X className="w-5 h-5 text-[#6a7282]" />
              </button>
            </div>

            <div className="px-6 py-5 space-y-5">
              {/* Instructor info */}
              <div className="flex items-center gap-4 p-4 bg-blue-50 border border-blue-100 rounded-lg">
                <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white font-bold text-lg flex-shrink-0">
                  {selected.tenGiangVien.charAt(0)}
                </div>
                <div>
                  <p className="font-bold text-blue-900">{selected.tenGiangVien}</p>
                  <p className="text-sm text-blue-700">{selected.maLopHocPhan} · {selected.tenMonHoc}</p>
                </div>
              </div>

              {/* Star rating */}
              <div>
                <label className="block text-sm font-semibold text-[#0a2540] mb-3">
                  Điểm đánh giá <span className="text-red-500">*</span>
                </label>
                <div className="flex items-center gap-4">
                  <StarRating value={diem} onChange={setDiem} size="lg" />
                  {diem > 0 && (
                    <span className="text-sm font-semibold text-[#0a2540]">
                      {diem}/5 — <span className="text-blue-600">{DIEM_LABEL[diem]}</span>
                    </span>
                  )}
                </div>
              </div>

              {/* Comment */}
              <div>
                <label className="block text-sm font-semibold text-[#0a2540] mb-2 flex items-center gap-2">
                  <MessageSquare className="w-4 h-4 text-blue-600" />
                  Nhận xét <span className="text-red-500">*</span>
                </label>
                <textarea
                  value={nhanXet}
                  onChange={e => setNhanXet(e.target.value)}
                  placeholder="Chia sẻ trải nghiệm học tập với giảng viên... (tối thiểu 10 ký tự)"
                  className="w-full px-4 py-3 border border-[#e5e7eb] rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#0a2540] resize-none min-h-[110px] transition-colors"
                  maxLength={500}
                />
                <p className="text-xs text-[#9ca3af] mt-1 text-right">{nhanXet.length}/500</p>
              </div>

              {modalError && (
                <div className="flex items-center gap-2 p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">
                  <AlertCircle className="w-4 h-4 flex-shrink-0" />
                  {modalError}
                </div>
              )}
            </div>

            {/* Footer */}
            <div className="px-6 pb-5 flex gap-3">
              <button
                onClick={handleSaveDraft}
                disabled={savingDraft || submitting || diem === 0}
                className="px-4 py-2.5 border border-[#e5e7eb] text-[#0a2540] rounded-lg text-sm font-medium hover:bg-[#f1f5f9] transition-colors flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {savingDraft ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                Lưu nháp
              </button>
              <button
                onClick={handleSubmit}
                disabled={submitting || savingDraft}
                className="flex-1 py-2.5 bg-blue-600 text-white rounded-lg text-sm font-semibold hover:bg-blue-700 transition-colors flex items-center justify-center gap-2 disabled:opacity-60 disabled:cursor-not-allowed"
              >
                {submitting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
                {submitting ? 'Đang gửi...' : 'Gửi đánh giá'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
