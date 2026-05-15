import { InstructorSidebar } from '@/components/layouts/InstructorSidebar';
import { InstructorHeader } from '@/components/layouts/InstructorHeader';
import {
  File, FileText, Video, Archive,
  Edit, Trash2, Eye, ChevronDown, X, Check, AlertCircle, Plus, Link, CheckCircle, AlertTriangle,
  Filter, FolderOpen, Upload
} from 'lucide-react';
import { useEffect, useState } from 'react';
import { useAuth } from '@/hooks';
import AiAssistantButton from '@/imports/AiAssistantButton';
import lecturerApi, {
  LecturerClassSummaryResponseDTO, DocumentResponseDTO, DocumentRequestDTO
} from '@/api/lecturer/lecturer.api';
import { resolveFileUrl, uploadFile } from '@/utils/fileUtils';

const ACCEPTED_FILE_TYPES = ['pdf', 'doc', 'docx', 'pptx', 'ppt', 'xlsx', 'xls', 'zip', 'rar'];
const MAX_FILE_SIZE_MB = 50;

const DOCUMENT_CATEGORIES = [
  { value: '', label: 'Tất cả loại' },
  { value: 'PDF', label: 'PDF' },
  { value: 'DOCX', label: 'Word' },
  { value: 'PPTX', label: 'PowerPoint' },
  { value: 'XLSX', label: 'Excel' },
  { value: 'ZIP', label: 'Nén (ZIP/RAR)' },
  { value: 'VIDEO', label: 'Video' },
  { value: 'SLIDE', label: 'Slide' },
  { value: 'OTHER', label: 'Khác' },
];

function getErrorMessage(error: unknown, fallback: string) {
  const err = error as { response?: { data?: { message?: string; detail?: string; error?: string } } };
  return err.response?.data?.message || err.response?.data?.detail || err.response?.data?.error || fallback;
}

function getExtension(value: string) {
  const clean = value.split('?')[0].split('#')[0];
  return clean.includes('.') ? clean.split('.').pop()?.toLowerCase() || '' : '';
}

function inferDocumentType(fileNameOrUrl: string) {
  const ext = getExtension(fileNameOrUrl);
  if (ext === 'pdf') return 'PDF';
  if (ext === 'doc' || ext === 'docx') return 'DOCX';
  if (ext === 'ppt' || ext === 'pptx') return 'PPTX';
  if (ext === 'xls' || ext === 'xlsx') return 'XLSX';
  if (ext === 'zip' || ext === 'rar') return 'ZIP';
  if (['mp4', 'avi', 'mov', 'mkv'].includes(ext)) return 'VIDEO';
  return 'OTHER';
}

function validateFileUrl(url: string): string | null {
  if (!url.trim()) return 'Đường dẫn file không được để trống';
  if (url.startsWith('/api/files/')) return null;
  try {
    const parsed = new URL(url);
    const ext = getExtension(parsed.pathname);
    if (ext && !ACCEPTED_FILE_TYPES.includes(ext)) {
      return `Định dạng "${ext.toUpperCase()}" không hỗ trợ. Chỉ chấp nhận: ${ACCEPTED_FILE_TYPES.map(t => t.toUpperCase()).filter((v, i, a) => a.indexOf(v) === i).join(', ')}`;
    }
    return null;
  } catch {
    const ext = getExtension(url);
    if (ext && !ACCEPTED_FILE_TYPES.includes(ext)) {
      return `Định dạng "${ext.toUpperCase()}" không hỗ trợ.`;
    }
    return null;
  }
}

