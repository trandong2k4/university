import { InstructorSidebar } from '@/components/layouts/InstructorSidebar';
import { InstructorHeader } from '@/components/layouts/InstructorHeader';
import {
  ChevronDown, Save, Search, AlertCircle, Calculator, TrendingUp,
  Users, Award, Plus, Trash2, X, Clock, History, FileSpreadsheet,
  FileText, Edit2, CheckCircle, Download, Settings2
} from 'lucide-react';
import { useEffect, useState } from 'react';
import { useAuth } from '@/hooks';
import { toast } from 'sonner';
import AiAssistantButton from '@/imports/AiAssistantButton';
import lecturerApi, {
  LecturerClassSummaryResponseDTO,
  GradeStudentResponseDTO,
  GradeColumnDTO,
  GradeHistoryResponseDTO,
  CreateCotDiemRequestDTO,
} from '@/api/lecturer/lecturer.api';

interface StudentGrade extends GradeStudentResponseDTO {
  editedGrades: Record<string, string>;
  originalGrades: Record<string, number | null>;
}

interface NewColumnForm {
  tenCotDiem: string;
  tiTrong: string;
  loai: string;
}

function gradeColor(diem: number | null | undefined) {
  if (diem === null || diem === undefined) return { bg: 'bg-gray-100', text: 'text-gray-500', bar: 'bg-gray-200' };
  if (diem >= 8.5) return { bg: 'bg-green-50', text: 'text-green-700', bar: 'bg-green-500' };
  if (diem >= 7.0) return { bg: 'bg-blue-50', text: 'text-blue-700', bar: 'bg-blue-500' };
  if (diem >= 5.0) return { bg: 'bg-yellow-50', text: 'text-yellow-700', bar: 'bg-yellow-500' };
  return { bg: 'bg-red-50', text: 'text-red-700', bar: 'bg-red-500' };
}

function gradeRank(diem: number | null | undefined) {
  if (diem === null || diem === undefined) return '—';
  if (diem >= 8.5) return 'Xuất sắc';
  if (diem >= 7.0) return 'Giỏi';
  if (diem >= 5.0) return 'Trung bình';
  return 'Yếu';
}

function formatDateTime(s: string) {
  if (!s) return '';
  return new Date(s).toLocaleString('vi-VN', {
    day: '2-digit', month: '2-digit', year: 'numeric',
    hour: '2-digit', minute: '2-digit'
  });
}

