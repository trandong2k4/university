import { AdminSidebar } from '@/components/layouts/AdminSidebar';
import { AdminHeader } from '@/components/layouts/AdminHeader';
import { useState, useEffect, FormEvent, useRef } from 'react';
import {
  Plus, Edit, Trash2, X, BookOpen, GraduationCap, BookMarked,
  AlertCircle, Search, RefreshCw, CheckCircle, FileSpreadsheet, Upload,
  Link2, Link2Off
} from 'lucide-react';
import AiAssistantButton from '@/imports/AiAssistantButton-4-13343';
import apiClient from '@/api/common';
import * as khoaApi from '@/api/admin/khoa.api';
import * as nganhApi from '@/api/admin/nganh.api';
import * as monHocApi from '@/api/admin/monhoc.api';
import type { TienQuyetResponse } from '@/api/admin/monhoc.api';
import type { DepartmentItem, MajorItem, SubjectItem } from '@/types';

type TabType = 'departments' | 'majors' | 'subjects';
type ItemType = DepartmentItem | MajorItem | SubjectItem;

interface Toast { id: string; message: string; type: 'success' | 'error' | 'info'; }

const extractError = (err: unknown, fallback: string): string => {
    if (err && typeof err === 'object') {
        const e = err as { response?: { data?: { detail?: string; message?: string } } };
        return e.response?.data?.detail || e.response?.data?.message || fallback;
    }
    return fallback;
};