export default function DocumentManagement() {
  const { user } = useAuth();
  const [classes, setClasses] = useState<LecturerClassSummaryResponseDTO[]>([]);
  const [selectedClassId, setSelectedClassId] = useState('');
  const [documents, setDocuments] = useState<DocumentResponseDTO[]>([]);
  const [loading, setLoading] = useState(false);
  const [successMsg, setSuccessMsg] = useState('');

  const [showAddForm, setShowAddForm] = useState(false);
  const [addData, setAddData] = useState<Partial<DocumentRequestDTO>>({});
  const [adding, setAdding] = useState(false);
  const [uploadingAddFile, setUploadingAddFile] = useState(false);
  const [addFileError, setAddFileError] = useState('');

  const [editDoc, setEditDoc] = useState<DocumentResponseDTO | null>(null);
  const [editData, setEditData] = useState<Partial<DocumentRequestDTO>>({});
  const [editing, setEditing] = useState(false);
  const [uploadingEditFile, setUploadingEditFile] = useState(false);
  const [editFileError, setEditFileError] = useState('');
  const [editFormError, setEditFormError] = useState('');

  const [deleteDocId, setDeleteDocId] = useState<string | null>(null);
  const [deleting, setDeleting] = useState(false);

  const [selectedTypeFilter, setSelectedTypeFilter] = useState('');
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    if (!user?.id) return;
    lecturerApi.getClasses(user.id).then(data => {
      setClasses(data);
      if (data.length > 0) setSelectedClassId(data[0].lopHocPhanId);
    }).catch(console.error);
  }, [user?.id]);

  useEffect(() => {
    if (!selectedClassId || !user?.id) return;
    setLoading(true);
    lecturerApi.getDocuments(selectedClassId, user.id)
      .then(setDocuments)
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [selectedClassId, user?.id]);

  const showSuccess = (msg: string) => {
    setSuccessMsg(msg);
    setTimeout(() => setSuccessMsg(''), 4000);
  };

  const handleAddFileUrlChange = (val: string) => {
    setAddData(p => ({ ...p, fileTaiLieuUrl: val }));
    if (val) {
      const err = validateFileUrl(val);
      setAddFileError(err || '');
    } else {
      setAddFileError('');
    }
  };

  const handleEditFileUrlChange = (val: string) => {
    setEditData(p => ({ ...p, fileTaiLieuUrl: val }));
    if (val) {
      const err = validateFileUrl(val);
      setEditFileError(err || '');
    } else {
      setEditFileError('');
    }
  };

  const handleUploadDocumentFile = async (file: File, isEdit = false) => {
    const extension = getExtension(file.name);
    if (!extension || !ACCEPTED_FILE_TYPES.includes(extension)) {
      const message = `Định dạng "${extension || 'không xác định'}" không hỗ trợ.`;
      if (isEdit) setEditFileError(message);
      else setAddFileError(message);
      return;
    }
    if (file.size > MAX_FILE_SIZE_MB * 1024 * 1024) {
      const message = `File vượt quá ${MAX_FILE_SIZE_MB}MB.`;
      if (isEdit) setEditFileError(message);
      else setAddFileError(message);
      return;
    }

    if (isEdit) setUploadingEditFile(true);
    else setUploadingAddFile(true);

    try {
      const uploaded = await uploadFile(file);
      const suggestedType = inferDocumentType(file.name);
      const suggestedTitle = file.name.replace(/\.[^.]+$/, '');
      if (isEdit) {
        setEditData(p => ({
          ...p,
          fileTaiLieuUrl: uploaded.fileUrl,
          loaiTaiLieu: p.loaiTaiLieu || suggestedType,
        }));
        setEditFileError('');
      } else {
        setAddData(p => ({
          ...p,
          fileTaiLieuUrl: uploaded.fileUrl,
          tenTaiLieu: p.tenTaiLieu || suggestedTitle,
          loaiTaiLieu: p.loaiTaiLieu || suggestedType,
        }));
        setAddFileError('');
      }
    } catch (err) {
      const message = 'Upload file thất bại. Vui lòng thử lại.';
      if (isEdit) setEditFileError(message);
      else setAddFileError(message);
      console.error(err);
    } finally {
      if (isEdit) setUploadingEditFile(false);
      else setUploadingAddFile(false);
    }
  };

  const handleAdd = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user?.id || !selectedClassId || !addData.tenTaiLieu || !addData.fileTaiLieuUrl) return;
    if (addFileError) return;
    setAdding(true);
    try {
      const doc = await lecturerApi.createDocument(user.id, {
        lopHocPhanId: selectedClassId,
        tenTaiLieu: addData.tenTaiLieu,
        moTa: addData.moTa,
        fileTaiLieuUrl: addData.fileTaiLieuUrl,
        loaiTaiLieu: addData.loaiTaiLieu,
      });
      setDocuments(prev => [doc, ...prev]);
      setShowAddForm(false);
      setAddData({});
      setAddFileError('');
      showSuccess('Tải lên tài liệu thành công');
    } catch (err) {
      console.error(err);
    } finally {
      setAdding(false);
    }
  };

  const handleEdit = (doc: DocumentResponseDTO) => {
    setEditDoc(doc);
    setEditData({
      tenTaiLieu: doc.tenTaiLieu,
      moTa: doc.moTa,
      fileTaiLieuUrl: doc.fileTaiLieuUrl,
      loaiTaiLieu: doc.loaiTaiLieu,
    });
    setEditFileError(doc.fileTaiLieuUrl ? validateFileUrl(doc.fileTaiLieuUrl) || '' : '');
    setEditFormError('');
  };

  const confirmEdit = async () => {
    if (!editDoc || !user?.id || !editData.tenTaiLieu || !editData.fileTaiLieuUrl) return;
    if (editFileError) return;
    setEditing(true);
    setEditFormError('');
    try {
      const updated = await lecturerApi.updateDocument(editDoc.id, user.id, {
        lopHocPhanId: editDoc.lopHocPhanId,
        tenTaiLieu: editData.tenTaiLieu.trim(),
        moTa: editData.moTa?.trim() || undefined,
        fileTaiLieuUrl: editData.fileTaiLieuUrl.trim(),
        loaiTaiLieu: editData.loaiTaiLieu?.trim() || undefined,
      });
      setDocuments(prev => prev.map(d => d.id === editDoc.id ? updated : d));
      setEditDoc(null);
      showSuccess('Cập nhật tài liệu thành công');
    } catch (err) {
      console.error(err);
      setEditFormError(getErrorMessage(err, 'Cập nhật tài liệu thất bại. Vui lòng thử lại.'));
    } finally {
      setEditing(false);
    }
  };

  const confirmDelete = async () => {
    if (!deleteDocId || !user?.id) return;
    setDeleting(true);
    try {
      await lecturerApi.deleteDocument(deleteDocId, user.id);
      setDocuments(prev => prev.filter(d => d.id !== deleteDocId));
      setDeleteDocId(null);
      showSuccess('Xóa tài liệu thành công');
    } catch (err) {
      console.error(err);
    } finally {
      setDeleting(false);
    }
  };

  const getFileIcon = (loai: string) => {
    const t = (loai || '').toUpperCase();
    if (t === 'PDF') return <FileText className="w-8 h-8 text-red-500" />;
    if (t === 'VIDEO' || t.includes('MP4')) return <Video className="w-8 h-8 text-pink-500" />;
    if (t === 'DOCX' || t === 'DOC') return <FileText className="w-8 h-8 text-blue-500" />;
    if (t === 'PPTX' || t === 'SLIDE') return <FileText className="w-8 h-8 text-orange-500" />;
    if (t === 'XLSX' || t === 'XLS') return <FileText className="w-8 h-8 text-green-500" />;
    if (t === 'ZIP' || t === 'RAR') return <Archive className="w-8 h-8 text-gray-500" />;
    return <File className="w-8 h-8 text-blue-400" />;
  };

  const getCategoryLabel = (loai: string) => {
    const t = (loai || '').toUpperCase();
    if (t === 'PDF') return 'PDF';
    if (t === 'DOCX' || t === 'DOC') return 'Word';
    if (t === 'PPTX') return 'PowerPoint';
    if (t === 'XLSX' || t === 'XLS') return 'Excel';
    if (t === 'ZIP' || t === 'RAR') return 'Nén';
    if (t === 'VIDEO') return 'Video';
    if (t === 'SLIDE') return 'Slide';
    return 'Khác';
  };

  const formatDate = (s: string) =>
    new Date(s).toLocaleDateString('vi-VN', { day: '2-digit', month: '2-digit', year: 'numeric' });

  const filteredDocuments = documents.filter(doc => {
    const matchesSearch = !searchTerm ||
      doc.tenTaiLieu.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (doc.moTa || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
      (doc.loaiTaiLieu || '').toLowerCase().includes(searchTerm.toLowerCase());
    const matchesType = !selectedTypeFilter || doc.loaiTaiLieu?.toUpperCase() === selectedTypeFilter.toUpperCase();
    return matchesSearch && matchesType;
  });

  const groupedByCategory = selectedTypeFilter ? null : (() => {
    const groups: Record<string, typeof filteredDocuments> = {};
    filteredDocuments.forEach(doc => {
      const key = doc.loaiTaiLieu || 'OTHER';
      if (!groups[key]) groups[key] = [];
      groups[key].push(doc);
    });
    return groups;
  })();

  return (
    <div className="flex h-screen bg-gray-50">
      <InstructorSidebar />
      <div className="flex-1 ml-64 flex flex-col">
        <InstructorHeader title="Quản lý tài liệu" />
        <div className="flex-1 overflow-auto p-6">
          <div className="max-w-7xl mx-auto space-y-6">

            {successMsg && (
              <div className="bg-green-50 border border-green-200 rounded-lg p-4 flex items-center gap-3">
                <CheckCircle className="w-5 h-5 text-green-600 shrink-0" />
                <p className="text-green-700 font-medium">{successMsg}</p>
              </div>
            )}

            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-2xl font-bold text-gray-900">Quản lý tài liệu học tập</h2>
                <p className="text-gray-600 mt-1">
                  Phân loại và quản lý tài liệu cho các lớp học phần
                </p>
              </div>
              <button
                onClick={() => setShowAddForm(true)}
                disabled={!selectedClassId}
                className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <Plus className="w-5 h-5" />
                Thêm tài liệu
              </button>
            </div>

            {/* Filters */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <div className="grid grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    <Filter className="w-4 h-4 inline mr-1" />
                    Chọn lớp học phần
                  </label>
                  <div className="relative">
                    <select
                      value={selectedClassId}
                      onChange={e => setSelectedClassId(e.target.value)}
                      className="w-full px-4 py-3 pr-10 border border-gray-300 rounded-lg appearance-none focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
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
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    <FolderOpen className="w-4 h-4 inline mr-1" />
                    Phân loại theo loại
                  </label>
                  <div className="relative">
                    <select
                      value={selectedTypeFilter}
                      onChange={e => setSelectedTypeFilter(e.target.value)}
                      className="w-full px-4 py-3 pr-10 border border-gray-300 rounded-lg appearance-none focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
                    >
                      {DOCUMENT_CATEGORIES.map(c => (
                        <option key={c.value} value={c.value}>{c.label}</option>
                      ))}
                    </select>
                    <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 pointer-events-none" />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Tìm kiếm</label>
                  <input
                    type="text"
                    value={searchTerm}
                    onChange={e => setSearchTerm(e.target.value)}
                    placeholder="Tìm theo tên, mô tả..."
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>
            </div>

            {/* Documents list */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
              <div className="p-6 border-b border-gray-200 flex items-center justify-between">
                <h3 className="font-semibold text-gray-900">
                  Danh sách tài liệu ({filteredDocuments.length})
                </h3>
                {selectedTypeFilter && (
                  <span className="text-sm text-blue-600 font-medium">
                    {getCategoryLabel(selectedTypeFilter)}
                  </span>
                )}
              </div>

              {loading ? (
                <div className="p-12 text-center">
                  <div className="animate-spin w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full mx-auto mb-3" />
                  <p className="text-gray-500">Đang tải tài liệu...</p>
                </div>
              ) : filteredDocuments.length === 0 ? (
                <div className="p-12 text-center">
                  <File className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                  <p className="text-gray-500">Chưa có tài liệu nào</p>
                </div>
              ) : selectedTypeFilter ? (
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white">
                      <tr>
                        {['Tên tài liệu', 'Loại', 'Ngày đăng', 'Thao tác'].map(h => (
                          <th key={h} className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wider">{h}</th>
                        ))}
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200">
                      {filteredDocuments.map(doc => (
                        <tr key={doc.id} className="hover:bg-gray-50 transition-colors">
                          <td className="px-6 py-4">
                            <div className="flex items-center gap-3">
                              {getFileIcon(doc.loaiTaiLieu)}
                              <div>
                                <p className="font-medium text-gray-900">{doc.tenTaiLieu}</p>
                                {doc.moTa && <p className="text-sm text-gray-500 line-clamp-1">{doc.moTa}</p>}
                              </div>
                            </div>
                          </td>
                          <td className="px-6 py-4">
                            <span className="inline-flex items-center gap-1 text-sm font-medium px-2 py-1 bg-gray-100 text-gray-700 rounded-full">
                              {getFileIcon(doc.loaiTaiLieu)}
                              {getCategoryLabel(doc.loaiTaiLieu)}
                            </span>
                          </td>
                          <td className="px-6 py-4 text-sm text-gray-600">{formatDate(doc.ngayDang)}</td>
                          <td className="px-6 py-4">
                            <div className="flex items-center gap-2">
                              <a
                                href={resolveFileUrl(doc.fileTaiLieuUrl)}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                                title="Xem"
                              >
                                <Eye className="w-4 h-4" />
                              </a>
                              <button
                                onClick={() => handleEdit(doc)}
                                className="p-2 text-orange-600 hover:bg-orange-50 rounded-lg transition-colors"
                                title="Chỉnh sửa"
                              >
                                <Edit className="w-4 h-4" />
                              </button>
                              <button
                                onClick={() => setDeleteDocId(doc.id)}
                                className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                                title="Xóa"
                              >
                                <Trash2 className="w-4 h-4" />
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : (
                /* Grouped by category */
                <div className="divide-y divide-gray-100">
                  {Object.entries(groupedByCategory || {}).sort(([a], [b]) => a.localeCompare(b)).map(([category, docs]) => (
                    <div key={category}>
                      <div className="px-6 py-3 bg-gray-50 flex items-center gap-2">
                        {getFileIcon(category)}
                        <span className="font-semibold text-gray-700 text-sm">
                          {getCategoryLabel(category)} ({docs.length})
                        </span>
                      </div>
                      {docs.map(doc => (
                        <div key={doc.id} className="px-6 py-4 flex items-center justify-between hover:bg-gray-50 transition-colors">
                          <div className="flex items-center gap-4 min-w-0">
                            {getFileIcon(doc.loaiTaiLieu)}
                            <div className="min-w-0">
                              <p className="font-medium text-gray-900">{doc.tenTaiLieu}</p>
                              {doc.moTa && <p className="text-sm text-gray-500 line-clamp-1">{doc.moTa}</p>}
                              <p className="text-xs text-gray-400 mt-1">{formatDate(doc.ngayDang)}</p>
                            </div>
                          </div>
                          <div className="flex items-center gap-2 shrink-0">
                            <a
                              href={resolveFileUrl(doc.fileTaiLieuUrl)}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                              title="Xem"
                            >
                              <Eye className="w-4 h-4" />
                            </a>
                            <button
                              onClick={() => handleEdit(doc)}
                              className="p-2 text-orange-600 hover:bg-orange-50 rounded-lg transition-colors"
                              title="Chỉnh sửa"
                            >
                              <Edit className="w-4 h-4" />
                            </button>
                            <button
                              onClick={() => setDeleteDocId(doc.id)}
                              className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                              title="Xóa"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Add Form Modal */}
      {showAddForm && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl shadow-2xl max-w-lg w-full mx-4 p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-xl font-bold text-gray-900">Thêm tài liệu mới</h3>
              <button onClick={() => { setShowAddForm(false); setAddData({}); setAddFileError(''); }} className="p-1 hover:bg-gray-100 rounded-lg">
                <X className="w-5 h-5 text-gray-500" />
              </button>
            </div>
            <form onSubmit={handleAdd} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Tên tài liệu <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={addData.tenTaiLieu || ''}
                  onChange={e => setAddData(p => ({ ...p, tenTaiLieu: e.target.value }))}
                  placeholder="VD: Bài giảng Chương 1 - Giới thiệu"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  File tài liệu <span className="text-red-500">*</span>
                </label>
                <div className="flex gap-2">
                  <div className="relative flex-1">
                    <Link className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                    <input
                      type="text"
                      value={addData.fileTaiLieuUrl || ''}
                      onChange={e => handleAddFileUrlChange(e.target.value)}
                      placeholder="Upload file hoặc nhập URL trực tiếp"
                      className={`w-full pl-9 pr-4 py-2 border rounded-lg focus:outline-none focus:ring-2 bg-white ${
                        addFileError ? 'border-red-400 focus:ring-red-400' : 'border-gray-300 focus:ring-blue-500'
                      }`}
                      required
                    />
                  </div>
                  <label className={`inline-flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium ${
                    uploadingAddFile ? 'bg-gray-100 text-gray-400 cursor-wait' : 'bg-blue-50 text-blue-700 hover:bg-blue-100 cursor-pointer'
                  }`}>
                    <Upload className="w-4 h-4" />
                    {uploadingAddFile ? 'Đang upload...' : 'Upload'}
                    <input
                      type="file"
                      accept=".pdf,.doc,.docx,.ppt,.pptx,.xls,.xlsx,.zip,.rar"
                      disabled={uploadingAddFile}
                      onChange={e => {
                        const file = e.target.files?.[0];
                        if (file) void handleUploadDocumentFile(file);
                        e.currentTarget.value = '';
                      }}
                      className="hidden"
                    />
                  </label>
                </div>
                {addData.fileTaiLieuUrl && addData.fileTaiLieuUrl.startsWith('/api/files/') && (
                  <p className="text-xs text-blue-600 mt-1">File đã được lưu lên Supabase Storage.</p>
                )}
                {addFileError ? (
                  <p className="text-xs text-red-500 mt-1 flex items-center gap-1">
                    <AlertTriangle className="w-3 h-3" />
                    {addFileError}
                  </p>
                ) : (
                  <p className="text-xs text-gray-500 mt-1">
                    Chấp nhận: PDF, DOC, DOCX, PPTX, XLSX, ZIP, RAR (tối đa {MAX_FILE_SIZE_MB}MB)
                  </p>
                )}
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Phân loại</label>
                <div className="relative">
                  <select
                    value={addData.loaiTaiLieu || ''}
                    onChange={e => setAddData(p => ({ ...p, loaiTaiLieu: e.target.value }))}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg appearance-none focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
                  >
                    <option value="">Tự động phát hiện từ URL</option>
                    {DOCUMENT_CATEGORIES.slice(1).map(c => (
                      <option key={c.value} value={c.value}>{c.label}</option>
                    ))}
                  </select>
                  <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Mô tả</label>
                <textarea
                  value={addData.moTa || ''}
                  onChange={e => setAddData(p => ({ ...p, moTa: e.target.value }))}
                  placeholder="Mô tả ngắn về nội dung tài liệu..."
                  rows={3}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
                />
              </div>
              <div className="flex gap-3 justify-end pt-2">
                <button
                  type="button"
                  onClick={() => { setShowAddForm(false); setAddData({}); setAddFileError(''); }}
                  className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50"
                >
                  Hủy
                </button>
                <button
                  type="submit"
                  disabled={adding || uploadingAddFile || !!addFileError}
                  className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <Check className="w-4 h-4" />
                  {adding ? 'Đang tải lên...' : 'Thêm tài liệu'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Edit Modal */}
      {editDoc && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl shadow-2xl max-w-lg w-full mx-4 p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-xl font-bold text-gray-900">Chỉnh sửa tài liệu</h3>
              <button onClick={() => setEditDoc(null)} className="p-1 hover:bg-gray-100 rounded-lg">
                <X className="w-5 h-5 text-gray-500" />
              </button>
            </div>
            <div className="space-y-4">
              {editFormError && (
                <div className="bg-red-50 border border-red-200 rounded-lg p-3 flex items-start gap-2">
                  <AlertTriangle className="w-4 h-4 text-red-600 mt-0.5 shrink-0" />
                  <p className="text-sm font-medium text-red-700">{editFormError}</p>
                </div>
              )}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Tên tài liệu</label>
                <input
                  type="text"
                  value={editData.tenTaiLieu || ''}
                  onChange={e => setEditData(p => ({ ...p, tenTaiLieu: e.target.value }))}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">File tài liệu</label>
                <div className="flex gap-2">
                  <div className="relative flex-1">
                    <Link className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                    <input
                      type="text"
                      value={editData.fileTaiLieuUrl || ''}
                      onChange={e => handleEditFileUrlChange(e.target.value)}
                      className={`w-full pl-9 pr-4 py-2 border rounded-lg focus:outline-none focus:ring-2 bg-white ${
                        editFileError ? 'border-red-400 focus:ring-red-400' : 'border-gray-300 focus:ring-blue-500'
                      }`}
                    />
                  </div>
                  <label className={`inline-flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium ${
                    uploadingEditFile ? 'bg-gray-100 text-gray-400 cursor-wait' : 'bg-blue-50 text-blue-700 hover:bg-blue-100 cursor-pointer'
                  }`}>
                    <Upload className="w-4 h-4" />
                    {uploadingEditFile ? 'Đang upload...' : 'Đổi file'}
                    <input
                      type="file"
                      accept=".pdf,.doc,.docx,.ppt,.pptx,.xls,.xlsx,.zip,.rar"
                      disabled={uploadingEditFile}
                      onChange={e => {
                        const file = e.target.files?.[0];
                        if (file) void handleUploadDocumentFile(file, true);
                        e.currentTarget.value = '';
                      }}
                      className="hidden"
                    />
                  </label>
                </div>
                {editData.fileTaiLieuUrl && editData.fileTaiLieuUrl.startsWith('/api/files/') && (
                  <p className="text-xs text-blue-600 mt-1">File đã được lưu lên Supabase Storage.</p>
                )}
                {editFileError && (
                  <p className="text-xs text-red-500 mt-1 flex items-center gap-1">
                    <AlertTriangle className="w-3 h-3" />
                    {editFileError}
                  </p>
                )}
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Phân loại</label>
                <div className="relative">
                  <select
                    value={editData.loaiTaiLieu || ''}
                    onChange={e => setEditData(p => ({ ...p, loaiTaiLieu: e.target.value }))}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg appearance-none focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
                  >
                    <option value="">Tự động phát hiện từ URL</option>
                    {DOCUMENT_CATEGORIES.slice(1).map(c => (
                      <option key={c.value} value={c.value}>{c.label}</option>
                    ))}
                  </select>
                  <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Mô tả</label>
                <textarea
                  value={editData.moTa || ''}
                  onChange={e => setEditData(p => ({ ...p, moTa: e.target.value }))}
                  rows={3}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
                />
              </div>
            </div>
            <div className="flex gap-3 justify-end mt-4">
              <button onClick={() => setEditDoc(null)} className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50">Hủy</button>
              <button
                onClick={confirmEdit}
                disabled={editing || uploadingEditFile || !!editFileError || !editData.tenTaiLieu?.trim() || !editData.fileTaiLieuUrl?.trim()}
                className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <Check className="w-4 h-4" />
                {editing ? 'Đang lưu...' : 'Lưu thay đổi'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Delete Modal */}
      {deleteDocId && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl shadow-2xl max-w-md w-full mx-4 p-6">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center">
                <AlertCircle className="w-6 h-6 text-red-600" />
              </div>
              <h3 className="text-xl font-bold text-gray-900">Xác nhận xóa</h3>
            </div>
            <p className="text-gray-600 mb-6">Bạn có chắc chắn muốn xóa tài liệu này? Hành động này không thể hoàn tác.</p>
            <div className="flex gap-3 justify-end">
              <button onClick={() => setDeleteDocId(null)} className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50">Hủy</button>
              <button
                onClick={confirmDelete}
                disabled={deleting}
                className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:opacity-50"
              >
                {deleting ? 'Đang xóa...' : 'Xóa'}
              </button>
            </div>
          </div>
        </div>
      )}

      <button
        className="fixed bottom-8 right-8 w-16 h-16 hover:scale-110 transition-transform duration-200 z-50"
        aria-label="AI Assistant"
      >
        <AiAssistantButton />
      </button>
    </div>
  );
}