export default function GradeManagement() {
  const { user } = useAuth();
  const [classes, setClasses] = useState<LecturerClassSummaryResponseDTO[]>([]);
  const [selectedClassId, setSelectedClassId] = useState('');
  const [columns, setColumns] = useState<GradeColumnDTO[]>([]);
  const [students, setStudents] = useState<StudentGrade[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);
  const [saving, setSaving] = useState(false);
  const [loadingStudents, setLoadingStudents] = useState(false);

  // Column management
  const [showColumnModal, setShowColumnModal] = useState(false);
  const [newColumn, setNewColumn] = useState<NewColumnForm>({ tenCotDiem: '', tiTrong: '', loai: '' });
  const [creatingColumn, setCreatingColumn] = useState(false);

  // History modal
  const [historyStudent, setHistoryStudent] = useState<GradeStudentResponseDTO | null>(null);
  const [history, setHistory] = useState<GradeHistoryResponseDTO[]>([]);
  const [loadingHistory, setLoadingHistory] = useState(false);

  // Export menu
  const [showExportMenu, setShowExportMenu] = useState(false);

  // Load classes
  useEffect(() => {
    if (!user?.id) return;
    const cached = localStorage.getItem(`lecturer_classes_${user.id}`);
    if (cached) {
      try {
        const parsed = JSON.parse(cached);
        setClasses(parsed);
        const cachedSelected = localStorage.getItem(`lecturer_selected_class_${user.id}`);
        if (cachedSelected && parsed.some((c: LecturerClassSummaryResponseDTO) => c.lopHocPhanId === cachedSelected)) {
          setSelectedClassId(cachedSelected);
          return;
        }
        if (parsed.length > 0) setSelectedClassId(parsed[0].lopHocPhanId);
      } catch { /* ignore */ }
    }
    lecturerApi.getClasses(user.id).then(data => {
      setClasses(data);
      localStorage.setItem(`lecturer_classes_${user.id}`, JSON.stringify(data));
      if (data.length > 0) {
        const firstClassId = data[0].lopHocPhanId;
        setSelectedClassId(firstClassId);
        localStorage.setItem(`lecturer_selected_class_${user.id}`, firstClassId);
      }
    }).catch(console.error);
  }, [user?.id]);

  useEffect(() => {
    if (selectedClassId && user?.id) {
      localStorage.setItem(`lecturer_selected_class_${user.id}`, selectedClassId);
    }
  }, [selectedClassId, user?.id]);

  // Load grades
  const loadGrades = () => {
    if (!selectedClassId || !user?.id) return;
    setLoadingStudents(true);
    lecturerApi.getGrades(selectedClassId, user.id)
      .then(data => {
        setColumns(data.columns || []);
        setStudents(data.students.map(s => {
          const edited: Record<string, string> = {};
          const original: Record<string, number | null> = {};
          if (s.diemThanhPhan) {
            s.diemThanhPhan.forEach(cp => {
              edited[cp.cotDiemId] = cp.diem !== null ? String(cp.diem) : '';
              original[cp.cotDiemId] = cp.diem;
            });
          }
          return { ...s, editedGrades: edited, originalGrades: original };
        }));
        setHasUnsavedChanges(false);
      })
      .catch(err => {
        console.error(err);
        toast.error('Không thể tải dữ liệu điểm');
      })
      .finally(() => setLoadingStudents(false));
  };

  useEffect(() => { loadGrades(); }, [selectedClassId, user?.id]);

  const filtered = students.filter(s =>
    s.hoTen.toLowerCase().includes(searchTerm.toLowerCase()) ||
    s.maHocVien.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const validateGrade = (v: string) => v === '' || (!isNaN(Number(v)) && Number(v) >= 0 && Number(v) <= 10);

  const handleGradeChange = (hocVienId: string, cotDiemId: string, value: string) => {
    setStudents(prev => prev.map(s => {
      if (s.hocVienId !== hocVienId) return s;
      const newEdited = { ...s.editedGrades, [cotDiemId]: value };
      return { ...s, editedGrades: newEdited };
    }));
    setHasUnsavedChanges(true);
  };

  const handleSave = async () => {
    if (!user?.id || !selectedClassId) return;
    const allValid = students.every(s =>
      Object.values(s.editedGrades).every(v => validateGrade(v))
    );
    if (!allValid) {
      toast.error('Vui lòng kiểm tra lại điểm (phải từ 0 đến 10)');
      return;
    }

    setSaving(true);
    try {
      const studentGrades: Record<string, number> = {};
      students.forEach(s => {
        Object.entries(s.editedGrades).forEach(([cotDiemId, gradeValue]) => {
          if (gradeValue !== undefined && gradeValue !== '') {
            studentGrades[`${s.hocVienId}|${cotDiemId}`] = Number(gradeValue);
          }
        });
      });
      await lecturerApi.updateGrades(user.id, { lopHocPhanId: selectedClassId, studentGrades });
      setHasUnsavedChanges(false);
      loadGrades();
      toast.success('Lưu điểm thành công');
    } catch (err: any) {
      console.error(err);
      toast.error(err?.response?.data?.message || 'Lưu điểm thất bại');
    } finally {
      setSaving(false);
    }
  };

  const handleCreateColumn = async () => {
    if (!user?.id || !selectedClassId) return;
    if (!newColumn.tenCotDiem.trim() || !newColumn.tiTrong.trim()) {
      toast.error('Vui lòng nhập đầy đủ thông tin cột điểm');
      return;
    }
    setCreatingColumn(true);
    try {
      const payload: CreateCotDiemRequestDTO = {
        tenCotDiem: newColumn.tenCotDiem.trim(),
        tiTrong: newColumn.tiTrong.trim(),
        loai: newColumn.loai || null,
        thuTuHienThi: (columns.length || 0) + 1,
        lopHocPhanId: selectedClassId,
      };
      await lecturerApi.createCotDiem(user.id, payload);
      setShowColumnModal(false);
      setNewColumn({ tenCotDiem: '', tiTrong: '', loai: '' });
      loadGrades();
      toast.success('Thêm cột điểm thành công');
    } catch (err: any) {
      console.error(err);
      toast.error(err?.response?.data?.message || 'Thêm cột điểm thất bại');
    } finally {
      setCreatingColumn(false);
    }
  };

  const handleViewHistory = async (student: GradeStudentResponseDTO) => {
    if (!user?.id || !selectedClassId) return;
    setHistoryStudent(student);
    setLoadingHistory(true);
    try {
      const data = await lecturerApi.getGradeHistory(selectedClassId, student.hocVienId, user.id);
      setHistory(data);
    } catch (err) {
      console.error(err);
      toast.error('Không thể tải lịch sử điểm');
    } finally {
      setLoadingHistory(false);
    }
  };

  // Export functions
  const exportToExcel = () => {
    setShowExportMenu(false);
    const headers = ['STT', 'Mã SV', 'Họ và tên', ...columns.map(c => `${c.tenCotDiem} (${c.tiTrong}%)`), 'Điểm TB', 'Xếp loại'];
    const rows = filtered.map((s, i) => [
      i + 1, s.maHocVien, s.hoTen,
      ...columns.map(c => s.editedGrades[c.cotDiemId] || ''),
      s.diemTrungBinh !== null ? s.diemTrungBinh.toFixed(2) : '',
      s.diemTrungBinh !== null ? gradeRank(s.diemTrungBinh) : '',
    ]);
    const csv = [headers, ...rows].map(r => r.map(c => `"${c}"`).join(',')).join('\n');
    const blob = new Blob(['\ufeff' + csv], { type: 'text/csv;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `bang_diem_${selectedClassId}_${new Date().toISOString().slice(0, 10)}.csv`;
    a.click();
    URL.revokeObjectURL(url);
    toast.success('Đã xuất file CSV thành công');
  };

  const exportToPDF = () => {
    setShowExportMenu(false);
    const className = classes.find(c => c.lopHocPhanId === selectedClassId);
    const win = window.open('', '_blank');
    if (!win) return;
    const html = `
      <html><head><title>Bảng điểm</title>
      <style>
        body { font-family: DejaVu Sans, sans-serif; padding: 20px; }
        h2 { text-align: center; color: #1e40af; }
        table { width: 100%; border-collapse: collapse; margin-top: 20px; }
        th, td { border: 1px solid #ccc; padding: 8px; text-align: center; }
        th { background: #1e40af; color: white; }
        tr:nth-child(even) { background: #f8fafc; }
      </style></head><body>
      <h2>Bảng điểm lớp: ${className?.tenMonHoc || ''} (${className?.maLopHocPhan || ''})</h2>
      <p style="text-align:center;color:#666;">Ngày xuất: ${new Date().toLocaleDateString('vi-VN')}</p>
      <table>
        <thead><tr>
          <th>STT</th><th>Mã SV</th><th>Họ tên</th>
          ${columns.map(c => `<th>${c.tenCotDiem}<br><small>(${c.tiTrong}%)</small></th>`).join('')}
          <th>Điểm TB</th><th>Xếp loại</th>
        </tr></thead>
        <tbody>
          ${filtered.map((s, i) => `
            <tr>
              <td>${i + 1}</td><td>${s.maHocVien}</td><td style="text-align:left">${s.hoTen}</td>
              ${columns.map(c => `<td>${s.editedGrades[c.cotDiemId] || ''}</td>`).join('')}
              <td>${s.diemTrungBinh !== null ? s.diemTrungBinh.toFixed(2) : ''}</td>
              <td>${s.diemTrungBinh !== null ? gradeRank(s.diemTrungBinh) : ''}</td>
            </tr>`).join('')}
        </tbody>
      </table></body></html>`;
    win.document.write(html);
    win.document.close();
    win.print();
    toast.success('Đã mở bảng điểm để in');
  };

  // Stats
  const allGrades = students.map(s => s.diemTrungBinh).filter((n): n is number => n !== null);
  const classAvg = allGrades.length ? (allGrades.reduce((a, b) => a + b, 0) / allGrades.length) : null;
  const excellentCount = allGrades.filter(n => n >= 8.5).length;
  const goodCount = allGrades.filter(n => n >= 7.0 && n < 8.5).length;
  const failCount = allGrades.filter(n => n < 5.0).length;

  const sortedColumns = [...columns].sort((a, b) => (a.thuTuHienThi || 0) - (b.thuTuHienThi || 0));

  return (
    <div className="flex h-screen bg-gradient-to-br from-slate-100 via-blue-50 to-indigo-50">
      <InstructorSidebar />
      <div className="flex-1 ml-64 flex flex-col">
        <InstructorHeader title="Quản lý điểm số" />
        <div className="flex-1 overflow-auto p-6 lg:p-8">
          <div className="max-w-7xl mx-auto space-y-5">

            {/* Header */}
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-3xl font-bold text-gray-900 tracking-tight">Quản lý điểm số</h1>
                <p className="text-gray-500 mt-1">Nhập điểm thành phần, tổng kết và theo dõi lịch sử thay đổi</p>
              </div>
              <div className="flex items-center gap-3">
                {hasUnsavedChanges && (
                  <span className="inline-flex items-center gap-2 px-4 py-2.5 bg-orange-50 text-orange-700 rounded-xl text-sm font-semibold border border-orange-100">
                    <AlertCircle className="w-4 h-4" />Có thay đổi chưa lưu
                  </span>
                )}
                {/* Export button */}
                <div className="relative">
                  <button
                    onClick={() => setShowExportMenu(!showExportMenu)}
                    className="inline-flex items-center gap-2 px-5 py-2.5 bg-white border border-gray-200 text-gray-700 rounded-xl hover:bg-gray-50 font-semibold text-sm transition-colors shadow-sm"
                  >
                    <Download className="w-4 h-4" />
                    Xuất file
                  </button>
                  {showExportMenu && (
                    <div className="absolute right-0 top-12 w-52 bg-white rounded-xl shadow-xl border border-gray-100 z-50 overflow-hidden">
                      <button onClick={exportToExcel} className="w-full flex items-center gap-3 px-4 py-3 hover:bg-emerald-50 text-sm font-medium text-gray-700 transition-colors">
                        <FileSpreadsheet className="w-4 h-4 text-emerald-600" />
                        Xuất Excel (.csv)
                      </button>
                      <button onClick={exportToPDF} className="w-full flex items-center gap-3 px-4 py-3 hover:bg-red-50 text-sm font-medium text-gray-700 transition-colors border-t border-gray-100">
                        <FileText className="w-4 h-4 text-red-500" />
                        In / Xuất PDF
                      </button>
                    </div>
                  )}
                </div>
                <button
                  onClick={handleSave}
                  disabled={!hasUnsavedChanges || saving}
                  className={`inline-flex items-center gap-2 px-6 py-2.5 rounded-xl font-semibold text-sm transition-all ${hasUnsavedChanges && !saving
                      ? 'bg-gradient-to-r from-indigo-600 to-violet-600 text-white hover:from-indigo-700 hover:to-violet-700 shadow-md shadow-indigo-200'
                      : 'bg-gray-200 text-gray-400 cursor-not-allowed'
                    }`}
                >
                  <Save className="w-4 h-4" />
                  {saving ? 'Đang lưu...' : 'Lưu tất cả'}
                </button>
              </div>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              {[
                {
                  label: 'Điểm TB lớp',
                  value: classAvg !== null ? classAvg.toFixed(2) : '—',
                  icon: Calculator,
                  color: 'text-indigo-600', bg: 'bg-indigo-50',
                  suffix: classAvg !== null ? '/10' : '',
                },
                {
                  label: 'Xuất sắc (≥8.5)',
                  value: excellentCount,
                  icon: Award,
                  color: 'text-green-600', bg: 'bg-green-50',
                },
                {
                  label: 'Giỏi (≥7.0)',
                  value: goodCount,
                  icon: TrendingUp,
                  color: 'text-blue-600', bg: 'bg-blue-50',
                },
                {
                  label: 'Yếu (<5.0)',
                  value: failCount,
                  icon: Users,
                  color: 'text-red-600', bg: 'bg-red-50',
                },
              ].map(({ label, value, icon: Icon, color, bg }) => (
                <div key={label} className="bg-white rounded-2xl shadow-sm border border-gray-100 p-4 flex items-center gap-3">
                  <div className={`w-10 h-10 rounded-xl ${bg} flex items-center justify-center`}>
                    <Icon className={`w-5 h-5 ${color}`} />
                  </div>
                  <div>
                    <p className="text-xs text-gray-500 font-medium">{label}</p>
                    <p className={`text-xl font-bold ${color}`}>{value}</p>
                  </div>
                </div>
              ))}
            </div>

            {/* Filters */}
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1.5">Chọn lớp học phần</label>
                  <div className="relative">
                    <select
                      value={selectedClassId}
                      onChange={e => setSelectedClassId(e.target.value)}
                      className="w-full px-4 py-3 pr-10 border border-gray-200 rounded-xl appearance-none focus:outline-none focus:ring-2 focus:ring-indigo-400 bg-white text-sm font-medium"
                    >
                      {classes.map(c => (
                        <option key={c.lopHocPhanId} value={c.lopHocPhanId}>
                          {c.maLopHocPhan} – {c.tenMonHoc}
                        </option>
                      ))}
                    </select>
                    <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 pointer-events-none" />
                  </div>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1.5">Tìm kiếm sinh viên</label>
                  <div className="relative">
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                    <input
                      type="text"
                      placeholder="Tìm theo tên hoặc mã SV..."
                      value={searchTerm}
                      onChange={e => setSearchTerm(e.target.value)}
                      className="w-full pl-12 pr-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-400 text-sm"
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Grade Table */}
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
              <div className="p-5 border-b border-gray-100 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Settings2 className="w-4 h-4 text-indigo-500" />
                  <h3 className="font-bold text-gray-900">Bảng điểm</h3>
                  <span className="px-2 py-0.5 bg-indigo-50 text-indigo-700 text-xs font-bold rounded-full">
                    {filtered.length} sinh viên
                  </span>
                </div>
                <button
                  onClick={() => setShowColumnModal(true)}
                  className="inline-flex items-center gap-2 px-4 py-2 bg-indigo-50 text-indigo-700 rounded-xl hover:bg-indigo-100 font-semibold text-sm transition-colors"
                >
                  <Plus className="w-4 h-4" />
                  Thêm cột điểm
                </button>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="bg-gradient-to-r from-indigo-600 to-violet-600 text-white">
                      <th className="px-5 py-3 text-left text-xs font-bold uppercase tracking-wider w-12">#</th>
                      <th className="px-3 py-3 text-left text-xs font-bold uppercase tracking-wider">Mã SV</th>
                      <th className="px-3 py-3 text-left text-xs font-bold uppercase tracking-wider">Họ và tên</th>
                      {sortedColumns.map(c => (
                        <th key={c.cotDiemId} className="px-3 py-3 text-center text-xs font-bold uppercase tracking-wider min-w-[80px]">
                          <div>{c.tenCotDiem}</div>
                          <div className="text-indigo-200 font-normal text-[10px]">{c.tiTrong}%</div>
                        </th>
                      ))}
                      <th className="px-3 py-3 text-center text-xs font-bold uppercase tracking-wider">Điểm TB</th>
                      <th className="px-3 py-3 text-center text-xs font-bold uppercase tracking-wider">Xếp loại</th>
                      <th className="px-3 py-3 text-center text-xs font-bold uppercase tracking-wider w-16">Lịch sử</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-50">
                    {loadingStudents ? (
                      <tr>
                        <td colSpan={sortedColumns.length + 6} className="px-6 py-16 text-center">
                          <div className="w-10 h-10 border-4 border-indigo-200 border-t-indigo-600 rounded-full animate-spin mx-auto mb-3"></div>
                          <p className="text-gray-500 font-medium">Đang tải dữ liệu điểm...</p>
                        </td>
                      </tr>
                    ) : filtered.length === 0 ? (
                      <tr>
                        <td colSpan={sortedColumns.length + 6} className="px-6 py-16 text-center">
                          <div className="w-16 h-16 bg-gray-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
                            <Users className="w-8 h-8 text-gray-400" />
                          </div>
                          <h3 className="text-lg font-bold text-gray-700 mb-1">Không có sinh viên</h3>
                          <p className="text-gray-400 text-sm">Danh sách trống</p>
                        </td>
                      </tr>
                    ) : filtered.map((s, i) => {
                      const gc = gradeColor(s.diemTrungBinh);
                      return (
                        <tr key={s.hocVienId} className="hover:bg-gray-50/60 transition-colors">
                          <td className="px-5 py-4 text-sm text-gray-400 font-medium">{i + 1}</td>
                          <td className="px-3 py-4 text-sm font-semibold text-gray-700">{s.maHocVien}</td>
                          <td className="px-3 py-4 text-sm font-bold text-gray-900">{s.hoTen}</td>
                          {sortedColumns.map(c => (
                            <td key={c.cotDiemId} className="px-3 py-4 text-center">
                              <input
                                type="text"
                                value={s.editedGrades[c.cotDiemId] || ''}
                                onChange={e => handleGradeChange(s.hocVienId, c.cotDiemId, e.target.value)}
                                className={`w-16 px-2 py-2 border rounded-lg text-center text-sm focus:outline-none focus:ring-2 transition-all ${!validateGrade(s.editedGrades[c.cotDiemId] || '')
                                    ? 'border-red-400 bg-red-50 text-red-700 focus:ring-red-400'
                                    : 'border-gray-200 focus:ring-indigo-400 hover:border-indigo-300'
                                  }`}
                                placeholder="0-10"
                              />
                            </td>
                          ))}
                          <td className="px-3 py-4 text-center">
                            {s.diemTrungBinh !== null ? (
                              <span className={`inline-flex items-center justify-center min-w-[52px] px-3 py-1.5 rounded-xl font-bold text-sm ${gc.bg} ${gc.text}`}>
                                {s.diemTrungBinh.toFixed(2)}
                              </span>
                            ) : (
                              <span className="text-gray-400 text-sm italic">—</span>
                            )}
                          </td>
                          <td className="px-3 py-4 text-center">
                            {s.diemTrungBinh !== null ? (
                              <span className={`inline-flex px-2.5 py-1 rounded-full text-xs font-semibold ${gc.bg} ${gc.text}`}>
                                {gradeRank(s.diemTrungBinh)}
                              </span>
                            ) : (
                              <span className="text-gray-400 text-sm">—</span>
                            )}
                          </td>
                          <td className="px-3 py-4 text-center">
                            <button
                              onClick={() => handleViewHistory(s)}
                              className="w-9 h-9 flex items-center justify-center bg-gray-50 hover:bg-indigo-50 rounded-xl transition-colors"
                              title="Xem lịch sử"
                            >
                              <History className="w-4 h-4 text-indigo-500" />
                            </button>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Add Column Modal */}
      {showColumnModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full mx-4 overflow-hidden">
            <div className="px-6 py-5 bg-gradient-to-r from-indigo-50 to-violet-50 border-b border-gray-100 flex items-center gap-3">
              <div className="w-12 h-12 bg-indigo-100 rounded-xl flex items-center justify-center shrink-0">
                <Plus className="w-5 h-5 text-indigo-600" />
              </div>
              <div>
                <h3 className="font-bold text-gray-900">Thêm cột điểm mới</h3>
                <p className="text-sm text-gray-500">Tạo cột điểm thành phần cho lớp</p>
              </div>
            </div>
            <div className="p-6 space-y-4">
              <div>
                <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1.5">Tên cột điểm <span className="text-red-500">*</span></label>
                <input
                  type="text"
                  value={newColumn.tenCotDiem}
                  onChange={e => setNewColumn(p => ({ ...p, tenCotDiem: e.target.value }))}
                  placeholder="VD: Giữa kỳ, Cuối kỳ, Điểm cộng..."
                  className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-400 text-sm font-medium"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1.5">Tỷ trọng (%) <span className="text-red-500">*</span></label>
                <input
                  type="text"
                  value={newColumn.tiTrong}
                  onChange={e => setNewColumn(p => ({ ...p, tiTrong: e.target.value }))}
                  placeholder="VD: 30, 40, 50..."
                  className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-400 text-sm font-medium"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1.5">Loại</label>
                <select
                  value={newColumn.loai}
                  onChange={e => setNewColumn(p => ({ ...p, loai: e.target.value }))}
                  className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-400 text-sm font-medium bg-white"
                >
                  <option value="">— Chọn loại —</option>
                  <option value="EXAM">Thi</option>
                  <option value="ASSIGNMENT">Bài tập</option>
                  <option value="QUIZ">Bài kiểm tra</option>
                  <option value="SYSTEM">Hệ thống</option>
                </select>
              </div>
            </div>
            <div className="px-6 pb-6 flex gap-3 justify-end">
              <button onClick={() => { setShowColumnModal(false); setNewColumn({ tenCotDiem: '', tiTrong: '', loai: '' }); }}
                className="px-5 py-2.5 border border-gray-200 text-gray-600 rounded-xl hover:bg-gray-50 font-semibold text-sm transition-colors flex items-center gap-2">
                <X className="w-4 h-4" />Hủy
              </button>
              <button onClick={handleCreateColumn} disabled={creatingColumn}
                className="px-5 py-2.5 bg-indigo-600 text-white rounded-xl hover:bg-indigo-700 font-semibold text-sm shadow-sm transition-colors disabled:opacity-50 flex items-center gap-2">
                <Plus className="w-4 h-4" />
                {creatingColumn ? 'Đang thêm...' : 'Thêm cột điểm'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Grade History Modal */}
      {historyStudent && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-2xl shadow-2xl max-w-lg w-full mx-4 overflow-hidden">
            <div className="px-6 py-5 bg-gradient-to-r from-indigo-50 to-violet-50 border-b border-gray-100 flex items-center gap-3">
              <div className="w-12 h-12 bg-indigo-100 rounded-xl flex items-center justify-center shrink-0">
                <History className="w-5 h-5 text-indigo-600" />
              </div>
              <div>
                <h3 className="font-bold text-gray-900">Lịch sử thay đổi điểm</h3>
                <p className="text-sm text-gray-500">{historyStudent.hoTen} – {historyStudent.maHocVien}</p>
              </div>
            </div>
            <div className="p-6">
              {loadingHistory ? (
                <div className="flex justify-center py-8">
                  <div className="w-8 h-8 border-3 border-indigo-200 border-t-indigo-600 rounded-full animate-spin"></div>
                </div>
              ) : history.length === 0 ? (
                <div className="text-center py-8">
                  <Clock className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                  <p className="text-gray-500 font-medium">Chưa có lịch sử thay đổi điểm</p>
                </div>
              ) : (
                <div className="space-y-3 max-h-80 overflow-y-auto">
                  {history.map((h, idx) => {
                    const diff = h.diemMoi - h.diemCu;
                    return (
                      <div key={h.historyId} className="flex items-start gap-3 p-3 bg-gray-50 rounded-xl">
                        <div className="w-8 h-8 bg-indigo-100 rounded-lg flex items-center justify-center shrink-0 mt-0.5">
                          <Edit2 className="w-4 h-4 text-indigo-600" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-1">
                            <span className="text-sm font-bold text-gray-900">{h.nguoiThayDoi}</span>
                            <span className="text-xs text-gray-400">·</span>
                            <span className="text-xs text-gray-500">{formatDateTime(h.thoiGianThayDoi)}</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <span className="text-sm text-gray-600">{h.diemCu.toFixed(1)}</span>
                            <span className="text-gray-400">→</span>
                            <span className={`text-sm font-bold ${diff >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                              {h.diemMoi.toFixed(1)}
                            </span>
                            <span className={`text-xs font-semibold px-1.5 py-0.5 rounded ${diff >= 0 ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-700'}`}>
                              {diff >= 0 ? `+${diff.toFixed(1)}` : diff.toFixed(1)}
                            </span>
                          </div>
                          {h.ghiChu && <p className="text-xs text-gray-500 mt-1 italic">"{h.ghiChu}"</p>}
                        </div>
                        {idx === 0 && (
                          <span className="shrink-0 text-xs font-bold px-2 py-1 bg-indigo-100 text-indigo-700 rounded-lg">Mới nhất</span>
                        )}
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
            <div className="px-6 pb-6">
              <button onClick={() => setHistoryStudent(null)}
                className="w-full px-5 py-2.5 border border-gray-200 text-gray-600 rounded-xl hover:bg-gray-50 font-semibold text-sm transition-colors flex items-center justify-center gap-2">
                <X className="w-4 h-4" />Đóng
              </button>
            </div>
          </div>
        </div>
      )}

      <button className="fixed bottom-8 right-8 w-16 h-16 hover:scale-110 transition-transform duration-200 z-40" aria-label="AI Assistant">
        <AiAssistantButton />
      </button>
    </div>
  );
}