export default function AdminDepartmentsPage() {
  const scrollRef = useRef<HTMLDivElement>(null);
  const [activeTab, setActiveTab] = useState<TabType>('departments');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedKhoaFilter, setSelectedKhoaFilter] = useState<string>('');
  const [toasts, setToasts] = useState<Toast[]>([]);
  const [loading, setLoading] = useState(false);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [selectedItem, setSelectedItem] = useState<ItemType | null>(null);
  const [departments, setDepartments] = useState<DepartmentItem[]>([]);
  const [majors, setMajors] = useState<MajorItem[]>([]);
  const [subjects, setSubjects] = useState<SubjectItem[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [subjectForm, setSubjectForm] = useState({ maMonHoc: '', tenMonHoc: '', soTinChi: 3, moTa: '' });
  const [khoaForm, setKhoaForm] = useState({ maKhoa: '', tenKhoa: '', diaChi: '', moTa: '' });
  const [nganhForm, setNganhForm] = useState({ maNganh: '', tenNganh: '', moTa: '', danhGia: '', maKhoa: '' });

  // Import modal state
  const importRef = useRef<HTMLInputElement>(null);
  const [isImportOpen, setIsImportOpen] = useState(false);
  const [importFile, setImportFile] = useState<File | null>(null);
  const [importResult, setImportResult] = useState<{
    totalRows: number; successCount: number; errorCount: number; errors: string[];
  } | null>(null);
  const [isImporting, setIsImporting] = useState(false);

  // Prerequisite modal state
  const [isTienQuyetOpen, setIsTienQuyetOpen] = useState(false);
  const [tienQuyetSubject, setTienQuyetSubject] = useState<SubjectItem | null>(null);
  const [tienQuyetList, setTienQuyetList] = useState<TienQuyetResponse[]>([]);
  const [tienQuyetLoading, setTienQuyetLoading] = useState(false);
  const [tienQuyetSearch, setTienQuyetSearch] = useState('');
  const [addTienQuyetId, setAddTienQuyetId] = useState('');

  const addToast = (message: string, type: 'success' | 'error' | 'info' = 'info') => {
      const id = Date.now().toString();
      setToasts(p => [...p, { id, message, type }]);
      setTimeout(() => setToasts(p => p.filter(t => t.id !== id)), 4000);
  };

  const fetchAll = async () => {
    try {
      setLoading(true);
      const [khoaResp, nganhResp, monHocResp] = await Promise.all([
        apiClient.get('/admin/khoa'),
        apiClient.get('/admin/nganh'),
        apiClient.get('/admin/mon-hoc/all'),
      ]);

      const depts: DepartmentItem[] = (khoaResp.data || []).map((k: any) => ({
        id: String(k.id),
        code: k.maKhoa || k.code || '',
        name: k.tenKhoa || k.name || '',
        diaChi: k.diaChi || undefined,
        moTa: k.moTa || undefined,
      }));

      const mjs: MajorItem[] = (nganhResp.data || []).map((n: any) => ({
        id: String(n.id),
        code: n.maNganh || n.code || '',
        name: n.tenNganh || n.name || '',
        departmentId: n.khoaId || n.departmentId || '',
        departmentName: n.tenKhoa || n.tenTruong || '',
      }));

      const subs: SubjectItem[] = (monHocResp.data || []).map((s: any) => ({
        id: String(s.id),
        code: s.maMonHoc || s.code || '',
        name: s.tenMonHoc || s.name || '',
        credits: s.soTinChi ?? s.credits ?? 0,
        majorId: s.nganhId || s.majorId || '',
        majorName: s.tenNganh || s.majorName || '',
      }));

      setDepartments(depts);
      setMajors(mjs);
      setSubjects(subs);
    } catch (err) {
      console.error('Failed to load admin lists', err);
      addToast('Lỗi khi tải dữ liệu', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchAll(); }, []);

  const getCurrentData = () => {
    const q = searchQuery.toLowerCase();
    switch (activeTab) {
      case 'departments':
        return departments.filter(d =>
          !q
          || d.name.toLowerCase().includes(q)
          || d.code.toLowerCase().includes(q)
          || (d.diaChi || '').toLowerCase().includes(q)
          || (d.moTa || '').toLowerCase().includes(q)
        );
      case 'majors':
        return majors.filter(m => {
          const matchSearch = !q || m.name.toLowerCase().includes(q) || m.code.toLowerCase().includes(q);
          const matchKhoa = !selectedKhoaFilter || m.departmentId === selectedKhoaFilter || m.departmentName?.toLowerCase().includes(selectedKhoaFilter.toLowerCase());
          return matchSearch && matchKhoa;
        });
      case 'subjects':
        return subjects.filter(s =>
          !q || s.name.toLowerCase().includes(q) || s.code.toLowerCase().includes(q)
        );
      default:
        return [];
    }
  };

  const openAddModal = () => {
    if (activeTab === 'departments') {
      setKhoaForm({ maKhoa: '', tenKhoa: '', diaChi: '', moTa: '' });
    } else if (activeTab === 'majors') {
      setNganhForm({ maNganh: '', tenNganh: '', moTa: '', danhGia: '', maKhoa: departments[0]?.code || '' });
    } else if (activeTab === 'subjects') {
      setSubjectForm({ maMonHoc: '', tenMonHoc: '', soTinChi: 3, moTa: '' });
    }
    setIsAddModalOpen(true);
  };

  const handleEdit = (item: ItemType) => {
    setSelectedItem(item);
    if (activeTab === 'departments') {
      const dept = item as DepartmentItem;
      setKhoaForm({ maKhoa: dept.code, tenKhoa: dept.name, diaChi: dept.diaChi || '', moTa: dept.moTa || '' });
    } else if (activeTab === 'majors') {
      const mj = item as MajorItem;
      const dept = departments.find(d => d.id === mj.departmentId);
      setNganhForm({ maNganh: mj.code, tenNganh: mj.name, moTa: '', danhGia: '', maKhoa: dept?.code || '' });
    } else if (activeTab === 'subjects') {
      const s = item as SubjectItem;
      setSubjectForm({ maMonHoc: s.code, tenMonHoc: s.name, soTinChi: s.credits || 0, moTa: '' });
    }
    setIsEditModalOpen(true);
  };

  const handleDelete = (item: ItemType) => {
    setSelectedItem(item);
    setIsDeleteModalOpen(true);
  };

  const handleCreateKhoa = async (e: FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      await khoaApi.createKhoa({
        maKhoa: khoaForm.maKhoa.trim(),
        tenKhoa: khoaForm.tenKhoa.trim(),
        diaChi: khoaForm.diaChi.trim(),
        moTa: khoaForm.moTa.trim(),
      });
      addToast('Thêm khoa thành công', 'success');
      setIsAddModalOpen(false);
      await fetchAll();
    } catch (err: any) {
      addToast(extractError(err, 'Thêm khoa thất bại'), 'error');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleUpdateKhoa = async (e: FormEvent) => {
    e.preventDefault();
    if (!selectedItem) return;
    setIsSubmitting(true);
    try {
      await khoaApi.updateKhoa((selectedItem as DepartmentItem).id, {
        maKhoa: khoaForm.maKhoa.trim(),
        tenKhoa: khoaForm.tenKhoa.trim(),
        diaChi: khoaForm.diaChi.trim(),
        moTa: khoaForm.moTa.trim(),
      });
      addToast('Cập nhật khoa thành công', 'success');
      setIsEditModalOpen(false);
      setSelectedItem(null);
      await fetchAll();
    } catch (err: any) {
      addToast(extractError(err, 'Cập nhật khoa thất bại'), 'error');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCreateNganh = async (e: FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      await nganhApi.createNganh(nganhForm);
      addToast('Thêm ngành thành công', 'success');
      setIsAddModalOpen(false);
      await fetchAll();
    } catch (err: any) {
      addToast(extractError(err, 'Thêm ngành thất bại'), 'error');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCreateMonHoc = async (e: FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      await monHocApi.createMonHoc({ maMonHoc: subjectForm.maMonHoc, tenMonHoc: subjectForm.tenMonHoc, soTinChi: subjectForm.soTinChi, moTa: subjectForm.moTa });
      addToast('Thêm môn học thành công', 'success');
      setIsAddModalOpen(false);
      await fetchAll();
    } catch (err: any) {
      addToast(extractError(err, 'Thêm môn học thất bại'), 'error');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleUpdateNganh = async (e: FormEvent) => {
    e.preventDefault();
    if (!selectedItem) return;
    setIsSubmitting(true);
    try {
      await nganhApi.updateNganh((selectedItem as MajorItem).id, nganhForm);
      addToast('Cập nhật ngành thành công', 'success');
      setIsEditModalOpen(false);
      setSelectedItem(null);
      await fetchAll();
    } catch (err: any) {
      addToast(extractError(err, 'Cập nhật ngành thất bại'), 'error');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleUpdateMonHoc = async (e: FormEvent) => {
    e.preventDefault();
    if (!selectedItem) return;
    setIsSubmitting(true);
    try {
      await monHocApi.updateMonHoc((selectedItem as SubjectItem).id, { maMonHoc: subjectForm.maMonHoc, tenMonHoc: subjectForm.tenMonHoc, soTinChi: subjectForm.soTinChi, moTa: subjectForm.moTa });
      addToast('Cập nhật môn học thành công', 'success');
      setIsEditModalOpen(false);
      setSelectedItem(null);
      await fetchAll();
    } catch (err: any) {
      addToast(extractError(err, 'Cập nhật môn học thất bại'), 'error');
    } finally {
      setIsSubmitting(false);
    }
  };

  const confirmDelete = async () => {
    if (!selectedItem) return;
    setIsDeleting(true);
    try {
      if (activeTab === 'departments') {
        await khoaApi.deleteKhoa((selectedItem as DepartmentItem).id);
        addToast('Xóa khoa thành công', 'success');
      } else if (activeTab === 'majors') {
        await nganhApi.deleteNganh((selectedItem as MajorItem).id);
        addToast('Xóa ngành thành công', 'success');
      } else {
        await monHocApi.deleteMonHoc((selectedItem as SubjectItem).id);
        addToast('Xóa môn học thành công', 'success');
      }
      await fetchAll();
    } catch (err: any) {
      addToast(extractError(err, 'Xóa thất bại'), 'error');
    } finally {
      setIsDeleteModalOpen(false);
      setSelectedItem(null);
      setIsDeleting(false);
    }
  };

  // Import handlers
  const handleImport = async () => {
    if (!importFile) return;
    setIsImporting(true);
    try {
      let result;
      if (activeTab === 'departments') {
        result = await khoaApi.importKhoaExcel(importFile);
      } else if (activeTab === 'majors') {
        result = await nganhApi.importNganhExcel(importFile);
      } else {
        result = await monHocApi.importMonHocExcel(importFile);
      }
      setImportResult(result);
      if (result.successCount > 0) {
        addToast(`Import ${result.successCount}/${result.totalRows} thành công`, 'success');
        await fetchAll();
      }
      if (result.errorCount > 0) {
        addToast(`${result.errorCount} dòng lỗi`, 'error');
      }
    } catch (err: any) {
      addToast(extractError(err, 'Lỗi khi import Excel'), 'error');
    } finally {
      setIsImporting(false);
    }
  };

  const openTienQuyet = async (item: SubjectItem) => {
    setTienQuyetSubject(item);
    setTienQuyetSearch('');
    setAddTienQuyetId('');
    setIsTienQuyetOpen(true);
    setTienQuyetLoading(true);
    try {
      const data = await monHocApi.getTienQuyetByMonHoc(item.id);
      setTienQuyetList(data);
    } catch (err) {
      addToast(extractError(err, 'Lỗi khi tải danh sách tiên quyết'), 'error');
    } finally {
      setTienQuyetLoading(false);
    }
  };

  const handleAddTienQuyet = async () => {
    if (!tienQuyetSubject || !addTienQuyetId) return;
    try {
      await monHocApi.createTienQuyet(tienQuyetSubject.id, addTienQuyetId);
      addToast('Thêm môn tiên quyết thành công', 'success');
      setAddTienQuyetId('');
      const data = await monHocApi.getTienQuyetByMonHoc(tienQuyetSubject.id);
      setTienQuyetList(data);
    } catch (err) {
      addToast(extractError(err, 'Lỗi khi thêm môn tiên quyết'), 'error');
    }
  };

  const handleDeleteTienQuyet = async (id: string) => {
    try {
      await monHocApi.deleteTienQuyet(id);
      addToast('Đã xóa môn tiên quyết', 'success');
      setTienQuyetList(prev => prev.filter(t => t.id !== id));
    } catch (err) {
      addToast(extractError(err, 'Lỗi khi xóa môn tiên quyết'), 'error');
    }
  };

  const getTabIcon = (tab: TabType) => {
    switch (tab) {
      case 'departments': return <BookOpen className="w-5 h-5" />;
      case 'majors': return <GraduationCap className="w-5 h-5" />;
      case 'subjects': return <BookMarked className="w-5 h-5" />;
    }
  };

  const currentData = getCurrentData();
  const tableColumnCount = activeTab === 'departments' ? 5 : 4;
  const inp = 'w-full px-3 py-2.5 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all';
  const lbl = 'block text-sm font-medium text-slate-700 mb-1.5';

  const TABS = [
    { key: 'departments' as TabType, label: 'Khoa', count: departments.length },
    { key: 'majors' as TabType, label: 'Ngành', count: majors.length },
    { key: 'subjects' as TabType, label: 'Môn học', count: subjects.length },
  ];

  return (
    <div className="flex h-screen bg-slate-50">
      <AdminSidebar activeMenu="departments" />
      <div className="flex-1 ml-64 flex flex-col overflow-hidden">
        <AdminHeader title="Quản lý Danh mục" />
        <div className="flex-1 overflow-auto">
          <div className="p-6 max-w-7xl mx-auto space-y-4">

            {/* Stats bar */}
            <div className="grid grid-cols-3 gap-4">
              <div className="bg-white border border-slate-200 rounded-xl px-5 py-3 flex items-center gap-3 shadow-sm">
                <div className="rounded-lg bg-blue-100 p-2"><BookOpen className="w-5 h-5 text-blue-600" /></div>
                <div>
                  <p className="text-xl font-bold text-slate-900">{departments.length}</p>
                  <p className="text-xs text-slate-500">Khoa</p>
                </div>
              </div>
              <div className="bg-white border border-slate-200 rounded-xl px-5 py-3 flex items-center gap-3 shadow-sm">
                <div className="rounded-lg bg-purple-100 p-2"><GraduationCap className="w-5 h-5 text-purple-600" /></div>
                <div>
                  <p className="text-xl font-bold text-purple-700">{majors.length}</p>
                  <p className="text-xs text-slate-500">Ngành</p>
                </div>
              </div>
              <div className="bg-white border border-slate-200 rounded-xl px-5 py-3 flex items-center gap-3 shadow-sm">
                <div className="rounded-lg bg-green-100 p-2"><BookMarked className="w-5 h-5 text-green-600" /></div>
                <div>
                  <p className="text-xl font-bold text-green-700">{subjects.length}</p>
                  <p className="text-xs text-slate-500">Môn học</p>
                </div>
              </div>
            </div>

            {/* Tabs */}
            <div className="bg-white rounded-xl border border-slate-200 shadow-sm px-4 py-2 flex items-center gap-1 overflow-x-auto">
              {TABS.map(tab => {
                const active = activeTab === tab.key;
                return (
                  <button
                    key={tab.key}
                    onClick={() => { setActiveTab(tab.key); setSearchQuery(''); setSelectedKhoaFilter(''); }}
                    className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium whitespace-nowrap transition-all ${
                      active ? 'bg-blue-600 text-white shadow-sm' : 'text-slate-600 hover:bg-slate-100'
                    }`}
                  >
                    {getTabIcon(tab.key)}
                    {tab.label}
                    <span className={`text-xs px-1.5 py-0.5 rounded-full font-semibold ${
                      active ? 'bg-white/25 text-white' : 'bg-slate-100 text-slate-500'
                    }`}>
                      {tab.count}
                    </span>
                  </button>
                );
              })}
            </div>

            {/* Toolbar with sticky search */}
            <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-3 flex flex-col sm:flex-row gap-3 items-start sm:items-center justify-between sticky top-0 z-20">
              <div className="flex flex-wrap items-center gap-2 flex-1">
                <div className="relative min-w-[180px] max-w-sm">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                  <input
                    type="text"
                    placeholder="Tìm theo mã hoặc tên..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full pl-9 pr-4 py-2 text-sm border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                {activeTab === 'majors' && departments.length > 0 && (
                  <select
                    value={selectedKhoaFilter}
                    onChange={(e) => setSelectedKhoaFilter(e.target.value)}
                    className="py-2 px-3 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="">Tất cả khoa</option>
                    {departments.map((d) => (
                      <option key={d.id} value={d.id}>{d.name} ({d.code})</option>
                    ))}
                  </select>
                )}
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={fetchAll}
                  title="Làm mới"
                  className="p-2 border border-slate-300 rounded-lg text-slate-600 hover:bg-slate-50 transition-colors"
                >
                  <RefreshCw className="w-4 h-4" />
                </button>
                <button
                  onClick={() => { setImportFile(null); setImportResult(null); setIsImportOpen(true); }}
                  className="flex items-center gap-1.5 px-3 py-2 border border-slate-300 text-slate-700 rounded-lg hover:bg-slate-50 text-sm font-medium"
                >
                  <FileSpreadsheet className="w-4 h-4" /> Import
                </button>
                <button
                  onClick={openAddModal}
                  className="flex items-center gap-1.5 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 text-sm font-medium shadow-sm"
                >
                  <Plus className="w-4 h-4" /> Thêm mới
                </button>
              </div>
            </div>

            {/* Table */}
            <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
              {loading ? (
                <div className="flex flex-col items-center justify-center h-72 gap-3">
                  <div className="w-9 h-9 border-4 border-slate-200 border-t-blue-600 rounded-full animate-spin" />
                  <p className="text-sm text-slate-500">Đang tải...</p>
                </div>
              ) : (
                <div ref={scrollRef} className="overflow-auto" style={{ maxHeight: 'calc(100vh - 380px)' }}>
                  <table className="w-full text-sm">
                    <thead className="sticky top-0 z-10 bg-gradient-to-r from-blue-600 to-blue-700 text-white">
                      <tr>
                        <th className="px-4 py-3 text-left font-semibold">Mã</th>
                        <th className="px-4 py-3 text-left font-semibold">Tên</th>
                        {activeTab === 'departments' && (
                          <>
                            <th className="px-4 py-3 text-left font-semibold">Địa chỉ</th>
                            <th className="px-4 py-3 text-left font-semibold">Mô tả</th>
                          </>
                        )}
                        {activeTab === 'majors' && (
                          <th className="px-4 py-3 text-left font-semibold">Thuộc khoa</th>
                        )}
                        {activeTab === 'subjects' && (
                          <>
                            <th className="px-4 py-3 text-left font-semibold">Số tín chỉ</th>
                          </>
                        )}
                        <th className="px-4 py-3 text-center font-semibold">Thao tác</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {currentData.map((item: any) => (
                        <tr key={item.id} className="transition-colors hover:bg-blue-50/60">
                          <td className="px-4 py-3 font-semibold text-slate-900">{item.code}</td>
                          <td className="px-4 py-3 text-slate-700">{item.name}</td>
                          {activeTab === 'departments' && (
                            <>
                              <td className="px-4 py-3 text-slate-500 max-w-[220px] truncate" title={(item as DepartmentItem).diaChi || ''}>
                                {(item as DepartmentItem).diaChi || '-'}
                              </td>
                              <td className="px-4 py-3 text-slate-500 max-w-[260px] truncate" title={(item as DepartmentItem).moTa || ''}>
                                {(item as DepartmentItem).moTa || '-'}
                              </td>
                            </>
                          )}
                          {activeTab === 'majors' && (
                            <td className="px-4 py-3 text-slate-500">{(item as MajorItem).departmentName || '-'}</td>
                          )}
                          {activeTab === 'subjects' && (
                            <td className="px-4 py-3">
                              <span className="inline-flex items-center px-2.5 py-0.5 rounded-full bg-blue-100 text-blue-800 text-xs font-medium">
                                {(item as SubjectItem).credits} tín chỉ
                              </span>
                            </td>
                          )}
                          <td className="px-4 py-3">
                            <div className="flex items-center justify-center gap-1">
                              {activeTab === 'subjects' && (
                                <button
                                  onClick={() => openTienQuyet(item as SubjectItem)}
                                  className="p-1.5 text-emerald-600 hover:bg-emerald-100 rounded-lg transition-colors"
                                  title="Quản lý môn tiên quyết"
                                >
                                  <Link2 className="w-4 h-4" />
                                </button>
                              )}
                              <button
                                onClick={() => handleEdit(item)}
                                className="p-1.5 text-blue-600 hover:bg-blue-100 rounded-lg transition-colors"
                                title="Chỉnh sửa"
                              >
                                <Edit className="w-4 h-4" />
                              </button>
                              <button
                                onClick={() => handleDelete(item)}
                                className="p-1.5 text-red-500 hover:bg-red-100 rounded-lg transition-colors"
                                title="Xóa"
                              >
                                <Trash2 className="w-4 h-4" />
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}
                      {currentData.length === 0 && (
                        <tr>
                          <td colSpan={tableColumnCount} className="py-16 text-center">
                            <div className="flex flex-col items-center gap-2">
                              <div className="rounded-full bg-slate-100 p-4">
                                {getTabIcon(activeTab)}
                              </div>
                              <p className="font-medium text-slate-600">
                                {searchQuery ? 'Không tìm thấy kết quả' : 'Chưa có dữ liệu'}
                              </p>
                              <p className="text-sm text-slate-400">
                                {searchQuery ? 'Thử từ khóa khác' : 'Nhấn "Thêm mới" để bắt đầu'}
                              </p>
                            </div>
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              )}
            </div>

            {/* Footer */}
            {!loading && (departments.length > 0 || majors.length > 0 || subjects.length > 0) && (
              <div className="flex items-center justify-between text-xs text-slate-500 px-1">
                <span>
                  Hiển thị <b className="text-slate-700">{currentData.length}</b> / <b className="text-slate-700">
                    {activeTab === 'departments' ? departments.length : activeTab === 'majors' ? majors.length : subjects.length}
                  </b> {activeTab === 'departments' ? 'khoa' : activeTab === 'majors' ? 'ngành' : 'môn học'}
                </span>
                {searchQuery && (
                  <span>Tìm thấy {currentData.length} kết quả cho "{searchQuery}"</span>
                )}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Add Modal - Departments */}
      {isAddModalOpen && activeTab === 'departments' && (
        <div className="fixed inset-0 bg-black/30 flex items-center justify-center z-50 p-4" onClick={() => setIsAddModalOpen(false)}>
          <div className="bg-white rounded-2xl shadow-2xl max-w-lg w-full max-h-[90vh] overflow-y-auto" onClick={e => e.stopPropagation()}>
            <div className="sticky top-0 bg-gradient-to-r from-blue-600 to-blue-700 text-white px-6 py-4 flex items-center justify-between rounded-t-2xl z-10">
              <h2 className="text-base font-bold flex items-center gap-2"><BookOpen className="w-5 h-5" /> Thêm Khoa Mới</h2>
              <button onClick={() => setIsAddModalOpen(false)} className="p-1 hover:bg-white/20 rounded-lg"><X className="w-5 h-5" /></button>
            </div>
            <form className="p-6 space-y-5" onSubmit={handleCreateKhoa}>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className={lbl}>Mã khoa <span className="text-red-500">*</span></label>
                  <input required value={khoaForm.maKhoa} onChange={(e) => setKhoaForm({ ...khoaForm, maKhoa: e.target.value })} placeholder="VD: CNTT" className={inp} />
                </div>
                <div>
                  <label className={lbl}>Tên khoa <span className="text-red-500">*</span></label>
                  <input required value={khoaForm.tenKhoa} onChange={(e) => setKhoaForm({ ...khoaForm, tenKhoa: e.target.value })} placeholder="VD: Công nghệ Thông tin" className={inp} />
                </div>
              </div>
              <div>
                <label className={lbl}>Địa chỉ <span className="text-red-500">*</span></label>
                <input required value={khoaForm.diaChi} onChange={(e) => setKhoaForm({ ...khoaForm, diaChi: e.target.value })} placeholder="VD: 48 Cao Thắng, Đà Nẵng" className={inp} />
              </div>
              <div>
                <label className={lbl}>Mô tả</label>
                <textarea value={khoaForm.moTa} onChange={(e) => setKhoaForm({ ...khoaForm, moTa: e.target.value })} placeholder="Nhập mô tả khoa" className={inp + ' resize-none'} rows={3} />
              </div>
              <div className="flex gap-3 pt-4 border-t border-slate-100">
                <button type="button" onClick={() => setIsAddModalOpen(false)} className="flex-1 py-2.5 border border-slate-300 rounded-xl text-sm font-medium text-slate-700 hover:bg-slate-50">Hủy</button>
                <button type="submit" disabled={isSubmitting} className="flex-1 py-2.5 bg-blue-600 text-white rounded-xl text-sm font-medium hover:bg-blue-700 disabled:opacity-50">
                  {isSubmitting ? 'Đang thêm...' : 'Thêm Khoa'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Add Modal - Majors */}
      {isAddModalOpen && activeTab === 'majors' && (
        <div className="fixed inset-0 bg-black/30 flex items-center justify-center z-50 p-4" onClick={() => setIsAddModalOpen(false)}>
          <div className="bg-white rounded-2xl shadow-2xl max-w-lg w-full max-h-[90vh] overflow-y-auto" onClick={e => e.stopPropagation()}>
            <div className="sticky top-0 bg-gradient-to-r from-blue-600 to-blue-700 text-white px-6 py-4 flex items-center justify-between rounded-t-2xl z-10">
              <h2 className="text-base font-bold flex items-center gap-2"><GraduationCap className="w-5 h-5" /> Thêm Ngành Mới</h2>
              <button onClick={() => setIsAddModalOpen(false)} className="p-1 hover:bg-white/20 rounded-lg"><X className="w-5 h-5" /></button>
            </div>
            <form className="p-6 space-y-5" onSubmit={handleCreateNganh}>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className={lbl}>Mã ngành <span className="text-red-500">*</span></label>
                  <input required value={nganhForm.maNganh} onChange={(e) => setNganhForm({ ...nganhForm, maNganh: e.target.value })} placeholder="VD: CNTT-K01" className={inp} />
                </div>
                <div>
                  <label className={lbl}>Tên ngành <span className="text-red-500">*</span></label>
                  <input required value={nganhForm.tenNganh} onChange={(e) => setNganhForm({ ...nganhForm, tenNganh: e.target.value })} placeholder="VD: Công nghệ Phần mềm" className={inp} />
                </div>
              </div>
              <div>
                <label className={lbl}>Thuộc khoa <span className="text-red-500">*</span></label>
                <select required value={nganhForm.maKhoa} onChange={(e) => setNganhForm({ ...nganhForm, maKhoa: e.target.value })} className={inp}>
                  <option value="">Chọn khoa</option>
                  {departments.map((dept) => (<option key={dept.id} value={dept.code}>{dept.name}</option>))}
                </select>
              </div>
              <div className="flex gap-3 pt-4 border-t border-slate-100">
                <button type="button" onClick={() => setIsAddModalOpen(false)} className="flex-1 py-2.5 border border-slate-300 rounded-xl text-sm font-medium text-slate-700 hover:bg-slate-50">Hủy</button>
                <button type="submit" disabled={isSubmitting} className="flex-1 py-2.5 bg-blue-600 text-white rounded-xl text-sm font-medium hover:bg-blue-700 disabled:opacity-50">
                  {isSubmitting ? 'Đang thêm...' : 'Thêm Ngành'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Add Modal - Subjects */}
      {isAddModalOpen && activeTab === 'subjects' && (
        <div className="fixed inset-0 bg-black/30 flex items-center justify-center z-50 p-4" onClick={() => setIsAddModalOpen(false)}>
          <div className="bg-white rounded-2xl shadow-2xl max-w-lg w-full max-h-[90vh] overflow-y-auto" onClick={e => e.stopPropagation()}>
            <div className="sticky top-0 bg-gradient-to-r from-blue-600 to-blue-700 text-white px-6 py-4 flex items-center justify-between rounded-t-2xl z-10">
              <h2 className="text-base font-bold flex items-center gap-2"><BookMarked className="w-5 h-5" /> Thêm Môn Học Mới</h2>
              <button onClick={() => setIsAddModalOpen(false)} className="p-1 hover:bg-white/20 rounded-lg"><X className="w-5 h-5" /></button>
            </div>
            <form className="p-6 space-y-5" onSubmit={handleCreateMonHoc}>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className={lbl}>Mã môn học <span className="text-red-500">*</span></label>
                  <input required value={subjectForm.maMonHoc} onChange={(e) => setSubjectForm({ ...subjectForm, maMonHoc: e.target.value })} placeholder="VD: CS101" className={inp} />
                </div>
                <div>
                  <label className={lbl}>Tên môn học <span className="text-red-500">*</span></label>
                  <input required value={subjectForm.tenMonHoc} onChange={(e) => setSubjectForm({ ...subjectForm, tenMonHoc: e.target.value })} placeholder="VD: Lập trình Cơ bản" className={inp} />
                </div>
              </div>
              <div>
                <label className={lbl}>Số tín chỉ <span className="text-red-500">*</span></label>
                <input required type="number" min={0} value={subjectForm.soTinChi} onChange={(e) => setSubjectForm({ ...subjectForm, soTinChi: Number(e.target.value) || 0 })} className={inp} />
              </div>
              <div>
                <label className={lbl}>Ghi chú</label>
                <textarea value={subjectForm.moTa} onChange={(e) => setSubjectForm({ ...subjectForm, moTa: e.target.value })} className={inp + ' resize-none'} rows={3} />
              </div>
              <div className="flex gap-3 pt-4 border-t border-slate-100">
                <button type="button" onClick={() => setIsAddModalOpen(false)} className="flex-1 py-2.5 border border-slate-300 rounded-xl text-sm font-medium text-slate-700 hover:bg-slate-50">Hủy</button>
                <button type="submit" disabled={isSubmitting} className="flex-1 py-2.5 bg-blue-600 text-white rounded-xl text-sm font-medium hover:bg-blue-700 disabled:opacity-50">
                  {isSubmitting ? 'Đang thêm...' : 'Thêm Môn Học'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Edit Modal */}
      {isEditModalOpen && selectedItem && (
        <div className="fixed inset-0 bg-black/30 flex items-center justify-center z-50 p-4" onClick={() => setIsEditModalOpen(false)}>
          <div className="bg-white rounded-2xl shadow-2xl max-w-lg w-full max-h-[90vh] overflow-y-auto" onClick={e => e.stopPropagation()}>
            <div className="sticky top-0 bg-gradient-to-r from-blue-600 to-blue-700 text-white px-6 py-4 flex items-center justify-between rounded-t-2xl z-10">
              <div>
                <h2 className="text-base font-bold flex items-center gap-2"><Edit className="w-5 h-5" /> Chỉnh Sửa {activeTab === 'departments' ? 'Khoa' : activeTab === 'majors' ? 'Ngành' : 'Môn học'}</h2>
                <p className="text-xs text-blue-200 mt-0.5">{(selectedItem as any).code} — {(selectedItem as any).name}</p>
              </div>
              <button onClick={() => setIsEditModalOpen(false)} className="p-1 hover:bg-white/20 rounded-lg"><X className="w-5 h-5" /></button>
            </div>
            <div className="p-6">
              {activeTab === 'departments' && (
                <form className="space-y-5" onSubmit={handleUpdateKhoa}>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className={lbl}>Mã khoa</label>
                      <input required value={khoaForm.maKhoa} onChange={(e) => setKhoaForm({ ...khoaForm, maKhoa: e.target.value })} className={inp} />
                    </div>
                    <div>
                      <label className={lbl}>Tên khoa</label>
                      <input required value={khoaForm.tenKhoa} onChange={(e) => setKhoaForm({ ...khoaForm, tenKhoa: e.target.value })} className={inp} />
                    </div>
                  </div>
                  <div>
                    <label className={lbl}>Địa chỉ <span className="text-red-500">*</span></label>
                    <input required value={khoaForm.diaChi} onChange={(e) => setKhoaForm({ ...khoaForm, diaChi: e.target.value })} className={inp} />
                  </div>
                  <div>
                    <label className={lbl}>Mô tả</label>
                    <textarea value={khoaForm.moTa} onChange={(e) => setKhoaForm({ ...khoaForm, moTa: e.target.value })} className={inp + ' resize-none'} rows={3} />
                  </div>
                  <div className="flex gap-3 pt-4 border-t border-slate-100">
                    <button type="button" onClick={() => setIsEditModalOpen(false)} className="flex-1 py-2.5 border border-slate-300 rounded-xl text-sm font-medium text-slate-700 hover:bg-slate-50">Hủy</button>
                    <button type="submit" disabled={isSubmitting} className="flex-1 py-2.5 bg-blue-600 text-white rounded-xl text-sm font-medium hover:bg-blue-700 disabled:opacity-50">
                      {isSubmitting ? 'Đang lưu...' : 'Lưu Thay Đổi'}
                    </button>
                  </div>
                </form>
              )}
              {activeTab === 'majors' && (
                <form className="space-y-5" onSubmit={handleUpdateNganh}>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className={lbl}>Mã ngành</label>
                      <input required value={nganhForm.maNganh} onChange={(e) => setNganhForm({ ...nganhForm, maNganh: e.target.value })} className={inp} />
                    </div>
                    <div>
                      <label className={lbl}>Tên ngành</label>
                      <input required value={nganhForm.tenNganh} onChange={(e) => setNganhForm({ ...nganhForm, tenNganh: e.target.value })} className={inp} />
                    </div>
                  </div>
                  <div>
                    <label className={lbl}>Thuộc khoa</label>
                    <select value={nganhForm.maKhoa} onChange={(e) => setNganhForm({ ...nganhForm, maKhoa: e.target.value })} className={inp}>
                      {departments.map((d) => (<option key={d.id} value={d.code}>{d.name}</option>))}
                    </select>
                  </div>
                  <div className="flex gap-3 pt-4 border-t border-slate-100">
                    <button type="button" onClick={() => setIsEditModalOpen(false)} className="flex-1 py-2.5 border border-slate-300 rounded-xl text-sm font-medium text-slate-700 hover:bg-slate-50">Hủy</button>
                    <button type="submit" disabled={isSubmitting} className="flex-1 py-2.5 bg-blue-600 text-white rounded-xl text-sm font-medium hover:bg-blue-700 disabled:opacity-50">
                      {isSubmitting ? 'Đang lưu...' : 'Lưu Thay Đổi'}
                    </button>
                  </div>
                </form>
              )}
              {activeTab === 'subjects' && (
                <form className="space-y-5" onSubmit={handleUpdateMonHoc}>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className={lbl}>Mã môn học</label>
                      <input required value={subjectForm.maMonHoc} onChange={(e) => setSubjectForm({ ...subjectForm, maMonHoc: e.target.value })} className={inp} />
                    </div>
                    <div>
                      <label className={lbl}>Tên môn học</label>
                      <input required value={subjectForm.tenMonHoc} onChange={(e) => setSubjectForm({ ...subjectForm, tenMonHoc: e.target.value })} className={inp} />
                    </div>
                  </div>
                  <div>
                    <label className={lbl}>Số tín chỉ</label>
                    <input required type="number" min={0} value={subjectForm.soTinChi} onChange={(e) => setSubjectForm({ ...subjectForm, soTinChi: Number(e.target.value) || 0 })} className={inp} />
                  </div>
                  <div className="flex gap-3 pt-4 border-t border-slate-100">
                    <button type="button" onClick={() => setIsEditModalOpen(false)} className="flex-1 py-2.5 border border-slate-300 rounded-xl text-sm font-medium text-slate-700 hover:bg-slate-50">Hủy</button>
                    <button type="submit" disabled={isSubmitting} className="flex-1 py-2.5 bg-blue-600 text-white rounded-xl text-sm font-medium hover:bg-blue-700 disabled:opacity-50">
                      {isSubmitting ? 'Đang lưu...' : 'Lưu Thay Đổi'}
                    </button>
                  </div>
                </form>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {isDeleteModalOpen && selectedItem && (
        <div className="fixed inset-0 bg-black/30 flex items-center justify-center z-[60] p-4" onClick={() => setIsDeleteModalOpen(false)}>
          <div className="bg-white rounded-2xl shadow-2xl max-w-sm w-full p-6" onClick={e => e.stopPropagation()}>
            <div className="flex items-center gap-3 mb-4">
              <div className="rounded-full bg-red-100 p-3 flex-shrink-0">
                <AlertCircle className="w-6 h-6 text-red-600" />
              </div>
              <h3 className="font-bold text-slate-900">Xác nhận xóa</h3>
            </div>
            <p className="text-sm text-slate-600 mb-6">
              Bạn có chắc muốn xóa <b>{(selectedItem as any).name}</b>? Hành động không thể hoàn tác.
            </p>
            <div className="flex gap-3">
              <button onClick={() => setIsDeleteModalOpen(false)} className="flex-1 py-2.5 border border-slate-300 rounded-xl text-sm font-medium text-slate-700 hover:bg-slate-50">Hủy</button>
              <button onClick={confirmDelete} disabled={isDeleting} className="flex-1 py-2.5 bg-red-600 text-white rounded-xl text-sm font-medium hover:bg-red-700 disabled:opacity-50">
                {isDeleting ? 'Đang xóa...' : 'Xóa'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Import Excel Modal */}
      {isImportOpen && (
        <div className="fixed inset-0 bg-black/30 flex items-center justify-center z-50 p-4" onClick={() => setIsImportOpen(false)}>
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md" onClick={e => e.stopPropagation()}>
            <div className="bg-gradient-to-r from-emerald-600 to-emerald-700 text-white px-6 py-4 flex items-center justify-between rounded-t-2xl">
              <h2 className="text-base font-bold flex items-center gap-2"><FileSpreadsheet className="w-5 h-5" /> Import {activeTab === 'departments' ? 'Khoa' : activeTab === 'majors' ? 'Ngành' : 'Môn học'} từ Excel</h2>
              <button onClick={() => setIsImportOpen(false)} className="p-1 hover:bg-white/20 rounded-lg"><X className="w-5 h-5" /></button>
            </div>
            <div className="p-5 space-y-4">
              <div className={`border-2 border-dashed rounded-xl p-8 text-center cursor-pointer transition-all ${importFile ? 'border-emerald-400 bg-emerald-50' : 'border-slate-300 hover:border-blue-400 hover:bg-blue-50/50'}`}
                onClick={() => importRef.current?.click()}>
                <input ref={importRef} type="file" accept=".xlsx,.xls" className="hidden"
                  onChange={e => { setImportFile(e.target.files?.[0] || null); setImportResult(null); }} />
                <Upload className={`w-9 h-9 mx-auto mb-2 ${importFile ? 'text-emerald-500' : 'text-slate-400'}`} />
                {importFile
                  ? <><p className="font-semibold text-sm text-emerald-700">{importFile.name}</p>
                    <p className="text-xs text-emerald-500 mt-1">Nhấn để đổi file</p></>
                  : <><p className="text-sm font-medium text-slate-600">Kéo thả hoặc nhấn để chọn file</p>
                    <p className="text-xs text-slate-400 mt-1">Hỗ trợ .xlsx, .xls</p></>
                }
              </div>

              {importResult && (
                <div className="rounded-xl border border-slate-200 overflow-hidden">
                  <div className="grid grid-cols-3 divide-x divide-slate-200 bg-slate-50 text-center text-sm">
                    {[
                      { label: 'Tổng dòng', val: importResult.totalRows, cls: 'text-slate-800' },
                      { label: 'Thành công', val: importResult.successCount, cls: 'text-emerald-600' },
                      { label: 'Lỗi', val: importResult.errorCount, cls: 'text-red-600' },
                    ].map(s => (
                      <div key={s.label} className="py-3">
                        <p className={`text-xl font-bold ${s.cls}`}>{s.val}</p>
                        <p className="text-xs text-slate-500">{s.label}</p>
                      </div>
                    ))}
                  </div>
                  {importResult.errors.length > 0 && (
                    <div className="bg-red-50 border-t border-red-200 p-3 max-h-28 overflow-y-auto">
                      {importResult.errors.map((e, i) =>
                        <p key={i} className="text-xs text-red-600 py-0.5">{e}</p>)}
                    </div>
                  )}
                </div>
              )}

              <div className="flex gap-3">
                <button onClick={() => setIsImportOpen(false)} className="flex-1 py-2.5 border border-slate-300 rounded-xl text-sm font-medium text-slate-700 hover:bg-slate-50">Đóng</button>
                <button onClick={handleImport} disabled={!importFile || isImporting}
                  className="flex-1 py-2.5 bg-emerald-600 text-white rounded-xl text-sm font-medium hover:bg-emerald-700 disabled:opacity-50">
                  {isImporting ? 'Đang import...' : 'Import'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Prerequisite Modal */}
      {isTienQuyetOpen && tienQuyetSubject && (
        <div className="fixed inset-0 bg-black/30 flex items-center justify-center z-50 p-4" onClick={() => setIsTienQuyetOpen(false)}>
          <div className="bg-white rounded-2xl shadow-2xl max-w-lg w-full max-h-[85vh] flex flex-col" onClick={e => e.stopPropagation()}>
            <div className="bg-gradient-to-r from-emerald-600 to-emerald-700 text-white px-6 py-4 flex items-center justify-between rounded-t-2xl flex-shrink-0">
              <div>
                <h2 className="text-base font-bold flex items-center gap-2"><Link2 className="w-5 h-5" /> Môn học Tiên quyết</h2>
                <p className="text-xs text-emerald-200 mt-0.5">{tienQuyetSubject.code} — {tienQuyetSubject.name}</p>
              </div>
              <button onClick={() => setIsTienQuyetOpen(false)} className="p-1 hover:bg-white/20 rounded-lg"><X className="w-5 h-5" /></button>
            </div>

            <div className="p-5 flex-1 overflow-y-auto space-y-4">
              {/* Add new prerequisite */}
              <div className="space-y-2">
                <p className="text-sm font-medium text-slate-700">Thêm môn tiên quyết</p>
                <div className="flex gap-2">
                  <div className="relative flex-1">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                    <input
                      value={tienQuyetSearch}
                      onChange={e => setTienQuyetSearch(e.target.value)}
                      placeholder="Tìm môn học..."
                      className="w-full pl-9 pr-3 py-2 text-sm border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500"
                    />
                  </div>
                </div>
                <select
                  value={addTienQuyetId}
                  onChange={e => setAddTienQuyetId(e.target.value)}
                  className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500"
                >
                  <option value="">-- Chọn môn tiên quyết --</option>
                  {subjects
                    .filter(s => s.id !== tienQuyetSubject.id
                      && !tienQuyetList.some(t => t.monTienQuyetId === s.id)
                      && (!tienQuyetSearch || s.name.toLowerCase().includes(tienQuyetSearch.toLowerCase()) || s.code.toLowerCase().includes(tienQuyetSearch.toLowerCase()))
                    )
                    .map(s => (
                      <option key={s.id} value={s.id}>{s.code} — {s.name}</option>
                    ))}
                </select>
                <button
                  onClick={handleAddTienQuyet}
                  disabled={!addTienQuyetId}
                  className="w-full py-2 bg-emerald-600 text-white rounded-lg text-sm font-medium hover:bg-emerald-700 disabled:opacity-40 disabled:cursor-not-allowed flex items-center justify-center gap-1.5"
                >
                  <Plus className="w-4 h-4" /> Thêm tiên quyết
                </button>
              </div>

              {/* Current prerequisites */}
              <div>
                <p className="text-sm font-medium text-slate-700 mb-2">
                  Danh sách tiên quyết hiện tại
                  {tienQuyetList.length > 0 && (
                    <span className="ml-2 text-xs bg-emerald-100 text-emerald-700 px-1.5 py-0.5 rounded-full font-semibold">
                      {tienQuyetList.length}
                    </span>
                  )}
                </p>
                {tienQuyetLoading ? (
                  <div className="flex items-center justify-center py-8">
                    <div className="w-6 h-6 border-2 border-slate-200 border-t-emerald-600 rounded-full animate-spin" />
                  </div>
                ) : tienQuyetList.length === 0 ? (
                  <div className="text-center py-8 text-sm text-slate-400">
                    <Link2Off className="w-8 h-8 mx-auto mb-2 text-slate-300" />
                    <p>Chưa có môn tiên quyết nào</p>
                  </div>
                ) : (
                  <div className="space-y-2">
                    {tienQuyetList.map(t => (
                      <div key={t.id} className="flex items-center justify-between p-3 bg-slate-50 border border-slate-200 rounded-xl hover:border-emerald-300 transition-colors">
                        <div>
                          <p className="text-sm font-semibold text-slate-800">{t.maTienQuyet}</p>
                          <p className="text-xs text-slate-500">{t.tenMonTienQuyet}</p>
                        </div>
                        <button
                          onClick={() => handleDeleteTienQuyet(t.id)}
                          className="p-1.5 text-red-500 hover:bg-red-100 rounded-lg transition-colors"
                          title="Xóa tiên quyết này"
                        >
                          <X className="w-4 h-4" />
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Toasts */}
      <div className="fixed bottom-24 right-6 space-y-2 z-[70] pointer-events-none">
        {toasts.map(t => (
          <div key={t.id} className={`flex items-start gap-2.5 px-4 py-3 rounded-xl shadow-xl text-white text-sm font-medium max-w-xs pointer-events-auto ${t.type === 'success' ? 'bg-green-600' : t.type === 'error' ? 'bg-red-600' : 'bg-blue-600'}`}>
            {t.type === 'success' && <CheckCircle className="w-4 h-4 flex-shrink-0 mt-0.5" />}
            {t.type === 'error' && <AlertCircle className="w-4 h-4 flex-shrink-0 mt-0.5" />}
            <span>{t.message}</span>
          </div>
        ))}
      </div>

      {/* AI Assistant */}
      <button className="fixed bottom-8 right-8 w-14 h-14 z-50 hover:scale-110 transition-transform" aria-label="AI">
        <AiAssistantButton />
      </button>
    </div>
  );
}
